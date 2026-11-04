/* Freud, The Interpretation of Dreams (gbx1). Also defines H.k20, the families shared by the gb20 (20th-century) rungs.
   This rung is the first gb20 rung in rungs.yaml, so the build runs this file before the others; they call H.k20
   lazily, inside their families, when a problem is made. Families (same shapes as H.k19 in gb19):
     H.k20.seq(list, what, it, R, lv)   order, "what comes right after", "what number is"
     H.k20.pairs(pairs, qa, qb, R, lv)  matching both ways: pairs = [[a, b], ...]
     H.k20.who(list, R, lv)             who says or argues this (our own summaries): list = [[summary, who, why?], ...]
     H.k20.dates(id)                    the ladder-wide families for a rung (when, before/after, volume, who wrote) */
H.k20 = {
  seq: function (seq, what, it, R, lv) {
    var r = R.next();
    if (r < 0.4) {
      var k = Math.min(seq.length, lv === 1 ? 3 : 4), idx = R.sample(seq.map(function (_, i) { return i; }), k).sort(function (a, b) { return a - b; });
      var right = idx.map(function (i) { return seq[i]; }).join(' → '), w = [];
      for (var t = 0; t < 12 && w.length < 3; t++) { var sh = R.shuffle(idx.slice()).map(function (i) { return seq[i]; }).join(' → '); if (sh !== right && w.indexOf(sh) < 0) w.push(sh); }
      return H.mc('Which list puts these in the right order (' + what + ')?', right, w, ['In order: ' + right + '.'], { hint: 'Find the first one, then work forward.' });
    }
    if (r < 0.7 || lv === 1) {
      var i = R.int(0, seq.length - 2), wr = R.sample(seq.filter(function (_, j) { return j !== i + 1 && j !== i; }), Math.min(seq.length - 2, lv === 1 ? 2 : 3));
      return H.mc('In ' + what + ', which ' + it + ' comes right after <b>' + seq[i] + '</b>?', seq[i + 1], wr, [seq[i] + ' is followed by ' + seq[i + 1] + '.']);
    }
    var j = R.int(0, seq.length - 1);
    return H.num('Counting ' + what + ', what number is <b>' + seq[j] + '</b>? (The first is 1.)', j + 1, ['The order is: ' + seq.map(function (x, n) { return (n + 1) + '. ' + x; }).join('; ') + '.'], { hint: 'Count from the start.' });
  },
  pairs: function (pairs, qa, qb, R, lv) {
    var p = R.pick(pairs), k = lv === 1 ? 2 : 3;
    if (qb && R.coin()) {
      var wa = H.uniq(pairs.filter(function (x) { return x[1] !== p[1] && x[0] !== p[0]; }).map(function (x) { return x[0]; }));
      return H.mc(qb(p[1]), p[0], R.sample(wa, Math.min(k, wa.length)), [p[0] + ': ' + p[1] + '.']);
    }
    var wb = H.uniq(pairs.filter(function (x) { return x[1] !== p[1]; }).map(function (x) { return x[1]; }));
    return H.mc(qa(p[0]), p[1], R.sample(wb, Math.min(k, wb.length)), [p[0] + ': ' + p[1] + '.']);
  },
  who: function (list, R, lv) {
    var p = R.pick(list), names = H.uniq(list.map(function (x) { return x[1]; })).filter(function (x) { return x !== p[1]; });
    return H.mc('Who says or argues this? (Our summary.) <i>' + p[0] + '</i>', p[1], R.sample(names, Math.min(names.length, lv === 1 ? 2 : 3)), [p[1] + '. ' + (p[2] || '')]);
  },
  dates: function (id) {
    return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); },
      function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }];
  }
};

