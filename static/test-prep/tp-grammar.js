/* Test Prep grammar: window.TestPrep.grammar (TPG). Grammar and punctuation questions with exactly one right choice, made
   from our own sentences. Used by /test-prep/grammar/ (static/test-prep/tp-app.js, data.kind 'verbal'); also loads in
   Node (module.exports) for the tests in /tmp/work_tp2/.

   Each rule's make(R) returns { before, after, right, wrong: [{ t, why }] x3, why } : the sentence is before + choice +
   after, `right` is the only correct choice, and each wrong choice breaks the rule in a way the `why` names. The banks are
   written so that no wrong choice is acceptable in standard written English: only rules that careful editors agree on
   (no "optional" commas, no style preferences, no usage that is still argued).

   TPG.RULES                 [{ key, domain, title, rule (HTML), example }]
   TPG.make(key, R, style)   → a problem { q, a: { t: 'mc', choices, v, keep: true }, steps, rule } in a test's style:
                               'sat'  a blank in the sentence and four choices ("Which choice completes the sentence...")
                               'act'  (also the CLT) a part of the sentence underlined; choice A is NO CHANGE
   TPG.build(n, seed, style, rule) → { items: [{ id: rule key, area: domain key, p }] } n questions, rules spread evenly
                               (only `rule` when given); R is MathLadder.rand, so seeds repeat exactly.
   TPG.check(p)              → '' when the problem is sound (four distinct choices, one right one), else what's wrong   */
