/* Ancient Scripts Ladder: the shared visual kit (names prefixed sc-) and its model (MathLadder.scripts), on window.MathLadder.
   Load order: math/viz/core.js (+ viz.css), then this file (+ scripts/viz/scripts.css, which also loads the fonts). Topic pages
   of the ladder always load this file, and practice pages load it with the course (MathLadder.loadCourse), so generators may
   call MathLadder.scripts. The model also runs in node: global.window = global; require('…/scripts.js').
   Vanilla JS, no libraries, no network. Every drawing is original; the Aegean signs are the site's own fonts, TRB Linear B
   and TRB Linear A (static/scripts/fonts/, SIL OFL), drawn at their Unicode code points. Sources: /tmp/work_scripts/src/*.js
   (build: /tmp/work_scripts/build.sh). Conventions for course builders: /tmp/work_scripts/overview.md.

   Embed:  <div class="ml-viz" data-viz="sc-signs" data-opts='{"word":"ti-ri-po","breakdown":true}'></div>

   TRANSLITERATION (the input of every visual): syllables joined by hyphens, words by spaces: 'ti-ri-po', 'a-ta-na-po-ti-ni-ja'.
     Special values a2 a3 au pu2 ra2 ra3 ro2 ta2 dwe dwo nwa pte twe two; an unread sign by its number (*18, *47); a logogram
     by its key (VIR, MUL, EQU, OVISm, OVISf, *201VAS, AUR …, see LOGO); a number by its digits (12); '|' a word divider;
     '[' or ']' marks a break in the clay. Linear A (script: 'A') uses the same values by convention, fraction letters J E F K
     B D H A L (as 'J' or '1/2'), and *301.

   COMMON OPTIONS (every visual)
     quiet: true (alias readout: false)  hide everything that would give a problem's answer away: transliterations,
                  translations, values, verdicts and Check buttons. What the problem asks about stays visible.
     interactive: false   a still picture.    task: a line above the visual.    caption: HTML under it.    label: aria-label.

   THE VISUALS AND THEIR OPTIONS
   sc-signs    a word or line in Linear B (script: 'B', default) or Linear A ('A'). word: a WORDS key (adds the Greek and the
               meaning) | text: a transliteration | la: a LA_WORDS key (Linear A). size: px per sign (default 64, shrinks to
               fit). lines: ['tl', 'gr', 'en'] (any of them); tl: false; breakdown: true (a table: sign, number, value, note,
               with the spelling rules a word shows); number: true (signs numbered); ask: n or [n] (a dashed box and "?" for
               the value of sign n, 0-based); highlight: [n]. Tap a sign for its number, value and examples (not in quiet
               mode). mode: 'name' (the name writer: type a name, see it spelled by the Mycenaean rules, step by step;
               text: a starting name) | 'type' (the typing helper: transliteration in, signs out, and back).
   sc-grid     the syllabic grid of Linear B: rows of consonants (and the vowel row), columns a e i o u. rows: ['', 'd', …]
               (default all); specials: true (the special signs), unread: true (the signs without agreed values); script:
               'A' (the Linear A signs shared with Linear B, with their conventional values, marked as conventional);
               values: false (signs only); ask: [values] (those cells show "?"); highlight: [values]; tap a sign for its
               value, number and example words. mode: 'build' (build a grid the way Kober and Ventris did: place the signs
               so that each row shares a consonant and each column a vowel, using the clues; then add the sounds; set:
               'easy' (6 signs) | 'full' (9 signs)). quiet: values and verdicts hidden.
   sc-tablet   a drawn clay tablet. tablet: a TABLETS key ('ta641', 'tn316', 'horses', 'sheep', 'kuro', 'libation'), or lines: [[segment
               …]] with shape: 'leaf' | 'page'. reading: ['tl', 'gr', 'en'] (the reading lines under it; default ['tl', 'en']);
               steps: true (buttons that reveal the reading one layer at a time: signs, transliteration, Greek, English);
               highlight: [segment index], ask: segment index (a "?" in its reading); tap a word, logogram or number to see
               what it is. quiet: no reading lines.
   sc-compare  mode: 'sign' (sign: a value or AB number: the sign in Linear A and Linear B, the value Linear B proves and the
               value Linear A borrows, and Greek letters for the same sound) | 'word' (la: a LA_WORDS key with a Linear B
               match, e.g. 'pa-i-to') | 'kinds' (logograms, a syllabary and an alphabet writing the same thing) | 'facts' (the
               two scripts compared: dates, places, language, corpus, read or not) | 'alphabet' (word: a WORDS key, in Linear B
               and in the Greek alphabet, sound by sound) | 'claims' (a checklist for judging a decipherment claim, with an
               example to test). quiet: hides the answers in each mode.
   sc-map      the Aegean (Crete, the islands, mainland Greece, western Anatolia; view 'wide' adds Cyprus): coasts, sites by
               script (CH Cretan hieroglyphs, A Linear A, B Linear B, CM Cypro-Minoan) and a few modern cities. view: 'aegean'
               (default) | 'crete' | 'mainland' | 'wide'; scripts: ['A', 'B', …] shown at first; chips: false; sites: [keys]
               (only these); labels: false; mode: 'show' (tap a site) | 'pick' (target, choices: [keys] as lettered dots) |
               'place' (target: tap the map to drop a pin; tol: km, default 40). Buttons switch views. quiet: target hidden.
   sc-timeline the Bronze Age Aegean on a time axis: periods (Minoan, Mycenaean, the palace periods), the scripts' spans with
               uncertainty whiskers, and events. from, to (years, BC negative; default -3200 to -700); rows: ['periods',
               'scripts', 'events']; items: [keys] (only these); ask: [keys] ("?" labels in quiet mode); now: a year (a
               line). mode: 'show' (tap a bar or event) | 'order' (items: [keys]: put them in order, earliest first) |
               'modern' (the discovery and decipherment, AD 1900 to 1956).
   sc-numbers  Aegean numbers. mode: 'show' (n: a number, drawn with its marks and the place values that add up) | 'read' (n;
               quiet: no value) | 'build' (target: tap the mark buttons to build the number; Check) | 'sum' (items: [numbers
               or fraction strings like '3 J'], a ku-ro line with the total; ask: true hides it) | 'fractions' (the Linear A
               fraction signs with proposed values and how sure they are) | 'measures' (the dry, liquid and weight units and
               their ratios; system: 'dry' | 'liquid' | 'weight').

   THE MODEL: MathLadder.scripts (pure data and functions; no DOM; works in node)
     SIGNS [{ n: '*08', v: 'a', u, cp, c: consonant ('' for vowels), vw: vowel, kind: 'grid' | 'special' | 'unread', say,
       prop (a proposed value for an unread sign) }], sign(valueOrNumber), VALUES (value -> sign), ROWS, VOWELS, gridCell(c, v);
     LOGO {key: { n, u, cp, en, kind }} the logograms (and measure signs, word dividers); logo(key);
     NUMS: num(n) the Aegean numeral string; numParts(n) [{ place, count, u }]; numValue(str);
     MEASURES { dry, liquid, weight } with ratios; FRACTIONS (Linear A) [{ k, u, val, num, sure }];
     WORDS {key (the transliteration): { gr, grl (Greek in Latin letters), en, kind, note }}; word(key); wordsWith(value);
     RULES {id: text}; spell(name) the name writer: { parts: [{ from, tl, u, rules }], tl, u, steps: [rule ids] };
     parse(text, script) [{ t: 'syl' | 'logo' | 'num' | 'frac' | 'div' | 'sp' | 'gap' | 'break', tl, u, sign }] and
       toSigns(text, script) the Unicode string; toTranslit(str, script) back again;
     LA_SIGNS [{ n: 'AB08', b: '*08', v, cp, u }] (conventional values), laSign(v), LA_WORDS {key: { en, sure, note, b }};
     TABLETS {key: { id, site, shape, lines: [[segment]], title, note, real }}, tablet(key);
     PERIODS, SCRIPTS, EVENTS, MODERN (the decipherment, AD 1900–1956), SITES, CITIES, GEO, VIEWS, project(lat, lon),
       km(a, b), year(y, c) and span(a, b, c) ("c. 1450 BC").                                                            */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  /* generated by gen_signs.py from the font drawings: [code point, number, value] */
  var RAW_B = [[65536,"*08","a"],[65537,"*38","e"],[65538,"*28","i"],[65539,"*61","o"],[65540,"*10","u"],[65541,"*01","da"],[65542,"*45","de"],[65543,"*07","di"],[65544,"*14","do"],[65545,"*51","du"],[65546,"*57","ja"],[65547,"*46","je"],[65549,"*36","jo"],[65550,"*65","ju"],[65551,"*77","ka"],[65552,"*44","ke"],[65553,"*67","ki"],[65554,"*70","ko"],[65555,"*81","ku"],[65556,"*80","ma"],[65557,"*13","me"],[65558,"*73","mi"],[65559,"*15","mo"],[65560,"*23","mu"],[65561,"*06","na"],[65562,"*24","ne"],[65563,"*30","ni"],[65564,"*52","no"],[65565,"*55","nu"],[65566,"*03","pa"],[65567,"*72","pe"],[65568,"*39","pi"],[65569,"*11","po"],[65570,"*50","pu"],[65571,"*16","qa"],[65572,"*78","qe"],[65573,"*21","qi"],[65574,"*32","qo"],[65576,"*60","ra"],[65577,"*27","re"],[65578,"*53","ri"],[65579,"*02","ro"],[65580,"*26","ru"],[65581,"*31","sa"],[65582,"*09","se"],[65583,"*41","si"],[65584,"*12","so"],[65585,"*58","su"],[65586,"*59","ta"],[65587,"*04","te"],[65588,"*37","ti"],[65589,"*05","to"],[65590,"*69","tu"],[65591,"*54","wa"],[65592,"*75","we"],[65593,"*40","wi"],[65594,"*42","wo"],[65596,"*17","za"],[65597,"*74","ze"],[65599,"*20","zo"],[65600,"*25","a2"],[65601,"*43","a3"],[65602,"*85","au"],[65603,"*71","dwe"],[65604,"*90","dwo"],[65605,"*48","nwa"],[65606,"*29","pu2"],[65607,"*62","pte"],[65608,"*76","ra2"],[65609,"*33","ra3"],[65610,"*68","ro2"],[65611,"*66","ta2"],[65612,"*87","twe"],[65613,"*91","two"],[65616,"*18",""],[65617,"*19",""],[65618,"*22",""],[65619,"*34",""],[65620,"*47",""],[65621,"*49",""],[65622,"*56",""],[65623,"*63",""],[65624,"*64",""],[65625,"*79",""],[65626,"*82",""],[65627,"*83",""],[65628,"*86",""],[65629,"*89",""]];
  var RAW_I = [[65664,"*100 VIR","man"],[65665,"*102 MUL","woman"],[65667,"*105 EQU","horse"],[65668,"*105F EQUf","mare"],[65669,"*105M EQUm","stallion"],[65670,"*106F OVISf","ewe"],[65671,"*106M OVISm","ram"],[65672,"*107F CAPf","she-goat"],[65673,"*107M CAPm","he-goat"],[65674,"*108F SUSf","sow"],[65675,"*108M SUSm","boar"],[65676,"*109F BOSf","cow"],[65677,"*109M BOSm","bull"],[65678,"*120 GRA","wheat"],[65679,"*121 HORD","barley"],[65680,"*122 OLIV","olives"],[65685,"*130 OLE","olive oil"],[65686,"*131 VIN","wine"],[65690,"*140 AES","bronze"],[65691,"*141 AUR","gold"],[65693,"*145 LANA","wool"],[65703,"*159 TELA","cloth"],[65731,"*191 GAL","helmet"],[65734,"*230 HAS","spear"],[65735,"*231 SAG","arrow"],[65737,"*233 PUG","sword"],[65740,"*240 BIG","wheeled chariot"],[65741,"*241 CUR","chariot"],[65742,"*242 CAPS","chariot frame"],[65743,"*243 ROTA","wheel"],[65760,"*201 TRI","tripod cauldron"],[65761,"*202 VAS","goblet (di-pa)"],[65762,"*203 VAS","jar (qe-to)"],[65768,"*209 A","amphora"],[65769,"*210 VAS","stirrup jar"],[65772,"*213 VAS","bowl"],[65792,"|","word divider"],[65793,".","word divider (dot)"],[65794,"x","check mark"],[65847,"L","talent (weight)"],[65848,"M","weight, first subunit"],[65849,"N","weight, second subunit"],[65850,"P","weight, third subunit"],[65851,"Q","weight, fourth subunit"],[65852,"T","dry measure, first subunit"],[65853,"S","liquid measure, first subunit"],[65854,"V","measure, second subunit"],[65855,"Z","measure, third subunit"]];
  var RAW_A = [[67072,"AB01","da"],[67073,"AB02","ro"],[67074,"AB03","pa"],[67075,"AB04","te"],[67076,"AB05","to"],[67077,"AB06","na"],[67078,"AB07","di"],[67079,"AB08","a"],[67080,"AB09","se"],[67081,"AB10","u"],[67082,"AB11","po"],[67083,"AB13","me"],[67084,"AB16","qa"],[67085,"AB17","za"],[67086,"AB20","zo"],[67087,"AB21","qi"],[67093,"AB23","mu"],[67095,"AB24","ne"],[67096,"AB26","ru"],[67097,"AB27","re"],[67098,"AB28","i"],[67100,"AB29","pu2"],[67101,"AB30","ni"],[67102,"AB31","sa"],[67104,"AB37","ti"],[67105,"AB38","e"],[67106,"AB39","pi"],[67107,"AB40","wi"],[67108,"AB41","si"],[67109,"AB44","ke"],[67110,"AB45","de"],[67111,"AB46","je"],[67113,"AB48","nwa"],[67115,"AB50","pu"],[67116,"AB51","du"],[67117,"AB53","ri"],[67118,"AB54","wa"],[67119,"AB55","nu"],[67121,"AB57","ja"],[67122,"AB58","su"],[67123,"AB59","ta"],[67124,"AB60","ra"],[67125,"AB61","o"],[67126,"AB65","ju"],[67127,"AB66","ta2"],[67128,"AB67","ki"],[67129,"AB69","tu"],[67130,"AB70","ko"],[67131,"AB73","mi"],[67132,"AB74","ze"],[67133,"AB76","ra2"],[67134,"AB77","ka"],[67135,"AB78","qe"],[67137,"AB80","ma"],[67138,"AB81","ku"],[67140,"AB85","au"],[67142,"AB87","twe"],[67144,"AB118","balance (talent)"],[67145,"AB120","grain"],[67147,"AB122","olives"],[67149,"AB131","wine"],[67157,"A301",""],[67392,"A",""],[67393,"B",""],[67394,"D",""],[67395,"E",""],[67396,"F",""],[67397,"H",""],[67398,"J",""],[67399,"K",""],[67400,"L",""]];
  var ADV = {"10000":0.574,"10001":0.574,"10002":0.574,"10003":0.574,"10004":0.42,"10005":0.459,"10006":0.574,"10007":0.574,"10008":0.523,"10009":0.574,"1000A":0.574,"1000B":0.574,"1000D":0.574,"1000E":0.958,"1000F":0.83,"10010":0.574,"10011":0.574,"10012":0.574,"10013":0.894,"10014":0.574,"10015":0.587,"10016":0.523,"10017":0.574,"10018":0.638,"10019":0.446,"1001A":0.574,"1001B":0.574,"1001C":0.766,"1001D":0.574,"1001E":0.446,"1001F":0.446,"10020":0.574,"10021":0.51,"10022":0.83,"10023":0.83,"10024":0.83,"10025":0.574,"10026":0.574,"10028":0.51,"10029":0.574,"1002A":0.446,"1002B":0.446,"1002C":0.574,"1002D":0.574,"1002E":0.574,"1002F":0.574,"10030":0.574,"10031":0.51,"10032":0.51,"10033":0.548,"10034":0.574,"10035":0.574,"10036":0.702,"10037":0.574,"10038":0.446,"10039":0.574,"1003A":0.6,"1003C":0.446,"1003D":0.472,"1003F":0.574,"10040":0.574,"10041":0.766,"10042":0.625,"10043":0.574,"10044":1.086,"10045":0.958,"10046":0.804,"10047":0.6,"10048":0.612,"10049":0.574,"1004A":0.574,"1004B":0.83,"1004C":0.446,"1004D":0.958,"10050":0.51,"10051":0.446,"10052":0.856,"10053":0.408,"10054":0.574,"10055":0.958,"10056":0.51,"10057":1.086,"10058":0.83,"10059":0.971,"1005A":0.548,"1005B":0.702,"1005C":1.022,"1005D":0.958,"10080":0.574,"10081":0.574,"10083":1.035,"10084":1.035,"10085":1.035,"10086":0.574,"10087":0.574,"10088":0.574,"10089":0.574,"1008A":0.792,"1008B":0.753,"1008C":0.932,"1008D":0.932,"1008E":0.958,"1008F":0.51,"10090":0.83,"10095":0.856,"10096":0.83,"1009A":0.51,"1009B":0.83,"1009D":0.958,"100A7":0.574,"100C3":0.574,"100C6":0.996,"100C7":1.035,"100C9":0.523,"100CC":1.099,"100CD":1.099,"100CE":1.086,"100CF":0.958,"100E0":0.932,"100E1":0.74,"100E2":0.996,"100E8":0.676,"100E9":0.856,"100EC":0.958,"10100":0.19,"10101":0.236,"10102":0.395,"10107":0.178,"10108":0.287,"10109":0.396,"1010A":0.287,"1010B":0.396,"1010C":0.396,"1010D":0.505,"1010E":0.505,"1010F":0.396,"10110":0.332,"10111":0.332,"10112":0.332,"10113":0.562,"10114":0.562,"10115":0.562,"10116":0.562,"10117":0.562,"10118":0.793,"10119":0.326,"1011A":0.53,"1011B":0.326,"1011C":0.53,"1011D":0.53,"1011E":0.53,"1011F":0.53,"10120":0.53,"10121":0.735,"10122":0.39,"10123":0.665,"10124":0.39,"10125":0.665,"10126":0.665,"10127":0.665,"10128":0.665,"10129":0.665,"1012A":0.94,"1012B":0.39,"1012C":0.665,"1012D":0.39,"1012E":0.665,"1012F":0.665,"10130":0.665,"10131":0.665,"10132":0.665,"10133":0.94,"10137":0.958,"10138":0.42,"10139":0.702,"1013A":0.536,"1013B":0.446,"1013C":0.446,"1013D":0.612,"1013E":0.433,"1013F":0.945,"10600":0.51,"10601":0.574,"10602":0.574,"10603":0.574,"10604":0.638,"10605":0.446,"10606":0.446,"10607":0.446,"10608":0.446,"10609":0.548,"1060A":0.446,"1060B":1.022,"1060C":0.574,"1060D":0.446,"1060E":0.574,"1060F":0.574,"10615":0.51,"10617":0.446,"10618":0.804,"10619":0.83,"1061A":0.702,"1061C":0.83,"1061D":1.022,"1061E":0.702,"10620":0.574,"10621":0.574,"10622":0.702,"10623":0.574,"10624":0.574,"10625":0.702,"10626":0.702,"10627":0.51,"10629":1.086,"1062B":0.83,"1062C":0.894,"1062D":0.459,"1062E":0.702,"1062F":0.51,"10631":0.51,"10632":0.51,"10633":0.51,"10634":0.702,"10635":0.638,"10636":0.792,"10637":0.574,"10638":0.702,"10639":0.574,"1063A":0.83,"1063B":0.702,"1063C":0.766,"1063D":0.766,"1063E":0.83,"1063F":0.83,"10641":0.702,"10642":0.318,"10644":0.702,"10646":0.382,"10648":0.83,"10649":0.446,"1064B":0.958,"1064D":0.83,"10655":0.702,"10740":0.446,"10741":0.446,"10742":0.51,"10743":0.51,"10744":0.51,"10745":0.51,"10746":0.446,"10747":0.574,"10748":0.51}; // advance widths in em (TRB fonts)
  /* =====================================================================================================================
     THE MODEL
     ===================================================================================================================== */
  function chr(cp) { return String.fromCodePoint(cp); }
  var VOWELS = ['a', 'e', 'i', 'o', 'u'];
  var ROWS = ['', 'd', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'z'];
  var ROW_NOTE = { '': 'the vowels alone', d: 'd', j: 'j, a y-glide (as in "yes")', k: 'k, g or kh', m: 'm', n: 'n', p: 'p, b or ph',
    q: 'labiovelars kʷ, gʷ, kʷʰ (later Greek p, b, t or d)', r: 'r or l', s: 's', t: 't or th', w: 'w', z: 'a sound like dz or zd' };
  // values of the special signs, as usually read
  var SPECIAL_SAY = { a2: 'ha', a3: 'ai', au: 'au', dwe: 'dwe', dwo: 'dwo', nwa: 'nwa', pte: 'pte', pu2: 'phu', ra2: 'rya (also lla)',
    ra3: 'rai (also lai)', ro2: 'ryo (also llo)', ta2: 'tya', twe: 'twe', two: 'two' };
  // proposed values for some signs without agreed values (Wikipedia, "Linear B": doubtful values)
  var PROPOSED = { '*56': 'pa3', '*64': 'swi', '*79': 'zu', '*82': 'swa' };
  var SIGNS = [], VALUES = {}, BYNUM = {};
  RAW_B.forEach(function (r) {
    var cp = r[0], n = r[1], v = r[2], s = { n: n, v: v, cp: cp, u: chr(cp) };
    var m = /^([djkmnpqrstwz]?)([aeiou])$/.exec(v);
    if (n === '*65') { s.kind = 'grid'; s.c = 'j'; s.vw = 'u'; s.doubt = true; s.say = 'ju (doubtful)'; }
    else if (m) { s.kind = 'grid'; s.c = m[1]; s.vw = m[2]; s.say = v; }
    else if (v) { s.kind = 'special'; s.say = SPECIAL_SAY[v] || v; }
    else { s.kind = 'unread'; s.say = ''; if (PROPOSED[n]) s.prop = PROPOSED[n]; }
    SIGNS.push(s); BYNUM[n] = s; if (v) VALUES[v] = s;
  });
  function sign(x) { if (!x) return null; x = String(x).trim(); return VALUES[x.toLowerCase()] || BYNUM[x] || BYNUM['*' + x.replace(/^\*/, '')] || null; }
  function gridCell(c, v) { for (var i = 0; i < SIGNS.length; i++) { var s = SIGNS[i]; if (s.kind === 'grid' && s.c === c && s.vw === v) return s; } return null; }

  /* logograms (and the measure signs and dividers in the Aegean Numbers block). key: the usual transcription. */
  var LOGO_KEYS = { 0x10080: 'VIR', 0x10081: 'MUL', 0x10083: 'EQU', 0x10084: 'EQUf', 0x10085: 'EQUm', 0x10086: 'OVISf', 0x10087: 'OVISm',
    0x10088: 'CAPf', 0x10089: 'CAPm', 0x1008A: 'SUSf', 0x1008B: 'SUSm', 0x1008C: 'BOSf', 0x1008D: 'BOSm', 0x1008E: 'GRA', 0x1008F: 'HORD',
    0x10090: 'OLIV', 0x10095: 'OLE', 0x10096: 'VIN', 0x1009A: 'AES', 0x1009B: 'AUR', 0x1009D: 'LANA', 0x100A7: 'TELA', 0x100C3: 'GAL',
    0x100C6: 'HAS', 0x100C7: 'SAG', 0x100C9: 'PUG', 0x100CC: 'BIG', 0x100CD: 'CUR', 0x100CE: 'CAPS', 0x100CF: 'ROTA',
    0x100E0: '*201VAS', 0x100E1: '*202VAS', 0x100E2: '*203VAS', 0x100E8: '*209VAS', 0x100E9: '*210VAS', 0x100EC: '*213VAS',
    0x10100: '|', 0x10101: '·', 0x10102: 'x', 0x10137: 'L', 0x10138: 'M', 0x10139: 'N', 0x1013A: 'P', 0x1013B: 'Q', 0x1013C: 'T',
    0x1013D: 'S', 0x1013E: 'V', 0x1013F: 'Z' };
  var LOGO = {};
  RAW_I.forEach(function (r) {
    var k = LOGO_KEYS[r[0]]; if (!k) return;
    var kind = r[0] >= 0x10137 ? 'measure' : r[0] >= 0x10100 ? 'mark' : 'logo';
    LOGO[k] = { key: k, n: r[1].split(' ')[0], cp: r[0], u: chr(r[0]), en: r[2], kind: kind };
  });
  LOGO['*201VAS'].en = 'tripod cauldron'; LOGO['*202VAS'].en = 'cup (di-pa)'; LOGO['*203VAS'].en = 'jar (qe-to)';
  LOGO['*209VAS'].en = 'amphora'; LOGO['*210VAS'].en = 'stirrup jar'; LOGO['*213VAS'].en = 'bowl';
  function logo(k) { if (!k) return null; if (LOGO[k]) return LOGO[k]; var K = String(k).toUpperCase(); if (K.length < 2) return null; for (var x in LOGO) if (x.toUpperCase() === K) return LOGO[x]; return null; }

  /* Aegean numbers: ones are upright strokes, tens level strokes, hundreds circles, thousands circles with rays,
     ten thousands circles with rays and a bar. Each place has its own signs for 1 to 9 marks (U+10107 …). */
  var PLACES = [[10000, 0x1012A], [1000, 0x10121], [100, 0x10118], [10, 0x1010F], [1, 0x10106]];
  function numParts(n) {
    n = Math.floor(+n); if (!(n > 0) || n > 99999) return [];
    var out = [];
    PLACES.forEach(function (p) { var k = Math.floor(n / p[0]) % 10; if (k) out.push({ place: p[0], count: k, cp: p[1] + k, u: chr(p[1] + k) }); });
    return out;
  }
  function num(n) { return numParts(n).map(function (p) { return p.u; }).join(''); }
  function numValue(str) {
    var t = 0, any = false;
    Array.from(String(str || '')).forEach(function (ch) {
      var c = ch.codePointAt(0);
      PLACES.forEach(function (p) { if (c > p[1] && c <= p[1] + 9) { t += (c - p[1]) * p[0]; any = true; } });
    });
    return any ? t : null;
  }

  /* measures: each unit is so many of the next one down (from "1 unit = 10 T, 1 T = 6 V, 1 V = 4 Z" for dry goods).
     Sizes in liters are modern estimates. */
  var MEASURES = {
    dry: { name: 'Dry measure (grain, figs, spices)', top: 'written with the commodity sign itself (for example GRA, wheat)', steps: [['T', 10], ['V', 6], ['Z', 4]], approx: 'The dry unit was perhaps about 96 liters, Z about 0.4 liter (estimates).' },
    liquid: { name: 'Liquid measure (oil, wine)', top: 'written with the commodity sign itself (for example OLE, oil)', steps: [['S', 3], ['V', 6], ['Z', 4]], approx: 'The liquid unit was perhaps about 29 liters; V and Z are the same sizes as in dry measure (estimates).' },
    weight: { name: 'Weight (bronze, wool, gold)', top: 'the talent, written L (a balance)', steps: [['M', 30]], more: 'Smaller weights, N, P and Q, divide M further.', approx: 'Absolute weights are estimates and are left out here.' }
  };
  function measureIn(system, unit) { // how many of `unit` in one top unit
    var M = MEASURES[system], f = 1; if (!M) return null;
    for (var i = 0; i < M.steps.length; i++) { f *= M.steps[i][1]; if (M.steps[i][0] === unit) return f; }
    return null;
  }

  /* Linear A fraction signs: J = 1/2 is widely accepted; the rest are proposals (values as in Corazza and others, 2021,
     reported in Wikipedia, "Linear A", with no full agreement). */
  var FRACTIONS = [
    { k: 'J', cp: 0x10746, val: 1 / 2, num: '1/2', sure: 'accepted', note: 'Widely accepted.' },
    { k: 'E', cp: 0x10743, val: 1 / 4, num: '1/4', sure: 'proposed', note: 'Proposed; JE together seem to make 3/4.' },
    { k: 'F', cp: 0x10744, val: 1 / 8, num: '1/8', sure: 'proposed', note: 'Proposed.' },
    { k: 'K', cp: 0x10747, val: 1 / 10, num: '1/10', sure: 'proposed', note: 'Proposed; Linear B has a unit of a tenth.' },
    { k: 'B', cp: 0x10741, val: 1 / 5, num: '1/5', sure: 'proposed', note: 'Proposed.' },
    { k: 'D', cp: 0x10742, val: 1 / 6, num: '1/6', sure: 'proposed', note: 'Proposed; DD seems to make 1/3.' },
    { k: 'H', cp: 0x10745, val: 1 / 16, num: '1/16?', sure: 'uncertain', note: 'Uncertain.' },
    { k: 'A', cp: 0x10740, val: 1 / 24, num: '1/24?', sure: 'uncertain', note: 'Uncertain.' },
    { k: 'L', cp: 0x10748, val: null, num: '?', sure: 'unknown', note: 'Rare; the sign may not even be a fraction.' }
  ];
  FRACTIONS.forEach(function (f) { f.u = chr(f.cp); });
  function fraction(k) { for (var i = 0; i < FRACTIONS.length; i++) if (FRACTIONS[i].k === k || FRACTIONS[i].num === k) return FRACTIONS[i]; return null; }

  /* WORDS: well-attested Mycenaean words with their later Greek forms. kind: word | name | place | god | phrase. */
  var WORDS = {
    'ti-ri-po': { gr: 'τρίπους', grl: 'tripous', en: 'tripod', kind: 'word', note: 'The dual ti-ri-po-de, "two tripods", is on Pylos tablet Ta 641, beside the tripod sign.' },
    'ti-ri-po-de': { gr: 'τρίποδε', grl: 'tripode', en: 'two tripods', kind: 'word', note: 'A dual: Greek still had a form for exactly two.' },
    'di-pa': { gr: 'δέπας', grl: 'depas', en: 'cup, goblet', kind: 'word', note: 'Homer\'s word for a cup; on Ta 641 it labels the cup sign.' },
    'e-ra-wo': { gr: 'ἔλαιον', grl: 'elaion', en: 'olive oil', kind: 'word', note: 'Also spelled e-rai-wo. The w shows a sound later lost from Greek (elaiwon).' },
    'wa-na-ka': { gr: 'ἄναξ', grl: 'anax', en: 'king, lord', kind: 'word', note: 'Mycenaean wanax. The w was later lost; the final -ks cannot be written, so the spelling ends in ka.' },
    'wa-na-sa': { gr: 'ἄνασσα', grl: 'anassa', en: 'queen, lady', kind: 'word', note: 'The feminine of wanax.' },
    'qa-si-re-u': { gr: 'βασιλεύς', grl: 'basileus', en: 'a local official (later the word for king)', kind: 'word', note: 'q stands for an old gʷ sound that later became b, and r stands for l.' },
    'ra-wa-ke-ta': { gr: 'λαός + ἄγω', grl: 'lawagetas', en: 'leader of the people, an official ranked after the wanax', kind: 'word', note: 'Built from lawos, "people" (later λαός), and ago, "I lead".' },
    'e-qe-ta': { gr: 'ἕπομαι', grl: 'hequetas', en: 'follower, companion (an official)', kind: 'word', note: 'Related to hepomai, "I follow".' },
    'te-o': { gr: 'θεός', grl: 'theos', en: 'god', kind: 'word' },
    'te-o-jo': { gr: 'θεοῖο', grl: 'theoio', en: 'of the god', kind: 'word', note: 'The old genitive in -oio, which Homer still uses; later θεοῦ.' },
    'po-ti-ni-ja': { gr: 'πότνια', grl: 'potnia', en: 'lady, mistress (a goddess)', kind: 'god' },
    'po-se-da-o': { gr: 'Ποσειδῶν', grl: 'Poseidon', en: 'Poseidon', kind: 'god', note: 'Important at Pylos, where many offerings go to him.' },
    'di-we': { gr: 'Διί', grl: 'Dii', en: 'to Zeus', kind: 'god', note: 'The dative of Zeus\' name; di-wo is the genitive, "of Zeus".' },
    'di-wo': { gr: 'Διός', grl: 'Dios', en: 'of Zeus', kind: 'god' },
    'e-ra': { gr: 'Ἥρα', grl: 'Hera', en: 'Hera', kind: 'god', note: 'Named at Pylos and Thebes.' },
    'di-wo-nu-so': { gr: 'Διόνυσος', grl: 'Dionysos', en: 'Dionysus', kind: 'god', note: 'Once thought to be a later god; his name is already on tablets from Chania and Pylos.' },
    'e-ma-a2': { gr: 'Ἑρμῆς', grl: 'Hermes', en: 'Hermes', kind: 'god', note: 'a2 is the sign for ha.' },
    'a-re': { gr: 'Ἄρης', grl: 'Ares', en: 'Ares', kind: 'god' },
    'a-ta-na-po-ti-ni-ja': { gr: 'Ἀθηνᾶ πότνια', grl: 'Athena potnia', en: 'Mistress Athena', kind: 'god', note: 'On Knossos tablet V 52.' },
    'e-re-u-ti-ja': { gr: 'Εἰλείθυια', grl: 'Eileithyia', en: 'Eileithyia, goddess of childbirth', kind: 'god' },
    'ka-ko': { gr: 'χαλκός', grl: 'khalkos', en: 'bronze', kind: 'word', note: 'The l before k and the final s are not written.' },
    'ku-ru-so': { gr: 'χρυσός', grl: 'khrusos', en: 'gold', kind: 'word', note: 'kh and r are split by an empty vowel: ku-ru.' },
    'pa-te': { gr: 'πατήρ', grl: 'pater', en: 'father', kind: 'word' },
    'ma-te': { gr: 'μήτηρ', grl: 'meter', en: 'mother', kind: 'word' },
    'i-qo': { gr: 'ἵππος', grl: 'hippos', en: 'horse', kind: 'word', note: 'q writes the old kʷ sound, which became pp in hippos; the h is not written.' },
    'po-ro': { gr: 'πῶλος', grl: 'polos', en: 'foal', kind: 'word', note: 'Written beside young horses\' heads on a Knossos tablet; r writes the l.' },
    'a-to-ro-qo': { gr: 'ἄνθρωπος', grl: 'anthropos', en: 'human being', kind: 'word', note: 'n before th is dropped, th and r are split by an empty vowel, and q writes the old kʷ.' },
    'ko-wo': { gr: 'κοῦρος', grl: 'kouros', en: 'boy', kind: 'word', note: 'Mycenaean korwos; Homer has κοῦρος.' },
    'ko-wa': { gr: 'κόρη', grl: 'kore', en: 'girl', kind: 'word', note: 'Mycenaean korwa.' },
    'do-e-ro': { gr: 'δοῦλος', grl: 'doulos', en: 'servant, slave', kind: 'word' },
    'i-je-re-u': { gr: 'ἱερεύς', grl: 'hiereus', en: 'priest', kind: 'word', note: 'The j between i and e is a glide.' },
    'i-je-re-ja': { gr: 'ἱέρεια', grl: 'hiereia', en: 'priestess', kind: 'word' },
    'ke-ra-me-u': { gr: 'κεραμεύς', grl: 'kerameus', en: 'potter', kind: 'word' },
    'ka-ke-u': { gr: 'χαλκεύς', grl: 'khalkeus', en: 'bronzesmith', kind: 'word' },
    'to-ra-ke': { gr: 'θώρακες', grl: 'thorakes', en: 'breastplates', kind: 'word' },
    'pa-ka-na': { gr: 'φάσγανα', grl: 'phasgana', en: 'swords', kind: 'word' },
    'e-ke-a': { gr: 'ἔγχεα', grl: 'enkhea', en: 'spears', kind: 'word' },
    'a-ni-ja': { gr: 'ἡνία', grl: 'henia', en: 'reins', kind: 'word', note: 'The h is not written.' },
    'me-ri': { gr: 'μέλι', grl: 'meli', en: 'honey', kind: 'word', note: 'r writes the l.' },
    'wo-no': { gr: 'οἶνος', grl: 'oinos', en: 'wine', kind: 'word', note: 'Mycenaean woinos; the w was later lost.' },
    'si-to': { gr: 'σῖτος', grl: 'sitos', en: 'grain', kind: 'word' },
    'pe-mo': { gr: 'σπέρμα', grl: 'sperma', en: 'seed', kind: 'word', note: 'The s before p and the r before m are not written.' },
    'pa-ta': { gr: 'πάντα', grl: 'panta', en: 'all', kind: 'word', note: 'The n before t is not written.' },
    'do-ra': { gr: 'δῶρα', grl: 'dora', en: 'gifts', kind: 'word' },
    'to-pe-za': { gr: 'τράπεζα', grl: 'trapeza', en: 'table', kind: 'word', note: 'Mycenaean torpeza: the r and the vowel come in a different order than in the later word.' },
    'me-zo': { gr: 'μείζων', grl: 'meizon', en: 'larger', kind: 'word' },
    'me-wi-jo': { gr: 'μείων', grl: 'meion', en: 'smaller', kind: 'word', note: 'Mycenaean keeps a w that later Greek lost.' },
    'pa-ra-jo': { gr: 'παλαιός', grl: 'palaios', en: 'old', kind: 'word' },
    'ke-re-si-jo': { gr: 'Κρήσιος', grl: 'Kresios', en: 'Cretan', kind: 'word', note: 'On Ta 641, ke-re-si-jo we-ke means "of Cretan make".' },
    'a3-ku-pi-ti-jo': { gr: 'Αἰγύπτιος', grl: 'Aiguptios', en: 'Egyptian (used as a name)', kind: 'name', note: 'a3 is the sign for ai.' },
    'ko-ri-ja-do-no': { gr: 'κορίαννον', grl: 'koriannon', en: 'coriander', kind: 'word' },
    'ku-mi-no': { gr: 'κύμινον', grl: 'kuminon', en: 'cumin', kind: 'word' },
    'sa-sa-ma': { gr: 'σήσαμα', grl: 'sesama', en: 'sesame', kind: 'word' },
    'qo-u-ko-ro': { gr: 'βουκόλοι', grl: 'boukoloi', en: 'cowherds', kind: 'word', note: 'q writes the old gʷ, which became b.' },
    'a-re-ka-sa-da-ra': { gr: 'Ἀλεξάνδρα', grl: 'Alexandra', en: 'Alexandra, a woman\'s name', kind: 'name', note: 'k and s, and d and r, are split by empty vowels; the n before d is dropped.' },
    'ko-no-so': { gr: 'Κνωσός', grl: 'Knosos', en: 'Knossos', kind: 'place', note: 'One of the names that broke the code.' },
    'a-mi-ni-so': { gr: 'Ἀμνισός', grl: 'Amnisos', en: 'Amnisos, the port of Knossos', kind: 'place' },
    'tu-ri-so': { gr: 'Τύλισος', grl: 'Tylisos', en: 'Tylissos, a town near Knossos', kind: 'place' },
    'pa-i-to': { gr: 'Φαιστός', grl: 'Phaistos', en: 'Phaistos', kind: 'place', note: 'The same name is read in Linear A by the borrowed values.' },
    'ku-do-ni-ja': { gr: 'Κυδωνία', grl: 'Kydonia', en: 'Kydonia (modern Chania)', kind: 'place' },
    'pu-ro': { gr: 'Πύλος', grl: 'Pylos', en: 'Pylos', kind: 'place' },
    'te-qa': { gr: 'Θῆβαι', grl: 'Thebai', en: 'Thebes', kind: 'place', note: 'q writes an old gʷ that later became b.' },
    'qe-to-ro-we': { gr: 'τετρα- + οὖς', grl: 'kwetrowes', en: 'with four handles', kind: 'word', note: 'Literally "four-eared"; q writes kʷ, as in Latin quattuor.' },
    'ti-ri-jo-we': { gr: 'τρι- + οὖς', grl: 'triowes', en: 'with three handles', kind: 'word' },
    'a-no-we': { gr: 'ἀν- + οὖς', grl: 'anowes', en: 'with no handles', kind: 'word' },
    'me-zo-e': { gr: 'μείζονε', grl: 'meizone', en: 'larger (of two)', kind: 'word' },
    'e-me': { gr: 'ἑνί', grl: 'hemei', en: 'with one', kind: 'word', note: 'The old dative of "one"; e-me po-de, "with one foot".' },
    'po-de': { gr: 'ποδί', grl: 'podei', en: 'foot (with … foot)', kind: 'word' },
    'we-ke': { gr: '-εργής', grl: '-werges', en: 'made, wrought', kind: 'word' },
    'ke-re-a2': { gr: 'σκέλη', grl: 'skele', en: 'legs', kind: 'word', note: 'Mycenaean skeleha, the older form of σκέλη: the s before k is not written, and a2 is ha.' },
    'di-ri-mi-jo': { gr: 'Δρίμιος', grl: 'Drimios', en: 'Drimios, a god, son of Zeus', kind: 'god', note: 'Known only from this tablet.' },
    'i-je-we': { gr: 'υἱεῖ', grl: 'hiewei', en: 'to the son', kind: 'word' }
  };
  function word(k) { return WORDS[k] || null; }
  function wordsWith(v) { var out = []; for (var k in WORDS) if (k.split('-').indexOf(v) >= 0) out.push(k); return out; }

  /* the spelling rules (ids used by spell() and by course builders) */
  var RULES = {
    open: 'Every sign is a vowel or a consonant plus a vowel; no sign ends in a consonant.',
    final: 'A consonant at the end of a word (l, m, n, r, s) is not written.',
    finalstop: 'A stop at the end of a word is written with the vowel before it (wanaks: wa-na-ka).',
    drops: 's before another consonant is not written.',
    droplr: 'l and r before another consonant are not written.',
    dropnasal: 'm and n before a stop (p, t, d, k, q) are not written.',
    empty: 'Other clusters: the first consonant gets the vowel of the next syllable, an "empty" vowel (tri: ti-ri).',
    lr: 'l is written with the r signs.',
    stops: 'b and ph use the p signs; g, c and kh the k signs; th the t signs. Only d and t are kept apart.',
    h: 'h is not written.',
    double: 'A double consonant is written once.',
    qu: 'qu is written with the q signs, which stand for kʷ.',
    nosign: 'There is no sign for this syllable, so the nearest one is used.',
    english: 'English spellings and sounds Mycenaean Greek did not have are matched to the nearest: soft c to s, f to p, v to w, j and soft g to z, sh to s.',
    glide: 'Before a vowel, y is the glide j and w stays w.'
  };
  /* spell(name): write a modern name the way a Mycenaean scribe might have, by the rules above. A modern game:
     the rules are real, but the scribes never wrote these names. */
  function spell(name) {
    var steps = [], s = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
    function note(id) { if (steps.indexOf(id) < 0) steps.push(id); }
    if (!s) return { parts: [], tl: '', u: '', steps: [] };
    // letters to sounds: an array of { c: consonant | v: vowel, from: letters }
    var ph = [], i = 0, V = 'aeiou';
    function isV(ch) { return !!ch && ch.length === 1 && V.indexOf(ch) >= 0; }
    while (i < s.length) {
      var two = s.slice(i, i + 2), ch = s[i], nx = s[i + 1] || '';
      var push = function (o, n) { o.from = s.slice(i, i + n); ph.push(o); i += n; };
      if (two === 'ph') { note('stops'); push({ c: 'p' }, 2); continue; }
      if (two === 'th') { note('stops'); push({ c: 't' }, 2); continue; }
      if (two === 'ch' || two === 'kh' || two === 'ck') { note('stops'); push({ c: 'k' }, 2); continue; }
      if (two === 'sh') { note('english'); push({ c: 's' }, 2); continue; }
      if (two === 'qu' && isV(s[i + 2] || '')) { note('qu'); push({ c: 'q' }, 2); continue; }
      if (ch === 'x') { note('empty'); ph.push({ c: 'k', from: 'x' }, { c: 's', from: '' }); i++; continue; }
      if (ch === 'h') { note('h'); i++; continue; }
      if (ch === 'y') { if (isV(nx) && (!ph.length || ph[ph.length - 1].v)) { note('glide'); push({ c: 'j' }, 1); } else push({ v: 'i' }, 1); continue; }
      if (ch === 'w') { if (isV(nx)) push({ c: 'w' }, 1); else push({ v: 'u' }, 1); continue; }
      if (isV(ch)) { push({ v: ch }, 1); continue; }
      var map = { b: 'p', p: 'p', f: 'p', v: 'w', g: 'k', k: 'k', c: 'k', q: 'k', t: 't', d: 'd', l: 'r', r: 'r', m: 'm', n: 'n', s: 's', z: 'z', j: 'z' };
      var c = map[ch];
      var soft = nx === 'e' || nx === 'i' || nx === 'y';
      if (ch === 'b' || ((ch === 'g' || ch === 'c') && !soft)) note('stops');
      if (ch === 'f' || ch === 'v' || ch === 'j') note('english');
      if (ch === 'l') note('lr');
      if (ch === 'c' && soft) { c = 's'; note('english'); }
      if (ch === 'g' && soft) { c = 'z'; note('english'); }
      push({ c: c }, 1);
    }
    // double consonants
    var ph2 = [];
    ph.forEach(function (p) { var L = ph2[ph2.length - 1]; if (p.c && L && L.c === p.c) { note('double'); L.from += p.from; } else ph2.push(p); });
    ph = ph2;
    // syllables
    var parts = [], k = 0;
    var STOP = 'ptdkq';
    function cv(c, v, from, rules) {
      var val = (c || '') + v, S = VALUES[val];
      if (!S || S.doubt) { // no sign: ji -> i, wu -> u, zi -> si, zu -> su, qu -> ku, ju -> u
        var alt = { ji: 'i', ju: 'u', wu: 'u', zi: 'si', zu: 'su', qu: 'ku' }[val];
        if (alt) { val = alt; S = VALUES[val]; rules = rules.concat(['nosign']); note('nosign'); }
      }
      parts.push({ from: from, tl: val, u: S ? S.u : '', rules: rules });
    }
    var anyV = ph.some(function (p) { return p.v; });
    if (!anyV) { ph.push({ v: 'a', from: '' }); }
    while (k < ph.length) {
      // gather consonants up to the next vowel
      var cl = [], from = '';
      while (k < ph.length && ph[k].c) { cl.push(ph[k]); k++; }
      if (k >= ph.length) { // final consonants
        if (cl.length) {
          var prev = parts.length ? parts[parts.length - 1] : null, pv = prev ? prev.tl.slice(-1) : 'a';
          if ('aeiou'.indexOf(pv) < 0) pv = 'a';
          var last = null;
          cl.forEach(function (x) { if (STOP.indexOf(x.c) >= 0) last = x; });
          var dropped = cl.filter(function (x) { return x !== last; });
          if (dropped.length) note('final');
          if (last) { note('finalstop'); cv(last.c, pv, cl.map(function (x) { return x.from; }).join(''), ['finalstop']); }
          else if (prev) prev.from += cl.map(function (x) { return x.from; }).join('');
        }
        break;
      }
      var vw = ph[k]; k++;
      var keep = cl.slice(), rules = [];
      // drop consonants that close the previous syllable (s; l and r; m and n before a stop)
      if (parts.length || keep.length > 1) {
        while (keep.length > 1) {
          var a = keep[0], b = keep[1];
          if (a.c === 's') { note('drops'); rules.push('drops'); }
          else if (a.c === 'r' && parts.length) { note('droplr'); rules.push('droplr'); }
          else if ((a.c === 'm' || a.c === 'n') && STOP.indexOf(b.c) >= 0) { note('dropnasal'); rules.push('dropnasal'); }
          else break;
          if (parts.length) parts[parts.length - 1].from += a.from; else from += a.from;
          keep.shift();
        }
      }
      // the rest of the cluster: empty vowels
      while (keep.length > 1) { var x = keep.shift(); note('empty'); cv(x.c, vw.v, from + x.from, ['empty']); from = ''; }
      var c0 = keep.length ? keep[0] : null;
      cv(c0 ? c0.c : '', vw.v, from + (c0 ? c0.from : '') + vw.from, rules);
    }
    if (!steps.length || steps[0] !== 'open') steps.unshift('open');
    return { parts: parts, tl: parts.map(function (p) { return p.tl; }).join('-'), u: parts.map(function (p) { return p.u; }).join(''), steps: steps };
  }

  /* Linear A: the signs shared with Linear B, read by convention with the Linear B values. */
  var LA_SIGNS = [], LA_VALUES = {}, LA_BYCP = {};
  RAW_A.forEach(function (r) {
    var n = r[1], v = r[2], s = { n: n, cp: r[0], u: chr(r[0]), v: v };
    var IDEO_A = { AB118: 1, AB120: 1, AB122: 1, AB131: 1 };
    if (IDEO_A[n]) s.kind = 'logo';
    else if (/^AB\d+$/.test(n)) { s.kind = 'syl'; s.b = '*' + n.slice(2).padStart(2, '0'); }
    else if (/^A\d+$/.test(n)) s.kind = 'unread';
    else s.kind = 'frac';
    LA_SIGNS.push(s); LA_BYCP[s.cp] = s; if (s.kind === 'syl') LA_VALUES[v] = s;
  });
  function laSign(x) { x = String(x || '').trim(); if (LA_VALUES[x.toLowerCase()]) return LA_VALUES[x.toLowerCase()]; for (var i = 0; i < LA_SIGNS.length; i++) if (LA_SIGNS[i].n === x || LA_SIGNS[i].b === x || '*' + LA_SIGNS[i].n.replace(/^A/, '') === x) return LA_SIGNS[i]; return null; }
  /* Linear A words: sure: 'accepted' (meaning widely accepted) | 'probable' | 'place' (a place name also in Linear B) |
     'unknown' (recognized because it recurs; meaning unknown). The spellings use the conventional values. */
  var LA_WORDS = {
    'ku-ro': { en: 'total', sure: 'accepted', note: 'It stands before a number equal to the sum of the list above it, so it is widely accepted to mean "total".' },
    'ki-ro': { en: 'meaning uncertain (perhaps an amount owed or missing)', sure: 'unknown', note: 'Recurs in lists before numbers; what it means is not agreed.' },
    'po-to-ku-ro': { en: 'perhaps a grand total', sure: 'probable', note: 'Seems to sum several totals; less certain than ku-ro.' },
    'pa-i-to': { en: 'Phaistos (place name)', sure: 'place', b: 'pa-i-to', note: 'Read with the Linear B values it gives the same name as Linear B pa-i-to, a sign that many values carried over.' },
    'su-ki-ri-ta': { en: 'a place name, also in Linear B', sure: 'place', b: 'su-ki-ri-ta', note: 'A Cretan place; the same spelling occurs at Knossos in Linear B.' },
    'se-to-i-ja': { en: 'a place name, also in Linear B', sure: 'place', b: 'se-to-i-ja', note: 'A Cretan place named in both scripts.' },
    'a-sa-sa-ra-me': { en: 'meaning unknown', sure: 'unknown', note: 'A word of the libation formula on stone offering tables; it also appears as ja-sa-sa-ra-me.' },
    'ja-sa-sa-ra-me': { en: 'meaning unknown', sure: 'unknown', note: 'Another form of a-sa-sa-ra-me in the libation formula.' },
    'i-pi-na-ma': { en: 'meaning unknown', sure: 'unknown', note: 'A word that recurs in the libation formula.' },
    'si-ru-te': { en: 'meaning unknown', sure: 'unknown', note: 'A word that recurs in the libation formula, often near i-pi-na-ma.' }
  };
  // more words from the tablets below
  Object.assign(WORDS, {
    'a3-ke-u': { gr: '', grl: '', en: 'a word of uncertain meaning, perhaps a name', kind: 'word', note: 'Read a3-ke-u (a3 is ai); what it means is not agreed.' },
    'o-wo-we': { gr: 'οἶος + οὖς', grl: 'oiwowes', en: 'with one handle', kind: 'word', note: 'Literally "one-eared".' },
    'a-pu': { gr: 'ἀπό', grl: 'apo', en: 'off, from', kind: 'word', note: 'Mycenaean apu.' },
    'ke-ka-u-me-no': { gr: 'κεκαυμένος', grl: 'kekaumenos', en: 'burnt', kind: 'word', note: 'The last sign is damaged.' },
    'qe-to': { gr: '', grl: '', en: 'a kind of large jar', kind: 'word', note: 'Its later Greek form is not certain.' },
    'di-pa-e': { gr: 'δέπαε', grl: 'depae', en: 'two cups', kind: 'word', note: 'The dual of di-pa.' },
    'ti-ri-o-we-e': { gr: 'τρι- + οὖς', grl: 'triowee', en: 'with three handles (of two)', kind: 'word', note: 'A dual, agreeing with di-pa-e.' }
  });

  /* TABLETS. Segments: { w: transliteration (gloss from WORDS, or en/gr here) } | { l: logogram key } | { n: number } |
     { f: fraction letter (Linear A) } | { gap: what stands there } (a placeholder) | { br: true } (a break in the clay).
     real: false marks a pattern drawn for teaching, not one actual tablet. */
  var TABLETS = {
    ta641: { id: 'PY Ta 641', site: 'pylos', shape: 'leaf', real: true, title: 'The tripod tablet',
      lines: [
        { small: true, at: 0.62, segs: [{ w: 'ke-re-a2' }, { l: '*201VAS' }, { br: true }] },
        { segs: [{ w: 'ti-ri-po-de' }, { w: 'a3-ke-u' }, { w: 'ke-re-si-jo' }, { w: 'we-ke' }, { l: '*201VAS' }, { n: 2 }, { w: 'ti-ri-po' }, { w: 'e-me' }, { w: 'po-de' }, { w: 'o-wo-we' }, { l: '*201VAS' }, { n: 1 }, { w: 'ti-ri-po' }, { w: 'ke-re-si-jo' }, { w: 'we-ke' }, { w: 'a-pu' }, { w: 'ke-ka-u-me-no' }, { br: true }] },
        { segs: [{ w: 'qe-to' }, { l: '*203VAS' }, { n: 3 }, { w: 'di-pa' }, { w: 'me-zo-e' }, { w: 'qe-to-ro-we' }, { l: '*202VAS' }, { n: 1 }, { w: 'di-pa-e' }, { w: 'me-zo-e' }, { w: 'ti-ri-o-we-e' }, { l: '*202VAS' }, { n: 2 }, { w: 'di-pa' }, { w: 'me-wi-jo' }, { w: 'qe-to-ro-we' }, { l: '*202VAS' }, { n: 1 }] },
        { segs: [{ w: 'di-pa' }, { w: 'me-wi-jo' }, { w: 'ti-ri-jo-we' }, { l: '*202VAS' }, { n: 1 }, { w: 'di-pa' }, { w: 'me-wi-jo' }, { w: 'a-no-we' }, { l: '*202VAS' }, { n: 1 }] }
      ],
      en: 'Two tripods of Cretan make, a3-ke-u (a word of unclear meaning, perhaps a name): 2. One tripod with one foot and one handle: 1. One tripod of Cretan make, burnt off at the legs: [1]. Jars (qe-to): 3. A larger cup with four handles: 1. Two larger cups with three handles: 2. A smaller cup with four handles: 1. A smaller cup with three handles: 1. A smaller cup with no handles: 1.',
      note: 'A palm-leaf tablet about 15 cm long, found by Carl Blegen\'s team at Pylos in June 1952 and cleaned and read in 1953. The scribe ran out of room and wrote ke-re-a2 ("legs") with the last tripod above the line. The words, read with Ventris\'s values, describe what the pictures show: tripods, and cups with four, three or no handles. Transliteration as in Wikipedia, "PY Ta 641".' },
    tn316: { id: 'PY Tn 316 (extract)', site: 'pylos', shape: 'page', real: true, title: 'Gold vessels for the gods',
      lines: [
        { segs: [{ w: 'di-we' }, { l: 'AUR' }, { l: '*213VAS' }, { n: 1 }, { l: 'VIR' }, { n: 1 }] },
        { segs: [{ w: 'e-ra' }, { l: 'AUR' }, { l: '*213VAS' }, { n: 1 }, { l: 'MUL' }, { n: 1 }] },
        { segs: [{ w: 'di-ri-mi-jo' }, { w: 'di-wo' }, { w: 'i-je-we' }, { l: 'AUR' }, { l: '*213VAS' }, { n: 1 }] }
      ],
      en: 'To Zeus: a gold bowl, 1; a man, 1. To Hera: a gold bowl, 1; a woman, 1. To Drimios, the son of Zeus: a gold bowl, 1.',
      note: 'Three entries from the back of a page-shaped tablet from Pylos that lists offerings at several shrines. Whether the men and women were offered as sacrifices or given to serve the gods is debated; the tablet does not say. This extract shows the entries only, laid out one to a line.' },
    horses: { id: 'Knossos horse tablets (pattern)', site: 'knossos', shape: 'leaf', real: false, title: 'Horses and foals at Knossos',
      lines: [{ segs: [{ w: 'i-qo' }, { l: 'EQU' }, { n: 2 }, { w: 'po-ro' }, { l: 'EQU' }, { n: 2 }] }],
      en: 'Horses: 2. Foals: 2.',
      note: 'Knossos tablets count horses with the horse sign. Read with Ventris\'s values, the words written beside it give i-qo (hippos, horse) and po-ro (polos, foal). This line shows the pattern with made-up numbers; it is not one particular tablet.' },
    sheep: { id: 'The Knossos sheep tablets (pattern)', site: 'knossos', shape: 'leaf', real: false, title: 'A flock at Phaistos',
      lines: [{ segs: [{ gap: 'a shepherd\'s name' }, { w: 'pa-i-to' }, { l: 'OVISm' }, { n: 100 }] }],
      en: '(A shepherd), at Phaistos: rams, 100.',
      note: 'Hundreds of Knossos tablets record flocks of sheep this way: a man\'s name, a place, the sheep sign marked male or female, and a number. This line shows the pattern; it is not one particular tablet.' },
    kuro: { id: 'A Linear A list (pattern)', site: 'triada', shape: 'page', real: false, script: 'A', title: 'A list with its total',
      lines: [
        { segs: [{ gap: 'a word' }, { n: 10 }] }, { segs: [{ gap: 'a word' }, { n: 5 }] }, { segs: [{ gap: 'a word' }, { n: 3 }, { f: 'J' }] },
        { segs: [{ gap: 'a word' }, { n: 1 }, { f: 'J' }] }, { segs: [{ w: 'ku-ro' }, { n: 20 }] }
      ],
      en: '10 + 5 + 3½ + 1½ = 20: the line with ku-ro gives the total.',
      note: 'The pattern of many Hagia Triada tablets: words (names or goods, unread) with numbers, then ku-ro and their sum. The words are left blank here because no one can read them; the arithmetic is what shows that ku-ro means "total".' },
    libation: { id: 'Words of the libation formula', site: 'iouktas', shape: 'table', real: false, script: 'A', title: 'Words on stone offering tables',
      lines: [{ segs: [{ w: 'a-sa-sa-ra-me' }, { gap: '…' }, { w: 'i-pi-na-ma' }, { w: 'si-ru-te' }] }],
      en: 'Meanings unknown.',
      note: 'Stone libation tables from peak sanctuaries such as Mount Iouktas carry versions of one formula. These recurring words, read with the borrowed values, are shown here as a set; they do not reproduce one inscription. We can say which words recur and in what order; we cannot say what they mean.' }
  };

  /* time: Aegean periods and the scripts (approximate; pm = uncertainty in years either way) */
  var PERIODS = [
    { key: 'em', name: 'Early Minoan', from: -3100, to: -2100, pm: 100, row: 0, note: 'Crete in the Early Bronze Age: villages and towns, before the palaces.' },
    { key: 'mm', name: 'Middle Minoan', from: -2100, to: -1600, pm: 50, row: 0, note: 'The first palaces are built on Crete, and writing begins.' },
    { key: 'lm', name: 'Late Minoan', from: -1600, to: -1100, pm: 50, row: 0, note: 'The second palaces at their height, then Mycenaean rule at Knossos, then decline.' },
    { key: 'proto', name: 'First palaces', from: -1900, to: -1700, pm: 50, row: 1, note: 'The Protopalatial period: palaces at Knossos, Phaistos and Malia, destroyed around 1700 BC and rebuilt.' },
    { key: 'neo', name: 'Second palaces', from: -1700, to: -1450, pm: 50, row: 1, note: 'The Neopalatial period: Minoan Crete at its height, ending with widespread destructions around 1450 BC.' },
    { key: 'lh', name: 'Mycenaean (Late Helladic)', from: -1600, to: -1100, pm: 50, row: 2, note: 'The mainland\'s Late Bronze Age, from the shaft graves of Mycenae to the end of the palaces and after.' },
    { key: 'mpal', name: 'Mycenaean palaces', from: -1400, to: -1200, pm: 30, row: 3, note: 'Palace states at Mycenae, Pylos, Thebes, Tiryns and elsewhere, run with Linear B records.' }
  ];
  var SCRIPTS = [
    { key: 'ch', name: 'Cretan hieroglyphs', from: -2100, to: -1700, pm: 100, note: 'Mostly on seals; still unread. Some date its end later, around 1600 BC.' },
    { key: 'la', name: 'Linear A', from: -1800, to: -1450, pm: 50, note: 'The Minoan script. After about 1450 BC it is no longer used for records, though a few later inscriptions exist.' },
    { key: 'lb', name: 'Linear B', from: -1450, to: -1200, pm: 50, note: 'Mycenaean Greek. Its earliest date, at Knossos, is debated; it ends with the mainland palaces around 1200 BC.' },
    { key: 'cm', name: 'Cypro-Minoan', from: -1550, to: -1050, pm: 50, note: 'The script of Bronze Age Cyprus, probably adapted from Linear A; still unread.' },
    { key: 'cs', name: 'Cypriot syllabary', from: -1050, to: -300, pm: 100, note: 'A syllabary that wrote Greek on Cyprus from about the 11th to the 4th century BC, thought to descend from Cypro-Minoan. It was read in the 1870s with the help of a Phoenician and Greek bilingual from Idalion.' },
    { key: 'ga', name: 'Greek alphabet', from: -800, to: 2000, pm: 50, note: 'Borrowed from the Phoenician letters, with vowels added, around 800 BC; still in use.' }
  ];
  var EVENTS = [
    { key: 'thera', y: -1600, pm: 50, name: 'Thera erupts', note: 'The eruption buried the town of Akrotiri. Its date is debated: radiocarbon points to about 1600 BC, older archaeological dating to about 1500 BC.' },
    { key: 'lm1b', y: -1450, pm: 25, name: 'Cretan palaces destroyed', note: 'Destructions across Crete around 1450 BC; afterward Knossos is run in Greek, with Linear B.' },
    { key: 'iklaina', y: -1375, pm: 25, name: 'Iklaina tablet', note: 'The earliest Linear B tablet from the mainland, from about 1400 to 1350 BC.' },
    { key: 'knossos', y: -1375, pm: 75, name: 'Knossos archive burns', note: 'Most scholars date the fire that baked the Knossos tablets to the 14th century BC; some argue it came about 1200 BC. The question is still debated.' },
    { key: 'pylos', y: -1200, pm: 20, name: 'Pylos burns', note: 'The palace of Pylos burned around 1200 BC, baking about a thousand tablets.' },
    { key: 'end', y: -1180, pm: 30, name: 'End of the palaces', note: 'The mainland palaces are destroyed or abandoned, and Linear B goes out of use.' },
    { key: 'alphabet', y: -800, pm: 50, name: 'The Greek alphabet', note: 'Greeks adapt the Phoenician letters, adding vowels.' }
  ];
  var MODERN = [
    { key: 'evans', y: 1900, name: 'Evans digs at Knossos', note: 'From March 1900 Arthur Evans excavates Knossos and finds thousands of tablets.' },
    { key: 'scripta1', y: 1909, name: 'Scripta Minoa I', note: 'Evans publishes the Cretan scripts; most Linear B tablets stay unpublished for decades.' },
    { key: 'blegen', y: 1939, name: 'Blegen finds the Pylos archive', note: 'Carl Blegen finds the archive room at Pylos on the first day of digging.' },
    { key: 'kober', y: 1945, name: 'Kober\'s triplets', note: 'In papers of 1945 to 1948 Alice Kober shows that Linear B words change their endings and which signs must share a consonant or a vowel. She died in May 1950.' },
    { key: 'bennett', y: 1951, name: 'Bennett\'s Pylos Tablets', note: 'Emmett Bennett publishes the Pylos tablets with a standard sign list.' },
    { key: 'ventris', y: 1952, name: 'Ventris: it is Greek', note: 'On 1 July 1952 Michael Ventris announces on BBC radio that Linear B writes Greek.' },
    { key: 'article', y: 1953, name: 'The 1953 article', note: 'Ventris and John Chadwick publish "Evidence for Greek Dialect in the Mycenaean Archives".' },
    { key: 'tripod', y: 1953.4, name: 'The tripod tablet', note: 'Blegen reads Ta 641 with Ventris\'s values and writes to him in May 1953 that the words match the pictures.' },
    { key: 'documents', y: 1956, name: 'Documents in Mycenaean Greek', note: 'Ventris and Chadwick\'s book appears in 1956; Ventris dies in a road accident that September.' }
  ];

  /* places: lat, lon (degrees), scripts found there: CH Cretan hieroglyphs, A Linear A, B Linear B, CM Cypro-Minoan */
  var SITES = [
    { key: 'knossos', name: 'Knossos', lat: 35.298, lon: 25.163, region: 'crete', scripts: ['CH', 'A', 'B'], note: 'The largest palace of Crete. About 4,000 Linear B tablets, the biggest archive; also Linear A and Cretan hieroglyphs.' },
    { key: 'phaistos', name: 'Phaistos', lat: 35.051, lon: 24.814, region: 'crete', scripts: ['A'], note: 'A palace in southern Crete; Linear A documents. Named pa-i-to in Linear B.' },
    { key: 'triada', name: 'Hagia Triada', lat: 35.059, lon: 24.792, region: 'crete', scripts: ['A'], note: 'Near Phaistos. The largest Linear A archive: 147 tablets and over a thousand sealed documents.' },
    { key: 'malia', name: 'Malia', lat: 35.293, lon: 25.495, region: 'crete', scripts: ['CH', 'A'], note: 'A palace on the north coast, with many Cretan hieroglyphic documents.' },
    { key: 'zakros', name: 'Zakros', lat: 35.098, lon: 26.262, region: 'crete', scripts: ['A'], note: 'A palace in the far east of Crete; many Linear A documents.' },
    { key: 'palaikastro', name: 'Palaikastro', lat: 35.195, lon: 26.257, region: 'crete', scripts: ['A'], note: 'A Minoan town in eastern Crete with Linear A finds.' },
    { key: 'chania', name: 'Chania (Kydonia)', lat: 35.517, lon: 24.018, region: 'crete', scripts: ['A', 'B'], note: 'Ancient Kydonia. Linear A documents and a few Linear B tablets, one naming Dionysus.' },
    { key: 'iouktas', name: 'Mount Iouktas', lat: 35.233, lon: 25.123, region: 'crete', scripts: ['A'], note: 'A peak sanctuary south of Knossos, where stone libation tables with Linear A were found.' },
    { key: 'akrotiri', name: 'Akrotiri (Thera)', lat: 36.351, lon: 25.404, region: 'islands', scripts: ['A'], note: 'A town buried by the eruption of Thera, with a few Linear A inscriptions.' },
    { key: 'phylakopi', name: 'Phylakopi (Melos)', lat: 36.746, lon: 24.505, region: 'islands', scripts: ['A'], note: 'A Cycladic town where Linear A was found.' },
    { key: 'kea', name: 'Ayia Irini (Kea)', lat: 37.660, lon: 24.330, region: 'islands', scripts: ['A'], note: 'An island town with Linear A finds.' },
    { key: 'pylos', name: 'Pylos', lat: 37.028, lon: 21.696, region: 'mainland', scripts: ['B'], note: 'The "Palace of Nestor". About 1,000 Linear B tablets, baked when the palace burned around 1200 BC.' },
    { key: 'iklaina', name: 'Iklaina', lat: 36.995, lon: 21.745, region: 'mainland', scripts: ['B'], note: 'Near Pylos; the earliest mainland Linear B tablet, about 1400 to 1350 BC.' },
    { key: 'mycenae', name: 'Mycenae', lat: 37.731, lon: 22.756, region: 'mainland', scripts: ['B'], note: 'The citadel that gave the Mycenaeans their name; dozens of Linear B documents.' },
    { key: 'tiryns', name: 'Tiryns', lat: 37.599, lon: 22.800, region: 'mainland', scripts: ['B'], note: 'A fortified palace; Linear B tablets and inscribed jars.' },
    { key: 'midea', name: 'Midea', lat: 37.649, lon: 22.842, region: 'mainland', scripts: ['B'], note: 'A citadel near Mycenae with Linear B sealings and jars.' },
    { key: 'thebes', name: 'Thebes', lat: 38.319, lon: 23.319, region: 'mainland', scripts: ['B'], note: 'Hundreds of Linear B documents; named te-qa in the tablets.' },
    { key: 'vasileios', name: 'Agios Vasileios', lat: 36.985, lon: 22.462, region: 'mainland', scripts: ['B'], note: 'A palace in Laconia found in this century, with Linear B tablets.' },
    { key: 'volos', name: 'Kastro-Palaia (Volos)', lat: 39.362, lon: 22.935, region: 'mainland', scripts: ['B'], note: 'Linear B tablets from Thessaly, the northernmost.' },
    { key: 'enkomi', name: 'Enkomi', lat: 35.170, lon: 33.880, region: 'cyprus', scripts: ['CM'], note: 'A Late Bronze Age city on Cyprus with Cypro-Minoan tablets.' }
  ];
  var CITIES = [
    { key: 'athens', name: 'Athens', lat: 37.98, lon: 23.73 }, { key: 'heraklion', name: 'Heraklion', lat: 35.34, lon: 25.13, zoom: true },
    { key: 'troy', name: 'Troy', lat: 39.957, lon: 26.239 }, { key: 'nicosia', name: 'Nicosia', lat: 35.17, lon: 33.36, zoom: true }
  ];
  /* coasts, simplified ([lat, lon] polygons) through known capes, bays and towns; drawn for this site. Crete is good to a few
     kilometers; the mainland and Anatolia are rougher (10 km or more in places), fine for locating sites, not for navigation. */
  var GEO = {
    land: [
      // the Balkans and mainland Greece north of the Gulf of Corinth
      [[37.94, 23.0], [37.99, 23.34], [38.04, 23.53], [37.94, 23.63], [37.82, 23.78], [37.65, 24.03], [37.80, 24.05], [38.02, 24.01], [38.15, 24.02], [38.33, 23.78], [38.46, 23.6], [38.65, 23.15], [38.8, 22.85], [38.87, 22.55], [38.95, 22.85], [39.05, 22.95], [39.36, 22.94], [39.23, 23.15], [39.15, 23.3], [39.4, 23.2], [39.6, 23.0], [39.85, 22.75], [40.1, 22.6], [40.5, 22.65], [40.64, 22.94], [40.3, 23.1], [40.0, 23.4], [39.95, 23.7], [40.2, 23.9], [40.15, 24.4], [40.4, 23.95], [40.75, 23.8], [40.94, 24.4], [40.88, 25.0], [40.95, 25.5], [40.85, 25.87], [40.7, 26.05], [40.6, 26.2], [40.42, 26.4], [40.05, 26.2], [40.4, 26.68], [40.6, 27.0], [40.95, 27.5], [41.0, 28.0], [41.2, 28.8], [41.6, 29.0], [42.5, 29.0], [42.5, 18.5], [41.0, 19.4], [40.4, 19.4], [39.9, 20.0], [39.5, 20.25], [38.95, 20.75], [38.8, 21.05], [38.6, 21.0], [38.37, 21.43], [38.32, 21.8], [38.39, 21.83], [38.37, 22.2], [38.43, 22.42], [38.38, 22.63], [38.2, 22.9], [38.05, 23.0], [37.98, 22.98]],
      // the Peloponnese
      [[37.94, 22.93], [38.02, 22.75], [38.1, 22.55], [38.17, 22.3], [38.25, 22.08], [38.3, 21.79], [38.25, 21.73], [38.16, 21.55], [38.17, 21.38], [38.05, 21.3], [37.93, 21.13], [37.8, 21.22], [37.65, 21.32], [37.45, 21.55], [37.25, 21.67], [37.05, 21.62], [36.91, 21.67], [36.82, 21.7], [36.8, 21.96], [37.0, 22.04], [37.02, 22.11], [36.8, 22.3], [36.6, 22.38], [36.39, 22.48], [36.55, 22.5], [36.76, 22.57], [36.8, 22.7], [36.62, 22.9], [36.44, 23.2], [36.55, 23.1], [36.69, 23.06], [37.0, 22.98], [37.17, 22.86], [37.4, 22.75], [37.57, 22.8], [37.45, 23.0], [37.38, 23.25], [37.48, 23.45], [37.62, 23.35], [37.63, 23.16], [37.8, 23.08], [37.94, 22.98]],
      // Euboea
      [[39.02, 23.1], [39.03, 23.45], [38.85, 23.6], [38.7, 23.85], [38.55, 24.15], [38.4, 24.28], [38.2, 24.45], [38.02, 24.58], [38.05, 24.35], [38.2, 24.1], [38.4, 23.75], [38.5, 23.55], [38.7, 23.2], [38.85, 22.95]],
      // Crete (through its capes, bays and harbor towns)
      [[35.62,23.58], [35.55,23.6], [35.5,23.66], [35.58,23.7], [35.69,23.73], [35.56,23.77], [35.52,23.86], [35.52,24.02], [35.58,24.08], [35.6,24.17], [35.55,24.22], [35.48,24.2], [35.47,24.26], [35.36,24.27], [35.37,24.48], [35.42,24.68], [35.41,24.78], [35.4,24.96], [35.34,25.13], [35.33,25.22], [35.32,25.39], [35.29,25.47], [35.27,25.6], [35.3,25.72], [35.24,25.73], [35.19,25.72], [35.11,25.8], [35.15,25.92], [35.21,26.1], [35.27,26.22], [35.31,26.31], [35.2,26.29], [35.1,26.27], [35.0,26.2], [34.95,26.15], [35.01,25.95], [35.0,25.74], [35.0,25.58], [34.98,25.29], [34.93,25.05], [34.93,24.81], [34.92,24.72], [34.99,24.74], [35.06,24.75], [35.1,24.69], [35.19,24.4], [35.18,24.23], [35.2,24.14], [35.23,23.96], [35.25,23.81], [35.23,23.68], [35.27,23.54], [35.4,23.56], [35.5,23.57]],
      // Anatolia and the Levant coast
      [[40.3, 26.75], [40.15, 26.4], [39.95, 26.15], [39.75, 26.1], [39.48, 26.08], [39.58, 26.6], [39.6, 26.95], [39.35, 26.7], [39.25, 26.85], [38.95, 26.95], [38.7, 26.75], [38.6, 26.85], [38.42, 27.14], [38.35, 26.75], [38.4, 26.4], [38.3, 26.28], [38.15, 26.5], [38.1, 26.95], [37.86, 27.26], [37.65, 27.05], [37.5, 27.25], [37.2, 27.25], [37.03, 27.43], [37.0, 27.8], [36.69, 27.37], [36.75, 27.8], [36.85, 28.27], [36.7, 28.7], [36.62, 29.1], [36.3, 29.25], [36.2, 29.64], [36.4, 30.1], [36.3, 30.4], [36.7, 30.55], [36.88, 30.7], [36.8, 31.4], [36.54, 32.0], [36.1, 32.6], [36.02, 32.8], [36.2, 33.6], [36.4, 34.0], [36.8, 34.6], [36.6, 36.2], [36.2, 35.95], [35.8, 35.85], [35.0, 35.9], [34.4, 35.85], [33.5, 35.4], [33.5, 37.0], [42.5, 37.0], [42.5, 29.5], [41.2, 29.3], [40.9, 29.0], [40.6, 27.9], [40.45, 27.1]],
      // Cyprus
      [[35.1, 32.27], [35.2, 32.6], [35.2, 32.99], [35.34, 33.32], [35.4, 33.8], [35.55, 34.2], [35.7, 34.58], [35.42, 34.1], [35.25, 33.95], [35.12, 33.94], [34.97, 33.95], [34.92, 33.63], [34.7, 33.2], [34.68, 33.04], [34.57, 32.95], [34.65, 32.8], [34.7, 32.55], [34.77, 32.42], [34.95, 32.3]],
      // Rhodes and Kythera
      [[36.46, 28.22], [36.35, 28.17], [36.2, 28.1], [36.0, 27.95], [35.88, 27.77], [35.95, 27.7], [36.15, 27.75], [36.35, 27.9], [36.45, 28.12]],
      [[36.38, 22.95], [36.3, 23.08], [36.15, 23.05], [36.15, 22.92], [36.3, 22.92]]
    ],
    // smaller islands as ellipses: [lat, lon, half-height in degrees of latitude, half-width in degrees of longitude, tilt]
    isles: [[37.05, 25.47, 0.11, 0.1, 0], [37.07, 25.15, 0.07, 0.07, 0], [37.85, 24.85, 0.12, 0.06, -35], [37.6, 25.15, 0.05, 0.09, -30], [37.45, 25.36, 0.04, 0.06, 0],
      [37.62, 24.33, 0.07, 0.05, 0], [36.7, 24.42, 0.06, 0.1, 0], [36.41, 25.43, 0.07, 0.04, 0], [37.43, 24.92, 0.06, 0.03, 0], [36.73, 25.33, 0.05, 0.05, 0],
      [36.83, 25.9, 0.04, 0.1, 25], [36.97, 24.7, 0.05, 0.03, 0], [37.15, 24.48, 0.04, 0.04, 0], [37.4, 24.42, 0.06, 0.03, 0], [37.73, 23.48, 0.04, 0.05, 0],
      [37.9, 23.45, 0.05, 0.06, 0], [39.15, 26.3, 0.18, 0.3, -10], [38.38, 26.0, 0.2, 0.11, 0], [37.73, 26.8, 0.07, 0.2, 0], [36.85, 27.15, 0.05, 0.17, 10],
      [35.6, 27.13, 0.2, 0.06, 0], [39.9, 25.25, 0.1, 0.15, 0], [40.68, 24.65, 0.09, 0.1, 0], [40.48, 25.55, 0.05, 0.08, 0], [38.25, 20.55, 0.2, 0.13, 20],
      [37.78, 20.8, 0.12, 0.1, -20], [39.6, 19.85, 0.3, 0.1, -30], [38.7, 20.65, 0.1, 0.06, 0], [38.87, 24.55, 0.08, 0.1, 0], [37.6, 26.15, 0.05, 0.18, -10],
      [36.58, 26.35, 0.06, 0.08, 0], [35.4, 26.92, 0.04, 0.06, 0], [34.84, 24.08, 0.03, 0.04, 0]],
    seas: [{ name: 'Aegean Sea', lat: 38.6, lon: 25.0 }, { name: 'Sea of Crete', lat: 35.9, lon: 25.0 }, { name: 'Ionian Sea', lat: 37.3, lon: 20.3 }, { name: 'Mediterranean', lat: 34.2, lon: 27.5 }],
    regions: [{ name: 'CRETE', lat: 35.12, lon: 24.35 }, { name: 'PELOPONNESE', lat: 37.5, lon: 22.1 }, { name: 'ANATOLIA', lat: 38.6, lon: 28.6 }, { name: 'CYCLADES', lat: 37.3, lon: 25.8 }, { name: 'CYPRUS', lat: 34.9, lon: 33.1 }]
  };
  var VIEWS = { aegean: [34.5, 41.2, 19.8, 29.2], crete: [34.75, 35.75, 23.4, 26.5], mainland: [36.3, 39.6, 20.9, 24.4], wide: [33.9, 41.4, 19.8, 35.2] };
  /* ---------------------------------------------------------------- reading transliteration */
  function normTok(s) { return String(s).replace(/[₁₂₃]/g, function (d) { return { '₁': '1', '₂': '2', '₃': '3' }[d]; }); }
  /* parse(text, script) -> tokens: { t: 'syl', tl, u, sign } | { t: 'logo', tl, u, logo } | { t: 'num', tl, u, n } |
     { t: 'frac', tl, u, frac } | { t: 'div' } | { t: 'sp' } (a word break) | { t: 'break' } | { t: 'bad', tl } */
  function parse(text, script) {
    var A = script === 'A', out = [];
    String(text || '').replace(/[,;]/g, ' | ').split(/\s+/).filter(Boolean).forEach(function (w, wi) {
      if (wi && out.length && out[out.length - 1].t !== 'div' && out[out.length - 1].t !== 'sp') out.push({ t: 'sp' });
      if (w === '|' || w === '/') { if (out.length && out[out.length - 1].t === 'sp') out.pop(); out.push({ t: 'div' }); return; }
      if (/^[\[\]]+$/.test(w)) { out.push({ t: 'break' }); return; }
      if (/^\d+$/.test(w)) { var n = +w; out.push({ t: 'num', tl: w, n: n, u: num(n) }); return; }
      var L = logo(w); if (L && !A) { out.push({ t: 'logo', tl: L.key, u: L.u, logo: L }); return; }
      if (A) { var fr = fraction(w.toUpperCase()) || fraction(w); if (fr && (/^[A-Z]$/.test(w) || /\//.test(w))) { out.push({ t: 'frac', tl: fr.k, u: fr.u, frac: fr }); return; } }
      var brk = /^\[/.test(w), brk2 = /\]$/.test(w);
      w = w.replace(/^\[|\]$/g, '');
      if (brk) out.push({ t: 'break' });
      w.split('-').filter(Boolean).forEach(function (syl) {
        var v = normTok(syl).toLowerCase(), S = null;
        if (A) { S = laSign(v) || (/^\*?301$/.test(v) ? laSign('A301') : null); }
        else S = sign(v);
        if (S) out.push({ t: 'syl', tl: A ? (S.kind === 'syl' ? S.v : '*' + S.n.replace(/^A/, '')) : (S.v || S.n), u: S.u, sign: S });
        else out.push({ t: 'bad', tl: syl });
      });
      if (brk2) out.push({ t: 'break' });
    });
    return out;
  }
  function toSigns(text, script, opt) {
    opt = opt || {};
    return parse(text, script).map(function (t) {
      if (t.t === 'sp') return opt.divider ? '\u{10100}' : ' ';
      if (t.t === 'div') return '\u{10100}';
      if (t.t === 'break') return '';
      if (t.t === 'bad') return '';
      return t.u + (t.t === 'logo' || t.t === 'num' ? ' ' : '');
    }).join('').replace(/ +/g, ' ').trim();
  }
  // toTranslit(str, script): Unicode signs (and spaces, word dividers) -> 'ti-ri-po' style
  function toTranslit(str, script) {
    var words = [], cur = [], numAcc = '';
    function flushNum() { if (numAcc) { var v = numValue(numAcc); if (v !== null) cur.push({ k: 'n', s: String(v) }); numAcc = ''; } }
    function flush() { flushNum(); if (cur.length) words.push(cur); cur = []; }
    Array.from(String(str || '')).forEach(function (ch) {
      var cp = ch.codePointAt(0);
      if (/\s/.test(ch) || cp === 0x10100 || cp === 0x10101) { flush(); if (cp === 0x10100) words.push('|'); return; }
      if (numValue(ch) !== null) { numAcc += ch; return; }
      flushNum();
      var S = null, i;
      if (cp >= 0x10600 && cp < 0x10780) { S = LA_BYCP[cp]; if (S) { if (S.kind === 'frac') { flush(); words.push([{ k: 'f', s: S.n }]); return; } cur.push({ k: 's', s: S.kind === 'syl' ? S.v : S.kind === 'logo' ? S.n : '*' + S.n.replace(/^A/, '') }); return; } }
      for (i = 0; i < SIGNS.length; i++) if (SIGNS[i].cp === cp) { S = SIGNS[i]; break; }
      if (S) { cur.push({ k: 's', s: S.v || S.n }); return; }
      for (var k in LOGO) if (LOGO[k].cp === cp) { flush(); words.push([{ k: 'l', s: k }]); return; }
      cur.push({ k: 's', s: '?' });
    });
    flush();
    return words.map(function (w) { return w === '|' ? '|' : w.map(function (x) { return x.s; }).join(w.length && w[0].k === 's' ? '-' : ' '); }).join(' ').replace(/ \| /g, ' | ');
  }

  /* ---------------------------------------------------------------- places and dates */
  var LAT0 = 37.5, KM = 111.32;
  function project(lat, lon) { return [lon * Math.cos(LAT0 * Math.PI / 180) * KM, -lat * KM]; }
  function km(a, b) {
    var R = 6371, f1 = a.lat * Math.PI / 180, f2 = b.lat * Math.PI / 180, df = f2 - f1, dl = (b.lon - a.lon) * Math.PI / 180;
    var h = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function site(k) { for (var i = 0; i < SITES.length; i++) if (SITES[i].key === k) return SITES[i]; return null; }
  function year(y, c) { if (y === undefined || y === null || isNaN(y)) return ''; y = Math.round(y); var s = y < 0 ? (-y) + ' BC' : 'AD ' + y; return (c && y < 0 ? 'c. ' : '') + s; }
  function span(a, b, c) {
    if (a === b) return year(a, c);
    var pre = c && a < 0 ? 'c. ' : '';
    if (a < 0 && b < 0) return pre + (-a) + '–' + (-b) + ' BC';
    if (a >= 0 && b >= 0) return 'AD ' + a + '–' + b;
    return pre + (-a) + ' BC–AD ' + b;
  }
  function tablet(k) { return TABLETS[k] || null; }
  function item(k) { var all = PERIODS.concat(SCRIPTS, EVENTS, MODERN); for (var i = 0; i < all.length; i++) if (all[i].key === k) return all[i]; return null; }
  function pick(arr, n, rand) { rand = rand || Math.random; var a = arr.slice(), out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(rand() * a.length), 1)[0]); return out; }

  ML.scripts = {
    VOWELS: VOWELS, ROWS: ROWS, ROW_NOTE: ROW_NOTE, SIGNS: SIGNS, VALUES: VALUES, sign: sign, gridCell: gridCell,
    LOGO: LOGO, logo: logo, num: num, numParts: numParts, numValue: numValue, MEASURES: MEASURES, measureIn: measureIn,
    FRACTIONS: FRACTIONS, fraction: fraction, WORDS: WORDS, word: word, wordsWith: wordsWith, RULES: RULES, spell: spell,
    parse: parse, toSigns: toSigns, toTranslit: toTranslit, LA_SIGNS: LA_SIGNS, LA_VALUES: LA_VALUES, laSign: laSign, LA_WORDS: LA_WORDS,
    TABLETS: TABLETS, tablet: tablet, PERIODS: PERIODS, SCRIPTS: SCRIPTS, EVENTS: EVENTS, MODERN: MODERN, item: item,
    SITES: SITES, site: site, CITIES: CITIES, GEO: GEO, VIEWS: VIEWS, project: project, km: km, year: year, span: span, pick: pick, ADV: ADV
  };
  /* =====================================================================================================================
     THE VISUALS (need math/viz/core.js and a document)
     ===================================================================================================================== */
  if (!ML.viz || !D) return;
  var V = ML.viz, M = Math, SC = ML.scripts;
  var NS = 'http://www.w3.org/2000/svg';
  function h(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, at, parent) { var e = D.createElementNS(NS, tag); if (at) for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function btn(parent, text, fn, cls) { var b = h('button', 'ml-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; if (fn) b.addEventListener('click', fn); if (parent) parent.appendChild(b); return b; }
  var uidN = 0; function uid(p) { return 'scv-' + (p || 'x') + '-' + (++uidN); }
  function okMark(good) { return '<span class="' + (good ? 'scv-ok' : 'scv-bad') + '">' + (good ? '✓' : '✗') + '</span>'; }
  function seeded(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function shuffle(a, key) { var r = seeded(String(key)), b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function derange(a, key) { for (var t = 0; t < 30; t++) { var s = shuffle(a, key + '#' + t); if (a.length < 2 || s.some(function (v, j) { return v !== a[j]; })) return s; } return a.slice(1).concat([a[0]]); }
  function letter(i) { return String.fromCharCode(65 + i); }
  function svgRoot(w, hh, label, cls) { return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, class: 'scv-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label || '', focusable: 'false' }); }
  function txt(parent, x, y, s, at) { var t = sv('text', Object.assign({ x: x, y: y }, at || {}), parent); t.textContent = s; return t; }
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
  function onResize(e, fn) { if ('ResizeObserver' in W) { var last = -1; new ResizeObserver(function () { var w = e.clientWidth; if (w && w !== last) { last = w; fn(); } }).observe(e); } else W.addEventListener('resize', fn); }
  function tl(s) { return '<span class="sc-tl">' + esc(s) + '</span>'; }
  function glyph(s, A) { return '<span class="' + (A ? 'sc-a' : 'sc-b') + '">' + esc(s) + '</span>'; }
  function grk(s) { return s ? '<span class="sc-gr" lang="grc">' + esc(s) + '</span>' : ''; }
  function adv(u) { var cp = u.codePointAt(0); return SC.ADV[cp.toString(16).toUpperCase()] || 0.7; }
  function signInfo(S, A) {
    if (!S) return '';
    if (A) {
      if (S.kind === 'syl') return '<b>' + esc(S.n) + '</b> (Linear B ' + esc(S.b) + '): read by convention as ' + tl(S.v) + ', the value its look-alike has in Linear B. The sound in Minoan is a guess.';
      if (S.kind === 'frac') return '<b>Fraction sign ' + esc(S.n) + '</b>';
      if (S.kind === 'logo') return '<b>' + esc(S.n) + '</b>: a logogram (' + esc(S.v) + ').';
      return '<b>*' + esc(S.n.replace(/^A/, '')) + '</b>: a Linear A sign with no Linear B look-alike; its sound is unknown.';
    }
    var ex = SC.wordsWith(S.v).slice(0, 3);
    var s = '<b>' + esc(S.n) + '</b> ';
    if (S.kind === 'grid') s += '= ' + tl(S.v) + (S.doubt ? ' (doubtful)' : '') + (S.c ? '; consonant ' + esc(SC.ROW_NOTE[S.c]) : '; a vowel alone') + '.';
    else if (S.kind === 'special') s += '= ' + tl(S.v) + ', usually read ' + esc(S.say) + '; an optional special sign.';
    else s += 'has no agreed value' + (S.prop ? ' (perhaps ' + tl(S.prop) + ')' : '') + '.';
    if (ex.length) s += ' In ' + ex.map(function (k) { return tl(k) + ' (' + esc(SC.WORDS[k].en) + ')'; }).join(', ') + '.';
    return s;
  }

  // the frame every visual shares: class, aria-label, task line, body, controls, readout, caption
  function frame(el, o, name, label) {
    el.classList.add('scv', 'scv-' + name);
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), interactive: o.interactive !== false };
    if (o.task) el.appendChild(h('p', 'scv-task', o.task));
    F.body = h('div', 'scv-body'); el.appendChild(F.body);
    F.ctl = h('div', 'ml-ctl scv-ctl'); el.appendChild(F.ctl);
    F.out = h('p', 'ml-readout scv-out'); F.out.setAttribute('aria-live', 'polite'); el.appendChild(F.out);
    F.say = function (html) { F.out.innerHTML = html || ''; F.out.hidden = !html; };
    F.say('');
    if (o.caption) el.appendChild(h('p', 'ml-cap', o.caption));
    return F;
  }
  function chip(parent, html, on, fn, label) {
    var b = h('button', 'scv-chip' + (on ? ' on' : ''), html); b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (label) b.setAttribute('aria-label', label);
    b.addEventListener('click', function () { var v = !b.classList.contains('on'); b.classList.toggle('on', v); b.setAttribute('aria-pressed', v ? 'true' : 'false'); fn(v); });
    parent.appendChild(b); return b;
  }
  /* ---------------------------------------------------------------- sc-signs */
  function renderSigns(host, toks, o, F, A) {
    host.innerHTML = '';
    var asks = [].concat(o.ask === undefined ? [] : o.ask), hl = [].concat(o.highlight || []);
    var row = h('div', 'scs-row' + (A ? ' scs-a' : '')), grp = h('span', 'scs-word'), idx = 0, cells = [];
    row.style.setProperty('--scs', (o.size || 64) + 'px');
    row.appendChild(grp);
    toks.forEach(function (t) {
      if (t.t === 'sp' || t.t === 'div') { grp = h('span', 'scs-word'); if (t.t === 'div' || o.dividers) { var d = h('span', 'scs-div sc-b', '\u{10100}'); d.setAttribute('aria-hidden', 'true'); row.appendChild(d); } row.appendChild(grp); return; }
      if (t.t === 'break') { var b = h('span', 'scs-break', '['); b.title = 'a break in the clay'; grp.appendChild(b); return; }
      if (t.t === 'bad') { grp.appendChild(h('span', 'scs-bad', esc(t.tl))); return; }
      var i = idx++, asked = asks.indexOf(i) >= 0;
      var c = h(F.interactive && !F.quiet ? 'button' : 'span', 'scs-cell scs-' + t.t + (hl.indexOf(i) >= 0 ? ' on' : '') + (asked ? ' ask' : ''));
      if (c.tagName === 'BUTTON') c.type = 'button';
      var g = h('span', 'scs-g ' + (A && t.t !== 'num' ? 'sc-a' : 'sc-b'), esc(t.u)); c.appendChild(g);
      var lab = t.t === 'num' ? t.tl : t.t === 'logo' ? t.tl : t.t === 'frac' ? t.tl : t.tl;
      if (o.number) c.appendChild(h('span', 'scs-num', String(i + 1)));
      if (o.tl !== false) c.appendChild(h('span', 'scs-v' + (t.t === 'logo' ? ' scs-lv' : ''), asked ? '?' : F.quiet ? '' : esc(lab)));
      c.setAttribute('aria-label', 'sign ' + (i + 1) + (F.quiet || asked ? '' : ': ' + lab));
      if (c.tagName === 'BUTTON') c.addEventListener('click', function () {
        cells.forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on');
        if (t.t === 'syl') F.say(signInfo(t.sign, A));
        else if (t.t === 'logo') F.say('<b>' + esc(t.logo.key) + '</b> (' + esc(t.logo.n) + '): a ' + (t.logo.kind === 'measure' ? 'measure sign' : 'logogram') + ', ' + esc(t.logo.en) + '. It is not read as a syllable.');
        else if (t.t === 'num') F.say('The number ' + t.n + ': ' + SC.numParts(t.n).map(function (p) { return p.count + ' × ' + p.place; }).join(' + ') + '.');
        else if (t.t === 'frac') F.say('Fraction sign ' + esc(t.frac.k) + ': ' + (t.frac.val ? 'proposed value ' + esc(t.frac.num) + ' (' + esc(t.frac.sure) + ')' : 'value unknown') + '.');
      });
      grp.appendChild(c); cells.push(c);
    });
    host.appendChild(row);
    return cells;
  }
  V.register('sc-signs', function (el, o) {
    o = o || {};
    if (o.mode === 'name') return nameWriter(el, o);
    if (o.mode === 'type') return typer(el, o);
    var A = o.script === 'A' || !!o.la;
    var F = frame(el, o, 'signs', A ? 'A word in Linear A' : 'A word in Linear B');
    var text = o.la || o.word || o.text || 'ti-ri-po', W0 = A ? SC.LA_WORDS[o.la || text] : SC.WORDS[o.word || text];
    var toks = SC.parse(text, A ? 'A' : 'B');
    var host = h('div', 'scs-host'); F.body.appendChild(host);
    renderSigns(host, toks, o, F, A);
    var lines = o.lines || ['tl', 'gr', 'en'];
    if (!F.quiet && W0) {
      var L = h('div', 'scs-lines');
      if (lines.indexOf('tl') >= 0 && o.tl !== false) L.appendChild(h('p', '', '<span class="scs-k">' + (A ? 'Read by convention' : 'Transliteration') + '</span> ' + tl(text)));
      if (!A && lines.indexOf('gr') >= 0 && W0.gr) L.appendChild(h('p', '', '<span class="scs-k">Later Greek</span> ' + grk(W0.gr) + (W0.grl ? ' <i>' + esc(W0.grl) + '</i>' : '')));
      if (lines.indexOf('en') >= 0) L.appendChild(h('p', '', '<span class="scs-k">' + (A ? 'Meaning' : 'English') + '</span> ' + esc(W0.en) + (A && W0.sure ? ' <span class="scs-sure scs-' + W0.sure + '">' + esc({ accepted: 'widely accepted', probable: 'probable', place: 'place name', unknown: 'unknown' }[W0.sure]) + '</span>' : '')));
      if (W0.note && o.note !== false) L.appendChild(h('p', 'scs-note', esc(W0.note)));
      F.body.appendChild(L);
    }
    if (o.breakdown && !F.quiet) {
      var tb = h('table', 'scs-tab'), hd = '<thead><tr><th>Sign</th><th>Number</th><th>' + (A ? 'Conventional value' : 'Value') + '</th><th>Note</th></tr></thead><tbody>';
      toks.forEach(function (t) {
        if (t.t === 'syl') {
          var S = t.sign, note = A ? (S.kind === 'syl' ? 'Linear B ' + S.b + ' = ' + S.v : 'no Linear B match') : S.kind === 'grid' ? (S.c ? 'consonant ' + SC.ROW_NOTE[S.c] : 'vowel') : S.kind === 'special' ? 'special sign, read ' + S.say : 'value not agreed';
          hd += '<tr><td>' + glyph(t.u, A) + '</td><td>' + esc(S.n) + '</td><td>' + tl(A && S.kind !== 'syl' ? '*' + S.n.replace(/^A/, '') : S.v || S.n) + '</td><td>' + esc(note) + '</td></tr>';
        } else if (t.t === 'logo') hd += '<tr><td>' + glyph(t.u) + '</td><td>' + esc(t.logo.n) + '</td><td>' + esc(t.logo.key) + '</td><td>logogram: ' + esc(t.logo.en) + '</td></tr>';
        else if (t.t === 'num') hd += '<tr><td>' + glyph(t.u) + '</td><td>number</td><td>' + t.n + '</td><td>' + SC.numParts(t.n).map(function (p) { return p.count + ' × ' + p.place; }).join(' + ') + '</td></tr>';
        else if (t.t === 'frac') hd += '<tr><td>' + glyph(t.u, true) + '</td><td>fraction</td><td>' + esc(t.frac.k) + '</td><td>' + esc(t.frac.num + ' (' + t.frac.sure + ')') + '</td></tr>';
      });
      tb.innerHTML = hd + '</tbody>';
      var wrap = h('div', 'scv-tabwrap'); wrap.appendChild(tb); F.body.appendChild(wrap);
    }
    return {};
  });

  /* the name writer: a modern game played with the real spelling rules */
  function nameWriter(el, o) {
    var F = frame(el, o, 'signs', 'Write a name in Linear B');
    var row = h('div', 'scs-namebar'), lab = h('label', 'scs-namel', 'Your name ');
    var inp = h('input', 'scs-in'); inp.type = 'text'; inp.maxLength = 24; inp.value = o.text || 'Teddy'; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false');
    lab.appendChild(inp); row.appendChild(lab); F.body.appendChild(row);
    var out = h('div', 'scs-host'), info = h('div', 'scs-steps'); F.body.appendChild(out); F.body.appendChild(info);
    var copyB = btn(F.ctl, 'Copy the signs', function () {
      var s = SC.spell(inp.value).u;
      try { navigator.clipboard.writeText(s).then(function () { F.say('Copied: ' + glyph(s)); }, function () { F.say('Select the signs and copy them: ' + glyph(s)); }); } catch (e) { F.say('Select the signs and copy them: ' + glyph(s)); }
    });
    function draw() {
      var r = SC.spell(inp.value);
      if (!r.parts.length) { out.innerHTML = '<p class="scv-hint">Type a name in English letters.</p>'; info.innerHTML = ''; copyB.disabled = true; return; }
      copyB.disabled = false;
      renderSigns(out, SC.parse(r.tl), { size: o.size || 72, tl: true }, { interactive: false, quiet: false, say: F.say }, false);
      var html = '<p class="scs-res">' + tl(r.tl) + '</p><table class="scs-tab"><thead><tr><th>Letters</th><th>Sign</th><th>Value</th><th>Why</th></tr></thead><tbody>';
      r.parts.forEach(function (p) { html += '<tr><td>' + esc(p.from || '·') + '</td><td>' + glyph(p.u) + '</td><td>' + tl(p.tl) + '</td><td>' + esc(p.rules.map(function (x) { return { empty: 'empty vowel', drops: 's dropped', droplr: 'r or l dropped', dropnasal: 'm or n dropped', finalstop: 'final stop', nosign: 'nearest sign' }[x]; }).filter(Boolean).join(', ') || 'consonant + vowel') + '</td></tr>'; });
      html += '</tbody></table><p class="scs-k">The rules this name used</p><ul class="scs-rules">' + r.steps.map(function (k) { return '<li>' + esc(SC.RULES[k]) + '</li>'; }).join('') + '</ul>';
      info.innerHTML = '<div class="scv-tabwrap">' + html + '</div>';
    }
    inp.addEventListener('input', draw); draw();
    F.say('');
    return {};
  }

  /* the typing helper: transliteration to signs and back */
  function typer(el, o) {
    var F = frame(el, o, 'signs', 'Linear B typing helper');
    var A = o.script === 'A';
    var bar = h('div', 'scs-typebar');
    var seg = V.seg(bar, { label: 'Script', items: [['B', 'Linear B'], ['A', 'Linear A']], value: A ? 'A' : 'B', change: function (v) { A = v === 'A'; go(); goBack(); } });
    var divLab = h('label', 'scs-chk'), divC = h('input'); divC.type = 'checkbox'; divLab.appendChild(divC); divLab.appendChild(D.createTextNode(' Word dividers')); bar.appendChild(divLab);
    F.body.appendChild(bar);
    var l1 = h('label', 'scs-tlab', 'Transliteration (syllables joined by hyphens)'), t1 = h('textarea', 'scs-ta'); t1.rows = 2; t1.value = o.text || 'ti-ri-po *201VAS 2 di-pa me-zo-e'; t1.setAttribute('spellcheck', 'false'); l1.appendChild(t1);
    var outS = h('div', 'scs-out sc-b'); outS.setAttribute('aria-live', 'polite');
    var l2 = h('label', 'scs-tlab', 'Or paste signs to read them'), t2 = h('textarea', 'scs-ta sc-b scs-tasig'); t2.rows = 2; t2.setAttribute('spellcheck', 'false'); l2.appendChild(t2);
    var outT = h('div', 'scs-outt sc-tl');
    F.body.appendChild(l1); F.body.appendChild(outS); F.body.appendChild(l2); F.body.appendChild(outT);
    var bad = h('p', 'scv-hint'); F.body.appendChild(bad);
    function go() {
      var toks = SC.parse(t1.value, A ? 'A' : 'B'), miss = toks.filter(function (t) { return t.t === 'bad'; }).map(function (t) { return t.tl; });
      var s = SC.toSigns(t1.value, A ? 'A' : 'B', { divider: divC.checked });
      outS.className = 'scs-out ' + (A ? 'sc-a' : 'sc-b'); outS.textContent = s || ' ';
      bad.innerHTML = miss.length ? 'Not a ' + (A ? 'Linear A' : 'Linear B') + ' value: ' + miss.map(tl).join(', ') + '. Values are written like ' + tl(A ? 'ku-ro' : 'ti-ri-po') + '; special signs as ' + tl('a2') + ', ' + tl('ra3') + '; unread signs as ' + tl('*18') + '.' : '';
    }
    function goBack() { outT.textContent = t2.value.trim() ? SC.toTranslit(t2.value, A ? 'A' : 'B') : ''; }
    t1.addEventListener('input', go); t2.addEventListener('input', goBack); divC.addEventListener('change', go);
    btn(F.ctl, 'Copy the signs', function () { var s = outS.textContent.trim(); try { navigator.clipboard.writeText(s).then(function () { F.say('Copied.'); }, function () { F.say('Select the signs and copy them.'); }); } catch (e) { F.say('Select the signs and copy them.'); } });
    btn(F.ctl, 'Copy the transliteration', function () { var s = outT.textContent.trim(); try { navigator.clipboard.writeText(s).then(function () { F.say('Copied.'); }, function () { F.say('Select the text and copy it.'); }); } catch (e) { F.say('Select the text and copy it.'); } });
    // a palette of signs: tap to add
    var pal = h('details', 'scs-pal'), sum = h('summary', '', 'Sign palette: tap a sign to add it'); pal.appendChild(sum);
    var pg = h('div', 'scs-palg'); pal.appendChild(pg); F.body.appendChild(pal);
    function fillPal() {
      pg.innerHTML = '';
      var list = A ? SC.LA_SIGNS.filter(function (s) { return s.kind === 'syl'; }).map(function (s) { return [s.u, s.v]; }) : SC.SIGNS.filter(function (s) { return s.kind !== 'unread'; }).map(function (s) { return [s.u, s.v]; });
      list.forEach(function (p) {
        var b = h('button', 'scs-pb', '<span class="' + (A ? 'sc-a' : 'sc-b') + '">' + esc(p[0]) + '</span><small>' + esc(p[1]) + '</small>'); b.type = 'button'; b.setAttribute('aria-label', 'add ' + p[1]);
        b.addEventListener('click', function () { var v = t1.value; t1.value = v + (v && !/[\s-]$/.test(v) ? '-' : '') + p[1]; go(); t1.focus(); });
        pg.appendChild(b);
      });
    }
    seg.el.addEventListener('click', fillPal);
    fillPal(); go(); goBack();
    return {};
  }
  /* ---------------------------------------------------------------- sc-grid */
  V.register('sc-grid', function (el, o) {
    o = o || {};
    if (o.mode === 'build') return gridBuild(el, o);
    var A = o.script === 'A';
    var F = frame(el, o, 'grid', A ? 'Linear A signs shared with Linear B' : 'The Linear B syllabic grid');
    var asks = (o.ask || []).map(String), hl = (o.highlight || []).map(String), showV = o.values !== false && !F.quiet;
    var rows = o.rows || SC.ROWS, cells = [];
    function cellFor(S, label) {
      var LA = A && S ? SC.laSign(S.v) : null, use = A ? LA : S;
      var c = h(use && F.interactive ? 'button' : 'span', 'scg-c' + (use ? '' : ' scg-empty') + (S && hl.indexOf(S.v) >= 0 ? ' on' : '') + (S && S.doubt ? ' scg-doubt' : ''));
      if (c.tagName === 'BUTTON') c.type = 'button';
      if (use) {
        var asked = asks.indexOf(S.v) >= 0;
        c.innerHTML = '<span class="scg-g ' + (A ? 'sc-a' : 'sc-b') + '">' + esc(use.u) + '</span>' + (showV || asked ? '<span class="scg-v">' + (asked ? '?' : esc(label || S.v) + (S.doubt ? '?' : '')) + '</span>' : '');
        c.setAttribute('aria-label', (A ? use.n + ' ' : S.n + ' ') + (showV && !asked ? (A ? 'read by convention ' : '') + (label || S.v) : 'sign'));
        if (c.tagName === 'BUTTON') c.addEventListener('click', function () {
          cells.forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on');
          if (F.quiet) return;
          F.say(A ? signInfo(use, true) + (S ? ' In Linear B: ' + glyph(S.u) + ' ' + esc(S.n) + '.' : '') : signInfo(S));
        });
        cells.push(c);
      } else c.innerHTML = '<span class="scg-none" aria-hidden="true">·</span>';
      return c;
    }
    var wrap = h('div', 'scv-tabwrap'), T = h('table', 'scg-tab');
    var thead = '<thead><tr><th scope="col"><span class="scv-sr">consonant</span></th>' + SC.VOWELS.map(function (v) { return '<th scope="col">' + esc(v) + '</th>'; }).join('') + '</tr></thead>';
    T.innerHTML = thead;
    var tb = h('tbody'); T.appendChild(tb);
    rows.forEach(function (r) {
      var tr = h('tr'), th = h('th', '', r ? esc(r) + '-' : '<span title="the vowels alone">V</span>'); th.scope = 'row'; tr.appendChild(th);
      SC.VOWELS.forEach(function (v) { var td = h('td'); td.appendChild(cellFor(SC.gridCell(r, v))); tr.appendChild(td); });
      tb.appendChild(tr);
    });
    wrap.appendChild(T); F.body.appendChild(wrap);
    if (A) F.body.appendChild(h('p', 'scv-hint', 'Values in Linear A are conventional: they are the values of the look-alike Linear B signs. A dot marks a grid place with no matching Linear A sign in the list.'));
    if (o.specials) {
      F.body.appendChild(h('p', 'scg-h', 'Special signs'));
      var sp = h('div', 'scg-list');
      SC.SIGNS.filter(function (s) { return s.kind === 'special'; }).forEach(function (s) { if (A && !SC.laSign(s.v)) return; sp.appendChild(cellFor(s, s.v)); });
      F.body.appendChild(sp);
    }
    if (o.unread && !A) {
      F.body.appendChild(h('p', 'scg-h', 'Signs with no agreed value'));
      var un = h('div', 'scg-list');
      SC.SIGNS.filter(function (s) { return s.kind === 'unread'; }).forEach(function (s) { var c = cellFor(s, s.n); un.appendChild(c); if (showV) c.querySelector('.scg-v').textContent = s.n + (s.prop ? ' (' + s.prop + '?)' : ''); });
      F.body.appendChild(un);
    }
    return {};
  });

  /* build the grid the way Kober and Ventris did: relations first, sounds last */
  function gridBuild(el, o) {
    var F = frame(el, o, 'grid', 'Build a syllabic grid from clues');
    var R = o.set === 'easy' ? ['k', 'n'] : ['k', 'n', 's'], C = ['a', 'i', 'o'];
    var signs = []; R.forEach(function (r) { C.forEach(function (v) { signs.push(SC.gridCell(r, v)); }); });
    var lab = {}; shuffle(signs, 'labels' + R.length).forEach(function (s, i) { lab[s.v] = letter(i); });
    // clues: chains along rows (same consonant) and down columns (same vowel)
    var clues = [];
    R.forEach(function (r) { for (var j = 0; j + 1 < C.length; j++) clues.push([SC.gridCell(r, C[j]), SC.gridCell(r, C[j + 1]), 'consonant']); });
    C.forEach(function (v) { for (var i = 0; i + 1 < R.length; i++) clues.push([SC.gridCell(R[i], v), SC.gridCell(R[i + 1], v), 'vowel']); });
    clues = shuffle(clues, 'clues' + R.length);
    F.body.appendChild(h('p', 'scv-hint', 'Like Alice Kober and Michael Ventris, you know no sounds yet, only which signs share a consonant or a vowel (from how words change their endings). Place every sign so that each row shares one consonant and each column one vowel.'));
    var cl = h('ul', 'scg-clues');
    clues.forEach(function (q) { cl.appendChild(h('li', '', '<span class="scg-cg sc-b">' + esc(q[0].u) + '</span> ' + lab[q[0].v] + ' and <span class="scg-cg sc-b">' + esc(q[1].u) + '</span> ' + lab[q[1].v] + ' share a <b>' + q[2] + '</b>')); });
    F.body.appendChild(cl);
    var grid = h('div', 'scg-build'); grid.style.gridTemplateColumns = 'auto repeat(' + C.length + ', minmax(52px, 1fr))';
    var place = {}, slots = [], sel = null;
    grid.appendChild(h('span', ''));
    C.forEach(function (v, j) { grid.appendChild(h('span', 'scg-bh', 'vowel ' + (j + 1))); });
    R.forEach(function (r, i) {
      grid.appendChild(h('span', 'scg-bh', 'consonant ' + (i + 1)));
      C.forEach(function (v, j) {
        var s = h('button', 'scg-slot'); s.type = 'button'; s.dataset.r = i; s.dataset.c = j; s.setAttribute('aria-label', 'row ' + (i + 1) + ', column ' + (j + 1) + ', empty');
        s.addEventListener('click', function () { drop(s); }); grid.appendChild(s); slots.push(s);
      });
    });
    F.body.appendChild(grid);
    var pool = h('div', 'scg-pool'); F.body.appendChild(pool);
    var cards = {};
    shuffle(signs, 'pool' + R.length).forEach(function (s) {
      var b = h('button', 'scg-card', '<span class="sc-b">' + esc(s.u) + '</span><small>' + lab[s.v] + '</small>'); b.type = 'button'; b.setAttribute('aria-label', 'sign ' + lab[s.v]);
      b.addEventListener('click', function () { if (sel === s) { sel = null; b.classList.remove('on'); return; } Object.keys(cards).forEach(function (k) { cards[k].classList.remove('on'); }); sel = s; b.classList.add('on'); F.say('Now tap a place in the grid for sign ' + lab[s.v] + '.'); });
      cards[s.v] = b; pool.appendChild(b);
    });
    function slotOf(v) { for (var k in place) if (place[k] === v) return k; return null; }
    function drop(slot) {
      var key = slot.dataset.r + ',' + slot.dataset.c;
      if (!sel) { if (place[key]) { var v = place[key]; delete place[key]; cards[v].hidden = false; render(); F.say('Sign ' + lab[v] + ' is back in the pool.'); } return; }
      var old = slotOf(sel.v); if (old) delete place[old];
      if (place[key]) cards[place[key]].hidden = false;
      place[key] = sel.v; cards[sel.v].hidden = true; cards[sel.v].classList.remove('on'); sel = null; render(); F.say('');
    }
    var solved = false;
    function render() {
      slots.forEach(function (s) {
        var v = place[s.dataset.r + ',' + s.dataset.c], S = v ? SC.sign(v) : null;
        s.innerHTML = S ? '<span class="sc-b">' + esc(S.u) + '</span><small>' + (solved && sounds ? esc(S.v) : lab[S.v]) + '</small>' : '';
        s.setAttribute('aria-label', 'row ' + (+s.dataset.r + 1) + ', column ' + (+s.dataset.c + 1) + (S ? ', sign ' + lab[S.v] : ', empty'));
      });
    }
    var sounds = false;
    function check() {
      var keys = Object.keys(place);
      if (keys.length < signs.length) { F.say('Place all ' + signs.length + ' signs first.'); return; }
      var ok = true;
      keys.forEach(function (a) { keys.forEach(function (b) {
        var A = SC.sign(place[a]), B = SC.sign(place[b]), ra = a.split(','), rb = b.split(',');
        if ((ra[0] === rb[0]) !== (A.c === B.c) || (ra[1] === rb[1]) !== (A.vw === B.vw)) ok = false;
      }); });
      solved = ok;
      F.say(ok ? okMark(true) + ' Every row shares a consonant and every column a vowel, and you still do not know a single sound. That is how far evidence alone can go. Now add the sounds.' : okMark(false) + ' Not yet: some row or column mixes signs that the clues keep apart. Check each clue against your grid.');
      soundB.hidden = !ok;
    }
    var checkB = btn(F.ctl, 'Check', check, 'pri');
    var soundB = btn(F.ctl, 'Add the sounds', function () {
      sounds = true; render();
      F.say('Ventris tried Cretan place names on words found only at Knossos. If signs in your grid spell ' + tl('ko-no-so') + ' (Knossos), one column is o and the rows are ' + (R.length === 3 ? 'k, n and s' : 'k and n') + '. ' + tl('a-mi-ni-so') + ' (Amnisos) then gives ' + tl('ni') + ', and with it the i column. The last column must be a. One test, and every sign in the grid has a sound.');
    });
    soundB.hidden = true;
    btn(F.ctl, 'Start over', function () { place = {}; solved = false; sounds = false; soundB.hidden = true; Object.keys(cards).forEach(function (k) { cards[k].hidden = false; cards[k].classList.remove('on'); }); sel = null; render(); F.say(''); });
    if (F.quiet) { checkB.hidden = true; }
    render();
    return {};
  }
  /* ---------------------------------------------------------------- sc-tablet */
  // one segment's tokens: a word (syllables), a logogram, a number, a fraction, a gap or a break
  function segToks(s, A) {
    if (s.w) return SC.parse(s.w, A ? 'A' : 'B').filter(function (t) { return t.t === 'syl' || t.t === 'bad'; });
    if (s.l) { var L = SC.logo(s.l); return L ? [{ t: 'logo', tl: L.key, u: L.u, logo: L }] : []; }
    if (s.n !== undefined) return [{ t: 'num', tl: String(s.n), u: SC.num(s.n), n: s.n }];
    if (s.f) { var f = SC.fraction(s.f); return f ? [{ t: 'frac', tl: f.k, u: f.u, frac: f }] : []; }
    return [];
  }
  function segText(s) { return s.w || (s.l ? SC.logo(s.l) ? SC.logo(s.l).key : s.l : '') || (s.n !== undefined ? String(s.n) : '') || s.f || (s.gap ? '…' : ''); }
  function segInfo(s, A) {
    if (s.w) {
      var W0 = A ? SC.LA_WORDS[s.w] : SC.WORDS[s.w];
      if (A) return tl(s.w) + ': ' + (W0 ? esc(W0.en) + (W0.sure ? ' (' + esc({ accepted: 'widely accepted', probable: 'probable', place: 'a place name also in Linear B', unknown: 'meaning unknown' }[W0.sure]) + ')' : '') : 'a Linear A word, read by convention; its meaning is unknown.');
      return tl(s.w) + (W0 ? (W0.gr ? ' = ' + grk(W0.gr) + (W0.grl ? ' <i>' + esc(W0.grl) + '</i>' : '') : '') + ', ' + esc(W0.en) + '.' + (W0.note ? ' ' + esc(W0.note) : '') : ': a word spelled in syllables.');
    }
    if (s.l) { var L = SC.logo(s.l); return L ? '<b>' + esc(L.key) + '</b> (' + esc(L.n) + '): a ' + (L.kind === 'measure' ? 'measure sign' : 'logogram') + ', ' + esc(L.en) + '. It says what is counted and is not read as a syllable.' : ''; }
    if (s.n !== undefined) return 'The number ' + s.n + ': ' + SC.numParts(s.n).map(function (p) { return p.count + ' × ' + p.place; }).join(' + ') + '. The marks are added up.';
    if (s.f) { var f = SC.fraction(s.f); return 'Fraction sign ' + esc(f.k) + ': ' + (f.val ? (f.sure === 'accepted' ? 'one half, a widely accepted value' : 'perhaps ' + esc(f.num) + ' (' + esc(f.sure) + ')') : 'value unknown') + '.'; }
    if (s.gap) return 'Left blank here: ' + esc(s.gap) + '.';
    return '';
  }
  // the outline of a tablet of width w and height hh: a palm leaf (long, rounded ends), a page or a stone offering table
  function tabletPath(shape, w, hh) {
    if (shape === 'leaf') {
      var e = M.min(hh * 0.28, w * 0.06, 34);
      return 'M' + e + ' 2 L' + (w - e) + ' ' + (2 + hh * 0.04) + ' Q' + (w + e * 0.9) + ' ' + (hh * 0.5) + ' ' + (w - e) + ' ' + (hh - 2 - hh * 0.03) +
        ' L' + e + ' ' + (hh - 2) + ' Q' + (-e * 0.9) + ' ' + (hh * 0.52) + ' ' + e + ' 2Z';
    }
    if (shape === 'table') return 'M14 6 L' + (w - 14) + ' 6 Q' + w + ' 6 ' + w + ' 20 L' + (w - 6) + ' ' + (hh - 8) + ' Q' + (w - 8) + ' ' + hh + ' ' + (w - 20) + ' ' + hh + ' L20 ' + hh + ' Q8 ' + hh + ' 6 ' + (hh - 8) + ' L0 20 Q0 6 14 6Z';
    return 'M8 3 L' + (w - 10) + ' 2 Q' + (w - 1) + ' 3 ' + (w - 2) + ' 12 L' + (w - 1) + ' ' + (hh - 10) + ' Q' + (w - 2) + ' ' + (hh - 1) + ' ' + (w - 11) + ' ' + (hh - 2) +
      ' L10 ' + (hh - 1) + ' Q1 ' + (hh - 2) + ' 2 ' + (hh - 11) + ' L1 11 Q2 3 8 3Z';
  }
  V.register('sc-tablet', function (el, o) {
    o = o || {};
    var T0 = o.tablet ? SC.tablet(o.tablet) : null;
    var lines = T0 ? T0.lines : (o.lines || []).map(function (l) { return Array.isArray(l) ? { segs: l } : l; });
    var A = T0 ? T0.script === 'A' : o.script === 'A', shape = (T0 && T0.shape) || o.shape || 'page';
    var F = frame(el, o, 'tablet', T0 ? 'Tablet ' + T0.id + (F0quiet(o) ? '' : ': ' + T0.title) : 'A drawn clay tablet');
    var hl = [].concat(o.highlight || []), asks = [].concat(o.ask === undefined ? [] : o.ask);
    if (T0 && !F.quiet && o.head !== false) F.body.appendChild(h('p', 'sct-head', '<b>' + esc(T0.id) + '</b> · ' + esc(T0.title) + (T0.real === false ? ' <span class="sct-pat">a pattern, not one tablet</span>' : '')));
    var stage = h('div', 'sct-stage'); F.body.appendChild(stage);
    var segs = []; lines.forEach(function (L, li) { L.segs.forEach(function (s) { segs.push({ s: s, line: li }); }); });
    var sel = -1, layer = o.steps ? 0 : 9;
    function draw() {
      stage.innerHTML = '';
      var avail = M.max(260, (stage.clientWidth || el.clientWidth || 600) - 4);
      var S = 30, pad = 18, gapW = 0.5 * S;            // sign size (px in the viewBox), padding, gap between segments
      var maxW = M.max(12 * S, M.min(48 * S, avail * 1.25)); // wrap long lines so signs stay readable on phones
      // measure segments
      var rows = [], row = null, x = 0, prevLine = -1;
      segs.forEach(function (g, i) {
        var tk = segToks(g.s, A), w;
        if (g.s.gap) w = 3.2 * S; else if (g.s.br) w = 0.6 * S;
        else w = tk.reduce(function (a, t) { return a + Array.from(t.u).reduce(function (b, ch) { return b + adv(ch); }, 0) * S; }, 0) + (tk.length > 1 ? 0 : 0);
        var small = lines[g.line].small;
        if (g.line !== prevLine || (x + w > maxW - 2 * pad && row && row.items.length)) {
          row = { items: [], small: small, cont: g.line === prevLine, line: g.line }; rows.push(row); x = 0; prevLine = g.line;
        }
        row.items.push({ i: i, x: x, w: w, tk: tk, g: g });
        x += w + gapW;
      });
      var width = 0; rows.forEach(function (r) { var last = r.items[r.items.length - 1]; r.w = last.x + last.w; width = M.max(width, r.w); });
      var lp = shape === 'leaf' ? 16 : 0, rowH = S * 1.55, W0 = width + 2 * pad + 2 * lp + (shape === 'table' ? 70 : 0), H0 = rows.length * rowH + 2 * pad - 6;
      if (shape === 'leaf') H0 = M.max(H0, 70);
      var svg = svgRoot(W0, H0, (T0 ? T0.id : 'Tablet') + ': ' + rows.length + ' lines of signs', 'sct-svg');
      svg.style.width = M.min(W0, avail) + 'px';
      sv('path', { d: tabletPath(shape, W0, H0), class: shape === 'table' ? 'sct-stone' : 'sct-clay' }, svg);
      if (shape === 'table') sv('ellipse', { cx: 40, cy: H0 / 2, rx: 24, ry: M.min(18, H0 / 2 - 10), class: 'sct-bowl' }, svg);
      var x0 = pad + lp + (shape === 'table' ? 70 : 0);
      rows.forEach(function (r, ri) {
        var yb = pad + ri * rowH + S * 1.05;
        if (shape === 'page' && ri) sv('line', { x1: 8, x2: W0 - 8, y1: pad + ri * rowH - 2, y2: pad + ri * rowH - 2, class: 'sct-rule' }, svg);
        if (r.cont) txt(svg, x0 - 13, yb - 6, '↳', { class: 'sct-cont', 'aria-hidden': 'true' });
        r.items.forEach(function (it) {
          var g = it.g, s = g.s, i = it.i, x1 = x0 + it.x;
          var G = sv('g', { class: 'sct-seg sct-' + (s.w ? 'w' : s.l ? 'l' : s.n !== undefined ? 'n' : s.f ? 'f' : s.gap ? 'gap' : 'br') + (hl.indexOf(i) >= 0 || sel === i ? ' on' : '') + (asks.indexOf(i) >= 0 ? ' ask' : '') }, svg);
          if (s.gap) {
            sv('rect', { x: x1, y: yb - S * 0.95, width: it.w, height: S * 1.1, rx: 5, class: 'sct-gapbox' }, G);
            txt(G, x1 + it.w / 2, yb - S * 0.3, '…', { 'text-anchor': 'middle', class: 'sct-gapt' });
          } else if (s.br) {
            sv('path', { d: 'M' + (x1 + 4) + ' ' + (yb - S) + ' l-4 6 l5 6 l-5 6 l4 6', class: 'sct-break' }, G);
          } else {
            var xx = x1;
            it.tk.forEach(function (t) {
              var cls = 'sct-g ' + ((A && t.t !== 'num') ? 'sc-a' : 'sc-b');
              var tt = txt(G, xx, yb - (r.small ? 3 : 0), t.u, { class: cls, 'font-size': r.small ? S * 0.8 : S });
              xx += Array.from(t.u).reduce(function (b, ch) { return b + adv(ch); }, 0) * S * (r.small ? 0.8 : 1);
              void tt;
            });
            if (s.w && it.tk.length) { // the word divider after a word, as scribes wrote it
              var nx = segs[i + 1];
              if (nx && nx.line === g.line && nx.s.w) sv('line', { x1: x1 + it.w + gapW / 2, x2: x1 + it.w + gapW / 2, y1: yb - S * 0.55, y2: yb - S * 0.05, class: 'sct-div' }, G);
            }
          }
          if (!s.br && F.interactive && !F.quiet) {
            var hit = sv('rect', { x: x1 - 3, y: yb - S * 1.05, width: it.w + 6, height: S * 1.3, rx: 6, class: 'sct-hit', tabindex: 0, role: 'button', 'aria-label': (s.w ? 'word ' : s.l ? 'logogram ' : s.n !== undefined ? 'number ' : 'segment ') + (asks.indexOf(i) >= 0 ? '' : segText(s)) }, G);
            var act = function () { sel = i; draw(); F.say(asks.indexOf(i) >= 0 ? 'This is the part the question asks about.' : segInfo(s, A)); var f = stage.querySelectorAll('.sct-hit')[segIndex(i)]; if (f) f.focus(); };
            hit.addEventListener('click', act);
            hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
          }
        });
      });
      stage.appendChild(svg);
      drawReading();
    }
    function segIndex(i) { var k = 0; for (var j = 0; j < i; j++) if (!segs[j].s.br) k++; return k; }
    var rd = h('div', 'sct-read'); F.body.appendChild(rd);
    var want = o.reading || ['tl', 'en'];
    function drawReading() {
      rd.innerHTML = '';
      if (F.quiet) return;
      var show = function (k) { return want.indexOf(k) >= 0 && (layer >= { tl: 1, gr: 2, en: 3 }[k]); };
      if (show('tl')) {
        var p = h('div', 'sct-rl'); p.innerHTML = '<span class="scs-k">Transliteration</span>';
        lines.forEach(function (L, li) {
          var q = h('p', 'sct-tl' + (L.small ? ' sct-small' : ''));
          q.innerHTML = '<span class="sct-ln">' + (lines.length > 1 ? (li + 1) + (L.small ? ' (above the line)' : '') : '') + '</span>' + L.segs.map(function (s) {
            var gi = segs.findIndex(function (g) { return g.s === s; }), asked = asks.indexOf(gi) >= 0, on = hl.indexOf(gi) >= 0 || gi === sel;
            var body = s.br ? '[' : s.gap ? '<span class="sct-gapr">(' + esc(s.gap) + ')</span>' : asked ? '<b class="sct-q">?</b>' : s.w ? tl(s.w) : s.l ? '<span class="sct-lg">' + esc(SC.logo(s.l) ? SC.logo(s.l).key : s.l) + '</span>' : s.f ? '<span class="sct-lg">' + esc(s.f) + '</span>' : String(s.n);
            return on ? '<mark>' + body + '</mark>' : body;
          }).join(' ');
          p.appendChild(q);
        });
        rd.appendChild(p);
      }
      if (show('gr') && !A) {
        var gw = []; segs.forEach(function (g) { var W1 = g.s.w && SC.WORDS[g.s.w]; if (W1 && W1.gr && gw.indexOf(g.s.w) < 0) gw.push(g.s.w); });
        if (gw.length) rd.appendChild(h('div', 'sct-rl', '<span class="scs-k">Later Greek</span><p class="sct-gr">' + gw.map(function (k) { var W1 = SC.WORDS[k]; return tl(k) + ' → ' + grk(W1.gr) + ' <i>' + esc(W1.grl) + '</i>'; }).join('<span class="sct-sep"> · </span>') + '</p>'));
      }
      if (show('en') && T0 && T0.en) rd.appendChild(h('div', 'sct-rl', '<span class="scs-k">' + (A ? 'What can be said' : 'Translation') + '</span><p>' + esc(T0.en) + '</p>'));
      if (layer >= 3 && T0 && T0.note && o.note !== false) rd.appendChild(h('p', 'scs-note', esc(T0.note)));
    }
    if (o.steps && !F.quiet) {
      var nextL = function (l) { return l >= 3 ? 0 : (A && l === 1) ? 3 : l + 1; };
      var label = function () { var n = nextL(layer); return n === 0 ? 'Start again' : 'Show the ' + { 1: 'transliteration', 2: 'Greek words', 3: A ? 'meaning' : 'translation' }[n]; };
      var stepB = btn(F.ctl, '', function () { layer = nextL(layer); stepB.textContent = label(); drawReading(); F.say(''); }, 'pri');
      stepB.textContent = label();
    }
    onResize(stage, draw);
    draw();
    return { update: function (n) { Object.assign(o, n || {}); draw(); } };
  });
  function F0quiet(o) { return !!(o.quiet || o.readout === false); }
  /* ---------------------------------------------------------------- sc-compare */
  // Greek letters for the sounds a Linear B consonant row can stand for (the alphabet came centuries later)
  var GR_C = { '': '', d: 'δ', j: '', k: 'κ γ χ', m: 'μ', n: 'ν', p: 'π β φ', q: '', r: 'ρ λ', s: 'σ', t: 'τ θ', w: 'ϝ', z: 'ζ' };
  var GR_V = { a: 'α', e: 'ε η', i: 'ι', o: 'ο ω', u: 'υ' };
  function greekFor(S) {
    if (!S || S.kind !== 'grid') return '';
    var c = S.c, v = S.vw;
    if (c === 'q') return 'no letter: the old kʷ, gʷ sounds became π, β, τ or δ in later Greek';
    if (c === 'j') return 'no letter: a y-glide, as in ' + tl('i-je-re-u') + ' (ἱερεύς)';
    if (c === 'w') return 'ϝ (digamma) + ' + GR_V[v] + ', a letter some early alphabets kept and later Greek lost';
    var cs = GR_C[c] ? GR_C[c].split(' ') : [''];
    return cs.map(function (x) { return x + GR_V[v].split(' ')[0]; }).join(', ') + (GR_V[v].indexOf(' ') > 0 ? ' (or with ' + GR_V[v].split(' ')[1] + ')' : '');
  }
  var KINDS = [
    { key: 'logo', name: 'Word sign (logogram)', show: function () { return glyph(SC.logo('EQU').u); }, read: 'EQU, "horse"', note: 'One sign for a whole word. Easy to recognize, but a script made only of word signs needs thousands of signs.', count: 'thousands of signs' },
    { key: 'syl', name: 'Syllabary', show: function () { return glyph(SC.toSigns('i-qo')); }, read: 'i-qo, hikkʷos', note: 'One sign for each syllable. Linear B needs about 90 signs, but cannot show every sound.', count: 'about 90 signs' },
    { key: 'alpha', name: 'Alphabet', show: function () { return '<span class="sc-gr" lang="grc">ἵππος</span>'; }, read: 'h-i-pp-o-s, hippos', note: 'One letter for each sound, vowels included (the Greeks added the vowels). About two dozen letters write every word.', count: 'about 24 letters' }
  ];
  var FACTS = [
    ['Where', 'Crete, with a few finds on the islands and beyond', 'Crete and the Greek mainland'],
    ['When', 'about 1800 to 1450 BC', 'about 1450 to 1200 BC'],
    ['Language', 'Minoan: unknown, related to no known language', 'Greek (Mycenaean, the oldest written Greek)'],
    ['How much', 'about 1,400 short inscriptions (about 7,400 signs)', 'about 6,000 documents'],
    ['Most found at', 'Hagia Triada, Zakros, Chania', 'Knossos, Pylos, Thebes'],
    ['On', 'tablets, sealings, stone offering tables, vases, jewelry', 'tablets, sealings, labels, painted jars'],
    ['Signs', 'about 90 common syllable signs, many logograms', 'about 90 syllable signs, over 100 logograms'],
    ['Numbers', 'the Aegean decimal marks, plus fraction signs', 'the Aegean decimal marks, plus measure signs'],
    ['Read?', 'No. Sounds borrowed from Linear B by convention; only a few words are understood', 'Yes, since 1952. A few rare signs are still unread']
  ];
  var CLAIMS = [
    { text: 'A claim reads twenty well-chosen words as a known language, but other words on the same tablets make no sense in that language.', fail: 'whole' },
    { text: 'A claim gives the same sign one sound on some tablets and a different sound on others, whenever that helps.', fail: 'whole' },
    { text: 'A claim reads pa-i-to, which Linear B uses for the town of Phaistos, as a word for "barley".', fail: 'names' },
    { text: 'A claim offers no way that a newly found tablet could prove it wrong.', fail: 'predict' },
    { text: 'A claim is announced in the news and in a book, but no specialists have checked it in print.', fail: 'experts' }
  ];
  var TESTS = [
    ['predict', 'Testable: it makes predictions that new texts can check'],
    ['whole', 'Consistent: one value per sign, and it reads the whole corpus, not chosen words'],
    ['names', 'Fits the places: place names come out as the places we know'],
    ['experts', 'Checked: specialists test it and accept it']
  ];
  V.register('sc-compare', function (el, o) {
    o = o || {};
    var mode = o.mode || 'sign';
    var F = frame(el, o, 'compare', { sign: 'One sign in Linear A and Linear B', word: 'One word in Linear A and Linear B', kinds: 'Three kinds of writing', facts: 'Linear A and Linear B compared', alphabet: 'A Linear B word and its Greek spelling', claims: 'Judging decipherment claims' }[mode] || 'Compare scripts');
    var B = F.body;
    if (mode === 'sign') {
      var Sb = SC.sign(o.sign || 'da'), Sa = Sb ? SC.laSign(Sb.v) : SC.laSign(o.sign);
      if (!Sb && Sa && Sa.b) Sb = SC.sign(Sa.b);
      var g = h('div', 'scc-pair');
      g.appendChild(h('div', 'scc-col', '<p class="scc-h">Linear A</p>' + (Sa ? '<span class="scc-big sc-a">' + esc(Sa.u) + '</span><p class="scc-n">' + esc(Sa.n) + '</p>' + (F.quiet ? '' : '<p>read by convention as ' + tl(Sa.v) + '</p><p class="scc-sure">a borrowed value: the Minoan sound is a guess</p>') : '<p class="scv-hint">No matching Linear A sign in the list.</p>')));
      g.appendChild(h('div', 'scc-arrow', '<span aria-hidden="true">≈</span>'));
      g.appendChild(h('div', 'scc-col', '<p class="scc-h">Linear B</p>' + (Sb ? '<span class="scc-big sc-b">' + esc(Sb.u) + '</span><p class="scc-n">' + esc(Sb.n) + '</p>' + (F.quiet ? '' : '<p>' + tl(Sb.v || Sb.n) + (Sb.kind === 'special' ? ', read ' + esc(Sb.say) : '') + '</p><p class="scc-sure scc-ok">proved by the decipherment: it makes Greek words</p>') : '')));
      B.appendChild(g);
      if (Sb && !F.quiet) {
        var gf = greekFor(Sb), ex = SC.wordsWith(Sb.v).slice(0, 2);
        B.appendChild(h('p', 'scc-gr', '<span class="scs-k">In the Greek alphabet</span> ' + (gf ? (/^no letter|^ϝ/.test(gf) ? esc(gf) : '<span class="sc-gr" lang="grc">' + esc(gf) + '</span>') : '') + (ex.length ? '<br><span class="scs-k">Linear B words</span> ' + ex.map(function (k) { return tl(k) + ' (' + esc(SC.WORDS[k].en) + ')'; }).join(', ') : '')));
      }
    } else if (mode === 'word') {
      var key = o.la || 'pa-i-to', LW = SC.LA_WORDS[key] || {}, bw = LW.b || key;
      var rows = h('div', 'scc-words');
      rows.appendChild(h('div', 'scc-wrow', '<span class="scc-wl">Linear A</span><span class="scc-ws sc-a">' + esc(SC.toSigns(key, 'A')) + '</span>' + (F.quiet ? '' : tl(key))));
      rows.appendChild(h('div', 'scc-wrow', '<span class="scc-wl">Linear B</span><span class="scc-ws sc-b">' + esc(SC.toSigns(bw)) + '</span>' + (F.quiet ? '' : tl(bw))));
      B.appendChild(rows);
      var pairs = SC.parse(key, 'A').filter(function (t) { return t.t === 'syl'; });
      var tb = '<table class="scs-tab"><thead><tr><th>Linear A</th><th>Linear B</th><th>Value</th></tr></thead><tbody>';
      pairs.forEach(function (t) { var b2 = SC.sign(t.sign.v); tb += '<tr><td>' + glyph(t.u, true) + '</td><td>' + (b2 ? glyph(b2.u) : '') + '</td><td>' + (F.quiet ? '?' : tl(t.sign.v)) + '</td></tr>'; });
      B.appendChild(h('div', 'scv-tabwrap', tb + '</tbody></table>'));
      if (!F.quiet) B.appendChild(h('p', 'scs-note', esc(LW.en ? LW.en + '. ' : '') + esc(LW.note || '') + ' A match like this supports the borrowed values for these signs; it does not tell us what language the rest of Linear A is.'));
    } else if (mode === 'kinds') {
      var wrapK = h('div', 'scc-kinds');
      KINDS.forEach(function (k, i) {
        wrapK.appendChild(h('div', 'scc-kind', '<p class="scc-h">' + (F.quiet ? 'Writing ' + letter(i) : esc(k.name)) + '</p><div class="scc-kbig">' + k.show() + '</div>' + (F.quiet ? '' : '<p class="scc-kread">' + esc(k.read) + '</p><p class="scc-knote">' + esc(k.note) + '</p><p class="scc-kc">' + esc(k.count) + '</p>')));
      });
      B.appendChild(wrapK);
      if (!F.quiet) B.appendChild(h('p', 'scv-hint', 'The same animal, "horse", written three ways. Linear B tablets use the first two together: a word spelled in syllables, then a logogram and a number.'));
    } else if (mode === 'facts') {
      var tf = '<table class="scs-tab scc-facts"><thead><tr><th></th><th>Linear A</th><th>Linear B</th></tr></thead><tbody>';
      var only = o.rows ? FACTS.filter(function (r) { return o.rows.indexOf(r[0]) >= 0; }) : FACTS;
      only.forEach(function (r) { tf += '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + (F.quiet && o.ask === r[0] ? '?' : esc(r[1])) + '</td><td>' + (F.quiet && o.ask === r[0] ? '?' : esc(r[2])) + '</td></tr>'; });
      B.appendChild(h('div', 'scv-tabwrap', tf + '</tbody></table>'));
      var ex2 = h('div', 'scc-pair scc-mini');
      ex2.appendChild(h('div', 'scc-col', '<span class="sc-a scc-mw">' + esc(SC.toSigns('ku-ro', 'A')) + '</span>' + (F.quiet ? '' : '<p>' + tl('ku-ro') + ': "total" (widely accepted)</p>')));
      ex2.appendChild(h('div', 'scc-col', '<span class="sc-b scc-mw">' + esc(SC.toSigns('to-so')) + '</span>' + (F.quiet ? '' : '<p>' + tl('to-so') + ', <span class="sc-gr" lang="grc">τόσος</span>: "so many", the Linear B word for a total</p>')));
      B.appendChild(ex2);
    } else if (mode === 'alphabet') {
      var wk = o.word || 'ti-ri-po', W1 = SC.WORDS[wk] || {};
      var ab = h('div', 'scc-words');
      ab.appendChild(h('div', 'scc-wrow', '<span class="scc-wl">Linear B</span><span class="scc-ws sc-b">' + esc(SC.toSigns(wk)) + '</span>' + (F.quiet ? '' : tl(wk))));
      ab.appendChild(h('div', 'scc-wrow', '<span class="scc-wl">Greek alphabet</span><span class="scc-ws sc-gr" lang="grc">' + esc(F.quiet && o.ask ? '?' : W1.gr || '') + '</span>' + (F.quiet ? '' : '<i>' + esc(W1.grl || '') + '</i>')));
      B.appendChild(ab);
      if (!F.quiet) {
        var tbl = '<table class="scs-tab"><thead><tr><th>Sign</th><th>Syllable</th><th>Greek letters it can stand for</th></tr></thead><tbody>';
        SC.parse(wk).forEach(function (t) { if (t.t === 'syl') tbl += '<tr><td>' + glyph(t.u) + '</td><td>' + tl(t.tl) + '</td><td>' + (t.sign.kind === 'grid' ? (function (gf) { return /^no letter|^ϝ/.test(gf) ? esc(gf) : '<span class="sc-gr" lang="grc">' + esc(gf) + '</span>'; })(greekFor(t.sign)) : esc(t.sign.say || '')) + '</td></tr>'; });
        B.appendChild(h('div', 'scv-tabwrap', tbl + '</tbody></table>'));
        B.appendChild(h('p', 'scs-note', esc(W1.note || '') + ' The alphabet writes every sound; the syllabary leaves some out and adds empty vowels, so the reader had to know the word.'));
      }
    } else if (mode === 'claims') {
      B.appendChild(h('p', 'scv-hint', 'A real decipherment passes four tests. Claims to read Linear A appear every few years; none has passed them. For each made-up claim below, choose the test it fails.'));
      var list = o.items ? o.items.map(function (i) { return CLAIMS[i]; }).filter(Boolean) : CLAIMS, sels = [];
      var ul = h('ol', 'scc-claims');
      list.forEach(function (c, i) {
        var li = h('li', '', '<p>' + esc(c.text) + '</p>'), sl = h('select', 'scc-sel'); sl.setAttribute('aria-label', 'The test claim ' + (i + 1) + ' fails');
        sl.innerHTML = '<option value="">Choose the test it fails…</option>' + TESTS.map(function (t) { return '<option value="' + t[0] + '">' + esc(t[1]) + '</option>'; }).join('');
        li.appendChild(sl); ul.appendChild(li); sels.push(sl);
      });
      B.appendChild(ul);
      if (!F.quiet) {
        btn(F.ctl, 'Check', function () {
          var n = 0; sels.forEach(function (s, i) { var ok = s.value === list[i].fail; if (ok) n++; s.parentNode.classList.toggle('ok', ok); s.parentNode.classList.toggle('bad', !ok && !!s.value); });
          F.say(okMark(n === list.length) + ' ' + n + ' of ' + list.length + ' right.' + (n === list.length ? ' Ventris\'s reading of Linear B passed all four: its values made Greek across thousands of tablets, gave the Cretan place names, and predicted the words on the tripod tablet before anyone had read it.' : ' Look again at the ones marked.'));
        }, 'pri');
      }
    }
    return {};
  });
  /* ---------------------------------------------------------------- sc-map */
  var SCRIPT_NAMES = { CH: 'Cretan hieroglyphs', A: 'Linear A', B: 'Linear B', CM: 'Cypro-Minoan' };
  var MAJOR = { knossos: 1, phaistos: 1, zakros: 1, chania: 1, pylos: 1, mycenae: 1, thebes: 1, akrotiri: 1, enkomi: 1 };
  // in the wide views Crete's sites sit close together, so their labels move apart
  var LABW = { knossos: [0, -11], phaistos: [-9, 13], zakros: [9, 6], chania: [-9, -6], mycenae: [-9, -6], pylos: [-9, 4], thebes: [9, 4], akrotiri: [9, 4], enkomi: [9, 4] };
  // label placement [dx, dy] in px from the dot (text anchor follows dx's sign)
  var LAB = { knossos: [9, -1], iouktas: [9, 12], malia: [0, -11], triada: [-9, 4], phaistos: [9, 10], zakros: [-9, 4], palaikastro: [-9, -6],
    chania: [0, -11], pylos: [-9, 4], iklaina: [9, 9], mycenae: [-9, -5], midea: [9, -2], tiryns: [-9, 11], thebes: [9, 4], vasileios: [9, 5],
    volos: [9, 4], akrotiri: [9, 5], phylakopi: [-9, 4], kea: [9, 4], enkomi: [9, 4] };
  function arcPath(cx, cy, r, a0, a1) {
    var x0 = cx + r * M.cos(a0), y0 = cy + r * M.sin(a0), x1 = cx + r * M.cos(a1), y1 = cy + r * M.sin(a1);
    return 'M' + cx + ' ' + cy + ' L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > M.PI ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + 'Z';
  }
  V.register('sc-map', function (el, o) {
    o = o || {};
    var mode = o.mode || 'show', view = o.view || 'aegean';
    var F = frame(el, o, 'map', 'Map of the Bronze Age Aegean with the find spots of its scripts');
    var on = {}; (o.scripts || ['CH', 'A', 'B', 'CM']).forEach(function (s) { on[s] = true; });
    var only = o.sites || null, choices = o.choices || (mode === 'pick' ? ['knossos', 'pylos', 'phaistos', 'mycenae'] : null), target = o.target || null, pin = null, picked = null;
    var bar = h('div', 'scm-bar'); F.body.appendChild(bar);
    if (o.views !== false) V.seg(bar, { label: 'View', items: [['aegean', 'Aegean'], ['crete', 'Crete'], ['mainland', 'Mainland'], ['wide', 'With Cyprus']], value: view, change: function (v) { view = v; draw(); } });
    if (o.chips !== false && mode === 'show') {
      var chips = h('div', 'scm-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Scripts shown');
      ['CH', 'A', 'B', 'CM'].forEach(function (k) { chip(chips, '<i class="scm-key scm-' + k + '"></i>' + esc(SCRIPT_NAMES[k]), !!on[k], function (v) { on[k] = v; draw(); }); });
      bar.appendChild(chips);
    }
    var stage = h('div', 'scm-stage'); F.body.appendChild(stage);
    function visibleSites() {
      return SC.SITES.filter(function (s) {
        if (only && only.indexOf(s.key) < 0) return false;
        if (choices && mode === 'pick') return choices.indexOf(s.key) >= 0;
        if (mode === 'place') return false;
        return s.scripts.some(function (k) { return on[k]; });
      });
    }
    function draw() {
      stage.innerHTML = '';
      var b = SC.VIEWS[view] || SC.VIEWS.aegean, p0 = SC.project(b[1], b[2]), p1 = SC.project(b[0], b[3]);
      var vx = p0[0], vy = p0[1], vw = p1[0] - p0[0], vh = p1[1] - p0[1];
      var pxW = M.max(260, stage.clientWidth || el.clientWidth || 600), k = vw / pxW; // km per px
      var svg = sv('svg', { viewBox: [vx, vy, vw, vh].map(function (v) { return v.toFixed(1); }).join(' '), class: 'scv-svg scm-svg', role: 'img', 'aria-label': 'Map: ' + { aegean: 'the Aegean', crete: 'Crete', mainland: 'mainland Greece', wide: 'the Aegean and Cyprus' }[view] });
      var cid = uid('clip'), defs = sv('defs', null, svg), cp = sv('clipPath', { id: cid }, defs); sv('rect', { x: vx, y: vy, width: vw, height: vh }, cp);
      var G = sv('g', { 'clip-path': 'url(#' + cid + ')' }, svg);
      sv('rect', { x: vx, y: vy, width: vw, height: vh, class: 'scm-sea' }, G);
      SC.GEO.land.forEach(function (poly) { sv('path', { d: poly.map(function (q, i) { var p = SC.project(q[0], q[1]); return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'Z', class: 'scm-land', 'stroke-width': 0.9 * k }, G); });
      SC.GEO.isles.forEach(function (e) { var p = SC.project(e[0], e[1]), ry = e[2] * 111.32, rx = e[3] * 111.32 * M.cos(37.5 * M.PI / 180); sv('ellipse', { cx: p[0], cy: p[1], rx: rx, ry: ry, transform: 'rotate(' + (e[4] || 0) + ' ' + p[0] + ' ' + p[1] + ')', class: 'scm-land', 'stroke-width': 0.9 * k }, G); });
      var fs = 12 * k;
      var boxes = []; // placed labels and dots, in km, so later labels can avoid them
      function free(x0, y0, x1, y1) { for (var i = 0; i < boxes.length; i++) { var q = boxes[i]; if (x0 < q[2] && x1 > q[0] && y0 < q[3] && y1 > q[1]) return false; } return true; }
      function place(x, y, str, size, anchor, force) { // returns true if the label fits; the box is in km around the text
        var w = str.length * size * 0.58, x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x, b = [x0 - 2 * k, y - size * 0.95, x0 + w + 2 * k, y + size * 0.25];
        if (!force && (!free(b[0], b[1], b[2], b[3]) || b[0] < vx || b[2] > vx + vw || b[1] < vy || b[3] > vy + vh)) return false; boxes.push(b); return true;
      }
      var list = visibleSites(), r = 7 * k;
      list.forEach(function (s) { var p = SC.project(s.lat, s.lon), rr = r * 0.8; boxes.push([p[0] - rr, p[1] - rr, p[0] + rr, p[1] + rr]); });
      list = list.slice().sort(function (a, b) { return (MAJOR[b.key] ? 1 : 0) - (MAJOR[a.key] ? 1 : 0); });
      list.forEach(function (s, i) {
        var p = SC.project(s.lat, s.lon), g = sv('g', { class: 'scm-site' + (picked === s.key ? ' on' : '') }, G);
        if (mode === 'pick') {
          sv('circle', { cx: p[0], cy: p[1], r: r * 1.35, class: 'scm-pick' }, g);
          txt(g, p[0], p[1] + 4.2 * k, letter(choices.indexOf(s.key)), { class: 'scm-pickt', 'font-size': fs, 'text-anchor': 'middle' });
        } else {
          var ks = s.scripts.filter(function (x) { return on[x]; });
          if (ks.length === 1) sv('circle', { cx: p[0], cy: p[1], r: r, class: 'scm-dot scm-' + ks[0] }, g);
          else ks.forEach(function (x, j) { var a0 = -M.PI / 2 + j * 2 * M.PI / ks.length; sv('path', { d: arcPath(p[0], p[1], r, a0, a0 + 2 * M.PI / ks.length), class: 'scm-dot scm-' + x }, g); });
          sv('circle', { cx: p[0], cy: p[1], r: r, class: 'scm-ring', 'stroke-width': 1.4 * k }, g);
        }
        var showLab = mode !== 'pick' && o.labels !== false && (view !== 'aegean' && view !== 'wide' ? true : MAJOR[s.key]);
        if (showLab && !(F.quiet && s.key === target)) {
          var L0 = ((view === 'aegean' || view === 'wide') && LABW[s.key]) || LAB[s.key] || [9, 4], L = null, anc;
          [L0, [9, 4], [-9, 4], [0, -11], [0, 17], [9, -8], [-9, -8]].some(function (c) { var an = c[0] < 0 ? 'end' : c[0] > 0 ? 'start' : 'middle'; if (place(p[0] + c[0] * k, p[1] + c[1] * k, s.name, fs, an)) { L = c; anc = an; return true; } return false; });
          if (!L && MAJOR[s.key]) { L = L0; anc = L[0] < 0 ? 'end' : L[0] > 0 ? 'start' : 'middle'; place(p[0] + L[0] * k, p[1] + L[1] * k, s.name, fs, anc, true); }
          if (L)
            txt(g, p[0] + L[0] * k, p[1] + L[1] * k, s.name, { class: 'scm-sitet', 'font-size': fs, 'text-anchor': anc, 'stroke-width': 3 * k });
        }
        if (F.interactive) {
          var hit = sv('circle', { cx: p[0], cy: p[1], r: M.max(r * 2, 13 * k), class: 'scm-hit', tabindex: 0, role: 'button', 'aria-label': mode === 'pick' ? 'Place ' + letter(choices.indexOf(s.key)) : s.name }, g);
          var act = function () {
            if (mode === 'pick') { picked = s.key; draw(); F.say(F.quiet ? 'You chose place ' + letter(choices.indexOf(s.key)) + '.' : 'Place ' + letter(choices.indexOf(s.key)) + ' chosen. Press Check.'); if (o.onPick) o.onPick(s.key); return; }
            picked = s.key; draw();
            F.say('<b>' + esc(s.name) + '</b> · ' + s.scripts.map(function (x) { return '<i class="scm-key scm-' + x + '"></i>' + esc(SCRIPT_NAMES[x]); }).join(', ') + '<br>' + esc(s.note));
          };
          hit.addEventListener('click', act);
          hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        }
      });
      if (o.labels !== false) {
        if (mode === 'show') SC.CITIES.forEach(function (c) {
          if (c.zoom && (view === 'aegean' || view === 'wide')) return; if (c.key === 'nicosia' && view !== 'wide') return;
          var lft = c.key === 'heraklion' || c.key === 'nicosia', p = SC.project(c.lat, c.lon), nm = c.name + (c.key === 'troy' ? '' : ' (today)');
          var tx = p[0] + (lft ? -6 : 6) * k, ty = p[1] + (lft ? -5 : 4) * k;
          if (!place(tx, ty, nm, fs * 0.88, lft ? 'end' : 'start')) return;
          sv('rect', { x: p[0] - 3 * k, y: p[1] - 3 * k, width: 6 * k, height: 6 * k, class: 'scm-city' }, G);
          txt(G, tx, ty, nm, { class: 'scm-cityt', 'font-size': fs * 0.88, 'text-anchor': lft ? 'end' : 'start' });
        });
        SC.GEO.seas.forEach(function (q) { var p = SC.project(q.lat, q.lon); if (place(p[0], p[1], q.name, fs * 1.05, 'middle')) txt(G, p[0], p[1], q.name, { class: 'scm-seat', 'font-size': fs * 1.05, 'text-anchor': 'middle' }); });
        SC.GEO.regions.forEach(function (q) { var p = SC.project(q.lat, q.lon); if (place(p[0], p[1], q.name + '  ', fs * 0.92, 'middle')) txt(G, p[0], p[1], q.name, { class: 'scm-reg', 'font-size': fs * 0.92, 'text-anchor': 'middle', 'letter-spacing': 2 * k }); });
      }
      if (pin) { var pp = SC.project(pin.lat, pin.lon); sv('path', { d: 'M' + pp[0] + ' ' + pp[1] + ' l' + (-6 * k) + ' ' + (-14 * k) + ' a' + (6 * k) + ' ' + (6 * k) + ' 0 1 1 ' + (12 * k) + ' 0Z', class: 'scm-pin' }, G); }
      if (mode === 'place' && F.interactive) {
        svg.setAttribute('tabindex', '0'); svg.classList.add('scm-placing');
        svg.addEventListener('click', function (e) {
          var q = svgPt(svg, e), lat = -q.y / 111.32, lon = q.x / (M.cos(37.5 * M.PI / 180) * 111.32);
          pin = { lat: lat, lon: lon }; draw(); F.say(F.quiet ? 'Pin placed.' : 'Pin placed. Press Check.'); if (o.onPlace) o.onPlace(pin);
        });
        svg.addEventListener('keydown', function (e) {
          var d = { ArrowUp: [0.08, 0], ArrowDown: [-0.08, 0], ArrowLeft: [0, -0.1], ArrowRight: [0, 0.1] }[e.key];
          if (!d) return; e.preventDefault();
          var b2 = SC.VIEWS[view]; if (!pin) pin = { lat: (b2[0] + b2[1]) / 2, lon: (b2[2] + b2[3]) / 2 };
          pin = { lat: pin.lat + d[0], lon: pin.lon + d[1] }; draw(); var s2 = stage.querySelector('svg'); if (s2) s2.focus();
        });
      }
      // a scale bar: 100 km
      var sbx = vx + 14 * k, sby = vy + vh - 14 * k;
      sv('line', { x1: sbx, x2: sbx + 100, y1: sby, y2: sby, class: 'scm-scale', 'stroke-width': 2.4 * k }, svg);
      txt(svg, sbx + 50, sby - 5 * k, '100 km', { class: 'scm-scalet', 'font-size': fs * 0.85, 'text-anchor': 'middle' });
      stage.appendChild(svg);
      if (mode === 'show' && o.legend !== false) {
        var lg = h('p', 'scm-legend'); lg.innerHTML = ['CH', 'A', 'B', 'CM'].filter(function (x) { return on[x]; }).map(function (x) { return '<span><i class="scm-key scm-' + x + '"></i>' + esc(SCRIPT_NAMES[x]) + '</span>'; }).join('') + '<span><i class="scm-key scm-city"></i>modern city</span>';
        stage.appendChild(lg);
      }
    }
    if (mode === 'pick' && target && !F.quiet) {
      F.body.insertBefore(h('p', 'scv-task', 'Which lettered place is <b>' + esc((SC.site(target) || {}).name || target) + '</b>?'), F.body.firstChild);
      btn(F.ctl, 'Check', function () { if (!picked) { F.say('Tap a lettered place first.'); return; } var ok = picked === target; F.say(okMark(ok) + ' ' + (ok ? 'Yes: ' : 'Not quite: that is ' + esc(SC.site(picked).name) + '. ') + esc(SC.site(target).note)); }, 'pri');
    }
    if (mode === 'place' && target && !F.quiet) {
      var T1 = SC.site(target) || {};
      F.body.insertBefore(h('p', 'scv-task', 'Tap the map where <b>' + esc(T1.name) + '</b> is (arrow keys move the pin).'), F.body.firstChild);
      btn(F.ctl, 'Check', function () {
        if (!pin) { F.say('Tap the map to drop a pin first.'); return; }
        var d = SC.km(pin, T1), ok = d <= (o.tol || 40);
        F.say(okMark(ok) + ' Your pin is ' + M.round(d) + ' km from ' + esc(T1.name) + '. ' + (ok ? esc(T1.note) : 'Try again.'));
      }, 'pri');
    }
    onResize(stage, draw);
    draw();
    return { update: function (n) { Object.assign(o, n || {}); if (n && n.view) view = n.view; draw(); } };
  });
  /* ---------------------------------------------------------------- sc-timeline */
  function itemYear(it) { return it.y !== undefined ? it.y : it.from; }
  function itemSpan(it) { return it.y !== undefined ? (it.y > 0 ? String(M.floor(it.y)) : SC.year(it.y, true)) : SC.span(it.from, it.to, true); }
  V.register('sc-timeline', function (el, o) {
    o = o || {};
    var mode = o.mode || 'show', modern = mode === 'modern' || (mode === 'order' && o.modern);
    var F = frame(el, o, 'timeline', modern ? 'Timeline of the discovery and decipherment, AD 1900 to 1956' : 'Timeline of the Bronze Age Aegean and its scripts');
    var asks = (o.ask || []).map(String), sel = null;
    if (mode === 'order') return orderMode(el, o, F);
    var y0 = modern ? (o.from || 1895) : (o.from || -3200), y1 = modern ? (o.to || 1960) : (o.to || -700);
    var rowsWanted = modern ? ['events'] : (o.rows || ['periods', 'scripts', 'events']);
    var only = o.items || null;
    function keep(it) { return !only || only.indexOf(it.key) >= 0; }
    var wrap = h('div', 'sctl-wrap'); F.body.appendChild(wrap);
    function label(it) { return F.quiet && asks.indexOf(it.key) >= 0 ? '?' : it.name; }
    function draw() {
      wrap.innerHTML = '';
      var avail = M.max(280, (wrap.clientWidth || el.clientWidth || 640) - 2), Wd = M.max(avail, 600), padL = 12, padR = 12;
      var X = function (y) { return padL + (y - y0) / (y1 - y0) * (Wd - padL - padR); };
      var svg = svgRoot(Wd, 100, modern ? 'Discovery timeline' : 'Aegean timeline', 'sctl-svg');
      svg.style.width = Wd + 'px';
      var y = 8;
      function bar(it, lane, cls) {
        var a = M.max(y0, it.from), b = M.min(y1, it.to);
        if (b <= y0 || a >= y1) return;
        var g = sv('g', { class: 'sctl-it ' + cls + (sel === it.key ? ' on' : '') + (asks.indexOf(it.key) >= 0 ? ' ask' : '') }, svg);
        var x0 = X(a), x1 = X(b), yy = lane;
        if (it.pm) {
          [it.from, it.to].forEach(function (e) { if (e > y0 && e < y1) sv('line', { x1: X(e - it.pm), x2: X(e + it.pm), y1: yy + 11, y2: yy + 11, class: 'sctl-whisk' }, g); });
        }
        sv('rect', { x: x0, y: yy + 2, width: M.max(2, x1 - x0), height: 18, rx: 4, class: 'sctl-bar' }, g);
        var lab = label(it), lw = lab.length * 6.6 + 8, fits = (x1 - x0) > lw, right = x1 + 4 + lw < Wd - 2;
        txt(g, fits ? (x0 + x1) / 2 : right ? x1 + 5 : x0 - 5, yy + 15, lab, { class: 'sctl-bt' + (fits ? '' : ' out'), 'text-anchor': fits ? 'middle' : right ? 'start' : 'end' });
        if (it.to > y1) txt(g, x1 - 2, yy + 15, '→', { class: 'sctl-bt', 'text-anchor': 'end' });
        hit(g, x0, yy, x1 - x0, 22, it);
      }
      function hit(g, x, yy, w, hh, it) {
        if (!F.interactive) return;
        var r = sv('rect', { x: x - 3, y: yy, width: M.max(w + 6, 16), height: hh, class: 'sctl-hit', tabindex: 0, role: 'button', 'aria-label': label(it) + (F.quiet ? '' : ', ' + itemSpan(it)) }, g);
        var act = function () { sel = it.key; draw(); if (!F.quiet || asks.indexOf(it.key) < 0) F.say(F.quiet ? '<b>' + esc(label(it)) + '</b>' : '<b>' + esc(it.name) + '</b> · ' + esc(itemSpan(it)) + (it.pm ? ' (give or take ' + it.pm + ' years)' : '') + '<br>' + esc(it.note || '')); var f = wrap.querySelector('[data-k="' + it.key + '"]'); if (f) f.focus(); };
        r.setAttribute('data-k', it.key);
        r.addEventListener('click', act); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      }
      if (rowsWanted.indexOf('periods') >= 0) {
        txt(svg, padL, y + 10, 'PERIODS', { class: 'sctl-rowh' }); y += 16;
        var maxRow = 0; SC.PERIODS.forEach(function (p) { if (keep(p)) maxRow = M.max(maxRow, p.row); });
        for (var r = 0; r <= maxRow; r++) { SC.PERIODS.filter(function (p) { return p.row === r && keep(p); }).forEach(function (p) { bar(p, y, 'sctl-p sctl-p' + r); y += 24; }); }
        y += 6;
      }
      if (rowsWanted.indexOf('scripts') >= 0) {
        txt(svg, padL, y + 10, 'SCRIPTS', { class: 'sctl-rowh' }); y += 16;
        SC.SCRIPTS.filter(keep).forEach(function (s) { bar(s, y, 'sctl-s sctl-' + s.key); y += 26; });
        y += 6;
      }
      if (rowsWanted.indexOf('events') >= 0) {
        var evs = (modern ? SC.MODERN : SC.EVENTS).filter(keep).filter(function (e) { return e.y >= y0 && e.y <= y1; }).slice().sort(function (a, b) { return a.y - b.y; });
        txt(svg, padL, y + 10, modern ? 'DISCOVERY AND DECIPHERMENT' : 'EVENTS', { class: 'sctl-rowh' }); y += 18;
        var laneEnd = [], laneY = y + 18;
        var labs = [];
        evs.forEach(function (e) {
          var x = X(e.y), lab = label(e), w = lab.length * 6.4 + 10, ln = 0;
          var left = x + w > Wd - padR; // labels near the right edge go to the left of the dot
          var s0 = left ? x - w : x - 4, s1 = left ? x + 4 : x + w;
          while (laneEnd[ln] !== undefined && laneEnd[ln] > s0) ln++;
          laneEnd[ln] = s1;
          var g = sv('g', { class: 'sctl-it sctl-e' + (sel === e.key ? ' on' : '') + (asks.indexOf(e.key) >= 0 ? ' ask' : '') }, svg), ly = laneY + ln * 20;
          if (e.pm) sv('line', { x1: X(e.y - e.pm), x2: X(e.y + e.pm), y1: y + 6, y2: y + 6, class: 'sctl-whisk' }, g);
          sv('line', { x1: x, x2: x, y1: y + 6, y2: ly + 4, class: 'sctl-stem' }, g);
          sv('circle', { cx: x, cy: y + 6, r: 4.5, class: 'sctl-dot' }, g);
          labs.push([g, left ? x - 3 : x + 3, ly + 8, lab, left, e, w]);
        });
        labs.forEach(function (L) {
          var g = L[0], e = L[5], x = X(e.y);
          txt(g, L[1], L[2], L[3], { class: 'sctl-et', 'text-anchor': L[4] ? 'end' : 'start' });
          hit(g, L[4] ? x - L[6] : x - 6, y, L[6] + 6, L[2] - y + 6, e);
          svg.appendChild(g);
        });
        y = laneY + M.max(1, laneEnd.length) * 20 + 4;
      }
      if (o.now !== undefined && o.now >= y0 && o.now <= y1) sv('line', { x1: X(o.now), x2: X(o.now), y1: 4, y2: y, class: 'sctl-now' }, svg);
      // the axis
      sv('line', { x1: padL, x2: Wd - padR, y1: y + 4, y2: y + 4, class: 'sctl-axis' }, svg);
      var step = modern ? 10 : (y1 - y0 > 1800 ? 500 : y1 - y0 > 700 ? 200 : 100);
      for (var t = M.ceil(y0 / step) * step; t <= y1; t += step) {
        sv('line', { x1: X(t), x2: X(t), y1: y + 4, y2: y + 9, class: 'sctl-axis' }, svg);
        txt(svg, X(t), y + 22, modern ? String(t) : t < 0 ? (-t) + ' BC' : t === 0 ? '' : 'AD ' + t, { class: 'sctl-tick', 'text-anchor': 'middle' });
      }
      svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + (y + 30));
      svg.setAttribute('aria-label', (modern ? 'Discovery and decipherment, ' : 'The Bronze Age Aegean, ') + (modern ? y0 + ' to ' + y1 : SC.year(y0) + ' to ' + SC.year(y1)));
      wrap.appendChild(svg);
      if (Wd > avail + 4) wrap.appendChild(h('p', 'sctl-swipe', '← Swipe sideways to see the whole timeline →'));
      if (!modern && !F.quiet && o.note !== false) { var n0 = wrap.querySelector('.sctl-note'); if (!n0) wrap.appendChild(h('p', 'scv-hint sctl-note', 'Dates are approximate. Whiskers show how far a date could move; some dates, like Thera\'s eruption and the fall of Knossos, are debated.')); }
    }
    onResize(wrap, draw);
    draw();
    return { update: function (n) { Object.assign(o, n || {}); draw(); } };
  });
  function orderMode(el, o, F) {
    var keys = o.items || ['evans', 'kober', 'ventris', 'tripod'];
    var items = keys.map(function (k) { return SC.item(k); }).filter(Boolean);
    var cur = derange(items, 'order' + keys.join());
    var ul = h('ol', 'sctl-order'); F.body.appendChild(h('p', 'scv-hint', 'Put these in order, earliest first. Use the arrows (or select one, then another, to swap them).')); F.body.appendChild(ul);
    var pickI = -1;
    function draw() {
      ul.innerHTML = '';
      cur.forEach(function (it, i) {
        var li = h('li', 'sctl-oi' + (pickI === i ? ' on' : ''));
        var b = h('button', 'sctl-oname', esc(it.name)); b.type = 'button'; b.setAttribute('aria-pressed', pickI === i ? 'true' : 'false');
        b.addEventListener('click', function () { if (pickI < 0) pickI = i; else { var t = cur[pickI]; cur[pickI] = cur[i]; cur[i] = t; pickI = -1; } draw(); F.say(''); });
        var up = h('button', 'ml-btn sctl-ob', '↑'); up.type = 'button'; up.setAttribute('aria-label', 'Move ' + it.name + ' up'); up.disabled = i === 0;
        var dn = h('button', 'ml-btn sctl-ob', '↓'); dn.type = 'button'; dn.setAttribute('aria-label', 'Move ' + it.name + ' down'); dn.disabled = i === cur.length - 1;
        up.addEventListener('click', function () { var t = cur[i - 1]; cur[i - 1] = cur[i]; cur[i] = t; pickI = -1; draw(); var q = ul.querySelectorAll('.sctl-ob')[2 * (i - 1)]; if (q) q.focus(); });
        dn.addEventListener('click', function () { var t = cur[i + 1]; cur[i + 1] = cur[i]; cur[i] = t; pickI = -1; draw(); var q = ul.querySelectorAll('.sctl-ob')[2 * (i + 1) + 1]; if (q) q.focus(); });
        li.appendChild(b); li.appendChild(up); li.appendChild(dn); ul.appendChild(li);
      });
      if (o.onChange) o.onChange(cur.map(function (x) { return x.key; }));
    }
    if (!F.quiet) btn(F.ctl, 'Check', function () {
      var ok = cur.every(function (it, i) { return !i || itemYear(cur[i - 1]) <= itemYear(it); });
      F.say(okMark(ok) + ' ' + (ok ? 'Right: ' : 'Not yet. The order is: ') + cur.slice().sort(function (a, b) { return itemYear(a) - itemYear(b); }).map(function (it) { return esc(it.name) + ' (' + esc(itemSpan(it)) + ')'; }).join(', ') + '.');
    }, 'pri');
    draw();
    return { get: function () { return cur.map(function (x) { return x.key; }); } };
  }
  /* ---------------------------------------------------------------- sc-numbers */
  var PLACE_NAME = { 1: 'ones: upright strokes', 10: 'tens: level strokes', 100: 'hundreds: circles', 1000: 'thousands: circles with rays', 10000: 'ten thousands: circles with rays and a bar' };
  function fracVal(s) { // '3 J' or 'J' or 5 -> number
    var t = 0; String(s).trim().split(/\s+/).forEach(function (p) { if (/^\d+$/.test(p)) t += +p; else { var f = SC.fraction(p); if (f && f.val) t += f.val; } }); return t;
  }
  function fracSigns(s) { return String(s).trim().split(/\s+/).map(function (p) { if (/^\d+$/.test(p)) return glyph(SC.num(+p)); var f = SC.fraction(p); return f ? glyph(f.u, true) : ''; }).join(' '); }
  function numHTML(n, big) { return '<span class="scn-num sc-b' + (big ? ' big' : '') + '" role="img" aria-label="Aegean numeral">' + esc(SC.num(n)) + '</span>'; }
  V.register('sc-numbers', function (el, o) {
    o = o || {};
    var mode = o.mode || 'show';
    var F = frame(el, o, 'numbers', { show: 'An Aegean number and its marks', read: 'Read an Aegean number', build: 'Build an Aegean number', sum: 'A list and its total', fractions: 'Linear A fraction signs', measures: 'Mycenaean measures' }[mode] || 'Aegean numbers');
    var B = F.body;
    if (mode === 'show' || mode === 'read') {
      var n = +(o.n || 1234);
      B.appendChild(h('div', 'scn-stage', numHTML(n, true)));
      var parts = SC.numParts(n);
      var tab = h('div', 'scn-parts');
      function fill(reveal) {
        tab.innerHTML = parts.map(function (p) { return '<div class="scn-part"><span class="sc-b scn-pg">' + esc(p.u) + '</span><span class="scn-pl">' + (reveal ? p.count + ' × ' + p.place + ' = ' + (p.count * p.place) : '?') + '</span><small>' + esc(PLACE_NAME[p.place]) + '</small></div>'; }).join('<span class="scn-plus" aria-hidden="true">+</span>') +
          (reveal ? '<p class="scn-total">= <b>' + n + '</b></p>' : '');
      }
      if (mode === 'show' && !F.quiet) { fill(true); B.appendChild(tab); }
      else if (mode === 'read' && !F.quiet) { var rb = btn(F.ctl, 'Show the value', function () { fill(true); if (!tab.parentNode) B.appendChild(tab); rb.hidden = true; }, 'pri'); }
    } else if (mode === 'build') {
      var target = +(o.target || 352), have = { 10000: 0, 1000: 0, 100: 0, 10: 0, 1: 0 };
      if (!F.quiet) B.appendChild(h('p', 'scv-task', 'Build the number <b>' + target + '</b>.'));
      var show = h('div', 'scn-stage'); B.appendChild(show);
      var pad = h('div', 'scn-pad'); B.appendChild(pad);
      var val = function () { return [10000, 1000, 100, 10, 1].reduce(function (a, p) { return a + have[p] * p; }, 0); };
      var render = function () { var v = val(); show.innerHTML = v ? numHTML(v, true) : '<span class="scv-hint">Tap the marks below.</span>'; if (o.onChange) o.onChange(v); };
      [1, 10, 100, 1000, 10000].forEach(function (p) {
        var b = h('button', 'scn-key', '<span class="sc-b">' + esc(SC.num(p)) + '</span><small>' + p + '</small>'); b.type = 'button'; b.setAttribute('aria-label', 'add ' + p);
        b.addEventListener('click', function () { if (have[p] < 9) have[p]++; else F.say('Nine is the most of one mark; ten of them make the next mark up.'); render(); }); pad.appendChild(b);
      });
      btn(F.ctl, 'Take one away', function () { for (var i = 0, ps = [1, 10, 100, 1000, 10000]; i < 5; i++) if (have[ps[i]]) { have[ps[i]]--; break; } render(); });
      btn(F.ctl, 'Clear', function () { Object.keys(have).forEach(function (k) { have[k] = 0; }); render(); F.say(''); });
      if (!F.quiet) btn(F.ctl, 'Check', function () { var v = val(); F.say(okMark(v === target) + ' ' + (v === target ? 'Yes, ' + target + '.' : 'Your marks add up to ' + v + ', not ' + target + '.')); }, 'pri');
      render();
    } else if (mode === 'sum') {
      var items = o.items || [10, 5, '3 J', '1 J'], A = items.some(function (x) { return /[A-Z]/.test(String(x)); }) || o.script === 'A';
      var tot = items.reduce(function (a, x) { return a + fracVal(x); }, 0);
      var tb = '<table class="scs-tab scn-sum"><tbody>';
      items.forEach(function (x, i) { tb += '<tr><td class="scn-lab">' + (o.labels ? esc(o.labels[i]) : 'line ' + (i + 1)) + '</td><td>' + fracSigns(x) + '</td><td class="scn-v">' + (F.quiet ? '' : esc(String(x).replace(/\bJ\b/, '½'))) + '</td></tr>'; });
      var whole = M.floor(tot + 1e-9), half = M.abs(tot - whole - 0.5) < 1e-9;
      var totStr = whole + (half ? ' J' : ''), exact = M.abs(tot - whole) < 1e-9 || half;
      tb += '<tr class="scn-ku"><td class="scn-lab">' + (A ? glyph(SC.toSigns('ku-ro', 'A'), true) + ' ' + tl('ku-ro') : glyph(SC.toSigns('to-so')) + ' ' + tl('to-so')) + '</td><td>' + (o.ask ? '<b class="sct-q">?</b>' : exact ? fracSigns(totStr) : '') + '</td><td class="scn-v">' + (o.ask || F.quiet ? '' : esc(String(+tot.toFixed(4)).replace(/\.5$/, '½'))) + '</td></tr>';
      B.appendChild(h('div', 'scv-tabwrap', tb + '</tbody></table>'));
      if (!F.quiet && !o.ask) B.appendChild(h('p', 'scs-note', A ? 'The last line begins with ku-ro, and its number is the sum of the lines above. That is why ku-ro is widely accepted to mean "total"; it says nothing about the language.' : 'In Linear B a total is introduced by to-so (tosos, "so many").'));
    } else if (mode === 'fractions') {
      var tf = '<table class="scs-tab"><thead><tr><th>Sign</th><th>Letter</th><th>Proposed value</th><th>How sure</th></tr></thead><tbody>';
      SC.FRACTIONS.forEach(function (f) { tf += '<tr' + (f.sure === 'accepted' ? ' class="scn-acc"' : '') + '><td>' + glyph(f.u, true) + '</td><td>' + esc(f.k) + '</td><td>' + (F.quiet ? '?' : esc(f.num)) + '</td><td>' + esc(f.note) + '</td></tr>'; });
      B.appendChild(h('div', 'scv-tabwrap', tf + '</tbody></table>'));
      B.appendChild(h('p', 'scs-note', 'Scholars name the Linear A fraction signs with letters. Their values are worked out from lists whose totals must add up; only J, one half, is widely agreed. Signs can also combine: JE is read as 3/4.'));
    } else if (mode === 'measures') {
      var sys = o.system || 'dry', MS = SC.MEASURES[sys];
      if (o.systems !== false) V.seg(F.ctl, { label: 'Measure', items: [['dry', 'Dry'], ['liquid', 'Liquid'], ['weight', 'Weight']], value: sys, change: function (v) { sys = v; MS = SC.MEASURES[v]; drawM(); } });
      var mBox = h('div', 'scn-meas'); B.appendChild(mBox);
      var drawM = function () {
        var rows = '', f = 1, prev = 'the unit', prevSign = '';
        MS.steps.forEach(function (st) {
          f *= st[1]; var L = SC.logo(st[0]), sg = '<span class="sc-b scn-ms">' + esc(L ? L.u : st[0]) + '</span>';
          rows += '<tr><td>1 ' + (prevSign || esc(prev)) + '</td><td>=</td><td><b>' + (F.quiet && o.ask === st[0] ? '?' : st[1]) + '</b> ' + sg + ' <b>' + esc(st[0]) + '</b></td><td class="scn-v">' + (F.quiet ? '' : 'so 1 ' + esc(st[0]) + ' is 1/' + f + ' of the unit') + '</td></tr>';
          prev = st[0]; prevSign = sg + ' <b>' + esc(st[0]) + '</b>';
        });
        mBox.innerHTML = '<p class="scn-mh">' + esc(MS.name) + '</p><p class="scv-hint">The largest unit is ' + esc(MS.top) + '.</p><div class="scv-tabwrap"><table class="scs-tab scn-mt"><tbody>' + rows + '</tbody></table></div>' + (MS.more ? '<p class="scv-hint">' + esc(MS.more) + '</p>' : '') + '<p class="scs-note">Each smaller unit is a fixed part of the one above it, and the steps are not tens. ' + esc(MS.approx) + '</p>';
      };
      drawM();
    }
    return {};
  });
})(typeof window !== "undefined" ? window : globalThis, typeof document !== "undefined" ? document : null);
