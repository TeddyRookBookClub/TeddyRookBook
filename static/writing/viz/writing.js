/* Writing & Grammar Ladder: the shared visual kit (names prefixed wr-) and the model (MathLadder.writing), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ writing/viz/writing.css). Writing topic pages always load this file,
   and practice pages load it with the course (MathLadder.loadCourse), so generators may call MathLadder.writing.
   The model runs in node too: global.window = global; require('…/writing.js'). Vanilla JS, no libraries, no network.
   Source parts: /tmp/work_writing/src/kit/*.js (build: /tmp/work_writing/build_kit.sh). Conventions: /tmp/work_writing/overview.md.

   Embed:  <div class="ml-viz" data-viz="wr-tag" data-opts='{"text":"The|adj dog|n barked|v."}'></div>

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that could give a problem's answer away: tags, labels, highlights,
                  verdicts and Check buttons; what the problem asks about stays visible (often numbered or lettered).
     interactive: false   a still picture.   task: a line above the visual.   caption: HTML under it.   label: aria-label.
     big: true    larger text (First Writing).   readme: 'a note for the grown-up' (shown above).   speak: true adds a Read
                  aloud button (the browser's own voice; whole sentences only).

   TAGGED TEXT (wr-tag, wr-sentence): words separated by spaces; a tag after a bar: 'The|adj big|adj dog|n barked|v.'
     Leading “ ( and trailing . , ! ? ; : ” ) stay with the word; write a two-word unit with an underscore: 'no_one|pro'.
     Part-of-speech tags: n pro v adj adv prep conj int (MathLadder.writing.POS). Role tags (tagset 'roles'): s v do io pn pa oc.

   THE VISUALS AND THEIR OPTIONS
   wr-tag        label the words of a sentence. text (tagged) or words: [{ w, tag }]; tagset: 'pos' (default) | 'roles' |
                 [[key, label, color]]; tags: ['n', 'v'] (only these count and appear in the palette); only: [indexes] (show
                 tags just on these words); highlight: [indexes]. mode: 'show' (colored tags and a legend) | 'tag' (choose a
                 label, tap words, Check; keys 1–9 pick labels) | 'find' (ask: 'n' or ['n', 'pro']: tap every such word,
                 Check). quiet: words numbered 1, 2, 3 … (numbers: false hides them), no tags.
   wr-sentence   structure. text (plain or tagged); parts: [{ from, to, kind: 'subj' | 'pred' | 'ind' | 'dep' | 'phrase' | 'mod' |
                 'app' | 'verbal' | 'frag', label, color }] (word indexes, inclusive; overlapping parts stack in bands under
                 the words); roles: { index: 's' | 'v' | 'do' … } (small tags above words); links: [{ from, to, label, color, dash }]
                 (arrows above the words: agreement, a modifier to its word); strike: [from, to] (gray the words out: “cross out
                 the phrase”); highlight: [indexes]; legend: true; note. mode: 'split' (split: index of the first predicate
                 word; learners tap it, Check) | 'find' (answer: [indexes]; prompt). quiet: plain words (numbers: true numbers them).
   wr-punct      punctuation and capitals. text: the start; answer: 'target' or ['target', 'another right one']; marks:
                 [',', '.', '?', '!', ';', ':', '—'] offered in each gap; caps: false (no capital switching); alts: { index:
                 ['its', 'it’s'] } (tap a word to cycle its forms). mode: 'fix' (default with an answer: tap a gap for a menu of
                 marks, tap a word to switch its capital, Check, Show me) | 'show' (text with answer: added marks green, removed
                 red, changed capitals underlined). quiet with gaps: [indexes]: numbers in those gaps (“Which gap needs a comma?”).
   wr-combine    joining sentences. parts: ['I have a cat.', 'She is gray.']; joins: [{ label: ', and', make: 'I have a cat,
                 and she is gray.', ok: true, why, join: 'and' }] (tap each way; the result shows with a verdict); mode 'show'
                 with result and join (the joining words highlighted). quiet: the lettered sentences only.
   wr-revise     tracked changes. before, after (a word diff is computed) or segments: ['The dog ', { del: 'runned', ins:
                 'ran', why: '…', good: true }, ' home.']; title; view: 'tracked' | 'original' | 'final'. mode: 'show' (with a
                 Changes / Before / After switch; numbered reasons) | 'steps' (Next applies one edit at a time with its reason) |
                 'accept' (learners accept or reject each edit; edits with good: false should be rejected; Check).
                 quiet: tracked changes without reasons or controls.
   wr-compare    an original passage and versions (paraphrase, summary). original, source (HTML, e.g. a citation),
                 versions: [{ label, text, verdict (index into judge), note }]; min: 3 (shortest run of copied words marked);
                 percent: false; judge: ['Fair paraphrase', 'Too close: patchwriting', …] (learners label each version, Check).
                 quiet: no marks or percents.
   wr-sort       card sorter. bins: ['Sentence', 'Not a sentence'] (default); cards: [{ text | html, bin, why }] or strings;
                 shuffle; columns; reveal (Show me); solved; check: false. Tap a card, then a group; keyboard: a group's
                 number (0 = back). quiet: cards lettered, nothing to tap.
   wr-order      put items in order. items: ['…'] in the right order, or [{ text | html, label }]; start: [indexes];
                 title; noun ('steps', 'events'); labels: true; why. quiet: shuffled and lettered A, B, C …
   wr-para       a paragraph whose sentences have roles. sentences: [{ text | html, role, why }] in the right order; roles
                 (MathLadder.writing.PARA_ROLES): topic support example evidence commentary transition conclusion off hook
                 context thesis claim counter rebuttal beginning middle end; title. mode: 'show' (colored roles and a legend) |
                 'order' (shuffled; reorder; Check) | 'odd' (tap the sentence with role 'off'; Check) | 'label' (palette;
                 Check). letters: true (A, B, C … instead of numbers). quiet: numbered sentences, no roles.
   wr-mark       a passage with marked sentences. passage (split at . ! ?) or sentences: [{ text | html, k, who }] (k: a
                 label key; [[phrase]] inside text is highlighted in show mode); labels: 'appeals' | 'argument' | 'paragraph'
                 or [[key, label, color]]; source (HTML above); dialogue: true (one line per sentence, with who); note.
                 mode: 'show' | 'find' (ask: key; tap every such sentence; Check) | 'label' (palette; Check). quiet: numbered.
   wr-note     letters and notes with their parts. kind: 'friendly' | 'thanks' | 'formal' | 'email'; parts: { part: 'text' }
                 overrides the sample (parts: MathLadder.writing.LETTER[kind].parts; names: LETTER_NAMES); tags: false.
                 mode: 'show' (tagged parts) | 'order' (shuffled parts; reorder; Check) | 'missing' (omit: part; learners choose
                 which part is missing). omit: part (a dashed gap marks it); ask: part (quiet: that part outlined).
                 quiet: no tags; order mode lettered.
   wr-letter     stroke order for any print or cursive letter, capital or digit (MathLadder.writing.HAND). ch: 'a' or chars: 'hag'
                 (cells share one scale); style: 'print' | 'cursive'; numbered start dots (green 1 first) and arrows along
                 each stroke (numbers: false, arrows: false); animate (default on: a “Show me how” button, and it plays once;
                 autoplay: false; speed: units per second, default 140); lines: false; lineNames: true (labels the top,
                 middle and baseline); variants: [{}, { order: [1, 0] }, { reverse: [0] }] (lettered pictures of the same
                 letter, for “which order is right?”: order renumbers the strokes, reverse draws those strokes from the
                 other end); note. quiet: no buttons, no names; numbers and arrows stay unless turned off.
   wr-trace      trace on guide lines with a finger, mouse or pen. ch: 'a' or text: 'cat' (a word: print or joined cursive);
                 style; tol (default 15 grid units); reward: { e: '🌟', name: 'star' } (a sticker shown when every stroke is
                 done: a problem can ask which sticker appeared); doneText. Each stroke is checked against the model path:
                 most of the path covered and most of the tracing near it, starting at the green dot; after two tries the
                 check eases. Kind messages only (“Almost! Start at the green dot…”); Show me animates the current stroke;
                 Start over. A joined cursive word may be traced in one go.
   wr-join       cursive joins and handwriting to read. text: 'on' (or a line of words); style: 'cursive' (default) | 'print';
                 joining strokes in color with the exit (open dot) and entry (filled dot) points (highlight: false, points:
                 false, legend: false); variants: [{ text, nojoin: true }, …] (lettered: joined vs written apart);
                 distort: { index, kind: 'short' | 'float' | 'big' | 'mirror' | 'squash' } (one badly formed letter, for
                 “spot the letter”); numbers: true (numbers under each letter); note. quiet: plain writing to read.
   wr-hand       a hand, a desk or a child at a table (cartoon skin color #ffcc4d). kind: 'grip' (show or compare from
                 'tripod' 'fist' 'tip' 'top'; hand: 'left' mirrors it) | 'paper' ('right' 'left' 'straight' 'nohelper' 'wrong'
                 'left-wrong') | 'posture' ('good' 'slump' 'lean' 'feet'); compare: [variants] (lettered A, B, C…); good:
                 [variants] (their notes in green); notes: false. quiet: no notes; aria labels don't give the answer.
   wr-checklist  a checklist to tap and print. list: 'first' | 'edit' | 'revise' | 'timed' | 'citation' (MathLadder.writing.
                 CHECKLISTS) or items: ['…'] and title; name: false (no name and date line); print: false.
   wr-picture    a simple scene: an SVG backdrop and emoji. place: 'park' | 'beach' | 'pond' | 'farm' | 'snow' | 'yard' |
                 'night' | 'kitchen' | 'room' | 'classroom' | 'plain'; items: [{ k: 'dog' (an ACTORS or THINGS key) or e: '🐕',
                 x: 0–100, y: 0–100 (the emoji's baseline, % of the picture), s: size (1 = 64 px of 600), flip, label, ask: true
                 (a ? badge), name }]; sentence (shown under it); alt; frames: [{ place, items, caption }] (a strip of 2–4
                 panels, numbered; letters: true). quiet: no labels, sentence or captions. People are plain emoji, which show in
                 the standard yellow; never add skin-tone modifiers.
   wr-tense      a timeline. verb ('walk'), subject ('she'), tense ('past-perfect'; keys in MathLadder.writing.TENSES), rest
                 ('home'); times, aspects (the buttons offered: default past present future × simple progressive perfect; add
                 'perfect-progressive'); pick: false (no buttons). quiet: no verb phrase or tense name.
   wr-triangle   the rhetorical situation. fill: { writer, audience, message, purpose, context }; appeals: false;
                 highlight: 'ethos' | 'pathos' | 'logos' | 'context'; kairos: true. quiet: no appeal labels.
   wr-toulmin    claim, grounds, warrant, backing, qualifier, rebuttal (texts; any may be left out). mode: 'show' (with the
                 question each part answers) | 'steps' (reveal grounds → claim → warrant → backing → qualifier → rebuttal) |
                 'label' (role names hidden; palette; Check); questions: false. quiet: boxes lettered, no role names.
   wr-essay      the map of an essay. kind: 'five' | 'argument' | 'classical' | 'analysis' | 'synthesis' (MathLadder.writing.
                 ESSAYS) or sections: [{ role: 'intro' | 'context' | 'body' | 'counter' | 'conclusion', title, lines: [[role,
                 text]] }]; compare: true or ['five', 'argument'] (side by side); mode: 'show' (Map / Outline switch) |
                 'outline' | 'order' (reorder the sections; Check). quiet: section titles lettered.
   wr-cite       a citation and its parts. source: index into MathLadder.writing.SOURCES or a source object (see cite());
                 style: 'mla' | 'apa' | 'chicago'; form: 'entry' (default) | 'intext' (MLA, APA) | 'note' (Chicago);
                 styles: ['mla', 'apa', 'chicago'] (stacked, to compare). mode: 'show' (colored parts and a legend; a style
                 switch unless switch: false) | 'label' (palette of part names; tap parts; Check) | 'ask' (ask: part key: that
                 part outlined with a dashed box, for “What is the outlined part?”); colors: false.
   wr-diagram    Reed–Kellogg diagrams. spec (see THE MODEL: dg) and text (the sentence, shown above; showText: false).
                 mode: 'show' (roles: true lists each word's job) | 'steps' (words appear one at a time with their jobs) |
                 'build' (the frame with empty places and a tray of words; tap or drag each word to its place; Check, Show me;
                 given: [slot ids] stay filled) ; ask: [slot ids] (those places show A, B, C … instead of words, for problems);
                 hideWords: [slot ids] (blank places); choices: [spec, spec, …] (lettered diagrams side by side; answer: index
                 makes them tappable with Check). Slot ids come from MathLadder.writing.dgSlots(spec).

   THE MODEL: MathLadder.writing (pure data and functions; no DOM; works in node)
     POS, ROLES; WORDS (coordinating, subordinating, correlative, prepositions, linking, helping, interjections, pronouns by
     kind, indefNumber, transitions by kind, conjunctiveAdverbs); tokens(tagged) -> [{ w, tag, pre, post }], plain(tagged),
     indexesOf(tagged, tag); verbs: past(v), pp(v), ing(v), s3(v), conj(v, tenseKey, subject) ('had walked'), beForm(subj,
     'present' | 'past'), TENSES, IRREG {base: [past, participle]}; nouns: pluralOf(n), IRREG_PL, possessive(n, isPlural);
     cap, lowerFirst, stripEnd, article; pictures: ACTORS {key: { e, n, verbs }}, THINGS {key: { e, n }}, PLACES {key: { at }};
     diagrams: dg.n(word, [modifiers], extra), dg.pp(prep, object, [object's modifiers]), dg.and(conj, [nodes]),
     dg.clause({ s, v, do, io, pn, oc, float }), dgSlots(spec) -> [{ id, w, role }]. A diagram spec is a clause
       { s, v, do, io, pn, oc, float: ['Wow'] } or { compound: [clause, clause], conj: 'and' }; a node is { w, m: [modifiers],
       app: node } or { and: 'and', items: [nodes] } or a noun-place verbal { ger | inf: 'verb', o, m, pn } or { ncl: clause } (a clause may carry intro: 'that', shown on a line above it);
       verb nodes in a compound predicate may carry their own do, io, pn, oc. Modifiers: { w, m } (a word on a slant),
       { p: 'with', o: node } (prepositional phrase), { part: 'waving', o, m } (participle), { inf: 'read', o } (infinitive as
       a modifier), { cl: clause, sub: 'because' } (adverb clause), { rel: clause, link: 'which' } (adjective clause).
     citations: cite(source, 'mla' | 'apa' | 'chicago', 'entry' | 'intext' | 'note') -> [{ k, t, i }], citeText, citeHTML,
     pageRange(pages, style), sentenceCase(source), PART_NAMES, SOURCES (made-up sources for practice).
     CHECKLISTS, PARA_ROLES, TOULMIN, APPEALS, LETTER and LETTER_NAMES (browser), ESSAYS (browser), MARK_SETS (browser),
     sharedRuns(a, b, min) -> { a: [flags], b: [flags], share }, punctTokens/punctJoin (browser), diffWords (browser).
     handwriting: HAND.PRINT, HAND.CURSIVE (letterform data: strokes in order, cursive start s, exit x, conn), HAND.glyph(ch,
     style) -> { w, n (strokes), strokes: [{ d, start, end, dot, after }], box }, HAND.word(text, style, { distort }) ->
     { w, parts, boxes }, HAND.zone(ch) ('tall' | 'short' | 'tail'), HAND.startLine(ch, style) ('top' | 'middle' | 'other'),
     HAND.GROUPS (teaching groups), HAND.joins(ch), HAND.highExit(ch) (b o v w), HAND.wrongOrder(n, seed), HAND.letters(style).
     Grid: top line 0, middle 50, baseline 100, descender 150; cursive slant HAND.SLANT (0.36). HAND_NOTES (browser).
     SKIN '#ffcc4d', SKIN_LINE '#e8a93a' (the site's one cartoon skin color, for any drawn person).                        */
/* =====================================================================================================================
   THE MODEL: MathLadder.writing (pure data and functions; no DOM; works in node)
   ===================================================================================================================== */
