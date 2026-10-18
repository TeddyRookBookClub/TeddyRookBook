/* Egyptology Ladder: the shared visual kit (names prefixed eg-) and its model (MathLadder.egypt), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ egypt/viz/egypt.css, which also loads the fonts). Egyptology topic
   pages always load this file, and practice pages load it with the course (MathLadder.loadCourse), so generators may call
   MathLadder.egypt. The model also runs in node: global.window = global; require('…/egypt.js').
   Vanilla JS, no libraries, no network. Every drawing is original; the hieroglyphs are the site's own font, TRB Hieroglyphs
   (static/egypt/fonts/, SIL OFL), drawn by Unicode code point. Sources: /tmp/work_egypt/src/*.js (build: build.sh).
   Conventions for course builders: /tmp/work_egypt/overview.md.

   Embed:  <div class="ml-viz" data-viz="eg-glyphs" data-opts='{"word":"nfr","breakdown":true}'></div>

   SPELLINGS (eg-glyphs, eg-cartouche): Gardiner codes joined MdC-style: '-' the next group, ':' stacked (top over bottom),
     '*' side by side within a group, ( ) to nest, a space between words: 'M23:X1*N35-R4:X1*Q3-X8' is ḥtp-dj-nsw.
     Only signs in MathLadder.egypt.SIGNS can be drawn (the font has exactly those; see "extending the sign list" in overview.md).

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that would give a problem's answer away: transliterations, translations,
                  sign values, names on asked items, verdicts and Check buttons. What the problem asks about stays visible.
     interactive: false   a still picture.    task: a line above the visual.    caption: HTML under it.    label: aria-label.

   THE VISUALS AND THEIR OPTIONS
   eg-glyphs     a word or text in hieroglyphs. word: a WORDS key | name: a NAMES key (no cartouche) | words: [WORDS keys] |
                 num: a number | sp: a spelling (with tl, en, parts: [[code, role, letters]] for the breakdown). dir: 'ltr' (default;
                 signs face left) | 'rtl' (signs face right, read right to left) | 'col' | 'colr' (a column). size: px per group
                 (default 84, shrinks to fit). lines: ['tl', 'say', 'en'] which lines to show; tl: false, en: false, say: true (the
                 Egyptological way to say it), mdc: true (the MdC typing beside the transliteration), note: false, breakdown: true
                 (a table: sign, Gardiner code, what it shows, reading, role: sound sign, phonetic complement, word sign, stroke,
                 determinative, ending). arrow: true (the reading direction). number: true (signs numbered in reading order).
                 ask: n or [n] (a dashed box and "?" on sign n, 0-based). highlight: [n]. Tap a sign for its code, name, value and
                 role (not in quiet mode). quiet: only the signs (and numbers/ask marks).
   eg-cartouche  a royal name in a cartouche. mode: 'show' (name: a NAMES key | signs: [codes] | sp | text: an English name spelled
                 with sound signs) | 'name' (a text box: type a name, see it in sound signs, with a letter-to-sign table) |
                 'build' (tap sound signs from a palette; target: a NAMES key or an English word; palette: [codes]; Check).
                 vertical: true; dir: 'rtl'; size; tl: false, en: false, note: false, breakdown: true (sign chips with values).
                 quiet: no name, transliteration or Check.
   eg-signsort   sort signs into groups. signs: [codes] (or cards: [{ c, bin }]); bins: ['uni', 'bi', 'tri', 'det'] (default) or
                 any of 'logo', 'num', or [{ key, name }]; a logogram counts by its number of consonants unless 'logo' is a bin.
                 names: true (what each sign shows), values: true (its sound), shuffle: false, reveal: true (a Show me button).
                 Tap a sign, then a group; keyboard: focus a sign and press the group's number (0 puts it back). quiet: no Check.
   eg-map        Egypt and Nubia (lat 15–35 N, lon 24–38 E): the Nile and its Delta branches, the cataracts, Lake Nasser, the
                 Faiyum, seas, oases, regions, ancient sites (SITES) and modern cities. view: 'egypt' (default) | 'nile' | 'all' |
                 'delta' | 'memphis' | 'fayum' | 'upper' | 'thebes' | 'nubia' | 'levant' | [s, n, w, e]. layers: [period keys]
                 shown at first (default all); layerChips: false hides the period buttons; sites: [keys] | 'none' (only these);
                 cities: false; cataracts: false; regions: false; labels: false; height (px); full: true (the full-page map: taller,
                 "Go to" buttons, wheel zoom without focus). mode: 'show' (tap a site for its note and periods) | 'place'
                 (target: a site key; the learner taps the map to drop a pin; tol: km for the Check, default 60) | 'pick'
                 (target and choices: [site keys] drawn as lettered dots A, B, C…). Drag to pan, wheel (when focused) or pinch or
                 + − to zoom; keyboard: arrows pan, + − zoom, 0 resets, Enter drops the pin at the center in place mode.
                 quiet: the target's dot and label are hidden, no info box or Check. API (el._ml): marker(), chosen(), fit(view),
                 focus(siteKey).
   eg-timeline   periods (colored, with uncertainty whiskers) and dynasties on a scale. from, to (years; BC negative; default
                 -3200 to 0); dynasties: false; uncertainty: false; kings: [KINGS keys] (reign bars with dates); events:
                 [{ y, label }]; now: a year (a red line); ask: [period keys or king keys or 'd18'] (dashed, "?" in quiet mode).
                 mode: 'show' (tap a period for its dates and note) | 'place' (target: a king key; tap or drag a marker; tol: years,
                 default 60; Check reveals the reign) | 'order' (kings: [keys] or periods: [keys]: put them in order, earliest
                 first, by swapping or ▲ ▼; quiet: lettered, no controls). Dates per Shaw (2000).
   eg-temple     the plan of a New Kingdom temple from the river: quay, avenue of sphinxes, pylon (with obelisks), open court,
                 second pylon, hypostyle hall, offering hall, sanctuary (naos), sacred lake and enclosure wall; the parts are
                 MathLadder.egypt.TEMPLE in order. mode: 'show' (labels; tap a part for its note) | 'label' (numbered 1–7 with a
                 legend) | 'order' (lettered in a shuffled order; tap the parts from the river inward, Check). section: true adds
                 a side view (floor rising, roof dropping). ask: part key ("?"). seed: changes the order's letters. quiet: no
                 legend, labels or Check.
   eg-pyramid    which: 'great' | 'khafre' | 'menkaure' | 'step' | 'bent' | 'red' (PYRAMIDS). view: 'profile' (height, base and
                 angle; units: 'm' | 'ft'; ask: 'h' | 'base' | 'slope' shows "?"; hide: [those]) | 'section' (the Great Pyramid's
                 passages and chambers, to scale, simplified) | 'compare' (compare: [keys], side by side to scale, with the Statue
                 of Liberty; ref: false) | 'build' (layers: 0–20 with a slider, for young explorers). quiet: no names or notes.
   eg-scripts    mode: 'word' (word: a DESCENT key: hieroglyphs, transliteration, a note on hieratic and Demotic, Coptic with its
                 sound; quiet with hide: [row indexes]) | 'rosetta' (the stone's three texts with their surviving line counts;
                 quiet: lettered A B C in order: [band indexes]) | 'coptic' (the alphabet: 24 Greek letters and the 7 from Demotic;
                 ask: a letter) | 'stages' (language stages and scripts on a time axis; ask: a key) | 'sample' (script:
                 'hieroglyphic' | 'coptic' | 'greek' shown; 'hieratic' | 'demotic' described in words). Hieratic and Demotic are
                 not drawn: they have no Unicode encoding and no free font, and freehand copies would not be accurate.

   THE MODEL: MathLadder.egypt (pure data and functions; no DOM; works in node)
     SIGNS {code: { u (the Unicode character), k: 'uni' | 'bi' | 'tri' | 'logo' | 'det' | 'num', v: [sound values], n: what it
       shows, use: word-sign or determinative meaning, m: [ink width, top, bottom] in em }}, SIGN_ORDER; sign(code); signsOf(kind);
     ALPHA [[letter, MdC, Gardiner sign, how it is said, note]] in dictionary order; ALPHA_ORDER; signFor(letter);
     norm(s, strict) the comparison key of a transliteration (the same reader as MathLadder.check's 'translit': Unicode or MdC,
       separators dropped, z = s unless strict; null if unreadable); show(s) Unicode with separators kept; same(a, b);
       mdc(s) the MdC typing form; letters(s); say(s) the Egyptological pronunciation (nfr -> nefer, with traditional
       exceptions like ꜥnḫ -> ankh, jmn -> Amun);
     WORDS {key: { tl, en, sp, parts, note? }} vocabulary with checked spellings; NAMES {key: { tl, en, king, sp, signs, note }}
       royal names; NAME_MAP and nameSigns(name) English letters -> sound signs; NUMERALS, numberSigns(n), numberValue(codes),
       numberSp(n); text(sp) the Unicode string; codes(sp); parse(sp); layout(sp, { dir }) the group layout;
     PERIODS [{ key, name, from, to, pm (uncertainty, years), dyn, cap, note }] and DYNASTIES [{ n, from, to, period }] (Shaw
       2000), period(key), periodOf(year), dynastyOf(year); KINGS [{ key, name, tl?, from, to, dyn, period, built: [monuments],
       note }], king(key); year(y, c) and span(a, b, c) format dates ("c. 1279–1213 BC", "30 BC–AD 14");
     SITES [{ key, name, anc?, lat, lon, kind, region, periods, note }], site(key); CITIES; CATARACTS; GEO (the map's lines);
       VIEWS; project(lat, lon) -> [x, y] km; unproject(x, y); km(a, b) great-circle distance;
     GODS [{ key, name, tl, look, role, center }], god(key); TEMPLE (parts in order) and TEMPLE_EXTRA; PYRAMIDS; LANG_STAGES;
       SCRIPTS; COPTIC_GREEK, COPTIC_GREEK_NAMES, COPTIC_EXTRA (the letters from Demotic); DESCENT (words from Middle Egyptian
       to Sahidic Coptic); ROSETTA; pick(arr, n, rand).                                                                   */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* the sign list subset: Gardiner code -> { u: the Unicode character, k: kind (uni bi tri logo det num), v: sound values,
     n: what it shows, use: logogram or determinative meaning, m: [ink width, ink top, ink bottom] in em in TRB Hieroglyphs } */
  var SIGNS = {"G1":{"u":"𓄿","k":"uni","v":["ꜣ"],"n":"Egyptian vulture","use":"","m":[0.688,0.626,-0.026]},
    "M17":{"u":"𓇋","k":"uni","v":["j"],"n":"flowering reed","use":"also the first sign of many words with yod","m":[0.171,0.691,-0.091]},
    "M17A":{"u":"𓇌","k":"uni","v":["y"],"n":"two flowering reeds","use":"","m":[0.379,0.691,-0.091]},
    "Z4":{"u":"𓏭","k":"uni","v":["y"],"n":"two oblique strokes","use":"also marks the dual","m":[0.2,0.424,0.176]},
    "D36":{"u":"𓂝","k":"uni","v":["ꜥ"],"n":"forearm","use":"","m":[0.771,0.376,0.224]},
    "G43":{"u":"𓅱","k":"uni","v":["w"],"n":"quail chick","use":"also the plural ending -w","m":[0.46,0.672,-0.072]},
    "Z7":{"u":"𓏲","k":"uni","v":["w"],"n":"coil (from the hieratic form of the quail chick)","use":"","m":[0.212,0.525,0.075]},
    "D58":{"u":"𓃀","k":"uni","v":["b"],"n":"foot and lower leg","use":"","m":[0.503,0.5,0.1]},
    "Q3":{"u":"𓊪","k":"uni","v":["p"],"n":"stool of reed matting","use":"","m":[0.352,0.476,0.124]},
    "I9":{"u":"𓆑","k":"uni","v":["f"],"n":"horned viper","use":"also the suffix pronoun \"he, his\" (=f)","m":[0.772,0.41,0.19]},
    "G17":{"u":"𓅓","k":"uni","v":["m"],"n":"owl","use":"also the preposition m \"in, as, from\"","m":[0.515,0.687,-0.087]},
    "N35":{"u":"𓈖","k":"uni","v":["n"],"n":"ripple of water","use":"also the preposition n \"to, for\" and the genitive n","m":[0.798,0.342,0.258]},
    "D21":{"u":"𓂋","k":"uni","v":["r"],"n":"mouth","use":"also the preposition r \"to, toward\"","m":[0.608,0.396,0.204]},
    "O4":{"u":"𓉔","k":"uni","v":["h"],"n":"reed shelter in a field","use":"","m":[0.389,0.51,0.09]},
    "V28":{"u":"𓎛","k":"uni","v":["ḥ"],"n":"twisted wick of flax","use":"","m":[0.178,0.701,-0.101]},
    "Aa1":{"u":"𓐍","k":"uni","v":["ḫ"],"n":"round sign, perhaps a placenta or a sieve","use":"","m":[0.336,0.468,0.132]},
    "F32":{"u":"𓄡","k":"uni","v":["ẖ"],"n":"animal's belly with teats and tail","use":"","m":[0.771,0.43,0.17]},
    "O34":{"u":"𓊃","k":"uni","v":["z"],"n":"door bolt","use":"older books write s (or ś)","m":[0.64,0.392,0.208]},
    "S29":{"u":"𓋴","k":"uni","v":["s"],"n":"folded cloth","use":"","m":[0.165,0.678,-0.078]},
    "N37":{"u":"𓈙","k":"uni","v":["š"],"n":"pool of water","use":"","m":[0.704,0.388,0.212]},
    "N29":{"u":"𓈎","k":"uni","v":["q"],"n":"sandy hill slope","use":"older books write ḳ","m":[0.48,0.436,0.164]},
    "V31":{"u":"𓎡","k":"uni","v":["k"],"n":"basket with a handle","use":"also the suffix pronoun \"you, your\" (=k, said to a man)","m":[0.526,0.415,0.185]},
    "W11":{"u":"𓎼","k":"uni","v":["g"],"n":"ring stand for jars","use":"","m":[0.277,0.534,0.066]},
    "X1":{"u":"𓏏","k":"uni","v":["t"],"n":"loaf of bread","use":"also the feminine ending -t","m":[0.32,0.38,0.22]},
    "V13":{"u":"𓍿","k":"uni","v":["ṯ"],"n":"tethering rope","use":"","m":[0.771,0.408,0.192]},
    "D46":{"u":"𓂧","k":"uni","v":["d"],"n":"hand","use":"","m":[0.77,0.381,0.219]},
    "I10":{"u":"𓆓","k":"uni","v":["ḏ"],"n":"cobra at rest","use":"","m":[0.738,0.492,0.108]},
    "D28":{"u":"𓂓","k":"bi","v":["kꜣ"],"n":"two arms raised","use":"logogram kꜣ \"ka, life force\" (with a stroke)","m":[0.501,0.504,0.096]},
    "G39":{"u":"𓅭","k":"bi","v":["zꜣ"],"n":"pintail duck","use":"logogram zꜣ \"son\" (with a stroke)","m":[0.784,0.56,0.04]},
    "G40":{"u":"𓅮","k":"bi","v":["pꜣ"],"n":"pintail duck in flight","use":"","m":[0.768,0.527,0.073]},
    "G36":{"u":"𓅨","k":"bi","v":["wr"],"n":"swallow","use":"","m":[0.752,0.528,0.072]},
    "G25":{"u":"𓅜","k":"bi","v":["ꜣḫ"],"n":"northern bald ibis (crested ibis)","use":"ꜣḫ \"akh, transfigured spirit; effective\"","m":[0.592,0.673,-0.073]},
    "G29":{"u":"𓅡","k":"bi","v":["bꜣ"],"n":"saddle-billed stork (jabiru)","use":"bꜣ \"ba\"","m":[0.544,0.662,-0.062]},
    "G38":{"u":"𓅬","k":"bi","v":["gb"],"n":"white-fronted goose","use":"in the name of the earth god Geb","m":[0.752,0.56,0.04]},
    "E34":{"u":"𓃹","k":"bi","v":["wn"],"n":"hare","use":"","m":[0.672,0.498,0.102]},
    "E23":{"u":"𓃭","k":"bi","v":["rw"],"n":"lion lying down","use":"writes l in Greek and Roman names (Ptolemy, Cleopatra)","m":[0.757,0.471,0.129]},
    "U1":{"u":"𓌳","k":"bi","v":["mꜣ"],"n":"sickle","use":"","m":[0.462,0.487,0.113]},
    "O1":{"u":"𓉐","k":"bi","v":["pr"],"n":"plan of a house","use":"logogram pr \"house\"; determinative of buildings","m":[0.459,0.466,0.134]},
    "D4":{"u":"𓁹","k":"bi","v":["jr"],"n":"eye","use":"jr(j) \"make, do\"; logogram jrt \"eye\"","m":[0.56,0.435,0.165]},
    "F34":{"u":"𓄣","k":"bi","v":["jb"],"n":"heart","use":"logogram jb \"heart\" (with a stroke)","m":[0.314,0.476,0.124]},
    "V30":{"u":"𓎟","k":"bi","v":["nb"],"n":"basket","use":"nb \"lord; every, all\"","m":[0.48,0.388,0.212]},
    "Y5":{"u":"𓏠","k":"bi","v":["mn"],"n":"game board with pieces","use":"","m":[0.672,0.4,0.2]},
    "F31":{"u":"𓄟","k":"bi","v":["ms"],"n":"three fox skins tied together","use":"ms(j) \"give birth\"","m":[0.288,0.563,0.037]},
    "U36":{"u":"𓍛","k":"bi","v":["ḥm"],"n":"fuller's club","use":"ḥm \"majesty\" in ḥm=f \"His Majesty\"","m":[0.16,0.684,-0.084]},
    "N14":{"u":"𓇼","k":"tri","v":["sbꜣ","dwꜣ"],"n":"star","use":"sbꜣ \"star\"; dwꜣ \"morning; worship\"","m":[0.372,0.478,0.122]},
    "N16":{"u":"𓇾","k":"bi","v":["tꜣ"],"n":"flat land with grains of sand","use":"logogram tꜣ \"land, earth\"","m":[0.608,0.373,0.227]},
    "N26":{"u":"𓈋","k":"bi","v":["ḏw"],"n":"mountain (two peaks and a valley)","use":"logogram ḏw \"mountain\"","m":[0.448,0.404,0.196]},
    "Q1":{"u":"𓊨","k":"bi","v":["st","ws"],"n":"seat","use":"in the names of Isis (ꜣst) and Osiris (wsjr)","m":[0.336,0.484,0.116]},
    "M23":{"u":"𓇓","k":"bi","v":["sw"],"n":"sedge plant","use":"logogram nsw \"king (of Upper Egypt)\"","m":[0.285,0.694,-0.094]},
    "L2":{"u":"𓆤","k":"bi","v":["bj"],"n":"bee","use":"logogram bjt \"bee; king of Lower Egypt\" in nsw-bjt","m":[0.6,0.52,0.08]},
    "D2":{"u":"𓁷","k":"bi","v":["ḥr"],"n":"face","use":"ḥr \"face\"; the preposition ḥr \"on, upon\"","m":[0.4,0.484,0.116]},
    "W24":{"u":"𓏌","k":"bi","v":["nw"],"n":"pot","use":"","m":[0.268,0.4,0.2]},
    "O28":{"u":"𓉺","k":"tri","v":["jwn"],"n":"column with a tenon","use":"in jwnw \"Heliopolis\"","m":[0.208,0.678,-0.078]},
    "O29":{"u":"𓉻","k":"bi","v":["ꜥꜣ"],"n":"wooden column (lying)","use":"ꜥꜣ \"great\"; in pr-ꜥꜣ \"pharaoh\" (the Great House)","m":[0.78,0.38,0.22]},
    "M12":{"u":"𓆼","k":"bi","v":["ḫꜣ"],"n":"lotus plant","use":"the numeral 1,000","m":[0.284,0.692,-0.092]},
    "Aa11":{"u":"𓐙","k":"tri","v":["mꜣꜥ"],"n":"platform or pedestal","use":"mꜣꜥ \"true\"; mꜣꜥt \"Maat, truth, order\"","m":[0.704,0.348,0.252]},
    "X8":{"u":"𓏙","k":"bi","v":["dj"],"n":"conical loaf","use":"rdj / dj \"give\"","m":[0.192,0.54,0.06]},
    "V4":{"u":"𓍯","k":"bi","v":["wꜣ"],"n":"lasso","use":"writes o in Greek names (Ptolemy, Cleopatra)","m":[0.225,0.557,0.043]},
    "F21":{"u":"𓄔","k":"logo","v":["sḏm"],"n":"cow's ear","use":"logogram for sḏm \"hear\" (with s and m)","m":[0.212,0.54,0.06]},
    "N28":{"u":"𓈍","k":"bi","v":["ḫꜥ"],"n":"hill with the rays of the rising sun","use":"ḫꜥ \"appear in glory, rise\"","m":[0.32,0.438,0.162]},
    "Aa15":{"u":"𓐝","k":"uni","v":["m"],"n":"a flat sign of uncertain meaning","use":"a second sign for m (as in Ptolemy)","m":[0.36,0.349,0.251]},
    "S34":{"u":"𓋹","k":"tri","v":["ꜥnḫ"],"n":"sandal strap (the ankh)","use":"ꜥnḫ \"life; live\"","m":[0.307,0.697,-0.097]},
    "F35":{"u":"𓄤","k":"tri","v":["nfr"],"n":"heart and windpipe","use":"nfr \"good, beautiful\"","m":[0.224,0.677,-0.077]},
    "R4":{"u":"𓊵","k":"tri","v":["ḥtp"],"n":"loaf on a reed mat","use":"ḥtp \"offering; peace, be content\"","m":[0.64,0.46,0.14]},
    "R8":{"u":"𓊹","k":"tri","v":["nṯr"],"n":"cloth wound on a pole (a temple flag)","use":"logogram nṯr \"god\"","m":[0.16,0.692,-0.092]},
    "L1":{"u":"𓆣","k":"tri","v":["ḫpr"],"n":"dung beetle (scarab)","use":"ḫpr \"come into being, become\"","m":[0.427,0.568,0.032]},
    "P8":{"u":"𓊤","k":"tri","v":["ḫrw"],"n":"oar","use":"ḫrw \"voice\" (mꜣꜥ-ḫrw \"true of voice\")","m":[0.145,0.684,-0.084]},
    "S38":{"u":"𓋾","k":"tri","v":["ḥqꜣ"],"n":"crook (shepherd's staff)","use":"ḥqꜣ \"ruler, rule\"","m":[0.168,0.676,-0.076]},
    "F12":{"u":"𓄊","k":"tri","v":["wsr"],"n":"head and neck of a canine","use":"wsr \"powerful\"","m":[0.236,0.692,-0.092]},
    "R11":{"u":"𓊽","k":"bi","v":["ḏd"],"n":"djed pillar","use":"ḏd \"stable, enduring\"","m":[0.208,0.676,-0.076]},
    "S12":{"u":"𓋞","k":"tri","v":["nbw"],"n":"collar of beads","use":"logogram nbw \"gold\"","m":[0.544,0.433,0.167]},
    "E9":{"u":"𓃛","k":"bi","v":["jw"],"n":"newborn hartebeest calf, lying down","use":"jw, as in jw \"come\" and jw (the particle)","m":[0.732,0.52,0.08]},
    "W19":{"u":"𓏇","k":"bi","v":["mj"],"n":"milk jug with a carrying net","use":"mj \"like\"; mj \"come!\"","m":[0.288,0.574,0.026]},
    "O50":{"u":"𓊗","k":"bi","v":["zp"],"n":"threshing floor covered with grain","use":"zp \"time, occasion\"; in ḥꜣt-zp \"regnal year\"","m":[0.288,0.444,0.156]},
    "M18":{"u":"𓇍","k":"bi","v":["jj"],"n":"flowering reed with walking legs","use":"jj \"come\"","m":[0.32,0.692,-0.092]},
    "U7":{"u":"𓌻","k":"bi","v":["mr"],"n":"hoe","use":"mr, as in mrj \"love\"","m":[0.49,0.585,0.015]},
    "D37":{"u":"𓂞","k":"bi","v":["dj"],"n":"forearm with a hand holding a conical loaf","use":"rdj / dj \"give\"","m":[0.771,0.444,0.156]},
    "U15":{"u":"𓍃","k":"bi","v":["tm"],"n":"sledge","use":"tm, as in tm \"not to do\" and jtmw \"Atum\"","m":[0.752,0.38,0.22]},
    "W25":{"u":"𓏎","k":"tri","v":["jnj"],"n":"pot with walking legs","use":"jnj \"bring\"","m":[0.287,0.55,0.05]},
    "D35":{"u":"𓂜","k":"uni","v":["n"],"n":"arms in the gesture of negation","use":"the negative n (also nn); in jwtj \"who is not\"","m":[0.725,0.409,0.191]},
    "N11":{"u":"𓇹","k":"logo","v":["jꜥḥ"],"n":"crescent moon","use":"jꜥḥ \"moon\"; ꜣbd \"month\" (with a star)","m":[0.608,0.388,0.212]},
    "M4":{"u":"𓆳","k":"logo","v":["rnp"],"n":"palm rib stripped of its leaves","use":"rnpt \"year\"","m":[0.122,0.684,-0.084]},
    "N5":{"u":"𓇳","k":"logo","v":["rꜥ","hrw","sw"],"n":"sun","use":"rꜥ \"sun, Ra\"; hrw \"day\"; determinative of the sun, light and time","m":[0.288,0.444,0.156]},
    "N35A":{"u":"𓈗","k":"logo","v":["mw"],"n":"three ripples of water","use":"logogram mw \"water\"; determinative of water and liquids","m":[0.795,0.446,0.154]},
    "G5":{"u":"𓅃","k":"logo","v":["ḥr"],"n":"falcon","use":"logogram ḥr \"Horus\"","m":[0.512,0.664,-0.064]},
    "G26":{"u":"𓅝","k":"logo","v":["ḏḥwtj"],"n":"sacred ibis on a standard","use":"logogram ḏḥwtj \"Thoth\"","m":[0.449,0.66,-0.06]},
    "E15":{"u":"𓃢","k":"logo","v":["jnpw"],"n":"jackal lying on a shrine (here without the shrine)","use":"determinative and logogram of Anubis (jnpw)","m":[0.773,0.579,0.021]},
    "H8":{"u":"𓆇","k":"det","v":[],"n":"egg","use":"determinative of goddesses' names (with t) and of eggs","m":[0.192,0.428,0.172]},
    "A1":{"u":"𓀀","k":"det","v":[],"n":"seated man","use":"determinative of men and their names and jobs; also the suffix \"I, my\" (=j)","m":[0.352,0.674,-0.074]},
    "B1":{"u":"𓁐","k":"det","v":[],"n":"seated woman","use":"determinative of women and their names","m":[0.352,0.676,-0.076]},
    "A2":{"u":"𓀁","k":"det","v":[],"n":"man with his hand to his mouth","use":"determinative of eating, drinking, speaking, thinking and feeling","m":[0.352,0.674,-0.074]},
    "A40":{"u":"𓀭","k":"det","v":[],"n":"seated god","use":"determinative of gods and of the king","m":[0.352,0.677,-0.077]},
    "A24":{"u":"𓀜","k":"det","v":[],"n":"man striking with a stick","use":"determinative of force and effort","m":[0.459,0.695,-0.095]},
    "A53":{"u":"𓀾","k":"det","v":[],"n":"standing mummy","use":"determinative of mummies, statues and likenesses","m":[0.181,0.686,-0.086]},
    "A55":{"u":"𓁀","k":"det","v":[],"n":"mummy lying on a bed","use":"determinative of death and lying down","m":[0.752,0.44,0.16]},
    "C11":{"u":"𓁨","k":"num","v":[],"n":"god Heh, arms raised","use":"the numeral 1,000,000; ḥḥ \"millions, eternity\"","m":[0.389,0.694,-0.094]},
    "D54":{"u":"𓂻","k":"det","v":[],"n":"walking legs","use":"determinative of motion","m":[0.551,0.58,0.02]},
    "D50":{"u":"𓂭","k":"num","v":[],"n":"finger","use":"the numeral 10,000","m":[0.13,0.676,-0.076]},
    "Y1":{"u":"𓏛","k":"det","v":[],"n":"papyrus roll, tied and sealed","use":"determinative of writing and of abstract ideas","m":[0.56,0.408,0.192]},
    "N1":{"u":"𓇯","k":"logo","v":["pt"],"n":"sky","use":"determinative of the sky and of things above; logogram pt \"sky\"","m":[0.768,0.372,0.228]},
    "N25":{"u":"𓈉","k":"det","v":[],"n":"three hills (desert country)","use":"determinative of foreign lands and the desert; logogram ḫꜣst \"foreign land\"","m":[0.544,0.452,0.148]},
    "O49":{"u":"𓊖","k":"det","v":[],"n":"village with crossroads","use":"determinative of towns; logogram njwt \"town\"","m":[0.288,0.444,0.156]},
    "G7":{"u":"𓅆","k":"det","v":[],"n":"falcon on a standard","use":"determinative of gods and of the king","m":[0.36,0.674,-0.074]},
    "I12":{"u":"𓆗","k":"det","v":[],"n":"rearing cobra","use":"determinative of goddesses","m":[0.328,0.658,-0.058]},
    "E1":{"u":"𓃒","k":"det","v":[],"n":"bull","use":"determinative of cattle","m":[0.743,0.564,0.036]},
    "K1":{"u":"𓆛","k":"det","v":[],"n":"tilapia fish","use":"determinative of fish","m":[0.764,0.476,0.124]},
    "M2":{"u":"𓆰","k":"det","v":[],"n":"plant","use":"determinative of plants and flowers","m":[0.29,0.539,0.061]},
    "T14":{"u":"𓌙","k":"det","v":[],"n":"throw stick","use":"determinative of foreign peoples and lands","m":[0.384,0.412,0.188]},
    "F27":{"u":"𓄛","k":"det","v":[],"n":"cow's skin with its tail","use":"determinative of animals and of skins","m":[0.217,0.564,0.036]},
    "W22":{"u":"𓏊","k":"det","v":[],"n":"beer jug","use":"determinative of beer and of jars","m":[0.222,0.548,0.052]},
    "N33":{"u":"𓈒","k":"det","v":[],"n":"grain of sand","use":"determinative of sand, minerals and grains","m":[0.112,0.356,0.244]},
    "G37":{"u":"𓅪","k":"det","v":[],"n":"sparrow","use":"determinative of small, bad, weak or wrong things","m":[0.704,0.528,0.072]},
    "U21":{"u":"𓍉","k":"tri","v":["stp"],"n":"adze working a block of wood","use":"stp \"choose\"; in stp-n-rꜥ \"chosen of Ra\" in royal names","m":[0.534,0.644,-0.044]},
    "N36":{"u":"𓈘","k":"bi","v":["mr"],"n":"channel filled with water","use":"mr \"canal\"; writes mr, as in mrj \"beloved\" (mrj-jmn \"beloved of Amun\")","m":[0.768,0.356,0.244]},
    "H6":{"u":"𓆄","k":"logo","v":["mꜣꜥt","šw"],"n":"ostrich feather","use":"mꜣꜥt \"truth, Maat\" (the feather of Maat); šw \"Shu\", the god of air","m":[0.156,0.684,-0.084]},
    "C10":{"u":"𓁦","k":"logo","v":["mꜣꜥt"],"n":"seated goddess with a feather on her head (Maat)","use":"the goddess Maat; mꜣꜥt \"truth, order\", as in the royal names Nebmaatre and Usermaatre","m":[0.352,0.692,-0.092]},
    "I3":{"u":"𓆊","k":"det","v":[],"n":"crocodile","use":"determinative of crocodiles and of the crocodile god Sobek (sbk)","m":[0.776,0.459,0.141]},
    "Z1":{"u":"𓏤","k":"logo","v":[],"n":"single stroke","use":"marks a logogram (a sign that means what it shows); the numeral 1","m":[0.056,0.54,0.06]},
    "Z2":{"u":"𓏥","k":"det","v":[],"n":"three strokes","use":"the plural","m":[0.24,0.436,0.164]},
    "V10":{"u":"𓍷","k":"det","v":[],"n":"cartouche (shen ring stretched long)","use":"encloses a royal name; determinative of names","m":[0.256,0.676,-0.076]},
    "V20":{"u":"𓎆","k":"num","v":[],"n":"hobble for cattle","use":"the numeral 10","m":[0.256,0.452,0.148]},
    "V1":{"u":"𓍢","k":"num","v":[],"n":"coil of rope","use":"the numeral 100","m":[0.245,0.542,0.058]},
    "I8":{"u":"𓆐","k":"num","v":[],"n":"tadpole","use":"the numeral 100,000","m":[0.481,0.396,0.204]}};
  var SIGN_ORDER = ["G1", "M17", "M17A", "Z4", "D36", "G43", "Z7", "D58", "Q3", "I9", "G17", "N35", "D21", "O4", "V28", "Aa1", "F32", "O34", "S29", "N37", "N29", "V31", "W11", "X1", "V13", "D46", "I10", "D28", "G39", "G40", "G36", "G25", "G29", "G38", "E34", "E23", "U1", "O1", "D4", "F34", "V30", "Y5", "F31", "U36", "N14", "N16", "N26", "Q1", "M23", "L2", "D2", "W24", "O28", "O29", "M12", "Aa11", "X8", "V4", "F21", "N28", "Aa15", "S34", "F35", "R4", "R8", "L1", "P8", "S38", "F12", "R11", "S12", "E9", "W19", "O50", "M18", "U7", "D37", "U15", "W25", "D35", "N11", "M4", "N5", "N35A", "G5", "G26", "E15", "H8", "A1", "B1", "A2", "A40", "A24", "A53", "A55", "C11", "D54", "D50", "Y1", "N1", "N25", "O49", "G7", "I12", "E1", "K1", "M2", "T14", "F27", "W22", "N33", "G37", "U21", "N36", "H6", "C10", "I3", "Z1", "Z2", "V10", "V20", "V1", "I8"];
  /* ---------------------------------------------------------------- the alphabet and transliteration */
  // [letter, MdC, Gardiner sign, how Egyptologists say it, a note]
  var ALPHA = [
    ['ꜣ', 'A', 'G1', 'a', 'a glottal sound (once an r- or l-like sound); said "ah"'],
    ['j', 'i', 'M17', 'i', 'yod, a glottal stop or y; said "ee"; the site writes j (older books ꞽ, ỉ or i)'],
    ['y', 'y', 'M17A', 'y', 'y; written with two reeds or two strokes'],
    ['ꜥ', 'a', 'D36', 'a', 'a sound made deep in the throat (Arabic ʿayn); said "ah"'],
    ['w', 'w', 'G43', 'w / u', 'w, said "oo" between consonants'],
    ['b', 'b', 'D58', 'b', ''], ['p', 'p', 'Q3', 'p', ''], ['f', 'f', 'I9', 'f', ''], ['m', 'm', 'G17', 'm', ''], ['n', 'n', 'N35', 'n', ''],
    ['r', 'r', 'D21', 'r', ''], ['h', 'h', 'O4', 'h', 'as in "house"'],
    ['ḥ', 'H', 'V28', 'h', 'an emphatic h (Arabic ḥ)'],
    ['ḫ', 'x', 'Aa1', 'kh', 'as in Scottish "loch"'],
    ['ẖ', 'X', 'F32', 'kh', 'a softer kh, as in German "ich"'],
    ['z', 'z', 'O34', 's / z', 'once a z; merged with s by the Middle Kingdom (older books write s or ś)'],
    ['s', 's', 'S29', 's', ''], ['š', 'S', 'N37', 'sh', ''],
    ['q', 'q', 'N29', 'k', 'a k made farther back (older books write ḳ)'], ['k', 'k', 'V31', 'k', ''], ['g', 'g', 'W11', 'g', 'as in "go"'],
    ['t', 't', 'X1', 't', ''], ['ṯ', 'T', 'V13', 'tj / ch', 'as in "church"'],
    ['d', 'd', 'D46', 'd', ''], ['ḏ', 'D', 'I10', 'dj / j', 'as in "judge"']
  ];
  var ALPHA_ORDER = ALPHA.map(function (a) { return a[0]; }).join('');
  // the transliteration reader: same rules as MathLadder.check's 'translit' answers (core/check.js); kept in step by the kit's tests
  var TL_PLAIN = { A: 'ꜣ', '3': 'ꜣ', 'ȝ': 'ꜣ', 'Ȝ': 'ꜣ', 'Ꜣ': 'ꜣ', 'ꜣ': 'ꜣ', a: 'ꜥ', 'ʿ': 'ꜥ', 'ʽ': 'ꜥ', '‘': 'ꜥ', '`': 'ꜥ', 'Ꜥ': 'ꜥ', 'ꜥ': 'ꜥ',
    i: 'j', I: 'j', j: 'j', J: 'j', 'ꞽ': 'j', 'Ꞽ': 'j', 'ı': 'j', y: 'y', Y: 'y', H: 'ḥ', x: 'ḫ', X: 'ẖ', S: 'š', T: 'ṯ', D: 'ḏ', Z: 'z', z: 'z',
    Q: 'q', q: 'q', w: 'w', W: 'w', b: 'b', B: 'b', p: 'p', P: 'p', f: 'f', F: 'f', m: 'm', M: 'm', n: 'n', N: 'n', r: 'r', R: 'r',
    h: 'h', s: 's', k: 'k', K: 'k', g: 'g', G: 'g', t: 't', d: 'd', l: 'l', L: 'l', 'ꜧ': 'ḥ' };
  var TL_MARK = { 'ḥ': 'ḥ', 'ḫ': 'ḫ', 'ẖ': 'ẖ', 'h̲': 'ẖ', 'š': 'š', 'ś': 'z', 'ṯ': 'ṯ', 't̲': 'ṯ',
    'ḏ': 'ḏ', 'd̲': 'ḏ', 'ḳ': 'q', 'i͗': 'j', 'i̯': 'j', 'ỉ': 'j', 'ı͗': 'j', 'j͗': 'j', 'ẓ': 'z' };
  var TL_SEP = /[\s.\-=‧·‐‑–—()[\]{}⸢⸣⟨⟩<>\/:,;'’"?!]/;
  function tlLetters(raw, seps) {
    var s = String(raw == null ? '' : raw); if (s.normalize) s = s.normalize('NFD');
    var out = [], bad = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (/[̀-ͯ]/.test(c)) continue;
      var marks = ''; while (i + 1 < s.length && /[̀-ͯ]/.test(s[i + 1])) marks += s[++i];
      if (TL_SEP.test(c)) { if (c === '’' && !seps) { out.push('ꜥ'); continue; } if (seps) out.push(c === '‐' || c === '‑' ? '-' : c); continue; }
      var hit = null;
      if (marks) { var lc = c.toLowerCase(); for (var k = 0; k < marks.length && !hit; k++) hit = TL_MARK[lc + marks[k]] || null; if (!hit && TL_PLAIN[lc] && /^[a-z]$/.test(lc) && !/[HXSTDA]/.test(c)) hit = TL_PLAIN[lc]; if (!hit) hit = TL_PLAIN[c] || null; }
      else hit = TL_PLAIN[c] || null;
      if (!hit) { var pre = c.normalize ? c.normalize('NFC') : c, lo = pre.toLowerCase(); if ('ḥḫẖšṯḏqꜣꜥ'.indexOf(lo) >= 0) hit = lo; else if (lo === 'ḳ') hit = 'q'; else if (lo === 'ś') hit = 'z'; else if (lo === 'ỉ') hit = 'j'; }
      if (!hit) { bad = true; out.push(null); } else out.push(hit);
    }
    return { letters: out, bad: bad };
  }
  function tlNorm(raw, strict) { var L = tlLetters(raw, false); if (L.bad) return null; var k = L.letters.join(''); return strict ? k : k.replace(/z/g, 's'); }
  function tlShow(raw) { return tlLetters(raw, true).letters.map(function (c) { return c === null ? '?' : c; }).join('').replace(/\s+/g, ' ').trim(); }
  function tlSame(a, b, strict) { var x = tlNorm(a, strict), y = tlNorm(b, strict); return x !== null && x === y; }
  // MdC typing form of a transliteration (ḥtp-dj-nsw -> Htp-di-nsw)
  var TO_MDC = { 'ꜣ': 'A', 'j': 'i', 'ꜥ': 'a', 'ḥ': 'H', 'ḫ': 'x', 'ẖ': 'X', 'š': 'S', 'ṯ': 'T', 'ḏ': 'D' };
  function toMdc(tl) { return tlShow(tl).replace(/[ꜣjꜥḥḫẖšṯḏ]/g, function (c) { return TO_MDC[c]; }); }
  /* The Egyptological convention for saying words aloud (not how Egyptians spoke: vowels weren't written): ꜣ and ꜥ are
     said "a", j "i", w "u" between consonants, and an "e" goes between other consonants (nfr "nefer", ḥtp "hetep"). */
  var SAY = { 'ꜣ': 'a', 'ꜥ': 'a', 'j': 'i', 'y': 'y', 'w': 'w', 'b': 'b', 'p': 'p', 'f': 'f', 'm': 'm', 'n': 'n', 'r': 'r', 'h': 'h', 'ḥ': 'h', 'ḫ': 'kh', 'ẖ': 'kh',
    'z': 's', 's': 's', 'š': 'sh', 'q': 'k', 'k': 'k', 'g': 'g', 't': 't', 'ṯ': 'tj', 'd': 'd', 'ḏ': 'dj' };
  var SAY_TRAD = { 'ꜥnḫ': 'ankh', 'ptḥ': 'Ptah', 'jmn': 'Amun', 'rꜥ': 'Ra', 'ḥr': 'Horus', 'ꜣst': 'Iset', 'kꜣ': 'ka', 'bꜣ': 'ba', 'ꜣḫ': 'akh', 'mꜣꜥt': 'maat', 'nṯr': 'netjer', 'ḥtp-dj-nsw': 'hetep-di-nesu', 'nsw': 'nesu', 'nsw-bjt': 'nesu-bity', 'zꜣ-rꜥ': 'sa-Ra', 'pr-ꜥꜣ': 'per-aa' };
  function vocalize(tl) {
    var key = tlShow(tl); if (SAY_TRAD[key]) return SAY_TRAD[key];
    return tlShow(tl).split(/([\s\-=.]+)/).map(function (part) {
      if (/^[\s\-=.]+$/.test(part)) return /-|\s/.test(part) ? '-' : '';
      var L = part.split(''), out = '';
      for (var i = 0; i < L.length; i++) {
        var c = L[i], vow = c === 'ꜣ' || c === 'ꜥ' || c === 'j';
        var prevVow = i > 0 && /[ꜣꜥj]/.test(L[i - 1]) || (i > 0 && L[i - 1] === 'w' && out.slice(-1) === 'u');
        if (c === 'w' && i > 0 && !/[ꜣꜥj]/.test(L[i - 1]) && (i === L.length - 1 || !/[ꜣꜥj]/.test(L[i + 1]))) { out += 'u'; continue; }
        if (!vow && i > 0 && !prevVow && out && !/[aeiou]$/.test(out)) out += 'e';
        out += SAY[c] || c;
      }
      if (/^[^aeiou]+$/.test(out) && out.length > 1) out = out[0] + 'e' + out.slice(1);
      return out;
    }).join('').replace(/^-+|-+$/g, '');
  }

  /* ---------------------------------------------------------------- words and names
     A spelling uses the layout code of eg-glyphs: Gardiner codes; '-' next group, ':' stack (top over bottom), '*' side by side
     in a group, ( ) to nest, a space between words. parts: [[signs, role, letters]] for the sign-by-sign breakdown, role is
     'phon' (sound sign), 'comp' (phonetic complement: repeats a sound already written), 'logo' (word sign), 'stroke' (Z1 with
     a logogram), 'det' (determinative), 'end' (an ending such as -t or -w). */
  var WORDS = {
    nfr: { tl: 'nfr', en: 'good, beautiful', sp: 'F35-I9:D21', parts: [['F35', 'phon', 'nfr'], ['I9', 'comp', 'f'], ['D21', 'comp', 'r']] },
    ankh: { tl: 'ꜥnḫ', en: 'life; to live', sp: 'S34-N35:Aa1', parts: [['S34', 'phon', 'ꜥnḫ'], ['N35', 'comp', 'n'], ['Aa1', 'comp', 'ḫ']] },
    hetep: { tl: 'ḥtp', en: 'offering; peace, be content', sp: 'R4:X1*Q3', parts: [['R4', 'phon', 'ḥtp'], ['X1', 'comp', 't'], ['Q3', 'comp', 'p']] },
    netjer: { tl: 'nṯr', en: 'god', sp: 'R8-A40', parts: [['R8', 'logo', 'nṯr'], ['A40', 'det', '']] },
    ra: { tl: 'rꜥ', en: 'sun; the sun god Ra', sp: 'D21:D36-N5:Z1', parts: [['D21', 'phon', 'r'], ['D36', 'phon', 'ꜥ'], ['N5', 'det', ''], ['Z1', 'stroke', '']] },
    per: { tl: 'pr', en: 'house', sp: 'O1:Z1', parts: [['O1', 'logo', 'pr'], ['Z1', 'stroke', '']] },
    ren: { tl: 'rn', en: 'name', sp: 'D21:N35', parts: [['D21', 'phon', 'r'], ['N35', 'phon', 'n']] },
    za: { tl: 'zꜣ', en: 'son', sp: 'G39-Z1', parts: [['G39', 'logo', 'zꜣ'], ['Z1', 'stroke', '']] },
    zat: { tl: 'zꜣt', en: 'daughter', sp: 'G39-X1:B1', parts: [['G39', 'phon', 'zꜣ'], ['X1', 'end', 't'], ['B1', 'det', '']] },
    neb: { tl: 'nb', en: 'lord; every, all', sp: 'V30', parts: [['V30', 'phon', 'nb']] },
    nebet: { tl: 'nbt', en: 'lady, mistress', sp: 'V30:X1', parts: [['V30', 'phon', 'nb'], ['X1', 'end', 't']] },
    mu: { tl: 'mw', en: 'water', sp: 'N35A', parts: [['N35A', 'logo', 'mw']] },
    ta: { tl: 'tꜣ', en: 'land, earth', sp: 'N16:Z1', parts: [['N16', 'logo', 'tꜣ'], ['Z1', 'stroke', '']] },
    pet: { tl: 'pt', en: 'sky', sp: 'Q3:X1-N1', parts: [['Q3', 'phon', 'p'], ['X1', 'phon', 't'], ['N1', 'det', '']] },
    heru: { tl: 'hrw', en: 'day', sp: 'O4-D21:G43-N5', parts: [['O4', 'phon', 'h'], ['D21', 'phon', 'r'], ['G43', 'phon', 'w'], ['N5', 'det', '']] },
    ib: { tl: 'jb', en: 'heart', sp: 'F34:Z1', parts: [['F34', 'logo', 'jb'], ['Z1', 'stroke', '']] },
    ka: { tl: 'kꜣ', en: 'ka, life force', sp: 'D28:Z1', parts: [['D28', 'logo', 'kꜣ'], ['Z1', 'stroke', '']] },
    ba: { tl: 'bꜣ', en: 'ba, the soul that can move about', sp: 'G29', parts: [['G29', 'logo', 'bꜣ']] },
    akh: { tl: 'ꜣḫ', en: 'akh, the transfigured spirit', sp: 'G25', parts: [['G25', 'logo', 'ꜣḫ']] },
    kheper: { tl: 'ḫpr', en: 'come into being, become', sp: 'L1-D21', parts: [['L1', 'phon', 'ḫpr'], ['D21', 'comp', 'r']] },
    djew: { tl: 'ḏw', en: 'mountain', sp: 'N26', parts: [['N26', 'logo', 'ḏw']] },
    niwt: { tl: 'njwt', en: 'town, city', sp: 'O49:X1*Z1', parts: [['O49', 'logo', 'njwt'], ['X1', 'comp', 't'], ['Z1', 'stroke', '']] },
    heqa: { tl: 'ḥqꜣ', en: 'ruler', sp: 'S38-N29:G1-A1', parts: [['S38', 'phon', 'ḥqꜣ'], ['N29', 'comp', 'q'], ['G1', 'comp', 'ꜣ'], ['A1', 'det', '']] },
    wer: { tl: 'wr', en: 'great', sp: 'G36-D21', parts: [['G36', 'phon', 'wr'], ['D21', 'comp', 'r']] },
    nebu: { tl: 'nbw', en: 'gold', sp: 'S12', parts: [['S12', 'logo', 'nbw']] },
    nesu: { tl: 'nsw', en: 'king (of Upper Egypt)', sp: 'M23:X1*N35', parts: [['M23', 'logo', 'nsw'], ['X1', 'comp', 't'], ['N35', 'comp', 'n']], note: 'The sedge is written first out of honor, and the t is part of the old spelling; it reads nsw.' },
    pharaoh: { tl: 'pr-ꜥꜣ', en: 'Great House (the palace); later "pharaoh"', sp: 'O1-O29', parts: [['O1', 'logo', 'pr'], ['O29', 'phon', 'ꜥꜣ']] },
    nesubit: { tl: 'nsw-bjt', en: 'King of Upper and Lower Egypt', sp: 'M23:X1-L2:X1', parts: [['M23', 'logo', 'nsw'], ['X1', 'comp', 't'], ['L2', 'logo', 'bjt'], ['X1', 'comp', 't']] },
    zara: { tl: 'zꜣ-rꜥ', en: 'son of Ra', sp: 'G39-N5', parts: [['G39', 'phon', 'zꜣ'], ['N5', 'logo', 'rꜥ']] },
    hemef: { tl: 'ḥm=f', en: 'His Majesty', sp: 'U36-I9', parts: [['U36', 'phon', 'ḥm'], ['I9', 'phon', 'f']] },
    remetj: { tl: 'rmṯ', en: 'people', sp: 'D21:G17-V13-A1:B1*Z2', parts: [['D21', 'phon', 'r'], ['G17', 'phon', 'm'], ['V13', 'phon', 'ṯ'], ['A1', 'det', ''], ['B1', 'det', ''], ['Z2', 'det', '']] },
    zi: { tl: 'z', en: 'man', sp: 'O34-A1', parts: [['O34', 'phon', 'z'], ['A1', 'det', '']] },
    it: { tl: 'jt', en: 'father', sp: 'M17-X1:I9-A1', parts: [['M17', 'phon', 'j'], ['X1', 'phon', 't'], ['I9', 'old', 'f'], ['A1', 'det', '']], note: 'The f is left over from an older form of the word (jtf).' },
    sedjem: { tl: 'sḏm', en: 'hear', sp: 'S29-F21-G17', parts: [['S29', 'comp', 's'], ['F21', 'logo', 'sḏm'], ['G17', 'comp', 'm']] },
    djed: { tl: 'ḏd', en: 'say', sp: 'I10:D46', parts: [['I10', 'phon', 'ḏ'], ['D46', 'phon', 'd']] },
    menu: { tl: 'mn', en: 'remain, endure', sp: 'Y5:N35', parts: [['Y5', 'phon', 'mn'], ['N35', 'comp', 'n']] },
    maat: { tl: 'mꜣꜥt', en: 'Maat: truth, order, justice', sp: 'Aa11:D36*X1-Y1', parts: [['Aa11', 'phon', 'mꜣꜥ'], ['D36', 'comp', 'ꜥ'], ['X1', 'end', 't'], ['Y1', 'det', '']], note: 'Often written with a feather or a seated goddess as the last sign instead.' },
    amun: { tl: 'jmn', en: 'Amun (the hidden one)', sp: 'M17-Y5:N35-A40', parts: [['M17', 'phon', 'j'], ['Y5', 'phon', 'mn'], ['N35', 'comp', 'n'], ['A40', 'det', '']] },
    ptah: { tl: 'ptḥ', en: 'Ptah', sp: 'Q3:X1-V28-A40', parts: [['Q3', 'phon', 'p'], ['X1', 'phon', 't'], ['V28', 'phon', 'ḥ'], ['A40', 'det', '']] },
    osiris: { tl: 'wsjr', en: 'Osiris', sp: 'Q1-D4-A40', parts: [['Q1', 'phon', 'ws'], ['D4', 'phon', 'jr'], ['A40', 'det', '']] },
    isis: { tl: 'ꜣst', en: 'Isis', sp: 'Q1:X1-H8', parts: [['Q1', 'phon', 'st'], ['X1', 'phon', 't'], ['H8', 'det', '']], note: 'The seat writes st here; the ꜣ is not written.' },
    horus: { tl: 'ḥr', en: 'Horus', sp: 'G5', parts: [['G5', 'logo', 'ḥr']] },
    anubis: { tl: 'jnpw', en: 'Anubis', sp: 'M17-N35:Q3-G43-E15', parts: [['M17', 'phon', 'j'], ['N35', 'phon', 'n'], ['Q3', 'phon', 'p'], ['G43', 'phon', 'w'], ['E15', 'det', '']] },
    thoth: { tl: 'ḏḥwtj', en: 'Thoth', sp: 'G26', parts: [['G26', 'logo', 'ḏḥwtj']] },
    geb: { tl: 'gb', en: 'Geb, the earth god', sp: 'G38-D58-A40', parts: [['G38', 'phon', 'gb'], ['D58', 'comp', 'b'], ['A40', 'det', '']] },
    jwnw: { tl: 'jwnw', en: 'Heliopolis (Iunu)', sp: 'O28-W24:O49', parts: [['O28', 'phon', 'jwn'], ['W24', 'phon', 'w'], ['O49', 'det', '']], note: 'The pot nw repeats the n and adds the w.' },
    khasut: { tl: 'ḫꜣst', en: 'foreign land, desert hills', sp: 'N25', parts: [['N25', 'logo', 'ḫꜣst']] },
    htpdinsw: { tl: 'ḥtp-dj-nsw', en: 'an offering that the king gives', sp: 'M23:X1*N35-R4:X1*Q3-X8', parts: [['M23', 'logo', 'nsw'], ['X1', 'comp', 't'], ['N35', 'comp', 'n'], ['R4', 'phon', 'ḥtp'], ['X1', 'comp', 't'], ['Q3', 'comp', 'p'], ['X8', 'phon', 'dj']], note: 'The words for king come first out of honor, but are read last: ḥtp-dj-nsw.' },
    netjeru: { tl: 'nṯrw', en: 'gods', sp: 'R8*R8*R8', parts: [['R8', 'logo', 'nṯr'], ['R8', 'plural', ''], ['R8', 'plural', '']], note: 'Writing the sign three times shows the plural: nṯrw.' },
    netjeret: { tl: 'nṯrt', en: 'goddess', sp: 'R8-X1-I12', parts: [['R8', 'logo', 'nṯr'], ['X1', 'end', 't'], ['I12', 'det', '']] },
    peru: { tl: 'prw', en: 'houses', sp: 'O1-Z2', parts: [['O1', 'logo', 'pr'], ['Z2', 'plural', '']], note: 'The three strokes show the plural: prw.' },
    hemnetjer: { tl: 'ḥm-nṯr', en: 'priest ("servant of the god")', sp: 'R8-U36', parts: [['R8', 'logo', 'nṯr'], ['U36', 'phon', 'ḥm']], note: 'The word for god is written first out of honor but read last: ḥm-nṯr.' },
    nebtawy: { tl: 'nb tꜣwj', en: 'Lord of the Two Lands', sp: 'V30 N16:N16', parts: [['V30', 'phon', 'nb'], ['N16', 'logo', 'tꜣ'], ['N16', 'dual', '']], note: 'Two land signs write the dual tꜣwj, "the Two Lands".' },
    jnk: { tl: 'jnk', en: 'I (independent pronoun)', sp: 'M17-N35:V31', parts: [['M17', 'phon', 'j'], ['N35', 'phon', 'n'], ['V31', 'phon', 'k']] },
    sw: { tl: 'sw', en: 'he, him, it (dependent pronoun)', sp: 'M23-G43', parts: [['M23', 'phon', 'sw'], ['G43', 'comp', 'w']] },
    pw: { tl: 'pw', en: 'this; it is', sp: 'Q3-G43', parts: [['Q3', 'phon', 'p'], ['G43', 'phon', 'w']] },
    weser: { tl: 'wsr', en: 'powerful', sp: 'F12-S29:D21', parts: [['F12', 'phon', 'wsr'], ['S29', 'comp', 's'], ['D21', 'comp', 'r']] },
    // added for the site atlas (/egypt/sites/)
    aten: { tl: 'jtn', en: 'the Aten, the disk of the sun', sp: 'M17-X1:N35-N5', parts: [['M17', 'phon', 'j'], ['X1', 'phon', 't'], ['N35', 'phon', 'n'], ['N5', 'det', '']] },
    amunra: { tl: 'jmn-rꜥ', en: 'Amun-Ra', sp: 'M17-Y5:N35-N5:Z1-A40', parts: [['M17', 'phon', 'j'], ['Y5', 'phon', 'mn'], ['N35', 'comp', 'n'], ['N5', 'logo', 'rꜥ'], ['Z1', 'stroke', ''], ['A40', 'det', '']] },
    sobek: { tl: 'sbk', en: 'Sobek, the crocodile god', sp: 'S29-D58-V31-I3', parts: [['S29', 'phon', 's'], ['D58', 'phon', 'b'], ['V31', 'phon', 'k'], ['I3', 'det', '']] },
    horwer: { tl: 'ḥr-wr', en: 'Horus the Elder (Haroeris)', sp: 'G5-G36:D21', parts: [['G5', 'logo', 'ḥr'], ['G36', 'phon', 'wr'], ['D21', 'comp', 'r']] },
    punt: { tl: 'pwnt', en: 'Punt, a land reached by the Red Sea', sp: 'Q3-G43-N35:X1-N25', parts: [['Q3', 'phon', 'p'], ['G43', 'phon', 'w'], ['N35', 'phon', 'n'], ['X1', 'phon', 't'], ['N25', 'det', '']] },
    netjeraa: { tl: 'nṯr ꜥꜣ', en: 'the great god', sp: 'R8 O29-D36:G1', parts: [['R8', 'logo', 'nṯr'], ['O29', 'phon', 'ꜥꜣ'], ['D36', 'comp', 'ꜥ'], ['G1', 'comp', 'ꜣ']] },
    nebpet: { tl: 'nb pt', en: 'lord of the sky', sp: 'V30 Q3:X1-N1', parts: [['V30', 'phon', 'nb'], ['Q3', 'phon', 'p'], ['X1', 'phon', 't'], ['N1', 'det', '']] },
    djet: { tl: 'ḏt', en: 'forever, eternity', sp: 'I10:X1-N16', parts: [['I10', 'phon', 'ḏ'], ['X1', 'phon', 't'], ['N16', 'det', '']], note: 'The land sign is a determinative here; many texts use a flatter form of it.' },
    netjerikhet: { tl: 'nṯrj-ẖt', en: 'Netjerikhet, "divine of body", the Horus name of Djoser', sp: 'R8-F32:X1', parts: [['R8', 'logo', 'nṯrj'], ['F32', 'phon', 'ẖ'], ['X1', 'phon', 't']], note: 'In his day the king was called by this Horus name, written in a serekh (a palace facade); the name Djoser appears only in later texts.' },
    // more vocabulary, so that more signs have an example word (for the sign list in /languages/hieroglyphs/)
    hrface: { tl: 'ḥr', en: 'face', sp: 'D2:Z1', parts: [['D2', 'logo', 'ḥr'], ['Z1', 'stroke', '']] },
    seba: { tl: 'sbꜣ', en: 'star', sp: 'S29-D58-N14', parts: [['S29', 'comp', 's'], ['D58', 'comp', 'b'], ['N14', 'logo', 'sbꜣ']] },
    pa: { tl: 'pꜣ', en: 'this (masculine)', sp: 'G40-G1', parts: [['G40', 'phon', 'pꜣ'], ['G1', 'comp', 'ꜣ']] },
    wenem: { tl: 'wnm', en: 'eat', sp: 'E34:N35-G17-A2', parts: [['E34', 'phon', 'wn'], ['N35', 'comp', 'n'], ['G17', 'phon', 'm'], ['A2', 'det', '']] },
    maakheru: { tl: 'mꜣꜥ-ḫrw', en: 'true of voice (said of the blessed dead)', sp: 'Aa11:D36-P8', parts: [['Aa11', 'phon', 'mꜣꜥ'], ['D36', 'comp', 'ꜥ'], ['P8', 'logo', 'ḫrw']] },
    djedpillar: { tl: 'ḏd', en: 'stable, enduring; the djed pillar', sp: 'R11', parts: [['R11', 'logo', 'ḏd']] },
    iah: { tl: 'jꜥḥ', en: 'moon', sp: 'M17-D36:V28-N11', parts: [['M17', 'phon', 'j'], ['D36', 'phon', 'ꜥ'], ['V28', 'phon', 'ḥ'], ['N11', 'det', '']] },
    renpet: { tl: 'rnpt', en: 'year', sp: 'M4-X1:Z1', parts: [['M4', 'logo', 'rnp'], ['X1', 'end', 't'], ['Z1', 'stroke', '']] },
    zep: { tl: 'zp', en: 'time, occasion', sp: 'O50-Q3', parts: [['O50', 'phon', 'zp'], ['Q3', 'comp', 'p']] },
    negn: { tl: 'n', en: 'not (the negative)', sp: 'D35', parts: [['D35', 'phon', 'n']] },
    ini: { tl: 'jnj', en: 'bring', sp: 'W25-N35', parts: [['W25', 'phon', 'jnj'], ['N35', 'comp', 'n']] },
    di: { tl: 'dj', en: 'give', sp: 'D37', parts: [['D37', 'phon', 'dj']] },
    tem: { tl: 'tm', en: 'not to do (the negative verb)', sp: 'U15-G17', parts: [['U15', 'phon', 'tm'], ['G17', 'comp', 'm']] },
    ii: { tl: 'jj', en: 'come', sp: 'M18-D54', parts: [['M18', 'phon', 'jj'], ['D54', 'det', '']] },
    iw: { tl: 'jw', en: 'the particle jw (introduces a statement)', sp: 'E9-G43', parts: [['E9', 'phon', 'jw'], ['G43', 'comp', 'w']] },
    mi: { tl: 'mj', en: 'like, as', sp: 'W19', parts: [['W19', 'phon', 'mj']] },
    sedjer: { tl: 'sḏr', en: 'lie down; spend the night', sp: 'S29-I10:D21-A55', parts: [['S29', 'phon', 's'], ['I10', 'phon', 'ḏ'], ['D21', 'phon', 'r'], ['A55', 'det', '']] },
    tut: { tl: 'twt', en: 'statue, image', sp: 'X1:G43-X1-A53', parts: [['X1', 'phon', 't'], ['G43', 'phon', 'w'], ['X1', 'phon', 't'], ['A53', 'det', '']] },
    kabull: { tl: 'kꜣ', en: 'bull', sp: 'D28-E1', parts: [['D28', 'phon', 'kꜣ'], ['E1', 'det', '']] },
    inet: { tl: 'jnt', en: 'tilapia (a Nile fish)', sp: 'M17-N35:X1-K1', parts: [['M17', 'phon', 'j'], ['N35', 'phon', 'n'], ['X1', 'phon', 't'], ['K1', 'det', '']] },
    aam: { tl: 'ꜥꜣm', en: 'Asiatic (a person from the Near East)', sp: 'D36:G1-G17-T14-A1', parts: [['D36', 'phon', 'ꜥ'], ['G1', 'phon', 'ꜣ'], ['G17', 'phon', 'm'], ['T14', 'det', ''], ['A1', 'det', '']] },
    henqet: { tl: 'ḥnqt', en: 'beer', sp: 'V28-N35:N29-X1:W22', parts: [['V28', 'phon', 'ḥ'], ['N35', 'phon', 'n'], ['N29', 'phon', 'q'], ['X1', 'phon', 't'], ['W22', 'det', '']] },
    nedjes: { tl: 'nḏs', en: 'commoner; small', sp: 'N35-I10-S29-G37', parts: [['N35', 'phon', 'n'], ['I10', 'phon', 'ḏ'], ['S29', 'phon', 's'], ['G37', 'det', '']] },
    khet: { tl: 'ẖt', en: 'body, belly', sp: 'F32:X1-Z1', parts: [['F32', 'phon', 'ẖ'], ['X1', 'phon', 't'], ['Z1', 'stroke', '']] },
    she: { tl: 'š', en: 'lake, pool', sp: 'N37:Z1', parts: [['N37', 'logo', 'š'], ['Z1', 'stroke', '']] },
    maatgoddess: { tl: 'mꜣꜥt', en: 'Maat, the goddess of truth and order', sp: 'C10', parts: [['C10', 'logo', 'mꜣꜥt']], note: 'The goddess Maat with her feather, as in royal names.' }
  };
  // royal names in cartouches (read: the order of reading; honorific transposition puts a god's name first in the writing)
  var NAMES = {
    khufu: { tl: 'ḫwfw', en: 'Khufu', king: 'khufu', sp: 'Aa1-G43-I9-G43', signs: ['Aa1', 'G43', 'I9', 'G43'] },
    sneferu: { tl: 'snfrw', en: 'Sneferu', king: 'sneferu', sp: 'S29-F35-D21:G43', signs: ['S29', 'F35', 'D21', 'G43'] },
    khafre: { tl: 'ḫꜥ=f-rꜥ', en: 'Khafre', king: 'khafre', sp: 'N5-N28-I9', signs: ['N5', 'N28', 'I9'], note: 'Ra is written first out of honor but read last.' },
    menkaure: { tl: 'mn-kꜣw-rꜥ', en: 'Menkaure', king: 'menkaure', sp: 'N5-Y5:N35-D28-D28-D28', signs: ['N5', 'Y5', 'N35', 'D28', 'D28', 'D28'], note: 'Ra is written first out of honor but read last; the three kꜣ signs make the plural kꜣw.' },
    amenhotep: { tl: 'jmn-ḥtp', en: 'Amenhotep', king: 'amenhotep3', sp: 'M17-Y5:N35-R4:X1*Q3', signs: ['M17', 'Y5', 'N35', 'R4', 'X1', 'Q3'] },
    tutankhamun: { tl: 'twt-ꜥnḫ-jmn', en: 'Tutankhamun', king: 'tutankhamun', sp: 'M17-Y5:N35-X1:G43*X1-S34', signs: ['M17', 'Y5', 'N35', 'X1', 'G43', 'X1', 'S34'], note: 'Amun\'s name (jmn) is written first out of honor; the name is read twt-ꜥnḫ-jmn, "living image of Amun". His full cartouche adds "ruler of southern Heliopolis".' },
    ramesses: { tl: 'rꜥ-ms-sw', en: 'Ramesses', king: 'ramesses2', sp: 'N5-F31-S29-S29', signs: ['N5', 'F31', 'S29', 'S29'], note: 'Champollion read this name at Abu Simbel in 1822: the sun (rꜥ), then ms, then s.' },
    thutmose: { tl: 'ḏḥwtj-ms', en: 'Thutmose', king: 'thutmose3', sp: 'G26-F31-S29', signs: ['G26', 'F31', 'S29'] },
    menkheperre: { tl: 'mn-ḫpr-rꜥ', en: 'Menkheperre', king: 'thutmose3', sp: 'N5-Y5-L1', signs: ['N5', 'Y5', 'L1'], note: 'The throne name of Thutmose III, "Enduring is the form of Ra"; Ra is written first out of honor but read last.' },
    nebkheperure: { tl: 'nb-ḫprw-rꜥ', en: 'Nebkheperure', king: 'tutankhamun', sp: 'N5-L1-Z2-V30', signs: ['N5', 'L1', 'Z2', 'V30'], note: 'The throne name of Tutankhamun, "Lord of the forms of Ra"; the three strokes make ḫprw plural, and Ra is read last.' },
    ptolemy: { tl: 'ptwlmys', en: 'Ptolemy', king: 'ptolemy5', sp: 'Q3-X1-V4-E23-Aa15-M17A-S29', signs: ['Q3', 'X1', 'V4', 'E23', 'Aa15', 'M17A', 'S29'], note: 'A Greek name spelled out with sound signs: p, t, o (the lasso), l (the lion), m, y and s.' },
    cleopatra: { tl: 'qljwpꜣdrꜣt', en: 'Cleopatra', king: 'cleopatra7', sp: 'N29-E23-M17-V4-Q3-G1-D46-D21-G1-X1:H8', signs: ['N29', 'E23', 'M17', 'V4', 'Q3', 'G1', 'D46', 'D21', 'G1', 'X1', 'H8'], note: 'k, l, e, o, p, a, t (the hand), r, a, then the feminine t and the egg for a woman\'s name. The Cleopatra on the Philae obelisk is not the famous Cleopatra VII.' },
    // added for the site atlas (/egypt/sites/)
    unas: { tl: 'wnjs', en: 'Unas', king: 'unas', sp: 'E34:N35-M17-S29', signs: ['E34', 'N35', 'M17', 'S29'], note: 'The hare (wn) with the water ripple as its complement, then j and s. The last king of the 5th Dynasty.' },
    meni: { tl: 'mnj', en: 'Meni (Menes)', king: 'narmer', sp: 'Y5:N35-M17', signs: ['Y5', 'N35', 'M17'], note: 'The first name in the Abydos King List: Menes, whom later tradition made the first king of all Egypt. Most scholars identify him with Narmer; some with his successor Aha.' },
    kheperkare: { tl: 'ḫpr-kꜣ-rꜥ', en: 'Kheperkare', king: 'senusret1', sp: 'N5-L1-D28', signs: ['N5', 'L1', 'D28'], note: 'The throne name of Senusret I, "The ka of Ra comes into being"; Ra is written first out of honor but read last.' },
    maatkare: { tl: 'mꜣꜥt-kꜣ-rꜥ', en: 'Maatkare', king: 'hatshepsut', sp: 'N5-C10-D28', signs: ['N5', 'C10', 'D28'], note: 'The throne name of Hatshepsut, "Maat is the ka of Ra"; Ra is written first out of honor but read last.' },
    nebmaatre: { tl: 'nb-mꜣꜥt-rꜥ', en: 'Nebmaatre', king: 'amenhotep3', sp: 'N5-C10-V30', signs: ['N5', 'C10', 'V30'], note: 'The throne name of Amenhotep III, "Lord of the Maat of Ra"; Ra is written first out of honor but read last.' },
    menmaatre: { tl: 'mn-mꜣꜥt-rꜥ', en: 'Menmaatre', king: 'seti1', sp: 'N5-C10-Y5:N35', signs: ['N5', 'C10', 'Y5', 'N35'], note: 'The throne name of Seti I, "Enduring is the Maat of Ra"; Ra is written first out of honor but read last.' },
    usermaatre: { tl: 'wsr-mꜣꜥt-rꜥ stp-n-rꜥ', en: 'Usermaatre Setepenre', king: 'ramesses2', sp: 'N5-F12-C10-U21:N35:N5', signs: ['N5', 'F12', 'C10', 'U21', 'N35', 'N5'], note: 'The throne name of Ramesses II, "Strong is the Maat of Ra, chosen of Ra"; Ra is written first out of honor but read last. Greek writers turned wsr-mꜣꜥt-rꜥ into Ozymandias.' },
    usermaatremeryamun: { tl: 'wsr-mꜣꜥt-rꜥ mrj-jmn', en: 'Usermaatre Meryamun', king: 'ramesses3', sp: 'N5-F12-C10-N36-M17-Y5:N35', signs: ['N5', 'F12', 'C10', 'N36', 'M17', 'Y5', 'N35'], note: 'The throne name of Ramesses III, "Strong is the Maat of Ra, beloved of Amun"; Ra is written first out of honor but read last. The canal sign writes mr.' },
    akhenaten: { tl: 'ꜣḫ-n-jtn', en: 'Akhenaten', king: 'akhenaten', sp: 'M17-X1:N35:N5-G25-Aa1:N35', signs: ['M17', 'X1', 'N35', 'N5', 'G25', 'Aa1', 'N35'], note: 'The name the king took in his fifth year, "Effective for the Aten"; the Aten (jtn, with the sun disk) is written first out of honor but read last.' }
  };
  // the numerals
  var NUMERALS = [[1000000, 'C11'], [100000, 'I8'], [10000, 'D50'], [1000, 'M12'], [100, 'V1'], [10, 'V20'], [1, 'Z1']];
  function numberSigns(n) { var out = []; NUMERALS.forEach(function (p) { var k = Math.floor(n / p[0]); n -= k * p[0]; for (var i = 0; i < k; i++) out.push(p[1]); }); return out; }
  function numberValue(signs) { var v = 0; signs.forEach(function (s) { NUMERALS.forEach(function (p) { if (p[1] === s) v += p[0]; }); }); return v; }

  /* ---------------------------------------------------------------- chronology
     All dates follow Ian Shaw (ed.), The Oxford History of Ancient Egypt (2000), as given in Wikipedia's comparison table
     ("Egyptian chronology") and on its period pages. Years BC are negative. Before 664 BC every date is approximate (c.):
     about ±150 years for the Early Dynastic Period, up to a century or more in the Old Kingdom, a few decades in the Middle
     and New Kingdoms; exact from 664 BC on. pm: the uncertainty bar (years, either side) the timeline draws. */
  var PERIODS = [
    { key: 'pre', name: 'Predynastic Period', from: -5300, to: -3000, pm: 200, dyn: '', cap: 'many local centers (Naqada, Hierakonpolis, Abydos)', note: 'Farming villages along the Nile; the Naqada culture; small kingdoms join up. Dynasty 0 at the end (c. 3200–3000 BC).' },
    { key: 'ed', name: 'Early Dynastic Period', from: -3000, to: -2686, pm: 150, dyn: '1–2', cap: 'Memphis (kings buried at Abydos)', note: 'Egypt is one kingdom; writing, the king\'s titles and the first royal tombs.' },
    { key: 'ok', name: 'Old Kingdom', from: -2686, to: -2160, pm: 100, dyn: '3–8', cap: 'Memphis', note: 'The age of the pyramids: Djoser, Sneferu, Khufu, Khafre, Menkaure; the Pyramid Texts.' },
    { key: 'fip', name: 'First Intermediate Period', from: -2160, to: -2055, pm: 50, dyn: '9–11 (Thebes)', cap: 'Herakleopolis and Thebes', note: 'Rival kings in the north (Herakleopolis) and the south (Thebes).' },
    { key: 'mk', name: 'Middle Kingdom', from: -2055, to: -1650, pm: 30, dyn: '11 (all Egypt)–13', cap: 'Thebes, then Itjtawy (near Lisht)', note: 'Mentuhotep II reunites Egypt; the classic age of the language and of literature (Sinuhe).' },
    { key: 'sip', name: 'Second Intermediate Period', from: -1650, to: -1550, pm: 30, dyn: '14–17', cap: 'Avaris (Hyksos) and Thebes', note: 'The Hyksos rule the north from Avaris; Theban kings fight back.' },
    { key: 'nk', name: 'New Kingdom', from: -1550, to: -1069, pm: 20, dyn: '18–20', cap: 'Thebes and Memphis; Amarna; Pi-Ramesses', note: 'Egypt\'s empire: Hatshepsut, Thutmose III, Akhenaten, Tutankhamun, Ramesses II.' },
    { key: 'tip', name: 'Third Intermediate Period', from: -1069, to: -664, pm: 10, dyn: '21–25', cap: 'Tanis, Bubastis; Napata (Kushite kings)', note: 'A divided Egypt; Libyan dynasties, then the Kushite kings of the 25th Dynasty.' },
    { key: 'late', name: 'Late Period', from: -664, to: -332, pm: 0, dyn: '26–31', cap: 'Sais; Persian rule from afar', note: 'The Saite revival, two Persian conquests, the last native kings (Dynasty 30).' },
    { key: 'ptol', name: 'Ptolemaic Period', from: -332, to: -30, pm: 0, dyn: 'Macedonian and Ptolemaic', cap: 'Alexandria', note: 'Alexander, then the Ptolemies; Greek rulers of Egypt until Cleopatra VII.' },
    { key: 'rom', name: 'Roman and Byzantine Egypt', from: -30, to: 641, pm: 0, dyn: '', cap: 'Alexandria', note: 'A province of Rome (and from AD 395 of the Eastern Roman Empire) until the Arab conquest of AD 641.' }
  ];
  var DYNASTIES = [
    [1, -3000, -2890, 'ed'], [2, -2890, -2686, 'ed'], [3, -2686, -2613, 'ok'], [4, -2613, -2494, 'ok'], [5, -2494, -2345, 'ok'], [6, -2345, -2181, 'ok'],
    ['7–8', -2181, -2160, 'ok'], ['9–10', -2160, -2025, 'fip'], ['11 (Thebes)', -2125, -2055, 'fip'], ['11', -2055, -1985, 'mk'], [12, -1985, -1773, 'mk'],
    [13, -1773, -1650, 'mk'], [14, -1773, -1650, 'mk'], [15, -1650, -1550, 'sip'], [16, -1650, -1580, 'sip'], [17, -1580, -1550, 'sip'],
    [18, -1550, -1295, 'nk'], [19, -1295, -1186, 'nk'], [20, -1186, -1069, 'nk'], [21, -1069, -945, 'tip'], [22, -945, -715, 'tip'], [23, -818, -715, 'tip'],
    [24, -727, -715, 'tip'], [25, -747, -656, 'tip'], [26, -664, -525, 'late'], [27, -525, -404, 'late'], [28, -404, -399, 'late'], [29, -399, -380, 'late'],
    [30, -380, -343, 'late'], [31, -343, -332, 'late']
  ].map(function (d) { return { n: d[0], from: d[1], to: d[2], period: d[3] }; });
  // the king list subset (reign dates per Shaw 2000; c. before 664 BC). built: monuments to ask "which king built this" about
  var KINGS = [
    { key: 'narmer', name: 'Narmer', from: -3000, to: -3000, dyn: '0/1', period: 'ed', built: [], note: 'On the Narmer Palette (found at Hierakonpolis) he wears the white crown of Upper Egypt on one side and the red crown of Lower Egypt on the other.' },
    { key: 'djoser', name: 'Djoser', from: -2667, to: -2648, dyn: 3, period: 'ok', built: ['the Step Pyramid at Saqqara'], note: 'His architect Imhotep is credited with the first pyramid, built of stone.' },
    { key: 'sneferu', name: 'Sneferu', tl: 'snfrw', from: -2613, to: -2589, dyn: 4, period: 'ok', built: ['the Bent Pyramid at Dahshur', 'the Red Pyramid at Dahshur'], note: 'The first true (smooth-sided) pyramid.' },
    { key: 'khufu', name: 'Khufu', tl: 'ḫwfw', from: -2589, to: -2566, dyn: 4, period: 'ok', built: ['the Great Pyramid of Giza'], note: 'Greek writers called him Cheops.' },
    { key: 'khafre', name: 'Khafre', tl: 'ḫꜥ=f-rꜥ', from: -2558, to: -2532, dyn: 4, period: 'ok', built: ['the second pyramid at Giza'], note: 'The Great Sphinx is usually credited to him.' },
    { key: 'menkaure', name: 'Menkaure', tl: 'mn-kꜣw-rꜥ', from: -2532, to: -2503, dyn: 4, period: 'ok', built: ['the third pyramid at Giza'], note: '' },
    { key: 'unas', name: 'Unas', from: -2375, to: -2345, dyn: 5, period: 'ok', built: ['the Pyramid of Unas at Saqqara'], note: 'The first pyramid with the Pyramid Texts carved inside.' },
    { key: 'pepi2', name: 'Pepi II', from: -2278, to: -2184, dyn: 6, period: 'ok', built: [], note: 'Said to have reigned more than 60 years (the length is debated).' },
    { key: 'mentuhotep2', name: 'Mentuhotep II', from: -2055, to: -2004, dyn: 11, period: 'mk', built: ['his temple-tomb at Deir el-Bahari'], note: 'Reunited Egypt and began the Middle Kingdom.' },
    { key: 'amenemhat1', name: 'Amenemhat I', from: -1985, to: -1956, dyn: 12, period: 'mk', built: [], note: 'Founded the 12th Dynasty and a new capital, Itjtawy.' },
    { key: 'senusret1', name: 'Senusret I', from: -1956, to: -1911, dyn: 12, period: 'mk', built: ['the obelisk at Heliopolis', 'the White Chapel at Karnak'], note: 'The king of the Tale of Sinuhe.' },
    { key: 'senusret3', name: 'Senusret III', from: -1870, to: -1831, dyn: 12, period: 'mk', built: ['the Nubian forts at the Second Cataract'], note: '' },
    { key: 'amenemhat3', name: 'Amenemhat III', from: -1831, to: -1786, dyn: 12, period: 'mk', built: ['the pyramid at Hawara'], note: '' },
    { key: 'ahmose1', name: 'Ahmose I', from: -1550, to: -1525, dyn: 18, period: 'nk', built: [], note: 'Drove out the Hyksos and began the New Kingdom.' },
    { key: 'thutmose1', name: 'Thutmose I', from: -1504, to: -1492, dyn: 18, period: 'nk', built: [], note: 'Probably the first king buried in the Valley of the Kings.' },
    { key: 'hatshepsut', name: 'Hatshepsut', from: -1473, to: -1458, dyn: 18, period: 'nk', built: ['the temple at Deir el-Bahari (Djeser-djeseru)'], note: 'A woman who ruled as king; sent an expedition to Punt.' },
    { key: 'thutmose3', name: 'Thutmose III', tl: 'ḏḥwtj-ms', from: -1479, to: -1425, dyn: 18, period: 'nk', built: ['the Festival Hall (Akh-menu) at Karnak'], note: 'Co-ruler with Hatshepsut at first; won the battle of Megiddo.' },
    { key: 'amenhotep3', name: 'Amenhotep III', tl: 'jmn-ḥtp', from: -1390, to: -1352, dyn: 18, period: 'nk', built: ['Luxor Temple (the core)', 'the Colossi of Memnon'], note: 'A long, rich reign; letters from his reign survive in the Amarna archive.' },
    { key: 'akhenaten', name: 'Akhenaten', from: -1352, to: -1336, dyn: 18, period: 'nk', built: ['the city of Akhetaten (Amarna)'], note: 'Born Amenhotep IV; put the Aten above all other gods.' },
    { key: 'tutankhamun', name: 'Tutankhamun', tl: 'twt-ꜥnḫ-jmn', from: -1336, to: -1327, dyn: 18, period: 'nk', built: [], note: 'Restored the old gods; his nearly intact tomb (KV62) was found by Howard Carter in 1922.' },
    { key: 'horemheb', name: 'Horemheb', from: -1323, to: -1295, dyn: 18, period: 'nk', built: [], note: 'A general who became king; the last of the 18th Dynasty.' },
    { key: 'seti1', name: 'Seti I', from: -1294, to: -1279, dyn: 19, period: 'nk', built: ['the temple of Seti I at Abydos'], note: 'His Abydos temple has a famous king list.' },
    { key: 'ramesses2', name: 'Ramesses II', tl: 'rꜥ-ms-sw', from: -1279, to: -1213, dyn: 19, period: 'nk', built: ['the temples of Abu Simbel', 'the Ramesseum'], note: 'Fought the Hittites at Kadesh (c. 1274 BC) and later made a peace treaty with them.' },
    { key: 'merneptah', name: 'Merneptah', from: -1213, to: -1203, dyn: 19, period: 'nk', built: [], note: 'His victory stela has the first mention of "Israel" outside the Bible.' },
    { key: 'ramesses3', name: 'Ramesses III', from: -1184, to: -1153, dyn: 20, period: 'nk', built: ['the temple at Medinet Habu'], note: 'Fought off the Sea Peoples.' },
    { key: 'shoshenq1', name: 'Shoshenq I', from: -945, to: -924, dyn: 22, period: 'tip', built: [], note: 'Led a campaign into Canaan; many scholars identify him with Shishak in the Bible (debated).' },
    { key: 'piye', name: 'Piye', from: -747, to: -716, dyn: 25, period: 'tip', built: [], note: 'A king of Kush who conquered Egypt.' },
    { key: 'taharqo', name: 'Taharqo', from: -690, to: -664, dyn: 25, period: 'tip', built: ['his pyramid at Nuri'], note: 'The greatest builder of the Kushite kings.' },
    { key: 'psamtek1', name: 'Psamtek I', from: -664, to: -610, dyn: 26, period: 'late', built: [], note: 'Reunited Egypt from Sais.' },
    { key: 'cambyses', name: 'Cambyses II', from: -525, to: -522, dyn: 27, period: 'late', built: [], note: 'The Persian king who conquered Egypt in 525 BC.' },
    { key: 'nectanebo2', name: 'Nectanebo II', from: -360, to: -343, dyn: 30, period: 'late', built: [], note: 'The last native Egyptian king.' },
    { key: 'alexander', name: 'Alexander the Great', from: -332, to: -323, dyn: 'Macedonian', period: 'ptol', built: ['the city of Alexandria'], note: 'Founded Alexandria (331 BC) and visited the oracle of Amun at Siwa.' },
    { key: 'ptolemy1', name: 'Ptolemy I', from: -305, to: -285, dyn: 'Ptolemaic', period: 'ptol', built: [], note: 'One of Alexander\'s generals; founded the Ptolemaic dynasty.' },
    { key: 'ptolemy5', name: 'Ptolemy V', tl: 'ptwlmys', from: -204, to: -180, dyn: 'Ptolemaic', period: 'ptol', built: [], note: 'The Rosetta Stone (196 BC) copies a decree of the priests in his honor.' },
    { key: 'cleopatra7', name: 'Cleopatra VII', from: -51, to: -30, dyn: 'Ptolemaic', period: 'ptol', built: [], note: 'The last Ptolemaic ruler; after her death Egypt became a Roman province.' },
    { key: 'augustus', name: 'Augustus', from: -30, to: 14, dyn: 'Roman', period: 'rom', built: [], note: 'The first Roman emperor, who made Egypt a province in 30 BC.' }
  ];

  /* ---------------------------------------------------------------- places
     Coordinates are decimal degrees (north, east) for the site itself, checked against the coordinates Wikipedia gives for
     each place (rounded to about 1 km). periods: the period layers the site belongs to on eg-map. kind: pyramid | temple |
     tombs | city | fort | quarry | find (where a famous object was found) | battle | oasis. region: lower | middle | upper |
     nubia | sinai | levant | desert. */
  var SITES = [
    { key: 'giza', name: 'Giza', lat: 29.979, lon: 31.134, kind: 'pyramid', region: 'lower', periods: ['ok'], note: 'The pyramids of Khufu, Khafre and Menkaure and the Great Sphinx.' },
    { key: 'saqqara', name: 'Saqqara', lat: 29.871, lon: 31.217, kind: 'pyramid', region: 'lower', periods: ['ed', 'ok', 'nk', 'late', 'ptol'], note: 'Cemetery of Memphis: Djoser\'s Step Pyramid, the Pyramid of Unas, and the Serapeum.' },
    { key: 'memphis', name: 'Memphis', anc: 'Mennefer', lat: 29.845, lon: 31.251, kind: 'city', region: 'lower', periods: ['ed', 'ok', 'mk', 'nk', 'tip', 'late', 'ptol'], note: 'The capital for much of Egyptian history; city of the god Ptah.' },
    { key: 'abusir', name: 'Abusir', lat: 29.896, lon: 31.203, kind: 'pyramid', region: 'lower', periods: ['ok'], note: 'Pyramids and sun temples of the 5th Dynasty.' },
    { key: 'dahshur', name: 'Dahshur', lat: 29.791, lon: 31.209, kind: 'pyramid', region: 'lower', periods: ['ok', 'mk'], note: 'Sneferu\'s Bent Pyramid and Red Pyramid.' },
    { key: 'meidum', name: 'Meidum', lat: 29.388, lon: 31.157, kind: 'pyramid', region: 'middle', periods: ['ok'], note: 'A pyramid begun as a step pyramid and finished under Sneferu; its outer casing later fell.' },
    { key: 'lisht', name: 'el-Lisht', lat: 29.570, lon: 31.230, kind: 'pyramid', region: 'middle', periods: ['mk'], note: 'Pyramids of Amenemhat I and Senusret I, near the lost capital Itjtawy.' },
    { key: 'hawara', name: 'Hawara', lat: 29.274, lon: 30.899, kind: 'pyramid', region: 'middle', periods: ['mk', 'rom'], note: 'Pyramid of Amenemhat III; Roman-era mummy portraits.' },
    { key: 'fayum', name: 'Faiyum (Shedet)', anc: 'Shedet, Crocodilopolis', lat: 29.309, lon: 30.842, kind: 'city', region: 'middle', periods: ['mk', 'ptol', 'rom'], note: 'A fertile basin west of the Nile; city of the crocodile god Sobek.' },
    { key: 'heliopolis', name: 'Heliopolis', anc: 'Iunu', lat: 30.129, lon: 31.307, kind: 'city', region: 'lower', periods: ['ok', 'mk', 'nk'], note: 'City of the sun god; one obelisk of Senusret I still stands.' },
    { key: 'bubastis', name: 'Bubastis', anc: 'Per-Bastet', lat: 30.573, lon: 31.511, kind: 'city', region: 'lower', periods: ['tip'], note: 'City of the cat goddess Bastet; home of the 22nd Dynasty.' },
    { key: 'tanis', name: 'Tanis', anc: 'Djanet', lat: 30.977, lon: 31.880, kind: 'city', region: 'lower', periods: ['tip'], note: 'Capital of the 21st and 22nd Dynasties; royal tombs with silver coffins.' },
    { key: 'avaris', name: 'Avaris', anc: 'Hut-waret (Tell el-Dabʿa)', lat: 30.787, lon: 31.821, kind: 'city', region: 'lower', periods: ['sip'], note: 'Capital of the Hyksos kings.' },
    { key: 'piramesse', name: 'Pi-Ramesses', anc: 'Per-Ramesses (Qantir)', lat: 30.800, lon: 31.836, kind: 'city', region: 'lower', periods: ['nk'], note: 'The Delta capital Ramesses II built next to old Avaris.' },
    { key: 'sais', name: 'Sais', anc: 'Zau', lat: 30.965, lon: 30.768, kind: 'city', region: 'lower', periods: ['late'], note: 'Capital of the 26th (Saite) Dynasty; city of the goddess Neith.' },
    { key: 'naukratis', name: 'Naukratis', lat: 30.899, lon: 30.593, kind: 'city', region: 'lower', periods: ['late', 'ptol'], note: 'A Greek trading town in the Delta.' },
    { key: 'buto', name: 'Buto', anc: 'Pe and Dep', lat: 31.196, lon: 30.741, kind: 'city', region: 'lower', periods: ['pre', 'ed'], note: 'An early Delta center; city of the cobra goddess Wadjet.' },
    { key: 'alexandria', name: 'Alexandria', lat: 31.200, lon: 29.919, kind: 'city', region: 'lower', periods: ['ptol', 'rom'], note: 'Founded by Alexander in 331 BC; the Ptolemies\' capital, with the Library and the lighthouse (Pharos).' },
    { key: 'rosetta', name: 'Rosetta (Rashid)', lat: 31.404, lon: 30.416, kind: 'find', region: 'lower', periods: ['ptol'], note: 'Where French soldiers found the Rosetta Stone in 1799 (the stone itself dates from 196 BC).' },
    { key: 'babylon', name: 'Babylon fortress (Old Cairo)', lat: 30.006, lon: 31.230, kind: 'fort', region: 'lower', periods: ['rom'], note: 'A Roman fortress; its surrender in AD 641 was a key step in the Arab conquest.' },
    { key: 'beni-hasan', name: 'Beni Hasan', lat: 27.933, lon: 30.878, kind: 'tombs', region: 'middle', periods: ['mk'], note: 'Rock-cut tombs of Middle Kingdom governors, painted with daily life.' },
    { key: 'hermopolis', name: 'Hermopolis', anc: 'Khemenu (el-Ashmunein)', lat: 27.782, lon: 30.805, kind: 'city', region: 'middle', periods: ['mk', 'nk', 'ptol'], note: 'City of Thoth and of the eight gods of the Hermopolitan creation account.' },
    { key: 'amarna', name: 'Amarna', anc: 'Akhetaten', lat: 27.645, lon: 30.896, kind: 'city', region: 'middle', periods: ['nk'], note: 'Akhenaten\'s new capital, built for the Aten and abandoned soon after his death.' },
    { key: 'oxyrhynchus', name: 'Oxyrhynchus', lat: 28.533, lon: 30.657, kind: 'find', region: 'middle', periods: ['ptol', 'rom'], note: 'Its rubbish mounds held a vast number of Greek papyri.' },
    { key: 'abydos', name: 'Abydos', anc: 'Abdju', lat: 26.185, lon: 31.919, kind: 'temple', region: 'upper', periods: ['pre', 'ed', 'mk', 'nk'], note: 'Tombs of the first kings; the cult center of Osiris; the temple of Seti I with its king list.' },
    { key: 'nag-hammadi', name: 'Nag Hammadi', lat: 26.050, lon: 32.242, kind: 'find', region: 'upper', periods: ['rom'], note: 'Where a jar of Coptic books (codices) was found in 1945.' },
    { key: 'dendera', name: 'Dendera', anc: 'Iunet', lat: 26.142, lon: 32.670, kind: 'temple', region: 'upper', periods: ['ptol', 'rom'], note: 'The temple of Hathor, finished in Roman times, with a famous zodiac ceiling.' },
    { key: 'naqada', name: 'Naqada', lat: 25.900, lon: 32.720, kind: 'tombs', region: 'upper', periods: ['pre'], note: 'Cemeteries that gave their name to the Predynastic Naqada culture.' },
    { key: 'karnak', name: 'Karnak', anc: 'Ipet-isut', lat: 25.719, lon: 32.657, kind: 'temple', region: 'upper', periods: ['mk', 'nk', 'tip', 'late', 'ptol'], note: 'The great temple of Amun at Thebes, enlarged for about two thousand years.' },
    { key: 'luxor', name: 'Luxor Temple', anc: 'Ipet-resyt', lat: 25.700, lon: 32.639, kind: 'temple', region: 'upper', periods: ['nk'], note: 'Built by Amenhotep III and enlarged by Ramesses II; linked to Karnak by an avenue of sphinxes.' },
    { key: 'kings', name: 'Valley of the Kings', lat: 25.740, lon: 32.601, kind: 'tombs', region: 'upper', periods: ['nk'], note: 'Rock-cut tombs of New Kingdom kings, including Tutankhamun\'s (KV62).' },
    { key: 'queens', name: 'Valley of the Queens', lat: 25.729, lon: 32.593, kind: 'tombs', region: 'upper', periods: ['nk'], note: 'Tombs of queens and princes, including Nefertari\'s.' },
    { key: 'deir-el-bahari', name: 'Deir el-Bahari', lat: 25.738, lon: 32.607, kind: 'temple', region: 'upper', periods: ['mk', 'nk'], note: 'Hatshepsut\'s terraced temple, beside Mentuhotep II\'s.' },
    { key: 'deir-el-medina', name: 'Deir el-Medina', anc: 'Set-maat', lat: 25.728, lon: 32.601, kind: 'city', region: 'upper', periods: ['nk'], note: 'The village of the workmen who cut the royal tombs; thousands of their notes survive.' },
    { key: 'ramesseum', name: 'Ramesseum', lat: 25.728, lon: 32.611, kind: 'temple', region: 'upper', periods: ['nk'], note: 'The memorial temple of Ramesses II.' },
    { key: 'medinet-habu', name: 'Medinet Habu', lat: 25.719, lon: 32.601, kind: 'temple', region: 'upper', periods: ['nk'], note: 'The memorial temple of Ramesses III, with scenes of the Sea Peoples.' },
    { key: 'hierakonpolis', name: 'Hierakonpolis', anc: 'Nekhen', lat: 25.097, lon: 32.779, kind: 'city', region: 'upper', periods: ['pre', 'ed'], note: 'An early capital of the south, where the Narmer Palette was found.' },
    { key: 'edfu', name: 'Edfu', anc: 'Behdet', lat: 24.978, lon: 32.873, kind: 'temple', region: 'upper', periods: ['ptol'], note: 'The best-preserved temple in Egypt, built for Horus under the Ptolemies.' },
    { key: 'kom-ombo', name: 'Kom Ombo', lat: 24.452, lon: 32.928, kind: 'temple', region: 'upper', periods: ['ptol'], note: 'A double temple, for Sobek and for Horus the Elder.' },
    { key: 'elephantine', name: 'Elephantine (Aswan)', anc: 'Abu', lat: 24.085, lon: 32.887, kind: 'city', region: 'upper', periods: ['ok', 'mk', 'nk', 'late', 'ptol'], note: 'The southern frontier town at the First Cataract; granite quarries nearby.' },
    { key: 'philae', name: 'Philae', lat: 24.025, lon: 32.884, kind: 'temple', region: 'upper', periods: ['ptol', 'rom'], note: 'The temple of Isis; the last known hieroglyphic inscription (AD 394). Moved to nearby Agilkia Island in the 1970s.' },
    { key: 'abu-simbel', name: 'Abu Simbel', lat: 22.337, lon: 31.626, kind: 'temple', region: 'nubia', periods: ['nk'], note: 'Two rock-cut temples of Ramesses II, moved to higher ground in 1964–68.' },
    { key: 'buhen', name: 'Buhen', lat: 21.920, lon: 31.290, kind: 'fort', region: 'nubia', periods: ['mk', 'nk'], note: 'A great mud-brick fortress at the Second Cataract, now under Lake Nasser.' },
    { key: 'semna', name: 'Semna', lat: 21.490, lon: 30.960, kind: 'fort', region: 'nubia', periods: ['mk'], note: 'Forts of Senusret III marking the southern border.' },
    { key: 'kerma', name: 'Kerma', lat: 19.601, lon: 30.409, kind: 'city', region: 'nubia', periods: ['mk', 'sip'], note: 'Capital of the first kingdom of Kush, a rival of Middle Kingdom Egypt.' },
    { key: 'napata', name: 'Napata (Jebel Barkal)', lat: 18.536, lon: 31.828, kind: 'temple', region: 'nubia', periods: ['nk', 'tip'], note: 'A sacred mountain with a temple of Amun; capital of the Kushite kings.' },
    { key: 'nuri', name: 'Nuri', lat: 18.560, lon: 31.918, kind: 'pyramid', region: 'nubia', periods: ['tip', 'late'], note: 'Pyramids of Kushite kings, the largest Taharqo\'s.' },
    { key: 'meroe', name: 'Meroë', lat: 16.938, lon: 33.749, kind: 'pyramid', region: 'nubia', periods: ['late', 'ptol', 'rom'], note: 'The later capital of Kush, with steep pyramids and its own script (Meroitic).' },
    { key: 'serabit', name: 'Serabit el-Khadim', lat: 29.037, lon: 33.459, kind: 'quarry', region: 'sinai', periods: ['mk', 'nk'], note: 'Turquoise mines and a temple of Hathor in Sinai; early alphabetic (Proto-Sinaitic) inscriptions.' },
    { key: 'siwa', name: 'Siwa Oasis', lat: 29.203, lon: 25.520, kind: 'oasis', region: 'desert', periods: ['late', 'ptol'], note: 'The oracle of Amun that Alexander visited in 331 BC.' },
    { key: 'kharga', name: 'Kharga Oasis', lat: 25.440, lon: 30.550, kind: 'oasis', region: 'desert', periods: ['late', 'rom'], note: 'A Western Desert oasis with a Persian-era temple of Amun (Hibis).' },
    { key: 'berenike', name: 'Berenike', lat: 23.910, lon: 35.474, kind: 'city', region: 'desert', periods: ['ptol', 'rom'], note: 'A Red Sea port for the trade with India and Africa.' },
    { key: 'megiddo', name: 'Megiddo', lat: 32.585, lon: 35.184, kind: 'battle', region: 'levant', periods: ['nk'], note: 'Thutmose III defeated a coalition of Canaanite rulers here (c. 1457 BC).' },
    { key: 'kadesh', name: 'Kadesh', lat: 34.560, lon: 36.520, kind: 'battle', region: 'levant', periods: ['nk'], note: 'Ramesses II fought the Hittites here (c. 1274 BC); both sides claimed victory.' },
    { key: 'byblos', name: 'Byblos', lat: 34.121, lon: 35.648, kind: 'city', region: 'levant', periods: ['ok', 'mk', 'nk'], note: 'A port that traded cedar wood to Egypt for more than two thousand years.' }
  ];
  var CITIES = [['Cairo', 30.044, 31.236], ['Alexandria', 31.200, 29.919], ['Luxor', 25.687, 32.640], ['Aswan', 24.089, 32.900], ['Port Said', 31.265, 32.302],
    ['Suez', 29.967, 32.550], ['Asyut', 27.178, 31.186], ['Minya', 28.110, 30.750], ['Khartoum', 15.501, 32.560], ['Wadi Halfa', 21.799, 31.371],
    ['Port Sudan', 19.616, 37.216], ['Hurghada', 27.258, 33.812], ['Dongola', 19.170, 30.477], ['Faiyum', 29.308, 30.843]]
    .map(function (c) { return { name: c[0], lat: c[1], lon: c[2] }; });
  var CATARACTS = [['First', 24.07, 32.88], ['Second', 21.76, 31.25], ['Third', 19.85, 30.35], ['Fourth', 18.95, 32.40], ['Fifth', 18.38, 33.90], ['Sixth', 16.30, 32.69]]
    .map(function (c, i) { return { n: i + 1, name: c[0] + ' Cataract', lat: c[1], lon: c[2] }; });

  /* ---------------------------------------------------------------- gods (as the Egyptians pictured them; taught as history) */
  var GODS = [
    { key: 'ra', name: 'Ra', tl: 'rꜥ', look: 'a man with a falcon\'s head topped by a sun disk', role: 'the sun god', center: 'Heliopolis' },
    { key: 'amun', name: 'Amun', tl: 'jmn', look: 'a man wearing a crown with two tall plumes', role: 'the hidden one, king of the gods at Thebes (as Amun-Ra)', center: 'Thebes (Karnak)' },
    { key: 'osiris', name: 'Osiris', tl: 'wsjr', look: 'a mummy-wrapped king with a crook and flail and a tall white crown with plumes', role: 'ruler of the dead and of new life', center: 'Abydos' },
    { key: 'isis', name: 'Isis', tl: 'ꜣst', look: 'a woman with a throne sign on her head (later cow horns and a sun disk)', role: 'wife of Osiris and mother of Horus, great in magic', center: 'Philae' },
    { key: 'horus', name: 'Horus', tl: 'ḥr', look: 'a falcon, or a man with a falcon\'s head wearing the double crown', role: 'god of kingship and the sky; the living king was his image', center: 'Edfu' },
    { key: 'seth', name: 'Seth', tl: 'stẖ', look: 'a man with the head of an unknown animal with a long curved snout and square-tipped ears', role: 'god of the desert, storms and disorder; killer of Osiris', center: 'Ombos (near Naqada)' },
    { key: 'anubis', name: 'Anubis', tl: 'jnpw', look: 'a black jackal, or a man with a jackal\'s head', role: 'god of embalming and cemeteries', center: 'Cynopolis' },
    { key: 'thoth', name: 'Thoth', tl: 'ḏḥwtj', look: 'an ibis or a man with an ibis\'s head (also a baboon)', role: 'god of writing, wisdom and the moon', center: 'Hermopolis' },
    { key: 'hathor', name: 'Hathor', tl: 'ḥwt-ḥr', look: 'a cow, or a woman with cow horns and a sun disk', role: 'goddess of love, music and joy', center: 'Dendera' },
    { key: 'ptah', name: 'Ptah', tl: 'ptḥ', look: 'a man wrapped like a mummy, with a skullcap, holding a tall scepter', role: 'creator god and patron of craftsmen', center: 'Memphis' },
    { key: 'maat', name: 'Maat', tl: 'mꜣꜥt', look: 'a woman with an ostrich feather on her head', role: 'truth, justice and right order', center: '' },
    { key: 'bastet', name: 'Bastet', tl: 'bꜣstt', look: 'a cat, or a woman with a cat\'s head', role: 'protector of the home', center: 'Bubastis' },
    { key: 'sekhmet', name: 'Sekhmet', tl: 'sḫmt', look: 'a woman with a lioness\'s head', role: 'goddess of war, plague and healing', center: 'Memphis' },
    { key: 'sobek', name: 'Sobek', tl: 'sbk', look: 'a crocodile, or a man with a crocodile\'s head', role: 'god of the Nile\'s power', center: 'the Faiyum and Kom Ombo' },
    { key: 'khnum', name: 'Khnum', tl: 'ẖnmw', look: 'a man with a ram\'s head', role: 'the potter who shapes people on his wheel; god of the cataract', center: 'Elephantine' },
    { key: 'atum', name: 'Atum', tl: 'jtmw', look: 'a man wearing the double crown', role: 'the creator in the Heliopolis account', center: 'Heliopolis' },
    { key: 'nut', name: 'Nut', tl: 'nwt', look: 'a woman arched over the earth, her body covered with stars', role: 'goddess of the sky', center: '' },
    { key: 'geb', name: 'Geb', tl: 'gb', look: 'a man lying on the ground beneath the sky goddess', role: 'god of the earth', center: '' },
    { key: 'shu', name: 'Shu', tl: 'šw', look: 'a man with a feather, holding up the sky', role: 'god of the air', center: '' },
    { key: 'aten', name: 'Aten', tl: 'jtn', look: 'the sun disk with rays ending in hands', role: 'the sun disk Akhenaten put above all gods', center: 'Amarna' },
    { key: 'khepri', name: 'Khepri', tl: 'ḫprj', look: 'a scarab beetle, or a man with a scarab for a head', role: 'the rising morning sun', center: '' },
    { key: 'bes', name: 'Bes', tl: 'bs', look: 'a dwarf with a lion-like face and a feathered crown', role: 'protector of homes, mothers and children', center: '' },
    { key: 'taweret', name: 'Taweret', tl: 'tꜣ-wrt', look: 'a standing hippopotamus with a lion\'s paws and a crocodile\'s tail', role: 'protector in childbirth', center: '' },
    { key: 'nephthys', name: 'Nephthys', tl: 'nbt-ḥwt', look: 'a woman with the signs for "lady of the house" on her head', role: 'sister of Isis, mourner of Osiris', center: '' },
    { key: 'hapi', name: 'Hapi', tl: 'ḥꜥpj', look: 'a plump man with papyrus plants on his head', role: 'the Nile flood', center: '' }
  ];
  /* ---------------------------------------------------------------- temples, pyramids and scripts */
  // a New Kingdom cult temple from the river to the god's room (the order eg-temple draws and problems ask)
  var TEMPLE = [
    { key: 'quay', name: 'Quay', note: 'a landing on the river or a canal, where the god\'s boat arrived at festivals' },
    { key: 'avenue', name: 'Avenue of sphinxes', note: 'a processional way lined with sphinxes' },
    { key: 'pylon', name: 'Pylon', note: 'the great gateway: two towers flanking a door, often with flagpoles and obelisks in front; it stands for the horizon' },
    { key: 'court', name: 'Open court', note: 'a courtyard open to the sky, with columns around its sides (a peristyle court); people could come this far on feast days' },
    { key: 'hypostyle', name: 'Hypostyle hall', note: 'a roofed hall full of columns like a papyrus marsh, lit by high windows' },
    { key: 'offering', name: 'Offering hall', note: 'a smaller hall where offerings were laid out' },
    { key: 'sanctuary', name: 'Sanctuary', note: 'the god\'s room, with the shrine (naos) for the statue and a stand for the sacred boat; only the king and high priests entered' }
  ];
  var TEMPLE_EXTRA = [{ key: 'lake', name: 'Sacred lake', note: 'a pool for purification' }, { key: 'wall', name: 'Enclosure wall', note: 'a mud-brick wall around the temple grounds' }, { key: 'obelisk', name: 'Obelisks', note: 'tall stone shafts with a pointed top, in pairs before a pylon' }];
  // pyramid measurements in meters and degrees (original sizes, as given on Wikipedia; rounded)
  var PYRAMIDS = {
    great: { name: 'Great Pyramid of Khufu', king: 'khufu', site: 'giza', h: 146.6, base: 230.3, slope: 51.84, now: 138.5, note: 'about 2.3 million blocks; the tallest building in the world for almost 3,800 years' },
    khafre: { name: 'Pyramid of Khafre', king: 'khafre', site: 'giza', h: 143.5, base: 215.3, slope: 53.17, now: 136.4, note: 'some of its smooth casing stones survive near the top' },
    menkaure: { name: 'Pyramid of Menkaure', king: 'menkaure', site: 'giza', h: 65.5, base: 103.4, slope: 51.33, now: 61, note: 'the smallest of the three' },
    step: { name: 'Step Pyramid of Djoser', king: 'djoser', site: 'saqqara', h: 62.5, base: 121, base2: 109, slope: 0, steps: 6, now: 62.5, note: 'six steps of stone, one on top of another' },
    bent: { name: 'Bent Pyramid', king: 'sneferu', site: 'dahshur', h: 104.7, base: 188.6, slope: 54.45, slope2: 43.37, at: 47, now: 104.7, note: 'the angle changes partway up' },
    red: { name: 'Red Pyramid', king: 'sneferu', site: 'dahshur', h: 104, base: 220, slope: 43.37, now: 104, note: 'the first smooth-sided true pyramid to be finished' }
  };
  var LANG_STAGES = [
    { key: 'old', name: 'Old Egyptian', from: -2600, to: -2000, note: 'the language of the Old Kingdom and the Pyramid Texts' },
    { key: 'middle', name: 'Middle Egyptian', from: -2000, to: -1350, note: 'the classical language: spoken in the Middle Kingdom, and written in formal inscriptions until the end' },
    { key: 'late', name: 'Late Egyptian', from: -1350, to: -700, note: 'the everyday language of the New Kingdom' },
    { key: 'demotic', name: 'Demotic', from: -700, to: 450, note: 'the language of the Late, Ptolemaic and Roman periods (also the name of its script)' },
    { key: 'coptic', name: 'Coptic', from: 200, to: 1700, note: 'the last stage, written in the Coptic alphabet; still used in the Coptic Church\'s worship' }
  ];
  var SCRIPTS = [
    { key: 'hieroglyphic', name: 'Hieroglyphic', from: -3200, to: 394, dir: 'right to left, left to right or in columns', look: 'pictures of people, animals, plants and things, carved or painted with care', use: 'monuments, temples, tombs and sacred objects' },
    { key: 'hieratic', name: 'Hieratic', from: -3200, to: 250, dir: 'right to left', look: 'a quick, joined-up form of the hieroglyphs written with a reed brush and ink', use: 'letters, accounts, literature and religious books on papyrus' },
    { key: 'demotic', name: 'Demotic', from: -650, to: 452, dir: 'right to left', look: 'a very cursive script grown out of hieratic, with many signs run together', use: 'contracts, letters, business and stories in the Late Period and after; the middle text of the Rosetta Stone' },
    { key: 'coptic', name: 'Coptic', from: 200, to: 2026, dir: 'left to right', look: 'the Greek alphabet plus six or seven letters taken from Demotic', use: 'Christian Egypt\'s books and letters, and the Coptic Church today' },
    { key: 'greek', name: 'Greek', from: -332, to: 641, dir: 'left to right', look: 'the Greek alphabet', use: 'government under the Ptolemies and Romans; the bottom text of the Rosetta Stone' }
  ];
  // the Coptic letters taken from Demotic (Sahidic has six; Bohairic adds ϧ), with the sign each comes from (as Wikipedia gives it)
  var COPTIC_EXTRA = [
    { c: 'ϣ', C: 'Ϣ', name: 'shai', sound: 'sh', from: 'the pool with lotus flowers (šꜣ)' },
    { c: 'ϥ', C: 'Ϥ', name: 'fai', sound: 'f', from: 'the horned viper (f)' },
    { c: 'ϧ', C: 'Ϧ', name: 'khai', sound: 'kh (Bohairic only)', from: 'the lotus plant (ḫꜣ)' },
    { c: 'ϩ', C: 'Ϩ', name: 'hori', sound: 'h', from: 'a Demotic sign group for h' },
    { c: 'ϫ', C: 'Ϫ', name: 'janja', sound: 'ch (as in "church"), /tʃ/', from: 'the fire drill (ḏꜣ)' },
    { c: 'ϭ', C: 'Ϭ', name: 'qima', sound: 'ky', from: 'the basket (k)' },
    { c: 'ϯ', C: 'Ϯ', name: 'ti', sound: 'ti', from: 'the arm giving a loaf (dj) and the bread loaf (t)' }
  ];
  var COPTIC_GREEK = 'ⲁⲃⲅⲇⲉⲍⲏⲑⲓⲕⲗⲙⲛⲝⲟⲡⲣⲥⲧⲩⲫⲭⲯⲱ'.split('');
  var COPTIC_GREEK_NAMES = ['alpha', 'beta (vida)', 'gamma', 'delta', 'ei', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'laula', 'mi', 'ni', 'ksi', 'o', 'pi', 'ro', 'sima', 'tau', 'he', 'phi', 'khi', 'psi', 'ō (oou)'];
  // the same word from Middle Egyptian to Coptic (Sahidic)
  var DESCENT = [
    { word: 'ren', tl: 'rn', cop: 'ⲣⲁⲛ', say: 'ran', en: 'name' },
    { word: 'ankh', tl: 'ꜥnḫ', cop: 'ⲱⲛϩ', say: 'ōnh', en: 'life, to live' },
    { word: 'netjer', tl: 'nṯr', cop: 'ⲛⲟⲩⲧⲉ', say: 'noute', en: 'god' },
    { word: 'remetj', tl: 'rmṯ', cop: 'ⲣⲱⲙⲉ', say: 'rōme', en: 'person, man' },
    { word: 'nfr', tl: 'nfr', cop: 'ⲛⲟⲩϥⲉ', say: 'noufe', en: 'good' },
    { word: 'mu', tl: 'mw', cop: 'ⲙⲟⲟⲩ', say: 'mou', en: 'water' },
    { word: 'ra', tl: 'rꜥ', cop: 'ⲣⲏ', say: 'rē', en: 'sun' },
    { word: 'sedjem', tl: 'sḏm', cop: 'ⲥⲱⲧⲙ', say: 'sōtm', en: 'hear' },
    { word: 'kheper', tl: 'ḫpr', cop: 'ϣⲱⲡⲉ', say: 'šōpe', en: 'become' }
  ];
  // the Rosetta Stone: what survives of each text (lines)
  var ROSETTA = { date: -196, found: 1799, place: 'rosetta', texts: [['hieroglyphic', 14, 'top, broken'], ['demotic', 32, 'middle'], ['greek', 54, 'bottom']], king: 'ptolemy5' };
  /* ---------------------------------------------------------------- the map's geography
     Drawn for this site, point by point, through the coordinates of known places (towns on the river, river mouths, capes,
     ports and cataracts, each checked against the coordinates Wikipedia gives for it). It is a simplified picture, good
     to a few kilometers, not a survey; the public geodata packages (Natural Earth) could not be downloaded when it was
     made, so a later build may swap these lines for Natural Earth's 10m coastline, rivers and lakes (same lat/lon form).
     Every line is [[lat, lon], …]. Water bodies are closed rings. */
  var GEO = {
    box: { s: 15.0, n: 35.0, w: 24.0, e: 38.0 },
    // the Mediterranean (a ring: the coast from west to east, then the map's top edge)
    med: [[35.0, 24.0], [32.0, 24.0], [31.76, 25.09], [31.55, 25.16], [31.61, 25.93], [31.48, 26.6], [31.35, 27.24], [31.2, 27.85], [31.03, 28.43], [30.83, 28.95],
      [31.0, 29.45], [31.13, 29.78], [31.2, 29.9], [31.27, 30.0], [31.32, 30.07], [31.37, 30.25], [31.46, 30.36], [31.53, 30.6], [31.59, 30.98], [31.6, 31.1],
      [31.55, 31.5], [31.52, 31.84], [31.42, 32.05], [31.27, 32.3], [31.13, 32.55], [31.12, 32.85], [31.17, 33.2], [31.14, 33.8], [31.3, 34.24],
      [31.52, 34.45], [31.67, 34.56], [31.8, 34.64], [32.06, 34.75], [32.33, 34.85], [32.5, 34.89], [32.69, 34.94], [32.83, 34.96], [32.82, 35.03],
      [32.92, 35.07], [33.09, 35.1], [33.27, 35.2], [33.56, 35.37], [33.73, 35.45], [33.9, 35.48], [33.98, 35.62], [34.12, 35.64], [34.25, 35.66],
      [34.32, 35.72], [34.45, 35.82], [34.63, 35.98], [34.89, 35.88], [35.0, 35.87]],
    // the Red Sea with the Gulfs of Suez and Aqaba (a ring)
    red: [[29.97, 32.55], [29.87, 32.47], [29.6, 32.34], [29.11, 32.66], [28.75, 32.85], [28.36, 33.09], [28.13, 33.28], [27.8, 33.5], [27.4, 33.68], [27.26, 33.81],
      [26.75, 33.94], [26.1, 34.28], [25.6, 34.55], [25.07, 34.89], [24.6, 35.1], [24.2, 35.25], [23.93, 35.48], [23.9, 35.79], [23.75, 35.6], [23.13, 35.59],
      [22.75, 36.05], [22.37, 36.42], [22.22, 36.64], [22.0, 36.9], [21.3, 37.1], [20.6, 37.2], [19.62, 37.22], [19.1, 37.33], [18.45, 37.75], [18.15, 38.0],
      [15.0, 38.0], [15.0, 38.0], [24.3, 38.0], [24.09, 38.06], [25.02, 37.27], [26.24, 36.45], [27.35, 35.69], [27.65, 35.25], [27.98, 34.57],
      [28.4, 34.75], [28.85, 34.8], [29.29, 34.94], [29.53, 35.01], [29.55, 34.96], [29.49, 34.9], [28.98, 34.66], [28.5, 34.51], [28.25, 34.43], [27.91, 34.33],
      [27.73, 34.25], [28.0, 33.95], [28.24, 33.62], [28.6, 33.3], [28.89, 33.18], [29.05, 33.1], [29.59, 32.71], [29.93, 32.6]],
    cyprus: [[35.0, 32.3], [34.77, 32.42], [34.7, 32.72], [34.56, 33.03], [34.68, 33.04], [34.92, 33.63], [34.97, 34.0], [35.0, 34.05]],
    // the Nile from the Mediterranean to Khartoum, then the White and Blue Niles and the Atbara (lines)
    nile: [[30.19, 31.13], [30.05, 31.225], [29.96, 31.245], [29.85, 31.272], [29.6, 31.26], [29.41, 31.25], [29.07, 31.1], [28.75, 30.92], [28.4, 30.8],
      [28.1, 30.76], [27.73, 30.85], [27.4, 30.98], [27.18, 31.19], [27.0, 31.32], [26.77, 31.5], [26.56, 31.7], [26.33, 31.92], [26.17, 32.1], [26.05, 32.24],
      [26.1, 32.5], [26.16, 32.7], [25.92, 32.76], [25.75, 32.656], [25.73, 32.648], [25.70, 32.631], [25.62, 32.54], [25.29, 32.55], [24.98, 32.88],
      [24.64, 32.93], [24.45, 32.94], [24.25, 32.9], [24.09, 32.895], [23.97, 32.88]],
    nileNubia: [[21.0, 30.95], [21.1, 30.7], [20.9, 30.55], [20.5, 30.45], [20.1, 30.6], [19.85, 30.35], [19.6, 30.4], [19.17, 30.48], [18.6, 30.75],
      [18.05, 30.95], [18.11, 31.55], [18.4, 31.75], [18.55, 31.83], [18.67, 32.05], [18.95, 32.4], [19.3, 32.9], [19.53, 33.33], [19.0, 33.7], [18.38, 33.9],
      [18.02, 33.98], [17.68, 33.98], [17.2, 33.9], [16.94, 33.72], [16.69, 33.43], [16.3, 32.69], [15.9, 32.6], [15.61, 32.53]],
    whiteNile: [[15.61, 32.53], [15.3, 32.48], [15.0, 32.45]],
    blueNile: [[15.61, 32.53], [15.45, 32.8], [15.2, 33.05], [15.0, 33.2]],
    atbara: [[17.68, 33.98], [17.4, 34.4], [16.8, 35.2], [16.0, 35.6], [15.0, 35.95]],
    // Lake Nasser / Lake Nubia (a ring around the flooded valley, from the High Dam to the Dal cataract)
    nasser: [[23.97, 32.86], [23.97, 32.9], [23.6, 32.95], [23.2, 32.85], [22.9, 32.7], [22.75, 32.5], [22.6, 32.32], [22.45, 31.95], [22.3, 31.7], [22.0, 31.5],
      [21.75, 31.36], [21.4, 31.2], [21.0, 30.98], [21.0, 30.9], [21.38, 31.12], [21.72, 31.3], [21.95, 31.42], [22.3, 31.6], [22.4, 31.8], [22.55, 32.15],
      [22.7, 32.4], [22.85, 32.6], [23.15, 32.78], [23.55, 32.86], [23.97, 32.86]],
    rosetta: [[30.19, 31.13], [30.4, 31.0], [30.6, 30.9], [30.83, 30.82], [31.13, 30.64], [31.2, 30.55], [31.4, 30.42], [31.46, 30.36]],
    damietta: [[30.19, 31.13], [30.46, 31.18], [30.71, 31.24], [31.04, 31.38], [31.2, 31.55], [31.33, 31.72], [31.42, 31.81], [31.52, 31.84]],
    lakes: [
      [[29.45, 30.4], [29.5, 30.5], [29.52, 30.7], [29.48, 30.82], [29.44, 30.75], [29.45, 30.55]],               // Lake Qarun (Faiyum)
      [[31.08, 31.88], [31.32, 31.86], [31.33, 32.1], [31.24, 32.28], [31.1, 32.22], [31.05, 32.0]],               // Lake Manzala
      [[31.42, 30.55], [31.56, 30.65], [31.58, 31.05], [31.47, 31.1], [31.42, 30.8]],                              // Lake Burullus
      [[31.1, 29.85], [31.17, 29.88], [31.16, 30.05], [31.1, 30.02]],                                              // Lake Mariout
      [[30.42, 32.32], [30.38, 32.4], [30.25, 32.5], [30.2, 32.45], [30.3, 32.36]],                                // the Bitter Lakes
      [[31.78, 35.5], [31.75, 35.58], [31.4, 35.6], [31.05, 35.45], [31.1, 35.39], [31.5, 35.45]],                // the Dead Sea
      [[32.88, 35.57], [32.85, 35.65], [32.72, 35.63], [32.7, 35.57], [32.8, 35.52]]                              // the Sea of Galilee
    ],
    jordan: [[32.7, 35.57], [32.3, 35.56], [31.9, 35.54], [31.78, 35.55]],
    canal: [[31.26, 32.31], [30.85, 32.31], [30.59, 32.27], [30.42, 32.33], [30.2, 32.45], [29.97, 32.55]],          // the Suez Canal (modern)
    // Thebes in detail: the river centerline, the edges of the cultivated land on the west and east banks, and the crest of
    // the Theban hills (the Valley of the Kings lies just behind it, Deir el-Bahari below its cliffs)
    thebes: {
      box: [25.60, 25.84, 32.50, 32.76], halfw: 0.0035,
      river: [[25.600, 32.578], [25.640, 32.598], [25.660, 32.612], [25.680, 32.622], [25.700, 32.632], [25.715, 32.641], [25.730, 32.649], [25.750, 32.657], [25.770, 32.664], [25.800, 32.672], [25.840, 32.680]],
      west: [[25.600, 32.555], [25.640, 32.575], [25.660, 32.583], [25.690, 32.592], [25.710, 32.598], [25.720, 32.603], [25.730, 32.612], [25.740, 32.620], [25.760, 32.630], [25.790, 32.642], [25.840, 32.655]],
      east: [[25.600, 32.625], [25.640, 32.650], [25.680, 32.668], [25.700, 32.680], [25.730, 32.695], [25.760, 32.705], [25.790, 32.712], [25.840, 32.720]],
      hills: [[25.690, 32.570], [25.700, 32.578], [25.715, 32.586], [25.728, 32.596], [25.738, 32.604], [25.748, 32.612], [25.760, 32.620], [25.775, 32.628], [25.800, 32.638]],
      labels: [['Nile', 25.676, 32.616, 'water'], ['West bank', 25.672, 32.598], ['East bank', 25.665, 32.645], ['Theban hills', 25.700, 32.560, 'hills'], ['Desert', 25.755, 32.585, 'desert'], ['Desert', 25.700, 32.700, 'desert']]
    },
    oases: [['Siwa', 29.20, 25.52], ['Bahariya', 28.35, 28.86], ['Farafra', 27.06, 27.97], ['Dakhla', 25.50, 29.00], ['Kharga', 25.45, 30.55]],
    seas: [['Mediterranean Sea', 33.2, 28.5], ['Red Sea', 21.6, 37.2], ['Gulf of Suez', 28.6, 32.95], ['Gulf of Aqaba', 28.9, 34.75]],
    regions: [['LOWER EGYPT', 30.65, 30.25], ['UPPER EGYPT', 26.8, 31.95], ['NUBIA (KUSH)', 20.1, 31.4], ['SINAI', 29.6, 33.8], ['WESTERN DESERT', 26.25, 27.0], ['EASTERN DESERT', 24.9, 34.05], ['CANAAN', 32.2, 35.2]]
  };
  /* ---------------------------------------------------------------- functions */
  function year(y, c) { // -1279 -> "1279 BC", 30 -> "AD 30"; c: true adds "c. " before 664 BC
    if (y === undefined || y === null || isNaN(y)) return '';
    var s = y < 0 ? (-y) + ' BC' : 'AD ' + y;
    return (c && y < -664 ? 'c. ' : '') + s;
  }
  function span(a, b, c) { // "c. 1279–1213 BC", "30 BC–AD 14", "AD 395–641"
    if (a === b) return year(a, c);
    var pre = c && a < -664 ? 'c. ' : '';
    if (a < 0 && b < 0) return pre + (-a) + '–' + (-b) + ' BC';
    if (a >= 0 && b >= 0) return 'AD ' + a + '–' + b;
    return pre + (-a) + ' BC–AD ' + b;
  }
  function period(key) { for (var i = 0; i < PERIODS.length; i++) if (PERIODS[i].key === key) return PERIODS[i]; return null; }
  function periodOf(y) { for (var i = 0; i < PERIODS.length; i++) if (y >= PERIODS[i].from && y < PERIODS[i].to) return PERIODS[i]; return y >= 641 ? null : y < -5300 ? null : PERIODS[PERIODS.length - 1]; }
  function dynastyOf(y) { var out = []; DYNASTIES.forEach(function (d) { if (y >= d.from && y <= d.to) out.push(d); }); return out; }
  function king(key) { for (var i = 0; i < KINGS.length; i++) if (KINGS[i].key === key) return KINGS[i]; return null; }
  function site(key) { for (var i = 0; i < SITES.length; i++) if (SITES[i].key === key) return SITES[i]; return null; }
  function god(key) { for (var i = 0; i < GODS.length; i++) if (GODS[i].key === key) return GODS[i]; return null; }
  function sign(code) { return SIGNS[code] || null; }
  function signsOf(kind) { return SIGN_ORDER.filter(function (c) { return SIGNS[c].k === kind; }); }
  function signFor(letter) { // the uniliteral for a transliteration letter
    var L = tlShow(letter); for (var i = 0; i < ALPHA.length; i++) if (ALPHA[i][0] === L) return ALPHA[i][2]; return null;
  }
  function text(sp) { // the Unicode text of a spelling (signs in reading order)
    return (String(sp).match(/[A-Z][a-z]?\d+[A-Z]?/g) || []).map(function (c) { return SIGNS[c] ? SIGNS[c].u : ''; }).join('');
  }
  function codes(sp) { return (String(sp).match(/[A-Z][a-z]?\d+[A-Z]?/g) || []).slice(); }
  // English letters -> sound signs (the fun way to write a modern name, as scribes of the Ptolemaic period spelled foreign
  // names with sound signs). Vowels: a -> vulture, e and i -> reed, o -> lasso, u -> quail chick, y -> two reeds.
  var NAME_MAP = { a: ['G1'], b: ['D58'], c: ['V31'], d: ['D46'], e: ['M17'], f: ['I9'], g: ['W11'], h: ['O4'], i: ['M17'], j: ['I10'], k: ['V31'],
    l: ['E23'], m: ['G17'], n: ['N35'], o: ['V4'], p: ['Q3'], q: ['N29'], r: ['D21'], s: ['S29'], t: ['X1'], u: ['G43'], v: ['I9'], w: ['G43'],
    x: ['V31', 'S29'], y: ['M17A'], z: ['O34'], ch: ['V13'], sh: ['N37'], kh: ['Aa1'], th: ['X1', 'O4'] };
  function nameSigns(name) {
    var s = String(name || '').toLowerCase().replace(/[^a-z]/g, ''), out = [], i = 0;
    while (i < s.length) {
      var two = s.slice(i, i + 2);
      if (NAME_MAP[two] && two !== 'th') { out.push({ letters: two, signs: NAME_MAP[two] }); i += 2; continue; }
      if (s[i] === s[i + 1]) { out.push({ letters: s[i] + s[i], signs: NAME_MAP[s[i]] }); i += 2; continue; }
      out.push({ letters: s[i], signs: NAME_MAP[s[i]] || [] }); i++;
    }
    return out;
  }

  /* the layout code: Gardiner codes; '-' next group, ':' stack, '*' side by side, ( ) nesting, spaces between words.
     parse(sp) -> [word: [group node]] where a node is { t: 'sign', c } | { t: 'row', kids } | { t: 'col', kids } */
  function parse(sp) {
    return String(sp || '').trim().split(/\s+/).filter(Boolean).map(function (w) {
      var i = 0;
      function atom() {
        if (w[i] === '(') { i++; var n = stack(); if (w[i] === ')') i++; return n; }
        var m = /^[A-Z][a-z]?\d+[A-Z]?/.exec(w.slice(i)); if (!m) throw new Error('Bad sign at "' + w.slice(i) + '" in ' + sp);
        i += m[0].length; if (!SIGNS[m[0]]) throw new Error('Unknown sign ' + m[0]); return { t: 'sign', c: m[0] };
      }
      function row() { var k = [atom()]; while (w[i] === '*') { i++; k.push(atom()); } return k.length > 1 ? { t: 'row', kids: k } : k[0]; }
      function stack() { var k = [row()]; while (w[i] === ':') { i++; k.push(row()); } return k.length > 1 ? { t: 'col', kids: k } : k[0]; }
      var groups = [groupOne()];
      function groupOne() { return stack(); }
      while (i < w.length) { if (w[i] === '-') { i++; groups.push(stack()); } else throw new Error('Unexpected "' + w[i] + '" in ' + sp); }
      return groups;
    });
  }
  /* layout(sp, o) -> { w, h, signs: [{ c, u, x, y, w, h, fs, word, n }] } in quadrat units (a full-height sign ≈ 1).
     o: { dir: 'ltr' | 'rtl' | 'col' | 'colr', gap (between groups, default 0.14), wgap (between words, default 0.5) }.
     x, y: the ink box's top left; fs: the font size (in the same units) to draw the sign at; flip: true when it faces right. */
  var Q = 0.84, GAP = 0.05;
  function measure(n) {
    if (n.t === 'sign') { var m = SIGNS[n.c].m; return { w: m[0], h: m[1] - m[2] }; }
    var ms = n.kids.map(measure);
    if (n.t === 'row') return { w: ms.reduce(function (a, b) { return a + b.w; }, 0) + GAP * (ms.length - 1), h: Math.max.apply(null, ms.map(function (x) { return x.h; })) };
    return { w: Math.max.apply(null, ms.map(function (x) { return x.w; })), h: ms.reduce(function (a, b) { return a + b.h; }, 0) + GAP * (ms.length - 1) };
  }
  function place(n, x, y, s, out, word) { // x, y: top left of the node's box at scale s
    var me = measure(n);
    if (n.t === 'sign') { var m = SIGNS[n.c].m; out.push({ c: n.c, u: SIGNS[n.c].u, x: x, y: y, w: m[0] * s, h: (m[1] - m[2]) * s, fs: s / Q * Q, top: m[1], word: word }); return; }
    var ms = n.kids.map(measure);
    if (n.t === 'row') { var cx = x; n.kids.forEach(function (k, i) { place(k, cx, y + (me.h - ms[i].h) * s / 2, s, out, word); cx += (ms[i].w + GAP) * s; }); }
    else { var cy = y; n.kids.forEach(function (k, i) { place(k, x + (me.w - ms[i].w) * s / 2, cy, s, out, word); cy += (ms[i].h + GAP) * s; }); }
  }
  function layout(sp, o) {
    o = o || {}; var dir = o.dir || 'ltr', col = dir === 'col' || dir === 'colr', gap = o.gap === undefined ? 0.14 : o.gap, wgap = o.wgap === undefined ? 0.5 : o.wgap;
    var words = parse(sp), out = [], pos = 0, W = 0, H = 0, wordBoxes = [];
    words.forEach(function (groups, wi) {
      if (wi) pos += wgap - gap;
      var start = pos;
      groups.forEach(function (g, gi) {
        if (gi || wi) pos += gap;
        var me = measure(g), s = Math.min(1, Q / me.h, (col ? 1.15 : 1.6) / me.w);
        var gw = me.w * s, gh = me.h * s, sub = [];
        if (!col) { place(g, pos, (Q - gh) / 2, s, sub, wi); pos += gw; }
        else { place(g, (1.15 - gw) / 2, pos, s, sub, wi); pos += gh; }
        sub.forEach(function (p) { p.group = gi; out.push(p); });
      });
      wordBoxes.push([start, pos]);
    });
    if (!col) { W = pos; H = Q; } else { W = 1.15; H = pos; }
    out.forEach(function (p, i) { p.n = i; p.flip = dir === 'rtl' || dir === 'colr'; });
    if (dir === 'rtl') out.forEach(function (p) { p.x = W - p.x - p.w; });
    if (dir === 'rtl') wordBoxes = wordBoxes.map(function (b) { return [W - b[1], W - b[0]]; });
    return { w: W, h: H, signs: out, words: wordBoxes, dir: dir };
  }

  /* map projection (equirectangular, x stretched by cos 26°): lat, lon -> x, y in map units (1 unit = 1 km, about) */
  var KX = 111.32 * Math.cos(26 * Math.PI / 180), KY = 110.57;
  function project(lat, lon) { return [(lon - GEO.box.w) * KX, (GEO.box.n - lat) * KY]; }
  function unproject(x, y) { return [GEO.box.n - y / KY, GEO.box.w + x / KX]; }
  function km(a, b) { // great-circle distance between { lat, lon } points
    var R = 6371, p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180, dp = p2 - p1, dl = (b.lon - a.lon) * Math.PI / 180;
    var h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  var VIEWS = { all: [15.2, 35.0, 24.0, 38.0], nile: [15.3, 32.4, 24.0, 38.0], egypt: [21.8, 31.9, 24.6, 35.6], delta: [29.7, 31.7, 29.6, 32.6],
    memphis: [29.7, 30.2, 30.95, 31.45], thebes: [25.66, 25.78, 32.54, 32.71], upper: [24.0, 27.0, 31.0, 33.6], nubia: [15.4, 24.3, 29.6, 34.6],
    levant: [29.3, 35.0, 31.5, 37.6], fayum: [29.0, 29.7, 30.3, 31.4] };

  function pick(arr, n, r) { r = r || Math.random; var a = arr.slice(), out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(r() * a.length), 1)[0]); return out; }

  ML.egypt = {
    SIGNS: SIGNS, SIGN_ORDER: SIGN_ORDER, ALPHA: ALPHA, ALPHA_ORDER: ALPHA_ORDER, WORDS: WORDS, NAMES: NAMES, NUMERALS: NUMERALS,
    PERIODS: PERIODS, DYNASTIES: DYNASTIES, KINGS: KINGS, SITES: SITES, CITIES: CITIES, CATARACTS: CATARACTS, GODS: GODS,
    TEMPLE: TEMPLE, TEMPLE_EXTRA: TEMPLE_EXTRA, PYRAMIDS: PYRAMIDS, LANG_STAGES: LANG_STAGES, SCRIPTS: SCRIPTS,
    COPTIC_EXTRA: COPTIC_EXTRA, COPTIC_GREEK: COPTIC_GREEK, COPTIC_GREEK_NAMES: COPTIC_GREEK_NAMES, DESCENT: DESCENT, ROSETTA: ROSETTA,
    GEO: GEO, VIEWS: VIEWS, NAME_MAP: NAME_MAP,
    norm: tlNorm, show: tlShow, same: tlSame, mdc: toMdc, letters: function (s) { return tlLetters(s, false).letters; }, say: vocalize,
    year: year, span: span, period: period, periodOf: periodOf, dynastyOf: dynastyOf, king: king, site: site, god: god, sign: sign,
    signsOf: signsOf, signFor: signFor, text: text, codes: codes, parse: parse, layout: layout, nameSigns: nameSigns,
    numberSigns: numberSigns, numberValue: numberValue,
    numberSp: function (n) { // a numeral in groups (like signs stacked, up to 4 to a group)
      var s = numberSigns(n), groups = [], i = 0;
      while (i < s.length) { var c = s[i], k = 0; while (s[i + k] === c) k++; var n2 = k; while (n2 > 0) { var t = Math.min(n2, n2 > 4 && n2 < 8 ? Math.ceil(n2 / 2) : 4); groups.push(Array(t + 1).join(c + '*').replace(/\*$/, '')); n2 -= t; } i += k; }
      return groups.join('-');
    },
    project: project, unproject: unproject, km: km, pick: pick
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = ML.egypt;
  /* =====================================================================================================================
     THE VISUALS (need math/viz/core.js and a document)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math, EG = ML.egypt;
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  var uidN = 0; function uid(p) { return 'egv-' + (p || 'x') + '-' + (++uidN); }
  function okMark(good) { return '<span class="' + (good ? 'egv-ok' : 'egv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function seeded(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(String(key)), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(n, key) {
    var idx = []; for (var i = 0; i < n; i++) idx.push(i);
    for (var t = 0; t < 20; t++) { var s = shuffle(idx, key + '#' + t); if (n < 2 || s.some(function (v, j) { return v !== j; })) return s; }
    return idx.slice(1).concat([0]);
  }
  function letter(i) { return String.fromCharCode(65 + i); }
  function svgRoot(w, hh, label, cls) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'egv-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w && w !== last) { last = w; fn(); } }).observe(e); } else W.addEventListener('resize', fn); }
  function tlSpan(s) { return '<span class="eg-tl">' + esc(EG.show(s)) + '</span>'; }
  function hiero(s) { return '<span class="eg-h">' + esc(s) + '</span>'; }
  function signLabel(c) { var S = EG.sign(c); if (!S) return c; return c + (S.v.length ? ' (' + S.v.join(', ') + ')' : '') + ': ' + S.n; }
  var KIND = { uni: 'one-sound sign (uniliteral)', bi: 'two-sound sign (biliteral)', tri: 'three-sound sign (triliteral)', logo: 'word sign (logogram)', det: 'determinative', num: 'numeral' };
  var ROLE = { plural: 'repeated or strokes: the plural', dual: 'doubled: the dual', num: 'number sign', old: 'written but not read (left from an older spelling)', phon: 'sound sign', comp: 'phonetic complement', logo: 'word sign', stroke: 'stroke (marks a word sign)', det: 'determinative', end: 'ending' };

  // the frame every visual shares: class, aria-label, task line, body, controls, readout, caption
  function frame(el, o, name, label) {
    el.classList.add('egv', 'egv-' + name);
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.task) el.appendChild(h('p', 'egv-task', o.task));
    F.body = h('div', 'egv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl egv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout egv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }

  /* draw a layout (EG.layout) into an svg group: U px per quadrat unit, at (x0, y0). marks(p) -> extra class names.
     Each sign is a <text> with its Unicode character in TRB Hieroglyphs, so it copies and reads as Unicode. */
  function drawSigns(g, L, U, x0, y0, marks) {
    var els = [];
    L.signs.forEach(function (p) {
      var F = p.fs * U, x = x0 + p.x * U, y = y0 + p.y * U, w = p.w * U, hh = p.h * U;
      var t = sv('text', { x: (x - 0.04 * F).toFixed(2), y: (y + p.top * F).toFixed(2), 'font-size': F.toFixed(2), class: 'egv-sign' + (marks ? ' ' + (marks(p) || '') : '') }, g);
      if (p.flip) t.setAttribute('transform', 'translate(' + (2 * x + w).toFixed(2) + ',0) scale(-1,1)');
      t.textContent = p.u;
      els.push({ el: t, p: p, box: [x, y, w, hh] });
    });
    return els;
  }
  // a cartouche (an oval rope loop with a tie bar at the end) around a box
  function cartouche(g, x, y, w, hh, vertical, end) {
    var r = vertical ? w / 2 : hh / 2, sw = M.max(2.2, M.min(w, hh) * 0.045);
    sv('rect', { x: x, y: y, width: w, height: hh, rx: r, ry: r, class: 'egv-cart', 'stroke-width': sw }, g);
    sv('rect', { x: x + sw * 1.4, y: y + sw * 1.4, width: w - sw * 2.8, height: hh - sw * 2.8, rx: r - sw * 1.4, ry: r - sw * 1.4, class: 'egv-cart2', 'stroke-width': sw * 0.4 }, g);
    if (vertical) sv('rect', { x: x - sw * 0.6, y: end === 'top' ? y - sw * 3 : y + hh + sw * 0.6, width: w + sw * 1.2, height: sw * 2.4, rx: sw * 0.6, class: 'egv-cartbar' }, g);
    else sv('rect', { x: end === 'left' ? x - sw * 3 : x + w + sw * 0.6, y: y - sw * 0.6, width: sw * 2.4, height: hh + sw * 1.2, rx: sw * 0.6, class: 'egv-cartbar' }, g);
  }
  /* ---------- eg-glyphs: a word or a text in hieroglyphs, with transliteration, saying, translation and a sign-by-sign breakdown ---------- */
  function resolveText(o) { // -> { sp, tl, en, parts, note }
    if (o.word && EG.WORDS[o.word]) { var w = EG.WORDS[o.word]; return { sp: w.sp, tl: w.tl, en: w.en, parts: w.parts, note: w.note }; }
    if (o.name && EG.NAMES[o.name]) { var n = EG.NAMES[o.name]; return { sp: n.sp, tl: n.tl, en: n.en, note: n.note, parts: n.signs.map(function (c) { var S = EG.sign(c); return [c, 'phon', S && S.v[0] || '']; }) }; }
    if (o.num !== undefined) { var nsp = EG.numberSp(+o.num); return { sp: nsp, tl: '', en: String(o.num).replace(/\B(?=(\d{3})+(?!\d))/g, ','), parts: EG.codes(nsp).map(function (c) { var v = 0; EG.NUMERALS.forEach(function (n) { if (n[1] === c) v = n[0]; }); return [c, 'num', String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')]; }) }; }
    if (o.words) { // several WORDS keys as one text
      var ws = o.words.map(function (k) { return EG.WORDS[k]; }).filter(Boolean);
      return { sp: ws.map(function (w) { return w.sp; }).join(' '), tl: ws.map(function (w) { return w.tl; }).join(' '), en: o.en || ws.map(function (w) { return w.en.split(/[;,]/)[0]; }).join(' · '), parts: [].concat.apply([], ws.map(function (w) { return w.parts; })) };
    }
    return { sp: o.sp || 'G1', tl: o.tl || '', en: o.en || '', parts: o.parts || null, note: o.note };
  }
  V.register('eg-glyphs', function (el, o) {
    var T = resolveText(o), F = frame(el, o, 'glyphs', 'Hieroglyphs' + (T.en && !o.quiet ? ': ' + T.en : ''));
    var dir = o.dir || 'ltr', L;
    try { L = EG.layout(T.sp, { dir: dir }); } catch (e) { F.body.innerHTML = '<p class="egv-err">' + esc(e.message) + '</p>'; return; }
    var codes = L.signs.map(function (p) { return p.c; });
    var parts = T.parts && T.parts.length === codes.length ? T.parts : codes.map(function (c) { var S = EG.sign(c); return [c, S.k === 'det' ? 'det' : S.k === 'logo' ? 'logo' : S.k === 'num' ? 'num' : 'phon', S.v[0] || '']; });
    var stage = h('div', 'egg-stage'); F.body.appendChild(stage);
    var lines = h('div', 'egg-lines'); F.body.appendChild(lines);
    var sel = o.highlight ? [].concat(o.highlight) : [], svg, els;
    function draw() {
      var avail = M.max(200, (stage.clientWidth || el.clientWidth || 600) - 4), U = +o.size || 84, col = dir === 'col' || dir === 'colr';
      if (!col && L.w * U > avail) U = M.max(26, avail / L.w);
      var pad = 0.14 * U, W0 = L.w * U + 2 * pad, H0 = L.h * U + 2 * pad + (o.arrow ? 0.34 * U : 0);
      stage.innerHTML = '';
      svg = svgRoot(W0, H0, (o.quiet ? 'Hieroglyphs' : 'Hieroglyphs for ' + (T.tl ? EG.show(T.tl) : '') + (T.en ? ', ' + T.en : '')) + (dir === 'rtl' ? ', written right to left' : ''), 'egg-svg');
      svg.style.width = W0 + 'px'; svg.style.maxWidth = '100%';
      stage.appendChild(svg);
      if (o.paper !== false) sv('rect', { x: 0, y: 0, width: W0, height: H0, rx: 10, class: 'egv-paper' }, svg);
      var g = sv('g', {}, svg);
      els = drawSigns(g, L, U, pad, pad, function (p) { return sel.indexOf(p.n) >= 0 ? 'on' : ''; });
      els.forEach(function (E, i) {
        var b = E.box;
        if (o.number) txt(svg, b[0] - 2, b[1] + 2, String(i + 1), { class: 'egg-num', 'text-anchor': 'end' });
        if (o.ask !== undefined && [].concat(o.ask).indexOf(i) >= 0) {
          sv('rect', { x: b[0] - 3, y: b[1] - 3, width: b[2] + 6, height: b[3] + 6, rx: 6, class: 'egg-ask' }, g);
          txt(svg, b[0] + b[2] + 2, b[1] + 4, '?', { class: 'egg-q' });
        }
        if (F.interactive && !F.quiet) {
          var hit = sv('rect', { x: b[0] - 2, y: b[1] - 2, width: b[2] + 4, height: b[3] + 4, class: 'egg-hit', tabindex: 0, role: 'button', 'aria-label': 'Sign ' + (i + 1) + ': ' + signLabel(E.p.c) }, svg);
          hit.addEventListener('click', function () { pick(i); });
          hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
        }
      });
      if (o.arrow) { // the signs face the start of the line
        var ay = H0 - 0.17 * U, ax0 = pad, ax1 = W0 - pad, rtl = dir === 'rtl';
        sv('line', { x1: ax0 + 6, y1: ay, x2: ax1 - 6, y2: ay, class: 'egg-arrow' }, svg);
        var tip = rtl ? ax0 : ax1, s = rtl ? 1 : -1;
        sv('path', { d: 'M' + tip + ' ' + ay + ' l' + (s * 9) + ' -5 l0 10 Z', class: 'egg-arrowhead' }, svg);
      }
    }
    function pick(i) {
      sel = sel.length === 1 && sel[0] === i ? [] : [i];
      els.forEach(function (E, j) { E.el.classList.toggle('on', sel.indexOf(j) >= 0); });
      if (!sel.length) { F.say(''); return; }
      var c = codes[i], S = EG.sign(c), pr = parts[i];
      F.say('<span class="eg-h egg-big">' + S.u + '</span> <b>' + c + '</b> · ' + esc(S.n) + (S.v.length ? ' · reads ' + S.v.map(function (v) { return tlSpan(v); }).join(' or ') : '') + ' · ' + KIND[S.k] + (pr && pr[1] ? '; here: <i>' + ROLE[pr[1]] + (pr[1] === 'num' ? ' for ' + esc(pr[2]) : '') + '</i>' : '') + (S.use ? '<br><small>' + esc(S.use) + '</small>' : ''));
    }
    draw(); onResize(stage, draw);
    // the lines under the picture
    var show = o.lines || ['tl', 'say', 'en'];
    if (!F.quiet) {
      if (T.tl && show.indexOf('tl') >= 0 && o.tl !== false) lines.appendChild(h('p', 'egg-line', '<span class="egg-lab">Transliteration</span> ' + tlSpan(T.tl) + (o.mdc ? ' <small class="egg-mdc">(typed ' + esc(EG.mdc(T.tl)) + ')</small>' : '')));
      if (T.tl && (o.say || (show.indexOf('say') >= 0 && o.say !== false && o.lines))) lines.appendChild(h('p', 'egg-line', '<span class="egg-lab">Say it</span> <span class="egg-say">' + esc(EG.say(T.tl)) + '</span>'));
      if (T.en && show.indexOf('en') >= 0 && o.en !== false) lines.appendChild(h('p', 'egg-line', '<span class="egg-lab">Meaning</span> “' + esc(T.en) + '”'));
      if (T.note && o.note !== false) lines.appendChild(h('p', 'egg-note', esc(T.note)));
      if (o.breakdown) {
        var tb = h('table', 'egg-tab'), rows = '<thead><tr><th>Sign</th><th>Code</th><th>Shows</th><th>Reads</th><th>Here it is</th></tr></thead><tbody>';
        codes.forEach(function (c, i) { var S = EG.sign(c), pr = parts[i]; rows += '<tr><td class="eg-h">' + S.u + '</td><td>' + c + '</td><td>' + esc(S.n) + '</td><td>' + (pr && pr[1] === 'num' ? esc(pr[2]) : pr && pr[2] ? tlSpan(pr[2]) : S.v.length ? S.v.map(function (v) { return tlSpan(v); }).join(', ') : '—') + '</td><td>' + (pr ? ROLE[pr[1]] : '') + '</td></tr>'; });
        tb.innerHTML = rows + '</tbody>'; var wr = h('div', 'egg-tabwrap'); wr.appendChild(tb); lines.appendChild(wr);
      }
    } else if (o.number) lines.appendChild(h('p', 'egg-note', 'The signs are numbered in reading order.'));
    if (F.interactive && !F.quiet) F.ctl.appendChild(h('span', 'egv-hint', 'Tap a sign to see what it is.'));
    return { update: function () { draw(); } };
  });
  /* ---------- eg-cartouche: a royal name in a cartouche; type a name to write it; build one from sound signs ---------- */
  V.register('eg-cartouche', function (el, o) {
    var mode = o.mode || 'show', N = o.name && EG.NAMES[o.name] ? EG.NAMES[o.name] : null;
    var F = frame(el, o, 'cartouche', mode === 'build' ? 'Build a cartouche from sound signs' : mode === 'name' ? 'Write a name in a cartouche' : 'A name in a cartouche');
    var vertical = !!o.vertical, stage = h('div', 'egc-stage'), info = h('div', 'egc-info');
    F.body.appendChild(stage); F.body.appendChild(info);
    var cur = []; // the signs now in the cartouche (codes)
    var target = null; // build: the signs that are right
    function drawCart(signs) {
      stage.innerHTML = '';
      var sp = signs.length ? signs.join(vertical ? '-' : '-') : '';
      var L = sp ? EG.layout(sp, { dir: vertical ? 'col' : (o.dir || 'ltr'), gap: 0.08 }) : { w: 1.2, h: 0.84, signs: [] };
      if (N && mode === 'show') { L = EG.layout(N.sp, { dir: vertical ? 'col' : (o.dir || 'ltr'), gap: 0.08 }); }
      var avail = M.max(200, (stage.clientWidth || el.clientWidth || 560) - 8), U = +o.size || 58;
      var padX = vertical ? 0.22 : 0.42, padY = vertical ? 0.42 : 0.2;
      if (!vertical && (L.w + 2 * padX + 0.3) * U > avail) U = M.max(24, avail / (L.w + 2 * padX + 0.3));
      var w = (L.w + 2 * padX) * U, hh = (L.h + 2 * padY) * U, m = 0.16 * U;
      var svg = svgRoot(w + 2 * m + (vertical ? 0 : 0.12 * U), hh + 2 * m + (vertical ? 0.12 * U : 0), 'Cartouche' + (o.quiet || mode === 'build' ? '' : ': ' + (N ? N.en : (o.text || ''))), 'egc-svg');
      svg.style.width = (w + 2 * m + (vertical ? 0 : 0.12 * U)) + 'px'; svg.style.maxWidth = '100%';
      stage.appendChild(svg);
      var g = sv('g', {}, svg);
      cartouche(g, m, m, w, hh, vertical, vertical ? 'bottom' : (o.dir === 'rtl' ? 'left' : 'right'));
      drawSigns(g, L, U, m + padX * U, m + padY * U);
      if (!L.signs.length) txt(svg, m + w / 2, m + hh / 2 + 6, mode === 'build' ? 'tap signs below' : '', { class: 'egc-empty', 'text-anchor': 'middle' });
    }
    function infoFor(name, map) {
      if (F.quiet) { info.innerHTML = ''; return; }
      if (N && mode === 'show') {
        info.innerHTML = (o.tl !== false ? '<p class="egg-line"><span class="egg-lab">Transliteration</span> ' + tlSpan(N.tl) + '</p>' : '') + (o.en !== false ? '<p class="egg-line"><span class="egg-lab">Name</span> ' + esc(N.en) + '</p>' : '') + (N.note && o.note !== false ? '<p class="egg-note">' + esc(N.note) + '</p>' : '');
        if (o.breakdown) info.innerHTML += '<p class="egc-chips">' + N.signs.map(function (c) { var S = EG.sign(c); return '<span class="egc-chip"><span class="eg-h">' + S.u + '</span> ' + (S.v[0] ? tlSpan(S.v[0]) : c) + '</span>'; }).join('') + '</p>';
        return;
      }
      if (map) info.innerHTML = '<p class="egc-chips">' + map.map(function (m) { return '<span class="egc-chip"><b>' + esc(m.letters.toUpperCase()) + '</b> ' + m.signs.map(function (c) { return '<span class="eg-h">' + EG.sign(c).u + '</span>'; }).join('') + '</span>'; }).join('') + '</p>' +
        '<p class="egg-note">Each sign stands for a sound. Egyptian scribes wrote foreign names this way, with sound signs, in the time of the Ptolemies. They didn\'t write most vowels, so a name in real Egyptian would look shorter.</p>';
    }
    if (mode === 'show') {
      var signs = N ? N.signs : o.signs || (o.text ? [].concat.apply([], EG.nameSigns(o.text).map(function (m) { return m.signs; })) : EG.codes(o.sp || ''));
      cur = signs; drawCart(cur); infoFor(); if (!N && o.text && !F.quiet) infoFor(o.text, EG.nameSigns(o.text));
      onResize(stage, function () { drawCart(cur); });
    } else if (mode === 'name') {
      var row = h('div', 'egc-row'), lab = h('label', 'egc-lab', 'Type a name'), inp = h('input', 'egc-in'); var id = uid('nm');
      lab.setAttribute('for', id); inp.id = id; inp.type = 'text'; inp.maxLength = 18; inp.value = o.text || 'Teddy'; inp.autocomplete = 'off';
      row.appendChild(lab); row.appendChild(inp); F.body.insertBefore(row, stage);
      var upd = function () { var map = EG.nameSigns(inp.value); cur = [].concat.apply([], map.map(function (m) { return m.signs; })).slice(0, 14); drawCart(cur); infoFor(inp.value, map); };
      inp.addEventListener('input', upd); upd(); onResize(stage, function () { drawCart(cur); });
    } else { // build
      var want = o.target && EG.NAMES[o.target] ? EG.NAMES[o.target].signs : o.target ? [].concat.apply([], EG.nameSigns(o.target).map(function (m) { return m.signs; })) : null;
      target = want;
      var pal = h('div', 'egc-pal'); pal.setAttribute('role', 'group'); pal.setAttribute('aria-label', 'Sound signs');
      var palette = o.palette || ['G1', 'D58', 'V31', 'D46', 'M17', 'I9', 'W11', 'O4', 'I10', 'E23', 'G17', 'N35', 'V4', 'Q3', 'N29', 'D21', 'S29', 'X1', 'G43', 'M17A', 'O34', 'V28', 'Aa1', 'N37', 'V13', 'D36'];
      palette.forEach(function (c) {
        var S = EG.sign(c); if (!S) return;
        var b = btn(pal, '<span class="eg-h">' + S.u + '</span><small>' + (S.v[0] ? esc(S.v[0]) : c) + '</small>', function () { if (cur.length < 14) { cur.push(c); drawCart(cur); F.say(''); } }, 'egc-key');
        b.setAttribute('aria-label', 'Add ' + S.n + (S.v[0] ? ', ' + S.v[0] : ''));
      });
      F.body.appendChild(pal);
      if (o.prompt || o.target) F.body.insertBefore(h('p', 'egc-prompt', o.prompt || ('Write <b>' + esc(EG.NAMES[o.target] ? EG.NAMES[o.target].en : o.target) + '</b> with sound signs.')), stage);
      btn(F.ctl, '⌫ Remove last', function () { cur.pop(); drawCart(cur); F.say(''); });
      btn(F.ctl, 'Clear', function () { cur = []; drawCart(cur); F.say(''); });
      if (target && !F.quiet) btn(F.ctl, 'Check', function () {
        var ok = cur.length === target.length && cur.every(function (c, i) { return c === target[i] || (EG.sign(c).v[0] && EG.sign(c).v[0] === (EG.sign(target[i]).v[0])); });
        F.say(ok ? okMark(true) + ' Yes! That spells it.' : okMark(false) + ' Not yet. ' + (cur.length !== target.length ? 'It needs ' + target.length + ' signs.' : 'Check each sound in order.'));
      }, 'pri');
      drawCart(cur); onResize(stage, function () { drawCart(cur); });
    }
    return { signs: function () { return cur.slice(); } };
  });
  /* ---------- eg-signsort: sort signs into groups (one-sound, two-sound, three-sound, determinative, or your own) ---------- */
  var SORT_BINS = { uni: 'One sound', bi: 'Two sounds', tri: 'Three sounds', det: 'Determinative', logo: 'Word sign', num: 'Numeral' };
  V.register('eg-signsort', function (el, o) {
    var F = frame(el, o, 'signsort', 'Sort the signs into groups');
    var binKeys = o.bins || ['uni', 'bi', 'tri', 'det'];
    var bins = binKeys.map(function (b) { return typeof b === 'string' ? { key: b, name: SORT_BINS[b] || b } : b; });
    var cards = (o.cards || (o.signs || ['G1', 'N35', 'D21', 'G39', 'O1', 'S34', 'F35', 'A1', 'D54', 'X1', 'Y5', 'R4'])).map(function (c) {
      if (typeof c === 'string') { var S = EG.sign(c); var k = S.k; if (k === 'logo' && binKeys.indexOf('logo') < 0) { var nl = S.v[0] ? EG.letters(S.v[0]).length : 0; k = nl === 1 ? 'uni' : nl === 2 ? 'bi' : nl >= 3 ? 'tri' : 'det'; } if (k === 'num' && binKeys.indexOf('num') < 0) k = 'det'; return { c: c, bin: k }; }
      return c;
    });
    if (o.shuffle !== false) cards = shuffle(cards, JSON.stringify(cards));
    var place = cards.map(function () { return -1; }), selCard = -1, marks = null;
    var tray = h('div', 'egs-tray'), area = h('div', 'egs-bins');
    F.body.appendChild(h('p', 'egv-hint', F.interactive ? 'Tap a sign, then tap its group. Keyboard: focus a sign and press the group\'s number (0 puts it back).' : ''));
    F.body.appendChild(tray); F.body.appendChild(area);
    function cardBtn(i) {
      var c = cards[i], S = EG.sign(c.c), b = h('button', 'egs-card' + (selCard === i ? ' on' : '') + (marks ? (marks[i] ? ' ok' : ' no') : ''), '<span class="eg-h">' + S.u + '</span>' + (o.names ? '<small>' + esc(S.n) + '</small>' : '') + (o.values && S.v[0] ? '<small>' + tlSpan(S.v[0]) + '</small>' : ''));
      b.type = 'button'; b.setAttribute('aria-pressed', String(selCard === i)); b.setAttribute('aria-label', 'Sign ' + c.c + ': ' + S.n + (place[i] >= 0 ? ', in ' + bins[place[i]].name : ''));
      if (!F.interactive) b.disabled = true;
      b.addEventListener('click', function () { selCard = selCard === i ? -1 : i; paint(i); });
      b.addEventListener('keydown', function (e) { var k = +e.key; if (e.key >= '0' && e.key <= '9' && k <= bins.length) { e.preventDefault(); place[i] = k - 1; selCard = -1; marks = null; paint(i); } });
      return b;
    }
    function paint(focusI) {
      tray.innerHTML = ''; area.innerHTML = '';
      cards.forEach(function (c, i) { if (place[i] < 0) tray.appendChild(cardBtn(i)); });
      if (!tray.children.length) tray.appendChild(h('span', 'egv-hint', 'All sorted.'));
      bins.forEach(function (b, bi) {
        var box = h('div', 'egs-bin'), head = h('button', 'egs-binhead', '<b>' + (bi + 1) + '</b> ' + esc(b.name)); head.type = 'button';
        if (!F.interactive) head.disabled = true;
        head.addEventListener('click', function () { if (selCard >= 0) { place[selCard] = bi; var f = selCard; selCard = -1; marks = null; paint(f); } });
        box.appendChild(head); var list = h('div', 'egs-list'); box.appendChild(list);
        cards.forEach(function (c, i) { if (place[i] === bi) list.appendChild(cardBtn(i)); });
        area.appendChild(box);
      });
      if (focusI !== undefined) { var all = el.querySelectorAll('.egs-card'); for (var j = 0; j < all.length; j++) if (all[j].getAttribute('aria-label').indexOf('Sign ' + cards[focusI].c + ':') === 0) { all[j].focus(); break; } }
    }
    paint();
    if (!F.quiet && F.interactive) {
      btn(F.ctl, 'Check', function () {
        marks = cards.map(function (c, i) { return place[i] >= 0 && bins[place[i]].key === c.bin; });
        var n = marks.filter(Boolean).length, left = place.filter(function (p) { return p < 0; }).length;
        paint(); F.say((n === cards.length ? okMark(true) + ' All ' + n + ' are right.' : n + ' of ' + cards.length + ' are right.') + (left ? ' ' + left + ' still to sort.' : ''));
      }, 'pri');
      if (o.reveal) btn(F.ctl, 'Show me', function () { place = cards.map(function (c) { var k = -1; bins.forEach(function (b, bi) { if (b.key === c.bin) k = bi; }); return k; }); marks = null; paint(); F.say(''); });
    }
    return { placed: function () { return place.slice(); } };
  });
  /* ---------- eg-map: Egypt and Nubia, with the Nile, the Delta, cataracts, sites by period and modern cities ---------- */
  var KIND_ICON = { pyramid: '▲', temple: '■', tombs: '◆', city: '●', fort: '■', quarry: '✕', find: '★', battle: '✕', oasis: '●' };
  var PERIOD_SHORT = { pre: 'Predynastic', ed: 'Early Dynastic', ok: 'Old Kingdom', fip: 'First Int.', mk: 'Middle Kingdom', sip: 'Second Int.', nk: 'New Kingdom', tip: 'Third Int.', late: 'Late', ptol: 'Ptolemaic', rom: 'Roman' };
  var BIG = { giza: 1, saqqara: 1, memphis: 1, karnak: 1, kings: 1, abydos: 1, amarna: 1, alexandria: 1, 'abu-simbel': 1, philae: 1, meroe: 1, napata: 1, kerma: 1, kadesh: 1, rosetta: 1, edfu: 1, dendera: 1, tanis: 1, avaris: 1, heliopolis: 1, siwa: 1, hierakonpolis: 1 };
  function ringPath(pts, close) {
    return pts.map(function (p, i) { var q = EG.project(p[0], p[1]); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + (close ? 'Z' : '');
  }
  V.register('eg-map', function (el, o) {
    var mode = o.mode || 'show', F = frame(el, o, 'map', o.label || 'Map of ancient Egypt and Nubia');
    if (o.full) el.classList.add('egm-full');
    var G = EG.GEO, P = EG.project;
    var onP = {}; EG.PERIODS.forEach(function (p) { onP[p.key] = !o.layers || o.layers.indexOf(p.key) >= 0; });
    var showCities = o.cities !== false, showLabels = o.labels !== false;
    var only = o.sites ? (o.sites === 'none' ? [] : [].concat(o.sites)) : null;
    var target = o.target ? EG.site(o.target) : null;
    var choices = mode === 'pick' ? (o.choices || []).map(function (k) { return EG.site(k); }).filter(Boolean) : [];
    // ---- toolbar: period layers and zoom
    var bar = h('div', 'egm-bar');
    if (o.layerChips !== false && mode === 'show' && F.interactive) {
      var chips = h('div', 'egm-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Show sites of these periods');
      var allB = btn(chips, 'All periods', function () { var any = EG.PERIODS.some(function (p) { return !onP[p.key]; }); EG.PERIODS.forEach(function (p) { onP[p.key] = any; }); sync(); render(); }, 'egm-chip egm-all');
      EG.PERIODS.forEach(function (p) {
        var b = btn(chips, esc(PERIOD_SHORT[p.key]), function () { var solo = EG.PERIODS.every(function (q) { return onP[q.key]; }); if (solo) EG.PERIODS.forEach(function (q) { onP[q.key] = q.key === p.key; }); else onP[p.key] = !onP[p.key]; sync(); render(); }, 'egm-chip');
        b.dataset.p = p.key; b.title = p.name + ', ' + EG.span(p.from, p.to, true);
      });
      var cb = btn(chips, 'Modern cities', function () { showCities = !showCities; sync(); render(); }, 'egm-chip egm-modern');
      bar.appendChild(chips);
      var sync = function () { [].forEach.call(chips.querySelectorAll('.egm-chip'), function (b) { var on = b.dataset.p ? onP[b.dataset.p] : b === cb ? showCities : EG.PERIODS.every(function (p) { return onP[p.key]; }); b.setAttribute('aria-pressed', String(!!on)); b.classList.toggle('on', !!on); }); };
      sync();
    }
    var zoomBox = h('div', 'egm-zoom');
    F.body.appendChild(bar);
    var wrap = h('div', 'egm-wrap'); F.body.appendChild(wrap);
    var info = h('div', 'egm-info'); info.setAttribute('aria-live', 'polite');
    if (!F.quiet && mode === 'show') F.body.appendChild(info);
    // ---- the svg
    var full = P(G.box.s, G.box.e), FW = full[0], FH = full[1];
    var svg = sv('svg', { class: 'egm-svg', role: 'img', tabindex: F.interactive ? 0 : null, 'aria-label': o.quiet ? 'Map of Egypt and Nubia' : 'Map of Egypt and Nubia with the Nile, ancient sites and modern cities' + (F.interactive ? '. Use the arrow keys to move, plus and minus to zoom.' : ''), focusable: 'false' }, wrap);
    var gBase = sv('g', {}, svg), gTop = sv('g', {}, svg);
    sv('rect', { x: -400, y: -400, width: FW + 800, height: FH + 800, class: 'egm-land' }, gBase);
    sv('path', { d: ringPath(G.med, true), class: 'egm-sea' }, gBase);
    sv('path', { d: ringPath(G.red, true), class: 'egm-sea' }, gBase);
    sv('path', { d: ringPath(G.cyprus.concat([[35.6, 34.6], [35.6, 32.2]]), true), class: 'egm-land2' }, gBase);
    // the green valley and the Delta
    var delta = G.rosetta.slice().concat(G.med.slice(16, 22).filter(function (p) { return p[1] > 30.37 && p[1] < 31.83; }), [[31.52, 31.84]], G.damietta.slice().reverse());
    sv('path', { d: ringPath(delta, true), class: 'egm-green' }, gBase);
    var coarse = [];
    coarse.push(sv('path', { d: ringPath(G.nile, false), class: 'egm-valley', 'stroke-width': 16 }, gBase));
    sv('path', { d: ringPath(G.nileNubia, false), class: 'egm-valley', 'stroke-width': 6 }, gBase);
    sv('ellipse', { cx: P(29.33, 30.78)[0], cy: P(29.33, 30.78)[1], rx: 26, ry: 20, class: 'egm-green' }, gBase);
    // Thebes in detail (shown when zoomed in there): the cultivated strip on both banks, the river, the Theban hills
    var detail = sv('g', { class: 'egm-detail' }, gBase), T0 = G.thebes;
    sv('path', { d: ringPath(T0.west.concat(T0.east.slice().reverse()), true), class: 'egm-green' }, detail);
    sv('path', { d: ringPath(T0.hills.concat(T0.hills.map(function (p) { return [p[0] - 0.002, p[1] - 0.022]; }).reverse()), true), class: 'egm-hills' }, detail);
    sv('path', { d: ringPath(T0.hills, false), class: 'egm-cliff', 'vector-effect': 'non-scaling-stroke' }, detail);
    sv('path', { d: ringPath(T0.river.map(function (p) { return [p[0], p[1] - T0.halfw]; }).concat(T0.river.map(function (p) { return [p[0], p[1] + T0.halfw]; }).reverse()), true), class: 'egm-lake egm-riverband' }, detail);
    G.lakes.forEach(function (l) { sv('path', { d: ringPath(l, true), class: 'egm-lake' }, gBase); });
    sv('path', { d: ringPath(G.nasser, true), class: 'egm-lake' }, gBase);
    ['nile', 'nileNubia', 'whiteNile', 'blueNile', 'atbara', 'rosetta', 'damietta', 'jordan'].forEach(function (k) { var e = sv('path', { d: ringPath(G[k], false), class: 'egm-river' + (k === 'nile' || k === 'nileNubia' ? ' main' : ''), 'vector-effect': 'non-scaling-stroke' }, gBase); if (k === 'nile') coarse.push(e); });
    var canal = sv('path', { d: ringPath(G.canal, false), class: 'egm-canal', 'vector-effect': 'non-scaling-stroke' }, gBase);
    var dyn = sv('g', {}, gTop); // redrawn on zoom: markers and labels
    // ---- view
    var view = EG.VIEWS[o.view] || (Array.isArray(o.view) ? o.view : EG.VIEWS[o.full ? 'nile' : 'egypt']);
    function boxOf(v) { var a = P(v[1], v[2]), b = P(v[0], v[3]); return { x: a[0], y: a[1], w: b[0] - a[0], h: b[1] - a[1] }; }
    var home = boxOf(view), vb = Object.assign({}, home), pxW = 600, pxH = 500;
    function size() {
      pxW = M.max(260, wrap.clientWidth || el.clientWidth || 600);
      var asp = home.h / home.w; pxH = o.height || M.round(M.min(o.full ? 900 : 620, M.max(o.full ? 420 : 300, pxW * asp)));
      if (o.full && W.innerHeight) pxH = M.round(M.max(380, M.min(pxH, W.innerHeight - 170)));
      svg.style.height = pxH + 'px';
      fit(home);
    }
    function fit(b) { // show box b, keeping the svg's aspect
      var asp = pxH / pxW, w = b.w, hh = b.h;
      if (hh / w > asp) w = hh / asp; else hh = w * asp;
      vb = { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - hh / 2, w: w, h: hh }; clamp(); apply();
    }
    function clamp() {
      var maxW = 1.15 * M.max(FW, FH * pxW / pxH), minW = 9; if (vb.w > maxW) { var s = maxW / vb.w; vb.w *= s; vb.h *= s; } if (vb.w < minW) { var s2 = minW / vb.w; vb.w *= s2; vb.h *= s2; }
      vb.x = M.min(M.max(vb.x, -vb.w * 0.5), FW - vb.w * 0.5); vb.y = M.min(M.max(vb.y, -vb.h * 0.5), FH - vb.h * 0.5);
    }
    function apply() { svg.setAttribute('viewBox', vb.x.toFixed(2) + ' ' + vb.y.toFixed(2) + ' ' + vb.w.toFixed(2) + ' ' + vb.h.toFixed(2)); render(); }
    function zoom(f, cx, cy) { cx = cx === undefined ? vb.x + vb.w / 2 : cx; cy = cy === undefined ? vb.y + vb.h / 2 : cy; var nw = vb.w * f; if (nw < 9 || nw > 1.15 * M.max(FW, FH * pxW / pxH)) return; vb.x = cx - (cx - vb.x) * f; vb.y = cy - (cy - vb.y) * f; vb.w = nw; vb.h *= f; clamp(); apply(); }
    // ---- markers and labels
    var picked = null, marker = null, chosen = -1;
    function visibleSites() {
      return EG.SITES.filter(function (s) {
        if (only) return only.indexOf(s.key) >= 0;
        if (mode !== 'show') return false;
        return s.periods.some(function (p) { return onP[p]; });
      });
    }
    var MC = null; // a canvas for measuring label widths
    function tw(str, size, font) { try { if (!MC) MC = D.createElement('canvas').getContext('2d'); MC.font = font.replace('#', '100px'); return MC.measureText(str).width * size / 100; } catch (e) { return str.length * size * 0.6; } }
    var FONTS = { 'egm-lab': ['600 # system-ui,-apple-system,"Segoe UI",sans-serif', 0], 'egm-lab big': ['700 # system-ui,-apple-system,"Segoe UI",sans-serif', 0],
      'egm-citylab': ['400 # system-ui,-apple-system,"Segoe UI",sans-serif', 0], 'egm-catlab': ['italic 400 # system-ui,sans-serif', 0], 'egm-oaslab': ['italic 400 # system-ui,sans-serif', 0],
      'egm-sealab': ['italic 400 # Georgia,serif', 0.06], 'egm-reglab': ['700 # Georgia,serif', 0.18], 'egm-detlab': ['italic 600 # Georgia,serif', 0.08] };
    function inDetail() { var D0 = G.thebes, b = D0.box, c = EG.unproject(vb.x + vb.w / 2, vb.y + vb.h / 2); return vb.w < 90 && c[0] > b[0] && c[0] < b[1] && c[1] > b[2] && c[1] < b[3]; }
    function render() {
      var k = vb.w / pxW; // map units per pixel
      dyn.innerHTML = '';
      var det = inDetail();
      coarse.forEach(function (e) { e.style.display = det ? 'none' : ''; }); detail.style.display = det ? '' : 'none';
      var gLow = sv('g', {}, dyn), gSites = sv('g', {}, dyn), gLab = sv('g', {}, dyn), gTop = sv('g', {}, dyn);
      var placed = [], pad = 2 * k;
      // a free box inside the frame (with a small margin)?
      function free(x, y, w, hh) {
        var m = 3 * k; if (x < vb.x + m || x + w > vb.x + vb.w - m || y < vb.y + m || y + hh > vb.y + vb.h - m) return false;
        for (var i = 0; i < placed.length; i++) { var b = placed[i]; if (x < b[0] + b[2] + pad && x + w + pad > b[0] && y < b[1] + b[3] + pad && y + hh + pad > b[1]) return false; }
        return true;
      }
      // a label beside a point: tries eight positions (right, left, above, below and the corners); skipped when none is free
      function label(x, y, str, cls, px, r, opt) {
        opt = opt || {}; var f = FONTS[cls] || FONTS['egm-lab'], size = px * k, w = tw(str, size, f[0]) + str.length * size * f[1], hh = size * 1.2, g = r * 1.35 + 1.5 * k;
        var cand = opt.center ? [[x - w / 2, y - hh / 2]] : [[x + g, y - hh / 2], [x - g - w, y - hh / 2], [x + g * 0.7, y - g * 0.7 - hh], [x + g * 0.7, y + g * 0.7], [x - g * 0.7 - w, y - g * 0.7 - hh], [x - g * 0.7 - w, y + g * 0.7], [x - w / 2, y - g - hh], [x - w / 2, y + g]];
        for (var i = 0; i < cand.length; i++) {
          if (free(cand[i][0], cand[i][1], w, hh) || (opt.force && i === cand.length - 1)) {
            placed.push([cand[i][0], cand[i][1], w, hh]);
            var at = { class: cls, 'font-size': size.toFixed(2), 'stroke-width': (3 * k).toFixed(2) };
            return txt(gLab, cand[i][0] + (f[1] ? 0 : 0), cand[i][1] + hh * 0.8, str, at);
          }
        }
        return null;
      }
      var r = 4.6 * k, list = visibleSites().filter(function (s) { return inView(P(s.lat, s.lon)) && !(F.quiet && target && s.key === target.key); });
      list.sort(function (a, b) { return (BIG[b.key] || 0) - (BIG[a.key] || 0); });
      var siteNames = list.map(function (x) { return x.name; });
      var cities = showCities && o.cities !== false ? EG.CITIES.filter(function (c) { return inView(P(c.lat, c.lon)) && !list.some(function (s) { return s.name === c.name; }); }) : [];
      var oases = G.oases.filter(function (s) { return inView(P(s[1], s[2])) && siteNames.indexOf(s[0] + ' Oasis') < 0; });
      var cats = o.cataracts !== false ? EG.CATARACTS.filter(function (c) { return inView(P(c.lat, c.lon)); }) : [];
      canal.style.display = showCities ? '' : 'none';
      // 1. the zoom buttons, the scale bar and every marker are obstacles for labels
      if (F.interactive) placed.push([vb.x + vb.w - 52 * k, vb.y, 52 * k, 132 * k]);
      placed.push([vb.x, vb.y + vb.h - 34 * k, 120 * k, 34 * k]);
      list.forEach(function (s) { var q = P(s.lat, s.lon), rr = (BIG[s.key] ? 1.15 : 1) * r; placed.push([q[0] - rr, q[1] - rr, 2 * rr, 2 * rr]); });
      cities.forEach(function (c) { var q = P(c.lat, c.lon); placed.push([q[0] - 2 * k, q[1] - 2 * k, 4 * k, 4 * k]); });
      oases.forEach(function (s) { var q = P(s[1], s[2]); placed.push([q[0] - 6 * k, q[1] - 6 * k, 12 * k, 12 * k]); });
      cats.forEach(function (c) { var q = P(c.lat, c.lon); placed.push([q[0] - 5 * k, q[1] - 3 * k, 10 * k, 6 * k]); });
      choices.forEach(function (s) { var q = P(s.lat, s.lon); placed.push([q[0] - 9 * k, q[1] - 9 * k, 18 * k, 18 * k]); });
      // 2. markers, lowest first: oases, cataracts, modern cities (small, under everything), then sites
      oases.forEach(function (s) { var q = P(s[1], s[2]); sv('circle', { cx: q[0], cy: q[1], r: 6 * k, class: 'egm-oasis' }, gLow); });
      cats.forEach(function (c) { var q = P(c.lat, c.lon); sv('path', { d: 'M' + (q[0] - 5 * k) + ' ' + (q[1] - 2 * k) + ' l' + (2.5 * k) + ' ' + (3 * k) + ' l' + (2.5 * k) + ' ' + (-3 * k) + ' l' + (2.5 * k) + ' ' + (3 * k) + ' l' + (2.5 * k) + ' ' + (-3 * k), class: 'egm-cat', 'stroke-width': (2 * k).toFixed(2) }, gLow); });
      cities.forEach(function (c) { var q = P(c.lat, c.lon); sv('rect', { x: q[0] - 2 * k, y: q[1] - 2 * k, width: 4 * k, height: 4 * k, class: 'egm-city', 'stroke-width': (1 * k).toFixed(2) }, gLow); });
      list.forEach(function (s) {
        var q = P(s.lat, s.lon), gi = sv('g', { class: 'egm-site k-' + s.kind + (picked === s.key ? ' on' : '') }, gSites);
        sv('circle', { cx: q[0], cy: q[1], r: (BIG[s.key] ? 1.15 : 1) * r }, gi);
        if (F.interactive && mode === 'show') {
          var hit = sv('circle', { cx: q[0], cy: q[1], r: M.max(r * 2.2, 10 * k), class: 'egm-hit', tabindex: 0, role: 'button', 'aria-label': s.name + ', ' + s.periods.map(function (p) { return EG.period(p).name; }).join(', ') }, gi);
          hit.addEventListener('click', function (e) { e.stopPropagation(); select(s.key); });
          hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(s.key); } });
        }
      });
      // 3. labels in order of importance: the revealed target, the picked site, big sites, other sites, cataracts, cities,
      //    detail labels, seas, regions, oases. Whatever still collides is left out until the map is zoomed in.
      if (marker && marker.reveal && target) { var tq = P(target.lat, target.lon); sv('circle', { cx: tq[0], cy: tq[1], r: 6 * k, class: 'egm-true' }, gTop); label(tq[0], tq[1], target.name, 'egm-lab big', 12.5, 6 * k, { force: true }); }
      if (showLabels) {
        var byPri = list.slice().sort(function (a, b) { return (b.key === picked) - (a.key === picked) || (BIG[b.key] || 0) - (BIG[a.key] || 0); });
        byPri.forEach(function (s) { var q = P(s.lat, s.lon); label(q[0], q[1], s.name, 'egm-lab' + (BIG[s.key] || s.key === picked ? ' big' : ''), BIG[s.key] ? 12.5 : 11.5, (BIG[s.key] ? 1.15 : 1) * r, { force: s.key === picked }); });
        cats.forEach(function (c) { var q = P(c.lat, c.lon); label(q[0], q[1], c.n + (c.n === 1 ? 'st' : c.n === 2 ? 'nd' : c.n === 3 ? 'rd' : 'th') + ' Cataract', 'egm-catlab', 10.5, 5 * k); });
        cities.forEach(function (c) { var q = P(c.lat, c.lon); label(q[0], q[1], c.name, 'egm-citylab', 10.5, 2.5 * k); });
        if (det) G.thebes.labels.forEach(function (l) { var q = P(l[1], l[2]); label(q[0], q[1], l[0], 'egm-detlab ' + (l[3] || ''), 11.5, 0, { center: true }); });
        G.seas.forEach(function (s, i) { if (i >= 2 && vb.w > 700) return; var q = P(s[1], s[2]); if (inView(q)) label(q[0], q[1], s[0], 'egm-sealab', i >= 2 ? 11 : 13, 0, { center: true }); });
        if (o.regions !== false && vb.w > 260) G.regions.forEach(function (s) { var q = P(s[1], s[2]); if (inView(q)) label(q[0], q[1], s[0], 'egm-reglab', 12, 0, { center: true }); });
        if (vb.w > 200) oases.forEach(function (s) { var q = P(s[1], s[2]); label(q[0], q[1], s[0] + ' Oasis', 'egm-oaslab', 10.5, 6 * k); });
      }
      // pick mode: lettered dots
      choices.forEach(function (s, i) {
        var q = P(s.lat, s.lon), gi = sv('g', { class: 'egm-choice' + (chosen === i ? ' on' : '') }, gTop);
        sv('circle', { cx: q[0], cy: q[1], r: 9 * k }, gi); txt(gi, q[0], q[1] + 4 * k, letter(i), { 'font-size': (11 * k).toFixed(2), 'text-anchor': 'middle' });
        if (F.interactive) { gi.setAttribute('tabindex', 0); gi.setAttribute('role', 'button'); gi.setAttribute('aria-label', 'Place ' + letter(i)); var f = function () { chosen = i; render(); F.say(''); if (o.onPick) o.onPick(i); }; gi.addEventListener('click', function (e) { e.stopPropagation(); f(); }); gi.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }); }
      });
      if (marker) { var mq = P(marker[0], marker[1]); sv('path', { d: 'M' + mq[0] + ' ' + mq[1] + ' l' + (-7 * k) + ' ' + (-16 * k) + ' a' + (7 * k) + ' ' + (7 * k) + ' 0 1 1 ' + (14 * k) + ' 0 Z', class: 'egm-pin' }, gTop); }
      // scale bar
      var sb = 100, sx = vb.x + 14 * k, sy = vb.y + vb.h - 14 * k; if (vb.w < 300) sb = vb.w < 25 ? 2 : vb.w < 60 ? 5 : vb.w < 150 ? 20 : 50;
      sv('line', { x1: sx, y1: sy, x2: sx + sb, y2: sy, class: 'egm-scale', 'stroke-width': (3 * k).toFixed(2) }, gTop);
      txt(gTop, sx, sy - 6 * k, sb + ' km', { class: 'egm-scalelab', 'font-size': (10.5 * k).toFixed(2) });
    }
    function inView(q) { var m = vb.w * 0.04; return q[0] > vb.x - m && q[0] < vb.x + vb.w + m && q[1] > vb.y - m && q[1] < vb.y + vb.h + m; }
    function select(key, force) {
      picked = picked === key && !force ? null : key; render();
      var s = EG.site(key);
      if (!picked) { info.innerHTML = '<p class="egv-hint">Tap a site for a short note.</p>'; return; }
      info.innerHTML = '<p class="egm-name"><b>' + esc(s.name) + '</b>' + (s.anc ? ' <span class="egm-anc">(' + esc(s.anc) + ')</span>' : '') + '</p><p class="egm-per">' + s.periods.map(function (p) { var P0 = EG.period(p); return '<span class="egm-pchip" title="' + esc(EG.span(P0.from, P0.to, true)) + '">' + esc(P0.name) + '</span>'; }).join(' ') + '</p><p>' + esc(s.note) + '</p>';
      if (o.onSelect) o.onSelect(s);
    }
    if (mode === 'show') info.innerHTML = '<p class="egv-hint">Tap a site for a short note. Drag to move, pinch or use + and − to zoom.</p>';
    // ---- pan, zoom, place
    if (F.interactive) {
      var pts = {}, dragStart = null, moved = false;
      svg.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; dragStart = { vb: Object.assign({}, vb), x: e.clientX, y: e.clientY, d: dist() }; moved = false; });
      svg.addEventListener('pointermove', function (e) {
        if (!pts[e.pointerId] || !dragStart) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        var ids = Object.keys(pts), k = dragStart.vb.w / pxW;
        if (ids.length === 2 && dragStart.d) { var d = dist(), f = dragStart.d / d, c = mid(), r0 = svg.getBoundingClientRect(); var cx = dragStart.vb.x + (c.x - r0.left) * k, cy = dragStart.vb.y + (c.y - r0.top) * k; vb.w = M.min(1.15 * M.max(FW, FH * pxW / pxH), M.max(9, dragStart.vb.w * f)); vb.h = vb.w * pxH / pxW; vb.x = cx - (c.x - r0.left) * vb.w / pxW; vb.y = cy - (c.y - r0.top) * vb.w / pxW; moved = true; clamp(); apply(); return; }
        var dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y; if (!moved && M.abs(dx) + M.abs(dy) > 4) { moved = true; try { svg.setPointerCapture(e.pointerId); } catch (er) { } }
        if (moved) { vb.x = dragStart.vb.x - dx * k; vb.y = dragStart.vb.y - dy * k; clamp(); apply(); }
      });
      var up = function (e) { delete pts[e.pointerId]; if (!Object.keys(pts).length) { if (!moved && mode === 'place') { var q = svgPt(svg, e), ll = EG.unproject(q.x, q.y); marker = ll; render(); F.say(''); if (o.onPlace) o.onPlace({ lat: ll[0], lon: ll[1] }); } dragStart = null; } else dragStart = { vb: Object.assign({}, vb), x: e.clientX, y: e.clientY, d: dist() }; };
      svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; dragStart = null; });
      svg.addEventListener('wheel', function (e) { if (!o.full && !e.ctrlKey && !svg.matches(':focus')) return; e.preventDefault(); var q = svgPt(svg, e); zoom(e.deltaY > 0 ? 1.18 : 1 / 1.18, q.x, q.y); }, { passive: false });
      svg.addEventListener('keydown', function (e) {
        var s = vb.w * 0.12, k2 = e.key;
        if (k2 === 'ArrowLeft') vb.x -= s; else if (k2 === 'ArrowRight') vb.x += s; else if (k2 === 'ArrowUp') vb.y -= s; else if (k2 === 'ArrowDown') vb.y += s;
        else if (k2 === '+' || k2 === '=') { zoom(1 / 1.3); e.preventDefault(); return; } else if (k2 === '-' || k2 === '_') { zoom(1.3); e.preventDefault(); return; } else if (k2 === '0') { fit(home); e.preventDefault(); return; }
        else if (mode === 'place' && (k2 === 'Enter' || k2 === ' ')) { marker = EG.unproject(vb.x + vb.w / 2, vb.y + vb.h / 2); render(); e.preventDefault(); if (o.onPlace) o.onPlace({ lat: marker[0], lon: marker[1] }); return; }
        else return;
        e.preventDefault(); clamp(); apply();
      });
      var zb = function (t, f, lab) { var b = btn(zoomBox, t, f, 'egm-zb'); b.setAttribute('aria-label', lab); };
      zb('+', function () { zoom(1 / 1.4); }, 'Zoom in'); zb('−', function () { zoom(1.4); }, 'Zoom out'); zb('⟲', function () { fit(home); }, 'Back to the whole map');
      wrap.appendChild(zoomBox);
      if (o.full) {
        var jump = h('div', 'egm-jump'); jump.appendChild(h('span', 'egm-jlab', 'Go to'));
        [['Whole map', 'nile'], ['Delta', 'delta'], ['Memphis', 'memphis'], ['Faiyum', 'fayum'], ['Upper Egypt', 'upper'], ['Thebes', 'thebes'], ['Nubia', 'nubia'], ['Levant', 'levant']].forEach(function (v) { btn(jump, v[0], function () { fit(boxOf(EG.VIEWS[v[1]])); }, 'egm-jb'); });
        bar.appendChild(jump);
      }
    }
    function dist() { var ids = Object.keys(pts); if (ids.length < 2) return 0; var a = pts[ids[0]], b = pts[ids[1]]; return M.hypot(a.x - b.x, a.y - b.y); }
    function mid() { var ids = Object.keys(pts), a = pts[ids[0]], b = pts[ids[1]]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
    if (mode === 'place') {
      F.body.insertBefore(h('p', 'egv-hint', 'Tap the map where ' + (target ? '<b>' + esc(target.name) + '</b>' : 'the place') + ' is. (Keyboard: move the map so the place is in the middle, then press Enter.)'), wrap);
      if (!F.quiet && target) btn(F.ctl, 'Check', function () {
        if (!marker) { F.say('Tap the map first.'); return; }
        var d = EG.km({ lat: marker[0], lon: marker[1] }, target), tol = o.tol || 60; marker.reveal = true; render();
        F.say(d <= tol ? okMark(true) + ' Yes, that\'s ' + esc(target.name) + ' (within ' + M.round(d) + ' km).' : okMark(false) + ' ' + esc(target.name) + ' is ' + M.round(d) + ' km from your pin. It\'s marked now.');
      }, 'pri');
    }
    if (mode === 'pick' && !F.quiet && target) btn(F.ctl, 'Check', function () { if (chosen < 0) { F.say('Choose a place first.'); return; } var ok = choices[chosen].key === target.key; F.say(ok ? okMark(true) + ' Yes, ' + letter(chosen) + ' is ' + esc(target.name) + '.' : okMark(false) + ' ' + letter(chosen) + ' is ' + esc(choices[chosen].name) + '.'); }, 'pri');
    size(); onResize(wrap, size);
    if (o.select) select(o.select);
    return { marker: function () { return marker ? { lat: marker[0], lon: marker[1] } : null; }, chosen: function () { return chosen; }, fit: function (k) { fit(boxOf(EG.VIEWS[k] || view)); },
      focus: function (k) { var s = EG.site(k); if (!s) return; var q = P(s.lat, s.lon), r = k === 'kadesh' || s.region === 'levant' ? 160 : 70; fit({ x: q[0] - r, y: q[1] - r, w: 2 * r, h: 2 * r }); if (mode === 'show') { if (!onP[s.periods[0]] && !s.periods.some(function (p) { return onP[p]; })) { s.periods.forEach(function (p) { onP[p] = true; }); if (typeof sync === 'function') sync(); } select(k, true); } } };
  });
  /* ---------- eg-timeline: periods and dynasties on a scale with uncertainty bars; kings' reigns; place a reign; put reigns in order ---------- */
  var PCOL = { pre: '#a08a5b', ed: '#8c6d3f', ok: '#b8860b', fip: '#9a9a8a', mk: '#3f7d5a', sip: '#9a9a8a', nk: '#2d5596', tip: '#9a9a8a', late: '#7d3c78', ptol: '#1d6f7a', rom: '#9b2335' };
  V.register('eg-timeline', function (el, o) {
    var mode = o.mode || 'show', F = frame(el, o, 'timeline', o.label || 'Timeline of ancient Egypt');
    var from = o.from !== undefined ? +o.from : -3200, to = o.to !== undefined ? +o.to : 0;
    var kings = (o.kings || []).map(EG.king).filter(Boolean), events = o.events || [], asks = [].concat(o.ask || []);
    var target = o.target ? EG.king(o.target) : null, guess = null;
    if (mode === 'order') return orderMode();
    var stage = h('div', 'egt-stage'); F.body.appendChild(stage);
    var detail = h('p', 'egt-detail'); if (!F.quiet && mode === 'show') F.body.appendChild(detail);
    var svg, Wd = 600;
    function X(y) { return 20 + (y - from) / (to - from) * (Wd - 40); }
    function Yr(x) { return from + (x - 20) / (Wd - 40) * (to - from); }
    function niceStep(span) { var c = [50, 100, 200, 250, 500, 1000, 2000], room = M.max(2, M.floor((Wd - 40) / 72)); for (var i = 0; i < c.length; i++) if (span / c[i] <= M.min(8, room)) return c[i]; return 2000; }
    function draw() {
      Wd = M.max(300, stage.clientWidth || el.clientWidth || 600);
      var narrow = Wd < 520, rowP = 34, y0 = 28, hP = 30, hD = o.dynasties === false ? 0 : 22;
      var kingRows = kings.length ? kings.length * 18 + 10 : 0, placeRow = mode === 'place' ? 44 : 0;
      // event labels: greedy lanes so no two labels overlap
      var lanesR = [], evPos = events.slice().sort(function (a, b) { return a.y - b.y; }).map(function (ev) {
        // the lowest lane where the label fits beside the others, and where its leader line crosses no label above it
        var x = X(ev.y), w = String(ev.label).length * 6.4, anc = x - w / 2 < 4 ? 'start' : x + w / 2 > Wd - 4 ? 'end' : 'middle', x0 = anc === 'start' ? x : anc === 'end' ? x - w : x - w / 2, lane = 0;
        function fits(L) { var segs = lanesR[L] || []; if (segs.some(function (sg) { return x0 < sg[1] + 8 && x0 + w + 8 > sg[0]; })) return false; for (var u = 0; u < L; u++) if ((lanesR[u] || []).some(function (sg) { return x > sg[0] - 6 && x < sg[1] + 6; })) return false; return true; }
        var nL = lanesR.length; while (lane <= nL && !fits(lane)) lane++; if (lane > nL) { lane = 0; while ((lanesR[lane] || []).some(function (sg) { return x0 < sg[1] + 8 && x0 + w + 8 > sg[0]; })) lane++; } (lanesR[lane] = lanesR[lane] || []).push([x0, x0 + w]);
        return { ev: ev, x: x, anc: anc, lane: lane }; }), evRows = events.length ? 18 + 14 * lanesR.length : 0;
      var H = y0 + hP + 12 + hD + 10 + kingRows + evRows + placeRow + 24;
      stage.innerHTML = '';
      svg = svgRoot(Wd, H, o.quiet ? 'A timeline' : 'Timeline from ' + EG.year(from) + ' to ' + EG.year(to), 'egt-svg'); stage.appendChild(svg);
      // axis
      var step = niceStep(to - from), ay = H - 18;
      sv('line', { x1: 20, y1: ay, x2: Wd - 20, y2: ay, class: 'egt-axis' }, svg);
      var lastR = -1e9; for (var t = M.ceil(from / step) * step; t <= to; t += step) { var x = X(t); sv('line', { x1: x, y1: ay - 4, x2: x, y2: ay + 4, class: 'egt-axis' }, svg); var tl = t === 0 ? 'BC | AD' : t < 0 ? (-t) + ' BC' : 'AD ' + t, tw = tl.length * 6.2, anc = x - tw / 2 < 4 ? 'start' : x + tw / 2 > Wd - 4 ? 'end' : 'middle', x0 = anc === 'start' ? x : anc === 'end' ? x - tw : x - tw / 2; if (x0 < lastR + 8) continue; lastR = x0 + tw; txt(svg, x, ay + 15, tl, { class: 'egt-tick', 'text-anchor': anc }); }
      // periods
      EG.PERIODS.forEach(function (p) {
        var a = M.max(from, p.from), b = M.min(to, p.to); if (b <= a) return;
        var x1 = X(a), x2 = X(b), asked = asks.indexOf(p.key) >= 0, inter = /fip|sip|tip/.test(p.key);
        var g = sv('g', { class: 'egt-per' + (inter ? ' inter' : '') }, svg);
        var r = sv('rect', { x: x1, y: y0, width: M.max(1, x2 - x1), height: hP, rx: 3, fill: PCOL[p.key] }, g);
        if (o.uncertainty !== false && p.pm) { [p.from, p.to].forEach(function (yy, j) { if (yy < from || yy > to) return; var xx = X(yy), d = (X(yy + p.pm) - X(yy)); if (d < 1) return; sv('line', { x1: xx - d, y1: y0 - 6 - j * 0, x2: xx + d, y2: y0 - 6, class: 'egt-unc' }, g); sv('line', { x1: xx - d, y1: y0 - 9, x2: xx - d, y2: y0 - 3, class: 'egt-unc' }, g); sv('line', { x1: xx + d, y1: y0 - 9, x2: xx + d, y2: y0 - 3, class: 'egt-unc' }, g); }); }
        var bw = x2 - x1 - 6, lab = asked && F.quiet ? '?' : (bw > p.name.length * 6.9 ? p.name : bw > PERIOD_SHORT[p.key].length * 6.9 ? PERIOD_SHORT[p.key] : bw > 24 ? ({ pre: 'Pre', ed: 'ED', ok: 'OK', fip: '1IP', mk: 'MK', sip: '2IP', nk: 'NK', tip: '3IP', late: 'LP', ptol: 'Ptol', rom: 'Rom' })[p.key] : '');
        if (lab) txt(g, (x1 + x2) / 2, y0 + hP / 2 + 4.5, lab, { class: 'egt-plab', 'text-anchor': 'middle' });
        if (asked) sv('rect', { x: x1 - 2, y: y0 - 2, width: x2 - x1 + 4, height: hP + 4, rx: 4, class: 'egt-ask' }, g);
        if (F.interactive && !F.quiet) { r.setAttribute('tabindex', 0); r.setAttribute('role', 'button'); r.setAttribute('aria-label', p.name + ', ' + EG.span(p.from, p.to, true)); var f = function () { detail.innerHTML = '<b>' + esc(p.name) + '</b>, ' + esc(EG.span(p.from, p.to, true)) + (p.dyn ? ' · Dynasties ' + esc(p.dyn) : '') + (p.pm ? ' · dates uncertain by about ' + p.pm + ' years' : '') + '<br>' + esc(p.note); }; r.addEventListener('click', f); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }); }
      });
      // dynasties
      var yD = y0 + hP + 10;
      if (hD) EG.DYNASTIES.forEach(function (d, i) {
        var a = M.max(from, d.from), b = M.min(to, d.to); if (b <= a) return;
        var x1 = X(a), x2 = X(b), lane = typeof d.n === 'number' ? d.n % 2 : 1;
        sv('rect', { x: x1, y: yD + lane * 9, width: M.max(1.5, x2 - x1 - 1), height: 7, rx: 2, class: 'egt-dyn', fill: PCOL[d.period] }, svg);
        var lab = String(d.n).replace(/ \(Thebes\)/, 'T');
        if (x2 - x1 > lab.length * 6 + 4 && !(F.quiet && asks.indexOf('d' + d.n) >= 0)) txt(svg, (x1 + x2) / 2, yD + lane * 9 + 6.4, lab, { class: 'egt-dlab', 'text-anchor': 'middle' });
      });
      // kings
      var yK = yD + hD + 12;
      kings.forEach(function (k, i) {
        var y = yK + i * 18, a = X(k.from), b = X(M.max(k.to, k.from + (to - from) / 200)), asked = asks.indexOf(k.key) >= 0;
        sv('rect', { x: a, y: y, width: M.max(3, b - a), height: 9, rx: 2, class: 'egt-reign' + (asked ? ' ask' : '') }, svg);
        var lab = asked && F.quiet ? '?' : k.name + (F.quiet ? '' : ' (' + EG.span(k.from, k.to, true) + ')');
        var right = b + 6 + lab.length * 6.4 < Wd - 4;
        txt(svg, right ? b + 6 : a - 6, y + 8.5, lab, { class: 'egt-klab', 'text-anchor': right ? 'start' : 'end' });
      });
      // events
      var yE = yK + kingRows;
      evPos.forEach(function (E2) { sv('line', { x1: E2.x, y1: yE, x2: E2.x, y2: yE + 12 + 14 * E2.lane, class: 'egt-ev' }, svg); });
      evPos.forEach(function (E2) { txt(svg, E2.x, yE + 24 + 14 * E2.lane, E2.ev.label, { class: 'egt-evlab', 'text-anchor': E2.anc }); });
      if (o.now !== undefined) { var xn = X(+o.now); sv('line', { x1: xn, y1: y0 - 12, x2: xn, y2: ay, class: 'egt-now' }, svg); }
      // place mode
      if (mode === 'place') {
        var yp = yE + evRows + 14;
        sv('rect', { x: 20, y: yp - 10, width: Wd - 40, height: 30, rx: 6, class: 'egt-track' }, svg);
        if (guess !== null) { var xg = X(guess); var gm = sv('g', { class: 'egt-guess' }, svg); sv('line', { x1: xg, y1: y0 - 4, x2: xg, y2: yp + 20, class: 'egt-guessline' }, gm); sv('circle', { cx: xg, cy: yp + 5, r: 9 }, gm); }
        if (guess !== null && guess.reveal !== undefined) { var ta = X(target.from), tb = X(target.to); sv('rect', { x: ta, y: yp - 6, width: M.max(3, tb - ta), height: 22, rx: 3, class: 'egt-truth' }, svg); }
        var hitT = sv('rect', { x: 0, y: y0 - 10, width: Wd, height: H - y0, class: 'egt-hit', tabindex: 0, role: 'slider', 'aria-label': 'Place the reign of ' + (target ? target.name : 'the king') + ' on the timeline', 'aria-valuemin': from, 'aria-valuemax': to, 'aria-valuenow': guess === null ? (from + to) / 2 : guess, 'aria-valuetext': guess === null ? 'not placed' : EG.year(M.round(guess)) }, svg);
        var setX = function (e) { var q = svgPt(svg, e); guess = M.round(M.max(from, M.min(to, Yr(q.x)))); F.say(F.quiet ? '' : 'About ' + EG.year(guess)); draw(); var hh = svg.querySelector('.egt-hit'); if (hh) hh.focus(); };
        var dragging = false;
        hitT.addEventListener('pointerdown', function (e) { dragging = true; try { hitT.setPointerCapture(e.pointerId); } catch (er) { } setX(e); });
        hitT.addEventListener('pointermove', function (e) { if (dragging) { var q = svgPt(svg, e); guess = M.round(M.max(from, M.min(to, Yr(q.x)))); var gl = svg.querySelector('.egt-guess'); if (gl) { var xx = X(guess); gl.querySelector('line').setAttribute('x1', xx); gl.querySelector('line').setAttribute('x2', xx); gl.querySelector('circle').setAttribute('cx', xx); } else draw(); if (!F.quiet) F.say('About ' + EG.year(guess)); } });
        hitT.addEventListener('pointerup', function () { dragging = false; draw(); });
        hitT.addEventListener('keydown', function (e) { var st = e.shiftKey ? 100 : 10; if (guess === null) guess = M.round((from + to) / 2); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') guess -= st; else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') guess += st; else return; e.preventDefault(); guess = M.max(from, M.min(to, guess)); if (!F.quiet) F.say('About ' + EG.year(guess)); draw(); var hh = svg.querySelector('.egt-hit'); if (hh) hh.focus(); });
      }
    }
    if (mode === 'place' && target) {
      F.body.insertBefore(h('p', 'egv-hint', 'Tap or drag on the timeline to show when <b>' + esc(target.name) + '</b> reigned. (Keyboard: arrow keys, with Shift for bigger steps.)'), stage);
      if (!F.quiet) btn(F.ctl, 'Check', function () {
        if (guess === null) { F.say('Place it on the timeline first.'); return; }
        var tol = o.tol || 60, ok = guess >= target.from - tol && guess <= target.to + tol;
        var g0 = guess; guess = new Number(g0); guess.reveal = 1; draw(); guess = g0; var keep = guess;
        F.say((ok ? okMark(true) + ' Yes: ' : okMark(false) + ' Not quite: ') + esc(target.name) + ' reigned ' + esc(EG.span(target.from, target.to, true)) + ', in the ' + esc(EG.period(target.period).name) + '.');
        guess = keep;
      }, 'pri');
    }
    draw(); onResize(stage, draw);
    if (o.uncertainty !== false && !F.quiet && mode === 'show' && from < -664) F.body.appendChild(h('p', 'egv-hint', 'Whiskers above the bars show how uncertain the dates are; dates before 664 BC are approximate (Shaw, Oxford History of Ancient Egypt, 2000).'));
    return { guess: function () { return guess; } };

    function orderMode() { // put reigns (or periods) in order, earliest first
      var items = kings.length ? kings.map(function (k) { return { key: k.key, text: k.name, y: k.from, sub: EG.span(k.from, k.to, true) }; }) : (o.periods || ['ok', 'mk', 'nk', 'late']).map(function (k) { var p = EG.period(k); return { key: k, text: p.name, y: p.from, sub: EG.span(p.from, p.to, true) }; });
      var cur = derange(items.length, JSON.stringify(items.map(function (i) { return i.key; }))), sel = -1, marks = null;
      var ol = h('ol', 'egt-order'); F.body.appendChild(h('p', 'egv-hint', 'Put them in order, earliest first: tap two to swap them, or use ▲ ▼.')); F.body.appendChild(ol);
      function paint() {
        ol.innerHTML = '';
        cur.forEach(function (ix, pos) {
          var it = items[ix], li = h('li', 'egt-row' + (marks ? (marks[pos] ? ' ok' : ' no') : ''));
          var lab = F.quiet ? letter(pos) : String(pos + 1);
          var b = h('button', 'egt-pick' + (sel === pos ? ' on' : ''), '<span class="egt-n">' + lab + '</span> ' + esc(it.text) + (marks && !F.quiet ? ' <small>' + esc(it.sub) + '</small>' : '')); b.type = 'button';
          if (F.quiet || !F.interactive) b.disabled = true;
          b.addEventListener('click', function () { if (sel < 0) sel = pos; else if (sel === pos) sel = -1; else { var t = cur[sel]; cur[sel] = cur[pos]; cur[pos] = t; sel = -1; marks = null; } paint(); });
          li.appendChild(b);
          if (!F.quiet && F.interactive) { var u = btn(li, '▲', function () { if (pos) { var t = cur[pos - 1]; cur[pos - 1] = cur[pos]; cur[pos] = t; marks = null; paint(); } }, 'egt-mv'); u.setAttribute('aria-label', 'Move up'); u.disabled = !pos; var d = btn(li, '▼', function () { if (pos < cur.length - 1) { var t = cur[pos + 1]; cur[pos + 1] = cur[pos]; cur[pos] = t; marks = null; paint(); } }, 'egt-mv'); d.setAttribute('aria-label', 'Move down'); d.disabled = pos === cur.length - 1; }
          ol.appendChild(li);
        });
      }
      paint();
      if (!F.quiet && F.interactive) btn(F.ctl, 'Check', function () { var sorted = cur.map(function (ix) { return items[ix].y; }); marks = sorted.map(function (y, i) { var want = items.slice().sort(function (a, b) { return a.y - b.y; })[i].y; return y === want; }); paint(); var n = marks.filter(Boolean).length; F.say(n === cur.length ? okMark(true) + ' All in order.' : n + ' of ' + cur.length + ' are in the right place.'); }, 'pri');
      return { order: function () { return cur.map(function (ix) { return items[ix].key; }); } };
    }
  });
  /* ---------- eg-temple: the plan of a New Kingdom temple, from the quay to the sanctuary (and a side view) ---------- */
  // the plan, in plan units (x along the axis from the river, y across); one box per part
  var TPLAN = {
    quay: [0, 92, 34, 56], avenue: [34, 108, 130, 24], pylon: [164, 62, 30, 116], court: [194, 76, 118, 88], pylon2: [312, 80, 14, 80],
    hypostyle: [326, 84, 104, 72], offering: [430, 96, 50, 48], sanctuary: [480, 100, 46, 40], lake: [356, 188, 96, 30], wall: [154, 48, 384, 180]
  };
  V.register('eg-temple', function (el, o) {
    var mode = o.mode || 'show', F = frame(el, o, 'temple', 'Plan of an Egyptian temple');
    var parts = EG.TEMPLE.map(function (p) { return p.key; }), letters = {}, sel = null, seq = [];
    var order = mode === 'order' ? shuffle(parts, 'temple' + (o.seed || '')) : parts;
    order.forEach(function (k, i) { letters[k] = letter(i); });
    var stage = h('div', 'egtp-stage'); F.body.appendChild(stage);
    var legend = h('div', 'egtp-legend'); F.body.appendChild(legend);
    function name(k) { var p = EG.TEMPLE.filter(function (x) { return x.key === k; })[0] || EG.TEMPLE_EXTRA.filter(function (x) { return x.key === k; })[0]; return p ? p.name : k; }
    function note(k) { var p = EG.TEMPLE.filter(function (x) { return x.key === k; })[0] || EG.TEMPLE_EXTRA.filter(function (x) { return x.key === k; })[0]; return p ? p.note : ''; }
    function draw() {
      stage.innerHTML = '';
      var Wv = 540, Hv = o.section ? 350 : 240;
      var svg = svgRoot(Wv, Hv, 'Plan of a temple from the river (left) to the sanctuary (right)', 'egtp-svg'); stage.appendChild(svg);
      var g = sv('g', { transform: 'translate(6,4)' }, svg);
      // river
      sv('rect', { x: -10, y: 0, width: 26, height: 236, class: 'egtp-river' }, g); txt(g, 2, 228, 'Nile', { class: 'egtp-small', transform: 'rotate(-90 4 222)' });
      var w = TPLAN.wall; sv('rect', { x: w[0], y: w[1], width: w[2], height: w[3], rx: 2, class: 'egtp-wall' }, g);
      var lk = TPLAN.lake; sv('rect', { x: lk[0], y: lk[1], width: lk[2], height: lk[3], rx: 3, class: 'egtp-lake' }, g);
      var q = TPLAN.quay; sv('rect', { x: q[0] + 14, y: q[1], width: q[2] - 14, height: q[3], class: 'egtp-stone' }, g);
      var av = TPLAN.avenue; sv('rect', { x: av[0], y: av[1], width: av[2], height: av[3], class: 'egtp-path' }, g);
      for (var i = 0; i < 9; i++) { var sx = av[0] + 8 + i * 14; [av[1] - 7, av[1] + av[3] + 3].forEach(function (yy) { sv('rect', { x: sx, y: yy, width: 9, height: 4, rx: 2, class: 'egtp-sphinx' }, g); }); }
      // pylon: two towers with the door between, flagpoles and obelisks in front
      var p = TPLAN.pylon; sv('path', { d: 'M' + p[0] + ' ' + p[1] + ' L' + (p[0] + p[2]) + ' ' + (p[1] + 6) + ' L' + (p[0] + p[2]) + ' ' + (p[1] + p[3] / 2 - 9) + ' L' + p[0] + ' ' + (p[1] + p[3] / 2 - 9) + ' Z M' + p[0] + ' ' + (p[1] + p[3] / 2 + 9) + ' L' + (p[0] + p[2]) + ' ' + (p[1] + p[3] / 2 + 9) + ' L' + (p[0] + p[2]) + ' ' + (p[1] + p[3] - 6) + ' L' + p[0] + ' ' + (p[1] + p[3]) + ' Z', class: 'egtp-pylon' }, g);
      [p[1] + 30, p[1] + p[3] - 30].forEach(function (yy) { sv('rect', { x: p[0] - 13, y: yy - 3, width: 6, height: 6, class: 'egtp-obelisk' }, g); });
      var c = TPLAN.court; sv('rect', { x: c[0], y: c[1], width: c[2], height: c[3], class: 'egtp-open' }, g);
      for (var j = 0; j < 8; j++) { sv('circle', { cx: c[0] + 10 + j * 14, cy: c[1] + 9, r: 3.6, class: 'egtp-col' }, g); sv('circle', { cx: c[0] + 10 + j * 14, cy: c[1] + c[3] - 9, r: 3.6, class: 'egtp-col' }, g); }
      var p2 = TPLAN.pylon2; sv('path', { d: 'M' + p2[0] + ' ' + p2[1] + ' L' + (p2[0] + p2[2]) + ' ' + (p2[1] + 4) + ' L' + (p2[0] + p2[2]) + ' ' + (p2[1] + p2[3] / 2 - 7) + ' L' + p2[0] + ' ' + (p2[1] + p2[3] / 2 - 7) + ' Z M' + p2[0] + ' ' + (p2[1] + p2[3] / 2 + 7) + ' L' + (p2[0] + p2[2]) + ' ' + (p2[1] + p2[3] / 2 + 7) + ' L' + (p2[0] + p2[2]) + ' ' + (p2[1] + p2[3] - 4) + ' L' + p2[0] + ' ' + (p2[1] + p2[3]) + ' Z', class: 'egtp-pylon' }, g);
      var hy = TPLAN.hypostyle; sv('rect', { x: hy[0], y: hy[1], width: hy[2], height: hy[3], class: 'egtp-roof' }, g);
      for (var a = 0; a < 7; a++) for (var b = 0; b < 5; b++) sv('circle', { cx: hy[0] + 9 + a * 14.4, cy: hy[1] + 9 + b * 13.5, r: b === 2 ? 4.6 : 3.4, class: 'egtp-col' }, g);
      var of = TPLAN.offering; sv('rect', { x: of[0], y: of[1], width: of[2], height: of[3], class: 'egtp-roof dark' }, g);
      var sa = TPLAN.sanctuary; sv('rect', { x: sa[0], y: sa[1], width: sa[2], height: sa[3], class: 'egtp-roof darker' }, g);
      sv('rect', { x: sa[0] + 16, y: sa[1] + 12, width: 16, height: 16, class: 'egtp-naos' }, g);
      // the axis
      sv('line', { x1: 16, y1: 120, x2: sa[0] + sa[2] - 4, y2: 120, class: 'egtp-axis' }, g);
      // labels, numbers or letters on the parts
      var boxes = {}; parts.forEach(function (k) { boxes[k] = k === 'pylon' ? TPLAN.pylon : TPLAN[k]; });
      parts.forEach(function (k) {
        var bx = boxes[k], cx = bx[0] + bx[2] / 2, cy = bx[1] + bx[3] / 2, asked = [].concat(o.ask || []).indexOf(k) >= 0;
        var lab = mode === 'show' && !F.quiet ? '' : mode === 'order' ? letters[k] : String(parts.indexOf(k) + 1);
        if (asked) lab = '?';
        var tag = sv('g', { class: 'egtp-tag' + (sel === k ? ' on' : '') + (asked ? ' ask' : '') + (seq.indexOf(k) >= 0 ? ' done' : '') }, g);
        var ty = k === 'avenue' ? cy - 24 : k === 'quay' ? cy - 40 : cy;
        if (lab) { sv('circle', { cx: cx, cy: ty, r: 10 }, tag); txt(tag, cx, ty + 4.5, lab, { 'text-anchor': 'middle' }); }
        if (F.interactive && mode !== 'show' || (F.interactive && !F.quiet)) {
          var hit = sv('rect', { x: bx[0], y: bx[1] - (k === 'avenue' ? 30 : k === 'quay' ? 50 : 0), width: bx[2], height: bx[3] + (k === 'avenue' ? 30 : k === 'quay' ? 50 : 0), class: 'egtp-hit', tabindex: 0, role: 'button', 'aria-label': F.quiet || mode === 'order' ? 'Part ' + (lab || '') : name(k) }, g);
          var f = function () { tap(k); }; hit.addEventListener('click', f); hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
        }
      });
      if (mode === 'show' && !F.quiet && o.labels !== false) {
        var L = [['quay', 18, 14], ['avenue', 98, 34], ['pylon', 180, 14], ['court', 252, 34], ['hypostyle', 378, 14], ['offering', 456, 76], ['sanctuary', 503, 172]];
        L.forEach(function (l) { var bx = boxes[l[0]]; var cx = bx[0] + bx[2] / 2; sv('line', { x1: cx, y1: l[2] + 4, x2: cx, y2: l[0] === 'sanctuary' ? bx[1] + bx[3] : bx[1], class: 'egtp-lead' }, g); txt(g, M.min(cx, 520), l[2], name(l[0]), { class: 'egtp-lab', 'text-anchor': cx > 470 ? 'end' : 'middle' }); });
        txt(g, lk[0] + lk[2] / 2, lk[1] + lk[3] / 2 + 4, 'Sacred lake', { class: 'egtp-small', 'text-anchor': 'middle' });
        txt(g, w[0] + 4, w[1] + w[3] - 5, 'Enclosure wall', { class: 'egtp-small' });
      }
      if (o.section) { // a side view: the floor rises and the roof comes down toward the sanctuary, and it grows darker
        var s0 = 252, gs = sv('g', { transform: 'translate(6,' + s0 + ')' }, svg);
        txt(gs, 0, 10, 'Side view', { class: 'egtp-small b' });
        var base = 70;
        sv('path', { d: 'M164 ' + base + ' L164 2 L194 2 L194 ' + base + ' Z', class: 'egtp-pylon' }, gs);
        sv('path', { d: 'M194 ' + base + ' L312 ' + base + ' L312 ' + (base - 4) + ' L194 ' + (base - 4) + ' Z', class: 'egtp-stone' }, gs);
        sv('path', { d: 'M312 ' + base + ' L312 10 L326 10 L326 ' + base + ' Z', class: 'egtp-pylon' }, gs);
        sv('path', { d: 'M326 16 L430 16 L430 ' + (base - 7) + ' L326 ' + (base - 7) + ' Z', class: 'egtp-roof' }, gs);
        sv('path', { d: 'M430 28 L480 28 L480 ' + (base - 10) + ' L430 ' + (base - 10) + ' Z', class: 'egtp-roof dark' }, gs);
        sv('path', { d: 'M480 36 L526 36 L526 ' + (base - 13) + ' L480 ' + (base - 13) + ' Z', class: 'egtp-roof darker' }, gs);
        sv('path', { d: 'M16 ' + base + ' L194 ' + base + ' L312 ' + (base - 4) + ' L430 ' + (base - 7) + ' L480 ' + (base - 10) + ' L526 ' + (base - 13) + ' L526 ' + (base + 4) + ' L16 ' + (base + 4) + ' Z', class: 'egtp-floor' }, gs);
        if (!F.quiet) { txt(gs, 330, 12, 'roof gets lower', { class: 'egtp-small' }); txt(gs, 330, base + 15, 'floor rises, light fades →', { class: 'egtp-small' }); }
      }
    }
    function tap(k) {
      if (mode === 'order') {
        if (seq.indexOf(k) >= 0) seq = seq.slice(0, seq.indexOf(k)); else seq.push(k);
        F.say(seq.length ? 'Your order: ' + seq.map(function (x) { return letters[x]; }).join(' → ') : ''); draw(); return;
      }
      sel = sel === k ? null : k; draw();
      if (!F.quiet) F.say(sel ? '<b>' + esc(name(k)) + '</b>: ' + esc(note(k)) : '');
    }
    if (mode === 'label' && !F.quiet) legend.innerHTML = '<ol class="egtp-list">' + parts.map(function (k) { return '<li>' + esc(name(k)) + '</li>'; }).join('') + '</ol>';
    if (mode === 'order') {
      F.body.insertBefore(h('p', 'egv-hint', 'Tap the parts in the order a priest would walk them, from the river to the god\'s room.'), stage);
      btn(F.ctl, 'Start over', function () { seq = []; F.say(''); draw(); });
      if (!F.quiet) btn(F.ctl, 'Check', function () { var ok = seq.length === parts.length && seq.every(function (k, i) { return k === parts[i]; }); var n = 0; for (var i = 0; i < seq.length; i++) if (seq[i] === parts[i]) n++; else break; F.say(ok ? okMark(true) + ' Right: ' + parts.map(name).join(' → ') + '.' : okMark(false) + ' The first ' + n + ' ' + (n === 1 ? 'is' : 'are') + ' right. Keep going from the river toward the sanctuary.'); }, 'pri');
    }
    draw();
    return { sequence: function () { return seq.slice(); } };
  });
  /* ---------- eg-pyramid: a pyramid's profile with its measurements, pyramids side by side to scale, the Great Pyramid's
     inside, and a build-up of courses for the young explorers ---------- */
  V.register('eg-pyramid', function (el, o) {
    var view = o.view || (o.compare ? 'compare' : 'profile'), F = frame(el, o, 'pyramid', 'A pyramid');
    var Pk = o.which || 'great', P0 = EG.PYRAMIDS[Pk] || EG.PYRAMIDS.great, ask = o.ask, units = o.units || 'm';
    var stage = h('div', 'egp-stage'); F.body.appendChild(stage);
    function m(v) { return units === 'ft' ? M.round(v * 3.28084) + ' ft' : (M.round(v * 10) / 10) + ' m'; }
    function deg(d) { var a = M.floor(d), mm = M.round((d - a) * 60); if (mm === 60) { a++; mm = 0; } return a + '°' + (mm ? ' ' + mm + '′' : ''); }
    var built = o.layers !== undefined ? +o.layers : 0;
    function draw() {
      stage.innerHTML = '';
      var Wv = 560, Hv = view === 'section' ? 360 : 300, cKeys, cS, cRef;
      if (view === 'compare') { // size the picture to the pyramids: the scale fits the width, the height fits the tallest
        cKeys = o.compare || ['step', 'bent', 'great', 'menkaure']; cRef = o.ref !== false;
        var cMax = M.max.apply(null, cKeys.map(function (k) { return EG.PYRAMIDS[k].h; })), cTot = cKeys.reduce(function (a, k) { return a + EG.PYRAMIDS[k].base; }, 0);
        cS = M.min((Wv - 40 - (cKeys.length - 1) * 14 - (cRef ? 62 : 0)) / cTot, 220 / cMax);
        Hv = M.round(cMax * cS + 52 + 58);
      }
      var svg = svgRoot(Wv, Hv, view === 'section' ? 'Cross-section of the Great Pyramid' : view === 'compare' ? 'Pyramids side by side, to scale' : 'Profile of the ' + P0.name, 'egp-svg'); stage.appendChild(svg);
      var gb = view === 'section' ? 72 : view === 'compare' ? 52 : 40, gy = Hv - gb; sv('rect', { x: 0, y: gy, width: Wv, height: gb, class: 'egp-ground' }, svg);
      if (view === 'compare') {
        var keys = cKeys, ref = cRef, s = cS, x = 20;
        keys.forEach(function (k) {
          var Q = EG.PYRAMIDS[k], b = Q.base * s, hh = Q.h * s, asked = ask === k;
          drawPyr(svg, x, gy, b, hh, Q, s);
          var lab = asked && F.quiet ? '?' : ({ step: 'Djoser', bent: 'Bent', red: 'Red', great: 'Khufu', khafre: 'Khafre', menkaure: 'Menkaure' })[k] || Q.name;
          txt(svg, x + b / 2, gy + (keys.indexOf(k) % 2 ? 34 : 17), lab, { class: 'egp-lab', 'text-anchor': 'middle' });
          if (!F.quiet || !asked) txt(svg, x + b / 2, gy - hh - 7, F.quiet && o.hideValues ? '' : m(Q.h), { class: 'egp-val', 'text-anchor': 'middle' });
          x += b + 14;
        });
        if (ref) { // the Statue of Liberty, ground to torch, about 93 m
          var lh = 93 * s; x = Wv - 44; sv('path', { d: 'M' + (x + 6) + ' ' + gy + ' l6 ' + (-lh * 0.5) + ' l-2 ' + (-lh * 0.3) + ' l3 ' + (-lh * 0.2) + ' l3 ' + (lh * 0.2) + ' l-2 ' + (lh * 0.3) + ' l6 ' + (lh * 0.5) + ' Z', class: 'egp-ref' }, svg);
          txt(svg, x + 13, gy + 17, 'Statue of', { class: 'egp-small', 'text-anchor': 'middle' }); txt(svg, x + 13, gy + 30, 'Liberty', { class: 'egp-small', 'text-anchor': 'middle' }); txt(svg, x + 13, gy - lh - 6, '93 m', { class: 'egp-small', 'text-anchor': 'middle' });
        }
        txt(svg, 12, 18, 'Drawn to the same scale (original heights)', { class: 'egp-small' });
        return;
      }
      // one pyramid, as large as fits
      var s2 = M.min((Wv - 120) / P0.base, (gy - 50) / P0.h), b2 = P0.base * s2, h2 = P0.h * s2, x0 = (Wv - b2) / 2;
      if (view === 'build') {
        var courses = 20, n = M.max(0, M.min(courses, built));
        for (var i = 0; i < n; i++) { var y1 = gy - (i + 1) * h2 / courses, y2 = gy - i * h2 / courses, inset1 = (i + 1) / courses * b2 / 2, inset0 = i / courses * b2 / 2; sv('path', { d: 'M' + (x0 + inset0) + ' ' + y2 + ' L' + (x0 + inset1) + ' ' + y1 + ' L' + (x0 + b2 - inset1) + ' ' + y1 + ' L' + (x0 + b2 - inset0) + ' ' + y2 + ' Z', class: 'egp-course' + (i % 2 ? ' alt' : '') }, svg); for (var bl = 0; bl < 8; bl++) { var xb = x0 + inset0 + (b2 - 2 * inset0) * bl / 8; sv('line', { x1: xb, y1: y1, x2: xb, y2: y2, class: 'egp-joint' }, svg); } }
        sv('path', { d: 'M' + x0 + ' ' + gy + ' L' + (x0 + b2 / 2) + ' ' + (gy - h2) + ' L' + (x0 + b2) + ' ' + gy, class: 'egp-ghost' }, svg);
        if (n >= courses) sv('path', { d: 'M' + (x0 + b2 / 2 - 8) + ' ' + (gy - h2 + 10) + ' L' + (x0 + b2 / 2) + ' ' + (gy - h2) + ' L' + (x0 + b2 / 2 + 8) + ' ' + (gy - h2 + 10) + ' Z', class: 'egp-cap' }, svg);
        txt(svg, 12, 18, n >= courses ? 'Finished: the capstone goes on top.' : 'Layer ' + n + ' of ' + courses + ' (the real pyramid has over 200 layers)', { class: 'egp-small' });
        return;
      }
      drawPyr(svg, x0, gy, b2, h2, P0, s2);
      if (view === 'section' && Pk === 'great') {
        var X = function (xm) { return x0 + b2 / 2 + xm * s2; }, Y = function (ym) { return gy - ym * s2; };
        sv('line', { x1: X(-101.6), y1: Y(17), x2: X(-7.4), y2: Y(-30), class: 'egp-pass' }, svg);                    // descending passage
        sv('rect', { x: X(-7), y: Y(-27), width: 14 * s2, height: 4 * s2 + 2, class: 'egp-room' }, svg);               // subterranean chamber
        sv('line', { x1: X(-76.5), y1: Y(4.5), x2: X(-41.5), y2: Y(21.7), class: 'egp-pass' }, svg);                   // ascending passage
        sv('path', { d: 'M' + X(-41.5) + ' ' + Y(21.7) + ' L' + X(0.5) + ' ' + Y(42.2) + ' L' + X(0.5) + ' ' + Y(50.8) + ' L' + X(-41.5) + ' ' + Y(30.3) + ' Z', class: 'egp-room gal' }, svg); // Grand Gallery
        sv('line', { x1: X(-41.5), y1: Y(21.7), x2: X(-2.6), y2: Y(21.7), class: 'egp-pass' }, svg);                   // passage to the Queen's Chamber
        sv('rect', { x: X(-2.6), y: Y(27.5), width: 5.2 * s2, height: 5.8 * s2, class: 'egp-room' }, svg);             // Queen's Chamber
        sv('rect', { x: X(2), y: Y(48.8), width: 5.2 * s2 + 3, height: 5.8 * s2, class: 'egp-room' }, svg);            // King's Chamber
        for (var r = 0; r < 5; r++) sv('rect', { x: X(2), y: Y(51 + r * 3.4), width: 5.2 * s2 + 3, height: 1.6 * s2, class: 'egp-relief' }, svg);
        if (!F.quiet) {
          var lab = function (xm, ym, t, dx, dy, anchor) { sv('line', { x1: X(xm), y1: Y(ym), x2: X(xm) + dx, y2: Y(ym) + dy, class: 'egp-lead' }, svg); txt(svg, X(xm) + dx + (anchor === 'end' ? -3 : 3), Y(ym) + dy + 4, t, { class: 'egp-lab', 'text-anchor': anchor || 'start' }); };
          lab(8, 46, "King's Chamber", 74, -6); lab(-20, 36, 'Grand Gallery', -60, -40, 'end'); lab(0, 24, "Queen's Chamber", 80, 10); lab(-101.6, 17, 'Entrance', -10, -30, 'end'); lab(0, -26, 'Underground chamber', 70, 18); lab(-55, 11, 'Ascending passage', -30, 26, 'end'); lab(5, 62, 'Relieving chambers', 66, -34);
        }
        txt(svg, 12, 18, 'Simplified north–south section, to scale', { class: 'egp-small' });
      }
      if (view === 'profile' && o.dims !== false) {
        // height, base, angle
        var cx = x0 + b2 / 2;
        sv('line', { x1: cx, y1: gy, x2: cx, y2: gy - h2, class: 'egp-dim' }, svg);
        sv('line', { x1: x0, y1: gy + 12, x2: x0 + b2, y2: gy + 12, class: 'egp-dim' }, svg);
        var showV = function (k) { return !(F.quiet && ask === k) && !(o.hide || []).includes(k); };
        txt(svg, cx + 6, gy - h2 / 2, ask === 'h' && F.quiet ? 'height = ?' : 'height ' + (showV('h') ? m(P0.h) : '?'), { class: 'egp-val' });
        txt(svg, cx, gy + 28, ask === 'base' && F.quiet ? 'base = ?' : 'base ' + (showV('base') ? m(P0.base) : '?'), { class: 'egp-val', 'text-anchor': 'middle' });
        if (P0.slope) { sv('path', { d: 'M' + (x0 + 34) + ' ' + gy + ' A34 34 0 0 0 ' + (x0 + 34 * M.cos(P0.slope * M.PI / 180)) + ' ' + (gy - 34 * M.sin(P0.slope * M.PI / 180)), class: 'egp-dim' }, svg); txt(svg, x0 + 40, gy - 8, ask === 'slope' && F.quiet ? '?' : (showV('slope') ? deg(P0.slope) : '?'), { class: 'egp-val' }); }
        if (!F.quiet) txt(svg, 12, 18, P0.name + (P0.now && P0.now !== P0.h ? ' (now about ' + m(P0.now) + ' tall)' : ''), { class: 'egp-small' });
      }
    }
    function drawPyr(svg, x, gy, b, hh, Q, s) {
      if (Q.steps) { var n = Q.steps, b0 = b; for (var i = 0; i < n; i++) { var w = b0 * (1 - i * 0.14), sh = hh / n; sv('rect', { x: x + (b - w) / 2, y: gy - (i + 1) * sh, width: w, height: sh + 0.5, class: 'egp-stone' }, svg); } return; }
      if (Q.slope2) { var hb = (Q.at || 47) * s, inset = hb / M.tan(Q.slope * M.PI / 180), top = hh; sv('path', { d: 'M' + x + ' ' + gy + ' L' + (x + inset) + ' ' + (gy - hb) + ' L' + (x + b / 2) + ' ' + (gy - top) + ' L' + (x + b - inset) + ' ' + (gy - hb) + ' L' + (x + b) + ' ' + gy + ' Z', class: 'egp-stone' }, svg); return; }
      sv('path', { d: 'M' + x + ' ' + gy + ' L' + (x + b / 2) + ' ' + (gy - hh) + ' L' + (x + b) + ' ' + gy + ' Z', class: 'egp-stone' }, svg);
      sv('path', { d: 'M' + (x + b / 2) + ' ' + (gy - hh) + ' L' + (x + b) + ' ' + gy + ' L' + (x + b * 0.62) + ' ' + gy + ' Z', class: 'egp-shade' }, svg);
    }
    draw();
    if (view === 'build' && F.interactive) {
      V.slider(F.ctl, { label: 'Layers', min: 0, max: 20, step: 1, value: built, fmt: function (v) { return v; }, input: function (v) { built = v; draw(); } });
      if (!F.quiet) F.body.appendChild(h('p', 'egv-hint', 'Workers cut the blocks, dragged them on sledges and raised them layer by layer. Builders used ramps, but just how the ramps ran is still debated.'));
    }
    if (!F.quiet && view !== 'build' && view !== 'compare' && P0.note) F.body.appendChild(h('p', 'egv-hint', esc(P0.name) + ': ' + esc(P0.note) + '.'));
    return {};
  });
  /* ---------- eg-scripts: one word from hieroglyphs to Coptic; the Rosetta Stone's three texts; the Coptic alphabet;
     the stages of the language and its scripts; a sample to name ---------- */
  var SAMPLES = {
    hieroglyphic: { html: function () { return '<span class="eg-h egs-sample">' + EG.text(EG.WORDS.htpdinsw.sp) + '</span>'; }, note: 'ḥtp-dj-nsw, "an offering that the king gives"' },
    coptic: { html: function () { return '<span class="eg-cop egs-sample">ⲡⲣⲱⲙⲉ · ⲡⲛⲟⲩⲧⲉ · ⲡⲱⲛϩ · ϣⲱⲡⲉ</span>'; }, note: 'Coptic: "the man, the god, the life, become"' },
    greek: { html: function () { return '<span class="egs-sample egs-greek">ΠΤΟΛΕΜΑΙΟΣ ΒΑΣΙΛΕΥΣ</span>'; }, note: 'Greek: "Ptolemy, king"' }
  };
  V.register('eg-scripts', function (el, o) {
    var mode = o.mode || 'word', F = frame(el, o, 'scripts', 'Egyptian scripts');
    var box = h('div', 'egs-box'); F.body.appendChild(box);
    if (mode === 'word') {
      var d = EG.DESCENT.filter(function (x) { return x.word === (o.word || 'ankh'); })[0] || EG.DESCENT[1], w = EG.WORDS[d.word];
      var rows = [['Hieroglyphic', w ? '<span class="eg-h egs-big">' + EG.text(w.sp) + '</span>' : '—', 'carved and painted signs; this spelling is Middle Egyptian'],
        ['Transliteration', tlSpan(d.tl), 'how Egyptologists write the consonants'],
        ['Hieratic and Demotic', '<span class="egs-cursive">written with the same sounds in a fast, joined-up hand</span>', 'not drawn here: their shapes vary by scribe and century'],
        ['Coptic (Sahidic)', '<span class="eg-cop egs-big">' + d.cop + '</span>', 'said “' + esc(d.say) + '”: Coptic writes the vowels, so we finally hear the word']];
      var t = h('table', 'egs-table'), html = '<tbody>';
      rows.forEach(function (r, i) { var hide = F.quiet && [].concat(o.hide || []).indexOf(i) >= 0; html += '<tr><th scope="row">' + r[0] + '</th><td>' + (hide ? '?' : r[1]) + '</td><td class="egs-note">' + (F.quiet ? '' : r[2]) + '</td></tr>'; });
      t.innerHTML = html + '</tbody>'; box.appendChild(t);
      if (!F.quiet) box.appendChild(h('p', 'egg-line', '<span class="egg-lab">Meaning</span> “' + esc(d.en) + '”'));
    } else if (mode === 'rosetta') {
      var svg = svgRoot(300, 330, 'The Rosetta Stone: hieroglyphic text at the top, Demotic in the middle, Greek at the bottom', 'egs-stone'); svg.style.maxWidth = '300px'; box.appendChild(svg);
      sv('path', { d: 'M40 40 L95 16 L150 30 L205 8 L250 34 L262 90 L268 310 L30 312 L26 120 Z', class: 'egs-rock' }, svg);
      var bands = [[52, 96, 'Hieroglyphic', '14 lines (the top is broken off)'], [104, 196, 'Demotic', '32 lines'], [204, 300, 'Greek', '54 lines']];
      var lettersOrd = o.order || [0, 1, 2];
      bands.forEach(function (b, i) {
        for (var y = b[0] + 6; y < b[1] - 4; y += i === 0 ? 7 : i === 1 ? 4.5 : 3.6) sv('line', { x1: i === 0 ? 70 : 44, y1: y, x2: 250, y2: y, class: 'egs-line l' + i }, svg);
        var lab = F.quiet ? letter(lettersOrd.indexOf(i)) : b[2];
        sv('rect', { x: 14, y: (b[0] + b[1]) / 2 - 11, width: F.quiet ? 24 : 98, height: 22, rx: 5, class: 'egs-tag' }, svg);
        txt(svg, F.quiet ? 26 : 63, (b[0] + b[1]) / 2 + 5, lab, { class: 'egs-taglab', 'text-anchor': 'middle' });
      });
      if (!F.quiet) box.appendChild(h('p', 'egv-hint', 'One decree of 196 BC in two languages and three scripts: Egyptian in hieroglyphs (14 lines left) and in Demotic (32 lines), and Greek (54 lines). Found at Rosetta in 1799; in the British Museum since 1802.'));
    } else if (mode === 'coptic') {
      var grid = h('div', 'egs-alpha'), ask = o.ask;
      EG.COPTIC_GREEK.forEach(function (c, i) { grid.appendChild(h('div', 'egs-cell' + (ask === c ? ' ask' : ''), '<span class="eg-cop">' + c.toUpperCase() + ' ' + c + '</span><small>' + (F.quiet ? '' : esc(EG.COPTIC_GREEK_NAMES[i])) + '</small>')); });
      EG.COPTIC_EXTRA.forEach(function (x) { grid.appendChild(h('div', 'egs-cell eg-extra' + (ask === x.c ? ' ask' : ''), '<span class="eg-cop">' + x.C + ' ' + x.c + '</span><small>' + (F.quiet ? '' : esc(x.name) + ' · ' + esc(x.sound)) + '</small>')); });
      box.appendChild(grid);
      if (!F.quiet) box.appendChild(h('p', 'egv-hint', 'Coptic uses the 24 Greek letters (white) and adds letters taken from Demotic (gold) for sounds Greek lacks: six in the Sahidic dialect, and ϧ in Bohairic. ' + EG.COPTIC_EXTRA.map(function (x) { return '<span class="eg-cop">' + x.c + '</span> from ' + esc(x.from); }).join('; ') + '.'));
    } else if (mode === 'stages') {
      var Wv = 560, svg2 = svgRoot(Wv, 230, 'The stages of the Egyptian language and its scripts over time', 'egs-stages'); box.appendChild(svg2);
      var a = -3300, b = 2026, X = function (y) { return 110 + (y - a) / (b - a) * (Wv - 125); };
      [-3000, -2000, -1000, 0, 1000, 2000].forEach(function (y) { var x = X(y); sv('line', { x1: x, y1: 10, x2: x, y2: 205, class: 'egs-grid' }, svg2); txt(svg2, x, 222, y === 0 ? 'BC | AD' : y < 0 ? (-y) + ' BC' : 'AD ' + y, { class: 'egs-tick', 'text-anchor': x > Wv - 40 ? 'end' : 'middle' }); });
      txt(svg2, 4, 20, 'Language', { class: 'egs-head' });
      EG.LANG_STAGES.forEach(function (s, i) { var y = 28 + i * 16; sv('rect', { x: X(s.from), y: y, width: X(s.to) - X(s.from), height: 12, rx: 3, class: 'egs-bar lang' }, svg2); txt(svg2, 104, y + 10, F.quiet && o.ask === s.key ? '?' : s.name, { class: 'egs-blab', 'text-anchor': 'end' }); });
      txt(svg2, 4, 124, 'Script', { class: 'egs-head' });
      EG.SCRIPTS.forEach(function (s, i) { var y = 130 + i * 15; sv('rect', { x: X(s.from), y: y, width: X(M.min(s.to, b)) - X(s.from), height: 11, rx: 3, class: 'egs-bar script s-' + s.key }, svg2); txt(svg2, 104, y + 9.5, F.quiet && o.ask === s.key ? '?' : s.name, { class: 'egs-blab', 'text-anchor': 'end' }); });
      if (!F.quiet) box.appendChild(h('p', 'egv-hint', 'Bars are approximate and overlap: Middle Egyptian stayed the language of formal inscriptions long after people spoke later forms, and hieroglyphs were last carved at Philae in AD 394.'));
    } else if (mode === 'sample') {
      var k = o.script || 'hieroglyphic', S = SAMPLES[k];
      if (S) box.appendChild(h('div', 'egs-samplebox', S.html()));
      else { var sc = EG.SCRIPTS.filter(function (x) { return x.key === k; })[0]; box.appendChild(h('div', 'egs-samplebox egs-desc', sc ? '<p>' + esc(sc.look.charAt(0).toUpperCase() + sc.look.slice(1)) + '; written ' + esc(sc.dir) + '; used for ' + esc(sc.use) + '.</p>' : '')); }
      if (!F.quiet && S) box.appendChild(h('p', 'egv-hint', esc(S.note)));
    }
    return {};
  });
})(typeof window !== "undefined" ? window : globalThis, typeof document !== "undefined" ? document : null);
