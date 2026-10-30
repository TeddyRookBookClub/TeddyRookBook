/* Manners for Growing Up (Etiquette Ladder, course key growing): problem generators for all 48 topics.
   Built from /tmp/work_etiquette/growing/gen/*.js by build_gen.js (do not edit the shipped file by hand).
   Scenes are original. Names come from the Etiquette cast (MathLadder.etiquette.CAST; children appear as teens), and
   foods, games, gifts and places are drawn at random, so problems vary.
   Shapes: choose the polite thing to say or do (mc), select all that are polite (mc, several answers), put steps in
   order (et-order, quiet, answered with letters), spot the impolite line in a scene (et-scene transcript), the reason
   behind a custom (mc), true or false, plus topic shapes: place-setting pieces (et-setting), note parts (et-note),
   whose name comes first (et-intro), poise A or B (et-posture), flag displays (et-flag), replies to texts (et-text)
   and envelopes (et-envelope). Single right answers only where the custom is well established; where customs differ,
   questions ask for the reasoning or for every acceptable choice. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;

  // ---------------------------------------------------------------- the cast and fill-ins
  var KIDS = ['mia', 'leo', 'sam', 'ruby', 'omar', 'hana'];
  var KNAME = { mia: 'Mia', leo: 'Leo', sam: 'Sam', ruby: 'Ruby', omar: 'Omar', hana: 'Hana' };
  var KPRON = { mia: 'she', leo: 'he', sam: 'he', ruby: 'she', omar: 'he', hana: 'she' };
  var POOL = {
    food: ['lasagna', 'tacos', 'chicken and rice', 'vegetable soup', 'spaghetti', 'stir-fry', 'enchiladas', 'curry', 'grilled fish', 'chili'],
    side: ['mashed potatoes', 'green beans', 'rolls', 'salad', 'corn', 'rice', 'roasted carrots', 'fruit salad'],
    game: ['a board game', 'a card game', 'basketball in the driveway', 'a puzzle', 'charades', 'a video game'],
    gift: ['a book about sharks', 'a puzzle', 'a sweater', 'a set of markers', 'a board game', 'a journal', 'a model airplane kit', 'a scarf', 'a soccer ball', 'a pair of headphones'],
    sport: ['soccer', 'basketball', 'softball', 'volleyball', 'baseball', 'hockey', 'flag football'],
    show: ['the school play', 'a band concert', 'a dance recital', 'a movie', 'a puppet show', 'the spring musical'],
    subject: ['math', 'science', 'history', 'art', 'reading', 'music'],
    pet: ['dog', 'cat', 'rabbit', 'hamster', 'parrot', 'turtle'],
    hobby: ['drawing', 'chess', 'baking', 'skateboarding', 'gardening', 'coding', 'guitar', 'swimming'],
    trip: ['the lake', 'the beach', 'the state fair', 'a national park', 'the aquarium', 'the science museum'],
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function fill(s, v) { // fill {placeholders}; a value that starts a sentence gets a capital letter
    return String(s).replace(/\{(\w+)\}/g, function (m, k, off, all) {
      if (v[k] === undefined) return m;
      var val = String(v[k]), before = all.slice(0, off);
      return (off === 0 || /[.!?]["”]?\s+$|:\s+$|["“]$|<b>$|<p>$/.test(before)) ? cap(val) : val;
    });
  }
  function vars(R) { // a fresh set of fill-in values for one problem
    var k = R.sample(KIDS, 3), v = {};
    ['A', 'B', 'C'].forEach(function (L, i) {
      var key = k[i], pr = KPRON[key];
      v[L] = KNAME[key]; v[L + 'k'] = key; v[L + 'he'] = pr; v[L + 'him'] = pr === 'she' ? 'her' : 'him'; v[L + 'his'] = pr === 'she' ? 'her' : 'his';
      v[L + 'self'] = pr === 'she' ? 'herself' : 'himself';
    });
    Object.keys(POOL).forEach(function (p) { var two = R.sample(POOL[p], 2); v[p] = two[0]; v[p + '2'] = two[1]; });
    v.n = R.int(5, 8);
    return v;
  }
  function letter(i) { return String.fromCharCode(65 + i); }
  function lq(s) { return '“' + s + '”'; }
  function bare(s) { return String(s).replace(/[.]$/, ''); }
  function end(s, p) { s = String(s); return /[.?!…][”"’)]?$|[.?!][”"]?<\/i>$/.test(s) ? s : s + (p || '.'); } // add a period unless the text already ends a sentence
  function arr(x) { return Array.isArray(x) ? x : [x]; }
  function pair(x) { return Array.isArray(x) ? x : [x, '']; } // [text, reason]

  // a quiet scene for a problem. who: 'A' | 'B' | 'C' (the children, as teens) or a cast key, optionally 'rosa:Mom'
  function scene(v, place, who, o) {
    o = o || {};
    var people = who.map(function (w, i) {
      var p, parts = String(w).split(':');
      if (/^[ABC]$/.test(parts[0])) p = { who: v[parts[0] + 'k'], age: 'teen' };
      else p = { who: parts[0] };
      if (parts[1]) p.name = parts[1];
      if (o.pose && o.pose[i]) p.pose = o.pose[i];
      if (o.mood && o.mood[i]) p.mood = o.mood[i];
      if (o.holds && o.holds[i]) p.holds = o.holds[i];
      if (o.sit) p.pose = p.pose || undefined;
      return p;
    });
    var opts = { place: place, people: people, quiet: true, interactive: false };
    if (o.say) opts.say = o.say.map(function (s) { return [s[0], fill(s[1], v)]; });
    if (o.think) opts.think = o.think.map(function (s) { return [s[0], fill(s[1], v)]; });
    if (o.narr) opts.narr = fill(o.narr, v);
    if (o.props) opts.props = o.props;
    if (o.lines) opts.lines = o.lines.map(function (l) { return { who: l[0], text: fill(l[1], v) }; });
    return { name: 'et-scene', opts: opts };
  }
  function sceneOf(v, sc) { return sc ? scene(v, sc[0], sc[1], sc[2]) : undefined; }

  // ---------------------------------------------------------------- problem shapes
  // An mc answer from a right choice and wrong ones; choices are shuffled at display (makeProblem).
  function mcOf(right, wrongs) {
    var seen = {}, ch = [right]; seen[right] = 1;
    wrongs.forEach(function (w) { if (!seen[w]) { seen[w] = 1; ch.push(w); } });
    return { t: 'mc', choices: ch, v: 0 };
  }
  function finish(p, hint) { if (hint && !p.hint) p.hint = hint; return p; }

  // choose: { s: situation, ask, ok: [right answers], near: [[text, why wrong]], rude: [[text, why]], why, sc: [place, who, opts] }
  function choose(R, ctx, it, v, hint) {
    var right = fill(R.pick(arr(it.ok)), v);
    var near = R.shuffle((it.near || []).map(pair)), rude = R.shuffle((it.rude || []).map(pair)), wr = [];
    if (ctx.level === 1) { if (rude.length) wr.push(rude[0]); wr = wr.concat(near.slice(0, 2 - wr.length)); if (wr.length < 2) wr = wr.concat(rude.slice(1, 1 + 2 - wr.length)); }
    else { wr = near.slice(0, 3); if (wr.length < 3) wr = wr.concat(rude.slice(0, 3 - wr.length)); }
    var spec = mcOf(right, wr.map(function (w) { return fill(w[0], v); }));
    var steps = ['The best choice: ' + end(right), fill(it.why, v)];
    var expl = wr.filter(function (w) { return w[1]; });
    if (expl.length) { var e = expl[0]; steps.push('Not the best: <i>' + end(fill(e[0], v)) + '</i> ' + fill(e[1], v)); }
    return finish({ q: fill(it.s, v) + ' <b>' + fill(it.ask || 'What is the polite thing to do?', v) + '</b>', a: spec, steps: steps, viz: sceneOf(v, it.sc) }, hint);
  }
  // select all: { ask, ok: [[text, why]], no: [[text, why]], sc, intro }
  function selectAll(R, ctx, it, v, hint) {
    var nOk = R.int(2, Math.min(3, it.ok.length)), nNo = (ctx.level >= 3 ? 6 : 5) - nOk;
    nNo = Math.min(nNo, it.no.length);
    var ok = R.sample(it.ok.map(pair), nOk), no = R.sample(it.no.map(pair), nNo);
    var all = R.shuffle(ok.map(function (x) { return { t: fill(x[0], v), y: true, w: fill(x[1], v) }; }).concat(no.map(function (x) { return { t: fill(x[0], v), y: false, w: fill(x[1], v) }; })));
    var vIdx = []; all.forEach(function (x, i) { if (x.y) vIdx.push(i); });
    var steps = [(it.okLabel || 'Polite') + ': ' + all.filter(function (x) { return x.y; }).map(function (x) { return '<i>' + end(x.t) + '</i>'; }).join(' ')];
    var badW = all.filter(function (x) { return !x.y && x.w; });
    badW.slice(0, 2).forEach(function (b) { steps.push((it.noLabel || 'Not polite') + ': <i>' + end(b.t) + '</i> ' + b.w); });
    if (it.why) steps.push(fill(it.why, v));
    var intro = it.intro || (!/\{A/.test(it.ask || '') && /\{A/.test(JSON.stringify([it.ok, it.no])) ? 'Here are some things {A} might do.' : '');
    return finish({ q: (intro ? fill(intro, v) + ' ' : '') + '<b>' + fill(it.ask || 'Which of these are polite? Select all that apply.', v) + '</b>', a: { t: 'mc', choices: all.map(function (x) { return x.t; }), v: vIdx, keep: true }, steps: steps, viz: sceneOf(v, it.sc) }, hint);
  }
  // order: { title, steps: [...in order], why, intro }; the steps are shown lettered and shuffled; the answer is the letters
  function orderQ(R, ctx, it, v, hint) {
    var items = it.steps.map(function (s) { return fill(s, v); }), n = items.length, start;
    do { start = R.shuffle(items.map(function (x, i) { return i; })); } while (start.every(function (x, i) { return x === i; }) || start[0] === 0 && n > 3 && R.chance(0.7));
    var lets = items.map(function (x, k) { return letter(start.indexOf(k)); });
    var word = lets.join('');
    return finish({
      q: (it.intro ? fill(it.intro, v) + ' ' : '') + '<b>' + fill(it.title, v) + '</b> Put the steps in order: type the ' + n + ' letters from first to last (like ' + example(n, word) + ').',
      a: { t: 'text', v: [word, lets.join(' '), lets.join(','), lets.join(', '), lets.join('-')] },
      steps: ['The order is ' + lets.join(', ') + '.'].concat(items.map(function (s, k) { return (k + 1) + '. ' + s + ' (' + lets[k] + ')'; })).concat(it.why ? [fill(it.why, v)] : []),
      viz: { name: 'et-order', opts: { items: items, start: start, quiet: true, interactive: false, title: fill(it.title, v).replace(/[:.]$/, '') } }
    }, hint || 'Ask yourself what has to happen before anything else can.');
  }
  function example(n, not) { // a sample answer format that is not the answer
    var s = ''; for (var i = 0; i < n; i++) s += letter(i);
    return s === not ? s.split('').reverse().join('') : s;
  }
  // spot: { place, who: [...], lines: [[speaker index, text]], fault, why, intro }
  function spotQ(R, ctx, it, v, hint) {
    var lines = it.lines;
    var sc = scene(v, it.place, it.who, { lines: lines, pose: it.pose });
    var ch = lines.map(function (l, i) { return 'Line ' + (i + 1); });
    var faultText = fill(lines[it.fault][1], v);
    return finish({
      q: (it.intro ? fill(it.intro, v) + ' ' : '') + '<b>' + (it.ask || 'Which line is not polite?') + '</b>',
      a: { t: 'mc', choices: ch, v: it.fault, keep: true },
      steps: ['Line ' + (it.fault + 1) + ': ' + lq(faultText), fill(it.why, v)].concat(it.fix ? [(it.fixLabel || 'A kinder line') + ': ' + lq(fill(it.fix, v))] : []),
      viz: sc
    }, hint);
  }
  // why: { custom, ok: reason, no: [reasons], expl }
  function whyQ(R, ctx, it, v, hint) {
    var no = R.sample(it.no, Math.min(it.no.length, ctx.level === 1 ? 2 : 3));
    return finish({
      q: fill(it.custom, v) + ' <b>' + (it.ask || 'Which reason best explains this custom?') + '</b>',
      a: mcOf(fill(it.ok, v), no.map(function (x) { return fill(x, v); })),
      steps: ['The reason: ' + end(fill(it.ok, v)), fill(it.expl, v)]
    }, hint);
  }
  // tf: [statement, true|false, explanation]
  function tfQ(R, ctx, it, v, hint) {
    return finish({ q: '<b>True or false?</b> ' + fill(it[0], v), a: { t: 'tf', v: it[1] }, steps: [(it[1] ? 'True. ' : 'False. ') + fill(it[2], v)], viz: it[3] ? sceneOf(v, it[3]) : undefined }, hint);
  }
  var SHAPES = { items: choose, all: selectAll, order: orderQ, spot: spotQ, why: whyQ, tf: tfQ };
  var DEFAULT_LEVELS = { 1: ['items', 'items', 'tf', 'why'], 2: ['items', 'items', 'why', 'spot', 'tf', 'all'], 3: ['all', 'order', 'spot', 'items', 'all'] };

  // T(id, spec): spec has banks named like SHAPES (lists) and optional custom shapes { name: fn(R, ctx, v) }, levels, hint
  function T(id, spec) {
    if (ML.__collectSpecs) ML.__collectSpecs[id] = spec;
    G(id, function (R, ctx) {
      var lv = (spec.levels && spec.levels[ctx.level]) || DEFAULT_LEVELS[ctx.level] || DEFAULT_LEVELS[2];
      var avail = lv.filter(function (k) { return (spec[k] && spec[k].length) || (spec.custom && spec.custom[k]); });
      if (!avail.length) avail = Object.keys(SHAPES).filter(function (k) { return spec[k] && spec[k].length; });
      var kind = R.pick(avail), v = vars(R), p;
      if (spec.custom && spec.custom[kind]) p = spec.custom[kind](R, ctx, v);
      else {
        var bank = spec[kind];
        var pool = bank.filter(function (it) { return !it.lv || it.lv.indexOf(ctx.level) >= 0; });
        p = SHAPES[kind](R, ctx, R.pick(pool.length ? pool : bank), v, spec.hint);
      }
      if (!p.hint && spec.hint) p.hint = spec.hint;
      if (!p.viz) delete p.viz;
      return p;
    });
  }


  // ================================================================ Unit 1: Conversation
  T('growing.starting-conversation', {
    hint: 'Look for a greeting plus an easy question about something you both share right now.',
    items: [
      { s: '{A} is waiting for {sport} practice to start. {B}, a new player, is standing alone by the bench.', ask: 'What is a good way for {A} to start a conversation?',
        ok: ['Say, “Hi, I’m {A}. Is this your first practice?”', 'Say, “Hi, I’m {A}. Have you played {sport} before?”'],
        near: [['Wait for {B} to say something first.', 'Someone has to go first, and waiting usually means nobody talks.'], ['Say, “I scored the most points on the team last year.”', 'A fact about yourself is hard to answer. A question about something you share is easier.'], ['Say “Hi” and look away.', 'A greeting is a good start, but add an easy question so {B} has something to answer.']],
        rude: [['Keep scrolling on {Ahis} phone until practice starts.', 'A phone in front of your face tells a new person you don’t want to talk.']],
        why: 'A greeting and a question about the practice they share is easy for {B} to answer, and it makes a new player feel welcome.', sc: ['park', ['A', 'B'], { mood: { 1: 'shy' } }] },
      { s: '{A} is at {C}’s birthday party and only knows {C}. {B} is standing by the snack table.', ask: 'What could {A} say to {B}?',
        ok: ['“Hi, I’m {A}. How do you know {C}?”', '“Hi, I’m {A}. Have you tried these? How do you know {C}?”'],
        near: [['“I got a new bike and it has twenty-one gears.”', 'A fact about yourself gives {B} nothing to answer but “Oh.”'], ['Nothing. {A} waits by the wall until someone talks to {Ahim}.', 'The other guests may be waiting too. Going first is a kindness.'], ['“Why are you standing by yourself?”', 'It sounds like a criticism. Ask about the party instead.']],
        rude: [['“These snacks are terrible.”', 'Complaining about the host’s food is unkind, and it is a gloomy way to start.']],
        why: '“How do you know the host?” is the classic party opener: every guest has an answer.', sc: ['party', ['A', 'B'], { props: [{ kind: 'cake', x: 300, y: 222 }] }] },
      { s: '{A} sits down next to {B} at the first meeting of the {hobby} club.', ask: 'Which opener is best?',
        ok: ['“Hi, I’m {A}. Is this your first meeting too?”', '“Hi, I’m {A}. How long have you been into {hobby}?”'],
        near: [['“I’m probably the best one here at {hobby}.”', 'Bragging makes the other person feel small and gives them nothing to say.'], ['“I had pizza for lunch.”', 'It is a fact about you, not a question about something you share.'], ['Smile and wait for the meeting to start.', 'A smile is friendly, but adding a greeting and a question starts a real conversation.']],
        rude: [['“Can you move? I wanted that seat.”', 'It starts with a complaint, not a greeting.']],
        why: 'The club is what they share, so a question about it is easy to answer and shows interest in {B}.', sc: ['classroom', ['A', 'B']] },
      { s: 'At a family dinner, {A} is seated next to Dr. Bell, a friend of {Ahis} grandmother. They have never met.', ask: 'What is a good way for {A} to start talking?',
        ok: ['“Hi, Dr. Bell. I’m {A}. How do you know my grandma?”'],
        near: [['Wait until Dr. Bell asks {Ahim} a question.', 'Grown-ups like it when young people go first, too.'], ['“I have a {subject} test on Friday.”', 'A fact about yourself is hard to answer. Ask about something you share.'], ['“Are you a real doctor? How much money do doctors make?”', 'Questions about money put people on the spot. Ask how she knows the family.']],
        rude: [['Put in earbuds until dinner is over.', 'Shutting someone out at the table is unkind to the person beside you.']],
        why: 'A greeting with her title and a question about the family they share makes a guest feel welcome.', sc: ['table', ['A', 'bell']] },
      { s: '{A} and {B} are walking out of {show}. They are in the same grade but have never really talked.', ask: 'What is an easy opener for {A}?',
        ok: ['“Hi, {B}! What did you think of it? I loved the ending.”'],
        near: [['“I don’t really know you, but hi.”', 'It points out the awkward part. Ask about the show you just saw.'], ['Wait to see if {B} says hi first.', 'Waiting usually means nobody talks.'], ['“My cousin was in the show last year, and she was way better.”', 'Comparing is a gloomy start. Ask what {B} thought.']],
        rude: [['“That was boring. Bye.”', 'It shuts the conversation down before it starts.']],
        why: 'They just shared the show, so asking about it is the easiest door there is.', sc: ['theater', ['A', 'B']] }
    ],
    tf: [
      ['A question about something you share right now, like the food or the game, is an easy way to start a conversation.', true, 'Anyone can answer it, so it gives the other person an easy way in.'],
      ['It is rude to start a conversation with someone you have never met.', false, 'A friendly greeting is a kindness. The other person is often glad that someone went first.'],
      ['The best way to start a conversation is to share an interesting fact about yourself.', false, 'A fact about yourself is hard to answer. A question about something you share works better.'],
      ['If both people wait for the other to talk first, often nobody talks at all.', true, 'That is why going first is a small kindness.']
    ],
    why: [
      { custom: 'A good way to start a conversation is to ask about something you both share right now, like the class, the game or the food.', ok: 'It is easy for anyone to answer, so it puts the other person at ease.', no: ['It lets you decide whether the person is worth knowing.', 'It shows the other person how much you know.', 'It is a rule, and rules should be followed even when nobody knows why.'], expl: 'Manners are kindness made into habits. An easy question is a friendly door for the other person.' }
    ],
    all: [
      { ask: '{A} is new at the {hobby} club. Which of these are good ways to start a conversation? Select all that apply.', okLabel: 'Good openers', noLabel: 'Not a good opener',
        ok: ['“Hi, I’m {A}. Is this your first meeting too?”', '“Hi! How long have you been doing {hobby}?”', '“Is this seat taken? I’m {A}.”', '“Hi, I’m {A}. What are we doing today?”'],
        no: [['“I’m probably the best one here.”', 'Bragging gives the other person nothing to say.'], ['Waiting in silence for someone to notice {Ahim}.', 'Waiting usually means nobody talks.'], ['“Why are you sitting all by yourself?”', 'It sounds like a criticism.'], ['“Your shoes are weird.”', 'A remark about how someone looks puts them on the spot.']] }
    ],
    order: [
      { title: 'Starting a conversation with someone new:', steps: ['Walk over and smile.', 'Say hello and your name: “Hi, I’m {A}.”', 'Ask an easy question about something you share.', 'Listen to the answer.', 'Ask a follow-up question about what they said.'] }
    ],
    spot: [
      { place: 'party', who: ['A', 'B', 'C'], lines: [[0, 'Hi, I’m {A}. How do you know {C}?'], [1, 'We’re in the same {subject} class.'], [0, 'Whatever. Anyway, I got a new phone.'], [2, 'Hey, you two! Want some cake?']], fault: 2, why: '{A} asked a good question, then brushed off the answer and talked about {Aself}.', fix: 'Oh, cool! Do you like {subject}?' },
      { place: 'park', who: ['A', 'B'], lines: [[0, 'Hi! I’m {A}. Is this your first practice?'], [1, 'Yeah. I just moved here.'], [0, 'Where did you move from?'], [1, 'Why do you care?']], fault: 3, why: '{A} asked kind, easy questions. {B}’s answer brushes {Ahim} off.', fix: 'From Ohio. It’s really different here!' }
    ]
  });

  T('growing.good-questions', {
    hint: 'Can the question be answered with one word? Questions that start with what, how or why invite more.',
    items: [
      { s: '{B} just came back from a trip to {trip}.', ask: 'Which question will keep the conversation going best?',
        ok: ['“What was the best part of your trip?”', '“What did you do at {trip}?”'],
        near: [['“Was your trip fun?”', 'It can be answered with one word: “Yes.”'], ['“Did you go to {trip}?”', '{A} already knows; it is a yes-or-no question.'], ['“Was it hot there?”', 'A yes-or-no question often gets a one-word answer.']],
        rude: [['“How much did the trip cost?”', 'Money questions put people on the spot.']],
        why: 'An open question starting with “what” invites a story, and the story gives {A} the next question.', sc: ['classroom', ['A', 'B']] },
      { s: '{A} wants to get to know Grandpa Walt better and ask him about his childhood.', ask: 'Which question is best?',
        ok: ['“What did you and your friends do for fun when you were my age?”', '“Tell me about the house you grew up in.”'],
        near: [['“Did you have fun when you were a kid?”', 'One word answers it: “Yes.”'], ['“Were you a kid a long time ago?”', 'A yes-or-no question, and not a very kind one.'], ['“Did you have a dog?”', 'A fine start, but it can stop at one word. Follow it with an open question.']],
        rude: [['“Why are you so old?”', 'Remarks about age or bodies make people uncomfortable.']],
        why: 'An open question gives Grandpa Walt room to tell a story, and older relatives often have wonderful ones.', sc: ['home', ['A', 'walt']] },
      { s: '{B} says, “I just started learning {hobby}.”', ask: 'What should {A} ask?',
        ok: ['“How did you get into {hobby}?”', '“What’s the hardest part of {hobby}?”'],
        near: [['“Do you like it?”', 'It can be answered with one word.'], ['“Is it hard?”', 'A yes-or-no question. Try “What’s the hardest part?”'], ['“Oh. I tried {hobby2} once.”', 'That steers the talk to {A}. Ask about {B}’s new hobby first.']],
        rude: [['“That sounds boring.”', 'It puts down something {B} is excited about.']],
        why: 'A “how” or “what” question invites {B} to explain, and shows real interest.', sc: ['park', ['A', 'B']] },
      { s: '{A} is at dinner with Aunt Rosa, who just started a new job.', ask: 'Which question shows the most interest?',
        ok: ['“What’s your new job like?”', '“What do you do at your new job?”'],
        near: [['“Do you like your new job?”', 'One word answers it.'], ['“Is it far away?”', 'A yes-or-no question that is easy to stop at.'], ['“Is your boss nice?”', 'Another yes-or-no question.']],
        rude: [['“How much do they pay you?”', 'Questions about money are among the topics to skip.']],
        why: 'An open question lets Aunt Rosa tell {A} about her work in her own words.', sc: ['table', ['A', 'rosa:Aunt Rosa']] }
    ],
    tf: [
      ['“Did you like the movie?” is an open question.', false, 'It can be answered with “Yes” or “No.” “What was your favorite part?” is open.'],
      ['Questions that begin with “what,” “how” or “why” usually invite a longer answer.', true, 'They ask for a story or an explanation, not just yes or no.'],
      ['A string of yes-or-no questions can make a conversation feel like a quiz.', true, 'Each one-word answer stops the conversation, and you have to start again.'],
      ['“Tell me about your new puppy” is a good conversation question.', true, 'It is not shaped like a question, but it invites a real answer.']
    ],
    why: [
      { custom: 'People who are good at conversation ask open questions, like “What was the best part of your trip?”', ok: 'They show interest and give the other person room to share a story.', no: ['They make the other person talk so you don’t have to.', 'They are harder to answer, which shows you are clever.', 'They let you find out private information.'], expl: 'An open question says, “I’m interested in you,” and the answer gives you the next question.' }
    ],
    all: [
      { intro: '{A} wants to keep a conversation going with {B}.', ask: 'Which of these are open questions? Select all that apply.', okLabel: 'Open questions', noLabel: 'Yes-or-no question',
        ok: ['“What do you like to do after school?”', '“How did you learn to swim so fast?”', '“What was your favorite part of the game?”', '“Why do you like {subject} so much?”', '“Tell me about your {pet}.”'],
        no: [['“Do you like school?”', 'It can be answered with one word.'], ['“Was the game fun?”', 'One word answers it.'], ['“Is that your {pet}?”', 'A yes-or-no question.'], ['“Did you go anywhere this summer?”', 'It can stop at “No.”']] }
    ],
    spot: [
      { place: 'classroom', who: ['A', 'B'], intro: '{A} tries to get to know {B}.', ask: 'Which line closes the door instead of opening it?', lines: [[0, 'What did you do this weekend?'], [1, 'We went to {trip}.'], [0, 'Was it fun?'], [1, 'Yeah.']], fault: 2, why: '“Was it fun?” can be answered with one word, so the conversation stalls.', fix: 'What did you do at {trip}?' }
    ],
    custom: {
      fix: function (R, ctx, v) { // turn a closed question into an open one
        var C = R.pick([
          ['Do you like {sport}?', 'What do you like about {sport}?', ['Do you play {sport}?', 'Is {sport} fun?', 'You like {sport}, right?']],
          ['Was the trip good?', 'What was the best part of the trip?', ['Was the trip long?', 'Did you have a good trip?', 'Did you like the trip?']],
          ['Is your {pet} nice?', 'What is your {pet} like?', ['Do you have a {pet}?', 'Is your {pet} big?', 'Is your {pet} friendly?']],
          ['Did you like the book?', 'What did you think of the ending of the book?', ['Did you finish the book?', 'Was the book long?', 'Was the book good?']]
        ]);
        return { q: fill('{A} was going to ask {B}, “' + C[0] + '” <b>Which question asks the same thing in an open way?</b>', v), a: mcOf(fill(C[1], v), C[2].map(function (x) { return fill(x, v); })), steps: ['Open: <i>' + fill(C[1], v) + '</i>', 'It begins with “what,” so it cannot be answered with one word. The others can be answered with yes or no.'] };
      }
    },
    levels: { 1: ['items', 'tf', 'fix'], 2: ['items', 'fix', 'why', 'spot', 'all'], 3: ['all', 'spot', 'items', 'fix'] }
  });

  T('growing.listening-well', {
    hint: 'A good listener’s reply is about what the speaker just said.',
    items: [
      { s: '{B} tells {A}, “My grandma taught me to make dumplings this weekend!”', ask: 'What is the best reply?',
        ok: ['“That sounds fun! Were they hard to fold?”', '“Cool! What kind did you make?”'],
        near: [['“I went to a basketball game this weekend.”', '{A} jumped to {Ahis} own story, which shows {Ahe} was waiting for a turn, not listening.'], ['“Nice.”', 'It is polite, but it ends the conversation. A follow-up question shows {A} heard.'], ['“That reminds me, I need to buy new shoes.”', 'It changes the subject away from {B}.']],
        rude: [['{A} nods and looks at {Ahis} phone.', 'Looking away tells {B} the phone matters more.']],
        why: 'A follow-up question about the dumplings proves {A} was listening and keeps {B} talking.', sc: ['classroom', ['A', 'B'], { say: [[1, 'My grandma taught me to make dumplings!']] }] },
      { s: '{B} is telling {A} a long story about {Bhis} {pet}. {A} has a great {pet} story too.', ask: 'What should {A} do?',
        ok: ['Let {B} finish, ask a question about the story, then share {Ahis} own if it fits.'],
        near: [['Break in with “That’s nothing! Listen to this.”', 'Interrupting to top someone’s story says yours matters more.'], ['Plan {Ahis} own story while {B} talks, and start it the moment {B} stops.', '{A} will miss what {B} said, and {B} will notice.'], ['Finish {B}’s sentences to speed things up.', 'Finishing someone’s sentences is a kind of interrupting.']],
        rude: [['Walk away in the middle of the story.', 'Leaving while someone is talking is hurtful.']],
        why: 'Letting someone finish and asking a question first shows respect. Then a story of your own feels like sharing, not competing.', sc: ['home', ['A', 'B']] },
      { s: '{B} says, “I’m nervous. I have a piano recital on Saturday.”', ask: 'Which reply shows {A} was listening?',
        ok: ['“That’s exciting! What piece are you playing?”', '“I’d be nervous too. What are you playing?”'],
        near: [['“I don’t get nervous about stuff like that.”', 'It turns the moment to {A} and makes {B} feel silly for being nervous.'], ['“Oh. Want to play a game?”', 'It skips right past what {B} shared.'], ['“Saturday? I have a {sport} game Saturday.”', 'It steers the talk to {A}.']],
        rude: [['“Piano is boring.”', 'It puts down something that matters to {B}.']],
        why: 'The reply notices the feeling and asks about the recital, so {B} knows {A} heard both.', sc: ['park', ['A', 'B'], { mood: { 1: 'worried' } }] },
      { s: 'Ms. Park is explaining the field trip plan to the class, and {A} wants to ask a question.', ask: 'What does a good listener do?',
        ok: ['Let Ms. Park finish, then raise {Ahis} hand and ask.'],
        near: [['Ask right away, in the middle of her sentence.', 'The answer may be in the next sentence, and interrupting is rude.'], ['Whisper the question to {B} while Ms. Park talks.', 'Both of them miss what Ms. Park is saying.'], ['Start reading ahead in the permission slip.', 'Reading while someone explains means not listening.']],
        rude: [['Call out, “This is going to be boring.”', 'It is unkind to the teacher and the class.']],
        why: 'Letting the speaker finish is the heart of listening. Often the question gets answered, too.', sc: ['classroom', ['park', 'A', 'B'], { pose: { 1: 'hand' } }] }
    ],
    tf: [
      ['A follow-up question about what someone just said shows you were listening.', true, 'You can only ask it if you heard them.'],
      ['Planning your own story while someone else is talking is part of listening well.', false, 'It means you are not really hearing them. Listen first; your story can wait.'],
      ['Looking at your phone while a friend talks is fine if you nod now and then.', false, 'Your eyes show where your attention is. Put the phone down.'],
      ['Letting someone finish their sentence is a way to show respect.', true, 'It tells them their words matter.']
    ],
    why: [
      { custom: 'Good listeners ask a follow-up question about what the speaker just said.', ok: 'It proves they heard, and it makes the speaker feel that their words matter.', no: ['It is a way to find mistakes in the speaker’s story.', 'It gives the listener time to plan a better story.', 'It makes the conversation end sooner.'], expl: 'Feeling heard is feeling respected; the follow-up question is the proof.' }
    ],
    all: [
      { intro: '{B} is telling {A} about {Bhis} first day at a new school.', ask: 'Which of these show good listening? Select all that apply.', okLabel: 'Good listening', noLabel: 'Not good listening',
        ok: ['Looking at {B} while {Bhe} talks.', 'Waiting until {B} finishes before talking.', 'Asking, “What was your new teacher like?”', 'Saying, “That sounds hard. Did you find your classes okay?”'],
        no: [['Checking messages while nodding.', 'Eyes on the phone means attention on the phone.'], ['Saying, “That reminds me of my first day,” and telling {Ahis} own story right away.', 'Ask about {B}’s day first.'], ['Finishing {B}’s sentences for {Bhim}.', 'It is a kind of interrupting.'], ['Interrupting to correct a small detail.', 'Small details can wait; let {B} tell it.']] }
    ],
    spot: [
      { place: 'home', who: ['A', 'B'], lines: [[1, 'We got a new puppy on Saturday!'], [0, 'No way! What’s her name?'], [1, 'Biscuit. She chews everything.'], [0, 'Anyway, did you see the game last night?']], fault: 3, why: '{A} started well, then changed the subject in the middle of {B}’s story about the puppy.', fix: 'Ha! What has she chewed so far?' }
    ]
  });

  T('growing.sharing-the-talk', {
    hint: 'Picture a game of catch: catch the ball, hold it a moment, and toss it back.',
    items: [
      { s: 'Ms. Park asks {A}, “How was your summer?” {A} took a trip to {trip}.', ask: 'Which answer shares the conversation best?',
        ok: ['“Great! We took a trip to {trip}, and I loved it. How was yours?”'],
        near: [['“Good.”', 'Too short: it gives Ms. Park nothing to catch.'], ['A twenty-minute story about every day of the trip.', 'Tell the short version and let her ask for more.'], ['“Fine. I don’t really remember.”', 'It closes the door.']],
        rude: [['“Why do you want to know?”', 'It treats a friendly question as nosy.']],
        why: 'A short answer with a detail, then a question back, is the game of catch: say a little, then toss it back.', sc: ['classroom', ['park', 'A']] },
      { s: '{A}, {B} and {C} are talking at lunch. {C} hasn’t said anything yet.', ask: 'What could {A} do?',
        ok: ['Ask, “{C}, what do you think?” about the topic they are on.', 'Ask {C} an easy question about something {Che} likes.'],
        near: [['Keep talking with {B} so {C} isn’t put on the spot.', 'Quiet people often want to join in but need an opening.'], ['Say, “{C}, why are you so quiet?”', 'That points out the quiet in a way that can embarrass {C}.'], ['Change the topic to something only {A} knows about.', 'That leaves both friends out.']],
        rude: [['Whisper to {B} about {C}.', 'Whispering about someone in front of them hurts.']],
        why: 'Bringing a quiet person in with an easy question makes them feel included without putting them on the spot.', sc: ['classroom', ['A', 'B', 'C'], { mood: { 2: 'shy' } }] },
      { s: '{A} and {B} both start talking at the same moment.', ask: 'What is the polite thing to do?',
        ok: ['Say, “Sorry, go ahead,” and let {B} talk first.'],
        near: [['Talk louder so {A} can finish.', 'Talking over someone turns a conversation into a contest.'], ['Stop talking and say nothing more all afternoon.', 'Stepping back is kind, but {A} can still take a turn after {B}.'], ['Say, “I was first.”', 'It makes a small moment into an argument.']],
        rude: [['Roll {Ahis} eyes and keep going.', 'Eye-rolling is a put-down.']],
        why: 'Offering the turn is a small courtesy, and {A} will get the next turn.', sc: ['park', ['A', 'B']] },
      { s: '{B} mentions that {Bhe} has a {sport} game Saturday. {A} plays {sport2}.', ask: 'Which reply shares the talk?',
        ok: ['“Good luck! What position do you play?”'],
        near: [['“{sport2} is way better than {sport}.”', 'It turns the topic to {A} and puts down {B}’s sport.'], ['“I have a {sport2} game too. We’re undefeated, and I’m the captain…”', 'It steers every topic back to {A}.'], ['“Okay.”', 'It catches the ball and drops it.']],
        rude: [['“I don’t care about {sport}.”', 'It is a put-down.']],
        why: 'A question about {B}’s game keeps the ball moving and shows interest.', sc: ['park', ['A', 'B']] }
    ],
    tf: [
      ['In a good conversation, each person’s turns are about the same length.', true, 'Sharing the talk means no one is stuck being the audience.'],
      ['Asking a quiet person an easy question is a kind way to include them.', true, 'It gives them an opening without putting them on the spot.'],
      ['If you have a great story, it is fine to talk over others until you finish.', false, 'Wait for a pause. Your story will keep.'],
      ['Answering a question and then asking one back is like tossing a ball back in a game of catch.', true, 'That keeps the conversation going.']
    ],
    why: [
      { custom: 'When someone asks you a question, answer and then ask them one back.', ok: 'A conversation belongs to everyone in it, and asking back shows you care about them too.', no: ['It gives you time to think of a better story.', 'It means you won’t have to talk much.', 'It proves you know more than they do.'], expl: 'Sharing the talk makes each person feel their ideas matter.' }
    ],
    all: [
      { ask: 'Which of these share the conversation? Select all that apply.', okLabel: 'Shares the talk', noLabel: 'Hogs the talk',
        ok: ['Answering, then asking “What about you?”', 'Asking the new kid what {Bhe} thinks.', 'Saying “Sorry, go ahead” when two people start at once.', 'Telling the short version of a story.'],
        no: [['Telling a very long story while friends wait.', 'Others need turns too.'], ['Turning every topic back to {A}’s own team.', 'Let the topic stay on others for a while.'], ['Talking over someone to finish a point.', 'Wait for a pause.'], ['Answering every question with one word.', 'That drops the ball instead of tossing it back.']] }
    ],
    spot: [
      { place: 'table', who: ['A', 'B', 'kofi:Dad'], lines: [[2, 'How was the {sport} game, you two?'], [1, 'We won! {A} made a great pass.'], [0, 'Thanks! {B} scored the winning point.'], [1, 'Then I did this spin move, and then another one, and then everybody cheered for me, and then…']], fault: 3, why: '{B} started well, then took over the whole conversation and kept the ball.', fix: 'It was a team win. Dad, how was your day?' }
    ]
  });

  T('growing.topics-to-skip', {
    hint: 'Is it about someone’s body, money or private family matters? Then skip it.',
    items: [
      { s: '{A} hasn’t seen {Ahis} cousin in a year, and the cousin has grown a lot.', ask: 'What is the best thing for {A} to say?',
        ok: ['“It’s so good to see you! What have you been up to?”'],
        near: [['“You got so tall! You’re huge now.”', 'Even meant kindly, it makes someone think about their body in front of everyone.'], ['“You look really different.”', 'A remark about how someone looks puts them on the spot.'], ['“Have you gained weight?”', 'Comments on weight are hurtful, whatever the reason.']],
        rude: [['Say nothing and stare.', 'Staring is uncomfortable, and a greeting is missing.']],
        why: 'A warm greeting and a question about their life skips remarks about the body and starts a real conversation.', sc: ['home', ['A', 'B']] },
      { s: '{B} has a new pair of sneakers.', ask: 'Which remark is best?',
        ok: ['“Cool sneakers! Are they comfortable?”', '“Nice sneakers! What color is that called?”'],
        near: [['“How much did those cost?”', 'Questions about money put people on the spot.'], ['“Were those expensive?”', 'Still a question about money.'], ['“My sneakers cost more than yours.”', 'Comparing what things cost makes people feel judged.']],
        rude: [['“Those are ugly.”', 'It is unkind and doesn’t help anyone.']],
        why: 'A compliment plus an easy question skips the topic of money entirely.', sc: ['classroom', ['A', 'B']] },
      { s: 'At {B}’s house, {A} notices that it is much smaller than {Ahis} own.', ask: 'What should {A} say?',
        ok: ['Nothing about the size; {Ahe} says, “I love your room! Is that a {pet}?”'],
        near: [['“Your house is so small!”', 'It is true, but it can make a family feel judged.'], ['“Is this the whole house?”', 'It is a remark about size and money, phrased as a question.'], ['“We have way more space at my house.”', 'Comparing homes is a remark about money.']],
        rude: [['“Your family must be poor.”', 'Never comment on a family’s money.']],
        why: 'Homes, cars and clothes are about money. Say something kind and true instead.', sc: ['home', ['A', 'B']] },
      { s: '{A} heard that {B}’s parents are getting divorced.', ask: 'What is the kind thing to do?',
        ok: ['Not bring it up, and be a good friend if {B} decides to talk about it.'],
        near: [['Ask {B} at lunch, in front of everyone, what happened.', 'A private family matter should never be raised in front of others.'], ['Tell other friends so they know to be nice to {B}.', 'Spreading a private matter is gossip, even with good intentions.'], ['Ask {B} lots of questions so {Bhe} feels cared about.', 'Let {B} decide how much to share.']],
        rude: [['Joke about it.', 'Joking about someone’s hard time is cruel.']],
        why: 'Private family matters belong to the family. A friend listens if invited and doesn’t pry.', sc: ['park', ['A', 'B']] }
    ],
    tf: [
      ['“You got so tall!” is always fine to say because it is a compliment.', false, 'Remarks about someone’s body make many people uncomfortable, even when meant kindly.'],
      ['Asking how much something cost is usually better to skip.', true, 'Money questions put people on the spot.'],
      ['Books, games, pets and plans are good conversation topics.', true, 'They are about interests, not bodies or money.'],
      ['If a remark is true, it can’t be rude.', false, 'True remarks can still hurt. Think about how it will feel to hear it.']
    ],
    why: [
      { custom: 'In the U.S., polite conversation leaves out remarks about someone’s weight, how much money a family has, and private family matters.', ok: 'Those remarks put people on the spot about things they can’t easily change.', no: ['Those topics are boring.', 'People might find out what you think.', 'It is against the law to discuss them.'], expl: 'Good manners mean thinking about how a remark feels to the person who hears it, not only whether it is true.' }
    ],
    all: [
      { intro: '{A} is getting to know {B}, who just moved to town.', ask: 'Which of these are good topics for chatting with a new friend? Select all that apply.', okLabel: 'Good topics', noLabel: 'Better to skip',
        ok: ['What books or shows {Bhe} likes.', 'Plans for the weekend.', 'A pet or a hobby.', 'What {Bhe} thought of the game.'],
        no: [['How much {Bhis} family’s car cost.', 'Money puts people on the spot.'], ['Whether {Bhe} has gained weight.', 'Remarks about bodies hurt.'], ['Why {Bhis} parents argue.', 'A private family matter.'], ['How big {Bhis} house is compared with others.', 'It is a remark about money.']] }
    ],
    spot: [
      { place: 'table', who: ['A', 'B', 'june'], lines: [[2, 'Thanks for coming to dinner, {B}.'], [1, 'Thank you for having me. The {food} is delicious.'], [0, 'Grandma, you look so much older than last year.'], [2, 'Well, I am a year older! Who wants more {side}?']], fault: 2, why: 'Remarks about how old someone looks are about their body. Grandma June handled it kindly, but it was better skipped.', fix: 'Grandma, it’s so good to see you.' }
    ]
  });

  T('growing.ending-conversation', {
    hint: 'Wait for a pause, say something kind, give a reason if you have one, and say goodbye.',
    items: [
      { s: '{A} is talking with friends after a game and sees {Ahis} dad waving from the car.', ask: 'What is the best way for {A} to leave?',
        ok: ['“My dad’s here. Great game, everybody! See you at practice!”'],
        near: [['Walk to the car without a word.', 'Leaving without a goodbye can look like {A} is upset.'], ['Stay and keep talking until the conversation ends by itself.', 'Dad is waiting, and a kind closing line is not rude.'], ['“Bye,” in the middle of {B}’s sentence.', 'Wait for a pause, even a short one.']],
        rude: [['“This is boring anyway. Bye.”', 'It leaves the others feeling bad.']],
        why: 'A closing line with a reason and a goodbye ends things well for everyone.', sc: ['park', ['A', 'B', 'C']] },
      { s: 'A neighbor, Mr. Diaz, has been telling {A} about his garden for a long time, and {A} promised to help in the kitchen.', ask: 'What should {A} do?',
        ok: ['Wait for a pause, then say, “Your tomatoes sound amazing. I promised to help in the kitchen, so I’d better go. It was nice talking with you!”'],
        near: [['Keep listening for another hour so {Ahe} isn’t rude.', 'Leaving kindly is not rude, and {A} has a promise to keep.'], ['Break in mid-sentence: “I have to go.”', 'Wait for a pause, and say something kind.'], ['Slowly back away while he is talking.', 'It is clearer and kinder to say goodbye.']],
        rude: [['Yawn and look at the clock.', 'It tells him he is boring.']],
        why: 'Something kind, a reason and a goodbye let Mr. Diaz know {A} enjoyed the talk.', sc: ['street', ['diaz', 'A']] },
      { s: 'The bell is about to ring, and {A} is talking with {B} in the hall.', ask: 'Which closing line is best?',
        ok: ['“I have to get to {subject}. Talk to you at lunch!”'],
        near: [['“Okay, I’m done talking now.”', 'It sounds as if {A} is tired of {B}.'], ['{A} just turns and goes.', 'A goodbye shows the leaving is about the bell, not about {B}.'], ['“I guess I’ll leave since you’re not saying much.”', 'It blames {B}.']],
        rude: [['“Finally, the bell.”', 'It suggests the conversation was a chore.']],
        why: 'The reason and the “talk to you later” make it a friendly pause, not an ending.', sc: ['classroom', ['A', 'B']] }
    ],
    tf: [
      ['Ending a conversation is rude, so you should wait until the other person ends it.', false, 'Ending kindly, with a closing line, is polite.'],
      ['A good closing line says something kind and gives a reason if you have one.', true, 'It shows you are leaving because you have to, not because of them.'],
      ['It is fine to leave in the middle of someone’s sentence if you are in a hurry.', false, 'Wait for a pause, even a short one.'],
      ['Saying the person’s name when you say goodbye makes the goodbye warmer.', true, '“See you Monday, Sam!” feels friendlier than “Bye.”']
    ],
    why: [
      { custom: 'When you end a conversation, you say something kind like “It was good to talk with you” before you go.', ok: 'It tells the other person you enjoyed the talk, so your leaving doesn’t feel like a rejection.', no: ['It makes the conversation last longer.', 'It is only for grown-ups.', 'It lets you get the last word.'], expl: 'A kind closing line lets both people move on without hurt feelings.' }
    ],
    all: [
      { ask: '{A} needs to leave a conversation with {B}. Which of these are polite ways to do it? Select all that apply.', okLabel: 'Polite', noLabel: 'Not polite',
        ok: ['“It was great to catch up. I need to find my mom. See you Monday!”', '“I have to go to practice, but I want to hear the rest tomorrow!”', '“Thanks for telling me about it. Talk to you later, {B}!”'],
        no: [['Walking off while {B} is mid-sentence.', 'Wait for a pause.'], ['“Okay, you’re boring me.”', 'It is hurtful.'], ['Pretending to get a phone call.', 'A true, kind reason is better than a fake one.'], ['Leaving without saying anything at all.', '{B} may think {A} is upset.']] }
    ],
    order: [
      { title: 'Ending a conversation:', steps: ['Wait for a pause in the talk.', 'Say something kind about the conversation.', 'Give a reason if you have one: “I need to help set up.”', 'Say goodbye with the person’s name.', 'Smile or wave as you go.'] }
    ]
  });


  // ================================================================ Unit 2: Meeting People
  T('growing.introducing-yourself', {
    hint: 'Stand, smile, look at the person, say your name clearly, and add one detail.',
    items: [
      { s: '{A} arrives at {Ahis} first {sport} practice. The coach, Mr. Diaz, doesn’t know {Ahim} yet.', ask: 'What should {A} say?',
        ok: ['“Hi, Mr. Diaz. I’m {A}. I’m new this season.”'],
        near: [['Wait until Mr. Diaz calls roll.', 'Introducing yourself first is friendly, and it helps the coach.'], ['“Hi,” mumbled while looking at {Ahis} shoes.', 'The coach can’t learn a name he can’t hear.'], ['“I’m {A}.” and walk away.', 'A detail and a moment to hear his reply make it a real introduction.']],
        rude: [['“Are you the coach? Where do I go?”', 'It skips the greeting and the name.']],
        why: 'A clear name and a detail (“I’m new this season”) tell the coach who {A} is and give him something to say back.', sc: ['park', ['A', 'diaz:Coach Diaz']] },
      { s: '{A} goes to {B}’s house for the first time, and {B}’s grandmother opens the door. {B} is upstairs.', ask: 'What should {A} say?',
        ok: ['“Hello, I’m {A}, {B}’s friend from school.”'],
        near: [['“Is {B} here?”', 'It skips saying who {A} is. A grown-up wants to know who is at the door.'], ['“Hey.”', 'Too short: she still doesn’t know who {A} is.'], ['Wave and walk in.', 'Wait to be invited in, and say who you are first.']],
        rude: [['Shout {B}’s name past her into the house.', 'It ignores the person who answered the door.']],
        why: 'A greeting, a name and the detail “{B}’s friend from school” tell her exactly who {A} is and why {Ahe} is there.', sc: ['door', ['A', 'june']] },
      { s: 'At a family wedding, {A} sits next to a grown-up {Ahe} hasn’t met. Their eyes meet.', ask: 'What is the best way for {A} to introduce {Aself}?',
        ok: ['Smile and say, “Hi, I’m {A}. I’m the bride’s cousin.”', 'Smile and say, “Hello, I’m {A}. How do you know the couple?”'],
        near: [['Look away quickly and pretend not to notice.', 'A friendly hello is kinder than pretending.'], ['“Hi.” and nothing else.', 'Add a name and a detail so the grown-up can answer.'], ['“I’m so bored. Are you bored?”', 'Complaining at a celebration is a gloomy start.']],
        rude: [['Put in earbuds.', 'It shuts out the person beside you.']],
        why: 'A name and a detail about how {A} fits in give the grown-up an easy way to talk.', sc: ['hall', ['A', 'kofi']] },
      { s: 'There is a substitute teacher in {subject} today, and she is learning everyone’s names.', ask: 'When she looks at {A}, what should {A} say?',
        ok: ['“I’m {A}.” said clearly, while looking at her.'],
        near: [['Nothing; she can read the seating chart.', 'Helping her learn names is a small kindness.'], ['Say {Ahis} name quickly, looking down.', 'She may have to ask again.'], ['Tell her {B}’s name instead, as a joke.', 'Joking with a substitute’s list makes her job harder.']],
        rude: [['“Why do you need to know?”', 'It treats a normal request as rude.']],
        why: 'A clear name, said while looking at her, helps a substitute and shows respect.', sc: ['classroom', ['A', 'priya:Ms. Shah']] }
    ],
    tf: [
      ['When you introduce yourself, adding a detail like “I’m Sam’s cousin” gives the other person something to talk about.', true, 'The detail is an easy way in for them.'],
      ['It is polite to stay seated when you introduce yourself to a grown-up.', false, 'Standing shows that meeting them matters.'],
      ['Saying your name clearly is a kindness to the other person.', true, 'They don’t have to guess or ask again.'],
      ['With a grown-up, giving your full name can be helpful.', true, 'Adults often need a last name, like a coach writing a team list.']
    ],
    why: [
      { custom: 'When you introduce yourself, you add a detail, like “I’m Leo’s cousin” or “I just joined the team.”', ok: 'It tells the other person how you fit in and gives them an easy way to keep talking.', no: ['It shows the other person you are important.', 'It makes the introduction take longer.', 'It is only needed with grown-ups.'], expl: 'The detail does the hard part of starting a conversation for both of you.' }
    ],
    all: [
      { intro: '{A} is introducing {Aself} to a new neighbor.', ask: 'Which of these are good parts of introducing yourself? Select all that apply.', okLabel: 'Good parts',
        ok: ['Standing up and facing the neighbor.', 'Smiling and looking at the neighbor.', 'Saying {Ahis} name clearly.', 'Adding a detail: “We live in the blue house.”'],
        no: [['Mumbling {Ahis} name while looking down.', 'The neighbor may not catch it.'], ['Waiting for the neighbor to guess who {Ahe} is.', 'Say your name; don’t make people guess.'], ['Talking while looking at a phone.', 'Look at the person you are meeting.'], ['Staying seated on the porch steps.', 'Standing shows the moment matters.']] }
    ],
    order: [
      { title: 'Introducing yourself:', steps: ['Stand up if you are sitting.', 'Smile and look at the person.', 'Say hello and your name clearly.', 'Add a detail about yourself.', 'Listen for their name and say, “Nice to meet you.”'] }
    ]
  });

  T('growing.eye-contact', {
    hint: 'In American custom, a friendly look at the face shows attention; a hard stare or eyes on the floor do not.',
    items: [
      { s: 'Grandpa Walt is telling {A} about a fishing trip.', ask: 'In American custom, what is the best way for {A} to use eye contact?',
        ok: ['Look at Grandpa’s face, glancing away now and then.'],
        near: [['Stare into his eyes without blinking.', 'A stare feels like a contest, not like listening.'], ['Look at the floor the whole time.', 'He may think {A} isn’t interested.'], ['Watch the TV behind him.', 'Eyes on the TV tell him the TV is more interesting.']],
        rude: [['Look at {Ahis} phone and say “uh-huh.”', 'Your eyes show where your attention is.']],
        why: 'A friendly look at his face shows {A} is listening; natural glances away keep it relaxed.', sc: ['home', ['A', 'walt']] },
      { s: 'Ms. Park hands {A} an award at the school assembly.', ask: 'What should {A} do?',
        ok: ['Look up at Ms. Park, smile and say, “Thank you.”'],
        near: [['Look at the award and say “thanks” to it.', 'Look at the person you are thanking.'], ['Look out at the audience and wave.', 'Thank Ms. Park first.'], ['Stare at the floor and hurry off.', 'Looking up for the thank-you is the important moment.']],
        rude: [['Grab it without looking at her.', 'It leaves out the thank-you completely.']],
        why: 'Looking at someone as you thank them shows that the thanks is for them.', sc: ['classroom', ['A', 'park']] },
      { s: '{A}’s friend {B} looks down while {A}’s grandmother talks to {Bhim}. {B}’s family taught {Bhim} that this is respectful with older people.', ask: 'What is the best thing for {A} to think?',
        ok: ['{B} is showing respect in {Bhis} family’s way.'],
        near: [['{B} is being rude to Grandma.', 'In some families and cultures, looking down is how you show respect to an elder.'], ['{B} must not like Grandma.', 'Eye contact customs differ; it doesn’t mean dislike.'], ['{A} should tell {B} to look up.', 'Correcting a friend’s family custom is not {A}’s job.']],
        why: 'Customs differ. Both looking at the face and looking down a little can be ways to honor someone.', sc: ['home', ['A', 'B', 'june']] },
      { s: '{A} finds it hard to look right into people’s eyes.', ask: 'Which tip helps most?',
        ok: ['Look at the person’s face, near the eyes, especially for hello, thank you and goodbye.'],
        near: [['Never look at people, so it doesn’t feel awkward.', 'Looking at the face for the key moments makes others feel noticed.'], ['Stare hard to get used to it.', 'A hard stare is uncomfortable for both people.'], ['Wear sunglasses inside.', 'It hides your face instead of showing friendliness.']],
        why: 'Looking near the eyes looks the same from the other side, and it covers the moments that matter most.' }
    ],
    tf: [
      ['In the U.S., looking at someone’s face while they talk usually shows you are paying attention.', true, 'It is one of the clearest signals of attention in American custom.'],
      ['Good eye contact means never looking away.', false, 'People glance away naturally. A nonstop stare is uncomfortable.'],
      ['In some cultures, looking down a little is a respectful way to listen to an older person.', true, 'Customs differ, and both ways can show respect.'],
      ['Looking at the person when you say thank you makes the thanks feel more real.', true, 'It shows the thanks is for them.']
    ],
    why: [
      { custom: 'In the U.S., people look at your face when they greet you and listen to you.', ok: 'It shows that their attention is on you, which feels respectful.', no: ['It helps them check whether you are telling the truth.', 'It is a way to show who is in charge.', 'It is a law in most schools.'], expl: 'Customs exist to put others at ease. Here, a friendly look says, “I’m listening.”' }
    ],
    all: [
      { intro: '{A} is meeting {Ahis} new {sport} coach.', ask: 'Which of these are good eye contact in American custom? Select all that apply.', okLabel: 'Good eye contact', noLabel: 'Not quite',
        ok: ['Looking at the coach’s face while saying hello.', 'Glancing away for a moment while thinking.', 'Looking up and smiling while saying thank you.'],
        no: [['Staring without blinking.', 'A stare feels like a contest.'], ['Watching other players the whole time the coach talks.', 'The coach can tell {A} isn’t listening.'], ['Keeping eyes on a phone.', 'Your eyes show where your attention is.'], ['Looking at the ground through the whole introduction.', 'Look up for the greeting and the names.']] }
    ]
  });

  T('growing.handshake', {
    hint: 'Right hand, palm to palm, firm but not hard, two or three shakes, then let go.',
    items: [
      { s: '{B}’s dad reaches out his hand to {A}. {A} is sitting on the couch.', ask: 'What should {A} do?',
        ok: ['Stand up, shake his hand firmly two or three times, and say, “Nice to meet you.”'],
        near: [['Shake his hand without getting up.', 'Standing shows the moment matters.'], ['Give a limp shake with just the fingertips.', 'A limp shake feels like {A} would rather not.'], ['Squeeze as hard as possible to seem strong.', 'A crushing grip feels like a contest.']],
        rude: [['Wave without looking up from the TV.', 'It ignores the hand he offered.']],
        why: 'Standing, a firm palm-to-palm shake and a greeting are the American custom when someone offers a hand.', sc: ['home', ['A', 'kofi'], { pose: { 1: 'shake' } }] },
      { s: 'At a science fair, a judge, Dr. Bell, holds out her hand to {A}.', ask: 'Which handshake is best?',
        ok: ['Right hand, palm to palm, a firm grip, two or three shakes, eyes on her face.'],
        near: [['Left hand, because {A} is holding a poster in the right.', 'Shift the poster to the left hand; handshakes use the right.'], ['A shake that goes on and on.', 'Two or three shakes is enough; then let go.'], ['A tight squeeze while looking at the floor.', 'Firm, not crushing, and look at the person.']],
        rude: [['Ignore the hand and keep talking.', 'Leaving an offered hand hanging is awkward for her.']],
        why: 'That is the whole handshake: right hand, palms meeting, firm, short, and a look at the person.', sc: ['classroom', ['A', 'bell'], { pose: { 1: 'shake' } }] },
      { s: '{A} offers a hand to {Ahis} friend’s grandmother, but she smiles, puts her hand on her heart and nods instead.', ask: 'What should {A} do?',
        ok: ['Smile, lower {Ahis} hand, and say, “It’s nice to meet you.”'],
        near: [['Keep holding out {Ahis} hand until she shakes it.', 'Not everyone shakes hands. Follow her lead.'], ['Ask her why she won’t shake hands.', 'People have many good reasons; asking puts her on the spot.'], ['Grab her hand anyway.', 'Nobody has to touch anyone to be polite.']],
        why: 'Greetings differ. Following the other person’s lead is the courteous thing.', sc: ['home', ['A', 'june'], { pose: { 0: 'shake', 1: 'heart' } }] },
      { s: 'After a {sport} game, both teams line up to shake hands. {A}’s team lost.', ask: 'What should {A} do?',
        ok: ['Shake each player’s hand briefly and say, “Good game.”'],
        near: [['Skip the line because losing feels bad.', 'Shaking hands win or lose is part of good sportsmanship.'], ['Shake hands without looking at anyone.', 'A glance and “good game” make it sincere.'], ['Squeeze extra hard to show {Ahe}’s not upset.', 'A normal, firm shake is enough.']],
        rude: [['Say “You cheated” to each player.', 'Accusing the other team spoils the custom.']],
        why: 'The handshake line is a way to show respect to the other team, whatever the score.', sc: ['park', ['A', 'B']] }
    ],
    tf: [
      ['A handshake uses the right hand.', true, 'That is the custom in the U.S. and in most places that shake hands.'],
      ['The harder you squeeze, the better the handshake.', false, 'Firm is good; crushing feels like a contest.'],
      ['Two or three shakes is about right.', true, 'Then let go.'],
      ['If someone doesn’t offer a hand, it is fine to greet them with a smile and a hello instead.', true, 'Not everyone shakes hands, and that is fine.'],
      ['It is polite to stay seated when shaking hands with a grown-up who is standing.', false, 'Stand up to shake hands.']
    ],
    why: [
      { custom: 'A handshake should be firm but not hard.', ok: 'A firm grip shows you are paying attention, while a crushing one feels like a contest.', no: ['It proves who is stronger.', 'It keeps the other person from letting go too soon.', 'It is a rule from sports.'], expl: 'A handshake is a small, friendly promise: “I’m glad to meet you.”' }
    ],
    order: [
      { title: 'A good handshake:', steps: ['Stand up and face the person.', 'Smile and look at them.', 'Reach out your right hand, thumb up.', 'Meet palm to palm.', 'Grip firmly and shake two or three times.', 'Let go and say, “Nice to meet you.”'] },
      { title: 'Meeting your friend’s parent:', steps: ['Stand up when the parent comes in.', 'Smile and say hello.', 'Shake the hand they offer.', 'Say, “Nice to meet you,” with their name.'] }
    ],
    all: [
      { ask: 'Which of these are parts of a good handshake? Select all that apply.', okLabel: 'Good handshake',
        ok: ['Standing up first.', 'Using your right hand.', 'Meeting palm to palm.', 'Looking at the person and smiling.', 'Letting go after two or three shakes.'],
        no: [['Offering only your fingertips.', 'Palms should meet.'], ['Squeezing as hard as you can.', 'Firm, not crushing.'], ['Staying seated.', 'Stand up to shake hands.'], ['Looking at your phone while you shake.', 'Look at the person.']] }
    ],
    levels: { 1: ['items', 'tf', 'why'], 2: ['items', 'tf', 'order', 'all'], 3: ['order', 'all', 'items'] }
  });

  T('growing.remembering-names', {
    hint: 'Repeat the name right away, use it again, and ask soon if you missed it.',
    items: [
      { s: 'At a picnic, a new girl says, “Hi, I’m {B}.”', ask: 'What is the best reply for {A}?',
        ok: ['“Nice to meet you, {B}. I’m {A}.”'],
        near: [['“Nice to meet you.” without the name.', 'Saying the name out loud helps {A} remember it.'], ['“Cool.”', 'It skips both names.'], ['“I’m {A},” and nothing about {Bhim}.', 'Repeat {Bhis} name back so it sticks.']],
        rude: [['“That’s a weird name.”', 'Remarks about someone’s name are unkind.']],
        why: 'Repeating the name right away shows {A} heard it and helps {Ahis} memory hold on to it.', sc: ['park', ['A', 'B']] },
      { s: 'Ten minutes after meeting a new teammate, {A} realizes {Ahe} has forgotten the teammate’s name.', ask: 'What should {A} do?',
        ok: ['Ask now: “I’m sorry, I missed your name. Can you tell me again?”'],
        near: [['Avoid using the name until {Ahe} hears someone else say it.', 'That can take weeks and gets more awkward every day.'], ['Call the teammate “buddy” for the rest of the season.', 'It hides the problem instead of fixing it.'], ['Guess a name and hope it is right.', 'A wrong guess is more awkward than asking.']],
        rude: [['Ask other players, “Who’s the new kid?” loudly.', 'Talking about someone instead of to them can feel unkind.']],
        why: 'Everyone forgets names. Asking right away is easy and polite; waiting makes it harder.', sc: ['park', ['A', 'B']] },
      { s: '{A} meets {Ahis} mom’s friend, who says, “I’m Nora Grant.”', ask: 'What is a good reply?',
        ok: ['“Nice to meet you, Ms. Grant.”'],
        near: [['“Hi.”', 'Using her name shows {A} was listening.'], ['“Nice to meet you, Nora,” without being invited to use her first name.', 'With adults, use the title unless they ask you to use a first name.'], ['“Okay.”', 'It skips the greeting and the name.']],
        why: 'Repeating her name with a title is respectful and helps {A} remember it.', sc: ['home', ['A', 'nora', 'rosa:Mom']] },
      { s: '{A} sees a neighbor’s son at the store. They met once, and {A} can tell he has forgotten {Ahis} name.', ask: 'What is the kind thing to do?',
        ok: ['Help him out: “Hi, I’m {A}. We met at the block party.”'],
        near: [['Wait to see if he remembers.', 'Saying your name saves him from an awkward moment.'], ['Say, “You forgot my name, didn’t you?”', 'Pointing out the slip embarrasses him.'], ['Pretend not to see him.', 'A friendly hello is kinder.']],
        why: 'Offering your name first is a kindness; everyone forgets names sometimes.', sc: ['store', ['A', 'B']] }
    ],
    tf: [
      ['Asking someone to repeat their name right away is polite.', true, 'It is much less awkward than waiting weeks.'],
      ['Repeating a new name out loud can help you remember it.', true, 'Saying it gives your memory a second chance to hold on.'],
      ['If you forget a name, it is best never to use it.', false, 'Ask again kindly, and then use it.'],
      ['Using someone’s name when you say goodbye is a small kindness.', true, 'It shows you remembered.']
    ],
    why: [
      { custom: 'When you meet someone, you repeat their name right away: “Nice to meet you, Grace.”', ok: 'It shows you heard and cared, and saying it helps you remember it.', no: ['It checks whether they told you the right name.', 'It fills the silence so you don’t have to talk.', 'It is only for formal events.'], expl: 'A person’s name matters to them, and using it is a way to show respect.' }
    ],
    all: [
      { ask: 'Which of these help {A} remember and use a new name? Select all that apply.', okLabel: 'Helpful',
        ok: ['Saying the name right away: “Nice to meet you, {B}.”', 'Using the name again before saying goodbye.', 'Asking again right away if {Ahe} missed it.', 'Linking the name to a picture, like “{B} with the {pet}.”'],
        no: [['Not using the name at all, just in case.', 'That makes it harder to remember.'], ['Waiting a month to ask.', 'Asking right away is much easier.'], ['Making a joke about the name.', 'Jokes about names can hurt.'], ['Thinking about what to say next while they say their name.', 'Listen for the name first.']] }
    ],
    order: [
      { title: 'Learning a new name:', steps: ['Listen carefully when the person says their name.', 'Repeat it right away: “Nice to meet you, {B}.”', 'Use it once more during the talk.', 'Say it again when you say goodbye.'] }
    ]
  });

  // introductions: an honored person (older or a teacher) and a peer
  var HONOR = [
    { who: 'june', call: 'Grandma', title: 'Mrs. Hale', role: 'my grandmother', rel: 'grandmother', name: 'Grandma June' },
    { who: 'walt', call: 'Grandpa', title: 'Mr. Hale', role: 'my grandfather', rel: 'grandfather', name: 'Grandpa Walt' },
    { who: 'park', call: 'Ms. Park', title: 'Ms. Park', role: 'my teacher', rel: 'teacher', name: 'Ms. Park' },
    { who: 'diaz', call: 'Coach Diaz', title: 'Mr. Diaz', role: 'my coach', rel: 'coach', name: 'Mr. Diaz' },
    { who: 'bell', call: 'Dr. Bell', title: 'Dr. Bell', role: 'our neighbor', rel: 'neighbor', name: 'Dr. Bell' }
  ];
  T('growing.introducing-others', {
    hint: 'Say the older or honored person’s name first, then present the other person to them.',
    custom: {
      first: function (R, ctx, v) { // whose name comes first? (et-intro, quiet)
        var H = R.pick(HONOR), hi = R.int(0, 1);
        var people = [{ who: H.who, role: H.role, call: H.call, title: H.title, name: H.name }, { who: v.Bk, age: 'teen', role: 'my friend', name: v.B }];
        if (hi === 1) people.reverse();
        return {
          q: fill('{A} wants to introduce {Ahis} friend {B} to {Ahis} ' + H.rel + ', ' + H.name + '. <b>Whose name should {A} say first?</b>', v),
          a: { t: 'mc', choices: [H.name, v.B, 'Either one; the order doesn’t matter'], v: 0 },
          steps: ['Say the older or honored person’s name first: ' + H.name + '.', '“' + H.call + ', this is my friend ' + v.B + '. ' + v.B + ', this is my ' + H.rel + ', ' + H.title + '.”'],
          viz: { name: 'et-intro', opts: { people: people, honored: hi, you: { who: v.Ak, age: 'teen', name: v.A }, mode: 'choose', quiet: true, interactive: false } }
        };
      },
      line: function (R, ctx, v) { // which introduction follows the custom?
        var H = R.pick(HONOR.filter(function (h) { return h.who !== 'bell'; }));
        var good = '“' + H.call + ', this is my friend ' + v.B + '. ' + v.B + ', this is my ' + H.rel + ', ' + H.title + '. ' + v.B + ' plays ' + v.sport + ' too.”';
        var wrongs = [
          '“' + v.B + ', this is ' + H.call + '. ' + H.call + ', this is ' + v.B + '.”',
          '“' + H.call + ', ' + v.B + '. ' + v.B + ', ' + H.call + '.” Then ' + v.A + ' walks off.',
          '“Hey, this is ' + v.B + '.”'
        ];
        return {
          q: fill('{A} is introducing {Ahis} friend {B} to {Ahis} ' + H.rel + '. <b>Which introduction follows the custom best?</b>', v),
          a: mcOf(good, ctx.level === 1 ? wrongs.slice(1) : wrongs),
          steps: ['Best: ' + good, H.call + '’s name comes first, because ' + (/grand/.test(H.rel) ? 'an older person is honored' : 'a teacher or coach is honored') + '. Each person learns who the other is, and the detail about ' + v.sport + ' gives them something to talk about.'],
          viz: { name: 'et-intro', opts: { people: [{ who: H.who, role: H.role, call: H.call, title: H.title, name: H.name }, { who: v.Bk, age: 'teen', role: 'my friend', name: v.B }], honored: 0, you: { who: v.Ak, age: 'teen', name: v.A }, mode: 'choose', quiet: true, interactive: false } }
        };
      }
    },
    items: [
      { s: '{A} introduces two friends from different schools, {B} and {C}. They are the same age.', ask: 'Which statement is true?',
        ok: ['Either name can go first; what matters is saying both names and a detail.'],
        near: [['{B}’s name must go first because {Bhe} was there first.', 'With people your own age, there is no set order.'], ['{A} should let them introduce themselves.', 'Introducing them is the kind thing; they don’t know each other yet.'], ['Names don’t matter as long as {A} says, “You two should talk.”', 'Each needs the other’s name to start.']],
        why: 'The “honored person first” rule is for an older person, a guest or a teacher. Between friends of the same age, either order is fine.', sc: ['park', ['A', 'B', 'C']] },
      { s: '{A} has just introduced {B} to Grandpa Walt by saying both names. They are both standing quietly.', ask: 'What should {A} add?',
        ok: ['A detail they share: “{B} likes fishing too, Grandpa.”'],
        near: [['Nothing; the introduction is done.', 'A detail helps them start talking.'], ['“Okay, bye!”', 'Leaving right away leaves them stuck in silence.'], ['“Grandpa is really old.”', 'Remarks about age are better skipped.']],
        why: 'A detail does the hardest part of starting a conversation for both people.', sc: ['home', ['A', 'B', 'walt']] }
    ],
    tf: [
      ['When introducing a friend to your grandmother, say your grandmother’s name first.', true, 'The older person is honored by hearing their name first.'],
      ['It doesn’t matter whether you add a detail when you introduce people.', false, 'A detail gives them something to talk about.'],
      ['With two friends the same age, either name can go first.', true, 'The order matters most when one person is older or honored.']
    ],
    why: [
      { custom: 'When you introduce a friend to an older person, you say the older person’s name first.', ok: 'Saying someone’s name first is a small way to honor them.', no: ['Older people have trouble hearing, so they need to go first.', 'It keeps the introduction short.', 'It lets your friend decide whether to stay.'], expl: 'Customs exist to put people at ease and show respect.' }
    ],
    order: [
      { title: '{A} introduces {B} to Grandma June:', steps: ['Get Grandma’s attention: “Grandma?”', 'Say her name first and present {B}: “Grandma, this is my friend {B}.”', 'Introduce her back: “{B}, this is my grandmother, Mrs. Hale.”', 'Add a detail: “{B} likes to bake, like you.”', 'Stay a moment to help them start talking.'] }
    ],
    levels: { 1: ['first', 'tf', 'line'], 2: ['first', 'line', 'items', 'why'], 3: ['line', 'order', 'items', 'first'] }
  });

  T('growing.addressing-adults', {
    hint: 'A title and last name is the safe, respectful choice; switch to a first name only if invited.',
    items: [
      { s: '{A} meets {Ahis} new neighbor, Nora Grant. Nobody has said what to call her.', ask: 'What is the safest respectful greeting?',
        ok: ['“Hi, Ms. Grant!”'],
        near: [['“Hi, Nora!”', 'Use a first name only when the adult invites you.'], ['“Hi, Mrs. Grant!”', '“Mrs.” is for a married woman who uses it; “Ms.” works for any woman when you aren’t sure.'], ['“Hi, Grant!”', 'A last name alone sounds like a team roll call.']],
        rude: [['“Hey, lady!”', 'Use her name with a title.']],
        why: '“Ms.” with a last name works for any woman, so it is the safe choice until she says otherwise.', sc: ['street', ['A', 'nora']] },
      { s: 'A doctor, Ada Bell, is a guest at {A}’s house.', ask: 'What should {A} call her?',
        ok: ['Dr. Bell'],
        near: [['Ada', 'Use a first name only if she invites it.'], ['Bell', 'A last name alone sounds like a roll call.'], ['Doctor Lady', 'Use her title with her name.']],
        why: 'A doctor is addressed as “Dr.” with the last name.', sc: ['home', ['A', 'bell']] },
      { s: '{A}’s friend’s dad says, “Please, call me Kofi.”', ask: 'What is the best thing for {A} to do?',
        ok: ['Call him Kofi, as he asked, unless {A}’s own family has asked {Ahim} to use titles.'],
        near: [['Keep calling him “Hey” to avoid choosing.', 'Using his name is friendlier.'], ['Call him “Mr. Kofi Mensah” every time.', 'He asked for his first name; a full name every time sounds stiff.'], ['Ask him why he doesn’t want a title.', 'It is his choice; there is no need to ask why.']],
        why: 'Following what an adult asks to be called shows you listened. Some families still prefer a title, and that is fine too.', sc: ['home', ['A', 'kofi']] }
    ],
    tf: [
      ['“Ms.” can be used for any woman when you are not sure whether she uses “Mrs.”', true, '“Ms.” doesn’t depend on whether someone is married.'],
      ['Children should always call adults by their first names.', false, 'In most of the U.S., use a title and last name unless invited to use a first name.'],
      ['In many regions, saying “sir” and “ma’am” is a respectful habit.', true, 'It is common in the South and in many families.'],
      ['If an adult tells you what they would like to be called, it is polite to use it.', true, 'It shows you listened.']
    ],
    why: [
      { custom: 'Young people in the U.S. usually call adults Mr., Ms., Mrs. or Dr. with their last name.', ok: 'A title shows respect for the adult’s age and role.', no: ['It keeps young people from learning adults’ first names.', 'Adults would be angry otherwise.', 'It is a law.'], expl: 'Many adults will invite you to use a first name; until then, the title is the respectful choice.' }
    ],
    all: [
      { ask: 'Which of these are respectful ways to address adults? Select all that apply.', okLabel: 'Respectful', noLabel: 'Better to avoid',
        ok: ['“Good morning, Ms. Park.”', '“Thank you, Dr. Bell.”', '“Excuse me, Mr. Diaz.”', '“What would you like me to call you?”', '“Thanks, Priya,” after she asked to be called Priya.'],
        no: [['“Hey, you!” to a friend’s dad.', 'Use his name with a title.'], ['“Yo, teacher!”', 'Use Ms. Park’s name.'], ['Calling a new neighbor by her first name before she offers it.', 'Wait for the invitation.'], ['“Hey, Grace!” to your teacher, Ms. Park.', 'Use her title unless she asks otherwise.']] }
    ],
    custom: {
      title: function (R, ctx, v) { // the right title for a cast adult
        var P = R.pick([['Ms. Park', 'Grace Park', 'your new teacher', 'her', ['Grace', 'Park', '“Hey, teacher”']], ['Dr. Bell', 'Ada Bell', 'a doctor who lives nearby', 'her', ['Ada', 'Bell', '“Hey, Doc”']],
          ['Mr. Reed', 'James Reed', 'a friend of the family', 'him', ['James', 'Jimmy', 'Reed']], ['Ms. Shah', 'Priya Shah', 'your new neighbor', 'her', ['Priya', 'Shah', '“Hey, lady”']], ['Mr. Mensah', 'Kofi Mensah', 'your friend’s dad', 'him', ['Kofi', 'Mensah', '“Hey, man”']]]);
        return { q: 'Your parent introduces you to ' + P[1] + ', ' + P[2] + '. Nobody mentions what to call ' + P[3] + '. <b>What is the most respectful way to address ' + P[3] + '?</b>', a: mcOf(P[0], ctx.level === 1 ? P[4].slice(0, 2) : P[4]), steps: ['Use a title with the last name: ' + P[0] + '.', 'Switch to a first name only if ' + (P[3] === 'him' ? 'he' : 'she') + ' invites you to.'] };
      }
    },
    levels: { 1: ['items', 'tf', 'title'], 2: ['items', 'title', 'why', 'all'], 3: ['all', 'items', 'title'] }
  });


  // ================================================================ Unit 3: Posture and Poise
  function postureAB(R, ctx, v, pose, what) { // two figures, one poised (quiet et-posture compare)
    var good = R.pick(['A', 'B']), who = R.pick(KIDS);
    return {
      q: 'Look at figures A and B, ' + what + '. <b>Which one shows poise?</b>',
      a: { t: 'mc', choices: ['A', 'B'], v: good === 'A' ? 0 : 1, keep: true },
      steps: ['Figure ' + good + ' shows poise.', pose === 'stand' ? 'Head up, shoulders relaxed and back, hands still at the sides, weight on both feet.' : pose === 'sit' ? 'Sitting back in the chair, upright and relaxed, hands in the lap, feet on the floor.' : 'Sitting up with the back against the chair, wrists at the table edge, elbows off the table while eating, feet on the floor.', 'The other figure is slumped, which can look as if the person would rather be somewhere else.'],
      viz: { name: 'et-posture', opts: { pose: pose, mode: 'compare', good: good, who: who, quiet: true, interactive: false } }
    };
  }
  T('growing.standing-poise', {
    hint: 'Poise looks easy and tall: weight on both feet, shoulders relaxed, head up, hands still.',
    custom: { ab: function (R, ctx, v) { return postureAB(R, ctx, v, 'stand', 'who are standing'); } },
    items: [
      { s: '{A} is waiting on stage to receive a certificate.', ask: 'Which shows poise?',
        ok: ['Standing tall and easy, hands still at {Ahis} sides, eyes on the speaker.'],
        near: [['Standing stiff as a board, holding {Ahis} breath.', 'Poise looks relaxed, not rigid.'], ['Leaning on one hip with arms crossed.', 'Crossed arms and leaning can look impatient.'], ['Swaying back and forth to pass the time.', 'Fidgeting draws attention away from the speaker.']],
        rude: [['Hands in pockets, looking at the floor and sighing.', 'It looks as if {A} would rather be somewhere else.']],
        why: 'Tall and easy, with still hands and attention on the speaker, is what poise means.', sc: ['classroom', ['A', 'park']] },
      { s: '{A} is standing in line to meet the author at a book signing.', ask: 'Which way of standing shows poise?',
        ok: ['Weight on both feet, head up, hands holding {Ahis} book in front.'],
        near: [['Slumped over {Ahis} phone.', 'It looks as if {A} isn’t interested.'], ['Shifting from foot to foot and kicking the floor.', 'Still feet look calm and ready.'], ['Standing like a soldier at attention, not moving at all.', 'Poise is relaxed, not frozen.']],
        why: 'Poise is calm and ready: still, upright and easy.', sc: ['library', ['A', 'B']] },
      { s: '{A} is standing at the front of the class to give a short report.', ask: 'Which shows poise?',
        ok: ['Standing tall with weight on both feet, notes held still, looking up at the class.'],
        near: [['Rocking from heel to toe the whole time.', 'Rocking draws eyes away from the report.'], ['Hiding behind {Ahis} notes.', 'Head up shows the class {Ahe} is talking to them.'], ['Leaning on the teacher’s desk with arms crossed.', 'Leaning and crossed arms can look bored.']],
        why: 'Tall, still and looking at the listeners is poise.', sc: ['classroom', ['A', 'B']] },
      { s: '{A} is introduced to a friend’s grandmother in the hallway.', ask: 'How should {A} stand while they talk?',
        ok: ['Facing her, standing tall and easy, hands still.'],
        near: [['Half turned toward the door, ready to leave.', 'It looks as if {A} wants to be somewhere else.'], ['Bouncing on {Ahis} toes.', 'Bouncing looks restless.'], ['Leaning against the wall with hands in {Ahis} pockets.', 'Standing up straight shows respect.']],
        why: 'Facing the person and standing tall shows attention and respect.', sc: ['library', ['A', 'B']] }
    ],
    tf: [
      ['Facing the person you are talking with is part of good posture in company.', true, 'It shows you are paying attention to them.'],
      ['Crossing your arms tightly always looks friendly.', false, 'Crossed arms can look closed off or impatient.'],
      ['Keeping your head up and eyes forward helps you look calm and ready.', true, 'Head up shows attention.'],
      ['Bouncing or swaying while someone talks to you shows poise.', false, 'Fidgeting draws attention away from the speaker.'],
      ['Poise means standing stiff and completely still, like a soldier.', false, 'Poise looks easy and relaxed, not rigid.'],
      ['Standing with your weight on both feet and your hands still is part of poise.', true, 'It looks calm and ready.'],
      ['Slumping with hands in your pockets can look as if you would rather be somewhere else.', true, 'People read posture as a message, even when you don’t mean one.'],
      ['Poise is about how your posture makes other people feel.', true, 'It shows them your attention, which is why it is a courtesy.']
    ],
    why: [
      { custom: 'When you stand to talk with someone, you stand tall and easy, with your hands still.', ok: 'It shows the other person that you are paying attention to them.', no: ['It makes you look taller than they are.', 'It is a way to show you are in charge.', 'It is the only way to stand that is allowed.'], expl: 'Poise is a courtesy: it is about how you make others feel.' }
    ],
    all: [
      { ask: 'Which of these are part of standing with poise? Select all that apply.', okLabel: 'Poise', noLabel: 'Not poise',
        ok: ['Weight on both feet.', 'Shoulders relaxed and back.', 'Head up, eyes forward.', 'Hands still at your sides.'],
        no: [['Hands in your pockets.', 'Still hands at your sides look more open.'], ['Locked stiff, holding your breath.', 'Poise is easy, not rigid.'], ['Leaning on one hip with arms crossed.', 'It can look impatient.'], ['Looking down at the floor.', 'Head up shows attention.']] }
    ],
    levels: { 1: ['ab', 'tf', 'items'], 2: ['ab', 'items', 'why', 'all'], 3: ['all', 'ab', 'items'] }
  });

  T('growing.sitting-well', {
    hint: 'Sit back, upright and relaxed, feet on the floor, hands in your lap, four chair legs down.',
    custom: { ab: function (R, ctx, v) { return R.coin() ? postureAB(R, ctx, v, 'sit', 'who are sitting in chairs') : postureAB(R, ctx, v, 'table', 'who are sitting at a table'); } },
    items: [
      { s: '{A} is sitting on {B}’s family couch while {B}’s grandmother talks to {Ahim}.', ask: 'Which shows sitting well?',
        ok: ['Sitting back and upright, feet on the floor, facing her.'],
        near: [['Lying across the couch with shoes on the cushions.', 'Sprawling takes up space and can look bored.'], ['Sitting on the arm of the couch.', 'Sit on the seat, not the arm.'], ['Slumped down so {Ahis} chin is on {Ahis} chest.', 'Sitting up shows attention.']],
        rude: [['Turned away, playing a game on {Ahis} phone.', 'It shows the game matters more than she does.']],
        why: 'Sitting back and upright and facing the speaker shows {A} is paying attention.', sc: ['home', ['A', 'june']] },
      { s: 'During a long assembly, {A} starts to feel restless.', ask: 'What is the best way to sit?',
        ok: ['Sit back with feet on the floor and hands in {Ahis} lap.'],
        near: [['Tip {Ahis} chair back on two legs.', 'Tipping a chair is unsafe for the chair and startles people nearby.'], ['Put {Ahis} feet on the seat in front.', 'That seat belongs to someone else.'], ['Drum {Ahis} fingers on the chair.', 'Fidgeting distracts people nearby.']],
        why: 'Feet down, hands still and sitting back are calm habits that don’t bother anyone.', sc: ['hall', ['A', 'B']] },
      { s: '{A} is in class at the end of a long day.', ask: 'Which is sitting well?',
        ok: ['Sitting back in the chair, turned toward the teacher.'],
        near: [['Head down on the desk.', 'It looks as if {A} has stopped listening.'], ['Hanging one arm over the back of the chair.', 'It looks sprawled and bored.'], ['Clicking a pen over and over.', 'Fidgeting distracts others.']],
        why: 'Facing the speaker, upright and still, shows attention even on a tired day.', sc: ['classroom', ['A', 'park']] }
    ],
    tf: [
      ['Tipping your chair back on two legs is fine if you are careful.', false, 'Keep all four chair legs on the floor.'],
      ['Sitting well includes keeping your feet on the floor.', true, 'Feet down looks calm and keeps shoes off furniture.'],
      ['Sprawling across a couch at someone else’s house is polite if it is comfortable.', false, 'Sit back on the seat; sprawling takes up space and can look bored.'],
      ['Resting your hands in your lap is part of sitting well.', true, 'Still hands look calm and attentive.']
    ],
    why: [
      { custom: 'At someone else’s home, you sit back on the couch instead of sprawling across it.', ok: 'It shows you are paying attention to the people you are with and respects their furniture.', no: ['It makes you look smaller.', 'Sprawling is against the law.', 'It saves space for snacks.'], expl: 'Sitting well is a quiet way to say, “I’m with you.”' }
    ],
    all: [
      { ask: 'Which of these are part of sitting well? Select all that apply.', okLabel: 'Sitting well', noLabel: 'Not sitting well',
        ok: ['Sitting back in the chair.', 'Feet on the floor.', 'Hands in your lap.', 'Turning toward the person who is talking.'],
        no: [['Tipping the chair on two legs.', 'Keep all four legs down.'], ['An arm hung over the chair back.', 'It looks sprawled.'], ['Feet on the seat in front of you.', 'That seat is someone else’s.'], ['Lying across two chairs.', 'Use one seat.']] }
    ],
    levels: { 1: ['ab', 'tf', 'items'], 2: ['ab', 'items', 'why', 'all'], 3: ['all', 'ab', 'items'] }
  });

  T('growing.entering-room', {
    hint: 'Look up, smile, greet the host or the adult in charge, and wait to be shown a seat.',
    items: [
      { s: '{A} arrives at {Ahis} aunt’s house for dinner. Relatives are already in the living room.', ask: 'What should {A} do first?',
        ok: ['Put {Ahis} phone away and greet {Ahis} aunt, the host: “Hi, Aunt Rosa, thanks for having us.”'],
        near: [['Walk straight to the couch and sit down.', 'Greet the host first, then find a seat.'], ['Wait in the doorway for someone to notice {Ahim}.', 'Walking in and saying hello is friendlier.'], ['Greet only the cousins {Ahis} own age.', 'Say hello to the host and the grown-ups too.']],
        rude: [['Walk in looking at {Ahis} phone.', 'It looks as if the room doesn’t matter to {Ahim}.']],
        why: 'A greeting for the host, then the others, tells everyone {A} is glad to be there.', sc: ['home', ['A', 'rosa:Aunt Rosa', 'walt'], { pose: { 0: 'wave' } }] },
      { s: '{A} arrives at {B}’s birthday party. {B}’s dad opens the door.', ask: 'What is the best way to come in?',
        ok: ['Smile, say “Hi, Mr. Mensah!” and then find {B} to say “Happy birthday!”'],
        near: [['Run past him to find the cake.', 'Greet the person who opened the door.'], ['Hand him the gift without saying anything.', 'A greeting comes first.'], ['Stand silently until {B} comes to the door.', 'Say hello to the parent who answered.']],
        rude: [['Shout {B}’s name from the doorway.', 'It skips the parent in front of {Ahim}.']],
        why: 'Greeting the parent at the door, then the friend, is the polite way to arrive.', sc: ['door', ['A', 'kofi'], { holds: { 0: 'gift' } }] },
      { s: '{A}’s club meeting has already started when {Ahe} arrives.', ask: 'What is the polite way to enter?',
        ok: ['Come in quietly, give the leader a small wave, take the nearest open seat, and apologize briefly afterward.'],
        near: [['Announce, “Sorry I’m late, everybody!” in the middle of the talk.', 'It interrupts the meeting; a short apology can wait.'], ['Walk across the front of the room to sit with friends.', 'Take the nearest seat to avoid distracting others.'], ['Wait outside until the meeting ends.', '{A} can come in quietly; that is fine.']],
        why: 'Quiet, quick and an apology afterward is the way to enter a room where something has started.', sc: ['classroom', ['A', 'park', 'B']] },
      { s: '{A} is a guest at a friend’s house for dinner and walks into the dining room.', ask: 'Where should {A} sit?',
        ok: ['Wait to be shown a seat, or ask, “Where would you like me to sit?”'],
        near: [['Take the chair at the head of the table.', 'The host may have a plan for that seat.'], ['Sit in the first empty chair.', 'The host may be saving it for someone.'], ['Stand in the kitchen until everyone else sits.', 'It is fine to ask where to sit.']],
        why: 'Waiting to be shown a seat respects the host, who may have a plan.', sc: ['table', ['A', 'priya']] }
    ],
    tf: [
      ['When you arrive as a guest, greet the host before you sit down.', true, 'The greeting lets the host know you are glad to be there.'],
      ['It is polite to choose your own seat right away at someone else’s dinner table.', false, 'Wait to be shown a seat, or ask.'],
      ['Putting your phone away before you walk in helps you greet people.', true, 'Your eyes and hands are free for hello.'],
      ['If you arrive late to a meeting, the polite thing is to come in quietly.', true, 'Save your apology for afterward.']
    ],
    why: [
      { custom: 'When you arrive at someone’s home, you greet the host first.', ok: 'The host has done the work of inviting you, and a greeting shows you see them and are glad to be there.', no: ['The host will check that you are on the guest list.', 'It is the fastest way to get a seat.', 'The host is always the oldest person.'], expl: 'A greeting at the door is the polite way to arrive.' }
    ],
    order: [
      { title: 'Arriving at a friend’s party:', steps: ['Put your phone away before you go in.', 'Walk in at an easy pace and look up.', 'Smile and greet your friend’s parent.', 'Find your friend and say, “Happy birthday!”', 'Ask where to put the gift, or wait to be shown.'] },
      { title: 'Arriving at a family dinner as a guest:', steps: ['Knock or ring, and wait to be let in.', 'Greet the host and say thank you for having you.', 'Say hello to the others in the room.', 'Wait to be shown where to sit.'] }
    ],
    all: [
      { intro: '{A} is walking into a room full of {Ahis} parents’ friends.', ask: 'Which of these are polite? Select all that apply.',
        ok: ['Looking up and smiling.', 'Saying hello to the host first.', 'Walking in at an easy pace.', 'Waiting to be shown where to sit.'],
        no: [['Walking in while texting.', 'Look up and greet people.'], ['Heading straight for the snacks without a word.', 'Greet people first.'], ['Running in and jumping onto the couch.', 'Easy pace, and sit when invited.'], ['Ignoring everyone {Ahe} doesn’t know.', 'A smile and hello go to everyone.']] }
    ]
  });

  T('growing.standing-to-greet', {
    hint: 'When an adult or a guest comes in or comes over, get up.',
    items: [
      { s: 'Grandpa Walt arrives for a visit while {A} is on the couch with a game.', ask: 'What should {A} do?',
        ok: ['Put the game down, stand up and say, “Hi, Grandpa! It’s great to see you.”'],
        near: [['Wave from the couch and keep playing.', 'Standing says he matters more than the game.'], ['Say “Hi” without looking up.', 'He can’t see {Ahis} face; stand and look up.'], ['Stand up only after finishing the level.', 'Greet him when he arrives, not later.']],
        rude: [['Turn up the volume.', 'It shuts him out.']],
        why: 'Standing to greet says, “You matter enough for me to get up.”', sc: ['home', ['A', 'walt'], { pose: { 0: 'sit', 1: 'wave' } }] },
      { s: '{A}’s mom brings a friend over to meet {Ahim}: “This is Ms. Grant.” {A} is sitting on the steps.', ask: 'What should {A} do?',
        ok: ['Stand up, shake hands if she offers, and say, “Nice to meet you, Ms. Grant.”'],
        near: [['Stay seated and say, “Hi.”', 'Stand when you are introduced.'], ['Stand up, but keep looking at {Ahis} phone.', 'Look at the person you are meeting.'], ['Nod and wait for her to leave.', 'Say hello and her name.']],
        why: 'Standing for an introduction puts you face to face for the greeting.', sc: ['street', ['A', 'nora', 'rosa:Mom'], { pose: { 1: 'shake' } }] },
      { s: 'At the school picnic, Ms. Park walks over to {A}’s table to talk to {Ahis} dad.', ask: 'What should {A} do?',
        ok: ['Stand up as she arrives, greet her, and sit again once the grown-ups are talking.'],
        near: [['Keep eating and wave a fork at her.', 'Standing to greet a teacher is a sign of respect.'], ['Stand up and stay standing the whole time.', 'Once she is settled or invites you to sit, you can sit again.'], ['Leave the table so they can talk.', 'Greet her first; leaving right away can seem cold.']],
        why: 'Stand to greet, then sit again when it is natural.', sc: ['park', ['A', 'park', 'kofi:Dad']] }
    ],
    tf: [
      ['When a guest comes into the room, it is polite to stand up.', true, 'Standing shows the guest matters.'],
      ['You should stand up when you are introduced to someone.', true, 'It puts you face to face for the greeting.'],
      ['Waving from the couch is just as polite as standing up to greet a grandparent.', false, 'Getting up shows more respect.'],
      ['After standing to greet someone, you must stay standing until they leave.', false, 'Sit again once they are settled or invite you to.']
    ],
    why: [
      { custom: 'Young people stand up when an adult or a guest enters the room.', ok: 'Getting up takes a little effort, and that shows the person matters.', no: ['It helps you see whether they brought a gift.', 'It is good exercise.', 'It is a way to leave the room quickly.'], expl: 'Standing to greet is one of the oldest and simplest signs of respect.' }
    ],
    all: [
      { ask: 'When should {A} stand up to greet someone? Select all that apply.', okLabel: 'Stand up', noLabel: 'No need to stand',
        ok: ['When a guest comes into the living room.', 'When {Ahe} is introduced to a friend’s parent.', 'When {Ahis} grandmother arrives for dinner.', 'When a teacher comes over to talk to {Ahis} family.'],
        no: [['Every time a classmate walks past {Ahis} desk.', 'Standing to greet is for guests, adults and introductions, not every passerby.'], ['When a TV character enters a scene.', 'Only real people you are greeting.'], ['When {Ahis} little brother walks into the kitchen for a snack.', 'Family coming and going all day don’t need a standing greeting.']] }
    ]
  });


  // ================================================================ Unit 4: The Family Dinner Table
  function E() { return ML.etiquette; }
  var SET_FACTS = { // where each basic piece goes, in words
    fork: 'on the left of the plate', knife: 'on the right of the plate, blade facing the plate', spoon: 'on the right, outside the knife',
    glass: 'above the knife, at the upper right', napkin: 'on the left, beside the fork', 'dinner-plate': 'in the middle, in front of the chair'
  };
  T('growing.setting-table', {
    hint: 'Fork and left have four letters; knife, spoon and right have five. The glass sits above the knife.',
    custom: {
      piece: function (R, ctx, v) { // name the piece marked "?"
        var level = ctx.level === 3 && R.chance(0.5) ? 'informal' : 'basic', S = E().setting(level);
        var keys = S.pieces.filter(function (k) { return k !== 'charger'; }), ask = R.pick(keys.filter(function (k) { return level === 'basic' || /fork|knife|spoon|glass|bread|napkin/.test(k); }));
        var name = function (k) { return E().PIECES[k].name; };
        var wrongs = R.shuffle(keys.filter(function (k) { return k !== ask && name(k) !== name(ask); }).map(name));
        return {
          q: 'Look at the ' + (level === 'basic' ? 'place setting' : 'place setting for a meal with soup, salad, a main course and dessert') + '. <b>Which piece is marked with the “?”</b>',
          a: mcOf(name(ask), wrongs.slice(0, ctx.level === 1 ? 2 : 3)),
          steps: ['The piece marked “?” is the ' + name(ask) + '.', level === 'basic' ? 'In a basic setting, the ' + name(ask) + ' goes ' + SET_FACTS[ask] + '.' : 'Utensils are set in the order you use them, from the outside in; forks on the left, knives and spoons on the right, dessert pieces above the plate, the bread plate at the upper left and drinks at the upper right.'],
          viz: { name: 'et-setting', opts: { level: level, ask: ask, quiet: true, interactive: false } },
          _ask: ask
        };
      },
      wrong: function (R, ctx, v) { // what is wrong with this setting?
        var M = R.pick(['fork-right', 'blade-out', 'glass-left']);
        var D = { 'fork-right': 'The fork and the knife have traded sides.', 'blade-out': 'The knife blade faces away from the plate.', 'glass-left': 'The bread plate and the glasses have traded sides.' };
        var right = D[M], wr = Object.keys(D).filter(function (k) { return k !== M; }).map(function (k) { return D[k]; }).concat(['The napkin should be on the plate.']);
        return {
          q: '{A} set this place for dinner, but one thing is set the wrong way. <b>What is wrong?</b>'.replace('{A}', v.A),
          a: mcOf(right, R.shuffle(wr).slice(0, ctx.level === 1 ? 2 : 3)),
          steps: [right, M === 'fork-right' ? 'Forks go on the left; knives and spoons on the right.' : M === 'blade-out' ? 'The knife’s blade should face the plate, so nobody reaches past a sharp edge.' : 'Drinks go at the upper right, above the knife. The bread plate, if there is one, goes at the upper left.', 'At a family dinner, a napkin on the left, beside the fork, is the usual place.'],
          viz: { name: 'et-setting', opts: { level: M === 'glass-left' ? 'informal' : 'basic', mode: 'spot', mistake: M, quiet: true, interactive: false } },
          _mistake: M
        };
      },
      side: function (R, ctx, v) { // which side?
        var P = R.pick([['fork', 'On the left of the plate'], ['knife', 'On the right of the plate, blade facing the plate'], ['spoon', 'On the right, outside the knife'], ['glass', 'Above the knife, at the upper right'], ['napkin', 'On the left, beside the fork']]);
        var all = ['On the left of the plate', 'On the right of the plate, blade facing the plate', 'On the right, outside the knife', 'Above the knife, at the upper right', 'On the left, beside the fork', 'On the right of the plate, blade facing out', 'Above the fork, at the upper left'];
        var wr = all.filter(function (x) { return x !== P[1] && !(P[0] === 'fork' && x === 'On the left, beside the fork') && !(P[0] === 'napkin' && x === 'On the left of the plate'); });
        return { q: fill('{A} is setting the table for a family dinner. <b>Where does the ' + P[0] + ' go?</b>', v), a: mcOf(P[1], R.shuffle(wr).slice(0, ctx.level === 1 ? 2 : 3)), steps: ['The ' + P[0] + ' goes ' + SET_FACTS[P[0]] + '.', 'Fork and left have four letters; knife, spoon and right have five.'], _piece: P[0] };
      }
    },
    tf: [
      ['The fork goes on the left side of the plate.', true, 'Fork and left both have four letters.'],
      ['The knife blade should face away from the plate.', false, 'The blade faces the plate.'],
      ['The spoon goes to the right of the knife.', true, 'Knives and spoons go on the right, spoon on the outside.'],
      ['The drinking glass goes above the fork.', false, 'The glass goes above the knife, at the upper right.']
    ],
    why: [
      { custom: 'At a place setting, the knife’s blade faces the plate.', ok: 'Nobody has to reach past a sharp edge, and the knife is ready for the right hand.', no: ['It makes the table look bigger.', 'It keeps the knife from rolling off the table.', 'The blade would scratch the glass otherwise.'], expl: 'The setting follows the hands and keeps everyone safe and comfortable.' },
      { custom: 'Everyone sets the table the same way, with the glass at the upper right.', ok: 'Guests always know which glass is theirs: the one on their right.', no: ['It is easier to wash the dishes that way.', 'It looks more expensive.', 'Glasses on the left are bad luck.'], expl: 'A shared pattern puts guests at ease; nobody has to guess.' }
    ],
    order: [
      { title: 'Setting a place for a family dinner:', steps: ['Put the plate in front of the chair.', 'Put the fork on the left of the plate.', 'Put the knife on the right, blade facing the plate.', 'Put the spoon to the right of the knife.', 'Put the glass above the knife.', 'Put the napkin to the left of the fork.'] }
    ],
    levels: { 1: ['side', 'piece', 'tf'], 2: ['piece', 'wrong', 'side', 'why'], 3: ['piece', 'wrong', 'order'] }
  });

  T('growing.using-utensils', {
    hint: 'Cutting: fork left, knife right, one or two bites at a time. Both the American and Continental styles are correct.',
    items: [
      { s: '{A} is cutting a piece of chicken.', ask: 'Which is the best way to do it?',
        ok: ['Fork in the left hand, tines down; knife in the right, finger along the back; cut one bite at a time.'],
        near: [['Cut the whole piece into little bits first, then eat.', 'Cut one or two bites at a time; it keeps the food warm and the meal calm.'], ['Hold the knife in a fist like a dagger.', 'A finger along the back of the blade gives control.'], ['Hold the fork in the right hand and the knife in the left.', 'Most people cut with the knife in the right hand.']],
        rude: [['Pick up the whole piece and bite off a chunk.', 'Chicken on a plate with a knife and fork is cut, not bitten from the piece.']],
        why: 'That is the standard grip for cutting in the U.S., in both styles.', sc: ['table', ['A', 'rosa:Mom']] },
      { s: 'At dinner, {A} notices that a guest keeps the fork in the left hand, tines down, for the whole meal.', ask: 'What is true?',
        ok: ['That is the Continental style, and it is correct in the U.S.'],
        near: [['The guest is doing it wrong and should switch hands.', 'The Continental style is correct.'], ['Only the American style is polite in the U.S.', 'Both styles are polite in the U.S.'], ['{A} should show the guest the American way.', 'There is nothing to correct.']],
        why: 'Both the American and Continental styles are correct in the U.S.', sc: ['table', ['A', 'priya']] },
      { s: '{A} has just cut a bite and eats in the American style.', ask: 'What does {Ahe} do next?',
        ok: ['Set the knife on the edge of the plate and switch the fork to the right hand to eat.'],
        near: [['Keep the knife in the right hand and eat with the fork in the left.', 'That is the Continental style, which is also correct, but not the American style.'], ['Set the knife on the tablecloth.', 'A used knife rests on the plate, not the table.'], ['Eat the bite off the knife.', 'Food goes to your mouth on the fork.']],
        why: 'The American style switches the fork to the right hand after cutting; the knife rests on the plate.', sc: ['table', ['A', 'kofi:Dad']] }
    ],
    tf: [
      ['In the U.S., both the American and the Continental styles of using a fork and knife are correct.', true, 'Each is tidy and polite.'],
      ['It is best to cut all your food into pieces before you start eating.', false, 'Cut one or two bites at a time.'],
      ['When cutting, the fork is held in the left hand and the knife in the right.', true, 'That is true in both styles.'],
      ['In the Continental style, you switch the fork to your right hand after every cut.', false, 'In the Continental style the fork stays in the left hand.'],
      ['Holding the knife with your index finger along the back of the blade gives you control.', true, 'You cut gently instead of sawing hard.']
    ],
    why: [
      { custom: 'You cut one or two bites at a time instead of cutting up your whole plate at once.', ok: 'It keeps the food warm and the meal calm and tidy.', no: ['It makes the meal last longer so you get more food.', 'It is the only way the knife works.', 'It shows the cook you are hungry.'], expl: 'Small, quiet habits keep a shared meal pleasant.' }
    ],
    order: [
      { title: 'Cutting and eating in the American style:', steps: ['Hold the fork in your left hand, tines down.', 'Hold the knife in your right hand, finger along the back.', 'Cut one bite.', 'Set the knife on the top edge of the plate.', 'Switch the fork to your right hand and eat the bite.'] },
      { title: 'Cutting and eating in the Continental style:', steps: ['Hold the fork in your left hand, tines down.', 'Hold the knife in your right hand, finger along the back.', 'Cut one bite.', 'Lift the bite to your mouth with the fork still in your left hand.'] }
    ],
    all: [
      { ask: 'Which of these are polite ways to use a fork and knife? Select all that apply.',
        ok: ['Cutting one bite at a time.', 'Eating in the American style.', 'Eating in the Continental style.', 'Resting the knife on the edge of the plate.'],
        no: [['Holding the knife in a fist like a dagger.', 'Hold it with a finger along the back.'], ['Cutting the whole steak into pieces first.', 'Cut a bite or two at a time.'], ['Putting a used knife on the tablecloth.', 'Used utensils rest on the plate.'], ['Licking the knife.', 'Food goes to the mouth on the fork.']] }
    ],
    levels: { 1: ['items', 'tf', 'why'], 2: ['items', 'tf', 'order', 'all'], 3: ['order', 'all', 'items'] }
  });

  T('growing.passing-food', {
    hint: 'Dishes go to the right; salt and pepper travel together; a dish someone asked for goes straight to them.',
    items: [
      { s: '{B} asks {A}, “Could you please pass the salt?” {A} has the salt and the pepper.', ask: 'What should {A} do?',
        ok: ['Pass the salt and the pepper together.'],
        near: [['Pass only the salt, since that is what {B} asked for.', 'The salt and pepper travel as a pair so nobody hunts for the other.'], ['Salt {Ahis} own food first, then pass it.', '{B} asked first. Pass it straight to {Bhim}.'], ['Slide the salt across the table.', 'Hand it along; sliding can tip things over.']],
        rude: [['Toss the salt shaker to {B}.', 'Throwing at the table can spill or break something.']],
        why: 'Salt and pepper are passed together, straight to the person who asked.', sc: ['table', ['A', 'june', 'B'], { say: [[2, 'Could you please pass the salt?']] }] },
      { s: 'The bowl of {side} is in front of {A}, and everyone is ready to start.', ask: 'What should {A} do?',
        ok: ['Offer it to {Ahis} neighbor or hold it for them, serve {Aself} a fair share, then pass it to the right.'],
        near: [['Take a big helping and leave the bowl in front of {Ahim}.', 'Pass it on so it goes around the table.'], ['Pass it to the left this time.', 'Dishes go to the right so no two bowls collide.'], ['Wait for someone to ask for it.', 'Start it around; that is what a family-style meal needs.']],
        rude: [['Eat straight out of the serving bowl.', 'The serving dish is for everyone.']],
        why: 'Offer, take a fair share, and pass to the right, so the dish goes around smoothly.', sc: ['table', ['A', 'B', 'kofi:Dad']] },
      { s: 'At the far end of the table, Grandpa Walt asks for the rolls. {A} is holding the basket and wants a roll too.', ask: 'What should {A} do?',
        ok: ['Pass the basket toward Grandpa without taking one, and ask for it back afterward.'],
        near: [['Take a roll first, since the basket is right there.', 'Grandpa asked first; helping yourself on the way skips his turn.'], ['Keep the basket until {Ahe} finishes {Ahis} roll.', 'Pass it on right away.'], ['Tell Grandpa to come get it.', 'Pass it through the people in between.']],
        rude: [['Throw a roll down the table to him.', 'Throwing food at the table is not polite.']],
        why: 'A dish someone asked for goes straight to them; {A} can ask for it next.', sc: ['table', ['A', 'B', 'walt']] }
    ],
    tf: [
      ['At a family-style meal, dishes are usually passed to the right.', true, 'When everything goes the same way, nothing collides and nobody is skipped.'],
      ['If someone asks for the salt, you pass only the salt.', false, 'Salt and pepper travel together.'],
      ['It is fine to help yourself from a dish that was passed for someone else.', false, 'Pass it to the person who asked; ask for it afterward.'],
      ['Passing a bowl with the serving spoon turned toward the next person is thoughtful.', true, 'It is easier for them to take.']
    ],
    why: [
      { custom: 'The salt and pepper are passed together, even when someone asks for only one.', ok: 'Nobody has to hunt for the other one later.', no: ['They are too light to pass one at a time.', 'It is bad luck to separate them.', 'It shows you are stronger.'], expl: 'Small customs at the table exist to save other people trouble.' },
      { custom: 'At a family-style meal, everyone passes dishes in the same direction, to the right.', ok: 'Dishes don’t collide, and nobody gets skipped.', no: ['The right hand is stronger.', 'It makes the meal last longer.', 'It lets the host keep the best food.'], expl: 'A shared direction keeps passing calm and fair.' }
    ],
    all: [
      { ask: 'Which of these are polite ways to pass food? Select all that apply.',
        ok: ['Passing a dish to the right.', 'Passing the salt and pepper together.', 'Turning the serving spoon toward the next person.', 'Passing a dish straight to the person who asked for it.'],
        no: [['Taking a roll from the basket on its way to someone else.', 'Pass it first, then ask for it.'], ['Reaching across a neighbor to grab the bowl.', 'Ask for it to be passed.'], ['Sliding a hot dish along the table.', 'Hand it along carefully.'], ['Passing only the salt when asked for the salt.', 'Send the pepper too.']] }
    ],
    order: [
      { title: 'Starting a dish at a family-style dinner:', steps: ['Notice the dish in front of you.', 'Offer it to your neighbor first, or hold it for them.', 'Serve yourself a fair share with the serving spoon.', 'Pass the dish to the right.'] }
    ],
    spot: [
      { place: 'table', who: ['A', 'B', 'june'], lines: [[2, 'Could someone please pass the {side}?'], [1, 'Here you go, Grandma.'], [0, 'Can I have the salt, please?'], [1, 'Sure.'], [0, 'Thanks! Oh, I’ll just grab a roll from the basket on its way to Grandma.']], fault: 4, why: 'The basket was going to Grandma June, who asked first. {A} should pass it along and ask for it afterward.', fix: 'Grandma, could you send the rolls my way when you’re done?' }
    ]
  });

  T('growing.serving-yourself', {
    hint: 'Serving spoon, a fair share, spoon back in the dish, and wait until everyone is served.',
    custom: {
      share: function (R, ctx, v) { // a fair share
        var people = R.int(4, 8), per = R.pick([1, 2]), extra = R.int(1, 3), total = people * per + extra, item = R.pick([['enchiladas', 'enchilada'], ['tacos', 'taco'], ['rolls', 'roll'], ['chicken legs', 'chicken leg'], ['slices of pizza', 'slice of pizza'], ['meatballs', 'meatball']]);
        if (per === 2 && item[0] === 'slices of pizza') per = 1, total = people + extra;
        var nm = function (n) { return n + ' ' + (n === 1 ? item[1] : item[0]); };
        var wrongs = [nm(per + extra), nm(Math.max(per * 3, per + 2)), 'As many as ' + v.A + ' wants, since ' + v.Ahe + ' was served first'];
        return {
          q: fill('There are ' + total + ' ' + item[0] + ' for ' + people + ' people at dinner, and {A} gets the plate first. <b>What is a fair first helping for {A}?</b>', v),
          a: mcOf(nm(per), ctx.level === 1 ? wrongs.slice(1) : wrongs),
          steps: [total + ' ' + item[0] + ' for ' + people + ' people is ' + per + ' each, with ' + extra + ' left over (' + people + ' × ' + per + ' = ' + (people * per) + ').', 'A fair first helping is ' + nm(per) + '. The extras can go to seconds after everyone has been served.'],
          _share: [total, people, per]
        };
      }
    },
    items: [
      { s: 'The bowl of meatballs reaches {A}. The serving spoon is in the bowl.', ask: 'How should {A} take some?',
        ok: ['With the serving spoon, then put the spoon back in the bowl.'],
        near: [['Spear one with {Ahis} own fork.', 'Your own fork has been in your mouth; the serving spoon keeps the shared food clean.'], ['With the serving spoon, then set the spoon on {Ahis} own plate.', 'Put it back in the bowl for the next person.'], ['With {Ahis} fingers, since meatballs are small.', 'Use the serving spoon.']],
        rude: [['Eat one straight from the bowl.', 'The serving dish is for everyone.']],
        why: 'The serving spoon keeps the food clean, and leaving it in the dish helps the next person.', sc: ['table', ['A', 'B', 'rosa:Mom']] },
      { s: 'Everyone has food except Grandma June, who is still serving herself. {A} is hungry.', ask: 'What should {A} do?',
        ok: ['Wait until everyone is served and the host or cook begins.'],
        near: [['Start eating so the food doesn’t get cold.', 'Waiting means nobody eats alone while others still fill their plates.'], ['Take just a few bites while waiting.', 'Wait until everyone is served.'], ['Ask Grandma to hurry.', 'Waiting patiently is the courtesy.']],
        rude: [['Start eating and grab seconds.', 'Others haven’t had firsts yet.']],
        why: 'Waiting until everyone is served is the custom; at a family meal, follow the cook or host’s lead.', sc: ['table', ['A', 'june', 'B']] },
      { s: 'The {side} comes to {A}, and {Ahe} doesn’t like it.', ask: 'What is a polite response?',
        ok: ['Say, “No, thank you,” and pass it on, or take a small taste if that is the family’s custom.'],
        near: [['Say, “Ew, I hate that,” and pass it on.', 'Someone worked to make it; “No, thank you” is kinder.'], ['Take some and leave it untouched to look polite.', 'Taking food you won’t eat wastes it; a small taste or “No, thank you” is better.'], ['Ask why they made it.', 'It can hurt the cook’s feelings.']],
        why: '“No, thank you” is the polite way to skip a dish; some families ask for a small taste.', sc: ['table', ['A', 'kofi:Dad']] }
    ],
    tf: [
      ['You should use the serving spoon, not your own fork, to take food from a shared dish.', true, 'It keeps the shared food clean.'],
      ['The first person to get a dish may take as much as they like.', false, 'Take a fair share so there is enough for everyone.'],
      ['After serving yourself, put the serving spoon back in the dish.', true, 'It is ready for the next person.'],
      ['At a family meal, it is usual to wait until everyone has been served before eating.', true, 'Follow the host or cook’s lead.']
    ],
    why: [
      { custom: 'You use the serving spoon, not your own fork, to take food from a shared dish.', ok: 'Your own fork has been in your mouth, so the serving spoon keeps the shared food clean.', no: ['The serving spoon holds more food.', 'Forks scratch serving bowls.', 'It makes the dish look nicer.'], expl: 'Shared food stays clean for everyone.' },
      { custom: 'On the first pass, you take a fair share of each dish.', ok: 'The last person to get the dish should still have some.', no: ['Big helpings make the cook feel bad.', 'You can’t have seconds otherwise.', 'Small plates hold less.'], expl: 'A fair share is kindness to the people after you.' }
    ],
    all: [
      { ask: 'Which of these are polite ways to serve yourself? Select all that apply.',
        ok: ['Using the serving spoon.', 'Taking a fair share.', 'Putting the serving spoon back in the dish.', 'Saying “No, thank you” to a dish {Ahe} doesn’t want.'],
        no: [['Spearing food from the bowl with {Ahis} own fork.', 'Use the serving spoon.'], ['Taking half the dish because it is {Ahis} favorite.', 'Take a fair share first.'], ['Starting to eat while others are still being served.', 'Wait for everyone.'], ['Saying “Gross!” about a dish.', 'Say “No, thank you.”']] }
    ],
    levels: { 1: ['items', 'tf', 'share'], 2: ['items', 'share', 'why', 'all'], 3: ['all', 'share', 'items'] }
  });

  T('growing.reaching-elbows', {
    hint: 'Ask for what you can’t reach easily; elbows stay off while eating; phones, toys and hats stay away from the table.',
    items: [
      { s: 'The butter is in front of Grandpa Walt, two seats away from {A}.', ask: 'What should {A} do?',
        ok: ['Say, “Grandpa, could you please pass the butter?”'],
        near: [['Stand up and lean across the table to get it.', 'Reaching across people puts an arm over their plates and can knock over a glass.'], ['Stretch across {B}’s plate to reach it.', 'Ask instead of reaching over a neighbor.'], ['Go without butter rather than bother anyone.', 'Asking is not a bother; it takes two seconds.']],
        rude: [['Point and say, “Butter!”', 'Use “please” and say who you are asking.']],
        why: 'Asking is quick and polite, and it gives the other person a chance to help.', sc: ['table', ['A', 'B', 'walt']] },
      { s: '{A} is in the middle of eating {food} and leans on the table with both elbows.', ask: 'What is the polite fix?',
        ok: ['Keep elbows off the table while eating; wrists can rest at the table edge.'],
        near: [['Nothing; elbows are fine at any time.', 'While eating, elbows on the table crowd neighbors and lean you over your plate.'], ['Put one elbow up and leave the other down.', 'Keep both off while eating.'], ['Stand up to eat instead.', 'Sit back and upright.']],
        why: 'Elbows off while eating keeps you upright and gives neighbors room.', sc: ['table', ['A', 'rosa:Mom']] },
      { s: 'Dinner is finished, and the family is talking while they wait for dessert. {A} rests {Ahis} forearms on the table.', ask: 'What do most etiquette writers say about this?',
        ok: ['It is usually fine between courses or after the meal; some families prefer elbows off anyway.'],
        near: [['Elbows on the table are always rude, at every moment.', 'Most writers say elbows are fine between courses or after the meal.'], ['It is rude only on birthdays.', 'The custom is about eating, not special days.'], ['Elbows must be on the table when talking.', 'They may be, but they don’t have to be.']],
        why: 'The custom is about not leaning over your food while eating. Families differ, so follow the house custom.', sc: ['table', ['A', 'B', 'june']] },
      { s: '{A}’s phone buzzes during dinner. The family keeps phones away from the table.', ask: 'What should {A} do?',
        ok: ['Leave the phone where it is and check it after dinner.'],
        near: [['Check it under the table so nobody notices.', 'Everyone notices; it tells them the phone matters more.'], ['Answer it at the table, quietly.', 'The family custom is no phones at the table.'], ['Put it face up next to {Ahis} plate.', 'Keep it away from the table.']],
        rude: [['Read the message out loud and laugh.', 'It pulls everyone away from the meal.']],
        why: 'The people at the table come first; messages can wait until after the meal.', sc: ['table', ['A', 'kofi:Dad', 'B']] }
    ],
    tf: [
      ['If something is out of easy reach, it is polite to ask someone to pass it.', true, 'Reaching across people is awkward and can knock things over.'],
      ['Most etiquette writers say elbows are fine on the table between courses or after the meal.', true, 'The custom is about not leaning over your food while eating.'],
      ['It is fine to reach across a neighbor’s plate if you say “excuse me.”', false, 'Ask them to pass it instead.'],
      ['Phones and toys are best kept away from the family table.', true, 'The people at the table come first.']
    ],
    why: [
      { custom: 'At the table, you ask for things to be passed instead of reaching across people.', ok: 'Reaching puts your arm in front of others and can knock over a glass; asking takes two seconds.', no: ['It shows you are too tired to reach.', 'Reaching is against the rules of the table.', 'It makes the meal last longer.'], expl: 'Customs at the table exist to make the meal pleasant for everyone.' },
      { custom: 'Many families ask people to keep elbows off the table while eating.', ok: 'Elbows on the table while eating crowd your neighbors and lean you over your plate.', no: ['Elbows scratch the table.', 'It is a rule nobody knows the reason for.', 'It makes you look taller.'], expl: 'Most writers say elbows are fine between courses; the custom is about eating.' }
    ],
    all: [
      { ask: 'At a family dinner, which of these are polite? Select all that apply.',
        ok: ['Asking, “Could you please pass the {side}?”', 'Keeping elbows off the table while eating.', 'Leaving {Ahis} phone in another room.', 'Taking {Ahis} cap off at the table.'],
        no: [['Leaning across a neighbor to grab the bread.', 'Ask for it to be passed.'], ['Playing a game on {Ahis} phone under the table.', 'The people at the table come first.'], ['Building a tower of toys next to {Ahis} plate.', 'Toys stay away from the table.'], ['Standing up to reach the far end of the table.', 'Ask instead.']] }
    ]
  });

  T('growing.table-mishaps', {
    hint: 'Quiet and quick: a short “excuse me,” a clean fork, and carry on.',
    items: [
      { s: '{A} drops {Ahis} fork on the floor at home during dinner.', ask: 'What should {A} do?',
        ok: ['Pick it up, take it to the kitchen, and get a clean one.'],
        near: [['Wipe it on {Ahis} napkin and keep using it.', 'A fork that touched the floor is dirty; get a clean one.'], ['Leave it on the floor until after dinner.', 'At home, pick it up so nobody steps on it.'], ['Eat with {Ahis} fingers instead.', 'Get a clean fork.']],
        rude: [['Shout, “Oops! Everybody look!”', 'Making a fuss turns a small thing into a big one.']],
        why: 'At home, picking it up and getting a clean one is quick and quiet.', sc: ['table', ['A', 'kofi:Dad']] },
      { s: '{A} drops {Ahis} fork on the floor at a restaurant.', ask: 'What should {A} do?',
        ok: ['Leave it, and quietly ask the server for another one.'],
        near: [['Crawl under the table to find it.', 'At a restaurant, the staff will pick it up; just ask for a new one.'], ['Wipe it off and keep using it.', 'It is dirty now.'], ['Go into the kitchen to get a new one.', 'Ask the server.']],
        rude: [['Wave both arms and call, “Hey! I need a fork!”', 'A quiet word to the server is enough.']],
        why: 'At a restaurant, the server brings a new one; asking quietly keeps the meal calm.', sc: ['restaurant', ['A', 'rosa:Mom']] },
      { s: '{A} bumps {Ahis} glass, and a little water spills on the table.', ask: 'What should {A} do?',
        ok: ['Say “Excuse me,” set the glass upright, and blot the spill with {Ahis} napkin.'],
        near: [['Pretend it didn’t happen.', 'Clean it up; a short “excuse me” is enough.'], ['Apologize over and over for the rest of the meal.', 'One “excuse me” is plenty. Then carry on.'], ['Leave the table in embarrassment.', 'A small spill is no big deal.']],
        rude: [['Blame {B} for bumping {Ahim}.', 'Own it calmly.']],
        why: 'Quiet and quick is the rule: a short apology, a quick clean-up, and back to dinner.', sc: ['table', ['A', 'B']] },
      { s: 'Grandma June drops her spoon on the floor.', ask: 'What is the kindest thing {A} can do?',
        ok: ['Quietly offer, “I’ll get you a clean one, Grandma.”'],
        near: [['Laugh and point it out to everyone.', 'Pointing out someone’s slip embarrasses them.'], ['Say, “You dropped your spoon!” loudly.', 'She knows; help quietly instead.'], ['Hand her the spoon from the floor.', 'Get her a clean one.']],
        why: 'Helping quietly is kind and keeps the meal pleasant.', sc: ['table', ['A', 'june']] }
    ],
    tf: [
      ['At a restaurant, if you drop a fork, you should leave it and ask the server for another.', true, 'The staff will pick it up.'],
      ['Wiping a dropped fork on your napkin makes it clean enough to use.', false, 'Get a clean one.'],
      ['After a small spill, a short “excuse me” and a quick wipe is enough.', true, 'Then carry on with the meal.'],
      ['If someone else spills, the polite thing is to point it out so they notice.', false, 'Help quietly instead.']
    ],
    why: [
      { custom: 'When you drop a fork or spill a little, you handle it quietly and quickly.', ok: 'A mishap is only a big deal if someone makes it one; quiet keeps the meal pleasant.', no: ['So nobody finds out who did it.', 'Loud apologies are against the rules.', 'So you don’t have to clean it up.'], expl: 'Calm, quick handling saves everyone embarrassment.' }
    ],
    all: [
      { intro: 'Little things go wrong at dinner.', ask: 'Which of these are good ways to handle them? Select all that apply.', okLabel: 'Good ways', noLabel: 'Makes it worse',
        ok: ['Saying “Excuse me” and wiping up a small spill.', 'At a restaurant, asking the server for a new fork.', 'At home, getting a clean fork from the drawer.', 'Saying a quiet “excuse me” after a burp.'],
        no: [['Shouting “Oops!” and laughing loudly.', 'It turns a small thing into a big one.'], ['Using a fork that fell on the floor.', 'Get a clean one.'], ['Pointing out someone else’s spill.', 'Help quietly instead.'], ['Leaving the table without a word.', 'A short “excuse me” and a quick fix is enough.']] }
    ]
  });

  T('growing.thanking-cook', {
    hint: 'Thank the cook for the work, mention something specific, and offer to help clear.',
    items: [
      { s: '{A}’s dad made a new soup recipe. {A} didn’t love the soup, but the bread was great.', ask: 'What should {A} say?',
        ok: ['“Thanks for dinner, Dad. The bread was so good. Can I help clear?”'],
        near: [['Nothing, since {Ahe} didn’t like the soup.', 'Thanks are for the work, not only for food you loved.'], ['“The soup was weird, but thanks.”', 'Lead with something kind and true.'], ['“Can I go now?”', 'Thank the cook, then ask to be excused.']],
        rude: [['“Please never make that again.”', 'It hurts, and the cook worked hard.']],
        why: '{A} thanks Dad for the work, praises something true, and offers to help.', sc: ['table', ['A', 'kofi:Dad']] },
      { s: '{A} eats dinner at {B}’s house. {B}’s mom made {food}.', ask: 'What is the best thing for {A} to say at the end of the meal?',
        ok: ['“Thank you for dinner. The {food} was delicious. Can I help clear the plates?”'],
        near: [['“Thanks,” on the way out the door.', 'A specific thank-you at the table is warmer.'], ['“My mom makes it better.”', 'Comparing cooks hurts feelings.'], ['Nothing; {B} can thank {Bhis} own mom.', 'A guest should thank the cook.']],
        rude: [['“That’s it? I’m still hungry.”', 'It sounds ungrateful.']],
        why: 'A thank-you, a kind detail and an offer to help is a guest’s best way to end a meal.', sc: ['table', ['A', 'B', 'rosa']] },
      { s: '{A} has to get ready for practice before everyone else finishes eating.', ask: 'What should {A} do?',
        ok: ['Thank the cook and ask, “May I please be excused?”'],
        near: [['Leave quietly so nobody is interrupted.', 'Ask to be excused first.'], ['Say, “Gotta go!” and run off.', 'Thank the cook and ask to be excused.'], ['Wait silently until everyone is done, even if {Ahe} is late.', 'Asking to be excused is polite.']],
        why: 'Thanking the cook and asking to be excused lets the family know {A} isn’t leaving because of them.', sc: ['table', ['A', 'rosa:Mom', 'B']] }
    ],
    tf: [
      ['You should thank the cook only when you liked the food.', false, 'Thank them for the work, every time.'],
      ['Mentioning something specific, like “The bread was great,” makes a thank-you warmer.', true, 'It shows you noticed.'],
      ['Offering to help clear the table is a way to say thank you with actions.', true, 'It turns thanks into help.'],
      ['Before leaving the table early, it is polite to ask to be excused.', true, 'It tells the others you are not leaving because of them.']
    ],
    why: [
      { custom: 'At the end of a meal, you thank whoever cooked, even if it wasn’t your favorite dish.', ok: 'Someone spent time and care making the meal, and thanks show the work was noticed.', no: ['So they will make your favorite next time.', 'It is required before dessert.', 'So the cook doesn’t ask you to wash dishes.'], expl: 'Thanks are for the work and the care, not just for the taste.' }
    ],
    all: [
      { ask: 'Which of these are good ways to thank the cook? Select all that apply.', okLabel: 'Good ways',
        ok: ['“Thank you for dinner. The {food} was great.”', '“Thanks for making dinner. Can I help clear?”', '“Thank you! I loved the {side}.”', 'Carrying {Ahis} plate to the kitchen after saying thanks.'],
        no: [['“It was okay, I guess.”', 'Find something kind and true to say.'], ['“Thanks, but my friend’s mom makes it better.”', 'Comparing cooks hurts.'], ['Leaving without a word.', 'A thank-you shows the work was noticed.'], ['“Thanks,” without looking up from a phone.', 'Look at the cook when you thank them.']] }
    ],
    order: [
      { title: 'Finishing a family dinner well:', steps: ['Finish your food or set your fork down.', 'Thank the cook and mention something you enjoyed.', 'Offer to help clear the table.', 'Ask to be excused before you leave the table.'] }
    ]
  });


  // ================================================================ Unit 5: Phones, Calls and Texts
  // a text thread shown quietly with a choice of replies. th: { title, from, msgs: [text], ok, no: [[text, why]], why }
  function replyQ(R, ctx, th, v, hint) {
    var from = fill(th.from || '{B}', v);
    var msgs = th.msgs.map(function (m) { return typeof m === 'string' ? { from: from, text: fill(m, v) } : { me: !!m.me, from: m.from ? fill(m.from, v) : from, text: fill(m.text, v) }; });
    var no = R.shuffle(th.no.map(pair)).slice(0, ctx.level === 1 ? 2 : 3);
    var right = fill(R.pick(arr(th.ok)), v);
    return finish({
      q: fill(th.s || '{A} gets this message from ' + from + '.', v) + ' <b>' + fill(th.ask || 'Which reply is best?', v) + '</b>',
      a: mcOf(right, no.map(function (x) { return fill(x[0], v); })),
      steps: ['Best: ' + end(right), fill(th.why, v)].concat(no[0] && no[0][1] ? ['Not the best: <i>' + end(fill(no[0][0], v)) + '</i> ' + fill(no[0][1], v)] : []),
      viz: { name: 'et-text', opts: { kind: th.kind || 'text', title: fill(th.title || from, v), messages: msgs, quiet: true, interactive: false } }
    }, hint);
  }

  T('growing.phone-calls', {
    hint: 'Greet, say who you are, ask if it is a good time, say why you called, and say goodbye.',
    items: [
      { s: '{A} calls {B}’s house, and {B}’s mom answers.', ask: 'What should {A} say?',
        ok: ['“Hi, this is {A}, {B}’s friend. Is {B} there, please?”'],
        near: [['“Is {B} there?”', 'Say who you are first; she can’t see who is calling.'], ['“Hey, it’s me.”', '“Me” doesn’t tell her who is calling.'], ['“Put {B} on.”', 'Ask politely, with please.']],
        rude: [['Hang up because a parent answered.', 'It leaves her wondering who called.']],
        why: 'The caller says their name right away, then asks politely for the friend.', sc: ['home', ['A'], { pose: { 0: 'phone' }, holds: { 0: 'phone' } }] },
      { s: '{A} calls Coach Diaz to say {Ahe} will miss practice on {day}.', ask: 'Which opening is best?',
        ok: ['“Hi, Coach Diaz, this is {A} from the team. Is this a good time?”'],
        near: [['“I can’t come {day}.”', 'Greet him and say who is calling first.'], ['“Guess who this is!”', 'Guessing games waste his time; say your name.'], ['A long story about {Ahis} week before saying who {Ahe} is.', 'Name first, then a short, clear reason.']],
        rude: [['A text to a friend asking them to tell the coach.', 'Calling the coach yourself is the responsible way.']],
        why: 'Greet, name, “Is this a good time?”, then the reason: that is the shape of a good call.', sc: ['home', ['A'], { pose: { 0: 'phone' }, holds: { 0: 'phone' } }] },
      { s: '{A} wants to call {B} to ask about homework. It is 10:30 at night.', ask: 'What should {A} do?',
        ok: ['Wait until tomorrow, or check the class website or ask a family member instead.'],
        near: [['Call anyway; homework is important.', 'Late-night calls can wake a whole family.'], ['Call and hang up after one ring so {B} calls back.', 'It still wakes people, and it is confusing.'], ['Call {B}’s parents’ phone instead.', 'It is still too late.']],
        why: 'Calling at reasonable hours respects the other family; late at night is for emergencies.' },
      { s: '{A} called Grandma June, and they have finished talking.', ask: 'How should {A} end the call?',
        ok: ['“It was so good to talk to you, Grandma. Love you. Bye!” and then hang up.'],
        near: [['Hang up as soon as {Ahe} has said everything.', 'Say goodbye before you hang up.'], ['Say “Okay” and hand the phone to someone else without a word.', 'Say goodbye yourself first.'], ['Stay on the line silently until Grandma hangs up.', 'Say a clear goodbye.']],
        why: 'A warm goodbye before hanging up ends the call kindly.', sc: ['home', ['A'], { pose: { 0: 'phone' }, holds: { 0: 'phone' } }] }
    ],
    tf: [
      ['When you make a call, say who you are in your first sentence.', true, 'The other person can’t see you.'],
      ['Asking “Is this a good time?” is polite because the person may be busy.', true, 'It respects their day.'],
      ['Calling a friend’s house late at night is fine if the call is short.', false, 'Late calls can wake the whole family.'],
      ['It is polite to say goodbye before you hang up.', true, 'It ends the call clearly and kindly.']
    ],
    why: [
      { custom: 'When you make a phone call, you say who you are right away.', ok: 'The other person can’t see you, so your name saves them from guessing.', no: ['It proves the call is important.', 'Phones only work after you say your name.', 'It makes the call longer.'], expl: 'On the phone, your words do all the work.' },
      { custom: 'Callers often ask, “Is this a good time?”', ok: 'The person may be cooking, driving or about to leave, and the question respects their day.', no: ['It is a way to get them to talk longer.', 'It checks whether the phone works.', 'It is only for business calls.'], expl: 'A good call fits into the other person’s day.' }
    ],
    order: [
      { title: 'Calling a friend’s house:', steps: ['Say hello when someone answers.', 'Say who you are.', 'Ask for your friend, with please.', 'Ask your friend if it is a good time.', 'Say why you called.', 'Say goodbye before you hang up.'] },
      { title: 'Leaving a voicemail:', steps: ['Say your name.', 'Say why you are calling.', 'Say your phone number slowly.', 'Say thank you and goodbye.'] }
    ],
    all: [
      { ask: 'Which of these are good phone-call manners? Select all that apply.', okLabel: 'Good manners',
        ok: ['Saying {Ahis} name at the start.', 'Asking, “Is this a good time?”', 'Saying goodbye before hanging up.', 'Calling at a reasonable hour.'],
        no: [['Calling during a family’s dinner hour.', 'Try another time.'], ['Starting with “Guess who!”', 'Say your name.'], ['Hanging up without a goodbye.', 'Say goodbye first.'], ['Calling late at night about something that can wait.', 'Save it for the morning.']] }
    ],
    levels: { 1: ['items', 'tf', 'why'], 2: ['items', 'order', 'tf', 'all'], 3: ['order', 'all', 'items'] }
  });

  var MSG_PARTS = ['to', 'from', 'number', 'message', 'time', 'taker'];
  T('growing.answering-messages', {
    hint: 'Greet the caller, ask who is calling, and write down the name, number and message.',
    custom: {
      missing: function (R, ctx, v) { // which part of the message slip is missing?
        var who = R.pick(['Mom', 'Dad', 'Grandma']), from = R.pick(['Ms. Park', 'Dr. Bell’s office', 'Coach Diaz', 'Mr. Reed', 'Aunt Rosa']);
        var msg = R.pick(['Please call back about Saturday.', 'The meeting moved to Thursday at 6:00.', 'Your order is ready to pick up.', 'Practice is canceled tomorrow because of rain.']);
        var parts = { to: who, from: from, number: '555-01' + R.int(10, 99), message: msg, time: R.pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday']) + ', ' + R.int(1, 8) + ':' + R.pick(['00', '15', '30', '45']) + ' p.m.', taker: v.A };
        var omit = R.pick(ctx.level === 1 ? ['from', 'number', 'message'] : MSG_PARTS);
        var PN = E().PART_NAMES, name = function (p) { return PN[p]; };
        var wr = R.shuffle(MSG_PARTS.filter(function (p) { return p !== omit; })).slice(0, ctx.level === 1 ? 2 : 3).map(name);
        return {
          q: fill('{A} took this phone message, but one part is missing. <b>Which part is missing?</b>', v),
          a: mcOf(name(omit), wr),
          steps: ['Missing: ' + name(omit).toLowerCase() + ' (' + parts[omit] + ').', 'A complete message has who it is for, who called, the phone number, the message, the time and who took it, so the person can call back.'],
          viz: { name: 'et-note', opts: { kind: 'message', parts: parts, mode: 'missing', omit: omit, quiet: true, interactive: false } },
          _omit: omit
        };
      }
    },
    items: [
      { s: 'The family phone rings. {A} answers, and the caller asks for {Ahis} dad, who is in the yard.', ask: 'What should {A} say?',
        ok: ['“May I tell him who’s calling? Please hold on, I’ll get him.”'],
        near: [['“WHO IS THIS?”', 'Asking politely is kinder: “May I tell him who’s calling?”'], ['Shout “DAD! PHONE!” without covering the phone.', 'Set the phone down and go get him.'], ['“He’s busy,” and hang up.', 'Offer to get him or take a message.']],
        rude: [['Hang up without a word.', 'The caller is left confused.']],
        why: 'Asking who is calling, then going to get the person, is calm and polite.', sc: ['home', ['A'], { pose: { 0: 'phone' }, holds: { 0: 'phone' } }] },
      { s: 'Ms. Park calls for {A}’s mom, who isn’t home.', ask: 'What should {A} do?',
        ok: ['Offer to take a message, and write down her name, number and message right away.'],
        near: [['Tell her to call back later.', 'Offering to take a message is more helpful.'], ['Try to remember the message instead of writing it.', 'Memories slip; write it down.'], ['Say Mom will call back without getting the number.', 'Write down the number, and read it back.']],
        rude: [['“She’s not here. Bye.”', 'It leaves no way to pass on the message.']],
        why: 'A message is only helpful if it reaches the person, so write it down.', sc: ['home', ['A'], { pose: { 0: 'phone' }, holds: { 0: 'phone' } }] },
      { s: 'A caller {A} doesn’t know asks lots of questions about {Ahis} family.', ask: 'What is a good thing for {A} to do?',
        ok: ['Say, “Please hold on,” and get a grown-up.'],
        near: [['Answer all the questions so {Ahe} isn’t rude.', '{A} never has to answer questions that feel uncomfortable.'], ['Make up answers.', 'Getting a grown-up is simpler and kinder to everyone.'], ['Keep chatting to find out who it is.', 'Get a grown-up instead.']],
        why: 'It is always fine to get a grown-up when you are not sure about a call.' }
    ],
    tf: [
      ['When the call is for someone else, it is polite to ask, “May I tell them who’s calling?”', true, 'It is calm and lets the person decide whether to come to the phone.'],
      ['It is fine to shout across the house for the person the call is for.', false, 'Set the phone down and go get them.'],
      ['A phone message should include the caller’s name and number.', true, 'Then the person can call back.'],
      ['If you are not sure about a caller, it is fine to get a grown-up.', true, 'You never have to answer questions that make you uncomfortable.']
    ],
    why: [
      { custom: 'When you take a phone message, you write it down right away and read the number back.', ok: 'Memories slip, and a message is only helpful if it reaches the person correctly.', no: ['It proves you were listening.', 'Callers like to hear their number.', 'It makes the call last longer.'], expl: 'A lost message can mean a missed appointment or a friend left waiting.' }
    ],
    order: [
      { title: 'Taking a message for Mom:', steps: ['Answer with a greeting.', 'Ask who is calling.', 'Say Mom can’t come to the phone and offer to take a message.', 'Write down the name, number and message.', 'Read the number back to check it.', 'Put the message where Mom will see it.'] }
    ],
    levels: { 1: ['items', 'tf', 'missing'], 2: ['missing', 'items', 'order', 'why'], 3: ['order', 'missing', 'items'] }
  });

  T('growing.video-calls', {
    hint: 'Quiet spot, light on your face, look at the camera, mute when you aren’t talking, and pay attention.',
    items: [
      { s: '{A} has a class on video, and {Ahis} little brother is playing loudly nearby.', ask: 'What should {A} do?',
        ok: ['Move to a quieter spot or close the door, and mute until {Ahe} needs to talk.'],
        near: [['Leave the microphone on and talk louder.', 'Everyone hears the noise; mute instead.'], ['Turn the camera off for the whole class.', 'Find a quiet spot so {Ahe} can take part.'], ['Ask the teacher to wait while {Ahe} tells {Ahis} brother to be quiet.', 'Handle it on mute.']],
        rude: [['Yell at {Ahis} brother with the microphone on.', 'The whole class hears it.']],
        why: 'A quiet spot and the mute button keep the call easy for everyone to follow.', sc: ['home', ['A', 'B']] },
      { s: 'On a video call with Grandpa Walt, {A} looks like a dark shape on the screen.', ask: 'What is the most likely fix?',
        ok: ['Face the window or a lamp, so the light is in front of {Ahim}, not behind.'],
        near: [['Move closer to the window behind {Ahim}.', 'Light behind you makes your face dark.'], ['Turn off all the lights.', 'That makes it darker.'], ['Hold the screen up higher.', 'The problem is the light, not the height.']],
        why: 'Cameras need light on your face; a bright window behind you turns you into a shadow.' },
      { s: 'During a club meeting on video, {A} is hungry.', ask: 'What is the best choice?',
        ok: ['Wait to eat until after the call, or mute and turn the camera off for a moment.'],
        near: [['Eat chips with the microphone on.', 'Every crunch goes to everyone.'], ['Eat right in front of the camera while someone presents.', 'It distracts people from the speaker.'], ['Walk to the kitchen with the camera on.', 'A bouncing camera is distracting.']],
        why: 'Treat a video call like sitting across a table: keep noise and motion down.' },
      { s: 'The teacher calls on {A} during a video class.', ask: 'What should {A} do?',
        ok: ['Unmute, look at the camera, and answer clearly.'],
        near: [['Answer while still muted.', 'Nobody can hear {Ahim}; unmute first.'], ['Look at {Ahis} own picture while talking.', 'Looking at the camera is how you look at people on a screen.'], ['Type the answer in the chat instead.', 'When called on, answer out loud unless the teacher asks for chat.']],
        why: 'Unmuting and looking at the camera is the video-call version of looking up and speaking.' }
    ],
    tf: [
      ['On a video call, a window behind you makes your face look dark.', true, 'Face the light instead.'],
      ['It is polite to mute your microphone when you aren’t talking.', true, 'It keeps background noise out of the call.'],
      ['Walking around the house with the camera on is fine on a video call.', false, 'Sit still somewhere, as you would at a table.'],
      ['Looking at the camera when you talk helps people feel you are looking at them.', true, 'It is how you make eye contact on a screen.']
    ],
    why: [
      { custom: 'On video calls, people mute their microphones when they are not talking.', ok: 'An open microphone sends every noise to everyone and makes it hard to follow the speaker.', no: ['It saves the battery.', 'It hides what you are doing.', 'Microphones break if they are left on.'], expl: 'Treat a video call like sitting across a table from someone.' }
    ],
    order: [
      { title: 'Getting ready for a video class:', steps: ['Find a quiet spot.', 'Sit facing a window or lamp.', 'Set the device steady at eye level.', 'Join on time and say hello.', 'Mute until you need to talk.'] }
    ],
    all: [
      { ask: 'Which of these are good video-call manners? Select all that apply.', okLabel: 'Good manners', noLabel: 'Not so good',
        ok: ['Muting while others talk.', 'Sitting with light on {Ahis} face.', 'Looking at the camera when talking.', 'Joining on time.'],
        no: [['Eating chips with the microphone on.', 'Every crunch goes to everyone.'], ['Walking around with the camera bouncing.', 'Sit still.'], ['Playing a game in another window.', 'Give the call your attention.'], ['Sitting with a bright window behind {Ahim}.', 'Face the light.']] }
    ]
  });

  T('growing.texting', {
    hint: 'Reasonable hours, clear words, a friendly tone, and a read-through before you send.',
    custom: {
      reply: function (R, ctx, v) {
        return replyQ(R, ctx, R.pick([
          { from: 'Aunt Rosa', msgs: ['Did the package arrive? 📦'], ok: 'Yes! Thank you so much for the {gift}. I love it!', no: [['k', 'A one-letter answer can read as cold.'], ['YES IT CAME', 'All capital letters read like shouting, and there is no thank-you.'], ['ya', 'It skips the thank-you she is hoping for.']], why: 'Warm, specific and quick: it names the gift and says thank you.' },
          { msgs: ['Want to come over Saturday?'], s: '{B} texts {A}, who can’t come on Saturday.', ok: 'Thanks for asking! I have a game Saturday. Could we do Sunday?', no: [['No.', '“No” alone can sound like {A} doesn’t want to see {B}.'], ['no way', 'It sounds like {A} hates the idea.'], ['…', 'Dots alone are confusing.']], why: 'A thank-you, a reason and another idea keep the “no” friendly.' },
          { msgs: ['Can you send me the {subject} homework?'], ok: 'Sure! It’s page 42, problems 1 to 10. 😊', no: [['k', 'It doesn’t answer the question and can sound annoyed.'], ['figure it out', 'It is unkind.'], ['WHY DIDN’T YOU WRITE IT DOWN', 'All capitals read like shouting.']], why: 'A clear, friendly answer is exactly what {B} needs.' },
          { msgs: ['I made the team!!! 🎉'], ok: 'That’s amazing! Congratulations! 🎉', no: [['ok', 'It sounds unexcited about big news.'], ['I didn’t try out.', 'It turns the news to {A}.'], ['k', 'One letter can read as cold.']], why: 'Matching a friend’s excitement shows you are happy for them.' }
        ]), v, 'Read the reply in a grumpy voice. Does it still sound kind?');
      }
    },
    items: [
      { s: 'At 10:45 p.m., {A} remembers something funny to tell {B}.', ask: 'What should {A} do?',
        ok: ['Wait until morning to send it.'],
        near: [['Send it now; {B} can read it later.', 'The buzz can wake {B} or {Bhis} family.'], ['Send it now, but in all capital letters so it stands out.', 'Capitals read like shouting, and it is still late.'], ['Send ten messages so {B} doesn’t miss it.', 'Many buzzes late at night are worse.']],
        why: 'Texting at reasonable hours respects the fact that a buzz can wake someone up.' },
      { s: '{A} typed a reply to {B}: “whatever.” {A} only meant “either is fine.”', ask: 'What should {A} do before sending?',
        ok: ['Read it again and change it to “Either one is fine with me!”'],
        near: [['Send it; {B} will know what {Ahe} meant.', 'Tone is hard to hear in text; it may read as annoyed.'], ['Add “lol” and send it.', 'It can still read as careless.'], ['Send it in capital letters.', 'Capitals read like shouting.']],
        why: 'In text, the same words can sound cold. A friendly word or two prevents hurt feelings.' },
      { s: '{B} sends {A} a long, excited message about {Bhis} new {pet}.', ask: 'Which reply is kindest?',
        ok: ['“That’s so exciting! What’s its name?”'],
        near: [['“k”', 'One letter can read as bored.'], ['“cool”', 'Better than nothing, but a question shows real interest.'], ['A thumbs-up and nothing else.', 'A few words show {A} read it.']],
        rude: [['No reply at all for a week.', 'A quick, friendly reply shows {A} cares.']],
        why: 'A warm reply with a question shows {A} read the message and cares.' }
    ],
    tf: [
      ['A one-letter reply like “k” can sound annoyed, even if you didn’t mean it.', true, 'Tone is hard to hear in text.'],
      ['Writing a text in ALL CAPITAL LETTERS can read like shouting.', true, 'Use normal letters.'],
      ['Late at night is a good time to text, because people aren’t busy.', false, 'A buzz can wake someone up.'],
      ['Reading your message before you send it can catch words that might hurt.', true, 'A quick read-through is worth it.']
    ],
    why: [
      { custom: 'Many people add a friendly word or an emoji to short texts.', ok: 'Text has no voice or smile, so a friendly word shows the tone you mean.', no: ['Longer texts cost less.', 'It makes the message harder to read.', 'Phones require it.'], expl: 'In person, your face shows when you are joking; in text, words have to do it.' }
    ],
    all: [
      { ask: 'Which of these are good texting habits? Select all that apply.', okLabel: 'Good habits', noLabel: 'Not so good',
        ok: ['Reading a message before sending it.', 'Texting at reasonable hours.', 'Adding a friendly word to a short reply.', 'Answering a question clearly.'],
        no: [['Sending “k” to a long, excited message.', 'It can read as cold.'], ['Texting a friend at midnight about nothing urgent.', 'Wait until morning.'], ['Writing in all capital letters.', 'It reads like shouting.'], ['Sending ten messages in a row when a friend doesn’t answer right away.', 'Give them time.']] }
    ],
    levels: { 1: ['reply', 'items', 'tf'], 2: ['reply', 'items', 'why', 'all'], 3: ['reply', 'all', 'items'] }
  });

  T('growing.group-chats', {
    hint: 'Stay on topic, keep private messages private, and never use a chat to leave someone out or gang up.',
    custom: {
      unkind: function (R, ctx, v) { // which message in the group chat is unkind?
        var G = R.pick([
          { title: '{sport} team', msgs: [['{A}', 'Practice moved to 5 tomorrow!'], ['{B}', 'Thanks for the heads-up 👍'], ['{C}', 'Lol {D} kicks like a baby'], ['{D}', 'Can someone give me a ride?']], bad: 2, why: 'Teasing someone in front of the whole group hurts more, and the message can be copied and shared.' },
          { title: '{subject} project', msgs: [['{A}', 'I can make the poster.'], ['{B}', 'I’ll write the facts part.'], ['{C}', 'Let’s not tell {D} when we meet. {D}’s annoying.'], ['{D}', 'What can I do?']], bad: 2, why: 'Planning to leave someone out, in a chat they can read or not, is unkind. {D} is part of the group.' },
          { title: 'Birthday party', msgs: [['{A}', 'Thanks for coming, everyone!'], ['{B}', 'It was so fun 🎉'], ['{C}', 'Here’s a screenshot of what {D} texted me last night 😂'], ['{D}', 'Thanks for having us!']], bad: 2, why: 'Sharing a private message without asking breaks trust, even if it seems funny.' }
        ]);
        var names = R.sample(['Mia', 'Leo', 'Sam', 'Ruby', 'Omar', 'Hana'], 4), w = { A: names[0], B: names[1], C: names[2], D: names[3], sport: v.sport, subject: v.subject };
        var f = function (s) { return fill(s, w); };
        var msgs = G.msgs.map(function (m) { return { from: f(m[0]), text: f(m[1]) }; });
        var ch = msgs.map(function (m) { return m.from + ': “' + m.text + '”'; });
        var right = ch[G.bad], wr = ch.filter(function (c, i) { return i !== G.bad; });
        return {
          q: 'Here is a group chat. <b>Which message is unkind?</b>',
          a: mcOf(right, ctx.level === 1 ? wr.slice(0, 2) : wr),
          steps: ['Unkind: ' + right, f(G.why)],
          viz: { name: 'et-text', opts: { kind: 'group', title: cap(f(G.title)), messages: msgs, quiet: true, interactive: false } },
          _bad: right
        };
      }
    },
    items: [
      { s: '{B} sent {A} a private message about being nervous for tryouts. {C} says, “Screenshot it to the group, it’s funny.”', ask: 'What should {A} do?',
        ok: ['Say no: “Nah, that was just to me.”'],
        near: [['Share it, since {B} already sent the words.', 'The message was meant only for {A}; sharing breaks {B}’s trust.'], ['Share it but crop out {B}’s name.', 'People can still tell, and it was still private.'], ['Ask the group to vote on it.', 'It isn’t the group’s to decide; it is {B}’s.']],
        why: 'Private messages stay private unless the sender says it is okay.' },
      { s: '{A} notices classmates made a new chat called “Everyone but {B}.”', ask: 'What is the best thing for {A} to do?',
        ok: ['Not join in, say “This isn’t cool” or leave, and tell a trusted grown-up if it keeps going.'],
        near: [['Stay in and read along without saying anything.', 'Reading along quietly still keeps the chat going; speak up or leave.'], ['Add a joke so {Ahe} fits in.', 'Joining in makes it worse.'], ['Tell {B} every message, word for word.', 'Being kind to {B} helps; spreading the hurtful words doesn’t.']],
        why: 'A chat made to leave someone out is a modern kind of whispering. Not joining in and getting help are the right moves.' },
      { s: 'The class group chat is for the {subject} project. {A} wants to share a funny video.', ask: 'What is the best choice?',
        ok: ['Send the video to friends who want it, and keep the project chat on topic.'],
        near: [['Post it in the project chat; everyone can just scroll past.', 'Off-topic posts bury the project messages people need.'], ['Post twenty stickers so people notice.', 'Flooding a chat annoys everyone.'], ['Post it at midnight so it won’t interrupt.', 'Late-night buzzes wake people.']],
        why: 'Staying on topic keeps a group chat useful for everyone in it.' }
    ],
    tf: [
      ['It is fine to share a screenshot of a friend’s private message if it is funny.', false, 'Ask first; sharing breaks trust.'],
      ['Making a group chat to leave someone out is unkind.', true, 'It is a way of talking behind their back.'],
      ['If a group chat turns mean and keeps going, telling a trusted grown-up is a good idea.', true, 'Getting help is the right move.'],
      ['Teasing someone in a group chat hurts more than teasing in private.', true, 'Everyone sees it, and it can be copied.']
    ],
    why: [
      { custom: 'You ask before sharing a screenshot of someone’s message.', ok: 'The message was meant for you, and sharing it without asking breaks their trust.', no: ['Screenshots take up space on phones.', 'The picture might be blurry.', 'Teachers can see screenshots.'], expl: 'Words sent to one person belong to that conversation.' }
    ],
    all: [
      { ask: 'Which of these are good group-chat manners? Select all that apply.', okLabel: 'Good manners',
        ok: ['Keeping the team chat about the team.', 'Asking before sharing someone’s message.', 'Leaving a chat that is being mean to someone.', 'Saying, “Let’s add {B} too.”'],
        no: [['Posting a screenshot of a private message.', 'Ask first.'], ['Making a chat to talk about someone who isn’t in it.', 'It is a way of leaving someone out.'], ['Flooding the chat with stickers late at night.', 'It buzzes everyone.'], ['Laughing along at a mean joke about a classmate.', 'Don’t join in.']] }
    ],
    levels: { 1: ['items', 'tf', 'unkind'], 2: ['unkind', 'items', 'why', 'all'], 3: ['all', 'unkind', 'items'] }
  });

  T('growing.phones-around-people', {
    hint: 'When people are in front of you, the phone goes down.',
    items: [
      { s: 'Grandma June asks {A} about {Ahis} science project while {A} is looking at {Ahis} phone.', ask: 'What should {A} do?',
        ok: ['Put the phone face down and answer her.'],
        near: [['Keep scrolling and say, “Uh-huh, it’s good.”', 'Grandma can tell the phone has {A}’s attention.'], ['Answer while texting under the table.', 'Everyone notices texting under the table.'], ['Hold up a finger and finish the video first.', 'The person in front of you comes first.']],
        rude: [['Put in earbuds.', 'It shuts Grandma out.']],
        why: 'Putting the phone down shows Grandma she matters more than the screen.', sc: ['table', ['A', 'june'], { holds: { 0: 'phone' } }] },
      { s: '{A} is at dinner at {B}’s house. {A}’s mom said she would text about pickup time.', ask: 'What is the best plan?',
        ok: ['Keep the phone on silent; if it buzzes, say “Excuse me, that’s my mom about pickup,” check quickly, and put it away.'],
        near: [['Keep the phone on the table and check it every few minutes.', 'Checking again and again tells the family the phone matters more.'], ['Ignore the phone all night, even if Mom texts.', 'A quick check for an important message is fine if you say why.'], ['Text Mom back and forth through dinner.', 'Check briefly, then rejoin the meal.']],
        why: 'Saying why you need to look, and keeping it quick, keeps the people at the table first.', sc: ['table', ['A', 'B', 'kofi']] },
      { s: '{A} and {B} are hanging out, and {B} keeps scrolling while {A} talks.', ask: 'What could {A} say, kindly?',
        ok: ['“Hey, want to put the phones away and play {game}?”'],
        near: [['“You’re so rude!”', 'A light suggestion works better than a label.'], ['Nothing; {A} starts scrolling too.', 'Then nobody is hanging out.'], ['Grab the phone out of {B}’s hand.', 'Taking someone’s things is not okay.']],
        why: 'A light, friendly suggestion invites {B} back without making {Bhim} feel bad.', sc: ['home', ['A', 'B'], { holds: { 1: 'phone' } }] }
    ],
    tf: [
      ['Texting under the table is fine because no one can see it.', false, 'Everyone notices.'],
      ['When someone is talking to you, putting your phone down shows they matter.', true, 'It is one of the simplest ways to show respect.'],
      ['If you must check an important message, saying why first is polite.', true, '“Excuse me, that’s my mom about pickup.”'],
      ['Families all have the same rules about phones at meals.', false, 'Rules differ; at someone else’s home, follow theirs.']
    ],
    why: [
      { custom: 'People put their phones away during meals and conversations.', ok: 'Looking at a phone while someone talks tells them the screen is more interesting than they are.', no: ['Phones get dirty at the table.', 'It saves battery.', 'Phones are not allowed in houses.'], expl: 'The people in front of you come first.' }
    ],
    all: [
      { intro: '{A} is visiting {Ahis} grandparents.', ask: 'Which of these are polite? Select all that apply.',
        ok: ['Leaving {Ahis} phone in {Ahis} bag during dinner.', 'Putting the phone face down when Grandpa talks.', 'Saying, “Excuse me, I need to answer Mom,” before checking it.', 'Showing Grandma a photo when she asks to see it.'],
        no: [['Watching videos while Grandpa tells a story.', 'It tells him the video matters more.'], ['Texting under the table at dinner.', 'Everyone notices.'], ['Wearing earbuds during the visit.', 'It shuts people out.'], ['Answering “uh-huh” without looking up.', 'Look up and answer.']] }
    ]
  });


  // ================================================================ Unit 6: Guests, Parties and Gifts
  T('growing.friends-over', {
    hint: 'The guest’s good time is the host’s job: greet, offer, give choices, include everyone.',
    items: [
      { s: '{B} and {Bhis} dad arrive at {A}’s door.', ask: 'What should {A} do first?',
        ok: ['Greet them both: “Hi, {B}! Hi, Mr. Mensah! Come on in.”'],
        near: [['Run off to get {Ahis} new game without saying hello.', '{B}’s dad is left at the door; greet the parent too.'], ['Wave and go back to {Ahis} show.', '{B} came to see {A}.'], ['Ask {B}, “What did you bring me?”', 'A guest isn’t expected to bring anything; greet them.']],
        rude: [['Let {B} in and close the door on {Bhis} dad.', 'Greet and say goodbye to the parent.']],
        why: 'A good host greets the guest and the parent who brought them.', sc: ['door', ['A', 'B', 'kofi'], { pose: { 0: 'wave' } }] },
      { s: '{B} is visiting. {A} wants to play {Ahis} favorite video game, but {B} isn’t into video games.', ask: 'What should {A} do?',
        ok: ['Offer a few choices, like baking, a puzzle or playing outside, and go with {B}’s pick.'],
        near: [['Play the video game; {B} can watch.', 'The host puts the guest’s fun first.'], ['Ask {B} to pick, then argue for the video game.', 'If you offer a choice, go with it.'], ['Play the game for “just one more hour.”', '{B} came to spend time with {A}.']],
        why: 'Offering choices puts the guest’s fun first, which is the host’s job.', sc: ['home', ['A', 'B']] },
      { s: '{B} and {C} are both at {A}’s house. {B} and {A} start a game that only works for two.', ask: 'What is the best thing for {A} to do?',
        ok: ['Switch to something all three can do together.'],
        near: [['Tell {C} to wait until they finish.', '{C} would spend the visit feeling left out.'], ['Let {C} watch TV alone.', 'A host includes every guest.'], ['Take turns, with {C} going last every time.', 'Find a game for all three.']],
        why: 'Including everyone means nobody spends the visit feeling left out.', sc: ['home', ['A', 'B', 'C'], { mood: { 2: 'sad' } }] },
      { s: '{B} has been at {A}’s house for an hour.', ask: 'Which is the kind host thing to do?',
        ok: ['Ask, “Want a snack or something to drink?”'],
        near: [['Eat a snack in front of {B} without offering any.', 'A host offers first.'], ['Wait for {B} to ask for food.', 'Guests often feel shy about asking.'], ['Tell {B} where the kitchen is and let {Bhim} look around.', 'Offer, and get it together.']],
        why: 'Guests are often too shy to ask, so the host offers.', sc: ['kitchen', ['A', 'B']] }
    ],
    tf: [
      ['When you have a friend over, it is your job to make sure your guest has a good time.', true, 'That is what being a host means.'],
      ['A good host plays only the games the host likes best.', false, 'Offer choices and go with the guest’s pick.'],
      ['Including a brother, sister or second friend is part of being a good host.', true, 'Nobody should feel left out.'],
      ['When your friend leaves, walking them to the door and saying “Thanks for coming” is polite.', true, 'It ends the visit warmly.']
    ],
    why: [
      { custom: 'A host offers the guest a choice of what to do.', ok: 'Being in someone else’s home can feel strange, and choices help the guest relax and have fun.', no: ['It saves the host from deciding.', 'The guest might break something otherwise.', 'It is a rule only for birthdays.'], expl: 'A good host takes the strangeness out of being a guest.' }
    ],
    all: [
      { ask: '{B} is coming over to {A}’s house. Which of these are good host manners? Select all that apply.', okLabel: 'Good host manners',
        ok: ['Greeting {B} and {Bhis} parent at the door.', 'Offering a snack.', 'Asking what {B} would like to do.', 'Including {A}’s little sister in a game.', 'Walking {B} to the door at the end.'],
        no: [['Playing a game only {A} likes.', 'Put the guest’s fun first.'], ['Leaving {B} alone to answer texts.', 'Spend the time with your guest.'], ['Eating a snack without offering one.', 'Offer first.'], ['Telling {Ahis} sister to go away, loudly.', 'Be kind, and include her for a while.']] }
    ],
    order: [
      { title: 'Having a friend over:', steps: ['Greet your friend and their parent at the door.', 'Offer a snack or a drink.', 'Ask what your friend would like to do.', 'Play together, including anyone else who is there.', 'Walk your friend to the door and say, “Thanks for coming.”'] }
    ]
  });

  T('growing.sleepovers', {
    hint: 'Their house, their rules: bedtime, snacks, tidiness, thanks. And calling home is always okay.',
    items: [
      { s: 'At {B}’s sleepover, {B}’s mom says it is time for lights out, but {A} isn’t tired.', ask: 'What should {A} do?',
        ok: ['Go along with lights out and keep quiet.'],
        near: [['Keep talking quietly under the blankets for another hour.', 'Their house, their bedtime.'], ['Ask for “just one more movie.”', 'Follow the parents’ rule.'], ['Turn on {Ahis} phone and watch videos.', 'Lights out means screens off too.']],
        rude: [['Say, “At my house, I stay up as late as I want.”', 'As a guest, you follow their rules.']],
        why: 'Following the family’s rules and bedtime shows respect for the people who invited you.', sc: ['home', ['A', 'B', 'rosa']] },
      { s: '{A} is hungry at {B}’s house late in the evening.', ask: 'What should {A} do?',
        ok: ['Ask {B} or a parent, “May I have a snack?”'],
        near: [['Go to the kitchen and take something.', 'Ask first; it is their kitchen.'], ['Say nothing and stay hungry all night.', 'It is fine to ask politely.'], ['Ask {B} to sneak food from the kitchen.', 'Ask the parent directly.']],
        why: 'As a guest, you ask before helping yourself.', sc: ['kitchen', ['A', 'B']] },
      { s: 'At a sleepover, {A} starts to feel homesick and uneasy.', ask: 'What can {A} do?',
        ok: ['Tell {B}’s parent, “I’d like to call home,” and call.'],
        near: [['Stay quiet and wait until morning, no matter what.', 'It is always fine to call home.'], ['Sneak out without telling anyone.', 'Tell the grown-up in charge.'], ['Pretend to be sick so it seems like a better reason.', 'No reason is needed beyond wanting to go home.']],
        why: 'Calling home is always okay, and {A} doesn’t have to explain more than {Ahe} wants to.', sc: ['home', ['A', 'rosa']] },
      { s: 'It’s the morning after the sleepover, and {A}’s dad is picking {Ahim} up.', ask: 'What should {A} do before leaving?',
        ok: ['Roll up {Ahis} sleeping bag, gather {Ahis} things, and thank {B}’s parents.'],
        near: [['Leave the sleeping bag out; {B} can put it away.', 'A guest tidies up after themselves.'], ['Run to the car without saying goodbye.', 'Thank the parents first.'], ['Thank only {B}.', 'Thank the parents too; they hosted.']],
        why: 'Tidying up and thanking the parents shows {A} appreciated the visit.', sc: ['door', ['A', 'B', 'rosa']] }
    ],
    tf: [
      ['At a sleepover, you follow the host family’s rules, even if your family does things differently.', true, 'As a guest, you live by their rules for the night.'],
      ['It is rude to call home from a sleepover.', false, 'It is always fine to call home if you feel uncomfortable or want to leave.'],
      ['Thanking your friend’s parents in the morning is good manners.', true, 'They hosted you.'],
      ['It is fine to take snacks from a friend’s kitchen without asking.', false, 'Ask first.']
    ],
    why: [
      { custom: 'At a sleepover, guests follow the host family’s bedtime and rules.', ok: 'It shows respect for the family who invited them into their home.', no: ['Guests might get lost otherwise.', 'It is the only way to make friends.', 'Hosts can send guests home for any reason.'], expl: 'Every home has its own rules, and a guest lives by theirs for the night.' }
    ],
    all: [
      { ask: 'At a sleepover, which of these are polite? Select all that apply.',
        ok: ['Going to sleep when the parents ask for lights out.', 'Asking before taking a snack.', 'Keeping {Ahis} things together.', 'Saying, “Thank you for having me,” in the morning.', 'Calling home if {Ahe} wants to leave.'],
        no: [['Staying up loudly after the parents asked for quiet.', 'Follow their bedtime.'], ['Complaining that breakfast isn’t what {Ahe} eats at home.', 'Try it or say “No, thank you.”'], ['Leaving clothes all over the floor.', 'Keep your things tidy.'], ['Making fun of how the family does things.', 'Respect their way.']] }
    ]
  });

  var INV_PARTS = ['host', 'occasion', 'when', 'where', 'rsvp'];
  T('growing.birthday-invitations', {
    hint: 'RSVP means please reply, by the date given, yes or no.',
    custom: {
      rsvp: function (R, ctx, v) {
        return { q: 'A birthday invitation says, “RSVP by Friday.” <b>What does “RSVP” ask the guest to do?</b>', a: mcOf('Reply to say whether you can come', ctx.level === 1 ? ['Bring a present worth at least ten dollars', 'Arrive early'] : ['Reply only if you can come', 'Bring a present worth at least ten dollars', 'Arrive early to help set up']), steps: ['RSVP stands for the French <i>répondez s’il vous plaît</i>: “please reply.”', 'Reply by the date given, whether the answer is yes or no.'] };
      },
      missing: function (R, ctx, v) { // which part of the invitation is missing?
        var day = v.day === 'Monday' || v.day === 'Tuesday' ? 'Saturday' : v.day;
        var parts = { host: v.A + ' ' + R.pick(['Brooks', 'Novak', 'Rivera', 'Walsh', 'Haddad', 'Kim']), occasion: 'is turning ' + R.int(10, 13) + '! Come celebrate.', when: day + ', ' + R.pick(['May', 'June', 'October', 'March']) + ' ' + R.int(3, 28) + ', ' + R.int(1, 4) + ':00 to ' + R.int(5, 7) + ':00 p.m.', where: R.int(10, 99) + ' ' + R.pick(['Elm', 'Maple', 'Oak', 'Birch', 'Cedar']) + ' Street', rsvp: 'RSVP to ' + v.A + '’s dad by ' + R.pick(['May 1', 'the 10th', 'next Monday']) + ': 555-01' + R.int(10, 99) };
        var omit = R.pick(ctx.level === 1 ? ['when', 'where', 'rsvp'] : INV_PARTS), PN = E().PART_NAMES;
        var wr = R.shuffle(INV_PARTS.filter(function (p) { return p !== omit; })).slice(0, ctx.level === 1 ? 2 : 3).map(function (p) { return PN[p]; });
        return {
          q: fill('Here is {A}’s party invitation, but one part is missing. <b>Which part is missing?</b>', v),
          a: mcOf(PN[omit], wr),
          steps: ['Missing: ' + PN[omit].toLowerCase() + '.', 'An invitation needs who is hosting, the occasion, the date and time, the place and how to reply, so guests can plan and answer.'],
          viz: { name: 'et-note', opts: { kind: 'invitation', parts: parts, mode: 'missing', omit: omit, quiet: true, interactive: false } },
          _omit: omit
        };
      }
    },
    items: [
      { s: '{A} is invited to {B}’s party but has a family trip that day.', ask: 'What should {A} do?',
        ok: ['Reply by the date with thanks: “I’m sorry I can’t come. I hope it’s a great party!”'],
        near: [['Not reply, since {Ahe} isn’t coming.', 'RSVP asks for a reply either way; the host is counting.'], ['Reply the day of the party.', 'Reply by the date asked so the host can plan.'], ['Say yes and then just not go.', 'Saying yes and not showing up leaves the host with a missing guest.']],
        why: 'The host needs every answer, yes or no, to plan food and games.', sc: ['classroom', ['A', 'B']] },
      { s: '{A} is having a party for a few friends and has the invitations in {Ahis} backpack.', ask: 'What is the kind way to give them out?',
        ok: ['Give them privately, mail them, or have a parent text the families.'],
        near: [['Hand them out at lunch in front of everyone.', 'Classmates who weren’t invited will feel left out.'], ['Pass them out in class and say, “Sorry, I only had a few.”', 'It still points out who wasn’t invited.'], ['Put them on the desks of the invited kids during class.', 'Everyone sees who got one.']],
        why: 'Not everyone can be invited, so invitations are given privately to spare feelings.', sc: ['classroom', ['A', 'B', 'C']] },
      { s: 'At school, {B} keeps talking about the fun plans for {Bhis} party, in front of classmates who weren’t invited.', ask: 'What would be kinder?',
        ok: ['Talk about the party only with the guests, away from the others.'],
        near: [['Talk about it even louder so everyone gets excited.', 'It makes those not invited feel worse.'], ['Ask the uninvited kids if they are jealous.', 'It is unkind.'], ['Show the guest list on {Bhis} phone.', 'Keep the list private.']],
        why: 'Talking about a party in front of people who weren’t invited can hurt their feelings.', sc: ['classroom', ['B', 'C']] },
      { s: '{A} said yes to {B}’s party, but now {Ahis} family has an emergency trip that day.', ask: 'What should {A} do?',
        ok: ['Let {B}’s family know as soon as possible.'],
        near: [['Just not show up; they won’t notice.', 'The host is counting on {A}.'], ['Tell {B} after the party.', 'Tell them as soon as plans change.'], ['Send {Ahis} little brother instead.', 'Only invited guests attend.']],
        why: 'When plans change after you reply, tell the host right away so they can adjust.' }
    ],
    tf: [
      ['“RSVP” means “please reply.”', true, 'It comes from the French répondez s’il vous plaît.'],
      ['If you can’t go to a party, you don’t need to reply.', false, 'RSVP asks for a reply either way.'],
      ['Handing out invitations in front of people who aren’t invited can hurt feelings.', true, 'Give them privately.'],
      ['If your plans change after you reply, you should tell the host.', true, 'They are counting on your answer.']
    ],
    why: [
      { custom: 'Guests reply to an invitation by the date it asks, even if the answer is no.', ok: 'The host needs to know how many people are coming to plan food, seats and games.', no: ['It proves the invitation arrived.', 'Hosts get a prize for every reply.', 'It is required by law.'], expl: 'Replying is a kindness to the host who planned the party.' }
    ],
    all: [
      { ask: 'Which of these are good invitation manners? Select all that apply.', okLabel: 'Good manners',
        ok: ['Replying by the RSVP date.', 'Saying no kindly when {Ahe} can’t come.', 'Giving invitations privately.', 'Telling the host right away if plans change.'],
        no: [['Not replying because {Ahe} isn’t going.', 'Reply either way.'], ['Handing out invitations in front of the whole class.', 'Give them privately.'], ['Saying yes and not showing up.', 'The host is counting on {Ahim}.'], ['Bragging about a party to kids who weren’t invited.', 'Talk about it only with the guests.']] }
    ],
    levels: { 1: ['items', 'rsvp', 'tf', 'missing'], 2: ['items', 'missing', 'why', 'all', 'rsvp'], 3: ['all', 'missing', 'items'] }
  });

  T('growing.giving-gifts', {
    hint: 'Think about the other person, take off the price tag, add a card, and never mention the cost.',
    items: [
      { s: '{A} needs a birthday gift for {B}, who loves {hobby}.', ask: 'Which gift idea is most thoughtful?',
        ok: ['Something small for {hobby}, with the price tag off and a card from {A}.'],
        near: [['The game {A} wants, so they can play it together at {B}’s house.', 'Choose for {B}, not for yourself.'], ['The most expensive thing {A} can find, with the price tag left on.', 'The thought matters more than the price; take the tag off.'], ['Cash in an envelope with no card.', 'A card says who it is from and shows thought.']],
        why: 'A gift that fits what {B} loves shows {A} thought about {Bhim}.', sc: ['party', ['A', 'B'], { holds: { 0: 'gift' } }] },
      { s: '{A} hands {B} a gift and wants {B} to know it was special.', ask: 'What should {A} say?',
        ok: ['“Happy birthday! I hope you like it.”'],
        near: [['“This cost forty dollars, so you’d better like it.”', 'Talking about price makes the gift about money.'], ['“Open it now, now, now!”', 'Let {B} open it when {Bhe} likes.'], ['“My mom picked it, I don’t know what it is.”', 'Even if a parent helped, a warm wish is better.']],
        why: 'A warm wish keeps the focus on {B}, not on the price.', sc: ['party', ['A', 'B'], { holds: { 0: 'gift' } }] },
      { s: '{A} has no money but wants to give {Ahis} grandmother something for her birthday.', ask: 'What is a good choice?',
        ok: ['A homemade card or drawing, or a promise to help her with a chore.'],
        near: [['Nothing, since gifts must be bought.', 'A gift is about the thought, not the price.'], ['Something from {Ahis} sister’s room.', 'Give what is yours to give.'], ['A gift {Ahe} got last year and didn’t like.', 'Choose something with Grandma in mind.']],
        why: 'Homemade gifts show real thought, and grandparents often treasure them.' }
    ],
    tf: [
      ['A gift is more about the thought than the price.', true, 'It says, “I know you, and I thought about you.”'],
      ['It is polite to leave the price tag on so the person knows what it cost.', false, 'Take it off; the gift shouldn’t be about money.'],
      ['Adding a card with your name helps the person know whom to thank.', true, 'It also adds a warm message.'],
      ['The best gift is always the one you would want yourself.', false, 'Choose with the other person in mind.']
    ],
    why: [
      { custom: 'People take the price tag off a gift before giving it.', ok: 'It keeps the focus on the gift and the thought, not on money.', no: ['Price tags make wrapping paper tear.', 'Stores require it.', 'So the person can’t return it.'], expl: 'A gift says, “I thought about you,” and money talk gets in the way.' }
    ],
    all: [
      { ask: '{A} is getting a gift for {B}. Which of these are thoughtful? Select all that apply.', okLabel: 'Thoughtful',
        ok: ['Choosing something {B} likes.', 'Taking the price tag off.', 'Adding a card with {Ahis} name.', 'Making a gift by hand.'],
        no: [['Picking what {A} wants to play with.', 'Choose for {B}.'], ['Telling {B} how much it cost.', 'Keep money out of it.'], ['Insisting {B} open it right this second.', 'Let {B} open it when {Bhe} likes.'], ['Forgetting to say who it is from.', 'Add a card.']] }
    ]
  });

  T('growing.receiving-gifts', {
    hint: 'Card first, look at the giver, thank them warmly, and find something kind and true to say.',
    items: [
      { s: 'Grandpa Walt gives {A} a sweater. {A} already has one just like it.', ask: 'What should {A} say?',
        ok: ['“Thank you, Grandpa! It’s so soft. I love this color.”'],
        near: [['“I already have this one.”', 'True, but it hurts; thank him for thinking of {Ahim}.'], ['“Do you have the receipt?”', 'Questions about returns come later, privately, if at all.'], ['“Oh. Thanks.” and set it aside without looking at him.', 'Look at him and thank him warmly.']],
        rude: [['“I don’t wear sweaters.”', 'It hurts the giver’s feelings.']],
        why: '{A} thanks Grandpa for the thought and says something kind and true.', sc: ['home', ['A', 'walt'], { holds: { 0: 'gift' } }] },
      { s: 'At {Ahis} party, {A} picks up a gift with a card taped on top.', ask: 'What should {A} do first?',
        ok: ['Read the card, so {Ahe} knows whom to thank.'],
        near: [['Tear off the paper and read the card later.', 'Read the card first.'], ['Shake it to guess what it is.', 'Card first, then open it.'], ['Put it aside to open after everyone leaves.', 'Some families do; if opening now, read the card first.']],
        why: 'Reading the card first tells {A} whom to look at and thank.', sc: ['party', ['A', 'B'], { holds: { 0: 'gift' } }] },
      { s: 'Aunt Rosa gives {A} a puzzle with a thousand pieces. {A} doesn’t like puzzles.', ask: 'What should {A} say?',
        ok: ['“Thank you, Aunt Rosa! The picture is really cool.”'],
        near: [['“I don’t really like puzzles.”', 'Thank her for the thought instead.'], ['“Can I trade it for something else?”', 'That question, if needed at all, comes later and privately.'], ['Nothing, and move on to the next gift.', 'Every gift deserves a thank-you.']],
        why: 'Something kind and true, plus thanks, honors the thought behind the gift.', sc: ['home', ['A', 'rosa:Aunt Rosa'], { holds: { 0: 'gift' } }] }
    ],
    tf: [
      ['If you already have the gift, it is best to say so right away.', false, 'Thank the giver; any exchange question comes later, privately.'],
      ['Reading the card before opening a gift tells you whom to thank.', true, 'Then you can look at the giver and thank them.'],
      ['You should thank someone for a gift even if it isn’t your style.', true, 'You are thanking them for thinking of you.'],
      ['In some families and cultures, gifts are opened later, not in front of the giver.', true, 'Both customs are polite.']
    ],
    why: [
      { custom: 'When you open a gift, you thank the giver warmly, even if you don’t love it.', ok: 'A gift is a thought from another person, and you are thanking them for thinking of you.', no: ['So they will give you a better gift next time.', 'So nobody knows what you really think.', 'It is the only way to get the receipt.'], expl: 'A warm response makes the giver glad they chose it.' }
    ],
    all: [
      { ask: 'Which of these are gracious ways to receive a gift? Select all that apply.', okLabel: 'Gracious',
        ok: ['Reading the card first.', 'Looking at the giver and saying thank you.', 'Saying something kind about the gift.', 'Thanking each friend by name.'],
        no: [['Saying, “I already have this.”', 'Thank them for the thought.'], ['Asking for the receipt in front of the giver.', 'Ask later and privately, if at all.'], ['Rushing past one gift to open the next.', 'Thank each giver.'], ['Comparing gifts out loud.', 'Comparing makes some givers feel bad.']] }
    ]
  });

  var TY_ORDER = ['greeting', 'thanks', 'detail', 'closing', 'signature'];
  function theGift(g) { return String(g).replace(/^an? /, 'the '); }
  T('growing.thank-you-notes', {
    hint: 'Greeting, thanks for the specific gift, how you’ll use it, closing, signature.',
    custom: {
      parts: function (R, ctx, v) { // put a note's parts in order
        var giver = R.pick([['Grandma June', 'Grandma'], ['Aunt Rosa', 'Aunt Rosa'], ['Ms. Park', 'Ms. Park'], ['Grandpa Walt', 'Grandpa']]), g = v.gift;
        var text = { greeting: 'Dear ' + giver[1] + ',', thanks: 'Thank you so much for ' + theGift(g) + '.', detail: R.pick(['I have already used it every day this week.', 'It is my favorite thing in my room now.', 'I took it to school to show my friends.']), closing: /Park/.test(giver[0]) ? 'Sincerely,' : 'Love,', signature: v.A };
        var it = { title: v.A + '’s thank-you note to ' + giver[0] + ':', steps: TY_ORDER.map(function (p) { return text[p]; }) };
        var p = orderQ(R, ctx, it, v, 'Greeting at the top, signature at the bottom; the thank-you comes right after the greeting.');
        p.steps.push('The parts in order: greeting, the thank-you for the gift, how you use or enjoy it, the closing, and your signature.');
        return p;
      },
      missing: function (R, ctx, v) {
        var parts = { greeting: 'Dear Grandpa Walt,', thanks: 'Thank you for ' + theGift(v.gift) + '.', detail: 'I have already used it every day.', personal: 'I hope you can come to my ' + v.sport + ' game soon.', closing: 'Love,', signature: v.A };
        var omit = R.pick(ctx.level === 1 ? ['greeting', 'thanks', 'signature'] : ['greeting', 'thanks', 'detail', 'closing', 'signature']), PN = E().PART_NAMES;
        var opts = ['greeting', 'thanks', 'detail', 'closing', 'signature'];
        var wr = R.shuffle(opts.filter(function (p) { return p !== omit; })).slice(0, ctx.level === 1 ? 2 : 3).map(function (p) { return PN[p]; });
        return {
          q: fill('{A} wrote this thank-you note to Grandpa Walt, but one part is missing. <b>Which part is missing?</b>', v),
          a: mcOf(PN[omit], wr),
          steps: ['Missing: ' + PN[omit].toLowerCase() + ' (“' + parts[omit] + '”).', 'A thank-you note has a greeting, a thank-you for the specific gift, a line about how you use or enjoy it, a closing and a signature.'],
          viz: { name: 'et-note', opts: { kind: 'thanks', parts: parts, mode: 'missing', omit: omit, quiet: true, interactive: false } },
          _omit: omit
        };
      },
      best: function (R, ctx, v) { // the best thank-you line
        var right = 'Thank you for ' + theGift(v.gift) + '. I have already used it twice!';
        return { q: fill('{A} is writing a thank-you note for ' + v.gift + '. <b>Which line is best?</b>', v), a: mcOf(right, ctx.level === 1 ? ['Thanks for the stuff.', 'Thanks for the gift. Bye.'] : ['Thanks for the stuff.', 'Thanks for the gift. Bye.', 'I already had one, but thanks anyway.']), steps: ['Best: ' + right, 'It names the gift and adds a real detail, so the giver knows {A} noticed and enjoys it.'.replace('{A}', v.A)] };
      },
      envelope: function (R, ctx, v) {
        var M = R.pick(['stamp-left', 'return-center', 'no-zip']);
        var D = { 'stamp-left': 'The stamp and the return address have traded corners.', 'return-center': 'The return address and the delivery address have traded places.', 'no-zip': 'The delivery address is missing its ZIP code.' };
        var right = D[M], wr = Object.keys(D).filter(function (k) { return k !== M; }).map(function (k) { return D[k]; }).concat(['Nothing is wrong.']);
        var to = R.pick([['Dr. Ada Bell', '400 Oak Avenue', 'Rivertown, TX 75001'], ['Mrs. June Hale', '12 Pine Lane', 'Lakeside, MN 55901'], ['Ms. Grace Park', '88 River Road', 'Fairview, OH 44120']]);
        return {
          q: fill('{A} addressed an envelope for a thank-you note, but something is wrong. <b>What is wrong?</b>', v),
          a: mcOf(right, R.shuffle(wr).slice(0, ctx.level === 1 ? 2 : 3)),
          steps: [right, 'The delivery address goes in the center, the return address (yours) in the upper left, and the stamp in the upper right. The last line of an address ends with the ZIP code.'],
          viz: { name: 'et-envelope', opts: { to: to, from: [v.A + ' ' + R.pick(['Brooks', 'Novak', 'Rivera', 'Walsh', 'Haddad', 'Kim']), '9 Birch Road', to[2].replace(/\d+$/, function (z) { return String(+z + 1); })], mode: 'spot', mistake: M, quiet: true, interactive: false } },
          _env: M
        };
      }
    },
    tf: [
      ['A good thank-you note names the specific gift.', true, 'It shows you noticed what they chose.'],
      ['It is fine to send a thank-you note three months later.', false, 'Send it within a week or two.'],
      ['On an envelope, the stamp goes in the upper right corner.', true, 'Your return address goes in the upper left.'],
      ['A thank-you note should begin with your signature.', false, 'It begins with a greeting and ends with your signature.']
    ],
    why: [
      { custom: 'A thank-you note names the gift and says how you will use or enjoy it.', ok: 'It shows you noticed what the giver chose and lets them picture you enjoying it.', no: ['It makes the note long enough.', 'It helps the giver remember where they bought it.', 'Teachers check for it.'], expl: 'That is what makes a giver feel thanked.' }
    ],
    levels: { 1: ['best', 'missing', 'tf'], 2: ['parts', 'missing', 'envelope', 'best', 'why'], 3: ['parts', 'missing', 'envelope'] }
  });


  // ================================================================ Unit 7: Getting Along
  T('growing.apologizing', {
    hint: 'Say what you did, say sorry with no “but,” offer to make it right, and do better.',
    items: [
      { s: '{A} borrowed {B}’s book, and the cover tore.', ask: 'Which apology is best?',
        ok: ['“I’m sorry I tore your book’s cover. Can I tape it or buy you a new one? I’ll be more careful.”'],
        near: [['“Sorry, but the cover was already loose.”', 'The “but” turns the apology into an excuse.'], ['“Sorry you feel that way.”', 'It blames {B}’s feelings instead of owning the torn cover.'], ['“Sorry.” mumbled on the way past.', 'Say what you did and offer to fix it.']],
        rude: [['“It’s just a book. Get over it.”', 'It dismisses {B}’s feelings.']],
        why: 'It names what happened, says sorry with no excuse, offers a fix and promises to do better.', sc: ['classroom', ['A', 'B'], { holds: { 0: 'book' } }] },
      { s: 'During a game, {A} yelled at {B} for missing a pass. Afterward, {A} feels bad.', ask: 'What should {A} say?',
        ok: ['“I’m sorry I yelled at you. That wasn’t fair. I’ll keep my cool next time.”'],
        near: [['“Sorry, but you really should have caught it.”', 'The “but” puts the blame back on {B}.'], ['Nothing; it was just a game.', 'Hurt feelings need an apology.'], ['“I’m sorry you got upset.”', 'It makes {B}’s feelings the problem.']],
        rude: [['“You’re too sensitive.”', 'It blames {B} for being hurt.']],
        why: 'A good apology owns what {A} did, without a “but.”', sc: ['park', ['A', 'B'], { mood: { 1: 'sad' } }] },
      { s: '{A} promised to save {B} a seat at lunch, then forgot.', ask: 'Which apology owns the mistake?',
        ok: ['“I’m sorry I forgot to save you a seat after I promised. I’ll save you one tomorrow.”'],
        near: [['“Sorry, but the table filled up fast.”', 'An excuse after “but” weakens the apology.'], ['“You could have found your own seat.”', 'It blames {B}.'], ['“Whatever, it’s just a seat.”', 'It dismisses the broken promise.']],
        why: 'It names the broken promise and offers to make it right.', sc: ['classroom', ['A', 'B']] },
      { s: '{B} apologizes to {A}: “I’m sorry I teased you about your haircut. That was mean.”', ask: 'What is a gracious response?',
        ok: ['“Thanks for saying that. It’s okay.”', '“Thank you. I appreciate it.”'],
        near: [['“You should be sorry.”', 'It keeps the hurt going after {B} owned it.'], ['Ignore {Bhim} and walk away.', 'Accepting an apology lets both move on.'], ['“Fine, but I’m telling everyone what you said.”', 'It turns the apology into a new fight.']],
        why: 'Accepting an apology kindly is a courtesy that lets both people move on.', sc: ['park', ['A', 'B']] }
    ],
    tf: [
      ['“I’m sorry you feel that way” is a good apology.', false, 'It blames the other person’s feelings instead of owning what you did.'],
      ['A good apology says what you did.', true, 'Naming it shows you understand.'],
      ['Adding “but” to an apology can turn it into an excuse.', true, '“Sorry, but you started it” puts the blame back.'],
      ['Offering to make things right is part of a good apology.', true, 'It shows the words are meant.']
    ],
    why: [
      { custom: 'A good apology has no “but” in it.', ok: 'A “but” turns the apology into a defense and puts the blame back on the other person.', no: ['Shorter apologies are always better.', '“But” is a rude word.', 'It keeps the other person from answering.'], expl: 'An apology is for the person who was hurt.' }
    ],
    order: [
      { title: 'A good apology:', steps: ['Say what you did.', 'Say you are sorry, with no “but.”', 'Offer to make it right.', 'Say what you will do next time.'] },
      { title: '{A} apologizes to {B} for breaking {Bhis} pencil case:', steps: ['“I broke your pencil case when I dropped it.”', '“I’m really sorry.”', '“Can I buy you a new one?”', '“I’ll be more careful with your things.”'] }
    ],
    all: [
      { ask: 'Which of these are parts of a good apology? Select all that apply.', okLabel: 'Good parts',
        ok: ['Saying what {Ahe} did.', 'Saying “I’m sorry” with no “but.”', 'Offering to make it right.', 'Doing better next time.'],
        no: [['“Sorry you feel that way.”', 'It blames the other person’s feelings.'], ['“Sorry, but you started it.”', 'It is an excuse.'], ['Waiting for the other person to apologize first.', 'Own your part either way.'], ['Laughing while saying sorry.', 'It makes the apology seem fake.']] }
    ],
    spot: [
      { place: 'park', who: ['A', 'B'], lines: [[0, 'I’m sorry I left you out of the game at recess.'], [0, 'That wasn’t kind.'], [0, 'But you’re kind of slow, so that’s why.'], [0, 'Next time I’ll ask you to play.']], fault: 2, why: 'The “but” line turns the apology into an excuse and adds a new hurt.', fixLabel: 'Better', fix: 'I’d like you to be on my team tomorrow.' }
    ]
  });

  T('growing.disagreeing', {
    hint: 'Talk about the idea, not the person; listen first, find something to agree with, and say “I think.”',
    items: [
      { s: '{B} wants their project poster to be about volcanoes. {A} thinks earthquakes would be better.', ask: 'What could {A} say?',
        ok: ['“Volcanoes would look great. I think earthquakes might be easier, since we have the library book. Want to do both?”'],
        near: [['“That’s a dumb idea.”', 'It attacks the idea harshly and makes {B} defensive.'], ['“You’re wrong, as usual.”', 'It attacks {B}, not the idea.'], ['Say nothing and do earthquakes anyway.', 'Talk it through instead of going around {B}.']],
        rude: [['Roll {Ahis} eyes.', 'It is a silent put-down.']],
        why: 'It finds something to agree with, gives {A}’s view with “I think,” and invites a solution.', sc: ['classroom', ['A', 'B']] },
      { s: 'Grandpa Walt says an old movie is better than the new version. {A} disagrees.', ask: 'Which response is respectful?',
        ok: ['“What did you like about the old one? I think the new one’s effects are amazing.”'],
        near: [['“Old movies are boring.”', 'It brushes off his view instead of discussing it.'], ['“You just don’t get new movies.”', 'It is about him, not the movie.'], ['Agree, even though {Ahe} doesn’t.', 'It is fine to share a different view kindly.']],
        why: 'Asking about his view first, then sharing {A}’s with “I think,” keeps it a friendly conversation.', sc: ['home', ['A', 'walt']] },
      { s: '{A} and {B} have argued about which team is better for ten minutes, and neither will change {Ahis} mind.', ask: 'What is a good way to end it?',
        ok: ['“Let’s agree to disagree. Want to play {game}?”'],
        near: [['Keep arguing until one of them gives up.', 'Winning isn’t the goal; understanding is.'], ['Walk away without a word.', 'A friendly close keeps the friendship.'], ['Say, “You’re just not smart enough to see it.”', 'It is a put-down.']],
        why: 'Agreeing to disagree ends the argument and keeps the friendship.', sc: ['park', ['A', 'B']] }
    ],
    tf: [
      ['Disagreeing with a friend is always rude.', false, 'Disagreeing kindly is fine; you can disagree and still be friends.'],
      ['Saying “I think…” instead of “You’re wrong” makes a disagreement kinder.', true, 'It shares your view without attacking.'],
      ['The goal of a disagreement is to win.', false, 'The goal is to understand each other.'],
      ['Starting with what you agree with shows the other person you listened.', true, 'It keeps them from feeling attacked.']
    ],
    why: [
      { custom: 'When you disagree, you talk about the idea, not the person.', ok: 'People defend themselves when they feel attacked, and then nobody listens.', no: ['Ideas don’t have feelings, so you can be as harsh as you like.', 'It helps you win faster.', 'It keeps the conversation short.'], expl: 'Keeping the other person’s dignity safe keeps the conversation going.' }
    ],
    all: [
      { ask: 'Which of these are kind ways to disagree? Select all that apply.', okLabel: 'Kind',
        ok: ['“I see your point. I think the blue poster is easier to read.”', '“What makes you think that? I see it differently.”', '“We can agree to disagree.”', '“That’s a good idea. Could we try mine too?”'],
        no: [['“That’s a dumb idea.”', 'It is a put-down.'], ['“You’re wrong, as usual.”', 'It attacks the person.'], ['Rolling {Ahis} eyes while {B} explains.', 'Listen first.'], ['Interrupting to say “No, no, no.”', 'Let {B} finish.']] }
    ],
    spot: [
      { place: 'classroom', who: ['A', 'B', 'C'], lines: [[1, 'I think we should present first.'], [0, 'I see why. I think going last gives us more practice time.'], [2, 'That’s the stupidest thing I’ve ever heard.'], [1, 'Could we ask the teacher which slot is open?']], fault: 2, why: '{C} attacked the idea with an insult instead of giving a view.', fix: 'I’m not sure. What would be easier for everyone?' }
    ]
  });

  T('growing.sportsmanship', {
    hint: 'Play fair, accept the calls, cheer without jeering, and shake hands win or lose.',
    items: [
      { s: 'In {A}’s game, the referee makes a call {A} is sure is wrong.', ask: 'What should {A} do?',
        ok: ['Accept the call and keep playing; the coach can ask about it calmly.'],
        near: [['Argue with the referee until the call changes.', 'Arguing every call turns a game into a fight.'], ['Stop playing to protest.', 'The game goes on; accept the call.'], ['Yell to the crowd that the referee is unfair.', 'It disrespects the referee and stirs people up.']],
        rude: [['Throw {Ahis} gear on the ground.', 'Temper tantrums are poor sportsmanship.']],
        why: 'A game only works if both sides accept the people who enforce the rules.', sc: ['park', ['A', 'diaz:Referee'], { mood: { 0: 'cross' } }] },
      { s: '{A}’s team wins by a lot.', ask: 'What does gracious winning look like?',
        ok: ['Celebrate with {Ahis} team, then shake hands and say “Good game.”'],
        near: [['Dance in front of the other team’s bench.', 'Celebrate with your team, not at the other one.'], ['Skip the handshake line because the game was too easy.', 'Shake hands win or lose.'], ['Tell the other team they should practice more.', 'It rubs in the loss.']],
        why: 'A good sport is gracious in winning, because the other team worked hard too.', sc: ['park', ['A', 'B']] },
      { s: '{A} is losing badly in a board game with {B} and {C}.', ask: 'What should {A} do?',
        ok: ['Keep playing to the end and congratulate the winner.'],
        near: [['Quit and put the pieces away.', 'The others are counting on {Ahim} to finish.'], ['Accuse {B} of cheating.', 'Losing isn’t a reason to accuse anyone.'], ['Change the rules so {Ahe} can catch up.', 'Rules are agreed on before the game.']],
        rude: [['Knock the board over.', 'It ruins the game for everyone.']],
        why: 'Gracious losing means finishing and congratulating the winner.', sc: ['home', ['A', 'B', 'C']] },
      { s: 'A player on the other team trips and falls near {A}.', ask: 'What is good sportsmanship?',
        ok: ['Offer a hand up, or check that the player is okay.'],
        near: [['Laugh and point.', 'Mocking a fall is unkind.'], ['Keep going and pretend not to notice.', 'A hand up is a kind gesture.'], ['Shout, “Serves you right!”', 'It is unkind.']],
        why: 'Respect for the other team includes helping a player who falls.', sc: ['park', ['A', 'B']] }
    ],
    tf: [
      ['Good sportsmanship means shaking hands after the game, win or lose.', true, 'It shows respect for the other team.'],
      ['Arguing with the referee shows you care about the game.', false, 'Accept the call; the coach can ask about it calmly.'],
      ['Cheering for your own team is good sportsmanship.', true, 'Cheer for your team without jeering the other.'],
      ['It is fine to quit a game when you start losing.', false, 'Finish the game; the others are counting on you.']
    ],
    why: [
      { custom: 'Teams shake hands and say “Good game” after every game.', ok: 'It shows respect for the other team’s effort, whatever the score.', no: ['It lets the winners brag.', 'Referees require it to end the game.', 'It is a way to check who played.'], expl: 'A good sport is gracious in both winning and losing.' }
    ],
    all: [
      { ask: 'Which of these are good sportsmanship? Select all that apply.', okLabel: 'Good sport', noLabel: 'Poor sport',
        ok: ['Saying “Good game” in the handshake line.', 'Helping up a player who fell.', 'Cheering for {Ahis} own team.', 'Accepting the referee’s call.', 'Congratulating the winner.'],
        no: [['Yelling at the referee.', 'Accept the call.'], ['Mocking the other team after a goal.', 'Celebrate with your team, not at them.'], ['Quitting when losing.', 'Finish the game.'], ['Skipping the handshake line after a loss.', 'Shake hands win or lose.']] }
    ]
  });

  T('growing.school-teachers', {
    hint: 'Raise your hand and wait, listen to others, ask for help respectfully, and talk about grades privately.',
    items: [
      { s: 'Ms. Park asks a question, and {A} knows the answer right away.', ask: 'What should {A} do?',
        ok: ['Raise {Ahis} hand and wait to be called on.'],
        near: [['Shout out the answer.', 'Calling out takes away everyone else’s turn to think.'], ['Whisper the answer to {B}.', 'It distracts both of them.'], ['Wave {Ahis} hand and say, “Ooh, ooh, me!”', 'Raise it quietly and wait.']],
        why: 'Raising a hand gives everyone a fair turn.', sc: ['classroom', ['park', 'A', 'B'], { pose: { 1: 'hand' } }] },
      { s: '{A} thinks a question on {Ahis} test was marked wrong by mistake.', ask: 'What is the respectful way to handle it?',
        ok: ['Ask to talk after class, and explain calmly: “Could you look at this one again?”'],
        near: [['Announce in class that the grade is unfair.', 'Arguing in front of the class puts the teacher on the spot.'], ['Complain to classmates about the teacher.', 'Talk to the teacher directly, privately.'], ['Change the answer and ask for points.', 'That is dishonest.']],
        why: 'A private, calm talk keeps it respectful and lets the teacher listen.', sc: ['classroom', ['A', 'park']] },
      { s: '{A} doesn’t understand the {subject} homework.', ask: 'What is a good way to ask for help?',
        ok: ['At a good moment: “Ms. Park, I’m stuck on number 4. Could you explain the first step?”'],
        near: [['Say, “This homework makes no sense,” and stop trying.', 'Ask a specific question instead.'], ['Interrupt the lesson to ask about something unrelated.', 'Wait for a good moment.'], ['Copy {B}’s homework.', 'That is dishonest, and {A} still won’t understand.']],
        why: 'A specific question at a good time makes it easy for the teacher to help.', sc: ['classroom', ['A', 'park']] },
      { s: 'While {B} is giving a report to the class, {A} thinks of something funny.', ask: 'What should {A} do?',
        ok: ['Listen to {B}’s report and save the joke for later.'],
        near: [['Whisper the joke to the person next to {Ahim}.', 'It distracts others and is unkind to {B}.'], ['Say the joke out loud.', 'It interrupts {B}.'], ['Draw a funny picture and pass it around.', 'It pulls attention away from {B}.']],
        why: 'Listening to classmates gives their ideas the respect you want for yours.', sc: ['classroom', ['B', 'A', 'C']] }
    ],
    tf: [
      ['Calling out answers in class is fine if you know the answer.', false, 'Raise your hand so everyone gets a turn.'],
      ['If you disagree with a grade, it is best to ask to talk after class.', true, 'A private talk keeps it calm.'],
      ['Listening when classmates speak is part of classroom manners.', true, 'It gives their ideas respect.'],
      ['Asking a specific question makes it easier for a teacher to help.', true, 'The teacher knows exactly where you are stuck.']
    ],
    why: [
      { custom: 'In class, students raise their hands and wait to be called on.', ok: 'It gives everyone a fair turn and time to think.', no: ['It is good exercise.', 'Teachers can’t hear otherwise.', 'It shows who sits closest.'], expl: 'A teacher is helping many people learn at once.' }
    ],
    all: [
      { ask: 'Which of these are good classroom manners? Select all that apply.', okLabel: 'Good manners',
        ok: ['Saying good morning to the teacher.', 'Raising {Ahis} hand and waiting.', 'Listening while a classmate speaks.', 'Asking to talk about a grade after class.'],
        no: [['Shouting out answers.', 'Raise your hand.'], ['Arguing about a grade in front of everyone.', 'Talk privately.'], ['Whispering during a classmate’s report.', 'Listen.'], ['Leaving borrowed supplies on the floor.', 'Return them.']] }
    ]
  });

  T('growing.respect-elders', {
    hint: 'A seat, a hand with doors and bags, your attention, and interest in their stories.',
    items: [
      { s: 'On a crowded bus, an older man gets on and there are no empty seats. {A} is sitting.', ask: 'What should {A} do?',
        ok: ['Stand and offer the seat: “Would you like to sit here?”'],
        near: [['Stay seated; {A} got there first.', 'Offering a seat to an older person is a classic courtesy.'], ['Pretend to be asleep.', 'Offer the seat.'], ['Offer it only if he asks.', 'Offer first; many people won’t ask.']],
        why: 'A seat makes an older person’s trip easier, and offering it is a long-standing courtesy.', sc: ['street', ['A', 'walt'], { pose: { 0: 'sit' } }] },
      { s: 'Grandpa Walt starts telling a story {A} has heard before.', ask: 'What is the kindest response?',
        ok: ['Listen, and ask a question about part of the story {Ahe} hasn’t heard.'],
        near: [['Say, “You already told me that.”', 'It cuts him off; ask a new question instead.'], ['Roll {Ahis} eyes and look at {Ahis} phone.', 'It tells him {Ahe} isn’t interested.'], ['Leave the room.', 'Stay and listen.']],
        why: 'Attention is a gift, and a new question can turn a familiar story into a new one.', sc: ['home', ['A', 'walt']] },
      { s: '{A}’s older neighbor, Mrs. Hale, is carrying heavy grocery bags up her steps.', ask: 'What should {A} do?',
        ok: ['Ask, “May I help you carry those?”'],
        near: [['Take the bags out of her hands without asking.', 'Ask first; she may prefer to carry some.'], ['Wave and keep walking.', 'Offer help.'], ['Tell her she shouldn’t carry so much.', 'Offering help is kinder than advice.']],
        why: 'Offering help, and asking first, is respectful.', sc: ['street', ['A', 'june'], { holds: { 1: 'bag' } }] },
      { s: '{A} is visiting {Ahis} great-aunt, who doesn’t say much.', ask: 'What could {A} ask her?',
        ok: ['“What did you do for fun when you were my age?”'],
        near: [['Nothing; respect means staying quiet around elders.', 'Asking about her life is one of the kindest things {A} can do.'], ['“Why are you so quiet?”', 'It puts her on the spot.'], ['“How old are you?”', 'Age questions can feel personal.']],
        why: 'An open question about her life invites a story.', sc: ['home', ['A', 'june:Great-Aunt June']] }
    ],
    tf: [
      ['Respect for elders means staying silent around them.', false, 'Asking about their lives and listening is respectful.'],
      ['Offering your seat to an older person is a courtesy.', true, 'It makes their day easier.'],
      ['Before helping someone carry something, it is polite to ask first.', true, 'They may prefer to do it themselves.'],
      ['Families and cultures show respect to elders in many different ways.', true, 'Learn your family’s ways and follow others’ when you visit.']
    ],
    why: [
      { custom: 'Young people offer older people their seats and help with doors and bags.', ok: 'Small courtesies make an older person’s day easier and show respect for a lifetime of experience.', no: ['Older people always ask for help.', 'It is a rule only on buses.', 'It is a way to get a reward.'], expl: 'Respect is attention, help and interest.' }
    ],
    all: [
      { ask: 'Which of these show respect for elders? Select all that apply.', okLabel: 'Respectful', noLabel: 'Not respectful',
        ok: ['Offering a seat on the bus.', 'Asking Grandma about her childhood.', 'Holding the door for an older neighbor.', 'Standing when Grandpa comes into the room.'],
        no: [['Rolling {Ahis} eyes at an old story.', 'Ask a question instead.'], ['Looking at {Ahis} phone while Grandpa talks.', 'Give him your attention.'], ['Calling an older neighbor by a nickname without asking.', 'Use the name they prefer.'], ['Grabbing a bag from someone without asking.', 'Ask first.']] }
    ]
  });

  T('growing.helping-home', {
    hint: 'Do your share, notice what needs doing, and thank your family.',
    items: [
      { s: 'The trash can is full. Taking out the trash is {A}’s sister’s chore this week, but she is at practice.', ask: 'What should {A} do?',
        ok: ['Take it out anyway, or let someone know it’s full.'],
        near: [['Leave it; it isn’t {Ahis} chore.', 'Family manners include helping when you notice a job.'], ['Push the trash down to make more room.', 'It just makes a bigger mess later.'], ['Text {Ahis} sister to come home and do it.', 'Helping out is kinder.']],
        why: 'Noticing a job and doing it says, “I’m part of this family too.”', sc: ['kitchen', ['A']] },
      { s: '{A}’s mom asks {Ahim} to fold the laundry.', ask: 'What is the best response?',
        ok: ['“Sure, Mom,” and do it without being asked twice.'],
        near: [['“In a minute,” and forget.', 'Doing it right away saves Mom from asking again.'], ['“Why do I have to?”', 'Everyone shares the work of a home.'], ['Fold half and leave the rest.', 'Finish the job.']],
        rude: [['Slam the door.', 'It is rude and doesn’t get the job done.']],
        why: 'Doing your share without being asked twice is a way of respecting your family.', sc: ['home', ['A', 'rosa:Mom']] },
      { s: '{A}’s grandpa helped {Ahim} with a school project all afternoon.', ask: 'What should {A} say?',
        ok: ['“Thanks for helping me, Grandpa. I couldn’t have done it without you.”'],
        near: [['Nothing; family doesn’t need thanks.', 'Thanks at home matter just as much.'], ['“Finally, it’s done.”', 'Thank him for his time.'], ['“Thanks,” without looking up.', 'Look at him and say it warmly.']],
        why: 'Thanking family members makes a home feel kinder.', sc: ['home', ['A', 'walt']] }
    ],
    tf: [
      ['Family manners are the ones we practice most.', true, 'We see our family every day.'],
      ['You only need to help with chores that are assigned to you.', false, 'Noticing what needs doing and doing it is a family courtesy.'],
      ['Saying thank you to family members matters just as much as thanking guests.', true, 'It makes home feel kinder.'],
      ['Doing a chore without being asked twice saves the people you live with time and trouble.', true, 'Nobody has to keep reminding you.']
    ],
    why: [
      { custom: 'In a family, everyone does a share of the chores.', ok: 'A home runs on many small jobs, and when everyone helps, nobody carries all of it.', no: ['Chores keep kids busy.', 'It is a law.', 'Only parents should do chores.'], expl: 'Family manners are the ones we practice most.' }
    ],
    order: [
      { title: 'Clearing the table after dinner:', steps: ['Wait until everyone has finished, or ask to be excused.', 'Carry your own plate and silverware to the kitchen.', 'Scrape leftovers into the trash or compost.', 'Bring in the serving dishes and wipe the table.'] },
      { title: 'Doing the laundry chore well:', steps: ['Take the clean clothes out of the dryer.', 'Fold them neatly.', 'Sort them into piles for each person.', 'Put your own pile away.'] }
    ],
    all: [
      { ask: 'Which of these are good family manners? Select all that apply.', okLabel: 'Good family manners',
        ok: ['Doing a chore without being asked twice.', 'Taking out a full trash bag even when it isn’t {Ahis} turn.', 'Thanking Mom for a ride.', 'Clearing {Ahis} own plate.'],
        no: [['Saying “Not my job” when a sibling needs help.', 'Pitch in.'], ['Leaving dishes in the sink for someone else.', 'Take care of your own.'], ['Complaining every time {Ahe} is asked.', 'Help cheerfully.'], ['Never saying thank you at home.', 'Thanks matter at home too.']] }
    ]
  });


  // ================================================================ Unit 8: Public Places
  T('growing.lines-crowds', {
    hint: 'First come, first served: join at the end, leave a little space, bag close, no saving places for latecomers.',
    items: [
      { s: '{A} is near the front of the line for {show} tickets. {B} and {C} arrive and want to join {Ahim}.', ask: 'What should {A} do?',
        ok: ['Say, “The line starts back there. I’ll wait for you inside,” or go to the back with them.'],
        near: [['Wave them in; it’s only two people.', 'Each person who joins in front makes everyone behind wait longer.'], ['Let them in if they promise to be quick.', 'The people behind still wait longer.'], ['Ask the people behind if it’s okay, then let them in anyway.', 'It puts strangers on the spot.']],
        rude: [['Shout, “Over here, guys! Cut in!”', 'Cutting is unfair to everyone who waited.']],
        why: 'A line is first come, first served, which is fair to everyone.', sc: ['street', ['A', 'B', 'C']] },
      { s: '{A} arrives at the cafeteria, and there is a long line.', ask: 'What should {A} do?',
        ok: ['Walk to the end of the line and wait {Ahis} turn.'],
        near: [['Slip in next to a friend in the middle.', 'That is cutting, even with a friend.'], ['Stand next to the line and hope to be let in.', 'Join at the end.'], ['Push gently toward the front.', 'Pushing in a line isn’t fair or safe.']],
        why: 'Joining at the end is what makes a line fair.', sc: ['classroom', ['A', 'B', 'C']] },
      { s: 'The hallway is packed after an assembly. {A} is carrying a big backpack.', ask: 'What is the polite way to move through the crowd?',
        ok: ['Keep to the right, hold the bag close, and say “Excuse me” if {Ahe} bumps someone.'],
        near: [['Swing the backpack to clear a path.', 'It can hit people.'], ['Stop in the middle to wait for friends.', 'Step to the side instead.'], ['Run to get ahead of everyone.', 'Running in a crowd is unsafe.']],
        why: 'In a crowd everyone is short on room; keeping right and holding your bag close helps everyone.' },
      { s: 'The person in front of {A} in line steps away for a moment to grab a napkin and asks {A} to hold the spot.', ask: 'What is the usual custom?',
        ok: ['Holding one spot for someone who steps away briefly is widely accepted.'],
        near: [['It is never allowed; the spot is lost.', 'For a brief moment, holding one spot is generally fine.'], ['{A} may now hold spots for five more friends.', 'Holding a spot for a group of latecomers is not fair.'], ['{A} should take the spot for {Aself}.', 'That would be unkind.']],
        why: 'A brief step away is different from friends arriving late and joining in front.' }
    ],
    tf: [
      ['Saving places in line for friends who arrive later is fair.', false, 'Each person who joins in front makes everyone behind wait longer.'],
      ['Leaving a little space between you and the person in front is polite.', true, 'It avoids bumping.'],
      ['In a crowd, holding your bag close helps you avoid bumping people.', true, 'Everyone is short on room.'],
      ['A line works because it is first come, first served.', true, 'That is what makes it fair.']
    ],
    why: [
      { custom: 'People join a line at the end instead of joining friends near the front.', ok: 'Each person who joins in front makes everyone behind wait longer, so joining at the end is fair.', no: ['The end of the line is closer to the door.', 'Friends get tired of saving spots.', 'It is a rule only for adults.'], expl: 'A line is a simple, fair system that only works when everyone plays fair.' }
    ],
    all: [
      { ask: 'Which of these are polite in a line? Select all that apply.',
        ok: ['Joining at the end.', 'Leaving a little space ahead.', 'Holding {Ahis} bag close.', 'Moving up when the line moves.'],
        no: [['Waving friends into {Ahis} spot.', 'Others wait longer.'], ['Standing so close {Ahe} bumps people.', 'Leave space.'], ['Walking to the front and pretending not to see the line.', 'That is cutting.'], ['Stretching out to save room for a group.', 'Save no places for latecomers.']] }
    ]
  });

  T('growing.doors-elevators', {
    hint: 'Hold the door for the person right behind you; let people off the elevator first.',
    items: [
      { s: 'The elevator doors open, and three people inside are about to get off. {A} is in a hurry.', ask: 'What should {A} do?',
        ok: ['Step to the side and let them off, then get on.'],
        near: [['Step in right away to save time.', 'The people inside can’t get out, which slows everyone.'], ['Stand right in front of the doors.', 'Stand to the side so people can exit.'], ['Hold the doors and squeeze past them.', 'Let them off first.']],
        rude: [['Push in and say, “I’m late.”', 'Pushing is rude and unsafe.']],
        why: 'People inside need to get out before there is room for anyone to get in.', sc: ['office', ['A', 'nora', 'james']] },
      { s: '{A} walks through the library door. Mr. Diaz is a few steps behind with a big box.', ask: 'What should {A} do?',
        ok: ['Hold the door open and stand aside until he’s through.'],
        near: [['Let the door swing shut; he can manage.', 'Holding a door takes two seconds and saves him from it swinging into him.'], ['Hold the door but stand in the doorway.', 'Stand aside so he can get through.'], ['Tell him to hurry.', 'Let him come at his own pace.']],
        why: 'Holding a door is a small courtesy that matters most when someone’s hands are full.', sc: ['library', ['A', 'diaz'], { holds: { 1: 'gift' } }] },
      { s: '{A} gets on a crowded elevator, and an older woman gets on after {Ahim}.', ask: 'What is a kind thing to do?',
        ok: ['Ask, “Which floor?” and press the button for her.'],
        near: [['Press {Ahis} own floor and ignore her.', 'Offering to press the button is a small kindness.'], ['Press every button.', 'It makes everyone stop at every floor.'], ['Stand in front of the buttons so no one can reach.', 'Move aside or offer to press.']],
        why: 'Pressing the button for others is a small courtesy in a crowded space.', sc: ['office', ['A', 'june']] },
      { s: 'Someone holds a door for {A} at the store.', ask: 'What should {A} do?',
        ok: ['Say “Thank you” as {Ahe} goes through.'],
        near: [['Walk through without a word.', 'Thanks shows you noticed.'], ['Stop and hold the door for them to go first.', 'They held it for {A}; go through and thank them.'], ['Wait for them to go through first.', 'It leaves them standing there.']],
        why: 'A thank-you acknowledges the kindness.', sc: ['store', ['A', 'kofi']] }
    ],
    tf: [
      ['When the elevator opens, let people get off before you get on.', true, 'It makes things faster for everyone.'],
      ['Holding a door for the person right behind you is polite.', true, 'It saves them from a door swinging into them.'],
      ['You must wait a long time at a door for someone who is far away.', false, 'If they are far away, you don’t need to wait; it can make them rush.'],
      ['Standing right in front of the elevator doors helps you get on faster without slowing anyone.', false, 'Stand to the side so people can get off.']
    ],
    why: [
      { custom: 'People wait beside the elevator doors and let riders off before they get on.', ok: 'There is no room to get in until the people inside get out, so waiting makes it faster for everyone.', no: ['Elevators break if too many people are inside.', 'It is a rule only in hotels.', 'It lets you see who is inside.'], expl: 'Small spaces work best with simple customs.' }
    ],
    order: [
      { title: 'Taking the elevator:', steps: ['Stand to the side of the doors while you wait.', 'Let everyone get off first.', 'Step in and move toward the back.', 'Press the button for others who ask.', 'Step aside at each stop so people can get out.'] }
    ],
    all: [
      { ask: 'Which of these are polite at doors and elevators? Select all that apply.',
        ok: ['Holding the door for the person right behind.', 'Letting people off the elevator first.', 'Asking, “Which floor?”', 'Saying “Thank you” when someone holds a door.'],
        no: [['Rushing in as soon as the doors open.', 'Let people off first.'], ['Letting a door swing into someone with full hands.', 'Hold it.'], ['Standing in the doorway to chat.', 'Step aside.'], ['Pressing every button for fun.', 'It stops everyone at every floor.']] }
    ]
  });

  T('growing.sidewalks', {
    hint: 'Keep right, don’t block the path, step aside to stop, and clean up after yourself.',
    items: [
      { s: '{A}, {B} and {C} are walking side by side when someone with a stroller comes toward them.', ask: 'What should they do?',
        ok: ['Move into single file or pairs on the right so the stroller can pass.'],
        near: [['Keep walking three across; the stroller can go on the grass.', 'A group spread across the path forces others off it.'], ['Stop where they are and let her go around.', 'Make room on the path.'], ['Split up, one on each side, so she goes through the middle.', 'Keep to the right together.']],
        why: 'Keeping right and making room lets everyone use the path.', sc: ['street', ['A', 'B', 'C']] },
      { s: '{A} needs to check a map on {Ahis} phone on a busy sidewalk.', ask: 'What should {A} do?',
        ok: ['Step to the side, out of the flow, check the map, then rejoin.'],
        near: [['Stop right in the middle and check it.', 'Everyone behind has to swerve.'], ['Walk slowly while staring at the phone.', 'It is easy to bump people; step aside instead.'], ['Stand in a doorway to check it.', 'Doorways need to stay clear.']],
        why: 'Stopping in the middle of a busy path is like stopping in a doorway.', sc: ['street', ['A', 'kofi'], { holds: { 0: 'phone' } }] },
      { s: '{A} finishes a snack at the park, and the wrapper is in {Ahis} hand.', ask: 'What should {A} do?',
        ok: ['Put it in a trash can, or carry it home if there isn’t one.'],
        near: [['Leave it on the bench; someone will clean it up.', 'Litter becomes someone else’s job.'], ['Tuck it under a rock.', 'It is still litter.'], ['Drop it near a trash can.', 'Put it in the can.']],
        why: 'Cleaning up after yourself keeps shared places nice for everyone.', sc: ['park', ['A', 'B']] },
      { s: '{A} hears “On your left!” from a bike coming up behind {Ahim} on a shared path.', ask: 'What should {A} do?',
        ok: ['Keep to the right so the bike can pass on the left.'],
        near: [['Step to the left to look.', 'That puts {A} in the bike’s way.'], ['Stop in the middle of the path.', 'Keep right and keep moving.'], ['Ignore it.', 'Make sure the bike has room.']],
        why: '“On your left” means the rider will pass on {A}’s left, so {A} stays right.' }
    ],
    tf: [
      ['On a shared path or sidewalk, the custom in the U.S. is to keep to the right.', true, 'People going opposite ways then pass easily.'],
      ['It is fine for a group to walk four across on a busy sidewalk.', false, 'It forces others off the path.'],
      ['If you need to stop, step to the side.', true, 'Then people behind you can keep going.'],
      ['Leaving a scooter in the middle of the sidewalk is fine if you come back soon.', false, 'Someone could trip over it.']
    ],
    why: [
      { custom: 'People keep to the right on sidewalks and shared paths.', ok: 'When everyone keeps right, people going opposite ways pass easily.', no: ['The right side is cleaner.', 'It is the only side with shade.', 'It is a rule only for bikes.'], expl: 'Shared spaces work when everyone follows the same simple pattern.' }
    ],
    all: [
      { ask: 'Which of these are polite on a shared path? Select all that apply.',
        ok: ['Walking on the right.', 'Stepping aside to text.', 'Throwing trash in a can.', 'Going single file to let someone pass.'],
        no: [['Walking four across.', 'Leave room for others.'], ['Stopping in a doorway to chat.', 'Step out of the way.'], ['Leaving a bike lying across the path.', 'Someone could trip.'], ['Dropping a wrapper on the ground.', 'Use a trash can.']] }
    ]
  });

  T('growing.movies-shows', {
    hint: 'Arrive on time, phone off and dark, talk afterward, and clap at the right moments.',
    items: [
      { s: 'The movie has started, and {A}’s phone buzzes.', ask: 'What should {A} do?',
        ok: ['Leave it in {Ahis} pocket and check it after the movie.'],
        near: [['Check it quickly with the screen turned down low.', 'Even a dim screen is bright in a dark theater.'], ['Whisper to {B} about the message.', 'Whispers carry; save it for after.'], ['Answer it quietly.', 'Talking in a theater bothers everyone.']],
        rude: [['Read the message out loud.', 'It disturbs the whole row.']],
        why: 'A dark, quiet theater lets everyone enjoy the movie.', sc: ['theater', ['A', 'B'], { holds: { 0: 'phone' } }] },
      { s: '{A} arrives at {show} just after it has started.', ask: 'What should {A} do?',
        ok: ['Wait for a break or an usher, then move quietly to a seat with a soft “Excuse me.”'],
        near: [['Walk down the aisle right away and climb over people.', 'Wait for a pause so the show isn’t interrupted.'], ['Call out to {Ahis} family to find their seats.', 'Calling out disturbs the audience.'], ['Use the phone flashlight to find a seat.', 'The light distracts everyone.']],
        why: 'Waiting for a pause and moving quietly keeps the interruption small.', sc: ['hall', ['A', 'B']] },
      { s: 'At a band concert, {A} isn’t sure when to clap.', ask: 'What is the best plan?',
        ok: ['Clap when a whole piece ends, and follow the audience when unsure.'],
        near: [['Clap every time the music gets quiet.', 'A quiet part may be the middle of the piece.'], ['Never clap, to be safe.', 'Applause thanks the performers.'], ['Clap whenever {Ahe} likes a part, even mid-song.', 'At concerts, people usually wait for the end of a piece.']],
        why: 'Applause at the end of a piece is how an audience thanks the performers.', sc: ['hall', ['A', 'june']] },
      { s: 'During a movie, {B} keeps whispering jokes to {A}.', ask: 'What can {A} do?',
        ok: ['Whisper once, “Tell me after,” and keep watching.'],
        near: [['Laugh loudly at each joke.', 'It disturbs the people around them.'], ['Start whispering back.', 'Save talking for afterward.'], ['Shush {B} loudly.', 'A loud shush disturbs others too.']],
        why: 'A quick “tell me after” keeps the theater quiet for everyone.', sc: ['theater', ['A', 'B']] }
    ],
    tf: [
      ['A phone screen in a dark theater can bother the people behind you.', true, 'Even a dim screen is bright in the dark.'],
      ['Whispering through a movie is fine if it is quiet.', false, 'Whispers carry; save talking for afterward.'],
      ['Arriving on time means you don’t have to climb past people after the show starts.', true, 'It keeps the show uninterrupted.'],
      ['At a concert, people usually clap when a whole piece is finished.', true, 'When unsure, follow the audience.']
    ],
    why: [
      { custom: 'In a theater, people keep their phones off and out of sight.', ok: 'In the dark, a phone’s light pulls everyone’s attention away from the show.', no: ['Phones break in the dark.', 'Theaters might take them.', 'Actors can read your messages.'], expl: 'Everyone in the audience came for the same experience.' }
    ],
    order: [
      { title: 'Going to a play:', steps: ['Arrive before the show starts.', 'Find your seat and unwrap any snacks.', 'Silence your phone and put it away.', 'Watch quietly during the show.', 'Clap at the end.'] }
    ],
    all: [
      { ask: 'At a movie or show, which of these are polite? Select all that apply.',
        ok: ['Arriving on time.', 'Turning {Ahis} phone off.', 'Saving comments for afterward.', 'Clapping at the end of the show.', 'Unwrapping snacks before the show starts.'],
        no: [['Checking messages during the show.', 'The screen light bothers others.'], ['Talking through the movie.', 'Save it for after.'], ['Putting {Ahis} feet on the seat in front.', 'That seat is someone else’s.'], ['Using a phone flashlight to find a seat.', 'Ask an usher instead.']] }
    ]
  });


  // ================================================================ Unit 9: The Flag and the Anthem
  var FLAG_Q = { wall: 'hung flat on a wall', vertical: 'hung vertically on a wall', staff: 'flown on a staff', crossed: 'shown with another flag on crossed staffs', platform: 'standing on a staff beside a speaker on a platform' };
  function flagAB(R, ctx, v, shows) {
    var show = R.pick(shows), right = R.pick(['A', 'B']), F = E().FLAG;
    var rule = F[show === 'vertical' ? 'wall' : show];
    return {
      q: 'Pictures A and B show the U.S. flag ' + FLAG_Q[show] + '. <b>Which picture follows the Flag Code?</b>',
      a: { t: 'mc', choices: ['A', 'B'], v: right === 'A' ? 0 : 1, keep: true },
      steps: ['Picture ' + right + ' follows the Flag Code.', rule],
      viz: { name: 'et-flag', opts: { show: show, compare: true, right: right, quiet: true, interactive: false } },
      _flag: show
    };
  }
  T('growing.pledge-anthem', {
    hint: 'Stand, face the flag (or the music), right hand over the heart, hat off; people in uniform salute.',
    items: [
      { s: '{A} is wearing a baseball cap at a game when the national anthem begins.', ask: 'What does the custom ask?',
        ok: ['Stand, face the flag, take the cap off, and place the right hand over the heart.'],
        near: [['Keep the cap on and sit quietly.', 'The custom is to stand, and most people remove hats.'], ['Stand and put the left hand over the heart.', 'It is the right hand.'], ['Stand, face the crowd, and wave the cap.', 'Face the flag and stay still.']],
        rude: [['Keep talking with {B} during the song.', 'Talking distracts the people taking part.']],
        why: 'Standing, facing the flag, hat off and right hand over the heart is what the Code describes.', sc: ['park', ['A', 'B'], { pose: { 0: 'heart', 1: 'heart' }, props: [{ kind: 'flag', x: 520, y: 120, s: 2.5 }] }] },
      { s: 'At an indoor event, the anthem plays but there is no flag in the room.', ask: 'Which way should {A} face?',
        ok: ['Toward the music.'],
        near: [['Toward the door.', 'With no flag displayed, the Code says to face toward the music.'], ['Toward the nearest window.', 'Face the music.'], ['It doesn’t matter, so {A} can stay seated.', 'Stand and face the music.']],
        why: '36 U.S.C. § 301 says that when no flag is displayed, people face toward the music.' },
      { s: '{A}’s neighbor, who is in the military, is in uniform at the parade when the flag passes.', ask: 'What does the Code describe for a person in uniform?',
        ok: ['A military salute.'],
        near: [['Right hand over the heart, like everyone else.', 'People in uniform give the military salute.'], ['Waving at the flag.', 'The Code describes a salute.'], ['Kneeling.', 'The Code describes standing and saluting.']],
        why: 'The Code asks people in uniform to salute and others to put the right hand over the heart.' },
      { s: 'During the Pledge at an assembly, {B} quietly does not say the words.', ask: 'What should {A} do?',
        ok: ['Say the Pledge {Aself} if {Ahe} chooses, and leave {B} alone; people may choose not to say it.'],
        near: [['Tell {B} loudly to say it.', 'Some people choose not to say the Pledge; a public school cannot require it.'], ['Report {B} to the principal.', 'Choosing not to say it is allowed.'], ['Stop saying it too, to be fair.', '{A}’s choice is {Ahis} own.']],
        why: 'In 1943 the Supreme Court decided public schools cannot require students to say the Pledge. Respecting others’ choices quietly is good manners.', sc: ['classroom', ['A', 'B'], { pose: { 0: 'heart' } }] }
    ],
    tf: [
      ['During the Pledge, people stand facing the flag with the right hand over the heart.', true, 'That is what 4 U.S.C. § 4 describes.'],
      ['During the anthem, if no flag is displayed, people face toward the music.', true, '36 U.S.C. § 301 says so.'],
      ['The Flag Code punishes people who don’t follow its customs.', false, 'The Code describes customs for civilians; it has no penalties.'],
      ['People in uniform salute during the Pledge.', true, 'Others place the right hand over the heart.'],
      ['The Code asks people to put the left hand over the heart.', false, 'It is the right hand.']
    ],
    why: [
      { custom: 'During the national anthem, people stand quietly, facing the flag.', ok: 'Standing still and quiet together is a shared sign of respect, and it avoids distracting others who are taking part.', no: ['The music is too loud to talk.', 'People can see the flag better that way.', 'It is the only way to hear the words.'], expl: 'Shared customs are a way of showing respect together.' }
    ],
    order: [
      { title: 'When the anthem begins at a game:', steps: ['Stop talking.', 'Stand up.', 'Take off your cap.', 'Face the flag.', 'Place your right hand over your heart until the song ends.'] }
    ],
    all: [
      { ask: 'Which of these does the U.S. Code describe for the national anthem? Select all that apply.', okLabel: 'Described in the Code', noLabel: 'Not what the Code describes',
        ok: ['Standing at attention.', 'Facing the flag.', 'Right hand over the heart.', 'Facing the music when no flag is shown.', 'A military salute for people in uniform.'],
        no: [['Left hand over the heart.', 'It is the right hand.'], ['Sitting if you are tired.', 'The Code describes standing.'], ['Clapping along with the music.', 'Stand quietly until it ends.'], ['Turning to face the crowd.', 'Face the flag.']] }
    ]
  });

  T('growing.flag-display', {
    hint: 'On a wall, horizontal or vertical: the union at the top, on the viewer’s left. On a staff: the union at the peak.',
    custom: { ab: function (R, ctx, v) { return flagAB(R, ctx, v, ctx.level === 1 ? ['wall', 'vertical'] : ['wall', 'vertical', 'staff', 'crossed', 'platform']); } },
    items: [
      { s: '{A}’s class hangs the flag vertically on the wall.', ask: 'Where does the union (the blue field of stars) go?',
        ok: ['At the top, on the left as you look at it.'],
        near: [['At the top, on the right as you look at it.', 'That is the classic mistake; the union is at the flag’s own right, the viewer’s left.'], ['At the bottom left.', 'The union is always uppermost on a wall.'], ['In the middle.', 'It goes at the top left as you look at it.']],
        why: 'Vertical or horizontal, on a wall the union is uppermost and at the flag’s own right: the viewer’s left (4 U.S.C. § 7(i)).' },
      { s: '{A} raises the flag on a pole at a scout meeting.', ask: 'Where does the union go?',
        ok: ['At the peak, the top of the pole, next to the staff.'],
        near: [['At the bottom, next to the staff.', 'Union down is a signal of dire distress.'], ['At the top, away from the staff.', 'The union is next to the staff.'], ['Either way is fine.', 'The union goes at the peak.']],
        why: 'On a staff, the union is at the peak. Union down is used only as a signal of dire distress (§ 8(a)).' },
      { s: 'A flag on a staff stands on a stage beside a speaker who is facing the audience.', ask: 'Where does it go?',
        ok: ['At the speaker’s right, which is the audience’s left.'],
        near: [['At the speaker’s left, the audience’s right.', 'The place of honor is the speaker’s right.'], ['Behind the audience.', 'It stands on the platform.'], ['Anywhere, as long as it is visible.', 'The Code gives the speaker’s right.']],
        why: '4 U.S.C. § 7(k): the flag on a staff stands in the place of honor at the speaker’s right as they face the audience.' },
      { s: '{A} and {B} are setting up the stage for an assembly. Ms. Park will speak from the podium, facing the audience, and the flag on its stand goes beside her.', ask: 'Which side?',
        ok: ['Ms. Park’s right as she faces the audience, which is the audience’s left.'],
        near: [['Ms. Park’s left as she faces the audience.', 'The place of honor is the speaker’s right.'], ['Behind the last row of seats.', 'It stands on the platform with the speaker.'], ['Either side, as long as it is visible.', 'The Code names the speaker’s right.']],
        why: '4 U.S.C. § 7(k) puts a flag on a staff at the speaker’s right as the speaker faces the audience.' },
      { s: 'A family displays the flag flat in a front window.', ask: 'How should it look from the street?',
        ok: ['With the union at the top left, as seen by a person in the street.'],
        near: [['With the union at the top right, as seen from the street.', 'From the street, the union should be at the observer’s left.'], ['With the union at the top left, as seen from inside the house.', 'The Code is about the view from the street.'], ['Upside down, so people inside can read it.', 'Never upside down except as a distress signal.']],
        why: '4 U.S.C. § 7(i): in a window, the union is to the left of the observer in the street.' }
    ],
    tf: [
      ['{A} hangs the flag horizontally on {Ahis} bedroom wall with the stars at the top left as {Ahe} faces it. That follows the Flag Code.', true, 'On a wall, the union is at the top and on the viewer’s left.'],
      ['{A} hangs the flag vertically, with the stars at the top right as {Ahe} faces it. That follows the Flag Code.', false, 'Vertical or horizontal, the union goes at the top left as you face it.'],
      ['When the flag hangs vertically on a wall, the union goes at the top left as you look at it.', true, 'Uppermost and at the flag’s own right: the viewer’s left.'],
      ['On a wall, the union should be on the viewer’s right.', false, 'It goes on the viewer’s left.'],
      ['Flying the flag upside down is a signal of dire distress.', true, 'Otherwise it is never flown union down.'],
      ['On a speaker’s platform, a flag on a staff stands at the speaker’s right.', true, 'That is the place of honor.']
    ],
    why: [
      { custom: 'On a wall, the flag’s union goes at the top and at the flag’s own right (the viewer’s left).', ok: 'The union is the flag’s honored part, and the top and the right are the places of honor.', no: ['So the stars don’t fade in the sun.', 'So it is easier to fold.', 'Because most walls face north.'], expl: 'Imagine the flag as a person facing you: its right hand is on your left.' }
    ],
    levels: { 1: ['ab', 'tf', 'items'], 2: ['ab', 'items', 'why', 'tf'], 3: ['ab', 'items'] }
  });

  T('growing.flag-care', {
    hint: 'Keep it off the ground, fly it sunrise to sunset unless it is lit, and retire a worn flag with dignity.',
    items: [
      { s: 'While folding the class flag, {A} and {B} let a corner touch the floor.', ask: 'What should they do?',
        ok: ['Pick it up and check it; a clean, undamaged flag can still be flown.'],
        near: [['Throw it away; a flag that touches the ground must be destroyed.', 'That is a myth. The Code asks only that it be kept from touching the ground.'], ['Burn it right away.', 'Only a worn flag is retired; this one is fine.'], ['Report themselves to the principal.', 'The Code has no penalties; just pick it up.']],
        why: 'The Code asks that the flag be kept from touching the ground; it doesn’t say one that touches must be destroyed.', sc: ['classroom', ['A', 'B']] },
      { s: '{A}’s family wants to leave their flag up overnight.', ask: 'What does the Flag Code say?',
        ok: ['It may fly day and night if it is properly lit after dark.'],
        near: [['It must always come down at sunset, no matter what.', 'It may stay up if it is lit at night.'], ['It must fly day and night at every home.', 'The custom is sunrise to sunset, unless lit.'], ['It may stay up only on holidays.', 'Lighting, not the date, is what matters.']],
        why: '4 U.S.C. § 6(a): the custom is sunrise to sunset; it may fly day and night if properly lit.' },
      { s: '{A}’s family flag is faded and torn after years outside.', ask: 'What does the Flag Code suggest?',
        ok: ['Retire it in a dignified way, preferably by burning, such as at a flag retirement ceremony.'],
        near: [['Throw it in the trash.', 'The Code asks for a dignified retirement.'], ['Keep flying it until it falls apart.', 'A flag too worn to fly should be retired.'], ['Cut it up for rags.', 'The flag isn’t used as cloth for other jobs.']],
        why: '4 U.S.C. § 8(k): a flag too worn to fly is destroyed in a dignified way, preferably by burning. Many veterans’ groups and scout troops hold retirement ceremonies.' },
      { s: 'A big storm is coming, and {A}’s family flies an ordinary flag, not an all-weather flag.', ask: 'What does the Code suggest?',
        ok: ['Take it down during the bad weather.'],
        near: [['Leave it up; storms don’t matter.', 'The Code suggests not flying it in bad weather unless it is an all-weather flag.'], ['Fly it upside down.', 'Upside down is only a distress signal.'], ['Fly it at half-staff.', 'Half-staff is for mourning, not weather.']],
        why: '4 U.S.C. § 6(c): the flag is not displayed in bad weather unless it is an all-weather flag.' }
    ],
    custom: {
      half: function (R, ctx, v) {
        var steps = ['Raise the flag all the way to the peak.', 'Lower it slowly to half-staff.', 'At the end of the day, raise it to the peak again.', 'Lower it slowly and take it down.'];
        var it = { title: 'Flying the flag at half-staff for a day:', steps: steps };
        var p = orderQ(R, ctx, it, v, 'A half-staff flag always goes to the peak first.');
        p.steps.push('4 U.S.C. § 7(m): hoist to the peak for an instant, then lower to half-staff; raise to the peak again before lowering for the day.');
        return p;
      }
    },
    tf: [
      ['If the flag touches the ground, it must be destroyed.', false, 'That is a myth. Keep it off the ground; a clean, undamaged flag can still be flown.'],
      ['The flag may fly at night if it is properly lit.', true, '4 U.S.C. § 6(a).'],
      ['A flag too worn to fly should be retired in a dignified way.', true, 'Preferably by burning, 4 U.S.C. § 8(k).'],
      ['To put a flag at half-staff, you raise it to the peak first.', true, 'Then lower it to half-staff (§ 7(m)).'],
      ['The Flag Code has fines for people who break its rules.', false, 'It is guidance for civilians, with no penalties.']
    ],
    why: [
      { custom: 'The Flag Code asks that the flag never touch the ground or the floor.', ok: 'Keeping it off the ground keeps it clean and shows respect for what it stands for.', no: ['Flags are easier to fold in the air.', 'The ground is bad luck.', 'Touching the ground makes the colors run.'], expl: 'Each care custom is a sign of respect.' }
    ],
    all: [
      { ask: 'Which of these follow the Flag Code’s care customs? Select all that apply.', okLabel: 'Follows the Code', noLabel: 'Does not',
        ok: ['Keeping the flag from touching the ground.', 'Lighting a flag that flies at night.', 'Retiring a worn flag at a ceremony.', 'Taking an ordinary flag down in a storm.'],
        no: [['Throwing a worn flag in the trash.', 'Retire it with dignity.'], ['Using the flag as a picnic blanket.', 'The Code says it is not used as clothing or bedding.'], ['Flying it upside down for decoration.', 'Union down is only a distress signal.'], ['Leaving it up all night in the dark.', 'Light it, or take it down at sunset.']] }
    ],
    levels: { 1: ['items', 'tf', 'why'], 2: ['items', 'tf', 'half', 'all'], 3: ['half', 'all', 'items'] }
  });

})(typeof window !== 'undefined' ? window.MathLadder : global.MathLadder);

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
  var CFG = {"prefix":"growing.","only":["starting-conversation","listening-well","sharing-the-talk","topics-to-skip","ending-conversation","introducing-yourself","eye-contact","handshake","remembering-names","addressing-adults","standing-poise","sitting-well","entering-room","standing-to-greet","setting-table","using-utensils","reaching-elbows","table-mishaps","thanking-cook","phone-calls","video-calls","phones-around-people","friends-over","sleepovers","birthday-invitations","giving-gifts","receiving-gifts","apologizing","disagreeing","sportsmanship","school-teachers","respect-elders","helping-home","lines-crowds","doors-elevators","sidewalks","movies-shows","pledge-anthem","flag-display","flag-care"]};
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
