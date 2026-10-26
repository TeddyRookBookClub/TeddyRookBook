/* Practice drills: the logic and the built-in items (no DOM). Used by drills.js and the Node tests.
   Fallacy names are the Logic Ladder's topic titles; links go to /logic/informal-logic/<slug>/. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DebateDrillsCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- random numbers (seedable for tests) ---------- */
  function rng(seed) {
    if (seed == null) return Math.random;
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; };
  }
  function pickOne(list, rnd, avoid) {
    if (!list || !list.length) return null;
    rnd = rnd || Math.random;
    if (list.length === 1) return list[0];
    var x;
    for (var t = 0; t < 8; t++) { x = list[Math.floor(rnd() * list.length)]; if (!avoid || !sameItem(x, avoid)) return x; }
    return x;
  }
  function sameItem(a, b) { return a === b || (a && b && a.id != null && a.id === b.id) || (a && b && a.key != null && a.key === b.key && a.i === b.i); }
  function shuffle(a, rnd) { rnd = rnd || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- topics ---------- */
  // filter: {level, category, format} ("" or "any" = all)
  function filterTopics(topics, f) {
    f = f || {};
    function ok(v, want) { return !want || want === 'any' || v === want; }
    return (topics || []).filter(function (t) {
      return t && t.resolution && ok(t.level, f.level) && ok(t.category, f.category) &&
        (!f.format || f.format === 'any' || (t.formats || []).indexOf(f.format) >= 0);
    });
  }
  function sideLabel(t, side) {
    var s = t && t.sides && t.sides[side];
    return (s && s.label) || (side === 'aff' ? 'Affirmative' : side === 'neg' ? 'Negative' : side);
  }
  // every strawman in the topics, for the "steelman it" drill
  function steelmanItems(topics) {
    var out = [];
    (topics || []).forEach(function (t) {
      (t.strawmen || []).forEach(function (s, i) {
        if (s && s.strawman && s.steelman) out.push({ id: t.key + ':s' + i, key: t.key, i: i, topic: t.title, resolution: t.resolution, url: t.url, target: s.target, sideLabel: sideLabel(t, s.target), strawman: s.strawman, why: s.why || '', steelman: s.steelman });
      });
    });
    return out;
  }
  // every argument with the other side's best answer, for the rebuttal drill
  function rebuttalItems(topics) {
    var out = [];
    (topics || []).forEach(function (t) {
      ['aff', 'neg'].forEach(function (side) {
        var s = t.sides && t.sides[side];
        ((s && s.args) || []).forEach(function (a, i) {
          if (a && a.claim && a.response) out.push({ id: t.key + ':' + side + i, key: t.key, i: side + i, topic: t.title, resolution: t.resolution, url: t.url, side: side, sideLabel: sideLabel(t, side), answerLabel: sideLabel(t, side === 'aff' ? 'neg' : 'aff'), claim: a.claim, warrant: a.warrant || '', response: a.response });
        });
      });
    });
    return out;
  }
  // cross-examination questions: {topic, side (the side being asked), q}, plus each side's arguments for "ask" mode
  function cxItems(topics) {
    var out = [];
    (topics || []).forEach(function (t) {
      ['aff', 'neg'].forEach(function (side) {
        var qs = (t.cx && t.cx[side]) || [];
        var args = (t.sides && t.sides[side] && t.sides[side].args) || [];
        if (!qs.length) return;
        out.push({ id: t.key + ':cx' + side, key: t.key, i: 'cx' + side, topic: t.title, resolution: t.resolution, url: t.url, side: side, sideLabel: sideLabel(t, side), askerLabel: sideLabel(t, side === 'aff' ? 'neg' : 'aff'), questions: qs.slice(), args: args.map(function (a) { return a.claim; }).filter(Boolean) });
      });
    });
    return out;
  }

  /* ---------- four-step rebuttal ---------- */
  var STEPS = [
    { k: 'say', label: 'They say', hint: 'Restate their argument fairly, in a few words, so the judge knows where you are.' },
    { k: 'but', label: 'But', hint: 'Your answer: what is wrong with it, or what it leaves out.' },
    { k: 'because', label: 'Because', hint: 'The reason or evidence that proves your answer.' },
    { k: 'therefore', label: 'Therefore', hint: 'Why that matters: what it does to their argument and to the round.' }
  ];
  var STOP = 'a an and are as at be but by for from has have i if in is it its of on or that the their them they this to was we were will with you your our not no so do does'.split(' ');
  function keywords(s) {
    var seen = {};
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter(function (w) {
      if (w.length < 4 || STOP.indexOf(w) >= 0 || seen[w]) return false;
      seen[w] = 1; return true;
    });
  }
  function nwords(s) { s = String(s || '').trim(); return s ? s.split(/\s+/).length : 0; }
  // feedback on a four-step answer: [{step, ok, note}], plus overall ok
  function checkRebuttal(ans, item) {
    ans = ans || {};
    var out = [];
    var claimWords = keywords(item && (item.claim + ' ' + (item.warrant || '')));
    STEPS.forEach(function (s) {
      var v = String(ans[s.k] || '').trim(), n = nwords(v), ok = true, note = '';
      if (!n) { ok = false; note = 'Empty. Every step does a job; don’t skip it.'; }
      else if (s.k === 'say') {
        var hit = keywords(v).filter(function (w) { return claimWords.indexOf(w) >= 0; }).length;
        if (n > 30) { ok = false; note = 'Shorter: a quick restatement of a few words saves time for your answer.'; }
        else if (claimWords.length && !hit) { ok = false; note = 'Use some of their own words so the judge can find the argument on the flow.'; }
        else note = 'Good: short and recognizable.';
      } else if (n < 4) { ok = false; note = 'Say a little more: a full sentence.'; }
      else if (s.k === 'because' && !/\b(because|since|evidence|study|data|show|shows|found|example|for instance|according|research|history|when)\b/i.test(v) && n < 10) { ok = true; note = 'Make sure this gives a reason or evidence, not just the answer again.'; }
      else if (s.k === 'therefore' && !/\b(so|therefore|means|which|outweigh|vote|round|matters|impact|can’t|cannot|doesn’t|falls|fails|wins)\b/i.test(v)) { ok = true; note = 'Tie it back to the round: what should the judge do with this?'; }
      else note = 'Good.';
      out.push({ step: s.k, label: s.label, ok: ok, note: note });
    });
    return { steps: out, ok: out.every(function (x) { return x.ok; }) };
  }

  /* ---------- fallacy spotter (original exchanges) ---------- */
  var NONE = { slug: 'fallacy-or-not', name: 'No fallacy: fair reasoning' };
  var FALLACY_NAMES = {
    'ad-hominem': 'Attacking the Person', 'tu-quoque': 'You Too (Tu Quoque)', 'straw-man': 'Straw Man', 'red-herring': 'Red Herring',
    'appeal-to-force': 'Appeal to Force', 'appeal-to-pity': 'Appeal to Pity', 'appeal-to-popularity': 'Appeal to the People',
    'appeal-to-authority': 'Appeals to Authority: Fair and Unfair', 'appeal-to-ignorance': 'Appeal to Ignorance', 'begging-question': 'Begging the Question',
    'complex-question': 'Complex Question', 'false-dilemma': 'False Dilemma', 'hasty-generalization': 'Hasty Generalization', 'false-cause': 'False Cause',
    'slippery-slope': 'Slippery Slope', 'weak-analogy': 'Weak Analogy', 'suppressed-evidence': 'Suppressed Evidence', 'equivocation': 'Equivocation',
    'composition': 'Composition', 'division': 'Division'
  };
  var FALLACIES = [
    { id: 'f1', a: 'straw-man', lines: [['Aff', 'Our school should start at 8:30 instead of 7:30 so students get more sleep.'], ['Neg', 'My opponent wants students to sleep all morning and never learn discipline.']], ex: 'The affirmative asked for a one-hour change; the negative answered a much sillier plan nobody proposed.' },
    { id: 'f2', a: 'straw-man', lines: [['Neg', 'A carbon tax would raise fuel prices for families who have to drive to work.'], ['Aff', 'So my opponent doesn’t care about the planet at all.']], ex: 'The negative raised a cost to families. The reply turns that into a position the negative never took.' },
    { id: 'f3', a: 'ad-hominem', lines: [['Con', 'Of course she supports a four-day school week. She’s a student and just wants Fridays off, so ignore her points.']], ex: 'Who is making the argument, and why they might like it, doesn’t tell us whether the reasons are good.' },
    { id: 'f4', a: 'tu-quoque', lines: [['Pro', 'Plastic bags end up in rivers and harm wildlife.'], ['Con', 'You carried your lunch in a plastic bag today, so your argument fails.']], ex: 'The speaker may not follow their own advice, but that doesn’t make the claim about rivers false.' },
    { id: 'f5', a: 'red-herring', lines: [['Q', 'Does your evidence show year-round school raises test scores?'], ['A', 'What really matters is that summer camp is a cherished tradition. Think of the campfire songs!']], ex: 'The answer changes the subject to something pleasant instead of answering the question about scores.' },
    { id: 'f6', a: 'appeal-to-popularity', lines: [['Neg', 'Most people in our town want to keep the penny, so keeping it must be the right policy.']], ex: 'How many people believe something isn’t evidence that it’s true or wise.' },
    { id: 'f7', a: 'appeal-to-authority', lines: [['Aff', 'A famous basketball star said in an interview that nuclear plants are unsafe, so they must be.']], ex: 'The star may be an expert at basketball, not at reactor safety. An appeal to authority is fair only when the authority knows the subject.' },
    { id: 'f8', a: 'appeal-to-ignorance', lines: [['Con', 'Nobody has proven that phones in class hurt learning, so they must be harmless.']], ex: 'A lack of proof one way isn’t proof the other way.' },
    { id: 'f9', a: 'begging-question', lines: [['Pro', 'Homework is valuable because doing it is worthwhile.']], ex: '"Valuable" and "worthwhile" mean the same thing here, so the reason just repeats the conclusion.' },
    { id: 'f10', a: 'complex-question', lines: [['Q', 'Have you stopped ignoring the evidence on the minimum wage? Yes or no?']], ex: 'Either answer admits the speaker was ignoring evidence. The question hides an accusation inside it.' },
    { id: 'f11', a: 'false-dilemma', lines: [['Aff', 'Either we ban every car from downtown, or we accept that the air will never get cleaner.']], ex: 'There are many choices in between, like better buses, cleaner engines or limits at certain hours.' },
    { id: 'f12', a: 'hasty-generalization', lines: [['Neg', 'I met two homeschooled students who didn’t like debate, so homeschoolers don’t like debate.']], ex: 'Two people is far too small a sample to say anything about a whole group.' },
    { id: 'f13', a: 'false-cause', lines: [['Pro', 'After our town started a recycling program, test scores went up. Recycling made students smarter.']], ex: 'One thing coming after another doesn’t show that the first caused the second. Many other things changed too.' },
    { id: 'f14', a: 'slippery-slope', lines: [['Con', 'If we let students choose one elective, soon they’ll choose all their classes, then teachers won’t be needed, and then schools will close.']], ex: 'Each step is assumed, not shown. Nothing proves the first step leads to the last.' },
    { id: 'f15', a: 'weak-analogy', lines: [['Neg', 'Running a country is like running a lemonade stand, so a kid who runs a good stand could run the country.']], ex: 'The two are alike in a small way (both handle money) but differ in the ways that matter for the conclusion.' },
    { id: 'f16', a: 'suppressed-evidence', lines: [['Aff', 'The report says, “Scores rose at Lincoln Elementary.” So the reading program works.'], ['Note', 'The same report’s summary, which the speaker skipped, says scores fell at the other eleven schools.']], ex: 'Leaving out the part of a source that cuts against you misleads the judge, and it breaks the rules of fair evidence.' },
    { id: 'f17', a: 'equivocation', lines: [['Pro', 'Gravity is a law. Congress can repeal laws. So Congress could repeal gravity.']], ex: '"Law" means a rule of nature in the first sentence and a rule passed by a legislature in the second.' },
    { id: 'f18', a: 'composition', lines: [['Con', 'Every player on our team is excellent, so our team must be excellent.']], ex: 'What is true of each part isn’t always true of the whole. Great players can still play poorly together.' },
    { id: 'f19', a: 'division', lines: [['Aff', 'Our debate club won the state championship, so every member of the club is a champion debater.']], ex: 'What is true of the whole club isn’t automatically true of each member.' },
    { id: 'f20', a: 'appeal-to-pity', lines: [['Neg', 'Judge, I stayed up all night writing this case, and I’ll be crushed if I lose, so please vote for me.']], ex: 'Feeling sorry for a speaker has nothing to do with which side argued better.' },
    { id: 'f21', a: 'appeal-to-force', lines: [['Pro', 'If you vote against the uniform policy, the student council will make sure your club loses its funding.']], ex: 'A threat isn’t a reason the policy is good.' },
    { id: 'f22', a: 'none', lines: [['Aff', 'A structural engineer who inspected the bridge says its supports are cracked, so the town should pay for repairs.']], ex: 'This is a fair appeal to authority: the engineer is an expert on exactly this question and inspected the bridge.' },
    { id: 'f23', a: 'none', lines: [['Neg', 'The district’s own bus map shows forty students with no other route to school. Cutting this bus line would leave them without a ride.']], ex: 'The claim follows from evidence the speaker named. Not every strong argument is a fallacy.' },
    { id: 'f24', a: 'ad-hominem', lines: [['Q', 'Why should we trust your numbers on the cost of the plan?'], ['A', 'Why should we trust anything from a team that lost last week?']], ex: 'The other team’s record says nothing about whether these numbers are right.' }
  ];
  // fallacy info: data/debate/fallacies.json when present (names and links), else the built-in names
  function fallacyInfo(slug, list) {
    if (slug === 'none') return { slug: 'fallacy-or-not', name: NONE.name, url: '/logic/informal-logic/fallacy-or-not/' };
    var f = null;
    (list || []).forEach(function (x) { if (x && x.slug === slug) f = x; });
    return { slug: slug, name: (f && f.name) || FALLACY_NAMES[slug] || slug, url: (f && f.url) || ('/logic/informal-logic/' + slug + '/'), short: (f && f.short) || '' };
  }
  // four choices: the answer and three others
  function fallacyChoices(item, rnd, list) {
    rnd = rnd || Math.random;
    var pool = Object.keys(FALLACY_NAMES).filter(function (k) { return k !== item.a; });
    if (item.a !== 'none') pool.push('none');
    var picks = shuffle(pool, rnd).slice(0, 3).concat([item.a]);
    return shuffle(picks, rnd).map(function (k) { return fallacyInfo(k, list); });
  }

  /* ---------- weighing practice (original, made-up examples) ---------- */
  var MECH = [
    { k: 'magnitude', label: 'Magnitude', q: 'How big is it? How many people, how much harm or good?' },
    { k: 'probability', label: 'Probability', q: 'How likely is it to happen?' },
    { k: 'timeframe', label: 'Timeframe', q: 'How soon does it happen?' },
    { k: 'reversibility', label: 'Reversibility', q: 'Can it be undone or fixed later?' }
  ];
  var WEIGH = [
    { id: 'w1', a: 'Closing the town’s only factory will cost about 200 jobs this year; the company has already announced it.', b: 'Keeping it open carries a small chance of a serious chemical spill someday.', m: 'probability', ex: 'Side A’s harm is nearly certain; Side B’s is serious but unlikely. Side A should weigh on probability.' },
    { id: 'w2', a: 'A school-lunch program would feed 40,000 students in the state.', b: 'The program would delay new carpet for the district office.', m: 'magnitude', ex: 'Both are likely and soon, but Side A’s impact reaches far more people and matters more to each. Weigh on magnitude.' },
    { id: 'w3', a: 'Students in our district are going hungry this month.', b: 'A budget shortfall is projected in twenty years.', m: 'timeframe', ex: 'Side A’s harm is happening now, while Side B’s is decades away and can be planned for. Weigh on timeframe.' },
    { id: 'w4', a: 'Draining the marsh would destroy a habitat that can’t be rebuilt once it’s gone.', b: 'Protecting the marsh means the town waits to build a parking lot.', m: 'reversibility', ex: 'The parking lot can be built later; a lost habitat can’t come back. Weigh on reversibility.' },
    { id: 'w5', a: 'Our plan has been tried in twenty cities and worked in most of them.', b: 'Their plan might work better, but it has never been tried anywhere.', m: 'probability', ex: 'Side A has a track record; Side B is a hopeful guess. Weigh on probability.' },
    { id: 'w6', a: 'The bridge inspectors say it could fail within months.', b: 'A slow rise in maintenance costs is expected over the next fifteen years.', m: 'timeframe', ex: 'A danger in months comes before a cost spread over fifteen years. Weigh on timeframe.' },
    { id: 'w7', a: 'If the last fluent speakers of the town’s old language aren’t recorded, the language will be lost for good.', b: 'Paying for the recordings means the library’s new hours start a year later.', m: 'reversibility', ex: 'Library hours can change next year. A language that’s lost can’t be recovered. Weigh on reversibility.' },
    { id: 'w8', a: 'A rule change would save every family in the state a little money each year.', b: 'The old rule saves a handful of companies a larger amount each.', m: 'magnitude', ex: 'Added up across millions of families, Side A’s impact is much larger in total. Weigh on magnitude, and show the math.' },
    { id: 'w9', a: 'Prices will very likely rise a small amount.', b: 'In the worst case, which almost no one predicts, the market could crash.', m: 'probability', ex: 'A likely small harm can outweigh an unlikely large one, if you explain why the judge should trust the likely outcome. Weigh on probability.' },
    { id: 'w10', a: 'A new park would give a quarter of the city’s children a safe place to play within walking distance.', b: 'The land could instead hold three new parking spaces.', m: 'magnitude', ex: 'Both happen soon and either could be changed later; the difference is how many people benefit and how much. Weigh on magnitude.' }
  ];
  function weighChoices() { return MECH.map(function (m) { return { k: m.k, label: m.label }; }); }
  // the weighing sentence for your own two impacts: scores {magnitude:[a,b], ...} on 1-5 (5 = bigger, likelier, sooner, harder to undo)
  function weighSentence(aName, bName, scores) {
    aName = String(aName || 'our impact').trim() || 'our impact';
    bName = String(bName || 'their impact').trim() || 'their impact';
    var win = [], lose = [];
    MECH.forEach(function (m) {
      var s = scores && scores[m.k]; if (!s) return;
      if (+s[0] > +s[1]) win.push(m); else if (+s[0] < +s[1]) lose.push(m);
    });
    var words = { magnitude: 'bigger', probability: 'more likely', timeframe: 'sooner', reversibility: 'harder to undo' };
    if (!win.length && !lose.length) return 'The two impacts come out even on every measure, so find a better comparison: which one has stronger evidence, or which one the other side hasn’t answered?';
    if (!win.length) return 'On these scores, ' + bName + ' wins on ' + list(lose.map(function (m) { return m.label.toLowerCase(); })) + '. Look for a way to change that comparison, or weigh a different impact.';
    var s = cap(aName) + ' outweighs ' + bName + ' on ' + list(win.map(function (m) { return m.label.toLowerCase(); })) + ': it’s ' + list(win.map(function (m) { return words[m.k]; })) + '.';
    if (lose.length) s += ' Even if ' + bName + ' is ' + list(lose.map(function (m) { return words[m.k]; })) + ', ' + (win[0].k === 'probability' ? 'a likely harm should count for more than an unlikely one.' : win[0].k === 'timeframe' ? 'we have to deal with what comes first.' : win[0].k === 'reversibility' ? 'a harm we can’t undo should weigh more than one we can fix later.' : 'the size of the difference decides it.');
    return s;
  }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- impromptu ---------- */
  // a two-part "format" for the timer core: prep, then the speech
  function impromptuFormat(prepSec, speakSec) {
    return {
      key: 'impromptu', name: 'Impromptu', short: 'Impromptu', sides: [{ id: 'you', name: 'You', short: 'You' }],
      speeches: [{ i: 0, short: 'Prep', name: 'Prep time', side: 'you', sec: prepSec, kind: 'prep' }, { i: 1, short: 'Speech', name: 'Your speech', side: 'you', sec: speakSec, kind: 'constructive' }],
      cycle: null, firstCycle: null, prep: { sec: 0, per: 'none', note: '' }, poi: null, coin: false, speakersPerSide: 1
    };
  }

  return {
    rng: rng, pickOne: pickOne, shuffle: shuffle, filterTopics: filterTopics, sideLabel: sideLabel, steelmanItems: steelmanItems, rebuttalItems: rebuttalItems, cxItems: cxItems,
    STEPS: STEPS, checkRebuttal: checkRebuttal, keywords: keywords, FALLACIES: FALLACIES, FALLACY_NAMES: FALLACY_NAMES, fallacyInfo: fallacyInfo, fallacyChoices: fallacyChoices,
    MECH: MECH, WEIGH: WEIGH, weighChoices: weighChoices, weighSentence: weighSentence, impromptuFormat: impromptuFormat
  };
});
