/* Constitutional Law I: Structure (conlaw1). Problem generators for all 44 topics.
   Source: /tmp/work_conlaw1/src/gen_head.js, gen_u1.js ... gen_u9.js, gen_tail.js, joined by /tmp/work_conlaw1/build.py.
   Each topic is a bank of items drawn from the lesson's facts (data/civics/lessons/conlaw1.json and its sources).
     level 1  three choices (the right one and two plainly wrong), or a true-or-false about one fact
     level 2  four choices whose wrong ones match the topic's trouble note (the right case for the wrong clause, a
              neighboring year, the narrow holding against the broad one); years to type
     level 3  choose all that are true; put cases in order; apply a test to a short original fact pattern
   Bank items: { L: [levels], q, a, w: [wrong pool], why }        one answer (mc)
               { L, q, tf: true|false, why }                     true or false
               { L, q, all: [[text, true|false], ...], why }      choose all that are true
               { L, q, num: 1803, why }                          a whole number to type (years)
               { L, q, order: ['first', ..., 'last'], why }      put in order (cv-order, quiet, lettered A, B, C...)
               { L, gen: function (R, lv) { return item; } }     made fresh each time
   Optional on any item: viz, hint, steps. Choices are shuffled here (keep: true). Practice asks holdings, clauses, tests,
   years and order, never which side is right. Fact patterns use neutral, invented parties. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  var LET = 'ABCDEFGH';
  // cases this course needs that the kit's model does not hold (facts from the lessons' sources)
  var XC = {
    frothingham: { name: 'Frothingham v. Mellon', year: 1923 },
    flast: { name: 'Flast v. Cohen', year: 1968 },
    hein: { name: 'Hein v. Freedom From Religion Foundation', year: 2007 },
    champion: { name: 'Champion v. Ames', year: 1903 },
    carter: { name: 'Carter v. Carter Coal Co.', year: 1936 },
    janus: { name: 'Janus v. AFSCME', year: 2018 },
    westcoast: { name: 'West Coast Hotel Co. v. Parrish', year: 1937 },
    adkins: { name: 'Adkins v. Children\'s Hospital', year: 1923 },
    steward: { name: 'Steward Machine Co. v. Davis', year: 1937 },
    alden: { name: 'Alden v. Maine', year: 1999 },
    fitzpatrick: { name: 'Fitzpatrick v. Bitzer', year: 1976 },
    morgan: { name: 'Katzenbach v. Morgan', year: 1966 },
    arizonaus: { name: 'Arizona v. United States', year: 2012 },
    maine: { name: 'Maine v. Taylor', year: 1986 },
    hunt: { name: 'Hunt v. Washington State Apple Advertising Commission', year: 1977 },
    kassel: { name: 'Kassel v. Consolidated Freightways Corp.', year: 1981 },
    southcentral: { name: 'South-Central Timber Development, Inc. v. Wunnicke', year: 1984 },
    unitedhaulers: { name: 'United Haulers Ass\'n v. Oneida-Herkimer Solid Waste Management Authority', year: 2007 },
    toomer: { name: 'Toomer v. Witsell', year: 1948 },
    piper: { name: 'Supreme Court of New Hampshire v. Piper', year: 1985 },
    baldwin: { name: 'Baldwin v. Fish and Game Commission of Montana', year: 1978 },
    hampton: { name: 'J. W. Hampton, Jr. & Co. v. United States', year: 1928 },
    panama: { name: 'Panama Refining Co. v. Ryan', year: 1935 },
    gundy: { name: 'Gundy v. United States', year: 2019 },
    mistretta: { name: 'Mistretta v. United States', year: 1989 },
    brownwilliamson: { name: 'FDA v. Brown & Williamson Tobacco Corp.', year: 2000 },
    whitman: { name: 'Whitman v. American Trucking Associations', year: 2001 },
    edmond: { name: 'Edmond v. United States', year: 1997 },
    lucia: { name: 'Lucia v. SEC', year: 2018 },
    buckley: { name: 'Buckley v. Valeo', year: 1976 },
    freeenterprise: { name: 'Free Enterprise Fund v. PCAOB', year: 2010 },
    wiener: { name: 'Wiener v. United States', year: 1958 },
    dames: { name: 'Dames & Moore v. Regan', year: 1981 },
    prize: { name: 'The Prize Cases', year: 1863 },
    exmilligan: { name: 'Ex parte Milligan', year: 1866 },
    fitzgerald: { name: 'Nixon v. Fitzgerald', year: 1982 },
    beach: { name: 'FCC v. Beach Communications', year: 1993 },
    clarkjeter: { name: 'Clark v. Jeter', year: 1988 },
    cohens: { name: 'Cohens v. Virginia', year: 1821 },
    klein: { name: 'United States v. Klein', year: 1872 },
    medellin: { name: 'Medellín v. Texas', year: 2008 },
    bowsher: { name: 'Bowsher v. Synar', year: 1986 }
  };
  function CVm() { return ML.civics || {}; }
  function cs(k) { var C = CVm().CASES || {}; return C[k] || XC[k] || null; }
  function nm(k) { var c = cs(k); if (!c) throw new Error('conlaw1: no case ' + k); return c.name; }
  function yr(k) { return cs(k).year; }
  function ny(k) { return nm(k) + ' (' + yr(k) + ')'; }
  function orderItem(R, it) {
    var n = it.order.length, start = R.shuffle(it.order.map(function (x, i) { return i; }));
    if (start.every(function (v, i) { return v === i; })) start.reverse();
    var ans = '';
    for (var k = 0; k < n; k++) ans += LET.charAt(start.indexOf(k));
    return {
      q: it.q + ' Type the letters in the right order.',
      a: { t: 'text', v: [ans, ans.split('').join(' '), ans.split('').join(','), ans.split('').join(', '), ans.split('').join('-')] },
      viz: { name: 'cv-order', opts: { items: it.order, start: start, quiet: true, interactive: false } },
      steps: [it.why, 'In order: ' + it.order.map(function (t, k) { return LET.charAt(start.indexOf(k)) + ' (' + t + ')'; }).join(', then ') + '. So the answer is ' + ans + '.']
    };
  }
  // ---- widen_civ2: questions about a topic's cases, from the kit's case table (MathLadder.civics.CASES; this file's XC if any)
  var TRB_SKIP = ['clintonjones', 'clintonny', 'bushgore', 'boumediene', 'nixonus', 'roe', 'casey', 'bakke', 'grutter', 'gratz', 'chevron', 'lemon'];
  function TRBcase(R, lv, keys) {
    var C = (ML.civics && ML.civics.CASES) || {}, X = typeof XC !== 'undefined' ? XC : typeof EXTRA !== 'undefined' ? EXTRA : {};
    function get(k) { if (TRB_SKIP.indexOf(k) >= 0) return null; if (typeof cs === 'function') { try { var z = cs(k); if (z) return z; } catch (e) { } } return C[k] || null; }
    function ny2(k) { var c = get(k); return c.name + ' (' + c.year + ')'; }
    var ok = keys.filter(function (k) { var c = get(k); return c && c.year <= 2020; });
    var k = R.pick(ok), c = get(k), kinds = ['year', 'year'];
    if (c.q) kinds.push('which', 'which');
    if (c.holding && c.holding.length > 30 && lv >= 2) kinds.push('holding');
    var kind = R.pick(kinds), all = Object.keys(C).concat(Object.keys(X)).filter(function (x) { var z = get(x); return x !== k && z && z.year <= 2020; });
    var near = function (list) { var seen = {}; return list.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); };
    if (kind === 'year') {
      var ys = near(all.map(function (x) { return String(get(x).year); }).filter(function (y) { return Math.abs(y - c.year) >= 3; }));
      ys.sort(function (a, b) { return Math.abs(a - c.year) - Math.abs(b - c.year) || a - b; });
      return { q: 'In what year was <i>' + c.name + '</i> decided?', a: String(c.year), w: ys.slice(0, 6), why: c.name + ' was decided in ' + c.year + (c.holding ? '. Holding: ' + c.holding : '.') };
    }
    var pool = near(keys.filter(function (x) { return x !== k && get(x) && get(x).year <= 2020; }).concat(all.filter(function (x) { return c.area && get(x).area === c.area; })).concat(all));
    if (kind === 'which') {
      var names = pool.filter(function (x) { return get(x).q !== c.q; }).slice(0, 6).map(ny2);
      return { q: 'Which case asked this question? “' + c.q + '”', a: ny2(k), w: names, why: ny2(k) + ': ' + c.holding };
    }
    var hs = near(pool.filter(function (x) { var h = get(x).holding; return h && h.length > 30 && h !== c.holding; }).map(function (x) { return get(x).holding; })).slice(0, 5);
    return { q: 'What did <i>' + c.name + '</i> (' + c.year + ') hold?', a: c.holding, w: hs, why: ny2(k) + ': ' + c.holding };
  }
  function fromBank(mk, hint) {
    var bank = null;  // built on first use, so the kit's model (MathLadder.civics) is loaded by then
    return function (R, ctx) {
      if (!bank) bank = typeof mk === 'function' ? mk() : mk;
      var lv = ctx.level || 1, pool = bank.filter(function (it) { return it.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = bank;
      var it = R.pick(pool); if (it.gen) it = Object.assign({ L: it.L }, it.gen(R, lv));
      var p = { q: it.q, steps: [it.why].concat(it.steps || []), hint: it.hint || hint || 'Think back to the key idea of the lesson.' };
      if (it.viz) p.viz = typeof it.viz === 'function' ? it.viz(R) : it.viz;
      if (it.order) { var o = orderItem(R, it); p.q = o.q; p.a = o.a; p.viz = o.viz; p.steps = o.steps; return p; }
      if (it.tf != null) { p.a = { t: 'tf', v: it.tf }; p.q = it.q + ' True or false?'; return p; }
      if (it.num != null) { p.a = { t: 'num', v: String(it.num), form: 'int' }; return p; }
      if (it.text) { p.a = { t: 'text', v: it.text }; return p; }
      if (it.all) {
        var opts = R.shuffle(it.all.slice()), v = []; opts.forEach(function (o, i) { if (o[1]) v.push(i); });
        p.q = it.q + ' Choose all that are true.'; p.a = { t: 'mc', choices: opts.map(function (o) { return o[0]; }), v: v, keep: true }; return p;
      }
      var n = lv === 1 ? 2 : 3, wrong = R.sample(it.w, M.min(n, it.w.length)), ch = R.shuffle([it.a].concat(wrong));
      p.a = { t: 'mc', choices: ch, v: ch.indexOf(it.a), keep: true };
      return p;
    };
  }
  // "Which case …?" with case keys: the right one and wrong ones drawn from a list of neighbors
  function which(L, k, desc, wrongKeys, why, viz) {
    return { L: L, q: 'Which case ' + desc + '?', a: nm(k), w: wrongKeys.map(nm), why: why, viz: viz };
  }
  // "In what year …?" (a number to type); the steps place it among neighbors
  function year(L, k, q, why) { return { L: L, q: q || 'In what year was <i>' + nm(k) + '</i> decided?', num: yr(k), why: why || '<i>' + nm(k) + '</i> was decided in ' + yr(k) + '.' }; }
  // order cases by year
  function chrono(L, keys, q, why) {
    var ks = keys.slice().sort(function (a, b) { return yr(a) - yr(b); });
    return { L: L, q: q || 'Put these cases in time order, earliest first.', order: ks.map(ny), why: why || 'Line up the years: ' + ks.map(function (k) { return yr(k); }).join(', ') + '.' };
  }
  function caseCard(k, extra) { var o = { id: k, quiet: true, interactive: false, hide: ['name'] }; if (!CVm().CASES || !CVm().CASES[k]) { o = { name: nm(k), year: yr(k), quiet: true, interactive: false, hide: ['name'] }; delete o.id; } return { name: 'cv-case', opts: Object.assign(o, extra || {}) }; }

  /* ======================================================== Unit 1: Interpreting the Constitution */
  var MODS = ['textual', 'historical', 'structural', 'doctrinal', 'prudential', 'ethical'];
  var MOD_ARGS = [
    ['The clause says "Congress shall make no law," so it limits the legislature, not every official.', 'textual', 'It turns on the words of the clause.'],
    ['The word "expressly" appears in the Articles of Confederation but was left out of the Tenth Amendment.', 'textual', 'It compares the wording of two texts.'],
    ['Delegates at the ratifying conventions repeatedly said the clause would not reach this.', 'historical', 'It relies on what the founding generation said and understood.'],
    ['The First Congress, full of framers, passed a law doing exactly this in 1789.', 'historical', 'It relies on early practice by the founding generation.'],
    ['If a state could tax a federal office, one part of the federal system could control the part that is supreme.', 'structural', 'It reasons from the design of the federal system.'],
    ['Because the Constitution gives each branch its own article, no branch may take over another\'s core function.', 'structural', 'It reasons from the separation of powers built into the document.'],
    ['Under the three-part test of our earlier case, this law fails the second part.', 'doctrinal', 'It applies a test from precedent.'],
    ['Our cases have treated this kind of law the same way for fifty years.', 'doctrinal', 'It relies on a line of precedent.'],
    ['Reading the clause this way would leave the government unable to respond in an emergency.', 'prudential', 'It weighs practical consequences.'],
    ['A rule this vague would produce a flood of lawsuits that courts could not manage.', 'prudential', 'It weighs consequences for the courts.'],
    ['Our constitutional tradition rests on the idea that government power over individuals is limited.', 'ethical', 'It reasons from the American constitutional ethos.'],
    ['The Constitution as a whole respects the dignity of each person, and this reading would not.', 'ethical', 'It appeals to values the Constitution is understood to embody.']
  ];
  G('conlaw1.modalities', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { var m = R.pick(MOD_ARGS); return { q: 'Which modality of constitutional argument is this? "' + m[0] + '"', a: m[1], w: MODS.filter(function (x) { return x !== m[1]; }), why: 'It is ' + m[1] + ': ' + m[2] }; } },
    { L: [1, 2], q: 'Who described the six "modalities" of constitutional argument in <i>Constitutional Fate</i> (1982)?', a: 'Philip Bobbitt', w: ['John Marshall', 'Antonin Scalia', 'Alexander Hamilton'], why: 'Philip Bobbitt, a constitutional scholar, described them by studying how judges and lawyers actually argue.' },
    { L: [1, 2], q: 'Bobbitt\'s modalities are offered mainly as…', a: 'a description of the kinds of argument accepted as legitimate', w: ['a ranking that tells judges which argument wins', 'a list of the clauses of the Constitution', 'a rule that only textual arguments count'], why: 'Bobbitt describes the forms of argument in use; he does not rank them.' },
    { L: [2, 3], q: 'A lawyer argues: "This reading would make the law impossible for courts to administer." A critic says, "That is just policy, not law." Within Bobbitt\'s scheme, the lawyer\'s argument is…', a: 'a prudential argument, one recognized form of constitutional argument', w: ['not a constitutional argument at all', 'a textual argument', 'a doctrinal argument'], why: 'Weighing consequences is the prudential modality. It is a recognized form; whether it is persuasive is a separate question.' },
    { L: [2, 3], q: 'Chief Justice Marshall argued in <i>McCulloch</i> that a constitution can mark only its "great outlines," leaving the means to Congress. That is mainly a…', a: 'structural argument', w: ['doctrinal argument', 'historical argument', 'ethical argument'], why: 'It reasons from the nature and design of a constitution, a structural argument.' },
    { L: [3], q: 'Which of these are among Bobbitt\'s six modalities?', all: [['Textual', true], ['Structural', true], ['Prudential', true], ['Ethical', true], ['Partisan', false], ['Statistical', false]], why: 'The six are textual, historical, structural, doctrinal, prudential and ethical.' },
    { L: [3], q: 'Brief A relies only on text. Brief B uses text, early history and the structure of federalism, all pointing the same way. Which statement fits how judges usually respond?', a: 'Converging modalities make an argument stronger', w: ['Only the first modality used counts', 'Using several modalities is improper', 'Historical arguments cancel textual ones'], why: 'Strong opinions usually rest on several modalities that point the same way; hard cases are where they split.' },
    { L: [1, 2, 3], gen: function (R) { var m = R.pick(MOD_ARGS); return { q: 'True or false: this is a ' + m[1] + ' argument. "' + m[0] + '"', tf: true, why: m[2] }; } },
    { L: [2, 3], gen: function (R) { var m = R.pick(MOD_ARGS), other = R.pick(MODS.filter(function (x) { return x !== m[1]; })); return { q: 'True or false: this is a ' + other + ' argument. "' + m[0] + '"', tf: false, why: 'It is ' + m[1] + ', not ' + other + ': ' + m[2] }; } }
  ]; }, 'Ask what the argument rests on: words, history, design, precedent, consequences or values.'));

  G('conlaw1.originalism', fromBank(function () { return [
    {"L":[1,2,3],"q":"Which Attorney General promoted originalism in the 1980s?","a":"Edwin Meese","w":["Robert Kennedy","Janet Reno","Griffin Bell","Edward Levi"],"why":"Attorney General Edwin Meese helped bring originalism into public debate in the 1980s."},
    {"L":[1,2,3],"q":"Which scholar and judge was an early leader of originalism?","a":"Robert Bork","w":["David Strauss","William Brennan","Stephen Breyer","Oliver Wendell Holmes"],"why":"Robert Bork wrote about originalism in the 1970s and 1980s."},
    {"L":[1,2,3],"q":"Along with Antonin Scalia, which justice is known as an originalist?","a":"Clarence Thomas","w":["William Brennan","Stephen Breyer","Earl Warren","Thurgood Marshall"],"why":"Justices Scalia and Thomas are the best-known originalists on the Court."},
    {"L":[1,2,3],"q":"Originalism leans most on which kinds of argument?","a":"text and history","w":["precedent alone","consequences and policy","moral ideals","foreign law"],"why":"Originalism draws mainly on the textual and historical modalities."},
    {"L":[1,2],"q":"Justice Scalia called his originalist approach the…","a":"\"lesser evil\"","w":["\"living document\"","\"active liberty\"","\"perfect method\"","\"common law\""],"why":"Scalia called it the \"lesser evil\" compared with judges applying their own values."},
    { L: [1, 2, 3], q: 'Most originalists today look for a provision\'s…', a: 'original public meaning when it was ratified', w: ['framers\' private intentions', 'meaning to readers today', 'specific results its framers expected'], why: 'Public-meaning originalism, the main version since the late 1980s, asks what an informed reader understood the words to mean at ratification.' },
    { L: [1, 2], q: 'According to originalists, how should the Constitution be changed when its fixed meaning no longer suits the country?', a: 'By amendment under Article V', w: ['By judges updating its meaning', 'By executive order', 'By a majority vote of the Senate'], why: 'Originalists argue that change belongs to the amendment process, which leaves the choice with the people.' },
    { L: [1, 2], q: 'Which justice was a leading advocate of originalism and textualism?', a: 'Antonin Scalia', w: ['William Brennan', 'Stephen Breyer', 'Oliver Wendell Holmes'], why: 'Justice Scalia (on the Court 1986–2016) was a leading originalist; Brennan and Breyer are associated with living constitutionalism, Holmes with pragmatism.' },
    { L: [2, 3], q: 'A letter shows one delegate privately hoped a clause would one day reach a certain activity. To a public-meaning originalist, the letter is…', a: 'weak evidence at most; the ratifying public\'s understanding controls', w: ['decisive, because the framers\' intent controls', 'irrelevant, because history never matters', 'binding, because delegates wrote the text'], why: 'Public-meaning originalism looks to how the words were publicly understood, not one drafter\'s hopes.' },
    { L: [2, 3], q: 'Which reason do originalists give for their method?', a: 'It keeps judges bound by enacted law rather than their own preferences', w: ['It lets judges adapt the text to current values', 'It treats precedent as more important than text', 'It relies mainly on predicting consequences'], why: 'Advocates stress the rule of law, judicial restraint and democratic legitimacy.' },
    { L: [2, 3], q: 'Can a public-meaning originalist apply the Fourth Amendment\'s word "effects" to a smartphone?', a: 'Yes; a fixed meaning can apply to new things that fit it', w: ['No; only items that existed in 1791 count', 'Only if the framers predicted phones', 'Only after a constitutional amendment'], why: 'Public-meaning originalists separate fixed meaning from new applications; the "expected application" view is a minority position.' },
    { L: [1, 2, 3], q: 'Originalism holds that the meaning of a provision was fixed when it was adopted.', tf: true, why: 'That is the shared core claim of originalist theories.' },
    { L: [2, 3], q: 'Most originalists today hold that judges should look for what each framer privately intended.', tf: false, why: 'Most originalists moved from intent to public meaning, partly because a body of drafters has no single intent.' },
    { L: [3], q: 'Which are arguments originalists make for their method?', all: [['A written constitution is law because the people ratified its words', true], ['Fixed meaning restrains unelected judges', true], ['Amendment, not judicial updating, is the proper way to change the Constitution', true], ['Judges should apply evolving standards of the present day', false], ['Precedent always outranks the text', false]], why: 'The first three are originalist arguments; the fourth is a living constitutionalist view, and originalists do not treat precedent as outranking the text.' },
    { L: [3], q: 'Put these steps of a public-meaning inquiry in a sensible order.', order: ['Identify the words in question', 'Gather founding-era usage: dictionaries, debates, legal writing', 'Decide what an informed reader then understood', 'Apply that meaning to the present facts'], why: 'Find the words, gather evidence of usage, fix the meaning, then apply it.' }
  ]; }, 'Public meaning, at the time of ratification.'));

  G('conlaw1.living-constitutionalism', fromBank(function () { return [
    {"L":[1,2,3],"q":"Along with Stephen Breyer, which justice is named as an advocate of living constitutionalism?","a":"William Brennan","w":["Antonin Scalia","Clarence Thomas","Robert Bork","John Marshall"],"why":"Justices William Brennan and Stephen Breyer are leading examples."},
    {"L":[1,2,3],"q":"Living constitutionalists say constitutional law has developed mostly through…","a":"precedent built case by case","w":["frequent amendments","presidential orders","state conventions","the Federalist Papers alone"],"why":"Advocates say principles are applied to new conditions mainly through precedent."},
    {"L":[1,2,3],"q":"Which phrase is a broad term that living constitutionalists read as a principle?","a":"\"equal protection of the laws\"","w":["\"a Term of four Years\"","\"two Senators from each State\"","\"the Age of thirty five Years\""],"why":"Broad terms such as \"equal protection\" state principles; exact terms set fixed rules."},
    {"L":[1,2,3],"q":"Which is an exact rule in the Constitution, not a broad principle?","a":"A President must be at least 35","w":["\"equal protection of the laws\"","\"unreasonable searches and seizures\"","\"due process of law\""],"why":"The age rule is exact; the others are written in broad terms."},
    {"L":[1,2],"q":"David Strauss compares American constitutional law to…","a":"the common law","w":["a treaty","a contract among the states","a code of statutes","a royal charter"],"why":"Strauss argues judges reason from precedent, as in the common law."},
    { L: [1, 2, 3], q: 'Living constitutionalists hold that the Constitution\'s broad principles…', a: 'are applied to new conditions over time, mainly through precedent', w: ['have no authority over modern government', 'were fixed in their applications in 1788', 'may be changed only by amendment'], why: 'They accept the text\'s authority and read its broad phrases as principles whose application develops.' },
    { L: [1, 2], q: 'Which scholar described American constitutional law as working like the common law, in <i>The Living Constitution</i> (2010)?', a: 'David Strauss', w: ['Robert Bork', 'Philip Bobbitt', 'Edwin Meese'], why: 'David Strauss made the common-law argument; Bork and Meese were originalist advocates; Bobbitt described the modalities.' },
    { L: [1, 2], q: 'Which justice wrote <i>Active Liberty</i> (2005), a book associated with living constitutionalism?', a: 'Stephen Breyer', w: ['Clarence Thomas', 'Antonin Scalia', 'John Marshall'], why: 'Justice Breyer wrote <i>Active Liberty</i>.' },
    { L: [2, 3], q: 'Living constitutionalists say the framers wrote some clauses broadly ("equal protection") and others exactly (a President must be 35). What do they draw from that?', a: 'Broad clauses state principles meant to be applied by later generations', w: ['Exact clauses may be ignored', 'Broad clauses are not law', 'Only exact clauses bind judges'], why: 'They read the choice of broad language as an invitation to apply principles to new facts; exact rules stay exact.' },
    { L: [2, 3], q: 'Which line from <i>McCulloch v. Maryland</i> do living constitutionalists often cite?', a: '"a Constitution intended to endure for ages to come"', w: ['"the power to tax involves the power to destroy"', '"emphatically the province and duty of the judicial department"', '"Ambition must be made to counteract ambition"'], why: 'Marshall wrote that the Necessary and Proper Clause was "made in a Constitution intended to endure for ages to come, and consequently to be adapted to the various crises of human affairs."' },
    { L: [2, 3], q: 'Living constitutionalists ignore the text of the Constitution.', tf: false, why: 'They accept the text\'s authority; the disagreement concerns how its open-ended phrases apply over time.' },
    { L: [1, 2, 3], q: 'One argument living constitutionalists make is that Article V amendment is so hard that a Constitution changing only by amendment would fall behind the country.', tf: true, why: 'Amendment needs two-thirds of both houses and three-fourths of the states; advocates cite that difficulty.' },
    { L: [3], q: 'Which are arguments living constitutionalists make?', all: [['Much accepted constitutional law grew through precedent, not amendment', true], ['Broad clauses state principles for later application', true], ['Amendment is too difficult to be the only path of change', true], ['Meaning is fixed by public understanding at ratification', false], ['Judges are not bound by the text at all', false]], why: 'The first three are living-constitutionalist arguments; the fourth is originalist; no mainstream school says the text does not bind.' },
    { L: [3], q: 'A critic of living constitutionalism argues that it lets judges write their own views into law. Which reply do its advocates usually give?', a: 'Precedent and the craft of judging constrain judges, and other methods leave room too', w: ['Judges should write their own views into law', 'The text never matters', 'Only amendments can change outcomes'], why: 'Advocates answer that common-law reasoning is disciplined by precedent and that originalism also involves contested choices.' },
    { L: [2, 3], q: 'A scholar says the commerce power grew from 1895 to 1942 through a long series of decisions, without any amendment. Which school uses that history as an example of how constitutional law should develop?', a: 'Living constitutionalism', w: ['Original intent', 'Original public meaning', 'Expected-application originalism'], why: 'Living constitutionalists, especially Strauss, describe it as common-law development; originalist critics see drift from the text.' }
  ]; }, 'Principles in the text, applied over time through precedent.'));

  G('conlaw1.constitutional-precedent', fromBank(function () { return [
    { L: [1, 2, 3], q: 'Why is stare decisis weaker in constitutional cases than in statutory ones?', a: 'Only an amendment or the Court itself can correct a constitutional error', w: ['The Constitution has no precedents', 'Congress can easily overrule constitutional decisions', 'Lower courts may ignore constitutional precedent'], why: 'Congress can fix a statutory reading with a new law; a constitutional reading can be changed only by amendment or by the Court.' },
    { L: [1, 2], q: 'Which case overruled <i>Hammer v. Dagenhart</i>?', a: nm('darby') + ' (1941)', w: [nm('lopez') + ' (1995)', nm('brown') + ' (1954)', nm('gibbons') + ' (1824)'], why: '<i>United States v. Darby</i> (1941) upheld federal wage and hour rules and overruled <i>Hammer</i>.' },
    { L: [1, 2], q: 'Which case overruled <i>Adkins v. Children\'s Hospital</i> (1923)?', a: 'West Coast Hotel Co. v. Parrish (1937)', w: ['Garcia v. San Antonio MTA (1985)', 'Janus v. AFSCME (2018)', 'Marbury v. Madison (1803)'], why: '<i>West Coast Hotel</i> upheld a minimum-wage law and overruled <i>Adkins</i>.' },
    { L: [2, 3], q: 'Which precedent did <i>Garcia v. San Antonio Metropolitan Transit Authority</i> (1985) overrule?', a: nm('nationalleague') + ' (1976)', w: [nm('hammer') + ' (1918)', 'Abood v. Detroit Board of Education (1977)', nm('humphreys') + ' (1935)'], why: '<i>Garcia</i> overruled <i>National League of Cities</i>, finding its "traditional governmental functions" test unworkable.' },
    { L: [2, 3], q: 'Which precedent did <i>Janus v. AFSCME</i> (2018) overrule?', a: 'Abood v. Detroit Board of Education (1977)', w: [nm('humphreys') + ' (1935)', nm('nationalleague') + ' (1976)', nm('hammer') + ' (1918)'], why: '<i>Janus</i> held public-sector agency fees unconstitutional and overruled <i>Abood</i>.' },
    { L: [2, 3], q: '<i>Janus v. AFSCME</i> (2018) overruled <i>Abood</i> by a vote of…', a: '5 to 4', w: ['9 to 0', '7 to 2', '6 to 3'], why: '<i>Janus</i> was decided 5 to 4.' },
    { L: [2, 3], q: 'Which of these is NOT one of the stare decisis factors the Court lists?', a: 'Whether the current justices like the policy result', w: ['The quality of the precedent\'s reasoning', 'Its workability', 'Reliance on it'], why: 'The factors are quality of reasoning, workability, consistency with related decisions, developments since and reliance. Policy preference is not one.' },
    { L: [3], q: 'Which are factors the Court weighs before overruling a constitutional precedent?', all: [['Quality of the reasoning', true], ['Workability', true], ['Consistency with related decisions', true], ['Reliance interests', true], ['The age of the justice who wrote it', false], ['Whether Congress agrees', false]], why: 'Quality, workability, consistency, later developments and reliance.' },
    { L: [3], q: 'A precedent produces conflicting results in lower courts, and later cases have undercut its logic, but many contracts depend on it. Which factor weighs AGAINST overruling?', a: 'Reliance', w: ['Workability', 'Quality of reasoning', 'Consistency with later cases'], why: 'Unworkability, weak reasoning and inconsistency favor overruling; concrete reliance such as contracts favors keeping it.' },
    { L: [1, 2, 3], q: 'The Supreme Court has never overruled one of its own constitutional decisions.', tf: false, why: 'It has done so many times: <i>West Coast Hotel</i>, <i>Darby</i>, <i>Garcia</i> and <i>Janus</i> are examples.' },
    { L: [3], gen: function () { return chrono([3], ['hammer', 'darby', 'nationalleague', 'garcia', 'humphreys']); } },
    { L: [2, 3], q: 'In <i>Federalist</i> No. 78, Hamilton wrote that to avoid "an arbitrary discretion in the courts," judges should be bound down by…', a: 'strict rules and precedents', w: ['the will of the legislature', 'the opinions of the President', 'popular votes'], why: 'Hamilton wrote that "it is indispensable that they should be bound down by strict rules and precedents."' }
  ]; }, 'Weigh quality, workability, consistency, later developments and reliance.'));

  /* ======================================================== Unit 2: The Judicial Power */
  G('conlaw1.marbury', fromBank(function () { return [
    { L: [1, 2, 3], q: 'In <i>Marbury v. Madison</i> (1803), did the Supreme Court order Madison to deliver Marbury\'s commission?', a: 'No; it held it lacked jurisdiction to issue the writ', w: ['Yes; it issued the writ of mandamus', 'Yes, but Madison refused', 'No; it held Marbury had no right to the commission'], why: 'Marbury had a right and a remedy, but Section 13 of the Judiciary Act of 1789, as the Court read it, unconstitutionally enlarged the Court\'s original jurisdiction, so the Court could not issue the writ.' },
    { L: [1, 2], q: 'Which law did <i>Marbury</i> hold unconstitutional in part?', a: 'The Judiciary Act of 1789', w: ['The Alien and Sedition Acts', 'The Judiciary Act of 1801', 'The Bill of Rights'], why: 'The Court held that Section 13 of the Judiciary Act of 1789, read to let it issue mandamus in its original jurisdiction, conflicted with Article III.' },
    { L: [1, 2], q: 'Who wrote the opinion of the Court in <i>Marbury v. Madison</i>?', a: 'Chief Justice John Marshall', w: ['Justice Joseph Story', 'James Madison', 'Thomas Jefferson'], why: 'Chief Justice John Marshall wrote it; Madison was the defendant as Secretary of State.' },
    { L: [1, 2, 3], q: 'Complete Marshall\'s sentence: "It is emphatically the province and duty of the Judicial Department to…"', a: 'say what the law is', w: ['make the law', 'enforce the law', 'amend the Constitution'], why: '"It is emphatically the province and duty of the Judicial Department to say what the law is."' },
    { L: [2, 3], q: 'Which statement best states <i>Marbury</i>\'s holding on judicial review?', a: 'A court deciding a case must apply the Constitution over a conflicting statute', w: ['The Supreme Court is the only interpreter of the Constitution for all officials', 'Congress may not regulate the federal courts', 'The President must obey all Supreme Court opinions'], why: 'The holding is narrow: in deciding a case, a court must not enforce a law repugnant to the Constitution. Broader claims of judicial supremacy came later (Cooper v. Aaron, 1958).' },
    { L: [2, 3], q: 'Marbury asked for a writ of mandamus. What is that?', a: 'A court order directing an official to perform a duty', w: ['A request to the Senate to confirm an appointment', 'An order releasing a prisoner', 'A declaration that a law is void'], why: 'Mandamus ("we command") orders an official to do a legal duty, here delivering the commission.' },
    { L: [2, 3], q: 'In what year was <i>Marbury v. Madison</i> decided?', num: 1803, why: 'February 1803, two years into Jefferson\'s presidency.' },
    { L: [3], q: 'Put Marshall\'s three questions in the order he answered them.', order: ['Has Marbury a right to the commission?', 'Do the laws afford him a remedy?', 'Can this Court issue that remedy?'], why: 'Right, remedy, then jurisdiction. Answering the first two first let Marshall criticize the administration while ordering nothing.' },
    { L: [3], q: 'Which are reasons Marshall gave for judicial review?', all: [['The Constitution is written, paramount law', true], ['Courts must decide which of two conflicting laws applies to a case', true], ['Judges swear an oath to support the Constitution', true], ['The Constitution expressly says "the Supreme Court may strike down laws"', false], ['Congress had asked the Court to review the act', false]], why: 'Marshall reasoned from the written Constitution, the judicial duty to decide cases and the oath. No clause expressly grants judicial review.' },
    { L: [2, 3], q: 'Which <i>Federalist</i> paper argued, before <i>Marbury</i>, that courts should prefer the Constitution to a conflicting statute?', a: 'No. 78', w: ['No. 10', 'No. 51', 'No. 70'], why: 'Hamilton wrote in No. 78 that "the Constitution ought to be preferred to the statute."' },
    { L: [1, 2, 3], q: '<i>Marbury v. Madison</i> held that the Supreme Court is the sole interpreter of the Constitution for every branch of government.', tf: false, why: 'Its holding concerned a court\'s duty in deciding a case. Claims about binding all officials came later.' },
    { L: [3], q: 'After <i>Marbury</i> (1803), when did the Court next hold an act of Congress unconstitutional?', a: 'Dred Scott v. Sandford (1857)', w: ['McCulloch v. Maryland (1819)', 'Gibbons v. Ogden (1824)', 'Martin v. Hunter\'s Lessee (1816)'], why: 'The next time was Dred Scott in 1857. McCulloch upheld an act of Congress; Martin concerned state courts.' }
  ]; }, 'Right, remedy, jurisdiction: which question did Marbury lose on?'));

  G('conlaw1.review-of-states', fromBank(function () { return [
    { L: [1, 2, 3], q: 'Which case upheld the U.S. Supreme Court\'s power to review state court rulings on federal law?', a: ny('martin'), w: [ny('marbury'), ny('cooper'), ny('mccardle')], why: '<i>Martin v. Hunter\'s Lessee</i> (1816), by Justice Story, rejected Virginia\'s claim that its courts were beyond Supreme Court review.' },
    { L: [1, 2], q: 'What reason did Justice Story stress for Supreme Court review of state courts?', a: 'Uniformity of federal law throughout the country', w: ['State judges were not trained in law', 'Congress had abolished the state courts', 'The President had asked for it'], why: 'Story pointed to "the importance, and even necessity of uniformity of decisions throughout the whole United States" on federal questions.' },
    { L: [1, 2, 3], q: 'A state supreme court interprets its own state constitution, and no federal issue is involved. Who has the final word?', a: 'The state\'s highest court', w: ['The U.S. Supreme Court', 'The nearest federal court of appeals', 'Congress'], why: 'On purely state law, the state\'s highest court is final. The U.S. Supreme Court reviews only federal questions.' },
    { L: [2, 3], q: 'A state supreme court rules that a state law does not violate the First Amendment. May the U.S. Supreme Court review that ruling?', a: 'Yes, because it decides a federal question', w: ['No, state courts are final on all their cases', 'Only if Congress consents', 'Only if the state governor agrees'], why: 'Under <i>Martin</i>, the Supreme Court\'s appellate power reaches state rulings on federal law.' },
    { L: [1, 2], q: '<i>Cooper v. Aaron</i> (1958) arose from resistance to desegregation in which city?', a: 'Little Rock, Arkansas', w: ['Montgomery, Alabama', 'Topeka, Kansas', 'Birmingham, Alabama'], why: 'Arkansas officials resisted desegregation of Little Rock\'s Central High School after Brown.' },
    { L: [2, 3], q: 'What did <i>Cooper v. Aaron</i> hold?', a: 'State officials are bound by the Supreme Court\'s interpretation of the Constitution in Brown', w: ['States may delay desegregation during unrest', 'Federal courts may not review state school policy', 'The President alone enforces the Constitution'], why: 'The unanimous Court refused a delay and said Brown\'s interpretation of the Fourteenth Amendment is the supreme law of the land, binding state officials.' },
    { L: [2, 3], q: 'What was unusual about the opinion in <i>Cooper v. Aaron</i>?', a: 'It was signed by all nine justices', w: ['It was unsigned and one sentence long', 'It was decided 5 to 4', 'It was written by the Chief Justice of Arkansas'], why: 'All nine justices signed it, to show the Court\'s unity.' },
    { L: [3], q: 'Put these in time order.', order: ['Judiciary Act of 1789, Section 25', 'Marbury v. Madison (1803)', 'Martin v. Hunter\'s Lessee (1816)', 'Cohens v. Virginia (1821)', 'Cooper v. Aaron (1958)'], why: '1789, 1803, 1816, 1821, 1958.' },
    { L: [3], q: '"Departmentalists" argue that each branch interprets the Constitution for its own work. Which statement describes the disagreement with <i>Cooper</i>?', a: 'Whether the Court\'s interpretations bind officials beyond the parties to a case', w: ['Whether officials must obey a court judgment in a decided case', 'Whether courts may hear constitutional cases at all', 'Whether states have courts'], why: 'Both sides agree judgments must be obeyed; they differ on whether the Court\'s reasoning binds everyone else in future matters.' },
    { L: [1, 2, 3], q: 'The Supremacy Clause says the judges in every state are bound by the Constitution and federal law.', tf: true, why: 'Article VI: "the Judges in every State shall be bound thereby."' },
    { L: [2, 3], q: 'Which <i>Federalist</i> paper argues that "the mere necessity of uniformity in the interpretation of the national laws" decides the question of federal judicial power?', a: 'No. 80', w: ['No. 10', 'No. 47', 'No. 84'], why: 'Hamilton, Federalist No. 80.' }
  ]; }, 'Federal question or state question?'));

  G('conlaw1.jurisdiction-stripping', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['mccardle', 'marbury', 'martin', 'baker']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['mccardle', 'marbury', 'martin', 'baker']); } },
    { L: [1, 2, 3], q: 'Which words of Article III give Congress power over the Supreme Court\'s appellate jurisdiction?', a: '"with such Exceptions, and under such Regulations as the Congress shall make"', w: ['"necessary and proper"', '"the sole Power to try all Impeachments"', '"during good Behaviour"'], why: 'The Exceptions Clause, Article III, Section 2, Clause 2.' },
    { L: [1, 2], q: 'Which case accepted Congress\'s repeal of the Court\'s jurisdiction over a pending appeal?', a: ny('mccardle'), w: [ny('marbury'), ny('martin'), ny('baker')], why: 'In <i>Ex parte McCardle</i> (1869) the Court dismissed the appeal after Congress repealed the jurisdiction.' },
    { L: [1, 2], q: 'Does the Constitution require Congress to create lower federal courts?', a: 'No; it creates only the Supreme Court and lets Congress create inferior courts', w: ['Yes; it names thirteen circuit courts', 'Yes; one in each state', 'No; it forbids lower federal courts'], why: 'Article III: "one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish."' },
    { L: [2, 3], q: 'What was McCardle\'s situation?', a: 'A newspaper editor held by the army for trial by military commission during Reconstruction', w: ['A judge refused his commission', 'A state official defied desegregation', 'A taxpayer challenging spending'], why: 'William McCardle, a Mississippi editor, was held under the Reconstruction Acts and sought habeas corpus.' },
    { L: [2, 3], q: 'After <i>McCardle</i>, could a detained person still reach the Supreme Court?', a: 'Yes, through habeas jurisdiction under the Judiciary Act of 1789, as in Ex parte Yerger (1869)', w: ['No, all routes were closed', 'Only with the President\'s permission', 'Only through state courts'], why: 'The 1868 repeal reached only the 1867 appeal route; the Court said its older jurisdiction remained and used it in <i>Yerger</i>.' },
    { L: [2, 3], q: 'Congress cannot change the Supreme Court\'s appellate jurisdiction at all.', tf: false, why: 'The Exceptions Clause gives Congress real power; McCardle accepted a repeal. The debate is about outer limits.' },
    { L: [1, 2, 3], q: 'Congress may not enlarge the Supreme Court\'s original jurisdiction beyond what Article III sets.', tf: true, why: 'That was the holding of Marbury v. Madison.' },
    { L: [3], q: 'Which are arguments scholars make for LIMITS on jurisdiction-stripping?', all: [['An "exception" cannot swallow the Court\'s essential role', true], ['Due process may require some court to hear constitutional claims', true], ['Congress may not tell courts how to decide a pending case', true], ['The Exceptions Clause does not exist', false], ['McCardle struck down the 1868 repeal', false]], why: 'The first three are arguments in the debate; the Exceptions Clause is in the text, and McCardle accepted the repeal.' },
    { L: [3], q: 'A statute removes all federal jurisdiction over challenges to Law X but leaves state courts open. Compared with a law closing every court, it is…', a: 'on firmer ground, since a forum remains for the constitutional claim', w: ['plainly unconstitutional under McCardle', 'unreviewable by any court', 'the same in every respect'], why: 'Leaving state courts open (bound by the Supremacy Clause) avoids the strongest due process objection. The outer limits remain debated.' },
    { L: [2, 3], q: 'In what year did Congress repeal the appellate route McCardle used?', a: '1868', w: ['1803', '1937', '1954'], why: 'The repeal was enacted March 27, 1868; the Court dismissed in 1869.' }
  ]; }, 'Look at the Exceptions Clause and at what McCardle left open.'));

  G('conlaw1.constitutional-standing', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['flast', 'frothingham', 'lujan', 'hein']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['flast', 'frothingham', 'lujan', 'hein']); } },
    { L: [1, 2, 3], q: 'Does a federal taxpayer, as a taxpayer, generally have standing to challenge federal spending?', a: 'No (Frothingham v. Mellon, 1923)', w: ['Yes, always (Flast v. Cohen, 1968)', 'Yes, if the amount exceeds a million dollars', 'Only for military spending'], why: 'The general rule since <i>Frothingham</i>: a taxpayer\'s interest is shared with millions and too small and indeterminate.' },
    { L: [1, 2], q: 'Which case created a narrow exception allowing taxpayer suits?', a: ny('flast'), w: [ny('frothingham'), ny('lujan'), ny('hein')], why: '<i>Flast v. Cohen</i> (1968) allowed Establishment Clause challenges to congressional spending.' },
    { L: [1, 2, 3], q: 'What are the three parts of standing?', a: 'Injury in fact, causation, redressability', w: ['Notice, hearing, decision', 'Jurisdiction, venue, service', 'Facts, issue, holding'], why: 'From <i>Lujan v. Defenders of Wildlife</i> (1992): a concrete injury, fairly traceable to the defendant, that a court can redress.' },
    { L: [2, 3], q: 'Flast\'s second nexus requires that the challenge rest on a specific limit on the taxing and spending power. Which constitutional provision has the Court accepted as such a limit?', a: 'The Establishment Clause', w: ['The Tenth Amendment', 'The Commerce Clause', 'The Due Process Clause'], why: 'The Establishment Clause; the Court said the Tenth Amendment is not such a limit.' },
    { L: [2, 3], q: 'Taxpayers challenge White House conferences funded from general executive appropriations as favoring religion. Under <i>Hein</i> (2007), do they have standing?', a: 'No; Flast covers only spending Congress specifically authorized', w: ['Yes, under Flast', 'Yes, because all spending is taxpayer money', 'Only if the President consents'], why: '<i>Hein</i> refused to extend Flast to executive spending from general appropriations.' },
    { L: [3], gen: function () { return { q: 'Classify each plaintiff. Which ones likely HAVE standing?', all: [['A business fined under a federal law challenges the law as beyond Congress\'s power', true], ['A taxpayer brings an Establishment Clause challenge to a statute appropriating money to religious schools', true], ['A taxpayer argues a federal highway program exceeds the commerce power', false], ['A citizen complains that Congress ignores the Constitution', false]], why: 'The fined business has a concrete injury; the Establishment Clause challenge to congressional spending fits Flast. General taxpayer and citizen grievances do not.' }; } },
    { L: [2, 3], q: 'What vote did Flast v. Cohen (1968) have?', a: '8 to 1', w: ['5 to 4', '9 to 0', '6 to 3'], why: 'Justice Harlan was the lone dissenter.' },
    { L: [1, 2, 3], q: 'Being a taxpayer gives a person standing to challenge any federal spending program.', tf: false, why: 'The general rule is no; Flast is a narrow exception.' },
    { L: [3], gen: function () { return chrono([3], ['frothingham', 'flast', 'lujan', 'hein']); } },
    { L: [2, 3], q: 'Why do standing rules keep courts from hearing general complaints about government?', a: 'Article III limits courts to concrete "Cases" and "Controversies"', w: ['Congress forbids such suits by statute', 'The President decides which suits proceed', 'State courts must hear them first'], why: 'Standing comes from Article III\'s case-or-controversy requirement and reflects the separation of powers.' }
  ]; }, 'Is there a personal injury beyond being a taxpayer? If not, does it fit Flast exactly?'));

  G('conlaw1.political-questions-conlaw', fromBank(function () { return [
    { L: [1, 2, 3], q: 'What did <i>Baker v. Carr</i> (1962) hold?', a: 'Claims of unequal legislative districts are justiciable', w: ['Apportionment is a political question courts must avoid', 'States must redraw maps every year', 'Only Congress may draw districts'], why: '<i>Baker</i> held the equal protection claim justiciable; it is famous for opening courts to apportionment cases.' },
    { L: [1, 2], q: 'Which case held that partisan gerrymandering claims are beyond the reach of federal courts?', a: ny('rucho'), w: [ny('baker'), ny('reynolds'), ny('nixonus')], why: '<i>Rucho v. Common Cause</i> (2019), 5 to 4.' },
    { L: [1, 2], q: 'Which case held that how the Senate tries an impeachment is for the Senate to decide?', a: ny('nixonus'), w: [ny('nixon'), ny('baker'), ny('rucho')], why: '<i>Nixon v. United States</i> (1993), about Judge Walter Nixon. Do not confuse it with <i>United States v. Nixon</i> (1974), the tapes case.' },
    { L: [2, 3], q: 'In <i>Nixon v. United States</i> (1993), which words of the Constitution did the Court rely on?', a: '"the sole Power to try all Impeachments"', w: ['"one person, one vote"', '"Cases" and "Controversies"', '"with such Exceptions"'], why: 'Article I, Section 3 gives the Senate the sole power to try impeachments: a textual commitment to another branch.' },
    { L: [2, 3], q: 'Which reason did the <i>Rucho</i> majority give?', a: 'There are no judicially manageable standards for how much partisanship is too much', w: ['Gerrymandering is required by the Constitution', 'The plaintiffs lacked any injury', 'States may not draw districts'], why: 'Chief Justice Roberts found no legal standard for "fair" partisan shares and pointed to states and Congress as other routes.' },
    { L: [2, 3], q: 'Which two Baker factors do most of the work in modern political question cases?', a: 'A textual commitment to another branch and a lack of manageable standards', w: ['The age of the case and the number of parties', 'Federalism and the Tenth Amendment', 'Standing and ripeness'], why: 'Those two were decisive in <i>Nixon</i> (commitment) and <i>Rucho</i> (standards).' },
    { L: [1, 2, 3], q: '<i>Baker v. Carr</i> refused to decide the Tennessee apportionment case because it was a political question.', tf: false, why: '<i>Baker</i> held the claim justiciable; the political question factors it listed are used in other cases.' },
    { L: [3], gen: function () { return chrono([3], ['baker', 'reynolds', 'nixonus', 'rucho']); } },
    { L: [3], q: 'Which are among the markers of a political question listed in <i>Baker</i>?', all: [['A textual commitment of the issue to another branch', true], ['A lack of judicially discoverable and manageable standards', true], ['A policy decision of a kind not for courts', true], ['The plaintiff is a state', false], ['The case involves money', false]], why: 'Baker\'s markers concern commitment, standards, policy choices and respect for other branches.' },
    { L: [3], q: 'A plaintiff asks a federal court to rule that the President\'s decision to recognize a foreign government is unwise. Which modern factor most clearly suggests a political question?', a: 'Lack of a manageable legal standard for "wise" foreign policy', w: ['The plaintiff lacks a lawyer', 'The case arose in a state court', 'The decision was made recently'], why: 'Whether a policy is wise has no legal standard; courts decide legal claims, not policy merits.' },
    { L: [2, 3], q: 'Where did the <i>Rucho</i> majority say remedies for partisan gerrymandering could come from?', a: 'State constitutions and courts, independent commissions and Congress', w: ['Only the U.S. Supreme Court', 'The President by executive order', 'Nowhere; no remedy exists anywhere'], why: 'Roberts listed state law, commissions and Congress\'s power under the Elections Clause.' }
  ]; }, 'Is the issue committed to another branch, or is there no legal standard?'));

  /* ======================================================== Unit 3: Enumerated Powers and McCulloch */
  var LAWS3 = [
    ['safety standards for trucks that cross state lines', 'the Commerce Clause'],
    ['a tax on imported goods', 'the taxing power'],
    ['minting a new coin', 'the coinage power'],
    ['a patent for a new invention', 'the Patent and Copyright Clause'],
    ['rules for becoming a citizen', 'the naturalization power'],
    ['building a naval shipyard', 'the power to provide and maintain a navy'],
    ['punishing theft of mail', 'the postal power with the Necessary and Proper Clause'],
    ['a law making it a crime to deny someone the vote because of race', 'the enforcement clause of the Fifteenth Amendment']
  ];
  var POWERS3 = ['the Commerce Clause', 'the taxing power', 'the coinage power', 'the Patent and Copyright Clause', 'the naturalization power', 'the power to provide and maintain a navy', 'the postal power with the Necessary and Proper Clause', 'the enforcement clause of the Fifteenth Amendment'];
  G('conlaw1.enumerated-powers', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(LAWS3); return { q: 'Congress passes a law about ' + x[0] + '. Which granted power most directly supports it?', a: x[1], w: POWERS3.filter(function (p) { return p !== x[1]; }), why: 'Every federal law must trace to a granted power; this one rests on ' + x[1] + '.' }; } },
    { L: [1, 2], q: 'Which level of government has a general "police power" to regulate health, safety and welfare?', a: 'The states', w: ['The federal government', 'Neither', 'Only cities'], why: 'States have general police power; Congress has only enumerated powers.' },
    { L: [1, 2, 3], q: 'Which amendment confirms that powers not delegated to the United States are reserved to the states or the people?', a: 'The Tenth Amendment', w: ['The First Amendment', 'The Fourteenth Amendment', 'The Ninth Amendment'], why: 'The Tenth Amendment (1791).' },
    { L: [2, 3], q: 'The General Welfare Clause (Article I, Section 8, Clause 1) is best described as…', a: 'a power to tax and spend for the general welfare', w: ['a general power to regulate anything for the general welfare', 'a limit on state police powers', 'a power of the President'], why: 'It authorizes taxes "to … provide for the … general Welfare." It is not a freestanding power to regulate.' },
    { L: [2, 3], q: 'Who wrote that the federal government\'s powers are "few and defined" while the states\' are "numerous and indefinite"?', a: 'James Madison, Federalist No. 45', w: ['Alexander Hamilton, Federalist No. 78', 'John Marshall, McCulloch v. Maryland', 'Brutus, essay I'], why: 'Madison, Federalist No. 45.' },
    { L: [2, 3], q: 'Which of these is a source of congressional power outside Article I, Section 8?', a: 'The enforcement clause of the Fourteenth Amendment', w: ['The Tenth Amendment', 'The Preamble', 'The Supremacy Clause'], why: 'Section 5 of the Fourteenth Amendment gives Congress power to enforce it "by appropriate legislation." The Preamble grants no powers; the Tenth reserves them.' },
    { L: [1, 2, 3], q: 'Congress may pass any law it finds good for the general welfare, as long as it is popular.', tf: false, why: 'Congress has only enumerated powers; the General Welfare Clause is a taxing and spending power.' },
    { L: [3], q: 'Which are enumerated powers of Congress in Article I, Section 8?', all: [['Regulate commerce among the states', true], ['Coin money', true], ['Declare war', true], ['Establish post offices', true], ['Set a national marriage age', false], ['Run local schools', false]], why: 'Marriage and local schools are matters of state police power, not on the list.' },
    { L: [3], q: 'Congress wants to set rules for a subject that is not on the list of powers. Which route could it use, subject to its own limits?', a: 'Attach conditions to federal grants under the spending power', w: ['Pass a direct order under the Tenth Amendment', 'Cite the Preamble', 'Declare a general police power'], why: 'Conditional spending lets Congress encourage states; it has limits (South Dakota v. Dole).' },
    { L: [2, 3], q: 'Which Anti-Federalist writer argued that the taxing power, read with the General Welfare and Necessary and Proper Clauses, had no real limit?', a: 'Brutus', w: ['Publius', 'John Marshall', 'Joseph Story'], why: 'Brutus made that argument (essays V and VI); Publius was the pen name of the Federalist.' }
  ]; }, 'Name the power on the list first.'));

  G('conlaw1.mcculloch', fromBank(function () { return [
    { L: [1, 2, 3], q: 'What did <i>McCulloch v. Maryland</i> (1819) hold?', a: 'Congress could charter a national bank, and Maryland could not tax it', w: ['Congress could not charter a bank, and Maryland could tax it', 'Congress could charter a bank, and Maryland could tax it', 'The bank was a state matter only'], why: 'Both holdings went for the national government: the bank was a valid means, and the state tax was invalid.' },
    { L: [1, 2], q: 'Complete Marshall\'s phrase: "the power to tax involves the power to…"', a: 'destroy', w: ['create', 'borrow', 'regulate'], why: '"That the power to tax involves the power to destroy" was part of his reason Maryland could not tax the bank.' },
    { L: [1, 2], q: 'Which clause did <i>McCulloch</i> read broadly to support the bank?', a: 'The Necessary and Proper Clause', w: ['The Commerce Clause', 'The General Welfare Clause', 'The Tenth Amendment'], why: 'Article I, Section 8, Clause 18.' },
    { L: [2, 3], q: 'How did Marshall read the word "necessary"?', a: 'Convenient, useful or conducive to the end, not absolutely necessary', w: ['Absolutely indispensable', 'Approved by the states', 'Listed in Article I'], why: 'He contrasted Article I, Section 10\'s "absolutely necessary" with the clause\'s plain "necessary."' },
    { L: [2, 3], q: 'What textual comparison did Marshall make about "necessary"?', a: 'Article I, Section 10 says "absolutely necessary" when strict need is meant', w: ['The Articles of Confederation said "convenient"', 'The Bill of Rights says "necessary and proper"', 'The Preamble says "necessary"'], why: 'Section 10 lets states lay import duties only as "absolutely necessary" for inspection laws, showing the framers knew how to demand strict necessity.' },
    { L: [2, 3], q: 'Complete: "Let the end be legitimate, let it be within the scope of the Constitution, and all means which are appropriate, which are plainly adapted to that end…"', a: '"which are not prohibited, but consist with the letter and spirit of the Constitution, are Constitutional"', w: ['"are Constitutional if the states consent"', '"are reserved to the States respectively"', '"may be reviewed by the President"'], why: 'Marshall\'s test: a legitimate end, appropriate means plainly adapted to it, and not prohibited.' },
    { L: [1, 2], q: 'What was the vote in <i>McCulloch v. Maryland</i>?', a: 'Unanimous (7 to 0)', w: ['5 to 2', '4 to 3', '6 to 1'], why: 'The Court was unanimous.' },
    { L: [1, 2, 3], q: '<i>McCulloch</i> holds that Congress may do anything useful to the country.', tf: false, why: 'The end must be legitimate and within an enumerated power; the clause concerns means.' },
    { L: [3], q: 'Under McCulloch, which are required for a law to be valid under the Necessary and Proper Clause?', all: [['A legitimate end within the Constitution\'s scope', true], ['Means appropriate and plainly adapted to that end', true], ['Means not prohibited by the Constitution', true], ['Proof the means is absolutely necessary', false], ['Approval by the states', false]], why: 'End, fit and no prohibition; absolute necessity and state approval are not required.' },
    { L: [3], q: 'Put in time order.', order: ['First Bank of the United States chartered (1791)', 'Second Bank chartered (1816)', 'Maryland taxes banks not chartered by the state (1818)', 'McCulloch v. Maryland decided (1819)'], why: '1791, 1816, 1818, 1819.' },
    { L: [3], q: 'Congress makes it a federal crime to steal mail. Applying McCulloch, what is the legitimate END?', a: 'Establishing post offices and post roads', w: ['Punishing all theft', 'The general welfare', 'The police power'], why: 'The end comes from an enumerated power (Article I, Section 8, Clause 7); the crime is a means.' },
    { L: [2, 3], q: 'Which <i>Federalist</i> paper argued that "wherever the end is required, the means are authorized"?', a: 'No. 44 (Madison)', w: ['No. 10 (Madison)', 'No. 70 (Hamilton)', 'No. 84 (Hamilton)'], why: 'Madison, Federalist No. 44, on the Necessary and Proper Clause.' },
    { L: [2, 3], q: 'Which reason did Marshall give that Maryland could not tax the bank?', a: 'A state may not burden a federal institution, since federal law is supreme', w: ['The bank paid no profits', 'Maryland had no taxing power at all', 'The tax was too small'], why: 'A part cannot control the whole; Maryland\'s tax would burden people in every other state who had no voice in Maryland.' }
  ]; }, 'End, means, and no prohibition.'));

  G('conlaw1.necessary-proper-today', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['comstock', 'mcculloch', 'nfib']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['comstock', 'mcculloch', 'nfib']); } },
    { L: [1, 2, 3], q: 'What did <i>United States v. Comstock</i> (2010) uphold?', a: 'Civil commitment of sexually dangerous federal prisoners after their sentences', w: ['A national bank', 'The individual health insurance mandate', 'A ban on guns near schools'], why: 'The Court held the commitment law a reasonable means connected to Congress\'s powers.' },
    { L: [1, 2], q: 'What was the vote in <i>Comstock</i>?', a: '7 to 2', w: ['5 to 4', '9 to 0', '6 to 3'], why: 'Justice Breyer wrote for five; Justices Kennedy and Alito concurred in the judgment; Justices Thomas and Scalia dissented.' },
    { L: [2, 3], q: 'In NFIB v. Sebelius, Chief Justice Roberts wrote that the individual mandate was not a valid exercise of the Necessary and Proper Clause because it was not…', a: '"proper"', w: ['"necessary"', '"commerce"', '"a tax"'], why: 'Even if necessary to the Act\'s reforms, it was not a "proper" means: it would let Congress create the commerce it regulates.' },
    { L: [2, 3], q: 'Who dissented in <i>Comstock</i>, arguing civil commitment is a state police power?', a: 'Justice Thomas (joined in part by Justice Scalia)', w: ['Justice Breyer', 'Chief Justice Roberts', 'Justice Ginsburg'], why: 'Thomas dissented; Breyer wrote the majority; Roberts and Ginsburg joined it.' },
    { L: [2, 3], q: 'How are Comstock and NFIB best described?', a: 'Both apply McCulloch; they differ on whether a measure is a proper means respecting limited powers', w: ['NFIB overruled Comstock', 'Comstock overruled McCulloch', 'They concern different clauses entirely'], why: 'Neither rejects McCulloch; the outcomes differ on application.' },
    { L: [3], q: 'Which considerations did the Comstock majority rely on?', all: [['The breadth of the Necessary and Proper Clause', true], ['A long history of federal involvement in prisoner care and commitment', true], ['The government\'s role as custodian of its prisoners', true], ['The law\'s accommodation of state interests and narrow scope', true], ['A general federal police power', false]], why: 'The majority named five considerations; it expressly denied any general police power.' },
    { L: [2, 3], q: 'What reasoning did Roberts give against the mandate under the Necessary and Proper Clause?', a: 'It would create a new power (compelling people into commerce) rather than carry out an existing one', w: ['Health care is not useful', 'Congress had no power over insurance at all', 'The states had not consented'], why: 'He viewed the mandate as expanding the commerce power itself, not as a means of executing it.' },
    { L: [1, 2, 3], q: 'Comstock and NFIB both accepted McCulloch v. Maryland\'s test for means.', tf: true, why: 'Both opinions work within McCulloch.' },
    { L: [3], q: 'A law requires federal prisons to provide medical care to inmates. A challenger says no enumerated power mentions prisons. Under Comstock\'s reasoning, the best answer is…', a: 'Prisons are a means of enforcing valid federal crimes, and care of prisoners is a means of running prisons', w: ['The Tenth Amendment forbids federal prisons', 'Only states may run prisons', 'The law needs a constitutional amendment'], why: 'Comstock accepted a chain of means rooted in enumerated powers.' },
    { L: [3], gen: function () { return chrono([3], ['mcculloch', 'comstock', 'nfib']); } }
  ]; }, 'Ask what enumerated power the law carries out, and whether the means respects limited powers.'));

  /* ======================================================== Unit 4: The Commerce Power */
  G('conlaw1.gibbons', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['gibbons']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['gibbons']); } },
    { L: [1, 2, 3], q: 'What did <i>Gibbons v. Ogden</i> (1824) hold?', a: 'A federal coasting license overrode New York\'s steamboat monopoly', w: ['New York\'s monopoly was valid against federal law', 'Congress could not regulate navigation', 'States alone regulate commerce between states'], why: 'Commerce includes navigation, and a valid federal law overrides a conflicting state grant under the Supremacy Clause.' },
    { L: [1, 2], q: 'Complete Marshall\'s sentence: "Commerce, undoubtedly, is traffic, but it is something more: it is…"', a: 'intercourse', w: ['manufacturing', 'taxation', 'agriculture'], why: '"Commerce, undoubtedly, is traffic, but it is something more: it is intercourse."' },
    { L: [1, 2, 3], q: 'How did Marshall define "among" in "among the several States"?', a: 'Intermingled with', w: ['Between the borders of', 'Owned by', 'Approved by'], why: '"The word \'among\' means intermingled with," so commerce among the states may reach into a state\'s interior.' },
    { L: [2, 3], q: 'Which commerce did Gibbons say the clause does NOT reach?', a: 'Commerce completely internal to a state that does not affect other states', w: ['Navigation on rivers', 'Trade with foreign nations', 'Commerce that passes through a state'], why: 'Marshall excluded "that commerce which is completely internal" and limited "among" to commerce "which concerns more States than one."' },
    { L: [2, 3], q: 'Where did Marshall locate the main restraint on Congress\'s commerce power?', a: 'In the wisdom of Congress and the influence of voters at elections', w: ['In the Tenth Amendment', 'In state courts', 'In the President\'s veto alone'], why: 'He wrote that "the wisdom and the discretion of Congress, their identity with the people, and the influence which their constituents possess at elections" are the restraints.' },
    { L: [1, 2], q: 'Who held the federal coasting license in the case?', a: 'Thomas Gibbons', w: ['Aaron Ogden', 'Robert Fulton', 'James Madison'], why: 'Gibbons ran steamboats under a federal license; Ogden held a license under New York\'s monopoly.' },
    { L: [2, 3], q: 'In what year was <i>Gibbons v. Ogden</i> decided?', num: 1824, why: '1824, five years after McCulloch v. Maryland.' },
    { L: [3], gen: function (R) { return { q: 'Under Gibbons\'s own line, which activities could Congress regulate?', all: R.shuffle([['A ferry carrying passengers between two states', true], ['A riverboat inside one state carrying cargo bound for another state', true], ['Shipments from a foreign country to a U.S. port', true], ['A baker selling bread to neighbors in one town, with no effect beyond the state', false]]), why: 'Commerce that concerns more states than one, including the parts inside a state, is reached; completely internal commerce is not.' }; } },
    { L: [1, 2, 3], q: 'Gibbons v. Ogden held that Congress may regulate every economic activity in the country.', tf: false, why: 'It defined commerce broadly but left completely internal commerce to the states.' }
  ]; }, 'Commerce that concerns more states than one.'));

  G('conlaw1.commerce-narrow-era', fromBank(function () { return [
    { L: [1, 2, 3], q: 'Which case held that manufacturing is not commerce, so the Sherman Act did not reach a sugar-refining monopoly?', a: ny('knight'), w: [ny('champion'), ny('joneslaughlin'), ny('gibbons')], why: '<i>United States v. E. C. Knight Co.</i> (1895).' },
    { L: [1, 2], q: 'Which case struck down the federal ban on shipping goods made with child labor?', a: ny('hammer'), w: [ny('darby'), ny('champion'), ny('wickard')], why: '<i>Hammer v. Dagenhart</i> (1918), 5 to 4; overruled by Darby (1941).' },
    { L: [1, 2, 3], q: 'Which narrow-era case UPHELD a federal ban on carrying lottery tickets across state lines?', a: ny('champion'), w: [ny('knight'), ny('hammer'), ny('schechter')], why: '<i>Champion v. Ames</i> (1903) upheld the lottery act.' },
    { L: [2, 3], q: 'What test did the narrow-era Court use for local activity?', a: 'Whether its effect on interstate commerce was direct or indirect', w: ['Whether it was economic or noneconomic', 'Whether it fit the three Lopez categories', 'Whether Congress made findings'], why: 'The direct-indirect test, along with the line between production and commerce. Economic/noneconomic and the Lopez categories came in 1995.' },
    { L: [2, 3], q: 'Which case struck down the National Industrial Recovery Act\'s codes as applied to a Brooklyn poultry business?', a: ny('schechter'), w: [ny('carter'), ny('knight'), ny('joneslaughlin')], why: '<i>Schechter Poultry</i> (1935), unanimous, on commerce and nondelegation grounds.' },
    { L: [2, 3], q: 'Which justice dissented in <i>Hammer v. Dagenhart</i>, arguing the power to regulate commerce includes the power to prohibit it?', a: 'Oliver Wendell Holmes', w: ['William R. Day', 'John Marshall Harlan', 'Charles Evans Hughes'], why: 'Holmes dissented; Day wrote the majority. Darby (1941) adopted Holmes\'s view.' },
    { L: [2, 3], q: 'Why did <i>Hammer</i> treat the child-labor shipping ban differently from the lottery ban in <i>Champion</i>?', a: 'The goods were harmless and the law really aimed at manufacturing', w: ['Lottery tickets were made in factories', 'Congress made no findings in Champion', 'Child labor was already illegal everywhere'], why: 'The majority said lottery tickets were themselves harmful, while goods made by children were harmless; the real target was production.' },
    { L: [1, 2, 3], q: 'The Supreme Court struck down every federal economic law between 1887 and 1936.', tf: false, why: 'It upheld many, such as the lottery ban and railroad rate rules; it struck laws aimed at production or local business.' },
    { L: [3], gen: function () { return chrono([3], ['knight', 'champion', 'hammer', 'schechter', 'carter']); } },
    { L: [3], q: 'Which laws would the narrow-era Court likely have struck down?', all: [['Wage rules for workers in a local coal mine', true], ['Price codes for a local poultry seller', true], ['A ban on shipping lottery tickets between states', false], ['Rate rules for an interstate railroad', false]], why: 'Production and local business fell outside the narrow reading; the movement of goods and interstate carriers were within it.' }
  ]; }, 'Production or commerce? Direct or indirect?'));

  G('conlaw1.commerce-1937', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['joneslaughlin', 'schechter', 'darby', 'carter', 'wickard']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['joneslaughlin', 'schechter', 'darby', 'carter', 'wickard']); } },
    { L: [1, 2, 3], q: 'Which 1937 case upheld the Wagner Act\'s reach to labor relations at a steel company?', a: ny('joneslaughlin'), w: [ny('schechter'), ny('darby'), ny('carter')], why: '<i>NLRB v. Jones & Laughlin Steel Corp.</i> (1937), 5 to 4, by Chief Justice Hughes.' },
    { L: [1, 2], q: 'Which case overruled <i>Hammer v. Dagenhart</i>?', a: ny('darby'), w: [ny('joneslaughlin'), ny('wickard'), ny('lopez')], why: '<i>United States v. Darby</i> (1941), unanimous, upholding the Fair Labor Standards Act.' },
    { L: [2, 3], q: 'What did <i>Darby</i> say about the Tenth Amendment?', a: 'It "states but a truism that all is retained which has not been surrendered"', w: ['It lists powers that belong only to the states', 'It bars federal wage laws', 'It was repealed by the Fourteenth Amendment'], why: 'Justice Stone called it a truism: it adds no limit beyond the enumeration of powers.' },
    { L: [1, 2], q: 'On what date did President Roosevelt propose his plan to add justices to the Supreme Court?', a: 'February 5, 1937', w: ['March 4, 1933', 'December 7, 1941', 'November 3, 1936'], why: 'February 5, 1937. The plan died in the Senate that July.' },
    { L: [2, 3], q: 'Which fact cuts AGAINST the view that the court-packing plan alone caused the Court\'s change?', a: 'West Coast Hotel was argued in December 1936, before the plan was announced', w: ['Jones & Laughlin was decided in April 1937', 'The plan was announced in February 1937', 'Justice Roberts joined the new majorities'], why: 'Argument (and the justices\' conference) before the plan suggests other causes too; historians still debate how much the plan mattered.' },
    { L: [2, 3], q: 'After 1937, what replaced the production-commerce line?', a: 'Whether an activity has a close and substantial relation to interstate commerce', w: ['Whether the activity crosses a state line', 'Whether the activity is listed in Article I', 'Whether the states consent'], why: 'Jones & Laughlin asked about the effect on commerce, not whether the activity was "production."' },
    { L: [1, 2, 3], q: 'Historians agree that the court-packing plan was the only cause of the Court\'s 1937 change.', tf: false, why: 'They disagree. The plan, the 1936 election, earlier doctrinal shifts and new appointments all figure in the debate.' },
    { L: [3], q: 'Put in time order.', order: ['Schechter Poultry (1935)', 'Court-packing plan announced (February 1937)', 'West Coast Hotel (March 1937)', 'Jones & Laughlin (April 1937)', 'Darby overrules Hammer (1941)'], why: '1935; February, March and April 1937; 1941.' },
    { L: [3], q: 'Which are true of <i>United States v. Darby</i> (1941)?', all: [['It was unanimous', true], ['It upheld the Fair Labor Standards Act', true], ['It overruled Hammer v. Dagenhart', true], ['It struck down federal wage rules', false], ['It was decided before Jones & Laughlin', false]], why: 'Darby (1941) unanimously upheld the FLSA and overruled Hammer; Jones & Laughlin came in 1937.' }
  ]; }, 'From production versus commerce to substantial effects.'));

  G('conlaw1.wickard', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['wickard', 'darby', 'raich', 'lopez']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['wickard', 'darby', 'raich', 'lopez']); } },
    { L: [1, 2, 3], q: 'What did Roscoe Filburn do with the wheat he grew over his quota?', a: 'Used it on his farm: seed, animal feed and flour', w: ['Sold it in another state', 'Exported it to Canada', 'Sold it to the federal government'], why: 'He never sold it. The aggregation principle, not a sale, brought it within the commerce power.' },
    { L: [1, 2], q: 'What principle did <i>Wickard v. Filburn</i> (1942) rely on?', a: 'Aggregation: the total effect of many similar activities', w: ['Direct versus indirect effects', 'The market participant exception', 'Dual federalism'], why: 'Filburn\'s share was trivial alone, but "taken together with that of many others similarly situated" it was far from trivial.' },
    { L: [2, 3], q: 'How did home-grown wheat affect interstate commerce, in the Court\'s view?', a: 'It replaced wheat that would otherwise be bought, lowering demand and price', w: ['It was shipped across state lines', 'It was taxed by other states', 'It competed with foreign imports only'], why: 'Home use supplies a need otherwise met by the market, so it affects national demand.' },
    { L: [2, 3], q: 'Which justice wrote the opinion in <i>Wickard v. Filburn</i>?', a: 'Robert H. Jackson', w: ['Harlan Fiske Stone', 'Hugo Black', 'John Marshall'], why: 'Justice Jackson wrote for the Court.' },
    { L: [2, 3], q: 'Filburn was allotted 11.1 acres of wheat. How many acres did he plant?', num: 23, why: 'He planted 23 acres and harvested 239 bushels over his quota.' },
    { L: [3], q: 'Later cases limited aggregation. Which kind of activity may be aggregated?', a: 'Economic activity, such as producing a commodity', w: ['Any activity at all', 'Only activity that crosses state lines', 'Only activity by corporations'], why: 'Lopez and Morrison refused to aggregate noneconomic activity; Raich applied Wickard to producing a commodity.' },
    { L: [3], gen: function (R) { return { q: 'Under Wickard\'s reasoning, which activities could Congress reach by aggregation?', all: R.shuffle([['Growing corn for one\'s own livestock when corn prices are federally regulated', true], ['Raising chickens at home for one\'s own eggs within a federal egg-market program', true], ['Carrying a pocketknife near a library', false], ['A violent assault on a neighbor', false]]), why: 'Producing a commodity that would otherwise be bought is economic and can be aggregated; possession and violence are not economic (Lopez, Morrison).' }; } },
    { L: [1, 2, 3], q: 'In Wickard, the Court considered only the effect of Filburn\'s own small farm on the national market.', tf: false, why: 'It considered the aggregate effect of all farmers in his position.' },
    { L: [2, 3], q: 'In what year was <i>Wickard v. Filburn</i> decided?', num: 1942, why: '1942, under the Agricultural Adjustment Act of 1938.' }
  ]; }, 'Add up everyone doing the same thing.'));

  G('conlaw1.civil-rights-commerce', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['heartofatlanta', 'mcclung', 'civilrightscases']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['heartofatlanta', 'mcclung', 'civilrightscases']); } },
    { L: [1, 2, 3], q: 'Under which power did the Court uphold Title II of the Civil Rights Act of 1964 (public accommodations)?', a: 'The Commerce Clause', w: ['The Fourteenth Amendment\'s Section 5 alone', 'The Tenth Amendment', 'The Taxing power'], why: 'Heart of Atlanta and McClung rested on the commerce power.' },
    { L: [1, 2], q: 'Which case involved a 216-room motel serving mostly out-of-state guests?', a: ny('heartofatlanta'), w: [ny('mcclung'), ny('civilrightscases'), ny('wickard')], why: '<i>Heart of Atlanta Motel v. United States</i> (1964).' },
    { L: [1, 2], q: 'Which case involved Ollie\'s Barbecue, a restaurant in Birmingham?', a: ny('mcclung'), w: [ny('heartofatlanta'), ny('lopez'), ny('raich')], why: '<i>Katzenbach v. McClung</i> (1964).' },
    { L: [2, 3], q: 'What was the commerce link in <i>Katzenbach v. McClung</i>?', a: 'Food bought from out of state, with aggregate effects on commerce', w: ['Most customers were interstate travelers', 'The restaurant was owned by a federal agency', 'It sold food in other states'], why: 'The restaurant\'s customers were mostly local; the link was food shipped across state lines, aggregated over many restaurants.' },
    { L: [2, 3], q: 'Why did Congress rely mainly on the Commerce Clause rather than the Fourteenth Amendment?', a: 'The Civil Rights Cases (1883) held the Fourteenth Amendment power did not reach private businesses', w: ['The Fourteenth Amendment had been repealed', 'The Commerce Clause applies only to race', 'The President required it'], why: 'The Fourteenth Amendment limits states; the Civil Rights Cases struck down the 1875 Act\'s rules for private businesses.' },
    { L: [2, 3], q: 'What was the vote in <i>Heart of Atlanta Motel</i>?', a: 'Unanimous (9 to 0)', w: ['5 to 4', '6 to 3', '7 to 2'], why: 'Both 1964 cases were unanimous.' },
    { L: [1, 2, 3], q: 'The 1964 public accommodations rules were upheld because Congress may not consider moral wrongs when regulating commerce.', tf: false, why: 'Motive does not defeat a valid commerce regulation (Darby); Congress may regulate commerce while also addressing a moral wrong.' },
    { L: [3], gen: function () { return chrono([3], ['civilrightscases', 'wickard', 'heartofatlanta', 'lopez']); } },
    { L: [3], q: 'Which justices wrote concurrences in Heart of Atlanta saying the Fourteenth Amendment could also support the law?', a: 'Justices Douglas and Goldberg', w: ['Justices Scalia and Thomas', 'Chief Justice Marshall and Justice Story', 'Justices Holmes and Brandeis'], why: 'Douglas and Goldberg wrote separately; Clark wrote for the Court.' }
  ]; }, 'Which power reaches private businesses?'));

  var LOPEZ_CATS = ['the channels of interstate commerce', 'the instrumentalities of interstate commerce, or persons or things in it', 'activities that substantially affect interstate commerce'];
  var LOPEZ_EX = [
    ['A law barring the shipment of stolen goods across state lines', 0], ['A law keeping harmful products off interstate highways', 0], ['A ban on transporting kidnapped people across state lines', 0],
    ['Safety rules for airplanes', 1], ['Rules protecting interstate trucks from tampering', 1], ['Rules for railroad brakes', 1],
    ['Limits on wheat grown for home use', 2], ['Labor rules at a large steel mill', 2], ['A ban on discrimination by hotels serving travelers', 2]];
  G('conlaw1.lopez', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R) { var e = R.pick(LOPEZ_EX); return { q: 'Which Lopez category best supports this law? ' + e[0] + '.', a: LOPEZ_CATS[e[1]], w: LOPEZ_CATS.filter(function (c, i) { return i !== e[1]; }), why: 'It fits category ' + (e[1] + 1) + ': ' + LOPEZ_CATS[e[1]] + '. Channels are the routes; instrumentalities are what moves on them; the third category is activities with substantial effects.' }; } },
    { L: [1, 2], q: 'What law did <i>United States v. Lopez</i> (1995) strike down?', a: 'The Gun-Free School Zones Act of 1990', w: ['The Violence Against Women Act', 'The Controlled Substances Act', 'The Civil Rights Act of 1964'], why: 'The Act made it a crime to possess a gun in a school zone, with no link to interstate commerce.' },
    { L: [1, 2, 3], q: 'What was the vote in <i>Lopez</i>?', a: '5 to 4', w: ['9 to 0', '7 to 2', '6 to 3'], why: 'Chief Justice Rehnquist wrote for five; Justice Breyer dissented for four.' },
    { L: [2, 3], q: 'Which feature of the Gun-Free School Zones Act did the Court stress?', a: 'It regulated noneconomic activity and had no jurisdictional element', w: ['It applied only in one state', 'It was passed without a vote', 'It regulated a channel of commerce'], why: 'Possession is not economic activity, and the Act did not require any link to commerce in each case.' },
    { L: [2, 3], q: 'Before Lopez, when had the Court last struck down a federal law as beyond the commerce power?', a: 'In the 1930s, before the 1937 turn', w: ['In 1990', 'Never', 'In 1964'], why: 'Lopez was the first such holding in about 58 years.' },
    { L: [2, 3], q: 'Which justice concurred in Lopez urging a return to the clause\'s original meaning?', a: 'Justice Thomas', w: ['Justice Breyer', 'Justice Stevens', 'Justice Souter'], why: 'Thomas concurred; Breyer, Stevens, Souter and Ginsburg dissented.' },
    { L: [3], q: 'A new federal law bans possessing a laser pointer within 500 feet of a library, with no link to commerce in each case and no findings. Under Lopez, what is the strongest argument against it?', a: 'It regulates noneconomic activity with no jurisdictional element', w: ['Libraries are federal property', 'It regulates a channel of commerce', 'It was passed too quickly'], why: 'That is the Lopez pattern: noneconomic possession, no jurisdictional hook, an attenuated chain of effects.' },
    { L: [3], q: 'Congress amends a gun law to require that the gun "has moved in interstate commerce." What has Congress added?', a: 'A jurisdictional element tying each case to commerce', w: ['A spending condition', 'A tax', 'A preemption clause'], why: 'A jurisdictional element limits the law to cases with an explicit link to commerce, the feature Lopez found missing.' },
    { L: [1, 2, 3], q: 'Lopez overruled Wickard v. Filburn.', tf: false, why: 'Lopez kept Wickard and the civil rights cases, limiting aggregation to economic activity.' }
  ]; }, 'Channels are routes; instrumentalities are what moves; the third is substantial effects.'));

  G('conlaw1.morrison', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['morrison', 'lopez']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['morrison', 'lopez']); } },
    { L: [1, 2, 3], q: 'What did <i>United States v. Morrison</i> (2000) strike down?', a: 'The civil-remedy provision of the Violence Against Women Act', w: ['The entire Violence Against Women Act', 'The Gun-Free School Zones Act', 'The Civil Rights Act of 1964'], why: 'Only the civil remedy (a federal suit against attackers) was at issue and struck down.' },
    { L: [1, 2], q: 'What was the vote in <i>Morrison</i>?', a: '5 to 4', w: ['9 to 0', '6 to 3', '7 to 2'], why: 'Chief Justice Rehnquist wrote for five; Justice Souter dissented for four.' },
    { L: [2, 3], q: 'Under which two powers did the government defend the civil remedy?', a: 'The Commerce Clause and Section 5 of the Fourteenth Amendment', w: ['The Taxing and Spending Clauses', 'The Tenth and Eleventh Amendments', 'The Treaty power and the war power'], why: 'The Court rejected both.' },
    { L: [2, 3], q: 'Why did the Fourteenth Amendment\'s Section 5 not support the civil remedy?', a: 'The Amendment limits states, and the remedy targeted private individuals', w: ['Section 5 was repealed', 'The Amendment applies only to voting', 'Congress made no findings'], why: 'Following the Civil Rights Cases (1883), Section 5 laws must be aimed at state action.' },
    { L: [2, 3], q: 'Congress made extensive findings about the economic effects of gender-motivated violence. Why did they not save the law?', a: 'They relied on the same attenuated chain of effects rejected in Lopez', w: ['They were made after the law passed', 'Findings are forbidden', 'They concerned only one state'], why: 'The majority said findings do not by themselves decide whether an activity substantially affects commerce.' },
    { L: [1, 2, 3], q: 'Morrison held that gender-motivated violence is not economic activity and its effects cannot be aggregated.', tf: true, why: 'That was the commerce holding, following Lopez.' },
    { L: [3], gen: function () { return chrono([3], ['wickard', 'heartofatlanta', 'lopez', 'morrison', 'raich']); } },
    { L: [3], q: 'Which are true of <i>Morrison</i>?', all: [['It struck down only the civil remedy', true], ['It held Section 5 does not reach private conduct', true], ['It treated violent crime as noneconomic activity', true], ['It struck down all federal laws on violence', false], ['It overruled Heart of Atlanta', false]], why: 'The holding was narrow; Heart of Atlanta and the rest of VAWA stand.' }
  ]; }, 'Two powers: commerce and Section 5. Check each.'));

  G('conlaw1.raich', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['raich', 'wickard', 'lopez', 'morrison']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['raich', 'wickard', 'lopez', 'morrison']); } },
    { L: [1, 2, 3], q: 'What did <i>Gonzales v. Raich</i> (2005) hold?', a: 'Congress may apply federal drug law to marijuana grown at home for medical use under state law', w: ['California\'s medical marijuana law was unconstitutional', 'Congress may not regulate home-grown plants', 'States must enforce federal drug law'], why: 'Applying Wickard, the Court upheld the federal law as applied; it did not invalidate California\'s law.' },
    { L: [1, 2], q: 'What was the vote in <i>Raich</i>?', a: '6 to 3', w: ['5 to 4', '9 to 0', '7 to 2'], why: 'Justice Stevens wrote for the Court; Justice Scalia concurred in the judgment; O\'Connor, Rehnquist and Thomas dissented.' },
    { L: [1, 2, 3], q: 'Which earlier case did <i>Raich</i> rely on most?', a: ny('wickard'), w: [ny('lopez'), ny('morrison'), ny('gibbons')], why: 'Home-grown marijuana, like Filburn\'s wheat, affects a national market in the aggregate.' },
    { L: [2, 3], q: 'How did the Court distinguish <i>Lopez</i>?', a: 'Raich involved economic activity (producing a commodity) within a comprehensive regulatory scheme', w: ['Raich overruled Lopez', 'Lopez involved a state law', 'Raich involved a channel of commerce'], why: 'Economic activity plus a comprehensive scheme; Lopez was distinguished, not overruled.' },
    { L: [2, 3], q: 'Which justice concurred in the judgment, emphasizing the Necessary and Proper Clause?', a: 'Justice Scalia', w: ['Justice O\'Connor', 'Justice Thomas', 'Chief Justice Rehnquist'], why: 'Scalia stressed Congress\'s power to reach local activity as part of a comprehensive scheme; the others named dissented.' },
    { L: [2, 3], q: 'Which state law was involved in <i>Raich</i>?', a: 'California\'s Compassionate Use Act (1996)', w: ['The Gun-Free School Zones Act', 'Arizona\'s cantaloupe packing law', 'New York\'s steamboat monopoly'], why: 'California allowed medical use on a doctor\'s recommendation; federal law still banned it.' },
    { L: [1, 2, 3], q: 'Raich overruled United States v. Lopez.', tf: false, why: 'The Court distinguished Lopez.' },
    { L: [3], q: 'A federal law regulates the national market in a product comprehensively. A person makes the product at home for personal use, as state law allows. Under Raich, the strongest argument for federal power is…', a: 'Home production in the aggregate affects the regulated national market', w: ['The person crossed a state line', 'The state law is invalid', 'The Tenth Amendment requires it'], why: 'That is Raich\'s reasoning, following Wickard.' }
  ]; }, 'Economic activity within a comprehensive scheme.'));

  G('conlaw1.nfib-commerce', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['nfib', 'lopez', 'raich', 'wickard']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['nfib', 'lopez', 'raich', 'wickard']); } },
    { L: [1, 2, 3], q: 'In <i>NFIB v. Sebelius</i> (2012), what happened to the individual mandate?', a: 'Upheld as a tax, after five justices rejected the commerce argument', w: ['Struck down entirely', 'Upheld under the Commerce Clause', 'Upheld under the Spending Clause'], why: 'Five justices found the commerce power did not support it; five upheld it under the taxing power.' },
    { L: [1, 2], q: 'What distinction did five justices draw on the Commerce Clause?', a: 'Congress may regulate existing activity, not compel people to enter commerce', w: ['Direct versus indirect effects', 'Manufacturing versus commerce', 'Channels versus instrumentalities'], why: 'The activity-inactivity distinction: being uninsured is not activity.' },
    { L: [2, 3], q: 'Which justice was in both the commerce majority and the tax majority?', a: 'Chief Justice Roberts', w: ['Justice Ginsburg', 'Justice Scalia', 'Justice Kennedy'], why: 'Roberts joined the four joint dissenters on commerce and the four other justices on the tax.' },
    { L: [2, 3], q: 'What was the vote upholding the mandate as a tax?', a: '5 to 4', w: ['7 to 2', '9 to 0', '6 to 3'], why: 'Roberts with Ginsburg, Breyer, Sotomayor and Kagan.' },
    { L: [2, 3], q: 'What was Justice Ginsburg\'s main argument for the commerce power?', a: 'Nearly everyone enters the health care market, so Congress may regulate how care is paid for', w: ['Insurance is not commerce', 'States should decide all health questions', 'The mandate was a penalty'], why: 'She argued the uninsured already take part in the health care market.' },
    { L: [3], gen: function (R) { return { q: 'Under the NFIB commerce analysis, which federal laws compel entry into commerce rather than regulate existing activity?', all: R.shuffle([['Every adult must buy a gym membership', true], ['Every household must buy a new car each decade', true], ['Insurers selling policies must cover preexisting conditions', false], ['A farmer who grows wheat must follow a quota', false]]), why: 'Orders to buy a product compel entry; rules for sellers or growers regulate existing activity.' }; } },
    { L: [1, 2, 3], q: 'NFIB struck down the individual mandate.', tf: false, why: 'It upheld the mandate under the taxing power.' },
    { L: [3], gen: function () { return chrono([3], ['gibbons', 'wickard', 'lopez', 'raich', 'nfib']); } }
  ]; }, 'Activity or compelled entry? And which power saved it?'));

  /* ======================================================== Unit 5: Taxing and Spending */
  var TAXF = [
    ['It is small compared with the cost of complying', 'tax'], ['It applies only to people who act knowingly', 'penalty'], ['It is collected by the IRS through the normal tax process', 'tax'],
    ['It is enforced by criminal prosecution', 'penalty'], ['It is expected to raise substantial revenue', 'tax'], ['It is so heavy that no one could reasonably choose to pay it instead of complying', 'penalty']];
  G('conlaw1.taxing-power', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['bailey', 'nfib', 'hammer', 'darby']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['bailey', 'nfib', 'hammer', 'darby']); } },
    { L: [1, 2, 3], q: 'What decides whether an exaction is a "tax" for constitutional purposes?', a: 'How it functions, not what Congress calls it', w: ['The label Congress uses', 'Whether the President signs it', 'Whether it is popular'], why: 'Courts look at function: NFIB treated a "penalty" as a tax; Bailey treated a "tax" as a penalty.' },
    { L: [1, 2], q: 'Which case held that the Child Labor Tax Law was a penalty, not a valid tax?', a: ny('bailey'), w: [ny('nfib'), ny('hammer'), ny('darby')], why: '<i>Bailey v. Drexel Furniture Co.</i> (1922), by Chief Justice Taft.' },
    { L: [1, 2, 3], q: 'May a valid tax also discourage the activity it taxes?', a: 'Yes, every tax affects behavior; that alone does not make it invalid', w: ['No, a tax must not affect behavior', 'Only if the states agree', 'Only taxes on imports may do so'], why: 'A tax that raises revenue is valid even if it also discourages conduct.' },
    { L: [2, 3], gen: function (R) { var f = R.pick(TAXF); return { q: 'In deciding whether an exaction is a tax or a penalty, which way does this feature point? "' + f[0] + '."', a: f[1] === 'tax' ? 'Toward a tax' : 'Toward a penalty', w: [f[1] === 'tax' ? 'Toward a penalty' : 'Toward a tax', 'It makes no difference'], why: 'Size, scienter, who collects and revenue are the features courts weigh (Bailey; NFIB). This one points toward a ' + f[1] + '.' }; } },
    { L: [2, 3], q: 'Why did Chief Justice Roberts treat the ACA\'s "penalty" as a tax?', a: 'It was modest, had no scienter requirement, was collected by the IRS and raised revenue', w: ['Congress called it a tax in the statute', 'It was enforced by prison terms', 'It applied only to corporations'], why: 'Those functional features made it a tax for constitutional purposes.' },
    { L: [2, 3], q: 'What was the vote upholding the individual mandate under the taxing power?', a: '5 to 4', w: ['7 to 2', '9 to 0', '6 to 3'], why: 'Roberts, Ginsburg, Breyer, Sotomayor and Kagan.' },
    { L: [1, 2, 3], q: 'The label "penalty" in a statute means the exaction cannot be upheld as a tax.', tf: false, why: 'NFIB upheld a payment the statute called a "penalty" as a tax.' },
    { L: [3], q: 'Which features suggest an exaction is a penalty rather than a tax?', all: [['It applies only to knowing violations', true], ['It is enforced by a law enforcement agency rather than the IRS', true], ['It is so heavy that it leaves no real choice', true], ['It raises substantial revenue', false], ['It is calculated from taxable income', false]], why: 'Scienter, enforcement by police-type agencies and crushing size mark penalties; revenue and income-based calculation mark taxes.' },
    { L: [3], gen: function () { return chrono([3], ['hammer', 'bailey', 'darby', 'nfib']); } },
    { L: [2, 3], q: 'Which <i>Federalist</i> papers did Hamilton devote to the taxing power?', a: 'Nos. 30 to 36', w: ['Nos. 1 to 9', 'Nos. 47 to 51', 'Nos. 78 to 83'], why: 'Federalist Nos. 30–36 discuss taxation; 47–51 separation of powers; 78–83 the judiciary.' }
  ]; }, 'Size, scienter, who collects, and revenue.'));

  G('conlaw1.spending-power', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['helvering', 'butler', 'dole']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['helvering', 'butler', 'dole']); } },
    { L: [1, 2, 3], q: 'Whose view of the spending power did <i>United States v. Butler</i> (1936) adopt?', a: 'Hamilton\'s: spending is not limited to the other enumerated powers', w: ['Madison\'s: spending must carry out another enumerated power', 'Jefferson\'s: no spending without an amendment', 'Marshall\'s: only the states may spend'], why: 'Butler said the spending power "is not limited by the direct grants of legislative power found in the Constitution."' },
    { L: [1, 2, 3], q: 'Did <i>Butler</i> uphold the Agricultural Adjustment Act?', a: 'No; it struck the Act down on Tenth Amendment grounds', w: ['Yes, under the broad view of spending', 'Yes, under the Commerce Clause', 'It did not reach the question'], why: 'It accepted the broad spending view but held the program regulated agriculture, a reserved power.' },
    { L: [1, 2], q: 'Which case upheld Social Security\'s old-age benefits in 1937?', a: ny('helvering'), w: [ny('butler'), ny('bailey'), ny('dole')], why: '<i>Helvering v. Davis</i> (1937), by Justice Cardozo.' },
    { L: [2, 3], q: 'According to <i>Helvering v. Davis</i>, who decides what serves the general welfare?', a: 'Congress, unless its choice is clearly wrong', w: ['The courts, case by case', 'The states, by vote', 'The President alone'], why: 'Cardozo wrote that the discretion belongs to Congress, not the courts, unless clearly wrong.' },
    { L: [2, 3], q: 'What was the vote in <i>United States v. Butler</i>?', a: '6 to 3', w: ['9 to 0', '5 to 4', '7 to 2'], why: 'Justice Roberts wrote for six; Stone, Brandeis and Cardozo dissented.' },
    { L: [2, 3], q: 'Which document did Hamilton use to argue for a broad spending power?', a: 'The Report on Manufactures (1791)', w: ['The Federalist No. 10', 'The Virginia Resolutions', 'The Articles of Confederation'], why: 'His 1791 Report on Manufactures argued Congress may spend for the general welfare broadly.' },
    { L: [1, 2, 3], q: 'Under the Hamiltonian view, Congress may spend money on a purpose it could not regulate directly, if the spending serves the general welfare.', tf: true, why: 'That is the broad view Butler adopted.' },
    { L: [3], q: 'Which are true of <i>United States v. Butler</i>?', all: [['It adopted Hamilton\'s view of the spending power', true], ['It struck down the Agricultural Adjustment Act', true], ['Its Tenth Amendment reasoning was soon abandoned', true], ['It adopted Madison\'s view', false], ['It upheld the processing tax', false]], why: 'Broad spending view, but the Act fell; later cases kept the first holding and dropped the second.' },
    { L: [3], gen: function () { return chrono([3], ['butler', 'helvering', 'dole', 'nfib']); } }
  ]; }, 'What may Congress spend on? And may it use spending to regulate?'));

  var DOLE = ['the spending must serve the general welfare', 'the condition must be unambiguous', 'the condition must relate to the federal interest in the program', 'the condition may not require the state to act unconstitutionally', 'the pressure may not become coercion'];
  var DOLE_FACTS = [
    ['Congress attaches a condition to school-lunch grants requiring states to change their rules for taxing yachts.', 2],
    ['A statute gives states highway money, and years later an agency announces a condition never stated in the statute.', 1],
    ['Congress offers money on condition that a state ban a newspaper\'s criticism of the governor.', 3],
    ['Congress threatens to cut off all existing federal funds for a long-standing program unless a state joins a new program.', 4]];
  G('conlaw1.conditional-spending', fromBank(function () { return [
    { L: [1, 2, 3], q: 'What did <i>South Dakota v. Dole</i> (1987) uphold?', a: 'Withholding 5 percent of highway funds from states with a drinking age under 21', w: ['A federal law setting the drinking age at 21', 'Withholding all highway funds from South Dakota', 'A state tax on federal highways'], why: 'The condition met each of the limits on conditional spending.' },
    { L: [1, 2], q: 'What share of highway funds was at stake in <i>Dole</i>?', a: '5 percent', w: ['50 percent', '100 percent', '25 percent'], why: 'Five percent of certain highway funds: "relatively mild encouragement."' },
    { L: [2, 3], gen: function (R) { var f = R.pick(DOLE_FACTS); return { q: 'Which of Dole\'s limits is this condition most likely to violate? ' + f[0], a: DOLE[f[1]], w: DOLE.filter(function (d, i) { return i !== f[1]; }), why: 'The weak point is that ' + DOLE[f[1]] + '.' }; } },
    { L: [2, 3], q: 'Why did <i>NFIB</i> (2012) find the Medicaid expansion\'s condition coercive?', a: 'States could lose all existing Medicaid funds, over 10 percent of their budgets', w: ['The new money was too small', 'The condition was ambiguous', 'Medicaid is unrelated to health'], why: 'Roberts called the threat "a gun to the head"; seven justices found it coercive.' },
    { L: [2, 3], q: 'How many justices agreed the Medicaid expansion\'s threat was coercive?', a: 'Seven', w: ['Five', 'Nine', 'Four'], why: 'Roberts, Breyer and Kagan plus the four joint dissenters; Ginsburg and Sotomayor disagreed.' },
    { L: [2, 3], q: 'Which justice dissented in <i>Dole</i>, arguing the drinking-age condition was not related to highway spending?', a: 'Justice O\'Connor', w: ['Chief Justice Rehnquist', 'Justice Scalia', 'Justice Cardozo'], why: 'O\'Connor dissented on relatedness; Justice Brennan also dissented; Rehnquist wrote the majority.' },
    { L: [1, 2, 3], q: 'Congress may attach any condition it likes to federal money given to states.', tf: false, why: 'Dole\'s limits apply, and NFIB found coercion when the threatened loss was very large.' },
    { L: [3], q: 'Which are among Dole\'s limits on conditions attached to federal grants?', all: [['The condition must be unambiguous', true], ['The condition must relate to the federal interest in the program', true], ['The pressure may not turn into compulsion', true], ['The state legislature must vote unanimously', false], ['The amount must be under 1 million dollars', false]], why: 'General welfare, unambiguous, related, no independent bar, not coercive.' },
    { L: [3], q: 'What remedy did the Court choose for the coercive Medicaid condition in NFIB?', a: 'Congress could not withdraw existing Medicaid funds from states that declined the expansion', w: ['The whole Affordable Care Act was struck down', 'Medicaid was abolished', 'States were ordered to expand'], why: 'The expansion became, in effect, optional; existing funds were protected.' }
  ]; }, 'General welfare, clear, related, not unconstitutional, not coercive.'));

  var CMD = [
    ['A federal law orders state legislatures to pass a statute regulating landfills.', 'commandeering (invalid)'],
    ['A federal law orders county sheriffs to run federal background checks.', 'commandeering (invalid)'],
    ['A federal law forbids states to repeal their own bans on an activity.', 'commandeering (invalid)'],
    ['A federal law sets emission limits for factories and displaces state limits.', 'preemption (valid if within a federal power)'],
    ['Congress offers states grant money if they adopt a federal model code.', 'conditional spending (valid if it meets Dole)'],
    ['A federal law bans an activity nationwide, overriding state laws that allow it.', 'preemption (valid if within a federal power)']];
  var CMDK = ['commandeering (invalid)', 'preemption (valid if within a federal power)', 'conditional spending (valid if it meets Dole)'];
  G('conlaw1.anti-commandeering', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['newyorkus', 'printz', 'murphy']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['newyorkus', 'printz', 'murphy']); } },
    { L: [1, 2, 3], gen: function (R) { var c = R.pick(CMD); return { q: 'Classify this federal action. ' + c[0], a: c[1], w: CMDK.filter(function (k) { return k !== c[1]; }), why: 'Orders to state governments are commandeering; rules for private parties preempt; money with strings is conditional spending. This one is ' + c[1] + '.' }; } },
    { L: [1, 2], q: 'Which case struck down the "take title" provision for radioactive waste?', a: ny('newyorkus'), w: [ny('printz'), ny('murphy'), ny('garcia')], why: '<i>New York v. United States</i> (1992), by Justice O\'Connor.' },
    { L: [1, 2], q: 'Which case held Congress may not order local sheriffs to run background checks?', a: ny('printz'), w: [ny('newyorkus'), ny('murphy'), ny('lopez')], why: '<i>Printz v. United States</i> (1997), 5 to 4, by Justice Scalia.' },
    { L: [2, 3], q: 'Which case held that forbidding states to authorize sports gambling commandeered state legislatures?', a: ny('murphy'), w: [ny('printz'), ny('newyorkus'), ny('nfib')], why: '<i>Murphy v. NCAA</i> (2018): a command not to repeal a law is still a command.' },
    { L: [2, 3], q: 'Which reason for the anti-commandeering rule concerns voters?', a: 'Accountability: voters may blame state officials for Congress\'s choices', w: ['Uniformity of federal law', 'The cost of federal courts', 'The Electoral College'], why: 'Commandeering blurs who is responsible for a policy.' },
    { L: [2, 3], q: 'In <i>New York v. United States</i>, which parts of the federal waste law survived?', a: 'The money and access incentives', w: ['The take-title provision', 'Nothing; the whole law fell', 'Only the criminal penalties'], why: 'O\'Connor upheld the incentives as valid spending and commerce measures and struck only take-title.' },
    { L: [1, 2, 3], q: 'The anti-commandeering rule stops Congress from preempting state law.', tf: false, why: 'Preemption regulates private parties and displaces state law; it is not commandeering.' },
    { L: [3], gen: function () { return chrono([3], ['nationalleague', 'newyorkus', 'printz', 'murphy']); } },
    { L: [3], q: 'Which are valid ways for Congress to shape state policy, within its powers?', all: [['Regulate private conduct directly, preempting state law', true], ['Offer money with clear, related, noncoercive conditions', true], ['Order a state legislature to enact a federal program', false], ['Order state officers to enforce a federal program', false]], why: 'Preemption and conditional spending are allowed; commands to state legislatures or officers are not.' }
  ]; }, 'Is the federal law addressed to private people or to the state as a government?'));

  /* ======================================================== Unit 6: Federalism and State Sovereignty */
  G('conlaw1.tenth-amendment-limits', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['garcia', 'nationalleague', 'printz', 'darby']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['garcia', 'nationalleague', 'printz', 'darby']); } },
    { L: [1, 2, 3], q: 'Which case overruled <i>National League of Cities v. Usery</i>?', a: ny('garcia'), w: [ny('printz'), ny('lopez'), ny('darby')], why: '<i>Garcia v. San Antonio Metropolitan Transit Authority</i> (1985), 5 to 4.' },
    { L: [1, 2], q: 'What test did <i>National League of Cities</i> (1976) use?', a: 'Whether federal law displaced states\' "traditional governmental functions"', w: ['Whether an activity is economic', 'Congruence and proportionality', 'Whether a condition is coercive'], why: 'It barred federal wage rules for state employees in areas of traditional governmental functions.' },
    { L: [1, 2, 3], q: 'Where did <i>Garcia</i> say states\' protection mainly lies?', a: 'In the political process and the structure of the federal government', w: ['In judicial review of "traditional" functions', 'In the Eleventh Amendment', 'In the President\'s veto'], why: 'States are represented in Congress; that structure, not a judicial test, is the main safeguard.' },
    { L: [2, 3], q: 'Why did <i>Garcia</i> abandon the "traditional governmental functions" test?', a: 'It proved unworkable: courts could draw no principled line', w: ['Congress repealed it', 'The states asked the Court to', 'It conflicted with Marbury'], why: 'Justice Blackmun found the test produced inconsistent results.' },
    { L: [2, 3], q: 'Which justice wrote <i>Garcia</i>, after joining the majority in <i>National League of Cities</i>?', a: 'Justice Blackmun', w: ['Justice Rehnquist', 'Justice O\'Connor', 'Justice Powell'], why: 'Blackmun changed his view; Rehnquist wrote National League and dissented in Garcia.' },
    { L: [2, 3], q: 'A federal law requires all employers, public and private, to keep overtime records. Under current doctrine it is…', a: 'valid as a generally applicable law within the commerce power', w: ['invalid commandeering of state officers', 'invalid under National League of Cities', 'valid only if the state consents'], why: 'Garcia allows generally applicable laws that include states; Printz concerns orders to administer federal programs.' },
    { L: [1, 2, 3], q: 'The Tenth Amendment contains a list of powers that belong to the states.', tf: false, why: 'It reserves whatever was not delegated; it lists nothing.' },
    { L: [3], gen: function () { return chrono([3], ['darby', 'nationalleague', 'garcia', 'newyorkus', 'printz']); } },
    { L: [3], q: 'After Garcia, which doctrines have courts used to protect states?', all: [['Anti-commandeering', true], ['State sovereign immunity', true], ['Clear-statement rules', true], ['The "traditional governmental functions" test', false]], why: 'Later cases protected states through other doctrines rather than reviving National League of Cities.' }
  ]; }, 'Generally applicable law, or an order to govern?'));

  var SI = [
    ['A citizen sues her own state in federal court for money damages under a federal wage law passed under the commerce power.', 'Barred: sovereign immunity (Hans; Seminole Tribe)'],
    ['A company sues a state officer in federal court to stop enforcement of a state law that violates the Constitution.', 'Allowed: Ex parte Young'],
    ['A person sues a state for money under a valid Section 5 law in which Congress clearly abrogated immunity.', 'Allowed: Fitzpatrick v. Bitzer'],
    ['The United States sues a state in federal court.', 'Allowed: immunity protects states from private suits, not from the United States'],
    ['A citizen sues a state in the state\'s own courts for damages under a federal commerce-power law, without the state\'s consent.', 'Barred: sovereign immunity (Alden v. Maine)']];
  var SIA = ['Barred: sovereign immunity (Hans; Seminole Tribe)', 'Allowed: Ex parte Young', 'Allowed: Fitzpatrick v. Bitzer', 'Allowed: immunity protects states from private suits, not from the United States', 'Barred: sovereign immunity (Alden v. Maine)'];
  G('conlaw1.sovereign-immunity', fromBank(function () { return [
    { L: [2, 3], gen: function (R) { var x = R.pick(SI); return { q: 'Can this suit go forward? ' + x[0], a: x[1], w: SIA.filter(function (a) { return a !== x[1]; }), why: 'Ask who sues, whom (state or officer), for what, and under which power. ' + x[1] + '.' }; } },
    { L: [1, 2, 3], q: 'Which constitutional amendment reversed <i>Chisholm v. Georgia</i>?', a: 'The Eleventh Amendment (1795)', w: ['The Tenth Amendment (1791)', 'The Fourteenth Amendment (1868)', 'The Thirteenth Amendment (1865)'], why: 'The Eleventh Amendment, ratified in 1795, reversed Chisholm (1793).' },
    { L: [1, 2], q: 'Which case held that a state\'s own citizen may not sue it in federal court without consent?', a: ny('hans'), w: [ny('chisholm'), ny('young'), ny('seminole')], why: '<i>Hans v. Louisiana</i> (1890).' },
    { L: [1, 2, 3], q: 'Which case allows suits against state officers for injunctions to stop unconstitutional laws?', a: ny('young'), w: [ny('hans'), ny('seminole'), ny('chisholm')], why: '<i>Ex parte Young</i> (1908).' },
    { L: [2, 3], q: 'What did <i>Seminole Tribe of Florida v. Florida</i> (1996) hold?', a: 'Congress cannot abrogate state immunity using its Article I powers', w: ['Congress may abrogate immunity under any power', 'Tribes may always sue states', 'The Eleventh Amendment was repealed'], why: 'Only Section 5 of the Fourteenth Amendment (Fitzpatrick) allows abrogation; Seminole overruled Union Gas (1989).' },
    { L: [2, 3], q: 'Who wrote, in <i>Federalist</i> No. 81, "It is inherent in the nature of sovereignty not to be amenable to the suit of an individual without its consent"?', a: 'Alexander Hamilton', w: ['James Madison', 'John Jay', 'Brutus'], why: 'Hamilton, Federalist No. 81. Brutus (essay XIII) had warned the opposite reading.' },
    { L: [2, 3], q: 'Read literally, whose suits does the Eleventh Amendment\'s text name?', a: 'Citizens of another state and citizens or subjects of a foreign state', w: ['A state\'s own citizens', 'The United States', 'Indian tribes only'], why: 'The text names only out-of-state and foreign plaintiffs; Hans extended immunity further.' },
    { L: [2, 3], q: 'What was the vote in <i>Chisholm v. Georgia</i>?', a: '4 to 1', w: ['9 to 0', '5 to 4', '3 to 2'], why: 'Justice Iredell dissented.' },
    { L: [1, 2, 3], q: 'State sovereign immunity bars a federal court from ordering a state officer to stop enforcing an unconstitutional state law.', tf: false, why: 'Ex parte Young allows such suits for prospective relief.' },
    { L: [3], gen: function () { return chrono([3], ['chisholm', 'hans', 'young', 'fitzpatrick', 'seminole', 'alden']); } }
  ]; }, 'Who sues whom, for what, under which power?'));

  G('conlaw1.section-5-power', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['boerne', 'shelby', 'smith']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['boerne', 'shelby', 'smith']); } },
    { L: [1, 2, 3], q: 'What test did <i>City of Boerne v. Flores</i> (1997) set for laws under Section 5 of the Fourteenth Amendment?', a: 'Congruence and proportionality between the injury and the remedy', w: ['Rational basis', 'Strict scrutiny', 'Direct and indirect effects'], why: 'Section 5 laws must be remedial, with congruence and proportionality.' },
    { L: [1, 2], q: 'Which law did <i>Boerne</i> hold beyond Congress\'s Section 5 power as applied to the states?', a: 'The Religious Freedom Restoration Act', w: ['The Voting Rights Act', 'The Civil Rights Act of 1964', 'The Violence Against Women Act'], why: 'RFRA (1993) could not be applied to states; it still applies to the federal government.' },
    { L: [1, 2, 3], q: 'What did <i>Shelby County v. Holder</i> (2013) strike down?', a: 'The Voting Rights Act\'s coverage formula, Section 4(b)', w: ['The entire Voting Rights Act', 'Section 2 of the Voting Rights Act', 'The Fifteenth Amendment'], why: 'Only Section 4(b); Section 2 remains, and preclearance lies dormant without a formula.' },
    { L: [2, 3], q: 'Why did Shelby County hold the coverage formula invalid?', a: 'It rested on decades-old data that no longer reflected current conditions', w: ['Congress lacks any power over voting', 'Preclearance was always unconstitutional', 'The formula covered too few states'], why: 'Chief Justice Roberts said Congress could not keep using old data to decide which states were covered.' },
    { L: [2, 3], q: 'What was the vote in <i>Shelby County</i>?', a: '5 to 4', w: ['9 to 0', '6 to 3', '7 to 2'], why: 'Roberts for five; Justice Ginsburg dissented for four.' },
    { L: [2, 3], q: 'Why does Section 5 of the Fourteenth Amendment not reach purely private conduct?', a: 'The Amendment limits states ("No State shall…")', w: ['Congress repealed Section 5', 'Private conduct is covered by the Tenth Amendment', 'Only courts may enforce it'], why: 'Civil Rights Cases (1883) and Morrison (2000).' },
    { L: [2, 3], q: 'Under <i>City of Boerne v. Flores</i> (1997), what must a law passed under Section 5 of the Fourteenth Amendment show?', a: 'Congruence and proportionality between the injury to be prevented and the means adopted', w: ['Only a rational basis', 'Approval by three-fourths of the states', 'A unanimous vote of Congress'], why: 'Section 5 power is remedial; it may not redefine the right.' },
    { L: [1, 2, 3], q: 'After Shelby County, Section 2 of the Voting Rights Act still applies nationwide.', tf: true, why: 'Shelby struck only the coverage formula; Section 2 remains.' },
    { L: [3], q: 'Which are among the Civil War amendments with enforcement clauses?', all: [['The Thirteenth', true], ['The Fourteenth', true], ['The Fifteenth', true], ['The Tenth', false], ['The Eleventh', false]], why: 'The Thirteenth (1865), Fourteenth (1868) and Fifteenth (1870).' },
    { L: [3], gen: function () { return chrono([3], ['civilrightscases', 'morgan', 'boerne', 'morrison', 'shelby']); } }
  ]; }, 'Remedial, congruent and proportional, and aimed at the states.'));

  var PRE = [
    ['A federal statute says no state may set labeling rules different from the federal ones.', 'express preemption'],
    ['Federal law requires a warning on a label, and a state law forbids that same warning.', 'conflict preemption (impossibility)'],
    ['Congress built a complete, detailed system for registering noncitizens, leaving no room for state rules.', 'field preemption'],
    ['A state penalizes workers in a way that upsets the balance Congress struck by penalizing only employers.', 'conflict preemption (obstacle)'],
    ['A federal law sets minimum safety standards, says nothing about state law, and a state adds stricter rules that makers can meet.', 'no preemption']];
  var PREK = ['express preemption', 'field preemption', 'conflict preemption (impossibility)', 'conflict preemption (obstacle)', 'no preemption'];
  G('conlaw1.preemption', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(PRE); return { q: 'What kind of preemption, if any? ' + x[0], a: x[1], w: PREK.filter(function (k) { return k !== x[1]; }), why: 'Check express words, a field, impossibility, obstacle, in that order. This is ' + x[1] + '.' }; } },
    { L: [1, 2], q: 'Which clause of the Constitution is the source of preemption?', a: 'The Supremacy Clause (Article VI)', w: ['The Commerce Clause', 'The Tenth Amendment', 'The Full Faith and Credit Clause'], why: 'Valid federal law is "the supreme Law of the Land."' },
    { L: [2, 3], q: 'In fields traditionally regulated by the states, courts apply…', a: 'a presumption against preemption', w: ['a presumption in favor of preemption', 'strict scrutiny', 'the market participant exception'], why: 'Rice v. Santa Fe Elevator (1947): courts look for a clear and manifest congressional purpose.' },
    { L: [2, 3], q: 'In <i>Arizona v. United States</i> (2012), how many of the four challenged provisions of S.B. 1070 were held preempted?', a: 'Three', w: ['None', 'All four', 'One'], why: 'Sections 3, 5(C) and 6 were preempted; Section 2(B) was not, on its face.' },
    { L: [2, 3], q: 'Which provision of Arizona\'s law survived (on its face) in <i>Arizona v. United States</i>?', a: 'Officers checking immigration status during lawful stops (Section 2(B))', w: ['A state crime for failing to carry registration papers', 'A state crime for unauthorized workers seeking jobs', 'Warrantless arrests for removability'], why: 'The Court left Section 2(B) for state courts to apply first.' },
    { L: [1, 2, 3], q: 'Any overlap between a federal law and a state law on the same subject means the state law is preempted.', tf: false, why: 'Preemption needs express words, an occupied field, or a real conflict.' },
    { L: [2, 3], q: 'A federal law beyond Congress\'s enumerated powers conflicts with a state law. What happens?', a: 'Nothing is preempted, because only valid federal law is supreme', w: ['The state law is preempted anyway', 'Both laws are void', 'The state must ask Congress'], why: 'The Supremacy Clause covers laws "made in Pursuance" of the Constitution.' },
    { L: [3], q: 'Which are recognized kinds of preemption?', all: [['Express', true], ['Field', true], ['Conflict: impossibility', true], ['Conflict: obstacle', true], ['Commandeering', false]], why: 'Commandeering is a forbidden federal action, not a kind of preemption.' }
  ]; }, 'Express words, an occupied field, or a real conflict?'));

  /* ======================================================== Unit 7: The Dormant Commerce Clause and State Power */
  var DCC = [
    ['A state bans garbage from other states from its landfills but accepts its own.', 'discriminatory: virtually per se invalid'],
    ['A state taxes milk produced outside the state but not milk produced inside it.', 'discriminatory: virtually per se invalid'],
    ['A state requires all trucks on its roads, wherever based, to meet a length limit.', 'even-handed: Pike balancing'],
    ['A state requires all milk sold in the state to come in recyclable containers, wherever it was bottled.', 'even-handed: Pike balancing'],
    ['A state-owned cement plant sells first to in-state buyers during a shortage.', 'market participant: allowed'],
    ['A state buys office paper only from in-state suppliers for its own agencies.', 'market participant: allowed']];
  var DCCK = ['discriminatory: virtually per se invalid', 'even-handed: Pike balancing', 'market participant: allowed'];
  G('conlaw1.dormant-discrimination', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['philadelphianj', 'pike', 'maine', 'unitedhaulers']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['philadelphianj', 'pike', 'maine', 'unitedhaulers']); } },
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(DCC); return { q: 'How does the dormant Commerce Clause treat this state action? ' + x[0], a: x[1], w: DCCK.filter(function (k) { return k !== x[1]; }), why: 'First ask: is the state regulating or participating, and does it treat out-of-state interests differently? This one is ' + x[1] + '.' }; } },
    { L: [1, 2], q: 'Which case struck down New Jersey\'s ban on garbage from other states?', a: ny('philadelphianj'), w: [ny('pike'), ny('reeves'), ny('maine')], why: '<i>City of Philadelphia v. New Jersey</i> (1978), 7 to 2.' },
    { L: [1, 2, 3], q: 'What standard applies to a state law that discriminates against interstate commerce?', a: 'Virtually per se invalid unless no nondiscriminatory means can serve a legitimate local purpose', w: ['Rational basis review', 'Pike balancing', 'No review, because Congress is silent'], why: 'Discrimination gets a near-fatal test; Pike is for even-handed laws.' },
    { L: [2, 3], q: 'Which case upheld a discriminatory state law, Maine\'s ban on importing live baitfish?', a: ny('maine'), w: [ny('philadelphianj'), ny('pike'), ny('unitedhaulers')], why: '<i>Maine v. Taylor</i> (1986): parasites and nonnative species, with no adequate nondiscriminatory alternative.' },
    { L: [2, 3], q: 'A law is neutral on its face but in practice excludes every out-of-state competitor. How do courts treat it?', a: 'As potentially discriminatory in effect', w: ['As automatically valid', 'As preempted', 'As market participation'], why: 'Discrimination can be in purpose or effect, not only in words.' },
    { L: [2, 3], q: 'Which justices argued the dormant Commerce Clause has no basis in the Constitution\'s text?', a: 'Justices Scalia and Thomas', w: ['Chief Justice Marshall and Justice Story', 'Justices Holmes and Brandeis', 'Justices Brennan and Marshall'], why: 'They argued Congress, not courts, should police state trade barriers.' },
    { L: [1, 2, 3], q: 'Congress may authorize states to do what the dormant Commerce Clause would otherwise forbid.', tf: true, why: 'The Commerce Clause is a grant of power to Congress; Congress can consent to state regulation.' },
    { L: [3], q: 'Which are reasons given for the dormant Commerce Clause?', all: [['The framers meant to end state trade wars under the Articles of Confederation', true], ['Out-of-state businesses have no vote in the discriminating state', true], ['The Constitution aims at a national common market', true], ['The clause\'s text expressly limits the states', false]], why: 'History, political process and the common market; the text grants power to Congress and says nothing expressly about states.' }
  ]; }, 'Does the law treat in-state and out-of-state interests differently?'));

  G('conlaw1.pike-balancing', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['pike', 'kassel', 'philadelphianj']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['pike', 'kassel', 'philadelphianj']); } },
    { L: [1, 2, 3], q: 'Under <i>Pike v. Bruce Church</i> (1970), when is an even-handed state law struck down?', a: 'When the burden on interstate commerce is clearly excessive in relation to the putative local benefits', w: ['Whenever it burdens interstate commerce at all', 'Only if it discriminates on its face', 'Never; even-handed laws are always valid'], why: 'That is the Pike balancing test.' },
    { L: [1, 2], q: 'What product was involved in <i>Pike v. Bruce Church</i>?', a: 'Cantaloupes', w: ['Garbage', 'Baitfish', 'Cement'], why: 'Arizona required Arizona cantaloupes to be packed in Arizona.' },
    { L: [2, 3], q: 'Which case struck down Iowa\'s ban on 65-foot double-trailer trucks under Pike balancing?', a: ny('kassel'), w: [ny('pike'), ny('philadelphianj'), ny('reeves')], why: '<i>Kassel v. Consolidated Freightways</i> (1981): the safety gain was slight and the burden on interstate trucking heavy.' },
    { L: [2, 3], q: 'Which test applies to a state law that discriminates against out-of-state goods?', a: 'The near-per-se rule, not Pike balancing', w: ['Pike balancing', 'Rational basis', 'The market participant test'], why: 'Pike is only for even-handed laws.' },
    { L: [2, 3], q: 'Why do courts defer more to even-handed laws than to discriminatory ones?', a: 'In-state businesses bear the same burden, so they can fight bad laws in the legislature', w: ['Even-handed laws are always wise', 'Congress has approved all even-handed laws', 'The Tenth Amendment requires it'], why: 'The political process gives some protection when everyone bears the burden.' },
    { L: [3], q: 'A state requires a special truck part that no other state requires; interstate trucks must stop and re-equip at the border, and the state admits the safety gain is small. Under Pike, the law is likely…', a: 'invalid, because the burden is clearly excessive relative to the benefit', w: ['valid, because it is even-handed', 'invalid as discrimination', 'valid as market participation'], why: 'Even-handed, but a heavy burden for a small benefit.' },
    { L: [1, 2, 3], q: 'In Kassel v. Consolidated Freightways (1981), the Court upheld Iowa\'s truck-length law because it was even-handed.', tf: false, why: 'Even-handed laws still face Pike balancing; Iowa\'s slight safety gain did not justify the heavy burden, so the law fell.' },
    { L: [3], gen: function () { return chrono([3], ['pike', 'philadelphianj', 'kassel', 'maine', 'unitedhaulers']); } }
  ]; }, 'Even-handed? Then weigh burden against benefit.'));

  G('conlaw1.market-participant', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['reeves', 'southcentral', 'philadelphianj']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['reeves', 'southcentral', 'philadelphianj']); } },
    { L: [1, 2, 3], q: 'Which case let South Dakota prefer in-state buyers for cement from its own plant?', a: ny('reeves'), w: [ny('southcentral'), ny('pike'), ny('philadelphianj')], why: '<i>Reeves, Inc. v. Stake</i> (1980), 5 to 4.' },
    { L: [1, 2], q: 'When does the market participant exception apply?', a: 'When a state acts as a buyer or seller rather than a regulator', w: ['When a state regulates any market', 'When Congress has passed a law', 'When a corporation sues'], why: 'A state in the market may choose its trading partners like a private business.' },
    { L: [2, 3], q: 'Why did Alaska\'s in-state processing requirement for timber fail in <i>South-Central Timber</i> (1984)?', a: 'It reached a downstream market in which Alaska was not a participant', w: ['Alaska could not sell timber at all', 'It was preempted by federal law', 'It discriminated against Alaska residents'], why: 'The exception covers the state\'s own dealings, not conditions on later private transactions.' },
    { L: [2, 3], q: 'What did <i>United Haulers</i> (2007) uphold?', a: 'Laws requiring local trash to go to a publicly owned facility', w: ['A ban on out-of-state garbage', 'A state cement monopoly', 'A tax on interstate trucks'], why: 'Favoring a public entity doing a traditional government job is not the forbidden discrimination.' },
    { L: [2, 3], q: 'Does the market participant exception apply to the Article IV Privileges and Immunities Clause?', a: 'No; it applies only to the dormant Commerce Clause', w: ['Yes, always', 'Only for cement', 'Only if Congress agrees'], why: 'Discrimination against out-of-state citizens can still be challenged under Article IV.' },
    { L: [1, 2, 3], q: 'A state that sells timber from its own lands may require buyers to process the timber in the state before export.', tf: false, why: 'South-Central Timber struck down that downstream condition.' },
    { L: [3], q: 'Which state actions fall within the market participant exception?', all: [['A state university buying supplies only from in-state vendors', true], ['A state-owned plant selling first to residents', true], ['A state requiring private buyers of its products to use in-state processors', false], ['A state taxing out-of-state trucks more heavily', false]], why: 'The state\'s own purchases and sales are covered; downstream conditions and regulation are not.' }
  ]; }, 'Is the state acting in its own market, or controlling a different one?'));

  G('conlaw1.privileges-immunities-iv', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['toomer', 'baldwin', 'piper']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['toomer', 'baldwin', 'piper']); } },
    { L: [1, 2, 3], q: 'Whom does Article IV\'s Privileges and Immunities Clause protect?', a: 'Citizens of other states (individuals)', w: ['Corporations of other states', 'Foreign governments', 'Only residents of the state'], why: 'It protects citizens; corporations are not citizens for this purpose (Paul v. Virginia, 1869).' },
    { L: [1, 2], q: 'Which case struck down South Carolina\'s much higher shrimp-boat license fee for nonresidents?', a: ny('toomer'), w: [ny('baldwin'), ny('piper'), ny('reeves')], why: '<i>Toomer v. Witsell</i> (1948): 25 dollars for residents, 2,500 for nonresidents.' },
    { L: [2, 3], q: 'Which case UPHELD higher elk-hunting license fees for nonresidents?', a: ny('baldwin'), w: [ny('toomer'), ny('piper'), ny('philadelphianj')], why: '<i>Baldwin</i> (1978): recreational hunting is not a fundamental privilege.' },
    { L: [2, 3], q: 'Which case held New Hampshire could not limit admission to its bar to residents?', a: ny('piper'), w: [ny('baldwin'), ny('toomer'), ny('reeves')], why: '<i>Supreme Court of New Hampshire v. Piper</i> (1985): practicing law is a protected common calling.' },
    { L: [2, 3], q: 'What must a state show to justify discriminating against nonresidents in a protected privilege?', a: 'A substantial reason, with the discrimination substantially related to it', w: ['Any conceivable rational basis', 'Nothing; states may always prefer residents', 'Congressional approval'], why: 'The Toomer test: a substantial reason and a close relation.' },
    { L: [2, 3], q: 'An out-of-state corporation challenges a state tax that falls more heavily on it. Which doctrine fits better?', a: 'The dormant Commerce Clause', w: ['Article IV\'s Privileges and Immunities Clause', 'The Eleventh Amendment', 'The Tenth Amendment'], why: 'Corporations are not citizens under Article IV.' },
    { L: [1, 2, 3], q: 'The Privileges and Immunities Clause has a market participant exception.', tf: false, why: 'It does not; that exception belongs to the dormant Commerce Clause.' },
    { L: [3], q: 'Which are privileges protected by Article IV, Section 2?', all: [['Pursuing a common calling, such as commercial fishing', true], ['Practicing a profession, such as law', true], ['Recreational big-game hunting', false], ['A corporation\'s right to equal taxes', false]], why: 'Earning a living is protected; recreation (Baldwin) and corporations (Paul) are not.' },
    { L: [2, 3], q: 'In which <i>Federalist</i> paper did Hamilton call the privileges and immunities guarantee "the basis of the Union"?', a: 'No. 80', w: ['No. 10', 'No. 51', 'No. 78'], why: 'Federalist No. 80.' }
  ]; }, 'An individual citizen? A fundamental privilege? A substantial reason?'));

  /* ======================================================== Unit 8: Separation of Powers */
  var ZONES = ['Zone 1: power at its maximum', 'Zone 2: the zone of twilight', 'Zone 3: power at its lowest ebb'];
  var ZFACTS = [
    ['A statute expressly authorizes the President to freeze a foreign government\'s assets in an emergency, and he does so.', 0],
    ['Congress has passed a law directing the President to impose specific sanctions, and the President imposes them.', 0],
    ['The President acts on a matter Congress has never addressed, neither authorizing nor forbidding it.', 1],
    ['Congress has been silent on a new kind of emergency, and the President responds on his own authority.', 1],
    ['Congress considered and rejected giving the President a power, and the President exercises it anyway.', 2],
    ['A statute forbids a certain action, and the President orders it.', 2]];
  G('conlaw1.youngstown', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['youngstown', 'curtisswright', 'dames']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['youngstown', 'curtisswright', 'dames']); } },
    { L: [1, 2, 3], gen: function (R) { var z = R.pick(ZFACTS); return { q: 'In which of Justice Jackson\'s Youngstown zones does this action fall? ' + z[0], a: ZONES[z[1]], w: ZONES.filter(function (x, i) { return i !== z[1]; }), why: 'Ask what Congress has said: authorized (zone 1), silent (zone 2) or opposed (zone 3). This is ' + ZONES[z[1]] + '.' }; } },
    { L: [1, 2], q: 'Who wrote the opinion of the Court in <i>Youngstown Sheet & Tube Co. v. Sawyer</i>?', a: 'Justice Black', w: ['Justice Jackson', 'Chief Justice Vinson', 'Justice Frankfurter'], why: 'Black wrote for the Court; Jackson\'s three-zone framework was a concurrence; Vinson dissented.' },
    { L: [1, 2, 3], q: 'What did President Truman seize in 1952?', a: 'Most of the nation\'s steel mills', w: ['The railroads', 'The coal mines', 'The banks'], why: 'Executive Order 10340 directed the Secretary of Commerce to take possession of the steel mills during the Korean War.' },
    { L: [2, 3], q: 'Why did Justice Jackson place the steel seizure in zone 3?', a: 'Congress had declined to give the President seizure power in the Taft-Hartley Act', w: ['Congress had expressly authorized it', 'Congress had never addressed labor disputes', 'The Constitution expressly forbids seizures'], why: 'Acting against Congress\'s implied will puts presidential power "at its lowest ebb."' },
    { L: [2, 3], q: 'What was the vote in <i>Youngstown</i>?', a: '6 to 3', w: ['9 to 0', '5 to 4', '7 to 2'], why: 'Chief Justice Vinson, joined by Justices Reed and Minton, dissented.' },
    { L: [1, 2, 3], q: 'Justice Jackson\'s three-zone framework was the majority opinion in Youngstown.', tf: false, why: 'It was a concurrence; it became the most cited part of the case.' },
    { L: [3], q: 'Which are true of Jackson\'s Youngstown concurrence?', all: [['Presidential power is greatest with Congress\'s authorization', true], ['When Congress is silent, there is a "zone of twilight"', true], ['Against Congress\'s will, presidential power is "at its lowest ebb"', true], ['Presidential power is fixed and never depends on Congress', false]], why: 'Jackson wrote that presidential powers "are not fixed but fluctuate, depending upon their disjunction or conjunction with those of Congress."' },
    { L: [2, 3], q: 'Which <i>Federalist</i> paper argued that "Energy in the Executive is a leading character in the definition of good government"?', a: 'No. 70', w: ['No. 10', 'No. 47', 'No. 84'], why: 'Hamilton, Federalist No. 70.' }
  ]; }, 'What has Congress said: yes, nothing, or no?'));

  G('conlaw1.nondelegation', fromBank(function () { return [
    { L: [1, 2, 3], q: 'What must Congress provide when it delegates authority to an agency?', a: 'An intelligible principle to guide the agency', w: ['A list of every rule the agency will write', 'The consent of the states', 'Nothing; delegation is unlimited'], why: 'J. W. Hampton (1928): an "intelligible principle."' },
    { L: [1, 2, 3], q: 'How many times has the Supreme Court struck down a federal law as an unconstitutional delegation to the government?', a: 'Twice, both in 1935', w: ['Never', 'Dozens of times', 'Once, in 2019'], why: 'Panama Refining and Schechter Poultry, both 1935.' },
    { L: [1, 2], q: 'Which case announced the "intelligible principle" test?', a: ny('hampton'), w: [ny('schechter'), ny('gundy'), ny('whitman')], why: '<i>J. W. Hampton, Jr. & Co. v. United States</i> (1928).' },
    { L: [2, 3], q: 'What does the major questions doctrine require?', a: 'Clear congressional authorization for agency decisions of vast economic and political significance', w: ['That Congress write every major rule itself', 'That courts defer to agencies on major questions', 'That the President approve all agency rules'], why: 'FDA v. Brown & Williamson (2000): Congress does not delegate such decisions "in so cryptic a fashion."' },
    { L: [2, 3], q: 'Which case held that the Food, Drug, and Cosmetic Act did not give the FDA power to regulate tobacco products?', a: ny('brownwilliamson'), w: [ny('whitman'), ny('gundy'), ny('mistretta')], why: '<i>FDA v. Brown & Williamson Tobacco Corp.</i> (2000), 5 to 4.' },
    { L: [2, 3], q: 'In <i>Whitman v. American Trucking Associations</i> (2001), what did the Court decide?', a: 'The Clean Air Act\'s standard "requisite to protect the public health" was an intelligible principle', w: ['The Clean Air Act was an unconstitutional delegation', 'The EPA must be abolished', 'The intelligible principle test was overruled'], why: 'Justice Scalia wrote for a unanimous Court.' },
    { L: [1, 2], q: 'Which body did <i>Mistretta v. United States</i> (1989) uphold against a nondelegation challenge?', a: 'The United States Sentencing Commission', w: ['The Federal Trade Commission', 'The Line Item Veto Act', 'The National Recovery Administration'], why: 'Decided 8 to 1; Justice Scalia dissented.' },
    { L: [1, 2, 3], q: 'The nondelegation doctrine has frequently been used to strike down federal laws since 1935.', tf: false, why: 'It has not struck down a federal law since 1935, though several justices have urged reviving it.' },
    { L: [3], q: 'Which are true?', all: [['Panama Refining (1935) struck down a delegation', true], ['FDA v. Brown & Williamson (2000) read a statute narrowly on a question of vast significance', true], ['Justice Gorsuch dissented in Gundy (2019), urging a stricter test', true], ['Gundy struck down the sex-offender registration law', false]], why: 'Gundy upheld the delegation; Gorsuch, joined by Roberts and Thomas, dissented.' },
    { L: [3], gen: function () { return chrono([3], ['hampton', 'panama', 'mistretta', 'brownwilliamson', 'whitman', 'gundy']); } }
  ]; }, 'Intelligible principle for delegation; clear authorization for major questions.'));

  G('conlaw1.legislative-veto', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['chadha', 'bowsher']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['chadha', 'bowsher']); } },
    { L: [1, 2, 3], q: 'What did <i>INS v. Chadha</i> (1983) strike down?', a: 'The one-house legislative veto', w: ['The presidential veto', 'The Line Item Veto Act', 'The filibuster'], why: 'Legislative action requires passage by both houses and presentment.' },
    { L: [1, 2], q: 'Which case struck down the Line Item Veto Act?', a: ny('clintonny'), w: [ny('chadha'), ny('bowsher'), ny('clintonjones')], why: '<i>Clinton v. City of New York</i> (1998), 6 to 3.' },
    { L: [1, 2, 3], q: 'What two requirements of Article I, Section 7 did Chadha enforce?', a: 'Bicameralism and presentment', w: ['Standing and ripeness', 'Advice and consent', 'Notice and hearing'], why: 'Passage by both houses, then presentment to the President.' },
    { L: [2, 3], q: 'Why was the Line Item Veto Act struck down?', a: 'Canceling parts of signed laws amends them without Article I\'s process', w: ['It gave Congress too much power', 'It violated the Tenth Amendment', 'It was a political question'], why: 'There is no constitutional procedure for the President to amend or repeal parts of statutes.' },
    { L: [2, 3], q: 'Which of these may one house of Congress do alone, with legal effect, under Chadha?', a: 'The Senate confirming a nominee', w: ['The House overturning an agency rule', 'The Senate suspending a deportation', 'The House cutting a program\'s budget'], why: 'The Constitution expressly gives some one-house powers (confirmation, impeachment, trial); other legislative acts need both houses and presentment.' },
    { L: [2, 3], q: 'How does a regular veto differ from a line-item cancellation?', a: 'A veto rejects a whole bill before it becomes law; a cancellation changes an enacted law', w: ['They are the same', 'A veto applies only to spending', 'A cancellation can be overridden by one house'], why: 'Article I lets the President approve or reject the whole bill before enactment.' },
    { L: [1, 2, 3], q: 'The line-item veto was struck down because it gave Congress too much power.', tf: false, why: 'It gave the President a power to amend laws that the Constitution does not grant.' },
    { L: [3], gen: function () { return chrono([3], ['chadha', 'bowsher', 'clintonny']); } },
    { L: [3], q: 'Which are valid ways for Congress to overturn an agency rule after Chadha?', all: [['Pass a joint resolution through both houses and present it to the President', true], ['Pass a new statute changing the agency\'s authority', true], ['Have one house vote to veto the rule', false], ['Have a committee chair cancel the rule', false]], why: 'Both houses plus presentment, or a new statute; one-house or committee vetoes are invalid.' }
  ]; }, 'Both houses, then the President.'));

  var OFFQ = [
    ['A file clerk at a federal agency', 'an employee, not an officer'],
    ['A hearing judge who presides over enforcement cases and issues decisions', 'an inferior officer'],
    ['A cabinet secretary who heads a department', 'a principal officer'],
    ['An ambassador', 'a principal officer'],
    ['An administrative judge supervised and reviewable by a Senate-confirmed department head', 'an inferior officer']];
  var OFFK = ['an employee, not an officer', 'an inferior officer', 'a principal officer'];
  G('conlaw1.appointments', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['lucia', 'edmond', 'buckley', 'canning', 'morrisonolson']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['lucia', 'edmond', 'buckley', 'canning', 'morrisonolson']); } },
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(OFFQ); return { q: 'Under the Appointments Clause, how is this position best classified? ' + x[0] + '.', a: x[1], w: OFFK.filter(function (k) { return k !== x[1]; }), why: 'Officers exercise significant authority; inferior officers are directed and supervised by Senate-confirmed officers. This is ' + x[1] + '.' }; } },
    { L: [1, 2], q: 'Who appoints principal officers of the United States?', a: 'The President, with the advice and consent of the Senate', w: ['Congress alone', 'The courts', 'The heads of departments'], why: 'Article II, Section 2, Clause 2.' },
    { L: [1, 2, 3], q: 'In whom may Congress vest the appointment of inferior officers?', a: 'The President alone, the courts of law, or the heads of departments', w: ['Only the Senate', 'Congressional committees', 'State governors'], why: 'The clause lists those three; Congress may not appoint officers itself (Buckley v. Valeo).' },
    { L: [2, 3], q: 'Under <i>NLRB v. Noel Canning</i> (2014), how long must a Senate recess presumptively be for a recess appointment?', a: 'At least ten days', w: ['At least three days', 'At least thirty days', 'Any length at all'], why: 'A recess of fewer than ten days is presumptively too short; the three-day break did not count.' },
    { L: [2, 3], q: 'Which case held that SEC administrative law judges are officers who must be appointed under the clause?', a: ny('lucia'), w: [ny('edmond'), ny('buckley'), ny('canning')], why: '<i>Lucia v. SEC</i> (2018).' },
    { L: [2, 3], q: 'Which case held that Congress could not appoint members of the Federal Election Commission?', a: ny('buckley'), w: [ny('lucia'), ny('morrisonolson'), ny('edmond')], why: '<i>Buckley v. Valeo</i> (1976).' },
    { L: [2, 3], q: 'According to <i>Edmond</i> (1997), what makes an officer "inferior"?', a: 'Work directed and supervised by officers appointed with Senate consent', w: ['A salary below a set amount', 'Appointment by a court', 'Service for less than four years'], why: 'Edmond focused on supervision by principal officers.' },
    { L: [1, 2, 3], q: 'Every federal employee must be confirmed by the Senate.', tf: false, why: 'Employees are not officers, and inferior officers may be appointed without the Senate if Congress provides.' },
    { L: [2, 3], q: 'In <i>Federalist</i> No. 76, Hamilton said the Senate\'s role in appointments would be an excellent check upon…', a: 'a spirit of favoritism in the President', w: ['the power of the states', 'the courts', 'the House of Representatives'], why: '"It would be an excellent check upon a spirit of favoritism in the President."' }
  ]; }, 'Significant authority? Then who supervises the officer?'));

  G('conlaw1.removal-power', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['seila', 'myers', 'humphreys', 'morrisonolson', 'wiener', 'freeenterprise']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['seila', 'myers', 'humphreys', 'morrisonolson', 'wiener', 'freeenterprise']); } },
    { L: [1, 2, 3], q: 'Which case refused to extend <i>Humphrey\'s Executor</i> to an agency led by a single director?', a: ny('seila'), w: [ny('myers'), ny('morrisonolson'), ny('wiener')], why: '<i>Seila Law v. CFPB</i> (2020), 5 to 4.' },
    { L: [1, 2], q: 'What did <i>Myers v. United States</i> (1926) hold?', a: 'The President may remove executive officers he appoints without Senate consent', w: ['Congress may require Senate consent to remove a postmaster', 'Commissioners may be removed only for cause', 'Officers serve for life'], why: 'Chief Justice Taft (himself a former President) wrote for the Court.' },
    { L: [1, 2, 3], q: 'What did <i>Humphrey\'s Executor</i> (1935) allow?', a: 'Limits on removing members of multi-member commissions like the FTC', w: ['Removal of any officer at will', 'Senate approval of all removals', 'Lifetime tenure for commissioners'], why: 'It upheld a for-cause limit for a "quasi-legislative" and "quasi-judicial" commission. The Court overruled this precedent in 2026.' },
    { L: [2, 3], q: 'What did <i>Seila Law v. CFPB</i> (2020) hold?', a: 'Removal protection for a single agency director is unconstitutional', w: ['Humphrey\'s Executor covers single directors', 'Independent counsels are principal officers', 'The CFPB is abolished'], why: 'Seila Law refused to extend Humphrey\'s to a single director, 5 to 4.' },
    { L: [2, 3], q: 'Which case upheld a good-cause limit on removing an independent counsel?', a: ny('morrisonolson'), w: [ny('myers'), ny('seila'), ny('freeenterprise')], why: '<i>Morrison v. Olson</i> (1988), 7 to 1; Justice Scalia dissented.' },
    { L: [2, 3], q: 'What did <i>Free Enterprise Fund v. PCAOB</i> (2010) strike down?', a: 'Two layers of for-cause removal protection', w: ['The Securities and Exchange Commission', 'A single layer of protection for the FTC', 'The independent counsel law'], why: 'Double for-cause insulation was held inconsistent with Article II.' },
    { L: [2, 3], q: 'Under <i>Seila Law</i> (2020), which two exceptions to the President\'s removal power had the Court recognized?', a: 'Multi-member expert bodies and inferior officers with limited duties', w: ['Cabinet secretaries and ambassadors', 'All agencies created after 1935', 'Any officer Congress chooses to protect'], why: 'Humphrey\'s Executor and Morrison v. Olson; a single director fit neither.' },
    { L: [2, 3], q: 'Which <i>Federalist</i> paper said the Senate\'s consent "would be necessary to displace as well as to appoint"?', a: 'No. 77', w: ['No. 70', 'No. 78', 'No. 51'], why: 'Hamilton, Federalist No. 77. Removal-power cases on both sides discuss it.' },
    { L: [1, 2, 3], q: 'Humphrey\'s Executor (1935) is still current law.', tf: false, why: 'The Court overruled this precedent in 2026.' },
    { L: [3], gen: function () { return chrono([3], ['myers', 'humphreys', 'wiener', 'morrisonolson', 'freeenterprise', 'seila']); } },
    { L: [3], q: 'Which arguments are made for the unitary executive view?', all: [['Article II vests "the executive Power" in one President', true], ['The President must "take Care that the Laws be faithfully executed"', true], ['Voters can hold the President responsible only if he controls those who execute the law', true], ['Congress created independent commissions and has relied on them for over a century', false]], why: 'The last is an argument for the independent-agency view.' }
  ]; }, 'What kind of officer, and how much executive power does it exercise?'));

  G('conlaw1.foreign-affairs', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['zivotofsky', 'curtisswright', 'dames', 'medellin', 'youngstown']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['zivotofsky', 'curtisswright', 'dames', 'medellin', 'youngstown']); } },
    { L: [1, 2, 3], q: 'Which case held that the power to recognize foreign governments belongs to the President alone?', a: ny('zivotofsky'), w: [ny('curtisswright'), ny('dames'), ny('medellin')], why: '<i>Zivotofsky v. Kerry</i> (2015), 6 to 3.' },
    { L: [1, 2], q: 'Which case called the President "the sole organ" of the federal government in international relations?', a: ny('curtisswright'), w: [ny('youngstown'), ny('zivotofsky'), ny('hamdi')], why: '<i>United States v. Curtiss-Wright</i> (1936), by Justice Sutherland.' },
    { L: [2, 3], q: 'Which case upheld executive agreements settling the Iran hostage claims?', a: ny('dames'), w: [ny('curtisswright'), ny('medellin'), ny('zivotofsky')], why: '<i>Dames & Moore v. Regan</i> (1981), relying on statutes and long congressional acquiescence.' },
    { L: [2, 3], q: 'What was at issue in <i>Zivotofsky v. Kerry</i>?', a: 'Whether passports could list "Israel" as the birthplace of citizens born in Jerusalem', w: ['Whether the President could impose tariffs', 'Whether Congress could declare war', 'Whether treaties bind states'], why: 'A 2002 statute required it on request; the Court held it unconstitutionally intruded on the recognition power.' },
    { L: [2, 3], q: 'Which of these foreign affairs powers does the Constitution give to Congress?', a: 'Regulating commerce with foreign nations', w: ['Receiving ambassadors', 'Recognizing foreign governments', 'Negotiating treaties'], why: 'Congress regulates foreign commerce, declares war and funds the government; the President receives ambassadors and negotiates treaties.' },
    { L: [1, 2, 3], q: 'The President controls all of American foreign affairs without any role for Congress.', tf: false, why: 'Congress has major foreign powers; Zivotofsky rested on the specific recognition power.' },
    { L: [3], q: 'In <i>Medellín v. Texas</i> (2008), could the President by himself make a non-self-executing treaty obligation binding on state courts?', a: 'No', w: ['Yes, under the recognition power', 'Yes, as Commander in Chief', 'Only with the governor\'s consent'], why: 'Turning such an obligation into domestic law is for Congress; the President was in zone 3.' },
    { L: [3], gen: function () { return chrono([3], ['curtisswright', 'youngstown', 'dames', 'medellin', 'zivotofsky']); } }
  ]; }, 'Which branch does the Constitution give this specific power to?'));

  G('conlaw1.war-detention', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['hamdi', 'hamdan', 'exmilligan', 'prize', 'youngstown']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['hamdi', 'hamdan', 'exmilligan', 'prize', 'youngstown']); } },
    { L: [1, 2, 3], q: 'Which case held that a U.S. citizen held as an enemy combatant must receive notice and a fair chance to rebut before a neutral decisionmaker?', a: ny('hamdi'), w: [ny('hamdan'), ny('boumediene'), ny('exmilligan')], why: '<i>Hamdi v. Rumsfeld</i> (2004), Justice O\'Connor\'s plurality.' },
    { L: [1, 2], q: 'Which case extended the constitutional privilege of habeas corpus to detainees at Guantanamo Bay?', a: ny('boumediene'), w: [ny('hamdi'), ny('hamdan'), ny('prize')], why: '<i>Boumediene v. Bush</i> (2008), 5 to 4.' },
    { L: [1, 2], q: 'Which case upheld President Lincoln\'s blockade of Southern ports before Congress acted?', a: ny('prize'), w: [ny('exmilligan'), ny('youngstown'), ny('curtisswright')], why: '<i>The Prize Cases</i> (1863).' },
    { L: [2, 3], q: 'Why were the Guantanamo military commissions held unlawful in <i>Hamdan v. Rumsfeld</i> (2006)?', a: 'Congress had not authorized them, and they violated the laws of war as Congress adopted them', w: ['They were held in a foreign country', 'The President lacks any war power', 'The detainees were U.S. citizens'], why: 'The case turned on congressional authorization; Congress then passed the Military Commissions Act of 2006.' },
    { L: [2, 3], q: 'Complete Justice O\'Connor\'s line in Hamdi: "a state of war is not a … for the President when it comes to the rights of the Nation\'s citizens."', a: 'blank check', w: ['green light', 'declaration', 'veto'], why: '"A state of war is not a blank check for the President."' },
    { L: [2, 3], q: 'Under the War Powers Resolution (1973), within how many days must forces generally be withdrawn without congressional authorization?', a: '60 days (plus up to 30 for withdrawal)', w: ['7 days', '1 year', '90 days with no extension'], why: 'The report is due in 48 hours; the clock is 60 days, extendable by 30.' },
    { L: [1, 2, 3], q: 'Ex parte Milligan (1866) upheld trying a civilian by military commission where civil courts were open.', tf: false, why: 'Milligan held such a trial unlawful.' },
    { L: [3], gen: function () { return chrono([3], ['prize', 'exmilligan', 'youngstown', 'hamdi', 'hamdan', 'boumediene']); } },
    { L: [3], q: 'Which statements about the post-2001 detention cases are accurate?', all: [['Hamdi found the 2001 AUMF authorized detention of enemy combatants', true], ['Hamdan turned largely on what Congress had authorized', true], ['Boumediene held the Suspension Clause reaches Guantanamo', true], ['The Court gave the President a free hand with no review', false]], why: 'The cases turned on congressional authorization and procedural protections.' }
  ]; }, 'What had Congress authorized, and what process was due?'));

  var IMM = [
    ['A civil suit for damages over a President\'s official act while in office', 'Absolute immunity (Nixon v. Fitzgerald)'],
    ['A civil suit over a President\'s unofficial conduct before taking office', 'No immunity; the suit may proceed (Clinton v. Jones)'],
    ['A criminal trial subpoena for a President\'s official recordings', 'Qualified privilege that yields to a specific need (United States v. Nixon)'],
    ['A President removed by impeachment and conviction is later indicted in court for the same conduct', 'Allowed; the Constitution says the convicted party remains liable to indictment and trial (Article I, Section 3)']];
  var IMMK = IMM.map(function (x) { return x[1]; });
  G('conlaw1.privilege-immunity', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['nixon', 'fitzgerald']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['nixon', 'fitzgerald']); } },
    { L: [2, 3], gen: function (R) { var x = R.pick(IMM); return { q: 'What rule applies? ' + x[0] + '.', a: x[1], w: IMMK.filter(function (k) { return k !== x[1]; }), why: 'Sort by the kind of proceeding (civil or criminal) and the kind of act (official or unofficial). ' + x[1] + '.' }; } },
    { L: [1, 2, 3], q: 'What did <i>United States v. Nixon</i> (1974) hold about executive privilege?', a: 'It is real but qualified, and yields to a criminal trial\'s specific need for evidence', w: ['It is absolute', 'It does not exist', 'Only Congress may decide it'], why: 'The unanimous Court (8 to 0) ordered the tapes produced.' },
    { L: [1, 2], q: 'Which case allowed a civil suit against a sitting President over unofficial acts before taking office?', a: ny('clintonjones'), w: [ny('fitzgerald'), ny('nixon'), ny('clintonny')], why: '<i>Clinton v. Jones</i> (1997), 9 to 0.' },
    { L: [1, 2], q: 'Which case gave Presidents absolute immunity from civil damages for official acts?', a: ny('fitzgerald'), w: [ny('clintonjones'), ny('clintonny'), ny('nixon')], why: '<i>Nixon v. Fitzgerald</i> (1982), 5 to 4.' },
    { L: [2, 3], q: 'In <i>Nixon v. Fitzgerald</i> (1982), how far did the President\'s civil immunity reach?', a: 'To acts within the "outer perimeter" of official duties', w: ['Only to acts the President personally signed', 'To all acts, official or not', 'Only to acts approved by Congress'], why: 'The Court gave absolute immunity from civil damages for official acts, including those at the outer perimeter of the office.' },
    { L: [2, 3], q: 'What did <i>Clinton v. Jones</i> (1997) hold?', a: 'A sitting President has no immunity, even temporary, from a civil suit over unofficial acts before taking office', w: ['A sitting President may not be sued until he leaves office', 'Presidents have absolute immunity from all civil suits', 'Only Congress may decide whether such a suit goes forward'], why: 'Decided 9 to 0. Fitzgerald\'s immunity covers official acts only.' },
    { L: [2, 3], q: 'In <i>United States v. Nixon</i> (1974), who decided whether the privilege had to yield?', a: 'The courts', w: ['The President alone', 'Congress', 'The special prosecutor'], why: 'The Court said it is the province of the judiciary to say what the law is, including the scope of executive privilege.' },
    { L: [1, 2, 3], q: 'Nixon v. Fitzgerald gave Presidents absolute immunity from criminal prosecution for all acts.', tf: false, why: 'Fitzgerald concerned civil damages for official acts.' },
    { L: [3], gen: function () { return chrono([3], ['nixon', 'fitzgerald', 'clintonjones']); } },
    { L: [2, 3], q: 'In <i>Federalist</i> No. 69, Hamilton said that a President removed by impeachment would afterwards be…', a: '"liable to prosecution and punishment in the ordinary course of law"', w: ['immune from any later trial', 'exiled from the country', 'barred only from voting'], why: 'Hamilton contrasted the President with the "sacred and inviolable" British king.' }
  ]; }, 'Civil or criminal? Official or unofficial?'));

  /* ======================================================== Unit 9: The Levels of Scrutiny */
  var TIERS = ['Strict scrutiny', 'Intermediate scrutiny', 'Rational basis'];
  var PAIRS = { 'Strict scrutiny': ['compelling', 'narrowly tailored'], 'Intermediate scrutiny': ['important', 'substantially related'], 'Rational basis': ['legitimate', 'rationally related'] };
  function scrViz(tier) { var k = { 'Strict scrutiny': 'strict', 'Intermediate scrutiny': 'intermediate', 'Rational basis': 'rational' }[tier]; return { name: 'cv-scrutiny', opts: { mode: 'tiers', ask: k, quiet: true, interactive: false } }; }
  G('conlaw1.rational-basis', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['leeoptical', 'carolene', 'cleburne', 'railwayexpress']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['leeoptical', 'carolene', 'cleburne', 'railwayexpress']); } },
    { L: [1, 2, 3], q: 'Under rational basis review, a law is upheld if it is…', a: 'rationally related to a legitimate government interest', w: ['narrowly tailored to a compelling interest', 'substantially related to an important interest', 'the least restrictive means available'], why: 'Legitimate interest, rational relation.' },
    { L: [1, 2, 3], q: 'Under rational basis review, who bears the burden?', a: 'The challenger, who must negate every conceivable basis', w: ['The government, which must prove its actual purpose', 'The court, which must find a reason', 'Congress'], why: 'The law is presumed valid; any conceivable legitimate reason will do.' },
    { L: [1, 2], q: 'Which case upheld Oklahoma\'s rule that opticians need a prescription to replace lenses?', a: ny('leeoptical'), w: [ny('carolene'), ny('cleburne'), ny('craig')], why: '<i>Williamson v. Lee Optical</i> (1955).' },
    { L: [2, 3], q: 'Which case\'s footnote four suggested closer review for laws aimed at "discrete and insular minorities"?', a: ny('carolene'), w: [ny('leeoptical'), ny('lochner'), ny('brown')], why: '<i>United States v. Carolene Products Co.</i> (1938), footnote four.' },
    { L: [3], q: 'Which kinds of laws did Carolene Products\' footnote four suggest might get closer review?', all: [['Laws within a specific prohibition of the Constitution, such as the Bill of Rights', true], ['Laws restricting the political processes', true], ['Laws directed at discrete and insular minorities', true], ['All economic regulations', false]], why: 'Those three categories; economic regulation gets deference.' },
    { L: [2, 3], q: 'In <i>City of Cleburne</i> (1985) and <i>Romer v. Evans</i> (1996), laws failed even rational basis review. What did the Court find?', a: 'The laws rested on animus, and a bare desire to harm a group is not a legitimate interest', w: ['The laws classified by race', 'The laws burdened speech', 'Congress had not consented'], why: 'Scholars call this "rational basis with bite."' },
    { L: [1, 2, 3], q: 'Under rational basis review, the government must prove the actual reason the legislature had for the law.', tf: false, why: 'Any conceivable legitimate reason suffices, even one never stated.' },
    { L: [3], q: 'A city limits the number of taxi licenses. A would-be driver challenges it under equal protection. Which reason would most likely satisfy rational basis review?', a: 'The city might conceivably want to reduce traffic congestion', w: ['The city must prove the cap reduces congestion with data', 'The cap is the least restrictive means', 'The cap serves a compelling interest'], why: 'A conceivable legitimate interest and a rational relation are enough.' },
    { L: [3], gen: function () { return chrono([3], ['lochner', 'carolene', 'leeoptical', 'cleburne', 'romer']); } }
  ]; }, 'Any conceivable legitimate reason, and the challenger bears the burden.'));

  G('conlaw1.heightened-scrutiny', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R) { var t = R.pick(TIERS), p = PAIRS[t]; return { q: 'Which tier requires a <b>' + p[0] + '</b> government interest?', a: t, w: TIERS.filter(function (x) { return x !== t; }), why: 'Interest and fit come in pairs: ' + t + ' pairs a ' + p[0] + ' interest with means ' + p[1] + '.', viz: scrViz(t) }; } },
    { L: [1, 2, 3], gen: function (R) { var t = R.pick(TIERS), p = PAIRS[t]; return { q: 'Under ' + t.toLowerCase() + ', how closely must the law fit its goal?', a: p[1], w: TIERS.filter(function (x) { return x !== t; }).map(function (x) { return PAIRS[x][1]; }), why: t + ': a ' + p[0] + ' interest and means ' + p[1] + '.' }; } },
    { L: [2, 3], q: 'Under strict scrutiny, who bears the burden?', a: 'The government', w: ['The challenger', 'The court', 'The states'], why: 'Under both heightened tiers the government must justify the law.' },
    { L: [2, 3], q: 'Which case set the intermediate scrutiny test for sex classifications?', a: ny('craig'), w: [ny('vmi'), ny('reed'), ny('frontiero')], why: '<i>Craig v. Boren</i> (1976): important objectives, substantially related means.' },
    { L: [2, 3], q: 'What phrase did <i>United States v. Virginia</i> (1996) use for the justification a state needs for a sex classification?', a: '"exceedingly persuasive justification"', w: ['"compelling state interest"', '"any conceivable basis"', '"clear and present danger"'], why: 'Justice Ginsburg wrote for the Court; VMI\'s men-only admission failed.' },
    { L: [3], q: 'Which pairs of interest and fit are correctly matched?', all: [['Compelling interest, narrowly tailored', true], ['Important interest, substantially related', true], ['Legitimate interest, rationally related', true], ['Compelling interest, rationally related', false], ['Legitimate interest, narrowly tailored', false]], why: 'Keep each tier\'s interest and fit together.' },
    { L: [3], q: 'A law serving a compelling interest bans far more conduct than needed, and narrower options exist. Under strict scrutiny it…', a: 'fails, because it is not narrowly tailored', w: ['passes, because the interest is compelling', 'passes under intermediate scrutiny', 'is a political question'], why: 'Both parts must be met; an overbroad means fails narrow tailoring.' },
    { L: [1, 2, 3], q: 'Under intermediate scrutiny, the challenger must disprove every conceivable justification.', tf: false, why: 'That describes rational basis; under intermediate scrutiny the government bears the burden.' }
  ]; }, 'Legitimate and rational; important and substantial; compelling and narrow.'));

  var TIERQ = [
    ['A state law sets a mandatory retirement age for state police officers.', 'Rational basis'],
    ['A city gives contracting preferences based on the race of business owners.', 'Strict scrutiny'],
    ['A state sets different jury-service ages for men and women.', 'Intermediate scrutiny'],
    ['A state denies certain benefits to children born outside marriage.', 'Intermediate scrutiny'],
    ['A tax law treats two kinds of businesses differently.', 'Rational basis'],
    ['A law classifies people by national origin.', 'Strict scrutiny'],
    ['A zoning rule treats homes for people with disabilities differently.', 'Rational basis'],
    ['A state law burdens the fundamental right to vote.', 'Strict scrutiny'],
    ['A city bans speech in parks based on its message.', 'Strict scrutiny']];
  G('conlaw1.choosing-the-tier', fromBank(function () { return [
    { L: [1, 2, 3], gen: function (R) { var x = R.pick(TIERQ); return { q: 'Which tier of scrutiny applies? ' + x[0], a: x[1], w: TIERS.filter(function (t) { return t !== x[1]; }), why: 'The tier follows from what the law classifies or burdens. Here: ' + x[1] + '.' }; } },
    { L: [2, 3], q: 'A state program classifies by race in order to help a disadvantaged group. Which tier applies?', a: 'Strict scrutiny', w: ['Rational basis, because it is meant to help', 'Intermediate scrutiny', 'No review'], why: 'The Court applies strict scrutiny to all racial classifications (Croson, 1989; Adarand, 1995).' },
    { L: [2, 3], q: 'A person says the government had to hold a hearing before cutting off her benefits. Which framework does the Court use?', a: 'The Mathews v. Eldridge balance of interests, risk of error and government burden', w: ['Strict scrutiny', 'Intermediate scrutiny', 'Rational basis'], why: 'Procedural due process questions use the Mathews balance (1976), not a tier.' },
    { L: [2, 3], q: 'Which case set the three-factor balance for deciding what procedures due process requires?', a: 'Mathews v. Eldridge (1976)', w: ['Craig v. Boren (1976)', 'Lemon v. Kurtzman (1971)', 'Pike v. Bruce Church (1970)'], why: '<i>Mathews v. Eldridge</i> weighs the private interest, the risk of error and the government\'s interest.' },
    { L: [1, 2, 3], q: 'Courts choose the tier of scrutiny by asking whether the law seems unfair.', tf: false, why: 'The tier follows from what the law classifies or burdens, not from its wisdom.' },
    { L: [3], q: 'Which classifications trigger intermediate scrutiny?', all: [['Sex', true], ['Birth outside marriage (legitimacy)', true], ['Race', false], ['Age', false], ['Disability', false]], why: 'Race gets strict scrutiny; age and disability get rational basis.' },
    { L: [3], q: 'A harsh but economic regulation burdens only a group of small businesses. Which tier applies?', a: 'Rational basis', w: ['Strict scrutiny', 'Intermediate scrutiny', 'A history-based test'], why: 'Economic regulation gets rational basis, however harsh it seems.' }
  ]; }, 'What does the law classify by, or which right does it burden?'));

  /* ======================================================== end */
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
  var TABS = [{"k":"conlaw1.constitutional-precedent#3","h":["Overruled case","Overruled by","What changed"],"r":[["<i>Adkins v. Children's Hospital</i> (1923): minimum wage for women struck down","<i>West Coast Hotel Co. v. Parrish</i> (1937)","The end of the Lochner era; economic laws get deference"],["<i>Hammer v. Dagenhart</i> (1918): child-labor shipping ban struck down","<i>United States v. Darby</i> (1941)","A broader reading of the commerce power"],["<i>Plessy v. Ferguson</i> (1896): \"separate but equal\"","<i>Brown v. Board of Education</i> (1954) rejected it in public education; later cases ended it elsewhere","Separate facilities held inherently unequal"],["<i>National League of Cities v. Usery</i> (1976)","<i>Garcia v. San Antonio MTA</i> (1985)","Its \"traditional governmental functions\" test proved unworkable"],["<i>Abood v. Detroit Board of Education</i> (1977): public-sector agency fees","<i>Janus v. AFSCME</i> (2018), 5 to 4","The Court walked through the factors and found each favored overruling; the dissent stressed reliance"]],"cap":"A few of the many precedents the Court has overruled. The Constitution Annotated's 1992 edition already listed 204 overrulings, constitutional and statutory.","m":[[0,1,"Which later case overruled {a}?",0,"an overruled case with the case that overruled it"],[1,0,"Which earlier case did {a} overrule?",0,0,2]]},
    {"k":"conlaw1.political-questions-conlaw#3","h":["Baker's markers (in summary)","In plain words"],"r":[["A textual commitment of the issue to another branch","The Constitution gives this decision to Congress or the President"],["No judicially discoverable and manageable standards","There is no legal test a court could apply"],["A policy decision of a kind not for courts","Deciding would require a non-judicial policy choice"],["Lack of respect due other branches; need to adhere to a political decision; risk of embarrassment from conflicting pronouncements","Prudential concerns about the Court's place among the branches"]],"cap":"The first two do most of the work in modern cases.","m":[[0,1,"One of Baker v. Carr's markers of a political question is: {a}. What does it mean in plain words?",0]]},
    {"k":"conlaw1.commerce-narrow-era#1","h":["Case","Law","Result and reasoning"],"r":[["<i>United States v. E. C. Knight Co.</i> (1895), 8 to 1","Sherman Act applied to a sugar-refining trust controlling about 98 percent of U.S. refining","<b>Not reached.</b> Manufacturing is not commerce; its effect on commerce was only \"indirect.\" Justice Harlan dissented"],["<i>Champion v. Ames</i> (1903)","Federal ban on carrying lottery tickets across state lines","<b>Upheld.</b> Congress may prohibit the interstate movement of things it judges harmful"],["<i>Hammer v. Dagenhart</i> (1918), 5 to 4","Ban on interstate shipment of goods made with child labor (Keating-Owen Act, 1916)","<b>Struck down.</b> The goods were harmless; the law really regulated manufacturing, a state matter. Justice Holmes dissented"],["<i>Schechter Poultry Corp. v. United States</i> (1935), 9 to 0","National Industrial Recovery Act codes applied to a Brooklyn poultry business","<b>Struck down.</b> Local business with only indirect effects; also an unlawful delegation (see Nondelegation)"],["<i>Carter v. Carter Coal Co.</i> (1936)","Wage and hour rules for coal mining","<b>Struck down.</b> Mining is production, not commerce; effects on commerce were indirect"]],"cap":"The narrow era's leading cases.","m":[[1,0,"Which case of the narrow commerce era concerned this law: {a}?",0],[0,2,"What was the result in {a}?",0,0,2]]},
    {"k":"conlaw1.lopez#3","h":["Lopez category","What it covers","Example"],"r":[["1. Channels of interstate commerce","The routes: highways, waterways, airways, and the movement along them","Barring stolen goods from being shipped across state lines"],["2. Instrumentalities of interstate commerce, and persons or things in it","The means of commerce: vehicles, planes, trains, and goods and people moving","Safety rules for interstate trucks"],["3. Activities that substantially affect interstate commerce","Activities with a substantial relation to commerce (economic activity may be aggregated)","Wickard's wheat; labor relations at a steel mill"]],"cap":"The three categories from Lopez.","m":[[1,0,"Which Lopez category covers this: {a}?",0,"a category with what it covers"],[2,0,"Under Lopez, which category does this example fall in: {a}?",0]]},
    {"k":"conlaw1.conditional-spending#2","h":["Dole's limits on conditions","In plain words"],"r":[["1. General welfare","The spending must serve the general welfare (courts defer to Congress)"],["2. Unambiguous","States must know the condition when they accept the money"],["3. Related (germane)","The condition must relate to the federal interest in the program"],["4. No independent bar","The condition cannot require the state to do something unconstitutional"],["5. Not coercive","The pressure cannot turn into compulsion"]],"cap":"The test from South Dakota v. Dole (1987).","m":[[1,0,"Which of South Dakota v. Dole's limits on spending conditions is this: {a}?",0,"a limit with what it means"]]},
    {"k":"conlaw1.sovereign-immunity#4","h":["Case","Holding"],"r":[["<i>Hans v. Louisiana</i> (1890)","A state's own citizen may not sue it in federal court without its consent"],["<i>Ex parte Young</i> (1908)","A suit for an injunction against a state <b>officer</b> to stop enforcing an unconstitutional law is allowed"],["<i>Fitzpatrick v. Bitzer</i> (1976)","Congress may abrogate state immunity when it enforces the Fourteenth Amendment (Section 5)"],["<i>Seminole Tribe of Florida v. Florida</i> (1996), 5 to 4","Congress may <b>not</b> abrogate state immunity using its Article I powers (overruling <i>Pennsylvania v. Union Gas</i>, 1989)"],["<i>Alden v. Maine</i> (1999)","States are also immune from private suits under federal law in their own courts"]],"cap":"The doctrine and its main exceptions.","m":[[1,0,"Which case held this: {a}?",0,"a case with its holding"],[0,1,"What did {a} hold?",0,0,2]]},
    {"k":"conlaw1.preemption#2","h":["Kind","When it applies","Example"],"r":[["Express preemption","The federal statute says so in words","\"No State may impose labeling requirements different from these.\""],["Field preemption","Federal regulation is so pervasive, or the federal interest so dominant, that Congress left no room for states","Alien registration (Arizona v. United States, 2012)"],["Conflict: impossibility","It is impossible to comply with both federal and state law","Federal law requires a label; state law forbids it"],["Conflict: obstacle","State law stands as an obstacle to the full purposes of federal law","A state penalty scheme that upsets a balance Congress chose"]],"cap":"Express and implied preemption.","m":[[1,0,"Which kind of preemption applies when {a:l}?",0,"a kind with when it applies"],[2,0,"Which kind of preemption does this example show: {a}?",0,0,2]]},
    {"k":"conlaw1.youngstown#3","h":["Zone","Situation","Presidential power"],"r":[["1","The President acts with express or implied authorization of Congress","\"At its maximum, for it includes all that he possesses in his own right plus all that Congress can delegate\""],["2","Congress has neither granted nor denied authority","A \"zone of twilight,\" where the President and Congress may share power; the outcome depends on the facts of the moment"],["3","The President acts against the express or implied will of Congress","\"At its lowest ebb\": only the President's own constitutional powers minus Congress's powers over the matter"]],"cap":"Justice Jackson's three zones (quotations from the concurrence).","m":[[1,0,"In Justice Jackson's Youngstown framework, which zone is this: {a}?",0,"a zone with its situation"],[2,0,"In Jackson's Youngstown framework, in which zone is presidential power like this: {a}?",0,0,2]]},
    {"k":"conlaw1.nondelegation#2","h":["Case","Holding"],"r":[["<i>J. W. Hampton, Jr. & Co. v. United States</i> (1928)","A delegation is valid if Congress lays down an \"<b>intelligible principle</b>\" to guide the delegate (tariff adjustments upheld)"],["<i>Panama Refining Co. v. Ryan</i> (1935)","Struck down: a provision of the National Industrial Recovery Act gave the President power over oil shipments with no standard"],["<i>Schechter Poultry</i> (1935)","Struck down: NIRA codes of \"fair competition\" written largely by industry groups"],["<i>Mistretta v. United States</i> (1989), 8 to 1","Upheld the Sentencing Commission, which writes federal sentencing guidelines; Justice Scalia dissented"],["<i>Whitman v. American Trucking Associations</i> (2001), 9 to 0","Upheld the Clean Air Act's command to set air standards \"requisite to protect the public health\" (Justice Scalia)"],["<i>Gundy v. United States</i> (2019)","Upheld a delegation in a sex-offender registration law; Justice Gorsuch, joined by Chief Justice Roberts and Justice Thomas, dissented and urged a stricter test"]],"cap":"The nondelegation doctrine in six cases.","m":[[1,0,"Which nondelegation case held this: {a}?",0,"a case with its holding"]]},
    {"k":"conlaw1.appointments#3","h":["Question","Rule","Case"],"r":[["Who is an \"officer\"?","Someone who holds a continuing position and exercises <b>significant authority</b> under federal law; ordinary employees are not officers","<i>Buckley v. Valeo</i> (1976): Congress could not appoint members of the Federal Election Commission. <i>Lucia v. SEC</i> (2018): SEC administrative law judges are officers"],["Who is \"inferior\"?","An officer whose work is <b>directed and supervised</b> by officers appointed by the President with Senate consent","<i>Edmond v. United States</i> (1997); <i>Morrison v. Olson</i> (1988) looked at removability, limited duties, jurisdiction and tenure"],["What is a \"recess\"?","A break long enough to count: a recess of <b>fewer than ten days</b> is presumptively too short","<i>NLRB v. Noel Canning</i> (2014): appointments during a three-day break were invalid"]],"cap":"The Appointments Clause in three questions.","m":[[0,1,"Under the Appointments Clause: {a} What is the rule?",0],[2,0,"Which question about appointments did this case answer: {a}?",0,0,2]]},
    {"k":"conlaw1.heightened-scrutiny#1","h":["Tier","Interest","Fit","Burden","Typical result"],"r":[["Strict scrutiny","Compelling","Narrowly tailored (often: the least restrictive means)","The government","Laws usually fall"],["Intermediate scrutiny","Important","Substantially related","The government","Laws often fall; sex classifications need an \"exceedingly persuasive justification\""],["Rational basis","Legitimate","Rationally related","The challenger","Laws almost always stand"]],"cap":"The three tiers as pairs.","m":[[0,2,"What fit does {a} require?",0,"a tier with its required fit"],[0,1,"What kind of government interest does {a} require?",0],[4,0,"Which tier of review usually gives this result: {a}?",0,0,2]]}];
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
  var CFG = {"prefix":"conlaw1.","only":["modalities","originalism","living-constitutionalism","constitutional-precedent","marbury","review-of-states","jurisdiction-stripping","constitutional-standing","political-questions-conlaw","enumerated-powers","mcculloch","necessary-proper-today","gibbons","commerce-narrow-era","commerce-1937","wickard","civil-rights-commerce","lopez","morrison","raich","nfib-commerce","taxing-power","spending-power","conditional-spending","anti-commandeering","tenth-amendment-limits","sovereign-immunity","section-5-power","preemption","dormant-discrimination","pike-balancing","market-participant","privileges-immunities-iv","youngstown","nondelegation","legislative-veto","appointments","removal-power","foreign-affairs","war-detention","privilege-immunity","rational-basis","heightened-scrutiny","choosing-the-tier"]};
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
