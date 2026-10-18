/* Etiquette for Teens and Adults (Etiquette Ladder, course key adult): problem generators for all 55 topics.
   Built from /tmp/work_etiquette/adult/gen/*.js by build_gen.js (do not edit the shipped file by hand).
   Every scene is original. Names come from the kit's cast (MathLadder.etiquette.CAST); details are drawn at random.
   Shapes: a scene with choices (mc), "select all that are polite" (mc, several right), "is this polite?" (tf), the reason
   behind a custom (mc), steps in order (et-order, quiet, lettered; typed as letters), spot the impolite line (et-scene
   lines), choose a reply (et-text), and topic pieces (place settings, rest positions, envelopes, introductions, note parts,
   dress codes, tips). Single right answers only for well-established conventions; where customs vary, the question asks
   for the reasoning or several answers are right (see /tmp/work_etiquette/overview.md). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, U = ML.util;
  function EM() { return ML.etiquette || {}; }

  // ---------------------------------------------------------------- the cast, as grown-ups and teens
  var PEERS = ['mia', 'leo', 'sam', 'ruby', 'omar', 'hana', 'nora', 'james', 'priya', 'kofi', 'rosa'];
  var ELDERS = ['june', 'walt', 'diaz', 'park', 'bell'];
  var KIDS = ['mia', 'leo', 'sam', 'ruby', 'omar', 'hana'];
  var INFO = { // first names and pronouns as the adult course uses them (elders by title)
    mia: ['Mia', 'she'], leo: ['Leo', 'he'], sam: ['Sam', 'he'], ruby: ['Ruby', 'she'], omar: ['Omar', 'he'], hana: ['Hana', 'she'],
    nora: ['Nora', 'she'], james: ['James', 'he'], priya: ['Priya', 'she'], kofi: ['Kofi', 'he'], rosa: ['Rosa', 'she'],
    june: ['Mrs. Hale', 'she'], walt: ['Mr. Hale', 'he'], diaz: ['Mr. Diaz', 'he'], park: ['Ms. Park', 'she'], bell: ['Dr. Bell', 'she']
  };
  var FULL = { mia: 'Mia Brooks', leo: 'Leo Novak', sam: 'Sam Rivera', ruby: 'Ruby Walsh', omar: 'Omar Haddad', hana: 'Hana Kim', nora: 'Nora Grant',
    james: 'James Reed', priya: 'Priya Shah', kofi: 'Kofi Mensah', rosa: 'Rosa Lopez', june: 'June Hale', walt: 'Walt Hale', diaz: 'Luis Diaz', park: 'Grace Park', bell: 'Ada Bell' };
  var POOL = {
    food: ['lasagna', 'chili', 'roast chicken', 'vegetable curry', 'tacos', 'stir-fry', 'baked salmon', 'pasta with pesto'],
    dessert: ['apple pie', 'brownies', 'lemon bars', 'a fruit tart', 'chocolate cake', 'peach cobbler'],
    gift: ['a scarf', 'a cookbook', 'a set of mugs', 'a picture frame', 'a puzzle', 'a plant', 'a pair of gloves', 'a board game'],
    hostgift: ['a box of chocolates', 'a jar of local honey', 'a potted herb', 'a bag of good coffee', 'a candle', 'flowers already in a vase'],
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    city: ['Denver', 'Chicago', 'Atlanta', 'Portland', 'Boston', 'Austin', 'Seattle', 'Phoenix'],
    hobby: ['hiking', 'baking', 'chess', 'gardening', 'photography', 'running', 'painting', 'birdwatching'],
    item: ['ladder', 'drill', 'camping tent', 'stand mixer', 'folding table', 'pressure washer', 'snow shovel', 'set of folding chairs'],
    street: ['22 Maple Street', '400 Oak Avenue', '17 Cedar Lane', '5 River Road', '31 Elm Street', '8 Hill Road', '62 Linden Drive', '14 Park Place'],
    cityline: ['Fairview, OH 44120', 'Rivertown, TX 75001', 'Lakeside, MI 49116', 'Hillsdale, NJ 07642', 'Springfield, IL 62701', 'Greenville, SC 29601', 'Madison, WI 53703', 'Salem, OR 97301'],
    event: ['a dinner party', 'a birthday dinner', 'a backyard barbecue', 'a holiday open house', 'a game night', 'a potluck supper']
  };
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function pron(k) { var p = INFO[k][1]; return p === 'she' ? { he: 'she', him: 'her', his: 'her', hers: 'hers' } : { he: 'he', him: 'him', his: 'his', hers: 'his' }; }
  // vars for one problem: roles A, B, C, D (cast keys), with names and pronouns, plus pools
  function cast(R, roles) {
    var used = {}, v = { _keys: [] };
    function take(list) { var ok = list.filter(function (k) { return !used[k]; }); var k = R.pick(ok.length ? ok : list); used[k] = 1; return k; }
    (roles || ['peer', 'peer']).forEach(function (r, i) {
      var k = r === 'peer' ? take(PEERS) : r === 'elder' ? take(ELDERS) : r === 'teen' || r === 'kid' ? take(KIDS) : r === 'any' ? take(PEERS.concat(ELDERS)) : (used[r] = 1, r);
      var L = 'ABCD'[i], P = pron(k);
      v._keys.push({ who: k, role: r });
      v[L] = INFO[k][0]; v[L + 'full'] = FULL[k]; v[L + 'title'] = ELDERS.indexOf(k) >= 0 && k === 'bell' ? 'Dr.' : P.he === 'she' ? 'Ms.' : 'Mr.'; v[L + 'he'] = P.he; v[L + 'him'] = P.him; v[L + 'his'] = P.his; v[L + 'hers'] = P.hers;
    });
    Object.keys(POOL).forEach(function (k) { var two = R.sample(POOL[k], 2); v[k] = two[0]; v[k + '2'] = two[1]; });
    v.giftthe = v.gift.replace(/^an? /, 'the ');
    return v;
  }
  function fill(s, v) { // {A}, {Ahe}, {Ahis}, {food}…; a value at the start of a sentence gets a capital letter
    return String(s).replace(/\{(\w+)\}/g, function (m, k, off, all) {
      if (v[k] === undefined) return m;
      var val = String(v[k]), before = all.slice(0, off);
      return (off === 0 || /[.!?]["”]?\s+$/.test(before) || /:\s+$/.test(before) || /(^|[.!?]\s+)["“]$/.test(before)) ? cap(val) : val;
    });
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function byL(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }

  // a quiet scene picture for a problem; roles from cast(); o: { place, poses: {i: pose}, holds: {i: prop}, moods, say, think, props }
  function scene(v, o) {
    var people = v._keys.map(function (pk, i) {
      var p = { who: pk.who };
      if (KIDS.indexOf(pk.who) >= 0) p.age = pk.role === 'teen' || pk.role === 'kid' ? (pk.role === 'kid' ? 'kid' : 'teen') : 'adult';
      if (ELDERS.indexOf(pk.who) >= 0 || pk.who === 'june' || pk.who === 'walt') p.name = INFO[pk.who][0];
      if (o.poses && o.poses[i]) p.pose = o.poses[i];
      if (o.holds && o.holds[i]) p.holds = o.holds[i];
      if (o.moods && o.moods[i]) p.mood = o.moods[i];
      if (o.flip && o.flip[i]) p.flip = true;
      return p;
    });
    if (o.n) people = people.slice(0, o.n);
    var opts = { place: o.place || 'plain', people: people, quiet: true, interactive: false, label: o.label || 'A scene with ' + people.map(function (p, i) { return v['ABCD'[i]]; }).join(' and ') };
    if (o.say) opts.say = o.say.map(function (s) { return [s[0], fill(s[1], v)]; });
    if (o.think) opts.think = o.think.map(function (s) { return [s[0], fill(s[1], v)]; });
    if (o.props) opts.props = o.props;
    if (o.lines) opts.lines = o.lines;
    return { name: 'et-scene', opts: opts };
  }

  // ---------------------------------------------------------------- problem shapes
  // a scene with choices. it: { p: place, r: roles, s: situation, q: question, ok: [right…], bad: [wrong… (most plainly rude first)] or
  //   [[wrong, reason]], why: the reason, poses, holds, moods, say, think }
  function scenarioP(R, ctx, it, T) {
    var v = cast(R, it.r), L = lvl(ctx);
    var right = fill(R.pick(it.ok), v);
    var bads = it.bad.map(function (b) { return Array.isArray(b) ? { t: fill(b[0], v), why: fill(b[1], v) } : { t: fill(b, v) }; });
    var pick;
    if (L === 1) pick = [bads[0]].concat(R.sample(bads.slice(1), Math.min(1, bads.length - 1)));
    else pick = bads.length > 3 ? [R.pick(bads.slice(0, 2))].concat(R.sample(bads.slice(2), 2)) : bads.slice();
    pick = U.uniq(pick.map(function (b) { return JSON.stringify(b); })).map(function (s) { return JSON.parse(s); });
    var q = fill(it.s, v) + ' ' + fill(it.q || 'What is the most courteous thing to do?', v);
    var steps = [T.principle, fill(it.why, v)];
    var w = pick.filter(function (b) { return b.why; })[0];
    if (w) steps.push(/["“]/.test(w.t) ? 'Why not this one: ' + w.t + ' ' + w.why : 'Why not “' + w.t.replace(/[.]$/, '') + '”? ' + w.why);
    steps.push('Best choice: ' + right);
    var p = { q: q, a: U.mc(right, pick.map(function (b) { return b.t; }), pick.length + 1), steps: steps, hint: it.hint || T.hint };
    if (it.p !== null) p.viz = scene(v, { place: it.p, poses: it.poses, holds: it.holds, moods: it.moods, say: it.say, think: it.think, props: it.props, n: it.n });
    return p;
  }
  // select all that are polite (vary items count as polite: they are acceptable ways), or all that are rude
  function itemT(x) { return Array.isArray(x) ? x[0] : x; }
  function itemW(x, T) { return Array.isArray(x) ? x[1] : (T.rudeWhy || 'it puts a burden or a slight on someone else'); }
  function selectAllP(R, ctx, T) {
    var L = lvl(ctx), good = (T.good || []).concat(T.fine || []), rude = T.rude || [];
    var askRude = (T.fine && T.fine.length && R.chance(0.5)) || (!good.length);
    var nG = L >= 3 ? R.int(2, 3) : 2, nB = L >= 3 ? R.int(2, 3) : 2;
    var g = R.sample(good, Math.min(nG, good.length));
    var b = R.sample(rude, Math.min(nB, rude.length));
    var all = R.shuffle(g.map(function (s) { return { s: itemT(s), good: true }; }).concat(b.map(function (s) { return { s: itemT(s), w: s, good: false }; })));
    var v = cast(R, ['peer', 'peer', 'peer']);
    var choices = all.map(function (x) { return fill(x.s, v); });
    var want = []; all.forEach(function (x, i) { if (askRude ? !x.good : x.good) want.push(i); });
    var q = fill(T.ctxLine || 'Think about the situation in this topic.', v) + ' ' + (askRude ? 'Which of these would most etiquette writers call <b>rude</b>? Select all that apply.' : 'Which of these are <b>polite</b>? Select all that apply.');
    var steps = [T.principle];
    all.forEach(function (x, i) { steps.push((x.good ? 'Polite: ' : 'Rude: ') + choices[i] + (x.good ? '.' : '. Why: ' + fill(itemW(x.w, T), v) + '.')); });
    if (T.fine && T.fine.length && askRude) steps.push('Where customs vary, more than one way is polite; only the clear slips are marked rude.');
    return { q: q, a: { t: 'mc', choices: choices, v: want, keep: true }, steps: steps, hint: T.hint };
  }
  function tfP(R, ctx, T) {
    var good = R.coin() && T.good && T.good.length, s = good ? R.pick(T.good) : R.pick(T.rude);
    var v = cast(R, ['peer', 'peer']);
    var line = fill(itemT(s), v);
    return { q: (T.ctxLine ? fill(T.ctxLine, v) + ' ' : '') + 'Is this polite?<br><b>' + line + '</b>', a: { t: 'tf', v: !!good }, steps: [T.principle, good ? 'Yes: it shows consideration for the people around you.' : 'No: ' + fill(itemW(s, T), v) + '.'], hint: T.hint };
  }
  // the reason behind a custom. it: { q, a: right reason, w: [wrong reasons] }
  function whyP(R, ctx, it, T) {
    var L = lvl(ctx), v = cast(R, ['peer', 'peer']);
    var w = R.sample(it.w, Math.min(L === 1 ? 2 : 3, it.w.length));
    return { q: fill(it.q, v), a: U.mc(fill(it.a, v), w.map(function (x) { return fill(x, v); }), w.length + 1), steps: [T.principle, 'The reason: ' + fill(it.a, v)].concat(it.more ? [fill(it.more, v)] : []), hint: it.hint || 'Ask who the custom helps, and how.' };
  }
  // steps in order. it: { title, steps: [...] (right order), all: true (use every step), q }
  function orderP(R, ctx, it, T) {
    var L = lvl(ctx), v = cast(R, it.r || ['peer', 'peer']);
    var steps = it.steps.map(function (s) { return fill(s, v); }), n = steps.length;
    var k = it.all ? n : Math.min(n, byL(ctx, 4, 5, 6));
    var keep = U.range(0, n - 1).filter(function () { return true; });
    if (k < n) { keep = R.sample(keep, k).sort(function (a, b) { return a - b; }); }
    var items = keep.map(function (i) { return steps[i]; });
    // the shown order: never the right order, and the first step is never shown as A (so the answer never starts with A)
    var start;
    for (var t = 0; t < 50; t++) { start = R.shuffle(U.range(0, k - 1)); if (start[0] !== 0 && start.some(function (x, j) { return x !== j; })) break; }
    var pos = []; start.forEach(function (ix, p) { pos[ix] = p; });
    var ans = items.map(function (x, i) { return letter(pos[i]); });
    var word = ans.join('');
    var q = fill(it.q || 'Type the letters in the right order, as one word.', v);
    var p = { q: (it.title ? '<b>' + fill(it.title, v) + '</b><br>' : '') + q,
      a: { t: 'text', v: [word, ans.join(' '), ans.join(','), ans.join(', '), ans.join('-'), ans.join(' , ')] },
      viz: { name: 'et-order', opts: { items: items, start: start, quiet: true, interactive: false, label: 'Steps lettered ' + letter(0) + ' to ' + letter(k - 1) } },
      steps: [T.principle].concat(items.map(function (x, i) { return (i + 1) + '. ' + letter(pos[i]) + ': ' + x; })).concat(['Order: ' + word + (it.why ? '. ' + fill(it.why, v) : '')]), hint: it.hint || T.hint };
    return p;
  }
  // spot the impolite line. it: { p, r, lines: [[role index, text]], fault, why, intro }
  function spotP(R, ctx, it, T) {
    var v = cast(R, it.r || ['peer', 'peer']);
    var lines = it.lines.map(function (l) { return { who: l[0], text: fill(l[1], v) }; });
    var choices = lines.map(function (l, i) { return 'Line ' + (i + 1) + ' (' + v['ABCD'[l.who]] + ')'; });
    var p = { q: fill(it.intro || 'Read the conversation under the picture.', v) + ' Which line is <b>not</b> polite?',
      a: { t: 'mc', choices: choices, v: it.fault, keep: true },
      viz: scene(v, { place: it.p, lines: lines, poses: it.poses, holds: it.holds, label: 'A conversation in numbered lines' }),
      steps: [T.principle].concat(lines.map(function (l, i) { return 'Line ' + (i + 1) + ': ' + (i === it.fault ? 'not polite. ' + fill(it.why, v) : 'fine.'); })), hint: T.hint };
    p.viz.opts.mode = 'spot'; p.viz.opts.fault = it.fault;
    return p;
  }
  // choose the best reply on a phone screen. it: { kind, title, msgs: [[from role index | 'me', text]], q, ok, bad, why }
  function textP(R, ctx, it, T) {
    var v = cast(R, it.r || ['peer', 'peer']), L = lvl(ctx);
    var msgs = it.msgs.map(function (m) { return m[0] === 'me' ? { me: true, text: esc(fill(m[1], v)) } : { from: v['ABCD'[m[0]]], text: esc(fill(m[1], v)) }; });
    var right = fill(R.pick(it.ok), v), bads = it.bad.map(function (b) { return fill(Array.isArray(b) ? b[0] : b, v); });
    var pick = L === 1 ? [bads[0]].concat(R.sample(bads.slice(1), Math.min(1, bads.length - 1))) : R.sample(bads, Math.min(3, bads.length));
    return { q: ((it.s ? fill(it.s, v) + ' ' : '') + fill(it.q || 'Which reply is best?', v)).trim(),
      a: U.mc(right, pick, pick.length + 1),
      viz: { name: 'et-text', opts: { kind: it.kind || 'text', title: fill(it.title || '{A}', v), messages: msgs, quiet: true, interactive: false } },
      steps: [T.principle, fill(it.why, v), 'Best reply: ' + right], hint: it.hint || T.hint };
  }

  // ---------------------------------------------------------------- the dispatcher
  // T: { principle, hint, sc: [...], why: [...], order: [...], spot: [...], text: [...], good, rude, fine, ctxLine, rudeWhy,
  //      custom: { name: fn(R, ctx, T) }, mix: { 1: [kinds], 2: [kinds], 3: [kinds] } }
  var DEFAULT_MIX = { 1: ['sc', 'sc', 'tf', 'why'], 2: ['sc', 'sc', 'why', 'spot', 'text', 'order', 'custom'], 3: ['all', 'sc', 'order', 'spot', 'text', 'custom', 'why'] };
  function have(T, k) {
    if (k === 'sc') return T.sc && T.sc.length; if (k === 'why') return T.why && T.why.length; if (k === 'order') return T.order && T.order.length;
    if (k === 'spot') return T.spot && T.spot.length; if (k === 'text') return T.text && T.text.length;
    if (k === 'tf') return T.good && T.good.length && T.rude && T.rude.length;
    if (k === 'all') return ((T.good || []).length + (T.fine || []).length) >= 2 && (T.rude || []).length >= 2;
    if (k === 'custom') return T.custom && Object.keys(T.custom).length;
    if (T.custom && T.custom[k]) return true;
    return false;
  }
  function make(R, ctx, T) {
    var L = lvl(ctx), mix = (T.mix && T.mix[L]) || DEFAULT_MIX[L];
    var kinds = mix.filter(function (k) { return have(T, k); });
    if (!kinds.length) kinds = ['sc'];
    var k = R.pick(kinds);
    if (k === 'sc') return scenarioP(R, ctx, R.pick(T.sc), T);
    if (k === 'why') return whyP(R, ctx, R.pick(T.why), T);
    if (k === 'order') return orderP(R, ctx, R.pick(T.order), T);
    if (k === 'spot') return spotP(R, ctx, R.pick(T.spot), T);
    if (k === 'text') return textP(R, ctx, R.pick(T.text), T);
    if (k === 'tf') return tfP(R, ctx, T);
    if (k === 'all') return selectAllP(R, ctx, T);
    if (k === 'custom') { var names = Object.keys(T.custom); return T.custom[R.pick(names)](R, ctx, T); }
    return T.custom[k](R, ctx, T);
  }
  var TOPICS = {}; // the banks, kept for the independent checks in node (ML._etAdult)
  function bank(id, T) { TOPICS[id] = T; T.id = id; return function (R, ctx) { return make(R, ctx, T); }; }

  // ================================================================ Unit 1: The Principles
  G('adult.why-etiquette', bank('adult.why-etiquette', {
    principle: 'Etiquette rests on consideration, respect and honesty; its customs exist to put people at ease.',
    hint: 'Ask whose comfort is at stake, and what would spare them embarrassment.',
    ctxLine: 'At a dinner with friends and their guests:',
    rudeWhy: 'it embarrasses someone or puts them on the spot',
    sc: [
      { p: 'table', r: ['peer', 'peer', 'peer'], s: 'At a dinner, {A} picks up the glass on {Ahis} left by mistake. It belongs to {B}. {C} notices.', q: 'What should {C} do?',
        ok: ['Quietly ask the host for another glass for {B}, without drawing attention to {A}.'],
        bad: [['Announce, "{A}, that\'s {B}\'s glass!"', 'A public correction embarrasses {A} and fixes nothing that a quiet word can\'t.'], 'Laugh and tell the story later to the whole table.', 'Take the glass from {A}\'s hand and give it to {B}.', 'Explain the bread-and-drinks rule to the table so everyone learns it.'],
        why: 'The mistake is small; embarrassing {A} would be the bigger harm. A quiet fix helps {B} and spares {A}.' },
      { p: 'table', r: ['peer', 'elder'], s: 'At a formal dinner, {B} uses the dinner fork for the salad. {A} is sitting next to {Bhim}.', q: 'What is the courteous response?',
        ok: ['Say nothing and enjoy the meal.', 'Say nothing; if {B} looks unsure, quietly follow {Bhis} lead.'],
        bad: [['Whisper, "That\'s the wrong fork."', 'Even a whisper tells {B} {Bhe} made a mistake, which helps no one.'], 'Point to the right fork so {B} can switch.', 'Make a joke about fancy forks so {B} will notice.'],
        why: 'Which fork someone uses harms no one. Pointing it out causes discomfort, which is exactly what etiquette exists to avoid.' },
      { p: 'party', r: ['peer', 'peer'], s: '{A} is hosting {event}. A new guest, {B}, stands alone near the door, holding a coat.', q: 'What should {A} do?',
        ok: ['Greet {B}, take the coat, and introduce {Bhim} to a few guests.'],
        bad: [['Wave from across the room and keep talking with old friends.', 'A wave leaves {B} alone with a coat and no one to talk to.'], 'Wait for {B} to introduce {Bhim}self to people.', 'Tell {B} where the coats go and get back to the kitchen.'],
        why: 'A host\'s first job is to make each guest feel welcome. A name and an introduction turn a stranger into part of the party.' },
      { p: 'office', r: ['peer', 'peer'], s: '{A} hears {B} mispronounce a word during a team meeting.', q: 'What is the courteous choice?',
        ok: ['Let it pass; it did not change the meaning.'],
        bad: [['Correct the pronunciation out loud so everyone learns it.', 'A public correction embarrasses {B} and helps no one.'], 'Repeat the word the right way, louder, right after {B}.', 'Mention it to the group after {B} leaves.'],
        why: 'A slip that harms no one is best left alone. Correcting someone in front of others is the real breach.' }
    ],
    why: [
      { q: 'Why do etiquette writers say that the person who sneers at a mistake is ruder than the person who made it?', a: 'Because the sneer makes someone uncomfortable, and putting people at ease is the purpose of etiquette.', w: ['Because sneering breaks a written rule of formal dining.', 'Because the person who sneers is showing off what they know, which is bragging.', 'Because mistakes at the table are never noticed anyway.', 'Because only the host may point out mistakes.'] },
      { q: 'A friend asks why we bother replying to an invitation when we are not coming. Which reason best explains the custom?', a: 'The host needs to plan food, seats and space, and a reply spares the host guesswork.', w: ['A reply proves that you received the invitation in the mail.', 'It is a legal requirement for events.', 'It shows the host that you know the rules.', 'It is a tradition with no particular purpose.'] },
      { q: 'What test can you use for any etiquette rule you meet?', a: 'Ask whom the custom helps and how: whose discomfort does it spare?', w: ['Ask whether it is very old: older rules are more correct.', 'Ask whether wealthy people follow it.', 'Ask whether it is written in a famous book.', 'Ask whether it is hard to learn, since hard rules matter most.'] }
    ],
    good: ['Introducing a newcomer to the group by name', 'Thanking the host before you leave', 'Letting a small slip pass without comment', 'Offering your seat to someone who needs it more', 'Replying to an invitation by the date asked'],
    rude: ['Correcting a guest\'s grammar at the table', 'Pointing out that a friend used the wrong fork', 'Bragging about how much a gift cost', 'Ignoring a newcomer who is standing alone', 'Leaving without a word to the host'],
    mix: { 1: ['sc', 'tf', 'why'], 2: ['sc', 'why', 'all'], 3: ['all', 'sc', 'why'] }
  }));

  G('adult.manners-etiquette', bank('adult.manners-etiquette', {
    principle: 'Manners are the spirit (kindness and consideration); etiquette is the specific code, which changes with time and place.',
    hint: 'Is this a feeling or attitude toward people (manners), or a specific way of doing something (etiquette)?',
    custom: {
      classify: function (R, ctx, T) {
        var M = ['Thanking someone who helped you', 'Making a newcomer feel welcome', 'Listening without interrupting', 'Sparing a guest embarrassment', 'Being patient with a slow server', 'Keeping a promise to a friend'];
        var E = ['Putting the fork to the left of the plate', 'Writing the return address in the upper left of an envelope', 'Saying the older person\'s name first in an introduction', 'Placing the knife and fork side by side when finished', 'Writing "Sincerely," to close a business letter', 'Replying to an invitation by the date on the card'];
        var isM = R.coin(), s = R.pick(isM ? M : E);
        return { q: 'Is this mainly <b>manners</b> (the spirit) or <b>etiquette</b> (a specific code)?<br><b>' + s + '</b>', a: { t: 'mc', choices: ['Manners (the spirit)', 'Etiquette (a specific code)'], v: isM ? 0 : 1, keep: true },
          steps: [T.principle, isM ? 'This is an attitude toward people that holds everywhere: manners.' : 'This is a specific way of doing something that a group has agreed on: etiquette. Another place or time might do it differently.'], hint: T.hint };
      },
      thennow: function (R, ctx, T) {
        var it = R.pick([
          { then: 'In 1922, visitors left printed calling cards at a home.', now: 'Today people text or call before visiting.', need: 'Don\'t surprise people at their door; let them choose when to receive you.' },
          { then: 'In 1922, a reply to a formal invitation was handwritten in the third person.', now: 'Today many people reply by email or an online button, as the invitation asks.', need: 'Let the host know who is coming so they can plan.' },
          { then: 'In 1922, a young woman was expected to have a chaperone at a dance.', now: 'Today no chaperone is expected for adults.', need: 'Guests at any event should feel safe and comfortable.' },
          { then: 'In 1922, a thank-you was expected to be a handwritten letter.', now: 'Today a handwritten note is still warmest, but a prompt email or call also thanks the giver.', need: 'Let the giver know the kindness was received and valued.' }]);
        var wrong = ['The old custom was wrong, so the need behind it is gone too.', 'Nothing has changed; the 1922 rule still applies exactly.', 'The need is to show who has better training.'];
        return { q: it.then + ' ' + it.now + ' Which need has stayed the same?', a: U.mc(it.need, wrong, 4), steps: [T.principle, 'The code changed: ' + it.now.replace(/^Today /, 'today ') , 'The manners behind it did not: ' + it.need], hint: 'Look past the method to the need it served.' };
      }
    },
    sc: [
      { p: 'table', r: ['peer', 'elder'], s: 'At a formal dinner, {B}, the guest of honor, starts the main course with the salad fork. {A} knows the "rule."', q: 'What do good manners say?',
        ok: ['Let it pass; embarrassing a guest matters more than the fork.'],
        bad: [['Quietly tell {B} which fork to use.', 'The code points to kindness; correcting {B} would undo it.'], 'Ask the host to explain the forks to everyone.', 'Switch {Bhis} fork when {Bhe} looks away.'],
        why: 'When the code and the spirit pull apart, the spirit wins: sparing {B} embarrassment is the whole point.' },
      { p: 'home', r: ['peer', 'elder'], s: '{B} says, "In my day, you never phoned anyone after nine at night." {A} thinks the rule is old-fashioned.', q: 'What is the best response?',
        ok: ['Agree that late calls can disturb people, and keep that in mind with {B}.'],
        bad: [['Tell {B} the rule is out of date.', 'Dismissing {B}\'s custom is unkind, and the need behind it (not disturbing people) still holds.'], 'Call {B} late anyway to prove the point.', 'Change the subject without answering.'],
        why: 'The specific hour is etiquette and can change; the manners behind it, not disturbing people at rest, still hold. Respecting {B}\'s custom costs nothing.' }
    ],
    why: [
      { q: 'Many 1922 rules, such as calling cards, have disappeared. Why do some customs, like thanking a host, never seem to go away?', a: 'They express the manners behind etiquette, kindness and consideration, which do not change.', w: ['They are protected by law.', 'Nobody has thought to change them yet.', 'They are the only rules that wealthy people follow.'] },
      { q: 'If kindness is what matters, why have an etiquette code at all?', a: 'A shared code gives everyone the same expectations, so no one has to guess or feel left out.', w: ['A code lets people judge who was raised well.', 'A code is needed because kindness changes from year to year.', 'Without a code, kindness would be illegal.'] }
    ],
    mix: { 1: ['classify', 'why', 'sc'], 2: ['classify', 'thennow', 'sc', 'why'], 3: ['thennow', 'sc', 'why', 'classify'] }
  }));

  G('adult.customs-differ', bank('adult.customs-differ', {
    principle: 'Customs vary by region, country and family. As a guest, follow your host\'s way; different is not rude, but correcting others is.',
    hint: 'Whose home or country is it? Follow that way, and don\'t correct anyone.',
    ctxLine: 'Visiting families whose customs differ from yours:',
    rudeWhy: 'it makes the host or another guest feel judged',
    sc: [
      { p: 'door', r: ['peer', 'peer'], s: '{A} arrives at {B}\'s home and sees a row of shoes by the door. Everyone inside is in socks or slippers.', q: 'What should {A} do?',
        ok: ['Take off {Ahis} shoes, or ask, "Shoes off here?"'],
        bad: [['Keep {Ahis} shoes on, since that is what {Ahe} does at home.', 'At someone else\'s home, the host\'s custom is the one to follow.'], 'Keep them on, but wipe them well on the mat.', 'Take them off but say {Ahe} finds the custom odd.'],
        why: 'The house has its own custom, and following it honors the host. Asking is always fine.' },
      { p: 'table', r: ['peer', 'peer', 'elder'], s: 'At {B}\'s family dinner, everyone waits while {C} says a few words before eating. {A}\'s family never does this.', q: 'What should {A} do?',
        ok: ['Wait quietly until the family begins to eat.'],
        bad: [['Start eating, since {A} does not share the custom.', 'Starting early ignores the host family\'s way.'], 'Ask {C} to skip it this time.', 'Check {Ahis} phone until they finish.'],
        why: 'A guest follows the host\'s way. {A} does not have to join words {Ahe} does not share; waiting quietly is respectful.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: '{B} eats with the fork in {Bhis} left hand, tines down, the whole meal. {A} has always switched hands.', q: 'What should {A} think and do?',
        ok: ['Nothing: {B} is using the Continental style, which is correct.'],
        bad: [['Tell {B}, "You\'re holding your fork wrong."', '{B} is using a correct style, and correcting a companion at the table is the real breach.'], 'Switch to {B}\'s style so {B} won\'t feel strange.', 'Ask the server which style is right.'],
        why: 'Both styles are correct in the U.S. Different is not rude.' },
      { p: 'party', r: ['peer', 'peer'], s: 'At a party, {B} greets {A} with a slight bow instead of a handshake.', q: 'What is the best response?',
        ok: ['Return a slight bow or a nod and a warm hello.'],
        bad: [['Reach out and insist on a handshake.', 'Pressing a handshake on someone who chose another greeting ignores their lead.'], 'Laugh and say, "We shake hands here."', 'Ask where {B} is from before saying hello.'],
        why: 'Follow the other person\'s lead. A greeting can take many forms, and all of them say "I see you and I\'m glad you\'re here."' }
    ],
    spot: [
      { p: 'table', r: ['peer', 'peer', 'peer'], intro: '{A} is a guest at {B}\'s home.', lines: [[1, 'We usually eat this dish with our hands. Forks are there if you like.'], [0, 'Oh, how fun. Could you show me how?'], [2, 'Eating with your hands at dinner is a bit uncivilized, isn\'t it?'], [1, 'You scoop it with the bread, like this.']], fault: 2, why: 'Calling the host\'s custom "uncivilized" mocks the family in its own home. Many dishes around the world are eaten by hand.' },
      { p: 'door', r: ['peer', 'peer'], intro: '{A} visits {B}.', lines: [[1, 'Welcome! We take shoes off inside.'], [0, 'Of course. Where should I put them?'], [1, 'Right on the mat is perfect.'], [0, 'That\'s a strange rule, but okay.']], fault: 3, why: 'Calling the custom strange tells the host {Bhe} is odd for having it. Following it graciously is enough.' }
    ],
    why: [
      { q: 'Why is following your host\'s customs the polite thing to do, even when they differ from yours?', a: 'The host\'s customs are how that home puts people at ease, so following them honors the host.', w: ['Your own customs are probably the wrong ones.', 'The host might ask you to leave if you don\'t.', 'There is one correct set of customs, and the host has it.'] },
      { q: 'Why do etiquette writers say that correcting another family\'s custom is ruder than the custom itself?', a: 'Different is not rude, but a correction makes someone feel judged in their own home or culture.', w: ['Corrections should only be made in writing.', 'Only experts may correct a custom.', 'Customs never differ within the U.S., so there is nothing to correct.'] }
    ],
    good: ['Taking shoes off when the host does', 'Waiting quietly while a family says a few words before a meal', 'Asking quietly, "What\'s the custom here?"', 'Returning a bow with a nod and a smile', 'Trying a dish the way the host shows you'],
    rude: ['Telling a guest their fork style is wrong', 'Calling a family\'s custom strange', 'Insisting on a handshake after someone bows', 'Joking about how another country eats', 'Keeping shoes on after the host asks you not to']
  }));

  // ================================================================ Unit 2: Dining
  // ---- place-setting pieces, from the kit's model (MathLadder.etiquette.setting), so the picture and the answer agree
  var ASK_NAMES = { 'salad-fork': ['salad fork'], 'fish-fork': ['fish fork'], 'dinner-fork': ['dinner fork', 'main fork', 'main course fork', 'entree fork', 'entrée fork'],
    'dinner-knife': ['dinner knife', 'main knife', 'main course knife', 'table knife'], 'fish-knife': ['fish knife'], 'soup-spoon': ['soup spoon', 'soupspoon'],
    'bread-plate': ['bread plate', 'bread and butter plate', 'bread-and-butter plate', 'butter plate', 'side plate'], 'butter-knife': ['butter knife', 'butter spreader', 'spreader'],
    'dessert-spoon': ['dessert spoon'], 'dessert-fork': ['dessert fork', 'cake fork'], 'water-glass': ['water glass', 'water goblet', 'goblet'], 'napkin': ['napkin', 'serviette'] };
  function pieceWhy(k, level) {
    var formal = level === 'formal';
    return {
      'salad-fork': formal ? 'Forks go on the left. At a formal dinner the salad follows the main course, so the salad fork sits next to the plate, inside the dinner fork.' : 'Forks go on the left, used from the outside in. The salad comes before the main course, so the salad fork is outside the dinner fork.',
      'fish-fork': 'Forks go on the left, used from the outside in. The fish course comes right after the soup, so the fish fork is the outermost fork.',
      'dinner-fork': formal ? 'Forks go on the left. The main course follows the fish, so the dinner fork is next to the fish fork, and the salad fork (for the salad after the main course) is inside it.' : 'Forks go on the left. The main course comes after the salad, so the dinner fork sits next to the plate.',
      'dinner-knife': 'Knives go on the right, blade toward the plate. The dinner knife, for the main course, is the knife next to the plate.',
      'fish-knife': 'Knives go on the right. The fish course comes before the main course, so the fish knife is outside the dinner knife.',
      'soup-spoon': 'Spoons go to the right of the knives. Soup is the first course, so the soup spoon is the outermost piece on the right.',
      'bread-plate': 'Bread goes on the left (make a lowercase b with your left hand), above the forks.',
      'butter-knife': 'The small knife lying across the bread plate is the butter knife, for spreading butter on your bread.',
      'dessert-spoon': 'Dessert utensils lie above the plate. The dessert spoon is on top, its handle to the right.',
      'dessert-fork': 'Dessert utensils lie above the plate. The dessert fork is below the spoon, its handle to the left.',
      'water-glass': 'Drinks go on the right (make a lowercase d with your right hand). The water glass stands above the knife.',
      'napkin': formal ? 'At a formal setting the napkin rests on the plate (or the charger).' : 'At an informal setting the napkin lies to the left of the forks.'
    }[k];
  }
  function pName(k) { return EM().PIECES[k].name; }
  function an(w) { return (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w; }
  function settingViz(level, extra) { var o = { level: level, quiet: true, interactive: false, labels: false, label: cap(an(level)) + ' place setting with numbered pieces' }; for (var k in extra) o[k] = extra[k]; return { name: 'et-setting', opts: o }; }
  function pieceP(R, ctx, levels) {
    var level = R.pick(levels), S = EM().setting(level), L = lvl(ctx);
    var cands = S.pieces.filter(function (k) { return ASK_NAMES[k] && !(level === 'formal' && k === 'napkin'); });
    var k = R.pick(cands), right = ASK_NAMES[k][0];
    var same = cands.filter(function (x) { return x !== k && EM().PIECES[x].side === EM().PIECES[k].side; }).map(function (x) { return ASK_NAMES[x][0]; });
    var other = cands.filter(function (x) { return x !== k; }).map(function (x) { return ASK_NAMES[x][0]; });
    var extra = { 'salad-fork': 'dessert fork', 'dessert-fork': 'salad fork', 'butter-knife': 'fish knife', 'fish-knife': 'butter knife', 'dessert-spoon': 'soup spoon', 'soup-spoon': 'dessert spoon' }[k];
    var pool = U.uniq(same.concat(extra && cands.indexOf(extra.replace(' ', '-')) < 0 ? [extra] : []).concat(R.shuffle(other)));
    var wrongs = pool.filter(function (x) { return x !== right; }).slice(0, L === 1 ? 2 : 3);
    var p = { q: 'Look at this ' + level + ' place setting. What is the piece marked <b>?</b> called?', viz: settingViz(level, { ask: k }), steps: [pieceWhy(k, level), 'So the piece marked ? is the ' + right + '.'], hint: 'Which side is it on, and which course comes first? Pieces are used from the outside in.' };
    if (L >= 3) { p.a = { t: 'text', v: ASK_NAMES[k] }; p.q += ' Type its name.'; } else p.a = U.mc(right, wrongs, wrongs.length + 1);
    return p;
  }
  // which number is the piece for…?
  function numberP(R, ctx, levels) {
    var level = R.pick(levels), S = EM().setting(level), byP = {}; S.slots.forEach(function (s) { byP[s.piece] = s; });
    var asks = [
      ['soup-spoon', 'the spoon you use for the soup'], ['salad-fork', 'the fork you use for the salad'], ['dinner-fork', 'the fork for the main course'],
      ['dinner-knife', 'the knife for the main course'], ['bread-plate', 'your bread plate'], ['water-glass', 'your water glass'], ['dessert-spoon', 'the dessert spoon'],
      ['fish-fork', 'the fork for the fish course'], ['fish-knife', 'the knife for the fish course'], ['butter-knife', 'the knife for buttering your bread']
    ].filter(function (a) { return byP[a[0]]; });
    var a = R.pick(asks), s = byP[a[0]];
    return { q: 'This is ' + an(level) + ' setting' + (level === 'formal' ? ' for soup, fish, a main course, salad and dessert' : ' for soup, salad, a main course and dessert') + '. Which number is ' + a[1] + '?', a: { t: 'num', v: String(s.n), form: 'int' },
      viz: settingViz(level, {}), steps: [pieceWhy(a[0], level), 'That piece is number ' + s.n + ' in the picture.'], hint: 'Bread left, drinks right; forks left, knives and spoons right; outside in, course by course.' };
  }
  var SPOTS = {
    'bread-right': ['The bread plate and the glasses have traded sides.', 'Bread goes on the left and drinks on the right.'],
    'fork-right': ['The dinner fork and the dinner knife have traded sides.', 'Forks go on the left; knives and spoons go on the right.'],
    'blade-out': ['The knife blade faces away from the plate.', 'The knife\'s cutting edge faces the plate.'],
    'swap:salad-fork,dinner-fork': ['The two forks are in the wrong order for this menu.', 'Utensils are used from the outside in: for soup, salad, main course, the salad fork is outside the dinner fork.'],
    'swap:soup-spoon,dinner-knife': ['The soup spoon and the knife are in the wrong order.', 'Soup comes first, so the soup spoon is the outermost piece on the right; the knife sits next to the plate.']
  };
  function spotSetP(R, ctx) {
    var keys = Object.keys(SPOTS), m = R.pick(lvl(ctx) === 1 ? ['bread-right', 'fork-right', 'blade-out'] : keys);
    var wrongs = keys.filter(function (x) { return x !== m; }).map(function (x) { return SPOTS[x][0]; }).concat(['The napkin should be on the right.', 'The water glass should be above the forks.']);
    wrongs = R.sample(wrongs, lvl(ctx) === 1 ? 2 : 3);
    return { q: 'One thing in this informal place setting is out of place. What is wrong?', a: U.mc(SPOTS[m][0], wrongs, wrongs.length + 1),
      viz: settingViz('informal', { mode: 'spot', mistake: m }), steps: ['Check the rules one at a time: bread left and drinks right; forks left, knives and spoons right; blade toward the plate; outside in.', SPOTS[m][1], 'So: ' + SPOTS[m][0]], hint: 'Make a lowercase b with your left hand and a d with your right. Then check each side.' };
  }
  var REST_LABEL = { 'american-resting': 'American style, resting', 'american-finished': 'American style, finished', 'continental-resting': 'Continental style, resting', 'continental-finished': 'Continental style, finished' };
  function restGridP(R, ctx) {
    var keys = R.shuffle(Object.keys(REST_LABEL)), want = R.pick(keys);
    return { q: 'Which plate shows the <b>' + REST_LABEL[want] + '</b> position?', a: { t: 'mc', choices: keys.map(function (k, i) { return 'Plate ' + letter(i); }), v: keys.indexOf(want), keep: true },
      viz: { name: 'et-setting', opts: { mode: 'rest', grid: true, quiet: true, interactive: false, order: keys, label: 'Four plates, lettered A to D, with a fork and knife' } },
      steps: ['Resting: utensils on the plate, apart (American: knife across the upper right, fork below) or crossed like an upside-down V (Continental, tines down).', 'Finished: fork and knife side by side, diagonally, handles toward 4 o\'clock; tines up (American) or down (Continental).', EM().REST[want], 'That is plate ' + letter(keys.indexOf(want)) + '.'], hint: 'Side by side means finished. Then look at the fork\'s tines: up is American, down is Continental.' };
  }
  function restOneP(R, ctx) {
    var style = R.pick(['american', 'continental']), state = R.pick(['resting', 'finished']);
    var choices = ['I\'m pausing; I will eat more.', 'I\'m finished; you may clear the plate.'];
    return { q: 'A diner leaves the fork and knife like this. What does the plate tell the server?', a: { t: 'mc', choices: choices, v: state === 'resting' ? 0 : 1, keep: true },
      viz: { name: 'et-setting', opts: { mode: 'rest', style: style, state: state, quiet: true, interactive: false, label: 'A plate with a fork and knife' } },
      steps: [EM().REST[style + '-' + state], state === 'resting' ? 'Apart or crossed means a pause: the diner is not done.' : 'Side by side, diagonally, means finished: the server may clear.'], hint: 'Side by side means done; apart or crossed means a pause.' };
  }

  G('adult.reading-setting', bank('adult.reading-setting', {
    principle: 'Bread plate on the left, drinks on the right; forks left of the plate, knives and spoons right; used from the outside in.',
    hint: 'Make a lowercase b with your left hand and a d with your right: bread, drinks.',
    custom: { piece: function (R, ctx) { return pieceP(R, ctx, ['informal']); }, num: function (R, ctx) { return numberP(R, ctx, ['informal']); }, spot: function (R, ctx) { return spotSetP(R, ctx); } },
    sc: [
      { p: 'table', r: ['peer', 'peer', 'peer'], s: 'At a crowded round table, {A} sees bread plates on both sides of {Ahis} dinner plate.', q: 'Which one is {Ahers}?',
        ok: ['The one on {Ahis} left.'], bad: ['The one on {Ahis} right.', 'Whichever one has more room.', 'Whichever one {B} hasn\'t used yet.'], why: 'Bread goes on the left. The plate on the right belongs to the guest on {Ahis} right.' },
      { p: 'table', r: ['peer', 'peer'], s: '{B}, on {A}\'s right, has already put a roll on {A}\'s bread plate by mistake.', q: 'What should {A} do?',
        ok: ['Say nothing and use the edge of {Ahis} dinner plate for bread.'],
        bad: [['Tell {B}, "That\'s my bread plate."', 'Pointing out the slip embarrasses {B}; a small workaround costs nothing.'], 'Take {B}\'s bread plate on the other side.', 'Move the roll back onto {B}\'s plate.'],
        why: 'The mistake is small. Using the edge of the dinner plate solves it quietly, without embarrassing {B}.' },
      { p: 'table', r: ['peer', 'peer'], s: 'The meal begins with soup, then salad, then a main course. {A} sees two forks on the left.', q: 'Which fork is for the salad?',
        ok: ['The outer fork, farther from the plate.'], bad: ['The fork next to the plate.', 'Either one; it doesn\'t matter.', 'Neither: salad is eaten with the spoon.'], why: 'Utensils are used from the outside in. Salad is the first course that needs a fork, so it uses the outer fork.' }
    ],
    why: [
      { q: 'Why does a knife lie with its blade facing the plate?', a: 'So no sharp edge points toward a neighbor.', w: ['So that it looks neater in photographs.', 'Because the handle is heavier on that side.', 'So the server can tell which guest it belongs to.'] },
      { q: 'Why are utensils set in the order you will use them, from the outside in?', a: 'So guests never have to ask or guess which piece comes next.', w: ['So the expensive pieces are nearest the plate.', 'Because forks used last must stay clean the longest.', 'So servers can count how many courses are left.'] }
    ],
    mix: { 1: ['piece', 'sc', 'spot'], 2: ['piece', 'num', 'spot', 'sc', 'why'], 3: ['piece', 'num', 'spot', 'sc'] }
  }));

  G('adult.formal-setting', bank('adult.formal-setting', {
    principle: 'Each course has its own utensils, set in the order of use from the outside in; dessert utensils lie above the plate; glasses stand above the knives.',
    hint: 'Name the courses in order (soup, fish, main course, salad, dessert); the outermost piece belongs to the next course.',
    custom: { piece: function (R, ctx) { return pieceP(R, ctx, ['formal']); }, num: function (R, ctx) { return numberP(R, ctx, ['formal']); } },
    order: [{ title: 'Put a formal dinner\'s courses in order.', steps: ['Soup', 'Fish', 'Main course', 'Salad', 'Dessert'], all: true, why: 'The utensils follow this order from the outside in, and the dessert pieces wait above the plate.' }],
    sc: [
      { p: 'table', r: ['peer', 'peer'], s: 'At a formal dinner, the soup is cleared and a fish course arrives. {A} has three forks on the left and, on the right, a knife, a smaller knife and nothing else.', q: 'What should {A} use?',
        ok: ['The outermost fork and the outer (smaller) knife: the fish fork and fish knife.'], bad: ['The fork and knife next to the plate.', 'The middle fork and the knife next to the plate.', 'The pieces above the plate.'], why: 'Soup used the outermost spoon. Fish is next, so it takes the outermost fork and knife that remain.' },
      { p: 'table', r: ['peer', 'elder'], s: 'At a formal dinner, the main course has been cleared. {A} has one fork left beside the plate, and a small fork and spoon above the plate.', q: 'What is the fork beside the plate for?',
        ok: ['The salad, which at a formal dinner often follows the main course.'], bad: ['Dessert.', 'Nothing: it is an extra in case a fork is dropped.', 'The bread.'], why: 'At a formal dinner the salad often comes after the main course, so its fork sits next to the plate. The pieces above the plate are for dessert.' },
      { p: 'table', r: ['peer', 'elder'], s: '{A} is unsure which fork to use first at a long formal table. {B}, the host, is at the head of the table.', q: 'What is the best plan?',
        ok: ['Start with the outermost fork and watch the host.'], bad: ['Ask the server to remove the extra forks.', 'Use the same fork for every course to be safe.', 'Wait to eat until someone explains the setting.'], why: 'The outside-in rule works for every course, and the host\'s lead settles any doubt.' }
    ],
    why: [
      { q: 'Why do dessert utensils lie above the plate instead of beside it?', a: 'They are used last, so they wait out of the way until dessert.', w: ['They are too small to fit beside the plate.', 'They belong to the guest across the table.', 'Dessert is always eaten with the fingers.'] },
      { q: 'At a formal dinner, why is the salad fork next to the plate, inside the dinner fork?', a: 'Because the salad is served after the main course, and utensils are used from the outside in.', w: ['Because the salad fork is the most important fork.', 'Because salad is eaten first.', 'So the salad fork stays cleanest.'] }
    ],
    mix: { 1: ['piece', 'sc', 'why'], 2: ['piece', 'num', 'order', 'sc', 'why'], 3: ['piece', 'num', 'order', 'sc'] }
  }));

  G('adult.napkin-use', bank('adult.napkin-use', {
    principle: 'Napkin on the lap after the host; blot, don\'t wipe; on the chair (or loosely left of the plate) when you step away; loosely left of the plate at the end.',
    hint: 'Keep the used napkin out of sight while the meal goes on, and off the plate at the end.',
    ctxLine: 'At a dinner party:',
    rudeWhy: 'it leaves a mess for someone else or draws attention',
    order: [{ title: 'Put the napkin\'s routine in order.', steps: ['Wait until the host places a napkin on their lap', 'Unfold your napkin on your lap', 'Blot your lips gently when needed', 'Set it loosely to the left of your plate at the end of the meal'], all: true }],
    sc: [
      { p: 'table', r: ['peer', 'peer'], s: 'During dinner at {B}\'s home, {A} needs to step away from the table for a moment.', q: 'Where can the napkin go? Choose the polite option.',
        ok: ['On {Ahis} chair.', 'Loosely to the left of {Ahis} plate.'], bad: [['Crumpled on {Ahis} plate.', 'A crumpled napkin on the plate puts a used napkin beside food that others can see.'], 'Tucked into {Ahis} pocket.', 'Over the back of the next person\'s chair.'], why: 'Writers differ between the chair and the left of the plate; both keep a used napkin away from the food. The plate is not the place.' },
      { p: 'table', r: ['peer', 'peer'], s: '{A} sits down at a dinner party. The host, {B}, has not yet sat down.', q: 'When does {A} put the napkin on {Ahis} lap?',
        ok: ['After {B} sits and places a napkin on {Bhis} lap.'], bad: ['Right away, before anyone else sits.', 'When the dessert arrives.', 'Only if {Ahe} spills something.'], why: 'The host sets the pace of the meal; the napkin follows the host.' },
      { p: 'table', r: ['peer', 'peer'], s: 'The meal is over and everyone is standing to leave the table.', q: 'What should {A} do with {Ahis} napkin?',
        ok: ['Set it loosely to the left of {Ahis} plate.'], bad: ['Leave it crumpled on the plate.', 'Fold it neatly into its original shape.', 'Drop it on the chair.'], why: 'Loosely to the left of the plate says "finished" without displaying a used napkin; a neat fold looks unused, and the plate is for food.' }
    ],
    good: ['Placing the napkin on your lap after the host does', 'Blotting your lips before you drink', 'Leaving the napkin on your chair when you step away', 'Setting the napkin loosely to the left of the plate at the end'],
    fine: ['Leaving the napkin loosely to the left of the plate when you step away'],
    rude: ['Tucking the napkin into your collar at a dinner party', 'Leaving a crumpled napkin on your plate', 'Using the napkin to blow your nose', 'Wiping your whole face with the napkin'],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  G('adult.bread-glasses', bank('adult.bread-glasses', {
    principle: 'Break off one bite-size piece of bread at a time and butter it over your bread plate; hold a stemmed glass by the stem; drink only from your own glass, above your knife.',
    hint: 'One bite at a time, over your own bread plate. Drinks are on your right.',
    ctxLine: 'At a dinner with a bread basket and several glasses:',
    rudeWhy: 'it spreads crumbs and butter, or uses something shared or someone else\'s',
    custom: { glass: function (R, ctx) { var p = numberP(R, ctx, ['informal']); return p; } },
    sc: [
      { p: 'table', r: ['peer', 'peer'], s: 'A basket of rolls and a dish of butter reach {A}.', q: 'What should {A} do?',
        ok: ['Take one roll and a little butter onto {Ahis} bread plate, then pass the basket on.'],
        bad: [['Butter the whole roll right over the butter dish.', 'The shared dish should stay clean; butter goes to your own plate first.'], 'Take two rolls to save asking again.', 'Squeeze each roll to find the warmest one.'], why: 'Taking your share onto your own plate keeps the shared basket and dish clean for everyone.' },
      { p: 'table', r: ['peer', 'peer'], s: '{A} has a roll on {Ahis} bread plate.', q: 'How should {Ahe} eat it?',
        ok: ['Tear off one bite-size piece, butter it, and eat it; repeat.'], bad: [['Butter the whole roll, then take bites.', 'Butter one bite at a time; a whole buttered roll is messy to hold and to talk over.'], 'Cut it into slices with the dinner knife first.', 'Dip it into the soup and bite from it.'], why: 'One piece at a time keeps crumbs and butter in one small place and lets {Ahim} talk between bites.' },
      { p: 'table', r: ['peer', 'peer', 'peer'], s: 'At a crowded table, {A} reaches for water and sees a glass on {Ahis} left and two above {Ahis} knife.', q: 'Which glasses are {Ahers}?',
        ok: ['The ones above {Ahis} knife, on the right.'], bad: ['The glass on {Ahis} left.', 'Whichever is fullest.', 'Any of them; glasses are shared.'], why: 'Drinks are on the right. The glass on the left belongs to the guest on {Ahis} left.' }
    ],
    why: [
      { q: 'Why do etiquette writers suggest moving butter from the shared dish to your own bread plate first?', a: 'So your knife and crumbs stay out of a dish everyone uses.', w: ['So the host can see how much butter you took.', 'Because butter tastes better at room temperature.', 'So the server can clear the butter dish sooner.'] },
      { q: 'Why is bread broken into one bite-size piece at a time?', a: 'It keeps crumbs and butter in one small place and lets you talk between bites.', w: ['It makes the bread last longer for the host.', 'It shows that you are not hungry.', 'It is the only way to fit bread in your mouth.'] }
    ],
    good: ['Tearing off one bite of bread at a time', 'Taking butter onto your bread plate first', 'Holding a stemmed glass by the stem', 'Drinking from the glass above your knife'],
    rude: ['Buttering a whole roll at once', 'Spreading butter straight from the shared dish onto your roll', 'Biting into a whole roll', 'Drinking from the glass on your left'],
    mix: { 1: ['sc', 'tf', 'why'], 2: ['sc', 'why', 'all', 'glass'], 3: ['all', 'sc', 'glass'] }
  }));

  G('adult.american-continental', bank('adult.american-continental', {
    principle: 'American style: cut, set the knife down, switch the fork to the right hand, eat tines up. Continental style: fork stays in the left hand, tines down, knife in the right. Both are correct.',
    hint: 'Watch the fork: does it switch hands, and are the tines up or down?',
    ctxLine: 'Two styles of using a fork and knife:',
    custom: {
      which: function (R, ctx, T) {
        var v = cast(R, ['peer']);
        var it = R.pick([
          ['{A} cuts a bite, sets the knife across the top of the plate, moves the fork to {Ahis} right hand, and eats with the tines up.', 0],
          ['{A} keeps the fork in {Ahis} left hand, tines down, and the knife in {Ahis} right hand for the whole meal.', 1],
          ['{A} cuts a bite and lifts it to {Ahis} mouth with the fork still in {Ahis} left hand, tines down.', 1],
          ['After each cut, {A} lays the knife on the plate and eats with the fork in {Ahis} right hand.', 0],
          ['{A} uses the knife to guide a few peas onto the back of the fork, which stays in {Ahis} left hand.', 1]]);
        return { q: fill(it[0], v) + ' Which style is this?', a: { t: 'mc', choices: ['American style', 'Continental style'], v: it[1], keep: true },
          steps: [T.principle, it[1] ? 'The fork never switches hands and the tines stay down: Continental.' : 'The knife goes down and the fork switches to the right hand: American.'], hint: T.hint };
      }
    },
    order: [{ title: 'Put the steps of one bite in the American style in order.', steps: ['Hold the fork in your left hand, tines down, and the knife in your right', 'Cut one bite-size piece', 'Set the knife across the top edge of the plate', 'Switch the fork to your right hand, tines up', 'Eat the bite'], all: true }],
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} notices that {B} eats Continental style while {A} uses American style.', q: 'What should {A} do?',
        ok: ['Keep eating in {Ahis} own style; both are correct.'], bad: [['Suggest that {B} try the American way.', 'Both styles are correct; suggesting a change implies {B} is wrong.'], 'Switch styles halfway through the meal to match.', 'Ask {B} why {Bhe} eats that way.'], why: 'Both styles are correct in the U.S. Using one smoothly is what matters.' },
      { p: 'table', r: ['peer', 'peer'], s: 'Served a steak, {A} starts to cut the whole thing into pieces before eating any.', q: 'What would most writers suggest instead?',
        ok: ['Cut one or two bites at a time, then eat them.'], bad: ['Cut it all first; it saves time.', 'Pick the steak up and bite from it.', 'Ask the server to cut it in the kitchen.'], why: 'In both styles you cut a bite or two at a time; cutting everything at once is how food is cut for small children.' }
    ],
    why: [
      { q: 'Why do etiquette writers say that neither the American nor the Continental style is ruder than the other?', a: 'Both get a bite to your mouth neatly; what matters is using one smoothly.', w: ['Both are rude in different ways, so it evens out.', 'The Continental style is only for restaurants.', 'Nobody notices how people hold forks.'] }
    ],
    good: ['Eating with the fork in the left hand, tines down, the whole meal', 'Switching the fork to the right hand after cutting', 'Resting the knife on the plate between bites', 'Cutting one bite at a time'],
    rude: ['Waving the knife while talking', 'Telling a companion their fork style is wrong', 'Stabbing food with the fork held upright in a fist', 'Leaning the used knife against the table'],
    mix: { 1: ['which', 'sc', 'tf'], 2: ['which', 'order', 'sc', 'why'], 3: ['order', 'all', 'which', 'sc'] }
  }));

  G('adult.resting-finished', bank('adult.resting-finished', {
    principle: 'Resting: utensils on the plate, apart (American) or crossed like an upside-down V (Continental). Finished: side by side, diagonally, handles toward 4 o\'clock. A used utensil never goes back on the table.',
    hint: 'Side by side means done; apart or crossed means a pause. Nothing used touches the table.',
    custom: { grid: restGridP, one: restOneP },
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], s: 'Halfway through a meal, {A} wants to sip water and listen to {B}\'s story.', q: 'Where should {Ahis} fork and knife go?',
        ok: ['In the resting position, on the plate.'], bad: [['Leaning on the rim, handles on the table.', 'Handles on the table put used utensils against the cloth.'], 'On the tablecloth beside the plate.', 'Side by side, diagonally, handles toward 4 o\'clock.'], why: '{A} is not done, so {Ahe} uses the resting position. Side by side would tell the server to clear the plate.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} has finished eating and would like the plate cleared.', q: 'How can {Ahe} say so without a word?',
        ok: ['Lay the fork and knife side by side, diagonally, handles toward 4 o\'clock.'], bad: ['Cross them like an upside-down V.', 'Push the plate toward the middle of the table.', 'Put the knife on the table and the fork on the plate.'], why: 'The finished position is a signal servers read from across the room.' }
    ],
    why: [
      { q: 'Why does a used fork or knife stay on the plate instead of going back on the table?', a: 'It would leave food on the tablecloth.', w: ['Because the table is for clean pieces only by law.', 'So the server knows to bring a new one.', 'Because the plate is warmer.'] },
      { q: 'What is the purpose of the finished position?', a: 'It tells the server you are done without anyone having to interrupt to ask.', w: ['It shows that you liked the food.', 'It makes the plate easier to wash.', 'It shows which style you used.'] }
    ],
    mix: { 1: ['one', 'sc', 'grid'], 2: ['grid', 'one', 'sc', 'why'], 3: ['grid', 'sc', 'why'] }
  }));

  G('adult.courses-service', bank('adult.courses-service', {
    principle: 'Wait until everyone is served or the host begins; at a large table, start when the host invites you. Food is traditionally served from the left and plates cleared from the right.',
    hint: 'Who sets the pace of the meal?',
    order: [
      { title: 'Put an informal dinner\'s courses in order.', steps: ['Soup', 'Salad', 'Main course', 'Dessert'], all: true },
      { title: 'Put a formal dinner\'s courses in order.', steps: ['Soup', 'Fish', 'Main course', 'Salad', 'Dessert'], all: true }
    ],
    sc: [
      { p: 'table', r: ['peer', 'peer'], s: 'At a dinner party for eight, {A} is served first. The host, {B}, is still serving the others.', q: 'What should {A} do?',
        ok: ['Wait, hands in {Ahis} lap, until the others are served or {B} invites {Ahim} to start.'], bad: [['Start eating so the food doesn\'t get cold.', 'Starting alone while others wait is the slip; the host decides.'], 'Start, but slowly.', 'Pass {Ahis} plate down to the next guest.'], why: 'Waiting means nobody eats alone while others watch. The host sets the pace.' },
      { p: 'table', r: ['peer', 'peer'], s: 'At a long table, the host, {B}, says, "Please start while it\'s hot!" Only half the guests have been served, including {A}.', q: 'What should {A} do?',
        ok: ['Begin eating.'], bad: ['Keep waiting until every guest is served.', 'Ask {B} if {Bhe} is sure.', 'Start, but only with the bread.'], why: 'The host\'s invitation is the signal. Waiting after the host asks you to start can make the host uneasy.' },
      { p: 'table', r: ['peer', 'peer'], s: 'At a banquet, a server comes to {A}\'s left side with a platter.', q: 'What is happening, and what should {A} do?',
        ok: ['Food is traditionally served from the left; {A} leans slightly right and says thank you.'], bad: ['The server is about to clear the plate; {A} hands it over.', 'The server made a mistake; {A} should point to the right.', 'The server wants {A} to pass the platter on.'], why: 'Food is traditionally served from the left and plates cleared from the right, so servers don\'t collide or reach across your eating hand.' }
    ],
    why: [
      { q: 'Why do guests wait for the host before starting to eat?', a: 'So nobody eats alone while others watch, and the host can set the pace for the table.', w: ['So the host can check that the food is safe.', 'Because food tastes better after it cools.', 'Because the host must eat first by tradition.'] },
      { q: 'Why is food traditionally served from one side and cleared from the other?', a: 'So servers don\'t collide or reach across a guest\'s eating hand.', w: ['So guests can tell which course comes next.', 'Because the left hand is for serving by law.', 'So the host can count the plates.'] }
    ],
    mix: { 1: ['sc', 'why'], 2: ['sc', 'order', 'why'], 3: ['order', 'sc', 'why'] }
  }));

  G('adult.tricky-foods', bank('adult.tricky-foods', {
    principle: 'Spoon soup away from you; twirl long pasta against the plate or a spoon; eat finger foods with fingers; remove a pit or bone the way it went in and set it on the plate\'s edge.',
    hint: 'Keep it quiet, keep it on your plate, and follow the host where you are unsure.',
    ctxLine: 'At a dinner with soup, pasta, olives and corn on the cob:',
    rudeWhy: 'it makes a mess or puts something unpleasant in view of others',
    sc: [
      { p: 'table', r: ['peer', 'peer'], s: '{A} bites into an olive and finds a pit.', q: 'What should {Ahe} do with it?',
        ok: ['Bring it out quietly onto {Ahis} fingertips and set it on the edge of {Ahis} plate.'], bad: [['Spit it into {Ahis} napkin.', 'Someone must find it later, and the napkin is for the lips.'], 'Swallow it.', 'Drop it on the tablecloth.'], why: 'It went in by fingers, so it comes out that way, quietly, to the plate\'s edge.' },
      { p: 'table', r: ['peer', 'peer'], s: '{A} is served a bowl of soup.', q: 'How should {Ahe} spoon it?',
        ok: ['Spoon away from {Ahim}self and sip from the side of the spoon.'], bad: ['Spoon toward {Ahim}self and sip from the tip.', 'Lift the bowl and drink from it.', 'Blow hard on each spoonful.'], why: 'Spooning away means a drip falls back into the bowl, not into {Ahis} lap.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} is served long spaghetti.', q: 'What is the neat way to eat it?',
        ok: ['Twirl a few strands against the plate or a spoon.'], bad: [['Slurp the strands from the fork.', 'Slurping is noisy and can splash sauce.'], 'Cut it into short pieces with the knife first.', 'Lift a big forkful and bite the ends off.'], why: 'Twirling a few strands makes a neat bite that stays on the fork.' },
      { p: 'park', r: ['peer', 'peer'], s: 'At a backyard barbecue, {A} is served corn on the cob and ribs on a paper plate.', q: 'How should {Ahe} eat them?',
        ok: ['With {Ahis} fingers, with a napkin handy.'], bad: ['With a plastic fork and knife.', 'Wait for the host to cut them.', 'Skip them; they are too messy.'], why: 'Corn on the cob and ribs are finger foods. Sawing at them on a paper plate is messier than eating by hand.' }
    ],
    good: ['Spooning soup away from you', 'Eating corn on the cob with your hands', 'Twirling pasta against a spoon', 'Setting a shrimp tail on the edge of the plate', 'Taking a cherry pit out onto your fingertips'],
    rude: ['Slurping noodles from the fork', 'Spitting a pit into your napkin', 'Picking your teeth at the table', 'Dropping a bone on the tablecloth'],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.toasts', bank('adult.toasts', {
    principle: 'The host usually gives the first toast; stand or raise your glass, keep it short and kind; if the toast is to you, stay seated and don\'t drink to yourself.',
    hint: 'A toast is a short gift of kind words. Who gives it, and who receives it?',
    ctxLine: 'At a celebration dinner:',
    rudeWhy: 'it embarrasses someone, drags on, or pressures a guest',
    order: [{ title: 'Put the steps of giving a toast in order.', steps: ['Wait until everyone has something to drink', 'Stand, or raise your glass at a small table', 'Say a few warm words about the person or the occasion', 'Raise your glass toward the honored person', 'Take a sip with everyone and sit down'], all: true }],
    sc: [
      { p: 'table', r: ['peer', 'elder'], s: 'At {B}\'s birthday dinner, {A}, the host, stands and raises a glass: "To {B}!"', q: 'What should {B} do?',
        ok: ['Stay seated, smile, and not drink; then thank everyone.'], bad: [['Stand and drink along with everyone.', 'Drinking to yourself is like clapping for yourself; the toast is a gift from the others.'], 'Give a longer speech right away.', 'Raise a glass to {Bhim}self.'], why: 'The honored person receives the toast and then thanks the others, perhaps with a toast back.' },
      { p: 'table', r: ['peer', 'peer'], s: '{A} is drinking water when the host raises a toast.', q: 'What should {A} do?',
        ok: ['Raise {Ahis} water glass with everyone.'], bad: [['Sit out the toast because {Ahe} has only water.', 'Any drink is fine for a toast; sitting out can look like disapproval.'], 'Ask for a different drink first.', 'Leave the room until the toast is over.'], why: 'Any drink, including water, is fine for a toast. No one should press a guest to drink anything.' },
      { p: 'party', r: ['peer', 'peer'], s: 'At a dinner for {B}\'s new job, {A} is asked to give a toast.', q: 'Which toast is best?',
        ok: ['"To {B}, who works harder than anyone I know. We\'re so proud of you!"'], bad: [['A ten-minute story about {B}\'s funniest mistakes.', 'Long and embarrassing is the opposite of a toast\'s purpose.'], '"I don\'t know what to say, so cheers, I guess."', '"To {B}, who finally found a job."'], why: 'Short, warm and about the person: that is a toast.' }
    ],
    why: [
      { q: 'Why does the person being toasted not drink?', a: 'The toast is a gift from the others, and drinking to yourself is like clapping for yourself.', w: ['Because it is bad luck to drink during your own toast.', 'So they can drink twice as much later.', 'Because the host has not given permission.'] },
      { q: 'Why should toasts be short?', a: 'Everyone is holding a glass and waiting; brief and kind keeps the moment warm.', w: ['Because long toasts are against the law at restaurants.', 'So the speaker can give more toasts later.', 'Because short toasts are more expensive.'] }
    ],
    good: ['Keeping a toast under a minute', 'Raising a glass of water', 'Staying seated when the toast is to you', 'Looking at the person being honored'],
    rude: ['Drinking to yourself when the toast is to you', 'Telling an embarrassing story about the guest of honor', 'Urging a guest to switch drinks for the toast', 'Talking on your phone during the toast'],
    mix: { 1: ['sc', 'tf', 'why'], 2: ['sc', 'order', 'why', 'all'], 3: ['order', 'all', 'sc'] }
  }));

  G('adult.restaurants', bank('adult.restaurants', {
    principle: 'Reserve if needed, arrive on time, be courteous to every server, order at a similar pace and price as your host, and raise problems quietly.',
    hint: 'Treat the staff as you would treat a friend helping at your own dinner.',
    ctxLine: 'At a restaurant:',
    rudeWhy: 'it is discourteous to the staff or to the host',
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} ordered the {food}, and a different dish arrives.', q: 'What should {Ahe} do?',
        ok: ['Wait for the server to come near and say quietly, "Excuse me, I think I ordered the {food}."'], bad: [['Call across the room, "Hey! This is wrong!"', 'Shouting embarrasses the server and disturbs other diners.'], 'Eat it and complain online later.', 'Push the plate away and refuse to speak to the server.'], why: 'A quiet, friendly word fixes the problem without a scene.' },
      { p: 'restaurant', r: ['peer', 'priya'], s: '{B} has invited {A} to lunch to welcome {Ahim} to the team. The menu runs from \\$12 to \\$45.', q: 'What should {A} order?',
        ok: ['Ask, "What do you recommend?" and order something near {B}\'s choice.'], bad: [['The most expensive dish, since {B} is paying.', 'Ordering far above the host\'s choices takes advantage of a generous invitation.'], 'Three courses and a dessert to take home.', 'Nothing, so {B} spends less.'], why: 'Ordering near the host\'s price respects the host\'s generosity.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} and {B} are ready for the check, and their server is across the room.', q: 'How should {A} get the server\'s attention?',
        ok: ['Catch the server\'s eye or raise a hand slightly.'], bad: ['Snap {Ahis} fingers.', 'Whistle.', 'Call out "Check!" across the room.'], why: 'Eye contact or a small raised hand is enough; snapping and shouting treat the server like a servant.' }
    ],
    spot: [
      { p: 'restaurant', r: ['peer', 'peer'], intro: '{A} and {B} are finishing dinner.', lines: [[0, 'Excuse me, when you have a moment, could we see the dessert menu?'], [1, 'Hey! Over here! We need the check!'], [0, 'Thank you so much. Dinner was lovely.']], fault: 1, why: 'Shouting across a restaurant puts the server on the spot and disturbs other diners.' },
      { p: 'restaurant', r: ['peer', 'peer'], intro: '{A} and {B} arrive at a restaurant.', lines: [[0, 'Good evening. We have a reservation for two under {Afull}.'], [1, 'We\'re twenty minutes late, but you can still seat us now, right?'], [0, 'Thank you for holding the table for us.']], fault: 1, why: 'Arriving late and demanding a table ignores the plans of the staff and other diners. A call ahead and a polite request are kinder.' }
    ],
    good: ['Calling ahead if you will be late for a reservation', 'Saying thank you when a dish arrives', 'Raising a problem quietly with the server', 'Ordering near your host\'s price'],
    rude: ['Snapping your fingers at a server', 'Sending food back with a loud complaint', 'Ordering the most expensive dish when someone else is treating', 'Ignoring the server when they speak to you'],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'spot', 'all'], 3: ['all', 'spot', 'sc'] }
  }));

  G('adult.splitting-bill', bank('adult.splitting-bill', {
    principle: 'Traditionally whoever invites pays; with friends, agree before ordering whether to split evenly or pay for what you ordered.',
    hint: 'Was it an invitation (a gift) or a plan among friends? Settle it early.',
    ctxLine: 'Friends out for dinner:',
    rudeWhy: 'it makes someone pay unfairly or turns the bill into a quarrel',
    custom: {
      even: function (R, ctx, T) {
        var n = R.pick([3, 4, 5, 6]), each = R.pick([12, 15, 18, 20, 22, 25]), total = n * each, v = cast(R, ['peer']);
        return { q: cap(U.words(n)) + ' friends, including ' + v.A + ', agree before ordering to split the bill evenly. The total, with tax and tip, is \\$' + total + '. How much does each person pay, in dollars?', a: { t: 'num', v: String(each) },
          steps: ['They agreed to split evenly, so divide the total by the number of people.', '\\$' + total + ' ÷ ' + n + ' = \\$' + each + '.'], hint: 'Divide the total by the number of friends.' };
      },
      own: function (R, ctx, T) {
        var v = cast(R, ['peer', 'peer', 'peer']), a = R.pick([24, 26, 28, 30]), b = R.pick([25, 27, 29, 31]), small = R.pick([8, 9, 10, 11]);
        var total = a + b + small;
        return { q: v.A + ' and ' + v.B + ' order meals for \\$' + a + ' and \\$' + b + '. ' + v.C + ' orders only soup for \\$' + small + '. They never discussed how to pay. When the bill comes, what is the fairest plan?',
          a: U.mc('Each pays for what they ordered, plus a share of tax and tip.', ['Split it evenly three ways.', v.C + ' pays the whole bill since the soup was cheap.', 'Whoever reached for the bill first pays it all.'], 4),
          steps: [T.principle, 'An even split would make ' + v.C + ' pay about \\$' + U.round(total / 3, 2).toFixed(2) + ' for a \\$' + small + ' soup.', 'Paying for what each ordered is fairer here, and next time they can agree before ordering.'], hint: T.hint };
      }
    },
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} texted {B}: "Let me take you to dinner for your birthday!" The bill arrives.', q: 'Who should pay?',
        ok: ['{A}, who invited.'], bad: ['{B}, since it is {Bhis} birthday.', 'They should split it evenly.', 'Whoever ordered more.'], why: 'An invitation like "let me take you" is a gift, so the person who invites pays.' },
      { p: 'restaurant', r: ['peer', 'peer', 'peer'], s: '{A}, {B} and {C} meet for dinner as friends. Nobody has said who will pay.', q: 'When is the best time to settle how they will pay?',
        ok: ['Before ordering: "Shall we each get our own, or split it?"'], bad: ['When the bill arrives.', 'After they leave, by text.', 'Never; whoever is closest to the bill pays.'], why: 'Settling it early means nobody orders under a cloud of worry, and nobody argues over a receipt.' }
    ],
    good: ['Agreeing before ordering how you will pay', 'Paying for your own order plus your share of the tip', 'Thanking a friend who treats you'],
    fine: ['Splitting evenly when everyone ordered about the same', 'Taking turns treating each other'],
    rude: ['Arguing over each item at the table', 'Insisting on an even split after ordering much more than others', 'Ordering the most expensive dish when someone else is treating', 'Leaving before the bill comes without paying your share'],
    mix: { 1: ['sc', 'even'], 2: ['sc', 'own', 'even', 'all'], 3: ['all', 'own', 'sc', 'even'] }
  }));

  G('adult.tipping', bank('adult.tipping', {
    principle: 'At a sit-down restaurant in the U.S., about 15 to 20 percent of the bill before tax is customary, more for great service. Tipping customs differ abroad. Percentages are a guide, not a law.',
    hint: 'Find the bill before tax. Take 10 percent, then double it for 20, or add half of it for 15.',
    custom: {
      tip: function (R, ctx, T) {
        var L = lvl(ctx), bill = L === 1 ? R.pick([20, 30, 40, 50, 60, 80]) : R.pick([24, 32, 36, 44, 46, 52, 56, 64, 72, 86]);
        var pct = L === 1 ? 20 : R.pick([15, 20]), tax = Math.round(bill * 0.08 * 100) / 100;
        var tip = Math.round(bill * pct) / 100, ten = bill / 10, v = cast(R, ['peer']);
        var money = function (x) { return '\\$' + x.toFixed(2); };
        var steps = ['Start from the bill before tax: ' + money(bill) + '.', '10 percent is ' + money(ten) + '.'];
        if (pct === 20) steps.push('20 percent is twice that: ' + money(tip) + '.'); else steps.push('15 percent is 10 percent plus half of it: ' + money(ten) + ' + ' + money(ten / 2) + ' = ' + money(tip) + '.');
        return { q: 'At a sit-down restaurant, ' + v.A + '\'s bill is ' + money(bill) + ' before tax; tax adds ' + money(tax) + ', for ' + money(bill + tax) + '. ' + cap(v.Ahe) + ' wants to tip ' + pct + ' percent of the bill before tax. How much is the tip, in dollars?',
          a: { t: 'num', v: String(tip), tol: 0.005 }, steps: steps, hint: T.hint };
      },
      range: function (R, ctx, T) {
        var bill = R.pick([40, 50, 60, 80, 100]), lo = bill * 0.15, hi = bill * 0.2;
        var opts = U.uniq([bill * 0.1, lo, (lo + hi) / 2, hi, bill * 0.25, bill * 0.05].map(function (x) { return Math.round(x * 100) / 100; }));
        var choices = R.shuffle(opts), want = [];
        choices.forEach(function (x, i) { if (x >= lo - 1e-9 && x <= hi + 1e-9) want.push(i); });
        return { q: 'The bill before tax is \\$' + bill.toFixed(2) + '. Which of these tips are between 15 and 20 percent of it? Select all that apply.', a: { t: 'mc', choices: choices.map(function (x) { return '\\$' + x.toFixed(2); }), v: want },
          steps: ['15 percent of \\$' + bill.toFixed(2) + ' is \\$' + lo.toFixed(2) + '; 20 percent is \\$' + hi.toFixed(2) + '.', 'Any tip from \\$' + lo.toFixed(2) + ' to \\$' + hi.toFixed(2) + ' is in that range. More is fine for great service; the percentages are a guide, not a law.'], hint: 'Work out 15 percent and 20 percent first.' };
      }
    },
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} is traveling abroad. The bill at a café says "service included," and {Ahe} is not sure what is expected.', q: 'What is the best approach?',
        ok: ['Check the local custom; where service is included, an extra tip may not be expected.'], bad: [['Always add 20 percent, as in the U.S.', 'Tipping customs differ abroad; U.S. habits don\'t carry over.'], 'Never tip anywhere outside the U.S.', 'Ask the people at the next table how much they tipped.'], why: 'Customs differ: service may be included or tipping not expected. Reading ahead or asking at the hotel is the courteous way.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: 'At a U.S. sit-down restaurant, the service was slow because the dining room was packed, but the server stayed friendly.', q: 'What would most people consider fair?',
        ok: ['Tip within the usual range; the crowd was not the server\'s fault.'], bad: ['Leave no tip to make a point.', 'Tip 1 percent.', 'Write a complaint on the receipt instead.'], why: 'In the U.S., servers earn much of their pay from tips, so leaving none is seen as a slight. A problem with the kitchen or the crowd is a matter for the manager, not the tip.' }
    ],
    why: [
      { q: 'Why do many people figure a restaurant tip on the bill before tax?', a: 'The tax goes to the government, not to the service the tip rewards.', w: ['Because tipping on tax is against the law.', 'Because the tax is already a tip.', 'Because servers prefer smaller tips.'] },
      { q: 'Why is tipping such a strong custom at U.S. sit-down restaurants?', a: 'Servers in the U.S. earn much of their pay from tips.', w: ['Because the restaurant requires it by contract.', 'Because tips replace the sales tax.', 'Because tipping is customary in every country.'] }
    ],
    mix: { 1: ['tip', 'sc'], 2: ['tip', 'sc', 'why', 'range'], 3: ['tip', 'range', 'sc', 'why'] }
  }));

  // ================================================================ Unit 3: Meeting and Greeting
  // introductions: whose name first. Each pair: [honored, other], built from roles a reader can see in the question
  var INTRO_PAIRS = [
    { h: { who: 'june', name: 'Mrs. Hale', role: 'your grandmother' }, o: { who: 'peer', role: 'your friend' }, you: 'peer', why: 'Mrs. Hale is older, so her name comes first.' },
    { h: { who: 'park', name: 'Ms. Park', role: 'your former teacher' }, o: { who: 'peer', role: 'your roommate' }, you: 'peer', why: 'Ms. Park is older and someone you honor, so her name comes first.' },
    { h: { who: 'kofi', name: 'Mr. Mensah', role: 'a client' }, o: { who: 'priya', name: 'Priya Shah', role: 'your own manager' }, you: 'nora', why: 'At work the client is honored, even above your own manager.' },
    { h: { who: 'james', name: 'James Reed', role: 'a vice president of your company' }, o: { who: 'peer', role: 'a new intern' }, you: 'nora', why: 'At work, rank decides: the senior person\'s name comes first.' },
    { h: { who: 'peer', role: 'a guest visiting from out of town' }, o: { who: 'rosa', name: 'Rosa Lopez', role: 'your sister' }, you: 'peer', why: 'At a family gathering, the guest is honored over family.' },
    { h: { who: 'bell', name: 'Dr. Bell', role: 'the guest speaker at your club\'s dinner' }, o: { who: 'peer', role: 'a club member' }, you: 'peer', why: 'The guest speaker is the honored guest of the evening.' },
    { h: { who: 'walt', name: 'Mr. Hale', role: 'your neighbor, who is eighty' }, o: { who: 'peer', role: 'your cousin' }, you: 'peer', why: 'The older person\'s name comes first.' }
  ];
  function introP(R, ctx, T) {
    var it = R.pick(INTRO_PAIRS), used = {}, keys = [it.h.who, it.o.who, it.you].map(function (k) { if (k === 'peer') { var c = PEERS.filter(function (x) { return !used[x] && x !== it.h.who && x !== it.o.who && x !== it.you; }); k = R.pick(c); } used[k] = 1; return k; });
    function nm(spec, k) { return spec.name || FULL[k]; }
    var H = nm(it.h, keys[0]), O = nm(it.o, keys[1]), you = INFO[keys[2]][0];
    var first = R.coin();
    var people = first ? [{ who: keys[0], name: H, role: it.h.role }, { who: keys[1], name: O, role: it.o.role }] : [{ who: keys[1], name: O, role: it.o.role }, { who: keys[0], name: H, role: it.h.role }];
    people.forEach(function (pp) { if (KIDS.indexOf(pp.who) >= 0) pp.age = 'adult'; });
    var rt = function (r) { return r.replace(/\byour\b/g, you + '\'s'); };
    return { q: you + ' is introducing ' + H + ' (' + rt(it.h.role) + ') and ' + O + ' (' + rt(it.o.role) + '). Whose name should ' + you + ' say first?',
      a: { t: 'mc', choices: [H, O], v: 0 },
      viz: { name: 'et-intro', opts: { people: people, you: { who: keys[2], name: you }, mode: 'choose', quiet: true, interactive: false, honored: first ? 0 : 1 } },
      steps: [T.principle, it.why, '"' + H + ', I\'d like you to meet ' + O + '." Then ' + you + ' adds a detail they share.'], hint: T.hint };
  }
  G('adult.introductions', bank('adult.introductions', {
    principle: 'Say the honored person\'s name first (an older person, a guest, a client, a senior colleague), then present the other person, then add a detail. At work, rank decides.',
    hint: 'Who is older, the guest, the client, or more senior? That name comes first.',
    custom: { intro: introP },
    order: [{ title: 'Put the steps of an introduction in order.', steps: ['Say the honored person\'s name', 'Say "I\'d like you to meet…" and the other person\'s full name', 'Turn and say the honored person\'s name to the other', 'Add a detail they share', 'Step back and let them talk'], all: true }],
    sc: [
      { p: 'party', r: ['peer', 'peer', 'peer'], s: '{A} is talking with {B} when {C}, a friend {B} has never met, walks up. {A} can\'t remember which name should come first.', q: 'What should {A} do?',
        ok: ['Introduce them warmly anyway; the order matters much less than the introduction.'], bad: [['Say nothing and hope they introduce themselves.', 'Leaving someone standing unnamed is the real slip.'], 'Excuse {Ahim}self until {Ahe} remembers the rule.', 'Ask {B} and {C} to introduce themselves.'], why: 'A forgotten introduction is the real slip. Saying the names warmly is what counts.' },
      { p: 'office', r: ['peer', 'peer'], s: '{A} introduces {B} to a client. {A} adds, "{B} grew up in {city}, too."', q: 'Why did {A} add that detail?',
        ok: ['It gives them something to talk about, so the conversation can start.'], bad: ['To show how much {A} knows about {B}.', 'Because the rules require a hometown.', 'To fill time until lunch.'], why: 'A shared detail is the real work of an introduction: it gives two strangers a place to begin.' }
    ],
    mix: { 1: ['intro', 'sc'], 2: ['intro', 'intro', 'order', 'sc'], 3: ['intro', 'order', 'sc'] }
  }));

  G('adult.forms-of-address', bank('adult.forms-of-address', {
    principle: 'Use a title (Mr., Ms., Mrs., Mx., Dr.) with the last name until invited to use a first name, and use the name and title a person prefers.',
    hint: 'Start formal, and let the other person invite you to be less formal.',
    ctxLine: 'Meeting and writing to people:',
    rudeWhy: 'it presumes too much or ignores what the person asked to be called',
    custom: {
      title: function (R, ctx, T) {
        var it = R.pick([
          ['A letter to a woman you have never met, whose title you don\'t know', 'Ms.', ['Mrs.', 'Miss', 'Mx.']],
          ['A physician named Ada Bell', 'Dr.', ['Ms.', 'Mrs.', 'Mx.']],
          ['A man named Luis Diaz', 'Mr.', ['Dr.', 'Mx.', 'Ms.']],
          ['A person who has told you they use the title Mx.', 'Mx.', ['Mr.', 'Ms.', 'Mrs.']],
          ['A married woman who has told you she prefers Mrs.', 'Mrs.', ['Ms.', 'Miss', 'Mx.']]]);
        return { q: 'Which title fits best? ' + it[0].replace(/\.$/, '') + '.', a: U.mc(it[1], it[2], 4), steps: [T.principle, it[1] + ' is the right title here' + (it[1] === 'Ms.' ? ': "Ms." is correct for any woman, married or not, and is the safe choice when you don\'t know her preference.' : it[1] === 'Mx.' || it[1] === 'Mrs.' ? ', because it is the title the person asked for.' : '.')], hint: T.hint };
      }
    },
    sc: [
      { p: 'street', r: ['peer', 'walt'], s: '{A} meets a new neighbor, an older man who says, "I\'m Walt Hale."', q: 'What should {A} call him?',
        ok: ['"Mr. Hale," until he invites {Ahim} to use "Walt."'], bad: [['"Walt," since he said his first name.', 'Giving a full name is not an invitation to use the first name.'], '"Hey there."', '"Sir Walt."'], why: 'Start with a title and last name; switch when invited.' },
      { p: 'office', r: ['peer', 'priya'], s: 'On {A}\'s first day, {Ahis} manager says, "Welcome! I\'m Priya Shah, but please call me Priya."', q: 'What should {A} call her?',
        ok: ['"Priya," as she asked.'], bad: ['"Ms. Shah," to be extra polite.', '"Boss."', '"Ms. Priya."'], why: 'Use the name a person asks for. Once invited, the first name is the courteous choice.' },
      { p: 'office', r: ['peer', 'peer'], s: '{A} is emailing {Bfull}, a person {Ahe} has never met, and isn\'t sure of {Bhis} title.', q: 'What is the best approach?',
        ok: ['Use "Dear {Bfull}," or look at how {B} signs emails, and use that.'], bad: [['Guess a title and hope.', 'Guessing can mean using a title the person doesn\'t use.'], 'Leave out the greeting.', 'Write "Dear Sir or Madam."'], why: 'When unsure, use the full name or follow the person\'s own signature.' }
    ],
    good: ['"Good morning, Dr. Bell."', 'Asking, "How do you like to be addressed?"', 'Switching to a first name after being invited to', 'Writing "Ms." when you don\'t know a woman\'s preference'],
    rude: [['Calling a new client by a nickname', 'a nickname presumes a closeness that isn\'t there yet'], ['Guessing "Mrs." for a woman you just met', '"Ms." is the safe choice'], ['Ignoring a person\'s request to be called by a certain name', 'a person\'s own name is theirs to choose'], ['Calling an older stranger "buddy"', 'start with a title and last name']],
    mix: { 1: ['title', 'sc', 'tf'], 2: ['title', 'sc', 'all'], 3: ['all', 'sc', 'title'] }
  }));

  G('adult.greetings', bank('adult.greetings', {
    principle: 'In the U.S., stand and shake hands firmly while saying your name; elsewhere a bow, a nod, a hand on the heart or a cheek kiss may be usual, and some people prefer not to shake hands. Follow the other person\'s lead.',
    hint: 'Watch what the other person offers, and match it warmly.',
    ctxLine: 'Greeting people at a gathering:',
    rudeWhy: 'it ignores how the other person chose to greet you',
    sc: [
      { p: 'office', r: ['peer', 'peer'], poses: { 1: 'heart' }, s: '{A} reaches out to shake hands with {B}, who smiles and places {Bhis} right hand on {Bhis} heart instead.', q: 'What should {A} do?',
        ok: ['Lower {Ahis} hand, smile, and nod or return the gesture.'], bad: [['Keep {Ahis} hand out until {B} shakes it.', 'Pressing a handshake ignores the greeting {B} chose.'], 'Ask {B} why {Bhe} doesn\'t shake hands.', 'Look away and say nothing.'], why: 'Follow the other person\'s lead; a warm greeting can take many forms.' },
      { p: 'party', r: ['peer', 'peer'], s: '{A} is seated at a party when the host brings over {B} to meet {Ahim}.', q: 'What should {A} do?',
        ok: ['Stand, smile, shake hands if offered, and say {Ahis} name.'], bad: [['Stay seated and wave.', 'In the U.S., standing when introduced shows respect.'], 'Keep eating and nod.', 'Stand but keep looking at {Ahis} phone.'], why: 'Standing to greet is a sign of respect in the U.S. (someone who can\'t stand easily may greet warmly from a seat).' },
      { p: 'office', r: ['peer', 'peer'], poses: { 0: 'shake', 1: 'shake' }, flip: { 1: true }, s: '{A} meets {B} at a job fair, and they shake hands.', q: 'What makes a good handshake?',
        ok: ['A firm, brief grip, palm to palm, while looking at {B} and saying {Ahis} name.'], bad: ['A limp grip while looking at the floor.', 'A crushing grip held for ten seconds.', 'Just the fingertips, to be gentle.'], why: 'Firm, brief and with a look at the person\'s face: that is the American handshake.' }
    ],
    good: ['Standing and smiling when introduced', 'Returning a bow with a nod', 'Greeting a person who doesn\'t shake hands with a warm hello', 'Saying your name as you shake hands'],
    rude: [['Pressing a handshake on someone who has bowed', 'it ignores the greeting they chose'], ['A limp handshake while looking away', 'a firm grip and a look at the person show you mean it'], ['Commenting on how someone chose to greet you', 'a greeting needs no comment'], ['Staying seated and scrolling while being introduced', 'it says the person isn\'t worth your attention']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.small-talk', bank('adult.small-talk', {
    principle: 'Small talk uses safe shared topics (the event, travel, books, food, the weather), open questions and real listening; it leads to bigger conversations.',
    hint: 'Would you mind being asked this by someone you met five minutes ago?',
    ctxLine: 'Meeting someone new at a party:',
    rudeWhy: 'it is too personal for someone you just met',
    sc: [
      { p: 'party', r: ['peer', 'peer'], s: '{A} meets {B} at a friend\'s party and wants to start a conversation.', q: 'Which question is the best opener?',
        ok: ['"How do you know the host?"', '"What have you been reading lately?"', '"Have you tried the {dessert}?"'], bad: [['"How much do you earn?"', 'Pay is personal and can make people feel compared.'], '"How old are you?"', '"Are you planning to have kids?"'], why: 'Safe, shared topics let strangers find common ground before anything personal.' },
      { p: 'party', r: ['peer', 'peer'], s: '{A} asks {B}, "Do you like {hobby}?" {B} says, "Yes."', q: 'What should {A} say next?',
        ok: ['"What got you started?" and listen to the answer.'], bad: ['"Okay." and look around the room.', '"I\'m much better at it than most people."', 'Change the topic to {Ahis} own job.'], why: 'An open question invites a story; listening and following up keeps the conversation going.' },
      { p: 'office', r: ['peer', 'peer'], s: 'At a work event, {A} is curious about {B}\'s new job.', q: 'Which question fits?',
        ok: ['"What do you enjoy most about it?"'], bad: [['"How much do they pay you?"', 'Pay is personal.'], '"Why did you leave your old job, really?"', '"Isn\'t that job boring?"'], why: 'An open, friendly question lets {B} share as much as {Bhe} likes.' }
    ],
    spot: [
      { p: 'party', r: ['peer', 'peer'], intro: '{A} and {B} meet at a party.', lines: [[0, 'How do you know Rosa and James?'], [1, 'Rosa and I went to school together. And you?'], [0, 'So, how old are you, anyway?'], [1, 'Old enough to like a good party.']], fault: 2, why: 'Age is personal. A question about the event, a hobby or travel keeps the talk easy.' },
      { p: 'party', r: ['peer', 'peer'], intro: '{A} and {B} meet at a wedding.', lines: [[0, 'Wasn\'t the music lovely?'], [1, 'It was! I\'m {B}, by the way. I work with the groom.'], [0, 'Nice to meet you. How much did you spend on the gift?'], [1, 'Oh, look, they\'re cutting the cake.']], fault: 2, why: 'Asking what a gift cost is personal and can make people feel compared.' }
    ],
    good: ['Asking how someone knows the host', 'Asking what they like to do on weekends', 'Listening and asking a follow-up question', 'Talking about the food or the event'],
    rude: [['Asking someone you just met about their salary', 'pay is personal'], ['Asking a new acquaintance when they plan to have children', 'that is a private matter'], ['Commenting on a stranger\'s weight', 'remarks about bodies are personal and can hurt'], ['Talking only about yourself for ten minutes', 'conversation is shared']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'spot', 'all'], 3: ['all', 'spot', 'sc'] }
  }));

  // ================================================================ Unit 4: Hosting and Being a Guest
  // invitation pieces, for "what is missing?" problems
  var INV_PARTS = [['host', 'who is hosting'], ['occasion', 'the occasion'], ['when', 'the date and time'], ['where', 'the place'], ['rsvp', 'how and by when to reply']];
  function invMissingP(R, ctx, T) {
    var v = cast(R, ['peer', 'peer']), miss = R.pick(INV_PARTS);
    var day = R.pick(['Saturday, May 4', 'Friday, June 7', 'Sunday, March 9', 'Saturday, October 12']), hr = R.pick(['6:30 p.m.', '7 p.m.', '2 p.m.']);
    var lines = { host: v.Afull + ' invites you', occasion: 'to ' + v.event + ' for ' + v.B + '\'s birthday', when: 'on ' + day + ', at ' + hr, where: 'at 18 Willow Lane, ' + v.city, rsvp: 'Please reply to ' + v.A + ' by text, 555-0142, one week ahead' };
    var text = INV_PARTS.filter(function (x) { return x !== miss; }).map(function (x) { return lines[x[0]]; }).join('<br>');
    var wrong = INV_PARTS.filter(function (x) { return x !== miss; }).map(function (x) { return cap(x[1]); });
    return { q: 'This invitation is missing one thing a guest needs. What is it?<blockquote>' + text + '</blockquote>', a: U.mc(cap(miss[1]), R.sample(wrong, lvl(ctx) === 1 ? 2 : 3), 4),
      steps: [T.principle, 'Check each part: who, what, when, where, and how to reply.', 'Missing: ' + miss[1] + '.'], hint: T.hint };
  }
  G('adult.invitations', bank('adult.invitations', {
    principle: 'A good invitation says who is hosting, what, when, where, what to wear if it matters, and how and by when to reply, and it names exactly who is invited.',
    hint: 'Could a guest arrive on time, dressed right, and know how to answer?',
    custom: { missing: invMissingP },
    order: [{ title: 'Put the parts of an invitation in order, top to bottom.', steps: ['Who is hosting', 'The occasion', 'Date and time', 'Place', 'What to wear', 'How to reply, and by when'], all: true }],
    sc: [
      { p: null, r: ['peer', 'peer'], s: '{A} receives an invitation addressed only to "{Afull}." {Ahe} wonders whether {Ahe} may bring a date.', q: 'What does the invitation tell {Ahim}?',
        ok: ['Only {A} is invited; the envelope names exactly who is invited.'], bad: [['{Ahe} may bring anyone, since dates are always welcome.', 'The invitation names who is invited; adding guests leaves the host to find food and space.'], '{Ahe} should bring a date and apologize at the door.', '{Ahe} should ask the host why no guest was included.'], why: 'If the host meant to include a guest, the invitation would say "and Guest."' },
      { p: null, r: ['peer', 'peer'], s: '{A} is planning {event} and texts friends: "Party Saturday, come by!"', q: 'What should {A} add?',
        ok: ['The time, the address, and how and by when to reply.'], bad: ['Nothing; friends will figure it out.', 'A list of what everyone should bring.', 'A note that late replies will not be accepted.'], why: 'Every missing detail is a question guests must ask, or a guess they may get wrong.' }
    ],
    mix: { 1: ['missing', 'sc'], 2: ['missing', 'order', 'sc'], 3: ['order', 'missing', 'sc'] }
  }));

  G('adult.rsvp', bank('adult.rsvp', {
    principle: 'Reply by the date asked, in the way asked. "RSVP" asks for a reply either way; "regrets only" asks only those not coming to reply. A reply is a promise.',
    hint: 'What does the host need to plan, and what did the invitation ask you to do?',
    ctxLine: 'Answering invitations:',
    rudeWhy: 'it leaves the host unable to plan',
    custom: {
      reply: function (R, ctx, T) {
        var it = R.pick([
          ['RSVP by May 1', 'coming', 'Reply yes by May 1.', ['No reply needed.', 'Reply only if something changes.', 'Reply on the day of the party.']],
          ['RSVP by May 1', 'not coming', 'Reply no by May 1.', ['No reply needed.', 'Reply after the party.', 'Simply don\'t go.']],
          ['Regrets only', 'coming', 'No reply needed; just arrive on time.', ['Reply yes by text.', 'Reply yes and ask what to bring.', 'Reply only on the day of the party.']],
          ['Regrets only', 'not coming', 'Reply that you can\'t come.', ['No reply needed.', 'Reply yes, then don\'t go.', 'Reply after the party.']]]);
        var v = cast(R, ['peer']);
        return { q: v.A + '\'s invitation says "' + it[0] + '." ' + cap(v.Ahe) + ' is ' + it[1] + '. What should ' + v.Ahe + ' do?', a: U.mc(it[2], it[3], 4),
          steps: [T.principle, it[0] === 'Regrets only' ? '"Regrets only" asks only guests who are not coming to reply.' : '"RSVP" means "please reply," yes or no.', 'So: ' + it[2]], hint: T.hint };
      }
    },
    text: [
      { title: '{B}', msgs: [[1, 'We\'d love to have you for dinner on the 9th! RSVP by the 2nd?']], q: 'Which reply is best?', ok: ['Thank you so much! I\'d love to come. See you on the 9th.', 'Thank you for asking! I\'m sorry, I can\'t make it on the 9th, but I hope it\'s a lovely evening.'],
        bad: [['Maybe! I\'ll see how the week goes.', ''], 'Can I bring my roommate and her brother?', 'Who else is coming? I\'ll decide after I know.'], why: 'A clear yes or no, sent promptly, lets the host plan. A "maybe" or added guests leave the host guessing.' },
      { title: '{B}', msgs: [[1, 'Game night at my place Friday at 7! Let me know by Wednesday if you can come.']], q: '{A} has a work shift Friday. Which reply is best?', ok: ['Thanks for the invite! I have to work Friday, so I can\'t come this time. Have fun!'],
        bad: ['Ugh, work. Maybe.', 'I\'ll come if nothing better comes up.', '(No reply)'], why: 'A kind, clear no by the date asked is the courteous answer.' }
    ],
    sc: [
      { p: null, r: ['peer', 'peer'], s: '{A} said yes to {B}\'s dinner on Saturday. On Thursday, {Ahe} is invited to a concert the same night.', q: 'What should {A} do?',
        ok: ['Keep the dinner and decline the concert kindly.'], bad: [['Cancel the dinner; the concert is a rare chance.', 'Canceling for a better offer tells the host they were a placeholder.'], 'Go to both and arrive at dinner late.', 'Ask {B} to move the dinner.'], why: 'A yes is a promise; {B} has planned food for {Ahim}.' }
    ],
    good: ['Replying by the date asked', 'Using the reply method the invitation gives', 'Declining kindly and promptly when you can\'t go', 'Telling the host right away if a real emergency means you must cancel'],
    rude: [['Replying "maybe" and never following up', 'a "maybe" leaves the host unable to plan'], ['Bringing a guest who was not invited', 'the host planned for the people invited'], ['Canceling at the last minute for a better offer', 'a reply is a promise'], ['Not replying to an RSVP at all', 'RSVP asks for an answer either way']],
    mix: { 1: ['reply', 'sc', 'tf'], 2: ['reply', 'text', 'sc', 'all'], 3: ['all', 'text', 'reply', 'sc'] }
  }));

  G('adult.arriving-leaving', bank('adult.arriving-leaving', {
    principle: 'Arrive on time for a dinner (not early), within a reasonable window for a party; leave before the host looks tired, and thank the host at the door.',
    hint: 'Think about the host\'s last minutes before the guests come, and their energy at the end.',
    ctxLine: 'Arriving at and leaving a dinner party:',
    rudeWhy: 'it ignores the host\'s time',
    order: [{ title: 'Put the steps of a graceful goodbye in order.', steps: ['Notice the evening winding down', 'Tell the host you should be going', 'Gather your coat and things', 'Thank the host at the door', 'Send a thank-you message the next day'], all: true }],
    sc: [
      { p: 'door', r: ['peer', 'peer'], s: '{A} is invited to dinner at {B}\'s at 7:00. {Ahe} could arrive at 6:30 to help.', q: 'What is best?',
        ok: ['Arrive at 7:00 (or a few minutes after), unless {B} has asked {Ahim} to come early.'], bad: [['Arrive at 6:30 as a surprise to help.', 'An early guest catches the host unready in the busiest minutes.'], 'Arrive at 7:45 so the food is ready.', 'Arrive at 6:00 to beat the traffic.'], why: 'The host uses the last minutes before a dinner to get ready. Offer help ahead instead: "May I come early to help?"' },
      { p: 'street', r: ['peer', 'peer'], s: '{A} is stuck in traffic and will be 25 minutes late to {B}\'s 7:00 dinner.', q: 'What should {A} do?',
        ok: ['Once safely stopped, text {B}: "So sorry, I\'m running about 25 minutes late. Please start without me!"'], bad: ['Say nothing and slip in quietly.', 'Skip the dinner without a word.', 'Call {B} three times while {Bhe} is cooking.'], why: 'More than fifteen minutes late calls for a heads-up, so the host can decide whether to wait.' },
      { p: 'home', r: ['peer', 'peer'], s: 'It is late. {B}, the host, has started clearing cups and stifling yawns.', q: 'What should {A} do?',
        ok: ['Say, "This was wonderful. I should let you get some rest," and thank {B} at the door.'], bad: ['Ask for another cup of coffee.', 'Start a long new story.', 'Leave quietly without saying goodbye.'], why: 'Hosts rarely ask guests to leave; noticing the signs and saying goodnight warmly is the guest\'s job.' }
    ],
    good: ['Arriving at the time on the invitation', 'Texting a heads-up when you will be more than 15 minutes late', 'Thanking the host at the door', 'Leaving while everyone is still enjoying the evening'],
    rude: [['Arriving half an hour early unannounced', 'it catches the host unready'], ['Arriving 45 minutes late to dinner without a word', 'the meal is timed to the minute'], ['Leaving without saying goodbye to the host', 'the host deserves thanks'], ['Staying long after the host starts yawning and clearing up', 'it ignores the host\'s signs']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  G('adult.host-gifts', bank('adult.host-gifts', {
    principle: 'A small host gift is welcome; it is for the host to enjoy later, not to serve that night, and it should never add work.',
    hint: 'Will this gift make the host stop what they are doing right now?',
    ctxLine: 'Choosing a gift to bring to a dinner host:',
    rudeWhy: 'it adds work for the host right when guests are arriving',
    sc: [
      { p: 'door', r: ['peer', 'peer'], holds: { 0: 'gift' }, poses: { 0: 'give' }, s: '{A} hands {B} {hostgift} at the door of {Bhis} dinner party.', q: 'What should {A} expect?',
        ok: ['That {B} will put it aside to enjoy later.'], bad: [['That {B} will open and serve it tonight.', 'A host gift is for later; the host has already planned the meal.'], 'That {B} will open it in front of everyone.', 'That {B} will send it back with {Ahim}.'], why: 'A host gift says thank you; the host enjoys it later, or shares it if {Bhe} likes.' },
      { p: 'door', r: ['peer', 'peer'], s: '{A} wants to bring flowers to {B}\'s dinner.', q: 'How can {Ahe} make them easy for the host?',
        ok: ['Bring them already arranged in a vase, or send them the day before or after.'], bad: [['Bring a loose bunch to put in water at the door.', 'The host must stop greeting guests to hunt for a vase.'], 'Ask {B} to find a vase right away.', 'Bring a large bouquet and arrange it in {B}\'s kitchen.'], why: 'A gift should never add work at the busiest moment of the evening.' },
      { p: 'door', r: ['peer', 'peer'], s: '{A} is going to {B}\'s dinner and wonders about bringing a homemade dish of {food}.', q: 'What is the courteous plan?',
        ok: ['Bring it only if {B} asks for a dish; otherwise bring a small gift to enjoy later.'], bad: [['Bring it and expect it on the table.', 'An unplanned dish upsets the host\'s menu.'], 'Bring it and heat it in {B}\'s oven during dinner.', 'Bring it and tell guests the host forgot dessert.'], why: 'The host planned the menu. Bring food when invited to; otherwise choose a gift for later.' }
    ],
    good: ['Bringing flowers already in a vase', 'Bringing a box of chocolates for the host to enjoy later', 'Bringing a jar of jam for the host\'s breakfast', 'Bringing a dish when the host asked for one'],
    fine: ['Bringing nothing to a casual get-together where gifts are not the custom'],
    rude: [['Expecting the host to serve the dessert you brought', 'the host planned the menu'], ['Handing the host a loose bunch of flowers as guests arrive', 'it sends the host hunting for a vase'], ['Asking the host to open your gift in front of everyone', 'it puts the host and other guests on the spot']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.hosting-dinner', bank('adult.hosting-dinner', {
    principle: 'A host greets and introduces guests, asks about food needs ahead, seats the guest of honor at the host\'s right, keeps the talk moving, and puts guests at ease.',
    hint: 'What would make each guest feel welcome and comfortable?',
    ctxLine: 'Hosting a dinner for six:',
    rudeWhy: 'it leaves guests uncomfortable or alone',
    custom: { setting: function (R, ctx) { return numberP(R, ctx, ['informal']); } },
    order: [{ title: 'Put a host\'s evening in order.', steps: ['Ask guests about allergies and food needs when you invite them', 'Greet each guest at the door and take coats', 'Introduce guests who don\'t know each other', 'Seat the guest of honor at your right', 'Serve, and draw everyone into the conversation', 'Thank each guest for coming at the door'] }],
    sc: [
      { p: 'table', r: ['peer', 'elder', 'peer'], s: '{A} is hosting a dinner in honor of {B}.', q: 'Where should {A} seat {B}?',
        ok: ['At {A}\'s right.'], bad: ['At the far end of the table.', 'Wherever {B} happens to sit.', 'Next to the kitchen door.'], why: 'The seat at the host\'s right is the traditional place of honor.' },
      { p: 'table', r: ['peer', 'peer'], s: '{A}\'s main dish came out overcooked.', q: 'What should {Ahe} do?',
        ok: ['Serve it with a smile, say a light word if anyone notices, and turn the talk to the guests.'], bad: [['Apologize for it again and again all evening.', 'Repeated apologies keep attention on the problem and make guests reassure the host.'], 'Throw it out and order pizza.', 'Blame the oven loudly.'], why: 'Guests remember a relaxed host more than a perfect dish.' },
      { p: 'party', r: ['peer', 'peer', 'peer'], s: 'At {A}\'s dinner, {B} is quiet and doesn\'t know anyone.', q: 'What should {A} do?',
        ok: ['Introduce {B} to {C} with a detail they share, and ask {B} a question during dinner.'], bad: ['Leave {B} alone; {Bhe} will warm up.', 'Spend the evening in the kitchen.', 'Tell everyone that {B} is shy.'], why: 'Drawing quiet guests into the talk is a host\'s main job.' },
      { p: null, r: ['peer', 'peer'], s: '{A} is inviting {B} to dinner and plans to serve {food}.', q: 'What should {A} ask when inviting {B}?',
        ok: ['"Are there any foods you don\'t eat, or any allergies?"'], bad: ['Nothing; guests eat what is served.', '"Will you bring the dessert?"', '"How much do you usually eat?"'], why: 'Asking ahead spares a guest from going hungry or explaining at the table.' }
    ],
    mix: { 1: ['sc'], 2: ['sc', 'order'], 3: ['order', 'sc', 'setting'] }
  }));

  G('adult.overnight-guests', bank('adult.overnight-guests', {
    principle: 'A good guest agrees on dates, follows the house routine, keeps their space tidy, offers to help, and sends a thank-you; a good host gives towels, a key and a plan.',
    hint: 'Sharing a home means sharing routines. What would lighten the other person\'s load?',
    ctxLine: 'Staying with friends for a weekend:',
    rudeWhy: 'it adds to the host\'s load or ignores the household',
    order: [{ title: 'Put a guest\'s visit in order.', steps: ['Agree on arrival and departure dates ahead', 'Arrive when planned, with a small gift', 'Follow the household\'s routine', 'Strip the bed or tidy the room before leaving', 'Send a thank-you note after the visit'], all: true }],
    sc: [
      { p: 'home', r: ['peer', 'peer'], s: '{A} is staying with {B} for the weekend and would like to stay until Tuesday.', q: 'What should {A} do?',
        ok: ['Ask early and make it easy to say no: "Would Tuesday be all right? No worries if not."'], bad: [['Stay until Tuesday and mention it on Sunday night.', 'Changing the dates is a request, not an announcement.'], 'Ask on Monday morning.', 'Hint about it until {B} offers.'], why: 'The host may have plans. A clear, early request respects them.' },
      { p: 'kitchen', r: ['peer', 'peer'], s: 'At {B}\'s home, breakfast is at 7:30. {A} usually sleeps late.', q: 'What should {A} do?',
        ok: ['Join breakfast, or ask the night before whether it is all right to sleep in.'], bad: ['Sleep in without a word and expect breakfast at 10.', 'Ask {B} to move breakfast for everyone.', 'Skip breakfast and complain about the early hour.'], why: 'A guest fits in with the house routine, or asks ahead.' },
      { p: 'home', r: ['peer', 'peer'], s: '{B} has houseguests arriving tonight.', q: 'What will help them most?',
        ok: ['Set out towels and sheets, explain the key and the plan, and give them some time to rest.'], bad: ['Plan an activity for every hour.', 'Let them find things on their own.', 'Tell them the house rules as they break them.'], why: 'A host who sets things out and explains the plan spares guests from asking for every small thing.' }
    ],
    good: ['Making your bed each morning', 'Offering to wash the dishes', 'Asking before extending your stay', 'Sending a thank-you note after the visit'],
    rude: [['Extending your stay without asking', 'the host may have plans'], ['Expecting to be entertained every hour', 'a host needs rest, too'], ['Leaving wet towels on the floor', 'it leaves cleanup for the host'], ['Ignoring the household\'s quiet hours', 'the household has its routine']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  // ================================================================ Unit 5: Notes, Letters and Email
  // notes as parts (keys from MathLadder.etiquette.NOTES), adult versions; {A} writes to {B}
  var NOTE_BANK = {
    thanks: [
      { date: 'October 12', greeting: 'Dear {B},', thanks: 'Thank you so much for {giftthe} you sent for my new apartment.', detail: 'I have already put it to use, and it makes the place feel like home.', personal: 'I hope you will come for dinner soon so I can cook for you.', closing: 'Warmly,', signature: '{A}' },
      { date: 'June 3', greeting: 'Dear {B},', thanks: 'Thank you for the wonderful dinner on Saturday.', detail: 'Your {dessert} was the best I have had in years.', personal: 'It was a treat to meet your friends from {city}.', closing: 'With thanks,', signature: '{A}' },
      { date: 'May 20', greeting: 'Dear {B},', thanks: 'Thank you for the generous graduation gift.', detail: 'I am putting it toward books for my first semester.', personal: 'Your note about your own first year made me smile.', closing: 'With love,', signature: '{A}' }
    ],
    condolence: [
      { greeting: 'Dear {B},', sympathy: 'I was so sorry to hear about the loss of your mother.', memory: 'I will always remember how she cheered at every one of our games.', offer: 'I would like to bring dinner over on Thursday, if that would help.', closing: 'With deepest sympathy,', signature: '{A}' },
      { greeting: 'Dear {B},', sympathy: 'I am so sorry for the loss of your grandfather.', memory: 'He was the kindest neighbor on our street, and he always had time to talk.', offer: 'I can walk your dog any morning this week; just say the word.', closing: 'Thinking of you,', signature: '{A}' }
    ],
    letter: [
      { date: 'April 3, 2026', greeting: 'Dear Mr. Diaz,', body: 'Thank you for coaching our team this spring. Would you be willing to write a letter of recommendation for my summer job application, due May 1?', closing: 'Sincerely,', signature: '{Afull}' },
      { date: 'February 10, 2026', greeting: 'Dear Ms. Grant,', body: 'I am writing about the heater in apartment 4B, which has not worked since Monday. Could someone repair it this week?', closing: 'Sincerely,', signature: '{Afull}' }
    ],
    email: [
      { to: '{Bfull}', subject: 'Question about Thursday\'s meeting', greeting: 'Dear {B},', body: 'Could we move Thursday\'s meeting to 2 p.m.? I am happy to send the report ahead.', closing: 'Best regards,', signature: '{A}' },
      { to: '{Bfull}', subject: 'Thank you for the interview', greeting: 'Dear {B},', body: 'Thank you for meeting with me today. I enjoyed learning about the team and the project.', closing: 'Sincerely,', signature: '{Afull}' }
    ]
  };
  function noteParts(R, kind, v) { var src = R.pick(NOTE_BANK[kind]), out = {}; Object.keys(src).forEach(function (k) { out[k] = fill(src[k], v); }); return out; }
  function noteOrderP(R, ctx, kind, T) {
    var v = cast(R, ['peer', 'peer']), parts = noteParts(R, kind, v), order = EM().NOTES[kind].filter(function (k) { return parts[k] !== undefined && k !== 'to' && k !== 'subject'; });
    var it = { title: 'Put the lines of this ' + (kind === 'thanks' ? 'thank-you note' : kind === 'condolence' ? 'condolence note' : kind) + ' in order, top to bottom.', steps: order.map(function (k) { return parts[k]; }), all: true };
    var p = orderP(R, ctx, it, T);
    p.steps.splice(1, 0, 'The parts, in order: ' + order.map(function (k) { return EM().PART_NAMES[k]; }).join(', ') + '.');
    return p;
  }
  function noteMissingP(R, ctx, kind, T) {
    var v = cast(R, ['peer', 'peer']), parts = noteParts(R, kind, v), names = EM().NOTES[kind].filter(function (k) { return parts[k] !== undefined && ['date', 'signature', 'to'].indexOf(k) < 0; });
    var omit = R.pick(names);
    var choices = names.map(function (k) { return EM().PART_NAMES[k]; });
    return { q: 'One part of this ' + (kind === 'thanks' ? 'thank-you note' : kind === 'condolence' ? 'condolence note' : kind) + ' is missing. Which part?', a: U.mc(EM().PART_NAMES[omit], R.sample(choices.filter(function (c) { return c !== EM().PART_NAMES[omit]; }), Math.min(3, choices.length - 1)), 4),
      viz: { name: 'et-note', opts: { kind: kind, parts: parts, mode: 'missing', omit: omit, quiet: true, interactive: false, label: 'A note with one part missing' } },
      steps: ['A ' + (kind === 'thanks' ? 'thank-you note' : kind) + ' has these parts: ' + EM().NOTES[kind].filter(function (k) { return parts[k] !== undefined; }).map(function (k) { return EM().PART_NAMES[k]; }).join(', ') + '.', 'The missing part is: ' + EM().PART_NAMES[omit] + '.'], hint: 'Name the parts you can see, one by one.' };
  }

  G('adult.thank-you-notes-adult', bank('adult.thank-you-notes-adult', {
    principle: 'Write soon; name the gift or kindness; say how you will use or enjoy it; add a personal line; close warmly. A late note is better than none.',
    hint: 'Does the note prove you noticed the specific gift or kindness?',
    custom: { order: function (R, ctx, T) { return noteOrderP(R, ctx, 'thanks', T); }, missing: function (R, ctx, T) { return noteMissingP(R, ctx, 'thanks', T); } },
    sc: [
      { p: null, r: ['peer', 'elder'], s: '{A} is writing to thank {B} for {gift}.', q: 'Which line is the best "thank you" line?',
        ok: ['"Thank you so much for {giftthe}."'], bad: [['"Thanks for the stuff."', 'Naming the gift shows you noticed it.'], '"Thank you for whatever you sent."', '"I got your package."'], why: 'Naming the specific gift tells {B} that it arrived and mattered.' },
      { p: null, r: ['peer', 'peer'], s: '{A} received a gift from {B} two months ago and never wrote.', q: 'What should {A} do?',
        ok: ['Write now, with a brief apology for the delay.'], bad: [['Skip it; a late note is worse than none.', 'A late note is always better than no note.'], 'Wait until next year\'s gift and thank {B} for both.', 'Mention it only if {B} asks.'], why: 'A late note is always better than none.' },
      { p: null, r: ['peer', 'peer'], s: '{A} had a job interview with {B} this morning.', q: 'When should {A} send a thank-you?',
        ok: ['Today or tomorrow, by email or a short note.'], bad: ['In a few weeks, after a decision.', 'Only if {Ahe} gets the job.', 'Never; interviews don\'t need thanks.'], why: 'Write soon: a prompt thank-you after an interview is expected and appreciated.' }
    ],
    mix: { 1: ['sc', 'missing'], 2: ['missing', 'order', 'sc'], 3: ['order', 'missing', 'sc'] }
  }));

  G('adult.condolence-notes', bank('adult.condolence-notes', {
    principle: 'Say you are sorry for the loss, share a memory or a good quality of the person, offer specific help if you can, and close with sympathy. Keep it short.',
    hint: 'Is every line about the grieving person and the one they lost?',
    ctxLine: 'Writing to a friend who has lost a parent:',
    rudeWhy: 'it explains or compares the loss instead of comforting',
    custom: { order: function (R, ctx, T) { return noteOrderP(R, ctx, 'condolence', T); }, missing: function (R, ctx, T) { return noteMissingP(R, ctx, 'condolence', T); } },
    sc: [
      { p: null, r: ['peer', 'peer'], s: '{A}\'s draft to {B}, whose father died, includes the line "Everything happens for a reason."', q: 'What should {A} write instead?',
        ok: ['A memory or a good quality: "Your dad always made everyone laugh at the block party."'], bad: [['"I know exactly how you feel."', 'Comparing losses turns attention away from {B}.'], '"At least he lived a long life."', '"Let me know if you need anything."'], why: 'A memory tells {B} that {Bhis} father mattered to others too. Explanations of the loss can feel dismissive.' },
      { p: null, r: ['peer', 'peer'], s: '{A} wants to help {B} after a loss.', q: 'Which offer is best?',
        ok: ['"I\'ll bring dinner on Thursday, if that would help."'], bad: [['"Let me know if you need anything."', 'A general offer puts the work of asking on the grieving person.'], '"Call me sometime."', '"I\'m sure you have lots of help already."'], why: 'A specific offer is easier to accept.' },
      { p: null, r: ['peer', 'peer'], s: '{A} doesn\'t know what to say to {B}, whose grandmother has died, and is afraid of saying the wrong thing.', q: 'What should {A} do?',
        ok: ['Send a short note: "I\'m so sorry about your grandmother. Thinking of you."'], bad: [['Say nothing until {Ahe} thinks of the perfect words.', 'Silence can feel like not caring; simple words are enough.'], 'Write a long letter about {Ahis} own losses.', 'Wait a year and then mention it.'], why: 'Simple, sincere words are best, and a short note is far better than none.' }
    ],
    good: ['"I\'m so sorry for your loss."', '"She was the kindest teacher I ever had."', '"I\'ll bring dinner on Thursday."', '"Thinking of you and your family."'],
    rude: [['"I know how you feel."', 'it turns the attention to the writer'], ['"Everything happens for a reason."', 'it explains the loss instead of comforting'], ['"At least he lived a long life."', '"at least" makes the loss sound small'], ['"You\'ll get over it soon."', 'grief has no schedule']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'missing', 'all'], 3: ['all', 'order', 'missing', 'sc'] }
  }));

  G('adult.letters', bank('adult.letters', {
    principle: 'A letter has the date, a greeting, the body in short paragraphs, a closing and your signature; match the closing to how well you know the reader.',
    hint: 'How well does the writer know the reader?',
    custom: {
      order: function (R, ctx, T) { return noteOrderP(R, ctx, 'letter', T); },
      closing: function (R, ctx, T) {
        var it = R.pick([
          ['a landlord, about a broken heater', 'Sincerely,', ['Love,', 'See ya,', 'XOXO,']],
          ['a hiring manager', 'Sincerely,', ['Love,', 'Cheers,', 'Later,']],
          ['a grandmother', 'Love,', ['Respectfully,', 'Yours truly,', 'Regards,']],
          ['a college admissions office', 'Respectfully,', ['Love,', 'Hugs,', 'See you soon,']],
          ['a close friend', 'Warmly,', ['Respectfully,', 'Yours faithfully,', 'To whom it may concern,']]]);
        var v = cast(R, ['peer']);
        return { q: v.A + ' is writing a letter to ' + it[0] + '. Which closing fits best?', a: U.mc(it[1], it[2], 4), steps: [T.principle, '"' + it[1] + '" fits a letter to ' + it[0] + '.', 'When unsure, "Sincerely," or "Best regards," is safe for anyone.'], hint: T.hint };
      },
      missing: function (R, ctx, T) { return noteMissingP(R, ctx, 'letter', T); }
    },
    mix: { 1: ['closing', 'missing'], 2: ['closing', 'order', 'missing'], 3: ['order', 'closing', 'missing'] }
  }));

  var ENV_MIS = {
    'stamp-left': ['The stamp is in the wrong corner.', 'The stamp goes in the upper right, where the post office expects it.'],
    'return-center': ['The two addresses have traded places.', 'The delivery address goes in the center; the return address goes in the upper left.'],
    'no-zip': ['The delivery address has no ZIP code.', 'The ZIP code ends the last line of the address; mail is sorted by it.'],
    'no-title': ['The name has no title, such as Ms. or Dr.', 'A title and full name are the courteous way to address a letter.']
  };
  G('adult.envelopes', bank('adult.envelopes', {
    principle: 'The recipient\'s name and address go in the center, your return address in the upper left, and the stamp in the upper right; use titles, full names and the ZIP code.',
    hint: 'The post office reads the center block. Your own address goes small, upper left.',
    custom: {
      spot: function (R, ctx, T) {
        var keys = Object.keys(ENV_MIS), m = R.pick(lvl(ctx) === 1 ? ['stamp-left', 'return-center'] : keys), v = cast(R, ['peer', 'peer']);
        var title = pron(v._keys[1].who).he === 'she' ? R.pick(['Ms. ', 'Dr. ']) : R.pick(['Mr. ', 'Dr. ']);
        var to = [title + v.Bfull, R.pick(['22 Maple Street', '400 Oak Avenue', '17 Cedar Lane', '5 River Road']), R.pick(['Fairview, OH 44120', 'Rivertown, TX 75001', 'Lakeside, MI 49116', 'Hillsdale, NJ 07642'])];
        var from = [v.Afull, R.pick(['9 Birch Court', '31 Elm Street', '8 Hill Road']), R.pick(['Springfield, IL 62701', 'Greenville, SC 29601', 'Madison, WI 53703'])];
        var wrongs = keys.filter(function (k) { return k !== m; }).map(function (k) { return ENV_MIS[k][0]; });
        return { q: 'Something is wrong with this envelope. What is it?', a: U.mc(ENV_MIS[m][0], lvl(ctx) === 1 ? R.sample(wrongs, 2) : wrongs, 4),
          viz: { name: 'et-envelope', opts: { to: to, from: from, mode: 'spot', mistake: m, quiet: true, interactive: false, label: 'An envelope' } },
          steps: ['Check the three areas: delivery address in the center (title, full name, street, city, state, ZIP), return address upper left, stamp upper right.', ENV_MIS[m][1]], hint: T.hint };
      },
      where: function (R, ctx, T) {
        var it = R.pick([['the stamp', 'Upper right'], ['your own (return) address', 'Upper left'], ['the name and address of the person you are writing to', 'Center']]);
        return { q: 'On a U.S. envelope, where does <b>' + it[0] + '</b> go?', a: U.mc(it[1], ['Upper right', 'Upper left', 'Center', 'Lower left'].filter(function (x) { return x !== it[1]; }), 4),
          viz: (function () { var v = cast(R, ['peer', 'peer']); return { name: 'et-envelope', opts: { to: [(pron(v._keys[1].who).he === 'she' ? 'Ms. ' : 'Mr. ') + v.Bfull, v.street, v.cityline], from: [v.Afull, v.street2, v.cityline2], quiet: true, interactive: false, label: 'An envelope' } }; })(),
          steps: [T.principle, 'So ' + it[0] + ' goes in the ' + it[1].toLowerCase() + '.'], hint: T.hint };
      }
    },
    order: [{ title: 'Put the lines of a delivery address in order, top to bottom.', r: ['peer', 'peer'], steps: ['Title and full name: {Btitle} {Bfull}', 'Street address: {street}', 'City, state and ZIP code: {cityline}'], all: true }],
    mix: { 1: ['where', 'spot'], 2: ['spot', 'where', 'order'], 3: ['spot', 'order'] }
  }));

  G('adult.email', bank('adult.email', {
    principle: 'Write a clear subject, open with a greeting, keep it brief, proofread, reply within a day or two, and use "reply all" only when everyone needs it.',
    hint: 'Would you be comfortable if this email were forwarded or read aloud?',
    ctxLine: 'At work, by email:',
    rudeWhy: 'it wastes people\'s time or reads as rude',
    custom: { missing: function (R, ctx, T) { return noteMissingP(R, ctx, 'email', T); } },
    order: [{ title: 'Put the steps of writing an email in order.', steps: ['Write a clear subject line', 'Open with a greeting', 'Say what you need in a few short lines', 'Close with your name', 'Proofread, and check who is on the To line', 'Press Send'] }],
    sc: [
      { p: 'office', r: ['peer', 'elder'], s: '{A} is emailing {B} a question about an assignment due Friday.', q: 'Which subject line is best?',
        ok: ['"Question about the assignment due Friday"'], bad: [['"Hi"', 'A subject should say what the email is about.'], '"URGENT!!! READ NOW"', '(No subject)'], why: 'A clear subject lets a busy reader know what the email is about before opening it.' },
      { p: 'office', r: ['peer', 'peer'], s: '{B} emails forty coworkers: "The office closes at 3 on Friday." {A} wants to say thanks.', q: 'What should {A} do?',
        ok: ['Reply only to {B}, or not at all.'], bad: [['Reply all: "Thanks!"', 'Forty people don\'t need to read a thank-you meant for one.'], 'Reply all asking whether it applies to {Ahim}.', 'Forward it to everyone again.'], why: '"Reply all" is for replies everyone needs.' },
      { p: 'office', r: ['peer', 'peer'], s: '{A} is annoyed by an email from {B} and starts typing a sharp reply in all capitals.', q: 'What is the best move?',
        ok: ['Wait, calm down, and reply briefly and politely, or talk with {B} in person.'], bad: ['Send it right away.', 'Reply all so others see it.', 'Forward {B}\'s email to friends with a joke.'], why: 'All capitals reads as shouting, and email is permanent and easy to forward.' }
    ],
    good: ['Writing a clear subject line', 'Opening with a greeting', 'Proofreading before sending', 'Replying within a day or two'],
    rude: [['Writing the whole email in capital letters', 'it reads as shouting'], ['Replying all to a list of forty with "thanks!"', 'it fills everyone\'s inbox'], ['Sending a message with no greeting or name', 'it reads as curt'], ['Forwarding a private email without asking', 'the writer meant it for you']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'missing', 'order', 'all'], 3: ['all', 'order', 'missing', 'sc'] }
  }));

  // ================================================================ Unit 6: Phones and Digital Life
  G('adult.phones-company', bank('adult.phones-company', {
    principle: 'Silence the phone at meals, meetings and performances, step away for calls, and keep speakerphone and videos off in shared spaces.',
    hint: 'Who else has to hear or see your phone right now?',
    ctxLine: 'Phones in company and in public:',
    rudeWhy: 'it makes your phone everyone else\'s burden',
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], holds: { 0: 'phone' }, s: '{A} is expecting an important call from {Ahis} sister, who is at the hospital having a baby. {Ahe} is at dinner with {B}.', q: 'What should {A} do?',
        ok: ['Tell {B} at the start, keep the phone silenced, and step away if the call comes.'], bad: [['Keep the phone face-up on the table and check it often.', 'Constant checking tells {B} that someone else matters more.'], 'Cancel the dinner.', 'Take the call at the table on speaker.'], why: 'A word ahead and stepping away let {A} take the call without interrupting the meal.' },
      { p: 'plane', r: ['peer', 'peer'], holds: { 0: 'phone' }, s: 'On a train, {A} wants to watch a video.', q: 'What is courteous?',
        ok: ['Use headphones.'], bad: [['Play it at a low volume without headphones.', 'Even low sound becomes everyone\'s sound in a shared space.'], 'Play it loud so {Ahe} can hear over the train.', 'Ask {B} next to {Ahim} whether {Bhe} minds, and play it anyway.'], why: 'In shared spaces, others can\'t step away from your sound.' },
      { p: 'store', r: ['peer', 'peer'], holds: { 0: 'phone' }, poses: { 0: 'phone' }, s: '{A} is on a call when {Ahe} reaches the front of the checkout line.', q: 'What should {Ahe} do?',
        ok: ['Say "I\'ll call you back," end the call, and greet the cashier.'], bad: ['Keep talking and slide the items over.', 'Hold up a finger to make the cashier wait.', 'Put the call on speaker.'], why: 'The cashier is a person working with {Ahim} right now.' },
      { p: 'theater', r: ['peer', 'peer'], holds: { 1: 'phone' }, s: 'In a dark theater, {A} wants to check a text during the show.', q: 'What should {Ahe} do?',
        ok: ['Wait until intermission or the end, and step out to the lobby.'], bad: [['Check it quickly with the screen turned down.', 'Even a dimmed screen lights up the row in a dark theater.'], 'Text under {Ahis} coat.', 'Turn the brightness up so it\'s quick.'], why: 'A lit screen distracts everyone behind {Ahim}.' }
    ],
    good: ['Silencing your phone before a meeting', 'Stepping outside a restaurant to take a call', 'Using headphones on a bus', 'Ending a call before talking with a cashier'],
    fine: ['Glancing at a phone at a casual family dinner when everyone agrees it\'s fine'],
    rude: [['Watching a video out loud on a train', 'others can\'t step away from your sound'], ['Texting during a play', 'a lit screen distracts the people behind you'], ['Using speakerphone in a waiting room', 'everyone has to hear your call'], ['Scrolling while a friend tells you something important', 'it says the screen matters more']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.texting-messaging', bank('adult.texting-messaging', {
    principle: 'Mind the hour, the tone and the length; don\'t send important or sad news by text when a call or visit is possible; answer within a reasonable time.',
    hint: 'Would a voice or a face be kinder here? And what time is it for the reader?',
    custom: {
      channel: function (R, ctx, T) {
        var text = ['Telling a friend you are running five minutes late', 'Confirming the time of a dinner', 'Sending a quick thank-you for a ride', 'Sharing a photo from a trip'];
        var call = ['Telling a close friend that your grandfather has died', 'Breaking up with someone you have dated for a year', 'Telling your manager you are quitting', 'Apologizing to a friend for a serious hurt'];
        var isText = R.coin(), s = R.pick(isText ? text : call);
        return { q: 'Is a text a good way to do this?<br><b>' + s + '</b>', a: { t: 'mc', choices: ['Yes, a text is fine', 'Better by a call or in person'], v: isText ? 0 : 1, keep: true },
          steps: [T.principle, isText ? 'This is quick, light news; a text is a fine way to send it.' : 'This is serious news. A voice or a face lets the other person feel your care and respond.'], hint: T.hint };
      }
    },
    text: [
      { title: 'Aunt {B}', r: ['peer', 'rosa'], msgs: [[1, 'Did the package arrive?']], q: 'Which reply is best?', ok: ['Yes! Thank you so much for {giftthe}. I love it.'], bad: ['k', 'Yes', 'Yeah it came'], why: 'A one-word answer can read as cold. A warm, specific reply thanks the giver.' },
      { title: '{B}', msgs: [[1, 'Are we still on for lunch tomorrow?']], q: 'It is 11:30 p.m. when {A} sees this. What is best?', ok: ['Reply in the morning: "Yes! See you at noon."'], bad: ['Call {B} right now to confirm.', 'Ignore it until after lunchtime.', 'Reply "?"'], why: 'Late messages can wait for morning, but an answer in good time keeps the plan clear.' },
      { title: '{B}', msgs: [[1, 'Hey, how was the interview??']], q: 'Which reply is best?', ok: ['It went well, thanks for asking! I\'ll tell you more at dinner.'], bad: ['fine', '(Read and no reply for three days)', 'WHY DO YOU WANT TO KNOW'], why: 'Mind the tone: a short, friendly reply in good time answers kindly.' }
    ],
    sc: [
      { p: null, r: ['peer', 'peer'], s: 'At 1 a.m., {A} remembers a question for {B} about a work deadline.', q: 'What should {A} do?',
        ok: ['Write it now but send it in the morning.'], bad: ['Send it right away so {Ahe} doesn\'t forget.', 'Call {B} instead.', 'Send it in all capitals so {B} sees it\'s important.'], why: 'A text at 1 a.m. can wake someone. Mind the hour.' }
    ],
    mix: { 1: ['channel', 'text'], 2: ['channel', 'text', 'sc'], 3: ['text', 'channel', 'sc'] }
  }));

  G('adult.social-media', bank('adult.social-media', {
    principle: 'Ask before posting photos of others or their children, don\'t announce other people\'s news, and remember that posts are public and lasting.',
    hint: 'Is this your photo or news alone? If not, ask.',
    ctxLine: 'Posting online:',
    rudeWhy: 'it shares something that belongs to someone else',
    sc: [
      { p: 'park', r: ['peer', 'peer', 'peer'], s: 'After a hike, {A} wants to post a group photo with {B} and {C}.', q: 'What should {A} do first?',
        ok: ['Ask {B} and {C}: "Okay if I post this one?"'], bad: [['Post it and tag them so they see it.', 'Tagging tells them after the fact; asking gives them the choice.'], 'Post it now and ask afterward.', 'Post it and delete it if anyone complains.'], why: 'People in a photo get a say in whether it is public.' },
      { p: null, r: ['peer', 'peer', 'peer'], s: '{A} hears that {B} and {C} are engaged. They haven\'t announced it.', q: 'What should {A} do?',
        ok: ['Congratulate them privately and let them share the news.'], bad: [['Post congratulations so everyone knows.', 'It is their news to announce, in their own time.'], 'Tell the group chat.', 'Hint at it online.'], why: 'Big news belongs to the people it is about.' },
      { p: null, r: ['peer', 'peer'], s: '{A} is angry about a disagreement with {B} and starts writing a post about it.', q: 'What is wise?',
        ok: ['Wait, cool off, and talk with {B} directly instead.'], bad: ['Post it while the feeling is fresh.', 'Post it without naming {B}, but with enough detail that everyone knows.', 'Post it and delete it later.'], why: 'Posts are public and lasting, and can be copied before you delete them.' }
    ],
    text: [
      { kind: 'group', title: 'Old friends', r: ['peer', 'peer', 'peer'], msgs: [[0, 'Great dinner last night, everyone!'], [1, '{C}, can I post the photo of you with your baby?']], q: '{C} would rather keep the baby\'s photos off social media. Which reply is best?', ok: ['Thanks for asking! I\'d rather keep her photos private, but feel free to post the one of all of us at the table.'], bad: ['Sure, whatever.', 'You should know better than to ask.', '(No reply)'], why: 'A kind, clear answer gives {B} what {Bhe} needs to know, and thanks {Bhim} for asking.' }
    ],
    good: ['Asking before posting a photo of a friend\'s child', 'Congratulating someone after they share their news', 'Thinking twice before posting while angry', 'Untagging yourself quietly instead of arguing'],
    rude: [['Announcing a friend\'s engagement before they do', 'it is their news to share'], ['Posting an unflattering photo of a friend as a joke', 'posts are public and lasting'], ['Posting a coworker\'s private health news', 'it belongs to them'], ['Arguing with a relative in public comments', 'a private talk is kinder']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'text', 'all'], 3: ['all', 'text', 'sc'] }
  }));

  G('adult.video-meetings', bank('adult.video-meetings', {
    principle: 'Join on time, check your sound and background, mute when not speaking, look at the camera, and give the meeting your attention.',
    hint: 'Treat it like a room you walked into.',
    ctxLine: 'On a video meeting for work:',
    rudeWhy: 'it disturbs the meeting or shows you aren\'t paying attention',
    order: [{ title: 'Put the steps of joining a video meeting in order.', steps: ['Test your camera and microphone a few minutes early', 'Choose a quiet spot with light on your face', 'Join on time and say hello', 'Mute when you are not speaking', 'Unmute and look at the camera when it\'s your turn'], all: true }],
    sc: [
      { p: 'office', r: ['peer', 'peer'], s: 'In the middle of a video meeting, {A}\'s dog starts barking.', q: 'What should {A} do?',
        ok: ['Mute right away, and if {Ahe} needs to speak, say "One moment" and settle the dog.'], bad: [['Keep talking over the barking.', 'An open microphone drowns out whoever is speaking.'], 'Leave the meeting without a word.', 'Apologize at length to the whole group.'], why: 'Muting protects the meeting; a light word is enough.' },
      { p: 'office', r: ['peer', 'elder'], s: '{A} wants to answer emails during a long video meeting with the camera off.', q: 'What is best?',
        ok: ['Give the meeting full attention and save the emails for after.'], bad: [['Answer emails with the camera off; nobody will know.', 'When asked a question, {Ahe} won\'t know what was said.'], 'Answer emails with the camera on.', 'Leave and rejoin at the end.'], why: 'A video meeting deserves the same attention as a room.' },
      { p: 'office', r: ['peer', 'peer'], s: '{A} is about to present on a video call.', q: 'Where should {Ahe} look while speaking?',
        ok: ['At the camera.'], bad: ['At {Ahis} own picture on the screen.', 'At {Ahis} phone.', 'Out the window.'], why: 'Looking at the camera is how you make eye contact on a screen.' }
    ],
    good: ['Muting when you aren\'t speaking', 'Testing your sound before the meeting', 'Looking at the camera when you speak', 'Sending a quick note if you will join late'],
    rude: [['Eating a crunchy snack with your microphone on', 'microphones pick up every crunch'], ['Joining ten minutes late without a word', 'everyone blocked out the same time'], ['Answering emails while a colleague presents', 'it shows you aren\'t listening'], ['Taking a call from another room with the microphone open', 'the meeting hears it all']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  // ================================================================ Unit 7: Work
  G('adult.interviews', bank('adult.interviews', {
    principle: 'Arrive a few minutes early, dress a step above the job\'s usual dress, greet everyone kindly, listen, ask good questions, and send a thank-you within a day.',
    hint: 'Everyone you meet may be asked what they thought of you.',
    ctxLine: 'At a job interview:',
    rudeWhy: 'it shows less respect for someone\'s time or role',
    order: [{ title: 'Put the steps of an interview day in order.', steps: ['Learn about the company and plan your questions', 'Arrive about ten minutes early', 'Greet the receptionist warmly and give your name', 'Stand, smile and shake hands with the interviewer', 'Listen fully and answer truthfully', 'Ask one or two good questions', 'Send a thank-you within a day'] }],
    sc: [
      { p: 'office', r: ['peer', 'peer'], s: '{A} arrives for an interview. The receptionist, {B}, is on the phone.', q: 'What should {A} do?',
        ok: ['Wait quietly until {B} is free, then greet {Bhim} and give {Ahis} name and the time of the interview.'], bad: [['Tap the desk to get {Bhis} attention.', 'The receptionist\'s impression counts too, and impatience shows.'], 'Walk past to find the interviewer.', 'Sit down and wait to be noticed, without a word.'], why: 'Courtesy to the front desk is courtesy to the company, and it is noticed.' },
      { p: 'office', r: ['teen', 'priya'], s: '{A} is interviewing for a job at a store where staff wear polo shirts and khakis.', q: 'What should {Ahe} wear?',
        ok: ['Something a step above: neat slacks and a collared shirt or blouse, perhaps a sweater or blazer.'], bad: ['A T-shirt and shorts, since the job is casual.', 'A full tuxedo.', 'The store\'s own uniform.'], why: 'A step above the job\'s usual dress shows you took the meeting seriously.' },
      { p: 'office', r: ['peer', 'priya'], s: 'At the end, {B} asks {A}, "Do you have any questions for us?"', q: 'Which question fits best?',
        ok: ['"What does a typical week look like on this team?"', '"What do you enjoy most about working here?"'], bad: ['"No."', '"How soon can I take vacation?"', '"Can I leave early on Fridays?"'], why: 'A question about the work shows interest in the job. Pay and vacation usually come up after an offer.' },
      { p: null, r: ['peer', 'priya'], s: '{A} had an interview with {B} this morning.', q: 'When should {Ahe} send a thank-you?',
        ok: ['Within a day, by email or a short note.'], bad: ['After hearing whether {Ahe} got the job.', 'In two weeks.', 'Only if {Bhe} asks for one.'], why: 'A prompt thank-you shows follow-through.' }
    ],
    good: ['Arriving about ten minutes early', 'Thanking the receptionist', 'Silencing your phone in the waiting room', 'Sending a thank-you email within a day'],
    rude: [['Being curt with the receptionist', 'everyone you meet may be asked about you'], ['Arriving twenty minutes late without a call', 'it wastes the interviewer\'s schedule'], ['Checking your phone while the interviewer talks', 'it says the interview isn\'t worth your attention'], ['Criticizing your last boss at length', 'it makes the interviewer wonder what you would say about them']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  G('adult.dress-codes', bank('adult.dress-codes', {
    principle: 'Social dress codes run from white tie and black tie to cocktail, smart casual and casual; at work, from business formal to business casual and casual. When unsure, ask the host.',
    hint: 'Place the code on the ladder from most to least formal.',
    custom: {
      ladder: function (R, ctx, T) {
        var which = R.pick(['social', 'social', 'work']), list = EM().DRESS[which];
        var it = { title: 'Put these ' + (which === 'social' ? 'social' : 'work') + ' dress codes in order, from most to least formal.', steps: list.map(cap), all: true };
        return orderP(R, ctx, it, T);
      },
      more: function (R, ctx, T) {
        var list = EM().DRESS.social, ij = R.sample(U.range(0, list.length - 1), 2).sort(function (a, b) { return a - b; });
        var a = list[ij[0]], b = list[ij[1]], first = R.coin();
        return { q: 'Which dress code is <b>more formal</b>?', a: { t: 'mc', choices: first ? [cap(a), cap(b)] : [cap(b), cap(a)], v: first ? 0 : 1, keep: true },
          steps: ['From most to least formal: ' + list.join(', ') + '.', cap(a) + ' comes before ' + b + ', so it is more formal.'], hint: T.hint };
      },
      wear: function (R, ctx, T) {
        var it = R.pick([
          ['"Black tie optional"', 'A tuxedo, or a dark suit and tie; a formal or cocktail dress', ['Jeans and a nice shirt', 'Shorts and sandals', 'Athletic wear']],
          ['"Business casual"', 'Slacks or a skirt with a collared shirt, blouse or sweater', ['A hoodie and running shoes', 'A tuxedo', 'Gym shorts']],
          ['"Cocktail attire"', 'A suit, a dress or dressy separates', ['A floor-length ball gown and tailcoat', 'Sweatpants', 'A swimsuit']],
          ['"Smart casual"', 'Neat slacks or nice jeans with a collared shirt or blouse', ['A tuxedo', 'Pajamas', 'A torn T-shirt']],
          ['"Black tie"', 'A tuxedo; a formal gown or elegant cocktail dress', ['A sweater and khakis', 'Jeans and a blazer', 'Shorts and a polo shirt']]]);
        var v = cast(R, ['peer']);
        return { q: v.A + '\'s invitation says ' + it[0] + '. Which outfit fits?', a: U.mc(it[1], it[2], 4), steps: [T.principle, it[0] + ' usually means: ' + it[1].toLowerCase() + '.', 'When unsure, ask the host or dress a step up.'], hint: T.hint };
      }
    },
    sc: [
      { p: null, r: ['peer', 'peer'], s: '{A}\'s invitation says "festive attire," and {Ahe} isn\'t sure what that means.', q: 'What is the best move?',
        ok: ['Ask the host what most guests will wear.'], bad: [['Guess and wear jeans.', 'Guessing can leave {Ahim} far from what the host planned.'], 'Skip the party.', 'Wear a costume.'], why: 'When a code is unclear, asking the host is always polite.' }
    ],
    mix: { 1: ['more', 'wear'], 2: ['wear', 'more', 'ladder', 'sc'], 3: ['ladder', 'wear', 'sc'] }
  }));

  G('adult.meetings', bank('adult.meetings', {
    principle: 'Be on time, come prepared, let others finish, keep to the topic, credit others\' ideas, and follow up on what you promised.',
    hint: 'A meeting costs every person the same hour. Whose idea is it?',
    ctxLine: 'In a team meeting:',
    rudeWhy: 'it wastes others\' time or takes what isn\'t yours',
    spot: [
      { p: 'office', r: ['priya', 'james', 'nora'], intro: 'A team meeting.', lines: [[0, 'Let\'s start. First, the budget for spring.'], [2, 'We could save money by sharing a booth at the fair.'], [1, 'Here\'s my idea: we share a booth at the fair. That will save money.'], [0, 'Thanks, both of you. Nora, can you look into it?']], fault: 2, why: 'James repeated Nora\'s idea as his own. "Building on Nora\'s idea…" would give her the credit.' },
      { p: 'office', r: ['peer', 'peer', 'peer'], intro: 'A project meeting.', lines: [[0, 'I\'ll share the schedule, then we can talk about the launch.'], [1, 'Sorry, before you finish, I just want to say the schedule is wrong.'], [2, 'Could we hear the whole schedule first and then discuss it?'], [0, 'Thanks. I\'ll send notes after the meeting.']], fault: 1, why: 'Breaking in before someone finishes cuts off the plan before anyone has heard it. Wait for a pause.' }
    ],
    sc: [
      { p: 'office', r: ['peer', 'peer'], s: '{B} is explaining a plan when {A} has an idea.', q: 'What should {A} do?',
        ok: ['Jot it down and, at a pause, say, "Can I add something?"'], bad: [['Break in right away so the idea isn\'t lost.', 'Interrupting cuts off {B} before the plan is heard.'], 'Whisper it to the person next to {Ahim}.', 'Keep it to {Ahim}self forever.'], why: 'Letting others finish lets the best ideas come out, not just the loudest.' },
      { p: 'office', r: ['peer', 'peer'], s: 'In a meeting, {A} wants to build on an idea {B} raised last week.', q: 'How should {Ahe} say it?',
        ok: ['"{B} suggested last week that we survey customers. I\'d like to build on that."'], bad: [['Present it as {Ahis} own idea.', 'Taking credit for a colleague\'s idea breaks trust.'], 'Wait until {B} is absent to bring it up.', 'Say "Someone had this idea…" without naming {B}.'], why: 'Giving credit is honest, and it builds trust that lasts.' },
      { p: 'office', r: ['peer', 'peer'], s: 'At the end of a meeting, {A} promised to send the notes.', q: 'When should {Ahe} do it?',
        ok: ['That day or the next, as promised.'], bad: ['When someone reminds {Ahim}.', 'Next month.', 'Never; others took notes too.'], why: 'Following up shows that {Ahis} word means something.' }
    ],
    good: ['Reading the agenda before the meeting', 'Saying "Building on Ruby\'s idea…"', 'Sending the notes you promised', 'Arriving a minute or two early'],
    rude: [['Interrupting to look sharp', 'let others finish'], ['Repeating a colleague\'s idea as your own', 'credit belongs to the person who had it'], ['Answering email during a colleague\'s presentation', 'give the meeting your attention'], ['Arriving late and asking for a recap', 'it makes everyone repeat themselves']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'spot', 'all'], 3: ['all', 'spot', 'sc'] }
  }));

  G('adult.shared-spaces', bank('adult.shared-spaces', {
    principle: 'Clean up after yourself, label and clear out your food, don\'t take what isn\'t yours, keep calls and smells modest, and refill what you empty.',
    hint: 'Leave it as you would want to find it.',
    ctxLine: 'In the office kitchen:',
    rudeWhy: 'it leaves work or trouble for the next person',
    sc: [
      { p: 'kitchen', r: ['peer', 'peer'], holds: { 0: 'cup' }, s: '{A} pours the last cup of coffee in the office kitchen.', q: 'What should {Ahe} do?',
        ok: ['Make a fresh pot, or let whoever handles it know the coffee is out.'], bad: [['Leave the empty pot on the warmer.', 'The next tired person finds an empty, scorching pot.'], 'Hide the empty pot.', 'Pour half back for the next person.'], why: 'Refill what you empty.' },
      { p: 'kitchen', r: ['peer', 'peer'], s: '{A} burned some rice in a pot and wants to leave it "to soak" in the office sink.', q: 'What is best?',
        ok: ['Soak it briefly and wash it before leaving for the day.'], bad: [['Leave it in the sink until next week.', 'Someone else would have to move it to use the sink.'], 'Put it back in the cabinet dirty.', 'Throw away the office pot.'], why: 'In a shared space, a mess left behind becomes someone else\'s job.' },
      { p: 'kitchen', r: ['peer', 'peer'], s: 'The fridge is cleared every Friday. {A}\'s container of {food} has been there since Monday.', q: 'What should {Ahe} do?',
        ok: ['Take it home or throw it out before Friday, and label lunches with name and date.'], bad: ['Leave it; it is someone else\'s job.', 'Move it to the back so it isn\'t thrown out.', 'Put {B}\'s name on it.'], why: 'Labels and clearing out keep the shared fridge usable for everyone.' }
    ],
    good: ['Washing your mug right away', 'Making a new pot after taking the last cup', 'Labeling your food with your name and the date', 'Wiping up a spill on the counter'],
    rude: [['Eating a lunch from the fridge that isn\'t yours', 'it isn\'t yours to take'], ['Leaving a dish in the sink for days', 'someone else has to deal with it'], ['Reheating strong-smelling fish in a small office', 'smells travel to everyone nearby'], ['Taking a long phone call on speaker in the break room', 'others share the space']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  // ================================================================ Unit 8: Life's Big Occasions
  G('adult.weddings', bank('adult.weddings', {
    principle: 'Reply on time, bring only the guests named on the invitation, follow the dress code, give a gift (often from the registry), and let the couple shine.',
    hint: 'The day is planned to the seat, and it is about the couple.',
    ctxLine: 'As a wedding guest:',
    rudeWhy: 'it upsets the couple\'s plans or draws attention from them',
    sc: [
      { p: null, r: ['peer', 'peer'], s: '{A}\'s wedding invitation is addressed only to "{Atitle} {Afull}." {Ahe} has a new partner, {B}.', q: 'What should {A} do?',
        ok: ['Reply for {Ahim}self alone and go without {B}.'], bad: [['Bring {B}; one more won\'t matter.', 'Every seat, meal and favor has been planned and paid for.'], 'Ask the couple to add {B}.', 'Reply yes for two.'], why: 'The invitation names exactly who is invited.' },
      { p: null, r: ['peer', 'peer'], s: '{A} sees that the couple has a gift registry.', q: 'What is the registry for?',
        ok: ['It shows guests what the couple would like, sparing everyone guesswork.'], bad: ['It is a list of gifts that guests must buy.', 'It shows what each guest is expected to spend.', 'It is only for the couple\'s families.'], why: 'A registry is a guide, not a demand; a gift from it is sure to be welcome.' },
      { p: 'hall', r: ['peer', 'peer'], s: 'At the reception, {A} has an idea for a long, funny speech about the groom, though no one has asked {Ahim} to speak.', q: 'What should {A} do?',
        ok: ['Share the stories with the groom privately and let the planned speakers speak.'], bad: [['Grab the microphone during dinner.', 'An unplanned speech takes the spotlight from the couple and their chosen speakers.'], 'Ask the band to stop so {Ahe} can talk.', 'Give the speech during the first dance.'], why: 'A guest\'s job is to let the couple shine.' }
    ],
    custom: {
      white: function (R, ctx, T) {
        var v = cast(R, ['peer']);
        return { q: v.A + ' is invited to a wedding and wonders whether a guest may wear an all-white outfit. Which statement best describes what etiquette writers say?',
          a: U.mc('It is debated, but most writers advise leaving white to the bride, so another color is the safe choice.', ['Any guest wearing white must be asked to leave.', 'All writers agree white is fine for guests.', 'Guests must wear white to match the bride.'], 4),
          steps: ['This is a custom where writers disagree.', 'Most advise leaving white to the bride, so choosing another color avoids any question.'], hint: 'Is this a firm rule or a matter of opinion?' };
      }
    },
    good: ['Replying by the date on the card', 'Choosing a gift from the registry', 'Following the dress code', 'Bringing only the guests named on the invitation'],
    rude: [['Bringing a date when the invitation names only you', 'the couple planned for each seat'], ['Asking the couple why you didn\'t get a plus-one', 'it puts them on the spot about their budget'], ['Not replying until the week of the wedding', 'caterers need a count'], ['Giving an unplanned speech', 'let the couple and their speakers shine']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'white', 'all'], 3: ['all', 'sc', 'white'] }
  }));

  G('adult.funerals', bank('adult.funerals', {
    principle: 'Dress in quiet colors, arrive early, sign the guest book, follow the family\'s customs, and offer the family short, sincere words.',
    hint: 'Showing up matters most. Follow the family\'s lead.',
    ctxLine: 'At a funeral or memorial:',
    rudeWhy: 'it draws attention or adds a burden for the family',
    order: [{ title: 'Put the steps of attending a funeral in order.', steps: ['Dress in quiet, dark or muted colors', 'Arrive early and silence your phone', 'Sign the guest book', 'Follow the family\'s customs during the service', 'Offer the family short, sincere words'], all: true }],
    sc: [
      { p: 'hall', r: ['peer', 'diaz'], moods: { 1: 'sad' }, s: 'At the service for {B}\'s wife, {A} reaches {B} in the receiving line.', q: 'What should {A} say?',
        ok: ['"I\'m so sorry. She was always so kind to everyone."'], bad: [['"I know exactly how you feel."', 'Comparing losses turns attention to the speaker.'], '"How did it happen?"', '"At least she isn\'t suffering anymore."'], why: 'Short, sincere words and a good memory comfort the family.' },
      { p: 'hall', r: ['peer', 'peer'], s: '{A} is going to a funeral in a faith {Ahe} doesn\'t know.', q: 'What should {Ahe} do?',
        ok: ['Follow the family\'s and the other guests\' lead, joining only what {Ahe} is comfortable with.'], bad: ['Stay home to avoid making a mistake.', 'Ask the family to explain each custom during the service.', 'Do things {Ahis} own way.'], why: 'Customs differ by faith and family. Being there and following their lead is what matters.' },
      { p: null, r: ['peer', 'peer'], s: '{A} doesn\'t know what to say to {B}\'s family and is thinking of skipping the memorial.', q: 'What would most people advise?',
        ok: ['Go; "I\'m so sorry" is enough, and showing up matters most.'], bad: [['Skip it so as not to say the wrong thing.', 'Families remember who came.'], 'Go but leave before speaking to anyone.', 'Send a text during the service.'], why: 'Showing up matters most; simple words are enough.' }
    ],
    good: ['Wearing quiet colors', 'Arriving early', 'Signing the guest book', 'Saying "I\'m so sorry for your loss"'],
    rude: [['Arriving late and walking in during the service', 'it disturbs the service'], ['Asking the family how the person died', 'it is painful and personal'], ['Taking a phone call in the service', 'silence your phone'], ['Telling the family "Everything happens for a reason"', 'it explains instead of comforting']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  G('adult.visiting-bereaved', bank('adult.visiting-bereaved', {
    principle: 'Keep visits short, listen more than you talk, offer specific help ("I\'ll bring dinner Tuesday"), and keep in touch in the weeks after.',
    hint: 'Does your offer have a day or a task in it?',
    ctxLine: 'Helping a neighbor who has lost her husband:',
    rudeWhy: 'it adds to the grieving person\'s load',
    custom: {
      offer: function (R, ctx, T) {
        var v = cast(R, ['peer', 'peer']);
        var good = R.pick(['"I\'ll bring dinner on {day} at six."', '"Can I pick up the kids from school on {day}?"', '"I\'m going to the store; what can I get you?"', '"I\'ll mow your lawn on {day}."']);
        return { q: v.A + ' wants to help ' + v.B + ', whose father has died. Which offer is easiest for ' + v.B + ' to accept?', a: U.mc(fill(good, v), ['"Let me know if you need anything."', '"Call me anytime."', '"I\'m here if you need me."'], 4),
          steps: [T.principle, 'A specific offer, with a day or a task, is easy to accept. A general offer leaves the work of asking to the grieving person.'], hint: T.hint };
      }
    },
    sc: [
      { p: 'home', r: ['peer', 'june'], moods: { 1: 'sad' }, s: '{A} visits {B} a week after {Bhis} husband died.', q: 'What makes a good visit?',
        ok: ['A short visit, mostly listening, with a specific offer of help before leaving.'], bad: [['A long visit, filling the silence with news.', 'Grief is tiring; listening and leaving soon is kinder.'], 'A visit to talk about {Ahis} own losses.', 'A surprise visit with a group of friends.'], why: 'Short visits and listening comfort without draining.' },
      { p: null, r: ['peer', 'peer'], s: 'A month after {B}\'s mother died, {A} wonders whether it is too late to reach out.', q: 'What is best?',
        ok: ['Reach out now: "I\'ve been thinking of you and your mom."'], bad: [['Don\'t; it might reopen the wound.', 'The weeks after the funeral are often the loneliest.'], 'Wait until the anniversary.', 'Only reach out if {B} does first.'], why: 'Many cards and visits stop after the funeral; a note now can mean even more.' }
    ],
    good: ['Offering to bring dinner on a set day', 'Listening to stories about the person who died', 'Sending a card a month later', 'Keeping a first visit short'],
    rude: [['Staying for hours on the first visit', 'grief is tiring'], ['Telling a long story about your own loss', 'keep the focus on them'], ['Dropping by with a group unannounced', 'the family may not be ready to host'], ['Saying "Let me know if you need anything" and nothing more', 'it leaves the work of asking to them']],
    mix: { 1: ['offer', 'sc'], 2: ['offer', 'sc', 'all'], 3: ['all', 'sc', 'offer'] }
  }));

  G('adult.hospitals-babies', bank('adult.hospitals-babies', {
    principle: 'Ask before visiting, keep it short, stay home if you are sick, wash your hands, and offer help with meals or errands rather than asking to hold the baby.',
    hint: 'Patients and new parents need rest more than company.',
    ctxLine: 'Visiting new parents or a friend in the hospital:',
    rudeWhy: 'it costs the patient or parents rest',
    text: [
      { title: '{B}', msgs: [[1, 'She\'s here! 7 lb 2 oz, and we\'re all doing well. Home on Thursday.']], q: 'Which reply is best?', ok: ['Congratulations to all of you! I\'d love to drop off dinner one night next week. Which night is best?'], bad: [['Congratulations! I\'ll come over Friday to meet her.', ''], 'Send pictures! When can I hold her?', 'Finally! What took so long?'], why: 'Warm, with a specific offer, and the parents choose the time.' },
      { title: '{B}', msgs: [[1, 'Surgery went fine. I\'m in the hospital until Monday.']], q: 'Which reply is best?', ok: ['So glad it went well! Would you like a visitor this weekend, or would you rather rest?'], bad: ['I\'ll come by tonight with a few friends!', 'What exactly did they do? Tell me everything.', 'ok'], why: 'Asking first lets {B} choose, and gives {Bhim} an easy way to say "not yet."' }
    ],
    sc: [
      { p: 'home', r: ['peer', 'peer'], s: '{A} has a cold and was planning to meet {B}\'s newborn this weekend.', q: 'What should {A} do?',
        ok: ['Stay home and offer to drop off a meal at the door instead.'], bad: [['Visit but keep a little distance.', 'Staying home when sick is the widely agreed way to protect a newborn.'], 'Visit and hold the baby briefly.', 'Visit without mentioning the cold.'], why: 'Stay home if you are sick; a meal at the door still helps.' },
      { p: 'home', r: ['peer', 'peer'], s: '{A} visits {B} and {Bhis} new baby.', q: 'What helps most?',
        ok: ['Wash hands on arrival, bring a meal, offer to do the dishes, and stay a short time.'], bad: ['Ask to hold the baby right away.', 'Stay all afternoon.', 'Bring a group of friends to see the baby.'], why: 'Practical help lightens the parents\' load; holding the baby is their offer to make.' },
      { p: 'doctor', r: ['peer', 'peer'], s: '{A} wants to visit {B}, who is recovering in the hospital.', q: 'What should {A} do first?',
        ok: ['Ask {B} if a visit would be welcome, and check the visiting hours.'], bad: [['Drop in as a surprise.', 'Patients need rest; let {B} choose.'], 'Call the nurses for {B}\'s medical details.', 'Bring a big group to cheer {Bhim} up.'], why: 'Asking first lets {B} choose a good time, or say not yet.' }
    ],
    good: ['Texting before you visit', 'Staying home when you have a cold', 'Washing your hands when you arrive', 'Bringing a meal for the freezer'],
    rude: [['Dropping in unannounced', 'let them choose a good time'], ['Staying for three hours', 'patients and new parents need rest'], ['Asking to hold the newborn as soon as you arrive', 'that is the parents\' offer to make'], ['Visiting a newborn while you have a cold', 'stay home when sick']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'text', 'all'], 3: ['all', 'text', 'sc'] }
  }));

  G('adult.gifts-regifting', bank('adult.gifts-regifting', {
    principle: 'Choose with the person in mind, include a gift receipt when it may help, and thank every gift; regifting is debated, and most agree it must be new and never go back to the same circle.',
    hint: 'Where writers agree, follow them; where they disagree, care and discretion are what all sides share.',
    ctxLine: 'Giving and receiving gifts:',
    rudeWhy: 'most writers on both sides agree it can hurt the giver or the receiver',
    custom: {
      agree: function (R, ctx, T) {
        var v = cast(R, ['peer']);
        var it = R.pick([
          ['Regifting', 'Writers disagree: some accept it with care, others would rather it never happen.'],
          ['Thanking someone for a gift you don\'t love', 'Writers agree: thank every gift for the thought behind it.'],
          ['Regifting a monogrammed towel', 'Writers agree: avoid it; a monogram shows it was meant for someone else.'],
          ['Including a gift receipt', 'Writers agree: it is a kind touch.'],
          ['Regifting to a friend of the original giver', 'Writers agree: avoid it; it may be discovered and hurt the giver.']]);
        var choices = ['Writers disagree: some accept it with care, others would rather it never happen.', 'Writers agree: thank every gift for the thought behind it.', 'Writers agree: avoid it; a monogram shows it was meant for someone else.', 'Writers agree: it is a kind touch.', 'Writers agree: avoid it; it may be discovered and hurt the giver.'];
        return { q: 'Which statement best describes what etiquette writers say about this?<br><b>' + it[0] + '</b>', a: U.mc(it[1], R.sample(choices.filter(function (c) { return c !== it[1]; }), 3), 4),
          steps: [T.principle, it[1]], hint: T.hint };
      }
    },
    sc: [
      { p: 'home', r: ['peer', 'rosa'], holds: { 0: 'gift' }, s: '{B} gives {A} a sweater in a color {Ahe} would never wear.', q: 'What should {A} say?',
        ok: ['"Thank you! It\'s so soft. That was so thoughtful."'], bad: [['"I don\'t really wear this color."', 'Criticizing a gift hurts the giver; the thought deserves thanks.'], '"Do you have the receipt?"', 'Nothing; {Ahe} just sets it aside.'], why: 'Thank the thought, warmly and truthfully.' },
      { p: null, r: ['peer', 'peer'], s: '{A} is buying a gift for {B}, who loves {hobby}.', q: 'What is the best approach?',
        ok: ['Choose something for {B}\'s love of {hobby}, and include a gift receipt.'], bad: ['Buy what {A} would like for {Ahim}self.', 'Give {B} something {A} received and never used, without checking it suits {Bhim}.', 'Ask {B} to choose and pay, then pay {Bhim} back.'], why: 'A gift chosen with the person in mind says "I thought about you."' }
    ],
    good: ['Including a gift receipt', 'Thanking someone for a gift you don\'t love', 'Choosing a gift from the person\'s wish list', 'Sending a thank-you note for every gift'],
    rude: [['Regifting a monogrammed towel', 'a monogram shows it was meant for someone else'], ['Regifting to a friend of the original giver', 'it may be discovered and hurt the giver'], ['Regifting something used', 'a gift should be new'], ['Telling the giver you plan to return their gift', 'it hurts the giver']],
    mix: { 1: ['sc', 'agree'], 2: ['agree', 'sc', 'all'], 3: ['all', 'agree', 'sc'] }
  }));

  // ================================================================ Unit 9: Neighbors, Lending and Travel
  G('adult.borrowing-lending', bank('adult.borrowing-lending', {
    principle: 'Ask, return the item on time in as good shape or better, replace what you break or use up, and lend only what you can afford to lose.',
    hint: 'Would the lender be glad to lend to you again?',
    ctxLine: 'Borrowing from a neighbor:',
    rudeWhy: 'it turns a favor into a burden for the lender',
    order: [{ title: 'Put the steps of borrowing a neighbor\'s {item} in order.', steps: ['Ask, and say when you will return it', 'Use it with care', 'Clean it and put back anything you used up', 'Return it on time, with a thank-you'], all: true }],
    sc: [
      { p: 'street', r: ['peer', 'peer'], s: '{A} borrowed {B}\'s car for the weekend. The tank was full when {Ahe} took it.', q: 'What should {A} do before returning it?',
        ok: ['Fill the tank, clear out any trash, and return it when promised.'], bad: [['Return it with whatever gas is left.', 'Refilling what you used is part of returning it in as good shape.'], 'Leave a note saying the tank is low.', 'Keep it an extra day without asking.'], why: 'Return it as good as or better than you found it.' },
      { p: 'home', r: ['peer', 'elder'], s: '{A} borrowed a serving dish from {B}, and it cracked at {Ahis} party.', q: 'What should {A} do?',
        ok: ['Tell {B}, apologize, and replace it with the same or a similar dish.'], bad: [['Return it and hope {B} won\'t notice.', 'Hiding it breaks the trust that lending rests on.'], 'Keep it and say nothing.', 'Return it and blame a guest.'], why: 'Replace what you break; honesty keeps the friendship.' },
      { p: 'street', r: ['peer', 'peer'], s: '{B} asks to borrow {A}\'s {item}, which {A} would be very upset to lose.', q: 'What is wise?',
        ok: ['Kindly say no, or offer to help with the job instead.'], bad: ['Lend it and worry the whole time.', 'Lend it and charge a fee.', 'Pretend {Ahe} doesn\'t own one.'], why: 'Lend only what you can afford to lose; it protects the friendship.' }
    ],
    good: ['Returning a ladder on the day you promised', 'Washing a borrowed dish before returning it', 'Telling the owner you broke something', 'Refilling a borrowed car\'s tank'],
    rude: [['Returning a car with an empty tank', 'refill what you used'], ['Keeping a book for a year without asking', 'return it on time, or ask'], ['Lending a borrowed item to someone else', 'it wasn\'t yours to lend'], ['Returning a tool broken without a word', 'tell the owner and fix it']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'order', 'all'], 3: ['all', 'order', 'sc'] }
  }));

  G('adult.neighbors', bank('adult.neighbors', {
    principle: 'Greet neighbors, keep noise, pets and yard tidy, park considerately, warn them about a party or project, and talk to them directly about a problem.',
    hint: 'Have you talked to the neighbor yourself, kindly?',
    ctxLine: 'Living next door to others:',
    rudeWhy: 'it makes your home a burden on theirs',
    sc: [
      { p: 'street', r: ['peer', 'peer'], s: '{B}\'s dog barks for hours every day while {B} is at work. {A} lives next door.', q: 'What should {A} do first?',
        ok: ['Tell {B} kindly, in person or with a friendly note; {Bhe} may not know.'], bad: [['Complain to the landlord.', 'Going over {B}\'s head first turns a small problem into a feud.'], 'Post about it on a neighborhood website.', 'Bang on the wall.'], why: 'A direct, friendly word solves most problems, and it gives {B} a chance to fix it.' },
      { p: 'street', r: ['peer', 'peer'], s: '{A} is hosting {event} on Saturday evening.', q: 'What would a good neighbor do?',
        ok: ['Give the neighbors a heads-up and ask them to say if it gets too loud.'], bad: ['Say nothing; it is only one night.', 'Invite every neighbor but one.', 'Park guests across the neighbors\' driveways.'], why: 'A heads-up lets neighbors plan and builds goodwill.' },
      { p: 'street', r: ['peer', 'peer'], s: '{A} has guests coming and the street is crowded.', q: 'Where should the guests park?',
        ok: ['Where they don\'t block anyone\'s driveway or mailbox.'], bad: ['Across {B}\'s driveway, just for an hour.', 'On {B}\'s lawn.', 'Anywhere, since {A} will move cars if asked.'], why: 'Park considerately so neighbors can come and go.' }
    ],
    good: ['Waving to a neighbor across the street', 'Picking up after your dog', 'Telling neighbors before a party or a big project', 'Talking to a neighbor directly and kindly about a problem'],
    rude: [['Blocking a neighbor\'s driveway', 'they need to come and go'], ['Complaining online before talking to the neighbor', 'a direct, friendly word solves most problems'], ['Running a loud leaf blower at 6 a.m.', 'noise carries into their home'], ['Letting your dog roam into a neighbor\'s yard', 'keep pets in your own space']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.travel-courtesy', bank('adult.travel-courtesy', {
    principle: 'On planes and trains, store bags quickly, recline gently, share the armrest (the middle seat gets both), keep calls short and quiet, and thank the crew and hotel staff.',
    hint: 'Is anything of yours, elbow, bag or sound, in someone else\'s space?',
    ctxLine: 'On a crowded plane or train:',
    rudeWhy: 'it spills into a stranger\'s small space',
    sc: [
      { p: 'plane', r: ['peer', 'peer'], s: 'On a long flight, {A} wants to recline. Behind {Ahim}, {B} is working on a laptop.', q: 'What should {A} do?',
        ok: ['Glance back, perhaps say "I\'m going to recline a bit," and recline slowly and partway.'], bad: [['Slam the seat back all the way.', 'A sudden recline can hit a knee or a laptop.'], 'Recline fully and stay that way through meals.', 'Ask {B} to close the laptop.'], why: 'A glance back and a gentle recline spare the person behind.' },
      { p: 'plane', r: ['peer', 'peer'], s: '{A} has the aisle seat; {B} is in the middle seat between {Ahim} and a stranger.', q: 'What do many travelers think is the kind thing about armrests?',
        ok: ['Let the middle-seat passenger have both armrests.'], bad: ['The aisle seat gets both.', 'Whoever sits first takes both.', 'Nobody may use them.'], why: 'The middle seat has the least room, so many travelers let it have both armrests: a kindness, not a rule.' },
      { p: 'plane', r: ['peer', 'peer'], s: '{A} boards a crowded train with a big bag. People are waiting behind {Ahim}.', q: 'What should {Ahe} do?',
        ok: ['Store the bag quickly, or step into the row to let others pass.'], bad: ['Stand in the aisle and unpack slowly.', 'Ask everyone to wait.', 'Put the bag in the aisle.'], why: 'In a narrow aisle, one slow traveler holds up everyone behind.' }
    ],
    good: ['Letting the middle-seat passenger have both armrests', 'Using headphones for a movie', 'Thanking the flight crew as you leave', 'Reclining gently after a glance back'],
    rude: [['Slamming your seat back without looking', 'it can hit the person behind you'], ['Taking a long, loud phone call on a train', 'others can\'t leave'], ['Spreading your bags across an empty seat on a full train', 'someone needs that seat'], ['Ignoring a quiet-car sign', 'others chose that car for quiet']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.customs-abroad', bank('adult.customs-abroad', {
    principle: 'Before traveling, learn a greeting and "thank you" in the language, how people dress for sacred and formal sites, and the local customs on tipping, greetings and shoes. Ask, watch and follow local ways.',
    hint: 'You are a guest in another country. What would put your hosts at ease?',
    ctxLine: 'Traveling in another country:',
    rudeWhy: 'it assumes home customs apply everywhere',
    sc: [
      { p: 'street', r: ['peer', 'peer'], s: '{A} is touring a historic place of worship abroad on a hot day, wearing shorts and a tank top.', q: 'What should {Ahe} do?',
        ok: ['Check the site\'s rules and cover shoulders and knees, or remove shoes, if asked.'], bad: [['Go in as {Ahe} is; it is too hot to change.', 'Many sacred sites ask visitors to cover up, and following the rules honors the hosts.'], 'Take photos from the doorway against the posted rules.', 'Ask the staff to make an exception.'], why: 'Follow the dress customs of sacred and formal sites.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} is visiting a country where {Ahe} doesn\'t know the tipping custom.', q: 'What is the best approach?',
        ok: ['Read about it before the trip or ask at the hotel.'], bad: [['Tip 20 percent everywhere, as at home.', 'Service may be included, or tipping may not be expected.'], 'Never tip abroad.', 'Ask the server how much {Ahe} should tip them.'], why: 'Tipping customs differ abroad; ask, watch and follow local ways.' },
      { p: 'office', r: ['peer', 'peer'], s: 'In a country where adults use titles and family names, {A}\'s new colleagues call {Ahim} by {Ahis} title and family name.', q: 'What should {A} do?',
        ok: ['Use their titles and family names, and switch only if invited.'], bad: ['Insist that everyone use first names.', 'Call them by first names anyway; it is friendlier.', 'Avoid using names at all.'], why: 'Follow local ways. Different is not wrong.' }
    ],
    good: ['Learning "thank you" in the local language', 'Asking at the hotel about tipping', 'Covering your shoulders at a sacred site', 'Taking off your shoes where the custom asks'],
    rude: [['Assuming everyone will speak English', 'learn a few words, and ask politely'], ['Talking loudly in a quiet museum', 'match how others behave'], ['Laughing at a local custom', 'different is not wrong'], ['Ignoring a sign that asks for no photos', 'follow the place\'s rules']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  // ================================================================ Unit 10: Awkward Moments
  G('adult.forgetting-name', bank('adult.forgetting-name', {
    principle: 'Admit it lightly ("I\'m so sorry, your name has slipped my mind"), or introduce yourself first so they offer theirs; help others when they forget yours.',
    hint: 'A light admission takes two seconds; hiding it makes it awkward.',
    sc: [
      { p: 'party', r: ['peer', 'peer', 'peer'], s: 'At a reunion, {A} greets a classmate whose name {Ahe} has forgotten. {Ahis} friend {C} walks up.', q: 'What should {A} do?',
        ok: ['Say, "This is my friend {C}," and pause so the classmate says their name; or admit it lightly.'], bad: [['Skip the introduction and hope no one notices.', 'Leaving {C} standing unintroduced is the bigger slip.'], 'Walk away before {C} arrives.', 'Call the classmate "buddy" all evening.'], why: 'A light admission or a pause for the other person to say their name keeps everyone included.' },
      { p: 'street', r: ['peer', 'diaz'], s: '{B} greets {A} warmly but clearly can\'t remember {Ahis} name.', q: 'What should {A} do?',
        ok: ['Say {Ahis} name and a detail: "It\'s {Afull}. We met at the soccer fields."'], bad: [['Wait to see if {B} remembers.', 'Waiting leaves {B} searching and embarrassed.'], 'Say, "You don\'t remember me, do you?"', 'Quiz {B} with hints.'], why: 'Helping someone who has forgotten your name spares them discomfort.' },
      { p: 'office', r: ['peer', 'peer'], s: '{A} meets {B} at a conference and realizes {Ahe} has forgotten {Bhis} name, though they met last year.', q: 'Which is best?',
        ok: ['"Hi, I\'m {A}. We met at last year\'s conference." ({B} will likely say {Bhis} name.)', '"I\'m so sorry, your name has slipped my mind."'], bad: ['Avoid {B} for the rest of the day.', 'Pretend to take a phone call.', 'Ask a stranger who {B} is.'], why: 'Introducing yourself first, or a brief, cheerful admission, is better than an awkward evasion.' }
    ],
    spot: [
      { p: 'party', r: ['peer', 'peer', 'peer'], intro: '{A} runs into an old classmate, {B}, and {Ahis} friend {C} joins them.', lines: [[0, 'It\'s so good to see you!'], [1, 'You too! It\'s been years.'], [2, 'Hi there!'], [0, 'So anyway, as I was saying about the trip...']], fault: 3, why: '{A} kept talking and left {C} standing unintroduced, maybe to hide a forgotten name. A light "I\'m so sorry, your name has slipped my mind" would have included everyone.' }
    ],
    custom: { intro: introP },
    mix: { 1: ['sc'], 2: ['sc', 'spot', 'intro'], 3: ['sc', 'spot', 'intro'] }
  }));

  G('adult.spills', bank('adult.spills', {
    principle: 'Apologize briefly, help clean up, offer to pay for damage, and move on; as a host, reassure the guest and make light of it.',
    hint: 'One sincere apology and a fix, then back to the evening.',
    ctxLine: 'After a spill at a dinner party:',
    rudeWhy: 'it keeps attention on the accident or hides it',
    sc: [
      { p: 'table', r: ['peer', 'peer'], moods: { 0: 'worried' }, s: 'At {B}\'s dinner, {A} drips sauce on the white tablecloth.', q: 'What should {A} do?',
        ok: ['Apologize once, help blot it if {B} wants, offer to pay for cleaning, and rejoin the talk.'], bad: [['Apologize again every half hour.', 'Repeated apologies keep everyone focused on the accident.'], 'Cover it with a plate and say nothing.', 'Laugh and blame the sauce.'], why: 'One sincere apology and a fix is enough.' },
      { p: 'table', r: ['peer', 'peer'], moods: { 1: 'worried' }, s: '{B}, a guest, knocks over a glass at {A}\'s dinner.', q: 'What should {A}, the host, do?',
        ok: ['Say "Don\'t worry at all!", clean it up quickly, and change the subject.'], bad: [['Sigh and mention that the tablecloth was new.', 'The host\'s job is to put the guest at ease.'], 'Make {B} clean it up alone.', 'Tell the story at every party.'], why: 'A host who makes light of it tells the guest they matter more than the cloth.' },
      { p: 'home', r: ['peer', 'peer'], s: '{A} borrowed {B}\'s jacket and spilled coffee on it.', q: 'What should {A} do?',
        ok: ['Tell {B}, apologize, and pay for the cleaning.'], bad: [['Return it and hope {B} won\'t notice.', 'Hiding damage breaks trust.'], 'Keep it until {B} forgets.', 'Return it and say it was already stained.'], why: 'Apologize, fix it, and move on.' }
    ],
    good: ['One sincere apology and help cleaning up', 'Offering to pay for a cleaning', 'As host, saying "Don\'t worry at all"', 'Returning to the conversation after the cleanup'],
    rude: [['Apologizing every half hour all evening', 'it keeps the attention on the accident'], ['Hiding a stain under a cushion', 'tell the host so it can be fixed'], ['As host, sulking about the stain', 'the guest matters more than the cloth'], ['Blaming the person sitting next to you', 'own the accident']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.others-mistakes', bank('adult.others-mistakes', {
    principle: 'Tell someone privately about something they would want to fix (spinach in the teeth, an open zipper); never correct another person\'s table manners or grammar in front of others.',
    hint: 'Can they fix it in a second, and would they want to know?',
    custom: {
      tellOrNot: function (R, ctx, T) {
        var tell = ['A friend has spinach in her teeth before giving a toast', 'A colleague\'s zipper is open before a presentation', 'A guest has a price tag hanging from his sleeve', 'A friend has a smudge of ink on her cheek before a meeting'];
        var pass = ['A guest is eating salad with the dinner fork', 'A friend says "irregardless" at dinner', 'A guest holds the fork in the left hand, tines down', 'A coworker mispronounces a menu item'];
        var isTell = R.coin(), s = R.pick(isTell ? tell : pass);
        return { q: '<b>' + s + '.</b> What is the courteous thing to do?', a: { t: 'mc', choices: ['Tell them quietly, in private', 'Let it pass and say nothing'], v: isTell ? 0 : 1, keep: true },
          steps: [T.principle, isTell ? 'They can fix it in a second and would be embarrassed to find out later; a quiet word is a kindness.' : 'It harms no one, and pointing it out would only embarrass them.'], hint: T.hint };
      }
    },
    spot: [
      { p: 'table', r: ['peer', 'peer', 'peer'], intro: 'At dinner.', lines: [[0, 'This soup is wonderful, {B}.'], [2, '{B}, that\'s the wrong spoon, you know. The soup spoon is the big one.'], [1, 'Thanks, {A}! It\'s my grandmother\'s recipe.']], fault: 1, why: '{C} corrected {B}\'s table manners in front of others. The wrong spoon harmed no one; the correction embarrassed {Bhim}.' },
      { p: 'office', r: ['peer', 'peer', 'peer'], intro: 'In a meeting.', lines: [[0, 'The results look good this quarter.'], [1, 'I agree. Me and the team will finish the report Friday.'], [2, 'It\'s "the team and I," actually.'], [0, 'Great, thanks. Friday works.']], fault: 2, why: 'Correcting a colleague\'s grammar in front of others embarrasses them and helps no one.' }
    ],
    sc: [
      { p: 'party', r: ['peer', 'peer'], s: 'Before {B} gives a toast, {A} notices spinach in {Bhis} teeth.', q: 'What should {A} do?',
        ok: ['Lean in and say quietly, "You have a little something in your teeth."'], bad: [['Say nothing; it would be rude to mention it.', '{B} would rather know now than after the toast.'], 'Point it out to the whole table.', 'Laugh and take a photo.'], why: 'A quiet word about something fixable is a kindness.' }
    ],
    mix: { 1: ['tellOrNot', 'sc'], 2: ['tellOrNot', 'spot', 'sc'], 3: ['spot', 'tellOrNot', 'sc'] }
  }));

  G('adult.rude-remarks', bank('adult.rude-remarks', {
    principle: 'Stay calm; ask "Why do you ask?", give a short neutral answer, change the subject, or simply say "I\'d rather not discuss that." You never owe a personal answer.',
    hint: 'Short, calm and kind keeps your dignity.',
    ctxLine: 'Someone at a family dinner asks a nosy question:',
    rudeWhy: 'it adds a second rude remark to the first',
    sc: [
      { p: 'table', r: ['peer', 'elder'], s: 'At a family dinner, {B} asks {A}, "How much do you make at that new job?" {A} would rather not say.', q: 'What is the best reply?',
        ok: ['"Enough to keep me happy! I love the work, though."', '"I\'d rather not get into that. But I\'m enjoying the job!"'], bad: [['"That\'s none of your business!"', 'Snapping turns one rude moment into two.'], 'Tell {B} the exact amount to avoid a fuss.', '"How much do YOU make?"'], why: 'A light, short answer and a new topic keep {A}\'s privacy without a fight.' },
      { p: 'party', r: ['peer', 'peer'], s: 'At a party, {B} asks {A}, "Why aren\'t you married yet?"', q: 'What is the best reply?',
        ok: ['"Why do you ask?"', '"That\'s not something I discuss, but thanks for asking. How\'s your garden?"'], bad: [['A long explanation of {Ahis} dating history.', 'You never owe a personal answer.'], 'A sharp insult in return.', 'Leave in tears without a word.'], why: 'A calm deflection protects {A}\'s privacy and keeps {Ahis} dignity.' },
      { p: 'office', r: ['peer', 'peer'], s: 'In a meeting, {B} says, "That\'s a pretty basic idea, {A}."', q: 'What is the calmest reply?',
        ok: ['"Maybe! Simple ideas sometimes work best. What would you change?"'], bad: [['"At least I had an idea."', 'Trading insults makes the meeting worse.'], 'Say nothing and sulk for the rest of the day.', 'Complain about {B} to everyone afterward.'], why: 'Staying calm and inviting a better idea turns the remark back into a discussion.' }
    ],
    good: ['"Why do you ask?"', '"I\'d rather not discuss that."', 'Changing the subject with a smile', 'Excusing yourself if someone keeps pressing'],
    rude: [['Answering an insult with an insult', 'it makes two rude people instead of one'], ['Snapping "None of your business!"', 'a calm deflection does the same job kindly'], ['Mocking the person who asked', 'it feeds the argument'], ['Asking an equally nosy question back to get even', 'two wrongs make a worse evening']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'all'], 3: ['all', 'sc'] }
  }));

  G('adult.declining', bank('adult.declining', {
    principle: 'Decline invitations, food and requests kindly and briefly ("Thank you for asking; I can\'t make it"); a long excuse isn\'t needed, and a lie isn\'t either.',
    hint: 'Thanks, a clear answer and warmth are all a no needs.',
    ctxLine: 'Saying no to an invitation or a request:',
    rudeWhy: 'it leaves the other person guessing or let down',
    text: [
      { title: '{B}', msgs: [[1, 'Want to help at the bake sale Saturday? We need people from 8 to noon!']], q: '{A} can\'t help this weekend. Which reply is best?', ok: ['Thanks for asking! I can\'t make it Saturday, but I hope it goes great.'], bad: [['Sure!', ''], 'I would, but my cousin is visiting and my car might need repairs and my dog has a cold...', '(No reply)'], why: 'Kind, clear and brief. Saying yes and not showing up, or a tangle of excuses, is worse than a simple no.' },
      { title: '{B}', msgs: [[1, 'We\'re doing karaoke Friday night! You in?']], q: '{A} doesn\'t want to go. Which reply is best?', ok: ['Thanks for thinking of me! I\'ll sit this one out, but have a great time.'], bad: ['Maybe, I\'ll see.', 'I have a work thing. (There is no work thing.)', 'Karaoke is the worst.'], why: 'A kind no is honest and lets {B} plan. An invented excuse can be found out.' }
    ],
    sc: [
      { p: 'table', r: ['peer', 'peer'], s: 'The host, {B}, offers {A} a second helping of {food}. {A} is full.', q: 'What should {A} say?',
        ok: ['"No, thank you. It was delicious, but I couldn\'t eat another bite."'], bad: [['"I\'m on a strict diet, so I really shouldn\'t have had any."', 'No excuse is needed, and a diet talk at the table can make the host uneasy.'], 'Take more and leave it on the plate.', '"No."'], why: 'A warm "No, thank you" with a compliment is all it needs.' },
      { p: 'office', r: ['peer', 'peer'], s: '{B} asks {A} to take on a project {A} has no time for.', q: 'What is the best reply?',
        ok: ['"Thanks for thinking of me. I can\'t take that on right now, but I could look over the plan next week."'], bad: [['Say yes, then quietly never do it.', 'The other person counts on a yes.'], 'Invent a family emergency.', 'Ignore the request.'], why: 'A clear, kind no, perhaps with another way to help, is polite and honest.' }
    ],
    good: ['"Thank you for asking; I can\'t make it."', '"No, thank you. It was delicious."', 'Replying promptly so they can ask someone else', 'Offering another way to help when you can'],
    rude: [['Saying yes and then not showing up', 'the other person counted on you'], ['Inventing an elaborate excuse', 'a long excuse isn\'t needed, and a lie can be found out'], ['Leaving an invitation unanswered', 'the host can\'t plan'], ['Declining with a criticism of the plan', 'a no needs no insult']],
    mix: { 1: ['sc', 'tf'], 2: ['sc', 'text', 'all'], 3: ['all', 'text', 'sc'] }
  }));

  // ================================================================ Unit 11: Dating Courtesy and Presence
  G('adult.asking-answering', bank('adult.asking-answering', {
    principle: 'Ask clearly, in person or by a call when you can, make plans specific, and accept a "no" gracefully; answer kindly and truthfully either way.',
    hint: 'Does the question, or the answer, tell the other person exactly where they stand?',
    ctxLine: 'Asking someone out, and answering:',
    rudeWhy: 'it leaves the other person guessing or pressured',
    sc: [
      { p: 'park', r: ['peer', 'peer'], s: '{A} would like to ask {B} on a date.', q: 'Which invitation is best?',
        ok: ['"Would you like to get dinner at the Thai place on Friday?"', '"Would you like to see the new exhibit with me on Saturday afternoon?"'], bad: [['"We should hang out sometime, maybe."', 'A vague invitation leaves {B} guessing what {A} means.'], '"You\'re coming to dinner with me Friday."', 'Ask {B}\'s friend to ask for {Ahim}.'], why: 'A clear, specific invitation is easy to answer either way.' },
      { p: 'park', r: ['peer', 'peer'], s: '{A} asked {B} to a concert. {B} said, "Thank you, that\'s kind, but I\'ll pass."', q: 'What should {A} do?',
        ok: ['Say "No problem, thanks for letting me know," and stay friendly.'], bad: [['Ask why, and suggest another night.', 'Pressing after a no ignores {B}\'s answer.'], 'Ask again next week.', 'Stop speaking to {B}.'], why: 'Accepting a no gracefully respects {B}\'s choice and keeps things comfortable.' }
    ],
    text: [
      { title: '{B}', msgs: [[1, 'Would you like to go to the farmers market with me on Saturday morning?']], q: '{A}\'s answer is no. Which reply is kindest?', ok: ['Thank you for asking! I\'m going to say no, but I hope you have fun.'], bad: [['Maybe!', ''], '(Leave it unanswered for a week.)', 'Ew, no.'], why: 'Kind, clear and truthful. A "maybe" when the answer is no keeps {B} waiting.' },
      { title: '{B}', msgs: [[1, 'Would you like to get coffee on Sunday?']], q: '{A} would love to. Which reply is best?', ok: ['I\'d love to! What time works for you?'], bad: ['idk maybe', 'Sure, if nothing else comes up.', 'k'], why: 'A warm, clear yes, with a step toward a plan.' }
    ],
    mix: { 1: ['sc', 'text'], 2: ['sc', 'text'], 3: ['text', 'sc'] }
  }));

  G('adult.date-courtesy', bank('adult.date-courtesy', {
    principle: 'Be on time, put the phone away, listen, be kind to staff, and settle who pays ahead; customs range from the inviter paying to splitting, and both are polite.',
    hint: 'Where writers disagree, the courteous thing is to agree together, early and without pressure.',
    ctxLine: 'On a date at a restaurant:',
    rudeWhy: 'it tells the other person they come second',
    custom: {
      pays: function (R, ctx, T) {
        var v = cast(R, ['peer', 'peer']);
        return { q: v.A + ' and ' + v.B + ' are on a date. Which statement best describes what etiquette writers say about who pays?',
          a: U.mc('Customs vary and writers disagree; it is polite when both agree, ideally before the check arrives.', ['The man always pays.', 'The person who earns more must pay.', 'Splitting the bill is always rude on a date.'], 4),
          steps: [T.principle, 'This is a custom where writers disagree, so no single rule is right. The inviter paying, splitting and taking turns are all polite when both agree.'], hint: T.hint };
      }
    },
    sc: [
      { p: 'restaurant', r: ['peer', 'peer'], s: '{A} invited {B} to dinner. The check arrives, and they never discussed paying.', q: 'Which would most writers call gracious?',
        ok: ['{A} offers to pay; if {B} offers to split, they settle it cheerfully either way.'], bad: [['They argue about it at the table.', 'Settle it early and cheerfully; a quarrel spoils the evening.'], '{A} goes to the restroom until {B} pays.', '{B} hands the check to {A} without a word.'], why: 'Customs vary; what matters is that it is settled without pressure or awkwardness.' },
      { p: 'restaurant', r: ['peer', 'peer'], holds: { 1: 'phone' }, s: 'On a first date, {A}\'s phone buzzes during dinner.', q: 'What should {A} do?',
        ok: ['Leave it silenced and out of sight, or, if expecting something important, mention it at the start and step away.'], bad: [['Check it quickly under the table.', 'Even a glance tells {B} someone else might matter more.'], 'Answer it at the table.', 'Put it on the table face-up, just in case.'], why: 'The person in front of you comes first.' },
      { p: 'restaurant', r: ['peer', 'peer'], s: 'On a date, the server brings {A} the wrong dish.', q: 'What should {A} do?',
        ok: ['Mention it kindly and quietly, and thank the server when it is fixed.'], bad: [['Snap at the server to show {B} {Ahe} won\'t be pushed around.', 'How you treat staff tells {B} how you treat everyone.'], 'Make a scene about it.', 'Complain about the server all evening.'], why: 'Kindness to staff is worth showing, and worth noticing in others.' }
    ],
    good: ['Arriving on time', 'Asking questions and listening', 'Agreeing ahead of time how you will pay', 'Thanking the server'],
    fine: ['The person who invited paying for both', 'Splitting the bill by agreement', 'Taking turns paying on different dates'],
    rude: [['Being curt with the server', 'kindness to staff shows how you treat everyone'], ['Scrolling your phone during dinner', 'the person in front of you comes first'], ['Arguing over the check at the table', 'settle it early and cheerfully'], ['Arriving half an hour late without a message', 'being on time says the other person matters']],
    mix: { 1: ['sc', 'tf', 'pays'], 2: ['sc', 'pays', 'all'], 3: ['all', 'sc', 'pays'] }
  }));

  G('adult.posture-presence', bank('adult.posture-presence', {
    principle: 'Stand tall and relaxed, sit upright, rise to greet, look people in the face, and keep hands still; presence means giving people your full attention.',
    hint: 'Poise is tall and easy, not stiff, and turned toward the other person.',
    ctxLine: 'Talking with someone at a reception:',
    rudeWhy: 'it tells the other person your attention is elsewhere',
    custom: {
      compare: function (R, ctx, T) {
        var pose = R.pick(['stand', 'sit', 'table']), good = R.pick(['A', 'B']), who = R.pick(['nora', 'james', 'priya', 'kofi', 'rosa']);
        return { q: 'Which figure shows poise and attention: A or B?', a: { t: 'mc', choices: ['A', 'B'], v: good === 'A' ? 0 : 1, keep: true },
          viz: { name: 'et-posture', opts: { pose: pose, mode: 'compare', good: good, who: who, quiet: true, interactive: false, label: 'Two figures, A and B' } },
          steps: [T.principle, 'Figure ' + good + ' is upright and easy, head up and facing forward' + (pose === 'stand' ? ', standing tall without stiffness.' : ', sitting back and upright with feet on the floor.'), 'The other figure is slumped, which reads as tired or distracted.'], hint: T.hint };
      }
    },
    sc: [
      { p: 'party', r: ['peer', 'priya'], holds: { 0: 'cup' }, s: '{A} is about to be introduced to {Ahis} new manager, {B}, while holding a drink in {Ahis} right hand.', q: 'What should {A} do?',
        ok: ['Move the drink to the left hand, stand tall, face {B}, smile and shake hands.'], bad: [['Shake with the cold, wet hand holding the drink.', 'Freeing the right hand lets {A} greet {B} properly.'], 'Nod without looking up from {Ahis} phone.', 'Stay seated and wave the glass.'], why: 'Free the right hand, face the person, and give {Bhim} full attention.' },
      { p: 'table', r: ['peer', 'peer'], s: 'At dinner, {B} is telling a story. {A} is slumped on one elbow, looking out the window.', q: 'What would show more presence?',
        ok: ['Sit upright, turn toward {B}, and listen.'], bad: ['Check {Ahis} phone so {Ahe} looks busy.', 'Interrupt with a better story.', 'Keep looking out the window but nod now and then.'], why: 'Turning toward the speaker and listening is what presence means.' },
      { p: 'office', r: ['peer', 'elder'], s: '{A} is sitting at {Ahis} desk when {B}, a visitor, comes over to meet {Ahim}.', q: 'What should {A} do?',
        ok: ['Rise, smile, and greet {B}.'], bad: ['Keep typing and say hello over {Ahis} shoulder.', 'Stay seated and point to a chair.', 'Wave without looking up.'], why: 'Rising to greet is a courtesy that says the visitor matters.' }
    ],
    good: ['Rising when a visitor comes to greet you', 'Facing the person you are talking with', 'Keeping your hands still while listening', 'Sitting upright at the table'],
    rude: [['Scrolling a phone while someone talks to you', 'it says the screen matters more'], ['Staying slouched in your chair when introduced', 'rising to greet shows respect'], ['Looking around the room for someone more interesting', 'give the person in front of you your attention'], ['Drumming your fingers while a colleague speaks', 'it signals impatience']],
    mix: { 1: ['compare', 'sc', 'tf'], 2: ['compare', 'sc', 'all'], 3: ['all', 'compare', 'sc'] }
  }));

  ML._etAdult = { TOPICS: TOPICS, make: make, cast: cast, fill: fill };
})(window.MathLadder);
