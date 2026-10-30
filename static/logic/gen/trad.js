/* Logic Ladder generators: Traditional Logic (course key trad). One generator per topic in data/logic/topics/trad.json,
   registered with MathLadder.gen. Built from source parts in /tmp/work_logic/trad/gen/*.js (concatenated in order).

   Conventions (the ladder overview): standard form "All S are P", "No S are P", "Some S are P", "Some S are not P" with
   plural class nouns; A E I O; distribution A subject, E both, I neither, O predicate; major term P (predicate of the
   conclusion), minor term S, middle M; mood in standard order; figures 1 M-P/S-M, 2 P-M/S-M, 3 M-P/M-S, 4 P-M/M-S;
   the modern (Boolean) reading is the default for validity, and the traditional reading is named whenever it is used.
   Answers come from the kit's model MathLadder.logic (static/logic/viz/logic.js, loaded on every Logic page and with
   the course), called inside the generator functions. Problems also carry `chk`, the setup in machine-readable form,
   so /tmp/work_logic/trad/test/verify.js recomputes every answer by an independent route (brute force over Venn
   worlds, its own distribution rules, its own truth tables). The runner ignores chk. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  function LG() { return ML.logic; }
  var G = function (id, fn) { ML.gen(id, fn); };
  function lvl(ctx) { return (ctx && ctx.level) || 1; }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function low(s) { s = String(s); return s.charAt(0).toLowerCase() + s.slice(1); }
  function P(q, a, steps, hint, chk, viz) { var p = { q: q, a: a, steps: steps }; if (hint) p.hint = hint; if (chk) p.chk = chk; if (viz) p.viz = viz; return p; }
  function mc(correct, wrongs) { var seen = {}, ch = [correct]; seen[correct] = 1; wrongs.forEach(function (w) { if (!seen[w]) { seen[w] = 1; ch.push(w); } }); return { t: 'mc', choices: ch, v: 0 }; }
  function keep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function it(s) { return '<i>' + s + '</i>'; }
  // a boxed argument or list of statements for the question text
  function box(lines) { return '<div style="border-left:3px solid var(--mi-acc,#9b2335);padding:.15em 0 .15em .8em;margin:.55em 0">' + lines.join('<br>') + '</div>'; }
  function argBox(prem, concl) { return box(prem.concat(['∴ ' + concl])); }
  function bank(R, ctx, list) { var L = lvl(ctx), pool = list.filter(function (x) { return (x.lv || 1) <= L; }); var top = pool.filter(function (x) { return (x.lv || 1) === L; }); return R.chance(0.6) && top.length ? R.pick(top) : R.pick(pool); }
  var TFU = ['True', 'False', 'Undetermined'];
  function tfu(v) { return v === true ? 'True' : v === false ? 'False' : 'Undetermined'; }

  // ------------------------------------------------------------------ categorical helpers
  // people grouped by hobby or habit: any relation between two of them is possible, so the truth of a premise never
  // distracts from the form ([singular with article, plural])
  var PEOPLE = [['a chess player', 'chess players'], ['an early riser', 'early risers'], ['a volunteer', 'volunteers'], ['a musician', 'musicians'],
    ['a swimmer', 'swimmers'], ['an artist', 'artists'], ['a hiker', 'hikers'], ['a gardener', 'gardeners'], ['a baker', 'bakers'], ['a camper', 'campers'],
    ['a runner', 'runners'], ['a poet', 'poets'], ['a singer', 'singers'], ['a painter', 'painters'], ['a cyclist', 'cyclists'], ['a debater', 'debaters'],
    ['a dancer', 'dancers'], ['a skater', 'skaters'], ['a reader', 'readers'], ['a drummer', 'drummers'], ['a juggler', 'jugglers'],
    ['a birdwatcher', 'birdwatchers'], ['a coder', 'coders'], ['a knitter', 'knitters'], ['an actor', 'actors'], ['a golfer', 'golfers'],
    ['a sailor', 'sailors'], ['a climber', 'climbers'], ['a potter', 'potters'], ['an angler', 'anglers']];
  function terms3(R) { return R.sample(PEOPLE, 3); } // [[sing, plural] x3]
  function pl(t) { return t[1]; }
  function sg(t) { return t[0]; }
  function bare(t) { return t[0].replace(/^an? /, ''); }
  function cat(f, s, p) { return LG().catText(f, s, p); }
  function letterOf(text) { return LG().parseCat(text).f; }
  var FORMS = ['A', 'E', 'I', 'O'];
  var FDESC = { A: 'universal affirmative', E: 'universal negative', I: 'particular affirmative', O: 'particular negative' };
  var VALID = ['AAA-1', 'EAE-1', 'AII-1', 'EIO-1', 'EAE-2', 'AEE-2', 'EIO-2', 'AOO-2', 'IAI-3', 'AII-3', 'OAO-3', 'EIO-3', 'AEE-4', 'IAI-4', 'EIO-4'];
  var COND = { 'AAI-1': 'S', 'EAO-1': 'S', 'AEO-2': 'S', 'EAO-2': 'S', 'AAI-3': 'M', 'EAO-3': 'M', 'AEO-4': 'S', 'EAO-4': 'M', 'AAI-4': 'P' };
  function randForm(R) { return R.pick(FORMS) + R.pick(FORMS) + R.pick(FORMS) + '-' + R.int(1, 4); }
  // a syllogism with people terms: { S, P, M (plural strings), form, major, minor, conclusion, sy (the model's analysis) }
  function makeSyl(R, form, T3) {
    T3 = T3 || terms3(R);
    var S = pl(T3[0]), Pt = pl(T3[1]), M = pl(T3[2]), f = LG().fromForm(form, S, Pt, M);
    var sy = LG().syllogism({ major: f.major, minor: f.minor, conclusion: f.conclusion });
    return { S: S, P: Pt, M: M, T3: T3, form: form, major: f.major, minor: f.minor, conclusion: f.conclusion, sy: sy };
  }
  function sylChk(x, extra) { var c = { kind: 'syl', major: x.major, minor: x.minor, conclusion: x.conclusion, form: x.sy.form, valid: x.sy.valid, cond: x.sy.conditional, broken: x.sy.broken.slice() }; if (extra) for (var k in extra) c[k] = extra[k]; return c; }
  function sylBox(x, order) { var pr = order === 'swap' ? [x.minor, x.major] : [x.major, x.minor]; return argBox(pr, x.conclusion); }
  function vennView(x, more) { var o = { premises: [x.major, x.minor], terms: [x.S, x.P, x.M], quiet: true, interactive: false }; if (more) for (var k in more) o[k] = more[k]; return { name: 'lg-venn3', opts: o }; }
  function sylView(x, more) { var o = { major: x.major, minor: x.minor, conclusion: x.conclusion, quiet: true, interactive: false }; if (more) for (var k in more) o[k] = more[k]; return { name: 'lg-syllogism', opts: o }; }
  function roleOf(x, t) { return t === x.S ? 'minor term (S)' : t === x.P ? 'major term (P)' : 'middle term (M)'; }
  function distWords(f) { return { A: 'A distributes its subject only', E: 'E distributes both terms', I: 'I distributes neither term', O: 'O distributes its predicate only' }[f]; }
  function verdictText(sy) { return sy.valid ? 'valid' : sy.conditional ? 'invalid on the modern reading (valid on the traditional reading if there are ' + sy.conditional + ')' : 'invalid'; }
  var FALLACY = { 'undistributed middle': 'Undistributed middle', 'illicit major': 'Illicit major', 'illicit minor': 'Illicit minor', 'exclusive premises': 'Exclusive premises',
    'affirmative conclusion from a negative premise': 'Affirmative conclusion from a negative premise', 'negative conclusion from affirmative premises': 'Negative conclusion from affirmative premises',
    'existential fallacy': 'Existential fallacy', 'four terms': 'Four terms' };
  // the 2-circle region names (bit masks 1 = S, 2 = P; textbook numbers 1 S only, 2 both, 3 P only, 4 outside)
  var R2NUM = { 1: 1, 3: 2, 2: 3, 0: 4 };
  // the 3-circle textbook numbers by bit mask (1 = S, 2 = P, 4 = M)
  var R3NUM = { 1: 1, 3: 2, 2: 3, 5: 4, 7: 5, 6: 6, 4: 7, 0: 8 };
  function regionList(nums) { nums = nums.slice().sort(); return nums.length === 1 ? 'region ' + nums[0] : 'regions ' + nums.slice(0, -1).join(', ') + ' and ' + nums[nums.length - 1]; }

  // =================================================================== Unit 1: Terms and Simple Apprehension
  var ACTS = ['A term (simple apprehension)', 'A proposition (judgment)', 'An argument (reasoning)'];
  var ACT_ITEMS = [
    { s: 'the tall oak beside the river', k: 0 }, { s: 'a red bicycle with a flat tire', k: 0 }, { s: 'the girl who won the spelling bee', k: 0 },
    { s: 'the first day of summer', k: 0 }, { s: 'honesty', k: 0 }, { s: 'a triangle with two equal sides', k: 0 },
    { s: 'the oldest library in the city', k: 0, lv: 2 }, { s: 'every student in the third row', k: 0, lv: 2 }, { s: 'dogs that herd sheep on the hills above the town', k: 0, lv: 2 },
    { s: 'the old wooden bridge that was painted green last spring', k: 0, lv: 3 }, { s: 'the claim that the earth is flat', k: 0, lv: 3, why: 'It names a claim without making it; nobody here affirms that the earth is flat.' },
    { s: 'The oak beside the river is tall.', k: 1 }, { s: 'Some bicycles have flat tires.', k: 1 }, { s: 'No triangle has four sides.', k: 1 },
    { s: 'Ice floats on water.', k: 1 }, { s: 'Mia won the spelling bee.', k: 1 }, { s: 'The library is not open on Sundays.', k: 1, lv: 2 },
    { s: 'Every student in the third row passed the quiz.', k: 1, lv: 2 }, { s: 'Dogs bark.', k: 1, lv: 2, why: 'Two words, but a verb joins a subject (dogs) to a predicate (barking), so something is affirmed.' },
    { s: 'The old wooden bridge that was painted green last spring is closed for repairs.', k: 1, lv: 3 },
    { s: 'All oaks are trees, and this is an oak, so this is a tree.', k: 2 }, { s: 'The library is closed on Sundays, and today is Sunday; therefore the library is closed.', k: 2 },
    { s: 'Every square is a rectangle, and every rectangle has four right angles, so every square has four right angles.', k: 2 },
    { s: 'No reptiles have feathers. All snakes are reptiles. Hence no snakes have feathers.', k: 2, lv: 2 },
    { s: 'Since every member of the choir can read music and Leo is in the choir, Leo can read music.', k: 2, lv: 3 }
  ];
  var ACT_WHY = ['Nothing is affirmed or denied: it only names something, however many words it uses.', 'A verb joins a subject to a predicate, so it affirms or denies something and can be true or false.', 'It moves from propositions (the premises) to another proposition (the conclusion), signaled by a word like so or therefore.'];
  var ACT_QS = [
    { s: 'grasping what a triangle is, without saying anything about it', k: 0 }, { s: 'affirming that every triangle has three sides', k: 1 },
    { s: 'concluding that this shape has three sides because it is a triangle and every triangle has three sides', k: 2 },
    { s: 'understanding the idea "library card"', k: 0 }, { s: 'denying that the store is open on Monday', k: 1 },
    { s: 'working out that Max is older than Ben from two other facts about their ages', k: 2, lv: 2 }
  ];
  function genAct(R, L) {
    var k = R.int(0, 2), t = R.sample(PEOPLE, 3);
    if (k === 0) return { s: R.pick(['the ' + pl(t[0]) + ' who are also ' + pl(t[1]), pl(t[0]) + ' who meet on Tuesdays', 'every one of the ' + pl(t[0]) + ' in the club', 'the youngest of the ' + pl(t[0])]), k: 0 };
    if (k === 1) return { s: cat(R.pick(FORMS), pl(t[0]), pl(t[1])) + '.', k: 1 };
    var x = makeSyl(R, R.pick(VALID), t);
    return { s: x.major + ', and ' + low(x.minor) + R.pick([', so ', '; therefore ', '; hence ']) + low(x.conclusion) + '.', k: 2 };
  }
  G('trad.three-acts', function (R, ctx) {
    var L = lvl(ctx);
    if (R.chance(L === 1 ? 0.2 : 0.3)) {
      var a = bank(R, ctx, ACT_QS), acts = ['Simple apprehension', 'Judgment', 'Reasoning'];
      return P('Which act of the mind is this: ' + a.s + '?', keep(acts, a.k),
        ['Simple apprehension grasps what something is (its product is a term); judgment affirms or denies (a proposition); reasoning moves from judgments to a new one (an argument).', 'Here the mind is ' + ['only grasping an idea, so it is simple apprehension.', 'affirming or denying something, so it is judgment.', 'drawing a conclusion from other judgments, so it is reasoning.'][a.k]],
        'Ask: is anything affirmed or denied? Is anything concluded from something else?', { kind: 'act', k: a.k });
    }
    var x = R.chance(0.45) ? genAct(R, L) : bank(R, ctx, ACT_ITEMS);
    var steps = [x.why || ACT_WHY[x.k]];
    if (x.k === 0) steps.push('So it is a term, the product of simple apprehension.');
    if (x.k === 1) steps.push('So it is a proposition, the product of judgment.');
    if (x.k === 2) steps.push('So it is an argument, the product of reasoning.');
    return P('What does this express?' + box([x.s]), keep(ACTS, x.k), steps, 'Look for a verb that affirms or denies, and for a word like so or therefore.', { kind: 'act', k: x.k });
  });

  var SING = ['the Eiffel Tower', 'the first president of the United States', 'Mount Everest', 'my grandmother\'s kitchen table', 'the tallest student in our class',
    'Jupiter', 'the number seven', 'this pencil', 'the Pacific Ocean', 'the author of our class reader', 'Lake Superior', 'the oldest tree in the park'];
  var GEN = ['large brown dogs', 'students who play the violin', 'mountains', 'rivers in Europe', 'red apples', 'prime numbers', 'people who ride the bus',
    'kitchen tables', 'oceans', 'authors of mystery novels', 'lakes', 'trees in the park', 'the planets', 'tall students'];
  var TERM_PROPS = [
    { s: 'The first president of the United States was a skilled surveyor.', sub: 'the first president of the United States', pred: 'a skilled surveyor' },
    { s: 'Large brown dogs are loyal pets.', sub: 'large brown dogs', pred: 'loyal pets' },
    { s: 'The tallest student in our class is a fast runner.', sub: 'the tallest student in our class', pred: 'a fast runner' },
    { s: 'Students who play the violin are members of the orchestra.', sub: 'students who play the violin', pred: 'members of the orchestra' },
    { s: 'The oldest tree in the park is a white oak.', sub: 'the oldest tree in the park', pred: 'a white oak' },
    { s: 'People who ride the early bus are students at Lincoln High.', sub: 'people who ride the early bus', pred: 'students at Lincoln High' }
  ];
  G('trad.terms', function (R, ctx) {
    var L = lvl(ctx), r = R.next();
    if (L >= 2 && r < 0.35) {
      var tp = R.pick(TERM_PROPS), words = tp.s.replace(/\.$/, '').split(' ').length;
      return P('How many terms does this proposition join?' + box([tp.s]), mc('2', ['1', String(words), String(words - 1)]),
        ['A term is one idea, however many words it takes.', 'The subject term is <i>' + tp.sub + '</i>; the predicate term is <i>' + tp.pred + '</i>.', 'The verb joins those two ideas, so the proposition joins <b>2</b> terms.'],
        'Count ideas, not words: what is the proposition about, and what does it say about it?', { kind: 'count', n: 2 });
    }
    if (r < 0.65) {
      var single = R.coin(), t = single ? R.pick(SING) : R.pick(GEN);
      return P('Is this a singular term or a general term?' + box([t]), keep(['Singular term', 'General term'], single ? 0 : 1),
        [single ? 'It picks out exactly one thing, so it is a <b>singular</b> term.' : 'It applies to every member of a class, which can have many members, so it is a <b>general</b> term.',
          'The number of words does not matter: a long phrase can name one thing, and one word can name a class.'],
        'Could the phrase apply to more than one thing?', { kind: 'singular', v: single });
    }
    var wantS = R.coin(), right = wantS ? R.pick(SING) : R.pick(GEN), wr = R.sample(wantS ? GEN : SING, 3);
    return P('Which of these is a <b>' + (wantS ? 'singular' : 'general') + '</b> term?', mc(cap(right), wr.map(cap)),
      [wantS ? 'A singular term names one individual thing.' : 'A general term names a class, so it applies to every one of its members.', '<i>' + cap(right) + '</i> ' + (wantS ? 'names one thing.' : 'applies to many things.'), 'The other three ' + (wantS ? 'each apply to a whole class.' : 'each name one individual.')],
      'Ask of each phrase: one thing, or a class of things?', { kind: 'singular-pick', v: wantS });
  });

  // chains from wide to narrow: each term's extension contains the next one's
  var CHAINS = [['shapes', 'polygons', 'quadrilaterals', 'rectangles', 'squares'], ['animals', 'mammals', 'dogs', 'sheepdogs'], ['foods', 'fruits', 'citrus fruits', 'lemons'],
    ['vehicles', 'cars', 'electric cars', 'electric taxis'], ['books', 'novels', 'mystery novels', 'mystery novels for children'], ['musical instruments', 'string instruments', 'violins'],
    ['plants', 'trees', 'oak trees'], ['buildings', 'houses', 'brick houses', 'two-story brick houses'], ['whole numbers', 'even numbers', 'multiples of 4', 'multiples of 8'],
    ['athletes', 'runners', 'marathon runners'], ['drinks', 'hot drinks', 'teas', 'green teas']];
  var EXT_ITEMS = [
    { t: 'rectangle', x: 'having four right angles', k: 'C' }, { t: 'rectangle', x: 'the door of your classroom (as a shape)', k: 'E' },
    { t: 'dog', x: 'being a mammal', k: 'C' }, { t: 'dog', x: 'the neighbor\'s beagle, Biscuit', k: 'E' },
    { t: 'lemon', x: 'being a citrus fruit', k: 'C' }, { t: 'lemon', x: 'the lemon on the kitchen counter', k: 'E' },
    { t: 'violin', x: 'having strings', k: 'C' }, { t: 'violin', x: 'the violin in the school band room', k: 'E' },
    { t: 'even number', x: 'being divisible by 2', k: 'C' }, { t: 'even number', x: 'the number 14', k: 'E' },
    { t: 'planet', x: 'Mars', k: 'E' }, { t: 'planet', x: 'orbiting a star', k: 'C' }
  ];
  G('trad.extension-intension', function (R, ctx) {
    var L = lvl(ctx), r = R.next();
    if (r < 0.3 || (L === 1 && r < 0.45)) {
      var e = R.pick(EXT_ITEMS), C = e.k === 'C';
      return P('For the term <i>' + e.t + '</i>, is <b>' + e.x + '</b> part of its extension or part of its comprehension?', keep(['Extension', 'Comprehension'], C ? 1 : 0),
        ['The extension of a term is the set of things it applies to; the comprehension is the set of features it implies.', C ? '<i>' + cap(e.x) + '</i> is a feature every ' + e.t + ' has, so it belongs to the <b>comprehension</b>.' : '<i>' + cap(e.x) + '</i> is one of the things the term applies to, so it belongs to the <b>extension</b>.'],
        'Is it a thing the word names, or a feature the word implies?', { kind: 'ext', k: e.k });
    }
    var ch = R.pick(CHAINS), n = ch.length, idx = R.sample(U_range(n), Math.min(n, L === 1 ? 2 : 3)).sort(), picks = idx.map(function (i) { return ch[i]; });
    if (r < 0.75) {
      var wantExt = R.coin(), right = wantExt ? picks[0] : picks[picks.length - 1];
      return P('Which of these terms has the ' + (wantExt ? 'greatest <b>extension</b>' : 'greatest <b>comprehension</b>') + '?', mc(cap(right), picks.filter(function (p) { return p !== right; }).map(cap)),
        ['Each narrower term adds a feature: ' + picks.join(' → ') + '.', wantExt ? 'Extension counts the things a term applies to. Every one of the ' + picks[picks.length - 1] + ' is also one of the ' + picks[0] + ', so <i>' + right + '</i> applies to the most things.' : 'Comprehension counts the features a term implies. <i>' + cap(right) + '</i> implies every feature of the wider terms plus more, so it has the greatest comprehension.'],
        wantExt ? 'Which term applies to the most things?' : 'Which term tells you the most about a thing?', { kind: 'ext-order', chain: picks, want: wantExt ? 'ext' : 'comp', answer: right });
    }
    var i = R.int(0, n - 2), wide = ch[i], narrow = ch[i + 1];
    var choices = ['Comprehension grows; extension shrinks or stays the same', 'Both grow', 'Both shrink', 'Comprehension shrinks; extension grows'];
    return P('Moving from the term <i>' + wide + '</i> to the term <i>' + narrow + '</i> adds a feature. What happens to comprehension and extension?', mc(choices[0], choices.slice(1)),
      ['<i>' + cap(narrow) + '</i> implies everything <i>' + wide + '</i> implies, plus one more feature: the comprehension grows.', 'Only some ' + wide + ' have that extra feature, so fewer things fit (or, at most, the same things): the extension shrinks or stays the same.'],
      'More features means fewer things that have all of them.', { kind: 'ext-move' });
  });
  function U_range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

  G('trad.genus-species', function (R, ctx) {
    var L = lvl(ctx), ch = R.pick(CHAINS.filter(function (c) { return c.length >= (L === 1 ? 2 : 3); })), r = R.next();
    if (L >= 2 && r < 0.45) {
      var i = R.int(1, ch.length - 2), mid = ch[i], up = ch[i - 1], down = ch[i + 1];
      var right = 'A species of ' + up + ' and a genus of ' + down, wr = ['A genus of ' + up + ' and a species of ' + down, 'Only a genus, never a species', 'Only a species, never a genus'];
      return P('In logic, how is <i>' + mid + '</i> related to <i>' + up + '</i> and to <i>' + down + '</i>?', mc(right, wr),
        ['Genus and species are relative: a genus is a wider class, a species a narrower class within it.', 'All ' + mid + ' are ' + up + ', but not all ' + up + ' are ' + mid + ': so ' + mid + ' is a <b>species</b> of ' + up + '.', 'All ' + down + ' are ' + mid + ', but not the other way around: so ' + mid + ' is a <b>genus</b> of ' + down + '.'],
        'Compare the classes two at a time: which one is wider?', { kind: 'gs-mid', chain: ch, i: i });
    }
    var j = R.int(0, ch.length - 2), g = ch[j], s = ch[j + 1], askGenus = R.coin();
    if (askGenus) {
      var others = CHAINS.filter(function (c) { return c !== ch; }), wr2 = [s].concat(R.sample(others, 2).map(function (c) { return c[R.int(0, c.length - 1)]; }));
      return P('Which class is the <b>genus</b> of which <i>' + s + '</i> is a species?', mc(cap(g), wr2.map(cap)),
        ['A genus is a wider class that contains the species.', 'Every one of the ' + s + ' is one of the ' + g + ', and there are ' + g + ' that are not ' + s + '. So <i>' + g + '</i> is the genus.'],
        'Which class contains every one of the ' + s + '?', { kind: 'gs-genus', g: g, s: s });
    }
    return P('Relative to <i>' + g + '</i>, are <i>' + s + '</i> a genus or a species?', keep(['Genus', 'Species'], 1),
      ['Every one of the ' + s + ' is one of the ' + g + ', but not the other way around.', 'So <i>' + s + '</i> is the narrower class: a <b>species</b> of ' + g + '.'],
      'The species is the narrower class.', { kind: 'gs-which', g: g, s: s });
  });

  var PRED = ['Genus', 'Species (the whole definition)', 'Specific difference', 'Property', 'Accident'];
  var PRED_WHY = ['It names the wider class the subject belongs to.', 'It gives the whole essence: the genus together with the difference.', 'It is the feature that sets this species apart within its genus.',
    'It is not part of the definition, but it follows from what the thing is, so every one of them has it.', 'It may or may not belong to the subject; the subject would be the same kind of thing without it.'];
  var PREDICABLES = [
    { s: 'human being', items: [['is an animal', 0], ['is a rational animal', 1], ['is rational', 2], ['is able to learn a language', 3], ['is able to laugh', 3], ['is tall', 4], ['is wearing a blue coat', 4], ['lives in a city', 4]] },
    { s: 'triangle', items: [['is a polygon', 0], ['is a three-sided polygon', 1], ['is three-sided', 2], ['has angles that add up to 180°', 3], ['is drawn in red ink', 4], ['is 5 cm tall', 4]] },
    { s: 'square', items: [['is a rectangle', 0], ['is a rectangle with four equal sides', 1], ['has four equal sides (among rectangles)', 2], ['has diagonals that cross at right angles', 3], ['is printed on a game board', 4], ['is painted blue', 4]] },
    { s: 'even number', items: [['is an integer', 0], ['is an integer divisible by 2', 1], ['is divisible by 2', 2], ['has a square that is even', 3], ['is one more than an odd number', 3], ['is written on the whiteboard', 4]] },
    { s: 'rectangle', items: [['is a parallelogram', 0], ['is a parallelogram with a right angle', 1], ['has a right angle (among parallelograms)', 2], ['has diagonals of equal length', 3], ['is drawn on graph paper', 4], ['is 4 cm long', 4]] },
    { s: 'odd number', items: [['is an integer', 0], ['is an integer not divisible by 2', 1], ['is not divisible by 2', 2], ['has a square that is odd', 3], ['is printed on a soccer jersey', 4]] },
    { s: 'circle', items: [['is a plane figure', 0], ['is a plane figure whose points are all the same distance from a center', 1], ['has all its points the same distance from a center', 2], ['has a circumference equal to π times its diameter', 3], ['is drawn with a compass', 4], ['is 3 inches across', 4]] }
  ];
  G('trad.predicables', function (R, ctx) {
    var sub = R.pick(PREDICABLES), L = lvl(ctx);
    if (R.chance(0.4)) {
      var want = L === 1 ? R.pick([0, 3, 4]) : R.int(0, 4), right = R.pick(sub.items.filter(function (x) { return x[1] === want; }));
      var others = R.sample(sub.items.filter(function (x) { return x[1] !== want; }).filter(function (x, i, arr) { return arr.findIndex(function (y) { return y[1] === x[1]; }) === i; }), 3);
      return P('Which predicate is said of ' + (/^[aeiou]/.test(sub.s) ? 'an' : 'a') + ' <b>' + sub.s + '</b> as its <b>' + PRED[want].toLowerCase().replace(/ \(.*/, '') + '</b>?', mc(cap(right[0]), others.map(function (x) { return cap(x[0]); })),
        ['<i>' + cap(right[0]) + '</i>: ' + low(PRED_WHY[want])].concat(others.map(function (x) { return '<i>' + cap(x[0]) + '</i> is its ' + PRED[x[1]].toLowerCase().replace(/ \(.*/, '') + '.'; })),
        'Genus: the wider class. Difference: what sets it apart. Property: follows from it. Accident: could be missing.', { kind: 'predicable-pick', k: want });
    }
    var pool = sub.items.filter(function (x) { return L >= 2 || x[1] === 0 || x[1] === 3 || x[1] === 4; }), it0 = R.pick(pool);
    var k = it0[1], steps = [PRED_WHY[k]];
    if (k === 3) steps.push('A property is easy to mistake for an accident, but an accident could be absent: a property comes with the kind of thing it is.');
    if (k === 4) steps.push('Every ' + sub.s + ' could lack it and still be a ' + sub.s + ', so it is an accident.');
    steps.push('So <i>' + it0[0] + '</i> is predicated of the subject as its <b>' + PRED[k].toLowerCase().replace(/ \(.*/, '') + '</b>.');
    return P('Subject: <b>' + sub.s + '</b>. Predicate: <i>' + it0[0] + '</i>. Which predicable is it?', keep(PRED, k), steps,
      'Is it part of the definition, does it follow from the definition, or could it be missing?', { kind: 'predicable', k: k });
  });

  var DIVS = [
    { g: 'triangles', parts: 'acute, right and obtuse triangles', k: 0, by: 'the size of the largest angle' },
    { g: 'whole numbers', parts: 'even numbers and odd numbers', k: 0, by: 'the remainder when divided by 2' },
    { g: 'high school students', parts: 'freshmen, sophomores, juniors and seniors', k: 0, by: 'year in school' },
    { g: 'library books', parts: 'fiction and nonfiction', k: 0, by: 'whether the book tells an invented story' },
    { g: 'days of the week', parts: 'weekdays and weekend days', k: 0, by: 'whether the day falls on Saturday or Sunday' },
    { g: 'books', parts: 'novels, hardcovers and library books', k: 1, by: 'three principles at once: kind of writing, binding and owner' },
    { g: 'dogs', parts: 'puppies, beagles and pets', k: 1, by: 'three principles at once: age, breed and whether someone owns the dog' },
    { g: 'shoes', parts: 'sneakers, red shoes and boots', k: 1, by: 'two principles at once: style and color' },
    { g: 'students', parts: 'athletes, seniors and musicians', k: 1, by: 'three principles at once: sport, year and music' },
    { g: 'fruits', parts: 'apples, tropical fruits and dried fruits', k: 1, by: 'three principles at once: kind of plant, climate and preparation' },
    { g: 'vehicles', parts: 'cars and trucks', k: 2, miss: 'bicycles and buses' }, { g: 'pets', parts: 'dogs and cats', k: 2, miss: 'goldfish and parakeets' },
    { g: 'triangles', parts: 'right triangles and obtuse triangles', k: 2, miss: 'acute triangles' }, { g: 'meals', parts: 'breakfasts and lunches', k: 2, miss: 'dinners and snacks' },
    { g: 'musical instruments', parts: 'string instruments and brass instruments', k: 2, miss: 'drums and flutes' },
    { g: 'a bicycle', parts: 'frame, wheels, chain and handlebars', k: 3, lv: 3 }, { g: 'a house', parts: 'roof, walls, floors and doors', k: 3, lv: 3 }
  ];
  G('trad.division', function (R, ctx) {
    var L = lvl(ctx), d = bank(R, ctx, DIVS);
    if (R.chance(0.35)) {
      var good = DIVS.filter(function (x) { return x.k === 0; }), g = R.pick(good);
      if (R.coin()) {
        var miss = R.pick(DIVS.filter(function (x) { return x.k === 2; }));
        return P('This division is not exhaustive. What does it leave out?' + box(['<b>' + cap(miss.g) + '</b> into ' + miss.parts]), mc(cap(miss.miss), R.sample(DIVS.filter(function (x) { return x.k === 2 && x !== miss; }), 3).map(function (x) { return cap(x.miss); })),
          ['A division must be exhaustive: every member of the genus has to fit in some part.', 'Here ' + miss.miss + ' are ' + miss.g + ' that fit in none of the parts.'], 'Think of a member of the genus that has no place to go.', { kind: 'div-miss' });
      }
      return P('What single principle divides <b>' + g.g + '</b> into ' + g.parts + '?', mc(cap(g.by), R.sample(good.filter(function (x) { return x !== g; }), 3).map(function (x) { return cap(x.by); })),
        ['A good division uses one principle all the way through.', 'Here it is ' + g.by + ': each of the ' + g.g + ' falls in exactly one part.'], 'What question sorts each member into one part?', { kind: 'div-by' });
    }
    var ch = ['A good division', 'Not good: it mixes principles, so the parts overlap', 'Not good: it leaves members out', 'Not a logical division: it lists parts, not kinds'];
    if (L < 3) ch = ch.slice(0, 3);
    var steps = [
      ['One principle is used (' + d.by + '), the parts do not overlap, and every one of the ' + d.g + ' fits in exactly one part.', 'So it is a good division: exclusive and exhaustive.'],
      ['It uses ' + d.by + '.', 'So the parts overlap: one thing can fall in two parts, and some may fit in none.'],
      ['The parts do not overlap, but they do not cover the whole genus: ' + d.miss + ' are left out.', 'A division must be exhaustive, so this one is not good.'],
      ['Logical division splits a class into kinds (species), and each kind is still a ' + d.g.replace(/^an? /, '') + '.', 'The ' + d.parts.split(',')[0] + ' is not a kind of ' + d.g.replace(/^an? /, '') + ': these are the physical parts of one thing, so this is a partition, not a logical division.']
    ][d.k];
    return P('Is this a good logical division?' + box(['<b>' + cap(d.g) + '</b> into ' + d.parts]), keep(ch, d.k), steps,
      'Check three things: one principle, no overlap, nothing left out.', { kind: 'division', k: d.k });
  });

  // =================================================================== Unit 2: Categorical Propositions
  var CP_BANK = [
    { s: 'whales', p: 'mammals that breathe air', f: 'A' }, { s: 'students in the chess club', p: 'members of the band', f: 'E' },
    { s: 'books on the top shelf', p: 'novels by Jane Austen', f: 'I' }, { s: 'players on the team', p: 'players who started last year', f: 'O' },
    { s: 'squares', p: 'rectangles with four equal sides', f: 'A' }, { s: 'planets in our solar system', p: 'stars', f: 'E' },
    { s: 'dogs at the shelter', p: 'puppies under one year old', f: 'I' }, { s: 'fruits in the bowl', p: 'ripe fruits', f: 'O' },
    { s: 'students who finished the quiz', p: 'students who may leave early', f: 'A' }, { s: 'vegetables in this garden', p: 'plants that need full shade', f: 'E' },
    { s: 'songs on the playlist', p: 'songs from the 1990s', f: 'I' }, { s: 'bridges in the city', p: 'bridges open to trucks', f: 'O' }
  ];
  function cpItem(R) {
    if (R.chance(0.6)) return R.pick(CP_BANK);
    var t = R.sample(PEOPLE, 2); return { s: pl(t[0]), p: pl(t[1]), f: R.pick(FORMS) };
  }
  G('trad.categorical-propositions', function (R, ctx) {
    var L = lvl(ctx), x = cpItem(R), st = cat(x.f, x.s, x.p), ask = R.pick(L === 1 ? ['s', 'p', 'q'] : ['s', 'p', 'p', 'q', 'c']);
    var q = 'In the proposition below, what is the ', a, steps, last = x.p.split(' ').pop(), first = x.p.split(' ')[0];
    var quant = { A: 'All', E: 'No', I: 'Some', O: 'Some' }[x.f], cop = x.f === 'O' ? 'are not' : 'are';
    var parts = 'Quantifier <b>' + quant + '</b>, subject term <b>' + x.s + '</b>, copula <b>' + cop + '</b>, predicate term <b>' + x.p + '</b>.';
    if (ask === 's') { q += '<b>subject term</b>?'; a = mc(x.s, [x.s.split(' ')[0], quant.toLowerCase() + ' ' + x.s, x.p]); steps = ['The subject term is the whole phrase between the quantifier and the copula, however many words it has.', parts]; }
    else if (ask === 'p') { q += '<b>predicate term</b>?'; a = mc(x.p, [last !== x.p ? last : x.s, first !== x.p && first !== last ? first : cop + ' ' + x.p, cop + ' ' + x.p, x.s]); steps = ['The predicate term is the whole phrase after the copula (are or are not).', parts]; }
    else if (ask === 'q') { q += '<b>quantifier</b>?'; a = keep(['All', 'No', 'Some'], ['All', 'No', 'Some'].indexOf(quant)); steps = ['The quantifier is the first word and tells how much of the subject class the statement covers.', parts]; }
    else { q += '<b>copula</b>?'; a = keep(['are', 'are not', quant.toLowerCase()], x.f === 'O' ? 1 : 0); steps = ['The copula joins the subject term to the predicate term: <i>are</i>, or <i>are not</i> in an O statement.' + (x.f === 'E' ? ' In an E statement the "no" belongs to the quantifier, so the copula is just <i>are</i>.' : ''), parts]; }
    return P(q + box([st]), a, steps, 'Split it into four parts: quantifier, subject term, copula, predicate term.', { kind: 'parts', f: x.f, s: x.s, p: x.p, ask: ask });
  });

  G('trad.aeio', function (R, ctx) {
    var L = lvl(ctx), t = R.sample(PEOPLE, 2), S = pl(t[0]), Pp = pl(t[1]), f = R.pick(FORMS), r = R.next();
    if (L >= 2 && r < 0.3) {
      var SOME = [
        { q: 'Every one of the ' + S + ' is one of the ' + Pp + ', and there are ' + S + '. Then <i>Some ' + S + ' are ' + Pp + '</i> is true.', v: true, why: '"Some" means at least one. There is at least one of the ' + S + ', and it is one of the ' + Pp + ', so the statement is true, even though all of them are.' },
        { q: '<i>Some ' + S + ' are ' + Pp + '</i> tells you that some ' + S + ' are not ' + Pp + '.', v: false, why: 'In logic, "some" means "at least one", not "some but not all". The statement leaves open that all ' + S + ' are ' + Pp + '.' },
        { q: 'Exactly one of the ' + S + ' is one of the ' + Pp + '. Then <i>Some ' + S + ' are ' + Pp + '</i> is true.', v: true, why: '"Some" means at least one, and one is enough.' },
        { q: '<i>Some ' + S + ' are not ' + Pp + '</i> tells you that some ' + S + ' are ' + Pp + '.', v: false, why: 'The O statement says at least one of the ' + S + ' is outside the ' + Pp + '. It allows that none of the ' + S + ' are ' + Pp + '.' }
      ], it0 = R.pick(SOME);
      return P('True or false: ' + it0.q, tf(it0.v), [it0.why, 'So the statement is <b>' + (it0.v ? 'true' : 'false') + '</b>.'],
        'In logic, "some" means "at least one".', { kind: 'some', v: it0.v });
    }
    var st = cat(f, S, Pp);
    if (r < 0.55) return P('Which form is this proposition?' + box([st]), keep(['A', 'E', 'I', 'O'], FORMS.indexOf(f)),
      ['The quantifier is ' + st.split(' ')[0].toLowerCase() + (f === 'O' ? ' and the copula is negative (are not)' : '') + '.', 'All … are = A, No … are = E, Some … are = I, Some … are not = O.', 'So it is an <b>' + f + '</b> proposition (' + FDESC[f] + ').'],
      'Look at the quantifier and whether the copula has "not".', { kind: 'letter', f: f, st: st });
    if (r < 0.8) return P('What are the quantity and quality of this proposition?' + box([st]), keep(['Universal affirmative', 'Universal negative', 'Particular affirmative', 'Particular negative'], FORMS.indexOf(f)),
      ['Quantity: "all" and "no" are universal (about every member of the subject class); "some" is particular.', 'Quality: affirmative includes the subject in the predicate; negative excludes it.', 'This is an ' + f + ' proposition: <b>' + FDESC[f] + '</b>.'],
      'Quantity asks "all or some?"; quality asks "is or is not?".', { kind: 'qq', f: f, st: st });
    var wr = FORMS.filter(function (g) { return g !== f; }).map(function (g) { return cat(g, S, Pp); });
    return P('Which statement is the <b>' + f + '</b> proposition (' + FDESC[f] + ') with subject <i>' + S + '</i> and predicate <i>' + Pp + '</i>?', mc(st, wr),
      ['A: All S are P. E: No S are P. I: Some S are P. O: Some S are not P.', 'With these terms the ' + f + ' form is <i>' + st + '</i>.'], 'A and I affirm; E and O deny.', { kind: 'build', f: f, st: st });
  });

  // everyday wordings: f is the standard form; s, p filled from a [singular, plural] pair
  var VERB = { singer: 'sings', runner: 'runs', swimmer: 'swims', dancer: 'dances', painter: 'paints', reader: 'reads', hiker: 'hikes', baker: 'bakes', gardener: 'gardens', camper: 'camps', skater: 'skates', juggler: 'juggles', climber: 'climbs', golfer: 'golfs', knitter: 'knits', drummer: 'drums', sailor: 'sails' };
  var VERBNEG = { sings: 'sing', runs: 'run', swims: 'swim', dances: 'dance', paints: 'paint', reads: 'read', hikes: 'hike', bakes: 'bake', gardens: 'garden', camps: 'camp', skates: 'skate', juggles: 'juggle', climbs: 'climb', golfs: 'golf', knits: 'knit', drums: 'drum', sails: 'sail' };
  var WORDINGS = [
    { f: 'A', w: 'Every {s} is {pa}.' }, { f: 'A', w: 'Any {s} is {pa}.' }, { f: 'A', w: 'Whoever is {sa} is {pa}.', lv: 2 }, { f: 'A', w: '{Sp} are {Pp}.', lv: 2, note: 'A plural with no quantifier usually means all of them.' },
    { f: 'A', w: 'If someone is {sa}, then that person is {pa}.', lv: 3 }, { f: 'A', w: 'Every {s} {verb}.', verb: true },
    { f: 'E', w: 'No {s} is {pa}.' }, { f: 'E', w: 'None of the {Sp} are {Pp}.' }, { f: 'E', w: '{Sp} are never {Pp}.', lv: 2 }, { f: 'E', w: 'Not a single {s} is {pa}.', lv: 2 },
    { f: 'E', w: 'No {s} {verb}.', verb: true, lv: 2 },
    { f: 'I', w: 'A few {Sp} are {Pp}.' }, { f: 'I', w: 'There are {Sp} who are {Pp}.' }, { f: 'I', w: 'At least one {s} is {pa}.' }, { f: 'I', w: 'Many {Sp} are {Pp}.', lv: 2, note: '"Many" and "most" become "some": the standard form keeps only "at least one".' },
    { f: 'I', w: 'Most {Sp} are {Pp}.', lv: 3, note: '"Many" and "most" become "some": the standard form keeps only "at least one".' }, { f: 'I', w: 'Some {Sp} {verbpl}.', verb: true, lv: 2 },
    { f: 'O', w: 'Not every {s} is {pa}.' }, { f: 'O', w: 'Not all {Sp} are {Pp}.' }, { f: 'O', w: 'A few {Sp} are not {Pp}.' }, { f: 'O', w: 'There are {Sp} who are not {Pp}.', lv: 2 },
    { f: 'O', w: 'All {Sp} are not {Pp}.', lv: 3, note: '"All S are not P" usually means "not all S are P", as in "All that glitters is not gold". Read that way it is an O statement.' },
    { f: 'O', w: 'Not every {s} {verb}.', verb: true, lv: 3, neg: true }
  ];
  var NAMES = ['Maya', 'Leo', 'Priya', 'Sam', 'Grandpa Joe', 'Aunt Rosa', 'Kenji', 'Ava', 'Omar', 'Lena'];
  function fillW(w, sT, pT) {
    var verb = VERB[bare(pT)];
    return w.replace('{sa}', sg(sT)).replace('{s}', bare(sT)).replace('{pa}', sg(pT)).replace('{Sp}', pl(sT)).replace('{Pp}', pl(pT)).replace('{verbpl}', verb ? VERBNEG[verb] : '').replace('{verb}', verb || '').replace(/^(\w)/, function (c) { return c.toUpperCase(); });
  }
  G('trad.translating-nonstandard', function (R, ctx) {
    var L = lvl(ctx);
    if (L >= 2 && R.chance(0.25)) { // singular statements
      var nm = R.pick(NAMES), t = R.pick(PEOPLE), neg = R.coin(), cls = 'people identical to ' + nm;
      var sent = nm + (neg ? ' is not ' : ' is ') + sg(t) + '.', right = cat(neg ? 'E' : 'A', cls, pl(t));
      return P('Which is the standard form of this statement?' + box([sent]), mc(right, [cat(neg ? 'O' : 'I', cls, pl(t)), cat(neg ? 'A' : 'E', cls, pl(t)), cat(neg ? 'O' : 'I', pl(t), cls)]),
        ['A singular statement is about exactly one thing, so it is about all of a one-member class: <i>' + cls + '</i>.', 'It ' + (neg ? 'denies' : 'affirms') + ' the predicate of every member of that class, so it is a universal ' + (neg ? 'negative (E)' : 'affirmative (A)') + ': <i>' + right + '</i>.'],
        'A statement about one named thing covers all of a class with one member.', { kind: 'trans', f: neg ? 'E' : 'A', s: cls, p: pl(t), answer: right });
    }
    var pool = WORDINGS.filter(function (x) { return (x.lv || 1) <= L; }), w = R.chance(0.55) ? R.pick(pool.filter(function (x) { return (x.lv || 1) === L; }).concat(L === 1 ? pool : [])) : R.pick(pool);
    var sT, pT, tries = 0;
    do { var two = R.sample(PEOPLE, 2); sT = two[0]; pT = two[1]; tries++; } while (w.verb && !VERB[bare(pT)] && tries < 40);
    if (w.verb && !VERB[bare(pT)]) { w = WORDINGS[0]; }
    var sent = fillW(w.w, sT, pT), S = pl(sT), Pp = pl(pT), right = cat(w.f, S, Pp);
    var wr = FORMS.filter(function (g) { return g !== w.f; }).map(function (g) { return cat(g, S, Pp); });
    if (w.f === 'E' || w.f === 'O') wr[0] = 'All ' + S + ' are not ' + Pp;
    var steps = ['The subject term is <i>' + S + '</i> and the predicate term is <i>' + Pp + '</i>' + (w.verb ? ' (the verb becomes "are" plus a class: those who ' + VERBNEG[VERB[bare(pT)]] + ' are ' + Pp + ')' : '') + '.'];
    if (w.note) steps.push(w.note);
    steps.push({ A: 'It says every one of the ' + S + ' is included in the ' + Pp + ': an A statement.', E: 'It says none of the ' + S + ' is among the ' + Pp + ': an E statement, written "No S are P" (never "All S are not P").', I: 'It says at least one of the ' + S + ' is among the ' + Pp + ': an I statement.', O: 'It says at least one of the ' + S + ' is not among the ' + Pp + ': an O statement.' }[w.f]);
    steps.push('Standard form: <i>' + right + '</i>.');
    return P('Which is the standard form of this statement?' + box([sent]), mc(right, wr), steps, 'Decide first: about all of them or some of them? Including or excluding?', { kind: 'trans', f: w.f, s: S, p: Pp, answer: right });
  });

  var ONLY_PAIRS = [['ticket holders', 'people allowed backstage'], ['club members', 'voters at the club meeting'], ['seniors', 'students who may park on campus'],
    ['students with a library card', 'people who may borrow books'], ['players over twelve', 'players in the advanced league'], ['adults', 'people who may use the hot tub'],
    ['registered runners', 'people who get a race shirt'], ['students who finished the project', 'students going on the field trip']];
  G('trad.only-exceptives', function (R, ctx) {
    var L = lvl(ctx), pr = R.chance(0.6) ? R.pick(ONLY_PAIRS) : R.sample(PEOPLE, 2).map(pl), X = pr[0], Y = pr[1];
    var kinds = L === 1 ? ['only', 'nonebut'] : L === 2 ? ['only', 'nonebut', 'theonly', 'only'] : ['only', 'theonly', 'except', 'nonebut', 'except'];
    var k = R.pick(kinds), sent, right, wr, steps;
    if (k === 'only' || k === 'nonebut') {
      sent = (k === 'only' ? 'Only ' : 'None but ') + X + ' are ' + Y + '.'; right = cat('A', Y, X);
      wr = [cat('A', X, Y), cat('I', Y, X), cat('E', X, Y)];
      steps = ['"' + (k === 'only' ? 'Only' : 'None but') + '" marks the class that every member of the other class must belong to: here, <i>' + X + '</i>.', 'So the statement says every one of the ' + Y + ' is one of the ' + X + ' (it does not say every one of the ' + X + ' is one of the ' + Y + ').', 'Swap the terms and write "All": <i>' + right + '</i>.'];
    } else if (k === 'theonly') {
      sent = 'The only ' + X + ' are ' + Y + '.'; right = cat('A', X, Y);
      wr = [cat('A', Y, X), cat('I', X, Y), cat('E', X, Y)];
      steps = ['"The only" is not the same as "only": it comes before the subject class.', 'The statement says every one of the ' + X + ' is one of the ' + Y + ', so keep the order: <i>' + right + '</i>.'];
    } else {
      sent = 'All except ' + X + ' are ' + Y + '.'; right = cat('A', 'non-' + X, Y) + ', and ' + low(cat('E', X, Y));
      wr = [cat('A', 'non-' + X, Y) + ' (only)', cat('E', X, Y) + ' (only)', cat('A', Y, 'non-' + X) + ', and ' + low(cat('A', X, Y))];
      steps = ['An exceptive statement makes two claims.', 'Everyone who is not one of the ' + X + ' is one of the ' + Y + ': <i>' + cat('A', 'non-' + X, Y) + '</i>.', 'And the ' + X + ' are the exception: <i>' + cat('E', X, Y) + '</i>.'];
    }
    return P('Which is the standard form of this statement?' + box([sent]), mc(right, wr), steps, k === 'except' ? 'An exceptive says two things: about the others, and about the exceptions.' : 'Ask which class has to be inside which.', { kind: 'only', k: k, X: X, Y: Y, answer: right });
  });

  G('trad.distribution', function (R, ctx) {
    var L = lvl(ctx), t = R.sample(PEOPLE, 2), S = pl(t[0]), Pp = pl(t[1]), f = R.pick(FORMS), st = cat(f, S, Pp), d = LG().distributed(f);
    var why = { A: 'It speaks about every one of the ' + S + ' (each is among the ' + Pp + '), but only about some of the ' + Pp + '.', E: 'It shuts every one of the ' + S + ' out of the whole class of ' + Pp + ', so it speaks about every member of both classes.', I: 'It speaks about at least one of the ' + S + ' and at least one of the ' + Pp + ', so about every member of neither.', O: 'It speaks about only some of the ' + S + ', but it shuts them out of the whole class of ' + Pp + ': so it says something about every one of the ' + Pp + '.' }[f];
    if (L >= 2 && R.coin()) {
      var which = R.coin() ? 's' : 'p', term = which === 's' ? S : Pp;
      return P('True or false: in the proposition below, the term <i>' + term + '</i> is distributed.' + box([st]), tf(d[which]), [why, distWords(f) + ', so <i>' + term + '</i> is ' + (d[which] ? '' : 'not ') + 'distributed: <b>' + (d[which] ? 'true' : 'false') + '</b>.'],
        'A term is distributed when the statement says something about every member of its class.', { kind: 'dist1', f: f, which: which, v: d[which] });
    }
    var k = d.s && d.p ? 2 : d.s ? 0 : d.p ? 1 : 3;
    return P('Which terms are distributed in this proposition?' + box([st]), keep(['The subject term only', 'The predicate term only', 'Both terms', 'Neither term'], k), [why, distWords(f) + '.'],
      'Ask of each term: does the statement say something about every member of that class?', { kind: 'dist', f: f, k: k });
  });

  G('trad.venn-propositions', function (R, ctx) {
    var L = lvl(ctx), t = R.sample(PEOPLE, 2), S = pl(t[0]), Pp = pl(t[1]);
    if (R.chance(L === 1 ? 0.55 : 0.4)) {
      var f = R.pick(FORMS), st = cat(f, S, Pp);
      var opts = ['Shade region 1', 'Shade region 2', 'Shade region 3', 'Put an X in region 1', 'Put an X in region 2', 'Put an X in region 3'];
      var k = { A: 0, E: 1, I: 4, O: 3 }[f];
      var region = { A: 'region 1 (' + S + ' that are not ' + Pp + ')', E: 'region 2 (' + S + ' that are ' + Pp + ')', I: 'region 2 (' + S + ' that are ' + Pp + ')', O: 'region 1 (' + S + ' that are not ' + Pp + ')' }[f];
      return P('How do you diagram <i>' + st + '</i>? Use the region numbers in the picture.', keep(opts, k),
        [f === 'A' || f === 'E' ? 'A universal statement says a region is empty, so it is shown by shading.' : 'A particular statement says something is there, so it is shown with an X.',
          f === 'A' ? 'It says no ' + S + ' are outside the ' + Pp + ': ' + region + ' is empty.' : f === 'E' ? 'It says no ' + S + ' are inside the ' + Pp + ': ' + region + ' is empty.' : 'It says at least one thing is in ' + region + '.',
          '<b>' + opts[k] + '</b>.'],
        'Shade means empty; X means at least one.', { kind: 'venn-how', f: f, k: k }, { name: 'lg-venn3', opts: { terms: [S, Pp], circles: 2, shade: [], xs: [], numbers: true, quiet: true, interactive: false } });
    }
    // read a diagram: which statement does it show?
    var cases = [{ f: 'A', s: S, p: Pp, shade: [1], xs: [] }, { f: 'E', s: S, p: Pp, shade: [3], xs: [] }, { f: 'I', s: S, p: Pp, shade: [], xs: [[3]] }, { f: 'O', s: S, p: Pp, shade: [], xs: [[1]] }];
    if (L >= 2) cases.push({ f: 'A', s: Pp, p: S, shade: [2], xs: [] }, { f: 'O', s: Pp, p: S, shade: [], xs: [[2]] });
    var c = R.pick(cases), right = cat(c.f, c.s, c.p);
    var wr = [cat('A', S, Pp), cat('E', S, Pp), cat('I', S, Pp), cat('O', S, Pp), cat('A', Pp, S), cat('O', Pp, S)].filter(function (x) { return x !== right; });
    var nums = c.shade.length ? c.shade.map(function (r) { return R2NUM[r]; }) : c.xs[0].map(function (r) { return R2NUM[r]; });
    var desc = { 1: S + ' that are not ' + Pp, 2: S + ' that are ' + Pp, 3: Pp + ' that are not ' + S }[nums[0]];
    return P('The left circle is <i>' + S + '</i> and the right circle is <i>' + Pp + '</i>. Which statement does the diagram show?', mc(right, R.sample(wr, 3)),
      [(c.shade.length ? 'Region ' + nums[0] + ' (' + desc + ') is shaded: it is empty.' : 'There is an X in region ' + nums[0] + ' (' + desc + '): at least one thing is there.'),
        c.shade.length ? 'Saying that region ' + nums[0] + ' is empty is the same as saying <i>' + right + '</i>.' : 'Saying that something is in region ' + nums[0] + ' is the same as saying <i>' + right + '</i>.'],
      'Shading says a region is empty; an X says something is there.', { kind: 'venn-read', terms: [S, Pp], shade: c.shade, xs: c.xs, answer: right },
      { name: 'lg-venn3', opts: { terms: [S, Pp], circles: 2, shade: c.shade, xs: c.xs, numbers: true, quiet: true, interactive: false } });
  });

  var EMPTY = ['unicorns', 'dragons', 'students who scored 120 on a 100-point quiz', 'square circles', 'people who have walked on Mars', 'talking dogs', 'mermaids', 'cats that have climbed Mount Everest'];
  var EPRED = ['white creatures', 'friendly creatures', 'creatures with wings', 'good swimmers', 'shy creatures', 'fast runners'];
  G('trad.existential-import', function (R, ctx) {
    var L = lvl(ctx), r = R.next();
    if (r < 0.45) {
      var S = R.pick(EMPTY), Pp = R.pick(EPRED), f = R.pick(FORMS), st = cat(f, S, Pp), v = f === 'A' || f === 'E';
      return P('There are no ' + S + '. On the modern (Boolean) reading, is this statement true or false?' + box([st]), keep(['True', 'False'], v ? 0 : 1),
        [v ? 'On the Boolean reading a universal statement only says a region is empty: ' + (f === 'A' ? 'there are no ' + S + ' that are not ' + Pp : 'there are no ' + S + ' that are ' + Pp) + '.' : 'A particular statement says there is at least one of the ' + S + ' ' + (f === 'I' ? 'among' : 'outside') + ' the ' + Pp + '.',
          v ? 'With no ' + S + ' at all, that region is certainly empty, so the statement is <b>true</b>.' : 'There are no ' + S + ' at all, so the statement is <b>false</b>.'],
        'Universal statements shade (say "empty"); particular ones place an X (say "there is").', { kind: 'empty', f: f, v: v });
    }
    var t = R.sample(PEOPLE, 2), S2 = pl(t[0]), P2 = pl(t[1]), f2 = R.pick(FORMS), st2 = cat(f2, S2, P2), trad = L >= 2 && R.coin();
    var v2 = trad ? true : (f2 === 'I' || f2 === 'O');
    return P('On the ' + (trad ? 'traditional (Aristotelian)' : 'modern (Boolean)') + ' reading, does this statement imply that there is at least one of the ' + S2 + '?' + box([st2]), keep(['Yes', 'No'], v2 ? 0 : 1),
      [trad ? 'The traditional reading assumes the subject class of every statement has members (it has existential import), so <b>yes</b>.' : (v2 ? 'A particular statement says there is at least one ' + bare(t[0]) + ' ' + (f2 === 'I' ? 'who is' : 'who is not') + ' one of the ' + P2 + ', so <b>yes</b>.' : 'On the Boolean reading a universal statement only says a region is empty; it would still be true if there were no ' + S2 + ' at all. So <b>no</b>.')],
      'Particular statements (I, O) always assert that something exists.', { kind: 'import', f: f2, trad: trad, v: v2 });
  });

  // =================================================================== Unit 3: The Square of Opposition
  var CORNER_POS = { A: 'top left', E: 'top right', I: 'bottom left', O: 'bottom right' };
  var REL = { AO: 'Contradictories', EI: 'Contradictories', AE: 'Contraries', IO: 'Subcontraries', AI: 'Subalterns', EO: 'Subalterns' };
  function relOf(a, b) { return REL[a + b] || REL[b + a]; }
  var REL_WHY = { Contradictories: 'they sit on a diagonal. They differ in both quantity and quality, and exactly one of them is true.',
    Contraries: 'they are the two universals along the top. They cannot both be true, but they can both be false.',
    Subcontraries: 'they are the two particulars along the bottom. They cannot both be false, but they can both be true.',
    Subalterns: 'they share a quality, one universal above the particular below it. On the traditional square, truth flows down and falsity flows up.' };
  function sqTerms(R) { var t = R.sample(PEOPLE, 2); return { s: pl(t[0]), p: pl(t[1]) }; }
  function sqView(T2, given, more) { var o = { s: T2.s, p: T2.p, given: given, quiet: true, interactive: false }; if (more) for (var k in more) o[k] = more[k]; return { name: 'lg-square', opts: o }; }

  G('trad.square', function (R, ctx) {
    var L = lvl(ctx), T2 = sqTerms(R), r = R.next();
    if (r < 0.5) {
      var pair = R.pick([['A', 'O'], ['E', 'I'], ['A', 'E'], ['I', 'O'], ['A', 'I'], ['E', 'O']]); if (R.coin()) pair = [pair[1], pair[0]];
      var rel = relOf(pair[0], pair[1]), ch = ['Contradictories', 'Contraries', 'Subcontraries', 'Subalterns'];
      return P('How are these two statements related on the square of opposition?' + box([cat(pair[0], T2.s, T2.p), cat(pair[1], T2.s, T2.p)]), keep(ch, ch.indexOf(rel)),
        ['The first is ' + pair[0] + ' and the second is ' + pair[1] + '.', pair[0] + ' and ' + pair[1] + ' are <b>' + rel.toLowerCase() + '</b>: ' + REL_WHY[rel]],
        'Find each letter, then picture where the two corners sit.', { kind: 'rel', a: pair[0], b: pair[1], answer: rel }, L === 1 ? { name: 'lg-square', opts: { s: T2.s, p: T2.p, quiet: true, relations: false, interactive: false } } : null);
    }
    if (r < 0.75) {
      var c = R.pick(FORMS), pos = CORNER_POS[c];
      return P('Which corner of the square of opposition is at the <b>' + pos + '</b>?', keep(FORMS, FORMS.indexOf(c)),
        ['Universals go on top (A left, E right) and particulars below them (I under A, O under E).', 'So the ' + pos + ' corner is <b>' + c + '</b>: <i>' + cat(c, 'S', 'P') + '</i>.'],
        'Affirmatives on the left, negatives on the right; universals on top.', { kind: 'pos', c: c });
    }
    var c2 = R.pick(FORMS), right = cat(c2, T2.s, T2.p);
    return P('Which statement belongs at the <b>' + CORNER_POS[c2] + '</b> corner of the square for the terms <i>' + T2.s + '</i> and <i>' + T2.p + '</i>?', mc(right, FORMS.filter(function (g) { return g !== c2; }).map(function (g) { return cat(g, T2.s, T2.p); })),
      ['The ' + CORNER_POS[c2] + ' corner is ' + c2 + ' (' + FDESC[c2] + ').', 'With these terms: <i>' + right + '</i>.'], 'A top left, E top right, I bottom left, O bottom right.', { kind: 'pos2', c: c2 });
  });

  G('trad.contradictories', function (R, ctx) {
    var L = lvl(ctx), T2 = sqTerms(R), c = R.pick(FORMS), con = { A: 'O', O: 'A', E: 'I', I: 'E' }[c], st = cat(c, T2.s, T2.p);
    if (L >= 2 && R.chance(0.35)) {
      var both = R.coin();
      return P('True or false: <i>' + st + '</i> and <i>' + cat(con, T2.s, T2.p) + '</i> can both be ' + (both ? 'true' : 'false') + ' at the same time.', tf(false),
        ['They are contradictories (' + c + ' and ' + con + '): one says exactly what the other denies.', 'So exactly one of them is true: they can be neither both true nor both false. The statement is <b>false</b>.'],
        'Where do these two sit on the square?', { kind: 'contra-tf', a: c, b: con, both: both });
    }
    var others = { A: ['E', 'I'], E: ['A', 'O'], I: ['O', 'A'], O: ['I', 'E'] }[c].map(function (g) { return cat(g, T2.s, T2.p); });
    others.push(cat(c, T2.p, T2.s));
    return P('What is the contradictory of this statement?' + box([st]), mc(cat(con, T2.s, T2.p), others),
      ['Contradictories sit on the diagonals: A with O, E with I.', st + ' is ' + c + ', so its contradictory is the ' + con + ' statement with the same terms.', c === 'A' ? 'To deny that all ' + T2.s + ' are ' + T2.p + ', it is enough that one is not: the contradictory is <i>' + cat(con, T2.s, T2.p) + '</i>, not "No ' + T2.s + ' are ' + T2.p + '" (that is the contrary).' : 'The contradictory is <i>' + cat(con, T2.s, T2.p) + '</i>.'],
      'The contradictory differs in both quantity and quality.', { kind: 'contra', f: c, answer: con });
  });

  G('trad.contraries-subcontraries', function (R, ctx) {
    var L = lvl(ctx), T2 = sqTerms(R), r = R.next();
    if (r < 0.4) {
      var pair = R.pick([['A', 'E'], ['I', 'O'], ['A', 'O'], ['E', 'I']]), rel = relOf(pair[0], pair[1]);
      var ch = ['They cannot both be true, but they can both be false', 'They cannot both be false, but they can both be true', 'Exactly one of them is true'];
      var k = rel === 'Contraries' ? 0 : rel === 'Subcontraries' ? 1 : 2;
      return P('On the traditional square, what is true of this pair?' + box([cat(pair[0], T2.s, T2.p), cat(pair[1], T2.s, T2.p)]), keep(ch, k),
        [pair[0] + ' and ' + pair[1] + ' are ' + rel.toLowerCase() + '.', REL_WHY[rel].replace(/^./, function (c) { return c.toUpperCase(); })],
        'Contraries are the top pair, subcontraries the bottom pair.', { kind: 'cs-pair', a: pair[0], b: pair[1], k: k });
    }
    var c = R.pick(L === 1 ? ['A', 'E', 'I', 'O'] : ['A', 'E', 'I', 'O', 'A', 'I']), val = L === 1 ? (c === 'A' || c === 'E') : R.coin();
    if (L === 1 && (c === 'I' || c === 'O')) val = false;
    var other = { A: 'E', E: 'A', I: 'O', O: 'I' }[c], res = LG().square(c, val, false)[other];
    var rel2 = (c === 'A' || c === 'E') ? 'contraries' : 'subcontraries';
    var why = rel2 === 'contraries' ? (val ? 'Contraries cannot both be true, so ' + other + ' is false.' : 'Contraries can both be false (when some ' + T2.s + ' are ' + T2.p + ' and some are not), and the contradictories of ' + c + ' do not settle ' + other + ' either. So ' + other + ' is undetermined.')
      : (val ? 'Subcontraries can both be true (when some ' + T2.s + ' are ' + T2.p + ' and some are not). So ' + other + ' is undetermined.' : 'Subcontraries cannot both be false, so ' + other + ' is true.');
    return P('On the traditional square, <i>' + cat(c, T2.s, T2.p) + '</i> is <b>' + (val ? 'true' : 'false') + '</b>. What can you say about <i>' + cat(other, T2.s, T2.p) + '</i>?', keep(TFU, TFU.indexOf(tfu(res))),
      [c + ' and ' + other + ' are ' + rel2 + '.', why],
      rel2 === 'contraries' ? 'Contraries: not both true.' : 'Subcontraries: not both false.', { kind: 'sq', corner: c, val: val, ask: other, boolean: false, answer: res }, sqView(T2, mk(c, val)));
  });
  function mk(c, v) { var g = {}; g[c] = v; return g; }

  G('trad.subalternation', function (R, ctx) {
    var L = lvl(ctx), T2 = sqTerms(R), c = R.pick(FORMS), val = R.coin(), sub = { A: 'I', I: 'A', E: 'O', O: 'E' }[c], res = LG().square(c, val, false)[sub];
    if (L === 1 && R.chance(0.6)) { c = R.pick(['A', 'E']); val = true; sub = c === 'A' ? 'I' : 'O'; res = true; }
    var up = c === 'A' || c === 'E', why;
    if (up && val) why = 'Truth flows down: if every one of the ' + T2.s + ' ' + (c === 'A' ? 'is' : 'is not') + ' one of the ' + T2.p + ' (and there are ' + T2.s + ', as the traditional reading assumes), then some of them ' + (c === 'A' ? 'are' : 'are not') + '. So ' + sub + ' is true.';
    else if (up && !val) why = 'Falsity flows up, not down. ' + c + ' being false only tells you that ' + (c === 'A' ? 'at least one is not' : 'at least one is') + '; ' + sub + ' might be true or false. So ' + sub + ' is undetermined.';
    else if (!up && val) why = 'Truth does not flow up: "some" being true does not make "all" true. So ' + sub + ' is undetermined.';
    else why = 'Falsity flows up: if not even one of the ' + T2.s + ' ' + (c === 'I' ? 'is' : 'is not') + ' one of the ' + T2.p + ', then certainly not all of them. So ' + sub + ' is false.';
    return P('On the traditional square, <i>' + cat(c, T2.s, T2.p) + '</i> is <b>' + (val ? 'true' : 'false') + '</b>. What follows about its subaltern, <i>' + cat(sub, T2.s, T2.p) + '</i>?', keep(TFU, TFU.indexOf(tfu(res))),
      [c + ' and ' + sub + ' are subalterns: ' + (up ? c + ' is the universal above ' + sub + '.' : c + ' is the particular below ' + sub + '.'), why],
      'Truth flows down; falsity flows up.', { kind: 'sq', corner: c, val: val, ask: sub, boolean: false, answer: res }, sqView(T2, mk(c, val)));
  });

  function sqWhy(c, val, ask, T2, boolean) {
    var con = { A: 'O', O: 'A', E: 'I', I: 'E' };
    var v = LG().square(c, val, boolean)[ask], rel = relOf(c, ask);
    if (rel === 'Contradictories') return ask + ' is the contradictory of ' + c + ', so it has the opposite value: ' + tfu(v).toLowerCase() + '.';
    if (boolean) return 'On the modern square only the contradictory diagonals hold, and ' + ask + ' is not the contradictory of ' + c + '. So ' + ask + ' is undetermined.';
    var cv = !val, cc = con[c]; // the contradictory of the given corner
    if (v === null) return noInfo(c, val, ask) + ' ' + cap(noInfo(cc, cv, ask)) + ' So ' + ask + ' is undetermined.';
    // find a relation that settles it
    if (rel === 'Contraries') return 'Contraries cannot both be true; ' + c + ' is true, so ' + ask + ' is false.';
    if (rel === 'Subcontraries') return 'Subcontraries cannot both be false; ' + c + ' is false, so ' + ask + ' is true.';
    if (rel === 'Subalterns') return (v ? 'Truth flows down from ' + c + ' to ' + ask : 'Falsity flows up from ' + c + ' to ' + ask) + ', so ' + ask + ' is ' + tfu(v).toLowerCase() + '.';
    // through the contradictory of the given corner
    var r2 = relOf(cc, ask);
    return 'Its contradictory ' + cc + ' is ' + (cv ? 'true' : 'false') + ', and ' + cc + ' and ' + ask + ' are ' + r2.toLowerCase() + ': so ' + ask + ' is ' + tfu(v).toLowerCase() + '.';
  }
  function noInfo(from, val, to) { // why a corner with this value says nothing about another corner
    var rel = relOf(from, to), v = val ? 'true' : 'false';
    if (rel === 'Contraries') return from + ' is ' + v + ', and contraries can both be false, so ' + from + ' tells us nothing about ' + to + '.';
    if (rel === 'Subcontraries') return from + ' is ' + v + ', and subcontraries can both be true, so ' + from + ' tells us nothing about ' + to + '.';
    if (from === 'A' || from === 'E') return from + ' is ' + v + ', and falsity does not flow down from ' + from + ' to ' + to + '.';
    return from + ' is ' + v + ', and truth does not flow up from ' + from + ' to ' + to + '.';
  }
  G('trad.square-inferences', function (R, ctx) {
    var L = lvl(ctx), T2 = sqTerms(R), c = R.pick(FORMS), val = R.coin(), all = LG().square(c, val, false), rest = FORMS.filter(function (g) { return g !== c; });
    var head = 'On the traditional square, <i>' + cat(c, T2.s, T2.p) + '</i> is <b>' + (val ? 'true' : 'false') + '</b>.';
    if (L === 3) {
      return P(head + ' Give the value of each other corner.', { t: 'multi', parts: rest.map(function (g) { return { label: g + ': <i>' + cat(g, T2.s, T2.p) + '</i>', a: keep(TFU, TFU.indexOf(tfu(all[g]))) }; }) },
        rest.map(function (g) { return g + ': ' + sqWhy(c, val, g, T2, false); }), 'Start with the contradictory; then use contraries, subcontraries and subalterns.',
        { kind: 'sq-all', corner: c, val: val, boolean: false, answer: rest.map(function (g) { return all[g]; }) }, sqView(T2, mk(c, val)));
    }
    var und = rest.filter(function (g) { return all[g] === null; }), ask = (L === 2 && und.length && R.chance(0.5)) ? R.pick(und) : R.pick(rest);
    return P(head + ' What is the value of <i>' + cat(ask, T2.s, T2.p) + '</i>?', keep(TFU, TFU.indexOf(tfu(all[ask]))), [sqWhy(c, val, ask, T2, false)],
      'Is ' + ask + ' tied to ' + c + ' directly, or through ' + c + '\'s contradictory?', { kind: 'sq', corner: c, val: val, ask: ask, boolean: false, answer: all[ask] }, sqView(T2, mk(c, val)));
  });

  var FANCY = ['dragons', 'unicorns', 'talking cats', 'students taller than nine feet', 'mermaids', 'flying elephants'];
  G('trad.modern-square', function (R, ctx) {
    var L = lvl(ctx), r = R.next();
    if (r < 0.25) {
      var ch = ['Contradictories', 'Contraries', 'Subcontraries', 'Subalterns'];
      return P('On the modern (Boolean) square, which relation still holds no matter which classes are empty?', keep(ch, 0),
        ['On the Boolean reading, A and E say a region is empty; I and O say a region has something in it.', 'A and O talk about the same region (S outside P), one saying it is empty and the other that it is not; E and I do the same for S inside P. So the <b>contradictories</b> always hold.', 'If there are no S at all, A and E are both true and I and O both false, which breaks contrariety, subcontrariety and subalternation.'],
        'What happens to each corner if the subject class is empty?', { kind: 'msq-rel' });
    }
    if (r < 0.5) {
      var F = R.pick(FANCY), Pf = R.pick(['creatures that breathe fire', 'friendly creatures', 'good swimmers', 'shy creatures']), up = R.coin();
      var a1 = up ? cat('A', F, Pf) : cat('E', F, Pf), a2 = up ? cat('I', F, Pf) : cat('O', F, Pf);
      return P('On the modern (Boolean) reading, does the second statement follow from the first?' + box([a1, a2]), keep(['Yes', 'No'], 1),
        ['On the Boolean reading, <i>' + a1 + '</i> only says that no ' + F + (up ? ' are outside the ' : ' are inside the ') + Pf + '. It does not say there are any ' + F + '.',
          '<i>' + a2 + '</i> says there is at least one of the ' + F + '. If there are no ' + F + ' at all, the first is true and the second false.',
          'So subalternation fails on the modern square: <b>no</b>.'],
        'Could the first be true while the subject class is empty?', { kind: 'msq-sub', a: up ? 'A' : 'E', v: false });
    }
    var T2 = sqTerms(R), c = R.pick(FORMS), val = R.coin();
    var all = LG().square(c, val, true), trad = LG().square(c, val, false), rest = FORMS.filter(function (g) { return g !== c; });
    var differ = rest.filter(function (g) { return all[g] !== trad[g]; }), ask = differ.length && R.chance(0.7) ? R.pick(differ) : R.pick(rest);
    var steps = [sqWhy(c, val, ask, T2, true)];
    if (all[ask] !== trad[ask]) steps.push('On the traditional square it would be ' + tfu(trad[ask]).toLowerCase() + ', but that needs the assumption that there are ' + T2.s + '.');
    return P('On the modern (Boolean) square, <i>' + cat(c, T2.s, T2.p) + '</i> is <b>' + (val ? 'true' : 'false') + '</b>. What is the value of <i>' + cat(ask, T2.s, T2.p) + '</i>?', keep(TFU, TFU.indexOf(tfu(all[ask]))), steps,
      'Only the contradictory diagonals survive on the modern square.', { kind: 'sq', corner: c, val: val, ask: ask, boolean: true, answer: all[ask] }, sqView(T2, mk(c, val), { boolean: true }));
  });

  // =================================================================== Unit 4: Immediate Inference
  var OPP = [['winners', 'losers', 'people who did not play at all'], ['adults', 'children', 'teenagers'], ['friends', 'enemies', 'strangers'], ['heroes', 'villains', 'ordinary bystanders'],
    ['members', 'guests', 'people who never came'], ['happy people', 'sad people', 'people who feel calm'], ['passing grades', 'failing grades', 'missing grades'],
    ['tall buildings', 'short buildings', 'medium-height buildings'], ['hot drinks', 'cold drinks', 'warm drinks'], ['citizens', 'tourists', 'residents who are not citizens'],
    ['early arrivals', 'late arrivals', 'people who arrived right on time'], ['wet towels', 'dry towels', 'damp towels'], ['loud songs', 'quiet songs', 'songs of medium volume'],
    ['full glasses', 'empty glasses', 'half-full glasses'], ['fast runners', 'slow runners', 'runners of average speed'], ['open doors', 'closed doors', 'doors left ajar'],
    ['sweet fruits', 'sour fruits', 'mild fruits'], ['heavy boxes', 'light boxes', 'boxes of medium weight'], ['right answers', 'wrong answers', 'blank answers'],
    ['day hikers', 'overnight campers', 'people who stayed home'], ['bright stars', 'dim stars', 'stars of middle brightness'], ['team captains', 'team rookies', 'fans in the stands']];
  G('trad.complements', function (R, ctx) {
    var L = lvl(ctx), o = R.pick(OPP), r = R.next();
    if (r < 0.25 && L >= 2) {
      return P('What is the complement of the class <i>non-' + o[0] + '</i>?', mc(o[0], [o[1], 'non-' + o[1], 'non-non-' + o[0].split(' ').pop()]),
        ['The complement of a class is everything outside it.', 'Everything outside the non-' + o[0] + ' is inside the ' + o[0] + ', so the complement of <i>non-' + o[0] + '</i> is <i>' + o[0] + '</i>.'],
        'Two complements cancel.', { kind: 'comp2', t: o[0] });
    }
    if (r < 0.55) {
      return P('True or false: <i>' + o[1] + '</i> is the complement of <i>' + o[0] + '</i>.', tf(false),
        ['The complement of ' + o[0] + ' is everything that is not one of the ' + o[0] + ': <i>non-' + o[0] + '</i>.', 'The opposite word leaves things out: ' + o[2] + ' are neither ' + o[0] + ' nor ' + o[1] + '. So the statement is <b>false</b>.'],
        'Is there anything that is neither?', { kind: 'comp-tf' });
    }
    return P('What is the complement of the class <i>' + o[0] + '</i>?', mc('non-' + o[0], [o[1], 'all ' + o[0], 'some ' + o[0]]),
      ['The complement of a class is everything outside it, written with "non-".', 'Opposites such as <i>' + o[1] + '</i> are not complements: ' + o[2] + ' are neither.', 'The complement is <i>non-' + o[0] + '</i>.'],
      'Everything that is not one of them.', { kind: 'comp', t: o[0] });
  });

  function immTerms(R) { var t = R.sample(PEOPLE, 2); return { s: pl(t[0]), p: pl(t[1]) }; }
  G('trad.conversion', function (R, ctx) {
    var L = lvl(ctx), T2 = immTerms(R), f = R.pick(FORMS), st = cat(f, T2.s, T2.p), im = LG().immediate(st), r = R.next();
    if (L === 3 && r < 0.25) {
      var stg = cat('A', T2.s, T2.p), lim = LG().immediate(stg).conversion.limitation;
      return P('On the traditional reading, what does conversion by limitation give from this statement?' + box([stg]), mc(lim, [cat('A', T2.p, T2.s), cat('O', T2.p, T2.s), cat('E', T2.p, T2.s)]),
        ['Conversion by limitation swaps the terms and changes the quantity from universal to particular.', 'From the A statement it gives an I statement: <i>' + lim + '</i>.', 'It is valid only on the traditional reading, which assumes there are ' + T2.s + '. (Plain conversion, <i>' + cat('A', T2.p, T2.s) + '</i>, does not follow at all.)'],
        'Swap the terms and weaken "all" to "some".', { kind: 'limit', f: 'A', s: T2.s, p: T2.p, answer: lim });
    }
    if (r < 0.5) {
      var valid = im.conversion.valid;
      return P('Does the converse follow from the original (on the modern reading)?' + box(['Original: ' + st, 'Converse: ' + im.conversion.text]), keep(['Yes: the converse is equivalent', 'No: the converse does not follow'], valid ? 0 : 1),
        ['Conversion is valid for E and I, which treat both terms alike (E distributes both, I neither); it is not valid for A or O.', f + (valid ? ' converts validly, so <b>yes</b>.' : ' does not convert: ' + (f === 'A' ? 'every one of the ' + T2.s + ' could be among the ' + T2.p + ' while some ' + T2.p + ' are not ' + T2.s + '.' : 'some ' + T2.s + ' could be outside the ' + T2.p + ' while every one of the ' + T2.p + ' is one of the ' + T2.s + '.') + ' So <b>no</b>.')],
        'Which forms keep the same diagram when the circles swap?', { kind: 'conv-valid', st: st, conv: im.conversion.text, v: valid });
    }
    var wr = [cat(f, T2.s, 'non-' + T2.p), im.obversion.text, cat(f, 'non-' + T2.p, 'non-' + T2.s), cat({ A: 'E', E: 'A', I: 'O', O: 'I' }[f], T2.p, T2.s)];
    return P('What is the converse of this statement?' + box([st]), mc(im.conversion.text, wr),
      ['Conversion swaps the subject and predicate and changes nothing else.', 'The converse is <i>' + im.conversion.text + '</i>' + (im.conversion.valid ? ', and for ' + f + ' it is equivalent to the original.' : '. For ' + f + ' it does not follow from the original.')],
      'Swap the two terms.', { kind: 'conv', st: st, answer: im.conversion.text });
  });

  G('trad.obversion', function (R, ctx) {
    var L = lvl(ctx), T2 = immTerms(R), f = R.pick(FORMS), useNon = L === 3 && R.coin();
    if (useNon) T2.p = 'non-' + T2.p;
    var st = cat(f, T2.s, T2.p), ob = LG().immediate(st).obversion.text, q2 = { A: 'E', E: 'A', I: 'O', O: 'I' }[f], cp = LG().complement(T2.p), cs = LG().complement(T2.s);
    var wr = [cat(q2, T2.s, T2.p), cat(f, T2.s, cp), cat(q2, cs, T2.p)];
    return P('What is the obverse of this statement?' + box([st]), mc(ob, wr),
      ['Obversion does two things: change the quality (affirmative ↔ negative) and replace the predicate with its complement.', 'Changing the quality turns ' + f + ' into ' + q2 + '; the complement of <i>' + T2.p + '</i> is <i>' + cp + '</i>.', 'The obverse is <i>' + ob + '</i>, which is equivalent to the original for every form.'],
      'Two changes: quality, and the predicate\'s complement.', { kind: 'obv', st: st, answer: ob });
  });

  G('trad.contraposition', function (R, ctx) {
    var L = lvl(ctx), T2 = immTerms(R), f = R.pick(FORMS), st = cat(f, T2.s, T2.p), im = LG().immediate(st), r = R.next();
    if (r < 0.45) {
      var valid = im.contraposition.valid;
      return P('Does the contrapositive follow from the original (on the modern reading)?' + box(['Original: ' + st, 'Contrapositive: ' + im.contraposition.text]), keep(['Yes: the contrapositive is equivalent', 'No: the contrapositive does not follow'], valid ? 0 : 1),
        ['Contraposition is valid for A and O and not for E or I (the reverse of conversion).', 'One way to see it: obvert, convert, and obvert again. Conversion in the middle step needs an E or I, which happens exactly when the original is A or O.', f + ' is ' + (valid ? '' : 'not ') + 'one of them, so <b>' + (valid ? 'yes' : 'no') + '</b>.'],
        'Contraposition works for the forms where conversion fails.', { kind: 'cp-valid', st: st, cp: im.contraposition.text, v: valid });
    }
    var wr = [im.conversion.text, cat(f, 'non-' + T2.p, T2.s), cat(f, T2.p, 'non-' + T2.s), im.obversion.text];
    return P('What is the contrapositive of this statement?' + box([st]), mc(im.contraposition.text, wr),
      ['Contraposition swaps subject and predicate and replaces both with their complements.', 'Swap: ' + T2.p + ' and ' + T2.s + '; complement both: <i>non-' + T2.p + '</i> and <i>non-' + T2.s + '</i>.', 'The contrapositive is <i>' + im.contraposition.text + '</i>' + (im.contraposition.valid ? ', equivalent to the original (' + f + ').' : '. For ' + f + ' it does not follow from the original.')],
      'Swap the terms, then put "non-" on both.', { kind: 'cp', st: st, answer: im.contraposition.text });
  });

  // equivalents reachable by valid steps (obversion always; conversion for E and I; contraposition for A and O)
  function closure(st) {
    var seen = {}, out = [], queue = [{ t: st, path: [] }]; seen[st] = 1;
    while (queue.length) {
      var cur = queue.shift(); out.push(cur); var im = LG().immediate(cur.t);
      [['obversion', im.obversion], ['conversion', im.conversion], ['contraposition', im.contraposition]].forEach(function (op) {
        if (!op[1].valid || seen[op[1].text]) return; seen[op[1].text] = 1; queue.push({ t: op[1].text, path: cur.path.concat([[op[0], op[1].text]]) });
      });
    }
    return out;
  }
  function allStatements(S, Pp) {
    var ts = [S, 'non-' + S, Pp, 'non-' + Pp], out = [];
    ts.forEach(function (a, i) { ts.forEach(function (b, j) { if ((i < 2) === (j < 2)) return; FORMS.forEach(function (f) { out.push(cat(f, a, b)); }); }); });
    return out;
  }
  G('trad.immediate-chains', function (R, ctx) {
    var L = lvl(ctx), T2 = immTerms(R), f = R.pick(FORMS), st = cat(f, T2.s, T2.p), cl = closure(st);
    var deep = cl.filter(function (c) { return c.path.length >= (L === 1 ? 1 : 2); }), pick = deep.length ? R.pick(deep) : R.pick(cl.slice(1));
    var eq = {}; cl.forEach(function (c) { eq[c.t] = 1; });
    var others = allStatements(T2.s, T2.p).filter(function (x) { return !eq[x]; });
    // tempting wrong answers: an invalid conversion or contraposition of the original, then the rest at random
    var im = LG().immediate(st), tempt = [];
    if (!im.conversion.valid) tempt.push(im.conversion.text); if (!im.contraposition.valid) tempt.push(im.contraposition.text);
    tempt = tempt.filter(function (x) { return !eq[x]; });
    var wr = tempt.concat(R.sample(others.filter(function (x) { return tempt.indexOf(x) < 0; }), 3 - tempt.length));
    var steps = ['Use only steps that are valid for the form at hand: obversion (any form), conversion (E, I), contraposition (A, O).'];
    var cur = st; pick.path.forEach(function (s) { steps.push(cap(s[0]) + ' of <i>' + cur + '</i> gives <i>' + s[1] + '</i>.'); cur = s[1]; });
    steps.push('Each step keeps the meaning, so <i>' + pick.t + '</i> must be true. No chain of valid steps reaches the other choices: each says something the original does not.');
    return P('Suppose this statement is true. On the modern reading, which of the following must also be true?' + box([st]), mc(pick.t, wr), steps,
      'Try obversion first; it always works. Then convert or contrapose, if the form allows.', { kind: 'chain', st: st, answer: pick.t, wrongs: wr });
  });

  // =================================================================== Unit 5: Categorical Syllogisms
  function allForms() { var out = []; FORMS.forEach(function (a) { FORMS.forEach(function (b) { FORMS.forEach(function (c) { for (var f = 1; f <= 4; f++) out.push(a + b + c + '-' + f); }); }); }); return out; }
  var ALLF = allForms();
  var NEG = { E: 1, O: 1 };
  // two negative premises with an affirmative conclusion: some books also call that rule 4, so it is never asked
  function ambiguous(form) { return NEG[form[0]] && NEG[form[1]] && !NEG[form[2]]; }
  function formInfo(form) { var x = LG().syllogism(LG().fromForm(form)); return x; }
  var INFO = null;
  function info() { if (!INFO) { INFO = {}; ALLF.forEach(function (f) { INFO[f] = formInfo(f); }); } return INFO; }
  function formsWhere(test) { var I = info(); return ALLF.filter(function (f) { return !ambiguous(f) && test(I[f], f); }); }
  function stdLines(x) { return [x.major, x.minor, x.conclusion]; }
  function termSteps(x) { return ['The conclusion is <i>' + x.conclusion + '</i>: its predicate <i>' + x.P + '</i> is the major term (P) and its subject <i>' + x.S + '</i> is the minor term (S).', 'The term in both premises but not in the conclusion, <i>' + x.M + '</i>, is the middle term (M).']; }

  G('trad.syllogism-parts', function (R, ctx) {
    var L = lvl(ctx), x = makeSyl(R, R.pick(L === 1 ? VALID : ALLF)), swap = L >= 2 && R.coin(), ask = R.pick(['major', 'minor', 'middle']);
    var right = ask === 'major' ? x.P : ask === 'minor' ? x.S : x.M;
    var ch = keep([x.S, x.P, x.M].map(function (t) { return t; }).sort(), 0); ch.v = ch.choices.indexOf(right);
    return P('What is the <b>' + ask + ' term</b> of this syllogism?' + sylBox(x, swap ? 'swap' : null), ch,
      termSteps(x).concat(['So the ' + ask + ' term is <i>' + right + '</i>.' + (swap ? ' The order of the premises does not matter: only the conclusion decides.' : '')]),
      'Start with the conclusion: its predicate is the major term, its subject the minor term.', { kind: 'parts', major: x.major, minor: x.minor, conclusion: x.conclusion, ask: ask, answer: right });
  });

  var SINCE = ['since', 'because', 'given that'];
  G('trad.syllogism-standard-form', function (R, ctx) {
    var L = lvl(ctx), x = makeSyl(R, R.pick(R.chance(0.6) ? VALID : ALLF)), r = R.next();
    var spoken = R.coin() ? [x.minor, x.major] : [x.major, x.minor];
    var passage = L === 1 ? argBox([spoken[0], spoken[1]], x.conclusion) : box([x.conclusion + ', ' + R.pick(SINCE) + ' ' + low(spoken[0]) + ' and ' + low(spoken[1]) + '.']);
    if (r < 0.5) {
      return P('Which statement is the <b>major premise</b>?' + passage, mc(x.major, [x.minor, x.conclusion]),
        termSteps(x).concat(['The major premise is the premise that contains the major term <i>' + x.P + '</i>: <i>' + x.major + '</i>.']),
        'Find the conclusion first. Which premise has its predicate?', { kind: 'major', major: x.major, minor: x.minor, conclusion: x.conclusion, answer: x.major });
    }
    var right = [x.major, x.minor, '∴ ' + x.conclusion].join(' / ');
    var wr = [[x.minor, x.major, '∴ ' + x.conclusion].join(' / '), [x.conclusion, x.major, '∴ ' + x.minor].join(' / '), [x.major, x.conclusion, '∴ ' + x.minor].join(' / ')];
    return P('Which is this argument in standard form?' + passage, mc(right, wr),
      termSteps(x).concat(['Standard order: the major premise (with ' + x.P + '), then the minor premise (with ' + x.S + '), then the conclusion.', 'So: <i>' + x.major + '</i> / <i>' + x.minor + '</i> / ∴ <i>' + x.conclusion + '</i>.']),
      'The conclusion goes last; the premise with the conclusion\'s predicate goes first.', { kind: 'order', major: x.major, minor: x.minor, conclusion: x.conclusion, answer: right });
  });

  G('trad.mood', function (R, ctx) {
    var L = lvl(ctx), x = makeSyl(R, R.pick(R.chance(0.5) ? VALID : ALLF)), swap = L >= 2 && R.chance(0.6);
    var mood = x.sy.mood, spoken = swap ? sylBox(x, 'swap') : sylBox(x);
    return P('What is the <b>mood</b> of this syllogism? Type three letters.' + spoken, { t: 'text', v: [mood, mood.split('').join(' ')] },
      (swap ? ['First put it in standard form. The major term is <i>' + x.P + '</i> (predicate of the conclusion), so the major premise is <i>' + x.major + '</i>; it goes first even though it was given second.'] : ['It is already in standard form: major premise, minor premise, conclusion.'])
        .concat(['Major premise: ' + letterOf(x.major) + '. Minor premise: ' + letterOf(x.minor) + '. Conclusion: ' + letterOf(x.conclusion) + '.', 'The mood is <b>' + mood + '</b>.']),
      'Read the letters in standard-form order: major premise, minor premise, conclusion.', { kind: 'mood', major: x.major, minor: x.minor, conclusion: x.conclusion, answer: mood });
  });

  var FIG_DESC = { 1: 'subject of the major premise, predicate of the minor (M–P, S–M)', 2: 'predicate of both premises (P–M, S–M)', 3: 'subject of both premises (M–P, M–S)', 4: 'predicate of the major premise, subject of the minor (P–M, M–S)' };
  G('trad.figure', function (R, ctx) {
    var L = lvl(ctx), fig = R.int(1, 4), form = (R.chance(0.5) ? R.pick(VALID.filter(function (v) { return +v.slice(4) === fig; })) : R.pick(FORMS) + R.pick(FORMS) + R.pick(FORMS) + '-' + fig);
    var x = makeSyl(R, form), swap = L >= 2 && R.coin();
    var pos = function (st) { var c = LG().parseCat(st); return c.s === x.M ? 'subject' : 'predicate'; };
    return P('What is the <b>figure</b> of this syllogism (1, 2, 3 or 4)?' + sylBox(x, swap ? 'swap' : null), { t: 'num', v: String(x.sy.figure), form: 'int' },
      (swap ? ['In standard form the major premise (the one with <i>' + x.P + '</i>) comes first: <i>' + x.major + '</i>.'] : []).concat([
        'The middle term is <i>' + x.M + '</i>. In the major premise it is the ' + pos(x.major) + '; in the minor premise it is the ' + pos(x.minor) + '.',
        'Middle term as ' + FIG_DESC[x.sy.figure] + ': figure <b>' + x.sy.figure + '</b>.']),
      'Find the middle term, then ask where it sits in each premise.', { kind: 'figure', major: x.major, minor: x.minor, conclusion: x.conclusion, answer: x.sy.figure });
  });

  // real terms whose truth is known, so that validity and truth come apart on purpose
  var REAL = [
    { prem: ['All dogs are mammals', 'Some mammals are pets'], c: 'Some dogs are pets', note: 'All three statements are true, but the premises do not force the conclusion.' },
    { prem: ['All roses are flowers', 'Some flowers are red things'], c: 'Some roses are red things', note: 'All three statements are true, and still the form is invalid.' },
    { prem: ['All squares are rectangles', 'All squares are polygons'], c: 'All rectangles are polygons', note: 'Every statement is true, yet the form is invalid.' },
    { prem: ['All spiders are insects', 'All tarantulas are spiders'], c: 'All tarantulas are insects', note: 'The first premise is false (spiders are arachnids), so the argument is unsound, but its form is valid.' },
    { prem: ['All birds are flyers', 'All penguins are birds'], c: 'All penguins are flyers', note: 'Penguins cannot fly, so a premise is false; the form is still valid.' },
    { prem: ['No mammals are swimmers', 'All whales are mammals'], c: 'No whales are swimmers', note: 'The first premise is false, and so is the conclusion; the form is valid.' },
    { prem: ['All cats are mammals', 'All dogs are mammals'], c: 'All dogs are cats', note: 'True premises, false conclusion: the form cannot be valid.' },
    { prem: ['No fish are mammals', 'No whales are fish'], c: 'No whales are mammals', note: 'True premises and a false conclusion: a sure sign of an invalid form.' }
  ];
  function realSyl(it0) { var sy = LG().syllogism({ premises: it0.prem, conclusion: it0.c }); return { S: sy.terms.S, P: sy.terms.P, M: sy.terms.M, major: catTextOf(sy.major), minor: catTextOf(sy.minor), conclusion: it0.c, sy: sy, real: it0 }; }
  function catTextOf(o) { return cat(o.f, o.s, o.p); }
  function regionNums(rs) { return rs.map(function (r) { return R3NUM[r]; }).sort(); }
  function shadeAlt(x) { // wrong ways to shade the universal premises: shading the region a statement "talks about", or using its converse
    var terms = [x.S, x.P, x.M], out = [];
    var ps = [x.major, x.minor].map(function (t) { return LG().parseCat(t); });
    function sh(list) { var set = {}; list.forEach(function (p) { if (p.f === 'A' || p.f === 'E') LG().regionsFor(cat(p.f, p.s, p.p), terms).forEach(function (r) { set[r] = 1; }); }); return Object.keys(set).map(Number); }
    var flip = function (p) { return p.f === 'A' ? { f: 'A', s: p.p, p: p.s } : p; };
    var inside = function (p) { return p.f === 'A' ? { f: 'E', s: p.s, p: p.p } : p.f === 'E' ? { f: 'A', s: p.s, p: p.p } : p; };
    out.push(sh([flip(ps[0]), ps[1]]), sh([ps[0], flip(ps[1])]), sh([inside(ps[0]), ps[1]]), sh([ps[0], inside(ps[1])]), sh([inside(ps[0]), inside(ps[1])]));
    return out;
  }
  G('trad.venn-syllogism', function (R, ctx) {
    var L = lvl(ctx), r = R.next();
    if (r < 0.2) {
      var it0 = R.pick(REAL), x0 = realSyl(it0), v0 = x0.sy.valid;
      return P('Test this argument with a Venn diagram. Is it valid?' + argBox(it0.prem, it0.c), keep(['Valid', 'Invalid'], v0 ? 0 : 1),
        ['Diagram only the premises (S = ' + x0.S + ', P = ' + x0.P + ', M = ' + x0.M + '), then look for the conclusion in the picture.', v0 ? 'The premises already shade every region the conclusion says is empty, so it is <b>valid</b>.' : 'The conclusion is not already shown by the premises\' diagram, so it is <b>invalid</b>.', it0.note],
        'Validity is about the form, not about whether the statements are true.', { kind: 'syl', major: x0.major, minor: x0.minor, conclusion: x0.conclusion, valid: v0 }, vennView(x0));
    }
    var uni = ALLF.filter(function (f) { return 'AE'.indexOf(f[0]) >= 0 && 'AE'.indexOf(f[1]) >= 0 && (L === 3 || 'AE'.indexOf(f[2]) >= 0); });
    var form = R.chance(0.5) ? R.pick(uni.filter(function (f) { return VALID.indexOf(f) >= 0; })) : R.pick(uni), x = makeSyl(R, form);
    if (L >= 2 && r < 0.6) {
      var dg = x.sy.diagram, right = regionNums(dg.shade), rs = right.join(', ');
      var alts = shadeAlt(x).map(regionNums).map(function (a) { return a.join(', '); }).filter(function (a, i, arr) { return a !== rs && a && arr.indexOf(a) === i; });
      while (alts.length < 3) { var rnd = R.sample([1, 2, 3, 4, 5, 6, 7], right.length).sort().join(', '); if (rnd !== rs && alts.indexOf(rnd) < 0) alts.push(rnd); }
      return P('Diagram the premises of this syllogism (S = ' + x.S + ', P = ' + x.P + ', M = ' + x.M + '). Which regions end up shaded?' + sylBox(x), mc('Regions ' + rs, R.sample(alts, 3).map(function (a) { return 'Regions ' + a; })),
        [x.major + ': ' + shadeWhy(x.major, [x.S, x.P, x.M]), x.minor + ': ' + shadeWhy(x.minor, [x.S, x.P, x.M]), 'Together: regions ' + rs + ' are shaded.'],
        'For each premise, shade the part of the subject circle that the statement says is empty.', { kind: 'shade', major: x.major, minor: x.minor, conclusion: x.conclusion, answer: right },
        { name: 'lg-venn3', opts: { terms: [x.S, x.P, x.M], shade: [], xs: [], numbers: true, quiet: true, interactive: false } });
    }
    var v = x.sy.valid, cc = LG().parseCat(x.conclusion);
    var why = v ? 'The diagram of the premises already shows <i>' + x.conclusion + '</i>: every region it says is empty is shaded.' :
      (cc.f === 'I' || cc.f === 'O') ? 'The conclusion needs an X, and universal premises never draw one: the conclusion is not shown.' : 'The conclusion says ' + regionList(regionNums(LG().regionsFor(x.conclusion, [x.S, x.P, x.M]))) + ' must be empty, but the premises leave part of that unshaded.';
    return P('Test this syllogism with a Venn diagram (shown with the premises drawn). Is it valid?' + sylBox(x), keep(['Valid', 'Invalid'], v ? 0 : 1),
      ['Draw only the premises: that is the picture.', why, 'So the syllogism is <b>' + (v ? 'valid' : 'invalid') + '</b>' + (!v && x.sy.conditional ? ' on the modern reading' : '') + '.'],
      'Do not draw the conclusion; look for it in the picture of the premises.', sylChk(x), vennView(x, L === 1 ? { numbers: true } : {}));
  });
  function shadeWhy(st, terms) { var c = LG().parseCat(st), rs = regionNums(LG().regionsFor(st, terms)); return (c.f === 'A' ? 'no ' + c.s + ' are outside ' + c.p : 'no ' + c.s + ' are inside ' + c.p) + ', so shade ' + regionList(rs) + '.'; }

  G('trad.venn-particular', function (R, ctx) {
    var L = lvl(ctx), part = ALLF.filter(function (f) { return 'IO'.indexOf(f[0]) >= 0 || 'IO'.indexOf(f[1]) >= 0; });
    var form = R.chance(0.5) ? R.pick(part.filter(function (f) { return VALID.indexOf(f) >= 0; })) : R.pick(part), x = makeSyl(R, form), terms = [x.S, x.P, x.M];
    if (x.sy.diagram.inconsistent || !x.sy.diagram.xs.length) return P('Test this syllogism with a Venn diagram. Is it valid?' + sylBox(x), keep(['Valid', 'Invalid'], x.sy.valid ? 0 : 1), ['Diagram the premises and look for the conclusion.', 'It is <b>' + (x.sy.valid ? 'valid' : 'invalid') + '</b>.'], null, sylChk(x));
    var r = R.next();
    if (r < 0.5) {
      var pp = [x.major, x.minor].filter(function (s) { var c = LG().parseCat(s); return c.f === 'I' || c.f === 'O'; })[0];
      var xs = LG().diagram([x.major, x.minor], terms).xs[0], nums = regionNums(xs);
      var right = nums.length === 1 ? 'In region ' + nums[0] : 'On the line between regions ' + nums[0] + ' and ' + nums[1];
      var cand = LG().regionsFor(pp, terms), cn = regionNums(cand);
      var wr = cn.map(function (n) { return 'In region ' + n; }).concat(['On the line between regions ' + cn[0] + ' and ' + cn[1]]).filter(function (w) { return w !== right; });
      var other = [1, 2, 3, 4, 5, 6, 7].filter(function (n) { return cn.indexOf(n) < 0; }); wr.push('In region ' + R.pick(other));
      var uni = [x.major, x.minor].filter(function (s) { return s !== pp; })[0], uc = LG().parseCat(uni);
      var st = ['Universal premises first: <i>' + uni + '</i>' + ((uc.f === 'A' || uc.f === 'E') ? ' shades ' + regionList(regionNums(LG().regionsFor(uni, terms))) + '.' : ' is particular too; the X for it is drawn after.'),
        '<i>' + pp + '</i> needs an X in ' + regionList(cn).replace(' and ', ' or ').replace('regions', 'region') + ' (where ' + LG().parseCat(pp).s + ' ' + (LG().parseCat(pp).f === 'I' ? 'are ' : 'are not ') + LG().parseCat(pp).p + ').',
        nums.length === 1 ? 'Only region ' + nums[0] + ' is still open, so the X goes <b>in region ' + nums[0] + '</b>.' : 'Neither region is shaded, and the premise does not say which one, so the X goes <b>on the line</b> between regions ' + nums[0] + ' and ' + nums[1] + '.'];
      return P('In the Venn diagram for this syllogism (S = ' + x.S + ', P = ' + x.P + ', M = ' + x.M + '), where does the X for <i>' + pp + '</i> go?' + sylBox(x), mc(right, wr.slice(0, 3)), st,
        'Shade for the universal premise first, then see which regions are still open for the X.', { kind: 'xplace', major: x.major, minor: x.minor, conclusion: x.conclusion, prop: pp, answer: nums },
        { name: 'lg-venn3', opts: { terms: terms, shade: [], xs: [], numbers: true, quiet: true, interactive: false } });
    }
    var v = x.sy.valid, cc = LG().parseCat(x.conclusion), dg = x.sy.diagram;
    var onLine = dg.xs.some(function (a) { return a.length > 1; });
    var why = v ? 'The diagram of the premises already shows the conclusion' + ((cc.f === 'I' || cc.f === 'O') ? ': an X sits wholly inside the region the conclusion needs.' : '.') :
      onLine ? 'The X sits on a line, so it might be on the side the conclusion does not need: the conclusion is not shown.' : 'The premises do not put what the conclusion needs into the picture.';
    return P('Test this syllogism with a Venn diagram' + (L < 3 ? ' (shown with the premises drawn)' : '') + '. Is it valid?' + sylBox(x), keep(['Valid', 'Invalid'], v ? 0 : 1),
      ['Shade for the universal premise first, then place the X (on a line if two regions are open).', why, 'So it is <b>' + (v ? 'valid' : 'invalid') + '</b>.'],
      'An X on a line does not prove that something is on either side.', sylChk(x), L < 3 ? vennView(x) : null);
  });

  var DISTR = ['undistributed middle', 'illicit major', 'illicit minor'];
  function ruleSteps(x) {
    var s = [], d = function (st) { var c = LG().parseCat(st), dd = LG().distributed(c.f), o = []; if (dd.s) o.push(c.s); if (dd.p) o.push(c.p); return o; };
    var dm = d(x.major), dn = d(x.minor), dc = d(x.conclusion);
    s.push('Distributed terms: major premise ' + (dm.length ? dm.map(it).join(', ') : 'none') + '; minor premise ' + (dn.length ? dn.map(it).join(', ') : 'none') + '; conclusion ' + (dc.length ? dc.map(it).join(', ') : 'none') + '.');
    return s;
  }
  G('trad.rules-terms', function (R, ctx) {
    var L = lvl(ctx);
    if (R.chance(0.12)) {
      var it0 = R.pick(REAL.filter(function (q) { var y = realSyl(q).sy; return y.broken.length === 1 && DISTR.indexOf(y.broken[0]) >= 0 || !y.broken.length; })), x0 = realSyl(it0);
      var k0 = x0.sy.broken.length ? DISTR.indexOf(x0.sy.broken[0]) : 3;
      return P('Which rule of distribution does this syllogism break?' + argBox(it0.prem, it0.c), keep(['Undistributed middle', 'Illicit major', 'Illicit minor', 'Neither: the distribution rules are kept'], k0),
        ruleSteps(x0).concat([k0 === 3 ? 'The middle term is distributed, and every term distributed in the conclusion is distributed in its premise.' : FALLACY[x0.sy.broken[0]] + '.', it0.note]),
        'Mark the distributed terms in each statement first.', { kind: 'syl', major: x0.major, minor: x0.minor, conclusion: x0.conclusion, broken: x0.sy.broken, valid: x0.sy.valid });
    }
    var cands = formsWhere(function (y) { return y.broken.length === 0 || (y.broken.length === 1 && DISTR.indexOf(y.broken[0]) >= 0); });
    var x = makeSyl(R, R.pick(cands)), b = x.sy.broken, k = b.length ? DISTR.indexOf(b[0]) : 3;
    var tail = { 0: 'The middle term <i>' + x.M + '</i> is not distributed in either premise, so the premises may be about different parts of it: <b>undistributed middle</b>.',
      1: 'The major term <i>' + x.P + '</i> is distributed in the conclusion but not in the major premise: <b>illicit major</b>.',
      2: 'The minor term <i>' + x.S + '</i> is distributed in the conclusion but not in the minor premise: <b>illicit minor</b>.',
      3: 'The middle term is distributed at least once, and no term is distributed in the conclusion without being distributed in its premise: both distribution rules are kept.' }[k];
    return P('Which rule of distribution does this syllogism break?' + sylBox(x), keep(['Undistributed middle', 'Illicit major', 'Illicit minor', 'Neither: the distribution rules are kept'], k),
      ruleSteps(x).concat([tail]), 'A distributes its subject, E both terms, I neither, O its predicate.', sylChk(x), L === 1 ? sylView(x, { show: ['dist'] }) : null);
  });

  var QUAL = ['exclusive premises', 'affirmative conclusion from a negative premise', 'negative conclusion from affirmative premises'];
  G('trad.rules-quality', function (R, ctx) {
    var L = lvl(ctx), pool = formsWhere(function (y) { return true; });
    var want = R.pick(['exclusive premises', 'affirmative conclusion from a negative premise', 'negative conclusion from affirmative premises', 'none']);
    var cands = pool.filter(function (f) { var b = info()[f].broken, q = b.filter(function (z) { return QUAL.indexOf(z) >= 0; }); return want === 'none' ? !q.length : q[0] === want; });
    if (want === 'none' && L === 1) cands = cands.filter(function (f) { return VALID.indexOf(f) >= 0; });
    var x = makeSyl(R, R.pick(cands)), q = x.sy.broken.filter(function (z) { return QUAL.indexOf(z) >= 0; }), k = q.length ? QUAL.indexOf(q[0]) : 3;
    var negs = [x.major, x.minor].filter(function (s) { var f = letterOf(s); return f === 'E' || f === 'O'; }).length, cneg = NEG[letterOf(x.conclusion)];
    var st = ['Negative premises: ' + negs + '. The conclusion is ' + (cneg ? 'negative' : 'affirmative') + ' (' + letterOf(x.conclusion) + ').',
      { 0: 'Two negative premises only say what the middle term excludes, so they never link S and P: <b>exclusive premises</b>.', 1: 'One premise is negative, so the conclusion must be negative too, but it is affirmative: <b>affirmative conclusion from a negative premise</b>.',
        2: 'Both premises are affirmative, so they can only include classes in one another, never exclude: a negative conclusion breaks the rule (<b>negative conclusion from affirmative premises</b>).',
        3: 'The number of negatives matches: ' + (negs ? 'one negative premise and a negative conclusion' : 'no negatives anywhere') + '. No quality rule is broken.' }[k]];
    if (k === 3 && !x.sy.valid) st.push('(It may still break another rule; this question asks only about quality.)');
    return P('Which rule of quality does this syllogism break?' + sylBox(x), keep(['Exclusive premises', 'Affirmative conclusion from a negative premise', 'Negative conclusion from affirmative premises', 'None of the quality rules'], k), st,
      'Count the negative statements (E and O) among the premises and the conclusion.', sylChk(x, { qual: k }));
  });

  var FNAMES = ['Undistributed middle', 'Illicit major', 'Illicit minor', 'Exclusive premises', 'Affirmative conclusion from a negative premise', 'Negative conclusion from affirmative premises', 'Existential fallacy'];
  var FKEYS = ['undistributed middle', 'illicit major', 'illicit minor', 'exclusive premises', 'affirmative conclusion from a negative premise', 'negative conclusion from affirmative premises', 'existential fallacy'];
  var FWHY = { 'undistributed middle': 'the middle term is not distributed in either premise', 'illicit major': 'the major term is distributed in the conclusion but not in the major premise', 'illicit minor': 'the minor term is distributed in the conclusion but not in the minor premise',
    'exclusive premises': 'both premises are negative', 'affirmative conclusion from a negative premise': 'a premise is negative but the conclusion is affirmative', 'negative conclusion from affirmative premises': 'both premises are affirmative but the conclusion is negative',
    'existential fallacy': 'both premises are universal but the conclusion is particular (modern reading)', 'four terms': 'the argument uses four different terms, so there is no single middle term' };
  var FOURS = [['chess players', 'chess fans'], ['runners', 'running fans'], ['bakers', 'customers of bakers'], ['singers', 'fans of singers'], ['poets', 'readers of poetry'], ['golfers', 'golf fans']];
  G('trad.syllogism-fallacies', function (R, ctx) {
    var L = lvl(ctx);
    if (L === 3 && R.chance(0.2)) {
      var pair = R.pick(FOURS), t2 = R.sample(PEOPLE.filter(function (p) { return pl(p) !== pair[0]; }), 2), S = pl(t2[0]), Pp = pl(t2[1]);
      var maj = cat('A', pair[0], Pp), min = cat('A', S, pair[1]), con = cat('A', S, Pp), y = LG().syllogism({ major: maj, minor: min, conclusion: con });
      var ch4 = FNAMES.concat(['Four terms']);
      return P('Which fallacies does this argument commit? Choose all that apply.' + argBox([maj, min], con), { t: 'mc', choices: ch4, v: [7], keep: true },
        ['The first premise is about <i>' + pair[0] + '</i>; the second about <i>' + pair[1] + '</i>. They are different classes.', 'So there are four terms and no middle term to link S and P: <b>four terms</b>. The other rules only apply to a syllogism with three terms.'],
        'Before checking distribution, count the terms.', { kind: 'four', major: maj, minor: min, conclusion: con, broken: y.broken });
    }
    var cands = formsWhere(function (y) { return !y.valid && y.broken.length && (L >= 2 || y.broken.length === 1); });
    if (L >= 2 && R.chance(0.6)) cands = cands.filter(function (f) { return info()[f].broken.length >= 2; });
    var x = makeSyl(R, R.pick(cands)), b = x.sy.broken;
    var v = b.map(function (z) { return FKEYS.indexOf(z); }).sort();
    return P('Which fallacies does this syllogism commit? Choose all that apply.' + sylBox(x), { t: 'mc', choices: FNAMES, v: v, keep: true },
      ruleSteps(x).concat(b.map(function (z) { return '<b>' + FALLACY[z] + '</b>: ' + FWHY[z] + '.'; })).concat([b.length > 1 ? 'Every broken rule counts: this one has ' + b.length + '.' : 'Every other rule is kept.']),
      'Check all six rules, not just the first broken one.', sylChk(x), L === 1 ? sylView(x, { show: ['dist'] }) : null);
  });

  G('trad.valid-forms', function (R, ctx) {
    var L = lvl(ctx), names = LG().FORM_NAMES, r = R.next(), form = R.pick(VALID), nm = names[form];
    if (r < 0.3) {
      return P('What are the mood and figure of the valid form named <b>' + nm + '</b>?', { t: 'multi', parts: [{ label: 'Mood', a: { t: 'text', v: [form.slice(0, 3)] } }, { label: 'Figure', a: { t: 'num', v: form.slice(4), form: 'int' } }] },
        ['The vowels of the name give the mood: ' + nm + ' → ' + nm.replace(/[^aeiou]/gi, '').toUpperCase().slice(0, 3) + '.', 'The figure has to be remembered with the name (or found by testing): ' + nm + ' is ' + form + '.', 'Mood <b>' + form.slice(0, 3) + '</b>, figure <b>' + form.slice(4) + '</b>.'],
        'Read the three vowels.', { kind: 'name2form', name: nm, answer: form });
    }
    if (r < 0.65) {
      var x = makeSyl(R, form), same = VALID.filter(function (v) { return v !== form && (L >= 2 ? v.slice(0, 3) === form.slice(0, 3) || v.slice(4) === form.slice(4) : true); });
      var wr = R.sample(same.length >= 3 ? same : VALID.filter(function (v) { return v !== form; }), 3).map(function (v) { return names[v]; });
      return P('This syllogism is valid. What is its traditional name?' + sylBox(x), mc(nm, wr),
        ['Mood: ' + x.sy.mood + '. Figure: ' + x.sy.figure + ' (the middle term <i>' + x.M + '</i> is ' + FIG_DESC[x.sy.figure].replace(/ \(.*/, '') + ').', 'The valid ' + x.sy.mood + ' form in figure ' + x.sy.figure + ' is <b>' + nm + '</b> (its vowels spell the mood).'],
        'Find the mood and figure first; the vowels of the name spell the mood.', sylChk(x, { name: nm }));
    }
    var bad = R.sample(ALLF.filter(function (f) { return VALID.indexOf(f) < 0 && (L === 3 ? true : !COND[f]) && !ambiguous(f); }), 3);
    if (L === 3 && R.chance(0.6)) bad[0] = R.pick(Object.keys(COND));
    return P('Which of these forms is valid on the modern reading?', mc(form, bad),
      [form + ' is ' + nm + ', one of the fifteen forms valid on the modern reading.', bad.map(function (f) { var y = info()[f]; return f + ': ' + (COND[f] ? 'valid only on the traditional reading (existential fallacy on the modern)' : y.broken.map(function (z) { return FALLACY[z].toLowerCase(); }).join(', ')); }).join('; ') + '.'],
      'Valid forms have names; check the rules for the others.', { kind: 'which-valid', answer: form, wrongs: bad });
  });

  G('trad.conditional-validity', function (R, ctx) {
    var L = lvl(ctx), pick = R.next(), form = pick < 0.6 ? R.pick(Object.keys(COND)) : pick < 0.8 ? R.pick(VALID) : R.pick(formsWhere(function (y) { return !y.valid && !y.conditional; }));
    var x = makeSyl(R, form), c = x.sy.conditional, v = x.sy.valid;
    var ch = ['There must be ' + x.S + ' (S)', 'There must be ' + x.P + ' (P)', 'There must be ' + x.M + ' (M)', 'None: it is valid on the modern reading', 'None: it is invalid on both readings'];
    var k = v ? 3 : c === 'S' ? 0 : c === x.S ? 0 : c === x.P ? 1 : c === x.M ? 2 : c === 'P' ? 1 : c === 'M' ? 2 : 4;
    var cname = k === 0 ? x.S : k === 1 ? x.P : k === 2 ? x.M : null;
    var steps = ['Form: ' + x.sy.form + '.'];
    if (v) steps.push('It is one of the fifteen forms valid on the modern reading' + (x.sy.name ? ' (' + x.sy.name + ')' : '') + ', so no assumption is needed.');
    else if (cname) steps.push('On the modern reading it commits the existential fallacy: both premises are universal, the conclusion particular, and the Venn diagram has no X.', 'Assume there are ' + cname + ': the unshaded part of the ' + cname + ' circle lies entirely inside the area the conclusion needs, so an X there shows the conclusion.', 'So it is valid on the traditional reading if there are <b>' + cname + '</b>.');
    else steps.push('It breaks a rule that no existence assumption can repair: ' + x.sy.broken.map(function (z) { return FALLACY[z].toLowerCase(); }).join(', ') + '.');
    return P('This syllogism is checked on the traditional reading. Which class must have members for it to be valid?' + sylBox(x), keep(ch, k), steps,
      'Try the modern Venn test first. If it fails only for lack of an X, ask which circle has a single open region inside the conclusion\'s area.', sylChk(x, { k: k }), L === 1 ? vennView(x) : null);
  });

  // =================================================================== Unit 6: Syllogisms in Everyday Form
  var SYN = [['doctors', 'physicians'], ['lawyers', 'attorneys'], ['students', 'pupils'], ['babies', 'infants'], ['cars', 'automobiles'], ['sailors', 'mariners'], ['pharmacists', 'druggists']];
  G('trad.reducing-terms', function (R, ctx) {
    var L = lvl(ctx), r = R.next();
    if (r < 0.3) {
      var syn = R.pick(SYN), t2 = R.sample(PEOPLE, 2), form = R.pick(VALID), fm = LG().fromForm(form, pl(t2[0]), pl(t2[1]), syn[0]), fm2 = LG().fromForm(form, pl(t2[0]), pl(t2[1]), syn[1]);
      return P('How many different terms does this argument really use?' + argBox([fm.major, fm2.minor], fm.conclusion), mc('3', ['4', '5', '6']),
        ['The words <i>' + syn[0] + '</i> and <i>' + syn[1] + '</i> name the same class: they are synonyms.', 'Replace one by the other and only three terms remain: ' + pl(t2[0]) + ', ' + pl(t2[1]) + ' and ' + syn[0] + '.', 'So it uses <b>3</b> terms, and it can be tested as a syllogism (it is ' + form + ', ' + LG().FORM_NAMES[form] + ').'],
        'Do any two words name the same class?', { kind: 'syn', count: 3, major: fm.major, minor: fm.minor, conclusion: fm.conclusion });
    }
    var form2 = R.pick(VALID), x = makeSyl(R, form2), which = R.coin() ? 'major' : 'minor', orig = x[which];
    var useCp = L === 3 && 'AO'.indexOf(letterOf(orig)) >= 0 && R.coin();
    var im = LG().immediate(orig), shown = useCp ? im.contraposition.text : im.obversion.text;
    var lines = which === 'major' ? [shown, x.minor] : [x.major, shown], pc = LG().parseCat(shown);
    if (L === 3 && r < 0.65) {
      return P('Reduce this argument to three terms, then give its mood and figure in standard form.' + argBox(lines, x.conclusion), { t: 'multi', parts: [{ label: 'Mood', a: { t: 'text', v: [x.sy.mood] } }, { label: 'Figure', a: { t: 'num', v: String(x.sy.figure), form: 'int' } }] },
        ['<i>' + shown + '</i> uses a complement. ' + (useCp ? 'Contraposition' : 'Obversion') + ' turns it into <i>' + orig + '</i>, with the same meaning.', 'Now the terms are ' + x.S + ' (S), ' + x.P + ' (P) and ' + x.M + ' (M).', 'Standard form: <i>' + x.major + '</i> / <i>' + x.minor + '</i> / ∴ <i>' + x.conclusion + '</i>: mood <b>' + x.sy.mood + '</b>, figure <b>' + x.sy.figure + '</b>.'],
        'Find the term with "non-" and rewrite that premise so the "non-" disappears.', sylChk(x, { kind: 'reduce-form', shown: shown, orig: orig }));
    }
    var n = which === 'major' ? 1 : 2, q2 = { A: 'E', E: 'A', I: 'O', O: 'I' }[pc.f], oc = LG().parseCat(orig);
    var wr = useCp ? ['Premise ' + n + ' becomes: ' + cat(oc.f, oc.p, oc.s), 'Premise ' + n + ' becomes: ' + cat(q2, oc.s, oc.p), 'It cannot be reduced: it commits the fallacy of four terms']
      : ['Premise ' + n + ' becomes: ' + cat(pc.f, pc.s, LG().complement(pc.p)), 'Premise ' + n + ' becomes: ' + cat('AO'.indexOf(oc.f) >= 0 ? oc.f : { E: 'A', I: 'O' }[oc.f], oc.p, oc.s), 'It cannot be reduced: it commits the fallacy of four terms'];
    return P('This argument seems to have four terms. Which rewrite brings it down to three?' + argBox(lines, x.conclusion), mc('Premise ' + n + ' becomes: ' + orig, wr),
      ['The term <i>' + (/non-/.test(pc.p) ? pc.p : pc.s) + '</i>' + (useCp ? ' (and <i>' + pc.s + '</i>)' : '') + ' is the complement of a term used elsewhere, so the argument does not really have four terms.',
        (useCp ? 'Contraposition (valid for ' + pc.f + ')' : 'Obversion (valid for every form)') + ' of <i>' + shown + '</i> gives <i>' + orig + '</i>, which means the same and uses only the three terms.',
        'With three terms it is ' + x.sy.form + ' (' + (x.sy.name || '') + '), a valid syllogism.'],
      'Obversion changes the quality and swaps a predicate for its complement; it can remove a "non-".', sylChk(x, { kind: 'reduce', shown: shown, orig: orig }));
  });

  var EV = {
    A: [function (s, p) { return 'Every ' + bare(s) + ' is ' + sg(p); }, function (s, p) { return 'Only ' + pl(p) + ' are ' + pl(s); }, function (s, p) { return 'Whoever is ' + sg(s) + ' is ' + sg(p); }, function (s, p) { return 'Any ' + bare(s) + ' is ' + sg(p); }],
    E: [function (s, p) { return 'No ' + bare(s) + ' is ' + sg(p); }, function (s, p) { return 'None of the ' + pl(s) + ' are ' + pl(p); }, function (s, p) { return cap(pl(s)) + ' are never ' + pl(p); }],
    I: [function (s, p) { return 'A few ' + pl(s) + ' are ' + pl(p); }, function (s, p) { return 'There are ' + pl(s) + ' who are ' + pl(p); }, function (s, p) { return 'At least one ' + bare(s) + ' is ' + sg(p); }],
    O: [function (s, p) { return 'Not every ' + bare(s) + ' is ' + sg(p); }, function (s, p) { return 'Not all ' + pl(s) + ' are ' + pl(p); }, function (s, p) { return 'There are ' + pl(s) + ' who are not ' + pl(p); }]
  };
  function findT(name) { for (var i = 0; i < PEOPLE.length; i++) if (pl(PEOPLE[i]) === name) return PEOPLE[i]; return null; }
  function everyday(R, st, L) { var c = LG().parseCat(st), list = EV[c.f], k = c.f === 'A' && L >= 2 && R.chance(0.5) ? 1 : R.int(0, list.length - 1); return { text: list[k](findT(c.s), findT(c.p)), only: c.f === 'A' && k === 1 }; }
  G('trad.everyday-syllogisms', function (R, ctx) {
    var L = lvl(ctx), form = R.chance(0.5) ? R.pick(VALID) : R.pick(formsWhere(function (y) { return !y.valid && !y.conditional; })), x = makeSyl(R, form);
    var e1 = everyday(R, x.major, L), e2 = everyday(R, x.minor, L), e3 = everyday(R, x.conclusion, L), order = R.coin() ? [e1, e2] : [e2, e1];
    var passage = R.chance(L === 1 ? 0.3 : 0.5) ? cap(e3.text) + ', since ' + low(order[0].text) + ' and ' + low(order[1].text) + '.' : cap(order[0].text) + '. ' + cap(order[1].text) + '. ' + R.pick(['So ', 'Therefore ', 'Hence ']) + low(e3.text) + '.';
    var v = x.sy.valid, steps = ['Translate each statement into standard form:'];
    [[e1, x.major], [e2, x.minor], [e3, x.conclusion]].forEach(function (pr) { steps.push('"' + pr[0].text + '" → <i>' + pr[1] + '</i>' + (pr[0].only ? ' ("only" introduces the predicate, so the terms swap).' : '.')); });
    steps.push('Standard form: ' + x.sy.form + (x.sy.name ? ' (' + x.sy.name + ')' : '') + '.');
    steps.push(v ? 'It is one of the valid forms: <b>valid</b>.' : '<b>Invalid</b>: ' + x.sy.broken.map(function (z) { return FALLACY[z].toLowerCase(); }).join(', ') + '.');
    return P('Is this argument valid?' + box([passage]), keep(['Valid', 'Invalid'], v ? 0 : 1), steps,
      'Translate first ("only" swaps the terms), then test the standard form.', sylChk(x, { passage: passage }));
  });

  G('trad.enthymemes', function (R, ctx) {
    var L = lvl(ctx), form = R.pick(VALID), x = makeSyl(R, form), terms = [x.S, x.P, x.M];
    function validWith(maj, min, con) { var y = LG().syllogism({ premises: [maj, min], conclusion: con }); return !!(y && !y.error && (y.valid || y.conditional)); }
    if (L === 3 && R.chance(0.4)) {
      var cands = [];
      FORMS.forEach(function (f) { [[x.S, x.P], [x.P, x.S]].forEach(function (pq) { var c = cat(f, pq[0], pq[1]); if (c !== x.conclusion && !validWith(x.major, x.minor, c)) cands.push(c); }); });
      return P('What conclusion follows validly from these premises? Supply the missing conclusion.' + box([x.major, x.minor]), mc(x.conclusion, R.sample(cands, 3)),
        ['The middle term <i>' + x.M + '</i> appears in both premises; the conclusion links the other two, <i>' + x.S + '</i> and <i>' + x.P + '</i>.', 'With <i>' + x.conclusion + '</i> the syllogism is ' + form + ' (' + LG().FORM_NAMES[form] + '), which is valid.', 'Each other choice gives an invalid form (for example by converting an A or O, or by drawing the wrong quality).'],
        'Which two terms are not the middle term? The conclusion is about them.', { kind: 'enth-c', major: x.major, minor: x.minor, answer: x.conclusion, wrongs: [] });
    }
    var miss = R.coin() ? 'major' : 'minor', kept = miss === 'major' ? x.minor : x.major, pair = miss === 'major' ? [x.M, x.P] : [x.S, x.M];
    var bad = [];
    FORMS.forEach(function (f) { [pair, [pair[1], pair[0]]].forEach(function (pq) { var c = cat(f, pq[0], pq[1]); if (c !== x[miss] && !validWith(c, kept, x.conclusion)) bad.push(c); }); });
    var right = x[miss], spoken = R.coin() ? kept + ', so ' + low(x.conclusion) + '.' : cap(x.conclusion) + ', because ' + low(kept) + '.';
    return P('Which unstated premise makes this enthymeme a valid syllogism?' + box([spoken]), mc(right, R.sample(bad, 3)),
      ['The stated premise uses <i>' + LG().parseCat(kept).s + '</i> and <i>' + LG().parseCat(kept).p + '</i>; the conclusion uses <i>' + x.S + '</i> and <i>' + x.P + '</i>. The missing premise must link <i>' + pair[0] + '</i> and <i>' + pair[1] + '</i>.',
        'With <i>' + right + '</i> the argument is ' + form + ' (' + LG().FORM_NAMES[form] + '), which is valid.', 'Each other choice leaves a broken rule (check the distribution of the middle term and the quality).'],
      'The missing premise uses the term the conclusion lacks and the term the stated premise lacks.', { kind: 'enth', kept: kept, conclusion: x.conclusion, answer: right, miss: miss });
  });

  G('trad.sorites', function (R, ctx) {
    var L = lvl(ctx), n = L === 1 ? 3 : R.int(3, 4), ts = R.sample(PEOPLE, n + 1).map(pl), neg = R.chance(L === 1 ? 0.3 : 0.5);
    var prem = []; for (var i = 0; i < n; i++) prem.push(neg && i === n - 1 ? cat('E', ts[i], ts[i + 1]) : cat('A', ts[i], ts[i + 1]));
    var concl = neg ? cat('E', ts[0], ts[n]) : cat('A', ts[0], ts[n]);
    var shown = prem.map(function (p) { var c = LG().parseCat(p); return c.f === 'E' && R.coin() ? cat('E', c.p, c.s) : p; });
    var disp = L === 1 ? shown : R.shuffle(shown);
    if (L >= 2 && R.chance(0.35)) {
      var inter = cat(neg && n === 2 ? 'E' : 'A', ts[0], ts[2]);
      return P('In this sorites, what is the first hidden intermediate conclusion (linking <i>' + ts[0] + '</i> to the next class in the chain)?' + box(disp), mc(inter, [cat('A', ts[2], ts[0]), cat('E', ts[0], ts[2]), cat('A', ts[1], ts[0])]),
        ['Line the premises up as a chain: ' + ts.join(' → ') + (neg ? ' (the last link excludes)' : '') + '.', '<i>' + prem[0] + '</i> and <i>' + prem[1] + '</i> form a valid syllogism (Barbara) with the conclusion <i>' + inter + '</i>.', 'That intermediate conclusion becomes a premise of the next link.'],
        'Start with the premise about ' + ts[0] + ' and find the premise that shares its predicate.', { kind: 'sorites', premises: prem, answer: inter, wrongs: [cat('A', ts[2], ts[0]), cat('E', ts[0], ts[2]), cat('A', ts[1], ts[0])] });
    }
    var wr = neg ? [cat('A', ts[0], ts[n]), cat('A', ts[n], ts[0]), cat('O', ts[n], ts[0])] : [cat('A', ts[n], ts[0]), cat('E', ts[0], ts[n]), cat('O', ts[n], ts[0])];
    var steps = ['Arrange the premises into a chain: ' + prem.map(function (p) { return '<i>' + p + '</i>'; }).join(', then ') + '.'];
    for (var j = 2; j <= n; j++) steps.push('Link ' + (j - 1) + ': from the conclusion so far and <i>' + prem[j - 1] + '</i>, get <i>' + (neg && j === n ? cat('E', ts[0], ts[j]) : cat('A', ts[0], ts[j])) + '</i> (' + (neg && j === n ? 'Celarent' : 'Barbara') + ').');
    steps.push('Each link is a valid syllogism, so the whole sorites is valid: <b>' + concl + '</b>.');
    return P('What conclusion follows from all of these premises together?' + box(disp), mc(concl, wr), steps,
      'Find the premise whose subject appears in no other premise\'s predicate: the chain starts there.', { kind: 'sorites', premises: prem, answer: concl, wrongs: wr });
  });

  // =================================================================== Unit 7: Hypothetical and Disjunctive Syllogisms
  // clauses for conditionals "If a, then c": negations written out; alt = another way c could come about
  var CONDS = [
    { a: 'it rains on Saturday', na: 'it does not rain on Saturday', c: 'the picnic moves indoors', nc: 'the picnic does not move indoors', alt: 'the park could be closed for repairs, which would also move the picnic indoors' },
    { a: 'Maya finishes her chores', na: 'Maya does not finish her chores', c: 'Maya goes to the movies', nc: 'Maya does not go to the movies', alt: 'her aunt could take her as a birthday treat, chores or not' },
    { a: 'the dog hears the doorbell', na: 'the dog does not hear the doorbell', c: 'the dog barks', nc: 'the dog does not bark', alt: 'a squirrel could run past the window' },
    { a: 'the shape is a square', na: 'the shape is not a square', c: 'the shape has four sides', nc: 'the shape does not have four sides', alt: 'it could be a rectangle or a kite' },
    { a: 'the number is divisible by 4', na: 'the number is not divisible by 4', c: 'the number is even', nc: 'the number is not even', alt: 'the number could be 6, which is even but not divisible by 4' },
    { a: 'the bus is late', na: 'the bus is not late', c: 'Ana misses the first bell', nc: 'Ana does not miss the first bell', alt: 'she could oversleep even when the bus is on time' },
    { a: 'the field is flooded', na: 'the field is not flooded', c: 'the game is postponed', nc: 'the game is not postponed', alt: 'the referee could be sick' },
    { a: 'Sam forgets his lunch', na: 'Sam does not forget his lunch', c: 'Sam buys lunch at school', nc: 'Sam does not buy lunch at school', alt: 'the cafeteria could be serving his favorite pizza' },
    { a: 'the store is open', na: 'the store is not open', c: 'the lights are on', nc: 'the lights are not on', alt: 'the staff could be cleaning after closing time' },
    { a: 'the cake stays in the oven too long', na: 'the cake does not stay in the oven too long', c: 'the cake burns', nc: 'the cake does not burn', alt: 'the oven could be set too hot' },
    { a: 'Priya wins the spelling bee', na: 'Priya does not win the spelling bee', c: 'Priya goes to the state final', nc: 'Priya does not go to the state final', alt: 'the top three spellers could all be invited' },
    { a: 'the temperature drops below freezing', na: 'the temperature does not drop below freezing', c: 'the puddles freeze', nc: 'the puddles do not freeze', alt: 'someone could pour liquid nitrogen in a science demonstration' }
  ];
  function ifThen(o) { return 'If ' + o.a + ', then ' + o.c + '.'; }
  // propositional checking with the kit's truth tables (letters p, q, r, s)
  function follows(prem, con) { return LG().validity(prem, con).valid; }
  function whatFollows(R, prem, cands, texts, extra) { // cands: formulas; texts: the English for each; one entailed or none
    var hits = cands.map(function (c) { return follows(prem, c); }), n = hits.filter(Boolean).length;
    if (n > 1) throw new Error('more than one choice follows');
    var ch = texts.slice(), v = n === 1 ? hits.indexOf(true) : ch.length; ch.push('Nothing follows about either part');
    return { a: { t: 'mc', choices: ch.map(function (c) { return cap(c); }), v: v }, chk: { kind: 'prop', premises: prem, cands: cands, answer: n === 1 ? cands[v] : null } };
  }

  var HYPW = [
    { w: function (o) { return 'If ' + o.a + ', then ' + o.c + '.'; } }, { w: function (o) { return cap(o.c) + ' if ' + o.a + '.'; } },
    { w: function (o) { return cap(o.a) + ' only if ' + o.c + '.'; }, only: true }, { w: function (o) { return cap(o.c) + ', provided that ' + o.a + '.'; }, lv: 2 },
    { w: function (o) { return 'Whenever ' + o.a + ', ' + o.c + '.'; }, lv: 2 }, { w: function (o) { return 'That ' + o.a + ' is sufficient for the fact that ' + o.c + '.'; }, lv: 3 },
    { w: function (o) { return 'That ' + o.c + ' is necessary for the fact that ' + o.a + '.'; }, lv: 3, nec: true }
  ];
  G('trad.hypothetical-propositions', function (R, ctx) {
    var L = lvl(ctx), o = R.pick(CONDS), r = R.next(), pool = HYPW.filter(function (x, i) { return (x.lv || 1) <= L && (r < 0.5 || i > 0); }), w = (L >= 2 && R.chance(0.5)) ? (R.coin() ? HYPW[2] : R.pick(pool)) : R.pick(pool), sent = w.w(o);
    var note = w.only ? '"Only if" introduces the consequent: "A only if C" means "If A, then C".' : w.nec ? 'A necessary condition is the consequent: "C is necessary for A" means "If A, then C".' : 'The clause after "if" (or "whenever", "provided that", or the sufficient condition) is the antecedent.';
    if (r < 0.5) {
      var askA = R.coin();
      return P('What is the <b>' + (askA ? 'antecedent' : 'consequent') + '</b> of this hypothetical proposition?' + box([sent]), mc(cap(askA ? o.a : o.c), [cap(askA ? o.c : o.a), cap(o.na), cap(o.nc)]),
        [note, 'So it says: if ' + o.a + ', then ' + o.c + '.', 'The ' + (askA ? 'antecedent' : 'consequent') + ' is <i>' + (askA ? o.a : o.c) + '</i>.'],
        'Rewrite it as "If …, then …" first.', { kind: 'hyp', a: o.a, c: o.c, ask: askA ? 'a' : 'c' });
    }
    var right = ifThen(o), wr = ['If ' + o.c + ', then ' + o.a + '.', 'If ' + o.na + ', then ' + o.nc + '.', cap(o.a) + ' and ' + o.c + '.'];
    return P('Which statement says the same as this one?' + box([sent]), mc(right, wr),
      [note, 'So it means <i>' + right + '</i>', 'It does not mean the converse (if ' + o.c + ', then ' + o.a + '): that is a different claim.'],
      'Which clause is the condition that guarantees the other?', { kind: 'hyp-same', a: o.a, c: o.c });
  });

  var SILLY = [
    { a: 'the moon is made of cheese', c: 'mice can live on the moon' }, { a: 'cats can fly', c: 'cats can reach the roof without a ladder' },
    { a: 'it snows in July in Florida', c: 'Florida children build snowmen in July' }, { a: 'pigs can talk', c: 'pigs can tell us their names' },
    { a: 'fish can climb trees', c: 'fish can pick apples' }, { a: 'the ocean is made of lemonade', c: 'the ocean tastes sweet' },
    { a: 'dogs can read', c: 'dogs can read the newspaper' }, { a: 'triangles have five sides', c: 'triangles have more sides than squares' },
    { a: 'the sun rises in the west', c: 'sunrise can be seen from a west window' }, { a: 'rocks can swim', c: 'rocks can cross a river on their own' },
    { a: 'snow is hot', c: 'snow can melt butter' }, { a: 'every horse has wings', c: 'every horse can fly' }
  ];
  G('trad.modus-ponens', function (R, ctx) {
    var L = lvl(ctx), o = R.pick(CONDS), r = R.next();
    if (L >= 2 && r < 0.3) {
      var s = R.pick(SILLY);
      return P('True or false: this argument is valid.' + argBox(['If ' + s.a + ', then ' + s.c + '.', cap(s.a) + '.'], cap(s.c) + '.'), tf(true),
        ['The form is: If P, then Q; P; so Q. That is modus ponens, a valid form.', 'The second premise is false, so the argument is unsound. But validity asks only whether true premises would force the conclusion, and they would. So the statement is <b>true</b>.'],
        'Ask about the form, not about whether the premises are true.', { kind: 'prop', premises: ['p → q', 'p'], cands: ['q'], answer: 'q', tf: true });
    }
    var form = L === 1 ? 'mp' : R.pick(['mp', 'mp', 'ac']);
    var prem = ['p → q', form === 'mp' ? 'p' : 'q'], wf = whatFollows(R, prem, form === 'mp' ? ['q', '¬q', '¬p'] : ['p', '¬p', '¬q'], form === 'mp' ? [o.c, o.nc, o.na] : [o.a, o.na, o.nc]);
    var steps = form === 'mp' ? ['The form is: If P, then Q; P. This is modus ponens (affirming the antecedent).', 'The antecedent happens, so the consequent must happen too: <b>' + o.c + '</b>.']
      : ['The second premise affirms the consequent, not the antecedent.', 'That ' + o.c + ' does not tell us why: ' + o.alt + '.', 'So <b>nothing follows</b> about whether ' + o.a + '.'];
    return P('What follows from these premises?' + box([ifThen(o), cap(form === 'mp' ? o.a : o.c) + '.']), wf.a, steps,
      'Which part of the conditional does the second premise affirm?', wf.chk);
  });

  G('trad.modus-tollens', function (R, ctx) {
    var L = lvl(ctx), o = R.pick(CONDS), r = R.next();
    if (r < 0.3) {
      return P('Is this argument valid?' + argBox([ifThen(o), cap(o.nc) + '.'], cap(o.na) + '.'), keep(['Valid', 'Invalid'], 0),
        ['The form is: If P, then Q; not Q; so not P. This is modus tollens (denying the consequent).', 'The consequent did not happen, so the antecedent cannot have happened either: ' + o.na + '. It is <b>valid</b>.'],
        'Could the premises be true and the conclusion false?', { kind: 'prop', premises: ['p → q', '¬q'], cands: ['¬p'], answer: '¬p', valid: true });
    }
    var form = L === 1 ? 'mt' : R.pick(['mt', 'mt', 'da']);
    var prem = ['p → q', form === 'mt' ? '¬q' : '¬p'], wf = whatFollows(R, prem, form === 'mt' ? ['¬p', 'p', 'q'] : ['¬q', 'q', 'p'], form === 'mt' ? [o.na, o.a, o.c] : [o.nc, o.c, o.a]);
    var steps = form === 'mt' ? ['The form is: If P, then Q; not Q. This is modus tollens (denying the consequent).', 'If ' + o.a + ' had happened, ' + o.c + ' would have happened. It did not, so <b>' + o.na + '</b>.']
      : ['The second premise denies the antecedent, not the consequent.', 'Even without the antecedent, the consequent can still happen: ' + o.alt + '.', 'So <b>nothing follows</b> about whether ' + o.c + '.'];
    return P('What follows from these premises?' + box([ifThen(o), cap(form === 'mt' ? o.nc : o.na) + '.']), wf.a, steps,
      'Which part of the conditional does the second premise deny?', wf.chk);
  });

  var HF = ['Modus ponens (valid)', 'Modus tollens (valid)', 'Affirming the consequent (invalid)', 'Denying the antecedent (invalid)'];
  G('trad.hypothetical-fallacies', function (R, ctx) {
    var L = lvl(ctx), o = R.pick(CONDS), k = L === 1 ? R.pick([2, 3, 2, 3, 0, 1]) : R.int(0, 3);
    if (R.chance(0.45)) {
      var want = R.int(0, 3), args = [0, 1, 2, 3].map(function (j) { return cap([o.a, o.nc, o.c, o.na][j]) + ', so ' + [o.c, o.na, o.a, o.nc][j] + '.'; });
      return P('The rule is: <i>' + ifThen(o) + '</i> Which argument from it is ' + ['modus ponens', 'modus tollens', 'affirming the consequent', 'denying the antecedent'][want] + '?', mc(args[want], args.filter(function (x, j) { return j !== want; })),
        ['Modus ponens affirms the antecedent; modus tollens denies the consequent; affirming the consequent and denying the antecedent run them backward.', 'So the answer is: <i>' + args[want] + '</i>' + (want >= 2 ? ' This is invalid: ' + o.alt + '.' : ' This is valid.')],
        'Antecedent: "' + o.a + '". Consequent: "' + o.c + '".', { kind: 'prop', premises: ['p → q', ['p', '¬q', 'q', '¬p'][want]], cands: [['q', '¬p', 'p', '¬q'][want]], answer: want < 2 ? ['q', '¬p'][want] : null, valid: want < 2 });
    }
    var p2 = [o.a, o.nc, o.c, o.na][k], con = [o.c, o.na, o.a, o.nc][k];
    var prem = ['p → q', ['p', '¬q', 'q', '¬p'][k]], cf = ['q', '¬p', 'p', '¬q'][k];
    var steps = [['The second premise affirms the antecedent and the conclusion affirms the consequent: modus ponens, valid.'],
      ['The second premise denies the consequent and the conclusion denies the antecedent: modus tollens, valid.'],
      ['The second premise affirms the consequent and the conclusion affirms the antecedent: <b>affirming the consequent</b>.', 'Counterexample: ' + o.alt + '. Then ' + o.c + ' even though it is false that ' + o.a + '.'],
      ['The second premise denies the antecedent and the conclusion denies the consequent: <b>denying the antecedent</b>.', 'Counterexample: ' + o.alt + '. Then ' + o.c + ' anyway.']][k];
    return P('Name the form of this argument.' + argBox([ifThen(o), cap(p2) + '.'], cap(con) + '.'), keep(HF, k), steps,
      'Does the second premise affirm or deny, and which part: the antecedent or the consequent?', { kind: 'prop', premises: prem, cands: [cf], answer: k < 2 ? cf : null, valid: k < 2 });
  });

  var CHAINS3 = [
    ['the alarm rings', 'Sam wakes up', 'Sam catches the early bus', 'Sam is on time for first period'], ['it snows tonight', 'school opens late', 'the math quiz moves to Friday', 'Kim has an extra day to study'],
    ['the team wins today', 'the team reaches the final', 'the team plays on Saturday', 'the family drives to the stadium'], ['Mia saves ten dollars a week', 'Mia has enough money by June', 'Mia buys the bike', 'Mia rides to the pool all summer'],
    ['the seeds get water', 'the seeds sprout', 'the garden has seedlings by May'], ['the power goes out', 'the freezer stops', 'the ice cream melts'],
    ['the bridge closes', 'traffic uses Main Street', 'Main Street is crowded'], ['Leo learns his lines', 'Leo knows his part', 'the rehearsal goes smoothly']];
  G('trad.pure-hypothetical', function (R, ctx) {
    var L = lvl(ctx), ch = R.pick(L === 3 ? CHAINS3.filter(function (c) { return c.length === 4; }).concat(CHAINS3) : CHAINS3), long = L === 3 && ch.length === 4 && R.coin(), r = R.next();
    var ifs = function (a, b) { return 'If ' + a + ', then ' + b + '.'; };
    if (L >= 2 && r < 0.35) { // links that do not chain
      var prem0 = [ifs(ch[0], ch[1]), ifs(ch[2], ch[1])];
      var wf0 = whatFollows(R, ['p → q', 'r → q'], ['p → r', 'r → p'], [ifs(ch[0], ch[2]).replace(/\.$/, ''), ifs(ch[2], ch[0]).replace(/\.$/, '')]);
      return P('What follows from these premises?' + box(prem0), wf0.a,
        ['Both conditionals have the same consequent (' + ch[1] + '). The links run into the middle from both sides instead of through it.', 'Nothing connects ' + ch[0] + ' to ' + ch[2] + ', so <b>nothing follows</b> about them.'],
        'Does the consequent of one conditional match the antecedent of the other?', wf0.chk);
    }
    var n = long ? 4 : 3, prem = [], fl = ['p', 'q', 'r', 's'];
    for (var i = 0; i < n - 1; i++) prem.push(ifs(ch[i], ch[i + 1]));
    var disp = L >= 2 ? R.shuffle(prem) : prem, last = ch[n - 1];
    var pf = []; for (var j = 0; j < n - 1; j++) pf.push(fl[j] + ' → ' + fl[j + 1]);
    var wf = whatFollows(R, pf, [fl[0] + ' → ' + fl[n - 1], fl[n - 1] + ' → ' + fl[0], '¬' + fl[0] + ' → ¬' + fl[n - 1]], [ifs(ch[0], last).replace(/\.$/, ''), ifs(last, ch[0]).replace(/\.$/, ''), ('If it is not true that ' + ch[0] + ', then it is not true that ' + last)]);
    return P('What follows from these premises?' + box(disp), wf.a,
      ['Put the links in order: ' + ch.slice(0, n).join(' → ') + '.', 'Each consequent is the next antecedent, so the chain runs from the first antecedent to the last consequent: <b>if ' + ch[0] + ', then ' + last + '</b>.', 'The reverse (if ' + last + ', then ' + ch[0] + ') does not follow.'],
      'Find the clause that is never a consequent: the chain starts there.', wf.chk);
  });

  var DISJ = [
    { p: 'the keys are in the car', np: 'the keys are not in the car', q: 'the keys are on the hook by the door', nq: 'the keys are not on the hook by the door' },
    { p: 'Ana is at soccer practice', np: 'Ana is not at soccer practice', q: 'Ana is at the library', nq: 'Ana is not at the library' },
    { p: 'the noise came from the attic', np: 'the noise did not come from the attic', q: 'the noise came from the garage', nq: 'the noise did not come from the garage' },
    { p: 'we take the train', np: 'we do not take the train', q: 'we take the bus', nq: 'we do not take the bus' },
    { p: 'the package went to our old address', np: 'the package did not go to our old address', q: 'the package is still at the post office', nq: 'the package is not still at the post office' },
    { p: 'the light bulb is burned out', np: 'the light bulb is not burned out', q: 'the lamp is unplugged', nq: 'the lamp is not unplugged' },
    { p: 'the class reads a novel this month', np: 'the class does not read a novel this month', q: 'the class reads a play this month', nq: 'the class does not read a play this month' }
  ];
  G('trad.disjunctive-syllogism', function (R, ctx) {
    var L = lvl(ctx), d = R.pick(DISJ), sw = R.coin(), P1 = sw ? d.q : d.p, Q1 = sw ? d.p : d.q, nP = sw ? d.nq : d.np, nQ = sw ? d.np : d.nq, r = R.next();
    var orS = 'Either ' + d.p + ' or ' + d.q + '.';
    if (L >= 2 && r < 0.3) {
      var aff = R.coin();
      return P('Name the form of this argument.' + argBox([orS, cap(aff ? P1 : nP) + '.'], cap(aff ? nQ : Q1) + '.'), keep(['Disjunctive syllogism (valid)', 'Affirming a disjunct (invalid)'], aff ? 1 : 0),
        aff ? ['The second premise affirms one disjunct and the conclusion denies the other: affirming a disjunct.', 'In logic "or" is inclusive: both could be true. So it is <b>invalid</b> (unless the speaker has ruled out both).'] : ['The second premise denies one disjunct, so the other must be true: <b>disjunctive syllogism</b>, valid.'],
        'Does the second premise deny a disjunct or affirm one?', { kind: 'prop', premises: ['p ∨ q', aff ? 'p' : '¬p'], cands: [aff ? '¬q' : 'q'], answer: aff ? null : 'q', valid: !aff });
    }
    var deny = L === 1 ? true : R.chance(0.6);
    var wf = whatFollows(R, ['p ∨ q', deny ? '¬p' : 'p'], ['q', '¬q', deny ? 'p' : '¬p'], [Q1, nQ, deny ? P1 : nP]);
    return P('What follows from these premises?' + box([orS, cap(deny ? nP : P1) + '.']), wf.a,
      deny ? ['At least one of the two is true. One of them (' + P1 + ') is ruled out.', 'So the other must be true: <b>' + Q1 + '</b>. This is disjunctive syllogism.'] : ['The premise affirms one disjunct. But "or" in logic is inclusive: both could be true.', 'So <b>nothing follows</b> about the other. Concluding that it is false would be affirming a disjunct.'],
      deny ? 'If one choice is out, what is left?' : 'Could both be true at once?', wf.chk);
  });

  var NOTBOTH = [
    { p: 'Ben is at the game', np: 'Ben is not at the game', q: 'Ben is at home', nq: 'Ben is not at home' },
    { p: 'the traffic light is red', np: 'the traffic light is not red', q: 'the traffic light is green', nq: 'the traffic light is not green' },
    { p: 'Kim is the team captain', np: 'Kim is not the team captain', q: 'Kim is the team treasurer', nq: 'Kim is not the team treasurer', rule: 'club rules say one person cannot hold both jobs' },
    { p: 'the meeting is on Monday', np: 'the meeting is not on Monday', q: 'the meeting is on Tuesday', nq: 'the meeting is not on Tuesday' },
    { p: 'Jo plays trumpet in the band', np: 'Jo does not play trumpet in the band', q: 'Jo plays drums in the band', nq: 'Jo does not play drums in the band' },
    { p: 'the number is odd', np: 'the number is not odd', q: 'the number is divisible by 2', nq: 'the number is not divisible by 2' }
  ];
  G('trad.conjunctive-syllogism', function (R, ctx) {
    var L = lvl(ctx), d = R.pick(NOTBOTH), sw = R.coin(), P1 = sw ? d.q : d.p, Q1 = sw ? d.p : d.q, nP = sw ? d.nq : d.np, nQ = sw ? d.np : d.nq;
    var nb = 'It is not the case that both ' + d.p + ' and ' + d.q + '.', aff = L === 1 ? R.chance(0.75) : R.coin();
    var wf = whatFollows(R, ['¬(p ∧ q)', aff ? 'p' : '¬p'], ['¬q', 'q', aff ? '¬p' : 'p'], [nQ, Q1, aff ? nP : P1]);
    return P('What follows from these premises?' + box([nb, cap(aff ? P1 : nP) + '.']), wf.a,
      aff ? ['"Not both" means at most one of them is true. One of them is true: ' + P1 + '.', 'So the other must be false: <b>' + nQ + '</b>. This is the conjunctive syllogism.'] : ['"Not both" allows both to be false. Knowing that ' + nP + ' leaves the other open.', 'So <b>nothing follows</b> about it. Concluding that ' + Q1 + ' would be a mistake.'],
      '"Not both" rules out only the case where both are true.', wf.chk);
  });

  var DIL = [
    { p: 'we leave early', np: 'we do not leave early', q: 'we wait at the gate for an hour', nq: 'we do not wait at the gate for an hour', r: 'we leave late', nr: 'we do not leave late', s: 'we miss the opening song', ns: 'we do not miss the opening song',
      horns: 'We could leave at a middle time: early enough for the song, but not so early that we wait an hour.', grasp: 'Leaving early does not mean waiting an hour: this year the gates open early, so we can walk straight in.',
      counter: 'If we leave early, we get the best seats, and if we leave late, we skip the long line. We leave early or late, so we get the best seats or skip the line.' },
    { p: 'Jo studies tonight', np: 'Jo does not study tonight', q: 'Jo misses the concert', nq: 'Jo does not miss the concert', r: 'Jo goes to the concert', nr: 'Jo does not go to the concert', s: 'Jo does poorly on the quiz', ns: 'Jo does not do poorly on the quiz',
      horns: null, gh: 2, grasp: 'Going to the concert will not make Jo do poorly on the quiz: Jo has reviewed every day this week.',
      counter: 'If Jo studies tonight, Jo does well on the quiz, and if Jo goes to the concert, Jo hears a favorite band. Either way, something good happens.' },
    { p: 'the club raises its dues', np: 'the club does not raise its dues', q: 'some members quit', nq: 'no members quit', r: 'the club keeps its dues the same', nr: 'the club does not keep its dues the same', s: 'the club cannot buy new equipment', ns: 'the club can buy new equipment',
      horns: 'The club could lower its dues, draw in many new members, and raise more money in total.', grasp: 'Raising the dues will not make members quit: they voted last month to pay more for better gear.',
      counter: 'If the club raises its dues, it can buy new equipment, and if it keeps them the same, every member stays. Either way, the club gains something.' },
    { p: 'the coach plays Ana at forward', np: 'the coach does not play Ana at forward', q: 'the defense is weaker', nq: 'the defense is not weaker', r: 'the coach plays Ana on defense', nr: 'the coach does not play Ana on defense', s: 'the attack is weaker', ns: 'the attack is not weaker',
      horns: 'The coach could play Ana in midfield, where she helps both the attack and the defense.', grasp: 'Playing Ana at forward will not weaken the defense: Theo is back from his injury and can take her spot.',
      counter: 'If Ana plays forward, the attack is stronger, and if she plays defense, the defense is stronger. Either way, part of the team gets stronger.' },
    { p: 'the family drives to Grandma\'s', np: 'the family does not drive to Grandma\'s', q: 'the trip takes two days', nq: 'the trip does not take two days', r: 'the family flies to Grandma\'s', nr: 'the family does not fly to Grandma\'s', s: 'the trip costs more', ns: 'the trip does not cost more',
      horns: 'The family could take the train, which is fairly quick and not expensive.', gh: 2, grasp: 'Flying will not cost more: the family has saved travel points that cover the tickets.',
      counter: 'If the family drives, they see the sights along the way, and if they fly, they get two extra days at Grandma\'s. Either way, the trip has a bonus.' },
    { p: 'Sam admits that he broke the vase', np: 'Sam does not admit that he broke the vase', q: 'Sam loses his allowance for a week', nq: 'Sam does not lose his allowance for a week', r: 'Sam keeps quiet about the vase', nr: 'Sam does not keep quiet about the vase', s: 'Sam feels guilty', ns: 'Sam does not feel guilty',
      contra: true, horns: null, grasp: 'Admitting it will not cost Sam his allowance: his parents have said that an honest confession will not be punished.',
      counter: 'If Sam admits it, he has a clear conscience, and if he keeps quiet, he keeps his allowance. Either way, Sam gains something.' },
    { p: 'Lena takes the early shift', np: 'Lena does not take the early shift', q: 'Lena misses breakfast with her family', nq: 'Lena does not miss breakfast with her family', r: 'Lena takes the late shift', nr: 'Lena does not take the late shift', s: 'Lena misses dinner with her family', ns: 'Lena does not miss dinner with her family',
      horns: 'Lena could ask for the middle shift, from ten to six, and be home for both meals.', grasp: 'The early shift does not mean missing breakfast: the family could eat together at six.',
      counter: 'If Lena takes the early shift, her evenings are free, and if she takes the late shift, she can sleep in. Either way, she gets free time.' },
    { p: 'the school plants the new trees by the field', np: 'the school does not plant the new trees by the field', q: 'the field gets less sun', nq: 'the field does not get less sun', r: 'the school plants the new trees by the parking lot', nr: 'the school does not plant the new trees by the parking lot', s: 'the lot loses parking spaces', ns: 'the lot does not lose parking spaces',
      horns: 'The school could plant the trees along the front walk instead.', grasp: 'Trees by the field will not cut its sun: they would go on the north side, where their shadows fall away from it.',
      counter: 'If the trees go by the field, the bleachers get shade, and if they go by the lot, the parked cars stay cooler. Either way, something gets shade.' },
    { p: 'Omar reads the long novel', np: 'Omar does not read the long novel', q: 'Omar falls behind on his science fair project', nq: 'Omar does not fall behind on his science fair project', r: 'Omar reads the short novel', nr: 'Omar does not read the short novel', s: 'Omar\'s book report is weaker', ns: 'Omar\'s book report is not weaker',
      horns: 'Omar could choose the medium-length novel on the reading list.', grasp: 'Reading the long novel will not make Omar fall behind: his science fair project is already finished.',
      counter: 'If Omar reads the long novel, he enjoys a great story, and if he reads the short one, he has extra time for his project. Either way, he comes out ahead.' }
  ];
  var DK = ['Constructive dilemma (valid)', 'Destructive dilemma (valid)', 'Invalid: it affirms the consequents', 'Invalid: it denies the antecedents'];
  G('trad.dilemmas', function (R, ctx) {
    var L = lvl(ctx), d = R.pick(DIL), k = L === 1 ? R.int(0, 1) : R.int(0, 3);
    if (R.chance(0.4)) {
      var cons = R.coin(), sw = R.coin(), cA = 'If ' + d.p + ', then ' + d.q + '.', cB = 'If ' + d.r + ', then ' + d.s + '.';
      var orP = cons ? 'Either ' + d.p + ' or ' + d.r + '.' : 'Either ' + d.nq + ' or ' + d.ns + '.';
      var wf = whatFollows(R, ['(p → q) ∧ (r → s)', cons ? 'p ∨ r' : '¬q ∨ ¬s'], cons ? ['q ∨ s', '¬p ∨ ¬r', '¬q ∨ ¬s'] : ['¬p ∨ ¬r', 'q ∨ s', 'p ∨ r'],
        cons ? ['either ' + d.q + ' or ' + d.s, 'either ' + d.np + ' or ' + d.nr, 'either ' + d.nq + ' or ' + d.ns] : ['either ' + d.np + ' or ' + d.nr, 'either ' + d.q + ' or ' + d.s, 'either ' + d.p + ' or ' + d.r]);
      return P('What follows from these premises?' + box([sw ? cB + ' ' + cA : cA + ' ' + cB, orP]), wf.a,
        cons ? ['The "or" premise affirms one antecedent or the other.', 'Apply modus ponens to whichever horn holds: <b>either ' + d.q + ' or ' + d.s + '</b> (a constructive dilemma).'] : ['The "or" premise denies one consequent or the other.', 'Apply modus tollens to whichever horn holds: <b>either ' + d.np + ' or ' + d.nr + '</b> (a destructive dilemma).'],
        'Does the "or" premise affirm antecedents or deny consequents?', wf.chk);
    }
    var c1 = 'If ' + d.p + ', then ' + d.q + '.', c2 = 'If ' + d.r + ', then ' + d.s + '.', p2, con, pf, cf;
    if (k === 0) { p2 = 'Either ' + d.p + ' or ' + d.r + '.'; con = 'Either ' + d.q + ' or ' + d.s + '.'; pf = 'p ∨ r'; cf = 'q ∨ s'; }
    if (k === 1) { p2 = 'Either ' + d.nq + ' or ' + d.ns + '.'; con = 'Either ' + d.np + ' or ' + d.nr + '.'; pf = '¬q ∨ ¬s'; cf = '¬p ∨ ¬r'; }
    if (k === 2) { p2 = 'Either ' + d.q + ' or ' + d.s + '.'; con = 'Either ' + d.p + ' or ' + d.r + '.'; pf = 'q ∨ s'; cf = 'p ∨ r'; }
    if (k === 3) { p2 = 'Either ' + d.np + ' or ' + d.nr + '.'; con = 'Either ' + d.nq + ' or ' + d.ns + '.'; pf = '¬p ∨ ¬r'; cf = '¬q ∨ ¬s'; }
    var steps = [['The second premise affirms one antecedent or the other, and the conclusion affirms one consequent or the other.', 'That is a <b>constructive dilemma</b>: valid (modus ponens on each horn).'],
      ['The second premise denies one consequent or the other, and the conclusion denies one antecedent or the other.', 'That is a <b>destructive dilemma</b>: valid (modus tollens on each horn).'],
      ['The second premise affirms the consequents, and the conclusion affirms the antecedents.', 'That runs modus ponens backward: it is <b>invalid</b>, like affirming the consequent.'],
      ['The second premise denies the antecedents, and the conclusion denies the consequents.', 'That runs modus tollens backward: it is <b>invalid</b>, like denying the antecedent.']][k];
    return P('What kind of argument is this?' + argBox([c1 + ' ' + c2, p2], con), keep(L === 1 ? DK.slice(0, 2) : DK, k), steps,
      'Does the "or" premise talk about the antecedents or the consequents, and does it affirm or deny them?', { kind: 'prop', premises: ['(p → q) ∧ (r → s)', pf], cands: [cf], answer: k < 2 ? cf : null, valid: k < 2 });
  });

  var ANS = ['Escaping between the horns', 'Grasping a horn', 'Offering a counterdilemma'];
  G('trad.answering-dilemmas', function (R, ctx) {
    var L = lvl(ctx), d = R.pick(DIL), r = R.next();
    var dil = argBox(['If ' + d.p + ', then ' + d.q + '. If ' + d.r + ', then ' + d.s + '.', 'Either ' + d.p + ' or ' + d.r + '.'], 'Either ' + d.q + ' or ' + d.s + '.');
    if (L >= 2 && r < 0.25) {
      return P('True or false: the best answer to this dilemma is to show that it is invalid.' + dil, tf(false),
        ['The argument is a constructive dilemma, which is a valid form.', 'A valid argument can only be answered by showing a premise is false (or doubtful): escape between the horns, grasp a horn, or rebut with a counterdilemma. So the statement is <b>false</b>.'],
        'Is the form itself valid?', { kind: 'prop', premises: ['(p → q) ∧ (r → s)', 'p ∨ r'], cands: ['q ∨ s'], answer: 'q ∨ s', valid: true, tfNeg: true });
    }
    if (L >= 2 && r < 0.4 && d.contra) {
      return P('Can this dilemma be answered by escaping between the horns?' + dil, keep(['Yes', 'No'], 1),
        ['Escaping between the horns means finding a third option the "or" premise left out.', 'Here the two options are a thing and its denial: Sam either admits it or keeps quiet. There is no third option, so <b>no</b>. One must grasp a horn or offer a counterdilemma instead.'],
        'Do the two options cover every case?', { kind: 'horns-none' });
    }
    var kinds = d.horns ? [0, 1, 2] : [1, 2], k = R.pick(kinds), reply = [d.horns, d.grasp, d.counter][k];
    if (R.chance(0.3)) {
      var kk = d.horns && R.coin() ? 0 : 1, rp = kk === 0 ? d.horns : d.grasp;
      var targ = ['The "or" premise (either ' + d.p + ' or ' + d.r + ')', 'The conditional "if ' + d.p + ', then ' + d.q + '"', 'The conditional "if ' + d.r + ', then ' + d.s + '"', 'None: it attacks the form'];
      var gk = kk === 0 ? 0 : (d.gh || 1);
      return P('Which premise of the dilemma does this reply attack?' + dil + '<p><b>Reply:</b> ' + rp + '</p>', keep(targ, gk),
        [kk === 0 ? 'The reply names a third option, so it denies that the two choices cover every case: it attacks the "or" premise (escaping between the horns).' : 'The reply accepts the choice but denies what one option leads to: it attacks that conditional (grasping a horn).', 'A valid dilemma is always answered through a premise, never through the form.'],
        'Does the reply add an option, or deny what one option leads to?', { kind: 'answer-target', k: gk });
    }
    if (R.chance(0.4)) {
      var rs = kinds.map(function (j) { return [d.horns, d.grasp, d.counter][j]; }), a = mc(reply, rs.filter(function (x) { return x !== reply; }));
      return P('Which reply to this dilemma uses <b>' + ANS[k].toLowerCase() + '</b>?' + dil, a,
        [['Escaping between the horns means showing a third option the "or" premise left out.', 'Grasping a horn means denying one of the conditional premises.', 'A counterdilemma is a new dilemma from the same choice with a different conclusion.'][k], 'That is the reply: <i>' + reply + '</i>'],
        'Horns: a third option. Grasp: deny an "if … then". Counter: a new dilemma.', { kind: 'answer-pick', k: k });
    }
    var why = ['The reply points to a third option the "or" premise ignored, so the disjunction is false: <b>escaping between the horns</b>.',
      'The reply accepts the choice but denies one of the conditionals (it rejects one "if … then"): <b>grasping a horn</b>.',
      'The reply builds a new dilemma from the same choice with a cheerful conclusion: <b>a counterdilemma</b>. It does not refute the original; it shows another way to look at it.'][k];
    return P('Here is a dilemma and a reply. Which way of answering a dilemma does the reply use?' + dil + '<p><b>Reply:</b> ' + reply + '</p>', keep(ANS, k), [why],
      'Does the reply attack the "or", attack an "if … then", or answer with a dilemma of its own?', { kind: 'answer', k: k });
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
  var CFG = {"prefix":"trad.","only":["three-acts","terms","extension-intension","predicables","division","complements","modus-ponens","modus-tollens","hypothetical-fallacies","pure-hypothetical","dilemmas","answering-dilemmas"]};
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