var ID = 'gb20.freud-interpretation-of-dreams';
var WORK = [['condensation', 'many dream thoughts squeezed into one image or person'], ['displacement', 'feeling moved from an important thought onto an unimportant detail'], ['considerations of representability', 'abstract thoughts turned into pictures the dream can show'], ['secondary elaboration', 'the dream patched into a story that seems to make sense'], ['the day\'s residues', 'ordinary bits of the day before that the dream borrows'], ['free association', 'saying whatever comes to mind about each part of a dream, holding nothing back']];
var TERMS = [['manifest content', 'the dream as you remember it'], ['latent content', 'the hidden dream thoughts Freud looked for beneath it'], ['dream-work', 'the process that turns hidden thoughts into the remembered dream'], ['censorship', 'the force that disguises thoughts the dreamer would not accept'], ['wish-fulfilment', 'Freud\'s claim about what every dream does']];
var STEPS = ['a wish or worry from waking life', 'the dream-work disguises it', 'the dream you remember', 'free association about each part', 'the interpreter\'s reading of the hidden thought'];
var JUDGE = [['dreams use the day\'s events', 'well supported: dreams often draw on recent waking life and concerns'], ['every dream fulfils a wish', 'not supported as a rule: many dreams are anxious, plain, or repeat a worry'], ['dreams are disguised by a censor', 'disputed: many researchers think dreams are not disguised at all'], ['much of the mind works outside awareness', 'broadly accepted today, though in a different form than Freud\'s'], ['dream interpretation as a test of a theory', 'criticized: critics said the method could find a meaning to fit any dream']];
var WHO = [
  ['The interpretation of dreams is the main road to knowing the unconscious mind.', 'Sigmund Freud', 'The Interpretation of Dreams, Chapter VII (our paraphrase of the "via regia" sentence).'],
  ['Dreaming happens mostly in a stage of sleep with rapid eye movements.', 'Aserinsky and Kleitman', 'Their sleep-laboratory discovery of REM sleep, 1953.'],
  ['Dreams arise when the sleeping brain makes a story from its own signals.', 'Hobson and McCarley', 'The "activation-synthesis" idea, 1977.'],
  ['A theory that can explain every possible outcome is not tested by any of them.', 'Karl Popper', 'A philosopher of science who used psychoanalysis as his main example.'],
  ['Dreams may also speak of the dreamer\'s future growth, not only past wishes.', 'Carl Jung', 'Freud\'s close colleague, who broke with him in 1913.'],
  ['The method lets the dreamer say whatever comes to mind about each part of the dream.', 'Sigmund Freud', 'Free association, Chapter II.']
];
var B = {
  facts: [
    ['The Interpretation of Dreams came out in November 1899, with the date 1900 on its title page.', true, 'Freud wanted it to belong to the new century.'],
    ['The first English translation, by A. A. Brill, appeared in 1913.', true, 'From the third German edition.'],
    ['Freud thought dreams are meaningless noise from a tired brain.', false, 'That was the view he argued against.'],
    ['Freud\'s "specimen dream" in Chapter II is a dream of his own.', true, 'He analyzed many of his own dreams in the book.'],
    ['Freud claimed that a dream, once interpreted, turns out to be the fulfilment of a wish.', true, 'The end of Chapter II and Chapter III.'],
    ['Freud said a dream means exactly what it seems to mean on the surface.', false, 'He separated the manifest content from the hidden (latent) thoughts.'],
    ['REM sleep, the stage most linked with vivid dreams, was discovered in 1953.', true, 'Long after Freud wrote; it changed dream research.'],
    ['Today most scientists accept every part of Freud\'s dream theory.', false, 'Many parts are disputed; some, like the use of daily events, have support.'],
    ['Freud was a physician in Vienna who began as a researcher on the nervous system.', true, 'He trained in neurology before he developed psychoanalysis.']
  ],
  items: [
    { q: 'What did Freud call the dream as you remember it?', r: 'The manifest content', w: ['The latent content', 'The censorship', 'The day\'s residue'], why: 'The hidden thoughts beneath it are the latent content.' },
    { q: 'What method did Freud use to interpret dreams?', r: 'Free association: the dreamer says whatever comes to mind about each part', w: ['A dictionary of fixed dream symbols only', 'Measuring brain waves', 'Asking the dreamer to forget the dream'], why: 'Chapter II.' },
    { q: 'In Freud\'s comparison, the dream content is like a ...', r: 'translation of the dream thoughts into another language', w: ['photograph of the future', 'random list of words', 'copy of yesterday exactly as it happened'], why: 'Chapter VI.' },
    { q: 'What did Freud call the dream "the via regia" to?', r: 'A knowledge of the unconscious', w: ['A cure for sleeplessness', 'Telling the future', 'Learning languages'], why: 'Chapter VII.' },
    { q: 'Which is a main criticism of Freud\'s dream theory?', r: 'Its method could find a hidden meaning to fit almost any dream', w: ['It was written too briefly', 'It was only about animals', 'It used too much mathematics'], why: 'Karl Popper and others made this point.' },
    { q: 'Which later finding supports part of Freud\'s view?', r: 'Dreams often draw on recent events and the dreamer\'s waking concerns', w: ['Every dream is a wish', 'Dreams can predict the future', 'People never dream'], why: 'The "continuity" finding in modern dream research.' }
  ]
};
H.T(ID, B, [
  function (R, lv) { return H.k20.pairs(WORK, function (a) { return 'In Freud\'s account of dreams, what is <b>' + a + '</b>?'; }, function (b) { return 'Which term did Freud use for this: <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.pairs(TERMS, function (a) { return 'Freud\'s term <b>' + a + '</b> means ...'; }, function (b) { return 'Which of Freud\'s terms means <b>' + b + '</b>?'; }, R, lv); },
  function (R, lv) { return H.k20.seq(STEPS, 'Freud\'s picture of how a dream is made and then read', 'step', R, lv); },
  function (R, lv) { return H.k20.pairs(JUDGE, function (a) { return 'Freud\'s idea that <b>' + a + '</b>: how has later research judged it?'; }, null, R, lv); },
  function (R, lv) { return H.k20.who(WHO, R, lv); }
].concat(H.k20.dates(ID)), 0.6);
