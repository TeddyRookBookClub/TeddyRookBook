/* Bacon: Novum Organum. Bank (the idols, ants, spiders and bees, the tables, the history) plus computed families:
   which idol a scene shows, which instance rules out a guess about heat (exclusion, built from a small table), how
   many cases a single counterexample needs, and the tables themselves. Mostly reasoning; the counting family carries chk. */
var ID = 'gb17.bacon-novum-organum';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var B = {
  facts: [
    ['Bacon named four kinds of idols: of the Tribe, the Den (or Cave), the Market and the Theatre.', true, 'Book I, aphorism 39.'],
    ['Bacon’s "idols" are statues that people worship.', false, 'They are false images or illusions of the mind.'],
    ['The Idols of the Tribe are errors shared by all human beings.', true, 'They come with human nature itself.'],
    ['The Idols of the Market come from words and how we use them.', true, 'Vague or empty words confuse the mind.'],
    ['The Idols of the Theatre come from received systems of philosophy, which Bacon compared to stage plays.', true, 'Each builds a made-up world.'],
    ['Bacon compared good scientists to spiders, who spin webs out of themselves.', false, 'To bees, which gather and then transform; spiders stand for pure reasoners.'],
    ['Novum Organum means "New Instrument", answering Aristotle’s logical works, the Organon.', true, 'A new tool for thinking.'],
    ['Bacon’s example of the method in Book II is the nature of heat.', true, 'With tables of presence, absence and degrees.'],
    ['Bacon concluded that heat is a kind of motion of the small parts of bodies.', true, 'His "first vintage".'],
    ['Bacon thought mathematics was the key to the new science.', false, 'He underrated it; Kepler, Galileo and Newton relied on it.'],
    ['Bacon was Lord Chancellor of England.', true, 'Under James I, until 1621.'],
    ['Novum Organum was published in 1620 as part of The Great Instauration.', true, 'Its second part.'],
    ['Bacon accepted Copernicus’s system.', false, 'He did not.'],
    ['Bacon noticed that once we hold an opinion, we pull everything into its support and ignore the cases against it.', true, 'Aphorism 46: today called confirmation bias.'],
    ['The Royal Society of London, founded in 1660, looked to Bacon as its inspiration.', true, 'Its early members praised him.']
  ],
  items: [
    { q: 'In Bacon’s picture, what do the "ants" do?', r: 'Only pile up facts', w: ['Spin theories out of their heads', 'Gather facts and transform them', 'Destroy old books', 'Write poems'], why: 'Empirics, like ants, only heap up and use their store.' },
    { q: 'In Bacon’s picture, what do the "spiders" do?', r: 'Spin theories out of their own minds', w: ['Only pile up facts', 'Gather facts and transform them', 'Travel to other countries', 'Test everything'], why: 'The dogmatists spin webs from themselves.' },
    { q: 'Which creature stands for Bacon’s ideal scientist?', r: 'The bee', w: ['The ant', 'The spider', 'The owl', 'The fox'], why: 'It gathers from the flowers and works the matter into something new.' },
    { q: 'What is a "table of absence"?', r: 'A list of cases like the hot ones, but where heat is missing', w: ['A list of all hot things', 'A list of things nobody has seen', 'A table of numbers', 'A list of absent scientists'], why: 'Moonlight is like sunlight but gives no heat.' },
    { q: 'What is "exclusion" in Bacon’s method?', r: 'Crossing out every guess that some case contradicts', w: ['Leaving out the hard cases', 'Expelling people who disagree', 'Ignoring the tables', 'Choosing the guess you like best'], why: 'What survives is a first, careful conclusion.' },
    { q: 'What did Bacon call his first, careful conclusion about heat?', r: 'The first vintage', w: ['The great instauration', 'The first idol', 'The new organ', 'The final proof'], why: 'Like the first harvest of grapes.' },
    { q: 'Why did Bacon think science had made so little progress?', r: 'It jumped from a few observations to sweeping principles', w: ['There were too many experiments', 'Nobody read Aristotle', 'Telescopes were too expensive', 'Science was forbidden'], why: 'He wanted a slow climb from many facts.' },
    { q: 'What happened to Bacon in 1621?', r: 'He admitted taking gifts as a judge and was removed from office', w: ['He became Lord Chancellor', 'He sailed to New Atlantis', 'He was made a cardinal', 'He met Galileo'], why: 'He spent his last years writing.' },
    { q: 'Which later idea about heat agreed broadly with Bacon?', r: 'The kinetic theory: heat is the motion of molecules', w: ['Heat is a fluid called caloric', 'Heat is a kind of light', 'Heat comes only from the sun', 'Heat is weightless fire'], why: 'Worked out in the 1800s.' }
  ]
};
var SCENE = [
  ['You remember every time your "lucky" pencil worked on a test and forget the times it didn’t.', 'Tribe'],
  ['People see a face in the Moon, or shapes of animals in clouds.', 'Tribe'],
  ['Everyone assumes the planets must move in perfect circles, because circles seem tidy.', 'Tribe'],
  ['A carpenter explains everything in the world in terms of wood and joints.', 'Den'],
  ['A student believes whatever her favorite teacher says, without checking.', 'Den'],
  ['A man who loves one hobby sees it as the answer to every problem.', 'Den'],
  ['Two people argue for an hour, then find they meant different things by the word "fair".', 'Market'],
  ['People talk about "luck" as if it were a real force, just because there is a word for it.', 'Market'],
  ['A vague word like "natural" on a label makes people think a product is healthy.', 'Market'],
  ['Scholars accept a whole system of philosophy because it is taught in every school.', 'Theatre'],
  ['A group follows a grand theory so faithfully that they explain away every fact against it.', 'Theatre'],
  ['People trust a rule of proof just because it is the one everyone was trained in.', 'Theatre']
];
var IDOLS = { Tribe: 'Idols of the Tribe (errors common to all people)', Den: 'Idols of the Den (one person’s own slant)', Market: 'Idols of the Market (confusions from words)', Theatre: 'Idols of the Theatre (received systems and dogmas)' };
function famIdol(R, lv) {
  var s = R.pick(SCENE), right = IDOLS[s[1]];
  return H.mc('Which of Bacon’s idols does this show? <i>' + s[0] + '</i>', right, Object.keys(IDOLS).filter(function (k) { return k !== s[1]; }).map(function (k) { return IDOLS[k]; }).slice(0, lv === 1 ? 2 : 3),
    ['This is one of the ' + right + '.']);
}
// a small table: instance -> [hot, bright, from the sky, fiery stuff, thin and airy, motion]
var INST = [['moonlight', 0, 1, 1, 0, 0, 0], ['boiling water', 1, 0, 0, 1, 0, 1], ['hands rubbed together', 1, 0, 0, 0, 0, 1], ['a glow-worm', 0, 1, 0, 0, 0, 0], ['a red-hot iron bar', 1, 1, 0, 1, 0, 1], ['air in a cool cellar', 0, 0, 0, 0, 1, 1], ['quicklime splashed with water', 1, 0, 0, 0, 0, 1], ['sunlight', 1, 1, 1, 1, 1, 1]];
var GUESS = [['heat is light', 2], ['heat is whatever comes from the sky', 3], ['heat is a fiery stuff', 4], ['heat belongs to thin, airy things', 5]];
function famExclude(R, lv) {
  var g = R.pick(GUESS), col = g[1];
  // an instance rules out the guess if it is hot but lacks the feature (table of presence), or has the feature but is not hot (table of absence)
  var kills = INST.filter(function (x) { return (x[1] && !x[col]) || (!x[1] && x[col]); }), keeps = INST.filter(function (x) { return kills.indexOf(x) < 0; });
  if (!kills.length || keeps.length < 2) return null;
  var k = R.pick(kills);
  return H.mc('Bacon tests the guess “' + g[0] + '”. Which instance <b>rules it out</b>?', k[0], R.sample(keeps.map(function (x) { return x[0]; }), Math.min(keeps.length, lv === 1 ? 2 : 3)),
    [k[0].charAt(0).toUpperCase() + k[0].slice(1) + (k[1] ? ' is hot but does not fit the guess (table of presence).' : ' fits the guess but is not hot (table of absence).'), 'One clear counterexample is enough to exclude a guess.']);
}
function famCount(R, lv) {
  var n = R.pick([10, 50, 100, 1000]), c = R.int(1, 3);
  return nm('A guess about heat fits ' + n + ' hot things, but ' + c + ' clear case' + (c > 1 ? 's go' : ' goes') + ' against it. In Bacon’s method of exclusion, how many clear counterexamples are needed to strike the guess out?', 1, '',
    ['One clear contrary case is enough, however many agree: that is the power of the negative instance.'], { chk: { f: 'same', a: 1 } });
}
function famTable(R, lv) {
  var x = R.pick(INST.slice(0, 7)), right = x[1] ? 'The table of presence (hot things)' : 'The table of absence (look-alikes that are not hot)';
  return H.mc('In Bacon’s study of heat, which table does <b>' + x[0] + '</b> belong in?', right, [x[1] ? 'The table of absence (look-alikes that are not hot)' : 'The table of presence (hot things)', 'The table of idols', 'The table of degrees only'].slice(0, lv === 1 ? 2 : 3),
    [x[0].charAt(0).toUpperCase() + x[0].slice(1) + (x[1] ? ' is hot.' : ' is not hot.')]);
}
H.T(ID, B, [famIdol, famIdol, famExclude, famTable, famCount, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.55);
