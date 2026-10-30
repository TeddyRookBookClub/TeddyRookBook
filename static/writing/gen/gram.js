/* Grammar (Writing & Grammar Ladder, course key gram): problem generators for all 44 topics.
   Source parts: /tmp/work_gram/gen/*.js, joined by /tmp/work_gram/build_gen.sh into static/writing/gen/gram.js.
   Conventions: /tmp/work_writing/overview.md. Answers are choices (mc; an array v for "choose all that apply").
   Most sentences come from a small composer (compose() below) that builds the words, their parts of speech, their jobs
   in the sentence and the Reed–Kellogg diagram spec from the same pieces, so the question, the picture and the answer
   agree. Hand-written banks (clauses, verbals, hard-to-find subjects) carry their own spec; /tmp/work_gram/test_gen.js
   checks every bank and composed sentence: the diagram's words are exactly the sentence's words.
   Level 1: one plain case, three choices. Level 2: distractors from the topic's trouble note. Level 3: a harder shape
   (select all, two sentences side by side, a choice of diagrams, a word that changes its job). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function D() { return ML.writing.dg; }

  /* ---------------------------------------------------------------- small helpers */
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function P(s) { return '<p>' + s + '</p>'; }
  function Q() { return Array.prototype.slice.call(arguments).filter(Boolean).join(''); }
  function S(html) { return '<p class="wr-big">' + html + '</p>'; } // the sentence to judge
  function U(w) { return '<u>' + w + '</u>'; }
  function I(w) { return '<i>' + w + '</i>'; }
  function qt(s) { return '“' + s + '”'; }
  // one right answer first, then distinct wrong ones (at most n - 1 of them); makeProblem shuffles
  function mc(right, wrongs, n) {
    var w = [];
    wrongs.forEach(function (x) { if (x != null && x !== right && w.indexOf(x) < 0) w.push(x); });
    if (n) w = w.slice(0, n - 1);
    return { t: 'mc', choices: [right].concat(w), v: 0 };
  }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  // choose all that apply: items [{ text, ok }]
  function mcAll(items) {
    var ch = [], v = [];
    items.forEach(function (it) { if (ch.indexOf(it.text) >= 0) return; if (it.ok) v.push(ch.length); ch.push(it.text); });
    return { t: 'mc', choices: ch, v: v };
  }
  var POSN = { n: 'noun', pro: 'pronoun', v: 'verb', adj: 'adjective', adv: 'adverb', prep: 'preposition', conj: 'conjunction', int: 'interjection' };
  var POS8 = ['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'];
  function an(w) { return /^[aeiou]/i.test(w) && !/^(uni|use|one|eu)/i.test(w) ? 'an' : 'a'; }
  function tagViz(words) { return { name: 'wr-tag', opts: { text: words.join(' '), quiet: true, interactive: false } }; }
  function sentViz(words) { return { name: 'wr-sentence', opts: { text: words.join(' '), quiet: true, numbers: true, interactive: false } }; }
  function dgViz(spec, text, o) { var opts = { spec: spec, text: text, quiet: true, interactive: false }; for (var k in (o || {})) opts[k] = o[k]; return { name: 'wr-diagram', opts: opts }; }

  /* ---------------------------------------------------------------- the composer
     A sentence is a list of tokens { w, pos, role, part, grp } in reading order:
       pos  n pro v adj adv prep conj int ('' for none)    role  s v do io pn pa oc (the word's job) or ''
       part 's' (complete subject) or 'p' (complete predicate)    grp a phrase key ('sp' subject's phrase, 'vp' verb's phrase …)
     plus the diagram spec built from the same pieces. Verbs carry their forms: [base, past, participle, -ing, s-form]. */
  var VF = {
    bark: ['bark', 'barked', 'barked', 'barking', 'barks'], sleep: ['sleep', 'slept', 'slept', 'sleeping', 'sleeps'],
    laugh: ['laugh', 'laughed', 'laughed', 'laughing', 'laughs'], wait: ['wait', 'waited', 'waited', 'waiting', 'waits'],
    smile: ['smile', 'smiled', 'smiled', 'smiling', 'smiles'], cheer: ['cheer', 'cheered', 'cheered', 'cheering', 'cheers'],
    yawn: ['yawn', 'yawned', 'yawned', 'yawning', 'yawns'], dance: ['dance', 'danced', 'danced', 'dancing', 'dances'],
    sing: ['sing', 'sang', 'sung', 'singing', 'sings'], swim: ['swim', 'swam', 'swum', 'swimming', 'swims'],
    run: ['run', 'ran', 'run', 'running', 'runs'], jump: ['jump', 'jumped', 'jumped', 'jumping', 'jumps'],
    purr: ['purr', 'purred', 'purred', 'purring', 'purrs'], quack: ['quack', 'quacked', 'quacked', 'quacking', 'quacks'],
    gallop: ['gallop', 'galloped', 'galloped', 'galloping', 'gallops'], whisper: ['whisper', 'whispered', 'whispered', 'whispering', 'whispers'],
    rest: ['rest', 'rested', 'rested', 'resting', 'rests'], kick: ['kick', 'kicked', 'kicked', 'kicking', 'kicks'],
    paint: ['paint', 'painted', 'painted', 'painting', 'paints'], bake: ['bake', 'baked', 'baked', 'baking', 'bakes'],
    read: ['read', 'read', 'read', 'reading', 'reads'], wash: ['wash', 'washed', 'washed', 'washing', 'washes'],
    fix: ['fix', 'fixed', 'fixed', 'fixing', 'fixes'], plant: ['plant', 'planted', 'planted', 'planting', 'plants'],
    carry: ['carry', 'carried', 'carried', 'carrying', 'carries'], build: ['build', 'built', 'built', 'building', 'builds'],
    find: ['find', 'found', 'found', 'finding', 'finds'], open: ['open', 'opened', 'opened', 'opening', 'opens'],
    chase: ['chase', 'chased', 'chased', 'chasing', 'chases'], pack: ['pack', 'packed', 'packed', 'packing', 'packs'],
    clean: ['clean', 'cleaned', 'cleaned', 'cleaning', 'cleans'], give: ['give', 'gave', 'given', 'giving', 'gives'],
    hand: ['hand', 'handed', 'handed', 'handing', 'hands'], send: ['send', 'sent', 'sent', 'sending', 'sends'],
    show: ['show', 'showed', 'shown', 'showing', 'shows'], tell: ['tell', 'told', 'told', 'telling', 'tells'],
    write: ['write', 'wrote', 'written', 'writing', 'writes'], make: ['make', 'made', 'made', 'making', 'makes'],
    buy: ['buy', 'bought', 'bought', 'buying', 'buys'], throw: ['throw', 'threw', 'thrown', 'throwing', 'throws'],
    lend: ['lend', 'lent', 'lent', 'lending', 'lends'], be: ['be', 'was', 'been', 'being', 'is'],
    become: ['become', 'became', 'become', 'becoming', 'becomes'], seem: ['seem', 'seemed', 'seemed', 'seeming', 'seems'],
    feel: ['feel', 'felt', 'felt', 'feeling', 'feels'], look: ['look', 'looked', 'looked', 'looking', 'looks'],
    smell: ['smell', 'smelled', 'smelled', 'smelling', 'smells'], taste: ['taste', 'tasted', 'tasted', 'tasting', 'tastes'],
    sound: ['sound', 'sounded', 'sounded', 'sounding', 'sounds'], grow: ['grow', 'grew', 'grown', 'growing', 'grows'],
    name: ['name', 'named', 'named', 'naming', 'names'], elect: ['elect', 'elected', 'elected', 'electing', 'elects'],
    call: ['call', 'called', 'called', 'calling', 'calls'], keep: ['keep', 'kept', 'kept', 'keeping', 'keeps'],
    choose: ['choose', 'chose', 'chosen', 'choosing', 'chooses'], climb: ['climb', 'climbed', 'climbed', 'climbing', 'climbs'],
    play: ['play', 'played', 'played', 'playing', 'plays'], finish: ['finish', 'finished', 'finished', 'finishing', 'finishes'],
    cook: ['cook', 'cooked', 'cooked', 'cooking', 'cooks'], draw: ['draw', 'drew', 'drawn', 'drawing', 'draws'],
    win: ['win', 'won', 'won', 'winning', 'wins'], practice: ['practice', 'practiced', 'practiced', 'practicing', 'practices']
  };
  // verb phrases by tense: [helping words…, main word]
  function vphrase(v, tense, plural, isI) {
    var f = VF[v];
    if (isI) { // I: was, am, have, I walk
      if (tense === 'past' && v === 'be') return ['was'];
      if (tense === 'present' && v === 'be') return ['am'];
      if (tense === 'past-prog') return ['was', f[3]];
      if (tense === 'pres-prog') return ['am', f[3]];
      plural = true;
    }
    if (v === 'be') {
      if (tense === 'present') return [plural ? 'are' : 'is'];
      if (tense === 'past') return [plural ? 'were' : 'was'];
    }
    switch (tense) {
      case 'present': return [plural ? f[0] : f[4]];
      case 'future': return ['will', f[0]];
      case 'past-prog': return [plural ? 'were' : 'was', f[3]];
      case 'pres-prog': return [plural ? 'are' : 'is', f[3]];
      case 'pres-perf': return [plural ? 'have' : 'has', f[2]];
      case 'past-perf': return ['had', f[2]];
      case 'pp-prog': return [plural ? 'have' : 'has', 'been', f[3]];
      case 'modal': return [['can', 'should', 'might', 'must', 'could', 'would'][f[0].length % 6], f[0]];
      case 'modal-perf': return [['should', 'might', 'must', 'could'][f[0].length % 4], 'have', f[2]];
      default: return [f[1]];
    }
  }
  var NAMES = ['Ana', 'Leo', 'Mia', 'Sam', 'Nora', 'Omar', 'Ruby', 'Theo', 'Jada', 'Eli', 'Rosa', 'Ben'];
  // subjects: people and animals with fitting adjectives and adjective phrases
  var PEOPLE = [
    { n: 'girl', adj: ['young', 'tall', 'happy', 'tired'], pp: [['with', 'kite', ['the', 'red']], ['in', 'coat', ['the', 'blue']]] },
    { n: 'boy', adj: ['young', 'tall', 'happy', 'tired'], pp: [['with', 'scarf', ['the', 'long']], ['in', 'hat', ['the', 'green']]] },
    { n: 'teacher', adj: ['new', 'kind', 'busy'], pp: [['from', 'school', ['the', 'old']], ['with', 'glasses', ['the', 'round']]] },
    { n: 'coach', adj: ['new', 'busy', 'patient'], pp: [['of', 'team', ['the']], ['with', 'whistle', ['the', 'silver']]] },
    { n: 'farmer', adj: ['old', 'busy', 'friendly'], pp: [['with', 'hat', ['the', 'straw']], ['from', 'farm', ['the', 'big']]] },
    { n: 'baker', adj: ['busy', 'cheerful', 'new'], pp: [['on', 'corner', ['the']], ['with', 'apron', ['the', 'white']]] },
    { n: 'pilot', adj: ['young', 'calm', 'careful'], pp: [['in', 'jacket', ['the', 'brown']]] },
    { n: 'neighbor', adj: ['friendly', 'old', 'new'], pp: [['across', 'street', ['the']], ['with', 'dog', ['the', 'spotted']]] }
  ];
  var ANIMALS = [
    { n: 'dog', adj: ['small', 'brown', 'sleepy', 'happy'], pp: [['with', 'tail', ['the', 'fluffy']], ['on', 'porch', ['the']]], intr: ['bark', 'sleep', 'run', 'jump'], tr: { chase: ['ball', 'squirrel', 'cat'], find: ['bone', 'ball'] } },
    { n: 'puppy', adj: ['little', 'brown', 'playful'], pp: [['with', 'ears', ['the', 'floppy']], ['in', 'basket', ['the']]], intr: ['bark', 'sleep', 'yawn', 'jump'], tr: { chase: ['ball', 'butterfly'], find: ['sock', 'bone'] } },
    { n: 'cat', adj: ['gray', 'sleepy', 'old', 'curious'], pp: [['on', 'windowsill', ['the']], ['with', 'stripes', ['the', 'orange']]], intr: ['purr', 'sleep', 'yawn', 'jump'], tr: { chase: ['mouse', 'string'] } },
    { n: 'horse', adj: ['black', 'old', 'strong'], pp: [['in', 'barn', ['the']], ['with', 'mane', ['the', 'long']]], intr: ['gallop', 'rest', 'run'], tr: {} },
    { n: 'duck', adj: ['white', 'little', 'noisy'], pp: [['on', 'pond', ['the']], ['with', 'ducklings', ['the', 'six']]], intr: ['quack', 'swim', 'sleep'], tr: {} }
  ];
  // things a person can act on: object noun -> fitting adjectives
  var OBJ = {
    ball: ['red', 'new', 'old'], fence: ['old', 'wooden', 'long'], boat: ['small', 'wooden', 'old'], picture: ['bright', 'large'], door: ['front', 'heavy'],
    bread: ['warm', 'fresh'], pie: ['apple', 'warm'], muffins: ['warm', 'blueberry'], book: ['thick', 'new', 'old'], letter: ['long', 'short'],
    map: ['old', 'large'], poem: ['short', 'funny'], dishes: ['dirty', 'heavy'], car: ['old', 'blue', 'dusty'], bike: ['old', 'red', 'broken'],
    clock: ['old', 'broken'], lamp: ['broken', 'old'], tree: ['young', 'small'], tulips: ['red', 'yellow'], basket: ['heavy', 'big'],
    box: ['heavy', 'big'], fort: ['big', 'snow'], birdhouse: ['small', 'wooden'], key: ['lost', 'small'], shell: ['pink', 'tiny'],
    window: ['dusty', 'open'], gift: ['small', 'surprise'], lunch: ['big', 'warm'], room: ['messy', 'small'], kitchen: ['messy', 'small'],
    squirrel: ['gray', 'quick'], mouse: ['tiny', 'gray'], string: ['long', 'red'], bone: ['old', 'big'], sock: ['striped', 'old'],
    butterfly: ['yellow', 'tiny'], cat: ['gray', 'old'], song: ['new', 'sad', 'happy'], story: ['funny', 'long', 'scary'],
    note: ['short', 'kind'], card: ['funny', 'birthday'], ticket: ['extra', 'free'], kite: ['new', 'red'], sandwich: ['big', 'cheese'],
    umbrella: ['spare', 'blue'], pencil: ['sharp', 'spare'], cake: ['chocolate', 'big'], joke: ['silly', 'funny'], postcard: ['bright', 'old'],
    package: ['heavy', 'small'], drawing: ['funny', 'new'], game: ['long', 'close'], race: ['long', 'last'], piano: ['old'], soup: ['hot', 'thick']
  };
  // adjectives that are really nouns used as modifiers (apple pie, snow fort) are kept out of POS questions
  var NOUNISH = { apple: 1, blueberry: 1, snow: 1, birthday: 1, cheese: 1, chocolate: 1, front: 1, surprise: 1, straw: 1, extra: 0 };
  var TRANS = { // person verbs and their objects; adv: adverbs that fit; place: prepositional phrases of place that fit
    kick: { o: ['ball'], adv: ['hard', 'far', 'again'], place: [['across', 'field', ['the']], ['over', 'fence', ['the']]] },
    paint: { o: ['fence', 'boat', 'picture', 'door'], adv: ['carefully', 'slowly', 'again'], place: [['in', 'yard', ['the']], ['after', 'lunch', []]] },
    bake: { o: ['bread', 'pie', 'muffins'], adv: ['early', 'carefully', 'today'], place: [['in', 'kitchen', ['the']], ['before', 'dinner', []]] },
    read: { o: ['book', 'letter', 'map', 'poem'], adv: ['quietly', 'slowly', 'aloud'], place: [['on', 'bus', ['the']], ['under', 'tree', ['the', 'old']]] },
    wash: { o: ['dishes', 'car', 'window'], adv: ['carefully', 'quickly', 'today'], place: [['after', 'dinner', []], ['in', 'driveway', ['the']]] },
    fix: { o: ['bike', 'clock', 'lamp'], adv: ['quickly', 'carefully', 'yesterday'], place: [['in', 'garage', ['the']], ['with', 'wrench', ['a']]] },
    plant: { o: ['tree', 'tulips'], adv: ['carefully', 'yesterday', 'early'], place: [['in', 'garden', ['the']], ['near', 'fence', ['the']]] },
    carry: { o: ['basket', 'box'], adv: ['carefully', 'slowly', 'upstairs'], place: [['to', 'car', ['the']], ['across', 'street', ['the']]] },
    build: { o: ['fort', 'birdhouse'], adv: ['quickly', 'carefully', 'yesterday'], place: [['in', 'yard', ['the']], ['after', 'school', []]] },
    find: { o: ['key', 'shell', 'ball'], adv: ['finally', 'quickly', 'yesterday'], place: [['under', 'couch', ['the']], ['on', 'beach', ['the']]] },
    open: { o: ['window', 'gift', 'door'], adv: ['slowly', 'carefully', 'quickly'], place: [['after', 'dinner', []], ['with', 'care', []]] },
    pack: { o: ['lunch', 'basket'], adv: ['early', 'quickly', 'carefully'], place: [['before', 'school', []], ['in', 'kitchen', ['the']]] },
    clean: { o: ['room', 'kitchen'], adv: ['quickly', 'carefully', 'today'], place: [['after', 'breakfast', []], ['before', 'dinner', []]] },
    sing: { o: ['song'], adv: ['softly', 'loudly', 'again'], place: [['at', 'concert', ['the']], ['in', 'hall', ['the']]] },
    tell: { o: ['story', 'joke'], adv: ['slowly', 'again', 'quietly'], place: [['at', 'dinner', []], ['by', 'campfire', ['the']]] },
    draw: { o: ['picture', 'map'], adv: ['carefully', 'quickly', 'neatly'], place: [['in', 'class', []], ['on', 'board', ['the']]] },
    win: { o: ['race', 'game'], adv: ['easily', 'again', 'yesterday'], place: [['at', 'park', ['the']], ['on', 'Saturday', []]] }
  };
  var INTR_P = { // person verbs without an object
    laugh: { adv: ['loudly', 'softly', 'happily'], place: [['at', 'joke', ['the']], ['during', 'movie', ['the']]] },
    wait: { adv: ['patiently', 'quietly', 'outside'], place: [['by', 'door', ['the']], ['for', 'bus', ['the']]] },
    smile: { adv: ['warmly', 'brightly', 'shyly'], place: [['at', 'baby', ['the']], ['in', 'photo', ['the']]] },
    cheer: { adv: ['loudly', 'wildly', 'happily'], place: [['at', 'game', ['the']], ['for', 'team', ['the']]] },
    yawn: { adv: ['sleepily', 'loudly', 'twice'], place: [['during', 'movie', ['the']], ['in', 'car', ['the']]] },
    dance: { adv: ['happily', 'gracefully', 'wildly'], place: [['in', 'kitchen', ['the']], ['at', 'party', ['the']]] },
    sing: { adv: ['softly', 'loudly', 'sweetly'], place: [['in', 'shower', ['the']], ['at', 'concert', ['the']]] },
    swim: { adv: ['quickly', 'slowly', 'daily'], place: [['in', 'lake', ['the']], ['across', 'pool', ['the']]] },
    run: { adv: ['quickly', 'fast', 'daily'], place: [['to', 'park', ['the']], ['around', 'track', ['the']]] },
    whisper: { adv: ['softly', 'quietly', 'nervously'], place: [['in', 'library', ['the']], ['during', 'test', ['the']]] },
    rest: { adv: ['quietly', 'briefly', 'happily'], place: [['on', 'bench', ['the']], ['under', 'tree', ['the']]] }
  };
  var ANIMAL_ADV = { bark: ['loudly', 'twice', 'suddenly'], sleep: ['soundly', 'peacefully', 'quietly'], run: ['quickly', 'fast', 'away'], jump: ['high', 'suddenly', 'again'],
    yawn: ['sleepily', 'loudly', 'twice'], purr: ['softly', 'happily', 'loudly'], gallop: ['quickly', 'away', 'fast'], rest: ['quietly', 'peacefully'], quack: ['loudly', 'twice'],
    swim: ['slowly', 'quickly', 'away'], chase: ['quickly', 'happily', 'again'], find: ['finally', 'quickly'] };
  var ANIMAL_PLACE = [['in', 'yard', ['the']], ['by', 'pond', ['the']], ['after', 'dinner', []], ['in', 'morning', ['the']], ['near', 'barn', ['the']]];
  var DITR = { // person verbs with an indirect object: things that fit
    give: ['book', 'map', 'ticket', 'gift', 'kite'], hand: ['note', 'map', 'ticket', 'pencil'], send: ['letter', 'postcard', 'package'],
    show: ['map', 'picture', 'drawing'], tell: ['story', 'joke'], write: ['letter', 'note', 'poem'], bake: ['cake', 'pie', 'bread'],
    make: ['sandwich', 'card'], buy: ['kite', 'ticket', 'gift'], throw: ['ball'], read: ['story', 'poem', 'letter'], lend: ['umbrella', 'pencil', 'book']
  };
  var IO_PEOPLE = ['class', 'team', 'baby', 'coach', 'neighbor', 'twins'];
  var PRONOUN_OBJ = ['me', 'us', 'him', 'her', 'them'];
  var PN_LIST = [['captain', ['the']], ['winner', ['the']], ['leader', ['the']], ['pilot', ['a']], ['doctor', ['a']], ['singer', ['a', 'fine']], ['runner', ['a', 'fast']], ['coach', ['the', 'new']], ['author', ['an']], ['artist', ['an']]];
  var PA_LIST = ['tired', 'happy', 'nervous', 'proud', 'hungry', 'calm', 'sleepy', 'ready', 'busy', 'quiet'];
  var PA_VERBS = ['be', 'seem', 'feel', 'look', 'become', 'grow'];
  var SENSE = [ // things with sense (linking) verbs and fitting predicate adjectives
    { n: 'soup', d: 'the', adj: ['hot', 'thick'], v: { smell: ['delicious', 'spicy'], taste: ['salty', 'delicious'] } },
    { n: 'bread', d: 'the', adj: ['warm', 'fresh'], v: { smell: ['sweet', 'wonderful'], taste: ['fresh', 'dry'] } },
    { n: 'music', d: 'the', adj: ['loud', 'new'], v: { sound: ['cheerful', 'beautiful'] } },
    { n: 'blanket', d: 'the', adj: ['old', 'thick'], v: { feel: ['soft', 'warm', 'scratchy'] } },
    { n: 'sky', d: 'the', adj: ['wide', 'big'], v: { look: ['gray', 'stormy', 'clear'], grow: ['dark', 'cloudy'] } },
    { n: 'milk', d: 'the', adj: ['cold', 'old'], v: { taste: ['sour', 'fresh'], smell: ['sour'] } },
    { n: 'roses', d: 'the', adj: ['red', 'wild'], v: { smell: ['sweet', 'lovely'], look: ['healthy', 'lovely'] } },
    { n: 'room', d: 'the', adj: ['empty', 'large'], v: { seem: ['quiet', 'cold', 'huge'], feel: ['cold', 'warm'] } },
    { n: 'lemonade', d: 'the', adj: ['cold', 'pink'], v: { taste: ['sweet', 'sour'] } }
  ];
  var THE_ONLY = { bread: 1, string: 1, soup: 1, room: 1, kitchen: 1, lunch: 1, sky: 1, music: 1, milk: 1 };
  var PLURAL_N = { muffins: 1, tulips: 1, dishes: 1, roses: 1, twins: 1, glasses: 1, ears: 1, stripes: 1, ducklings: 1 };
  var OC_FRAMES = [ // object complements: subject options, verb, object, complement, kind ('n' renames, 'adj' describes)
    { s: 'family', v: 'name', o: ['puppy', ['the', 'new']], c: ['Biscuit', 'Pepper', 'Max'], k: 'n' },
    { s: 'class', v: 'elect', o: ['NAME'], c: ['president', 'captain', 'treasurer'], k: 'n' },
    { s: 'team', v: 'choose', o: ['NAME'], c: ['captain', 'leader'], k: 'n' },
    { s: 'kids', v: 'call', o: ['kitten', ['the', 'gray']], c: ['Smoky', 'Pepper', 'Mittens'], k: 'n' },
    { s: 'PERSON', v: 'paint', o: ['door', ['the', 'old']], c: ['red', 'blue', 'yellow'], k: 'adj' },
    { s: 'PERSON', v: 'paint', o: ['fence', ['the']], c: ['white', 'green'], k: 'adj' },
    { s: 'news', v: 'make', o: ['Dad'], c: ['happy', 'proud'], k: 'adj' },
    { s: 'blanket', v: 'keep', o: ['baby', ['the']], c: ['warm', 'cozy'], k: 'adj' },
    { s: 'PERSON', v: 'find', o: ['movie', ['the']], c: ['funny', 'boring', 'exciting'], k: 'adj' },
    { s: 'rain', v: 'make', o: ['path', ['the']], c: ['muddy', 'slippery'], k: 'adj' }
  ];

  // token helpers
  function tk(w, pos, role, part, grp) { return { w: w, pos: pos || '', role: role || '', part: part || 'p', grp: grp || '' }; }
  // a noun phrase: [determiner/adjective words…] head [prepositional phrase]; returns { toks, node }
  function npOf(head, mods, role, part, pp, grp, headPos) {
    var toks = [], m = [];
    (mods || []).forEach(function (w) {
      if (typeof w === 'object') { toks.push(tk(w.pre, 'adv', '', part, grp)); toks.push(tk(w.w, 'adj', '', part, grp)); m.push({ w: w.w, m: [{ w: w.pre }] }); return; }
      toks.push(tk(w, 'adj', '', part, grp)); m.push(w);
    });
    toks.push(tk(head, headPos || 'n', role, part, grp));
    if (pp) { var ppx = ppOf(pp, part, grp ? grp + '.pp' : 'pp'); toks = toks.concat(ppx.toks); m.push(ppx.node); }
    var node = m.length ? D().n(head, m.map(function (x) { return x; })) : D().n(head);
    return { toks: toks, node: node };
  }
  // a prepositional phrase [prep, object, [object's modifiers]]
  function ppOf(pp, part, grp) {
    var toks = [tk(pp[0], 'prep', '', part, grp)];
    (pp[2] || []).forEach(function (w) { toks.push(tk(w, 'adj', '', part, grp)); });
    toks.push(tk(pp[1], 'n', '', part, grp));
    return { toks: toks, node: D().pp(pp[0], pp[1], (pp[2] || []).slice()) };
  }
  function art(next) { return an(next); }

  /* compose(R, o): o.kind 'intr' | 'tr' | 'ditr' | 'pn' | 'pa' | 'sense' | 'oc'; o.subj 'name' | 'person' | 'animal' | 'any';
     o.adj (subject adjective: true / false / chance), o.subjPP, o.adv, o.place, o.tense, o.objAdj, o.introPP (a time phrase
     before the subject), o.ioPron (pronoun indirect object), o.ioTo (the "to Sam" form: no indirect object), o.not.
     Returns { toks, spec, text, words (plain words with punctuation), subj: { head, from, to }, verb: [indexes],
     info: { kind, verb, ... } }. */
  var TIME_PP = [['after', 'lunch', []], ['before', 'dinner', []], ['on', 'Saturday', []], ['in', 'morning', ['the']], ['after', 'school', []]];
  function chance(R, x, p) { return x === true ? true : x === false ? false : R.chance(p == null ? 0.5 : x); }
  function compose(R, o) {
    o = o || {};
    var kind = o.kind || R.pick(['intr', 'tr', 'ditr', 'pn', 'pa']);
    var toks = [], spec = {}, info = { kind: kind }, sub;
    // ---- subject
    var who = o.subj || 'any', animal = null, person = null, sNode, sToks;
    if (kind === 'sense') {
      var th = R.pick(SENSE); info.thing = th;
      var sa = chance(R, o.adj, 0.5) ? [th.d, R.pick(th.adj)] : [th.d];
      sub = npOf(th.n, sa, 's', 's', null, 'sp');
    } else {
      if (who === 'any') who = kind === 'intr' || (kind === 'tr' && R.chance(0.3)) ? R.pick(['name', 'person', 'animal']) : R.pick(['name', 'person']);
      if ((kind !== 'intr' && kind !== 'tr') && who === 'animal') who = 'person';
      if (kind === 'oc' && who === 'pron') who = 'person';
      if (who === 'animal' && kind === 'tr') { var ok = ANIMALS.filter(function (a) { return Object.keys(a.tr).length; }); animal = R.pick(ok); }
      else if (who === 'animal') animal = R.pick(ANIMALS);
      if (who === 'name') { sub = npOf(R.pick(NAMES), [], 's', 's', null, 'sp'); info.name = true; }
      else if (who === 'pron') { var sp = R.pick(kind === 'pn' ? ['She', 'He', 'I'] : ['She', 'He', 'They', 'We', 'I']); sub = npOf(sp, [], 's', 's', null, 'sp', 'pro'); info.pron = sp; info.pluralSubj = /^(They|We)$/.test(sp); }
      else {
        var base = animal || (person = R.pick(PEOPLE));
        var useAdj = chance(R, o.adj, 0.6), mods = [];
        var adj = useAdj ? R.pick(base.adj) : null;
        mods.push(o.det || (R.chance(0.85) ? 'the' : art(adj || base.n)));
        if (adj) mods.push(o.veryAdj ? { w: adj, pre: o.veryAdj === true ? 'very' : o.veryAdj } : adj);
        if (mods[0] === 'a' || mods[0] === 'an') mods[0] = art(o.veryAdj && adj ? 'very' : adj || base.n);
        if (o.veryAdj && adj) info.very = { adj: adj, noun: base.n };
        var spp = chance(R, o.subjPP, 0.25) ? R.pick(base.pp) : null;
        sub = npOf(base.n, mods, 's', 's', spp, 'sp'); info.subjPP = spp;
      }
    }
    sNode = sub.node; sToks = sub.toks;
    // ---- verb
    var vbase, comps = {}, compToks = [], vmods = [], vmodToks = [], tail = [];
    var plural = !!info.pluralSubj;
    if (kind === 'sense') {
      plural = !!PLURAL_N[info.thing.n];
      vbase = R.pick(Object.keys(info.thing.v)); var paw = R.pick(info.thing.v[vbase]);
      compToks.push(tk(paw, 'adj', 'pa', 'p', 'pa')); comps.pn = D().n(paw); info.pa = paw;
    } else if (animal) {
      if (kind === 'tr') { vbase = R.pick(Object.keys(animal.tr)); var ob = R.pick(animal.tr[vbase]); info.obj = ob; var od = objNP(R, ob, o, 'do'); compToks = compToks.concat(od.toks); comps.do = od.node; }
      else vbase = R.pick(animal.intr);
    } else if (kind === 'intr') vbase = R.pick(Object.keys(INTR_P));
    else if (kind === 'tr') { vbase = R.pick(Object.keys(TRANS)); var ob2 = R.pick(TRANS[vbase].o); info.obj = ob2; var od2 = objNP(R, ob2, o, 'do'); compToks = compToks.concat(od2.toks); comps.do = od2.node; }
    else if (kind === 'ditr') {
      vbase = R.pick(Object.keys(DITR)); var thing = R.pick(DITR[vbase]); info.obj = thing;
      var ioTok, ioNode;
      if (o.ioPron) { var self = { I: 'me', We: 'us', They: 'them', He: 'him', She: 'her' }[info.pron]; var pr = R.pick(PRONOUN_OBJ.filter(function (x) { return x !== self; })); ioTok = [tk(pr, 'pro', 'io', 'p', 'io')]; ioNode = D().n(pr); info.io = pr; }
      else if (R.chance(0.6)) { var nm = R.pick(NAMES.filter(function (x) { return x !== sub.toks[0].w; })); ioTok = [tk(nm, 'n', 'io', 'p', 'io')]; ioNode = D().n(nm); info.io = nm; }
      else { var ip = R.pick(IO_PEOPLE.filter(function (x) { return !person || x !== person.n; })); ioTok = [tk('the', 'adj', '', 'p', 'io'), tk(ip, 'n', 'io', 'p', 'io')]; ioNode = D().n(ip, ['the']); info.io = ip; info.ioText = 'the ' + ip; }
      var od3 = objNP(R, thing, o, 'do');
      if (o.ioTo) { // "gave the map to Sam": no indirect object; to Sam is a prepositional phrase
        compToks = compToks.concat(od3.toks); comps.do = od3.node;
        var toW = vbase === 'bake' || vbase === 'make' || vbase === 'buy' ? 'for' : 'to';
        tail.push(tk(toW, 'prep', '', 'p', 'to')); ioTok.forEach(function (t) { t.role = ''; t.grp = 'to'; tail.push(t); });
        vmods.push({ p: toW, o: ioNode }); info.toPhrase = toW + ' ' + (info.ioText || info.io);
      } else { compToks = compToks.concat(ioTok, od3.toks); comps.io = ioNode; comps.do = od3.node; }
    } else if (kind === 'pn') {
      vbase = R.pick(['become', 'be']); var pn = R.pick(PN_LIST.filter(function (x) { return !person || x[0] !== person.n; })); info.pn = pn[0];
      var pnx = npOf(pn[0], pn[1], 'pn', 'p', null, 'pn'); compToks = compToks.concat(pnx.toks); comps.pn = pnx.node;
    } else if (kind === 'pa') {
      vbase = R.pick(PA_VERBS); var pa = R.pick(PA_LIST); info.pa = pa;
      if (o.very) { compToks.push(tk('very', 'adv', '', 'p', 'pa')); compToks.push(tk(pa, 'adj', 'pa', 'p', 'pa')); comps.pn = { w: pa, m: [{ w: 'very' }] }; info.very = true; }
      else { compToks.push(tk(pa, 'adj', 'pa', 'p', 'pa')); comps.pn = D().n(pa); }
    } else if (kind === 'oc') {
      var fr = R.pick(OC_FRAMES); info.frame = fr; vbase = fr.v;
      var sw = fr.s;
      if (sw === 'PERSON') { var pp2 = R.pick(PEOPLE); sub = npOf(pp2.n, ['the'], 's', 's', null, 'sp'); }
      else if (sw === 'news' || sw === 'rain' || sw === 'blanket') sub = npOf(sw, ['the'], 's', 's', null, 'sp');
      else { sub = npOf(sw, ['the'], 's', 's', null, 'sp'); plural = sw === 'kids'; }
      sNode = sub.node; sToks = sub.toks;
      var oh = fr.o[0] === 'NAME' ? R.pick(NAMES) : fr.o[0];
      var ox = npOf(oh, fr.o[1] || [], 'do', 'p', null, 'do'); compToks = compToks.concat(ox.toks); comps.do = ox.node; info.obj = oh;
      var cw = R.pick(fr.c); compToks.push(tk(cw, fr.k === 'n' ? 'n' : 'adj', 'oc', 'p', 'oc')); comps.oc = D().n(cw); info.oc = cw; info.ock = fr.k;
    }
    info.verb = vbase;
    var tense = o.tense || 'past';
    var vp = vphrase(vbase, tense, plural, info.pron === 'I');
    if (o.not && vp.length < 2) { vp = vphrase(vbase, 'pres-perf', plural, info.pron === 'I'); tense = 'pres-perf'; }
    info.tense = tense; info.vp = vp.slice();
    var vToks = vp.map(function (w) { return tk(w, 'v', 'v', 'p', 'vp'); });
    if (o.not) { vToks.splice(1, 0, tk('not', 'adv', '', 'p', 'vp')); vmods.unshift({ w: 'not' }); }
    // ---- adverb and place phrase (after the complements)
    var advList = animal ? (ANIMAL_ADV[vbase] || ['quickly']) : kind === 'intr' ? INTR_P[vbase].adv : kind === 'tr' ? TRANS[vbase].adv : ['today', 'yesterday', 'again'];
    if (kind === 'pn' || kind === 'pa' || kind === 'sense' || kind === 'oc') advList = [];
    var placeList = animal ? ANIMAL_PLACE : kind === 'intr' ? INTR_P[vbase].place : kind === 'tr' ? TRANS[vbase].place : TIME_PP;
    if (kind === 'oc' || kind === 'pn' || kind === 'pa' || kind === 'sense') placeList = TIME_PP;
    var adv = advList.length && chance(R, o.adv, 0.4) ? R.pick(advList) : null;
    var place = chance(R, o.place, 0.35) ? R.pick(placeList) : null;
    var intro = o.introPP ? R.pick(TIME_PP.filter(function (x) { return !place || x[1] !== place[1]; })) : null;
    if (adv) { tail.push(tk(adv, 'adv', '', 'p', 'adv')); vmods.push({ w: adv }); info.adv = adv; }
    if (place) { var px = ppOf(place, 'p', 'place'); tail = tail.concat(px.toks); vmods.push(px.node); info.place = place; }
    if (intro) { var ix = ppOf(intro, 'p', 'intro'); vmods.unshift(ix.node); info.intro = intro; ix.toks[ix.toks.length - 1].post = ','; toks = toks.concat(ix.toks); }
    var sFrom = toks.length; toks = toks.concat(sToks); var sTo = toks.length - 1;
    var vFrom = toks.length; toks = toks.concat(vToks); toks = toks.concat(compToks, tail);
    // ---- the diagram
    var vNode = D().n(vp.join(' '), vmods.length ? vmods : undefined);
    var cl = { s: sNode, v: vNode };
    if (comps.io) cl.io = comps.io; if (comps.do) cl.do = comps.do; if (comps.pn) cl.pn = comps.pn; if (comps.oc) cl.oc = comps.oc;
    spec = D().clause(cl);
    if (comps.pn && comps.pn.m) spec.pn = comps.pn; // keep "very" on the predicate adjective
    var words = toks.map(function (t) { return t.w + (t.post || ''); });
    words[0] = cap(words[0]); words[words.length - 1] += '.';
    var vIdx = []; toks.forEach(function (t, i) { if (t.role === 'v') vIdx.push(i); });
    return { toks: toks, spec: spec, words: words, text: words.join(' '), subj: { from: sFrom, to: sTo }, verb: vIdx, info: info, plural: plural };
  }
  function objNP(R, ob, o, role) {
    var mods = [], adjs = (OBJ[ob] || []).filter(function (a) { return !o.noNounish || !NOUNISH[a]; });
    var adj = adjs.length && chance(R, o.objAdj, 0.5) ? R.pick(adjs) : null;
    if (PLURAL_N[ob] || THE_ONLY[ob]) mods.push('the');
    else mods.push(R.chance(0.6) ? 'the' : art(adj || ob));
    if (adj) mods.push(adj);
    return npOf(ob, mods, role, 'p', null, role);
  }
  function theOf(w) { return /^[A-Z]/.test(w) ? w : 'the ' + w; }
  function idxRole(c, role) { var out = []; c.toks.forEach(function (t, i) { if (t.role === role) out.push(i); }); return out; }
  function wordAt(c, i) { return c.toks[i].w; }
  // a word that appears once in the sentence (so a choice of words is never ambiguous)
  function once(c, w) { var n = 0; c.toks.forEach(function (t) { if (t.w.toLowerCase() === String(w).toLowerCase()) n++; }); return n === 1; }
  function phrase(c, from, to) { return c.toks.slice(from, to + 1).map(function (t) { return t.w; }).join(' ').replace(/^./, function (x) { return from === 0 ? x.toUpperCase() : x; }); }
  function phraseLow(c, from, to) { return c.toks.slice(from, to + 1).map(function (t) { return t.w; }).join(' '); }
  // the sentence with words from..to underlined
  function under(c, from, to) {
    return c.words.map(function (w, i) {
      if (i === from) w = '<u>' + w; if (i === to) w = w.replace(/([.,!?;:”]*)$/, '</u>$1'); return w;
    }).join(' ');
  }
  // compose until ok(c) holds (a few tries; the last one is returned anyway)
  function composeWhere(R, o, ok) { var c; for (var i = 0; i < 30; i++) { c = compose(R, o); if (ok(c)) return c; } return c; }
  // expose the composer for the tests (/tmp/work_gram/test_gen.js)
  ML._gram = { compose: compose, VF: VF, vphrase: vphrase };

  /* ================================================================ Unit 1: the parts of speech */
  // hand-tagged sentences (tags: n pro v adj adv prep conj int; '-' for none). Articles count as adjectives, as in the lessons.
  var TAGGED = [
    'Wow|int, the|adj tiny|adj kitten|n climbed|v up|prep the|adj tree|n!',
    'Ana|n and|conj I|pro walked|v to|prep the|adj library|n.',
    'Oh|int, we|pro forgot|v the|adj tickets|n again|adv.',
    'The|adj dog|n barked|v, but|conj nobody|pro answered|v.',
    'She|pro quickly|adv packed|v a|adj small|adj bag|n.',
    'Hooray|int, our|adj team|n won|v the|adj game|n!',
    'Leo|n carefully|adv painted|v the|adj old|adj fence|n.',
    'We|pro waited|v under|prep the|adj bridge|n until|conj the|adj rain|n stopped|v.',
    'The|adj cold|adj wind|n blew|v across|prep the|adj field|n.',
    'They|pro sang|v loudly|adv at|prep the|adj concert|n.',
    'Mia|n or|conj Sam|n will|v feed|v the|adj fish|n.',
    'Hey|int, the|adj bus|n is|v here|adv!',
    'Grandma|n baked|v bread|n, and|conj we|pro ate|v it|pro.',
    'Ouch|int, that|adj pan|n is|v very|adv hot|adj!',
    'The|adj geese|n flew|v south|adv in|prep October|n.',
    'He|pro gave|v me|pro a|adj shiny|adj shell|n.'
  ];
  function tagged(s) { var T = ML.writing.tokens(s); return { toks: T, words: T.map(function (t) { return t.pre + t.w + t.post; }) }; }
  function underTok(words, i) { return words.map(function (w, j) { return j === i ? w.replace(/^([“(]*)(.*?)([.,!?;:”)]*)$/, '$1<u>$2</u>$3') : w; }).join(' '); }
  function countWord(toks, w) { return toks.filter(function (t) { return t.w.toLowerCase() === w.toLowerCase(); }).length; }
  // the same word doing different jobs (word-jobs and parts-of-speech): [part of speech, sentence with *the word*]
  var JOBS = [
    { w: 'light', uses: [['n', 'Please turn off the *light*.'], ['v', 'We *light* the candles at dinner.'], ['adj', 'Bring a *light* jacket.']] },
    { w: 'run', uses: [['n', 'Dad went for a long *run*.'], ['v', 'We *run* to the bus every morning.']] },
    { w: 'back', uses: [['n', 'Sign your name on the *back* of the card.'], ['adv', 'Please come *back* soon.'], ['adj', 'We used the *back* door.']] },
    { w: 'fast', uses: [['adj', 'Leo has a *fast* bike.'], ['adv', 'Leo rides *fast*.']] },
    { w: 'well', uses: [['adv', 'Mia sings *well*.'], ['n', 'The farmer dug a new *well*.'], ['int', '*Well*, that was a surprise.']] },
    { w: 'before', uses: [['prep', 'Wash your hands *before* dinner.'], ['conj', 'Wash your hands *before* you eat.'], ['adv', 'I have seen this movie *before*.']] },
    { w: 'after', uses: [['prep', 'We played outside *after* lunch.'], ['conj', 'We played outside *after* we ate lunch.']] },
    { w: 'up', uses: [['prep', 'The cat ran *up* the tree.'], ['adv', 'The cat looked *up*.']] },
    { w: 'down', uses: [['prep', 'We walked *down* the hill.'], ['adv', 'Please sit *down*.']] },
    { w: 'paint', uses: [['n', 'The *paint* is still wet.'], ['v', 'We *paint* the fence every spring.']] },
    { w: 'water', uses: [['n', 'The *water* in the lake is cold.'], ['v', 'Please *water* the plants.']] },
    { w: 'play', uses: [['n', 'Our class put on a *play*.'], ['v', 'The kids *play* outside after school.']] },
    { w: 'that', uses: [['pro', '*That* is my coat.'], ['adj', '*That* coat is mine.'], ['conj', 'I know *that* you tried.']] },
    { w: 'this', uses: [['pro', '*This* is my favorite song.'], ['adj', '*This* song is my favorite.']] },
    { w: 'since', uses: [['prep', 'We have lived here *since* May.'], ['conj', '*Since* it was raining, we stayed inside.']] },
    { w: 'round', uses: [['adj', 'We sat at a *round* table.'], ['n', 'Our team won the first *round*.'], ['v', '*Round* the number to the nearest ten.']] },
    { w: 'still', uses: [['adv', 'The baby is *still* asleep.'], ['adj', 'The lake was *still*.']] },
    { w: 'outside', uses: [['n', 'The *outside* of the box is red.'], ['adv', 'The kids played *outside*.'], ['prep', 'We waited *outside* the door.']] },
    { w: 'but', uses: [['conj', 'I was tired, *but* I kept going.'], ['prep', 'Everyone *but* Sam came to the picnic.']] },
    { w: 'for', uses: [['prep', 'This gift is *for* you.'], ['conj', 'We hurried home, *for* it was getting dark.']] },
    { w: 'yet', uses: [['adv', 'Has the bus come *yet*?'], ['conj', 'It was late, *yet* we kept reading.']] },
    { w: 'like', uses: [['v', 'I *like* apples.'], ['prep', 'She sings *like* a bird.']] },
    { w: 'kind', uses: [['n', 'What *kind* of bird is that?'], ['adj', 'Sharing your lunch was a *kind* thing to do.']] },
    { w: 'cold', uses: [['adj', 'The water is *cold*.'], ['n', 'Leo caught a *cold* last week.']] },
    { w: 'hope', uses: [['n', 'Our *hope* is to finish by noon.'], ['v', 'We *hope* you can come.']] },
    { w: 'near', uses: [['prep', 'We live *near* the park.'], ['adv', 'The storm drew *near*.']] },
    { w: 'drink', uses: [['n', 'May I have a *drink*?'], ['v', 'Horses *drink* from the trough.']] },
    { w: 'iron', uses: [['n', 'The *iron* is hot.'], ['v', 'Please *iron* your shirt.'], ['adj', 'The gate has an *iron* lock.']] }
  ];
  var JOB_WHY = {
    n: 'it names a person, place, thing or idea (a word like the or a can come before it)',
    v: 'it shows an action or a state, and it has a subject',
    adj: 'it describes a noun: it tells which one or what kind',
    adv: 'it tells how, when, where or how much about a verb, an adjective or another adverb',
    prep: 'it has an object after it and shows how that object relates to another word',
    conj: 'it joins words or clauses; here a whole clause with a subject and a verb follows it',
    pro: 'it stands in for a noun; no noun follows it',
    int: 'it shows feeling and stands apart from the rest of the sentence'
  };
  function starHTML(s) { return s.replace(/\*([^*]+)\*/, '<u>$1</u>'); }
  function starPlain(s) { return s.replace(/\*/g, ''); }

  /* ---------------------------------------------------------------- gram.parts-of-speech */
  G('gram.parts-of-speech', function (R, ctx) {
    var L = ctx.level;
    var shape = ML.byLevel(ctx, R.pick(['compose', 'bank']), R.pick(['bank', 'compose', 'bank']), R.pick(['jobs', 'bank']));
    if (shape === 'jobs') {
      var J = R.pick(JOBS), two = R.sample(J.uses, 2);
      var right = POSN[two[0][0]] + ', then ' + POSN[two[1][0]];
      var wrongs = [POSN[two[1][0]] + ', then ' + POSN[two[0][0]], POSN[two[0][0]] + ' both times', POSN[two[1][0]] + ' both times'];
      return { q: Q(P('The word ' + I(J.w) + ' is underlined in both sentences. What part of speech is it in each one?'), S('1. ' + starHTML(two[0][1])), S('2. ' + starHTML(two[1][1]))),
        a: mc(right, wrongs), hint: 'Look at the job the word does in each sentence, not at the word alone.',
        steps: ['Sentence 1: ' + I(J.w) + ' is a ' + POSN[two[0][0]] + ': ' + JOB_WHY[two[0][0]] + '.', 'Sentence 2: ' + I(J.w) + ' is a ' + POSN[two[1][0]] + ': ' + JOB_WHY[two[1][0]] + '.', 'The same word can do different jobs. The job decides the part of speech.'] };
    }
    var words, toks, i, pos;
    if (shape === 'bank') {
      var T = tagged(R.pick(TAGGED)); toks = T.toks; words = T.words;
      var pool = []; toks.forEach(function (t, j) { if (POSN[t.tag] && countWord(toks, t.w) === 1 && !(t.tag === 'adj' && /^(the|a|an|our|that)$/i.test(t.w))) pool.push(j); });
      // prefer the less common parts of speech so all eight come up
      var rare = pool.filter(function (j) { return /^(pro|conj|int|prep|adv)$/.test(toks[j].tag); });
      i = R.pick(rare.length && R.chance(0.7) ? rare : pool); pos = toks[i].tag;
    } else {
      var c = compose(R, { kind: R.pick(['intr', 'tr', 'pa']), adv: R.chance(0.5), place: R.chance(0.5), subj: R.pick(['person', 'animal', 'name']), noNounish: true });
      toks = c.toks.map(function (t) { return { w: t.w, tag: t.pos }; }); words = c.words;
      var pool2 = []; toks.forEach(function (t, j) { if (POSN[t.tag] && countWord(toks, t.w) === 1 && !/^(the|a|an)$/i.test(t.w) && !NOUNISH[t.w]) pool2.push(j); });
      i = R.pick(pool2); pos = toks[i].tag;
    }
    var others = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun'].concat(L > 1 ? ['conjunction', 'interjection'] : []);
    var wr = R.shuffle(others.filter(function (x) { return x !== POSN[pos]; }));
    // level 2: put the most tempting wrong answer first
    var tempt = { n: 'adjective', v: 'noun', adj: 'adverb', adv: 'adjective', prep: 'adverb', pro: 'noun', conj: 'preposition', int: 'adverb' }[pos];
    if (L > 1) wr = [tempt].concat(wr);
    return { q: Q(P('What part of speech is the underlined word?'), S(underTok(words, i))), a: mc(POSN[pos], wr, L === 1 ? 3 : 4),
      hint: 'Ask what job the word does in this sentence: does it name, act, describe, tell how or when, show a relation, join, stand in for a noun, or show feeling?',
      steps: ['Look at the job of ' + I(toks[i].w) + ' in this sentence.', cap(I(toks[i].w)) + ' is ' + an(POSN[pos]) + ' ' + POSN[pos] + ': ' + JOB_WHY[pos] + '.'] };
  });

  /* ---------------------------------------------------------------- gram.nouns */
  // abstract nouns, each the only noun in its sentence
  var ABSTRACT_ONLY = [
    ['Her|- kindness|n surprised|v everyone|-.', 'kindness'], ['We|- felt|v great|adj joy|n.', 'joy'], ['His|- honesty|n impressed|v us|-.', 'honesty'],
    ['That|- idea|n is|v clever|adj.', 'idea'], ['Their|- friendship|n grew|v stronger|adj.', 'friendship'], ['Patience|n is|v important|adj.', 'patience'],
    ['She|- shared|v her|- knowledge|n.', 'knowledge'], ['Your|- curiosity|n is|v wonderful|adj.', 'curiosity'], ['Courage|n helped|v them|-.', 'courage'],
    ['Luck|n was|v with|- us|-.', 'luck'], ['Our|- freedom|n matters|v.', 'freedom'], ['Everyone|- admired|v his|- bravery|n.', 'bravery']
  ];
  var CONCRETE = ['table', 'puppy', 'river', 'pencil', 'sandwich', 'mountain', 'drum', 'teacher', 'garden', 'rocket', 'sweater', 'window'];
  var ABSTRACT = ['courage', 'kindness', 'idea', 'friendship', 'honesty', 'joy', 'fear', 'freedom', 'patience', 'knowledge', 'childhood', 'peace', 'luck', 'curiosity', 'pride', 'hope'];
  var COLLECTIVE = ['team', 'flock', 'herd', 'class', 'family', 'crew', 'band', 'swarm', 'committee', 'audience', 'pack', 'choir'];
  var PROPER = [['Ohio', 'state'], ['Chicago', 'city'], ['Monday', 'day'], ['July', 'month'], ['Lake Erie', 'lake'], ['Mars', 'planet'], ['Canada', 'country'], ['Mississippi River', 'river'], ['Thanksgiving', 'holiday'], ['Charlotte’s Web', 'book']];
  var NOUN_SENT = [ // for "choose every noun"
    'The|- team|n showed|v great|- courage|n in|- the|- final|- game|n.',
    'Mia|n wrote|v a|- poem|n about|- friendship|n.',
    'The|- flock|n landed|v near|- the|- pond|n on|- Monday|n.',
    'Her|- honesty|n earned|v the|- trust|n of|- her|- coach|n.',
    'Leo|n felt|v pride|n when|- the|- band|n played|v.',
    'Our|- class|n visited|v Chicago|n in|- May|n.',
    'The|- herd|n crossed|v the|- river|n slowly|-.',
    'Patience|n helped|v the|- farmer|n during|- the|- drought|n.'
  ];
  G('gram.nouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['find', 'abstract']), R.pick(['abstract', 'kind', 'collective', 'proper']), R.pick(['all', 'kind', 'abstract']));
    if (shape === 'find' || shape === 'abstract') {
      if (shape === 'find') {
        var c = compose(R, { kind: R.pick(['intr', 'tr']), subj: R.pick(['person', 'animal']), adj: true, noNounish: true, place: false });
        var head = c.toks[c.subj.to], adjT = c.toks.filter(function (t) { return t.pos === 'adj' && !/^(the|a|an)$/i.test(t.w); })[0];
        var vb = c.toks[c.verb[c.verb.length - 1]];
        return { q: Q(P('Which word in this sentence is a noun?'), S(c.text)), a: mc(head.w, [vb.w, adjT ? adjT.w : null, c.info.adv].filter(Boolean), 3),
          hint: 'A noun names a person, an animal, a place, a thing or an idea. Can you put the in front of it?',
          steps: [cap(I(head.w)) + ' names ' + (PEOPLE.some(function (p) { return p.n === head.w; }) ? 'a person' : 'an animal') + ', so it is a noun.', cap(I(vb.w)) + ' is the verb: it tells what happened.', adjT ? cap(I(adjT.w)) + ' describes the ' + head.w + ', so it is an adjective.' : ''].filter(Boolean) };
      }
      var A = R.pick(ABSTRACT_ONLY), T = tagged(A[0]), wrongs = T.toks.filter(function (t) { return t.tag === 'v' || t.tag === 'adj'; }).map(function (t) { return t.w; });
      T.toks.forEach(function (t) { if (t.tag === '-' && /^[a-z]+$/i.test(t.w) && wrongs.length < 3) wrongs.push(t.w); });
      return { q: Q(P('Which word in this sentence is a noun?'), S(T.words.join(' '))), a: mc(A[1], wrongs, L === 1 ? 3 : 4),
        hint: 'Some nouns name things you can’t see or touch: feelings, qualities and ideas.',
        steps: [cap(I(A[1])) + ' names ' + (/(joy|fear|pride)/.test(A[1]) ? 'a feeling' : A[1] === 'idea' ? 'an idea' : 'a quality or an idea') + '. You can’t touch it, but it is still a noun.', 'Test: you can say “the ' + A[1] + '” or “' + A[1] + ' is …”.', 'It is an abstract noun.'] };
    }
    if (shape === 'kind') {
      var conc = R.coin(), w = conc ? R.pick(CONCRETE) : R.pick(ABSTRACT);
      return { q: Q(P('Is the noun ' + I(w) + ' concrete or abstract?')), a: mcKeep(['concrete', 'abstract'], conc ? 0 : 1),
        hint: 'Could you see, hear, touch, taste or smell it?',
        steps: conc ? ['You can see or touch a ' + w + '.', 'So ' + I(w) + ' is a concrete noun.'] : ['You can’t see or touch ' + w + ' itself; it is a feeling, a quality or an idea.', 'So ' + I(w) + ' is an abstract noun. It is still a noun.'] };
    }
    if (shape === 'collective') {
      var col = R.pick(COLLECTIVE), others = R.sample(CONCRETE.concat(['player', 'bird', 'cow', 'student', 'sailor', 'bee']).filter(function (x) { return x !== col; }), 3);
      return { q: P('Which noun is a collective noun?'), a: mc(col, others, 4),
        hint: 'A collective noun names a group as one thing.',
        steps: [cap(I(col)) + ' names a whole group as one unit, so it is a collective noun.', 'The others name single people, animals or things.'] };
    }
    if (shape === 'proper') {
      var pr = R.pick(PROPER), wantProper = R.coin(), word = wantProper ? pr[0] : pr[1];
      return { q: Q(P('Is ' + I(word) + ' a common noun or a proper noun?')), a: mcKeep(['common noun', 'proper noun'], wantProper ? 1 : 0),
        hint: 'A proper noun is the name of one particular person, place or thing, and it starts with a capital letter.',
        steps: wantProper ? [cap(I(word)) + ' names one particular ' + pr[1] + '.', 'So it is a proper noun, written with a capital letter.'] : [cap(I(word)) + ' could be any ' + pr[1] + '; it is not a name.', 'So it is a common noun. (' + pr[0] + ' is one proper noun for a ' + pr[1] + '.)'] };
    }
    // all: choose every noun
    var NS = tagged(R.pick(NOUN_SENT)), items = [];
    NS.toks.forEach(function (t) { if (/^(the|a|an|her|his|our|of|in|on|about|near|during|when)$/i.test(t.w)) return; items.push({ text: t.w, ok: t.tag === 'n' }); });
    var nouns = NS.toks.filter(function (t) { return t.tag === 'n'; }).map(function (t) { return t.w; });
    return { q: Q(P('Choose every noun in this sentence.'), S(NS.words.join(' '))), a: mcAll(items),
      hint: 'Look for people, places and things, and also for ideas and feelings. Test each word: can it follow the?',
      steps: ['The nouns are ' + ML.util.list(nouns.map(I)) + '.', 'Some name ideas or feelings, not things you can touch. They are nouns too.', 'The verb and the describing words are not nouns.'] };
  });

  /* ---------------------------------------------------------------- gram.personal-pronouns */
  var PRON = [ // [subject, object, possessive before a noun, possessive alone, person, number]
    ['I', 'me', 'my', 'mine', 'first', 'singular'], ['you', 'you', 'your', 'yours', 'second', 'singular or plural'],
    ['he', 'him', 'his', 'his', 'third', 'singular'], ['she', 'her', 'her', 'hers', 'third', 'singular'], ['it', 'it', 'its', 'its', 'third', 'singular'],
    ['we', 'us', 'our', 'ours', 'first', 'plural'], ['they', 'them', 'their', 'theirs', 'third', 'plural']
  ];
  G('gram.personal-pronouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['find', 'person']), R.pick(['replace', 'form', 'person']), R.pick(['alone', 'replace', 'form']));
    if (shape === 'find') {
      var c = compose(R, { kind: R.pick(['ditr', 'tr', 'intr']), subj: 'pron', ioPron: false });
      var p = c.toks[c.subj.from], others = c.toks.filter(function (t) { return t.pos === 'n' || t.pos === 'v'; }).map(function (t) { return t.w; });
      return { q: Q(P('Which word is a personal pronoun?'), S(c.text)), a: mc(p.w, others, 3),
        hint: 'A pronoun stands in for a noun. Which word could be replaced by a name?',
        steps: [cap(I(p.w)) + ' stands in for a person’s name, so it is a personal pronoun.', 'The other words are nouns and verbs.'] };
    }
    if (shape === 'person') {
      var row = R.pick(PRON.filter(function (r) { return r[0] !== 'you'; })), form = R.pick(row[0] === 'it' ? [0, 1] : [0, 1, 3]);
      var w = row[form], ask = R.coin() ? 'person' : 'number';
      if (ask === 'person') return { q: P('What person is the pronoun ' + I(w) + '?'), a: mcKeep(['first person', 'second person', 'third person'], ['first', 'second', 'third'].indexOf(row[4])),
        hint: 'First person: the one speaking. Second person: the one spoken to. Third person: anyone or anything else.',
        steps: [cap(I(w)) + ' ' + (row[4] === 'first' ? 'means the speaker (or the speaker and others)' : 'means someone or something being talked about') + '.', 'So it is ' + row[4] + ' person.'] };
      return { q: P('Is the pronoun ' + I(w) + ' singular or plural?'), a: mcKeep(['singular', 'plural'], row[5] === 'plural' ? 1 : 0),
        hint: 'Does it stand for one, or more than one?',
        steps: [cap(I(w)) + ' stands for ' + (row[5] === 'plural' ? 'more than one' : 'one') + '.', 'So it is ' + row[5] + '.'] };
    }
    if (shape === 'form') {
      var r2 = R.pick(PRON.filter(function (r) { return r[0] !== 'you' && r[0] !== 'it'; })), f = R.pick(['object', 'possessive']);
      var right = f === 'object' ? r2[1] : r2[3];
      var wr = [r2[0], r2[1], r2[2], r2[3]].filter(function (x) { return x !== right; });
      var frame = f === 'object' ? 'Grandma waved to ___ .' : 'The blue backpack is ___ .';
      return { q: Q(P('Which form of ' + I(r2[0]) + ' fits in the blank?'), S(frame.replace('___ ', '___'))), a: mc(right, wr, L === 1 ? 3 : 4),
        hint: f === 'object' ? 'After a verb or a word like to, use the object form.' : 'With no noun after it, use the possessive form that stands alone.',
        steps: f === 'object' ? ['The pronoun comes after to, so it needs the object form.', 'The object form of ' + I(r2[0]) + ' is ' + I(r2[1]) + '.'] : ['The pronoun shows ownership and has no noun after it.', 'The form that stands alone is ' + I(r2[3]) + ': “The blue backpack is ' + r2[3] + '.”'] };
    }
    if (shape === 'replace') {
      var opts = [
        ['Ana and Leo', 'subject', 'They', ['Them', 'Their', 'We']], ['Mia and I', 'subject', 'We', ['Us', 'They', 'Our']],
        ['the puppy', 'subject', 'It', ['They', 'Its', 'Him']], ['Sam and Rosa', 'object', 'them', ['they', 'their', 'us']],
        ['Leo and me', 'object', 'us', ['we', 'them', 'our']], ['the dishes', 'object', 'them', ['they', 'it', 'their']]
      ], o = R.pick(opts);
      var sent = o[1] === 'subject' ? cap(o[0]) + ' ' + R.pick(['walked to the park', 'baked muffins', 'waited by the door', 'cheered at the game']) + '.' : R.pick(['Grandpa called ', 'The coach thanked ', 'Dad drove ']) + o[0] + ' ' + R.pick(['after lunch', 'on Saturday', 'today']) + '.';
      if (o[0] === 'the dishes') sent = R.pick(['Leo washed ', 'Mia dried ']) + 'the dishes after dinner.';
      if (o[0] === 'the puppy' ) sent = 'The puppy ' + R.pick(['chased the ball', 'slept on the rug', 'barked at the mail carrier']) + '.';
      var html = sent.replace(new RegExp(o[1] === 'subject' ? '^' + cap(o[0]) : o[0]), function (m) { return '<u>' + m + '</u>'; });
      return { q: Q(P('Which pronoun could take the place of the underlined words?'), S(html)), a: mc(o[2], o[3], L === 1 ? 3 : 4),
        hint: 'Is it the subject (doing the action) or an object (after the verb)? One or more than one?',
        steps: ['The underlined words are the ' + o[1] + ' of the sentence.', 'They stand for ' + (/and| dishes/.test(o[0]) ? 'more than one' : 'one thing') + (/I$/.test(o[0]) ? ', and they include the speaker' : /me$/.test(o[0]) ? ', and they include the speaker' : '') + '.', 'So the pronoun is ' + I(o[2]) + '.'] };
    }
    // alone: possessive pronoun that stands alone
    var r3 = R.pick(PRON.filter(function (r) { return r[3] !== r[2] && r[0] !== 'it'; })), thing = R.pick(['bike', 'jacket', 'lunch', 'kite', 'umbrella']);
    var good = 'The ' + R.pick(['red', 'green', 'blue']) + ' ' + thing + ' is ' + r3[3] + '.';
    return { q: P('Which sentence uses a possessive pronoun that stands alone, with no noun after it?'),
      a: mc(good, [cap(r3[2]) + ' ' + thing + ' is ' + R.pick(['red', 'green', 'blue']) + '.', cap(r3[0]) + ' ' + (/^(I|you|we|they)$/.test(r3[0]) ? 'have' : 'has') + ' a ' + thing + '.', 'The ' + thing + ' belongs to ' + r3[1] + '.'], 4),
      hint: 'Mine, yours, his, hers, ours and theirs stand alone.',
      steps: ['In “' + good + '”, ' + I(r3[3]) + ' shows ownership and stands alone: no noun comes after it.', I(cap(r3[2])) + ' also shows ownership, but it comes before a noun. Some books call that word a pronoun and some call it an adjective or a determiner; either way it goes before a noun.', I(r3[0]) + ' and ' + I(r3[1]) + ' are personal pronouns, but they don’t show ownership.'] };
  });

  /* ---------------------------------------------------------------- gram.other-pronouns */
  var KINDS = { refl: 'reflexive', int: 'intensive', dem: 'demonstrative', ind: 'indefinite', q: 'interrogative', rel: 'relative' };
  var OTHERP = [
    ['refl', 'Leo hurt *himself* on the stairs.'], ['refl', 'We told *ourselves* to stay calm.'], ['refl', 'The cat saw *itself* in the mirror.'],
    ['refl', 'I taught *myself* to knit.'], ['refl', 'The twins introduced *themselves* to the coach.'], ['refl', 'You should be proud of *yourself*.'],
    ['int', 'I *myself* built the fort.'], ['int', 'The mayor *herself* cut the ribbon.'], ['int', 'We painted the whole room *ourselves*.'],
    ['int', 'The chef *himself* served the soup.'], ['int', 'The kids *themselves* planned the party.'], ['int', 'You *yourself* said so.'],
    ['dem', '*That* is my coat.'], ['dem', '*These* are the freshest peaches.'], ['dem', '*Those* belong to Ana.'], ['dem', '*This* is the best part.'],
    ['ind', '*Everyone* laughed at the joke.'], ['ind', '*Someone* left a note on the door.'], ['ind', '*Both* of the puppies are asleep.'],
    ['ind', '*Nobody* saw the deer.'], ['ind', '*Many* came to the fair.'], ['ind', '*Each* of the players got a medal.'],
    ['q', '*Who* left the door open?'], ['q', '*What* is in the box?'], ['q', '*Which* is your bag?'], ['q', '*Whom* did you call?'],
    ['rel', 'The girl *who* won the race is my cousin.'], ['rel', 'The book *that* I borrowed was funny.'], ['rel', 'Our dog, *which* is very old, sleeps a lot.'],
    ['rel', 'The coach *whom* we met was kind.'], ['rel', 'The neighbor *whose* cat got lost put up signs.']
  ];
  var KIND_WHY = {
    refl: 'it points back to the subject, and the sentence needs it: take it out and the sentence is incomplete or changes its meaning',
    int: 'it only adds emphasis: take it out and the sentence still says the same thing',
    dem: 'it points to something and stands alone, with no noun after it',
    ind: 'it doesn’t name a particular person or thing',
    q: 'it asks a question',
    rel: 'it starts a clause that tells more about the noun just before it'
  };
  var DEM_PAIRS = [['this', 'This is my seat.', 'This seat is mine.'], ['that', 'That was a great game.', 'That game was great.'], ['these', 'These are too small.', 'These shoes are too small.'], ['those', 'Those are ripe.', 'Those pears are ripe.']];
  G('gram.other-pronouns', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'kind', R.pick(['kind', 'kind', 'reflint']), R.pick(['dem', 'reflint', 'kind']));
    if (shape === 'dem') {
      var d = R.pick(DEM_PAIRS), asPron = R.coin(), s = asPron ? d[1] : d[2];
      var html = s.replace(new RegExp('^' + cap(d[0])), '<u>' + cap(d[0]) + '</u>');
      return { q: Q(P('Is the underlined word a pronoun in this sentence?'), S(html)), a: mcKeep(['Yes, it is a pronoun.', 'No, it describes a noun.'], asPron ? 0 : 1),
        hint: 'Does a noun come right after it?',
        steps: asPron ? ['No noun follows ' + I(d[0]) + '. It stands alone in the noun’s place.', 'So it is a demonstrative pronoun.'] : ['A noun follows ' + I(d[0]) + ': it tells which ' + s.split(' ')[1] + '.', 'So here it works as an adjective (some books say a determiner), not as a pronoun.'] };
    }
    if (shape === 'reflint') {
      var pool = OTHERP.filter(function (x) { return x[0] === 'refl' || x[0] === 'int'; }), e = R.pick(pool);
      return { q: Q(P('Is the underlined pronoun reflexive or intensive?'), S(starHTML(e[1]))), a: mcKeep(['reflexive', 'intensive'], e[0] === 'refl' ? 0 : 1),
        hint: 'Take the word out. Is the sentence still complete, with the same meaning?',
        steps: ['Take it out: “' + starPlain(e[1]).replace(/ \w+self| \w+selves/, '') + '”', e[0] === 'refl' ? 'That doesn’t work: the sentence needs the pronoun.' : 'That still works and means the same thing.', 'So it is ' + KINDS[e[0]] + ': ' + KIND_WHY[e[0]] + '.'] };
    }
    var ex = R.pick(OTHERP), all = Object.keys(KINDS).filter(function (k) { return k !== ex[0]; });
    var tempt = { refl: 'int', int: 'refl', dem: 'ind', ind: 'dem', q: 'rel', rel: 'q' }[ex[0]];
    var wr = L === 1 ? R.sample(all, 2) : [tempt].concat(R.shuffle(all));
    return { q: Q(P('What kind of pronoun is the underlined word?'), S(starHTML(ex[1]))), a: mc(KINDS[ex[0]], wr.map(function (k) { return KINDS[k]; }), L === 1 ? 3 : 4),
      hint: 'Does it point back to the subject, add emphasis, point to something, name no one in particular, ask, or start a clause about a noun?',
      steps: ['The pronoun is ' + I(starPlain(ex[1].match(/\*([^*]+)\*/)[1])) + '.', 'It is ' + KINDS[ex[0]] + ': ' + KIND_WHY[ex[0]] + '.'] };
  });

  /* ---------------------------------------------------------------- gram.action-linking-verbs */
  var SENSE_ACTION = [
    ['felt', 'Ana *felt* the soft fabric.', 'She touched it: an action.'], ['smelled', 'The dog *smelled* the flowers.', 'The dog sniffed them: an action.'],
    ['tasted', 'Leo *tasted* the soup.', 'He tried it with his tongue: an action.'], ['looked', 'We *looked* at the stars.', 'We used our eyes: an action.'],
    ['grew', 'The farmer *grew* corn.', 'The farmer raised the corn: an action.'], ['turned', 'Mia *turned* the pancake.', 'She flipped it: an action.'],
    ['sounded', 'The guard *sounded* the alarm.', 'The guard set it off: an action.']
  ];
  var SENSE_LINK = [
    ['felt', 'The fabric *felt* soft.', 'soft'], ['smelled', 'The flowers *smelled* sweet.', 'sweet'], ['tasted', 'The soup *tasted* salty.', 'salty'],
    ['looked', 'The stars *looked* bright.', 'bright'], ['grew', 'The sky *grew* dark.', 'dark'], ['turned', 'The leaves *turned* orange.', 'orange'],
    ['sounded', 'The alarm *sounded* loud.', 'loud']
  ];
  function beOf(s) { return /^(We|The stars|The flowers|The leaves) /.test(starPlain(s)) ? 'were' : 'was'; }
  G('gram.action-linking-verbs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'compose', R.pick(['sense', 'compose', 'sense']), 'pair');
    var AL = ['action verb', 'linking verb'];
    if (shape === 'compose') {
      var link = R.coin(), c = compose(R, { kind: link ? R.pick(['pn', 'pa', 'sense']) : R.pick(['intr', 'tr']), place: false });
      var vi = c.verb[c.verb.length - 1], v = c.toks[vi].w, after = c.toks.slice(vi + 1).filter(function (t) { return t.role === 'pn' || t.role === 'pa'; })[0];
      return { q: Q(P('Is the underlined verb an action verb or a linking verb?'), S(under(c, vi, vi))), a: mcKeep(AL, link ? 1 : 0),
        hint: 'Try putting is or was in its place. If the sentence still makes sense, it is linking.',
        steps: link ? [cap(I(v)) + ' doesn’t show an action. It links the subject to ' + I(after.w) + ', which ' + (after.role === 'pa' ? 'describes' : 'renames') + ' it.', 'Swap in ' + (c.plural ? 'were' : 'was') + ': “' + c.text.replace(new RegExp('\\b' + v + '\\b'), c.plural ? 'were' : 'was') + '” still makes sense.', 'So ' + I(v) + ' is a linking verb.'] : [cap(I(v)) + ' shows something the subject does.', 'So it is an action verb.'] };
    }
    if (shape === 'sense') {
      var isLink = R.coin(), e = isLink ? R.pick(SENSE_LINK) : R.pick(SENSE_ACTION);
      return { q: Q(P('Is the underlined verb an action verb or a linking verb?'), S(starHTML(e[1]))), a: mcKeep(AL, isLink ? 1 : 0),
        hint: 'Some verbs can be either. Swap in is or was: does the sentence still make sense?',
        steps: isLink ? ['Swap in ' + beOf(e[1]) + ': “' + starPlain(e[1]).replace(e[0], beOf(e[1])) + '” makes sense.', cap(I(e[2])) + ' describes the subject; ' + I(e[0]) + ' only links them.', 'So here ' + I(e[0]) + ' is a linking verb.'] : ['Swap in ' + beOf(e[1]) + ': “' + starPlain(e[1]).replace(e[0], beOf(e[1])) + '” doesn’t make sense.', e[2], 'So here ' + I(e[0]) + ' is an action verb.'] };
    }
    var k = R.int(0, SENSE_LINK.length - 1), A = SENSE_ACTION[k], Lk = SENSE_LINK[k], askLink = R.coin();
    return { q: P('In which sentence is ' + I(A[0]) + ' a ' + (askLink ? 'linking' : 'action') + ' verb?'), a: mcKeep([starPlain(A[1]), starPlain(Lk[1]), 'In both', 'In neither'], askLink ? 1 : 0),
      hint: 'Swap in was in each sentence.',
      steps: ['“' + starPlain(Lk[1]) + '”: swap in was and it still makes sense, so ' + I(A[0]) + ' is linking there.', '“' + starPlain(A[1]) + '”: ' + A[2], 'So the answer is “' + starPlain(askLink ? Lk[1] : A[1]) + '”'] };
  });

  /* ---------------------------------------------------------------- gram.helping-verbs */
  var QUESTIONS_VP = [['Has the mail arrived?', 'Has arrived', 'arrived'], ['Will you help me?', 'Will help', 'help'], ['Can the twins swim?', 'Can swim', 'swim'],
    ['Did Leo call?', 'Did call', 'call'], ['Should we wait here?', 'Should wait', 'wait'], ['Is Ana coming?', 'Is coming', 'coming'], ['Does the bus stop here?', 'Does stop', 'stop'], ['Have you finished?', 'Have finished', 'finished']];
  G('gram.helping-verbs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'phrase', R.pick(['not', 'question', 'phrase']), R.pick(['count', 'not', 'question']));
    if (shape === 'question') {
      var e = R.pick(QUESTIONS_VP), parts = e[1].split(' ');
      return { q: Q(P('What is the complete verb (the verb phrase) in this question?'), S(e[0])), a: mc(e[1], [e[2], parts[0], e[0].replace(/\?$/, '').split(' ').slice(0, 2).join(' ')], 4),
        hint: 'In a question, the helping verb often comes first and the subject sits between it and the main verb.',
        steps: ['Turn the question into a statement in your head: the helping verb ' + I(parts[0].toLowerCase()) + ' moves next to the main verb ' + I(parts[1]) + '.', 'The verb phrase is ' + I(e[1].toLowerCase()) + '; the subject sits in the middle.'] };
    }
    var tense = shape === 'phrase' && L === 1 ? R.pick(['past-prog', 'pres-perf', 'future', 'modal']) : R.pick(['pp-prog', 'past-perf', 'modal-perf', 'pres-perf', 'past-prog', 'future']);
    var c = compose(R, { kind: R.pick(['intr', 'tr']), subj: R.pick(['name', 'person', 'pron']), tense: tense, not: shape === 'not', place: false, adv: false });
    var vp = c.info.vp, phr = vp.join(' '), main = vp[vp.length - 1];
    if (shape === 'count') {
      var nH = vp.length - 1;
      return { q: Q(P('How many helping verbs are in this sentence?'), S(c.text)), a: mcKeep(['0', '1', '2', '3'], nH),
        hint: 'Find the main verb first. Count the verb words in front of it.',
        steps: ['The main verb is ' + I(main) + '.', 'The helping verbs are ' + ML.util.list(vp.slice(0, -1).map(I)) + '.', 'That makes ' + nH + '.'] };
    }
    var wr = [main, vp.slice(1).join(' '), vp[0]];
    if (shape === 'not') wr = [vp[0] + ' not ' + vp.slice(1).join(' '), main, vp[0] + ' not'];
    return { q: Q(P('What is the complete verb (the verb phrase) in this sentence?'), S(c.text)), a: mc(phr, wr, L === 1 ? 3 : 4),
      hint: shape === 'not' ? 'Not is never part of the verb. It is an adverb.' : 'Include every helping verb in front of the main verb.',
      steps: ['The main verb is ' + I(main) + '.', 'The helping verb' + (vp.length > 2 ? 's in front of it are ' : ' in front of it is ') + ML.util.list(vp.slice(0, -1).map(I)) + '.'].concat(shape === 'not' ? ['Not tells about the verb (it is an adverb), so it is not part of the verb phrase.'] : []).concat(['The verb phrase is ' + I(phr) + '.']) };
  });

  /* ---------------------------------------------------------------- gram.adjectives */
  G('gram.adjectives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['find', 'modifies']), R.pick(['pred', 'find', 'modifies']), 'all');
    if (shape === 'pred') {
      var c = compose(R, { kind: R.pick(['pa', 'sense']), adj: false, subj: R.pick(['name', 'person']) });
      var pa = c.info.pa, wr = c.toks.filter(function (t) { return (t.pos === 'n' || t.pos === 'v' || t.pos === 'pro'); }).map(function (t) { return t.w; });
      return { q: Q(P('Which word is an adjective?'), S(c.text)), a: mc(pa, wr, 4),
        hint: 'An adjective can come after a linking verb and still describe the subject.',
        steps: [cap(I(pa)) + ' describes ' + I(c.toks[c.subj.to].w) + ', even though it comes after the verb.', 'It follows the linking verb ' + I(c.info.vp.join(' ')) + '.', 'So ' + I(pa) + ' is an adjective (a predicate adjective).'].concat(/^the$/i.test(c.toks[0].w) ? ['(The is an adjective too: an article.)'] : []) };
    }
    if (shape === 'find' || shape === 'modifies') {
      var adjOk = function (c) { return c.toks.some(function (t) { return t.pos === 'adj' && !/^(the|a|an)$/i.test(t.w) && !NOUNISH[t.w] && once(c, t.w); }); };
      var c2 = composeWhere(R, { kind: R.pick(['tr', 'intr']), subj: R.pick(['person', 'animal']), adj: true, objAdj: true, noNounish: true, place: false }, adjOk);
      var adjIs = []; c2.toks.forEach(function (t, i) { if (t.pos === 'adj' && !/^(the|a|an)$/i.test(t.w) && !NOUNISH[t.w] && once(c2, t.w)) adjIs.push(i); });
      var ai = R.pick(adjIs), aw = c2.toks[ai].w, noun = c2.toks.slice(ai + 1).filter(function (t) { return t.pos === 'n'; })[0].w;
      if (shape === 'find') {
        var wrongs = c2.toks.filter(function (t) { return t.pos === 'n' || t.pos === 'v'; }).map(function (t) { return t.w; });
        return { q: Q(P('Which word is an adjective?'), S(c2.text)), a: mc(aw, wrongs, L === 1 ? 3 : 4),
          hint: 'An adjective tells which one, what kind or how many about a noun.',
          steps: [cap(I(aw)) + ' tells what kind of ' + noun + '.', 'So ' + I(aw) + ' is an adjective. It modifies the noun ' + I(noun) + '.'] };
      }
      var nouns = c2.toks.filter(function (t) { return t.pos === 'n' && t.w !== noun; }).map(function (t) { return t.w; }).concat(c2.toks.filter(function (t) { return t.pos === 'v'; }).map(function (t) { return t.w; }), c2.info.adv ? [c2.info.adv] : [], [c2.toks[0].w]);
      return { q: Q(P('Which word does the underlined adjective modify?'), S(under(c2, ai, ai))), a: mc(noun, nouns, 3),
        hint: 'Ask: which what? What kind of what?',
        steps: ['What kind of ' + noun + '? ' + cap(aw) + '.', 'So ' + I(aw) + ' modifies ' + I(noun) + '.'] };
    }
    // all: choose every adjective, articles included
    var c3 = compose(R, { kind: R.pick(['tr', 'pa', 'sense', 'tr']), subj: R.pick(['person', 'animal']), adj: true, objAdj: true, noNounish: true, place: false, adv: false });
    var items = [], seen = {};
    c3.toks.forEach(function (t) { var k = t.w.toLowerCase(); if (seen[k]) return; seen[k] = 1; items.push({ text: t.w, ok: t.pos === 'adj' }); });
    var adjs = c3.toks.filter(function (t) { return t.pos === 'adj'; }).map(function (t) { return t.w; });
    return { q: Q(P('Choose every adjective in this sentence. Count the articles a, an and the too.'), S(c3.text)), a: mcAll(items),
      hint: 'Look before each noun, and after a linking verb. Don’t forget a, an and the.',
      steps: ['The adjectives are ' + ML.util.list(ML.util.uniq(adjs).map(I)) + '.', 'A, an and the are articles, a special kind of adjective.'].concat(c3.info.pa ? [cap(I(c3.info.pa)) + ' comes after the linking verb but describes the subject, so it is an adjective too.'] : []) };
  });

  /* ---------------------------------------------------------------- gram.adverbs */
  var ADV_TELLS = { quickly: 'how', slowly: 'how', loudly: 'how', softly: 'how', carefully: 'how', happily: 'how', quietly: 'how', patiently: 'how', fast: 'how', hard: 'how', well: 'how',
    aloud: 'how', neatly: 'how', easily: 'how', warmly: 'how', brightly: 'how', shyly: 'how', wildly: 'how', sleepily: 'how', gracefully: 'how', sweetly: 'how',
    nervously: 'how', soundly: 'how', peacefully: 'how', finally: 'when', yesterday: 'when', today: 'when', early: 'when', soon: 'when', later: 'when', now: 'when', outside: 'where', upstairs: 'where', here: 'where', away: 'where', far: 'where', home: 'where',
    often: 'how often', daily: 'how often', twice: 'how often', never: 'how often', again: 'how often', always: 'how often', very: 'how much', too: 'how much', quite: 'how much', almost: 'how much' };
  var NOT_LY = [ // adverbs without -ly, next to -ly adjectives
    ['The|- friendly|adj neighbor|- waved|- often|adv.', 'often', 'friendly'], ['Our|- lovely|adj garden|- bloomed|- early|adv.', 'early', 'lovely'],
    ['The|- lonely|adj puppy|- whined|- again|adv.', 'again', 'lonely'], ['The|- curly|adj puppy|- jumped|- high|adv.', 'high', 'curly'],
    ['A|- lively|adj crowd|- gathered|- outside|adv.', 'outside', 'lively'], ['The|- silly|adj clown|- fell|- down|adv.', 'down', 'silly'],
    ['The|- elderly|adj man|- walked|- home|adv.', 'home', 'elderly'], ['The|- friendly|adj crossing|- guard|- waved|- twice|adv.', 'twice', 'friendly']
  ];
  var ADV_MOD = [ // [sentence with *adverb*, the word it modifies, that word's part of speech, wrong choices]
    ['The *very* old horse rested.', 'old', 'adjective', ['horse', 'rested']], ['Leo ran *quite* fast.', 'fast', 'adverb', ['Leo', 'ran']],
    ['Mia *almost* missed the bus.', 'missed', 'verb', ['Mia', 'bus']], ['The soup was *too* hot.', 'hot', 'adjective', ['soup', 'was']],
    ['The kitten *really* likes milk.', 'likes', 'verb', ['kitten', 'milk']], ['She spoke *very* softly.', 'softly', 'adverb', ['She', 'spoke']],
    ['We *often* walk to school.', 'walk', 'verb', ['We', 'school']], ['The test was *surprisingly* easy.', 'easy', 'adjective', ['test', 'was']],
    ['The bus came *so* slowly.', 'slowly', 'adverb', ['bus', 'came']], ['An *extremely* tall giraffe ate leaves.', 'tall', 'adjective', ['giraffe', 'ate']]
  ];
  G('gram.adverbs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['find', 'tells']), R.pick(['notly', 'tells', 'modifies']), R.pick(['modifies', 'notly']));
    if (shape === 'find' || shape === 'tells') {
      var c = composeWhere(R, { kind: R.pick(['intr', 'tr']), adv: true, place: false, subj: R.pick(['name', 'person', 'animal']), noNounish: true }, function (c) { return !!ADV_TELLS[c.info.adv] && once(c, c.info.adv); });
      var adv = c.info.adv, tells = ADV_TELLS[adv] || 'how';
      if (shape === 'tells') return { q: Q(P('What does the adverb ' + I(adv) + ' tell about the verb?'), S(c.text)), a: mcKeep(['how', 'when', 'where', 'how often'], ['how', 'when', 'where', 'how often'].indexOf(tells)),
        hint: 'Ask the questions: how? when? where? how often?',
        steps: [cap(I(adv)) + ' answers “' + tells + '?” about ' + I(c.info.vp.join(' ')) + '.', 'So it tells ' + tells + '.'] };
      var wr = c.toks.filter(function (t) { return t.pos === 'n' || t.pos === 'v' || (t.pos === 'adj' && !/^(the|a|an)$/i.test(t.w)); }).map(function (t) { return t.w; });
      return { q: Q(P('Which word is an adverb?'), S(c.text)), a: mc(adv, wr, 3),
        hint: 'An adverb tells how, when, where or how often.',
        steps: [cap(I(adv)) + ' tells ' + tells + ' about the verb ' + I(c.info.vp.join(' ')) + '.', 'So it is an adverb.'] };
    }
    if (shape === 'notly') {
      var e = R.pick(NOT_LY), T = tagged(e[0]);
      var wr2 = [e[2]].concat(T.toks.filter(function (t) { return t.tag === '-' && /^[a-z]+$/.test(t.w) && !/^(the|a|our)$/i.test(t.w) && t.w !== e[1]; }).map(function (t) { return t.w; }));
      return { q: Q(P('Which word is an adverb?'), S(T.words.join(' '))), a: mc(e[1], wr2, 4),
        hint: 'Not every adverb ends in -ly, and some -ly words are adjectives. Check the job.',
        steps: [cap(I(e[2])) + ' ends in -ly, but it describes a noun, so it is an adjective.', cap(I(e[1])) + ' tells ' + (ADV_TELLS[e[1]] || 'how') + ' about the verb' + (e[1] === 'too' ? ' (too modifies long, which tells how long it took)' : '') + ', so it is the adverb.'] };
    }
    var m = R.pick(ADV_MOD), word = m[0].match(/\*([^*]+)\*/)[1];
    return { q: Q(P('Which word does the underlined adverb modify?'), S(starHTML(m[0]))), a: mc(m[1], m[3], 3),
      hint: 'Ask what the adverb tells more about: an action, a describing word, or another adverb?',
      steps: [cap(I(word)) + ' tells ' + (ADV_TELLS[word] || 'how much') + ' about ' + I(m[1]) + '.', cap(I(m[1])) + ' is ' + an(m[2]) + ' ' + m[2] + '. Adverbs can modify verbs, adjectives and other adverbs.'] };
  });

  /* ---------------------------------------------------------------- gram.prepositions */
  var UPDOWN = [ // [adverb sentence, preposition sentence, the word]
    ['She looked *up*.', 'She climbed *up* the ladder.', 'up'], ['The cat ran *outside*.', 'The cat ran *outside* the house.', 'outside'],
    ['Please come *in*.', 'Put the shells *in* the box.', 'in'], ['The plane flew *over*.', 'The plane flew *over* the lake.', 'over'],
    ['Turn *around*.', 'We walked *around* the pond.', 'around'], ['The lid fell *off*.', 'The lid fell *off* the jar.', 'off'],
    ['Please sit *down*.', 'Walk *down* the hall.', 'down'], ['The puppy stayed *behind*.', 'The puppy hid *behind* the couch.', 'behind'],
    ['The bus drove *past*.', 'The bus drove *past* the school.', 'past'], ['Come *along*!', 'We walked *along* the river.', 'along']
  ];
  G('gram.prepositions', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['object', 'find']), R.pick(['updown', 'updown', 'object']));
    if (shape === 'updown') {
      var e = R.pick(UPDOWN), asPrep = R.coin(), s = asPrep ? e[1] : e[0];
      return { q: Q(P('Is the underlined word a preposition or an adverb here?'), S(starHTML(s))), a: mcKeep(['preposition', 'adverb'], asPrep ? 0 : 1),
        hint: 'A preposition has an object: a noun or pronoun right after it. Ask “' + e[2] + ' what?”',
        steps: asPrep ? ['“' + cap(e[2]) + ' what?” ' + cap(s.match(/\* (.+)\.$/)[1]) + '.', 'It has an object, so it is a preposition.'] : ['“' + cap(e[2]) + ' what?” Nothing follows it.', 'With no object, it tells where, so it is an adverb.'] };
    }
    var c = compose(R, { kind: R.pick(['intr', 'tr']), place: true, adv: false, subj: R.pick(['name', 'person', 'animal']), noNounish: true });
    var pi = -1; c.toks.forEach(function (t, i) { if (t.pos === 'prep' && t.grp === 'place' && pi < 0) pi = i; });
    var prep = c.toks[pi].w, obj = c.info.place[1];
    if (shape === 'find' || !once(c, obj)) {
      var wr = c.toks.filter(function (t) { return t.pos === 'n' || t.pos === 'v' || (t.pos === 'adj' && !/^(the|a|an)$/i.test(t.w)); }).map(function (t) { return t.w; });
      return { q: Q(P('Which word is a preposition?'), S(c.text)), a: mc(prep, wr, L === 1 ? 3 : 4),
        hint: 'A preposition comes before a noun (its object) and shows where, when or how.',
        steps: [cap(I(prep)) + ' comes before ' + I(obj) + ' and shows how it relates to the rest of the sentence.', 'So ' + I(prep) + ' is a preposition, and ' + I(obj) + ' is its object.'] };
    }
    var wr2 = c.toks.filter(function (t) { return t.pos === 'n' && t.w !== obj; }).map(function (t) { return t.w; }).concat([c.info.vp.join(' ')]);
    return { q: Q(P('What is the object of the preposition ' + I(prep) + '?'), S(c.text)), a: mc(obj, wr2, 3),
      hint: 'Ask “' + prep + ' what?” or “' + prep + ' whom?”',
      steps: ['“' + cap(prep) + ' what?” ' + cap(c.info.place[2].concat([obj]).join(' ')) + '.', 'The noun ' + I(obj) + ' is the object of the preposition.'] };
  });

  /* ---------------------------------------------------------------- gram.conjunctions */
  var CONJ_S = [
    ['coord', 'It rained, *so* we stayed inside.'], ['coord', 'Mia likes soccer, *but* Leo likes chess.'], ['coord', 'You can walk *or* ride your bike.'],
    ['coord', 'The bread was warm *and* fresh.'], ['coord', 'He was tired, *yet* he finished the race.'], ['coord', 'We didn’t call, *nor* did we write.'],
    ['sub', 'We stayed inside *because* it rained.'], ['sub', '*Although* the hill was steep, we kept climbing.'], ['sub', 'Call me *when* you get home.'],
    ['sub', 'We can go *if* the rain stops.'], ['sub', 'The dog waited *until* we came back.'], ['sub', '*While* Dad cooked, we set the table.'],
    ['corr', '*Either* Ana *or* Sam will bring the cups.'], ['corr', '*Both* the cat *and* the dog were asleep.'], ['corr', '*Neither* the coach *nor* the players heard the bell.'],
    ['corr', 'She *not only* sings *but also* plays the piano.'], ['corr', 'I can’t decide *whether* to read *or* to draw.'],
    ['coord', 'The soup was hot, *so* we waited.'], ['coord', 'Leo wanted to swim, *but* the pool was closed.'], ['coord', 'Do you want milk *or* juice?'],
    ['sub', 'The dog barks *whenever* the doorbell rings.'], ['sub', 'We will wait here *until* the rain stops.'], ['sub', '*Since* the bus was late, we walked.'],
    ['sub', 'Mia hums *while* she paints.'], ['sub', '*Unless* you hurry, you will miss the train.'], ['sub', 'Grandpa smiled *as* the band played.'],
    ['corr', '*Neither* the map *nor* the phone helped us.'], ['corr', 'We will *either* walk *or* bike to the park.'], ['corr', '*Both* Leo *and* Rosa sang in the play.']
  ];
  var CONJ_FILL = [ // [sentence with ___, right, wrongs, why]
    ['We were hungry, ___ we made sandwiches.', 'so', ['but', 'or'], 'the second part is a result of the first'], ['The hill was steep, ___ we kept climbing.', 'but', ['so', 'or'], 'the second part goes against what you would expect'],
    ['You can take the bus, ___ you can walk.', 'or', ['so', 'but'], 'the two parts are choices'], ['We stayed inside ___ it was raining.', 'because', ['although', 'unless'], 'the clause gives the reason'],
    ['___ it was cold, Ana wore shorts.', 'Although', ['Because', 'If'], 'the clause says something that goes against the main idea'], ['We can play outside ___ the rain stops.', 'if', ['although', 'because'], 'the clause gives a condition'],
    ['Leo likes apples, ___ he likes pears too.', 'and', ['but', 'or'], 'the second part adds a similar idea'], ['The puppy slept ___ we watched the movie.', 'while', ['unless', 'although'], 'the two things happened at the same time'],
    ['Call me ___ you get home.', 'when', ['although', 'unless'], 'the clause tells when'], ['Mia was tired, ___ she finished the race.', 'yet', ['so', 'or'], 'the second part is a surprise after the first']
  ];
  var CK = { coord: 'coordinating', sub: 'subordinating', corr: 'correlative' };
  var CK_WHY = { coord: 'it joins two equal parts (it is one of for, and, nor, but, or, yet, so)', sub: 'it starts a dependent clause, which can’t stand alone', corr: 'the two words work as a pair' };
  var PREP_CONJ = [['after', 'We left *after* the game.', 'We left *after* the game ended.'], ['before', 'Brush your teeth *before* bed.', 'Brush your teeth *before* you go to bed.'],
    ['since', 'It has snowed *since* Monday.', 'It has snowed *since* we woke up.'], ['until', 'Wait *until* noon.', 'Wait *until* the bell rings.'],
    ['until', 'The store stays open *until* nine.', 'The store stays open *until* everyone leaves.']];
  function starAll(s) { return s.replace(/\*([^*]+)\*/g, '<u>$1</u>'); }
  G('gram.conjunctions', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['kind', 'fill']), R.pick(['kind', 'fill', 'find']), R.pick(['prepconj', 'kind', 'fill']));
    if (shape === 'fill') {
      var f = R.pick(CONJ_FILL);
      return { q: Q(P('Which conjunction fits best?'), S(f[0])), a: mc(f[1], f[2]),
        hint: 'How do the two parts relate: adding, contrasting, choosing, giving a reason, a result, a condition or a time?',
        steps: [cap(I(f[1].toLowerCase())) + ' fits because ' + f[3] + '.', '“' + f[0].replace('___', f[1]) + '”'] };
    }
    if (shape === 'prepconj') {
      var e = R.pick(PREP_CONJ), asConj = R.coin(), s = asConj ? e[2] : e[1];
      return { q: Q(P('Is the underlined word a preposition or a conjunction here?'), S(starHTML(s))), a: mcKeep(['preposition', 'subordinating conjunction'], asConj ? 1 : 0),
        hint: 'Look at what follows: just a noun, or a clause with its own subject and verb?',
        steps: asConj ? ['After ' + I(e[0]) + ' comes a clause with its own subject and verb: “' + s.split('*')[2].replace(/^ /, '').replace(/\.$/, '') + '”.', 'So ' + I(e[0]) + ' is a subordinating conjunction here.'] : ['After ' + I(e[0]) + ' comes only a noun: ' + I(s.split('*')[2].replace(/^ /, '').replace(/\.$/, '')) + '.', 'That noun is its object, so ' + I(e[0]) + ' is a preposition here.'] };
    }
    var pool = L === 1 ? CONJ_S.filter(function (x) { return x[0] !== 'corr'; }) : CONJ_S, ex = R.pick(pool);
    if (shape === 'find') {
      var sub = R.pick(CONJ_S.filter(function (x) { return x[0] === 'sub'; })), w = sub[1].match(/\*([^*]+)\*/)[1];
      var plain = starPlain(sub[1]), others = plain.replace(/[.,]/g, '').split(' ').filter(function (x) { return x !== w && x.toLowerCase() !== w.toLowerCase() && !/^(the|a|we|it|me|you)$/i.test(x); });
      return { q: Q(P('Which word is a subordinating conjunction?'), S(plain)), a: mc(w, others, 4),
        hint: 'A subordinating conjunction starts a clause that can’t stand alone.',
        steps: [cap(I(w.toLowerCase())) + ' starts a clause with its own subject and verb.', 'That clause can’t stand alone as a sentence, so ' + I(w.toLowerCase()) + ' is a subordinating conjunction.'] };
    }
    var words = (ex[1].match(/\*([^*]+)\*/g) || []).map(function (x) { return x.replace(/\*/g, '').toLowerCase(); });
    return { q: Q(P('What kind of conjunction is underlined?'), S(starAll(ex[1]))), a: mcKeep(['coordinating', 'subordinating', 'correlative'], ['coord', 'sub', 'corr'].indexOf(ex[0])),
      hint: 'FANBOYS (for, and, nor, but, or, yet, so) are coordinating. Pairs are correlative. Words like because and when start a dependent clause.',
      steps: [cap(I(words.join(' … '))) + ' is ' + CK[ex[0]] + ': ' + CK_WHY[ex[0]] + '.'].concat(ex[0] === 'sub' ? ['Because, although, when, if and until are not like and or but: the clause they start leans on the rest of the sentence.'] : []) };
  });

  /* ---------------------------------------------------------------- gram.interjections */
  var INTJ = [ // [mild?, interjection, the rest]
    [true, 'Well', 'maybe we can go tomorrow.'], [true, 'Oh', 'I see what you mean.'], [true, 'Hmm', 'that is a hard question.'], [true, 'Yes', 'I would like some soup.'],
    [true, 'No', 'thank you.'], [true, 'Ah', 'now it makes sense.'], [false, 'Ouch', 'That pan is hot!'], [false, 'Wow', 'Look at that rainbow!'],
    [false, 'Hooray', 'We won!'], [false, 'Yikes', 'The milk spilled!'], [false, 'Hey', 'Watch out!'], [false, 'Whoa', 'Slow down!']
  ];
  G('gram.interjections', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['mark', 'find']), R.pick(['all', 'mark']));
    var e = R.pick(INTJ);
    if (shape === 'find') {
      var s = e[0] ? e[1] + ', ' + e[2] : e[1] + '! ' + e[2];
      var rest = e[2].replace(/[.!,]/g, '').split(' ').filter(function (x) { return x.length > 2 && x.toLowerCase() !== e[1].toLowerCase(); });
      return { q: Q(P('Which word is the interjection?'), S(s)), a: mc(e[1], R.sample(rest, M_(2, rest.length)), 3),
        hint: 'An interjection shows feeling and stands apart from the rest of the sentence.',
        steps: [cap(I(e[1])) + ' shows ' + (e[0] ? 'a mild feeling' : 'strong feeling') + ' and isn’t part of the sentence’s grammar.', 'It is set off ' + (e[0] ? 'with a comma' : 'with an exclamation point') + '.'] };
    }
    var mild = R.pick(INTJ.filter(function (x) { return x[0]; }));
    if (shape === 'mark') {
      var right = mild[1] + ', ' + mild[2];
      return { q: P('Which sentence sets off the mild interjection the usual way?'), a: mc(right, [mild[1] + ' ' + mild[2], mild[1] + '. ' + mild[2], mild[1] + '! ' + mild[2]], L === 1 ? 3 : 3),
        hint: 'A mild interjection is set off with a comma. Strong feeling gets an exclamation point and a new sentence.',
        steps: [cap(I(mild[1])) + ' is mild here, so a comma sets it off: “' + right + '”', 'With no mark, it runs into the sentence. A period or an exclamation point would end a sentence, so the next word would need a capital, and an exclamation point would make the mild word sound loud.'] };
    }
    var strong = R.pick(INTJ.filter(function (x) { return !x[0]; })), rest2 = strong[2].charAt(0).toLowerCase() + strong[2].slice(1);
    var items = [{ text: strong[1] + '! ' + strong[2], ok: true }, { text: strong[1] + ', ' + rest2, ok: true }, { text: strong[1] + ' ' + rest2, ok: false }, { text: strong[1] + '! ' + rest2, ok: false }];
    return { q: P('Which of these are punctuated correctly? Choose all that are.'), a: mcAll(R.shuffle(items)),
      hint: 'A strong interjection can stand alone with an exclamation point, or join the sentence with a comma.',
      steps: ['“' + strong[1] + '! ' + strong[2] + '”: the interjection stands alone, and a new sentence starts with a capital. Correct.', '“' + strong[1] + ', ' + rest2 + '”: the interjection is joined with a comma, and the whole sentence ends with an exclamation point. Also correct.', 'With no mark, or with an exclamation point followed by a small letter, it is not correct.'] };
  });
  function M_(a, b) { return Math.min(a, b); }

  /* ---------------------------------------------------------------- gram.word-jobs */
  G('gram.word-jobs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'which', 'which', R.pick(['sentence', 'which']));
    var J = R.pick(L === 1 ? JOBS.filter(function (j) { return j.uses.every(function (u) { return /^(n|v|adj|adv)$/.test(u[0]); }); }) : JOBS);
    if (shape === 'sentence') {
      var u = R.pick(J.uses), target = u[0];
      var wrongS = J.uses.filter(function (x) { return x[0] !== target; }).map(function (x) { return starPlain(x[1]); });
      return { q: P('In which sentence is ' + I(J.w) + ' used as ' + an(POSN[target]) + ' ' + POSN[target] + '?'), a: mc(starPlain(u[1]), wrongS),
        hint: 'Check the job of ' + J.w + ' in each sentence.',
        steps: J.uses.map(function (x) { return '“' + starPlain(x[1]) + '”: ' + POSN[x[0]] + ', because ' + JOB_WHY[x[0]] + '.'; }) };
    }
    var u2 = R.pick(J.uses), others = J.uses.filter(function (x) { return x[0] !== u2[0]; }).map(function (x) { return POSN[x[0]]; });
    var extra = R.shuffle(['noun', 'verb', 'adjective', 'adverb', 'preposition'].filter(function (x) { return x !== POSN[u2[0]] && others.indexOf(x) < 0; }));
    return { q: Q(P('What part of speech is the underlined word in this sentence?'), S(starHTML(u2[1]))), a: mc(POSN[u2[0]], others.concat(extra), L === 1 ? 3 : 4),
      hint: 'The dictionary may list several parts of speech. Look at the job the word does here.',
      steps: ['Here ' + I(J.w) + ' is ' + an(POSN[u2[0]]) + ' ' + POSN[u2[0]] + ': ' + JOB_WHY[u2[0]] + '.'].concat(J.uses.filter(function (x) { return x !== u2; }).slice(0, 1).map(function (x) { return 'Compare: “' + starPlain(x[1]) + '” uses it as ' + an(POSN[x[0]]) + ' ' + POSN[x[0]] + '.'; })) };
  });

  /* ================================================================ Unit 2: subjects, predicates and complements */
  var ROLE_NAME = { s: 'subject', v: 'verb', do: 'direct object', io: 'indirect object', pn: 'predicate noun', pa: 'predicate adjective', oc: 'object complement' };

  /* ---------------------------------------------------------------- gram.subject-predicate */
  G('gram.subject-predicate', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['subject', 'split']), R.pick(['subject', 'split', 'thing']), R.pick(['intro', 'subject']));
    var o = { subjPP: L > 1 ? R.chance(0.6) : false, subj: R.pick(['person', 'animal', 'name']), adj: L > 1 ? null : true };
    if (shape === 'thing') o = { kind: 'sense', adj: true };
    if (shape === 'intro') o.introPP = true;
    var c = compose(R, o), sf = c.subj.from, st = c.subj.to;
    var subj = phraseLow(c, sf, st), subjC = sf === 0 ? cap(subj) : subj, head = c.toks[st].w;
    if (c.info.subjPP) head = c.toks.filter(function (t, i) { return i >= sf && i <= st && t.role === 's'; })[0].w;
    if (shape === 'split') {
      var vw = c.toks[st + 1].w;
      var wr = [c.toks[st].w, c.toks[Math.min(st + 2, c.toks.length - 1)].w, c.toks[sf + 1] ? c.toks[sf + 1].w : null];
      return { q: Q(P('Where does the complete predicate begin? Choose its first word.'), S(c.text)), a: mc(vw, wr.filter(function (w) { return w !== vw && once(c, w); }), 3),
        viz: sentViz(c.words), hint: 'Find the verb. The predicate starts with it (or with a helping verb in front of it).',
        steps: ['The subject is ' + qt(subjC) + ': it tells who or what the sentence is about.', 'The rest, ' + qt(phraseLow(c, st + 1, c.toks.length - 1)) + ', tells what ' + (c.info.kind === 'sense' ? 'the subject is like' : 'happened') + '.', 'So the complete predicate begins with ' + I(vw) + '.'] };
    }
    var capIf = function (x) { return sf === 0 && x.split(' ').length > 1 ? cap(x) : x; };
    var wrongs = [c.toks[sf].w === head ? null : head, capIf(phraseLow(c, sf, st + 1))];
    if (c.info.subjPP) { var hi = c.toks.map(function (t) { return t.w; }).indexOf(head, sf); wrongs.unshift(capIf(phraseLow(c, sf, hi))); }
    if (shape === 'intro') wrongs.unshift(cap(phraseLow(c, 0, sf - 1)), cap(phraseLow(c, 0, st)));
    if (wrongs.filter(Boolean).length < 2) wrongs.push(phraseLow(c, st + 1, c.toks.length - 1));
    var right = capIf(subj);
    return { q: Q(P('Which words make up the complete subject?'), S(c.text)), a: mc(right, wrongs.filter(function (w) { return w && w !== right; }), L === 1 ? 3 : 4),
      viz: sentViz(c.words), hint: shape === 'intro' ? 'The sentence starts with a phrase that tells when. Who or what is the sentence about?' : 'Ask: who or what is this sentence about? Take every word that belongs with that.',
      steps: (shape === 'intro' ? [qt(cap(phraseLow(c, 0, sf - 1))) + ' tells when. It is not who or what the sentence is about.'] : []).concat(['Who or what is the sentence about? ' + qt(right) + '.', 'Everything from the verb on, ' + qt(phraseLow(c, st + 1, c.toks.length - 1)) + ', is the complete predicate.'], c.info.subjPP ? ['The phrase ' + qt(c.info.subjPP[0] + ' ' + c.info.subjPP[2].concat([c.info.subjPP[1]]).join(' ')) + ' tells which ' + head + ', so it belongs to the subject.'] : [], c.info.kind === 'sense' ? ['The subject doesn’t have to be a person: here it is a thing.'] : []) };
  });

  /* ---------------------------------------------------------------- gram.simple-subject-verb */
  var OF_SUBJ = [
    ['One of the puppies sleeps in a basket.', 'One', 'puppies', 'sleeps'], ['The box of crayons is on the shelf.', 'box', 'crayons', 'is'],
    ['Each of the players gets a medal.', 'Each', 'players', 'gets'], ['The basket of apples sits by the door.', 'basket', 'apples', 'sits'],
    ['A flock of geese flew over the barn.', 'flock', 'geese', 'flew'], ['The leader of the hikers checked the map.', 'leader', 'hikers', 'checked'],
    ['The sound of the drums filled the hall.', 'sound', 'drums', 'filled'], ['Neither of the doors was locked.', 'Neither', 'doors', 'was locked'],
    ['The cups on the table are clean.', 'cups', 'table', 'are'], ['A bag of marbles spilled on the floor.', 'bag', 'marbles', 'spilled']
  ];
  G('gram.simple-subject-verb', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['subject', 'verb']), R.pick(['of', 'verb', 'subject']), R.pick(['of', 'verb']));
    if (shape === 'of') {
      var e = R.pick(OF_SUBJ), rest = e[0].replace(/[.,]/g, '').split(' ');
      var other = rest.filter(function (w) { return w !== e[1] && w !== e[2] && e[3].split(' ').indexOf(w) < 0 && w.length > 3; });
      return { q: Q(P('What is the simple subject?'), S(e[0])), a: mc(e[1], [e[2]].concat(R.shuffle(other)), 4),
        hint: 'Cross out the prepositional phrase first (of the …, on the …). The subject is never inside it.',
        steps: ['Cross out the phrase that starts with ' + I(e[0].match(/ (of|on) /)[1]) + ': ' + I(e[0].match(/ ((of|on) the \w+|of \w+)/)[1]) + '.', 'What is left: ' + qt(e[0].replace(/ ((of|on) the \w+|of \w+)/, '')) + '', 'The simple subject is ' + I(e[1]) + '. ' + cap(I(e[2])) + ' is the object of the preposition, not the subject.'] };
    }
    var tn = L === 1 ? 'past' : R.pick(['past', 'past-prog', 'pres-perf', 'pp-prog', 'future', 'modal']);
    var c = compose(R, { kind: tn === 'past' ? null : R.pick(['intr', 'tr']), subjPP: L > 1, subj: R.pick(['person', 'animal']), adj: true, tense: tn, noNounish: true });
    var head = c.toks.filter(function (t) { return t.role === 's'; })[0].w, vp = c.info.vp.join(' ');
    if (shape === 'subject') {
      var wr = [];
      c.toks.forEach(function (t, i) { if (i >= c.subj.from && i <= c.subj.to && t.pos !== 'prep' && t.w !== head && !/^(the|a|an)$/i.test(t.w)) wr.push(t.w); });
      wr.push(vp, phraseLow(c, c.subj.from, c.toks.map(function (t) { return t.w; }).indexOf(head, c.subj.from)));
      return { q: Q(P('What is the simple subject?'), S(c.text)), a: mc(head, wr, L === 1 ? 3 : 4), viz: sentViz(c.words),
        hint: 'Find the complete subject, then the one key noun in it.',
        steps: ['The complete subject is ' + qt(phrase(c, c.subj.from, c.subj.to)) + '.', 'The key word, the one the others describe, is ' + I(head) + '.'].concat(c.info.subjPP ? ['The noun in the phrase ' + qt(c.info.subjPP[0] + ' … ' + c.info.subjPP[1]) + ' is the object of a preposition, not the subject.'] : []) };
    }
    var main = c.info.vp[c.info.vp.length - 1];
    var wr2 = [main, head, c.info.vp.length > 1 ? c.info.vp.slice(1).join(' ') : c.info.obj || null, c.info.vp.length > 1 ? c.info.vp[0] : null, c.info.pa || c.info.pn || null, c.info.adv || null, c.toks[c.subj.from + 1] && c.toks[c.subj.from + 1].pos === 'adj' ? c.toks[c.subj.from + 1].w : null].filter(Boolean);
    return { q: Q(P('What is the simple predicate (the verb, with any helping verbs)?'), S(c.text)), a: mc(vp, wr2, L === 1 ? 3 : 4), viz: sentViz(c.words),
      hint: 'Find the word that shows the action or state, then add any helping verbs in front of it.',
      steps: ['The main verb is ' + I(main) + '.'].concat(c.info.vp.length > 1 ? ['The helping verb' + (c.info.vp.length > 2 ? 's' : '') + ' ' + ML.util.list(c.info.vp.slice(0, -1).map(I)) + ' belong' + (c.info.vp.length > 2 ? '' : 's') + ' with it.'] : [], ['The simple predicate is ' + I(vp) + '.']) };
  });

  /* ---------------------------------------------------------------- gram.hard-to-find-subjects */
  var HARD = [ // [sentence, subject, kind, tempting wrong answers]
    ['Did the bus leave early?', 'bus', 'q', ['Did', 'early']], ['Where is your coat?', 'coat', 'q', ['Where', 'your']], ['Has Leo finished his homework?', 'Leo', 'q', ['homework', 'Has']],
    ['Can the twins come to the party?', 'twins', 'q', ['party', 'Can']], ['Why are the ducks so noisy?', 'ducks', 'q', ['Why', 'noisy']], ['Is the library open today?', 'library', 'q', ['open', 'today']],
    ['What did Mia bring?', 'Mia', 'q', ['What', 'bring']], ['There are three apples in the bowl.', 'apples', 'there', ['There', 'bowl']],
    ['There is a frog in the pool.', 'frog', 'there', ['There', 'pool']], ['There were two owls on the fence.', 'owls', 'there', ['There', 'fence']],
    ['There goes the bus.', 'bus', 'there', ['There', 'goes']], ['Here comes the parade.', 'parade', 'here', ['Here', 'comes']],
    ['Here are your gloves.', 'gloves', 'here', ['Here', 'your']], ['Here is the key to the shed.', 'key', 'here', ['Here', 'shed']],
    ['Close the door, please.', '(you)', 'cmd', ['door', 'There is no subject.']], ['Sit down.', '(you)', 'cmd', ['Sit', 'There is no subject.']],
    ['Please pass the salt.', '(you)', 'cmd', ['salt', 'Please']], ['Wash your hands before dinner.', '(you)', 'cmd', ['hands', 'There is no subject.']],
    ['Leo, feed the cat.', '(you)', 'cmd', ['Leo', 'cat']], ['Mia, please open the window.', '(you)', 'cmd', ['Mia', 'window']],
    ['Under the bridge lived a troll.', 'troll', 'inv', ['bridge', 'Under']], ['Into the room ran the puppy.', 'puppy', 'inv', ['room', 'ran']],
    ['On the shelf sat a dusty jar.', 'jar', 'inv', ['shelf', 'dusty']]
  ];
  var HARD_WHY = {
    q: 'Turn the question into a statement: ', there: 'There only gets the sentence started. Turn it around: ', here: 'Here tells where. Turn it around: ',
    cmd: 'A command speaks to someone, so the subject is “you,” understood. ', inv: 'The sentence is turned around. Put it back in the usual order: '
  };
  var HARD_TURN = {
    'Did the bus leave early?': 'The bus did leave early.', 'Where is your coat?': 'Your coat is (where?).', 'Has Leo finished his homework?': 'Leo has finished his homework.',
    'Can the twins come to the party?': 'The twins can come to the party.', 'Why are the ducks so noisy?': 'The ducks are so noisy (why?).', 'Is the library open today?': 'The library is open today.',
    'What did Mia bring?': 'Mia did bring (what?).', 'There are three apples in the bowl.': 'Three apples are in the bowl.', 'There is a frog in the pool.': 'A frog is in the pool.',
    'There were two owls on the fence.': 'Two owls were on the fence.', 'There goes the bus.': 'The bus goes there.', 'Here comes the parade.': 'The parade comes here.',
    'Here are your gloves.': 'Your gloves are here.', 'Here is the key to the shed.': 'The key to the shed is here.', 'Under the bridge lived a troll.': 'A troll lived under the bridge.',
    'Into the room ran the puppy.': 'The puppy ran into the room.', 'On the shelf sat a dusty jar.': 'A dusty jar sat on the shelf.'
  };
  G('gram.hard-to-find-subjects', function (R, ctx) {
    var L = ctx.level, pool = L === 1 ? HARD.filter(function (h) { return h[2] === 'q' || h[2] === 'cmd' && !/^(Leo|Mia),/.test(h[0]); }) : L === 2 ? HARD.filter(function (h) { return h[2] !== 'inv'; }) : HARD;
    if (L === 3 && R.chance(0.35)) {
      var two = R.sample(HARD.filter(function (h) { return h[2] !== 'cmd'; }), 2), cmd = R.pick(HARD.filter(function (h) { return h[2] === 'cmd'; }));
      return { q: P('Which sentence has an understood subject (you)?'), a: mc(cmd[0], two.map(function (h) { return h[0]; })),
        hint: 'Which one gives a command or makes a request?',
        steps: ['“' + cmd[0] + '” tells someone to do something. Its subject is “you,” understood.'].concat(/^(Leo|Mia),/.test(cmd[0]) ? [cmd[0].split(',')[0] + ' is the person spoken to (a noun of direct address), not the subject.'] : [], two.map(function (h) { return '“' + h[0] + '” has a stated subject: ' + h[1] + '.'; })) };
    }
    var e = R.pick(pool), right = e[1] === '(you)' ? 'you (understood)' : e[1];
    var wr = e[3].slice();
    if (e[2] === 'cmd') wr.push(e[0].split(' ')[0].replace(/,$/, '') === 'Please' ? 'There is no subject.' : null);
    return { q: Q(P('What is the simple subject of this sentence?'), S(e[0])), a: mc(right, wr.filter(Boolean), L === 1 ? 3 : 3),
      hint: { q: 'Turn the question into a statement.', there: 'There and here are almost never the subject. Turn the sentence around.', here: 'There and here are almost never the subject. Turn the sentence around.', cmd: 'Who is being told to do this?', inv: 'Put the words back in the usual order: who did it?' }[e[2]],
      steps: e[2] === 'cmd' ? [HARD_WHY.cmd, /^(Leo|Mia),/.test(e[0]) ? e[0].split(',')[0] + ' is the person spoken to, set off with a comma: a noun of direct address, not the subject.' : 'The sentence has a subject even though the word you isn’t written.', 'The subject is you (understood).'] : [HARD_WHY[e[2]] + '“' + HARD_TURN[e[0]] + '”', 'Who or what is it about? ' + cap(e[1]) + '.', 'So the simple subject is ' + I(e[1]) + '.'] };
  });

  /* ---------------------------------------------------------------- gram.sentence-purposes */
  var PURP = [ // [sentence, kind]  kinds: dec int imp exc
    ['The library opens at nine.', 'dec'], ['I wonder who won the game.', 'dec'], ['Leo asked where the bus stop was.', 'dec'], ['Our cat sleeps all day.', 'dec'],
    ['Did you feed the fish?', 'int'], ['Where is the nearest library?', 'int'], ['How tall is that tree?', 'int'], ['Can you help me?', 'int'],
    ['Please close the door.', 'imp'], ['Close the door!', 'imp'], ['Hand me the scissors, please.', 'imp'], ['Watch out for the ice!', 'imp'], ['Turn left at the corner.', 'imp'],
    ['What a game that was!', 'exc'], ['How tall you have grown!', 'exc'], ['We won the championship!', 'exc'], ['That was so much fun!', 'exc']
  ];
  var HOW_ADV = { carefully: 1, slowly: 1, quickly: 1, hard: 1, far: 1, early: 1, neatly: 1, easily: 1, loudly: 1, softly: 1, quietly: 1 };
  // a sentence of each kind made from one composed action: The baker painted the fence. / Did the baker paint the fence? / Paint the fence. / How carefully the baker painted the fence!
  function madePurpose(R) {
    var c = composeWhere(R, { kind: 'tr', subj: R.pick(['name', 'person']), adv: true, place: false }, function (c) { return HOW_ADV[c.info.adv]; });
    var k = R.pick(['dec', 'int', 'imp', 'exc']), subj = phraseLow(c, c.subj.from, c.subj.to), vb = c.info.verb, obj = c.toks.filter(function (t) { return t.grp === 'do'; }).map(function (t) { return t.w; }).join(' ');
    if (k === 'dec') return [c.text.replace(' ' + c.info.adv, ''), 'dec'];
    if (k === 'int') return ['Did ' + subj + ' ' + vb + ' ' + obj + '?', 'int'];
    if (k === 'imp') return [R.pick(['', 'Please ']) ? 'Please ' + vb + ' ' + obj + '.' : cap(vb) + ' ' + obj + '.', 'imp'];
    return ['How ' + c.info.adv + ' ' + subj + ' ' + c.info.vp.join(' ') + ' ' + obj + '!', 'exc'];
  }
  var PK = { dec: 'declarative', int: 'interrogative', imp: 'imperative', exc: 'exclamatory' };
  var PK_WHY = { dec: 'it makes a statement', int: 'it asks a question someone could answer', imp: 'it gives a command or makes a request (the subject is you, understood)', exc: 'it shows strong feeling' };
  G('gram.sentence-purposes', function (R, ctx) {
    var L = ctx.level, pool = L === 1 ? PURP.filter(function (p) { return !/wonder|asked|Close the door!|Watch out|How tall you/.test(p[0]); }) : PURP;
    var e = R.pick(L === 3 ? PURP.filter(function (p) { return /wonder|asked|!|How/.test(p[0]); }) : pool);
    if (R.chance(L === 3 ? 0.35 : 0.6)) e = madePurpose(R);
    var kinds = ['dec', 'int', 'imp', 'exc'];
    // a command that ends with ! : its purpose is to command; leave exclamatory out so no textbook's label is marked wrong
    if (e[1] === 'imp' && /!$/.test(e[0])) kinds = ['dec', 'int', 'imp'];
    return { q: Q(P('What kind of sentence is this?'), S(e[0])), a: mcKeep(kinds.map(function (k) { return PK[k]; }), kinds.indexOf(e[1])),
      hint: 'Ask what the sentence does: state, ask, command or exclaim. Don’t judge by the end mark alone.',
      steps: ['The sentence is ' + PK[e[1]] + ': ' + PK_WHY[e[1]] + '.'].concat(/wonder|asked/.test(e[0]) ? ['It contains a question word, but it only reports a question; nobody needs to answer. So it ends with a period.'] : [], e[1] === 'imp' && /!$/.test(e[0]) ? ['The exclamation point shows force, but the sentence still gives a command.'] : [], /^How tall you/.test(e[0]) ? ['It starts with How, but it doesn’t ask anything.'] : []) };
  });

  /* ---------------------------------------------------------------- compound subjects and verbs (a small builder) */
  // compoundS(R, cs, cv): a sentence with a compound subject (cs) and/or a compound verb (cv); returns { words, text, spec, subj, verbs }
  function compoundS(R, cs, cv) {
    var names = R.sample(NAMES, 3), conjS = R.chance(0.8) ? 'and' : 'or', vs = R.sample(Object.keys(INTR_P), 2);
    var subj = cs ? [names[0], names[1]] : [names[0]];
    var verbs = vs.map(function (v) { return VF[v][1]; });
    if (!cv) verbs = verbs.slice(0, 1);
    var place = !cv && R.chance(0.6) ? R.pick(INTR_P[vs[0]].place) : null;
    var words = [subj[0]].concat(cs ? [conjS, subj[1]] : [], cv ? [verbs[0], 'and', verbs[1]] : [verbs[0]]);
    if (place) words = words.concat([place[0]], place[2], [place[1]]);
    words[words.length - 1] += '.';
    var sNode = cs ? D().and(conjS, subj) : D().n(subj[0]);
    var vNode = cv ? D().and('and', verbs) : D().n(verbs[0], place ? [D().pp(place[0], place[1], place[2].slice())] : undefined);
    return { words: words, text: words.join(' '), spec: D().clause({ s: sNode, v: vNode }), subj: subj, verbs: verbs, conj: conjS };
  }
  G('gram.compound-subjects-verbs', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'which', R.pick(['which', 'comma']), R.pick(['comma', 'which', 'verbs']));
    var cs = R.coin(), cv = R.coin(); if (!cs && !cv && L === 1) cs = true;
    var c = compoundS(R, cs, cv), CH = ['a compound subject', 'a compound verb', 'both', 'neither'];
    var k = cs && cv ? 2 : cs ? 0 : cv ? 1 : 3;
    if (shape === 'comma') {
      var c2 = compoundS(R, R.coin(), true), right = c2.text, bad = c2.text.replace(' ' + c2.verbs[0] + ' and', ' ' + c2.verbs[0] + ', and');
      var bad2 = c2.subj.length > 1 ? c2.text.replace(c2.subj[0] + ' ' + c2.conj, c2.subj[0] + ', ' + c2.conj) : c2.subj[0] + ', ' + c2.text.slice(c2.subj[0].length + 1);
      return { q: P('Which sentence follows the usual comma rule?'), a: mc(right, [bad, bad2]),
        hint: 'A comma goes before and when it joins two sentences. Does a whole sentence come after this and?',
        steps: ['The words after and, ' + qt(c2.verbs[1]) + ', have no subject of their own: they share the subject.', 'So this is a compound verb in one sentence, not two sentences.', 'No comma is needed: “' + right + '”'] };
    }
    if (shape === 'verbs') {
      return { q: Q(P('What is the simple predicate: the verb or verbs?'), S(c.text)), a: mc(c.verbs.join(' and '), [c.verbs[0], c.subj.join(' ' + c.conj + ' '), c.verbs[c.verbs.length - 1]].filter(function (x) { return x !== c.verbs.join(' and '); }), 3),
        hint: 'Is there more than one verb that shares the subject?',
        steps: cv ? ['Both ' + I(c.verbs[0]) + ' and ' + I(c.verbs[1]) + ' tell what ' + c.subj.join(' ' + c.conj + ' ') + ' did.', 'They share one subject, so together they make a compound verb: ' + I(c.verbs.join(' and ')) + '.'] : ['There is only one verb: ' + I(c.verbs[0]) + '.'] };
    }
    return { q: Q(P('Does this sentence have a compound subject, a compound verb, both, or neither?'), S(c.text)), a: mcKeep(L === 1 ? CH.slice(0, 3) : CH, k),
      hint: 'Count the subjects that share the verb, and the verbs that share the subject.',
      steps: [cs ? 'Subject: ' + I(c.subj.join(' ' + c.conj + ' ')) + ': two subjects joined by ' + I(c.conj) + '.' : 'Subject: ' + I(c.subj[0]) + ' (one).', cv ? 'Verb: ' + I(c.verbs.join(' and ')) + ': two verbs that share the subject.' : 'Verb: ' + I(c.verbs[0]) + ' (one).', 'So the answer is ' + CH[k] + '.'] };
  });

  /* ---------------------------------------------------------------- gram.direct-objects */
  G('gram.direct-objects', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['find', 'has']), R.pick(['which', 'has']));
    if (shape === 'which') {
      var seedA = compose(R, { kind: 'tr', subj: R.pick(['name', 'person']), place: false }), b = compose(R, { kind: 'pn' }), d = compose(R, { kind: 'intr', place: true, adv: false, subj: 'name' });
      return { q: P('Which sentence has a direct object?'), a: mc(seedA.text, [b.text, d.text]),
        hint: 'Find each verb. Does a noun after it receive the action?',
        steps: ['“' + seedA.text + '”: ' + I(seedA.info.obj) + ' receives the action of ' + I(seedA.info.vp.join(' ')) + '. It is a direct object.', '“' + b.text + '”: ' + I(b.info.pn) + ' renames the subject after a linking verb. It is a predicate noun.', '“' + d.text + '”: ' + I(d.info.place[1]) + ' is the object of the preposition ' + I(d.info.place[0]) + ', not of the verb.'] };
    }
    if (shape === 'has') {
      var kind = R.pick(['tr', 'pn', 'intrpp']), c = kind === 'intrpp' ? compose(R, { kind: 'intr', place: true, adv: false, subj: R.pick(['name', 'person']) }) : compose(R, { kind: kind, place: false, subj: R.pick(['name', 'person']) });
      var has = kind === 'tr';
      return { q: Q(P('Does this sentence have a direct object?'), S(c.text)), a: mcKeep(['Yes', 'No'], has ? 0 : 1),
        hint: 'Ask “' + c.info.vp.join(' ') + ' what?” or “whom?” Does the answer receive an action?',
        steps: has ? ['“' + cap(c.info.vp.join(' ')) + ' what?” ' + cap(c.info.obj) + '.', I(cap(c.info.obj)) + ' receives the action, so it is a direct object.'] : kind === 'pn' ? [cap(I(c.info.vp.join(' '))) + ' is a linking verb: nothing receives an action.', cap(I(c.info.pn)) + ' renames the subject, so it is a predicate noun, not a direct object.'] : ['“' + cap(c.info.vp.join(' ')) + ' what?” Nothing answers.', cap(I(c.info.place[1])) + ' comes after the preposition ' + I(c.info.place[0]) + ': it is the object of the preposition, not a direct object.'] };
    }
    var c2 = compose(R, { kind: L === 1 ? 'tr' : R.pick(['tr', 'tr', 'ditr']), place: L > 1 ? R.chance(0.6) : false, subj: R.pick(['name', 'person', 'animal']) });
    var obj = c2.info.obj, wr = [c2.toks.filter(function (t) { return t.role === 's'; })[0].w, c2.info.place ? c2.info.place[1] : null, c2.info.io || null, c2.info.vp.join(' ')];
    return { q: Q(P('What is the direct object?'), S(c2.text)), a: mc(obj, wr.filter(Boolean), L === 1 ? 3 : 4), viz: tagViz(c2.words),
      hint: 'Find the verb, then ask “' + c2.info.vp.join(' ') + ' what?” or “whom?”',
      steps: ['The verb is ' + I(c2.info.vp.join(' ')) + '.', '“' + cap(c2.info.vp.join(' ')) + ' what?” ' + cap(obj) + '.', cap(I(obj)) + ' receives the action, so it is the direct object.'].concat(c2.info.io ? [cap(I(c2.info.io)) + ' tells to or for whom: it is the indirect object.'] : [], c2.info.place ? [cap(I(c2.info.place[1])) + ' is the object of a preposition, not the direct object.'] : []) };
  });

  /* ---------------------------------------------------------------- gram.indirect-objects */
  function pairDitr(R, o) { var seed = R.int(1, 1e9), a = compose(ML.rand(seed), Object.assign({ kind: 'ditr' }, o)), b = compose(ML.rand(seed), Object.assign({ kind: 'ditr', ioTo: true }, o)); return [a, b]; }
  G('gram.indirect-objects', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['find', 'has']), R.pick(['which', 'has', 'find']));
    var o = { place: false, adv: L > 1 ? null : false, ioPron: L > 1 && R.chance(0.3), subj: R.pick(['name', 'person']) };
    var pr = pairDitr(R, o), c = pr[0], t = pr[1];
    if (shape === 'which') {
      return { q: P('In which sentence is ' + I(c.info.io) + ' an indirect object?'), a: mcKeep([c.text, t.text, 'In both', 'In neither'], 0),
        hint: 'An indirect object comes between the verb and the direct object, with no to or for in front of it.',
        steps: ['“' + c.text + '”: ' + I(c.info.io) + ' sits between the verb and the direct object ' + I(c.info.obj) + ', with no preposition. It is an indirect object.', '“' + t.text + '”: ' + I(c.info.io) + ' follows the preposition ' + I(t.info.toPhrase.split(' ')[0]) + ', so it is the object of the preposition. The two sentences mean the same, but only the first has an indirect object.'] };
    }
    if (shape === 'has') {
      var has = R.coin(), s = has ? c : t;
      return { q: Q(P('Does this sentence have an indirect object?'), S(s.text)), a: mcKeep(['Yes', 'No'], has ? 0 : 1),
        hint: 'Look between the verb and the direct object. Is there a to or for?',
        steps: has ? [cap(I(c.info.io)) + ' comes between the verb and the direct object ' + I(c.info.obj) + '.', 'It tells to or for whom, with no preposition, so it is an indirect object.'] : ['The direct object is ' + I(c.info.obj) + '.', I(cap(t.info.toPhrase)) + ' is a prepositional phrase. ' + cap(I(c.info.io)) + ' is the object of the preposition, so the sentence has no indirect object.'] };
    }
    var wr = [c.info.obj, c.toks.filter(function (x) { return x.role === 's'; })[0].w, c.info.vp.join(' ')];
    return { q: Q(P('What is the indirect object?'), S(c.text)), a: mc(c.info.io, wr, L === 1 ? 3 : 4), viz: tagViz(c.words),
      hint: 'Find the direct object first. Then ask: to whom or for whom?',
      steps: ['The verb is ' + I(c.info.vp.join(' ')) + ' and the direct object is ' + I(c.info.obj) + ' (' + c.info.vp.join(' ') + ' what?).', 'To or for whom? ' + cap(c.info.io) + '.', cap(I(c.info.io)) + ' comes between the verb and the direct object, so it is the indirect object.'] };
  });

  /* ---------------------------------------------------------------- gram.subject-complements */
  G('gram.subject-complements', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'job', 'job', R.pick(['job', 'which']));
    if (shape === 'which') {
      var pn = compose(R, { kind: 'pn', subj: R.pick(['name', 'person']) }), tr = compose(R, { kind: 'tr', place: false, subj: 'name' }), pa = compose(R, { kind: R.pick(['pa', 'sense']), subj: 'name' });
      return { q: P('Which sentence has a predicate noun?'), a: mc(pn.text, [tr.text, pa.text]),
        hint: 'A predicate noun follows a linking verb and renames the subject.',
        steps: ['“' + pn.text + '”: ' + I(pn.info.pn) + ' follows the linking verb and renames the subject. It is a predicate noun.', '“' + tr.text + '”: ' + I(tr.info.obj) + ' receives an action: a direct object.', '“' + pa.text + '”: ' + I(pa.info.pa) + ' describes the subject: a predicate adjective.'] };
    }
    var kind = L === 1 ? R.pick(['pn', 'pa', 'sense']) : R.pick(['pn', 'pa', 'sense', 'tr', 'pn']);
    var c = compose(R, { kind: kind, place: false, adv: false, subj: kind === 'tr' ? R.pick(['name', 'person']) : null });
    var role = kind === 'pn' ? 'pn' : kind === 'tr' ? 'do' : 'pa', idx = idxRole(c, role)[0];
    var CH = L === 1 ? ['predicate noun', 'predicate adjective', 'direct object'] : ['predicate noun', 'predicate adjective', 'direct object', 'indirect object'];
    var w = c.toks[idx].w;
    return { q: Q(P('What job does the underlined word do?'), S(under(c, idx, idx))), a: mcKeep(CH, CH.indexOf(ROLE_NAME[role])),
      hint: 'Is the verb an action verb or a linking verb? Does the word rename the subject, describe it, or receive an action?',
      steps: role === 'do' ? [cap(I(c.info.vp.join(' '))) + ' is an action verb.', cap(I(w)) + ' receives the action, so it is a direct object.'] : [cap(I(c.info.vp.join(' '))) + ' is a linking verb here.', role === 'pn' ? cap(I(w)) + ' renames the subject: ' + phraseLow(c, c.subj.from, c.subj.to) + ' and the ' + w + ' are the same person. It is a predicate noun.' : cap(I(w)) + ' describes the subject, so it is a predicate adjective.', 'Nothing receives an action, so it is not a direct object.'] };
  });

  /* ---------------------------------------------------------------- gram.object-complements */
  G('gram.object-complements', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'job', R.pick(['job', 'find']), R.pick(['which', 'job']));
    if (shape === 'which') {
      var oc = compose(R, { kind: 'oc' }), di = compose(R, { kind: 'ditr', place: false, adv: false }), pn = compose(R, { kind: 'pn' });
      return { q: P('Which sentence has an object complement?'), a: mc(oc.text, [di.text, pn.text]),
        hint: 'An object complement comes after the direct object and renames or describes it.',
        steps: ['“' + oc.text + '”: ' + I(oc.info.oc) + ' ' + (oc.info.ock === 'n' ? 'renames' : 'describes') + ' the direct object ' + I(oc.info.obj) + '. It is an object complement.', '“' + di.text + '”: ' + I(di.info.io) + ' is an indirect object and ' + I(di.info.obj) + ' a direct object; they are different things.', '“' + pn.text + '”: ' + I(pn.info.pn) + ' renames the subject: a predicate noun.'] };
    }
    var useOc = shape === 'find' || R.chance(0.65), c = compose(R, { kind: useOc ? 'oc' : 'ditr', place: false, adv: false });
    if (shape === 'find') {
      var wr = [c.info.obj, c.toks.filter(function (t) { return t.role === 's'; })[0].w, c.info.vp.join(' ')];
      return { q: Q(P('What is the object complement?'), S(c.text)), a: mc(c.info.oc, wr, 4), viz: tagViz(c.words),
        hint: 'Find the direct object. Which word after it renames or describes it?',
        steps: ['The direct object is ' + I(c.info.obj) + ' (' + c.info.vp.join(' ') + ' whom or what?).', cap(I(c.info.oc)) + ' ' + (c.info.ock === 'n' ? 'renames' : 'describes') + ' it: ' + theOf(c.info.obj) + ' is ' + c.info.oc + '.', 'So ' + I(c.info.oc) + ' is the object complement.'] };
    }
    var role = useOc ? R.pick(['oc', 'oc', 'do']) : R.pick(['io', 'do']), idx = idxRole(c, role)[0], w = c.toks[idx].w;
    var CH = ['object complement', 'indirect object', 'direct object', 'predicate noun'];
    var steps;
    if (role === 'oc') steps = ['The direct object is ' + I(c.info.obj) + '.', cap(I(w)) + ' ' + (c.info.ock === 'n' ? 'renames' : 'describes') + ' the direct object: ' + theOf(c.info.obj) + ' is ' + w + '.', 'It completes the object, so it is an object complement (not an indirect object: ' + w + ' and ' + theOf(c.info.obj) + ' are the same).'];
    else if (role === 'io') steps = ['The direct object is ' + I(c.info.obj) + '.', cap(I(w)) + ' is a different person or thing: the one the ' + c.info.obj + ' is given to or made for.', 'So ' + I(w) + ' is an indirect object.'];
    else steps = [cap(I(w)) + ' receives the action of ' + I(c.info.vp.join(' ')) + ', so it is the direct object.'].concat(useOc ? [cap(I(c.info.oc)) + ', after it, is the object complement.'] : []);
    return { q: Q(P('What job does the underlined word do?'), S(under(c, idx, idx))), a: mcKeep(L === 1 ? CH.slice(0, 3) : CH, CH.indexOf(ROLE_NAME[role])),
      hint: 'Is the word the same person or thing as the direct object (an object complement), or a different one (an indirect object)?', steps: steps };
  });

  /* ================================================================ Unit 3: phrases and clauses */
  // underline a word group (its first occurrence) inside a sentence
  function ul(sent, part) { var i = sent.indexOf(part); return i < 0 ? sent : sent.slice(0, i) + '<u>' + part + '</u>' + sent.slice(i + part.length); }

  /* ---------------------------------------------------------------- gram.prepositional-phrases */
  G('gram.prepositional-phrases', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['modifies', 'kind']), R.pick(['kind', 'modifies']), R.pick(['count', 'kind', 'modifies']));
    if (shape === 'count') {
      var c0 = compose(R, { kind: R.pick(['intr', 'tr']), subjPP: R.coin(), place: R.chance(0.8), introPP: R.chance(0.3), subj: R.pick(['person', 'animal']), adv: false });
      var n = c0.toks.filter(function (t) { return t.pos === 'prep'; }).length;
      var pps = []; c0.toks.forEach(function (t, i) { if (t.pos === 'prep') { var j = i + 1; while (j < c0.toks.length && c0.toks[j].pos !== 'n') j++; pps.push(phraseLow(c0, i, j)); } });
      return { q: Q(P('How many prepositional phrases are in this sentence?'), S(c0.text)), a: mcKeep(['0', '1', '2', '3'], n),
        hint: 'Find each preposition, then its object (the noun that ends the phrase).',
        steps: n ? ['The prepositional phrases are ' + ML.util.list(pps.map(function (p) { return qt(p); })) + '.', 'That makes ' + n + '.'] : ['There is no preposition with an object, so there are no prepositional phrases.'] };
    }
    var adjPhrase = shape === 'kind' ? R.coin() : R.chance(0.5);
    var c = adjPhrase ? compose(R, { kind: R.pick(['intr', 'tr']), subjPP: true, place: false, subj: R.pick(['person', 'animal']), adv: false })
      : compose(R, { kind: R.pick(['intr', 'tr']), subjPP: false, place: true, subj: R.pick(['person', 'animal', 'name']), adv: false });
    var grp = adjPhrase ? 'sp.pp' : 'place', idx = []; c.toks.forEach(function (t, i) { if (t.grp === grp) idx.push(i); });
    var from = idx[0], to = idx[idx.length - 1], pp = phraseLow(c, from, to);
    var subjHead = c.toks.filter(function (t) { return t.role === 's'; })[0].w, verb = c.info.vp.join(' ');
    var target = adjPhrase ? subjHead : verb;
    if (shape === 'kind') return { q: Q(P('Is the underlined phrase an adjective phrase or an adverb phrase?'), S(under(c, from, to))), a: mcKeep(['adjective phrase', 'adverb phrase'], adjPhrase ? 0 : 1),
      hint: 'Which word does the phrase tell more about: a noun, or a verb?',
      steps: adjPhrase ? [qt(pp) + ' tells which ' + subjHead + '.', 'It modifies the noun ' + I(subjHead) + ', so it is an adjective phrase.'] : [qt(pp) + ' tells ' + (/^(after|before|during|on)$/.test(c.info.place[0]) ? 'when' : /^(with)$/.test(c.info.place[0]) ? 'how' : /^(for|at)$/.test(c.info.place[0]) && INTR_P[c.info.verb] ? 'more' : 'where') + ' about ' + I(verb) + '.', 'It modifies the verb, so it is an adverb phrase.'] };
    var wr = c.toks.filter(function (t) { return t.pos === 'n' && t.w !== target && t.grp !== grp; }).map(function (t) { return t.w; }).concat(adjPhrase ? [verb] : [subjHead], [c.toks[to].w]);
    return { q: Q(P('Which word does the underlined phrase modify?'), S(under(c, from, to))), a: mc(target, wr, L === 1 ? 3 : 4),
      hint: 'Ask: which one? (a noun) or where, when, how? (a verb).',
      steps: adjPhrase ? [qt(pp) + ' tells which ' + subjHead + '.', 'So it modifies ' + I(subjHead) + ', a noun: it is an adjective phrase.'] : [qt(pp) + ' tells more about the action ' + I(verb) + '.', 'So it modifies the verb: it is an adverb phrase.'].concat(L > 1 ? ['It doesn’t describe the nearest noun; it tells about the action.'] : []) };
  });

  /* ---------------------------------------------------------------- gram.appositives */
  var APPOS = [ // [sentence, appositive, noun it renames, other words to offer]
    ['My aunt, a pilot, flew us home.', 'a pilot', 'aunt', ['us', 'home']], ['Our dog, a beagle, loves long walks.', 'a beagle', 'dog', ['walks', 'long']],
    ['Mr. Lee, our coach, blew the whistle.', 'our coach', 'Mr. Lee', ['whistle', 'blew']], ['We read Charlotte’s Web, a book about a pig and a spider.', 'a book about a pig and a spider', 'Charlotte’s Web', ['We', 'pig']],
    ['The winner, Rosa, got a trophy.', 'Rosa', 'winner', ['trophy', 'got']], ['Jupiter, the largest planet, has many moons.', 'the largest planet', 'Jupiter', ['moons', 'many']],
    ['Ms. Park, the librarian, found the book for me.', 'the librarian', 'Ms. Park', ['book', 'me']], ['We visited Boston, the capital of Massachusetts.', 'the capital of Massachusetts', 'Boston', ['We', 'Massachusetts']],
    ['My best friend, Omar, plays the trumpet.', 'Omar', 'friend', ['trumpet', 'plays']], ['The poet Langston Hughes wrote about Harlem.', 'Langston Hughes', 'poet', ['Harlem', 'wrote']]
  ];
  var APP_COMMA = [ // [context making it essential or not, with commas, without]
    { who: 'Ana', many: 'Ana has two brothers.', one: 'Ana has one brother.', w: 'Ana’s brother, Leo, plays chess.', wo: 'Ana’s brother Leo plays chess.' },
    { who: 'Sam', many: 'Sam has three cousins.', one: 'Sam has only one cousin.', w: 'Sam’s cousin, Ruby, lives in Ohio.', wo: 'Sam’s cousin Ruby lives in Ohio.' },
    { who: 'Mia', many: 'Mia has two dogs.', one: 'Mia has one dog.', w: 'Mia’s dog, Pepper, sleeps all day.', wo: 'Mia’s dog Pepper sleeps all day.' },
    { who: 'Theo', many: 'Theo has two sisters.', one: 'Theo has one sister.', w: 'Theo’s sister, Nora, plays the violin.', wo: 'Theo’s sister Nora plays the violin.' }
  ];
  G('gram.appositives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['renames', 'comma', 'find']), R.pick(['comma', 'comma', 'renames']));
    if (shape === 'comma') {
      var e = R.pick(APP_COMMA), one = R.coin();
      return { q: Q(P(one ? e.one : e.many), P('Which sentence is punctuated correctly?')), a: mcKeep([e.w, e.wo], one ? 0 : 1),
        hint: 'Does the name tell which one, or does it only add information?',
        steps: one ? ['There is only one, so “' + e.w.split(',')[0] + '” already tells who is meant.', 'The name only adds information, so it is set off with commas.'] : ['There is more than one, so the name is needed to tell which one is meant.', 'An appositive that tells which one gets no commas: “' + e.wo + '”'] };
    }
    var a = R.pick(L === 1 ? APPOS.filter(function (x) { return x[1].split(' ').length <= 3; }) : APPOS);
    if (shape === 'renames') {
      var nouns = a[3];
      return { q: Q(P('Which noun does the underlined appositive rename?'), S(ul(a[0], a[1]))), a: mc(a[2], nouns, 3),
        hint: 'An appositive sits right beside the noun it renames.',
        steps: [qt(a[1]) + ' is another name for ' + I(a[2]) + '.', 'It sits right next to ' + I(a[2]) + ' and could take its place.'] };
    }
    var wrongs = [];
    var other = a[0].replace(a[1], '').replace(/[.,]/g, ' ').trim().split(/\s+/);
    wrongs.push(a[2]);
    if (other.length > 2) wrongs.push(other.slice(-2).join(' '), other.slice(-3, -1).join(' '));
    return { q: Q(P('What is the appositive in this sentence?'), S(a[0])), a: mc(a[1], wrongs.filter(function (w) { return w && w !== a[1]; }), 3),
      hint: 'Look for a noun or noun phrase that renames the noun right before it.',
      steps: [qt(a[1]) + ' renames ' + I(a[2]) + '.', 'It is a noun phrase sitting beside the noun, so it is an appositive.'].concat(/,/.test(a[0].replace(/, a book.*$/, ',')) ? ['It only adds information here, so commas set it off.'] : ['It tells which ' + a[2] + ' is meant, so no commas set it off.']) };
  });

  /* ---------------------------------------------------------------- word groups: phrases and clauses */
  var PHRASES = ['after the long game', 'in the morning', 'running down the hall', 'to win the race', 'the girl in the red coat', 'under the old bridge', 'was waiting patiently', 'my friend from Ohio', 'during the storm', 'has been sleeping', 'with a big smile', 'the tall oak tree'];
  var IND = ['the dog barked', 'we waited patiently', 'Leo smiled', 'the storm passed', 'Mia found her key', 'the bus is late', 'the bell rang', 'Grandpa told a story', 'it snowed', 'the twins laughed'];
  var DEP = [['because she was tired', 'because'], ['when the sun rose', 'when'], ['if it snows', 'if'], ['who lives next door', 'who'], ['that you found', 'that'], ['although the bus is late', 'although'],
    ['since Mia found her key', 'since'], ['after the bell rang', 'after'], ['while Grandpa told a story', 'while'], ['until the storm passed', 'until'], ['which we planted last spring', 'which'], ['before the twins laughed', 'before']];
  G('gram.phrases-vs-clauses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'which', R.pick(['which', 'pick']), R.pick(['pick', 'pair']));
    if (shape === 'pair') {
      var d = R.pick(DEP.filter(function (x) { return /^(after|before|until|since)/.test(x[0]); })), ph = { after: 'after the game', before: 'before breakfast', until: 'until noon', since: 'since Monday' }[d[1]];
      return { q: P('Which word group is a clause?'), a: mc(d[0], [ph, R.pick(PHRASES)]),
        hint: 'A clause has its own subject and verb.',
        steps: ['“' + d[0] + '” has a subject and a verb (' + subjVerb(d[0]) + '), so it is a clause.', '“' + ph + '” starts with the same word but has no verb: it is a phrase.'] };
    }
    if (shape === 'pick') {
      var cl = R.coin() ? R.pick(IND) : R.pick(DEP)[0];
      return { q: P('Which word group is a clause?'), a: mc(cl, R.sample(PHRASES, L === 2 ? 2 : 3)),
        hint: 'Look for a subject and a verb that go together.',
        steps: ['“' + cl + '” has a subject and a verb (' + subjVerb(cl) + ').', 'The others are phrases: each lacks a subject, a verb, or both.'] };
    }
    var isCl = R.coin(), g = isCl ? (R.coin() ? R.pick(IND) : R.pick(DEP)[0]) : R.pick(PHRASES);
    return { q: Q(P('Is this word group a phrase or a clause?'), S(g)), a: mcKeep(['phrase', 'clause'], isCl ? 1 : 0),
      hint: 'Does it have a subject and a verb that go together?',
      steps: isCl ? ['It has a subject and a verb: ' + subjVerb(g) + '.', 'So it is a clause' + (DEP.some(function (x) { return x[0] === g; }) ? ', even though it can’t stand alone.' : '.')] : ['Look for a subject with its own verb. There isn’t one' + (/^(was|has)/.test(g) ? ': it has a verb but no subject.' : /^(running|to )/.test(g) ? ': a verb form like this is a verbal, not the verb of a clause.' : '.'), 'Even a long group of words without both is a phrase.'] };
  });
  var SV = { 'the dog barked': 'dog / barked', 'we waited patiently': 'we / waited', 'Leo smiled': 'Leo / smiled', 'the storm passed': 'storm / passed', 'Mia found her key': 'Mia / found',
    'the bus is late': 'bus / is', 'the bell rang': 'bell / rang', 'Grandpa told a story': 'Grandpa / told', 'it snowed': 'it / snowed', 'the twins laughed': 'twins / laughed',
    'because she was tired': 'she / was', 'when the sun rose': 'sun / rose', 'if it snows': 'it / snows', 'who lives next door': 'who / lives', 'that you found': 'you / found',
    'although the bus is late': 'bus / is', 'since Mia found her key': 'Mia / found', 'after the bell rang': 'bell / rang', 'while Grandpa told a story': 'Grandpa / told',
    'until the storm passed': 'storm / passed', 'which we planted last spring': 'we / planted', 'before the twins laughed': 'twins / laughed' };
  function subjVerb(g) { var x = SV[g] || ''; var p = x.split(' / '); return 'subject ' + I(p[0]) + ', verb ' + I(p[1]); }

  /* ---------------------------------------------------------------- gram.independent-dependent */
  G('gram.independent-dependent', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'kind', R.pick(['kind', 'word', 'find']), R.pick(['all', 'find']));
    if (shape === 'word') {
      var d = R.pick(DEP);
      return { q: Q(P('Which word makes this clause dependent?'), S(d[0])), a: mc(d[1], d[0].split(' ').filter(function (w) { return w !== d[1] && w.length > 2; }), 3),
        hint: 'Which word, if you took it away, would leave a clause that could stand alone?',
        steps: ['Without ' + I(d[1]) + ', the rest could stand alone' + (d[1] === 'who' || d[1] === 'that' || d[1] === 'which' ? ' if we added a subject or object back' : '') + '.', cap(I(d[1])) + ' makes the clause lean on another sentence, so the clause is dependent.'] };
    }
    if (shape === 'all') {
      var items = R.sample(IND, 2).map(function (x) { return { text: x, ok: true }; }).concat(R.sample(DEP, 2).map(function (x) { return { text: x[0], ok: false }; }));
      return { q: P('Which of these could stand alone as a sentence (with a capital letter and a period)?'), a: mcAll(R.shuffle(items)),
        hint: 'Every one is a clause. Which ones begin with a word like because, when or who?',
        steps: ['Clauses that start with a word like because, when, if, who or that are dependent: they leave the reader waiting.', 'The others are independent clauses: each could be a sentence.'] };
    }
    if (shape === 'find') {
      var ind = R.pick(IND), dep = R.pick(DEP.filter(function (x) { return !/^(who|that|which)/.test(x[0]) && SV[x[0]] !== SV[ind]; })), first = R.coin();
      var sent = first ? cap(dep[0]) + ', ' + ind + '.' : cap(ind) + ' ' + dep[0] + '.';
      return { q: Q(P('Which part of this sentence is the dependent clause?'), S(sent)), a: mc(first ? cap(dep[0]) : dep[0], [first ? ind : cap(ind), cap(sent.replace(/\.$/, ''))]),
        hint: 'Find the clause that starts with a word like because, when or if.',
        steps: ['“' + dep[0] + '” starts with ' + I(dep[1]) + ' and can’t stand alone: it is dependent.', '“' + ind + '” could be a sentence by itself: it is independent.'] };
    }
    var isInd = R.coin(), g = isInd ? R.pick(IND) : R.pick(DEP)[0];
    return { q: Q(P('Is this clause independent or dependent?'), S(g)), a: mcKeep(['independent', 'dependent'], isInd ? 0 : 1),
      hint: 'Could it stand alone as a sentence?',
      steps: isInd ? ['It has a subject and a verb and makes a complete thought.', 'It could be a sentence: “' + cap(g) + '.” So it is independent.'] : ['It has a subject and a verb, but it starts with ' + I(DEP.filter(function (x) { return x[0] === g; })[0][1]) + '.', 'Read alone, “' + cap(g) + '.” leaves the reader waiting. It is dependent.'] };
  });

  /* ---------------------------------------------------------------- verbals */
  var PARTS = [ // [sentence, participle or participial phrase, noun it modifies]
    ['The barking dog woke the baby.', 'barking', 'dog'], ['The broken vase lay on the floor.', 'broken', 'vase'], ['Waving her hat, Mia ran to the bus.', 'Waving her hat', 'Mia'],
    ['The children, tired from the hike, fell asleep.', 'tired from the hike', 'children'], ['The frozen pond sparkled in the sun.', 'frozen', 'pond'],
    ['Smiling, the coach handed out medals.', 'Smiling', 'coach'], ['A boy holding a kite waved at us.', 'holding a kite', 'boy'],
    ['The cookies baked by Grandpa disappeared fast.', 'baked by Grandpa', 'cookies'], ['The leaves, falling slowly, covered the path.', 'falling slowly', 'leaves'],
    ['Leo fixed the squeaking door.', 'squeaking', 'door'], ['We watched the setting sun.', 'setting', 'sun']
  ];
  var ING3 = [ // the same -ing word as gerund, participle and part of the verb
    { w: 'swimming', g: '*Swimming* keeps Grandpa strong.', p: 'The *swimming* children splashed us.', v: 'The children are *swimming*.' },
    { w: 'dancing', g: '*Dancing* makes Mia happy.', p: 'The *dancing* puppets made us laugh.', v: 'Mia was *dancing* in the kitchen.' },
    { w: 'baking', g: '*Baking* takes patience.', p: 'The *baking* bread smelled wonderful.', v: 'Dad is *baking* bread.' },
    { w: 'running', g: '*Running* is Leo’s favorite sport.', p: 'We heard *running* water.', v: 'Leo is *running* late.' },
    { w: 'singing', g: '*Singing* calms the baby.', p: 'The *singing* birds woke us.', v: 'The birds were *singing*.' },
    { w: 'barking', g: '*Barking* is how dogs warn us.', p: 'The *barking* dog woke the baby.', v: 'The dog is *barking*.' },
    { w: 'sleeping', g: '*Sleeping* helps you grow.', p: 'Don’t wake the *sleeping* baby.', v: 'The baby is *sleeping*.' }
  ];
  var ING_WHY = { g: 'it names an activity and does a noun’s job, so it is a gerund', p: 'it describes a noun, so it is a participle (working as an adjective)', v: 'it follows a helping verb and is part of the verb phrase, so it is the verb' };
  var ING_NAME = { g: 'gerund', p: 'participle', v: 'part of the verb phrase' };
  G('gram.participles', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['modifies', 'find']), R.pick(['find', 'verb', 'modifies']), R.pick(['verb', 'modifies']));
    if (shape === 'verb') {
      var e = R.pick(ING3), isPart = R.coin(), s = isPart ? e.p : e.v;
      return { q: Q(P('Is the underlined word a participle (working as an adjective) or part of the verb?'), S(starHTML(s))), a: mcKeep(['participle', 'part of the verb phrase'], isPart ? 0 : 1),
        hint: 'Does it describe a noun, or does it follow a helping verb like is or was?',
        steps: [cap(I(e.w)) + ': ' + ING_WHY[isPart ? 'p' : 'v'] + '.'] };
    }
    var p = R.pick(L === 1 ? PARTS.filter(function (x) { return x[1].split(' ').length === 1; }) : PARTS);
    if (shape === 'find') {
      var words = p[0].replace(/[.,]/g, '').split(' ').filter(function (w) { return w !== p[1].split(' ')[0] && w.length > 3 && /^[a-z]/i.test(w) && w !== p[2]; });
      var verbs = { 'The barking dog woke the baby.': 'woke', 'The broken vase lay on the floor.': 'lay', 'Waving her hat, Mia ran to the bus.': 'ran', 'The children, tired from the hike, fell asleep.': 'fell',
        'The frozen pond sparkled in the sun.': 'sparkled', 'Smiling, the coach handed out medals.': 'handed', 'A boy holding a kite waved at us.': 'waved', 'The cookies baked by Grandpa disappeared fast.': 'disappeared',
        'The leaves, falling slowly, covered the path.': 'covered', 'Leo fixed the squeaking door.': 'fixed', 'We watched the setting sun.': 'watched' }[p[0]];
      var pw = p[1].split(' ')[0];
      return { q: Q(P('Which word is a participle?'), S(p[0])), a: mc(pw, [verbs, p[2]].concat(words), L === 1 ? 3 : 4),
        hint: 'A participle is a verb form (often ending in -ing or -ed) that describes a noun.',
        steps: [cap(I(pw.toLowerCase())) + ' is a verb form that describes ' + I(p[2]) + '.', cap(I(verbs)) + ' is the main verb of the sentence.'] };
    }
    var nouns = p[0].replace(/[.,]/g, '').split(' ').filter(function (w) { return w !== p[2] && p[1].split(' ').indexOf(w) < 0 && /^(dog|baby|vase|floor|hat|bus|children|hike|pond|sun|coach|medals|boy|kite|cookies|Grandpa|leaves|path|Leo|door|We)$/.test(w); });
    nouns = nouns.concat([{ 'The barking dog woke the baby.': 'woke', 'The broken vase lay on the floor.': 'lay', 'Waving her hat, Mia ran to the bus.': 'ran', 'The children, tired from the hike, fell asleep.': 'fell', 'The frozen pond sparkled in the sun.': 'sparkled', 'Smiling, the coach handed out medals.': 'handed', 'A boy holding a kite waved at us.': 'waved', 'The cookies baked by Grandpa disappeared fast.': 'disappeared', 'The leaves, falling slowly, covered the path.': 'covered', 'Leo fixed the squeaking door.': 'fixed', 'We watched the setting sun.': 'watched' }[p[0]]]);
    return { q: Q(P('Which word does the underlined participle' + (p[1].indexOf(' ') > 0 ? ' phrase' : '') + ' describe?'), S(ul(p[0], p[1]))), a: mc(p[2], nouns, 3),
      hint: 'A participle works like an adjective. Which noun does it tell about?',
      steps: [qt(p[1]) + ' tells about the ' + p[2] + '.', 'So it modifies ' + I(p[2]) + ', working as an adjective.'] };
  });

  var GERS = [ // [sentence, gerund phrase, job]
    ['Swimming is good exercise.', 'Swimming', 's'], ['She loves baking bread.', 'baking bread', 'do'], ['Leo is good at drawing cartoons.', 'drawing cartoons', 'op'],
    ['My favorite hobby is knitting.', 'knitting', 'pn'], ['Reading before bed helps me sleep.', 'Reading before bed', 's'], ['We finished painting the fence.', 'painting the fence', 'do'],
    ['Thank you for helping us.', 'helping us', 'op'], ['Her job is training puppies.', 'training puppies', 'pn'], ['Hiking in the hills tired us out.', 'Hiking in the hills', 's'],
    ['The kids enjoy building forts.', 'building forts', 'do'], ['Mia dreams about flying.', 'flying', 'op'],
    ['Gardening keeps Grandma busy.', 'Gardening', 's'], ['Leo practiced juggling every day.', 'juggling', 'do'], ['We talked about camping in the mountains.', 'camping in the mountains', 'op'],
    ['His favorite chore is walking the dog.', 'walking the dog', 'pn'], ['Skating on the pond is fun.', 'Skating on the pond', 's'], ['Ana is tired of waiting.', 'waiting', 'op'],
    ['The twins love singing.', 'singing', 'do'], ['Our plan is leaving early.', 'leaving early', 'pn'], ['Sam got better at spelling.', 'spelling', 'op'],
    ['Drawing maps takes patience.', 'Drawing maps', 's'], ['The puppy hates taking baths.', 'taking baths', 'do'], ['The best part was winning the prize.', 'winning the prize', 'pn']
  ];
  var JOB = { s: 'subject', do: 'direct object', op: 'object of a preposition', pn: 'predicate noun' };
  G('gram.gerunds', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['find', 'ing3']), R.pick(['ing3', 'job']), R.pick(['job', 'ing3']));
    if (shape === 'ing3') {
      var e = R.pick(ING3), k = L === 1 ? R.pick(['g', 'p']) : R.pick(['g', 'p', 'v']), s = e[k];
      var CH = L === 1 ? ['gerund', 'participle'] : ['gerund', 'participle', 'part of the verb phrase'];
      return { q: Q(P('How is the underlined word used?'), S(starHTML(s))), a: mcKeep(CH, ['g', 'p', 'v'].indexOf(k)),
        hint: 'Does it name an activity (a noun), describe a noun, or follow a helping verb?',
        steps: [cap(I(e.w)) + ': ' + ING_WHY[k] + '.'] };
    }
    var g = R.pick(GERS);
    if (shape === 'job') return { q: Q(P('What job does the underlined gerund phrase do?'), S(ul(g[0], g[1]))), a: mcKeep(['subject', 'direct object', 'object of a preposition', 'predicate noun'], ['s', 'do', 'op', 'pn'].indexOf(g[2])),
      hint: 'A gerund does any job a noun can do. Where does it sit in the sentence?',
      steps: [{ s: qt(g[1]) + ' comes before the verb and tells what the sentence is about: the subject.', do: qt(g[1]) + ' answers “' + g[0].split(' ')[1] + ' what?”: the direct object.', op: qt(g[1]) + ' follows the preposition ' + I(g[0].replace(/[.,]/g, '').split(' ')[g[0].replace(/[.,]/g, '').split(' ').indexOf(g[1].split(' ')[0]) - 1]) + ': the object of the preposition.', pn: qt(g[1]) + ' follows the linking verb is and renames the subject: a predicate noun.' }[g[2]], 'A gerund is a verb form ending in -ing that does a noun’s job.'] };
    var gw = g[1].split(' ')[0], words = g[0].replace(/[.,]/g, '').split(' ').filter(function (w) { return w !== gw && w.length > 2 && !/^(the|her|my|is|you)$/i.test(w); });
    return { q: Q(P('Which word is a gerund?'), S(g[0])), a: mc(gw, words, 3),
      hint: 'A gerund ends in -ing and names an activity.',
      steps: [cap(I(gw.toLowerCase())) + ' names an activity and does a noun’s job (' + JOB[g[2]] + ').', 'So it is a gerund.'] };
  });

  var INFS = [ // [sentence, infinitive phrase, job: n adj adv, the word it modifies (adj, adv)]
    ['To win was her goal.', 'To win', 'n'], ['Leo wants to learn the guitar.', 'to learn the guitar', 'n'], ['We need a book to read.', 'to read', 'adj', 'book'],
    ['She came to help.', 'to help', 'adv', 'came'], ['The puppy was eager to play.', 'to play', 'adv', 'eager'], ['Mia has a lot of homework to finish.', 'to finish', 'adj', 'homework'],
    ['My plan is to finish early.', 'to finish early', 'n'], ['The first person to arrive gets a prize.', 'to arrive', 'adj', 'person'], ['Ana practiced to improve her serve.', 'to improve her serve', 'adv', 'practiced'],
    ['We stopped to rest.', 'to rest', 'adv', 'stopped'], ['I forgot to call Grandma.', 'to call Grandma', 'n'], ['Is there anything to eat?', 'to eat', 'adj', 'anything']
  ];
  var INF_PP = [['We walked to the park to play soccer.', 'to play soccer', 'to the park'], ['Leo went to the library to return a book.', 'to return a book', 'to the library'],
    ['Mia rode her bike to school to save time.', 'to save time', 'to school'], ['They drove to the lake to go fishing.', 'to go fishing', 'to the lake'],
    ['Grandma sent a card to Ana to say thanks.', 'to say thanks', 'to Ana'], ['We hurried to the bus stop to catch the early bus.', 'to catch the early bus', 'to the bus stop']];
  var INF_K = { n: 'noun', adj: 'adjective', adv: 'adverb' };
  G('gram.infinitives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['pp', 'find']), R.pick(['pp', 'job']), R.pick(['job', 'pp']));
    if (shape === 'pp') {
      var e = R.pick(INF_PP);
      return { q: Q(P('Which group of words is an infinitive phrase?'), S(e[0])), a: mc(e[1], [e[2]].concat(L > 1 ? [e[2].replace(/^to /, '') + ' ' + e[1]] : [])),
        hint: 'An infinitive is to plus a verb. A prepositional phrase is to plus a noun.',
        steps: [qt(e[1]) + ' is to plus the verb ' + I(e[1].split(' ')[1]) + ': an infinitive phrase.', qt(e[2]) + ' is to plus a noun: a prepositional phrase.'] };
    }
    var f = R.pick(INFS);
    if (shape === 'find') {
      var ws = f[0].replace(/[.?]/g, '').split(' '), big = [];
      for (var i = 0; i + 1 < ws.length; i++) if (ws[i].toLowerCase() !== 'to' && ws[i + 1].toLowerCase() !== 'to') big.push(ws[i] + ' ' + ws[i + 1]);
      var inf = f[1].split(' ').slice(0, 2).join(' ');
      return { q: Q(P('Which words make up the infinitive?'), S(f[0])), a: mc(inf, R.shuffle(big).concat([f[1].split(' ')[1]]), 3),
        hint: 'Look for to followed by a verb.',
        steps: [qt(f[1].split(' ').slice(0, 2).join(' ')) + ' is to plus the verb ' + I(f[1].split(' ')[1]) + '.', 'That is an infinitive.'] };
    }
    return { q: Q(P('How is the underlined infinitive' + (f[1].indexOf(' ', 3) > 0 ? ' phrase' : '') + ' used?'), S(ul(f[0], f[1]))), a: mcKeep(['as a noun', 'as an adjective', 'as an adverb'], ['n', 'adj', 'adv'].indexOf(f[2])),
      hint: 'Can you replace it with something (a noun)? Does it tell which one (an adjective)? Does it tell why or how (an adverb)?',
      steps: f[2] === 'n' ? ['Replace it with something: “' + f[0].replace(f[1], /^To/.test(f[1]) ? 'Something' : 'something') + '” still works.', 'So it is used as a noun.'] : f[2] === 'adj' ? [qt(f[1]) + ' tells which or what kind of ' + f[3] + '.', 'It modifies the noun ' + I(f[3]) + ', so it is used as an adjective.'] : [qt(f[1]) + ' tells ' + (f[3] === 'eager' ? 'more about the adjective eager' : 'why about ' + I(f[3])) + '.', 'So it is used as an adverb.'] };
  });

  /* ---------------------------------------------------------------- clauses that do the jobs of adjectives, adverbs and nouns */
  var ADJ_CL = [ // [sentence, clause, noun it modifies, other nouns]
    ['The book that you lent me was funny.', 'that you lent me', 'book', ['me']], ['The girl who won the race is my cousin.', 'who won the race', 'girl', ['race', 'cousin']],
    ['We visited the town where my grandma grew up.', 'where my grandma grew up', 'town', ['grandma']], ['The dog that lives next door barks at night.', 'that lives next door', 'dog', ['night']],
    ['My uncle, who is a pilot, flew us home.', 'who is a pilot', 'uncle', ['pilot']], ['The cake that Grandpa baked disappeared quickly.', 'that Grandpa baked', 'cake', ['Grandpa']],
    ['Students who finish early may read.', 'who finish early', 'Students', []], ['The house whose roof leaked was repaired.', 'whose roof leaked', 'house', ['roof']],
    ['The coach whom we met was kind.', 'whom we met', 'coach', []], ['I found the key that you lost.', 'that you lost', 'key', []],
    ['Our garden, which gets lots of sun, grows tall tomatoes.', 'which gets lots of sun', 'garden', ['sun', 'tomatoes']], ['The boy with the kite that is stuck in the tree looks sad.', 'that is stuck in the tree', 'kite', ['boy', 'tree']]
  ];
  var ADV_CL = [ // [sentence, clause, subordinating conjunction, what it tells]
    ['We stayed inside because it was raining.', 'because it was raining', 'because', 'why'], ['When the bell rang, the students lined up.', 'When the bell rang', 'When', 'when'],
    ['If the rain stops, we will play outside.', 'If the rain stops', 'If', 'under what condition'], ['Although she was tired, Mia finished her chores.', 'Although she was tired', 'Although', 'in spite of what'],
    ['The puppy whined until Dad came home.', 'until Dad came home', 'until', 'when'], ['Before you leave, turn off the lights.', 'Before you leave', 'Before', 'when'],
    ['Since the store was closed, we went home.', 'Since the store was closed', 'Since', 'why'], ['We will go to the beach unless it storms.', 'unless it storms', 'unless', 'under what condition'],
    ['Though the hill was steep, the riders kept going.', 'Though the hill was steep', 'Though', 'in spite of what'], ['After the movie ended, we walked home.', 'After the movie ended', 'After', 'when'],
    ['Leo smiled because his team won.', 'because his team won', 'because', 'why'], ['The crowd cheered as the runners crossed the line.', 'as the runners crossed the line', 'as', 'when']
  ];
  var TELLS4 = ['when', 'why', 'under what condition', 'in spite of what'];
  G('gram.adjective-clauses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['modifies', 'find']), R.pick(['modifies', 'word']));
    var a = R.pick(L === 3 && shape === 'modifies' ? ADJ_CL.filter(function (x) { return x[3].length; }) : ADJ_CL);
    if (shape === 'word') return { q: Q(P('Which word begins the adjective clause?'), S(a[0])), a: mc(a[1].split(' ')[0], a[1].split(' ').slice(1, 3).concat([a[2]])),
      hint: 'Adjective clauses usually begin with who, whom, whose, which or that (sometimes where or when).',
      steps: ['The clause is ' + qt(a[1]) + '.', 'It begins with ' + I(a[1].split(' ')[0]) + ', which connects it to ' + I(a[2]) + '.'] };
    if (shape === 'modifies') {
      a = R.pick(ADJ_CL.filter(function (x) { return x[3].length; }));
      var other = a[3].concat([{ 'The book that you lent me was funny.': 'lent', 'The girl who won the race is my cousin.': 'won', 'We visited the town where my grandma grew up.': 'visited', 'The dog that lives next door barks at night.': 'barks', 'My uncle, who is a pilot, flew us home.': 'flew', 'The cake that Grandpa baked disappeared quickly.': 'disappeared', 'The house whose roof leaked was repaired.': 'repaired', 'Our garden, which gets lots of sun, grows tall tomatoes.': 'grows', 'The boy with the kite that is stuck in the tree looks sad.': 'looks' }[a[0]]]);
      return { q: Q(P('Which noun does the underlined adjective clause modify?'), S(ul(a[0], a[1]))), a: mc(a[2], other, 3),
        hint: 'An adjective clause follows the noun it tells about. Which noun does it say more about?',
        steps: [qt(a[1]) + ' tells which or what kind of ' + a[2] + '.', 'It comes right after ' + I(a[2]) + ', the noun it modifies.'].concat(a[2] === 'kite' ? ['The kite is stuck, not the boy: the clause follows kite.'] : []) };
    }
    var wr = [a[1].split(' ').slice(0, -1).join(' '), a[0].replace(/[.,]/g, '').split(' ').slice(0, 3).join(' ')];
    if (a[1].split(' ').length > 2) wr.push(a[1].split(' ').slice(1).join(' '));
    return { q: Q(P('Which words make up the adjective clause?'), S(a[0])), a: mc(a[1], wr, 3),
      hint: 'Start at who, whom, whose, which, that or where, and take the whole clause: its subject and its verb.',
      steps: ['The clause starts with ' + I(a[1].split(' ')[0]) + ' and runs to the end of its idea: ' + qt(a[1]) + '.', 'It tells about ' + I(a[2]) + ', so it is an adjective clause.'] };
  });
  G('gram.adverb-clauses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['tells', 'find']), R.pick(['comma', 'tells']));
    var a = R.pick(ADV_CL);
    if (shape === 'comma') {
      var b = R.pick(ADV_CL.filter(function (x) { return x[0].indexOf(x[1]) === 0; }));
      var rest = b[0].slice(b[1].length + 2);
      var noComma = b[1] + ' ' + rest, moved = cap(rest.replace(/\.$/, '')) + ' ' + b[1].charAt(0).toLowerCase() + b[1].slice(1) + '.';
      return { q: P('Which sentence follows the usual comma rule for an adverb clause?'), a: mc(b[0], [noComma, cap(rest.replace(/\.$/, '')) + ', ' + b[1].charAt(0).toLowerCase() + b[1].slice(1) + '.']),
        hint: 'When the adverb clause comes first, a comma usually follows it. When it comes last, usually no comma.',
        steps: ['The adverb clause ' + qt(b[1]) + ' comes first, so a comma follows it: “' + b[0] + '”', 'It could also come last, usually without a comma: “' + moved + '”'] };
    }
    if (shape === 'tells') return { q: Q(P('What does the underlined adverb clause tell?'), S(ul(a[0], a[1]))), a: mcKeep(TELLS4, TELLS4.indexOf(a[3])),
      hint: 'Look at the word that starts the clause: ' + a[2].toLowerCase() + '.',
      steps: [cap(I(a[2].toLowerCase())) + ' starts a clause that tells ' + a[3] + '.', 'The clause works like an adverb: it tells about the main verb.'] };
    var main = a[0].replace(a[1], '').replace(/^,\s*|\s*,\s*$/g, '').replace(/^\s+|\s+$/g, '').replace(/\.$/, '');
    return { q: Q(P('Which words make up the adverb clause?'), S(a[0])), a: mc(a[1], [main.charAt(0) === main.charAt(0).toLowerCase() ? main : main, a[1].split(' ').slice(1).join(' ')], 3),
      hint: 'Find the subordinating conjunction (because, when, if …) and take its clause.',
      steps: [qt(a[1]) + ' starts with the subordinating conjunction ' + I(a[2].toLowerCase()) + ' and has its own subject and verb.', 'It tells ' + a[3] + ', so it is an adverb clause. It ' + (a[0].indexOf(a[1]) === 0 ? 'comes first here, followed by a comma.' : 'comes after the main clause here.')] };
  });
  var NOUN_CL = [ // [sentence, clause, job]
    ['What you said surprised me.', 'What you said', 's'], ['I know that she left early.', 'that she left early', 'do'], ['Whoever finishes first wins a prize.', 'Whoever finishes first', 's'],
    ['We wondered where the cat had gone.', 'where the cat had gone', 'do'], ['The prize goes to whoever finishes first.', 'whoever finishes first', 'op'],
    ['My hope is that the rain stops.', 'that the rain stops', 'pn'], ['Do you know who baked this bread?', 'who baked this bread', 'do'], ['How the trick works is a secret.', 'How the trick works', 's'],
    ['Leo asked if he could help.', 'if he could help', 'do'], ['Give the map to whoever needs it.', 'whoever needs it', 'op'], ['The question is whether we have enough time.', 'whether we have enough time', 'pn'],
    ['Tell me what you need.', 'what you need', 'do'], ['That the bridge was closed surprised everyone.', 'That the bridge was closed', 's'],
    ['Mia wondered why the lights were off.', 'why the lights were off', 'do'], ['We talked about what we saw.', 'what we saw', 'op'], ['The truth is that I forgot.', 'that I forgot', 'pn'],
    ['Whatever you choose is fine.', 'Whatever you choose', 's'], ['Grandpa explained how the clock works.', 'how the clock works', 'do'], ['Sam was curious about where the river ends.', 'where the river ends', 'op'],
    ['The problem is that the store is closed.', 'that the store is closed', 'pn'], ['I hope that you feel better.', 'that you feel better', 'do'], ['Who wins the game does not matter to Leo.', 'Who wins the game', 's']
  ];
  var NC_PAIRS = [['I know that the store closes early.', 'The store that closes early is on Main Street.', 'that'], ['We know who left the gate open.', 'The boy who left the gate open said sorry.', 'who'],
    ['I remember where we parked.', 'This is the spot where we parked.', 'where'], ['She asked which bus goes downtown.', 'The bus which goes downtown is late.', 'which'],
    ['Leo knows who painted the mural.', 'The artist who painted the mural lives here.', 'who'], ['We heard that the game was canceled.', 'The game that we watched went into overtime.', 'that']];
  G('gram.noun-clauses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'find', R.pick(['job', 'find']), R.pick(['pair', 'job']));
    if (shape === 'pair') {
      var p = R.pick(NC_PAIRS), asNoun = R.coin(), s = asNoun ? p[0] : p[1];
      var cl = s.slice(s.indexOf(' ' + p[2] + ' ') + 1).replace(/[.?]$/, ''); if (!asNoun) cl = cl.replace(/ (is|said|is late).*$/, '').replace(/ is on Main Street$/, '');
      var clause = asNoun ? cl : { 'The store that closes early is on Main Street.': 'that closes early', 'The boy who left the gate open said sorry.': 'who left the gate open', 'This is the spot where we parked.': 'where we parked', 'The bus which goes downtown is late.': 'which goes downtown', 'The artist who painted the mural lives here.': 'who painted the mural', 'The game that we watched went into overtime.': 'that we watched' }[s];
      return { q: Q(P('Is the underlined clause a noun clause or an adjective clause?'), S(ul(s, clause))), a: mcKeep(['noun clause', 'adjective clause'], asNoun ? 0 : 1),
        hint: 'Try replacing the clause with something. If the sentence still works, it is a noun clause.',
        steps: asNoun ? ['Replace it: “' + s.replace(clause, 'something') + '” works.', 'The clause does a noun’s job, so it is a noun clause.'] : ['Replace it: “' + s.replace(clause, 'something') + '” doesn’t work.', 'The clause tells about the noun before it, so it is an adjective clause.'] };
    }
    var n = R.pick(NOUN_CL);
    if (shape === 'job') return { q: Q(P('What job does the underlined noun clause do?'), S(ul(n[0], n[1]))), a: mcKeep(['subject', 'direct object', 'object of a preposition', 'predicate noun'], ['s', 'do', 'op', 'pn'].indexOf(n[2])),
      hint: 'Replace the clause with something. Then ask what job something does.',
      steps: ['Replace it: “' + n[0].replace(n[1], n[2] === 's' ? 'Something' : 'something') + '”', { s: 'Something comes before the verb and tells what the sentence is about: the subject.', do: 'Something receives the action of the verb: the direct object.', op: 'Something follows the preposition to: the object of the preposition.', pn: 'Something follows the linking verb is and renames the subject: a predicate noun.' }[n[2]]] };
    var wr = [n[1].split(' ').slice(1).join(' '), n[0].replace(/[.?]/g, '').split(' ').slice(0, 3).join(' ')].filter(function (x) { return x !== n[1]; });
    return { q: Q(P('Which words make up the noun clause?'), S(n[0])), a: mc(n[1], wr, 3),
      hint: 'A noun clause can be replaced by something or someone.',
      steps: [qt(n[1]) + ' has its own subject and verb.', 'Replace it with something: “' + n[0].replace(n[1], n[2] === 's' ? 'Something' : 'something') + '” still works, so it is a noun clause (the ' + JOB[n[2]] + ').'] };
  });

  /* ================================================================ Unit 4: sentence structure */
  // [sentence, structure, independent clauses (as text), dependent clauses (as text), a note for the steps]
  var STRUCT = [
    ['Leo sang and danced.', 'simple', ['Leo sang and danced'], [], 'Sang and danced is a compound verb with one subject: still one clause.'],
    ['Ana and Mia walked to school.', 'simple', ['Ana and Mia walked to school'], [], 'Ana and Mia is a compound subject with one verb: one clause.'],
    ['The old bridge creaked in the wind.', 'simple', ['The old bridge creaked in the wind'], [], 'In the wind is a phrase, not a clause.'],
    ['After lunch, we played chess.', 'simple', ['we played chess'], [], 'After lunch is a phrase: it has no subject or verb.'],
    ['Running down the hill, Sam tripped.', 'simple', ['Sam tripped'], [], 'Running down the hill is a participial phrase, not a clause.'],
    ['Mia and her brother washed and dried the dishes.', 'simple', ['Mia and her brother washed and dried the dishes'], [], 'A compound subject and a compound verb still make one clause.'],
    ['The rain stopped, and the sun came out.', 'compound', ['The rain stopped', 'the sun came out'], [], ''],
    ['Leo likes soccer, but Mia prefers chess.', 'compound', ['Leo likes soccer', 'Mia prefers chess'], [], ''],
    ['We can walk, or we can take the bus.', 'compound', ['We can walk', 'we can take the bus'], [], ''],
    ['The bell rang; class was over.', 'compound', ['The bell rang', 'class was over'], [], 'A semicolon can join two independent clauses.'],
    ['I was tired, so I went to bed early.', 'compound', ['I was tired', 'I went to bed early'], [], ''],
    ['The puppy barked; the kitten hid.', 'compound', ['The puppy barked', 'the kitten hid'], [], 'A semicolon can join two independent clauses.'],
    ['When it rained, we left.', 'complex', ['we left'], ['When it rained'], 'Short sentences can be complex: complex means one independent and at least one dependent clause.'],
    ['We stayed inside because it was cold.', 'complex', ['We stayed inside'], ['because it was cold'], ''],
    ['The book that you lent me was funny.', 'complex', ['The book was funny'], ['that you lent me'], 'The adjective clause sits inside the independent clause.'],
    ['I know that she left.', 'complex', ['I know'], ['that she left'], 'The noun clause is the direct object of know.'],
    ['If you hurry, you can catch the bus.', 'complex', ['you can catch the bus'], ['If you hurry'], ''],
    ['Mia smiled when she saw the puppy.', 'complex', ['Mia smiled'], ['when she saw the puppy'], ''],
    ['When the bell rang, the students left, and the room was quiet.', 'compound-complex', ['the students left', 'the room was quiet'], ['When the bell rang'], ''],
    ['The book that you lent me was funny, but I lost it.', 'compound-complex', ['The book was funny', 'I lost it'], ['that you lent me'], 'The adjective clause sits inside the first independent clause.'],
    ['I wanted to go, but I stayed home because I was sick.', 'compound-complex', ['I wanted to go', 'I stayed home'], ['because I was sick'], 'To go is an infinitive, not a clause.'],
    ['Leo finished his chores, and Mia helped him after she finished hers.', 'compound-complex', ['Leo finished his chores', 'Mia helped him'], ['after she finished hers'], ''],
    ['The dog that lives next door barked, so we closed the window.', 'compound-complex', ['The dog barked', 'we closed the window'], ['that lives next door'], 'The adjective clause sits inside the first independent clause.'],
    ['Since it was raining, we played inside, and Dad made popcorn.', 'compound-complex', ['we played inside', 'Dad made popcorn'], ['Since it was raining'], '']
  ];
  var ST4 = ['simple', 'compound', 'complex', 'compound-complex'];
  // themed clause families: any two independent clauses and any dependent clause of one family make sense together
  var FAM = [
    { ind: ['the rain fell', 'we stayed inside', 'Dad made soup', 'the dog slept by the fire', 'Mia read a book'], dep: ['because the sky was dark', 'while the wind howled', 'after we got home', 'when the thunder rumbled'] },
    { ind: ['the team practiced', 'the crowd cheered', 'Leo scored a goal', 'the coach smiled', 'we bought snacks'], dep: ['when the game started', 'before the whistle blew', 'after the score was tied', 'because the stands were full'] },
    { ind: ['Grandma baked bread', 'the kitchen smelled sweet', 'we set the table', 'Sam washed the dishes', 'the kettle whistled'], dep: ['while the oven warmed up', 'before the guests arrived', 'after dinner ended', 'because everyone was hungry'] },
    { ind: ['the waves crashed', 'we built a sandcastle', 'the gulls cried', 'Ana found a shell', 'the sun went down'], dep: ['as the tide came in', 'when the wind picked up', 'after we ate lunch', 'before the clouds rolled in'] },
    { ind: ['the bus was late', 'we waited at the corner', 'Nora checked the time', 'the street was quiet', 'a truck rumbled past'], dep: ['because the roads were icy', 'while the snow fell', 'until the bus came', 'since it was early'] }
  ];
  function capS(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
  // a made sentence of a given structure: [sentence, structure, independent clauses, dependent clauses, note]
  function makeStruct(R, kind) {
    var F = R.pick(FAM), two = R.sample(F.ind, 2), d = R.pick(F.dep), join = R.pick([', and ', ', and ', '; ']), first = R.coin();
    if (kind === 'simple') return [capS(two[0]) + '.', 'simple', [two[0]], [], ''];
    if (kind === 'compound') return [capS(two[0]) + join + two[1] + '.', 'compound', [two[0], two[1]], [], join === '; ' ? 'A semicolon can join two independent clauses.' : ''];
    if (kind === 'complex') return [first ? capS(d) + ', ' + two[0] + '.' : capS(two[0]) + ' ' + d + '.', 'complex', [two[0]], [d], ''];
    return [first ? capS(d) + ', ' + two[0] + ', and ' + two[1] + '.' : capS(two[0]) + ', and ' + two[1] + ' ' + d + '.', 'compound-complex', [two[0], two[1]], [d], ''];
  }
  function pickStruct(R, kinds, trapP) { if (R.chance(trapP == null ? 0.5 : trapP)) return R.pick(STRUCT.filter(function (e) { return kinds.indexOf(e[1]) >= 0; })); return makeStruct(R, R.pick(kinds)); }
  function structSteps(e) {
    var out = ['Independent clause' + (e[2].length > 1 ? 's' : '') + ': ' + e[2].map(function (x) { return qt(x); }).join(' and ') + '.'];
    out.push(e[3].length ? 'Dependent clause: ' + e[3].map(function (x) { return qt(x); }).join(', ') + '.' : 'No dependent clause.');
    if (e[4]) out.push(e[4]);
    out.push(e[2].length + ' independent and ' + e[3].length + ' dependent: ' + an(e[1]) + ' ' + e[1] + ' sentence.');
    return out;
  }
  function structQ(e, choices) {
    return { q: Q(P('What kind of sentence is this?'), S(e[0])), a: mcKeep(choices, choices.indexOf(e[1])),
      hint: 'Count the independent clauses, then look for a dependent clause.', steps: structSteps(e) };
  }
  G('gram.simple-compound', function (R, ctx) {
    var L = ctx.level, sc = STRUCT.filter(function (e) { return e[1] === 'simple' || e[1] === 'compound'; });
    if (L === 3 && R.chance(0.5)) {
      var comp = R.pick(sc.filter(function (e) { return e[1] === 'compound'; })), simp = R.sample(sc.filter(function (e) { return e[1] === 'simple'; }), 2);
      return { q: P('Which sentence is a compound sentence?'), a: mc(comp[0], simp.map(function (e) { return e[0]; })),
        hint: 'A compound sentence has two independent clauses, each with its own subject and verb.',
        steps: ['“' + comp[0] + '” has two independent clauses: ' + comp[2].map(function (x) { return qt(x); }).join(' and ') + '.'].concat(simp.map(function (e) { return '“' + e[0] + '” is simple. ' + (e[4] || ''); })) };
    }
    var pool = L === 1 ? sc.filter(function (e) { return !/and danced|Ana and Mia|washed and dried/.test(e[0]); }) : sc;
    return structQ(R.chance(L === 1 ? 0.3 : 0.5) ? R.pick(pool) : makeStruct(R, R.pick(['simple', 'compound'])), ['simple', 'compound']);
  });
  G('gram.complex', function (R, ctx) {
    var L = ctx.level, pool = STRUCT.filter(function (e) { return e[1] !== 'compound-complex'; });
    if (L === 3 && R.chance(0.5)) {
      var e = R.coin() ? R.pick(STRUCT.filter(function (x) { return x[1] === 'complex'; })) : makeStruct(R, 'complex'), d = e[3][0];
      var wr = [e[2][0], e[0].replace(/\.$/, '')];
      return { q: Q(P('Which part of this complex sentence is the dependent clause?'), S(e[0])), a: mc(d, wr),
        hint: 'Look for a clause that begins with a word like when, because, if, that or who.',
        steps: [qt(d) + ' has a subject and a verb but can’t stand alone: it is the dependent clause.', qt(e[2][0]) + ' is the independent clause.'].concat(e[4] ? [e[4]] : []) };
    }
    if (R.chance(0.5)) return structQ(makeStruct(R, R.pick(['simple', 'compound', 'complex', 'complex'])), ['simple', 'compound', 'complex']);
    return structQ(R.pick(L === 2 ? pool.filter(function (e) { return e[1] !== 'simple' || /and|Running|After/.test(e[0]); }) : pool), ['simple', 'compound', 'complex']);
  });
  G('gram.compound-complex', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'kind', R.pick(['kind', 'count']), R.pick(['count', 'which', 'kind']));
    if (shape === 'which') {
      var cc = pickStruct(R, ['compound-complex']), others = [pickStruct(R, ['compound']), pickStruct(R, ['complex']), pickStruct(R, ['simple'])];
      return { q: P('Which sentence is compound-complex?'), a: mc(cc[0], others.map(function (e) { return e[0]; })),
        hint: 'You need two or more independent clauses and at least one dependent clause.',
        steps: structSteps(cc).concat(others.map(function (e) { return '“' + e[0] + '” is ' + e[1] + '.'; })) };
    }
    var e = R.chance(0.5) ? makeStruct(R, R.pick(ST4.concat(['compound-complex']))) : R.pick(L === 1 ? STRUCT.filter(function (x) { return x[1] !== 'simple'; }) : STRUCT);
    if (shape === 'count') {
      var ce = pickStruct(R, ['compound-complex', 'complex']), ask = R.coin() ? 'independent' : 'dependent';
      var n = ask === 'independent' ? ce[2].length : ce[3].length;
      return { q: Q(P('How many ' + ask + ' clauses are in this sentence?'), S(ce[0])), a: mcKeep(['0', '1', '2', '3'], n),
        hint: 'Find every subject–verb pair first. Then ask which can stand alone.', steps: structSteps(ce) };
    }
    return structQ(e, ST4);
  });

  /* ================================================================ Unit 5: diagramming sentences (Reed–Kellogg) */
  function slotsOf(spec) { return ML.writing.dgSlots(spec); }
  function slotWord(spec, id) { var s = slotsOf(spec).filter(function (x) { return x.id === id; })[0]; return s ? s.w : null; }
  function parentId(id) { return id.replace(/\.(m\d+(\.o)?|o|a|io|do|pn|oc)$/, ''); }
  var ROLE_SAY = { subject: 'the subject', verb: 'the verb', 'direct object': 'the direct object', 'indirect object': 'the indirect object', 'predicate noun or adjective': 'the predicate noun or adjective',
    'object complement': 'the object complement', modifier: 'a modifier', preposition: 'a preposition', 'object of the preposition': 'the object of a preposition', conjunction: 'a conjunction',
    appositive: 'an appositive', gerund: 'a gerund', infinitive: 'an infinitive', participle: 'a participle', 'subordinating conjunction': 'a subordinating conjunction',
    'word that introduces the noun clause': 'the word that introduces the noun clause', 'word apart (interjection or direct address)': 'a word apart from the sentence', 'infinitive marker': 'the word to of an infinitive',
    'object of the verbal': 'the object of the verbal' };
  var PLACE_SAY = { subject: 'on the baseline, left of the line that crosses it', verb: 'on the baseline, right of the line that crosses it', 'direct object': 'on the baseline after a short upright line that stops at the baseline',
    'indirect object': 'on a flat line hung under the verb', 'predicate noun or adjective': 'on the baseline after a line slanted back toward the subject', 'object complement': 'after the direct object, behind a line slanted back toward it',
    modifier: 'on a slanted line under the word it modifies', preposition: 'on the slanted line of the phrase', 'object of the preposition': 'on the flat line of the phrase', conjunction: 'beside the dashed line that joins the parts',
    appositive: 'in parentheses beside the noun it renames', 'word apart (interjection or direct address)': 'on its own short line above the baseline', 'subordinating conjunction': 'on the dotted line that joins the clauses',
    gerund: 'on the stepped line', participle: 'on the bent line', infinitive: 'on the line after the slanted to', 'word that introduces the noun clause': 'on a short line above the clause' };
  // "Which word goes in place A?"
  function dgAsk(R, spec, text, id, L, extraSteps) {
    var sl = slotsOf(spec), me = sl.filter(function (x) { return x.id === id; })[0];
    var seen = {}; seen[me.w.toLowerCase()] = 1;
    var wr = sl.filter(function (x) { var k = x.w.toLowerCase(); if (x.id === id || seen[k]) return false; seen[k] = 1; return true; }).map(function (x) { return x.w; });
    wr = R.shuffle(wr);
    // put a tempting wrong word first: the word sentence order would put here, or a word with a near job
    var steps = [cap(I(me.w)) + ' is ' + (ROLE_SAY[me.role] || me.role) + (me.role === 'modifier' ? ' of ' + I(slotWord(spec, parentId(id)) || '') : '') + '.', 'In the usual Reed–Kellogg form, ' + (ROLE_SAY[me.role] || 'it') + ' goes ' + (PLACE_SAY[me.role] || 'in this place') + '.'];
    return { q: Q(P('The diagram shows the sentence with one place lettered. Which word goes in place A?')), a: mc(me.w, wr, L === 1 ? 3 : 4),
      viz: dgViz(spec, text, { ask: [id] }), hint: 'What job does the empty place hold? Find the word in the sentence that does that job.', steps: (extraSteps || []).concat(steps) };
  }
  // "Which diagram is right?" specs[0] is right; whys: what is wrong with each of the others
  function dgChoose(R, specs, text, rightWhy, whys) {
    var order = R.shuffle(specs.map(function (s, i) { return i; })), shown = order.map(function (i) { return specs[i]; }), at = order.indexOf(0);
    var L = ['A', 'B', 'C', 'D'].slice(0, specs.length);
    return { q: P('Which diagram shows the sentence correctly?'), a: mcKeep(L, at),
      viz: { name: 'wr-diagram', opts: { text: text, choices: shown, quiet: true, interactive: false } },
      hint: 'Check where each word sits: which job does each place stand for?',
      steps: ['Diagram ' + L[at] + ' is right: ' + rightWhy].concat(order.map(function (i, k) { return i === 0 ? null : 'Diagram ' + L[k] + ': ' + whys[i - 1]; }).filter(Boolean)) };
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  /* ---------------------------------------------------------------- gram.diagram-basics */
  var BARE = [['Birds sing.', 'Birds', 'sing'], ['Dogs bark.', 'Dogs', 'bark'], ['Bells rang.', 'Bells', 'rang'], ['Leaves fall.', 'Leaves', 'fall'], ['Babies cry.', 'Babies', 'cry'], ['Frogs croak.', 'Frogs', 'croak'], ['Snow fell.', 'Snow', 'fell'], ['Time flies.', 'Time', 'flies']];
  var CMDS = [['Sit.', 'Sit'], ['Listen.', 'Listen'], ['Wait!', 'Wait'], ['Hurry!', 'Hurry'], ['Relax.', 'Relax'], ['Smile!', 'Smile']];
  function basicSent(R, L) {
    var k = L === 1 ? R.pick(['bare', 'name']) : R.pick(['name', 'helper', 'helper', 'cmd', 'bare']);
    if (k === 'bare') { var b = R.pick(BARE); return { text: b[0], spec: D().clause({ s: b[1], v: b[2] }), s: b[1], v: b[2], kind: k }; }
    if (k === 'cmd') { var c = R.pick(CMDS); return { text: c[0], spec: D().clause({ s: '(you)', v: c[1] }), s: '(you)', v: c[1], kind: k }; }
    var cc = compose(R, { kind: 'intr', subj: R.pick(['name', 'pron']), adv: false, place: false, tense: k === 'helper' ? R.pick(['past-prog', 'pres-perf', 'pp-prog', 'future', 'modal', 'past-perf']) : 'past' });
    return { text: cc.text, spec: cc.spec, s: cc.toks[0].w, v: cc.info.vp.join(' '), vp: cc.info.vp, kind: k };
  }
  G('gram.diagram-basics', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['ask', 'choose']), R.pick(['choose', 'ask', 'place']), R.pick(['choose', 'ask']));
    var b = basicSent(R, L);
    if (shape === 'place') {
      var askS = R.coin();
      return { q: Q(P('In a Reed–Kellogg diagram of this sentence, which word or words go to the ' + (askS ? 'left' : 'right') + ' of the short line that crosses the baseline?'), S(b.text)),
        a: mc(askS ? b.s : b.v, askS ? [b.v, b.vp ? b.vp[b.vp.length - 1] : null, 'nothing'] : [b.s, b.vp ? b.vp[b.vp.length - 1] : null, b.vp ? b.vp[0] : null]),
        hint: 'The line that crosses the baseline splits the subject from the verb.',
        steps: ['The subject is ' + I(b.s) + (b.kind === 'cmd' ? ' (a command: you, understood, written in parentheses)' : '') + '; it goes on the left.', 'The verb is ' + I(b.v) + (b.vp && b.vp.length > 1 ? ', helping verbs and all' : '') + '; it goes on the right.'] };
    }
    if (shape === 'ask') {
      var id = b.vp && b.vp.length > 1 || R.coin() ? 'v' : 's';
      var r = dgAsk(R, b.spec, b.text, id, L);
      if (id === 'v' && b.vp && b.vp.length > 1) { r.a = mc(b.v, [b.vp[b.vp.length - 1], b.vp.slice(0, -1).join(' '), b.s], L === 1 ? 3 : 4); r.steps.push('The helping verbs stay on the baseline with the main verb: ' + I(b.v) + '.'); }
      else if (r.a.choices.length < 3) r.a = mc(r.a.choices[0], r.a.choices.slice(1).concat(b.kind === 'cmd' ? ['(I)'] : ['(you)']), 3);
      if (b.kind === 'cmd') r.steps.unshift('A command has the understood subject you; the diagram writes it in parentheses: (you).');
      return r;
    }
    var wrongs, whys;
    if (b.kind === 'cmd') { wrongs = [D().clause({ s: '(I)', v: b.v }), D().clause({ s: b.v, v: '(you)' })]; whys = ['the understood subject of a command is you, not I.', 'the command word sits in the subject’s place, but it is the verb; (you) is the subject.']; }
    else {
      wrongs = [D().clause({ s: b.v, v: b.s })]; whys = ['the subject and the verb have changed sides; the subject goes on the left.'];
      if (b.vp && b.vp.length > 1) { wrongs.push(D().clause({ s: b.s, v: D().n(b.vp[b.vp.length - 1], b.vp.slice(0, -1)) })); whys.push('the helping verb hangs on a slant like a modifier, but helping verbs stay on the baseline with the main verb.'); }
    }
    return dgChoose(R, [b.spec].concat(wrongs), b.text, 'the subject ' + I(b.s) + ' is left of the dividing line and the verb ' + I(b.v) + ' is right of it, both on the baseline.', whys);
  });

  /* ---------------------------------------------------------------- gram.diagram-modifiers */
  G('gram.diagram-modifiers', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['ask', 'under']), R.pick(['under', 'choose', 'ask']), R.pick(['choose', 'under']));
    var very = L > 1 && (shape === 'choose' || R.chance(0.5));
    var c = composeWhere(R, { kind: R.pick(['intr', 'tr']), subj: R.pick(['person', 'animal']), adj: true, veryAdj: very ? R.pick(['very', 'quite', 'really']) : false, adv: true, place: false, noNounish: true }, function (c) { return !!c.info.adv && once(c, c.info.adv); });
    var sl = slotsOf(c.spec), mods = sl.filter(function (x) { return x.role === 'modifier'; });
    if (shape === 'choose') {
      var adjW = c.info.very ? c.info.very.adj : null, wrong1 = clone(c.spec), wrong2 = clone(c.spec);
      var why1, why2;
      if (adjW) {
        // very hung under the noun instead of under the adjective
        wrong1.s.m = wrong1.s.m.map(function (m) { return m.w === adjW ? { w: adjW } : m; }); wrong1.s.m.push({ w: c.toks.filter(function (t) { return t.grp === 'sp' && t.pos === 'adv'; })[0].w });
        why1 = I(c.toks.filter(function (t) { return t.grp === 'sp' && t.pos === 'adv'; })[0].w) + ' hangs under the noun, but it tells how ' + adjW + ': it belongs under ' + I(adjW) + '.';
      } else { wrong1.s.m = wrong1.s.m.concat([{ w: c.info.adv }]); wrong1.v.m = (wrong1.v.m || []).filter(function (m) { return m.w !== c.info.adv; }); why1 = 'the adverb ' + I(c.info.adv) + ' hangs under the subject, but it tells about the verb.'; }
      wrong2.v.m = (wrong2.v.m || []).filter(function (m) { return m.w !== c.info.adv; }); var subjAdj = wrong2.s.m.filter(function (m) { return m.w !== 'the' && m.w !== 'The' && m.w !== 'a' && m.w !== 'an'; })[0];
      if (subjAdj) { wrong2.s.m = wrong2.s.m.filter(function (m) { return m !== subjAdj; }); wrong2.v.m = (wrong2.v.m || []).concat([subjAdj]); }
      wrong2.v.m.push({ w: c.info.adv }); if (subjAdj) why2 = 'the adjective ' + I(subjAdj.w) + ' hangs under the verb, but it describes the noun ' + I(c.toks.filter(function (t) { return t.role === 's'; })[0].w) + '.';
      else why2 = 'a describing word is under the wrong word.';
      return dgChoose(R, [c.spec, wrong1, wrong2], c.text, 'each modifier hangs on a slant under the word it tells about' + (adjW ? ', and ' + I(c.toks.filter(function (t) { return t.grp === 'sp' && t.pos === 'adv'; })[0].w) + ' hangs under ' + I(adjW) + ', the adjective it modifies' : '') + '.', [why1, why2]);
    }
    if (shape === 'under') {
      var pick = very && R.chance(0.6) ? sl.filter(function (x) { return x.role === 'modifier' && /\.m\d+\.m\d+$/.test(x.id); })[0] : R.pick(mods.filter(function (x) { return !/^(the|a|an)$/i.test(x.w); }));
      if (!pick) pick = R.pick(mods);
      var par = slotWord(c.spec, parentId(pick.id)), others = ML.util.uniq(sl.filter(function (x) { return x.role !== 'modifier' || /\.m\d+$/.test(x.id) && x.w !== pick.w; }).map(function (x) { return x.w; }).filter(function (w) { return w !== par && w !== pick.w; }));
      return { q: Q(P('In a diagram of this sentence, under which word does the slanted line for ' + I(pick.w) + ' hang?'), S(c.text)), a: mc(par, R.shuffle(others), L === 1 ? 3 : 4),
        hint: 'A modifier hangs under the word it tells about. Ask which word ' + pick.w + ' describes.',
        steps: [cap(I(pick.w)) + ' tells about ' + I(par) + '.', 'So its slanted line hangs under ' + I(par) + '.'].concat(/\.m\d+\.m\d+$/.test(pick.id) ? ['An adverb that modifies an adjective hangs under that adjective, on a little shelf of its own.'] : []) };
    }
    var target = R.pick(mods.filter(function (x) { return !/^(the|a|an)$/i.test(x.w); }).concat(L === 1 ? [] : mods));
    return dgAsk(R, c.spec, c.text, target.id, L);
  });

  /* ---------------------------------------------------------------- gram.diagram-objects */
  G('gram.diagram-objects', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'ask', R.pick(['ask', 'choose']), R.pick(['choose', 'ask', 'line']));
    var c = compose(R, { kind: L === 1 ? R.pick(['tr', 'ditr']) : 'ditr', subj: R.pick(['name', 'person']), adj: L > 1 ? null : false, objAdj: L > 1 ? null : false, adv: false, place: false });
    if (shape === 'line') return { q: P('In a Reed–Kellogg diagram, which line comes before the direct object?'),
      a: mc('a short upright line that stops at the baseline', ['a line that crosses the baseline', 'a line slanted back toward the subject', 'a slanted line under the verb']),
      hint: 'The line that crosses the baseline is already taken: it splits the subject from the verb.',
      steps: ['The direct object sits on the baseline after a short upright line.', 'That line stops at the baseline. Only the subject–verb line crosses it.', 'A line slanted back toward the subject is for a predicate noun or adjective.'] };
    var hasIO = c.info.kind === 'ditr';
    if (shape === 'choose') {
      var w1 = clone(c.spec), w2 = clone(c.spec), why1, why2;
      if (hasIO) { var t = w1.io; w1.io = w1.do; w1.do = t; why1 = 'the two objects have swapped places: ' + I(c.info.obj) + ' is what was ' + c.info.vp.join(' ') + ', so it is the direct object on the baseline.'; }
      else { w1.pn = w1.do; delete w1.do; why1 = 'the object follows a slanted line, which is for a predicate noun or adjective after a linking verb.'; }
      if (hasIO) { w2.do = w2.io; delete w2.io; w2.oc = clone(c.spec.do); why2 = I(c.info.io) + ' is drawn on the baseline as if it were the direct object; an indirect object hangs under the verb.'; }
      else { var s0 = w2.s; w2.s = w2.do; w2.do = s0; why2 = 'the subject and the object have changed places.'; }
      return dgChoose(R, [c.spec, w1, w2], c.text, 'the direct object ' + I(c.info.obj) + ' follows the short upright line on the baseline' + (hasIO ? ', and the indirect object ' + I(c.info.io) + ' hangs under the verb on a flat line' : '') + '.', [why1, why2]);
    }
    var id = hasIO && R.chance(0.5) ? 'io' : 'do';
    return dgAsk(R, c.spec, c.text, id, L);
  });

  /* ---------------------------------------------------------------- gram.diagram-complements */
  G('gram.diagram-complements', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'ask', R.pick(['choose', 'ask']), R.pick(['choose', 'ask']));
    var kind = L === 1 ? R.pick(['pn', 'pa', 'sense']) : R.pick(['pn', 'pa', 'sense', 'oc', 'oc']);
    var c = compose(R, { kind: kind, subj: kind === 'pn' || kind === 'pa' ? R.pick(['name', 'person']) : null, adv: false, place: false });
    if (shape === 'choose') {
      var w1 = clone(c.spec), w2 = clone(c.spec), why1, why2;
      if (kind === 'oc') {
        w1.io = w1.do; w1.do = w1.oc; delete w1.oc; why1 = 'it reads ' + I(c.info.obj) + ' as an indirect object and ' + I(c.info.oc) + ' as the direct object, but ' + I(c.info.oc) + ' renames or describes ' + I(c.info.obj) + ': they are the same.';
        w2 = clone(c.spec); var o2 = clone(w2.do); o2.m = (o2.m || []).concat([{ w: c.info.oc }]); w2.do = o2; delete w2.oc; why2 = I(c.info.oc) + ' hangs under the object like an adjective, but it completes the object and sits after it on the baseline.';
      } else {
        w1.do = w1.pn; delete w1.pn; why1 = 'the complement follows an upright line, the mark of a direct object; after a linking verb the line slants back toward the subject.';
        var pnW = c.spec.pn; w2.v = D().n(c.info.vp.join(' '), [pnW.m ? pnW : { w: pnW.w }]); delete w2.pn; why2 = 'the complement hangs under the verb like an adverb, but it renames or describes the subject.';
      }
      return dgChoose(R, [c.spec, w1, w2], c.text, kind === 'oc' ? I(c.info.oc) + ' follows the direct object behind a line slanted back toward it.' : I(c.info.pn || c.info.pa) + ' follows the verb behind a line slanted back toward the subject.', [why1, why2]);
    }
    var id = kind === 'oc' ? R.pick(['oc', 'do']) : 'pn';
    return dgAsk(R, c.spec, c.text, id, L);
  });

  /* ---------------------------------------------------------------- gram.diagram-prep-phrases */
  G('gram.diagram-prep-phrases', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['ask', 'under']), R.pick(['under', 'choose', 'ask']), R.pick(['choose', 'under']));
    var adjP = R.coin();
    var c = adjP ? compose(R, { kind: R.pick(['intr', 'tr']), subj: R.pick(['person', 'animal']), subjPP: true, place: false, adv: false, adj: false })
      : compose(R, { kind: L === 1 ? 'intr' : 'tr', subj: R.pick(['person', 'name']), place: true, adv: false, adj: false, objAdj: false });
    if (!adjP && !c.info.place) c = compose(R, { kind: 'intr', subj: 'name', place: true, adv: false });
    var sl = slotsOf(c.spec), prepSlot = sl.filter(function (x) { return x.role === 'preposition'; })[0], pid = prepSlot.id, objId = pid + '.o';
    var parW = slotWord(c.spec, parentId(pid)), pp = phraseLow(c, c.toks.map(function (t) { return t.w; }).indexOf(prepSlot.w), c.toks.length - 1);
    var ppText = c.toks.filter(function (t) { return t.grp === (adjP ? 'sp.pp' : 'place'); }).map(function (t) { return t.w; }).join(' ');
    if (shape === 'under') {
      var others = ML.util.uniq(sl.filter(function (x) { return /^(subject|verb|direct object)$/.test(x.role) && x.w !== parW; }).map(function (x) { return x.w; })).concat([slotWord(c.spec, objId)]);
      return { q: Q(P('In a diagram of this sentence, under which word does the phrase ' + qt(ppText) + ' hang?'), S(c.text)), a: mc(parW, others, L === 1 ? 3 : 4),
        hint: 'Ask what the phrase tells about: which one (a noun) or where, when, how (a verb).',
        steps: [qt(ppText) + (adjP ? ' tells which ' + parW + '.' : ' tells more about the action ' + parW + '.'), 'So it hangs under ' + I(parW) + ': the preposition ' + I(prepSlot.w) + ' on a slanted line, its object on a flat line.'].concat(!adjP && c.info.obj ? ['It doesn’t hang under ' + I(c.info.obj) + ', the nearest noun: it tells about the action.'] : []) };
    }
    if (shape === 'choose') {
      var w1 = clone(c.spec), why1, w2 = clone(c.spec), why2;
      if (adjP) { var ph = w1.s.m.filter(function (m) { return m.p; })[0]; w1.s.m = w1.s.m.filter(function (m) { return !m.p; }); w1.v.m = (w1.v.m || []).concat([ph]); why1 = 'the phrase hangs under the verb, but it tells which ' + parW + '.'; }
      else { var ph2 = w1.v.m.filter(function (m) { return m.p; })[0]; w1.v.m = w1.v.m.filter(function (m) { return !m.p; }); if (w1.do) { w1.do.m = (w1.do.m || []).concat([ph2]); why1 = 'the phrase hangs under ' + I(c.info.obj) + ', the nearest noun, but it tells about the action.'; } else { w1.s.m = (w1.s.m || []).concat([ph2]); why1 = 'the phrase hangs under the subject, but it tells about the action.'; } }
      // a phrase drawn flat in sentence order: the preposition and its object on the baseline as if they were objects
      var pr = sl.filter(function (x) { return x.role === 'preposition'; })[0];
      var w2m = adjP ? w2.s : w2.v; var ph3 = w2m.m.filter(function (m) { return m.p; })[0]; w2m.m = w2m.m.filter(function (m) { return !m.p; });
      if (!w2.do) { w2.do = { w: ph3.o.w, m: [{ w: ph3.p }].concat(ph3.o.m || []) }; why2 = 'the object of the preposition is drawn as a direct object, with the preposition hanging under it like an adjective.'; }
      else { w2.oc = { w: ph3.o.w, m: [{ w: ph3.p }].concat(ph3.o.m || []) }; why2 = 'the phrase’s noun is drawn on the baseline as a complement, with the preposition hanging under it like an adjective.'; }
      void pr;
      return dgChoose(R, [c.spec, w1, w2], c.text, 'the phrase hangs under ' + I(parW) + ', the word it modifies: ' + I(prepSlot.w) + ' on the slant and ' + I(slotWord(c.spec, objId)) + ' on the flat line.', [why1, why2]);
    }
    return dgAsk(R, c.spec, c.text, R.coin() ? pid : objId, L);
  });

  /* ---------------------------------------------------------------- gram.diagram-compounds */
  var CPD = [ // compound sentences: [text, [clause specs as functions], conj]
    function () { return ['The rain stopped, and the sun came out.', { compound: [D().clause({ s: D().n('rain', ['The']), v: 'stopped' }), D().clause({ s: D().n('sun', ['the']), v: D().n('came', ['out']) })], conj: 'and' }, [['rain', 'sun'], ['stopped', 'came']]]; },
    function () { return ['Leo likes soccer, but Mia prefers chess.', { compound: [D().clause({ s: 'Leo', v: 'likes', do: 'soccer' }), D().clause({ s: 'Mia', v: 'prefers', do: 'chess' })], conj: 'but' }, [['Leo', 'Mia'], ['likes', 'prefers']]]; },
    function () { return ['The puppy barked, and the kitten hid.', { compound: [D().clause({ s: D().n('puppy', ['The']), v: 'barked' }), D().clause({ s: D().n('kitten', ['the']), v: 'hid' })], conj: 'and' }, [['puppy', 'kitten'], ['barked', 'hid']]]; },
    function () { return ['We waited, but the bus never came.', { compound: [D().clause({ s: 'We', v: 'waited' }), D().clause({ s: D().n('bus', ['the']), v: D().n('came', ['never']) })], conj: 'but' }, [['We', 'bus'], ['waited', 'came']]]; },
    function () { return ['Ana painted, and Leo sang.', { compound: [D().clause({ s: 'Ana', v: 'painted' }), D().clause({ s: 'Leo', v: 'sang' })], conj: 'and' }, [['Ana', 'Leo'], ['painted', 'sang']]]; },
    function () { return ['Mia read a book, or she drew pictures.', { compound: [D().clause({ s: 'Mia', v: 'read', do: D().n('book', ['a']) }), D().clause({ s: 'she', v: 'drew', do: 'pictures' })], conj: 'or' }, [['Mia', 'she'], ['read', 'drew']]]; }
  ];
  var CDO = [['Mia bought apples and pears.', 'Mia', 'bought', ['apples', 'pears']], ['Leo packed a sandwich and an apple.', 'Leo', 'packed', [D_('sandwich', ['a']), D_('apple', ['an'])]], ['We saw deer and rabbits.', 'We', 'saw', ['deer', 'rabbits']], ['Grandpa fixed the fence and the gate.', 'Grandpa', 'fixed', [D_('fence', ['the']), D_('gate', ['the'])]]];
  function D_(w, m) { return { w: w, m: m.map(function (x) { return { w: x }; }) }; }
  G('gram.diagram-compounds', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['ask', 'part']), R.pick(['ask', 'choose', 'part']), R.pick(['choose', 'ask']));
    if (shape === 'part') {
      var cs = R.coin(), cv = !cs || R.coin(), c = compoundS(R, cs, cv), sl = slotsOf(c.spec), cj = sl.filter(function (x) { return x.role === 'conjunction'; });
      var id = R.pick(cj).id;
      return dgAsk(R, c.spec, c.text, id, L, ['The parts joined by ' + I(slotWord(c.spec, id)) + ' sit on parallel lines of a fork; the conjunction goes beside the dashed line between them.']);
    }
    var useSent = shape === 'choose' || R.chance(0.6);
    if (useSent) {
      var e = R.pick(CPD)(), spec = e[1];
      if (shape === 'choose') {
        var one = D().clause({ s: D().and(e[1].conj, e[2][0]), v: D().and(e[1].conj, e[2][1]) });
        return dgChoose(R, [spec, one], e[0], 'a compound sentence has two baselines, one for each independent clause, joined at the verbs by a dashed step line with the conjunction ' + I(e[1].conj) + '.', ['it puts both clauses on one baseline, as if ' + I(e[2][0].join(' ' + e[1].conj + ' ')) + ' were a compound subject. But each clause has its own subject and verb.']);
      }
      return dgAsk(R, spec, e[0], R.pick(['cj', 'c1.s', 'c0.v', 'c1.v']), L, R.coin() ? [] : ['Each independent clause gets its own baseline; a dashed line with the conjunction joins the two verbs.']);
    }
    var d = R.pick(CDO), spec2 = D().clause({ s: d[1], v: d[2], do: D().and('and', d[3]) });
    return dgAsk(R, spec2, d[0], R.pick(['do.0', 'do.1', 'do.cj']), L, ['The two direct objects share one verb, so they sit on a fork after the upright line.']);
  });

  /* ---------------------------------------------------------------- gram.diagram-appositives */
  var APPS_D = [
    function () { return ['My aunt, a pilot, flew the plane.', D().clause({ s: D().n('aunt', ['My'], { app: D().n('pilot', ['a']) }), v: 'flew', do: D().n('plane', ['the']) }), 's.a', 'aunt']; },
    function () { return ['Our dog, a beagle, chased the ball.', D().clause({ s: D().n('dog', ['Our'], { app: D().n('beagle', ['a']) }), v: 'chased', do: D().n('ball', ['the']) }), 's.a', 'dog']; },
    function () { return ['Mr. Lee, our coach, blew the whistle.', D().clause({ s: D().n('Mr. Lee', [], { app: D().n('coach', ['our']) }), v: 'blew', do: D().n('whistle', ['the']) }), 's.a', 'Mr. Lee']; },
    function () { return ['We met Rosa, the winner.', D().clause({ s: 'We', v: 'met', do: D().n('Rosa', [], { app: D().n('winner', ['the']) }) }), 'do.a', 'Rosa']; },
    function () { return ['The winner, Omar, smiled.', D().clause({ s: D().n('winner', ['The'], { app: 'Omar' }), v: 'smiled' }), 's.a', 'winner']; },
    function () { return ['Ms. Park, the librarian, found the book.', D().clause({ s: D().n('Ms. Park', [], { app: D().n('librarian', ['the']) }), v: 'found', do: D().n('book', ['the']) }), 's.a', 'Ms. Park']; }
  ];
  var FLOAT_D = [
    function () { return ['Wow, the team won!', D().clause({ s: D().n('team', ['the']), v: 'won', float: ['Wow'] }), 'Wow', 'an interjection']; },
    function () { return ['Leo, close the window.', D().clause({ s: '(you)', v: 'close', do: D().n('window', ['the']), float: ['Leo'] }), 'Leo', 'a noun of direct address']; },
    function () { return ['Oh, the bus left.', D().clause({ s: D().n('bus', ['the']), v: 'left', float: ['Oh'] }), 'Oh', 'an interjection']; },
    function () { return ['Mia, please feed the cat.', D().clause({ s: '(you)', v: D().n('feed', ['please']), do: D().n('cat', ['the']), float: ['Mia'] }), 'Mia', 'a noun of direct address']; },
    function () { return ['Hooray, the snow stopped!', D().clause({ s: D().n('snow', ['the']), v: 'stopped', float: ['Hooray'] }), 'Hooray', 'an interjection']; }
  ];
  G('gram.diagram-appositives', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, R.pick(['ask', 'float']), R.pick(['choose', 'ask', 'float']), R.pick(['choose', 'float']));
    if (shape === 'float') {
      var f = R.pick(FLOAT_D)();
      return dgAsk(R, f[1], f[0], 'f0', L, [cap(I(f[2])) + ' is ' + f[3] + ': it isn’t the subject or any other part of the sentence’s frame.']);
    }
    var a = R.pick(APPS_D)(), spec = a[1];
    if (shape === 'choose') {
      var w1 = clone(spec), key = a[2].split('.')[0], node = w1[key], app = node.app; delete node.app;
      var appW = typeof app === 'string' ? app : app.w;
      node.m = (node.m || []).concat([{ w: appW, m: typeof app === 'string' ? [] : (app.m || []) }]);
      var other = key === 's' ? 'do' : 's', w2 = clone(spec), n2 = w2[key], ap2 = n2.app;
      if (w2[other] && !w2[other].and) {
        delete n2.app; if (typeof w2[other] === 'string') w2[other] = { w: w2[other] }; w2[other].app = ap2;
        return dgChoose(R, [spec, w1, w2], a[0], 'the appositive ' + I(appW) + ' sits in parentheses right beside ' + I(a[3]) + ', the noun it renames.', ['the appositive hangs under the noun like an adjective, but it renames the noun; it doesn’t describe it.', 'the appositive stands beside ' + I(slotWord(spec, other)) + ', but it renames ' + I(a[3]) + '.']);
      }
      return dgChoose(R, [spec, w1], a[0], 'the appositive ' + I(appW) + ' sits in parentheses right beside ' + I(a[3]) + ', the noun it renames.', ['the appositive hangs under the noun like an adjective, but it renames the noun; it doesn’t describe it.']);
    }
    return dgAsk(R, spec, a[0], a[2], L, ['An appositive renames the noun beside it, so it stands next to that noun, in parentheses.']);
  });

  /* ---------------------------------------------------------------- gram.diagram-verbals */
  var VERB_D = [ // [text, spec builder, slot id of the verbal, kind]
    function () { return ['The barking dog woke the baby.', D().clause({ s: D().n('dog', ['The', { part: 'barking' }]), v: 'woke', do: D().n('baby', ['the']) }), 's.m1', 'participle']; },
    function () { return ['Waving her hat, Mia ran.', D().clause({ s: D().n('Mia', [{ part: 'Waving', o: D().n('hat', ['her']) }]), v: 'ran' }), 's.m0', 'participle']; },
    function () { return ['The tired hikers rested.', D().clause({ s: D().n('hikers', ['The', { part: 'tired' }]), v: 'rested' }), 's.m1', 'participle']; },
    function () { return ['Swimming in the lake cools the tired hikers.', D().clause({ s: { ger: 'Swimming', m: [D().pp('in', 'lake', ['the'])] }, v: 'cools', do: D().n('hikers', ['the', { part: 'tired' }]) }), 's', 'gerund']; },
    function () { return ['She loves baking bread.', D().clause({ s: 'She', v: 'loves', do: { ger: 'baking', o: 'bread' } }), 'do', 'gerund']; },
    function () { return ['Reading helps me.', D().clause({ s: { ger: 'Reading' }, v: 'helps', do: 'me' }), 's', 'gerund']; },
    function () { return ['Leo wants to win.', D().clause({ s: 'Leo', v: 'wants', do: { inf: 'win' } }), 'do', 'infinitive']; },
    function () { return ['To win was her goal.', D().clause({ s: { inf: 'win' }, v: 'was', pn: D().n('goal', ['her']) }), 's', 'infinitive']; },
    function () { return ['Ana likes to paint.', D().clause({ s: 'Ana', v: 'likes', do: { inf: 'paint' } }), 'do', 'infinitive']; },
    function () { return ['To finish early is our plan.', D().clause({ s: { inf: 'finish', m: ['early'] }, v: 'is', pn: D().n('plan', ['our']) }), 's', 'infinitive']; }
  ];
  var VERBAL_LINE = { participle: 'a participle bends along a line that curves into a flat line, under the noun it modifies', gerund: 'a gerund rides a stepped line, raised on a forked stand in a noun’s place', infinitive: 'an infinitive has to on a slanted line and the verb on a flat line (on a forked stand when it does a noun’s job)' };
  G('gram.diagram-verbals', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'ask', R.pick(['kind', 'ask']), R.pick(['kind', 'ask', 'ask']));
    var v = R.pick(VERB_D)(), spec = v[1];
    if (shape === 'kind') {
      return { q: Q(P('In this diagram, what kind of verbal is in place A?')), a: mcKeep(['participle', 'gerund', 'infinitive'], ['participle', 'gerund', 'infinitive'].indexOf(v[3])),
        viz: dgViz(spec, v[0], { ask: [v[2]] }), hint: 'Look at the line: bent, stepped, or to on a slant?',
        steps: ['Place A holds ' + I(slotWord(spec, v[2])) + '.', 'In the usual Reed–Kellogg form, ' + VERBAL_LINE[v[3]] + '.', 'So it is ' + an(v[3]) + ' ' + v[3] + '.'] };
    }
    return dgAsk(R, spec, v[0], v[2], L, [cap(I(slotWord(spec, v[2]))) + ' is ' + an(v[3]) + ' ' + v[3] + ', not the main verb: ' + VERBAL_LINE[v[3]] + '.']);
  });

  /* ---------------------------------------------------------------- gram.diagram-clauses */
  var CL_D = [ // [text, spec, slot ids worth asking, the clause's kind, the word it hangs from, a wrong host]
    function () { return ['We left when the bell rang.', D().clause({ s: 'We', v: D().n('left', [{ cl: D().clause({ s: D().n('bell', ['the']), v: 'rang' }), sub: 'when' }]) }), ['v.m0.sub', 'v.m0.c.s'], 'adverb', 'v', 's']; },
    function () { return ['Mia smiled when she saw the puppy.', D().clause({ s: 'Mia', v: D().n('smiled', [{ cl: D().clause({ s: 'she', v: 'saw', do: D().n('puppy', ['the']) }), sub: 'when' }]) }), ['v.m0.sub', 'v.m0.c.do'], 'adverb', 'v', 's']; },
    function () { return ['We stayed inside because it was cold.', D().clause({ s: 'We', v: D().n('stayed', ['inside', { cl: D().clause({ s: 'it', v: 'was', pn: 'cold' }), sub: 'because' }]) }), ['v.m1.sub', 'v.m1.c.pn'], 'adverb', 'v', 's']; },
    function () { return ['The book that you lent me is great.', D().clause({ s: D().n('book', ['The', { rel: D().clause({ s: 'you', v: D().n('lent', [{ io: 'me' }]), do: 'that' }), link: 'that' }]), v: 'is', pn: 'great' }), ['s.m1.c.do', 's.m1.c.s'], 'adjective', 's', 'pn']; },
    function () { return ['The girl who won the race is my cousin.', D().clause({ s: D().n('girl', ['The', { rel: D().clause({ s: 'who', v: 'won', do: D().n('race', ['the']) }), link: 'who' }]), v: 'is', pn: D().n('cousin', ['my']) }), ['s.m1.c.s', 's.m1.c.do'], 'adjective', 's', 'pn']; },
    function () { return ['I found the key that you lost.', D().clause({ s: 'I', v: 'found', do: D().n('key', ['the', { rel: D().clause({ s: 'you', v: 'lost', do: 'that' }), link: 'that' }]) }), ['do.m1.c.do', 'do.m1.c.v'], 'adjective', 'do', 's'] ; },
    function () { return ['The dog that lives here barks loudly.', D().clause({ s: D().n('dog', ['The', { rel: D().clause({ s: 'that', v: D().n('lives', ['here']) }), link: 'that' }]), v: D().n('barks', ['loudly']) }), ['s.m1.c.s', 's.m1.c.v.m0'], 'adjective', 's', 'v']; }
  ];
  function moveClause(spec, from, to) { // move the clause modifier from one host slot key to another (s, v, do, pn)
    var w = clone(spec), hf = w[from], mod = hf.m.filter(function (m) { return m.cl || m.rel; })[0];
    hf.m = hf.m.filter(function (m) { return m !== mod; }); if (!hf.m.length) delete hf.m;
    var ht = w[to]; if (typeof ht === 'string') ht = w[to] = { w: ht }; ht.m = (ht.m || []).concat([mod]);
    return w;
  }
  G('gram.diagram-clauses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'ask', R.pick(['ask', 'choose', 'kind']), R.pick(['choose', 'ask']));
    var e = R.pick(CL_D)(), spec = e[1], hostW = slotWord(spec, e[4]);
    if (shape === 'kind') return { q: Q(P('This diagram shows a dependent clause on its own baseline below. Is it an adjective clause or an adverb clause?')), a: mcKeep(['adjective clause', 'adverb clause'], e[3] === 'adjective' ? 0 : 1),
      viz: dgViz(spec, e[0]), hint: 'Follow the dotted line up. Does it reach a noun or a verb?',
      steps: ['The dotted line rises to ' + I(hostW) + ', ' + (e[3] === 'adjective' ? 'a noun' : 'the verb') + '.', e[3] === 'adjective' ? 'A clause that modifies a noun is an adjective clause; the dotted line runs from the noun to the relative pronoun.' : 'A clause that modifies a verb is an adverb clause; the subordinating conjunction sits on the dotted line.'] };
    if (shape === 'choose') {
      if (e[3] === 'adverb') { // the trouble: drawing the dependent clause as a second independent clause (a compound sentence)
        var main = clone(spec), mod = main.v.m.filter(function (m) { return m.cl; })[0]; main.v.m = main.v.m.filter(function (m) { return m !== mod; }); if (!main.v.m.length) delete main.v.m;
        var asCompound = { compound: [main, mod.cl], conj: mod.sub };
        return dgChoose(R, [spec, asCompound], e[0], 'the adverb clause has its own baseline below, hanging by a dotted line from ' + I(hostW) + ', the verb it modifies, with ' + I(mod.sub) + ' on the dotted line.', ['it draws the clause like the second half of a compound sentence, joined by a dashed step line. But ' + qt(mod.sub + ' …') + ' can’t stand alone: it is a dependent clause that modifies the verb.']);
      }
      var wrong = moveClause(spec, e[4], e[5]);
      return dgChoose(R, [spec, wrong], e[0], 'the adjective clause hangs from ' + I(hostW) + ', the noun it modifies, with the dotted line ending at the relative pronoun.', ['the clause hangs from ' + I(slotWord(spec, e[5])) + ', but it tells about ' + I(hostW) + '.']);
    }
    return dgAsk(R, spec, e[0], R.pick(e[2]), L, ['The dependent clause has its own baseline below the main one, with its own subject and verb.']);
  });

  /* ---------------------------------------------------------------- gram.diagram-noun-clauses */
  var NCL_D = [ // [text, spec, slot ids worth asking, the clause's job, host slot key, the noun clause's spec, its verb]
    function () { return ['I know that she left.', D().clause({ s: 'I', v: 'know', do: { ncl: D().clause({ s: 'she', v: 'left', intro: 'that' }) } }), ['do.c.intro', 'do.c.s'], 'direct object', 'do']; },
    function () { return ['What you said surprised me.', D().clause({ s: { ncl: D().clause({ s: 'you', v: 'said', do: 'What' }) }, v: 'surprised', do: 'me' }), ['s.c.do', 's.c.v'], 'subject', 's']; },
    function () { return ['We wondered where the cat went.', D().clause({ s: 'We', v: 'wondered', do: { ncl: D().clause({ s: D().n('cat', ['the']), v: D().n('went', ['where']) }) } }), ['do.c.v.m0', 'do.c.s'], 'direct object', 'do']; },
    function () { return ['Whoever finishes first wins a prize.', D().clause({ s: { ncl: D().clause({ s: 'Whoever', v: D().n('finishes', ['first']) }) }, v: 'wins', do: D().n('prize', ['a']) }), ['s.c.s', 's.c.v'], 'subject', 's']; },
    function () { return ['My hope is that the rain stops.', D().clause({ s: D().n('hope', ['My']), v: 'is', pn: { ncl: D().clause({ s: D().n('rain', ['the']), v: 'stops', intro: 'that' }) } }), ['pn.c.intro', 'pn.c.s'], 'predicate noun', 'pn']; },
    function () { return ['I know that she wants to win.', D().clause({ s: 'I', v: 'know', do: { ncl: D().clause({ s: 'she', v: 'wants', do: { inf: 'win' }, intro: 'that' }) } }), ['do.c.intro', 'do.c.v'], 'direct object', 'do']; },
    function () { return ['We know that the team won.', D().clause({ s: 'We', v: 'know', do: { ncl: D().clause({ s: D().n('team', ['the']), v: 'won', intro: 'that' }) } }), ['do.c.intro', 'do.c.s'], 'direct object', 'do']; },
    function () { return ['Whoever knocks gets a cookie.', D().clause({ s: { ncl: D().clause({ s: 'Whoever', v: 'knocks' }) }, v: 'gets', do: D().n('cookie', ['a']) }), ['s.c.s', 's.c.v'], 'subject', 's']; },
    function () { return ['The rule is that everyone helps.', D().clause({ s: D().n('rule', ['The']), v: 'is', pn: { ncl: D().clause({ s: 'everyone', v: 'helps', intro: 'that' }) } }), ['pn.c.intro', 'pn.c.s'], 'predicate noun', 'pn']; },
    function () { return ['I wonder where the keys went.', D().clause({ s: 'I', v: 'wonder', do: { ncl: D().clause({ s: D().n('keys', ['the']), v: D().n('went', ['where']) }) } }), ['do.c.v.m0', 'do.c.s'], 'direct object', 'do']; },
    function () { return ['What she built amazed us.', D().clause({ s: { ncl: D().clause({ s: 'she', v: 'built', do: 'What' }) }, v: 'amazed', do: 'us' }), ['s.c.do', 's.c.v'], 'subject', 's']; },
    function () { return ['Our plan is that we leave early.', D().clause({ s: D().n('plan', ['Our']), v: 'is', pn: { ncl: D().clause({ s: 'we', v: D().n('leave', ['early']), intro: 'that' }) } }), ['pn.c.intro', 'pn.c.s'], 'predicate noun', 'pn']; },
    function () { return ['They knew that Grandpa liked music.', D().clause({ s: 'They', v: 'knew', do: { ncl: D().clause({ s: 'Grandpa', v: 'liked', do: 'music', intro: 'that' }) } }), ['do.c.intro', 'do.c.s'], 'direct object', 'do']; }
  ];
  G('gram.diagram-noun-clauses', function (R, ctx) {
    var L = ctx.level, shape = ML.byLevel(ctx, 'ask', R.pick(['job', 'ask', 'choose']), R.pick(['choose', 'job']));
    var e = R.pick(shape === 'choose' ? NCL_D.slice(0).filter(function (f) { return f()[4] !== 's'; }) : NCL_D)(), spec = e[1];
    if (shape === 'job') return { q: Q(P('In this diagram, the noun clause stands on a forked stand. Which job does it do in the main sentence?')), a: mcKeep(['subject', 'direct object', 'predicate noun'], ['subject', 'direct object', 'predicate noun'].indexOf(e[3])),
      viz: dgViz(spec, e[0]), hint: 'Look where the stand meets the baseline: left of the dividing line, after an upright line, or after a slanted line?',
      steps: ['The stand meets the baseline ' + { subject: 'in the subject’s place, left of the line that crosses the baseline', 'direct object': 'after the upright line, in the direct object’s place', 'predicate noun': 'after the slanted line, in the predicate noun’s place' }[e[3]] + '.', 'So the noun clause is the ' + e[3] + '.'] };
    if (shape === 'choose') {
      // the trouble: a noun clause drawn like an adverb clause hanging from the verb by a dotted line
      var w = clone(spec), nc = w[e[4]].ncl, intro = nc.intro || ''; delete nc.intro;
      delete w[e[4]];
      w.v = typeof w.v === 'string' ? { w: w.v } : w.v; w.v.m = (w.v.m || []).concat([{ cl: nc, sub: intro }]);
      return dgChoose(R, [spec, w], e[0], 'the noun clause stands on a forked stand in the ' + e[3] + '’s place, because it does a noun’s job.', ['it hangs the noun clause from the verb by a dotted line, like an adverb clause' + (e[4] === 's' ? ' (and invents a subject, it)' : '') + '. But the clause is the ' + e[3] + ' itself, not a modifier.']);
    }
    return dgAsk(R, spec, e[0], R.pick(e[2]), L, ['The noun clause sits on a stand in the ' + e[3] + '’s place, with its own subject and verb.']);
  });
})(window.MathLadder);

/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'gram', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