(function (root, factory) {
  var G = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = G;
  if (root && root.document) { root.TestPrep = root.TestPrep || {}; root.TestPrep.grammar = G; }
})(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lastWord(s) { var i = s.lastIndexOf(' '); return [s.slice(0, i + 1), s.slice(i + 1)]; }
  function firstWord(s) { var i = s.indexOf(' '); return [s.slice(0, i), s.slice(i)]; }

  /* ---------------------------------------------------------------- sentence banks (all our own) */
  var INTRO = [
    ['When the rain stopped', 'the children ran outside to look for worms.'],
    ['After the bread had cooled', 'we sliced it and spread it with butter.'],
    ['Because the river was high', 'the ferry waited until noon.'],
    ['Although the trail was steep', 'the hikers reached the top before lunch.'],
    ['If the seeds are planted too deep', 'they may never reach the light.'],
    ['Before the concert began', 'the violinist tuned her strings one more time.'],
    ['While the soup simmered', 'Grandpa told the story of the great blizzard.'],
    ['As the sun went down', 'the swallows gathered over the barn.'],
    ['Once the paint was dry', 'Maria hung the sign above the door.'],
    ['Even though the map was old', 'it showed every road in the county.'],
    ['Whenever the wind blew from the north', 'the old windmill began to creak.'],
    ['Until the snow melted', 'the sheep stayed in the lower pasture.']
  ];
  var JOIN = { // two complete sentences that belong together; c: the second contrasts with the first, r: it is a result
    c: [['The trail was steep', 'the view from the top was worth every step.'],
      ['The recipe looked simple', 'the dough took three hours to rise.'],
      ['Most owls hunt at night', 'this one sat on the fence post at noon.'],
      ['The museum is small', 'its collection of old clocks is famous.'],
      ['Ben practiced the piece every day', 'the last page still gave him trouble.'],
      ['The storm was loud', 'the baby slept through the whole thing.']],
    r: [['The bridge was closed for repairs', 'the bus took the long way around the lake.'],
      ['The tomatoes ripened all at once', 'we spent Saturday making sauce.'],
      ['The ice on the pond was thin', 'nobody skated that week.'],
      ['Nora forgot her umbrella', 'she waited under the awning for the rain to stop.'],
      ['The old clock ran five minutes fast', 'Dad set it back every Sunday.'],
      ['The library stayed open later', 'more students came to study in the evening.']]
  };
  var SUBJ_VERB = [ // a long subject, then its verb and the rest
    ['The tall oak at the end of the lane', 'has stood there for more than a hundred years.'],
    ['Every student in the morning class', 'brought a sketch of a local bird.'],
    ['The quilt that my great-aunt sewed', 'hangs in the front hall.'],
    ['The letters she wrote from the ship', 'were saved in a cedar box.'],
    ['A small brown dog with one white ear', 'waited by the gate every afternoon.'],
    ['The first families in the valley', 'built their houses from fieldstone.'],
    ['Anyone who finishes the puzzle early', 'may help set the tables.'],
    ['The bread from the corner bakery', 'sells out by nine in the morning.'],
    ['Both of the old maps in the attic', 'show a road that no longer exists.'],
    ['The path that runs along the creek', 'floods after every heavy rain.']
  ];
  var AGREE = [ // subject (head noun and a phrase), s or p, the rest after the verb "is/are"
    ['The box of old letters', 's', 'on the top shelf of the hall closet.'],
    ['The jar of buttons', 's', 'next to the sewing machine.'],
    ['The map of the islands', 's', 'older than the house itself.'],
    ['The recipe for the oatmeal muffins', 's', 'taped inside the cupboard door.'],
    ['The key to the garden gates', 's', 'under the blue flowerpot.'],
    ['The sound of the church bells', 's', 'easy to hear from the hill.'],
    ['Each of the puzzles in the book', 's', 'harder than the one before it.'],
    ['The cost of the new tires', 's', 'higher than we expected.'],
    ['The painting of the three ships', 's', 'the oldest piece in the museum.'],
    ['The letters in the old box', 'p', 'from my great-grandmother.'],
    ['The trees along the river path', 'p', 'taller than the barn.'],
    ['The windows of the farmhouse', 'p', 'open to the spring air.'],
    ['The pages of the diary', 'p', 'yellow with age.'],
    ['The steps to the attic', 'p', 'steep and narrow.'],
    ['The students in the chess club', 'p', 'ready for the tournament.'],
    ['The tomatoes in the garden', 'p', 'almost ripe.'],
    ['The tools in the shed', 'p', 'clean and sharp.'],
    ['The questions on the quiz', 'p', 'about the water cycle.']
  ];
  var PRON = [ // a thing (or things) that owns something: its or their
    ['The old clock in the hall', 's', 'lost', 'minute hand.'],
    ['The oak by the porch', 's', 'dropped', 'leaves early this fall.'],
    ['The river', 's', 'overflowed', 'banks after the storm.'],
    ['The kite', 's', 'lost', 'tail in the wind.'],
    ['The old truck', 's', 'needed', 'brakes replaced.'],
    ['The bridge', 's', 'closed', 'west lane for repairs.'],
    ['The cabin', 's', 'kept', 'warmth through the cold night.'],
    ['The two clocks in the hall', 'p', 'lost', 'minute hands.'],
    ['The oaks by the porch', 'p', 'dropped', 'leaves early this fall.'],
    ['The rivers', 'p', 'overflowed', 'banks after the storm.'],
    ['The kites', 'p', 'lost', 'tails in the wind.'],
    ['The old trucks', 'p', 'needed', 'brakes replaced.'],
    ['Both bridges', 'p', 'closed', 'west lanes for repairs.'],
    ['The geese', 'p', 'left', 'nests in early June.']
  ];
  var CASE_OBJ = ['The coach handed the trophies to Lena and _.', 'Mr. Ortiz asked Sam and _ to carry the chairs.', 'The letter was addressed to Grandpa and _.',
    'Aunt June drove Theo and _ to the station.', 'The puppy followed Rosa and _ all the way home.', 'The librarian saved the new books for Ada and _.'];
  var CASE_SUBJ = ['Lena and _ painted the fence on Saturday.', 'Sam and _ carried the chairs to the hall.', 'Theo and _ caught the early train.',
    'Rosa and _ found the lost puppy by the creek.', 'Ada and _ read every book in the series.'];
  var PRONOUNS = { // subject form, object form, reflexive, possessive (standing alone)
    i: ['I', 'me', 'myself', 'mine'], he: ['he', 'him', 'himself', 'his'], she: ['she', 'her', 'herself', 'hers'], they: ['they', 'them', 'themselves', 'theirs'] };
  // verb forms: past, -s present, -ing, past participle
  var V = { visit: ['visited', 'visits', 'visiting', 'visited'], paint: ['painted', 'paints', 'painting', 'painted'], plant: ['planted', 'plants', 'planting', 'planted'],
    build: ['built', 'builds', 'building', 'built'], bake: ['baked', 'bakes', 'baking', 'baked'], feed: ['fed', 'feeds', 'feeding', 'fed'],
    flood: ['flooded', 'floods', 'flooding', 'flooded'], teach: ['taught', 'teaches', 'teaching', 'taught'], sweep: ['swept', 'sweeps', 'sweeping', 'swept'],
    repair: ['repaired', 'repairs', 'repairing', 'repaired'] };
  var TENSE = [ // 'past' or 'now' (something that happens again and again), time words, subject, verb, the rest, its second verb (which sets the tense)
    ['past', 'Last summer,', 'Ana', 'visit', 'her grandparents in Maine, and she learned to sail.', 'learned'],
    ['past', 'Yesterday,', 'Leo', 'paint', 'the fence, and his sister washed the brushes.', 'washed'],
    ['past', 'Last fall,', 'our class', 'plant', 'tulip bulbs, and we watered them every week.', 'watered'],
    ['past', 'Two years ago,', 'my uncle', 'build', 'a canoe, and he paddled it across the lake.', 'paddled'],
    ['past', 'On Saturday,', 'Grandma', 'bake', 'six loaves of bread, and we delivered them to the neighbors.', 'delivered'],
    ['past', 'Last week,', 'the plumber', 'repair', 'the leaky pipe, and the dripping finally stopped.', 'stopped'],
    ['now', 'Every morning,', 'Sam', 'feed', 'the hens, and then he eats breakfast.', 'eats'],
    ['now', 'Each spring,', 'the river', 'flood', 'the low meadow, and the geese return to it.', 'return'],
    ['now', 'Every Friday,', 'Mrs. Lee', 'teach', 'a pottery class, and her students take their pieces home.', 'take'],
    ['now', 'Most evenings,', 'Dad', 'sweep', 'the porch, and the cat watches him from the steps.', 'watches']
  ];
  var POSS = [ // singular noun, plural noun, the sentence for one owner and for several (_ is the blank)
    ['bird', 'birds', 'The _ nest was tucked into the hedge, and the bird returned to it every evening.', 'The three _ nests were tucked into the hedge, and the birds returned to them every evening.'],
    ['farmer', 'farmers', 'The _ field was full of pumpkins, and he sold them at the market.', 'The two _ fields were full of pumpkins, and they sold them at the market.'],
    ['student', 'students', 'The _ essay won first prize, and she read it aloud at the assembly.', 'The four _ essays won prizes, and they read them aloud at the assembly.'],
    ['neighbor', 'neighbors', 'Our _ garden is full of sunflowers, and he saves the seeds for the birds.', 'Our two _ gardens are full of sunflowers, and they save the seeds for the birds.'],
    ['sister', 'sisters', 'My _ bike has a basket, and she rides it to the library.', 'My two _ bikes have baskets, and they ride them to the library.'],
    ['dog', 'dogs', 'The _ bowl was empty, so the dog barked at the door.', 'The two _ bowls were empty, so the dogs barked at the door.'],
    ['teacher', 'teachers', 'The _ desk is by the window, and she keeps a fern on it.', 'The three _ desks are by the window, and they keep ferns on them.']
  ];
  var HOMO = [ // the sentence (_ is the blank), the right word, why, three wrong words with why
    ['_ going to rain before the game starts.', 'It\'s', 'This needs “it is”: “It is going to rain.” It\'s is short for it is.', [['Its', 'its shows ownership; this needs “it is.”'], ['Its\'', 'its\' is never a word.'], ['It', 'without “is,” the sentence has no verb.']]],
    ['The garden is lovely, but _ fence needs paint.', 'its', 'The fence belongs to the garden, so this needs the possessive its, with no apostrophe.', [['it\'s', 'it\'s means “it is”: “it is fence” makes no sense.'], ['its\'', 'its\' is never a word.'], ['it is', '“it is fence” makes no sense; the fence belongs to the garden.']]],
    ['The twins said _ bringing lemonade to the picnic.', 'they\'re', 'This needs “they are”: “the twins said they are bringing lemonade.” They\'re is short for they are.', [['their', 'their shows ownership; this needs “they are.”'], ['there', 'there names a place; this needs “they are.”'], ['they', 'without “are,” the verb is missing.']]],
    ['The Parkers left _ boots by the back door.', 'their', 'The boots belong to the Parkers, so this needs the possessive their.', [['they\'re', 'they\'re means “they are”: “they are boots” doesn\'t fit.'], ['there', 'there names a place; the boots belong to the Parkers.'], ['theirs', 'theirs stands alone (“the boots are theirs”); before a noun, use their.']]],
    ['Please stack the boxes over _ by the window.', 'there', 'This names a place, so it needs there.', [['their', 'their shows ownership; this names a place.'], ['they\'re', 'they\'re means “they are.”'], ['theirs', 'theirs shows ownership; this names a place.']]],
    ['Do you know _ coming to the meeting?', 'who\'s', 'This needs “who is”: “who is coming.” Who\'s is short for who is.', [['whose', 'whose shows ownership; this needs “who is.”'], ['whom', 'whom is an object; this needs “who is.”'], ['whos', 'whos is not a word; the apostrophe stands for the missing i.']]],
    ['The girl _ kite flew highest won a blue ribbon.', 'whose', 'The kite belongs to the girl, so this needs the possessive whose.', [['who\'s', 'who\'s means “who is”: “who is kite” makes no sense.'], ['who', 'the kite belongs to the girl, so it needs the possessive whose.'], ['whom', 'the kite belongs to the girl, so it needs the possessive whose.']]],
    ['Let me know when _ ready to leave.', 'you\'re', 'This needs “you are”: “when you are ready.” You\'re is short for you are.', [['your', 'your shows ownership; this needs “you are.”'], ['you', 'without “are,” the verb is missing.'], ['yours', 'yours shows ownership; this needs “you are.”']]],
    ['The cat licked _ paws in the sun.', 'its', 'The paws belong to the cat, so this needs the possessive its, with no apostrophe.', [['it\'s', 'it\'s means “it is”: “it is paws” makes no sense.'], ['its\'', 'its\' is never a word.'], ['their', 'their is plural, but the sentence is about one cat.']]],
    ['_ the tallest tree in the park.', 'It\'s', 'This needs “it is”: “It is the tallest tree.” It\'s is short for it is.', [['Its', 'its shows ownership; this needs “it is.”'], ['Its\'', 'its\' is never a word.'], ['It', 'without “is,” the sentence has no verb.']]],
    ['Don\'t forget _ library card on the way out.', 'your', 'The card belongs to you, so this needs the possessive your.', [['you\'re', 'you\'re means “you are”: “you are library card” makes no sense.'], ['yours', 'yours stands alone (“the card is yours”); before a noun, use your.'], ['you', 'the card belongs to you, so it needs your.']]]
  ];
  var PARALLEL = [ // before, after, the right item, wrong items (each breaks the pattern of the list), the pattern
    ['Over the weekend, we cleaned the barn, ', ', and stacked the hay.', 'painted the door', ['painting the door', 'to paint the door', 'the door was painted'], 'a past-tense verb'],
    ['At the fair, Jonah judged the pies, ', ', and won a ribbon for his honey.', 'rode the Ferris wheel', ['riding the Ferris wheel', 'to ride the Ferris wheel', 'the Ferris wheel was ridden'], 'a past-tense verb'],
    ['Maya enjoys hiking, ', ', and reading by the fire.', 'sketching birds', ['to sketch birds', 'she sketches birds', 'sketched birds'], 'an -ing word'],
    ['Good study habits include sleeping well, ', ', and taking short breaks.', 'reviewing notes daily', ['to review notes daily', 'you review notes daily', 'notes reviewed daily'], 'an -ing word'],
    ['The club hopes to read more poetry, ', ', and to write a short play.', 'to visit the museum', ['visiting the museum', 'a visit to the museum', 'the museum is visited'], 'a “to” phrase'],
    ['Before the trip, remember to pack a map, ', ', and to charge your phone.', 'to fill the water bottles', ['filling the water bottles', 'the water bottles filled', 'you fill the water bottles'], 'a “to” phrase'],
    ['Her grandmother taught her to knit, ', ', and to bake bread.', 'to sew', ['sewing', 'she sewed', 'sewn'], 'a “to” phrase'],
    ['After school, Lucy walks the dog, ', ', and starts her homework.', 'waters the plants', ['watering the plants', 'to water the plants', 'the plants are watered'], 'a present-tense verb'],
    ['On the camping trip, the scouts pitched tents, ', ', and told stories by the fire.', 'cooked dinner', ['cooking dinner', 'to cook dinner', 'dinner was cooked'], 'a past-tense verb']
  ];
  var MODIFIER = [ // an opening phrase, the subject it describes, the right main clause, wrong main clauses whose subject isn't that one
    ['Walking along the shore,', 'Mia', 'Mia found a smooth gray stone.', ['a smooth gray stone caught Mia\'s eye.', 'a smooth gray stone was found by Mia.', 'Mia\'s eye fell on a smooth gray stone.']],
    ['Tired after the long hike,', 'the scouts', 'the scouts set up camp early.', ['camp was set up early by the scouts.', 'the scouts\' camp went up early.', 'setting up camp early was the scouts\' plan.']],
    ['Having finished the puzzle,', 'Grandpa', 'Grandpa leaned back in his chair.', ['the chair creaked as Grandpa leaned back.', 'Grandpa\'s chair creaked as he leaned back.', 'leaning back in his chair was Grandpa\'s reward.']],
    ['Hoping to see the eclipse,', 'Ellie', 'Ellie climbed to the top of the hill.', ['the top of the hill was where Ellie climbed.', 'Ellie\'s climb took her to the top of the hill.', 'the hill was climbed by Ellie.']],
    ['Built in 1850,', 'the mill', 'the mill still grinds corn every fall.', ['the miller still grinds corn there every fall.', 'corn is still ground there every fall.', 'visitors still watch the mill grind corn every fall.']],
    ['Covered in mud,', 'the dog', 'the dog waited by the back door.', ['the back door was where the dog waited.', 'a bath was the first thing the dog needed.', 'the dog\'s paws left prints on the porch.']],
    ['Sitting by the fire,', 'Owen', 'Owen read the last chapter aloud.', ['the last chapter was read aloud by Owen.', 'Owen\'s voice filled the room as he read.', 'the room was quiet while Owen read.']],
    ['Startled by the thunder,', 'the horse', 'the horse bolted across the field.', ['the field was crossed by the bolting horse.', 'the horse\'s hooves pounded across the field.', 'thunder sent the horse bolting across the field.']],
    ['Painted bright yellow,', 'the old bus', 'the old bus carried the band to every game.', ['the band rode the old bus to every game.', 'every game was reached on the old bus.', 'the band\'s ride to every game was the old bus.']]
  ];

  /* ---------------------------------------------------------------- rules */
  function ret(before, after, right, wrong, why) { return { before: before, after: after, right: right, wrong: wrong, why: why }; }
  var RULES = [
    { key: 'intro', domain: 'boundaries', title: 'A comma after an opening clause',
      rule: 'A clause that starts with a word like <i>when</i>, <i>because</i>, <i>although</i> or <i>if</i> can\'t stand alone. When it comes first, a comma joins it to the main clause. A period, semicolon or colon there would cut it off.',
      example: 'When the rain stopped<b>,</b> the children ran outside.',
      make: function (R) {
        var x = R.pick(INTRO), a = lastWord(x[0]), b = firstWord(x[1]), lw = a[1], fw = b[0];
        var fwCap = cap(fw);
        return ret(a[0], b[1], lw + ', ' + fw, [
          { t: lw + '. ' + fwCap, why: 'a period leaves “' + x[0] + '” alone as a sentence, but it can\'t stand alone.' },
          { t: lw + '; ' + fw, why: 'a semicolon joins two complete sentences, and “' + x[0] + '” isn\'t one.' },
          { t: lw + ': ' + fw, why: 'a colon must follow a complete sentence, and “' + x[0] + '” isn\'t one.' }],
          '“' + x[0] + '” is an opening clause that can\'t stand alone, so a comma joins it to the main clause.');
      } },
    { key: 'join', domain: 'boundaries', title: 'Joining two sentences',
      rule: 'Two complete sentences can\'t be joined by a comma alone (a comma splice) or by nothing at all (a run-on). Join them with a comma and a word like <i>and</i>, <i>but</i> or <i>so</i>, or with a semicolon. A word like <i>however</i> or <i>therefore</i> doesn\'t join sentences: it needs a semicolon (or a period) before it and a comma after it.',
      example: 'The trail was steep<b>; however,</b> the view was worth it.',
      make: function (R) {
        var kind = R.pick(['c', 'r']), x = R.pick(JOIN[kind]), a = lastWord(x[0]), b = firstWord(x[1]), lw = a[1], fw = b[0];
        if (R.coin()) {
          var adv = kind === 'c' ? 'however' : 'therefore';
          return ret(a[0], b[1], lw + '; ' + adv + ', ' + fw, [
            { t: lw + ', ' + adv + ', ' + fw, why: '“' + adv + '” doesn\'t join sentences, so this is a comma splice: two sentences joined by commas alone.' },
            { t: lw + ' ' + adv + ', ' + fw, why: 'nothing separates the first sentence from the second: a run-on.' },
            { t: lw + ', ' + adv + ' ' + fw, why: 'a comma alone can\'t join two sentences, and “' + adv + '” needs a comma after it.' }],
            'Both parts are complete sentences. “' + cap(adv) + '” doesn\'t join them, so it takes a semicolon before it and a comma after it.');
        }
        var conj = kind === 'c' ? 'but' : 'so';
        return ret(a[0], b[1], lw + ', ' + conj + ' ' + fw, [
          { t: lw + ', ' + fw, why: 'a comma alone can\'t join two complete sentences (a comma splice).' },
          { t: lw + ' ' + fw, why: 'two complete sentences run together with nothing between them (a run-on).' },
          { t: lw + ' ' + conj + ', ' + fw, why: 'the comma belongs before “' + conj + ',” not after it.' }],
          'Both parts are complete sentences, joined by a comma and “' + conj + '.”');
      } },
    { key: 'nocomma', domain: 'boundaries', title: 'No comma between a subject and its verb',
      rule: 'However long the subject is, no comma, semicolon or colon goes between it and its verb.',
      example: 'The tall oak at the end of the lane <b>has</b> stood there for a century.',
      make: function (R) {
        var x = R.pick(SUBJ_VERB), a = lastWord(x[0]), b = firstWord(x[1]), lw = a[1], fw = b[0];
        return ret(a[0], b[1], lw + ' ' + fw, [
          { t: lw + ', ' + fw, why: 'a single comma can\'t separate the subject from its verb.' },
          { t: lw + '; ' + fw, why: 'a semicolon joins two complete sentences, and “' + x[0] + '” isn\'t one.' },
          { t: lw + ': ' + fw, why: 'a colon must follow a complete sentence, and “' + x[0] + '” is only the subject.' }],
          '“' + x[0] + '” is the subject and “' + fw + '” is its verb. Nothing goes between them.');
      } },
    { key: 'agree', domain: 'form', title: 'Subject and verb agree',
      rule: 'The verb agrees with its subject, not with a noun in a phrase that comes between them. In “the box of letters,” the subject is <i>box</i>, so the verb is <i>is</i>. <i>Each</i> takes a singular verb.',
      example: 'The box of old letters <b>is</b> on the top shelf.',
      make: function (R) {
        var x = R.pick(AGREE), sing = x[1] === 's', words = x[0].split(' '), head = /^Each/.test(x[0]) ? 'each' : words[1];
        var right = sing ? 'is' : 'are', wrong = sing ? ['are', 'were', 'have been'] : ['is', 'was', 'has been'];
        return ret(x[0] + ' ', ' ' + x[2], right, wrong.map(function (w) { return { t: w, why: '“' + w + '” is ' + (sing ? 'plural' : 'singular') + ', but the subject, “' + head + ',” is ' + (sing ? 'singular' : 'plural') + '.' }; }),
          'The subject is “' + head + ',” which is ' + (sing ? 'singular' : 'plural') + ', so the verb is “' + right + '.” The noun in the phrase after it doesn\'t change that.');
      } },
    { key: 'pronoun', domain: 'form', title: 'Its or their',
      rule: 'A pronoun agrees with the noun it stands for. One thing takes <i>its</i>; more than one take <i>their</i>. <i>It\'s</i> and <i>they\'re</i> are short for “it is” and “they are.”',
      example: 'The old clock lost <b>its</b> minute hand.',
      make: function (R) {
        var x = R.pick(PRON), sing = x[1] === 's';
        var right = sing ? 'its' : 'their';
        var wrong = sing ? [{ t: 'it\'s', why: '“it\'s” means “it is.”' }, { t: 'their', why: '“their” is plural, but “' + x[0].toLowerCase().replace(/^the /, '') + '” is one thing.' }, { t: 'they\'re', why: '“they\'re” means “they are.”' }]
          : [{ t: 'its', why: '“its” is singular, but “' + x[0].toLowerCase().replace(/^(the|both) /, '') + '” are more than one.' }, { t: 'there', why: '“there” names a place.' }, { t: 'they\'re', why: '“they\'re” means “they are.”' }];
        return ret(x[0] + ' ' + x[2] + ' ', ' ' + x[3], right, wrong,
          '“' + x[0] + '” ' + (sing ? 'is one thing, so it takes “its.”' : 'are more than one, so they take “their.”'));
      } },
    { key: 'case', domain: 'form', title: 'I or me, he or him',
      rule: 'Use <i>I, he, she, they</i> as the subject (who does the action) and <i>me, him, her, them</i> as the object (after a verb or a word like <i>to</i>). To check, drop the other name: “Lena and I painted” becomes “I painted.” Words like <i>myself</i> need an earlier <i>I</i> in the sentence.',
      example: 'The coach handed the trophies to Lena and <b>me</b>.',
      make: function (R) {
        var subj = R.coin(), frame = R.pick(subj ? CASE_SUBJ : CASE_OBJ), pk = R.pick(['i', 'i', 'he', 'she']), P = PRONOUNS[pk];
        var right = subj ? P[0] : P[1], parts = frame.split('_'), name = /(\S+) and _/.exec(frame)[1];
        var tests = subj ? cap(P[0]) + ' ' + frame.split('_ ')[1].replace(/\.$/, '') : frame.replace(name + ' and _', P[1]).replace(/\.$/, '');
        var wrong = [subj ? P[1] : P[0], P[2], P[3]].map(function (w, i) {
          return { t: w, why: i === 0 ? (subj ? '“' + w + '” is an object form, but here the pronoun is part of the subject.' : '“' + w + '” is a subject form, but here the pronoun is an object: it comes after the verb or a word like “to.”') : i === 1 ? '“' + w + '” needs an earlier “' + P[0] + '” in the sentence to point back to.' : '“' + w + '” means “belonging to ' + P[1] + ',” which doesn\'t fit.' };
        });
        return ret(parts[0], parts[1], right, wrong, 'Drop the other name and the pronoun has to stand alone: “' + tests + '.”');
      } },
    { key: 'tense', domain: 'form', title: 'Keeping verb tenses steady',
      rule: 'Verbs that describe the same time stay in the same tense. Time words like <i>last summer</i> or <i>every morning</i>, and the other verbs in the sentence, show which tense fits.',
      example: 'Last summer, Ana <b>visited</b> her grandparents, and she learned to sail.',
      make: function (R) {
        var x = R.pick(TENSE), f = V[x[3]], past = x[0] === 'past';
        var right = past ? f[0] : f[1];
        var wrong = past ? [{ t: f[1], why: '“' + f[1] + '” is present tense, but this happened in the past.' }, { t: 'will ' + x[3], why: '“will ' + x[3] + '” is future tense, but this happened in the past.' }, { t: 'is ' + f[2], why: '“is ' + f[2] + '” is happening now, but this happened in the past.' }]
          : [{ t: f[0], why: '“' + f[0] + '” is past tense, but this happens again and again now.' }, { t: 'will ' + x[3], why: '“will ' + x[3] + '” is future tense, but this happens again and again now.' }, { t: 'had ' + f[3], why: '“had ' + f[3] + '” is the past before the past, but this happens again and again now.' }];
        return ret(x[1] + ' ' + x[2] + ' ', ' ' + x[4], right, wrong,
          '“' + x[1].replace(/,$/, '') + '” and the other verb, “' + x[5] + ',” show ' + (past ? 'the past, so the verb is past tense: “' + right + '.”' : 'something that happens again and again, so the verb is present tense: “' + right + '.”'));
      } },
    { key: 'poss', domain: 'form', title: 'Possessive nouns',
      rule: 'To show that something belongs to one owner, add <i>\'s</i> (the bird\'s nest). For more than one owner whose plural ends in <i>s</i>, add only an apostrophe (the birds\' nests). A plain plural (birds) shows no ownership.',
      example: 'The three <b>birds\'</b> nests were tucked into the hedge.',
      make: function (R) {
        var x = R.pick(POSS), one = R.coin(), s = x[0], p = x[1], frame = one ? x[2] : x[3], parts = frame.split('_');
        var right = one ? s + '\'s' : p + '\'';
        var wrong = one ? [{ t: p + '\'', why: '“' + p + '\'” means several ' + p + ', but the sentence is about one ' + s + '.' }, { t: p, why: '“' + p + '” is a plain plural; it shows no ownership.' }, { t: p + '\'s', why: '“' + p + '\'s” is never right: a plural ending in s takes only an apostrophe.' }]
          : [{ t: s + '\'s', why: '“' + s + '\'s” means one ' + s + ', but the sentence is about several.' }, { t: p, why: '“' + p + '” is a plain plural; it shows no ownership.' }, { t: p + '\'s', why: '“' + p + '\'s” is never right: a plural ending in s takes only an apostrophe.' }];
        return ret(parts[0], parts[1], right, wrong, one ? 'One ' + s + ' owns it, so add \'s: “' + right + '.”' : 'Several ' + p + ' own them, and the plural ends in s, so add only an apostrophe: “' + right + '.”');
      } },
    { key: 'homo', domain: 'form', title: 'It\'s or its, they\'re or their',
      rule: 'An apostrophe in a pronoun marks missing letters: <i>it\'s</i> = it is, <i>they\'re</i> = they are, <i>who\'s</i> = who is, <i>you\'re</i> = you are. The words that show ownership have no apostrophe: <i>its, their, whose, your</i>. <i>There</i> names a place.',
      example: 'The garden is lovely, but <b>its</b> fence needs paint.',
      make: function (R) {
        var x = R.pick(HOMO), parts = x[0].split('_');
        return ret(parts[0], parts[1], x[1], x[3].map(function (w) { return { t: w[0], why: w[1] }; }), x[2]);
      } },
    { key: 'parallel', domain: 'structure', title: 'Lists that match',
      rule: 'Items in a list take the same form: all <i>-ing</i> words, all past-tense verbs, or all <i>to</i> phrases.',
      example: 'We cleaned the barn, <b>painted</b> the door, and stacked the hay.',
      make: function (R) {
        var x = R.pick(PARALLEL), form = x[4];
        return ret(x[0], x[1], x[2], x[3].map(function (w) { return { t: w, why: 'it doesn\'t match the other items in the list, which each start with ' + form + '.' }; }),
          'The other items in the list each start with ' + form + ', so this one does too: “' + x[2] + '.”');
      } },
    { key: 'modifier', domain: 'structure', title: 'Opening phrases that fit',
      rule: 'An opening phrase like “Walking along the shore,” describes the subject that comes right after the comma. If the wrong subject comes next, the sentence says something odd: that a stone was walking.',
      example: 'Walking along the shore, <b>Mia</b> found a smooth gray stone.',
      make: function (R) {
        var x = R.pick(MODIFIER), who = x[1];
        return ret(x[0] + ' ', '', x[2], x[3].map(function (w) {
          var subj = w.replace(/^(.+?) (was|were|is|caught|went|fell|creaked|took|still|left|found|led|filled|pounded|sent|rode)\b.*$/, '$1').replace(/\.$/, '');
          return { t: w, why: 'the subject right after the comma is “' + subj + ',” but the opening phrase describes ' + who + '.' };
        }), 'The opening phrase describes ' + who + ', so ' + who + ' must come right after the comma.');
      } }
  ];
  var BY = {}; RULES.forEach(function (r) { BY[r.key] = r; });
  var DOMAINS = [{ key: 'boundaries', title: 'Sentence boundaries' }, { key: 'form', title: 'Agreement and form' }, { key: 'structure', title: 'Sentence structure' }];

  /* ---------------------------------------------------------------- problems */
  function text(s) { return esc(s); }
  function make(key, R, style) {
    var rule = BY[key], x = rule.make(R), opts = [x.right].concat(x.wrong.map(function (w) { return w.t; }));
    var whyOf = {}; x.wrong.forEach(function (w) { whyOf[w.t] = w.why; });
    var full = x.before + x.right + x.after, q, choices, v, shown = null;
    if (style === 'act') {
      shown = R.pick(opts);
      var others = opts.filter(function (o) { return o !== shown; });
      if (key !== 'modifier') others = R.shuffle(others);
      q = '<p class="tp-gq">' + text(x.before) + '<u class="tp-gu">' + text(shown) + '</u>' + text(x.after) + '</p><p class="tp-gask">Which choice is best for the underlined part? If it\'s already right, choose NO CHANGE.</p>';
      choices = ['NO CHANGE'].concat(others.map(text));
      v = shown === x.right ? 0 : 1 + others.indexOf(x.right);
    } else {
      var order = R.shuffle(opts);
      q = '<p class="tp-gq">' + text(x.before) + '<span class="tp-blank"><span class="tp-sr">blank</span></span>' + text(x.after) + '</p><p class="tp-gask">Which choice completes the sentence correctly?</p>';
      choices = order.map(text); v = order.indexOf(x.right);
    }
    var steps = ['<b>The rule:</b> ' + rule.rule, '<b>Here:</b> ' + text(x.why), '<b>Right:</b> “' + text(full) + '”'];
    var notes = x.wrong.map(function (w) { return '<b>' + text(w.t) + '</b>: ' + text(w.why); });
    steps.push('<b>Why not the others?</b> ' + notes.join(' '));
    if (style === 'act' && shown === x.right) steps.splice(2, 0, 'The underlined part was already right, so the answer is NO CHANGE.');
    return { q: q, a: { t: 'mc', choices: choices, v: v, keep: true }, steps: steps, rule: key, full: full, opts: opts };
  }
  function build(n, seed, style, only) {
    var R = (W.MathLadder && W.MathLadder.rand) ? W.MathLadder.rand('tpg:' + style + ':' + seed) : null;
    if (!R) throw new Error('TestPrep.grammar needs MathLadder.rand');
    var keys = only ? [only] : RULES.map(function (r) { return r.key; }), deck = [], items = [], seen = {};
    for (var i = 0; i < n; i++) {
      if (!deck.length) deck = R.shuffle(keys);
      var k = deck.pop(), p = null;
      for (var t = 0; t < 12; t++) { var c = make(k, R, style); if (!seen[c.full + c.a.v]) { p = c; break; } }
      if (!p) p = make(k, R, style);
      seen[p.full + p.a.v] = 1;
      items.push({ id: k, area: BY[k].domain, p: p });
    }
    return { items: items };
  }
  function check(p) {
    var c = p.a.choices, bad = [];
    if (c.length !== 4) bad.push(c.length + ' choices');
    if (new Set(c).size !== c.length) bad.push('repeated choice');
    if (!(p.a.v >= 0 && p.a.v < c.length)) bad.push('bad answer index');
    if (new Set(p.opts).size !== 4) bad.push('repeated option');
    return bad.join('; ');
  }
  return { RULES: RULES, DOMAINS: DOMAINS, make: make, build: build, check: check, _byKey: BY };
});