(function (W) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math;

  /* ---------- parts of speech, sentence roles ---------- */
  var POS = {
    n: { label: 'noun', abbr: 'N', color: '#1c6fd6' },
    pro: { label: 'pronoun', abbr: 'Pro', color: '#0c8599' },
    v: { label: 'verb', abbr: 'V', color: '#c92a2a' },
    adj: { label: 'adjective', abbr: 'Adj', color: '#2b8a3e' },
    adv: { label: 'adverb', abbr: 'Adv', color: '#b8650b' },
    prep: { label: 'preposition', abbr: 'Prep', color: '#7048e8' },
    conj: { label: 'conjunction', abbr: 'Conj', color: '#c2255c' },
    int: { label: 'interjection', abbr: 'Int', color: '#5c6370' }
  };
  var ROLES = {
    s: { label: 'subject', abbr: 'S', color: '#1c6fd6' },
    v: { label: 'verb', abbr: 'V', color: '#c92a2a' },
    do: { label: 'direct object', abbr: 'DO', color: '#2b8a3e' },
    io: { label: 'indirect object', abbr: 'IO', color: '#0c8599' },
    pn: { label: 'predicate noun', abbr: 'PN', color: '#7048e8' },
    pa: { label: 'predicate adjective', abbr: 'PA', color: '#b8650b' },
    oc: { label: 'object complement', abbr: 'OC', color: '#c2255c' }
  };
  var SENSES = { see: 'looks', hear: 'sounds', smell: 'smells', taste: 'tastes', touch: 'feels' };

  /* ---------- word lists generators may draw on ---------- */
  var WORDS = {
    coordinating: ['for', 'and', 'nor', 'but', 'or', 'yet', 'so'],
    subordinating: ['after', 'although', 'as', 'because', 'before', 'if', 'since', 'though', 'unless', 'until', 'when', 'whenever', 'where', 'while'],
    correlative: [['both', 'and'], ['either', 'or'], ['neither', 'nor'], ['not only', 'but also'], ['whether', 'or']],
    prepositions: ['about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by', 'down', 'during', 'for', 'from', 'in', 'inside', 'into', 'near', 'of', 'off', 'on', 'onto', 'out', 'over', 'past', 'through', 'to', 'toward', 'under', 'until', 'up', 'with', 'within', 'without'],
    linking: ['is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'seem', 'seems', 'seemed', 'become', 'becomes', 'became', 'appear', 'appears', 'appeared', 'feel', 'feels', 'felt', 'look', 'looks', 'looked', 'sound', 'sounds', 'sounded', 'taste', 'tastes', 'tasted', 'smell', 'smells', 'smelled', 'grow', 'grew', 'remain', 'remained', 'stay', 'stayed', 'turn', 'turned'],
    helping: ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'],
    interjections: ['oh', 'wow', 'well', 'hey', 'ouch', 'oops', 'hooray', 'yikes', 'ah', 'hmm', 'whoa'],
    pronouns: {
      personal: ['I', 'me', 'you', 'he', 'him', 'she', 'her', 'it', 'we', 'us', 'they', 'them'],
      possessive: ['my', 'mine', 'your', 'yours', 'his', 'her', 'hers', 'its', 'our', 'ours', 'their', 'theirs'],
      reflexive: ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'],
      demonstrative: ['this', 'that', 'these', 'those'],
      indefinite: ['anyone', 'anybody', 'anything', 'each', 'either', 'everybody', 'everyone', 'everything', 'neither', 'nobody', 'no one', 'nothing', 'one', 'somebody', 'someone', 'something', 'both', 'few', 'many', 'several', 'all', 'any', 'most', 'none', 'some'],
      interrogative: ['who', 'whom', 'whose', 'which', 'what'],
      relative: ['who', 'whom', 'whose', 'which', 'that']
    },
    // indefinite pronouns by number (usage.agreement-indefinite)
    indefNumber: { singular: ['anyone', 'anybody', 'anything', 'each', 'either', 'everybody', 'everyone', 'everything', 'neither', 'nobody', 'no one', 'nothing', 'one', 'somebody', 'someone', 'something'], plural: ['both', 'few', 'many', 'several'], depends: ['all', 'any', 'most', 'none', 'some'] },
    subjectCase: { I: 'me', he: 'him', she: 'her', we: 'us', they: 'them', who: 'whom' },
    transitions: {
      time: ['first', 'next', 'then', 'later', 'meanwhile', 'afterward', 'finally'],
      addition: ['also', 'in addition', 'furthermore', 'moreover', 'besides'],
      contrast: ['however', 'on the other hand', 'instead', 'nevertheless', 'still', 'in contrast'],
      cause: ['therefore', 'as a result', 'consequently', 'so', 'thus'],
      example: ['for example', 'for instance', 'in particular', 'to illustrate'],
      conclusion: ['in conclusion', 'in short', 'overall', 'in the end']
    },
    conjunctiveAdverbs: ['however', 'therefore', 'moreover', 'consequently', 'nevertheless', 'furthermore', 'instead', 'meanwhile', 'otherwise', 'then', 'thus', 'still', 'besides', 'indeed']
  };

  /* ---------- verbs: forms and the twelve tenses ---------- */
  // base: [past, past participle]
  var IRREG = {
    be: ['was', 'been'], have: ['had', 'had'], do: ['did', 'done'], go: ['went', 'gone'], see: ['saw', 'seen'], eat: ['ate', 'eaten'],
    run: ['ran', 'run'], come: ['came', 'come'], take: ['took', 'taken'], give: ['gave', 'given'], write: ['wrote', 'written'], ride: ['rode', 'ridden'],
    drive: ['drove', 'driven'], speak: ['spoke', 'spoken'], break: ['broke', 'broken'], choose: ['chose', 'chosen'], freeze: ['froze', 'frozen'],
    steal: ['stole', 'stolen'], wake: ['woke', 'woken'], fly: ['flew', 'flown'], know: ['knew', 'known'], grow: ['grew', 'grown'], throw: ['threw', 'thrown'],
    blow: ['blew', 'blown'], draw: ['drew', 'drawn'], swim: ['swam', 'swum'], sing: ['sang', 'sung'], ring: ['rang', 'rung'], drink: ['drank', 'drunk'],
    begin: ['began', 'begun'], sink: ['sank', 'sunk'], bring: ['brought', 'brought'], buy: ['bought', 'bought'], think: ['thought', 'thought'],
    catch: ['caught', 'caught'], teach: ['taught', 'taught'], fight: ['fought', 'fought'], seek: ['sought', 'sought'], make: ['made', 'made'],
    say: ['said', 'said'], pay: ['paid', 'paid'], lay: ['laid', 'laid'], lie: ['lay', 'lain'], sit: ['sat', 'sat'], set: ['set', 'set'],
    rise: ['rose', 'risen'], raise: ['raised', 'raised'], find: ['found', 'found'], hold: ['held', 'held'], keep: ['kept', 'kept'], sleep: ['slept', 'slept'],
    feel: ['felt', 'felt'], leave: ['left', 'left'], meet: ['met', 'met'], lose: ['lost', 'lost'], tell: ['told', 'told'], sell: ['sold', 'sold'],
    stand: ['stood', 'stood'], understand: ['understood', 'understood'], get: ['got', 'gotten'], forget: ['forgot', 'forgotten'], hide: ['hid', 'hidden'],
    bite: ['bit', 'bitten'], fall: ['fell', 'fallen'], wear: ['wore', 'worn'], tear: ['tore', 'torn'], put: ['put', 'put'], cut: ['cut', 'cut'],
    hit: ['hit', 'hit'], let: ['let', 'let'], read: ['read', 'read'], build: ['built', 'built'], send: ['sent', 'sent'], spend: ['spent', 'spent'],
    lend: ['lent', 'lent'], win: ['won', 'won'], dig: ['dug', 'dug'], hang: ['hung', 'hung'], shake: ['shook', 'shaken'], show: ['showed', 'shown'],
    feed: ['fed', 'fed'], lead: ['led', 'led'], hear: ['heard', 'heard'], mean: ['meant', 'meant']
  };
  var DOUBLE = { admit: 1, commit: 1, prefer: 1, refer: 1, occur: 1, permit: 1, control: 1, regret: 1, forget: 1, begin: 1, upset: 1, equip: 1, compel: 1 };
  var VOW = /[aeiou]/;
  function cvc(v) { // one-syllable consonant-vowel-consonant (stop, plan, hop) or a listed stressed ending
    if (DOUBLE[v]) return true;
    var m = v.match(/^([^aeiou]*)([aeiou])([^aeiouwxy])$/);
    return !!m && !/[aeiou]/.test(m[1].slice(-1)) && v.replace(/[^aeiou]/g, '').length === 1;
  }
  function regPast(v) {
    if (/e$/.test(v)) return v + 'd';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
    if (cvc(v)) return v + v.slice(-1) + 'ed';
    return v + 'ed';
  }
  function past(v) { return IRREG[v] ? IRREG[v][0] : regPast(v); }
  function pp(v) { return IRREG[v] ? IRREG[v][1] : regPast(v); }
  function ing(v) {
    if (v === 'be') return 'being';
    if (/ie$/.test(v)) return v.slice(0, -2) + 'ying';
    if (/[^aeiou]e$/.test(v) && v !== 'be') return v.slice(0, -1) + 'ing';
    if (cvc(v)) return v + v.slice(-1) + 'ing';
    return v + 'ing';
  }
  function s3(v) { // he/she/it form in the present
    if (v === 'be') return 'is'; if (v === 'have') return 'has'; if (v === 'do') return 'does'; if (v === 'go') return 'goes';
    if (/(s|x|z|ch|sh|o)$/.test(v)) return v + 'es';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    return v + 's';
  }
  var PERSONS = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];
  function third(subj) { return /^(he|she|it)$/i.test(subj) || subj === 3; }
  function plural(subj) { return /^(we|you|they)$/i.test(subj) || subj === 'pl'; }
  function beForm(subj, t) { // t: 'present' | 'past'
    if (t === 'past') return (/^I$/.test(subj) || third(subj)) ? 'was' : 'were';
    return /^I$/.test(subj) ? 'am' : third(subj) ? 'is' : 'are';
  }
  function haveForm(subj, t) { return t === 'past' ? 'had' : third(subj) ? 'has' : 'have'; }
  var TENSES = [
    { key: 'past', label: 'simple past', time: 'past', aspect: 'simple' },
    { key: 'present', label: 'simple present', time: 'present', aspect: 'simple' },
    { key: 'future', label: 'simple future', time: 'future', aspect: 'simple' },
    { key: 'past-progressive', label: 'past progressive', time: 'past', aspect: 'progressive' },
    { key: 'present-progressive', label: 'present progressive', time: 'present', aspect: 'progressive' },
    { key: 'future-progressive', label: 'future progressive', time: 'future', aspect: 'progressive' },
    { key: 'past-perfect', label: 'past perfect', time: 'past', aspect: 'perfect' },
    { key: 'present-perfect', label: 'present perfect', time: 'present', aspect: 'perfect' },
    { key: 'future-perfect', label: 'future perfect', time: 'future', aspect: 'perfect' },
    { key: 'past-perfect-progressive', label: 'past perfect progressive', time: 'past', aspect: 'perfect-progressive' },
    { key: 'present-perfect-progressive', label: 'present perfect progressive', time: 'present', aspect: 'perfect-progressive' },
    { key: 'future-perfect-progressive', label: 'future perfect progressive', time: 'future', aspect: 'perfect-progressive' }
  ];
  // the verb phrase for a subject and a tense: conj('walk', 'past-perfect', 'she') -> 'had walked'
  function conj(v, tense, subj) {
    subj = subj || 'they'; var T = tense.split('-'), time = T[0], asp = T.slice(1).join('-') || 'simple';
    if (asp === 'simple') {
      if (time === 'future') return 'will ' + v;
      if (v === 'be') return beForm(subj, time);
      if (time === 'past') return past(v);
      return third(subj) ? s3(v) : v;
    }
    if (asp === 'progressive') return (time === 'future' ? 'will be' : beForm(subj, time)) + ' ' + ing(v);
    if (asp === 'perfect') return (time === 'future' ? 'will have' : haveForm(subj, time)) + ' ' + pp(v);
    return (time === 'future' ? 'will have' : haveForm(subj, time)) + ' been ' + ing(v);
  }

  /* ---------- nouns ---------- */
  var IRREG_PL = { child: 'children', mouse: 'mice', foot: 'feet', tooth: 'teeth', man: 'men', woman: 'women', person: 'people', goose: 'geese', ox: 'oxen',
    sheep: 'sheep', deer: 'deer', fish: 'fish', moose: 'moose', leaf: 'leaves', knife: 'knives', wolf: 'wolves', half: 'halves', life: 'lives', wife: 'wives',
    loaf: 'loaves', shelf: 'shelves', calf: 'calves', elf: 'elves', thief: 'thieves', scarf: 'scarves', roof: 'roofs', chief: 'chiefs', belief: 'beliefs', chef: 'chefs',
    potato: 'potatoes', tomato: 'tomatoes', hero: 'heroes', echo: 'echoes', piano: 'pianos', photo: 'photos', radio: 'radios', zoo: 'zoos', video: 'videos' };
  function pluralOf(n) {
    if (IRREG_PL[n]) return IRREG_PL[n];
    if (/(s|x|z|ch|sh)$/.test(n)) return n + 'es';
    if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + 'ies';
    return n + 's';
  }
  function possessive(n, isPlural) { // the dog's, the dogs', the children's; James's (Chicago, MLA)
    if (isPlural && /s$/.test(n)) return n + '’';
    return n + '’s';
  }

  /* ---------- tokens: plain sentences and tagged sentences ---------- */
  // 'The|adj big|adj dog|n barked|v.' -> [{ w: 'The', tag: 'adj', pre: '', post: '' }, …]; tags are any lowercase key.
  // A token without |tag has tag ''. Leading “ ( and trailing . , ! ? ; : ” ) … are split off as pre and post.
  var TOK = /^([“"(‘\[]*)(.*?)(?:\|([a-z0-9-]+))?([.,!?;:”")…\]]*)$/;
  function tokens(s) {
    return String(s).trim().split(/\s+/).filter(Boolean).map(function (t) {
      var m = t.match(TOK) || ['', '', t, '', ''];
      var w = m[2], post = m[4];
      if (!m[3] && /’$/.test(w) === false && post === '' && /’$/.test(t)) { /* keep */ }
      return { w: w.replace(/_/g, ' '), tag: m[3] || '', pre: m[1], post: post };
    });
  }
  function plain(s) { return tokens(s).map(function (t) { return t.pre + t.w + t.post; }).join(' '); }
  function indexesOf(s, tag) { var out = []; tokens(s).forEach(function (t, i) { if (t.tag === tag || (Array.isArray(tag) && tag.indexOf(t.tag) >= 0)) out.push(i); }); return out; }

  /* ---------- small text helpers ---------- */
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function lowerFirst(s) { s = String(s); return /^(I|I’[a-z]+|[A-Z][a-z]*[A-Z])\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }
  function stripEnd(s) { return String(s).replace(/[.!?]+$/, ''); }
  function article(w) { return /^[aeiou]/i.test(w) && !/^(uni|use|one|eu)/i.test(w) || /^(hour|honest|honor)/i.test(w) ? 'an' : 'a'; }

  /* ---------- pictures: emoji actors and things, and SVG backdrops (wr-picture) ---------- */
  // People use plain emoji, which every system shows in the standard yellow (never a skin-tone modifier).
  var ACTORS = {
    dog: { e: '🐕', n: 'dog', verbs: { run: 'runs', dig: 'digs', sleep: 'sleeps', bark: 'barks', jump: 'jumps', swim: 'swims' } },
    cat: { e: '🐈', n: 'cat', verbs: { sleep: 'sleeps', jump: 'jumps', run: 'runs', climb: 'climbs' } },
    girl: { e: '👧', n: 'girl', verbs: { run: 'runs', read: 'reads', jump: 'jumps', paint: 'paints', sing: 'sings', wave: 'waves', eat: 'eats' } },
    boy: { e: '👦', n: 'boy', verbs: { run: 'runs', read: 'reads', jump: 'jumps', kick: 'kicks', sing: 'sings', wave: 'waves', eat: 'eats' } },
    grandma: { e: '👵', n: 'grandma', verbs: { read: 'reads', bake: 'bakes', knit: 'knits', wave: 'waves', sing: 'sings' } },
    grandpa: { e: '👴', n: 'grandpa', verbs: { read: 'reads', fish: 'fishes', wave: 'waves', sing: 'sings' } },
    duck: { e: '🦆', n: 'duck', verbs: { swim: 'swims', quack: 'quacks', fly: 'flies' } },
    frog: { e: '🐸', n: 'frog', verbs: { jump: 'jumps', swim: 'swims', sing: 'croaks' } },
    bird: { e: '🐦', n: 'bird', verbs: { fly: 'flies', sing: 'sings' } },
    rabbit: { e: '🐇', n: 'rabbit', verbs: { jump: 'hops', eat: 'eats', run: 'runs' } },
    horse: { e: '🐎', n: 'horse', verbs: { run: 'runs', eat: 'eats', jump: 'jumps' } },
    fish: { e: '🐟', n: 'fish', verbs: { swim: 'swims' } },
    bear: { e: '🐻', n: 'bear', verbs: { sleep: 'sleeps', eat: 'eats', climb: 'climbs' } },
    cow: { e: '🐄', n: 'cow', verbs: { eat: 'eats', sleep: 'sleeps' } }
  };
  var THINGS = {
    ball: { e: '⚽', n: 'ball' }, kite: { e: '🪁', n: 'kite' }, book: { e: '📕', n: 'book' }, apple: { e: '🍎', n: 'apple' }, cake: { e: '🎂', n: 'cake' },
    bike: { e: '🚲', n: 'bike' }, hat: { e: '🎩', n: 'hat' }, umbrella: { e: '☂️', n: 'umbrella' }, tree: { e: '🌳', n: 'tree' }, flower: { e: '🌻', n: 'sunflower' },
    sun: { e: '☀️', n: 'sun' }, moon: { e: '🌙', n: 'moon' }, star: { e: '⭐', n: 'star' }, snowman: { e: '⛄', n: 'snowman' }, boat: { e: '⛵', n: 'boat' },
    car: { e: '🚗', n: 'car' }, bus: { e: '🚌', n: 'bus' }, pizza: { e: '🍕', n: 'pizza' }, cookie: { e: '🍪', n: 'cookie' }, milk: { e: '🥛', n: 'milk' },
    gift: { e: '🎁', n: 'gift' }, balloon: { e: '🎈', n: 'balloon' }, drum: { e: '🥁', n: 'drum' }, guitar: { e: '🎸', n: 'guitar' }, bone: { e: '🦴', n: 'bone' },
    shell: { e: '🐚', n: 'shell' }, cloud: { e: '☁️', n: 'cloud' }, rain: { e: '🌧️', n: 'rain cloud' }, pencil: { e: '✏️', n: 'pencil' }, letter: { e: '✉️', n: 'letter' },
    bed: { e: '🛏️', n: 'bed' }, house: { e: '🏠', n: 'house' }, bell: { e: '🔔', n: 'bell' }, egg: { e: '🥚', n: 'egg' }, carrot: { e: '🥕', n: 'carrot' },
    sandwich: { e: '🥪', n: 'sandwich' }, paint: { e: '🎨', n: 'paint' }, sock: { e: '🧦', n: 'sock' }, key: { e: '🔑', n: 'key' }, clock: { e: '⏰', n: 'clock' },
    lamp: { e: '💡', n: 'light' }, bug: { e: '🐞', n: 'ladybug' }, nest: { e: '🪺', n: 'nest' }, leaf: { e: '🍂', n: 'leaf' }, rock: { e: '🪨', n: 'rock' }
  };
  var PLACES = {
    park: { at: 'at the park', sky: true }, beach: { at: 'at the beach', sky: true }, pond: { at: 'by the pond', sky: true }, farm: { at: 'on the farm', sky: true },
    snow: { at: 'in the snow', sky: true }, yard: { at: 'in the yard', sky: true }, night: { at: 'at night', sky: true }, kitchen: { at: 'in the kitchen' },
    room: { at: 'in the bedroom' }, classroom: { at: 'in the classroom' }, plain: { at: '' }
  };

  /* ---------- Reed–Kellogg diagrams: the spec and builders ---------- */
  // A sentence is a clause, or { compound: [clause, clause], conj: 'and' }, with optional float: [word] (interjections,
  // nouns of direct address, shown on lines above). A clause is
  //   { s: slot, v: slot, do: slot, io: slot, pn: slot (predicate noun or adjective), oc: slot (object complement) }
  // A slot is a word node, or { and: 'and', items: [node, …] } for a compound part. Only s and v are required.
  // A word node is { w: 'dog', m: [modifiers], app: node (appositive) }; m holds
  //   { w: 'big', m: [...] } a word on a slanted line;  { p: 'with', o: node } a prepositional phrase;
  //   { io: node } an indirect object (only under a verb; the builder puts clause.io here);
  //   { cl: clause, sub: 'because' } an adverb clause (dotted line from its verb, the conjunction on the line);
  //   { rel: clause, link: 'which' } an adjective clause (dotted line from the clause word equal to link);
  //   { part: 'waving', o: node, m: [...] } a participle (bent line);
  // and a word node may instead be a verbal or a clause used as a noun, standing on a forked stand:
  //   { ger: 'swimming', o: node, m: [...] } a gerund;  { inf: 'win', o: node, m: [...] } an infinitive;  { ncl: clause } a noun clause.
  // Builders: W.dg.n('dog', ['the', 'big']) makes { w: 'dog', m: [{ w: 'the' }, { w: 'big' }] }; strings in m become word modifiers.
  function nodeOf(x, m) {
    if (x == null) return null;
    if (typeof x === 'string') { var r = { w: x }; if (m) r.m = mods(m); return r; }
    return x;
  }
  function mods(list) { return (list || []).map(function (m) { return typeof m === 'string' ? { w: m } : m; }); }
  var dg = {
    n: function (w, m, extra) { var r = nodeOf(w, m); if (extra) for (var k in extra) r[k] = extra[k]; return r; },
    pp: function (p, o, om) { return { p: p, o: nodeOf(o, om) }; },
    and: function (conj, items) { return { and: conj, items: items.map(function (x) { return nodeOf(x); }) }; },
    clause: function (c) { var r = {}; ['s', 'v', 'do', 'io', 'pn', 'oc'].forEach(function (k) { if (c[k] != null) r[k] = nodeOf(c[k]); }); if (c.float) r.float = c.float; if (c.intro) r.intro = c.intro; return r; }
  };
  // every word slot in reading order of the diagram: [{ id: 's', w: 'dog', role: 'subject' }, …] (the ids the build mode and
  // problems use: s, v, do, io, pn, oc, then .m0, .m1 … for modifiers, .o for objects, .a for an appositive, c0/c1 for clauses)
  function dgSlots(spec) {
    var out = [];
    function word(n, id, role) {
      if (!n) return;
      if (typeof n === 'string') n = { w: n };
      if (n.and) { n.items.forEach(function (it, i) { word(it, id + '.' + i, role); }); out.push({ id: id + '.cj', w: n.and, role: 'conjunction' }); return; }
      if (n.ger || n.inf || n.part) {
        var vw = n.ger || n.part || n.inf;
        if (n.inf) out.push({ id: id + '.to', w: 'to', role: 'infinitive marker' });
        out.push({ id: id, w: vw, role: n.ger ? 'gerund' : n.inf ? 'infinitive' : 'participle' });
        if (n.o) word(n.o, id + '.o', 'object of the verbal');
        if (n.pn) word(n.pn, id + '.pn', 'complement of the verbal');
      } else if (n.ncl) { clause(n.ncl, id + '.c', 'noun clause'); return; }
      else out.push({ id: id, w: n.w, role: role });
      if (n.app) word(typeof n.app === 'string' ? { w: n.app } : n.app, id + '.a', 'appositive');
      if (!n.ger && !n.inf && !n.part) { if (n.io) word(n.io, id + '.io', 'indirect object'); if (n.do) word(n.do, id + '.do', 'direct object'); if (n.pn) word(n.pn, id + '.pn', 'predicate noun or adjective'); if (n.oc) word(n.oc, id + '.oc', 'object complement'); }
      (n.m || []).forEach(function (m, i) {
        var mid = id + '.m' + i;
        if (typeof m === 'string') m = { w: m };
        if (m.w) word(m, mid, 'modifier');
        else if (m.p) { out.push({ id: mid, w: m.p, role: 'preposition' }); word(m.o, mid + '.o', 'object of the preposition'); }
        else if (m.io) word(m.io, mid, 'indirect object');
        else if (m.part) word(m, mid, 'participle');
        else if (m.inf) word(m, mid, 'infinitive');
        else if (m.cl) { out.push({ id: mid + '.sub', w: m.sub, role: 'subordinating conjunction' }); clause(m.cl, mid + '.c', 'adverb clause'); }
        else if (m.rel) clause(m.rel, mid + '.c', 'adjective clause');
      });
    }
    function clause(c, pre, what) {
      var P = pre ? pre + '.' : '';
      if (c.intro) out.push({ id: P + 'intro', w: c.intro, role: 'word that introduces the noun clause' });
      (c.float || []).forEach(function (f, i) { out.push({ id: P + 'f' + i, w: typeof f === 'string' ? f : f.w, role: 'word apart (interjection or direct address)' }); });
      word(c.s, P + 's', 'subject'); word(c.v, P + 'v', 'verb');
      if (c.io) word(c.io, P + 'io', 'indirect object');
      word(c.do, P + 'do', 'direct object'); word(c.pn, P + 'pn', 'predicate noun or adjective'); word(c.oc, P + 'oc', 'object complement');
    }
    if (spec.compound) { spec.compound.forEach(function (c, i) { clause(c, 'c' + i); }); out.push({ id: 'cj', w: spec.conj || 'and', role: 'conjunction' }); (spec.float || []).forEach(function (f, i) { out.push({ id: 'f' + i, w: f, role: 'word apart' }); }); }
    else clause(spec, '');
    return out;
  }

  /* ---------- citations: MLA (9th ed.), APA (7th ed.), Chicago (18th ed., notes and bibliography) ---------- */
  // A source: { type: 'book' | 'journal' | 'web', authors: [{ first, middle?, last }], title, sub? (subtitle), sc? (the title in
  // sentence case, for APA, when it has proper nouns), container (journal or website), publisher, year, month?, day?,
  // vol, issue, pages: '45–67', page (cited page), edition, doi, url, site (website name for web) }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MLA_MON = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  function initials(a) { return [a.first, a.middle].filter(Boolean).map(function (n) { return n.split(/[\s-]+/).map(function (p) { return p.charAt(0) + '.'; }).join(' '); }).join(' '); }
  function fullTitle(s) { return s.sub ? s.title + ': ' + s.sub : s.title; }
  function sentenceCase(s) {
    if (s.sc) return s.sc;
    var t = fullTitle(s), first = true;
    return t.split(' ').map(function (w) { var out = first ? w : (/^[A-Z][a-z’']*$/.test(w) ? w.toLowerCase() : w); first = /:$/.test(w); return out; }).join(' ');
  }
  function endDot(x) { return /[.?!]$/.test(x) ? x : x + '.'; }
  function mlaAuthors(A) {
    if (!A || !A.length) return '';
    var first = A[0].last + ', ' + [A[0].first, A[0].middle].filter(Boolean).join(' ');
    if (A.length === 1) return first;
    if (A.length === 2) return first + ', and ' + [A[1].first, A[1].middle, A[1].last].filter(Boolean).join(' ');
    return first + ', et al';
  }
  function apaAuthors(A) {
    var names = A.map(function (a) { return a.last + ', ' + initials(a); });
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + ', & ' + names[1];
    return names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1];
  }
  function chiBibAuthors(A) {
    var first = A[0].last + ', ' + [A[0].first, A[0].middle].filter(Boolean).join(' ');
    if (A.length === 1) return first;
    var rest = A.slice(1).map(function (a) { return [a.first, a.middle, a.last].filter(Boolean).join(' '); });
    return first + (A.length === 2 ? ', and ' : ', ') + (A.length === 2 ? rest[0] : rest.slice(0, -1).join(', ') + ', and ' + rest[rest.length - 1]);
  }
  function chiNoteAuthors(A) {
    var nm = function (a) { return [a.first, a.middle, a.last].filter(Boolean).join(' '); };
    if (A.length === 1) return nm(A[0]); if (A.length === 2) return nm(A[0]) + ' and ' + nm(A[1]); return nm(A[0]) + ' et al.';
  }
  // page ranges: MLA (hyphen; second number cut to its last two digits above 99 when that is enough: 127-53),
  // Chicago (en dash; its inclusive-number rule: 100–104, 101–8, 321–28, 498–532), APA (en dash, in full)
  function pageRange(pages, style) {
    var m = String(pages).match(/^(\d+)\s*[-–]\s*(\d+)$/); if (!m) return String(pages);
    var a = +m[1], b = +m[2], A = String(a), B = String(b), shortB = B;
    function cut(min) { for (var k = min; k < B.length; k++) { if (B.slice(0, B.length - k) === A.slice(0, A.length - k) && A.length === B.length) return B.slice(B.length - k); } return B; }
    if (style === 'apa') return A + '–' + B;
    if (style === 'mla') { if (a > 99) shortB = cut(2); return A + '-' + shortB; }
    if (a < 100 || a % 100 === 0) return A + '–' + B;
    shortB = a % 100 < 10 ? cut(1) : cut(2);
    return A + '–' + shortB;
  }
  function ed(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) + ' ed.'; }
  // cite(source, style, form) -> [{ k: part key, t: 'text', i: true (italic) }, …]; joined, the parts give the citation.
  //   style 'mla' | 'apa' | 'chicago'; form 'entry' (works cited, references, bibliography; default) | 'intext' (MLA, APA) | 'note' (Chicago)
  // Part keys: author, title, container, edition, number (volume and issue), publisher, date, pages, location (DOI or URL), page, sep (punctuation only)
  function cite(s, style, form) {
    form = form || 'entry'; var P = [], A = s.authors || [];
    function add(k, t, i) { if (t) P.push({ k: k, t: t, i: !!i }); }
    var loc = s.doi ? 'https://doi.org/' + s.doi : s.url || '';
    if (style === 'mla') {
      if (form === 'intext') { var nm = A.length === 1 ? A[0].last : A.length === 2 ? A[0].last + ' and ' + A[1].last : A[0].last + ' et al.'; add('sep', '('); add('author', nm); if (s.page) { add('sep', ' '); add('page', String(s.page)); } add('sep', ')'); return P; }
      add('author', endDot(mlaAuthors(A))); add('sep', ' ');
      if (s.type === 'book') {
        add('title', fullTitle(s), true); add('sep', '. ');
        if (s.edition) { add('edition', ed(s.edition).replace(/\.$/, '') + '.,'); add('sep', ' '); }
        add('publisher', s.publisher); add('sep', ', '); add('date', String(s.year)); add('sep', '.');
      } else {
        add('title', '“' + fullTitle(s) + '.”'); add('sep', ' '); add('container', s.container || s.site, true); add('sep', ', ');
        if (s.type === 'journal') {
          add('number', 'vol. ' + s.vol + (s.issue ? ', no. ' + s.issue : '')); add('sep', ', '); add('date', String(s.year)); add('sep', ', '); add('pages', 'pp. ' + pageRange(s.pages, 'mla'));
          if (loc) { add('sep', ', '); add('location', loc); } add('sep', '.');
        } else {
          if (s.publisher && s.publisher !== (s.container || s.site)) { add('publisher', s.publisher); add('sep', ', '); }
          add('date', (s.day ? s.day + ' ' : '') + (s.month ? MLA_MON[s.month - 1] + ' ' : '') + s.year); add('sep', ', '); add('location', loc.replace(/^https?:\/\//, '')); add('sep', '.');
        }
      }
      return P;
    }
    if (style === 'apa') {
      if (form === 'intext') { var an = A.length === 1 ? A[0].last : A.length === 2 ? A[0].last + ' & ' + A[1].last : A[0].last + ' et al.'; add('sep', '('); add('author', an); add('sep', ', '); add('date', String(s.year)); if (s.page) { add('sep', ', '); add('page', 'p. ' + s.page); } add('sep', ')'); return P; }
      add('author', apaAuthors(A)); add('sep', ' ');
      if (s.type === 'web') add('date', '(' + s.year + (s.month ? ', ' + MONTHS[s.month - 1] + (s.day ? ' ' + s.day : '') : '') + ').'); else add('date', '(' + s.year + ').');
      add('sep', ' ');
      if (s.type === 'book') { add('title', sentenceCase(s), true); if (s.edition) { add('sep', ' '); add('edition', '(' + ed(s.edition) + ')'); } add('sep', '. '); add('publisher', s.publisher + '.'); }
      else if (s.type === 'journal') {
        add('title', endDot(sentenceCase(s))); add('sep', ' '); add('container', s.container + ', ' + s.vol, true); add('number', s.issue ? '(' + s.issue + ')' : ''); add('sep', ', '); add('pages', pageRange(s.pages, 'apa') + '.');
        if (loc) { add('sep', ' '); add('location', loc); }
      } else { add('title', sentenceCase(s), true); add('sep', '. '); if (s.site && !(A.length === 0)) { add('container', s.site + '.'); add('sep', ' '); } add('location', loc); }
      return P;
    }
    // chicago
    if (form === 'note') {
      add('sep', ''); add('author', chiNoteAuthors(A)); add('sep', ', ');
      if (s.type === 'book') { add('title', fullTitle(s), true); if (s.edition) { add('sep', ', '); add('edition', ed(s.edition)); } add('sep', ' ('); add('publisher', s.publisher); add('sep', ', '); add('date', String(s.year)); add('sep', ')'); if (s.page) { add('sep', ', '); add('page', String(s.page)); } add('sep', '.'); }
      else if (s.type === 'journal') { add('title', '“' + fullTitle(s) + ',”'); add('sep', ' '); add('container', s.container, true); add('sep', ' '); add('number', s.vol + (s.issue ? ', no. ' + s.issue : '')); add('sep', ' '); add('date', '(' + s.year + ')'); add('sep', ': '); add('page', String(s.page || s.pages)); if (loc) { add('sep', ', '); add('location', loc); } add('sep', '.'); }
      else { add('title', '“' + fullTitle(s) + ',”'); add('sep', ' '); add('container', s.site || s.container); add('sep', ', '); add('date', (s.month ? MONTHS[s.month - 1] + ' ' + (s.day ? s.day + ', ' : '') : '') + s.year); add('sep', ', '); add('location', loc); add('sep', '.'); }
      return P;
    }
    add('author', endDot(chiBibAuthors(A))); add('sep', ' ');
    if (s.type === 'book') { add('title', fullTitle(s), true); add('sep', '. '); if (s.edition) { add('edition', ed(s.edition)); add('sep', ' '); } add('publisher', s.publisher); add('sep', ', '); add('date', String(s.year)); add('sep', '.'); }
    else if (s.type === 'journal') { add('title', '“' + fullTitle(s) + '.”'); add('sep', ' '); add('container', s.container, true); add('sep', ' '); add('number', s.vol + (s.issue ? ', no. ' + s.issue : '')); add('sep', ' '); add('date', '(' + s.year + ')'); add('sep', ': '); add('pages', pageRange(s.pages, 'chicago')); add('sep', '.'); if (loc) { add('sep', ' '); add('location', loc + '.'); } }
    else { add('title', '“' + fullTitle(s) + '.”'); add('sep', ' '); add('container', s.site || s.container); add('sep', ', '); add('date', (s.month ? MONTHS[s.month - 1] + ' ' + (s.day ? s.day + ', ' : '') : '') + s.year); add('sep', '. '); add('location', loc + '.'); }
    return P;
  }
  function citeText(s, style, form) { return cite(s, style, form).map(function (p) { return p.t; }).join(''); }
  function citeHTML(s, style, form) { return cite(s, style, form).map(function (p) { var t = esc(p.t); return p.i ? '<i>' + t + '</i>' : t; }).join(''); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var PART_NAMES = { author: 'author', title: 'title of the source', container: 'container (journal, website or book)', edition: 'edition', number: 'volume and issue',
    publisher: 'publisher', date: 'date', pages: 'pages', page: 'page cited', location: 'location (DOI or URL)' };
  // made-up sources for practice (every name, title and publisher is invented)
  var SOURCES = [
    { type: 'book', authors: [{ first: 'Ellen', last: 'Marsh' }], title: 'The Quiet Garden', sub: 'Growing Food in Small Spaces', sc: 'The quiet garden: Growing food in small spaces', publisher: 'Larkspur Press', year: 2019, page: 42 },
    { type: 'book', authors: [{ first: 'Daniel', middle: 'R.', last: 'Okafor' }, { first: 'Lucy', last: 'Chen' }], title: 'Rivers of the Prairie', sc: 'Rivers of the prairie', publisher: 'Bluestem Books', year: 2021, edition: 2, page: 117 },
    { type: 'journal', authors: [{ first: 'Maria', last: 'Delgado' }], title: 'Sleep and Memory in Middle School Students', sc: 'Sleep and memory in middle school students', container: 'Journal of Student Health', vol: 14, issue: 3, year: 2022, pages: '201–219', page: 205, doi: '10.5555/jsh.2022.0143' },
    { type: 'journal', authors: [{ first: 'Thomas', last: 'Reyes' }, { first: 'Anna', middle: 'K.', last: 'Brandt' }], title: 'Why Bees Dance', sub: 'Signals in the Hive', sc: 'Why bees dance: Signals in the hive', container: 'Field Biology Review', vol: 8, issue: 1, year: 2020, pages: '15–34', page: 22 },
    { type: 'web', authors: [{ first: 'Grace', last: 'Liu' }], title: 'How to Start a Neighborhood Library', sc: 'How to start a neighborhood library', site: 'Open Shelf Guide', year: 2023, month: 5, day: 4, url: 'https://www.openshelfguide.example/neighborhood-library' },
    { type: 'web', authors: [{ first: 'Samuel', last: 'Achebe-Ward' }], title: 'Clouds That Warn of Storms', sc: 'Clouds that warn of storms', site: 'Sky Notes', year: 2021, month: 9, day: 17, url: 'https://skynotes.example/storm-clouds' }
  ];

  /* ---------- checklists (wr-checklist) ---------- */
  var CHECKLISTS = {
    first: { title: 'My Writing Checklist', items: ['I read my writing out loud.', 'Every sentence starts with a capital letter.', 'Every sentence ends with a . ? or !', 'I left spaces between my words.', 'Names and the word I have capital letters.', 'I spelled words the best I can.', 'My writing makes sense.'] },
    edit: { title: 'Editing Checklist', items: ['Every sentence is complete: no fragments, run-ons or comma splices.', 'Subjects and verbs agree; pronouns point to clear nouns.', 'Verb tenses stay steady unless the time changes.', 'Commas, apostrophes and quotation marks follow the rules.', 'Capital letters are where they belong, and only there.', 'Sound-alike words are the right ones (its, it’s; their, there).', 'Spelling checked, including the words the spell checker can’t catch.', 'I read it slowly and aloud, or on paper.'] },
    revise: { title: 'Revision Checklist', items: ['My thesis is clear, specific and arguable or worth explaining.', 'Every paragraph supports the thesis, with a clear topic sentence.', 'Each piece of evidence is explained, not just dropped in.', 'The paragraphs are in the best order, with transitions between them.', 'I answered the strongest view on the other side (for an argument).', 'The introduction draws the reader in; the conclusion shows why it matters.', 'I cut words, sentences and paragraphs that don’t help.', 'The tone fits my audience and purpose.'] },
    timed: { title: 'Timed Writing Plan', items: ['Read the prompt twice; circle the task word (argue, analyze, explain).', 'Plan for about a tenth of the time: thesis and two or three reasons.', 'Write the thesis near the start, plainly.', 'Give each reason its own paragraph with evidence and commentary.', 'Keep an eye on the clock; leave time for a short conclusion.', 'Save a few minutes to reread and fix errors.'] },
    citation: { title: 'Citation Checklist', items: ['Every quotation, paraphrase and summary has a citation.', 'Exact words are in quotation marks.', 'Every in-text citation matches an entry in the list of sources.', 'One style throughout, in its current edition.', 'Entries are in alphabetical order by the first word.', 'Titles are italicized or in quotation marks as the style asks.'] }
  };

  /* ---------- paragraphs and essays ---------- */
  var PARA_ROLES = {
    topic: { label: 'topic sentence', color: '#1c6fd6' }, support: { label: 'supporting detail', color: '#2b8a3e' }, example: { label: 'example', color: '#0c8599' },
    evidence: { label: 'evidence', color: '#2b8a3e' }, commentary: { label: 'commentary', color: '#b8650b' }, transition: { label: 'transition', color: '#7048e8' },
    conclusion: { label: 'concluding sentence', color: '#c2255c' }, off: { label: 'off topic', color: '#c92a2a' }, hook: { label: 'hook', color: '#7048e8' },
    context: { label: 'context', color: '#0c8599' }, thesis: { label: 'thesis', color: '#c92a2a' }, claim: { label: 'claim', color: '#c92a2a' },
    counter: { label: 'counterargument', color: '#5c6370' }, rebuttal: { label: 'rebuttal', color: '#b8650b' }, beginning: { label: 'beginning', color: '#1c6fd6' },
    middle: { label: 'middle', color: '#2b8a3e' }, end: { label: 'end', color: '#c2255c' }
  };
  var TOULMIN = {
    claim: { label: 'Claim', q: 'What are you arguing?', color: '#c92a2a' },
    grounds: { label: 'Grounds', q: 'What is your evidence?', color: '#1c6fd6' },
    warrant: { label: 'Warrant', q: 'Why does the evidence support the claim?', color: '#2b8a3e' },
    backing: { label: 'Backing', q: 'What supports the warrant?', color: '#0c8599' },
    qualifier: { label: 'Qualifier', q: 'How sure, how often, how much?', color: '#b8650b' },
    rebuttal: { label: 'Rebuttal', q: 'When would the claim not hold?', color: '#7048e8' }
  };
  var APPEALS = { ethos: { label: 'ethos', what: 'character and credibility', color: '#1c6fd6' }, pathos: { label: 'pathos', what: 'the audience’s emotions', color: '#c2255c' }, logos: { label: 'logos', what: 'reasoning and evidence', color: '#2b8a3e' } };

  /* ---------- comparing texts (wr-compare): shared runs of words ---------- */
  function normWords(s) { return String(s).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || []; }
  // runs of at least min words that appear in both texts: returns { a: [bool per word of a], b: [...], share: fraction of b's words in shared runs }
  function sharedRuns(a, b, min) {
    min = min || 3; var A = normWords(a), B = normWords(b), ma = A.map(function () { return false; }), mb = B.map(function () { return false; });
    for (var i = 0; i < B.length; i++) for (var j = 0; j < A.length; j++) {
      var k = 0; while (i + k < B.length && j + k < A.length && B[i + k] === A[j + k]) k++;
      if (k >= min) for (var t = 0; t < k; t++) { mb[i + t] = true; ma[j + t] = true; }
    }
    return { a: ma, b: mb, share: B.length ? mb.filter(Boolean).length / B.length : 0 };
  }

  ML.writing = {
    POS: POS, ROLES: ROLES, SENSES: SENSES, WORDS: WORDS, IRREG: IRREG, IRREG_PL: IRREG_PL, TENSES: TENSES, PERSONS: PERSONS,
    past: past, pp: pp, ing: ing, s3: s3, conj: conj, beForm: beForm, pluralOf: pluralOf, possessive: possessive,
    tokens: tokens, plain: plain, indexesOf: indexesOf, cap: cap, lowerFirst: lowerFirst, stripEnd: stripEnd, article: article,
    ACTORS: ACTORS, THINGS: THINGS, PLACES: PLACES, dg: dg, dgSlots: dgSlots,
    cite: cite, pageRange: pageRange, citeText: citeText, citeHTML: citeHTML, sentenceCase: sentenceCase, PART_NAMES: PART_NAMES, SOURCES: SOURCES,
    CHECKLISTS: CHECKLISTS, PARA_ROLES: PARA_ROLES, TOULMIN: TOULMIN, APPEALS: APPEALS, sharedRuns: sharedRuns, normWords: normWords, esc: esc,
    SKIN: '#ffcc4d', SKIN_LINE: '#e8a93a'
  };
})(typeof window !== 'undefined' ? window : global);
/* =====================================================================================================================
   HANDWRITING MODEL: MathLadder.writing.HAND (letterforms as centerline strokes; no DOM; works in node)
   Grid: the top line is y = 0, the middle (dotted) line y = 50, the baseline y = 100, the descender line y = 150.
   Print: ball-and-stick manuscript, upright. Cursive: a traditional American cursive in the Palmer manner, drawn upright
   here and slanted by HAND.SLANT when compiled. Every stroke is listed in the order it is written and runs in the
   direction the pen moves. Stroke syntax: absolute SVG M L C Q, plus O cx,cy rx,ry a0,a1 (an oval arc from angle a0 to a1
   in degrees, counterclockwise as seen when a1 > a0; 0 = right, 90 = top) and D x,y (a dot).
   Cursive lowercase also has s (where the letter's body starts), x (where it ends: on the baseline, or high for b o v w)
   and conn: 'under' (an undercurve swings up into it) or 'over' (an overcurve arches into it: the hill letters).
   after: stroke indexes made after the whole word (dots and crosses).
   ===================================================================================================================== */
(function (W) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, SLANT = 0.36;
  var LOOP = 'M8,72 C22,54 32,32 32,17 C32,8 28,4 23,4 C17,4 14,12 14,30';      // the loop of a tall cursive letter (b f h k l)
  var BOWL = 'M33,55 C30,51 25,50 20,50 C10,50 5,62 5,76 C5,92 12,100 19,100 C28,100 34,88 34,70';  // the oval of a c d g q (up to the top right)
  var DESC = 'C34,150 30,153 26,149 C22,143 27,123 38,111 C43,105 48,101 55,100';           // a cursive descender loop back up to the baseline
  var PRINT = {
    a: { w: 62, k: ['O30,75 25,25 30,390', 'M55,50 L55,100'] },
    b: { w: 62, k: ['M10,0 L10,100', 'M10,75 O35,75 25,25 180,-180'] },
    c: { w: 58, k: ['O32,75 25,25 45,315'] },
    d: { w: 62, k: ['O30,75 25,25 30,390', 'M55,0 L55,100'] },
    e: { w: 60, k: ['M8,75 L56,75 O32,75 24,25 0,315'] },
    f: { w: 50, k: ['M48,9 C45,3 39,0 33,0 C26,0 22,5 22,14 L22,100', 'M6,50 L42,50'] },
    g: { w: 62, k: ['O30,75 25,25 30,390', 'M55,50 L55,135 C55,148 46,152 36,152 C26,152 17,148 12,140'] },
    h: { w: 62, k: ['M10,0 L10,100', 'M10,74 C10,58 20,50 31,50 C43,50 52,58 52,72 L52,100'] },
    i: { w: 22, k: ['M10,50 L10,100', 'D10,26'] },
    j: { w: 36, k: ['M28,50 L28,136 C28,148 21,152 13,151 C7,150 3,146 1,141', 'D28,26'] },
    k: { w: 56, k: ['M10,0 L10,100', 'M48,50 L12,76 L50,100'] },
    l: { w: 22, k: ['M10,0 L10,100'] },
    m: { w: 88, k: ['M10,50 L10,100', 'M10,72 C10,56 18,50 27,50 C37,50 44,57 44,70 L44,100', 'M44,72 C44,56 52,50 61,50 C71,50 78,57 78,70 L78,100'] },
    n: { w: 62, k: ['M10,50 L10,100', 'M10,72 C10,57 20,50 31,50 C43,50 52,58 52,72 L52,100'] },
    o: { w: 62, k: ['O32,75 25,25 90,450'] },
    p: { w: 62, k: ['M10,50 L10,150', 'M10,75 O35,75 25,25 180,-180'] },
    q: { w: 64, k: ['O30,75 25,25 30,390', 'M55,50 L55,150 L64,142'] },
    r: { w: 50, k: ['M10,50 L10,100', 'M10,72 C10,57 20,50 31,50 C38,50 44,53 48,58'] },
    s: { w: 56, k: ['M49,57 C45,52 38,50 30,50 C19,50 11,55 11,63 C11,72 21,74 30,76 C41,78 50,81 50,89 C50,96 42,100 30,100 C20,100 12,97 8,92'] },
    t: { w: 44, k: ['M22,0 L22,100', 'M6,50 L40,50'] },
    u: { w: 62, k: ['M10,50 L10,78 C10,93 20,100 31,100 C43,100 52,92 52,78', 'M52,50 L52,100'] },
    v: { w: 58, k: ['M5,50 L29,100 L53,50'] },
    w: { w: 76, k: ['M5,50 L21,100 L38,56 L55,100 L71,50'] },
    x: { w: 56, k: ['M7,50 L49,100', 'M49,50 L7,100'] },
    y: { w: 58, k: ['M6,50 L29,100', 'M52,50 L18,150'] },
    z: { w: 56, k: ['M7,50 L49,50 L7,100 L51,100'] },
    A: { w: 72, k: ['M36,0 L6,100', 'M36,0 L66,100', 'M17,64 L55,64'] },
    B: { w: 66, k: ['M10,0 L10,100', 'M10,0 L34,0 C48,0 56,10 56,24 C56,38 48,48 34,48 L10,48', 'M10,48 L37,48 C53,48 61,59 61,74 C61,89 52,100 36,100 L10,100'] },
    C: { w: 80, k: ['O43,50 37,50 45,315'] },
    D: { w: 76, k: ['M10,0 L10,100', 'M10,0 L30,0 C54,0 68,22 68,50 C68,78 54,100 30,100 L10,100'] },
    E: { w: 58, k: ['M10,0 L10,100', 'M10,0 L52,0', 'M10,50 L44,50', 'M10,100 L52,100'] },
    F: { w: 56, k: ['M10,0 L10,100', 'M10,0 L52,0', 'M10,50 L44,50'] },
    G: { w: 86, k: ['O43,50 37,50 45,348 L79,56 L52,56'] },
    H: { w: 72, k: ['M10,0 L10,100', 'M62,0 L62,100', 'M10,50 L62,50'] },
    I: { w: 52, k: ['M26,0 L26,100', 'M8,0 L44,0', 'M8,100 L44,100'] },
    J: { w: 58, k: ['M48,0 L48,74 C48,91 38,100 27,100 C16,100 8,93 5,82'] },
    K: { w: 64, k: ['M10,0 L10,100', 'M58,0 L12,58', 'M28,40 L60,100'] },
    L: { w: 56, k: ['M10,0 L10,100 L52,100'] },
    M: { w: 88, k: ['M10,0 L10,100', 'M10,0 L44,100 L78,0', 'M78,0 L78,100'] },
    N: { w: 72, k: ['M10,0 L10,100', 'M10,0 L62,100', 'M62,0 L62,100'] },
    O: { w: 88, k: ['O44,50 38,50 90,450'] },
    P: { w: 64, k: ['M10,0 L10,100', 'M10,0 L34,0 C50,0 58,12 58,26 C58,40 50,52 34,52 L10,52'] },
    Q: { w: 90, k: ['O44,50 38,50 90,450', 'M52,70 L82,104'] },
    R: { w: 66, k: ['M10,0 L10,100', 'M10,0 L34,0 C50,0 58,12 58,26 C58,40 50,52 34,52 L10,52', 'M32,52 L60,100'] },
    S: { w: 72, k: ['M63,14 C57,5 48,0 36,0 C21,0 10,9 10,24 C10,40 25,45 36,48 C52,52 65,58 65,75 C65,91 53,100 36,100 C22,100 11,94 6,84'] },
    T: { w: 66, k: ['M33,0 L33,100', 'M6,0 L60,0'] },
    U: { w: 74, k: ['M10,0 L10,70 C10,88 22,100 37,100 C52,100 64,88 64,70 L64,0'] },
    V: { w: 72, k: ['M6,0 L36,100 L66,0'] },
    W: { w: 92, k: ['M5,0 L25,100 L46,0 L67,100 L87,0'] },
    X: { w: 68, k: ['M8,0 L60,100', 'M60,0 L8,100'] },
    Y: { w: 68, k: ['M8,0 L34,50', 'M60,0 L34,50', 'M34,50 L34,100'] },
    Z: { w: 68, k: ['M8,0 L60,0 L8,100 L62,100'] },
    0: { w: 60, k: ['O30,50 25,50 90,450'] },
    1: { w: 44, k: ['M22,0 L22,100'] },
    2: { w: 64, k: ['M8,22 C10,8 21,0 33,0 C47,0 56,10 56,24 C56,40 43,53 8,100 L58,100'] },
    3: { w: 64, k: ['M10,12 C16,4 25,0 33,0 C47,0 55,9 55,24 C55,38 45,47 30,48 C47,49 59,58 59,74 C59,90 47,100 31,100 C21,100 12,96 7,88'] },
    4: { w: 66, k: ['M42,0 L7,66 L62,66', 'M48,0 L48,100'] },
    5: { w: 64, k: ['M13,0 L11,44 C19,38 27,36 35,36 C51,36 60,48 60,66 C60,86 49,100 32,100 C21,100 12,96 7,88', 'M13,0 L55,0'] },
    6: { w: 64, k: ['M51,6 C46,2 40,0 34,0 C18,0 8,22 8,58 C8,84 18,100 34,100 C50,100 59,88 59,74 C59,58 49,48 34,48 C22,48 12,56 9,66'] },
    7: { w: 62, k: ['M6,0 L57,0 L22,100'] },
    8: { w: 64, k: ['M54,20 C54,8 45,0 32,0 C19,0 10,8 10,22 C10,36 21,44 33,50 C46,57 58,64 58,78 C58,92 46,100 33,100 C19,100 8,92 8,78 C8,64 20,57 33,50 C45,44 54,34 54,20'] },
    9: { w: 64, k: ['O31,27 23,27 20,380', 'M54,18 L54,100'] }
  };
  var CURSIVE = {
    a: { w: 44, s: [33, 55], x: [44, 100], conn: 'under', k: [BOWL + ' L34,50 L34,92 C34,98 38,100 44,100'] },
    b: { w: 46, s: [8, 72], x: [46, 52], conn: 'under', k: [LOOP + ' L14,90 C14,97 19,100 25,100 C34,100 38,90 37,78 C36,66 34,58 35,54 C37,50 41,50 46,52'] },
    c: { w: 38, s: [21, 50], x: [38, 100], conn: 'over', lgap: 16, k: ['M21,50 C26,49 31,51 32,55 C29,53 26,51 21,51 C12,51 6,62 6,76 C6,91 13,100 23,100 C29,100 33,100 38,100'] },
    d: { w: 44, s: [33, 55], x: [44, 100], conn: 'under', k: [BOWL + ' L34,4 L34,92 C34,98 38,100 44,100'] },
    e: { w: 36, s: [6, 80], x: [36, 100], conn: 'under', k: ['M6,80 C20,75 31,67 31,59 C31,53 28,50 24,50 C15,50 10,61 10,76 C10,92 17,100 26,100 C30,100 33,100 36,100'] },
    f: { w: 38, s: [8, 72], x: [38, 100], conn: 'under', k: [LOOP + ' L14,138 C14,150 10,153 7,148 C4,141 10,121 20,109 C25,104 30,101 38,100'] },
    g: { w: 55, s: [33, 55], x: [55, 100], conn: 'under', k: [BOWL + ' L34,50 L34,138 ' + DESC] },
    h: { w: 52, s: [8, 72], x: [52, 100], conn: 'under', k: [LOOP + ' L14,100 L14,80 C16,62 24,52 32,52 C40,52 43,58 43,66 L43,92 C43,98 47,100 52,100'] },
    i: { w: 24, s: [10, 52], x: [24, 100], conn: 'under', k: ['M10,52 C10,70 10,86 11,93 C12,98 17,100 24,100', 'D10,32'], after: [1] },
    j: { w: 36, s: [10, 52], x: [36, 100], conn: 'under', k: ['M10,52 L10,138 C10,150 6,153 3,148 C0,141 6,121 16,109 C21,104 27,101 36,100', 'D10,32'], after: [1] },
    k: { w: 54, s: [8, 72], x: [54, 100], conn: 'under', k: [LOOP + ' L14,100 L14,80 C17,62 27,52 35,52 C44,52 46,60 40,66 C35,70 28,72 22,72 C30,74 37,84 40,92 C42,98 46,100 54,100'] },
    l: { w: 28, s: [8, 72], x: [28, 100], conn: 'under', k: [LOOP + ' L14,90 C14,97 19,100 28,100'] },
    m: { w: 66, s: [8, 52], x: [66, 100], conn: 'over', k: ['M8,52 L8,100 C10,70 14,52 22,52 C30,52 32,60 32,70 L32,100 C34,70 38,52 46,52 C54,52 56,60 56,70 L56,92 C56,98 60,100 66,100'] },
    n: { w: 46, s: [8, 52], x: [46, 100], conn: 'over', k: ['M8,52 L8,100 C10,70 16,52 26,52 C34,52 36,60 36,70 L36,92 C36,98 40,100 46,100'] },
    o: { w: 46, s: [24, 50], x: [46, 51], conn: 'over', lgap: 16, k: ['M24,50 C17,50 11,54 8,61 C6,66 5,71 5,77 C5,92 12,100 20,100 C29,100 34,88 34,72 C34,59 30,51 24,50 C22,52 23,55 27,55 C33,55 39,52 46,51'] },
    p: { w: 46, s: [8, 52], x: [46, 100], conn: 'under', k: ['M8,52 L8,150 L8,76 C12,60 20,52 28,52 C37,52 41,61 41,72 C41,88 33,100 22,100 C17,100 13,98 10,95 C20,99 34,100 46,100'] },
    q: { w: 55, s: [33, 55], x: [55, 100], conn: 'under', k: [BOWL + ' L34,50 L34,148 C34,138 36,120 41,110 C44,104 48,101 55,100'] },
    r: { w: 36, s: [8, 46], x: [36, 100], conn: 'under', k: ['M8,46 C13,46 18,47 22,50 C23,60 23,76 23,90 C23,97 27,100 36,100'] },
    s: { w: 34, s: [8, 46], x: [34, 100], conn: 'under', k: ['M8,46 C16,62 26,72 26,84 C26,95 18,100 11,100 C6,100 4,96 7,93 C13,98 22,100 34,100'] },
    t: { w: 30, s: [12, 12], x: [30, 100], conn: 'under', k: ['M12,12 L12,92 C12,98 17,100 30,100', 'M1,46 L27,46'], after: [1] },
    u: { w: 46, s: [8, 52], x: [46, 100], conn: 'under', k: ['M8,52 C8,70 8,86 10,92 C12,98 16,100 21,100 C27,100 32,96 34,88 L34,52 L34,92 C34,98 39,100 46,100'] },
    v: { w: 46, s: [8, 52], x: [46, 52], conn: 'over', k: ['M8,52 C9,66 13,88 17,100 C22,90 28,70 34,54 C36,50 41,49 46,52'] },
    w: { w: 70, s: [8, 52], x: [70, 52], conn: 'under', k: ['M8,52 C8,70 8,86 10,92 C12,98 16,100 21,100 C27,100 32,96 34,88 L34,52 L34,90 C34,97 38,100 44,100 C50,100 56,96 58,88 L58,58 C58,51 63,49 70,52'] },
    x: { w: 34, s: [8, 52], x: [34, 100], conn: 'over', k: ['M8,52 C14,56 18,70 18,86 C18,96 24,100 34,100', 'M31,54 L8,98'], after: [1] },
    y: { w: 55, s: [8, 52], x: [55, 100], conn: 'over', k: ['M8,52 L8,86 C8,96 14,100 20,100 C28,100 34,92 34,80 L34,52 L34,138 ' + DESC] },
    z: { w: 50, s: [8, 52], x: [50, 100], conn: 'over', k: ['M8,52 C14,50 22,50 28,52 C30,57 26,66 16,76 C26,76 32,82 32,96 L32,136 C32,148 26,153 22,148 C18,142 24,122 34,110 C39,105 44,101 50,100'] },
    A: { w: 78, x: [78, 100], k: ['M60,10 C50,0 36,0 26,4 C10,12 4,40 4,64 C4,86 14,100 28,100 C44,100 58,80 62,56 L66,4 L66,90 C66,97 70,100 78,100'] },
    B: { w: 68, k: ['M24,6 C24,40 22,76 18,100', 'M24,6 C42,0 62,2 62,22 C62,38 46,46 32,48 C52,48 66,58 66,76 C66,94 50,100 34,100 C26,100 20,98 17,94'] },
    C: { w: 66, x: [66, 96], k: ['M50,24 C52,10 46,2 38,2 C22,2 6,24 6,58 C6,86 18,100 34,100 C46,100 58,98 66,96'] },
    D: { w: 72, k: ['M32,8 C30,40 26,72 22,94 C20,102 10,102 6,96 C8,90 16,94 28,97 C52,102 68,82 68,52 C68,20 52,2 34,2 C20,2 12,10 12,18'] },
    E: { w: 64, x: [64, 92], k: ['M48,20 C50,8 42,2 34,2 C20,2 12,12 12,24 C12,38 24,46 36,48 C18,50 6,62 6,76 C6,92 18,100 32,100 C46,100 56,96 64,92'] },
    F: { w: 70, k: ['M8,14 C22,2 38,8 50,6 C58,4 64,2 70,0', 'M46,6 C42,40 36,80 28,100 C22,104 14,100 12,94', 'M26,56 L52,52'] },
    // G, one stroke: a little curl at the top (as Palmer's C begins), the big curve of C down the left and round the bottom,
    // up the right side to the middle line, straight back down (a retrace) and out on the baseline to join the next letter.
    G: { w: 74, x: [74, 98], k: ['M52,24 C56,8 48,2 38,2 C20,2 6,28 6,60 C6,88 18,100 32,100 C46,100 56,90 58,72 L58,58 L58,90 C58,98 64,100 74,98', 'M42,58 L64,58'], after: [1] },
    H: { w: 66, x: [66, 100], k: ['M20,4 C18,40 14,80 10,100', 'M60,4 C58,40 54,70 52,92 C52,98 56,100 66,100', 'M14,56 C30,50 44,50 58,52'] },
    I: { w: 56, k: ['M8,52 C20,56 34,50 44,30 C50,16 52,4 48,2 C42,0 36,30 30,60 C26,80 22,96 14,100 C8,102 4,96 6,90'] },
    J: { w: 60, x: [60, 100], k: ['M8,52 C20,56 34,50 44,30 C50,16 52,4 48,2 C42,0 38,30 34,70 L30,140 C28,150 22,153 20,146 C18,138 26,118 40,108 C46,104 52,101 60,100'] },
    K: { w: 62, x: [62, 100], k: ['M22,4 C20,40 16,80 12,100', 'M62,6 C48,24 36,40 20,52 C36,54 44,66 48,82 C50,94 54,100 62,100'] },
    L: { w: 64, x: [64, 96], k: ['M30,40 C40,30 52,14 50,6 C48,0 40,2 36,12 C32,30 28,70 22,90 C18,100 10,102 6,96 C8,90 18,92 30,96 C40,100 52,100 64,96'] },
    M: { w: 78, x: [78, 100], k: ['M8,30 C12,10 20,2 24,4 C28,8 26,50 22,100 C26,60 34,4 42,4 C48,4 48,40 44,100 C48,60 56,4 64,4 C70,4 70,40 66,92 C66,98 70,100 78,100'] },
    N: { w: 58, x: [58, 100], k: ['M8,30 C12,10 20,2 24,4 C28,8 26,50 22,100 C26,60 34,4 42,4 C48,4 48,40 46,92 C46,98 50,100 58,100'] },
    O: { w: 70, k: ['M44,4 C26,0 8,24 8,56 C8,84 20,100 36,100 C54,100 64,80 64,52 C64,22 54,6 44,4 C38,4 36,10 42,12 C50,14 60,10 70,4'] },
    P: { w: 66, k: ['M24,6 C22,40 18,80 14,100', 'M24,6 C44,0 64,4 64,24 C64,44 44,54 22,52'] },
    Q: { w: 74, k: ['M10,30 C14,10 30,2 44,2 C60,2 68,18 64,40 C60,64 40,90 20,100 C30,94 44,96 56,100 C62,102 68,100 74,96'] },
    R: { w: 64, x: [64, 100], k: ['M24,6 C22,40 18,80 14,100', 'M24,6 C44,0 64,4 64,24 C64,44 44,52 26,52 C40,56 46,70 48,86 C50,96 54,100 64,100'] },
    S: { w: 56, k: ['M10,64 C24,56 40,40 52,18 C56,8 54,2 50,2 C44,2 42,12 44,28 C46,50 52,66 52,80 C52,94 42,100 32,100 C22,100 14,94 14,86 C18,90 30,92 40,90'] },
    T: { w: 72, k: ['M8,14 C22,2 40,8 52,6 C60,4 66,2 72,0', 'M46,6 C42,40 36,80 28,100 C22,104 14,100 12,94'] },
    U: { w: 70, x: [70, 100], k: ['M8,24 C14,8 22,4 26,8 C28,30 18,70 18,86 C18,96 24,100 32,100 C44,100 52,84 56,60 L62,4 L58,92 C58,98 62,100 70,100'] },
    V: { w: 76, k: ['M8,24 C14,8 22,4 26,8 C30,30 34,70 36,100 C42,70 54,30 66,6 C70,2 74,4 76,6'] },
    W: { w: 90, k: ['M8,24 C14,8 22,4 26,8 C28,40 28,70 30,100 C36,70 42,40 46,20 C48,40 50,70 54,100 C60,70 70,30 80,6 C84,2 88,4 90,6'] },
    X: { w: 64, k: ['M8,24 C14,8 22,4 26,8 C34,30 42,70 50,94 C52,98 56,100 64,100', 'M60,8 L12,100'] },
    Y: { w: 82, x: [82, 100], k: ['M8,24 C14,8 22,4 26,8 C28,30 18,70 20,86 C22,96 28,100 34,100 C46,100 54,84 58,60 L62,4 L56,140 C54,150 48,153 46,146 C44,138 52,118 64,108 C70,104 76,101 82,100'] },
    Z: { w: 74, x: [74, 100], k: ['M10,16 C20,2 40,2 50,6 C54,10 50,24 30,46 C42,48 50,56 50,72 L48,136 C46,150 40,153 38,146 C36,138 44,118 56,108 C62,104 68,101 74,100'] }
  };

  /* ---------- compiling strokes to SVG path data ---------- */
  function fmt(v) { return String(M.round(v * 10) / 10); }
  // ovals as cubic arcs (at most 90 degrees each)
  function ovalPts(cx, cy, rx, ry, a0, a1) {
    var out = [], n = M.max(1, M.ceil(M.abs(a1 - a0) / 90)), d = (a1 - a0) / n * M.PI / 180, k = 4 / 3 * M.tan(d / 4);
    function P(t) { return [cx + rx * M.cos(t), cy - ry * M.sin(t)]; }
    function T(t) { return [-rx * M.sin(t), -ry * M.cos(t)]; }
    var t0 = a0 * M.PI / 180;
    for (var i = 0; i < n; i++) {
      var A = t0 + i * d, B = A + d, p0 = P(A), p1 = P(B), da = T(A), db = T(B);
      out.push([p0[0] + k * da[0], p0[1] + k * da[1], p1[0] - k * db[0], p1[1] - k * db[1], p1[0], p1[1]]);
    }
    return { start: P(t0), segs: out };
  }
  // parse a stroke into absolute segments: [['M', x, y], ['L', x, y], ['C', x1, y1, x2, y2, x, y], ['D', x, y]]
  function parse(s) {
    var out = [], re = /([MLCQOD])([^MLCQOD]*)/g, m, cur = null;
    while ((m = re.exec(s))) {
      var n = (m[2].match(/-?\d+(\.\d+)?/g) || []).map(Number), c = m[1];
      if (c === 'M') { out.push(['M', n[0], n[1]]); cur = [n[0], n[1]]; }
      else if (c === 'L') { for (var i = 0; i + 1 < n.length; i += 2) { out.push(['L', n[i], n[i + 1]]); cur = [n[i], n[i + 1]]; } }
      else if (c === 'C') { for (i = 0; i + 5 < n.length; i += 6) { out.push(['C'].concat(n.slice(i, i + 6))); cur = [n[i + 4], n[i + 5]]; } }
      else if (c === 'Q') { var x0 = cur[0], y0 = cur[1]; out.push(['C', x0 + 2 / 3 * (n[0] - x0), y0 + 2 / 3 * (n[1] - y0), n[2] + 2 / 3 * (n[0] - n[2]), n[3] + 2 / 3 * (n[1] - n[3]), n[2], n[3]]); cur = [n[2], n[3]]; }
      else if (c === 'D') { out.push(['D', n[0], n[1]]); cur = [n[0], n[1]]; }
      else if (c === 'O') { var o = ovalPts(n[0], n[1], n[2], n[3], n[4], n[5]); if (!cur) out.push(['M', o.start[0], o.start[1]]); o.segs.forEach(function (sg) { out.push(['C'].concat(sg)); }); cur = [o.segs[o.segs.length - 1][4], o.segs[o.segs.length - 1][5]]; }
    }
    return out;
  }
  function xf(p, dx, dy, slant) { return [p[0] + dx + (slant ? (100 - p[1]) * SLANT : 0), p[1] + dy]; }
  function toD(segs, dx, dy, slant) {
    return segs.map(function (g) {
      if (g[0] === 'D') { var q = xf([g[1], g[2]], dx, dy, slant); return 'M' + fmt(q[0]) + ',' + fmt(q[1] - 0.6) + ' L' + fmt(q[0]) + ',' + fmt(q[1] + 0.6); }
      var pts = []; for (var i = 1; i < g.length; i += 2) pts.push(xf([g[i], g[i + 1]], dx, dy, slant));
      return g[0] + pts.map(function (q) { return fmt(q[0]) + ',' + fmt(q[1]); }).join(' ');
    }).join(' ');
  }
  function firstPt(segs) { return [segs[0][1], segs[0][2]]; }
  function lastPt(segs) { var g = segs[segs.length - 1]; return [g[g.length - 2], g[g.length - 1]]; }
  function bbox(list) { var b = [1e9, 1e9, -1e9, -1e9]; list.forEach(function (segs) { segs.forEach(function (g) { for (var i = 1; i < g.length; i += 2) { b[0] = M.min(b[0], g[i]); b[1] = M.min(b[1], g[i + 1]); b[2] = M.max(b[2], g[i]); b[3] = M.max(b[3], g[i + 1]); } }); }); return b; }

  var CACHE = {};
  function spec(ch, style) { var T = style === 'cursive' ? CURSIVE : PRINT; return T[ch] || null; }
  // one letter (or digit) alone. Cursive lowercase gets its lead-in undercurve (or overcurve) and a short exit, as taught alone.
  // -> { ch, style, w, strokes: [{ d, start: [x, y], end: [x, y], dot, join }], box: [x0, y0, x1, y1] }
  function glyph(ch, style) {
    style = style === 'cursive' ? 'cursive' : 'print';
    var key = style + ch; if (CACHE[key]) return CACHE[key];
    var G = spec(ch, style); if (!G) return null;
    var slant = style === 'cursive', strokes = [], lead = 0;
    var parsed = G.k.map(parse);
    if (slant && G.s) { // the lead-in and the exit, drawn as part of the first and last body strokes
      lead = G.lgap ? G.lgap + 8 : 18;
      var Lin = parse(connector([0, 100], [G.s[0] + lead, G.s[1]], G.conn));
      parsed[0] = Lin.concat(parsed[0].slice(1).map(function (g) { return shift(g, lead); }));
      for (var i = 1; i < parsed.length; i++) parsed[i] = parsed[i].map(function (g) { return shift(g, lead); });
      var tail = parse(exitTail([G.x[0] + lead, G.x[1]])); parsed[0] = parsed[0].concat(tail.slice(1));
    }
    parsed.forEach(function (segs, i) {
      strokes.push({ d: toD(segs, 0, 0, slant), start: xf(firstPt(segs), 0, 0, slant), end: xf(lastPt(segs), 0, 0, slant), dot: segs[0][0] === 'D', after: !!(G.after && G.after.indexOf(i) >= 0), segs: segs });
    });
    var b = bbox(parsed.map(function (s) { return s.map(function (g) { if (g[0] === 'D') return g; var o = [g[0]]; for (var k = 1; k < g.length; k += 2) { var q = xf([g[k], g[k + 1]], 0, 0, slant); o.push(q[0], q[1]); } return o; }); }));
    var out = { ch: ch, style: style, w: G.w + lead + (slant && G.s ? 16 : 0), strokes: strokes, box: b, n: strokes.length };
    CACHE[key] = out; return out;
  }
  function shift(g, dx) { var o = [g[0]]; for (var i = 1; i < g.length; i += 2) o.push(g[i] + dx, g[i + 1]); return o; }
  // the curve that joins two cursive letters (upright coordinates): from P (an exit) to S (the next letter's start)
  function connector(P, S, kind) {
    var dx = S[0] - P[0], c1, c2, high = P[1] < 75;
    if (high) { c1 = [P[0] + 0.45 * dx, P[1] - 3]; c2 = [S[0] - 0.35 * dx, S[1] - (S[1] > P[1] + 10 ? 8 : 2)]; }
    else if (kind === 'over') { c1 = [P[0] + 0.1 * dx, P[1] - 0.85 * (P[1] - S[1])]; c2 = [S[0] - 0.5 * dx, S[1] - 2]; }
    else { c1 = [P[0] + 0.55 * dx, P[1]]; c2 = [S[0] - 0.12 * dx, S[1] + 0.45 * (P[1] - S[1])]; }
    return 'M' + P[0] + ',' + P[1] + ' C' + [c1, c2, S].map(function (q) { return fmt(q[0]) + ',' + fmt(q[1]); }).join(' ');
  }
  function exitTail(X) { return X[1] < 75 ? 'M' + X[0] + ',' + X[1] + ' C' + (X[0] + 4) + ',' + (X[1] - 1) + ' ' + (X[0] + 8) + ',' + (X[1] - 2) + ' ' + (X[0] + 10) + ',' + (X[1] - 3) : 'M' + X[0] + ',' + X[1] + ' C' + (X[0] + 6) + ',' + X[1] + ' ' + (X[0] + 11) + ',' + (X[1] - 6) + ' ' + (X[0] + 15) + ',' + (X[1] - 14); }

  // a whole word or line. Print: letters side by side. Cursive: letters joined (capitals without an exit stand alone),
  // dots and crosses made after each word. opts: { distort: { index, kind: 'short' | 'float' | 'big' | 'mirror' | 'squash' } }
  // -> { w, parts: [{ d, kind: 'letter' | 'join' | 'mark', i (letter index) }], boxes: [{ ch, x0, x1, i }] }
  function word(text, style, opts) {
    opts = opts || {}; style = style === 'cursive' ? 'cursive' : 'print';
    var slant = style === 'cursive', parts = [], boxes = [], cur = 0, prevExit = null, marks = [], li = -1;
    String(text).split('').forEach(function (ch, idx) {
      if (ch === ' ') { flushMarks(); cur += slant ? 34 : 34; prevExit = null; return; }
      var G = spec(ch, style); if (!G) { cur += 20; prevExit = null; return; }
      li++; var dis = opts.distort && opts.distort.index === li ? opts.distort.kind : null;
      var segsList = G.k.map(parse);
      if (dis) segsList = segsList.map(function (sg) { return sg.map(function (g) { return distort(g, dis, G.w); }); });
      var ox;
      if (slant && G.s) { // a cursive lowercase letter
        var left = bbox(segsList)[0];
        if (prevExit) ox = prevExit[0] + M.max((prevExit[1] < 75 ? 10 : 12) - G.s[0], (G.lgap || 3) - left);
        else ox = cur + M.max(18 - G.s[0], (G.lgap || 6) - left);
        var S = [ox + G.s[0], G.s[1]];
        var from = prevExit || [cur, 100];
        parts.push({ d: toD(parse(connector(from, S, G.conn)), 0, 0, true), kind: 'join', i: li, lead: !prevExit });
        prevExit = [ox + G.x[0], G.x[1]];
      } else {
        ox = cur + (slant ? 4 : 0);
        prevExit = slant && G.x ? [ox + G.x[0], G.x[1]] : null;
      }
      segsList.forEach(function (segs, k) {
        var d = toD(segs, ox, 0, slant), isAfter = slant && G.after && G.after.indexOf(k) >= 0;
        (isAfter ? marks : parts).push({ d: d, kind: isAfter ? 'mark' : 'letter', i: li, dot: segs[0][0] === 'D' });
      });
      var bx = bbox(segsList.map(function (s) { return s.map(function (g) { return shift(g, ox); }); }));
      boxes.push({ ch: ch, i: li, x0: bx[0], x1: bx[2] + (slant ? (100 - bx[1]) * SLANT : 0), y0: bx[1], y1: bx[3] });
      cur = (prevExit ? prevExit[0] : ox + G.w) + (slant ? 0 : 10);
      if (!slant) prevExit = null;
    });
    function flushMarks() { if (prevExit && slant) { parts.push({ d: toD(parse(exitTail(prevExit)), 0, 0, true), kind: 'join', i: li, tail: true }); cur = prevExit[0] + 16; } marks.forEach(function (m) { parts.push(m); }); marks = []; }
    flushMarks();
    return { w: cur + (slant ? 20 : 0), parts: parts, boxes: boxes, text: text, style: style };
  }
  function distort(g, kind, w) {
    var o = [g[0]];
    for (var i = 1; i < g.length; i += 2) {
      var x = g[i], y = g[i + 1];
      if (kind === 'short') y = 100 - (100 - y) * 0.55;          // a tall letter that doesn't reach the top line
      else if (kind === 'float') y = y - 26;                       // a letter that floats above the baseline
      else if (kind === 'big') { x = x * 1.25; y = 100 - (100 - y) * 1.5; }
      else if (kind === 'mirror') x = w - x;                       // a reversed letter (b for d)
      else if (kind === 'squash') x = x * 0.55;                    // letters crowded together
      o.push(x, y);
    }
    return o;
  }
  // facts that problems use, from the same data the pictures come from
  function zone(ch) { // print lowercase: 'tall' (reaches the top line), 'tail' (goes below the baseline), 'short'
    var g = glyph(ch, 'print'); if (!g) return null; if (g.box[3] > 110) return 'tail'; if (g.box[1] < 20) return 'tall'; return 'short';
  }
  function startLine(ch, style) { // where the first stroke starts: 'top' | 'middle' | 'other'
    var g = glyph(ch, style || 'print'); if (!g) return null; var y = g.strokes[0].start[1];
    return y <= 6 ? 'top' : M.abs(y - 50) <= 8 ? 'middle' : 'other';
  }
  var GROUPS = {
    printLines: ['l', 'i', 't'], printCircles: ['c', 'o', 'a', 'd', 'g', 'q'], printHumps: ['r', 'n', 'm', 'h', 'b', 'p'], printSlants: ['v', 'w', 'x', 'y', 'z', 'k'], printOthers: ['e', 'f', 'j', 's', 'u'],
    capStraight: ['E', 'F', 'H', 'I', 'L', 'T'], capSlant: ['A', 'K', 'M', 'N', 'V', 'W', 'X', 'Y', 'Z'], capCurve: ['B', 'C', 'D', 'G', 'J', 'O', 'P', 'Q', 'R', 'S', 'U'],
    cursiveUnder: ['i', 't', 'u', 'w'], cursiveLoops: ['e', 'l', 'h', 'k', 'b', 'f'], cursiveC: ['a', 'c', 'd', 'g', 'o', 'q'], cursiveHills: ['n', 'm', 'v', 'x', 'y', 'z'],
    cursiveOthers: ['r', 's', 'p', 'j'], cursiveHigh: ['b', 'o', 'v', 'w'],
    capOval: ['A', 'C', 'E', 'O'], capHills: ['H', 'K', 'M', 'N', 'U', 'V', 'W', 'X', 'Y', 'Z'], capLoops: ['B', 'F', 'P', 'R', 'T'], capOthers: ['D', 'G', 'I', 'J', 'L', 'Q', 'S']
  };
  // the stroke-order picture for a wrong order: the same strokes, numbered in another order (for "which order is right?")
  function wrongOrder(n, seedStr) { var o = []; for (var i = 0; i < n; i++) o.push(i); if (n < 2) return null; var r = 0; for (var k = 0; k < (seedStr || '').length; k++) r += seedStr.charCodeAt(k); var a = r % n, b = (a + 1 + (r >> 3) % (n - 1)) % n; var t = o[a]; o[a] = o[b]; o[b] = t; return o; }

  var HAND = { PRINT: PRINT, CURSIVE: CURSIVE, SLANT: SLANT, LINES: { top: 0, middle: 50, base: 100, descender: 150 }, GROUPS: GROUPS,
    glyph: glyph, word: word, zone: zone, startLine: startLine, parse: parse, toD: toD, connector: connector, wrongOrder: wrongOrder,
    letters: function (style) { return Object.keys(style === 'cursive' ? CURSIVE : PRINT); },
    joins: function (ch) { var G = CURSIVE[ch]; return !!(G && G.x); }, highExit: function (ch) { var G = CURSIVE[ch]; return !!(G && G.x && G.x[1] < 75); } };
  ML.writing = ML.writing || {}; ML.writing.HAND = HAND;
})(typeof window !== 'undefined' ? window : global);
/* =====================================================================================================================
   THE VISUALS (browser only)
   ===================================================================================================================== */
(function (W, D) {
  'use strict';
  if (!D || !W.MathLadder || !W.MathLadder.viz) return;
  var ML = W.MathLadder, V = ML.viz, M = Math, WR = ML.writing;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(SVGNS, tag); for (var k in at) if (at[k] != null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  var esc = WR.esc;
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  function okMark(good) { return '<span class="' + (good ? 'wrv-ok' : 'wrv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function seeded(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(key), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(n, key) { // a fixed shuffle of 0..n-1 that is not the identity (n > 1)
    var idx = []; for (var i = 0; i < n; i++) idx.push(i); if (n < 2) return idx;
    for (var t = 0; t < 8; t++) { var s = shuffle(idx, key + '#' + t); if (s.some(function (v, k) { return v !== k; })) return s; }
    return idx.slice(1).concat([0]);
  }
  function letter(i) { return String.fromCharCode(65 + i); }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w !== last) { last = w; fn(); } }).observe(e); } else W.addEventListener('resize', fn); }
  function strip(html) { return String(html).replace(/<[^>]+>/g, ''); }
  function txt(x) { return typeof x === 'string' ? x : (x && (x.html || esc(x.text))) || ''; }

  // the frame every visual shares: readme, task, body, controls, live readout, caption, and a quiet flag
  function frame(el, o, name, label) {
    el.classList.add('wrv', 'wrv-' + name); if (o.big) el.classList.add('wrv-big');
    if (!el.getAttribute('aria-label') || el.getAttribute('aria-label') === name) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.readme) el.appendChild(h('p', 'wrv-readme', '<span class="wrv-readme-tag">For the grown-up</span> ' + o.readme));
    if (o.task) el.appendChild(h('p', 'wrv-task', o.task));
    F.body = h('div', 'wrv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl wrv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout wrv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    F.speak = function (getText) { // a Read aloud button, when the browser has a speech voice (whole sentences only)
      if (!o.speak || !W.speechSynthesis || !W.SpeechSynthesisUtterance) return;
      var b = btn(null, '🔊 Read aloud', function () {
        try { W.speechSynthesis.cancel(); var u = new W.SpeechSynthesisUtterance(strip(getText())); u.rate = 0.9; W.speechSynthesis.speak(u); } catch (e) { }
      }, 'wrv-speak');
      F.ctl.insertBefore(b, F.ctl.firstChild);
    };
    return F;
  }
  // a palette of labels to choose from (tagging, labeling): items [[key, label, color]]; returns { get(), set(k), el }
  function palette(parent, items, o) {
    o = o || {}; var wrap = h('div', 'wrv-pal'); wrap.setAttribute('role', 'radiogroup'); wrap.setAttribute('aria-label', o.label || 'Choose a label');
    var cur = o.value || null, bs = {};
    items.forEach(function (it, i) {
      var b = h('button', 'wrv-palb', '<i style="background:' + it[2] + '"></i>' + esc(it[1]) + (o.keys ? '<kbd>' + (i + 1) + '</kbd>' : ''));
      b.type = 'button'; b.setAttribute('role', 'radio'); b.style.setProperty('--c', it[2]);
      b.addEventListener('click', function () { set(cur === it[0] && o.toggle ? null : it[0]); if (o.change) o.change(cur); });
      bs[it[0]] = b; wrap.appendChild(b);
    });
    function set(k) { cur = k; Object.keys(bs).forEach(function (x) { bs[x].setAttribute('aria-checked', String(x === k)); }); }
    set(cur); parent.appendChild(wrap);
    return { get: function () { return cur; }, set: set, el: wrap, byIndex: function (i) { return items[i] && items[i][0]; } };
  }
  function colorOf(map, k, fallback) { return (map[k] && map[k].color) || fallback || '#5c6370'; }
  function legendHTML(items) { return '<p class="wrv-legend">' + items.map(function (it) { return '<span><i style="background:' + it[2] + '"></i>' + esc(it[1]) + '</span>'; }).join('') + '</p>'; }
  var TEXT_W = {}; var mctx = null;
  function measure(s, font) { // text width in px for SVG layout (canvas measureText; a rough estimate if canvas is missing)
    var key = font + '|' + s; if (TEXT_W[key] != null) return TEXT_W[key];
    try { if (!mctx) mctx = D.createElement('canvas').getContext('2d'); mctx.font = font; TEXT_W[key] = mctx.measureText(s).width; } catch (e) { TEXT_W[key] = s.length * 8.4; }
    return TEXT_W[key];
  }
  /* ---------- wr-sort: a card sorter ---------- */
  V.register('wr-sort', function (el, o) {
    var F = frame(el, o, 'sort', 'Sort the cards into groups');
    var bins = o.bins || ['Sentence', 'Not a sentence'], cards = (o.cards || []).map(function (c, i) { return typeof c === 'string' ? { text: c, i: i } : Object.assign({ i: i }, c); });
    if (o.shuffle) cards = shuffle(cards, JSON.stringify(o.cards || []));
    var place = {}, sel = null, checked = false, live = F.interactive && !F.quiet;
    cards.forEach(function (c) { place[c.i] = -1; });
    if (live) F.body.appendChild(h('p', 'wrv-hint', 'Tap a card, then tap a group. With a keyboard, focus a card and press the group’s number (0 puts it back).'));
    var pool = h('div', 'wrs-pool'); pool.setAttribute('aria-label', 'Cards not yet sorted'); F.body.appendChild(pool);
    var grid = h('div', 'wrs-bins'); grid.style.setProperty('--cols', o.columns || M.min(bins.length, 3)); F.body.appendChild(grid);
    var binEls = bins.map(function (b, bi) {
      var d = h('div', 'wrs-bin wrs-b' + bi); d.setAttribute('role', 'group'); d.setAttribute('aria-label', b);
      d.appendChild(h('p', 'wrs-binlab', (live ? '<span class="wrs-n">' + (bi + 1) + '</span>' : '') + esc(b)));
      var list = h('div', 'wrs-binlist'); d.appendChild(list); d._list = list;
      d.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.wrs-card')) move(sel, bi); });
      grid.appendChild(d); return d;
    });
    pool.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.wrs-card')) move(sel, -1); });
    var cardEls = {};
    cards.forEach(function (c, k) {
      var b = h('button', 'wrs-card', (F.quiet ? '<b class="wrs-let">' + letter(k) + '</b>' : '') + '<span>' + (c.html || esc(c.text)) + '</span>'); b.type = 'button';
      if (!live) b.disabled = true;
      b.addEventListener('click', function () { sel = sel === c.i ? null : c.i; paint(); });
      b.addEventListener('keydown', function (e) { var n = parseInt(e.key, 10); if (!isNaN(n) && n <= bins.length) { e.preventDefault(); move(c.i, n - 1); b.focus(); } else if (e.key === 'Escape') { sel = null; paint(); } });
      cardEls[c.i] = b;
    });
    function move(i, bi) { place[i] = bi; sel = null; checked = false; paint(); F.say(''); }
    function paint() {
      cards.forEach(function (c) {
        var b = cardEls[c.i], p = place[c.i]; (p < 0 ? pool : binEls[p]._list).appendChild(b); b.setAttribute('aria-pressed', String(sel === c.i)); b.classList.remove('ok', 'no');
        if (checked && p >= 0 && c.bin !== undefined) b.classList.add(p === c.bin ? 'ok' : 'no');
        b.setAttribute('aria-label', strip(c.html || c.text) + (p >= 0 ? ', in ' + bins[p] : ', not sorted') + (checked && p >= 0 && c.bin !== undefined ? (p === c.bin ? ', right' : ', not right') : ''));
      });
      pool.classList.toggle('empty', !cards.some(function (c) { return place[c.i] < 0; }));
      binEls.forEach(function (d) { d.classList.toggle('target', sel !== null); });
      pool.classList.toggle('target', sel !== null && place[sel] >= 0);
    }
    if (live && o.check !== false && cards.some(function (c) { return c.bin !== undefined; })) {
      btn(F.ctl, 'Check', function () {
        var left = cards.filter(function (c) { return place[c.i] < 0; }).length;
        if (left) { F.say('Sort every card first (' + plural(left, 'card') + ' left).'); return; }
        checked = true; paint();
        var wrong = cards.filter(function (c) { return place[c.i] !== c.bin; });
        F.say(wrong.length ? okMark(false) + ' ' + (cards.length - wrong.length) + ' of ' + cards.length + ' are right.' + wrong.filter(function (c) { return c.why; }).slice(0, 2).map(function (c) { return '<br><b>' + esc(strip(c.html || c.text)) + '</b> ' + c.why; }).join('') : okMark(true) + ' All ' + cards.length + ' are in the right groups.' + (o.why ? ' ' + o.why : ''));
      }, 'pri');
      btn(F.ctl, 'Start over', function () { cards.forEach(function (c) { place[c.i] = -1; }); checked = false; sel = null; paint(); F.say(''); });
      if (o.reveal) btn(F.ctl, 'Show me', function () { cards.forEach(function (c) { place[c.i] = c.bin; }); checked = true; paint(); F.say(o.why || 'Each card is in its group.'); });
    }
    if (o.solved) { cards.forEach(function (c) { place[c.i] = c.bin; }); }
    paint();
    F.speak(function () { return bins.join(' or ') + '? ' + cards.map(function (c) { return strip(c.html || c.text); }).join('. '); });
    return { state: function () { var r = {}; cards.forEach(function (c) { r[c.i] = place[c.i]; }); return r; } };
  });

  /* ---------- a reorderable list (wr-order, wr-para order mode, wr-note order mode) ---------- */
  function orderList(parent, items, o) {
    var n = items.length, cur = o.start || derange(n, o.key || ''), sel = null, marks = null;
    var ol = h('ol', 'wro-list' + (o.quiet ? ' quiet' : '') + (o.cls ? ' ' + o.cls : '')); parent.appendChild(ol);
    function paint() {
      ol.innerHTML = '';
      cur.forEach(function (ix, pos) {
        var it = items[ix], li = h('li', 'wro-row'); li.dataset.ix = ix;
        if (it.color) li.style.setProperty('--rc', it.color);
        if (marks) li.classList.add(marks[pos] ? 'ok' : 'no');
        var lab = o.quiet ? letter(pos) : String(pos + 1);
        var body = '<span class="wro-n">' + lab + '</span><span class="wro-t">' + (it.label && o.labels ? '<small>' + esc(it.label) + '</small>' : '') + it.html + '</span>';
        if (o.quiet || o.interactive === false) { li.innerHTML = body; ol.appendChild(li); return; }
        var b = h('button', 'wro-pick', body); b.type = 'button'; b.setAttribute('aria-pressed', String(sel === pos));
        b.setAttribute('aria-label', 'Place ' + (pos + 1) + ': ' + strip(it.html) + (sel === pos ? ', chosen; choose another to swap' : ''));
        b.addEventListener('click', function () { if (sel === null) sel = pos; else if (sel === pos) sel = null; else { swap(sel, pos); sel = null; } paint(); var f = ol.children[pos] && ol.children[pos].querySelector('.wro-pick'); if (f) f.focus(); });
        li.appendChild(b);
        var mv = h('span', 'wro-mv');
        var up = btn(mv, '▲', function () { if (pos > 0) { swap(pos, pos - 1); sel = null; paint(); focusMove(pos - 1, 0); } }, 'wro-btn'); up.setAttribute('aria-label', 'Move up'); up.disabled = pos === 0;
        var dn = btn(mv, '▼', function () { if (pos < n - 1) { swap(pos, pos + 1); sel = null; paint(); focusMove(pos + 1, 1); } }, 'wro-btn'); dn.setAttribute('aria-label', 'Move down'); dn.disabled = pos === n - 1;
        li.appendChild(mv); ol.appendChild(li);
      });
    }
    function focusMove(pos, k) { var r = ol.children[pos]; if (!r) return; var bs = r.querySelectorAll('.wro-btn'); var b = bs[k]; if (b && b.disabled) b = bs[1 - k]; if (b) b.focus(); }
    function swap(a, b) { var t = cur[a]; cur[a] = cur[b]; cur[b] = t; marks = null; if (o.onChange) o.onChange(cur); }
    paint();
    return { order: function () { return cur.slice(); }, set: function (c) { cur = c.slice(); marks = null; paint(); }, mark: function (m) { marks = m; paint(); }, el: ol };
  }
  function orderControls(F, L, items, o, noun) {
    if (!F.interactive || F.quiet || o.check === false) return;
    btn(F.ctl, 'Check', function () {
      var c = L.order(), m = c.map(function (ix, pos) { return ix === pos; }), right = m.filter(Boolean).length;
      L.mark(m); F.say(right === c.length ? okMark(true) + ' All ' + c.length + ' ' + noun + ' are in order.' + (o.why ? ' ' + o.why : '') : okMark(false) + ' ' + right + ' of ' + c.length + ' are in the right place. Look at the ones marked in red.');
    }, 'pri');
    if (o.reveal !== false) btn(F.ctl, 'Show me', function () { L.set(items.map(function (x, i) { return i; })); L.mark(items.map(function () { return true; })); F.say(o.why || 'Here is the order.'); });
  }

  /* ---------- wr-order: put steps, events or sentences in order ---------- */
  V.register('wr-order', function (el, o) {
    var F = frame(el, o, 'order', 'Put the items in order');
    var items = (o.items || []).map(function (it) { return typeof it === 'string' ? { html: esc(it) } : { html: it.html || esc(it.text), label: it.label }; });
    if (o.title) F.body.appendChild(h('p', 'wro-title', esc(o.title)));
    if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'wrv-hint', 'Tap one, then another, to swap them, or use the arrows. Then Check.'));
    var L = orderList(F.body, items, { start: o.start, key: JSON.stringify(o.items || []), quiet: F.quiet, interactive: F.interactive, labels: o.labels, onChange: function () { F.say(''); } });
    orderControls(F, L, items, o, o.noun || 'items');
    F.speak(function () { return items.map(function (it, i) { return letter(i) + '. ' + it.html; }).join('. '); });
    return { order: L.order };
  });

  /* ---------- wr-checklist: a checklist to tap and print ---------- */
  V.register('wr-checklist', function (el, o) {
    var F = frame(el, o, 'checklist', 'A checklist');
    var preset = WR.CHECKLISTS[o.list || 'first'] || WR.CHECKLISTS.first, items = o.items || preset.items, title = o.title || preset.title;
    var sheet = h('div', 'wrc-sheet'); F.body.appendChild(sheet);
    sheet.appendChild(h('p', 'wrc-title', esc(title)));
    if (o.name !== false) sheet.appendChild(h('p', 'wrc-name', 'Name <span></span> Date <span></span>'));
    var ul = h('ul', 'wrc-list'); sheet.appendChild(ul);
    var live = F.interactive && !F.quiet;
    items.forEach(function (it, i) {
      var li = h('li', 'wrc-item');
      if (live) { var b = h('button', 'wrc-box', '<span aria-hidden="true"></span>'); b.type = 'button'; b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', 'false'); b.setAttribute('aria-label', strip(it)); b.addEventListener('click', function () { var on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(on)); li.classList.toggle('on', on); }); li.appendChild(b); }
      else li.appendChild(h('span', 'wrc-box wrc-print', '<span aria-hidden="true"></span>'));
      li.appendChild(h('span', 'wrc-t', esc(it))); ul.appendChild(li);
    });
    if (live && o.print !== false) btn(F.ctl, '🖨️ Print this checklist', function () {
      D.body.classList.add('wrv-printing'); el.classList.add('wrv-printme');
      function done() { D.body.classList.remove('wrv-printing'); el.classList.remove('wrv-printme'); W.removeEventListener('afterprint', done); }
      W.addEventListener('afterprint', done); try { W.print(); } catch (e) { } setTimeout(done, 1500);
    });
    return {};
  });

  /* ---------- wr-note: letters, notes and emails, with their parts ---------- */
  var LETTER = {
    friendly: { parts: ['date', 'greeting', 'body', 'closing', 'signature'], d: { date: 'October 3', greeting: 'Dear Grandma Rose,', body: 'We went apple picking on Saturday. I picked a whole bag by myself, and Dad made a pie. I saved you the biggest apple. Can you come visit soon?', closing: 'Love,', signature: 'Ava' } },
    thanks: { parts: ['date', 'greeting', 'thanks', 'detail', 'personal', 'closing', 'signature'], d: { date: 'June 12', greeting: 'Dear Uncle Ben,', thanks: 'Thank you for the red kite you sent for my birthday.', detail: 'I flew it at the park on Saturday, and it went higher than the trees.', personal: 'I hope you can fly it with me this summer.', closing: 'Love,', signature: 'Leo' } },
    formal: { parts: ['sender', 'date', 'inside', 'salutation', 'body', 'closing', 'signature'], d: { sender: 'Maya Torres\n41 Elm Street\nSpringfield, OH 45501', date: 'March 8, 2025', inside: 'Ms. Laura Bennett, Director\nSpringfield Public Library\n200 Main Street\nSpringfield, OH 45502', salutation: 'Dear Ms. Bennett:', body: 'I am writing to ask whether our school’s writing club could hold its spring reading in the library’s community room on Saturday, April 26.\n\nAbout thirty students and parents would attend from 2:00 to 4:00 p.m. We would set up and clean up ourselves. Thank you for considering our request.', closing: 'Sincerely,', signature: 'Maya Torres' } },
    email: { parts: ['to', 'subject', 'greeting', 'body', 'closing', 'signature'], d: { to: 'mr.ortiz@school.example', subject: 'Question about Friday’s science project', greeting: 'Dear Mr. Ortiz,', body: 'Could you tell me whether the science project is due this Friday or next Friday? I was absent on Tuesday and missed the announcement.\n\nThank you for your help.', closing: 'Best regards,', signature: 'Leo Park' } }
  };
  var LETTER_NAMES = { date: 'date', greeting: 'greeting', body: 'body', closing: 'closing', signature: 'signature', thanks: 'thank you', detail: 'detail about the gift', personal: 'personal note',
    sender: 'your address (heading)', inside: 'inside address', salutation: 'salutation', to: 'to', subject: 'subject line' };
  var LETTER_COL = { date: '#5c6370', greeting: '#1c6fd6', salutation: '#1c6fd6', body: '#2b8a3e', thanks: '#2b8a3e', detail: '#0c8599', personal: '#7048e8', closing: '#c2255c', signature: '#b8650b', sender: '#7048e8', inside: '#0c8599', to: '#5c6370', subject: '#c92a2a' };
  WR.LETTER = LETTER; WR.LETTER_NAMES = LETTER_NAMES;
  V.register('wr-note', function (el, o) {
    var kind = LETTER[o.kind] ? o.kind : 'friendly', K = LETTER[kind];
    var F = frame(el, o, 'letter', kind === 'email' ? 'An email and its parts' : kind === 'thanks' ? 'A thank-you note and its parts' : 'A ' + kind + ' letter and its parts');
    var vals = Object.assign({}, K.d, o.parts || {}), mode = o.mode || 'show', tags = o.tags !== false && !F.quiet;
    var parts = K.parts.filter(function (p) { return vals[p] != null && vals[p] !== '' && p !== o.omit; });
    function partHTML(p) { return esc(vals[p]).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>'); }
    if (mode === 'order') {
      var items = parts.map(function (p) { return { html: partHTML(p), label: LETTER_NAMES[p], color: LETTER_COL[p] }; });
      if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'wrv-hint', 'Put the parts in order, top to bottom. Tap one, then another, to swap them.'));
      var L = orderList(F.body, items, { key: kind + JSON.stringify(vals), quiet: F.quiet, interactive: F.interactive, labels: tags, onChange: function () { F.say(''); } });
      orderControls(F, L, items, o, 'parts');
      return { order: L.order };
    }
    var page = h('div', 'wrl-page wrl-' + kind); F.body.appendChild(page);
    if (kind === 'email') { var hd = h('div', 'wrl-mailhead'); page.appendChild(hd); }
    parts.forEach(function (p, i) {
      var box = h('div', 'wrl-part wrl-p-' + p); box.style.setProperty('--pc', LETTER_COL[p] || '#5c6370');
      if (kind === 'email' && (p === 'to' || p === 'subject')) { box.innerHTML = '<span class="wrl-field">' + (p === 'to' ? 'To:' : 'Subject:') + '</span> ' + partHTML(p); hd.appendChild(box); }
      else { box.innerHTML = '<p>' + partHTML(p) + '</p>'; page.appendChild(box); }
      if (tags) box.insertAdjacentHTML('afterbegin', '<span class="wrl-tag">' + esc(LETTER_NAMES[p]) + '</span>');
      if (F.quiet && o.ask === p) box.classList.add('wrl-ask');
    });
    if (o.omit) {
      var gapAt = K.parts.indexOf(o.omit); // show a dashed gap where the missing part goes
      var gap = h('div', 'wrl-gap', F.quiet || mode === 'missing' ? '?' : esc(LETTER_NAMES[o.omit]) + ' (missing)');
      var after = K.parts.slice(0, gapAt).filter(function (p) { return parts.indexOf(p) >= 0; }).pop();
      var ref = after ? page.querySelector('.wrl-p-' + after) : null;
      if (ref && ref.nextSibling) page.insertBefore(gap, ref.nextSibling); else if (ref) page.appendChild(gap); else page.insertBefore(gap, page.firstChild);
      if (mode === 'missing' && F.interactive && !F.quiet) {
        F.body.appendChild(h('p', 'wrv-hint', 'Which part is missing?'));
        var row = h('div', 'wrv-choices'); F.body.appendChild(row);
        K.parts.forEach(function (p) {
          btn(row, esc(LETTER_NAMES[p]), function () { F.say(p === o.omit ? okMark(true) + ' Yes: the ' + esc(LETTER_NAMES[p]) + ' is missing.' + (o.why ? ' ' + o.why : '') : okMark(false) + ' The ' + esc(LETTER_NAMES[p]) + ' is there. Look again, top to bottom.'); });
        });
      }
    }
    return {};
  });

  /* ---------- wr-para: a paragraph whose sentences have roles ---------- */
  V.register('wr-para', function (el, o) {
    var F = frame(el, o, 'para', 'A paragraph and the job of each sentence');
    var S = (o.sentences || []).map(function (s, i) { return typeof s === 'string' ? { text: s, i: i } : Object.assign({ i: i }, s); });
    var R = WR.PARA_ROLES, mode = o.mode || 'show';
    var roleItems = (o.roles || S.map(function (s) { return s.role; }).filter(function (r, i, a) { return r && a.indexOf(r) === i; })).map(function (r) { return [r, (R[r] || {}).label || r, colorOf(R, r)]; });
    if (o.title) F.body.appendChild(h('p', 'wro-title', esc(o.title)));
    if (mode === 'order') {
      var items = S.map(function (s) { return { html: s.html || esc(s.text), label: s.role && R[s.role] ? R[s.role].label : '', color: s.role ? colorOf(R, s.role) : null }; });
      if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'wrv-hint', 'Put the sentences in the best order. Tap one, then another, to swap them.'));
      var L = orderList(F.body, items, { key: JSON.stringify(o.sentences), quiet: F.quiet, interactive: F.interactive, labels: !!o.labels, onChange: function () { F.say(''); }, cls: 'wrp-order' });
      orderControls(F, L, items, o, 'sentences');
      return { order: L.order };
    }
    var live = F.interactive && !F.quiet && (mode === 'odd' || mode === 'label');
    var flow = h('div', 'wrp-flow' + (mode === 'show' && !F.quiet ? ' wrp-show' : '')); F.body.appendChild(flow);
    var pal = null, picked = {}, chosen = null;
    if (live && mode === 'label') { F.body.insertBefore(h('p', 'wrv-hint', 'Choose a label, then tap each sentence it fits.'), flow); pal = palette(F.body, roleItems, { label: 'Sentence roles' }); F.body.insertBefore(pal.el, flow); }
    if (live && mode === 'odd') F.body.insertBefore(h('p', 'wrv-hint', o.prompt || 'Tap the sentence that does not belong, then Check.'), flow);
    var els = S.map(function (s, k) {
      var lab = F.quiet || mode !== 'show' ? '<b class="wrp-n">' + (o.letters ? letter(k) : k + 1) + '</b>' : '';
      var inner = lab + '<span class="wrp-t">' + (s.html || esc(s.text)) + '</span>';
      var e = live ? h('button', 'wrp-s', inner) : h('span', 'wrp-s', inner);
      if (live) { e.type = 'button'; e.setAttribute('aria-pressed', 'false'); }
      if (mode === 'show' && !F.quiet && s.role) { e.style.setProperty('--rc', colorOf(R, s.role)); e.classList.add('wrp-role'); e.insertAdjacentHTML('beforeend', '<small class="wrp-tag">' + esc((R[s.role] || {}).label || s.role) + '</small>'); }
      if (live) e.addEventListener('click', function () {
        F.say(''); clearMarks();
        if (mode === 'odd') { chosen = chosen === k ? null : k; els.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === chosen)); }); }
        else { var r = pal.get(); if (!r) { F.say('Choose a label first.'); return; } picked[k] = picked[k] === r ? undefined : r; paintLabels(); }
      });
      flow.appendChild(e); flow.appendChild(D.createTextNode(' ')); return e;
    });
    function clearMarks() { els.forEach(function (x) { x.classList.remove('ok', 'no'); }); }
    function paintLabels() { els.forEach(function (x, j) { var r = picked[j]; x.style.setProperty('--rc', r ? colorOf(R, r) : 'transparent'); x.classList.toggle('wrp-role', !!r); var t = x.querySelector('.wrp-tag'); if (t) t.remove(); if (r) x.insertAdjacentHTML('beforeend', '<small class="wrp-tag">' + esc((R[r] || {}).label || r) + '</small>'); }); }
    if (mode === 'show' && !F.quiet && roleItems.length) F.body.insertAdjacentHTML('beforeend', legendHTML(roleItems));
    if (live) {
      btn(F.ctl, 'Check', function () {
        clearMarks();
        if (mode === 'odd') {
          if (chosen === null) { F.say('Tap a sentence first.'); return; }
          var good = S[chosen].role === 'off'; els[chosen].classList.add(good ? 'ok' : 'no');
          F.say(good ? okMark(true) + ' Right. ' + (S[chosen].why || 'That sentence is about something else.') : okMark(false) + ' That sentence supports the main idea. Look for one about something else.');
        } else {
          var miss = 0; S.forEach(function (s, j) { var ok = picked[j] === s.role; if (!ok) miss++; els[j].classList.add(ok ? 'ok' : 'no'); });
          F.say(miss ? okMark(false) + ' ' + (S.length - miss) + ' of ' + S.length + ' are labeled right.' : okMark(true) + ' Every sentence is labeled right.' + (o.why ? ' ' + o.why : ''));
        }
      }, 'pri');
      btn(F.ctl, 'Show me', function () { clearMarks(); if (mode === 'odd') { S.forEach(function (s, j) { if (s.role === 'off') { chosen = j; els[j].classList.add('ok'); els[j].setAttribute('aria-pressed', 'true'); } }); var off = S.filter(function (s) { return s.role === 'off'; })[0]; F.say(off && off.why ? off.why : 'The marked sentence is off topic.'); } else { S.forEach(function (s, j) { picked[j] = s.role; }); paintLabels(); F.say(o.why || 'Each sentence has its label.'); } });
    }
    F.speak(function () { return S.map(function (s) { return s.text || strip(s.html); }).join(' '); });
    return {};
  });

  /* ---------- wr-mark: a passage with marked sentences (appeals, claims, devices, fallacies) ---------- */
  var MARK_SETS = {
    appeals: [['ethos', 'ethos', '#1c6fd6'], ['pathos', 'pathos', '#c2255c'], ['logos', 'logos', '#2b8a3e']],
    argument: [['claim', 'claim', '#c92a2a'], ['evidence', 'evidence', '#1c6fd6'], ['commentary', 'commentary', '#b8650b'], ['counter', 'counterargument', '#5c6370'], ['rebuttal', 'rebuttal', '#7048e8']],
    paragraph: [['topic', 'topic sentence', '#1c6fd6'], ['evidence', 'evidence', '#2b8a3e'], ['commentary', 'commentary', '#b8650b'], ['conclusion', 'concluding sentence', '#c2255c']]
  };
  WR.MARK_SETS = MARK_SETS;
  V.register('wr-mark', function (el, o) {
    var F = frame(el, o, 'mark', 'A passage with marked sentences');
    var labels = typeof o.labels === 'string' ? MARK_SETS[o.labels] : (o.labels || MARK_SETS.appeals);
    var LC = {}; labels.forEach(function (l) { LC[l[0]] = l; });
    var S = (o.sentences || String(o.passage || '').match(/[^.!?]+[.!?]+["”’)]*\s*/g) || []).map(function (s, i) { return typeof s === 'string' ? { text: s.trim(), i: i } : Object.assign({ i: i }, s); });
    var mode = o.mode || 'show', live = F.interactive && !F.quiet && (mode === 'find' || mode === 'label');
    if (o.source) F.body.appendChild(h('p', 'wrm-src', o.source));
    var pal = null, picked = {};
    if (live && mode === 'label') { F.body.appendChild(h('p', 'wrv-hint', 'Choose a label, then tap each sentence it fits.')); pal = palette(F.body, labels, { label: 'Labels' }); }
    if (live && mode === 'find') F.body.appendChild(h('p', 'wrv-hint', o.prompt || ('Tap every sentence that uses ' + esc((LC[o.ask] || [0, o.ask])[1]) + ', then Check.')));
    var box = h('div', 'wrm-passage' + (o.dialogue ? ' wrm-dlg' : '')); F.body.appendChild(box);
    function rich(s) { return (s.html || esc(s.text)).replace(/\[\[(.+?)\]\]/g, F.quiet || mode !== 'show' ? '$1' : '<mark class="wrm-hl">$1</mark>'); }
    var els = S.map(function (s, k) {
      var num = F.quiet || mode !== 'show' || o.numbers ? '<b class="wrp-n">' + (k + 1) + '</b>' : '';
      var who = s.who ? '<b class="wrm-who">' + esc(s.who) + ':</b> ' : '';
      var e = live ? h('button', 'wrm-s', num + who + rich(s)) : h('span', 'wrm-s', num + who + rich(s));
      if (live) { e.type = 'button'; e.setAttribute('aria-pressed', 'false'); e.addEventListener('click', function () { F.say(''); clear(); if (mode === 'find') { picked[k] = !picked[k]; e.setAttribute('aria-pressed', String(!!picked[k])); } else { var r = pal.get(); if (!r) { F.say('Choose a label first.'); return; } picked[k] = picked[k] === r ? undefined : r; paint(); } }); }
      if (mode === 'show' && !F.quiet && s.k && LC[s.k]) { e.classList.add('wrm-on'); e.style.setProperty('--rc', LC[s.k][2]); e.insertAdjacentHTML('beforeend', ' <small class="wrp-tag">' + esc(LC[s.k][1]) + '</small>'); }
      box.appendChild(e); box.appendChild(D.createTextNode(o.dialogue ? '' : ' ')); return e;
    });
    function clear() { els.forEach(function (x) { x.classList.remove('ok', 'no'); }); }
    function paint() { els.forEach(function (x, j) { var r = picked[j]; x.classList.toggle('wrm-on', !!r); x.style.setProperty('--rc', r ? LC[r][2] : 'transparent'); var t = x.querySelector('.wrp-tag'); if (t) t.remove(); if (r) x.insertAdjacentHTML('beforeend', ' <small class="wrp-tag">' + esc(LC[r][1]) + '</small>'); }); }
    if (mode === 'show' && !F.quiet && o.legend !== false) F.body.insertAdjacentHTML('beforeend', legendHTML(labels.filter(function (l) { return S.some(function (s) { return s.k === l[0]; }); })));
    if (o.note && mode === 'show' && !F.quiet) F.body.appendChild(h('p', 'wrv-note', o.note));
    if (live) {
      btn(F.ctl, 'Check', function () {
        clear(); var miss = 0;
        S.forEach(function (s, j) { var want = mode === 'find' ? s.k === o.ask : s.k, got = mode === 'find' ? !!picked[j] : picked[j]; var ok = mode === 'find' ? want === got : got === want; if (!ok) miss++; if (mode === 'label' || want || got) els[j].classList.add(ok ? 'ok' : 'no'); });
        F.say(miss ? okMark(false) + ' Not yet: ' + plural(miss, 'sentence') + ' to look at again.' : okMark(true) + ' Right.' + (o.why ? ' ' + o.why : ''));
      }, 'pri');
      btn(F.ctl, 'Show me', function () { clear(); S.forEach(function (s, j) { if (mode === 'find') { picked[j] = s.k === o.ask; els[j].setAttribute('aria-pressed', String(picked[j])); if (picked[j]) els[j].classList.add('ok'); } else picked[j] = s.k; }); if (mode === 'label') paint(); F.say(o.why || 'Here are the answers.'); });
    }
    return {};
  });
  /* ---------- tokens shown as word chips ---------- */
  function wordsOf(o) {
    if (o.words) return o.words.map(function (w) { return typeof w === 'string' ? { w: w, tag: '', pre: '', post: '' } : Object.assign({ pre: '', post: '', tag: '' }, w); });
    return WR.tokens(o.text || '');
  }
  function tagSet(o) {
    var t = o.tagset || 'pos';
    if (Array.isArray(t)) return t;
    var src = t === 'roles' ? WR.ROLES : WR.POS;
    var keys = o.tags || Object.keys(src);
    return keys.map(function (k) { return [k, src[k] ? src[k].label : k, src[k] ? src[k].color : '#5c6370']; });
  }

  /* ---------- wr-tag: label the words of a sentence (parts of speech or sentence roles) ---------- */
  V.register('wr-tag', function (el, o) {
    var F = frame(el, o, 'tag', 'A sentence with its words labeled');
    var T = wordsOf(o), TS = tagSet(o), TC = {}; TS.forEach(function (t) { TC[t[0]] = t; });
    var mode = o.mode || 'show', live = F.interactive && !F.quiet && (mode === 'tag' || mode === 'find');
    function abbrOf(k) { var src = o.tagset === 'roles' ? WR.ROLES : Array.isArray(o.tagset) ? {} : WR.POS; return (src[k] && src[k].abbr) || (TC[k] && (TC[k][3] || TC[k][1])) || k; }
    var only = o.only ? o.only : null, picked = {}, pal = null;
    if (live && mode === 'tag') { F.body.appendChild(h('p', 'wrv-hint', o.hint || 'Choose a label, then tap each word it fits. Tap a word again to clear it.')); pal = palette(F.body, TS.filter(function (t) { return !o.tags || o.tags.indexOf(t[0]) >= 0; }), { label: 'Labels', keys: true }); }
    if (live && mode === 'find') F.body.appendChild(h('p', 'wrv-hint', o.prompt || ('Tap every ' + esc((TC[o.ask] || [0, o.ask])[1]) + ', then Check.')));
    var line = h('div', 'wrt-line'); F.body.appendChild(line);
    var chips = T.map(function (t, i) {
      var shown = mode === 'show' && !F.quiet && t.tag && TC[t.tag] && (!only || only.indexOf(i) >= 0);
      var inner = '<span class="wrt-word">' + (t.pre ? '<span class="wrt-p">' + esc(t.pre) + '</span>' : '') + '<span class="wrt-w">' + esc(t.w) + '</span>' + (t.post ? '<span class="wrt-p">' + esc(t.post) + '</span>' : '') + '</span>';
      var c = live ? h('button', 'wrt-chip', inner) : h('span', 'wrt-chip', inner);
      var lab = h('span', 'wrt-lab', shown ? esc(abbrOf(t.tag)) : (F.quiet && o.numbers !== false ? String(i + 1) : ''));
      if (shown) { c.style.setProperty('--tc', TC[t.tag][2]); c.classList.add('wrt-on'); c.title = TC[t.tag][1]; }
      if (o.highlight && o.highlight.indexOf(i) >= 0) c.classList.add('wrt-hi');
      c.appendChild(lab);
      if (live) {
        c.type = 'button'; c.setAttribute('aria-pressed', 'false'); c.setAttribute('aria-label', t.w);
        c.addEventListener('click', function () { F.say(''); clear(); if (mode === 'find') { picked[i] = !picked[i]; paint(); } else { var k = pal.get(); if (!k) { F.say('Choose a label first.'); return; } picked[i] = picked[i] === k ? undefined : k; paint(); } });
        c.addEventListener('keydown', function (e) { var n = parseInt(e.key, 10); if (pal && !isNaN(n) && n >= 1) { var k = pal.byIndex(n - 1); if (k) { e.preventDefault(); pal.set(k); picked[i] = k; paint(); } } });
      }
      line.appendChild(c); return c;
    });
    function clear() { chips.forEach(function (c) { c.classList.remove('ok', 'no'); }); }
    function paint() {
      chips.forEach(function (c, i) {
        var k = picked[i], lab = c.querySelector('.wrt-lab');
        if (mode === 'find') { c.classList.toggle('wrt-sel', !!k); c.setAttribute('aria-pressed', String(!!k)); return; }
        c.classList.toggle('wrt-on', !!k); c.style.setProperty('--tc', k ? TC[k][2] : ''); lab.textContent = k ? abbrOf(k) : '';
        c.setAttribute('aria-label', T[i].w + (k ? ', ' + TC[k][1] : ''));
      });
    }
    if (mode === 'show' && !F.quiet) {
      var used = TS.filter(function (t) { return T.some(function (w, i) { return w.tag === t[0] && (!only || only.indexOf(i) >= 0); }); });
      if (used.length) F.body.insertAdjacentHTML('beforeend', legendHTML(used));
    }
    if (live) {
      btn(F.ctl, 'Check', function () {
        clear(); var miss = 0, extra = 0;
        T.forEach(function (t, i) {
          if (mode === 'find') { var want = t.tag === o.ask || (Array.isArray(o.ask) && o.ask.indexOf(t.tag) >= 0); if (want !== !!picked[i]) { miss++; chips[i].classList.add('no'); } else if (want) chips[i].classList.add('ok'); }
          else if (t.tag && (!o.tags || o.tags.indexOf(t.tag) >= 0)) { if (picked[i] === t.tag) chips[i].classList.add('ok'); else { miss++; chips[i].classList.add('no'); } }
          else if (picked[i]) { extra++; chips[i].classList.add('no'); }
        });
        F.say(miss + extra ? okMark(false) + ' ' + plural(miss + extra, 'word') + ' to look at again (marked in red).' : okMark(true) + ' All right.' + (o.why ? ' ' + o.why : ''));
      }, 'pri');
      btn(F.ctl, 'Show me', function () { clear(); T.forEach(function (t, i) { picked[i] = mode === 'find' ? (t.tag === o.ask || (Array.isArray(o.ask) && o.ask.indexOf(t.tag) >= 0)) : (t.tag && (!o.tags || o.tags.indexOf(t.tag) >= 0) ? t.tag : undefined); }); paint(); F.say(o.why || 'Here are the labels.'); });
      btn(F.ctl, 'Clear', function () { picked = {}; clear(); paint(); F.say(''); });
    }
    F.speak(function () { return T.map(function (t) { return t.pre + t.w + t.post; }).join(' '); });
    return {};
  });

  /* ---------- wr-sentence: the structure of a sentence (subject and predicate, clauses, phrases, links) ---------- */
  var PART_KINDS = {
    subj: { label: 'complete subject', color: '#1c6fd6' }, pred: { label: 'complete predicate', color: '#c92a2a' },
    ind: { label: 'independent clause', color: '#2b8a3e' }, dep: { label: 'dependent clause', color: '#b8650b', dash: true },
    phrase: { label: 'phrase', color: '#7048e8' }, mod: { label: 'modifier', color: '#0c8599' }, app: { label: 'appositive', color: '#c2255c' },
    verbal: { label: 'verbal phrase', color: '#7048e8' }, frag: { label: 'fragment', color: '#c92a2a', dash: true }
  };
  WR.PART_KINDS = PART_KINDS;
  V.register('wr-sentence', function (el, o) {
    var F = frame(el, o, 'sentence', 'The parts of a sentence');
    var T = wordsOf(o), parts = (o.parts || []).map(function (p) { return Object.assign({}, p); }), mode = o.mode || 'show';
    var live = F.interactive && !F.quiet && (mode === 'split' || mode === 'find');
    // levels so that overlapping parts sit on different lines (outer parts lower)
    parts.sort(function (a, b) { return (a.to - a.from) - (b.to - b.from); });
    // a part's label needs room too: count it as reaching over as many words as its label is long
    // (widths measured in px with the CSS fonts: the label at .64rem bold, each word at 1.05rem Georgia plus its padding and space)
    parts.forEach(function (p) { var lab = p.label || (PART_KINDS[p.kind] || {}).label || '', need = measure(lab, '700 10.24px system-ui,sans-serif') * 1.04 + 12, have = 0, j = p.from; while (j < T.length) { have += measure(T[j].pre + T[j].w + T[j].post, '500 16.8px Georgia,serif') + 14; if (have >= need) break; j++; } p.reach = M.max(p.to, M.min(j, T.length - 1)); });
    parts.forEach(function (p, k) { var lv = 0; while (parts.slice(0, k).some(function (q) { return q.lv === lv && !(q.reach < p.from || q.from > p.reach); })) lv++; p.lv = lv; });
    var maxLv = parts.reduce(function (m, p) { return M.max(m, p.lv + 1); }, 0);
    if (live && mode === 'split') F.body.appendChild(h('p', 'wrv-hint', o.prompt || 'Tap the first word of the complete predicate. Then Check.'));
    if (live && mode === 'find') F.body.appendChild(h('p', 'wrv-hint', o.prompt || 'Tap the words, then Check.'));
    var wrap = h('div', 'wrsn-wrap'); F.body.appendChild(wrap);
    var line = h('div', 'wrsn-line'); line.style.setProperty('--lv', M.max(maxLv, mode === 'split' ? 1 : 0)); wrap.appendChild(line);
    var overlay = sv('svg', { class: 'wrsn-links', 'aria-hidden': 'true' }); wrap.appendChild(overlay);
    var split = null, picked = {};
    var cells = T.map(function (t, i) {
      var show = mode === 'show' && !F.quiet;
      var cell = h('span', 'wrsn-cell');
      var role = o.roles && o.roles[i] && show ? '<span class="wrsn-role" style="--tc:' + colorOf(WR.ROLES, o.roles[i]) + '">' + esc((WR.ROLES[o.roles[i]] || { abbr: o.roles[i] }).abbr) + '</span>' : ((o.links || o.roles) && show ? '<span class="wrsn-role wrsn-blank"></span>' : '');
      var inner = role + '<span class="wrsn-w">' + esc(t.pre + t.w + t.post) + '</span>';
      var w = live ? h('button', 'wrsn-word', inner) : h('span', 'wrsn-word', inner);
      if (o.strike && i >= o.strike[0] && i <= o.strike[1] && show) w.classList.add('wrsn-strike');
      if (o.highlight && o.highlight.indexOf(i) >= 0 && (show || o.highlightQuiet)) w.classList.add('wrsn-hi');
      if (F.quiet && o.numbers) w.insertAdjacentHTML('beforeend', '<small class="wrsn-num">' + (i + 1) + '</small>');
      cell.appendChild(w);
      var bands = h('span', 'wrsn-bands');
      for (var lv = 0; lv < maxLv; lv++) {
        var b = h('span', 'wrsn-band');
        parts.forEach(function (p) {
          if (p.lv !== lv || i < p.from || i > p.to || !show) return;
          var K = PART_KINDS[p.kind] || { color: '#5c6370', label: p.kind };
          b.classList.add('on'); if (K.dash) b.classList.add('dash'); if (i === p.from) b.classList.add('first'); if (i === p.to) b.classList.add('last');
          b.style.setProperty('--bc', p.color || K.color);
          if (i === p.from) b.innerHTML = '<span class="wrsn-blab">' + esc(p.label || K.label) + '</span>';
        });
        bands.appendChild(b);
      }
      cell.appendChild(bands);
      if (live) {
        w.type = 'button'; w.setAttribute('aria-pressed', 'false');
        w.addEventListener('click', function () { F.say(''); cells.forEach(function (c) { c.w.classList.remove('ok', 'no'); }); if (mode === 'split') { split = split === i ? null : i; } else picked[i] = !picked[i]; paintLive(); });
      }
      line.appendChild(cell); line.appendChild(D.createTextNode(' '));
      return { cell: cell, w: w };
    });
    function paintLive() {
      cells.forEach(function (c, i) {
        if (mode === 'split') { var on = split !== null; c.w.classList.toggle('wrsn-subj', on && i < split); c.w.classList.toggle('wrsn-pred', on && i >= split); c.w.setAttribute('aria-pressed', String(split === i)); }
        else { c.w.classList.toggle('wrsn-sel', !!picked[i]); c.w.setAttribute('aria-pressed', String(!!picked[i])); }
      });
    }
    function drawLinks() {
      overlay.innerHTML = ''; if (!o.links || F.quiet || mode !== 'show') return;
      var wr = wrap.getBoundingClientRect(); overlay.setAttribute('width', wr.width); overlay.setAttribute('height', wr.height);
      var k = V.colors();
      o.links.forEach(function (L) {
        var a = cells[L.from], b = cells[L.to]; if (!a || !b) return;
        var ra = a.w.getBoundingClientRect(), rb = b.w.getBoundingClientRect();
        var x1 = ra.left + ra.width / 2 - wr.left, y1 = ra.top - wr.top + 2, x2 = rb.left + rb.width / 2 - wr.left, y2 = rb.top - wr.top + 2;
        var lift = M.min(26, 10 + M.abs(x2 - x1) * 0.08), my = M.min(y1, y2) - lift, col = L.color ? (k[L.color] || L.color) : k.purple;
        sv('path', { d: 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + (y2 - 3), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': L.dash ? '5 4' : null }, overlay);
        sv('path', { d: 'M' + (x2 - 5) + ',' + (y2 - 9) + ' L' + x2 + ',' + (y2 - 1) + ' L' + (x2 + 5) + ',' + (y2 - 9), fill: 'none', stroke: col, 'stroke-width': 2 }, overlay);
        if (L.label) { var t = sv('text', { x: (x1 + x2) / 2, y: my + 4, 'text-anchor': 'middle', class: 'wrsn-ltext', fill: col }, overlay); t.textContent = L.label; }
      });
    }
    if (o.links) { wrap.classList.add('wrsn-haslinks'); W.requestAnimationFrame(drawLinks); onResize(wrap, drawLinks); V.onTheme(drawLinks); }
    if (mode === 'show' && !F.quiet && o.legend !== false && parts.length) {
      var kinds = parts.map(function (p) { return p.kind; }).filter(function (k, i, a) { return a.indexOf(k) === i && PART_KINDS[k]; });
      if (o.legend) F.body.insertAdjacentHTML('beforeend', legendHTML(kinds.map(function (k) { return [k, PART_KINDS[k].label, PART_KINDS[k].color]; })));
    }
    if (o.note && mode === 'show' && !F.quiet) F.body.appendChild(h('p', 'wrv-note', o.note));
    if (live) {
      btn(F.ctl, 'Check', function () {
        if (mode === 'split') {
          if (split === null) { F.say('Tap a word first.'); return; }
          var ok = split === o.split; cells[split].w.classList.add(ok ? 'ok' : 'no');
          F.say(ok ? okMark(true) + ' Right. ' + (o.why || '') : okMark(false) + (split < o.split ? ' The subject goes on a little longer. Who or what is the sentence about?' : ' Some of those words still belong to the subject.'));
        } else {
          var want = o.answer || [], miss = 0;
          cells.forEach(function (c, i) { var w = want.indexOf(i) >= 0, g = !!picked[i]; if (w !== g) { miss++; c.w.classList.add('no'); } else if (w) c.w.classList.add('ok'); });
          F.say(miss ? okMark(false) + ' ' + plural(miss, 'word') + ' to look at again.' : okMark(true) + ' Right. ' + (o.why || ''));
        }
      }, 'pri');
      btn(F.ctl, 'Show me', function () { if (mode === 'split') split = o.split; else (o.answer || []).forEach(function (i) { picked[i] = true; }); paintLive(); F.say(o.why || ''); });
    }
    F.speak(function () { return T.map(function (t) { return t.pre + t.w + t.post; }).join(' '); });
    return {};
  });

  /* ---------- wr-punct: add or fix punctuation and capital letters ---------- */
  function punctTokens(s) { // words with their trailing marks; leading quotes and parentheses stay with the word
    return String(s).trim().split(/\s+/).filter(Boolean).map(function (t) {
      var m = t.match(/^(.*?[A-Za-z0-9’'\)\]”"]?)([.,!?;:—]*)$/), core = m ? m[1] : t, tail = m ? m[2] : '';
      if (!core) { core = t; tail = ''; }
      return { w: core, g: tail };
    });
  }
  function punctJoin(T) { return T.map(function (t) { return t.w + t.g; }).join(' ').replace(/—\s+/g, '—'); }
  function normP(s) { return String(s).replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/\s*—\s*/g, '—').replace(/\s+/g, ' ').trim(); }
  WR.punctTokens = punctTokens; WR.punctJoin = punctJoin;
  V.register('wr-punct', function (el, o) {
    var F = frame(el, o, 'punct', 'A sentence to punctuate');
    var start = punctTokens(o.text || ''), T = start.map(function (t) { return { w: t.w, g: t.g }; });
    var answers = (Array.isArray(o.answer) ? o.answer : o.answer ? [o.answer] : []);
    var mode = o.mode || (answers.length ? 'fix' : 'show'), live = F.interactive && !F.quiet && mode === 'fix';
    var marks = o.marks || [',', '.', '?', '!'], caps = o.caps !== false, alts = o.alts || {};
    if (live) F.body.appendChild(h('p', 'wrv-hint', o.hint || ('Tap a space between words to choose a mark' + (caps ? '; tap a word to switch its capital letter' : '') + '. Then Check.')));
    var line = h('div', 'wrpn-line' + (o.big ? ' wrpn-big' : '')); F.body.appendChild(line);
    var menu = h('div', 'wrpn-menu'); menu.hidden = true; menu.setAttribute('role', 'menu'); F.body.appendChild(menu);
    var target = mode === 'show' && answers[0] ? punctTokens(answers[0]) : null;
    function render() {
      line.innerHTML = '';
      T.forEach(function (t, i) {
        var wcls = 'wrpn-w', gcls = 'wrpn-g';
        if (target && target[i]) { if (target[i].w !== start[i].w) wcls += ' wrpn-chg'; if (target[i].g !== start[i].g) gcls += target[i].g ? ' wrpn-add' : ' wrpn-del'; }
        var shownW = target && target[i] ? target[i].w : t.w, shownG = target && target[i] ? (target[i].g || (start[i].g && start[i].g !== target[i].g ? start[i].g : '')) : t.g;
        var we = live && (caps || alts[i]) ? h('button', wcls, esc(shownW)) : h('span', wcls, esc(shownW));
        if (live && (caps || alts[i])) { we.type = 'button'; we.setAttribute('aria-label', 'Word ' + (i + 1) + ': ' + t.w + (alts[i] ? ', tap to change its form' : ', tap to switch the capital letter')); we.addEventListener('click', function () { cycleWord(i); }); }
        line.appendChild(we);
        var gap = live ? h('button', gcls, esc(shownG) || '<span class="wrpn-dot" aria-hidden="true"></span>') : h('span', gcls, esc(shownG));
        if (F.quiet && o.gaps && o.gaps.indexOf(i) >= 0) { gap.innerHTML = '<span class="wrpn-gapn">' + (o.gaps.indexOf(i) + 1) + '</span>'; gap.classList.add('wrpn-num'); }
        if (live) { gap.type = 'button'; gap.setAttribute('aria-label', 'Mark after “' + t.w + '”: ' + (t.g || 'none')); gap.setAttribute('aria-haspopup', 'menu'); gap.addEventListener('click', function (e) { openMenu(i, gap); e.stopPropagation(); }); }
        line.appendChild(gap);
        if (i < T.length - 1) line.appendChild(D.createTextNode(' '));
      });
    }
    function cycleWord(i) {
      F.say(''); var t = T[i];
      if (alts[i]) { var L = alts[i], k = L.indexOf(t.w); t.w = L[(k + 1) % L.length]; }
      else { var c = t.w.match(/[A-Za-z]/); if (c) { var j = t.w.indexOf(c[0]); t.w = t.w.slice(0, j) + (c[0] === c[0].toUpperCase() ? c[0].toLowerCase() : c[0].toUpperCase()) + t.w.slice(j + 1); } }
      render(); var b = line.querySelectorAll('.wrpn-w')[i]; if (b) b.focus();
    }
    var menuFor = -1;
    function openMenu(i, gapEl) {
      F.say(''); menuFor = i; menu.innerHTML = '';
      [''].concat(marks).forEach(function (m) {
        var b = btn(menu, m === '' ? 'none' : esc(m), function () { T[i].g = m; menu.hidden = true; render(); var g = line.querySelectorAll('.wrpn-g')[i]; if (g) g.focus(); }, 'wrpn-opt' + (T[i].g === m ? ' on' : ''));
        b.setAttribute('role', 'menuitem'); b.setAttribute('aria-label', m === '' ? 'no mark' : ({ ',': 'comma', '.': 'period', '?': 'question mark', '!': 'exclamation point', ';': 'semicolon', ':': 'colon', '—': 'dash' }[m] || m));
      });
      menu.hidden = false;
      var br = F.body.getBoundingClientRect(), gr = gapEl.getBoundingClientRect();
      menu.style.left = M.max(0, M.min(br.width - menu.offsetWidth, gr.left - br.left - 20)) + 'px'; menu.style.top = (gr.bottom - br.top + 4) + 'px';
      var f = menu.querySelector('.on') || menu.firstChild; if (f) f.focus();
    }
    menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') { menu.hidden = true; var g = line.querySelectorAll('.wrpn-g')[menuFor]; if (g) g.focus(); } });
    D.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) menu.hidden = true; });
    render();
    if (mode === 'show' && target && !F.quiet && o.note !== false) F.body.appendChild(h('p', 'wrv-note', o.note || 'Green marks were added; red ones were taken out; changed capitals are underlined.'));
    if (live) {
      btn(F.ctl, 'Check', function () {
        menu.hidden = true; var now = normP(punctJoin(T)), hit = answers.some(function (a) { return normP(a) === now; });
        line.querySelectorAll('.wrpn-w,.wrpn-g').forEach(function (x) { x.classList.remove('ok', 'no'); });
        if (hit) { F.say(okMark(true) + ' Right: ' + esc(punctJoin(T)) + (o.why ? ' ' + o.why : '')); return; }
        var A = punctTokens(answers[0] || ''), miss = 0;
        if (A.length === T.length) {
          var ws = line.querySelectorAll('.wrpn-w'), gs = line.querySelectorAll('.wrpn-g');
          T.forEach(function (t, i) { if (t.w !== A[i].w) { ws[i].classList.add('no'); miss++; } if (normP(t.g) !== normP(A[i].g)) { gs[i].classList.add('no'); miss++; } });
        }
        F.say(okMark(false) + (miss ? ' ' + plural(miss, 'place') + ' to look at again (marked in red).' : ' Not yet. Read it aloud and listen for the pauses and stops.'));
      }, 'pri');
      btn(F.ctl, 'Show me', function () { menu.hidden = true; T = punctTokens(answers[0]); render(); F.say(o.why || 'Here is one right way.'); });
      btn(F.ctl, 'Start over', function () { menu.hidden = true; T = start.map(function (t) { return { w: t.w, g: t.g }; }); render(); F.say(''); });
    }
    F.speak(function () { return punctJoin(target || T); });
    return { text: function () { return punctJoin(T); } };
  });

  /* ---------- wr-combine: join short sentences ---------- */
  V.register('wr-combine', function (el, o) {
    var F = frame(el, o, 'combine', 'Joining sentences');
    var parts = o.parts || [], joins = o.joins || [], mode = o.mode || (joins.length ? 'build' : 'show');
    var cards = h('div', 'wrcb-cards'); F.body.appendChild(cards);
    parts.forEach(function (p, i) { cards.appendChild(h('div', 'wrcb-card', '<b>' + letter(i) + '</b> ' + esc(p))); });
    var arrow = h('div', 'wrcb-arrow', '<span aria-hidden="true">↓</span>'); F.body.appendChild(arrow);
    var result = h('div', 'wrcb-result'); F.body.appendChild(result);
    function hl(text, join) { // highlight the joining words in the result
      var t = esc(text); if (!join) return t;
      var j = esc(join).trim(); var k = t.indexOf(j); if (k < 0) k = t.toLowerCase().indexOf(j.toLowerCase());
      return k < 0 ? t : t.slice(0, k) + '<mark class="wrcb-join">' + t.slice(k, k + j.length) + '</mark>' + t.slice(k + j.length);
    }
    if (mode === 'show' || F.quiet) {
      if (o.result && !F.quiet) result.innerHTML = hl(o.result, o.join);
      else result.hidden = arrow.hidden = true;
      return {};
    }
    result.innerHTML = '<span class="wrcb-empty">Choose a way to join them.</span>';
    F.body.appendChild(h('p', 'wrv-hint', o.prompt || 'Try each way to join the sentences. Which ones are right?'));
    var row = h('div', 'wrv-choices'); F.body.appendChild(row);
    joins.forEach(function (j) {
      var b = btn(row, esc(j.label), function () {
        row.querySelectorAll('.ml-btn').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true');
        result.innerHTML = hl(j.make, j.join || j.label.replace(/^[,;:]\s*/, ''));
        result.classList.toggle('ok', !!j.ok); result.classList.toggle('no', !j.ok);
        F.say((j.ok ? okMark(true) + ' This works. ' : okMark(false) + ' This doesn’t work. ') + (j.why || ''));
      });
    });
    return {};
  });

  /* ---------- word diff for wr-revise ---------- */
  function diffWords(a, b) { // -> segments: strings and { del, ins }
    var A = a.split(/(\s+)/).filter(function (x) { return x !== ''; }), B = b.split(/(\s+)/).filter(function (x) { return x !== ''; });
    var n = A.length, m = B.length, L = [];
    for (var i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : M.max(L[i + 1][j], L[i][j + 1]);
    var out = [], del = '', ins = ''; i = 0; j = 0;
    function flush() { if (del || ins) { out.push({ del: del, ins: ins }); del = ins = ''; } }
    while (i < n && j < m) {
      if (A[i] === B[j]) { flush(); out.push(A[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { del += A[i]; i++; } else { ins += B[j]; j++; }
    }
    while (i < n) del += A[i++]; while (j < m) ins += B[j++]; flush();
    // tidy: spaces inside an edit move out
    return out.map(function (s) { if (typeof s === 'string') return s; var d = s.del.replace(/\s+$/, ''), e = s.ins.replace(/\s+$/, ''); return { del: d, ins: e, sp: /\s$/.test(s.del) || /\s$/.test(s.ins) }; }).reduce(function (acc, s) { acc.push(s); if (typeof s !== 'string' && s.sp) acc.push(' '); return acc; }, []);
  }
  WR.diffWords = diffWords;

  /* ---------- wr-revise: before and after, with tracked changes ---------- */
  V.register('wr-revise', function (el, o) {
    var F = frame(el, o, 'revise', 'A revision with tracked changes');
    var segs = o.segments || (o.before != null ? diffWords(o.before, o.after || '') : []);
    var edits = segs.filter(function (s) { return typeof s !== 'string'; });
    var mode = o.mode || 'show', view = o.view || 'tracked', step = mode === 'steps' ? 0 : edits.length, accept = edits.map(function () { return null; });
    var live = F.interactive && !F.quiet;
    if (o.title) F.body.appendChild(h('p', 'wro-title', esc(o.title)));
    var box = h('div', 'wrr-text'); F.body.appendChild(box);
    var why = h('ol', 'wrr-why'); if (!F.quiet && mode !== 'accept' && edits.some(function (e) { return e.why; })) F.body.appendChild(why);
    function render() {
      var k = -1; box.innerHTML = ''; why.innerHTML = '';
      segs.forEach(function (s) {
        if (typeof s === 'string') { box.appendChild(D.createTextNode(s)); return; }
        k++; var applied = k < step, idx = k;
        if (mode === 'accept') {
          var span = h('span', 'wrr-edit wrr-ask' + (accept[k] === true ? ' acc' : accept[k] === false ? ' rej' : ''));
          span.innerHTML = (s.del ? '<del>' + esc(s.del) + '</del>' : '') + (s.ins ? '<ins>' + esc(s.ins) + '</ins>' : '') + '<sup>' + (k + 1) + '</sup>';
          box.appendChild(span);
          return;
        }
        if (view === 'original' || (!applied && mode === 'steps')) { box.appendChild(D.createTextNode(s.del || '')); return; }
        if (view === 'final') { box.appendChild(D.createTextNode(s.ins || '')); return; }
        var sp = h('span', 'wrr-edit' + (mode === 'steps' && k === step - 1 ? ' now' : ''));
        sp.innerHTML = (s.del ? '<del>' + esc(s.del) + '</del>' : '') + (s.ins ? '<ins>' + esc(s.ins) + '</ins>' : '') + (s.why && !F.quiet ? '<sup>' + (k + 1) + '</sup>' : '');
        box.appendChild(sp);
        if (s.why && !F.quiet && applied) why.appendChild(h('li', '', s.why));
        void idx;
      });
      why.hidden = !why.children.length;
      // an edit shown as nothing (an insertion not made yet, or a cut) would leave two spaces side by side: keep one
      var sp = false; [].forEach.call(box.childNodes, function (n) { if (n.nodeType === 3) { if (sp && n.data.charAt(0) === ' ') n.data = n.data.slice(1); if (n.data) sp = n.data.slice(-1) === ' '; } else if (n.textContent) sp = n.textContent.slice(-1) === ' '; });
    }
    if (mode === 'show' && !F.quiet && live && o.toggle !== false) V.seg(F.ctl, { label: 'View', items: [['tracked', 'Changes'], ['original', 'Before'], ['final', 'After']], value: view, change: function (v) { view = v; render(); } });
    if (mode === 'steps' && live) {
      var back = btn(F.ctl, '◀ Back', function () { if (step > 0) { step--; render(); upd(); } }), next = btn(F.ctl, 'Next edit ▶', function () { if (step < edits.length) { step++; render(); upd(); } }, 'pri');
      var cnt = h('span', 'wrv-count'); F.ctl.appendChild(cnt);
      var upd = function () { back.disabled = step === 0; next.disabled = step === edits.length; cnt.textContent = step + ' of ' + edits.length + ' edits'; F.say(step && edits[step - 1].why ? '<b>Edit ' + step + ':</b> ' + edits[step - 1].why : ''); };
      upd();
    }
    if (mode === 'accept' && live) {
      F.body.insertBefore(h('p', 'wrv-hint', o.prompt || 'Accept the edits that improve the writing and reject the ones that don’t. Then Check.'), box);
      var list = h('div', 'wrr-acc'); F.body.appendChild(list);
      edits.forEach(function (e, k) {
        var r = h('div', 'wrr-accrow', '<span class="wrr-n">' + (k + 1) + '</span><span class="wrr-what">' + (e.del ? '<del>' + esc(e.del) + '</del> ' : '') + (e.ins ? '→ <ins>' + esc(e.ins) + '</ins>' : '(cut)') + '</span>');
        var g = h('span', 'wrr-btns'); r.appendChild(g);
        var a = btn(g, 'Accept', function () { accept[k] = true; a.setAttribute('aria-pressed', 'true'); rj.setAttribute('aria-pressed', 'false'); render(); F.say(''); });
        var rj = btn(g, 'Reject', function () { accept[k] = false; rj.setAttribute('aria-pressed', 'true'); a.setAttribute('aria-pressed', 'false'); render(); F.say(''); });
        list.appendChild(r);
      });
      btn(F.ctl, 'Check', function () {
        if (accept.some(function (x) { return x === null; })) { F.say('Accept or reject every edit first.'); return; }
        var wrong = edits.map(function (e, k) { return (e.good !== false) === accept[k] ? null : k; }).filter(function (x) { return x !== null; });
        F.say(wrong.length ? okMark(false) + ' Look again at edit ' + wrong.map(function (k) { return k + 1; }).join(', ') + '.' + (edits[wrong[0]].why ? ' ' + edits[wrong[0]].why : '') : okMark(true) + ' Right.' + (o.why ? ' ' + o.why : ''));
      }, 'pri');
    }
    render();
    return {};
  });

  /* ---------- wr-compare: an original passage beside a paraphrase or summary ---------- */
  V.register('wr-compare', function (el, o) {
    var F = frame(el, o, 'compare', 'An original passage and other versions, with shared words marked');
    var min = o.min || 3, vers = o.versions || [], show = !F.quiet && o.highlight !== false;
    function marked(text, flags) { // copied words, with the spaces between copied words, in one mark per run
      var parts = String(text).split(/([A-Za-z0-9’']+)/), k = -1, out = '', open = false;
      parts.forEach(function (piece, i) {
        if (i % 2 === 1) { k++; var f = !!(flags && flags[k]); if (f && !open) { out += '<mark class="wrcp-hl">'; open = true; } if (!f && open) { out += '</mark>'; open = false; } out += esc(piece); }
        else { var nextF = flags && flags[k + 1]; if (open && !(nextF && /^[\s,;:—–-]*$/.test(piece))) { out += '</mark>'; open = false; } out += esc(piece); }
      });
      return out + (open ? '</mark>' : '');
    }
    var unionA = null;
    var runs = vers.map(function (v) { var r = WR.sharedRuns(o.original || '', v.text, min); if (!unionA) unionA = r.a.slice(); else r.a.forEach(function (f, i) { if (f) unionA[i] = true; }); return r; });
    var orig = h('div', 'wrcp-box wrcp-orig', '<p class="wrcp-lab">' + esc(o.originalLabel || 'Original') + (o.source ? ' <span>' + o.source + '</span>' : '') + '</p><p>' + (show ? marked(o.original || '', unionA) : esc(o.original || '')) + '</p>');
    F.body.appendChild(orig);
    var choices = o.judge || null, picks = vers.map(function () { return null; });
    var vEls = vers.map(function (v, i) {
      var r = runs[i], pct = M.round(r.share * 100);
      var d = h('div', 'wrcp-box', '<p class="wrcp-lab">' + esc(v.label || 'Version ' + letter(i)) + (show && o.percent !== false ? ' <span class="wrcp-pct">' + pct + '% of its words are in runs of ' + min + '+ copied words</span>' : '') + '</p><p>' + (show ? marked(v.text, r.b) : esc(v.text)) + '</p>' + (v.note && show && !choices ? '<p class="wrv-note">' + v.note + '</p>' : ''));
      if (choices && F.interactive && !F.quiet) {
        var row = h('div', 'wrv-choices'); d.appendChild(row);
        choices.forEach(function (c, ci) { var b = btn(row, esc(c), function () { picks[i] = ci; row.querySelectorAll('.ml-btn').forEach(function (x, xi) { x.setAttribute('aria-pressed', String(xi === ci)); }); d.classList.remove('ok', 'no'); F.say(''); }); void b; });
      }
      F.body.appendChild(d); return d;
    });
    if (show) F.body.insertAdjacentHTML('beforeend', '<p class="wrv-legend"><span><i style="background:rgba(201,42,42,.35)"></i>words copied in runs of ' + min + ' or more</span></p>');
    if (choices && F.interactive && !F.quiet) btn(F.ctl, 'Check', function () {
      if (picks.some(function (p) { return p === null; })) { F.say('Choose a label for every version first.'); return; }
      var miss = 0; vers.forEach(function (v, i) { var ok = picks[i] === v.verdict; if (!ok) miss++; vEls[i].classList.toggle('ok', ok); vEls[i].classList.toggle('no', !ok); });
      F.say(miss ? okMark(false) + ' ' + plural(miss, 'version') + ' to look at again.' + (vers.filter(function (v, i) { return picks[i] !== v.verdict && v.note; }).slice(0, 1).map(function (v) { return ' ' + v.note; }).join('')) : okMark(true) + ' Right.' + (o.why ? ' ' + o.why : ''));
    }, 'pri');
    return {};
  });
  /* ---------- wr-picture: a simple scene from SVG backdrops and emoji (people stay the standard yellow) ---------- */
  var PW = 600, PHT = 300, GY = 220, EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
  function backdrop(g, place) {
    function r(x, y, w, hh, cls, at) { return sv('rect', Object.assign({ x: x, y: y, width: w, height: hh, class: cls }, at || {}), g); }
    var P = WR.PLACES[place] || WR.PLACES.plain;
    if (place === 'night') { r(0, 0, PW, GY, 'wrb-night'); [[60, 40], [140, 90], [250, 30], [380, 70], [470, 30], [540, 110], [320, 120]].forEach(function (s) { sv('circle', { cx: s[0], cy: s[1], r: 2, class: 'wrb-star' }, g); }); r(0, GY, PW, PHT - GY, 'wrb-nightground'); return; }
    if (P.sky) r(0, 0, PW, GY, place === 'snow' ? 'wrb-snowsky' : 'wrb-sky');
    switch (place) {
      case 'beach': r(0, 150, PW, 70, 'wrb-sea'); r(0, GY - 20, PW, PHT - GY + 20, 'wrb-sand'); sv('path', { d: 'M0,' + (GY - 20) + ' q75,-12 150,0 t150,0 t150,0 t150,0', class: 'wrb-foam' }, g); break;
      case 'pond': r(0, GY - 60, PW, PHT - GY + 60, 'wrb-grass'); sv('ellipse', { cx: 360, cy: GY + 20, rx: 200, ry: 50, class: 'wrb-water' }, g); break;
      case 'farm': r(0, GY - 40, PW, PHT - GY + 40, 'wrb-field'); sv('path', { d: 'M450,180 v-70 l45,-35 l45,35 v70 z', class: 'wrb-barn' }, g); r(480, 140, 30, 40, 'wrb-barndoor'); for (var f = 0; f < 6; f++) r(20 + f * 60, GY - 30, 6, 40, 'wrb-fence'); r(10, GY - 22, 360, 5, 'wrb-fence'); break;
      case 'snow': r(0, GY - 30, PW, PHT - GY + 30, 'wrb-snow'); break;
      case 'yard': r(0, GY - 40, PW, PHT - GY + 40, 'wrb-grass'); for (var y = 0; y < 15; y++) r(10 + y * 40, GY - 90, 26, 60, 'wrb-picket', { rx: 3 }); r(0, GY - 70, PW, 6, 'wrb-picket'); break;
      case 'park': r(0, GY - 40, PW, PHT - GY + 40, 'wrb-grass'); sv('path', { d: 'M0,' + (GY + 30) + ' Q300,' + (GY - 10) + ' 600,' + (GY + 40), class: 'wrb-path' }, g); break;
      case 'kitchen': r(0, 0, PW, PHT, 'wrb-wall'); for (var t = 0; t < 12; t++) for (var u = 0; u < 3; u++) r(t * 50, 60 + u * 30, 50, 30, 'wrb-tile'); r(0, 180, PW, 120, 'wrb-counter'); r(0, 176, PW, 8, 'wrb-countertop'); break;
      case 'room': r(0, 0, PW, GY, 'wrb-wall2'); r(0, GY, PW, PHT - GY, 'wrb-floor'); r(380, 40, 140, 100, 'wrb-window', { rx: 4 }); sv('path', { d: 'M450,40 v100 M380,90 h140', class: 'wrb-frame' }, g); break;
      case 'classroom': r(0, 0, PW, GY, 'wrb-wall'); r(0, GY, PW, PHT - GY, 'wrb-floor'); r(140, 30, 320, 120, 'wrb-board', { rx: 4 }); r(140, 148, 320, 8, 'wrb-tray'); break;
      default: r(0, 0, PW, PHT, 'wrb-plain');
    }
    if (P.sky && place !== 'night' && place !== 'snow') sv('circle', { cx: 540, cy: 50, r: 0, class: 'wrb-sun' }, g);
  }
  function emojiOf(it) { if (it.e) return it.e; var a = WR.ACTORS[it.who || it.k] || WR.THINGS[it.what || it.k]; return a ? a.e : '❓'; }
  function scene(o, quiet) {
    var svg = sv('svg', { viewBox: '0 0 ' + PW + ' ' + PHT, class: 'wrpc-svg', role: 'img' });
    var g = sv('g', {}, svg); backdrop(g, o.place || 'plain');
    var desc = [];
    (o.items || []).forEach(function (it, i) {
      var x = (it.x != null ? it.x : 100 * (i + 1) / ((o.items.length || 1) + 1)) / 100 * PW, y = (it.y != null ? it.y : 70) / 100 * PHT, s = (it.s || 1) * 64;
      var gg = sv('g', { transform: 'translate(' + x + ',' + y + ')' + (it.flip ? ' scale(-1,1)' : '') }, svg);
      var t = sv('text', { x: 0, y: 0, 'text-anchor': 'middle', 'font-size': s, class: 'wrpc-e', style: 'font-family:' + EMOJI }, gg); t.textContent = emojiOf(it);
      if (it.label && !quiet) { var lb = sv('text', { x: x, y: y + 18, 'text-anchor': 'middle', class: 'wrpc-lab' }, svg); lb.textContent = it.label; }
      if (it.ask) { var q = sv('g', { class: 'wrpc-ask' }, svg); sv('circle', { cx: x + s * 0.4, cy: y - s * 0.75, r: 13 }, q); var qt = sv('text', { x: x + s * 0.4, y: y - s * 0.75 + 5, 'text-anchor': 'middle' }, q); qt.textContent = '?'; }
      var nm = it.name || (WR.ACTORS[it.who || it.k] || WR.THINGS[it.what || it.k] || {}).n; if (nm) desc.push(nm);
    });
    svg.setAttribute('aria-label', o.alt || ('A picture' + (WR.PLACES[o.place] && WR.PLACES[o.place].at ? ' ' + WR.PLACES[o.place].at : '') + (desc.length ? ': ' + desc.join(', ') : '')));
    return svg;
  }
  V.register('wr-picture', function (el, o) {
    var F = frame(el, o, 'picture', o.alt || 'A picture to write about');
    if (o.frames) {
      var strip = h('div', 'wrpc-strip'); strip.style.setProperty('--n', o.frames.length); F.body.appendChild(strip);
      o.frames.forEach(function (fr, i) {
        var cell = h('figure', 'wrpc-frame'); cell.appendChild(scene(Object.assign({ place: o.place }, fr), F.quiet));
        var lab = o.letters || F.quiet ? letter(i) : String(i + 1);
        cell.insertAdjacentHTML('afterbegin', '<span class="wrpc-num">' + lab + '</span>');
        if (fr.caption && !F.quiet) cell.appendChild(h('figcaption', '', esc(fr.caption)));
        strip.appendChild(cell);
      });
    } else {
      var pic = h('div', 'wrpc-pic'); pic.appendChild(scene(o, F.quiet)); F.body.appendChild(pic);
      if (o.sentence && !F.quiet) F.body.appendChild(h('p', 'wrpc-sent', esc(o.sentence)));
    }
    F.speak(function () { return o.sentence || o.alt || ''; });
    return {};
  });

  /* ---------- wr-tense: a timeline for the twelve tenses ---------- */
  V.register('wr-tense', function (el, o) {
    var F = frame(el, o, 'tense', 'A timeline that shows when the action happens');
    var verb = o.verb || 'walk', subj = o.subject || 'she', cur = o.tense || 'past', live = F.interactive && !F.quiet && o.pick !== false;
    var times = o.times || ['past', 'present', 'future'], aspects = o.aspects || ['simple', 'progressive', 'perfect'];
    var T0 = cur.split('-'), time = T0[0], asp = T0.slice(1).join('-') || 'simple';
    var svg = sv('svg', { viewBox: '0 0 600 160', class: 'wrtn-svg', role: 'img' }); F.body.appendChild(svg);
    var phrase = h('p', 'wrtn-phrase'); F.body.appendChild(phrase);
    var segT, segA;
    if (live) {
      segT = V.seg(F.ctl, { label: 'Time', items: times.map(function (t) { return [t, t]; }), value: time, change: function (v) { time = v; draw(); } });
      segA = V.seg(F.ctl, { label: 'Aspect', items: aspects.map(function (a) { return [a, a.replace('-', ' ')]; }), value: asp, change: function (v) { asp = v; draw(); } });
    }
    var WHEN = { past: 'yesterday', present: 'now', future: 'tomorrow' };
    function draw() {
      svg.innerHTML = ''; var k = V.colors(), key = time + (asp === 'simple' ? '' : '-' + asp);
      var X = function (t) { return 300 + t * 230; }, Y = 92;
      sv('line', { x1: 30, y1: Y, x2: 570, y2: Y, stroke: k.axis, 'stroke-width': 2 }, svg);
      sv('path', { d: 'M570,' + Y + ' l-10,-6 v12 z', fill: k.axis }, svg);
      sv('line', { x1: 300, y1: Y - 34, x2: 300, y2: Y + 14, stroke: k.ink, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, svg);
      [['past', 34, 'start'], ['now', 300, 'middle'], ['future', 566, 'end']].forEach(function (L) { var t = sv('text', { x: L[1], y: Y + 50, 'text-anchor': L[2], class: 'wrtn-lab' + (L[0] === 'now' ? ' now' : '') }, svg); t.textContent = L[0]; });
      var R = time === 'past' ? -0.5 : time === 'future' ? 0.55 : 0, col = k.red;
      if (asp !== 'simple' || time !== 'present') { /* reference point */ }
      if (time !== 'present' && (asp === 'perfect' || asp === 'perfect-progressive')) { sv('line', { x1: X(R), y1: Y - 40, x2: X(R), y2: Y + 10, stroke: k.blue, 'stroke-width': 2 }, svg); var rt = sv('text', { x: X(R), y: Y - 46, 'text-anchor': 'middle', class: 'wrtn-ref' }, svg); rt.textContent = time === 'past' ? 'a past time' : 'a future time'; }
      if (asp === 'simple') {
        if (time === 'present') { [-0.6, -0.3, 0, 0.3, 0.6].forEach(function (t) { sv('circle', { cx: X(t), cy: Y, r: 6, fill: col, opacity: t === 0 ? 1 : 0.55 }, svg); }); var hb = sv('text', { x: 300, y: Y - 44, 'text-anchor': 'middle', class: 'wrtn-ref' }, svg); hb.textContent = 'now, or as a habit'; }
        else sv('circle', { cx: X(R), cy: Y, r: 8, fill: col }, svg);
      } else if (asp === 'progressive') {
        sv('rect', { x: X(R) - 55, y: Y - 9, width: 110, height: 18, rx: 9, fill: k.redSoft, stroke: col, 'stroke-width': 2 }, svg);
        sv('path', { d: 'M' + (X(R) - 45) + ',' + Y + ' q8,-7 16,0 t16,0 t16,0 t16,0 t16,0 t10,0', fill: 'none', stroke: col, 'stroke-width': 2 }, svg);
        var it = sv('text', { x: X(R), y: Y - 20, 'text-anchor': 'middle', class: 'wrtn-ref' }, svg); it.textContent = 'in progress';
      } else if (asp === 'perfect') {
        var ex = X(R) - 100; sv('circle', { cx: ex, cy: Y, r: 8, fill: col }, svg);
        sv('path', { d: 'M' + (ex + 10) + ',' + (Y - 8) + ' Q' + ((ex + X(R)) / 2) + ',' + (Y - 40) + ' ' + (X(R) - 6) + ',' + (Y - 10), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg);
        sv('path', { d: 'M' + (X(R) - 6) + ',' + (Y - 10) + ' l-9,-2 l5,-7 z', fill: col }, svg);
        var dn = sv('text', { x: ex, y: Y + 26, 'text-anchor': 'start', class: 'wrtn-ref', dx: -8 }, svg); dn.textContent = time === 'present' ? 'done before now' : 'done before then';
      } else {
        sv('rect', { x: X(R) - 140, y: Y - 9, width: 140, height: 18, rx: 9, fill: k.redSoft, stroke: col, 'stroke-width': 2 }, svg);
        var dur = sv('text', { x: X(R) - 70, y: Y - 18, 'text-anchor': 'middle', class: 'wrtn-ref' }, svg); dur.textContent = time === 'present' ? 'going on up to now' : 'going on up to then';
      }
      var vp = WR.conj(verb, key, subj), Tn = WR.TENSES.filter(function (t) { return t.key === key; })[0];
      svg.setAttribute('aria-label', 'Timeline for the ' + (Tn ? Tn.label : key) + (F.quiet ? '' : ': ' + subj + ' ' + vp));
      phrase.innerHTML = F.quiet ? '' : '<span class="wrtn-name">' + esc(Tn ? Tn.label : key) + '</span> <span class="wrtn-vp">' + esc(WR.cap(subj) + ' ' + vp + (o.rest ? ' ' + o.rest : '')) + '.</span>';
      phrase.hidden = F.quiet;
      void WHEN;
    }
    draw(); V.onTheme(draw);
    return {};
  });

  /* ---------- wr-triangle: the rhetorical situation ---------- */
  V.register('wr-triangle', function (el, o) {
    var F = frame(el, o, 'triangle', 'The rhetorical situation: writer, audience and message inside a context');
    var fill = o.fill || {}, show = !F.quiet, hi = o.highlight || null, appeals = o.appeals !== false;
    var svg = sv('svg', { viewBox: '0 0 600 430', class: 'wrtr-svg', role: 'img' }); F.body.appendChild(svg);
    function draw() {
      svg.innerHTML = ''; var k = V.colors(), ap = appeals && show;
      sv('rect', { x: 6, y: 6, width: 588, height: 418, rx: 26, fill: hi === 'context' ? k.goldSoft : 'none', stroke: k.gold, 'stroke-width': hi === 'context' ? 3 : 2, 'stroke-dasharray': '7 5' }, svg);
      var ct = sv('text', { x: 26, y: 34, class: 'wrtr-ctx' }, svg); ct.textContent = 'Context: ' + (fill.context || 'time, place and occasion' + (o.kairos ? ' (kairos)' : ''));
      var A = [300, 128], B = [100, 318], C = [500, 318];
      sv('path', { d: 'M' + A + ' L' + B + ' L' + C + ' Z', fill: k.panel, stroke: k.ink, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
      var pt = sv('text', { x: 300, y: 262, 'text-anchor': 'middle', class: 'wrtr-purp' }, svg); pt.textContent = 'Purpose';
      var pf = sv('text', { x: 300, y: 284, 'text-anchor': 'middle', class: 'wrtr-small' }, svg); pf.textContent = fill.purpose || 'Why write? What should change?';
      function corner(p, title, sub, appeal, ty, anchor) {
        var col = { ethos: k.blue, pathos: k.pink, logos: k.green }[appeal];
        sv('circle', { cx: p[0], cy: p[1], r: hi === appeal ? 13 : 9, fill: col }, svg);
        var t = sv('text', { x: p[0], y: ty, 'text-anchor': anchor, class: 'wrtr-title' }, svg); t.textContent = title;
        var s2 = sv('text', { x: p[0], y: ty + 19, 'text-anchor': anchor, class: 'wrtr-small' }, svg); s2.textContent = sub;
        if (ap) { var a = sv('text', { x: p[0], y: ty + 39, 'text-anchor': anchor, class: 'wrtr-app' + (hi === appeal ? ' hi' : ''), fill: col }, svg); a.textContent = appeal + ' (' + { ethos: 'character', pathos: 'emotion', logos: 'reasoning' }[appeal] + ')'; }
      }
      corner(A, 'Message', fill.message || 'what is said, and how', 'logos', ap ? 60 : 80, 'middle');
      corner(B, 'Writer', fill.writer || 'who writes or speaks', 'ethos', 350, 'start');
      corner(C, 'Audience', fill.audience || 'who reads or listens', 'pathos', 350, 'end');
      svg.setAttribute('aria-label', 'The rhetorical triangle: the writer (ethos), the audience (pathos) and the message (logos), with the purpose in the middle and the context around it' + (fill.writer ? '. Writer: ' + fill.writer : '') + (fill.audience ? '. Audience: ' + fill.audience : '') + (fill.purpose ? '. Purpose: ' + fill.purpose : ''));
    }
    draw(); V.onTheme(draw);
    return {};
  });
  /* ---------- wr-toulmin: claim, grounds, warrant, backing, qualifier, rebuttal ---------- */
  var TOUL_ORDER = ['grounds', 'qualifier', 'claim', 'warrant', 'backing', 'rebuttal'];
  var TOUL_LINK = { qualifier: 'so,', warrant: 'since', backing: 'because', rebuttal: 'unless' };
  V.register('wr-toulmin', function (el, o) {
    var F = frame(el, o, 'toulmin', 'A Toulmin diagram of an argument');
    var T = WR.TOULMIN, mode = o.mode || 'show', present = TOUL_ORDER.filter(function (k) { return o[k]; });
    var live = F.interactive && !F.quiet && (mode === 'label' || mode === 'steps');
    var grid = h('div', 'wrtm-grid'); F.body.appendChild(grid);
    var pal = null, picked = {}, step = mode === 'steps' ? 1 : present.length;
    var reveal = ['grounds', 'claim', 'warrant', 'backing', 'qualifier', 'rebuttal'].filter(function (k) { return o[k]; });
    if (live && mode === 'label') { F.body.insertBefore(h('p', 'wrv-hint', 'Choose a part, then tap the box it names. Then Check.'), grid); pal = palette(F.body, present.map(function (k) { return [k, T[k].label, T[k].color]; }), { label: 'Parts of the argument' }); F.body.insertBefore(pal.el, grid); }
    var boxes = {};
    TOUL_ORDER.forEach(function (k, i) {
      var cell = h('div', 'wrtm-cell wrtm-' + k); grid.appendChild(cell);
      if (!o[k]) { cell.classList.add('wrtm-none'); if (k === 'qualifier') cell.innerHTML = '<span class="wrtm-arrow" aria-hidden="true"></span>'; return; }
      var inner = '<span class="wrtm-role"></span><span class="wrtm-text">' + esc(o[k]) + '</span>';
      var b = mode === 'label' && live ? h('button', 'wrtm-box', inner) : h('div', 'wrtm-box', inner);
      if (b.tagName === 'BUTTON') { b.type = 'button'; b.addEventListener('click', function () { var r = pal.get(); if (!r) { F.say('Choose a part first.'); return; } picked[k] = picked[k] === r ? undefined : r; F.say(''); paint(); }); }
      cell.appendChild(b); boxes[k] = b;
      if (TOUL_LINK[k]) cell.insertAdjacentHTML('afterbegin', '<span class="wrtm-link">' + TOUL_LINK[k] + '</span>');
      void i;
    });
    function paint() {
      Object.keys(boxes).forEach(function (k, idx) {
        var b = boxes[k], role = b.querySelector('.wrtm-role'), shown;
        if (mode === 'label') shown = picked[k];
        else shown = F.quiet ? null : k;
        b.classList.remove('ok', 'no');
        b.style.setProperty('--rc', shown ? T[shown].color : 'var(--mv-line)');
        role.textContent = F.quiet ? letter(TOUL_ORDER.filter(function (x) { return o[x]; }).indexOf(k)) : shown ? T[shown].label : (mode === 'label' ? '?' : '');
        var hidden = mode === 'steps' && reveal.indexOf(k) >= step;
        b.parentNode.classList.toggle('wrtm-hidden', hidden);
        void idx;
      });
      grid.classList.toggle('wrtm-quiet', F.quiet);
    }
    paint();
    if (live && mode === 'steps') {
      var back = btn(F.ctl, '◀ Back', function () { if (step > 1) { step--; paint(); upd(); } }), next = btn(F.ctl, 'Next ▶', function () { if (step < reveal.length) { step++; paint(); upd(); } }, 'pri');
      var upd = function () { back.disabled = step <= 1; next.disabled = step >= reveal.length; var k = reveal[step - 1]; F.say('<b>' + T[k].label + ':</b> ' + T[k].q); };
      upd();
    }
    if (live && mode === 'label') {
      btn(F.ctl, 'Check', function () {
        var miss = 0; Object.keys(boxes).forEach(function (k) { var ok = picked[k] === k; if (!ok) miss++; boxes[k].classList.add(ok ? 'ok' : 'no'); });
        F.say(miss ? okMark(false) + ' ' + plural(miss, 'box', 'boxes') + ' to look at again.' + (picked.warrant === 'grounds' || picked.grounds === 'warrant' ? ' The grounds are the specific evidence; the warrant is the general rule that connects it to the claim.' : '') : okMark(true) + ' Every part is labeled right.' + (o.why ? ' ' + o.why : ''));
      }, 'pri');
      btn(F.ctl, 'Show me', function () { Object.keys(boxes).forEach(function (k) { picked[k] = k; }); paint(); F.say(o.why || ''); });
    }
    if (mode === 'show' && !F.quiet && o.questions !== false) F.body.insertAdjacentHTML('beforeend', '<dl class="wrtm-qs">' + present.map(function (k) { return '<div><dt style="--rc:' + T[k].color + '">' + T[k].label + '</dt><dd>' + T[k].q + '</dd></div>'; }).join('') + '</dl>');
    return {};
  });

  /* ---------- wr-essay: the map of an essay ---------- */
  var ESSAYS = {
    five: [
      { role: 'intro', title: 'Introduction', lines: [['hook', 'Hook: a question, a scene or a surprising fact'], ['context', 'Context the reader needs'], ['thesis', 'Thesis: the main claim, with three reasons']] },
      { role: 'body', title: 'Body paragraph 1', lines: [['topic', 'Topic sentence: reason 1'], ['evidence', 'Evidence'], ['commentary', 'Explanation: how it supports the thesis']] },
      { role: 'body', title: 'Body paragraph 2', lines: [['topic', 'Topic sentence: reason 2'], ['evidence', 'Evidence'], ['commentary', 'Explanation']] },
      { role: 'body', title: 'Body paragraph 3', lines: [['topic', 'Topic sentence: reason 3'], ['evidence', 'Evidence'], ['commentary', 'Explanation']] },
      { role: 'conclusion', title: 'Conclusion', lines: [['thesis', 'The thesis, in new words'], ['conclusion', 'Why it matters: the larger meaning or a next step']] }
    ],
    argument: [
      { role: 'intro', title: 'Introduction', lines: [['hook', 'Hook and context'], ['thesis', 'Defensible thesis']] },
      { role: 'body', title: 'Reason 1', lines: [['topic', 'Claim for this section'], ['evidence', 'Evidence'], ['commentary', 'Commentary that links the evidence to the claim']] },
      { role: 'body', title: 'Reason 2 (often a longer section)', lines: [['topic', 'Claim for this section'], ['evidence', 'Evidence, maybe from two sources'], ['commentary', 'Commentary']] },
      { role: 'counter', title: 'The other side', lines: [['counter', 'The strongest opposing view, stated fairly'], ['rebuttal', 'Concession and rebuttal']] },
      { role: 'conclusion', title: 'Conclusion', lines: [['thesis', 'What the argument has shown'], ['conclusion', 'Why it matters now']] }
    ],
    classical: [
      { role: 'intro', title: 'Exordium (introduction)', lines: [['hook', 'Win the audience’s attention and goodwill']] },
      { role: 'context', title: 'Narratio (background)', lines: [['context', 'The facts and history of the issue']] },
      { role: 'intro', title: 'Partitio (division)', lines: [['thesis', 'The claim, and the points to come']] },
      { role: 'body', title: 'Confirmatio (proof)', lines: [['evidence', 'Reasons and evidence, the strongest last or first']] },
      { role: 'counter', title: 'Refutatio (refutation)', lines: [['counter', 'Opposing views'], ['rebuttal', 'Answers to them']] },
      { role: 'conclusion', title: 'Peroratio (conclusion)', lines: [['conclusion', 'Sum up and move the audience']] }
    ],
    analysis: [
      { role: 'intro', title: 'Introduction', lines: [['context', 'The writer, the text, the audience and the occasion'], ['thesis', 'Thesis: the purpose and the main strategies']] },
      { role: 'body', title: 'Strategy 1 (or the text’s first section)', lines: [['topic', 'What the writer does first'], ['evidence', 'A short quotation'], ['commentary', 'Its effect on the audience, and how it serves the purpose']] },
      { role: 'body', title: 'Strategy 2', lines: [['topic', 'The next move'], ['evidence', 'Quotation'], ['commentary', 'Effect and purpose']] },
      { role: 'conclusion', title: 'Conclusion', lines: [['conclusion', 'How the choices work together']] }
    ],
    synthesis: [
      { role: 'intro', title: 'Introduction', lines: [['context', 'The issue and why it matters'], ['thesis', 'Your position']] },
      { role: 'body', title: 'Your first reason', lines: [['topic', 'Your claim'], ['evidence', 'Source A, and Source C where they agree'], ['commentary', 'Your commentary']] },
      { role: 'body', title: 'Your second reason', lines: [['topic', 'Your claim'], ['evidence', 'Source B'], ['commentary', 'Your commentary']] },
      { role: 'counter', title: 'Where sources disagree', lines: [['counter', 'Source D’s view, fairly'], ['rebuttal', 'Your answer']] },
      { role: 'conclusion', title: 'Conclusion', lines: [['conclusion', 'What the sources together show']] }
    ]
  };
  WR.ESSAYS = ESSAYS;
  var ESSAY_COL = { intro: '#1c6fd6', context: '#0c8599', body: '#2b8a3e', counter: '#5c6370', conclusion: '#c2255c' };
  V.register('wr-essay', function (el, o) {
    var F = frame(el, o, 'essay', 'The map of an essay');
    var kinds = o.compare ? (Array.isArray(o.compare) ? o.compare : ['five', 'argument']) : [o.kind || 'five'];
    var mode = o.mode || 'show', outline = mode === 'outline';
    var wrap = h('div', 'wres-wrap' + (kinds.length > 1 ? ' wres-two' : '')); F.body.appendChild(wrap);
    function secs(kind) { return o.sections || ESSAYS[kind] || ESSAYS.five; }
    function render() {
      wrap.innerHTML = '';
      kinds.forEach(function (kind) {
        var S = secs(kind), col = h('div', 'wres-col');
        if (kinds.length > 1) col.appendChild(h('p', 'wres-head', esc({ five: 'The five-paragraph essay', argument: 'An argument that has grown', classical: 'The classical arrangement', analysis: 'A rhetorical analysis', synthesis: 'A synthesis essay' }[kind] || kind)));
        if (mode === 'order') return;
        if (outline) {
          var ol = h('ol', 'wres-outline'); col.appendChild(ol);
          S.forEach(function (s) { var li = h('li', '', '<b>' + esc(s.title) + '</b>'); var sub = h('ol', ''); (s.lines || []).forEach(function (l) { sub.appendChild(h('li', l[0] === 'thesis' ? 'wres-th' : '', esc(F.quiet ? '' : l[1]))); }); li.appendChild(sub); ol.appendChild(li); });
        } else {
          S.forEach(function (s, i) {
            var b = h('div', 'wres-sec wres-' + s.role); b.style.setProperty('--sc', ESSAY_COL[s.role] || '#5c6370');
            b.appendChild(h('p', 'wres-title', F.quiet ? letter(i) : esc(s.title)));
            (s.lines || []).forEach(function (l) { b.appendChild(h('p', 'wres-line wres-l-' + l[0], esc(l[1]))); });
            col.appendChild(b);
          });
        }
        wrap.appendChild(col);
      });
    }
    if (mode === 'order') {
      var S = secs(kinds[0]), items = S.map(function (s) { return { html: '<b>' + esc(s.title) + '</b>' + (s.lines && s.lines.length ? '<br><small>' + esc(s.lines.map(function (l) { return l[1]; }).join(' · ')) + '</small>' : ''), color: ESSAY_COL[s.role] }; });
      if (F.interactive && !F.quiet) F.body.appendChild(h('p', 'wrv-hint', 'Put the parts of the essay in order.'));
      var L = orderList(F.body, items, { key: JSON.stringify(S), quiet: F.quiet, interactive: F.interactive, onChange: function () { F.say(''); } });
      orderControls(F, L, items, o, 'parts');
      return { order: L.order };
    }
    render();
    if (F.interactive && !F.quiet && o.toggle !== false) V.seg(F.ctl, { label: 'View', items: [['show', 'Map'], ['outline', 'Outline']], value: outline ? 'outline' : 'show', change: function (v) { outline = v === 'outline'; render(); } });
    return {};
  });

  /* ---------- wr-cite: a citation and its parts, in MLA, APA or Chicago ---------- */
  var CITE_COL = { author: '#1c6fd6', title: '#c92a2a', container: '#2b8a3e', edition: '#5c6370', number: '#0c8599', publisher: '#7048e8', date: '#b8650b', pages: '#c2255c', page: '#c2255c', location: '#5c6370' };
  var STYLE_NAMES = { mla: 'MLA (9th edition)', apa: 'APA (7th edition)', chicago: 'Chicago (18th edition)' };
  V.register('wr-cite', function (el, o) {
    var F = frame(el, o, 'cite', 'A citation and its parts');
    var src = typeof o.source === 'object' ? o.source : WR.SOURCES[o.source || 0] || WR.SOURCES[0];
    var style = o.style || 'mla', form = o.form || 'entry', mode = o.mode || 'show', live = F.interactive && !F.quiet;
    var styles = o.styles || null;
    var box = h('div', 'wrct-box'); F.body.appendChild(box);
    var pal = null, picked = {}, parts = [];
    function partSpan(p, idx) {
      var t = esc(p.t); if (p.i) t = '<i>' + t + '</i>';
      if (p.k === 'sep') return '<span class="wrct-sep">' + t + '</span>';
      return '<span class="wrct-p" data-i="' + idx + '" data-k="' + p.k + '">' + t + '</span>';
    }
    function formName(st, fm) { return fm === 'intext' ? 'in-text citation' : fm === 'note' ? 'footnote' : st === 'mla' ? 'works cited entry' : st === 'apa' ? 'reference list entry' : 'bibliography entry'; }
    function render() {
      box.innerHTML = '';
      (styles || [style]).forEach(function (st) {
        var fm = st === 'chicago' && form === 'intext' ? 'note' : st !== 'chicago' && form === 'note' ? 'intext' : form;
        parts = WR.cite(src, st, fm);
        var row = h('div', 'wrct-row');
        if (!F.quiet || styles) row.appendChild(h('p', 'wrct-style', esc(STYLE_NAMES[st]) + ' · ' + formName(st, fm)));
        var c = h('p', 'wrct-cite' + (fm === 'entry' ? ' wrct-hang' : ''), (fm === 'note' ? '<span class="wrct-sep">1. </span>' : '') + parts.map(partSpan).join(''));
        row.appendChild(c); box.appendChild(row);
        c.querySelectorAll('.wrct-p').forEach(function (s) {
          var k = s.dataset.k;
          if (mode === 'show' && !F.quiet && o.colors !== false) { s.classList.add('on'); s.style.setProperty('--pc', CITE_COL[k]); s.title = WR.PART_NAMES[k]; }
          if (mode === 'ask' && k === o.ask) { s.classList.add('wrct-ask'); }
          if (mode === 'label' && live) {
            s.tabIndex = 0; s.setAttribute('role', 'button');
            var act = function () { var r = pal.get(); if (!r) { F.say('Choose a part name first.'); return; } var i = s.dataset.i; picked[i] = picked[i] === r ? undefined : r; s.classList.remove('ok', 'no'); s.classList.toggle('on', !!picked[i]); s.style.setProperty('--pc', picked[i] ? CITE_COL[picked[i]] : ''); F.say(''); };
            s.addEventListener('click', act); s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
          }
        });
      });
      if (mode === 'show' && !F.quiet && o.colors !== false) {
        var ks = []; (styles || [style]).forEach(function (st) { WR.cite(src, st, form === 'intext' && st === 'chicago' ? 'note' : form).forEach(function (p) { if (p.k !== 'sep' && ks.indexOf(p.k) < 0) ks.push(p.k); }); });
        box.insertAdjacentHTML('beforeend', legendHTML(ks.map(function (k) { return [k, WR.PART_NAMES[k], CITE_COL[k]]; })));
      }
    }
    if (mode === 'label' && live) {
      var ks = WR.cite(src, style, form).map(function (p) { return p.k; }).filter(function (k, i, a) { return k !== 'sep' && a.indexOf(k) === i; });
      F.body.insertBefore(h('p', 'wrv-hint', 'Choose a part name, then tap that part of the citation. Then Check.'), box);
      pal = palette(F.body, ks.map(function (k) { return [k, WR.PART_NAMES[k], CITE_COL[k]]; }), { label: 'Parts of a citation' }); F.body.insertBefore(pal.el, box);
    }
    render();
    if (mode === 'show' && live && !styles && o.switch !== false) V.seg(F.ctl, { label: 'Style', items: [['mla', 'MLA'], ['apa', 'APA'], ['chicago', 'Chicago']], value: style, change: function (v) { style = v; render(); } });
    if (mode === 'label' && live) btn(F.ctl, 'Check', function () {
      var miss = 0; box.querySelectorAll('.wrct-p').forEach(function (s) { var ok = picked[s.dataset.i] === s.dataset.k; if (!ok) miss++; s.classList.add(ok ? 'ok' : 'no'); });
      F.say(miss ? okMark(false) + ' ' + plural(miss, 'part') + ' to look at again.' : okMark(true) + ' Every part is labeled right.');
    }, 'pri');
    if (mode === 'label' && live) btn(F.ctl, 'Show me', function () { box.querySelectorAll('.wrct-p').forEach(function (s) { picked[s.dataset.i] = s.dataset.k; s.classList.remove('ok', 'no'); s.classList.add('on'); s.style.setProperty('--pc', CITE_COL[s.dataset.k]); s.title = WR.PART_NAMES[s.dataset.k]; }); F.say('Each part is colored; point at one to see its name.'); });
    return {};
  });
  /* ---------- wr-diagram: Reed–Kellogg sentence diagrams ---------- */
  var DFONT = '15px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', DSMALL = '13px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var TH = 0.92, COS = M.cos(TH), SIN = M.sin(TH); // the slant of modifier lines (about 53 degrees)
  function tw(s) { return measure(String(s), DFONT); }
  function slotW(s) { return M.max(46, tw(s) + 22); }
  // Each lay* function returns { w, up, down, draw(x, y, C) } for a structure whose line starts at (x, y).
  // C collects primitives (C.p), slot positions (C.slots[id]) and dependent clauses to place below (C.pend).
  function T(C, id, s, x, y, o) { o = o || {}; C.p.push({ t: 'text', id: id, s: s, x: x, y: y, rot: o.rot || 0, anchor: o.anchor || 'middle', cls: o.cls }); if (id) C.slots[id] = { x: x, y: y, w: s, rot: o.rot || 0 }; }
  function Ln(C, x1, y1, x2, y2, o) { o = o || {}; C.p.push({ t: 'line', x1: x1, y1: y1, x2: x2, y2: y2, dash: o.dash, cls: o.cls }); }
  function Pth(C, d, o) { o = o || {}; C.p.push({ t: 'path', d: d, dash: o.dash, cls: o.cls }); }

  // a modifier hanging from (ax, ay); returns { spanX, depth, draw(ax, ay, C) }
  function layMod(m, id) {
    if (typeof m === 'string') m = { w: m };
    if (m.io && typeof m.io === 'string') m = Object.assign({}, m, { io: { w: m.io } });
    if (m.o && typeof m.o === 'string') m = Object.assign({}, m, { o: { w: m.o } });
    if (m.cl || m.rel) return { spanX: 10, depth: 0, sub: true, draw: function (ax, ay, C) { C.pend.push({ m: m, id: id, ax: ax, ay: ay }); } };
    if (m.p || m.io || (m.inf && !m.stilt)) { // prepositional phrase, indirect object, or an infinitive used as a modifier
      var word = m.p || (m.inf ? 'to' : ''), L = M.max(44, tw(word) + 20), dx = L * COS, dy = L * SIN;
      var obj = m.io ? layNode(m.io, id, 'left') : m.inf ? layVerbal({ w: m.inf, o: m.o, m: m.m, pn: m.pn }, id) : layNode(m.o, id + '.o', 'left');
      return { spanX: dx + obj.w + 14, depth: dy + obj.down + 6, dx: dx, dy: dy, draw: function (ax, ay, C) {
        Ln(C, ax, ay, ax + dx + 6 * COS, ay + dy + 6 * SIN);
        if (word) T(C, m.inf ? id + '.to' : id, word, ax + dx / 2 + 8 * SIN, ay + dy / 2 - 8 * COS, { rot: TH * 180 / M.PI });
        if (!obj.fork) Ln(C, ax + dx, ay + dy, ax + dx + obj.w, ay + dy); obj.draw(ax + dx, ay + dy, C);
      } };
    }
    if (m.part) { // participle: a slanted line that bends into a horizontal one
      var pv = layVerbal({ w: m.part, o: m.o, m: m.m, pn: m.pn }, id), L2 = 30, dx2 = L2 * COS, dy2 = L2 * SIN;
      return { spanX: dx2 + pv.w + 14, depth: dy2 + pv.down + 6, draw: function (ax, ay, C) {
        Pth(C, 'M' + ax + ',' + ay + ' L' + (ax + dx2 - 6) + ',' + (ay + dy2 - 8) + ' Q' + (ax + dx2) + ',' + (ay + dy2) + ' ' + (ax + dx2 + 12) + ',' + (ay + dy2));
        Ln(C, ax + dx2 + 12, ay + dy2, ax + dx2 + pv.w, ay + dy2); pv.draw(ax + dx2, ay + dy2, C);
      } };
    }
    // a word on a slanted line, with its own modifiers on a little shelf
    var Lw = M.max(34, tw(m.w) + 18), dxw = Lw * COS, dyw = Lw * SIN, subs = (m.m || []).map(function (s, i) { return layMod(s, id + '.m' + i); });
    var subSpan = subs.reduce(function (a, s) { return a + s.spanX; }, 0), subDepth = subs.reduce(function (a, s) { return M.max(a, s.depth); }, 0);
    return { spanX: M.max(dxw + 20, subs.length ? dxw * 0.7 + 18 + subSpan : 0), depth: M.max(dyw + 4, subs.length ? dyw * 0.7 + subDepth + 4 : 0), draw: function (ax, ay, C) {
      Ln(C, ax, ay, ax + dxw, ay + dyw); T(C, id, m.w, ax + dxw / 2 + 8 * SIN, ay + dyw / 2 - 8 * COS, { rot: TH * 180 / M.PI });
      if (subs.length) { var sx = ax + dxw * 0.7, sy = ay + dyw * 0.7; Ln(C, sx, sy, sx + 18 + subSpan - 10, sy); var cx = sx + 18; subs.forEach(function (s) { s.draw(cx, sy, C); cx += s.spanX; }); }
    } };
  }
  // modifiers spread left to right under a slot of width w
  function layMods(list, base) {
    var j = 0, ms = (list || []).map(function (m) { return layMod(m, m._id || base + '.m' + (j++)); });
    return { span: ms.reduce(function (a, s) { return a + s.spanX; }, 0) + (ms.length ? 10 : 0), depth: ms.reduce(function (a, s) { return M.max(a, s.depth); }, 0), draw: function (x, y, C) { var cx = x + 8; ms.forEach(function (s) { s.draw(cx, y, C); cx += s.spanX; }); } };
  }
  // a verbal on its own line: participle, gerund or infinitive word, then its object or complement, with modifiers below
  function layVerbal(v, id) {
    var ww = slotW(v.w), ob = v.o ? layNode(v.o, id + '.o', 'left') : null, pn = v.pn ? layNode(v.pn, id + '.pn', 'left') : null, md = layMods(v.m, id);
    var w0 = M.max(ww, md.span);
    return { w: w0 + (ob ? ob.w + 4 : 0) + (pn ? pn.w + 4 : 0), up: 22, down: M.max(md.depth, ob ? ob.down : 0, pn ? pn.down : 0), draw: function (x, y, C) {
      T(C, id, v.w, x + w0 / 2, y - 6); md.draw(x, y, C); var cx = x + w0;
      if (ob) { Ln(C, cx, y - 22, cx, y); Ln(C, cx, y, ob.fork ? cx + 4 : cx + ob.w + 4, y); ob.draw(cx + 4, y, C); cx += ob.w + 4; }
      if (pn) { Ln(C, cx, y - 22, cx + 12, y); Ln(C, cx, y, cx + pn.w + 4, y); pn.draw(cx + 4, y, C); }
    } };
  }
  // a structure on a forked stand (gerund, infinitive or noun clause used as a noun)
  function layStilt(n, id) {
    var inner, kind;
    if (n.ger) { kind = 'ger'; inner = layVerbal({ w: n.ger, o: n.o, m: n.m, pn: n.pn }, id); inner = { w: inner.w + 18, up: inner.up + 10, down: inner.down, d: inner }; }
    else if (n.inf) { kind = 'inf'; var mod = layMod({ inf: n.inf, o: n.o, m: n.m, pn: n.pn }, id); inner = { w: mod.spanX + 10, up: mod.dy + 18, down: M.max(0, mod.depth - mod.dy), d: mod }; }
    else { kind = 'ncl'; var cl = layClause(n.ncl, id + '.c.'); inner = { w: cl.w, up: cl.up, down: cl.down, d: cl }; }
    var stilt = kind === 'ncl' ? 34 : 24, lift = stilt + (kind === 'ncl' ? M.max(inner.down, 16) : inner.down) + 6; // a clause's dividers reach 14 below its line
    return { w: M.max(inner.w, 40), up: lift + inner.up, down: 0, draw: function (x, y, C) {
      var W0 = M.max(inner.w, 40), lx = x + 6, top = y - stilt, ly = y - lift;
      var cx = kind === 'ger' ? lx + 5 : kind === 'inf' ? lx + inner.d.dx + 4 : lx + 4;
      // the forked stand
      Ln(C, cx - 9, y, cx, y - 9); Ln(C, cx + 9, y, cx, y - 9); Ln(C, cx, y - 9, cx, top);
      if (kind === 'ger') { // a stepped line: _|‾ with the gerund on the top step
        Pth(C, 'M' + lx + ',' + (ly + 10) + ' h10 v-10 h8'); Ln(C, lx + 18, ly, lx + inner.w, ly); inner.d.draw(lx + 18, ly, C);
        Ln(C, cx, top, cx, ly + 10);
      } else if (kind === 'inf') { var iy = ly - inner.d.dy; inner.d.draw(lx, iy, C); Ln(C, cx, top, cx, iy + inner.d.dy); }
      else { inner.d.draw(lx, ly, C); Ln(C, cx, top, cx, ly); }
    } };
  }
  // a word node on a line (with appositive and modifiers), a compound node, or a stilt node.
  // join: which side of a compound part meets the main line ('right' for subjects, 'left' for the rest)
  function layNode(n, id, join) {
    if (!n) return { w: 0, up: 0, down: 0, draw: function () { } };
    if (typeof n === 'string') n = { w: n };
    if (n.and) return layFork(n.items.map(function (it, i) { return layNode(it, id + '.' + i, 'left'); }), n.and, id + '.cj', join || 'left');
    if (n.ger || n.inf || n.ncl) return layStilt(n, id);
    if (n.app && typeof n.app === 'string') n = Object.assign({}, n, { app: { w: n.app } });
    var ww = slotW(n.w), app = n.app ? slotW('(' + n.app.w + ')') : 0, md = layMods(n.m, id), amd = n.app ? layMods(n.app.m, id + '.a') : null;
    var w0 = M.max(ww, md.span), w1 = n.app ? M.max(app, amd.span) : 0;
    return { w: w0 + w1, up: 22, down: M.max(md.depth, amd ? amd.depth : 0), draw: function (x, y, C) {
      T(C, id, n.w, x + w0 / 2, y - 6); md.draw(x, y, C);
      if (n.app) { T(C, id + '.a', n.app.w, x + w0 + w1 / 2, y - 6, { cls: 'paren' }); amd.draw(x + w0, y, C); }
    } };
  }
  // a fork: parallel branches joined to the main line on one or both sides, a dashed line with the conjunction between them
  function layFork(items, conj, cid, join) {
    var fdx = 26, lead = M.max(36, tw(conj) + 10) + 12, Wb = items.reduce(function (a, b) { return M.max(a, b.w); }, 0) + 10 + lead, ys = [0];
    for (var i = 1; i < items.length; i++) ys.push(ys[i - 1] + M.max(58, items[i - 1].down + items[i].up + 22));
    var mid = ys[ys.length - 1] / 2; ys = ys.map(function (y) { return y - mid; });
    var L = join === 'left' || join === 'both', R = join === 'right' || join === 'both';
    var up = 0, down = 0; items.forEach(function (it, k) { up = M.max(up, it.up - ys[k]); down = M.max(down, ys[k] + it.down); });
    return { w: Wb + (L ? fdx : 0) + (R ? fdx : 0), up: up, down: down, fork: true, draw: function (x, y, C) {
      var bx = x + (L ? fdx : 0);
      items.forEach(function (it, k) {
        var by = y + ys[k];
        Ln(C, bx, by, bx + Wb, by); it.draw(R && !L ? bx : bx + lead, by, C);
        if (L) Ln(C, x, y, bx, by); if (R) Ln(C, bx + Wb, by, bx + Wb + fdx, y);
      });
      var dxl = R && !L ? bx + Wb - 8 : bx + 8;
      Ln(C, dxl, y + ys[0], dxl, y + ys[ys.length - 1], { dash: true });
      // the conjunction sits beside the dashed line, halfway between the first two branches, in the room kept for it (lead)
      T(C, cid, conj, dxl + (R && !L ? -6 : 6), y + (ys[0] + ys[1]) / 2 + 5, { anchor: R && !L ? 'end' : 'start', cls: 'conj' });
    } };
  }
  // a verb with its own complements (for compound predicates): { w, do, io, pn, oc, m }
  function layPred(v, id, P, cl, opt) {
    opt = opt || {};
    var verb = layNode({ w: v.w, m: (cl && cl.io ? [{ io: cl.io, _id: P + 'io' }] : []).concat(v.io ? [{ io: v.io, _id: id + '.io' }] : []).concat(v.m || []) }, id, 'left');
    // ids of indirect objects placed among the verb's modifiers: fix them up after layout (see layMod with _id)
    var comps = [];
    function add(kind, node, nid) { if (node) comps.push({ kind: kind, n: layNode(node, nid, 'left') }); }
    add('do', v.do, id + '.do'); add('pn', v.pn, id + '.pn'); add('oc', v.oc, id + '.oc');
    if (cl) { add('do', cl.do, P + 'do'); add('pn', cl.pn, P + 'pn'); add('oc', cl.oc, P + 'oc'); }
    var gap = function (c) { return c.kind === 'do' ? 8 : 18; }; // after a slanted divider (pn, oc), more room before the word's own slants
    var w = verb.w + comps.reduce(function (a, c) { return a + c.n.w + gap(c); }, 0);
    return { w: w, openEnd: comps.length > 0 && !!comps[comps.length - 1].n.fork, up: M.max(verb.up, comps.reduce(function (a, c) { return M.max(a, c.n.up); }, 0)), down: M.max(verb.down, comps.reduce(function (a, c) { return M.max(a, c.n.down); }, 0)), draw: function (x, y, C) {
      if (!opt.noVerbLine) Ln(C, x, y, x + verb.w, y);
      verb.draw(x, y, C); var cx = x + verb.w;
      comps.forEach(function (c) {
        if (c.kind === 'do') Ln(C, cx, y - 22, cx, y); else Ln(C, cx, y - 22, cx + 12, y);
        var g = gap(c); Ln(C, cx, y, c.n.fork ? cx + g : cx + c.n.w + g, y); c.n.draw(cx + g, y, C); cx += c.n.w + g;
      });
    } };
  }
  // the complement shared by a compound verb ("washed and dried the dishes"): divider and complement after the fork
  function layShared(cl, P) {
    var comps = [];
    if (cl.do) comps.push({ kind: 'do', n: layNode(cl.do, P + 'do', 'left') }); if (cl.pn) comps.push({ kind: 'pn', n: layNode(cl.pn, P + 'pn', 'left') }); if (cl.oc) comps.push({ kind: 'oc', n: layNode(cl.oc, P + 'oc', 'left') });
    var gap = function (c) { return c.kind === 'do' ? 8 : 18; };
    return { w: 10 + comps.reduce(function (a, c) { return a + c.n.w + gap(c); }, 0), openEnd: comps.length > 0 && !!comps[comps.length - 1].n.fork, up: 24, down: comps.reduce(function (a, c) { return M.max(a, c.n.down); }, 0), draw: function (x, y, C) {
      Ln(C, x, y, x + 10, y); var cx = x + 10;
      comps.forEach(function (c) { var g = gap(c); if (c.kind === 'do') Ln(C, cx, y - 22, cx, y); else Ln(C, cx, y - 22, cx + 12, y); Ln(C, cx, y, c.n.fork ? cx + g : cx + c.n.w + g, y); c.n.draw(cx + g, y, C); cx += c.n.w + g; });
    } };
  }
  function layClause(cl, P) {
    P = P || '';
    var subj = layNode(cl.s, P + 's', 'right'), pred;
    if (cl.v && cl.v.and) {
      var shared = cl.do || cl.pn;
      var branches = cl.v.items.map(function (it, i) { return layPred(it, P + 'v.' + i, P, null); });
      var fork = layFork(branches, cl.v.and, P + 'v.cj', shared ? 'both' : 'left');
      if (shared) {
        var tail = layShared(cl, P);
        pred = { w: fork.w + tail.w, up: M.max(fork.up, tail.up), down: M.max(fork.down, tail.down), fork: true, draw: function (x, y, C) { fork.draw(x, y, C); tail.draw(x + fork.w, y, C); } };
      } else pred = fork;
    } else pred = layPred(cl.v || { w: '' }, P + 'v', P, cl);
    var fl = (cl.float || []).map(function (f, i) { return { w: typeof f === 'string' ? f : f.w, id: P + 'f' + i }; });
    if (cl.intro) fl.unshift({ w: cl.intro, id: P + 'intro' });
    var flW = fl.reduce(function (a, f) { return a + slotW(f.w) + 14; }, 0);
    var up = M.max(subj.up, pred.up, 24) + (fl.length ? 34 : 0);
    var w = subj.w + 4 + pred.w + 8;
    return { w: M.max(w, flW), up: up, down: M.max(subj.down, pred.down), draw: function (x, y, C) {
      if (!subj.fork) Ln(C, x, y, x + subj.w + 4, y);
      subj.draw(x, y, C);
      var dvx = x + subj.w + 2; Ln(C, dvx, y - 26, dvx, y + 14, { cls: 'div' });
      pred.draw(dvx + 2, y, C);
      if ((!pred.fork && !pred.openEnd) || pred.tailLine) Ln(C, dvx + 2 + pred.w, y, dvx + 2 + pred.w + 8, y);
      var fx = x; fl.forEach(function (f) {
        var fw = slotW(f.w), fy = y - M.max(subj.up, pred.up, 24) - 14; Ln(C, fx, fy, fx + fw, fy); T(C, f.id, f.w, fx + fw / 2, fy - 6);
        if (f.id === P + 'intro') { var vs = C.slots[P + 'v'] || C.slots[P + 'v.0']; if (vs) Ln(C, fx + fw / 2, fy, vs.x, y - 22, { dash: 'dot' }); }
        fx += fw + 14;
      });
    } };
  }
  // draw a whole sentence (clause or compound), then its dependent clauses below, linked by dotted lines
  function drawSentence(spec, C, x, y, P) {
    P = P || '';
    var top;
    if (spec.compound) {
      var cls = spec.compound.map(function (c, i) { return layClause(c, P + 'c' + i + '.'); }), cy = y;
      var vx = [];
      cls.forEach(function (c, i) {
        if (i) cy += cls[i - 1].down + c.up + 40;
        var before = C.p.length; c.draw(x, cy, C); drainPend(C, before);
        var vs = C.slots[P + 'c' + i + '.v'] || C.slots[P + 'c' + i + '.v.0']; vx.push([vs ? vs.x : x + c.w / 2, cy]);
      });
      // a dashed step line joins the verbs, with the conjunction on it
      var a = vx[0], b = vx[vx.length - 1], sx = M.min(a[0], b[0]) - 30;
      Pth(C, 'M' + a[0] + ',' + (a[1] + 4) + ' V' + (a[1] + 16) + ' H' + sx + ' V' + (b[1] - 26) + ' H' + b[0] + ' V' + (b[1] - 22), { dash: true });
      T(C, P + 'cj', spec.conj || 'and', sx - 6, (a[1] + b[1]) / 2, { anchor: 'end', cls: 'conj' });
      (spec.float || []).forEach(function (f, i) { var fw = slotW(f), fy = y - cls[0].up - 16; Ln(C, x + i * (fw + 14), fy, x + i * (fw + 14) + fw, fy); T(C, P + 'f' + i, f, x + i * (fw + 14) + fw / 2, fy - 6); });
      return;
    }
    var L = layClause(spec, P); top = C.p.length; L.draw(x, y, C); drainPend(C, top);
  }
  function pathPoints(d) { // the points of a path made of M L Q H V (absolute) and h v (relative)
    var out = [], cx = 0, cy = 0, re = /([MLQHVhv])([^MLQHVhv]*)/g, m;
    while ((m = re.exec(d))) {
      var n = (m[2].match(/-?\d+(\.\d+)?/g) || []).map(Number), c = m[1];
      if (c === 'M' || c === 'L') { cx = n[0]; cy = n[1]; } else if (c === 'Q') { out.push([n[0], n[1]]); cx = n[2]; cy = n[3]; }
      else if (c === 'H') cx = n[0]; else if (c === 'V') cy = n[0]; else if (c === 'h') cx += n[0]; else if (c === 'v') cy += n[0];
      out.push([cx, cy]);
    }
    return out;
  }
  function bounds(C, from) {
    var b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    C.p.slice(from || 0).forEach(function (p) {
      if (p.t === 'line') { b.x0 = M.min(b.x0, p.x1, p.x2); b.x1 = M.max(b.x1, p.x1, p.x2); b.y0 = M.min(b.y0, p.y1, p.y2); b.y1 = M.max(b.y1, p.y1, p.y2); }
      else if (p.t === 'text') { var w = tw(p.s), r = p.rot * M.PI / 180; var ex = M.abs(w * M.cos(r)) / (p.anchor === 'middle' ? 2 : 1), ey = M.abs(w * M.sin(r)) / 2 + 14;
        b.x0 = M.min(b.x0, p.x - (p.anchor === 'end' ? w : p.anchor === 'middle' ? ex : 0) - 4); b.x1 = M.max(b.x1, p.x + (p.anchor === 'start' ? w : p.anchor === 'middle' ? ex : 0) + 4); b.y0 = M.min(b.y0, p.y - ey - 4); b.y1 = M.max(b.y1, p.y + ey); }
      else if (p.t === 'path') pathPoints(p.d).forEach(function (q) { b.x0 = M.min(b.x0, q[0]); b.x1 = M.max(b.x1, q[0]); b.y0 = M.min(b.y0, q[1]); b.y1 = M.max(b.y1, q[1]); });
    });
    return b;
  }
  function drainPend(C, from) {
    var guard = 0;
    while (C.pend.length && guard++ < 20) {
      var list = C.pend.splice(0), b = bounds(C, from), y0 = b.y1 + 20;
      list.forEach(function (pd) {
        var m = pd.m, sub = m.cl || m.rel, P = pd.id + '.c.';
        var L = layClause(sub, P), probe = { p: [], slots: {}, pend: [] }; L.draw(0, 0, probe);
        var linkId = m.rel ? Object.keys(probe.slots).filter(function (k) { return probe.slots[k].w && String(probe.slots[k].w).toLowerCase() === String(m.link || '').toLowerCase(); })[0] : (probe.slots[P + 'v'] ? P + 'v' : P + 'v.0');
        var lk = probe.slots[linkId] || { x: L.w / 2, y: 0 }, x = pd.ax - lk.x, y = y0 + L.up;
        var before = C.p.length; L.draw(x, y, C);
        var tgt = C.slots[linkId] || { x: x + lk.x, y: y };
        Ln(C, pd.ax, pd.ay, tgt.x, tgt.y - 15, { dash: 'dot' });
        if (m.cl && m.sub) T(C, pd.id + '.sub', m.sub, (pd.ax + tgt.x) / 2 + 6, (pd.ay + tgt.y) / 2, { anchor: 'start', cls: 'conj' });
        y0 = bounds(C, from).y1 + 20; void before;
      });
    }
  }
  function renderDiagram(spec, o) {
    var C = { p: [], slots: {}, pend: [] };
    drawSentence(spec, C, 0, 0, '');
    var b = bounds(C, 0), pad = 14, W0 = b.x1 - b.x0 + pad * 2, H0 = b.y1 - b.y0 + pad * 2;
    var svg = sv('svg', { viewBox: (b.x0 - pad) + ' ' + (b.y0 - pad) + ' ' + W0 + ' ' + H0, class: 'wrdg-svg', role: 'img', width: W0, height: H0 });
    var hide = o.hide || {}, letters = o.ask || [];
    C.p.forEach(function (p) {
      if (p.t === 'line') sv('line', { x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2, class: 'wrdg-l' + (p.dash === 'dot' ? ' dot' : p.dash ? ' dash' : '') + (p.cls ? ' ' + p.cls : '') }, svg);
      else if (p.t === 'path') sv('path', { d: p.d, class: 'wrdg-l' + (p.dash ? ' dash' : ''), fill: 'none' }, svg);
      else {
        var ai = letters.indexOf(p.id), blank = hide[p.id] || ai >= 0;
        var g = sv('g', { class: 'wrdg-slot', 'data-id': p.id || '', transform: 'translate(' + p.x + ',' + p.y + ')' + (p.rot ? ' rotate(' + p.rot + ')' : '') }, svg);
        if (blank) {
          var bw = M.max(ai >= 0 ? 28 : 36, tw(p.s) + (ai >= 0 ? 6 : 10)), bx = p.anchor === 'end' ? -bw : p.anchor === 'start' ? 0 : -bw / 2;
          sv('rect', { x: bx, y: -15, width: bw, height: 20, rx: 4, class: 'wrdg-blank' + (ai >= 0 ? ' ask' : '') }, g);
          if (ai >= 0) { var lt = sv('text', { x: bx + bw / 2, y: 0, 'text-anchor': 'middle', class: 'wrdg-asktxt' }, g); lt.textContent = letter(ai); }
          g._blank = { bx: bx, bw: bw };
        } else { var t = sv('text', { x: 0, y: 0, 'text-anchor': p.anchor, class: 'wrdg-t' + (p.cls ? ' ' + p.cls : '') }, g); t.textContent = p.cls === 'paren' ? '(' + p.s + ')' : p.s; }
      }
    });
    return { svg: svg, W: W0, H: H0, slots: C.slots, prims: C.p };
  }
  function sentenceOf(spec) { return spec.text || ''; }
  function fit(holder, svg, W0) {
    function f() { var cw = (holder.clientWidth || W0) - 12; if (cw >= W0 * 0.8) { svg.style.width = M.min(cw, W0 * 1.3) + 'px'; holder.classList.remove('wrdg-scroll'); } else { svg.style.width = (W0 * 0.8) + 'px'; holder.classList.add('wrdg-scroll'); } svg.style.height = 'auto'; }
    f(); onResize(holder, f);
  }
  WR.renderDiagram = function (spec, o) { return renderDiagram(spec, o || {}); };
  V.register('wr-diagram', function (el, o) {
    var F = frame(el, o, 'diagram', 'A Reed–Kellogg diagram' + (o.text ? ' of the sentence: ' + o.text : ''));
    var mode = o.mode || 'show', live = F.interactive && !F.quiet;
    if (o.text && o.showText !== false) F.body.appendChild(h('p', 'wrdg-text', esc(o.text)));
    if (o.choices) { // several diagrams, lettered, for "which diagram is right?"
      var grid = h('div', 'wrdg-choices'); F.body.appendChild(grid);
      var picks = null;
      o.choices.forEach(function (spec, i) {
        var cell = h('div', 'wrdg-choice'); cell.appendChild(h('p', 'wrdg-clab', letter(i)));
        var hold = h('div', 'wrdg-hold'); var R = renderDiagram(spec, {}); hold.appendChild(R.svg); cell.appendChild(hold); grid.appendChild(cell); fit(hold, R.svg, R.W);
        R.svg.setAttribute('aria-label', 'Diagram ' + letter(i));
        if (live && o.answer != null) { cell.tabIndex = 0; cell.setAttribute('role', 'button'); var act = function () { picks = i; grid.querySelectorAll('.wrdg-choice').forEach(function (c, j) { c.classList.toggle('on', j === i); c.classList.remove('ok', 'no'); }); F.say(''); }; cell.addEventListener('click', act); cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }); }
      });
      if (live && o.answer != null) btn(F.ctl, 'Check', function () { if (picks === null) { F.say('Choose a diagram first.'); return; } var ok = picks === o.answer; grid.children[picks].classList.add(ok ? 'ok' : 'no'); F.say(ok ? okMark(true) + ' Right. ' + (o.why || '') : okMark(false) + ' Not that one. Check where each word sits.'); }, 'pri');
      return {};
    }
    var spec = o.spec || {}, slots = WR.dgSlots(spec);
    if (mode === 'build' && live) {
      var given = o.given || [], hide = {}; slots.forEach(function (s) { if (given.indexOf(s.id) < 0) hide[s.id] = true; });
      F.body.appendChild(h('p', 'wrv-hint', 'Tap a word, then tap the place where it belongs (or drag it there). Then Check.'));
      var tray = h('div', 'wrdg-tray'); F.body.appendChild(tray);
      var hold = h('div', 'wrdg-hold'); F.body.appendChild(hold);
      var R = renderDiagram(spec, { hide: hide }); hold.appendChild(R.svg); fit(hold, R.svg, R.W);
      var fill = {}, chipSel = null, chips = [];
      var words = slots.filter(function (s) { return hide[s.id]; }).map(function (s) { return s.w; });
      shuffle(words, JSON.stringify(spec)).forEach(function (w, i) {
        var c = btn(tray, esc(w), function () { chipSel = chipSel === i ? null : i; paintChips(); }, 'wrdg-chip'); c.dataset.i = i; c.dataset.w = w;
        c.draggable = false;
        c.addEventListener('pointerdown', function (e) { startDrag(e, i); });
        chips.push({ el: c, w: w, used: null });
      });
      var slotEls = {}; R.svg.querySelectorAll('.wrdg-slot').forEach(function (g) {
        var id = g.dataset.id; if (!hide[id]) return; slotEls[id] = g; g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Empty place for a word');
        var act = function () { if (chipSel !== null) put(chipSel, id); else if (fill[id] != null) { unput(id); } };
        g.addEventListener('click', act); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      function put(ci, id) {
        if (fill[id] != null) unput(id);
        var c = chips[ci]; if (c.used) unput(c.used);
        fill[id] = ci; c.used = id; chipSel = null; F.say(''); paintAll();
      }
      function unput(id) { var ci = fill[id]; if (ci == null) return; chips[ci].used = null; delete fill[id]; paintAll(); }
      function paintChips() { chips.forEach(function (c, i) { c.el.setAttribute('aria-pressed', String(chipSel === i)); c.el.classList.toggle('used', !!c.used); c.el.disabled = !!c.used; }); Object.keys(slotEls).forEach(function (id) { slotEls[id].classList.toggle('target', chipSel !== null); }); }
      function paintAll() {
        Object.keys(slotEls).forEach(function (id) {
          var g = slotEls[id], old = g.querySelector('.wrdg-fill'); if (old) old.remove(); g.classList.remove('ok', 'no', 'filled');
          if (fill[id] != null) { var bl = g._blank || { bx: -20, bw: 40 }; var t = sv('text', { x: bl.bx + bl.bw / 2, y: 0, 'text-anchor': 'middle', class: 'wrdg-t wrdg-fill' }, g); t.textContent = chips[fill[id]].w; g.classList.add('filled'); g.setAttribute('aria-label', 'Holds ' + chips[fill[id]].w + '; tap to take it out'); }
          else g.setAttribute('aria-label', 'Empty place for a word');
        });
        R.svg.querySelectorAll('.wrdg-slot').forEach(function (g) { var id = g.dataset.id; if (slotEls[id]) { var b = g.querySelector('rect'); if (b) b.style.opacity = fill[id] != null ? 0.25 : 1; } });
        paintChips();
      }
      // dragging a chip onto a slot (mouse, touch, pen)
      var drag = null;
      function startDrag(e, i) {
        if (chips[i].used) return;
        drag = { i: i, x: e.clientX, y: e.clientY, moved: false, ghost: null };
        D.addEventListener('pointermove', onMove); D.addEventListener('pointerup', onUp, { once: true });
      }
      function onMove(e) {
        if (!drag) return; if (!drag.moved && M.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
        if (!drag.moved) { drag.moved = true; drag.ghost = h('span', 'wrdg-ghost', esc(chips[drag.i].w)); D.body.appendChild(drag.ghost); }
        drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px'; e.preventDefault();
      }
      function onUp(e) {
        D.removeEventListener('pointermove', onMove);
        if (drag && drag.moved) {
          drag.ghost.remove(); var t = D.elementFromPoint(e.clientX, e.clientY), g = t && t.closest ? t.closest('.wrdg-slot') : null;
          if (g && slotEls[g.dataset.id]) put(drag.i, g.dataset.id);
          chipSel = null; paintChips();
          setTimeout(function () { drag = null; }, 0); return;
        }
        drag = null;
      }
      paintAll();
      btn(F.ctl, 'Check', function () {
        var miss = 0, empty = 0;
        Object.keys(slotEls).forEach(function (id) { var want = slots.filter(function (s) { return s.id === id; })[0].w, ci = fill[id]; if (ci == null) { empty++; return; } var ok = chips[ci].w.toLowerCase() === String(want).toLowerCase(); if (!ok) miss++; slotEls[id].classList.add(ok ? 'ok' : 'no'); });
        F.say(empty ? 'Place every word first (' + plural(empty, 'place') + ' empty).' : miss ? okMark(false) + ' ' + plural(miss, 'word') + ' to move (marked in red). Ask what job each word does.' : okMark(true) + ' Every word is in its place.' + (o.why ? ' ' + o.why : ''));
      }, 'pri');
      btn(F.ctl, 'Show me', function () { Object.keys(fill).forEach(unput); Object.keys(slotEls).forEach(function (id) { var want = slots.filter(function (s) { return s.id === id; })[0].w; var ci = chips.findIndex(function (c) { return !c.used && c.w === want; }); if (ci >= 0) put(ci, id); }); F.say(o.why || 'Here is the finished diagram.'); });
      btn(F.ctl, 'Start over', function () { Object.keys(fill).forEach(unput); F.say(''); });
      return { slots: slots };
    }
    var holdS = h('div', 'wrdg-hold'); F.body.appendChild(holdS);
    var hideS = {}; (o.hideWords || []).forEach(function (id) { hideS[id] = true; });
    var RS = renderDiagram(spec, { ask: o.ask || [], hide: hideS }); holdS.appendChild(RS.svg); fit(holdS, RS.svg, RS.W);
    RS.svg.setAttribute('aria-label', F.quiet ? 'A sentence diagram' + ((o.ask || []).length ? ' with lettered blanks' : '') : 'Sentence diagram: ' + slots.map(function (s) { return s.w + ' (' + s.role + ')'; }).join(', '));
    if (mode === 'steps' && live) { // reveal the diagram in the order the slots were listed
      var order = slots.map(function (s) { return s.id; }), k = 1;
      var paint = function () { RS.svg.querySelectorAll('.wrdg-slot').forEach(function (g) { var i = order.indexOf(g.dataset.id); g.style.opacity = i < 0 || i < k ? 1 : 0.08; }); var s = slots[k - 1]; F.say(s ? '<b>' + esc(s.w) + '</b>: ' + esc(s.role) : ''); };
      var bk = btn(F.ctl, '◀ Back', function () { if (k > 1) { k--; paint(); bk.disabled = k <= 1; nx.disabled = false; } }), nx = btn(F.ctl, 'Next word ▶', function () { if (k < order.length) { k++; paint(); nx.disabled = k >= order.length; bk.disabled = false; } }, 'pri');
      bk.disabled = true; paint();
    }
    if (o.roles && !F.quiet && mode === 'show') F.body.appendChild(h('ul', 'wrdg-roles', slots.map(function (s) { return '<li><b>' + esc(s.w) + '</b> ' + esc(s.role) + '</li>'; }).join('')));
    void sentenceOf;
    return { slots: slots };
  });
  /* =================================================================================================================
     HANDWRITING VISUALS: wr-letter (stroke order), wr-trace (trace and check), wr-join (cursive joins and words),
     wr-hand (grip, paper and posture). Letterforms come from MathLadder.writing.HAND.
     ================================================================================================================= */
  var H = WR.HAND;
  // guide lines across a box: top (solid), middle (dashed), baseline (solid, darker), descender (faint)
  function guides(g, x0, x1, o) {
    o = o || {};
    sv('line', { x1: x0, y1: 0, x2: x1, y2: 0, class: 'wrh-top' }, g);
    sv('line', { x1: x0, y1: 50, x2: x1, y2: 50, class: 'wrh-mid' }, g);
    sv('line', { x1: x0, y1: 100, x2: x1, y2: 100, class: 'wrh-base' }, g);
    if (o.desc !== false) sv('line', { x1: x0, y1: 150, x2: x1, y2: 150, class: 'wrh-desc' }, g);
    if (o.names) [['top line', 0], ['middle line', 50], ['baseline', 100]].forEach(function (L) { var t = sv('text', { x: x0 + 2, y: L[1] - 4, class: 'wrh-lname' }, g); t.textContent = L[0]; });
  }
  function svgBox(w, o) { o = o || {}; var pad = o.pad == null ? 16 : o.pad, top = o.top == null ? -22 : o.top, bottom = o.bottom == null ? 166 : o.bottom, x0 = o.x0 == null ? 0 : o.x0; return sv('svg', { viewBox: (x0 - pad) + ' ' + top + ' ' + (w + 2 * pad) + ' ' + (bottom - top), class: 'wrh-svg', role: 'img' }); }
  function pathLen(p) { try { return p.getTotalLength(); } catch (e) { return 100; } }
  function arrowOn(g, path, at) { // a small arrowhead along a stroke, showing which way the pen moves
    var L = pathLen(path); if (L < 14) return;
    var a = path.getPointAtLength(L * at), b = path.getPointAtLength(M.min(L, L * at + 4)), ang = M.atan2(b.y - a.y, b.x - a.x) * 180 / M.PI;
    sv('path', { d: 'M-6,-5 L4,0 L-6,5', transform: 'translate(' + b.x + ',' + b.y + ') rotate(' + ang + ')', class: 'wrh-arrow' }, g);
  }
  function freeSpot(pt, placed) { // a number badge beside an earlier one, never on top of it
    var tries = [[0, 0], [17, -8], [-17, -8], [17, 10], [-17, 10], [0, -19]];
    for (var i = 0; i < tries.length; i++) { var q = [pt[0] + tries[i][0], pt[1] + tries[i][1]]; if (placed.every(function (p) { return M.hypot(p[0] - q[0], p[1] - q[1]) >= 17; })) return q; }
    return pt;
  }
  function startDot(g, pt, n, cls) { var c = sv('g', { class: 'wrh-start ' + (cls || ''), transform: 'translate(' + pt[0] + ',' + pt[1] + ')' }, g); sv('circle', { r: 9 }, c); if (n != null) { var t = sv('text', { y: 4, 'text-anchor': 'middle' }, c); t.textContent = n; } return c; }

  /* ---------- wr-letter: stroke order for any print or cursive letter or digit ---------- */
  V.register('wr-letter', function (el, o) {
    var style = o.style === 'cursive' ? 'cursive' : 'print', chars = String(o.ch || o.chars || 'a').split('');
    var F = frame(el, o, 'hletter', 'How to write ' + (chars.length === 1 ? 'the ' + (style === 'cursive' ? 'cursive ' : '') + (/[0-9]/.test(chars[0]) ? 'number ' : 'letter ') + chars[0] : chars.join(' ')));
    var variants = o.variants || [{}], live = F.interactive && !F.quiet, anims = [];
    var row = h('div', 'wrlt-row' + (variants.length > 1 ? ' wrlt-cmp' : '')); F.body.appendChild(row);
    // one scale for every cell: the widest letter (with its slant) sets the box
    var span = chars.reduce(function (a, ch) { var g = H.glyph(ch, style); return g ? [M.min(a[0], g.box[0] - 8), M.max(a[1], g.box[2] + 8)] : a; }, [0, 50]), BW = span[1] - span[0];
    variants.forEach(function (va, vi) {
      chars.forEach(function (ch) {
        var G = H.glyph(ch, style); if (!G) return;
        var cell = h('figure', 'wrlt-cell'); row.appendChild(cell);
        if (variants.length > 1) cell.appendChild(h('figcaption', 'wrlt-vlab', letter(vi)));
        var gx0 = (G.box[0] + G.box[2]) / 2 - BW / 2;
        var svg = svgBox(BW, { pad: 18, x0: gx0 }); cell.appendChild(svg);
        if (o.lines !== false) guides(svg, gx0 - 18, gx0 + BW + 18, { names: o.lineNames });
        var order = va.order || G.strokes.map(function (s, i) { return i; }), rev = va.reverse || [];
        var ghost = sv('g', { class: 'wrlt-ghost' }, svg), ink = sv('g', { class: 'wrlt-ink' }, svg), marks = sv('g', {}, svg);
        var paths = G.strokes.map(function (s, i) {
          sv('path', { d: s.d, class: 'wrlt-g' + (s.dot ? ' dot' : '') }, ghost);
          var p = sv('path', { d: s.d, class: 'wrlt-p' + (s.dot ? ' dot' : '') }, ink);
          if (rev.indexOf(i) >= 0) { // drawn backward: reverse the path's direction for the arrow and the start dot
            p.setAttribute('data-rev', '1');
          }
          return p;
        });
        // number each stroke where it starts (or ends, if this picture shows it drawn backward), with an arrow along it
        var placed = [];
        order.forEach(function (si, k) {
          var s = G.strokes[si], r = rev.indexOf(si) >= 0, pt = r ? s.end : s.start;
          if (o.arrows !== false && !s.dot) {
            if (r) { var tmp = sv('path', { d: reversePath(s), class: 'wrlt-none' }, marks); arrowOn(marks, tmp, 0.45); }
            else arrowOn(marks, paths[si], 0.45);
          }
          if (o.numbers !== false) { var at = freeSpot(pt, placed); placed.push(at); startDot(marks, at, order.length > 1 || !s.dot ? k + 1 : null, k === 0 ? 'first' : ''); }
        });
        var name = (/[0-9]/.test(ch) ? 'number ' : style === 'cursive' ? 'cursive ' : '') + ch;
        svg.setAttribute('aria-label', (variants.length > 1 ? letter(vi) + ': ' : '') + name + ', ' + plural(G.n, 'stroke') + (F.quiet ? '' : ': ' + describe(G, order)));
        if (o.caption !== false && !F.quiet && variants.length === 1) cell.appendChild(h('figcaption', 'wrlt-name', esc(ch) + ' <small>' + plural(G.n, 'stroke') + '</small>'));
        anims.push({ paths: paths, order: order, marks: marks });
      });
    });
    function describe(G, order) { return order.map(function (si, k) { var s = G.strokes[si]; return (k + 1) + ': ' + (s.dot ? 'a dot' : 'start near the ' + (s.start[1] <= 6 ? 'top line' : M.abs(s.start[1] - 50) <= 10 ? 'middle line' : s.start[1] >= 94 && s.start[1] <= 106 ? 'baseline' : 'line')); }).join('; '); }
    function reversePath(s) { // rebuild path data backward from the stroke's segments (lines and cubics)
      var segs = s.segs, pts = [], d = '';
      segs.forEach(function (g) { pts.push(g); });
      var end = null; for (var i = segs.length - 1; i >= 0; i--) { var g = segs[i]; var prev = i > 0 ? segs[i - 1] : null, p0 = prev ? [prev[prev.length - 2], prev[prev.length - 1]] : null;
        var e = [g[g.length - 2], g[g.length - 1]]; if (!end) { d += 'M' + e[0] + ',' + e[1]; end = e; }
        if (!p0) continue;
        if (g[0] === 'C') d += ' C' + g[3] + ',' + g[4] + ' ' + g[1] + ',' + g[2] + ' ' + p0[0] + ',' + p0[1]; else d += ' L' + p0[0] + ',' + p0[1]; }
      var tmp = H.parse(d); return H.toD(tmp, 0, 0, s.d && style === 'cursive');
    }
    function play() {
      if (V.reduced) { anims.forEach(function (A) { A.paths.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); }); return; }
      anims.forEach(function (A) {
        var t = 0;
        A.paths.forEach(function (p) { var L = pathLen(p); p.style.transition = 'none'; p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = p.getAttribute('data-rev') ? -L : L; });
        A.marks.style.opacity = 0.35;
        A.order.forEach(function (si) {
          var p = A.paths[si], L = pathLen(p), dur = M.max(0.35, L / (o.speed || 140));
          setTimeout(function () { p.style.transition = 'stroke-dashoffset ' + dur + 's linear'; p.style.strokeDashoffset = 0; }, t * 1000 + 30);
          t += dur + 0.35;
        });
        setTimeout(function () { A.marks.style.opacity = 1; }, t * 1000);
      });
    }
    if (live && o.animate !== false) {
      btn(F.ctl, '▶ Show me how', play, 'pri');
      if (o.autoplay !== false) W.requestAnimationFrame(function () { setTimeout(play, 300); });
    }
    if (o.note && !F.quiet) F.body.appendChild(h('p', 'wrv-note', o.note));
    return { play: play };
  });

  /* ---------- wr-trace: trace a letter, a number or a word on guide lines, with a kind check ---------- */
  var CHEERS = ['Nice!', 'Great tracing!', 'That’s it!', 'Beautiful!', 'Smooth!', 'Well done!'];
  V.register('wr-trace', function (el, o) {
    var style = o.style === 'cursive' ? 'cursive' : 'print', text = String(o.text || o.ch || 'a');
    var F = frame(el, o, 'trace', 'Trace ' + (text.length === 1 ? 'the ' + (style === 'cursive' ? 'cursive ' : '') + text : 'the word ' + text) + ' with your finger, a mouse or a pen');
    var Wd = text.length === 1 ? null : H.word(text, style), G = text.length === 1 ? H.glyph(text, style) : null;
    var parts = G ? G.strokes.map(function (s) { return { d: s.d, dot: s.dot }; }) : Wd.parts.map(function (p) { return { d: p.d, dot: p.dot }; });
    var wBox = G ? M.max(G.w, 50) : M.max(Wd.w, 60), tol = o.tol || 15;
    var box = h('div', 'wrtr2-box'); F.body.appendChild(box);
    var svg = svgBox(wBox, { pad: 20 }); box.appendChild(svg); svg.classList.add('wrtr2-svg');
    if (o.lines !== false) guides(svg, -20, wBox + 20, {});
    var ghostG = sv('g', { class: 'wrtr2-ghost' }, svg), doneG = sv('g', { class: 'wrtr2-done' }, svg), inkG = sv('g', { class: 'wrtr2-ink' }, svg), hintG = sv('g', {}, svg);
    var els = parts.map(function (p) { return sv('path', { d: p.d, class: 'wrtr2-gp' + (p.dot ? ' dot' : '') }, ghostG); });
    var samples = els.map(function (p) { var L = pathLen(p), n = M.max(2, M.ceil(L / 4)), out = []; for (var i = 0; i <= n; i++) { var q = p.getPointAtLength(L * i / n); out.push([q.x, q.y]); } return out; });
    var cur = 0, tries = 0, pts = null, line = null, finished = false;
    function nextHint() {
      hintG.innerHTML = ''; if (cur >= parts.length) return;
      var s = samples[cur][0]; startDot(hintG, s, null, 'go');
      if (!parts[cur].dot && samples[cur].length > 3) { var tmp = els[cur]; arrowOn(hintG, tmp, 0.3); }
      els.forEach(function (p, i) { p.classList.toggle('now', i === cur); });
    }
    function toSvg(e) { var m = svg.getScreenCTM(); if (!m) return null; var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var q = p.matrixTransform(m.inverse()); return [q.x, q.y]; }
    function near(a, list, t) { for (var i = 0; i < list.length; i++) { var dx = a[0] - list[i][0], dy = a[1] - list[i][1]; if (dx * dx + dy * dy <= t * t) return true; } return false; }
    function judge(user) {
      // a dot: a tap near it is enough
      if (parts[cur].dot) return near(user[0], samples[cur], tol * 1.4) ? { ok: true, used: 1 } : { ok: false, why: 'Tap right on the dot.' };
      if (user.length < 3) return { ok: false, why: 'Keep your finger down and follow the gray line.' };
      var used = 0, k = cur, okAny = false, accPool = [];
      // the stroke may run on through several parts (a joined cursive word)
      while (k < parts.length && !parts[k].dot) {
        var S = samples[k], cover = S.filter(function (q) { return near(q, user, tol); }).length / S.length;
        if (cover >= (tries >= 2 ? 0.6 : 0.75)) { accPool = accPool.concat(S); used++; okAny = true; k++; } else break;
      }
      if (!okAny) {
        var S0 = samples[cur], startOk = near(user[0], [S0[0]], tol * 1.8), endOk = near(user[0], [S0[S0.length - 1]], tol * 1.8);
        return { ok: false, why: !startOk && endOk ? 'Almost! Start at the green dot and go the way the arrow points.' : !startOk ? 'Start at the green dot, then follow the gray line.' : 'Good start. Follow the gray line all the way to its end.' };
      }
      var acc = user.filter(function (q) { return near(q, accPool, tol * 1.35); }).length / user.length;
      if (acc < (tries >= 2 ? 0.55 : 0.7)) return { ok: false, why: 'Close! Try to stay on the gray line.' };
      if (!near(user[0], [samples[cur][0]], tol * 2.2) && tries < 2) return { ok: false, why: 'Almost! Start at the green dot and go the way the arrow points.' };
      return { ok: true, used: used };
    }
    var live = F.interactive && !F.quiet && o.interactive !== false;
    if (F.interactive && o.interactive !== false) {
      svg.addEventListener('pointerdown', function (e) { if (finished) return; var p = toSvg(e); if (!p) return; pts = [p]; line = sv('polyline', { points: p.join(','), class: 'wrtr2-u' }, inkG); try { svg.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); });
      svg.addEventListener('pointermove', function (e) { if (!pts) return; var p = toSvg(e); if (!p) return; var l = pts[pts.length - 1]; if (M.hypot(p[0] - l[0], p[1] - l[1]) < 1.5) return; pts.push(p); line.setAttribute('points', pts.map(function (q) { return q.join(','); }).join(' ')); e.preventDefault(); });
      var end = function () {
        if (!pts) return; var user = pts; pts = null;
        var r = judge(user);
        if (r.ok) {
          for (var i = 0; i < r.used; i++) { sv('path', { d: parts[cur].d, class: 'wrtr2-ok' + (parts[cur].dot ? ' dot' : '') }, doneG); cur++; }
          inkG.innerHTML = ''; tries = 0;
          if (cur >= parts.length) { finished = true; hintG.innerHTML = ''; els.forEach(function (p) { p.classList.remove('now'); }); done(); }
          else { F.say('<span class="wrv-ok">✓</span> ' + CHEERS[(cur + text.length) % CHEERS.length] + (parts.length > 1 ? ' Now stroke ' + (cur + 1) + '.' : '')); nextHint(); }
        } else {
          tries++; F.say(r.why + (tries >= 2 ? ' Tap “Show me” to watch it.' : ''));
          setTimeout(function () { inkG.innerHTML = ''; }, 650);
        }
      };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    }
    function done() {
      var rw = o.reward;
      F.say('<span class="wrv-ok">✓</span> ' + (o.doneText || 'You traced it all. ' + CHEERS[text.length % CHEERS.length]) + (rw ? ' <span class="wrtr2-rw"><span aria-hidden="true">' + esc(rw.e) + '</span> You earned the ' + esc(rw.name) + ' sticker.</span>' : ''));
      el.classList.add('wrtr2-finished'); if (o.onDone) try { o.onDone(); } catch (e) { }
    }
    function show() { // animate the current stroke
      if (cur >= parts.length) return; var p = els[cur], L = pathLen(p), a = sv('path', { d: parts[cur].d, class: 'wrtr2-demo' }, inkG);
      if (V.reduced) { setTimeout(function () { a.remove(); }, 1200); return; }
      a.style.strokeDasharray = L + ' ' + L; a.style.strokeDashoffset = L; W.requestAnimationFrame(function () { a.style.transition = 'stroke-dashoffset ' + M.max(0.5, L / 120) + 's linear'; a.style.strokeDashoffset = 0; });
      setTimeout(function () { a.remove(); }, M.max(0.5, L / 120) * 1000 + 700);
    }
    if (F.interactive && o.interactive !== false) {
      btn(F.ctl, 'Show me', show);
      btn(F.ctl, 'Start over', function () { cur = 0; tries = 0; finished = false; doneG.innerHTML = ''; inkG.innerHTML = ''; el.classList.remove('wrtr2-finished'); F.say(''); nextHint(); });
      if (!F.quiet) F.body.appendChild(h('p', 'wrv-hint', 'Start at the green dot and follow the gray line. A finger, a mouse or a pen all work.'));
    }
    svg.setAttribute('aria-label', 'Tracing area for ' + text + '. Use a finger, a mouse or a pen; or press Show me to watch the strokes.');
    nextHint();
    void live;
    return { done: function () { return finished; } };
  });

  /* ---------- wr-join: how cursive letters connect, and cursive (or print) words to read ---------- */
  V.register('wr-join', function (el, o) {
    var style = o.style === 'print' ? 'print' : 'cursive', variants = o.variants || [{ text: o.text || 'on' }];
    var F = frame(el, o, 'join', o.label || (F_quietLabel(o)));
    function F_quietLabel(oo) { return oo.quiet ? 'Handwriting to read' : 'How cursive letters join'; }
    var row = h('div', 'wrjn-row' + (variants.length > 1 ? ' wrjn-cmp' : '')); F.body.appendChild(row);
    variants.forEach(function (va, vi) {
      var text = va.text || o.text || 'on', Wd = va.nojoin ? null : H.word(text, va.style || style, { distort: va.distort || o.distort });
      if (va.nojoin) { // letters written separately: no joins at all
        var cx = 0, pp = [], bx = []; text.split('').forEach(function (ch, i) { var g = H.word(ch, 'cursive'); g.parts.forEach(function (p) { if (p.kind !== 'join' || !p.tail) pp.push({ d: p.d, kind: p.kind === 'join' ? 'join' : p.kind, i: i, tx: cx }); }); bx.push({ ch: ch, i: i, x0: cx, x1: cx + g.w - 10 }); cx += g.w + 4; });
        Wd = { w: cx, parts: pp, boxes: bx };
      }
      var cell = h('figure', 'wrjn-cell'); row.appendChild(cell);
      if (variants.length > 1) cell.appendChild(h('figcaption', 'wrlt-vlab', letter(vi)));
      var svg = svgBox(M.max(Wd.w, 60), { pad: 20 }); cell.appendChild(svg);
      if (o.lines !== false) guides(svg, -20, M.max(Wd.w, 60) + 20, {});
      var showJoins = !F.quiet && o.highlight !== false && !va.plain;
      Wd.parts.forEach(function (p) {
        var at = p.tx ? { transform: 'translate(' + p.tx + ',0)' } : {};
        sv('path', Object.assign({ d: p.d, class: 'wrjn-p' + (p.kind === 'join' && showJoins && !p.lead && !p.tail ? ' join' : '') + (p.dot ? ' dot' : '') }, at), svg);
      });
      if (showJoins && o.points !== false) Wd.parts.forEach(function (p) {
        if (p.kind !== 'join' || p.lead || p.tail) return; var tmp = sv('path', { d: p.d, class: 'wrlt-none' }, svg), L = pathLen(tmp), a = tmp.getPointAtLength(0), b = tmp.getPointAtLength(L);
        sv('circle', { cx: a.x, cy: a.y, r: 4.5, class: 'wrjn-exit' }, svg); sv('circle', { cx: b.x, cy: b.y, r: 4.5, class: 'wrjn-entry' }, svg);
      });
      if (o.numbers) Wd.boxes.forEach(function (b, k) { var t = sv('text', { x: (b.x0 + b.x1) / 2 + 10, y: 160, 'text-anchor': 'middle', class: 'wrjn-num' }, svg); t.textContent = k + 1; });
      svg.setAttribute('aria-label', (variants.length > 1 ? letter(vi) + ': ' : '') + (F.quiet ? 'handwriting' + (o.numbers ? ' with numbered letters' : '') : 'the ' + style + ' word ' + text));
    });
    if (!F.quiet && o.legend !== false && o.highlight !== false) F.body.insertAdjacentHTML('beforeend', '<p class="wrv-legend"><span><i style="background:var(--wr-join)"></i>joining stroke</span><span><i class="wrjn-li-exit"></i>where a letter ends</span><span><i class="wrjn-li-entry"></i>where the next begins</span></p>');
    if (o.note && !F.quiet) F.body.appendChild(h('p', 'wrv-note', o.note));
    return {};
  });

  /* ---------- wr-hand: pencil grip, paper position and posture (cartoon skin color for every hand) ---------- */
  var SK = WR.SKIN, SKL = WR.SKIN_LINE;
  function pencil(g, x1, y1, x2, y2) { // from the eraser (x1, y1) to the point (x2, y2)
    var L = M.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    function P(t) { return [x1 + ux * t, y1 + uy * t]; }
    var e = P(14), w0 = P(L - 26), tip = P(L - 6);
    sv('line', { x1: x1, y1: y1, x2: e[0], y2: e[1], stroke: '#e88aa0', 'stroke-width': 13, 'stroke-linecap': 'round' }, g);
    sv('line', { x1: e[0], y1: e[1], x2: P(20)[0], y2: P(20)[1], stroke: '#b9bec6', 'stroke-width': 13 }, g);
    sv('line', { x1: P(20)[0], y1: P(20)[1], x2: w0[0], y2: w0[1], stroke: '#f2c94c', 'stroke-width': 13 }, g);
    sv('line', { x1: w0[0], y1: w0[1], x2: tip[0], y2: tip[1], stroke: '#e9c9a0', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
    sv('line', { x1: tip[0], y1: tip[1], x2: x2, y2: y2, stroke: '#3b3b3b', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  }
  function capsule(g, x1, y1, x2, y2, r) { sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: SKL, 'stroke-width': 2 * r + 3, 'stroke-linecap': 'round' }, g); sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: SK, 'stroke-width': 2 * r, 'stroke-linecap': 'round' }, g); }
  function blob(g, cx, cy, rx, ry, rot) { sv('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: SK, stroke: SKL, 'stroke-width': 2, transform: 'rotate(' + (rot || 0) + ' ' + cx + ' ' + cy + ')' }, g); }
  function gripDrawing(g, kind) {
    // a right hand seen from the side; the pencil runs from the upper right down to the point at the lower left
    var shift = kind === 'tip' ? [-26, 26] : kind === 'top' ? [40, -40] : [0, 0];
    var hand = sv('g', { transform: 'translate(' + shift[0] + ',' + shift[1] + ')' });
    if (kind === 'fist') {
      pencil(g, 150, 22, 62, 150);
      blob(hand, 142, 104, 40, 30, -30);
      [0, 1, 2, 3].forEach(function (i) { capsule(hand, 102 + i * 9, 72 + i * 14, 132 + i * 8, 86 + i * 14, 8.5); });
      capsule(hand, 128, 66, 104, 84, 8);
      g.appendChild(hand); return;
    }
    pencil(g, 196, 26, 62, 150);
    blob(hand, 158, 112, 42, 30, -28);
    capsule(hand, 150, 136, 132, 134, 8); capsule(hand, 142, 140, 122, 142, 7.5);   // ring and little fingers, curled
    capsule(hand, 146, 122, 104, 122, 8.5);                                       // middle finger, under the pencil
    g.appendChild(hand);
    var top = sv('g', { transform: 'translate(' + shift[0] + ',' + shift[1] + ')' }, g);
    capsule(top, 160, 90, 106, 106, 8.5);                                       // pointer finger, on top
    capsule(top, 134, 132, 104, 116, 8.5);                                      // thumb
  }
  function paperDrawing(g, kind) {
    var left = /left/.test(kind), rot = kind === 'straight' ? 0 : (left ? 20 : -20) * (kind === 'wrong' || kind === 'left-wrong' ? -1 : 1);
    sv('rect', { x: 0, y: 0, width: 260, height: 190, rx: 10, class: 'wrhd-desk' }, g);
    var pg = sv('g', { transform: 'rotate(' + rot + ' 130 95)' }, g);
    sv('rect', { x: 78, y: 22, width: 104, height: 140, rx: 3, class: 'wrhd-paper' }, pg);
    for (var i = 0; i < 7; i++) sv('line', { x1: 86, y1: 42 + i * 17, x2: 174, y2: 42 + i * 17, class: 'wrhd-rule' }, pg);
    var wx = left ? 74 : 186, hx = left ? 176 : 84;
    if (kind !== 'nohelper') blob(g, hx, 70, 22, 16, left ? 20 : -20);           // the helper hand holds the paper
    pencil(g, wx + (left ? -24 : 24), 112, wx + (left ? 8 : -8), 146);
    blob(g, wx, 132, 20, 16, left ? -30 : 30);                                    // the writing hand
  }
  function postureDrawing(g, kind) {
    var shirt = '#4a7bd0', pants = '#3d4b63', hair = '#6b3f22';
    sv('rect', { x: 0, y: 0, width: 260, height: 200, rx: 10, class: 'wrhd-room' }, g);
    sv('rect', { x: 0, y: 186, width: 260, height: 14, class: 'wrhd-floor' }, g);
    sv('rect', { x: 140, y: 96, width: 110, height: 8, class: 'wrhd-table' }, g); sv('rect', { x: 236, y: 104, width: 7, height: 82, class: 'wrhd-table' }, g);
    sv('rect', { x: 40, y: 122, width: 62, height: 7, class: 'wrhd-chair' }, g); sv('rect', { x: 40, y: 62, width: 7, height: 124, class: 'wrhd-chair' }, g); sv('rect', { x: 95, y: 129, width: 6, height: 57, class: 'wrhd-chair' }, g);
    var slump = kind === 'slump', lean = kind === 'lean', feet = kind === 'feet';
    var hip = [70, 118], neck = slump ? [110, 66] : lean ? [56, 54] : [76, 54], head = slump ? [126, 66] : lean ? [50, 34] : [82, 34];
    // legs
    var knee = [120, 120], foot = feet ? [92, 160] : lean ? [150, 150] : [122, 182];
    sv('path', { d: 'M' + hip + ' L' + knee + ' L' + foot, fill: 'none', stroke: pants, 'stroke-width': 15, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    sv('ellipse', { cx: foot[0] + 8, cy: foot[1] + 3, rx: 12, ry: 5, fill: '#2b2b2b', transform: feet ? 'rotate(60 ' + (foot[0] + 8) + ' ' + (foot[1] + 3) + ')' : null }, g);
    // body
    sv('path', { d: 'M' + hip + (slump ? ' Q' + (hip[0] + 8) + ',' + (neck[1] + 8) + ' ' + neck : ' L' + neck), fill: 'none', stroke: shirt, 'stroke-width': 26, 'stroke-linecap': 'round' }, g);
    // arm to the table
    var hand = lean ? [118, 112] : [172, 92];
    sv('path', { d: 'M' + (neck[0] + 4) + ',' + (neck[1] + 10) + ' L' + (lean ? 96 : neck[0] + 30) + ',' + (lean ? 100 : 92) + ' L' + hand, fill: 'none', stroke: shirt, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    blob(g, hand[0] + 6, hand[1], 8, 6, 0);
    sv('rect', { x: 168, y: 92, width: 40, height: 4, fill: '#fff', stroke: '#c9cfd6' }, g);
    // head
    sv('circle', { cx: head[0], cy: head[1], r: 17, fill: SK, stroke: SKL, 'stroke-width': 2 }, g);
    sv('path', { d: 'M' + (head[0] - 17) + ',' + (head[1] - 2) + ' C' + (head[0] - 16) + ',' + (head[1] - 22) + ' ' + (head[0] + 16) + ',' + (head[1] - 22) + ' ' + (head[0] + 17) + ',' + (head[1] - 4) + ' C' + (head[0] + 6) + ',' + (head[1] - 12) + ' ' + (head[0] - 6) + ',' + (head[1] - 12) + ' ' + (head[0] - 17) + ',' + (head[1] - 2) + 'Z', fill: hair }, g);
    sv('circle', { cx: head[0] + 9, cy: head[1] + 1, r: 2, fill: '#2b2420' }, g);
  }
  var HAND_NOTES = {
    tripod: 'The pencil rests on the middle finger, held by the thumb and pointer finger, a little way up from the point.',
    fist: 'The whole hand is wrapped around the pencil, so the fingers can’t move it.', tip: 'The fingers are right on the sharp point; there is no room to see the writing.',
    top: 'The hand holds the pencil near the eraser, too far from the point.',
    right: 'Right hand: the paper tilts so its top leans left. The other hand holds it still.', left: 'Left hand: the paper tilts so its top leans right. The other hand holds it still.',
    straight: 'Straight paper is fine for printing; many teachers tilt it for cursive.', nohelper: 'Nothing holds the paper, so it slides around.',
    'left-wrong': 'A left-handed writer with the paper tilted for a right hand.', wrong: 'The paper tilts the wrong way for this hand.',
    good: 'Sitting tall and back in the chair, feet flat on the floor, both arms resting on the table.', slump: 'Bent over, with the face close to the paper.',
    lean: 'Leaning far back, with the writing arm off the table.', feet: 'The feet are tucked under the chair instead of flat on the floor.'
  };
  WR.HAND_NOTES = HAND_NOTES;
  V.register('wr-hand', function (el, o) {
    var kind = o.kind || 'grip', F = frame(el, o, 'hand', kind === 'grip' ? 'Ways to hold a pencil' : kind === 'paper' ? 'Paper position on the desk' : 'Sitting to write');
    var shows = o.compare || [o.show || (kind === 'grip' ? 'tripod' : kind === 'paper' ? 'right' : 'good')], left = o.hand === 'left';
    var row = h('div', 'wrhd-row' + (shows.length > 1 ? ' wrhd-cmp' : '')); F.body.appendChild(row);
    shows.forEach(function (s, i) {
      var cell = h('figure', 'wrhd-cell'); row.appendChild(cell);
      if (shows.length > 1) cell.appendChild(h('figcaption', 'wrlt-vlab', letter(i)));
      var vb = kind === 'grip' ? '20 -30 240 200' : kind === 'paper' ? '0 0 260 190' : '0 0 260 200';
      var svg = sv('svg', { viewBox: vb, class: 'wrhd-svg', role: 'img' }); cell.appendChild(svg);
      var g = sv('g', { transform: left && kind === 'grip' ? 'translate(240,0) scale(-1,1)' : null }, svg);
      if (kind === 'grip') gripDrawing(g, s); else if (kind === 'paper') paperDrawing(g, s); else postureDrawing(g, s);
      svg.setAttribute('aria-label', (shows.length > 1 ? letter(i) + ': ' : '') + (F.quiet ? (kind === 'grip' ? 'a hand holding a pencil' : kind === 'paper' ? 'paper and hands on a desk' : 'a child sitting to write') : HAND_NOTES[s] || s));
      if (!F.quiet && o.notes !== false) cell.appendChild(h('figcaption', 'wrhd-note' + (o.good && o.good.indexOf(s) >= 0 ? ' good' : ''), esc(HAND_NOTES[s] || '')));
    });
    return {};
  });
})(typeof window !== 'undefined' ? window : undefined, typeof document !== 'undefined' ? document : undefined);
