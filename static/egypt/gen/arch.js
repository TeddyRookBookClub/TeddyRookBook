/* Archaeology and Later Scripts (Egyptology Ladder, course key arch): problem generators for all 47 topics.
   Built from /tmp/work_egypt/arch/gen/*.js by build_gen.js (do not edit the shipped file by hand).
   Facts come from the sources cited in each lesson (Wikipedia's current articles, Gardiner 1927, Shaw 2000). Dates before
   664 BC carry "c."; exact years are asked only for modern events (1798 on) and AD inscriptions.
   Shapes: fact questions (mc with distractors drawn from the topic's trouble note), years (num), year arithmetic across
   BC/AD (num), put events in order (mc of sequences), classify (mc), true or false (tf), read a cartouche or sign with the
   kit's model (MathLadder.egypt: NAMES, SIGNS, WORDS, DESCENT, KINGS, SITES), transliterate (translit), seriation and
   stratigraphy puzzles built from random graves and layers, radiocarbon and luminescence arithmetic, Coptic letters,
   words and numerals. p.chk carries the fact ids the problem uses, for the independent checker (not shown). */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen;
  function EG() { return ML.egypt; }
  function L(ctx) { return (ctx && ctx.level) || 1; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cap(s) { s = String(s); return /^[a-z]/.test(s) ? s.charAt(0).toUpperCase() + s.slice(1) : s; } // transliteration letters (ṯ, ꜥ) keep their case
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function cop(s) { return '<span class="eg-cop">' + s + '</span>'; }
  function tl(s) { return '<i class="eg-tl">' + s + '</i>'; }
  function hg(s) { return '<span class="eg-h">' + s + '</span>'; }
  function yr(y) { return y < 0 ? (-y) + ' BC' : y < 1000 ? 'AD ' + y : String(y); }

  // multiple choice: the right answer first, then up to k-1 different wrong ones (makeProblem shuffles them)
  function mc(R, right, wrongs, k) {
    var seen = {}, w = []; seen[String(right)] = 1;
    R.shuffle(wrongs).forEach(function (x) { x = String(x); if (!seen[x]) { seen[x] = 1; w.push(x); } });
    return { t: 'mc', choices: [String(right)].concat(w.slice(0, (k || 4) - 1)), v: 0 };
  }
  // one question from a bank: { q, a, w: [wrongs], s: [steps], h: hint, lv: lowest level, k, viz, chk } or tf: true|false,
  // or num: n (a whole number), or a function (R, ctx) -> such an item. Items at the current level are preferred.
  // the 'translit' answer type needs core/gen.js to know it; until it does, a transliteration item falls back to
  // multiple choice among it.tlw (near misses), so practice never breaks
  var TL_OK = (function () { try { return ML.validateProblem({ q: 'x', steps: ['x'], a: { t: 'translit', v: 'nfr' } }).length === 0; } catch (e) { return false; } })();
  function prob(R, it) {
    var a = it.tf !== undefined ? { t: 'tf', v: it.tf } : it.num !== undefined ? { t: 'num', v: String(it.num), form: 'int' } : it.text !== undefined ? { t: 'text', v: it.text } : null;
    if (it.tl !== undefined) {
      if (TL_OK) a = { t: 'translit', v: it.tl };
      else { a = mc(R, it.tl, it.tlw || [], 4); it.q = it.q.replace(/^Transliterate /, 'Choose the transliteration of ').replace(/How is the word read\?$/, 'Which transliteration is right?'); }
    }
    if (it.spec) a = it.spec;
    if (!a) a = mc(R, it.a, it.w, it.k);
    if (it.keep && a.t === 'mc') { var right = a.choices[0]; a.choices.sort(); a.v = a.choices.indexOf(right); a.keep = true; }
    var p = { q: it.q, a: a, steps: it.s, hint: it.h };
    if (!p.hint) delete p.hint;
    if (it.viz) p.viz = it.viz;
    if (it.chk) p.chk = it.chk;
    if (it.unit) p.unit = it.unit;
    return p;
  }
  function bank(R, ctx, items) {
    var lvl = L(ctx), pool = items.filter(function (b) { return (b.lv || 1) <= lvl; });
    var top = pool.filter(function (b) { return (b.lv || 1) === lvl; });
    var it = top.length && R.chance(0.5) ? R.pick(top) : R.pick(pool);
    if (typeof it === 'function') it = it(R, ctx);
    else if (typeof it.f === 'function') it = it.f(R, ctx);
    return prob(R, it);
  }
  function perms(a) { if (a.length <= 1) return [a.slice()]; var out = []; a.forEach(function (x, i) { perms(a.slice(0, i).concat(a.slice(i + 1))).forEach(function (r) { out.push([x].concat(r)); }); }); return out; }
  // put k events in order (earliest first): items [{ id, label, y }] with different years; mc of sequences
  function orderQ(R, items, k, what) {
    var pick = [], used = {};
    R.shuffle(items).forEach(function (e) { if (pick.length < k && !used[e.y]) { used[e.y] = 1; pick.push(e); } });
    var right = pick.slice().sort(function (a, b) { return a.y - b.y; });
    var str = function (seq) { return seq.map(function (e) { return cap(e.label); }).join(' → '); };
    var wrong = perms(pick).filter(function (s) { return str(s) !== str(right); }).map(str);
    return {
      q: 'Put these ' + (what || 'events') + ' in order, earliest first:<br>' + R.shuffle(pick).map(function (e) { return '• ' + esc(cap(e.label)); }).join('<br>'),
      a: str(right), w: wrong,
      s: right.map(function (e) { return esc(cap(e.label)) + ': ' + (e.when || yr(e.y)) + '.'; }).concat(['So the order is ' + esc(str(right)) + '.']),
      h: 'Date each one first, even roughly, then sort.', chk: { order: right.map(function (e) { return e.id; }) }
    };
  }
  // which of these came first (or last)?
  function firstQ(R, items, k, last) {
    var pick = [], used = {};
    R.shuffle(items).forEach(function (e) { if (pick.length < k && !used[e.y]) { used[e.y] = 1; pick.push(e); } });
    var sorted = pick.slice().sort(function (a, b) { return a.y - b.y; }), ans = last ? sorted[sorted.length - 1] : sorted[0];
    return { q: 'Which of these happened ' + (last ? 'last' : 'first') + '?', a: cap(ans.label), w: pick.filter(function (e) { return e !== ans; }).map(function (e) { return cap(e.label); }),
      s: sorted.map(function (e) { return esc(cap(e.label)) + ': ' + (e.when || yr(e.y)) + '.'; }).concat([esc(cap(ans.label)) + ' came ' + (last ? 'last' : 'first') + '.']), h: 'Put a date on each one.', chk: { order: sorted.map(function (e) { return e.id; }) } };
  }
  // "In what year…?" for a dated modern event
  function yearQ(e, q) {
    return { q: q || 'In what year ' + e.ask + '?', num: e.y, s: [cap(esc(e.label)) + ': ' + (e.when || e.y) + '.'].concat(e.more ? [e.more] : []), h: e.hint || 'Think of what happened just before and after it.', chk: { ev: e.id, y: e.y } };
  }
  // years between two dates across BC and AD (there is no year 0)
  function between(a, b) { var d = b - a; if (a < 0 && b > 0) d -= 1; return d; }

  // modern and late events used across the course (exact years; AD unless negative). ask: the "In what year …" phrase.
  var EV = {
    hieroLast: { y: 394, label: 'last hieroglyphic inscription carved at Philae', ask: 'was the last known hieroglyphic inscription carved at Philae', when: 'AD 394' },
    demLast: { y: 452, label: 'last dated Demotic inscription at Philae', ask: 'was the last dated Demotic inscription written at Philae', when: 'AD 452' },
    horaFound: { y: 1419, label: 'Horapollo\'s book found on Andros', ask: 'was the manuscript of Horapollo\'s Hieroglyphica found on Andros' },
    horaPrint: { y: 1505, label: 'Horapollo\'s book first printed', ask: 'was Horapollo\'s Hieroglyphica first printed' },
    vatican: { y: 1586, label: 'Vatican obelisk moved to St Peter\'s Square', ask: 'was the Vatican obelisk moved to St Peter\'s Square' },
    kircher: { y: 1652, label: 'Kircher\'s Oedipus Aegyptiacus begins to appear', ask: 'did the first volume of Kircher\'s Oedipus Aegyptiacus appear', when: '1652–1655' },
    invasion: { y: 1798, label: 'Napoleon invades Egypt', ask: 'did Napoleon\'s army invade Egypt' },
    rosettaFound: { y: 1799, label: 'Rosetta Stone found', ask: 'was the Rosetta Stone found' },
    akerblad: { y: 1802, label: 'Åkerblad reads names in the Demotic text', ask: 'did Åkerblad publish the names he had read in the Rosetta Stone\'s Demotic text' },
    rosettaBM: { y: 1802, label: 'Rosetta Stone reaches the British Museum', ask: 'did the Rosetta Stone go on display in the British Museum' },
    description: { y: 1809, label: 'first volume of the Description de l\'Égypte', ask: 'did the first volume of the Description de l\'Égypte appear' },
    youngStart: { y: 1814, label: 'Young begins work on the Rosetta Stone', ask: 'did Thomas Young begin working on the Rosetta Stone' },
    memnon: { y: 1816, label: 'Belzoni moves the "Younger Memnon"', ask: 'did Belzoni move the head of Ramesses II called the "Younger Memnon" from the Ramesseum' },
    seti: { y: 1817, label: 'Belzoni finds the tomb of Seti I', ask: 'did Belzoni find the tomb of Seti I' },
    britannica: { y: 1819, label: 'Young\'s "Egypt" article in the Britannica', ask: 'did Young\'s article "Egypt" appear in the Encyclopaedia Britannica' },
    lettre: { y: 1822, label: 'Champollion\'s Lettre à M. Dacier', ask: 'did Champollion read his Lettre à M. Dacier to the Academy in Paris' },
    precis: { y: 1824, label: 'Champollion\'s Précis', ask: 'did Champollion publish his Précis du système hiéroglyphique' },
    turin: { y: 1824, label: 'Turin\'s Egyptian Museum founded', ask: 'was the Egyptian Museum in Turin founded' },
    chEgypt: { y: 1828, label: 'Champollion\'s expedition to Egypt', ask: 'did Champollion\'s expedition to Egypt set out', when: '1828–1829' },
    chDies: { y: 1832, label: 'Champollion dies', ask: 'did Champollion die' },
    decree1835: { y: 1835, label: 'Muhammad Ali\'s decree against exporting antiquities', ask: 'did Muhammad Ali issue his decree against exporting antiquities' },
    paris: { y: 1836, label: 'Luxor obelisk raised in Paris', ask: 'was the Luxor obelisk raised in the Place de la Concorde in Paris' },
    lepsiusLetter: { y: 1837, label: 'Lepsius\'s letter to Rosellini', ask: 'did Lepsius publish his letter to Rosellini on the hieroglyphic alphabet' },
    prussian: { y: 1842, label: 'Lepsius\'s Prussian expedition begins', ask: 'did Lepsius\'s Prussian expedition begin', when: '1842–1845' },
    serapeum: { y: 1851, label: 'Mariette finds the Serapeum', ask: 'did Mariette find the Serapeum at Saqqara' },
    service: { y: 1858, label: 'Antiquities Service founded under Mariette', ask: 'was Mariette made head of Egypt\'s new Antiquities Service' },
    bulaq: { y: 1863, label: 'Bulaq museum opens', ask: 'did the museum at Bulaq open' },
    canopus: { y: 1866, label: 'Canopus Decree found at Tanis', ask: 'was the Canopus Decree found at Tanis' },
    london: { y: 1878, label: 'London\'s "Cleopatra\'s Needle" raised', ask: 'was London\'s "Cleopatra\'s Needle" raised on the Thames Embankment' },
    newyork: { y: 1881, label: 'New York\'s "Cleopatra\'s Needle" raised', ask: 'was New York\'s "Cleopatra\'s Needle" raised in Central Park' },
    petrieStart: { y: 1884, label: 'Petrie begins excavating, at Tanis', ask: 'did Petrie begin excavating, at Tanis' },
    ucl: { y: 1892, label: 'first chair of Egyptology in Britain (Petrie, UCL)', ask: 'was the Edwards chair of Egyptology at University College London founded' },
    sd: { y: 1899, label: 'Petrie publishes sequence dating', ask: 'did Petrie publish his method of sequence dating' },
    tahrir: { y: 1902, label: 'Egyptian Museum opens in Tahrir Square', ask: 'did the Egyptian Museum open in Tahrir Square, Cairo' },
    meroitic: { y: 1909, label: 'Griffith works out Meroitic sounds', ask: 'did Griffith work out the sounds of the Meroitic script' },
    nefertiti: { y: 1912, label: 'bust of Nefertiti found at Amarna', ask: 'was the bust of Nefertiti found at Amarna' },
    kv62: { y: 1922, label: 'Tutankhamun\'s tomb found', ask: 'did Howard Carter find the tomb of Tutankhamun' },
    epigraphic: { y: 1924, label: 'Chicago\'s Epigraphic Survey founded', ask: 'did Breasted found the Epigraphic Survey at Luxor' },
    leiden: { y: 1931, label: 'Leiden bracket conventions agreed', ask: 'were the Leiden conventions for brackets agreed' },
    clearance: { y: 1932, label: 'last objects leave Tutankhamun\'s tomb', ask: 'were the last objects from Tutankhamun\'s tomb sent to Cairo' },
    carterDies: { y: 1939, label: 'Howard Carter dies', ask: 'did Howard Carter die' },
    nagHammadi: { y: 1945, label: 'Nag Hammadi codices found', ask: 'were the Nag Hammadi codices found' },
    libby: { y: 1949, label: 'first radiocarbon dates of known-age samples', ask: 'did Libby and Arnold publish the first radiocarbon tests on samples of known age' },
    boat: { y: 1954, label: 'Khufu\'s boat found at Giza', ask: 'did Kamal el-Mallakh find Khufu\'s boat beside the Great Pyramid' },
    nubia: { y: 1960, label: 'UNESCO launches the Nubian campaign', ask: 'did UNESCO launch the campaign to save the monuments of Nubia' },
    abuSimbel: { y: 1968, label: 'Abu Simbel move completed', ask: 'was the move of the Abu Simbel temples completed' },
    unesco: { y: 1970, label: 'UNESCO Convention on illicit trade adopted', ask: 'was the UNESCO Convention against illicit trade in cultural property adopted' },
    egyptJoins: { y: 1973, label: 'Egypt joins the 1970 UNESCO Convention', ask: 'did Egypt become a party to the 1970 UNESCO Convention' },
    philaeDone: { y: 1980, label: 'Philae rebuilt on Agilkia; campaign ends', ask: 'did the Nubian campaign end, with Philae rebuilt on Agilkia' },
    law117: { y: 1983, label: 'Egypt\'s Law 117 on antiquities', ask: 'was Egypt\'s Law 117 on the protection of antiquities passed' },
    factum: { y: 2014, label: 'facsimile of Tutankhamun\'s tomb opens near Luxor', ask: 'was the facsimile of Tutankhamun\'s tomb completed near Carter\'s house at Luxor' },
    nedjemankh: { y: 2019, label: 'Met returns the coffin of Nedjemankh', ask: 'did the Metropolitan Museum return the stolen coffin of Nedjemankh to Egypt' },
    gem: { y: 2025, label: 'Grand Egyptian Museum fully opens', ask: 'did the Grand Egyptian Museum officially open in full' }
  };
  Object.keys(EV).forEach(function (k) { EV[k].id = k; });
  function evs(ids) { return ids.map(function (k) { if (!EV[k]) throw new Error('no event ' + k); return EV[k]; }); }
  ML._archEV = EV; // read by the course's independent checker in node (not used by pages)


  // ================================================================ Unit 1: Egypt Remembered
  var WRITERS = [
    { n: 'Herodotus', y: -450, when: 'the mid-400s BC', work: 'Book 2 of his Histories', did: 'whose Book 2 of the Histories describes Egypt in the mid-400s BC' },
    { n: 'Diodorus of Sicily', y: -58, when: '60–56 BC', work: 'Book 1 of his Library of History', did: 'who says he saw a crowd in Egypt kill a Roman for killing a cat' },
    { n: 'Strabo', y: -25, when: 'about 25 BC', work: 'Book 17 of his Geography', did: 'who travelled up the Nile with the Roman governor Aelius Gallus about 25 BC' }
  ];
  var OLDKINGS = ['djoser', 'sneferu', 'khufu', 'khafre', 'menkaure'];
  G('arch.classical-writers', function (R, ctx) {
    var names = ['Herodotus', 'Diodorus of Sicily', 'Strabo', 'Manetho'];
    var seen = [['the Nile rising in summer and flooding the fields', true], ['how embalmers of his own day prepared a body, as they described it to him', true], ['the Nilometer at Elephantine, which measured the flood', true],
      ['how Egyptians of his own time honored sacred animals', true], ['how many workers built the Great Pyramid', false], ['what kind of man Khufu was', false], ['the plans of kings who lived two thousand years before him', false], ['how long the Great Pyramid took to build', false]];
    return bank(R, ctx, [
      { q: 'Which writer\'s account of Egypt is Book 2 of the <i>Histories</i>, written in the 5th century BC?', a: 'Herodotus', w: ['Strabo', 'Diodorus of Sicily', 'Manetho'], s: ['Herodotus wrote the <i>Histories</i> in the 400s BC; Book 2 is about Egypt.', 'Diodorus (1st century BC) and Strabo (about 25 BC) came centuries later; Manetho was an Egyptian priest of the 3rd century BC.'], h: 'He is the earliest of the Greek writers in this lesson.' },
      { q: 'Which writer travelled up the Nile about 25 BC with the Roman governor Aelius Gallus, and described the country\'s towns, distances and the Nilometer at Elephantine?', a: 'Strabo', w: ['Herodotus', 'Diodorus of Sicily', 'Manetho'], s: ['Strabo was a geographer; Book 17 of his <i>Geography</i> covers Egypt.', 'He went up the Nile with Aelius Gallus, governor of Egypt 26–24 BC.'], h: 'He was a geographer.' },
      { q: 'Which writer says he watched a crowd in Egypt kill a Roman who had accidentally killed a cat?', a: 'Diodorus of Sicily', w: ['Herodotus', 'Strabo', 'Manetho'], s: ['Diodorus visited Egypt in 60–56 BC, under the Ptolemies, and tells this story in Book 1 of his <i>Library of History</i>.', 'Herodotus came four centuries earlier, before there were Romans in Egypt.'], h: 'A Roman in Egypt before Roman rule: the 1st century BC.' },
      { q: 'Which writer could read Egyptian records himself: an Egyptian priest who wrote a history of Egypt in Greek in the 3rd century BC?', a: 'Manetho', w: ['Herodotus', 'Strabo', 'Diodorus of Sicily'], s: ['Manetho was an Egyptian priest under the early Ptolemies.', 'His lost history, quoted by later writers, gave us the numbered dynasties.'], h: 'The other three were Greek visitors.' },
      { tf: false, q: 'True or false: Herodotus watched the Great Pyramid being built.', s: ['The Great Pyramid was built for Khufu, who reigned c. 2589–2566 BC.', 'Herodotus visited Egypt around 450 BC, about 2,100 years later. He reported what guides told him.'], h: 'Compare the dates.' },
      { tf: true, q: 'True or false: Herodotus could watch the Nile flood for himself, but he could only hear stories about the kings who built the pyramids.', s: ['The flood came every summer, so a visitor could see it.', 'The pyramid builders had died about two thousand years before; he depended on what guides and priests told him.'] },
      function (R) {
        var s = R.pick(seen);
        return { q: 'A classical writer describes ' + s[0] + '. Is this most likely something he could check for himself, or a story about the distant past that he could only hear?', a: s[1] ? 'Something he could check for himself' : 'A story he could only hear', w: [s[1] ? 'A story he could only hear' : 'Something he could check for himself'], k: 2,
          s: [s[1] ? 'This happened in his own day, so he could see it or ask people who did it.' : 'This concerns events about two thousand years before his visit.', s[1] ? 'Observations like this can often be checked against other evidence, and many hold up.' : 'He could not read hieroglyphs, so he relied on guides: treat it as a later tradition.'], h: 'Ask: could he have seen it happen?' };
      },
      { lv: 2, f: function (R) {
        var k = EG().king(R.pick(OLDKINGS)), w = R.pick(WRITERS), d = (-k.from) - (-w.y);
        return { q: k.name + ' began to reign c. ' + (-k.from) + ' BC. ' + w.n + ' was in Egypt about ' + (-w.y) + ' BC. Using these dates, how many years before the visit did ' + k.name + '\'s reign begin?', num: d,
          s: ['Both dates are BC, and BC years count down toward AD 1, so the earlier date is the larger number.', 'Subtract: ' + (-k.from) + ' − ' + (-w.y) + ' = ' + d + '.', 'About ' + fmt(Math.round(d / 100) * 100) + ' years: ' + w.n + ' was as far from the pyramid age as we are from him, or nearly.'], h: 'Subtract the smaller BC number from the larger.', chk: { arith: [(-k.from), (-w.y), d] } };
      } },
      { lv: 2, f: function (R) {
        var opts = [['Compare it with archaeology and with Egyptian texts of the time', true], ['Accept it, because Herodotus visited Egypt', false], ['Reject it, because Greek writers always invented things', false], ['Accept it if later Greek writers repeat it', false]];
        return { q: 'Herodotus says 100,000 men built the Great Pyramid in three-month shifts. What is the best way for a historian to treat this claim?', a: opts[0][0], w: opts.slice(1).map(function (o) { return o[0]; }),
          s: ['He wrote about two thousand years after the building, from what guides told him, so the number is a tradition, not a measurement.', 'Neither trust nor blanket rejection is a method; later writers who repeat him add nothing new.', 'Test it against independent evidence, like the workers\' town and cemeteries excavated beside Giza.'], h: 'Look for evidence that does not depend on Herodotus.' };
      } },
      { lv: 3, f: function (R) {
        var good = R.pick(seen.filter(function (s) { return s[1]; })), bad = R.sample(seen.filter(function (s) { return !s[1]; }), 3);
        return { q: 'Herodotus writes about each of these. Which report is most likely to be reliable?', a: cap(good[0]), w: bad.map(function (b) { return cap(b[0]); }),
          s: ['Three of these concern the pyramid age, about two thousand years before his visit; he could only repeat what he was told.', 'The reliable one describes ' + good[0] + ': something of his own day that he could see or ask about directly.'], h: 'Which one could he have seen in the 400s BC?' };
      } },
      { lv: 3, f: function (R) {
        var w = R.pick(WRITERS), c = R.pick(['Cleopatra VII died (30 BC)', 'Alexander the Great reached Egypt (332 BC)']), cy = /30 BC/.test(c) ? -30 : -332;
        var before = w.y < cy;
        return { q: 'Was ' + w.n + ' in Egypt before or after ' + c + '?', a: before ? 'Before' : 'After', w: [before ? 'After' : 'Before'], k: 2,
          s: [w.n + ' was in Egypt in ' + w.when + '.', 'In BC years the larger number is earlier: ' + (-w.y) + ' BC is ' + (before ? 'earlier' : 'later') + ' than ' + (-cy) + ' BC.'], h: 'BC numbers count down.' };
      } }
    ]);
  });

  G('arch.forgotten', function (R, ctx) {
    var lateEvents = evs(['hieroLast', 'horaFound', 'horaPrint', 'kircher', 'rosettaFound', 'lettre']);
    return bank(R, ctx, [
      { q: 'What did Horapollo\'s <i>Hieroglyphica</i> teach about hieroglyphs?', a: 'Each sign was a symbol with a hidden meaning', w: ['Most signs stood for sounds', 'Hieroglyphs were an alphabet of 24 letters', 'Hieroglyphs were the same as Coptic letters'], s: ['The <i>Hieroglyphica</i>, a Greek book of the 4th or 5th century AD, explained each sign as an allegory.', 'That belief, that the signs were pure symbols, misled European scholars for centuries.'], h: 'Think of the goose that "means son because geese love their young".' },
      { q: 'What was Athanasius Kircher\'s lasting contribution to the study of Egypt?', a: 'He argued that Coptic descended from the ancient Egyptian language', w: ['He read the Rosetta Stone', 'He showed that most hieroglyphs stand for sounds', 'He found the last hieroglyphic inscription at Philae'], s: ['Kircher\'s "translations" of hieroglyphs were fantasies.', 'But his study of Coptic, and his claim that it came from ancient Egyptian, later helped Champollion.'], h: 'It concerns the language of Egypt\'s Christians.' },
      { tf: false, q: 'True or false: European scholars of the 1600s understood that hieroglyphs mostly stand for sounds.', s: ['From late antiquity to the 1700s, scholars followed the idea that each sign was a mystical symbol.', 'The sound value of most signs was proved only in the 1820s.'] },
      { q: 'Why did the symbolic theory of hieroglyphs fail?', a: 'Most signs in a real text stand for sounds, so symbolic readings could not be tested', w: ['Hieroglyphs have no word signs at all', 'The inscriptions were too damaged to read', 'Hieroglyphs were written only in columns'], s: ['Some signs do stand for what they show, which made the theory seem right.', 'But most signs in a real text spell sounds. A symbolic reading can never be checked against another text; a sound reading can.'], h: 'Which kind of reading can be checked?' },
      { q: 'Horapollo says a goose means "son" because geese love their young. Why is the bird sign really used in the word for "son"?', a: 'It writes the same consonants as the word for "son" (zꜣ)', w: ['Because ducks were sacred to the king', 'Because it is a determinative for children', 'Because Egyptians thought geese loved their young'], s: ['The pintail duck sign writes the sounds zꜣ.', 'The word for "son" is also zꜣ, so the sign spells it, with a stroke: a sound pun, not an allegory.'], h: 'Hieroglyphs often work like a rebus.', viz: { name: 'eg-glyphs', opts: { word: 'za', quiet: true, interactive: false } } },
      { lv: 2, f: function (R) {
        var a = R.pick([394, 394, 452]), b = R.pick([1799, 1822, 1824]), d = b - a, what = a === 394 ? 'the last known hieroglyphic inscription (AD 394)' : 'the last dated Demotic inscription (AD 452)', to = b === 1799 ? 'the discovery of the Rosetta Stone (1799)' : b === 1822 ? 'Champollion\'s Lettre (1822)' : 'Champollion\'s Précis (1824)';
        return { q: 'How many years passed between ' + what + ' and ' + to + '?', num: d, s: ['Both dates are AD, so subtract: ' + b + ' − ' + a + ' = ' + d + '.', 'That is about ' + fmt(Math.round(d / 100) * 100) + ' years in which no one could read the Egyptian scripts.'], h: 'Subtract the earlier year from the later.', chk: { arith: [b, a, d] } };
      } },
      { lv: 2, f: function (R) { return firstQ(R, lateEvents, 3, R.coin()); } },
      { lv: 3, f: function (R) { return orderQ(R, lateEvents, 4); } },
      { lv: 3, f: function (R) { return yearQ(R.pick(evs(['horaFound', 'horaPrint']))); } }
    ]);
  });

  var OB = [
    { n: 'London\'s "Cleopatra\'s Needle"', k: 'Thutmose III', site: 'heliopolis', city: 'London', moved: 'raised on the Thames Embankment in 1878', ev: 'london' },
    { n: 'New York\'s "Cleopatra\'s Needle"', k: 'Thutmose III', site: 'heliopolis', city: 'New York', moved: 'raised in Central Park in 1881', ev: 'newyork' },
    { n: 'the Luxor obelisk in Paris', k: 'Ramesses II', site: 'luxor', city: 'Paris', moved: 'raised in the Place de la Concorde in 1836', ev: 'paris' },
    { n: 'the Lateran obelisk in Rome', k: 'Thutmose III', site: 'karnak', city: 'Rome', moved: 'taken to Rome under Constantius II in AD 357' },
    { n: 'the Obelisk of Theodosius in Istanbul', k: 'Thutmose III', site: 'karnak', city: 'Istanbul', moved: 'set up in Constantinople\'s Hippodrome in the AD 300s' },
    { n: 'the Flaminio obelisk in Rome', k: 'Seti I and Ramesses II', site: 'heliopolis', city: 'Rome', moved: 'brought to Rome by Augustus in 10 BC' }
  ];
  var KN = ['Thutmose III', 'Ramesses II', 'Cleopatra VII', 'Seti I and Ramesses II', 'Augustus', 'Ptolemy V'];
  G('arch.obelisks', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var o = R.pick(OB); return { q: 'Which king\'s inscriptions are the oldest on ' + o.n + '?', a: o.k, w: KN, s: [cap(o.n) + ' was made for ' + o.k + ', and first stood at ' + EG().site(o.site).name + '.', 'It was ' + o.moved + '.'], h: o.k === 'Thutmose III' ? 'A great New Kingdom warrior king of the 18th Dynasty.' : 'Read the oldest cartouche, not the nickname.' }; },
      { q: 'The London and New York obelisks are nicknamed "Cleopatra\'s Needles". For whom were they made?', a: 'Thutmose III, more than a thousand years before Cleopatra', w: ['Cleopatra VII', 'Augustus, after he conquered Egypt', 'Ptolemy V, for the Rosetta decree'], s: ['Their hieroglyphs name Thutmose III (c. 1479–1425 BC), with lines added by Ramesses II.', 'The Romans later moved them to Alexandria, Cleopatra\'s city, which gave them the nickname.'], h: 'Read the cartouche, not the nickname.' },
      { q: 'Which city has the most ancient Egyptian obelisks today?', a: 'Rome', w: ['Cairo', 'Luxor', 'Paris', 'London'], s: ['Roman emperors carried obelisks to Rome as trophies after 30 BC.', 'Rome now has eight ancient Egyptian obelisks, more than any other city.'], h: 'Think of who conquered Egypt in 30 BC.' },
      { q: 'Why did Roman emperors carry obelisks from Egypt?', a: 'As trophies showing Rome\'s power over Egypt', w: ['Because they could read the inscriptions', 'To protect them from the Nile flood', 'Because Egypt asked Rome to take them'], s: ['An obelisk is a single finished stone: moving one proved great power.', 'After Augustus conquered Egypt in 30 BC, obelisks re-erected in Rome advertised that conquest.'], h: 'Think about what it meant to move a monument.' },
      { lv: 2, f: function (R) { var o = R.pick(OB.filter(function (x) { return x.ev; })); return yearQ(EV[o.ev]); } },
      { lv: 2, f: function (R) {
        var o = R.pick(OB.slice(0, 3)), s = EG().site(o.site), ch = R.shuffle(['heliopolis', 'luxor', 'karnak', 'giza', 'alexandria', 'abydos'].filter(function (k) { return k !== o.site; })).slice(0, 3).concat([o.site]);
        ch = R.shuffle(ch); var letters = ['A', 'B', 'C', 'D'];
        return { q: cap(o.n) + ' first stood at ' + s.name + '. Which lettered dot is ' + s.name + '?', a: letters[ch.indexOf(o.site)], w: letters.filter(function (l, i) { return i !== ch.indexOf(o.site); }), k: 4,
          s: [s.name + (s.key === 'heliopolis' ? ' lies at the south tip of the Delta, near modern Cairo.' : ' is at Thebes in Upper Egypt, on the east bank.'), 'It is dot ' + letters[ch.indexOf(o.site)] + '.'], h: s.key === 'heliopolis' ? 'Near the apex of the Delta.' : 'Thebes is in the south, near the bend of the Nile.',
          viz: { name: 'eg-map', opts: { mode: 'pick', target: o.site, choices: ch, quiet: true, layerChips: false, labels: false } }, keep: true };
      } },
      { lv: 2, tf: false, q: 'True or false: the Luxor obelisk in Paris was made for Cleopatra VII.', s: ['It was made for Ramesses II for Luxor Temple, where its twin still stands.', 'Muhammad Ali gave it to France in 1830; it was raised in Paris in 1836.'] },
      { lv: 3, f: function (R) { return orderQ(R, [{ id: 'flaminio', label: 'Augustus brings the Flaminio obelisk to Rome', y: -10, when: '10 BC' }, { id: 'lateran', label: 'the Lateran obelisk reaches Rome', y: 357, when: 'AD 357' }, EV.vatican, EV.paris, EV.london, EV.newyork].map(function (e) { return { id: e.id, label: e.label.charAt(0).toUpperCase() + e.label.slice(1), y: e.y, when: e.when }; }), 3); } }
    ]);
  });

  G('arch.napoleon', function (R, ctx) {
    var E9 = evs(['invasion', 'rosettaFound', 'rosettaBM', 'description', 'lettre']);
    return bank(R, ctx, [
      function () { return yearQ(EV.invasion); },
      function () { return yearQ(EV.rosettaFound); },
      { q: 'What did the scholars on Napoleon\'s expedition do that mattered most for the study of Egypt?', a: 'They measured, drew and published the monuments in the Description de l\'Égypte', w: ['They deciphered the hieroglyphs', 'They moved the Abu Simbel temples', 'They found the tomb of Tutankhamun'], s: ['About 167 scholars, engineers and artists went with the army.', 'Their measured plans and copies appeared in the <i>Description de l\'Égypte</i> from 1809.'], h: 'Think of a giant illustrated book.' },
      { tf: false, q: 'True or false: Napoleon\'s soldiers deciphered hieroglyphs.', s: ['Soldiers found the Rosetta Stone in 1799.', 'Reading it took until 1822, by Champollion, building on Thomas Young and others.'] },
      { q: 'How did the Rosetta Stone end up in London rather than Paris?', a: 'The French surrendered in 1801 and handed it to the British under the terms', w: ['Napoleon gave it to Britain as a gift', 'It was found by British soldiers', 'Champollion sold it to the British Museum'], s: ['The British defeated the French army in Egypt in 1801.', 'Under the Capitulation of Alexandria, antiquities the French had collected, the stone among them, went to Britain; it was in the British Museum by 1802.'], h: 'The expedition ended in a defeat.' },
      { lv: 2, f: function (R) { return firstQ(R, E9, 3, R.coin()); } },
      { lv: 2, f: function () { return yearQ(EV.description); } },
      { lv: 2, q: 'About how many scholars, engineers and artists went with Napoleon\'s army to Egypt?', a: 'About 160', w: ['About 15', 'About 1,600', 'About 16,000'], s: ['The Commission of Sciences and Arts had about 167 members.', 'They founded the Institut d\'Égypte in Cairo in August 1798.'], h: 'Enough to fill a learned society, not an army.' },
      { lv: 3, f: function (R) { return orderQ(R, E9, 4); } },
      { lv: 3, f: function (R) { var a = EV.rosettaFound.y, b = EV.lettre.y; return { q: 'The Rosetta Stone was found in ' + a + '. Champollion read his Lettre in ' + b + '. How many years did it take from the find to that announcement?', num: b - a, s: [b + ' − ' + a + ' = ' + (b - a) + '.', 'More than two decades: finding the key was only the start.'], h: 'Subtract.', chk: { arith: [b, a, b - a] } }; } }
    ]);
  });


  // ================================================================ Unit 2: Decipherment
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  function lettered(R, keys, target) { // shuffled keys, the target's letter, the other letters
    var ch = R.shuffle(keys), i = ch.indexOf(target);
    return { ch: ch, a: LETTERS[i], w: LETTERS.slice(0, ch.length).filter(function (l, j) { return j !== i; }) };
  }
  function mapPick(R, target, pool, q, steps, hint) {
    var keys = R.shuffle(pool.filter(function (k) { return k !== target; })).slice(0, 3).concat([target]), L4 = lettered(R, keys, target);
    return { q: q, a: L4.a, w: L4.w, k: 4, keep: true, s: steps.concat(['It is dot ' + L4.a + '.']), h: hint,
      viz: { name: 'eg-map', opts: { mode: 'pick', target: target, choices: L4.ch, quiet: true, layerChips: false, labels: false } }, chk: { site: target } };
  }
  var ROS = [['hieroglyphic', 'Hieroglyphic', 14, 'top'], ['demotic', 'Demotic', 32, 'middle'], ['greek', 'Greek', 54, 'bottom']];
  G('arch.rosetta', function (R, ctx) {
    return bank(R, ctx, [
      function (R) {
        var ord = R.shuffle([0, 1, 2]), t = R.int(0, 2), letter = LETTERS[ord.indexOf(t)];
        return { q: 'The three texts of the Rosetta Stone are lettered on this drawing. Which letter marks the <b>' + ROS[t][1] + '</b> text?', a: letter, w: ['A', 'B', 'C'].filter(function (l) { return l !== letter; }), k: 3, keep: true,
          s: ['From top to bottom the stone has hieroglyphs (14 lines left), Demotic (32 lines) and Greek (54 lines).', 'The ' + ROS[t][1] + ' text is the ' + ROS[t][3] + ' band, lettered ' + letter + '.'], h: 'Hieroglyphs at the top, Greek at the bottom.',
          viz: { name: 'eg-scripts', opts: { mode: 'rosetta', quiet: true, order: ord, interactive: false } } };
      },
      { q: 'How many languages are written on the Rosetta Stone?', a: 'Two: Egyptian and Greek', w: ['Three: hieroglyphic, Demotic and Greek', 'One: Egyptian', 'Three: Egyptian, Greek and Latin'], s: ['Hieroglyphic and Demotic are two scripts for one language, Egyptian.', 'The third text is Greek. So there are two languages in three scripts.'], h: 'Count languages, not scripts.' },
      { q: 'Which king does the Rosetta Stone\'s decree honor?', a: 'Ptolemy V', w: ['Ptolemy III', 'Cleopatra VII', 'Ramesses II', 'Alexander the Great'], s: ['The decree was issued at Memphis in 196 BC, in the ninth year of Ptolemy V.', 'Ptolemy III is honored by the Canopus Decree of 238 BC.'], h: 'The decree dates from 196 BC.' },
      function () { return yearQ(EV.rosettaFound); },
      { q: 'Which of the stone\'s three texts is the most damaged?', a: 'The hieroglyphic text', w: ['The Demotic text', 'The Greek text', 'All three equally'], s: ['The top of the stone is broken off, and the hieroglyphs were at the top.', 'Only 14 lines of hieroglyphs survive, against 32 of Demotic and 54 of Greek.'], h: 'Which part of the slab is broken?' },
      { lv: 2, f: function (R) { var t = R.pick(ROS); return { q: 'How many lines of the <b>' + t[1] + '</b> text survive on the Rosetta Stone?', num: t[2], s: ['Hieroglyphic: 14 lines (the top is broken). Demotic: 32 lines. Greek: 54 lines.', 'So the ' + t[1] + ' text has ' + t[2] + '.'], h: 'The texts get longer from top to bottom.', chk: { rosetta: [t[0], t[2]] } }; } },
      { lv: 2, q: 'In what year BC was the Rosetta decree issued?', a: '196 BC', w: ['238 BC', '30 BC', '332 BC', '1799 BC'], s: ['The priests at Memphis issued the decree in 196 BC, in the ninth year of Ptolemy V.', '238 BC is the Canopus Decree; 30 BC is the death of Cleopatra VII; 332 BC is Alexander\'s arrival.'], h: 'Early in the 2nd century BC.' },
      { lv: 2, f: function () { return yearQ(EV.rosettaBM, 'In what year did the Rosetta Stone go on display in the British Museum?'); } },
      { lv: 2, f: function (R) { return mapPick(R, 'rosetta', ['rosetta', 'alexandria', 'memphis', 'sais', 'tanis', 'bubastis', 'buto'], 'The stone was found near Rosetta (Rashid). Which lettered dot is Rosetta?', ['Rosetta lies near the coast on the western branch of the Nile, east of Alexandria.'], 'Near the sea, on the western branch.'); } },
      { lv: 3, f: function (R) { var by = R.coin(); return { q: 'Put the Rosetta Stone\'s texts in order from ' + (by ? 'fewest to most surviving lines' : 'top to bottom of the stone') + '.', a: 'Hieroglyphic → Demotic → Greek', w: ['Greek → Demotic → Hieroglyphic', 'Demotic → Hieroglyphic → Greek', 'Hieroglyphic → Greek → Demotic', 'Greek → Hieroglyphic → Demotic'],
        s: ['Top: hieroglyphic, 14 lines. Middle: Demotic, 32 lines. Bottom: Greek, 54 lines.', 'Both orders come out the same: hieroglyphic, Demotic, Greek.'], h: by ? '14, 32 and 54 lines.' : 'The formal script goes on top.' }; } },
      { lv: 3, tf: false, q: 'True or false: the Rosetta Stone is the only copy that was ever made of its decree.', s: ['The decree itself orders copies to be set up in temples across Egypt.', 'Other copies have been found, more or less damaged; the Rosetta Stone is the famous one.'] }
    ]);
  });

  var PTOL = [['Q3', 'p'], ['X1', 't'], ['V4', 'o'], ['E23', 'l'], ['Aa15', 'm'], ['M17A', 'i (y)'], ['S29', 's']];
  G('arch.young', function (R, ctx) {
    return bank(R, ctx, [
      { q: 'What did Thomas Young show about the ovals (cartouches) in hieroglyphic texts?', a: 'They hold royal names', w: ['They hold the names of gods only', 'They mark the end of a sentence', 'They are numbers'], s: ['Young saw that the oval group in the Rosetta hieroglyphs appears where the Greek names Ptolemy.', 'Cartouches enclose the names of kings and queens.'], h: 'Whose name does the Greek text repeat?' },
      function (R) {
        var s = R.pick(PTOL), sg = EG().sign(s[0]);
        return { q: 'In Ptolemy\'s cartouche, which sound of the Greek name <i>Ptolemaios</i> does the <b>' + esc(sg.n) + '</b> write?', a: s[1], w: PTOL.map(function (x) { return x[1]; }), k: 4,
          s: ['The cartouche spells the name sign by sign: stool p, loaf t, lasso o, lion l, a flat sign m, two reeds i (y), folded cloth s.', 'So the ' + esc(sg.n) + ' writes ' + s[1] + '.'], h: 'Go through the name in order: P-t-o-l-m-y-s.',
          viz: { name: 'eg-cartouche', opts: { name: 'ptolemy', quiet: true, interactive: false } }, chk: { ptol: [s[0], s[1]] } };
      },
      { q: 'What did Young believe that later held him back?', a: 'That sound signs were used only for foreign names', w: ['That Demotic was unrelated to hieroglyphs', 'That cartouches held the names of gods', 'That the Greek text was a forgery'], s: ['Young read part of Ptolemy\'s name by sound.', 'But he thought native Egyptian words were written with symbols, not sounds. Champollion showed that native names, like Ramesses, used sound signs too.'], h: 'Compare Ptolemy with Ramesses.' },
      { tf: false, q: 'True or false: Thomas Young deciphered the whole hieroglyphic system on his own.', s: ['Young showed that cartouches held royal names, read part of Ptolemy\'s name and saw how Demotic worked.', 'Champollion built the full system from 1822; later scholars like Lepsius corrected it.'] },
      { lv: 2, f: function () { return yearQ(EV.britannica); } },
      { lv: 2, f: function () { return yearQ(EV.youngStart); } },
      { lv: 2, q: 'Young proposed sound values for 13 signs. By a modern count, about how many were fully right?', a: 'Six', w: ['All thirteen', 'None', 'Twelve'], s: ['Of Young\'s 13 values, six were right, three partly right and four wrong.', 'Real progress, but not a full system.'], h: 'About half.' },
      { lv: 2, q: 'What did Young see about the Demotic script?', a: 'It is related to hieroglyphs and mixes sound signs with word signs', w: ['It is a form of Greek', 'It is an alphabet with no word signs', 'It was invented by the Ptolemies for the decree'], s: ['Young compared groups of Demotic with hieroglyphic groups and found about 80 matches.', 'He concluded that Demotic came from hieroglyphs and used both kinds of sign.'], h: 'The middle text is an Egyptian script.' },
      { lv: 3, f: function (R) {
        var s = R.pick(PTOL.slice(0, 4)), sg = EG().sign(s[0]), other = s[0] === 'X1' ? 'Cleopatra (where the feminine ending t comes last)' : 'Cleopatra';
        return { q: 'Young\'s value for the ' + esc(sg.n) + ' in Ptolemy\'s name was ' + s[1] + '. How could you test it with another royal name?', a: 'Find the same sign in ' + other + ' where the Greek name has ' + s[1], w: ['Count how often the sign appears on the Rosetta Stone', 'Check whether the sign looks like the letter ' + s[1], 'Ask whether the Greek text mentions a ' + esc(sg.n)],
          s: ['A sound value should work in every name that has that sound.', 'Kleopatra has ' + s[1] + ' too, so its cartouche should use the same sign in the matching place.'], h: 'A real sound value works in more than one name.' };
      } }
    ]);
  });

  var NATIVE = ['khufu', 'sneferu', 'khafre', 'menkaure', 'amenhotep', 'tutankhamun', 'ramesses', 'thutmose'];
  G('arch.champollion', function (R, ctx) {
    var N = EG().NAMES;
    var shared = N.ptolemy.signs.filter(function (c) { return c !== 'X1' && N.cleopatra.signs.indexOf(c) >= 0; });
    var SND = { Q3: 'p', V4: 'o', E23: 'l' };
    return bank(R, ctx, [
      function (R) {
        var c = R.pick(shared), sg = EG().sign(c);
        return { q: 'Champollion compared the cartouches of Ptolemy and Cleopatra. Both contain the <b>' + esc(sg.n) + '</b>. Which sound does it write in both names?', a: SND[c], w: ['p', 'o', 'l', 't', 'k', 'm', 's'], k: 4,
          s: ['Ptolemaios and Kleopatra share the sounds p, o and l.', 'The signs for those sounds appear in both cartouches: the stool (p), the lasso (o) and the lion (l).', 'So the ' + esc(sg.n) + ' is ' + SND[c] + '.'], h: 'Which sounds do the two Greek names share?', chk: { shared: [c, SND[c]] } };
      },
      { q: 'Ptolemy\'s cartouche writes t with a loaf of bread. Which sign writes the t of Cleopatra?', a: 'A hand', w: ['A loaf of bread', 'A lion', 'A reed stool'], s: ['In Cleopatra\'s cartouche the t comes after p and a, and it is a hand (D46, d in Egyptian).', 'Champollion concluded that one sound could be written with more than one sign.'], h: 'It is not the same sign as in Ptolemy.', viz: { name: 'eg-cartouche', opts: { name: 'cleopatra', quiet: true, interactive: false } } },
      function (R) {
        var k = R.pick(['ramesses', 'thutmose', 'ptolemy', 'cleopatra']), n = N[k];
        return { q: 'Which ruler\'s name is in this cartouche?', a: n.en, w: ['Ramesses', 'Thutmose', 'Ptolemy', 'Cleopatra', 'Khufu'].filter(function (x) { return x !== n.en; }), k: 4,
          s: [k === 'ramesses' ? 'The sun (rꜥ), then ms, then s and s: rꜥ-ms-sw, Ramesses.' : k === 'thutmose' ? 'The ibis of Thoth (ḏḥwtj), then ms and s: ḏḥwtj-ms, Thutmose.' : k === 'ptolemy' ? 'Stool p, loaf t, lasso o, lion l, m, two reeds y, cloth s: Ptolemy.' : 'k, lion l, reed e, lasso o, stool p, vulture a, hand t, mouth r, vulture a, then t and the egg: Cleopatra.', esc(n.note || '')].filter(Boolean),
          h: k === 'ramesses' ? 'It begins with the sun.' : k === 'thutmose' ? 'It begins with a bird on a standard.' : 'Spell it out sign by sign.', viz: { name: 'eg-cartouche', opts: { name: k, quiet: true, interactive: false } }, chk: { name: k } };
      },
      function (R) {
        var k = R.pick(NATIVE.concat(['ptolemy', 'cleopatra'])), n = N[k], greek = k === 'ptolemy' || k === 'cleopatra';
        return { q: 'Is ' + n.en + ' a Greek name spelled in hieroglyphs, or a native Egyptian name?', a: greek ? 'A Greek name' : 'A native Egyptian name', w: [greek ? 'A native Egyptian name' : 'A Greek name'], k: 2,
          s: [greek ? n.en + ' was a ruler of the Ptolemaic dynasty, Macedonian Greeks who ruled Egypt from 332 to 30 BC.' : n.en + ' (' + tl(n.tl) + ') was a pharaoh long before the Greeks came.', greek ? 'Its signs spell the Greek sounds.' : 'Reading names like this one with sound signs was Champollion\'s real breakthrough.'], h: 'Did the ruler belong to the Ptolemaic dynasty?' };
      },
      { tf: false, q: 'True or false: Champollion\'s decipherment worked only for the names of Greek and Roman rulers.', s: ['He tested his sound signs on Ptolemy and Cleopatra.', 'Then he read native names like Ramesses and Thutmose with the same signs, which showed the whole script used sound signs.'] },
      { lv: 2, f: function () { return yearQ(EV.lettre); } },
      { lv: 2, q: 'Champollion read the sun sign at the start of Ramesses\' name as "Ra". What helped him?', a: 'The Coptic word for "sun", rē', w: ['The Greek word for "sun", helios', 'A label written by Thomas Young', 'The sun\'s position in the sky at Abu Simbel'], s: ['Coptic, the last stage of Egyptian, has ⲣⲏ (rē) for "sun".', 'Its consonant r matched the expected sound, and the name Ra-mes-s fitted a known pharaoh.'], h: 'Which language was descended from ancient Egyptian?' },
      { lv: 3, f: function (R) { var k = R.pick(['ramesses', 'thutmose']); return { q: 'Transliterate the name in this cartouche, as Egyptologists write it today.', tl: N[k].tl, tlw: k === 'ramesses' ? ['rꜥ-m-s-s', 'rꜥ-mn-sw', 'ḥr-ms-sw', 'rꜥ-ms-ḥtp'] : ['ḏḥwtj-mn', 'ḥr-ms', 'jnpw-ms', 'ḏḥwtj-ms-sw'], s: [k === 'ramesses' ? 'Sun: rꜥ. Three fox skins: ms. Folded cloth: s, then s again for sw "him".' : 'Ibis of Thoth: ḏḥwtj. Three fox skins: ms. Folded cloth: s, a phonetic complement.', 'Reading: ' + tl(N[k].tl) + '.'], h: 'Type ḏ as D, ḥ as H, ꜥ as a.', viz: { name: 'eg-cartouche', opts: { name: k, quiet: true, interactive: false } }, chk: { name: k } }; } },
      { lv: 3, f: function (R) { return orderQ(R, evs(['rosettaFound', 'youngStart', 'britannica', 'lettre', 'precis', 'chDies']), 4); } }
    ]);
  });

  G('arch.how-cracked', function (R, ctx) {
    var KEYS = [['A bilingual text', 'the meaning of the passage'], ['Royal names in cartouches', 'the sound values of some signs, tested across names'], ['Coptic', 'the sounds and words of the Egyptian language']];
    return bank(R, ctx, [
      function (R) { var k = R.pick(KEYS); return { q: 'In the decipherment, what did <b>' + k[0].toLowerCase() + '</b> supply?', a: cap(k[1]), w: KEYS.filter(function (x) { return x !== k; }).map(function (x) { return cap(x[1]); }).concat(['The date of the inscription']), k: 3,
        s: ['Bilingual text: the meaning. Royal names: sound values. Coptic: the sounds and words behind the signs.', cap(k[0]) + ' gave ' + k[1] + '.'], h: 'Each key solved a different part of the puzzle.' }; },
      { q: 'Why was the Greek translation on the Rosetta Stone not enough to read the hieroglyphs?', a: 'A translation gives the meaning, not which signs stand for which sounds', w: ['The Greek text was mistranslated', 'Nobody in 1800 could read ancient Greek', 'The Greek text is about a different subject'], s: ['Scholars could read the Greek and knew what the decree said.', 'But that did not tell them which signs carried which sounds or words. Names and Coptic did that.'], h: 'Knowing what a page says is not the same as reading it.' },
      { tf: true, q: 'True or false: without Coptic, the decipherers would have known what many texts meant but not how Egyptian words sounded.', s: ['Coptic is Egyptian written in an alphabet with vowels.', 'It let Champollion recognize the words that sound signs spelled, like rē "sun" and mise "give birth".'] },
      function (R) { var d = R.pick(EG().DESCENT); return { q: 'The Egyptian word ' + tl(d.tl) + ' lived on in Coptic as ' + cop(d.cop) + ' (said ' + esc(d.say) + '). What does it mean?', a: d.en, w: EG().DESCENT.map(function (x) { return x.en; }), k: 4, s: ['Coptic, the last stage of Egyptian, keeps many old words.', tl(d.tl) + ' → ' + cop(d.cop) + ': "' + esc(d.en) + '".'], h: 'Recognize the consonants: Coptic keeps most of them.', chk: { descent: d.word } }; },
      { lv: 2, f: function (R) {
        var sc = R.pick([['the Greek text of the Rosetta Stone were lost', 'Royal names could still be found, but the meaning of whole passages would be much harder to establish', 'bilingual'], ['Coptic had died out without a trace', 'Sound values could be found from names, but the words they spelled could not be recognized', 'coptic'], ['Egyptians had never put royal names in cartouches', 'It would be much harder to find which sign groups were names to test sound values on', 'names']]);
        var all = ['Royal names could still be found, but the meaning of whole passages would be much harder to establish', 'Sound values could be found from names, but the words they spelled could not be recognized', 'It would be much harder to find which sign groups were names to test sound values on', 'Nothing would change: any one key was enough'];
        return { q: 'Suppose ' + sc[0] + '. What would the decipherers have lost?', a: sc[1], w: all, k: 4, s: ['Each key did one job: the bilingual text gave meaning, cartouches marked names to test sounds on, Coptic gave the words.', 'Without that key: ' + sc[1].charAt(0).toLowerCase() + sc[1].slice(1) + '.'], h: 'Which job did the missing key do?' };
      } },
      { lv: 3, q: 'A sound reading of a group of signs gives m-s. Why could Champollion trust that it meant "give birth"?', a: 'Coptic has a word for "give birth" with the same consonants, mise', w: ['The group was inside a cartouche', 'The Greek text spells it with the letter m', 'Every two-sign group means a verb'], s: ['The Greek text suggested the meaning "birth" at that point.', 'Coptic ⲙⲓⲥⲉ (mise) "to give birth" has the consonants m and s, so meaning and sound agreed.'], h: 'Meaning from the Greek, sound from Coptic.' }
    ]);
  });

  var ROLE = { phon: 'a sound sign', comp: 'a phonetic complement (repeats a sound already written)', logo: 'a word sign', det: 'a determinative (not read aloud)', stroke: 'a stroke marking a word sign', end: 'a grammatical ending' };
  var ROLE_WORDS = ['pet', 'nfr', 'hetep', 'sedjem', 'ankh', 'netjer', 'za', 'per', 'amun', 'maat', 'niwt', 'ren'];
  var KIND = { uni: 'one consonant', bi: 'two consonants', tri: 'three consonants', det: 'a determinative' };
  G('arch.system', function (R, ctx) {
    var E = EG();
    var soundSigns = E.SIGN_ORDER.filter(function (c) { var s = E.SIGNS[c]; return /uni|bi|tri/.test(s.k) && s.v.length === 1 && c !== 'Aa15'; });
    return bank(R, ctx, [
      function (R) {
        var c = R.pick(soundSigns), s = E.SIGNS[c], n = E.letters(s.v[0]).length;
        return { q: 'The ' + esc(s.n) + ' (' + c + ') writes ' + tl(s.v[0]) + '. What kind of sound sign is it?', a: 'It writes ' + KIND[s.k], w: ['It writes one consonant', 'It writes two consonants', 'It writes three consonants', 'It is a determinative'], k: 4,
          s: ['Count the consonants in ' + tl(s.v[0]) + ': ' + E.letters(s.v[0]).join(', ') + '.', 'That is ' + n + ', so it is a ' + ['', 'one', 'two', 'three'][n] + '-consonant sign.'], h: 'Egyptian writing shows consonants only; count them.', viz: { name: 'eg-glyphs', opts: { sp: c, quiet: true, interactive: false, size: 72 } }, chk: { sign: [c, n] } };
      },
      function (R) {
        var k = R.pick(ROLE_WORDS), w = E.WORDS[k], idx = []; w.parts.forEach(function (pt, i) { if (ROLE[pt[1]]) idx.push(i); });
        var i = R.pick(idx), pt = w.parts[i], s = E.SIGNS[pt[0]];
        return { q: 'In ' + tl(w.tl) + ' "' + esc(w.en) + '", what is the marked sign (the ' + esc(s.n) + ')?', a: cap(ROLE[pt[1]]), w: Object.keys(ROLE).filter(function (r) { return r !== 'stroke' && r !== 'end'; }).map(function (r) { return cap(ROLE[r]); }), k: 4,
          s: w.parts.map(function (q) { return esc(E.SIGNS[q[0]].n) + ' (' + q[0] + '): ' + ROLE[q[1]] + (q[2] ? ', ' + tl(q[2]) : '') + '.'; }), h: 'Is it read aloud? Does it repeat a sound already written?',
          viz: { name: 'eg-glyphs', opts: { word: k, quiet: true, interactive: false, ask: i } }, chk: { role: [k, i, pt[1]] } };
      },
      { q: 'Which description of hieroglyphic writing is correct?', a: 'A mix of sound signs, word signs and determinatives', w: ['An alphabet of 24 letters', 'Pure symbols, each standing for an idea', 'A syllable script like Japanese kana'], s: ['Champollion\'s Précis (1824) showed the script is "figurative, symbolic and phonetic" at once.', 'Sound signs (for one, two or three consonants), word signs and determinatives are used together, often in one word.'], h: 'Champollion called it figurative, symbolic and phonetic.' },
      { tf: false, q: 'True or false: once deciphered, hieroglyphs turned out to be a simple alphabet.', s: ['The 24 one-consonant signs work like an alphabet.', 'But real words also use two- and three-consonant signs, word signs and determinatives.'] },
      { lv: 2, f: function () { return yearQ(EV.precis); } },
      { lv: 2, f: function (R) {
        var k = R.pick(['pet', 'netjer', 'amun', 'maat']), w = E.WORDS[k], di = -1; w.parts.forEach(function (pt, i) { if (pt[1] === 'det') di = i; });
        var dn = E.SIGNS[w.parts[di][0]];
        return { q: 'The word ' + tl(w.tl) + ' "' + esc(w.en) + '" ends with the ' + esc(dn.n) + '. Is that sign pronounced?', a: 'No: it is a determinative that shows the meaning', w: ['Yes: it adds a final consonant', 'Yes: it adds a vowel', 'No: it marks the end of a sentence'], k: 4,
          s: ['The ' + esc(dn.n) + ' is a determinative: ' + esc(dn.use || 'it shows the kind of word') + '.', 'Determinatives are not read aloud, so the word is still ' + tl(w.tl) + '.'], h: 'Signs at the end of a word often classify it.', viz: { name: 'eg-glyphs', opts: { word: k, quiet: true, interactive: false, ask: di } } };
      } },
      { lv: 3, f: function (R) {
        var k = R.pick(['ankh', 'nfr', 'hetep']), w = E.WORDS[k], comps = w.parts.filter(function (p) { return p[1] === 'comp'; }).map(function (p) { return p[2]; });
        return { q: 'In ' + tl(w.tl) + ' "' + esc(w.en) + '", the first sign already writes ' + tl(w.parts[0][2]) + '. The next signs write ' + comps.map(tl).join(' and ') + '. How is the word read?', tl: w.tl, tlw: [w.tl + comps.join(''), w.tl + comps[comps.length - 1], comps.join('')], s: ['The first sign is a ' + (E.letters(w.parts[0][2]).length) + '-consonant sign: ' + tl(w.parts[0][2]) + '.', 'The signs after it repeat sounds it already holds. They are phonetic complements, not new sounds.', 'So the word is ' + tl(w.tl) + '.'], h: 'Do not read the complements twice.', viz: { name: 'eg-glyphs', opts: { word: k, quiet: true, interactive: false } } };
      } }
    ]);
  });

  G('arch.after-champollion', function (R, ctx) {
    var E = EG(), bis = E.SIGN_ORDER.filter(function (c) { return E.SIGNS[c].k === 'bi' && E.SIGNS[c].v.length === 1; }), unis = E.SIGN_ORDER.filter(function (c) { return E.SIGNS[c].k === 'uni' && c !== 'Aa15' && c !== 'Z4'; });
    return bank(R, ctx, [
      { q: 'What did Richard Lepsius show in his letter to Rosellini (1837)?', a: 'Many signs stand for two or three consonants, not one', w: ['Hieroglyphs are pure symbols', 'Demotic is a form of Greek', 'The Rosetta Stone is a forgery'], s: ['Champollion had read most sound signs as single letters.', 'Lepsius showed that many write two or three consonants, and explained phonetic complements: the turn from decipherment to grammar.'], h: 'He corrected Champollion\'s single-letter readings.' },
      { q: 'What is the Canopus Decree?', a: 'A decree of 238 BC in hieroglyphs, Demotic and Greek, found at Tanis in 1866', w: ['The decree on the Rosetta Stone', 'A Coptic letter of AD 452', 'Champollion\'s letter to the Academy'], s: ['Priests issued it in 238 BC to honor Ptolemy III and his family.', 'Lepsius found a well-preserved copy at Tanis in 1866; its texts confirmed the decipherment.'], h: 'Another trilingual decree, older than the Rosetta Stone.' },
      { tf: false, q: 'True or false: all scholars accepted Champollion\'s decipherment as soon as he announced it in 1822.', s: ['Some, like Gustav Seyffarth, rejected it for decades.', 'Lepsius\'s corrections (1837) and new texts like the Canopus Decree (found 1866) settled the matter.'] },
      function (R) {
        var right = R.pick(bis), wrong = R.sample(unis, 3);
        return { q: 'Lepsius showed that some signs write two consonants. Which of these signs is one of them?', a: E.SIGNS[right].u + ' ' + right + ' (' + E.SIGNS[right].v[0] + ')', w: wrong.map(function (c) { return E.SIGNS[c].u + ' ' + c + ' (' + E.SIGNS[c].v[0] + ')'; }),
          s: ['Count the consonants in each value.', E.SIGNS[right].v[0] + ' has two; the others have one each.'], h: 'Count the consonants in the readings.', chk: { sign: [right, 2] } };
      },
      { lv: 2, f: function () { return yearQ(EV.canopus); } },
      { lv: 2, f: function () { return yearQ(EV.lepsiusLetter); } },
      { lv: 2, q: 'Why was the Canopus Decree, found in 1866, strong proof that the decipherment was right?', a: 'It was found after the rules were made, so it was an independent test', w: ['It was longer than any text ever written', 'Champollion had helped carve it', 'It had no Greek text, so it proved hieroglyphs on their own'], s: ['Rules worked out from the Rosetta Stone fit the Rosetta Stone by design.', 'A new bilingual text, read by the old rules, matched its Greek: a real test passed.'], h: 'A test is strongest when the answer was not known in advance.' },
      { lv: 3, f: function (R) { return orderQ(R, evs(['lettre', 'precis', 'lepsiusLetter', 'prussian', 'canopus']), 4); } }
    ]);
  });


  // ================================================================ Unit 3: Excavation and Its Methods
  G('arch.collectors', function (R, ctx) {
    var WHO = [['Giovanni Belzoni', 'moved the colossal head of Ramesses II called the "Younger Memnon" from the Ramesseum'], ['Giovanni Belzoni', 'found the tomb of Seti I in the Valley of the Kings in 1817'], ['Bernardino Drovetti', 'was the French consul whose collection founded the Egyptian Museum in Turin'], ['Henry Salt', 'was the British consul who employed Belzoni']];
    return bank(R, ctx, [
      function (R) { var w = R.pick(WHO); return { q: 'Who ' + w[1] + '?', a: w[0], w: ['Giovanni Belzoni', 'Bernardino Drovetti', 'Henry Salt', 'Auguste Mariette', 'Flinders Petrie'], k: 4, s: ['Belzoni worked for the British consul Henry Salt; Drovetti was the French consul and their rival.', w[0] + ' ' + w[1] + '.'], h: 'This was the age of rival consuls, before Mariette\'s Antiquities Service.' }; },
      { q: 'Why is so much information lost from objects collected in the early 1800s?', a: 'Collectors rarely recorded where or with what each object was found', w: ['The objects were all modern copies', 'The objects were damaged on the voyage to Europe', 'Museums refused to display them'], s: ['Collectors wanted objects for museums and sale, not the information around them.', 'Without findspots and associations, the objects cannot be dated or interpreted from their context.'], h: 'What did they not write down?' },
      { tf: false, q: 'True or false: early collectors like Belzoni and Drovetti were archaeologists who recorded the contexts of their finds.', s: ['They dug for objects to ship to Europe, sometimes with force.', 'Systematic recording of context came later, with excavators like Petrie.'] },
      function (R) { var m = R.pick([['the "Younger Memnon" (head of Ramesses II)', 'the British Museum, London'], ['Drovetti\'s first collection', 'the Egyptian Museum, Turin'], ['the sarcophagus of Seti I found by Belzoni', 'Sir John Soane\'s Museum, London']]); return { q: 'Where is ' + m[0] + ' today?', a: m[1], w: ['The British Museum, London', 'The Egyptian Museum, Turin', 'Sir John Soane\'s Museum, London', 'The Louvre, Paris', 'The Egyptian Museum, Cairo'].filter(function (x) { return x.toLowerCase() !== m[1].toLowerCase(); }), k: 4, s: ['Salt\'s and Belzoni\'s finds went largely to London; Drovetti\'s first collection was bought for Turin in 1824.', cap(m[0]) + ': ' + m[1] + '.'], h: 'British consul, British museums; French consul, sold to the King of Sardinia.' }; },
      { lv: 2, f: function () { return yearQ(R.pick([EV.seti, EV.memnon])); } },
      { lv: 2, q: 'Belzoni broke the bases of two columns at the Ramesseum. Why does a historian count this against him, even though he saved the statue for a museum?', a: 'He damaged a monument and its setting to remove one object', w: ['The columns were made of gold', 'He sold the statue to France', 'The statue was a modern fake'], s: ['Moving the "Younger Memnon" required clearing a path, and he broke column bases to do it.', 'The object survived; part of its setting did not. That trade-off is what changed with later methods.'], h: 'Think about the building, not the statue.' },
      { lv: 3, f: function (R) { return orderQ(R, evs(['invasion', 'memnon', 'seti', 'turin', 'decree1835', 'service']), 4); } },
      { lv: 3, q: 'A museum label reads: "Statue of an official, bought in Luxor, 1823." What question can this statue no longer answer?', a: 'Which tomb or temple it came from, and what stood with it', w: ['What the official looked like in the statue', 'What the inscription on it says', 'What stone it is made of'], s: ['The statue itself still shows its style, stone and inscription.', 'But its findspot and associations were never recorded, so we cannot tell where it stood or what it was part of.'], h: 'What was never written down?' }
    ]);
  });

  G('arch.mariette', function (R, ctx) {
    return bank(R, ctx, [
      function () { return yearQ(EV.service); },
      { q: 'What did Mariette find at Saqqara in 1850–1851?', a: 'The Serapeum, the burial galleries of the Apis bulls', w: ['The tomb of Tutankhamun', 'The Rosetta Stone', 'The Canopus Decree'], s: ['Mariette followed an avenue of sphinxes in the sand at Saqqara.', 'It led to the Serapeum, the underground galleries where the sacred Apis bulls were buried.'], h: 'Sphinxes led the way.' },
      { q: 'What was the main purpose of the museum Mariette opened at Bulaq in 1863?', a: 'To keep finds in Egypt and register them', w: ['To sell antiquities to collectors', 'To display copies of European art', 'To store the Description de l\'Égypte'], s: ['Mariette\'s Antiquities Service controlled excavation from 1858.', 'The Bulaq museum gave important finds a home, and a register, in Egypt.'], h: 'Before this, most finds left the country.' },
      { tf: false, q: 'True or false: after Mariette founded the Antiquities Service, every object found in Egypt stayed in Egypt.', s: ['The Service began the effort to keep finds, and the museum gave them a home.', 'But finds were still divided with foreign excavators for many decades, and many objects left legally.'] },
      { lv: 2, f: function () { return yearQ(EV.bulaq); } },
      { lv: 2, q: 'Which criticism of Mariette is supported by the record?', a: 'He kept Egyptians such as Ahmed Kamal out of senior posts', w: ['He sent all finds to the Louvre', 'He refused to excavate at Saqqara', 'He forbade photography of finds'], s: ['Mariette built the Service and museum, but he is said to have blocked Egyptian scholars\' careers.', 'Heinrich Brugsch wrote that Mariette even forbade Egyptians to copy hieroglyphs in the museum.'], h: 'Think about who was allowed to do Egyptology.' },
      { lv: 2, q: 'Which ruler made Mariette head of Egypt\'s new Antiquities Service in 1858?', a: 'Said Pasha', w: ['Napoleon Bonaparte', 'Muhammad Ali', 'Queen Victoria'], s: ['Said Pasha, ruler of Egypt from 1854 to 1863, created the post of conservator of monuments for Mariette in 1858.', 'Muhammad Ali had issued an earlier decree in 1835, which was little enforced.'], h: 'Egypt\'s ruler in 1858.' },
      { lv: 3, f: function (R) { return orderQ(R, evs(['decree1835', 'serapeum', 'service', 'bulaq', 'tahrir']), 4); } }
    ]);
  });

  G('arch.petrie', function (R, ctx) {
    return bank(R, ctx, [
      { q: 'Which of these was new in Flinders Petrie\'s way of excavating?', a: 'Recording small finds and pottery and where each was found', w: ['Digging only for statues and gold', 'Using dynamite to open tombs quickly', 'Selling finds to pay for the dig'], s: ['Earlier diggers kept the spectacular objects.', 'Petrie recorded everything, including potsherds and beads, with its findspot, because ordinary things date a site.'], h: 'He kept what others threw away.' },
      { q: 'Why did Petrie think broken pottery mattered?', a: 'Pottery styles change over time, so sherds can date a site', w: ['Pots were made of valuable materials', 'Pottery always carries a king\'s name', 'Pottery never changes, so it is easy to compare'], s: ['Pots broke often and were replaced, and their styles changed with fashion.', 'So the kinds of sherds in a layer show when it was formed.'], h: 'Think about fashion.' },
      { tf: false, q: 'True or false: Petrie believed only gold objects and statues were worth recording.', s: ['He recorded even the smallest finds and paid workers for every object handed in.', 'His sequence dating was built on ordinary pottery.'] },
      { q: 'Petrie paid his workers a small reward for every object they found. Why?', a: 'So that finds were handed in and recorded instead of sold', w: ['So that they would dig faster', 'Because the law required it', 'So that he could sell the objects later'], s: ['A worker could sell a small find to a dealer, and its findspot would be lost.', 'A reward made it worth handing in, so it entered the record.'], h: 'What happens to a bead nobody reports?' },
      { lv: 2, f: function () { return yearQ(EV.ucl, 'In what year was the first chair of Egyptology in Britain founded, at University College London, with Petrie as its first professor?'); } },
      { lv: 2, q: 'Why did Petrie publish each season\'s work quickly?', a: 'Because once a site is dug, the published record is all that remains', w: ['Because his sponsors wanted to sell the books', 'Because the Antiquities Service would otherwise confiscate the finds', 'Because publication made the objects more valuable'], s: ['Excavation removes the evidence it studies.', 'An unpublished dig leaves nothing for anyone else to check or use.'], h: 'Excavation destroys.' },
      { lv: 2, q: 'Petrie first went to Egypt in 1880 to survey the Giza pyramids. What did his measurements show?', a: 'That a popular theory of a sacred unit of length built into the Great Pyramid was false', w: ['That the Great Pyramid was built by Napoleon\'s engineers', 'That the pyramids were tombs of the Ptolemies', 'That the Sphinx was older than the Nile'], s: ['A popular book of the time claimed the Great Pyramid encoded a sacred "pyramid inch".', 'Petrie\'s careful survey (published 1883) found no such thing.'], h: 'He went to test a claim.' },
      { lv: 3, f: function (R) { return orderQ(R, [EV.petrieStart, EV.ucl, EV.sd, EV.tahrir, { id: 'methods', label: 'Petrie publishes Methods and Aims in Archaeology', y: 1904 }, { id: 'gizeh', label: 'Petrie begins his survey of the Giza pyramids', y: 1880 }], 4); } }
    ]);
  });

  // ---- seriation: graves whose pot types overlap in a chain (grave i has types i and i+1 in time order)
  function graves(R, n) {
    var labels = R.shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9']).slice(0, n);   // grave labels in TRUE time order
    var types = 'ABCDEFGH'.slice(0, n + 1).split('');
    var tl = R.shuffle(types.slice());                                                // type letters shown, shuffled
    var gr = labels.map(function (lab, i) { return { lab: lab, t: [tl[i], tl[i + 1]].sort() }; });
    var shown = R.shuffle(gr.slice());
    var cols = types.slice().sort();
    var tab = '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th scope="col">Grave</th>' + cols.map(function (c) { return '<th scope="col">Type ' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      shown.map(function (g) { return '<tr><td>' + g.lab + '</td>' + cols.map(function (c) { return '<td>' + (g.t.indexOf(c) >= 0 ? '✓' : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    return { order: labels, gr: gr, tab: tab, first: tl[0] };
  }
  function chainSteps(g) {
    return ['Start with a grave that shares a type with only one other grave: it is at one end.', 'Link each grave to the one that shares a type with it: ' + g.gr.map(function (x) { return x.lab + ' (' + x.t.join(', ') + ')'; }).join(' – ') + '.', 'Check: each type now appears in one unbroken run.'];
  }
  G('arch.seriation', function (R, ctx) {
    return bank(R, ctx, [
      { f: function (R) {
        var g = graves(R, 5), mid = g.order[2];
        return { q: 'Petrie listed the pot types found in each grave. Put the graves in a sequence where every type appears in one unbroken run. Which grave is in the <b>middle</b> of the sequence?' + g.tab, a: 'Grave ' + mid, w: g.order.filter(function (x) { return x !== mid; }).map(function (x) { return 'Grave ' + x; }), k: 4,
          s: chainSteps(g).concat(['The sequence is ' + g.order.join(', ') + ' (or the reverse); either way the middle grave is ' + mid + '.']), h: 'Graves that share a type sit next to each other.', chk: { seri: { gr: g.gr, ans: 'mid', v: mid } } };
      } },
      { f: function (R) {
        var g = graves(R, 4), early = g.order[0], seq = g.order.join(', '), rev = g.order.slice().reverse().join(', ');
        var others = perms(g.order).map(function (p) { return p.join(', '); }).filter(function (s) { return s !== seq && s !== rev; });
        return { q: 'The graves below are to be put in order by their pot types. Grave ' + early + ' has jars with real wavy handles, an early style that later shrank to a painted line. What is the order, <b>earliest first</b>?' + g.tab, a: seq, w: [rev].concat(R.sample(others, 2)), k: 4,
          s: chainSteps(g).concat(['That gives ' + seq + ' or its reverse.', 'Grave ' + early + ' has the early handles, so it comes first: ' + seq + '.']), h: 'Find the chain first, then use the handles to decide which end is earlier.', chk: { seri: { gr: g.gr, ans: 'order', v: g.order } } };
      } },
      { q: 'Grave X has sequence date SD 42 and grave Y has SD 63. What can you conclude?', a: 'X is earlier than Y, but not by how many years', w: ['X is 21 years older than Y', 'Y is earlier than X', 'X and Y are 21 centuries apart'], s: ['Sequence dates give an order: a lower SD is earlier.', 'The steps between numbers are not years, so the gap in time is unknown.'], h: 'Sequence dates are an order, not a calendar.' },
      { tf: false, q: 'True or false: a grave at SD 50 is exactly 10 years later than a grave at SD 40.', s: ['Sequence dates rank graves in order; they are not years.', 'SD 50 is later than SD 40, but by an unknown amount of time.'] },
      { q: 'What does seriation rest on?', a: 'Styles come into use, are popular for a while, then fade out', w: ['Every pot carries its date of manufacture', 'Older pots are always buried deeper', 'Styles never change once invented'], s: ['A style in use for a limited time appears only in graves of that time.', 'So graves can be ordered by which styles they share.'], h: 'Think of fashions.' },
      { lv: 2, f: function (R) {
        var g = graves(R, 5), ends = [g.order[0], g.order[4]].sort(), pairs = [];
        for (var i = 0; i < 5; i++) for (var j = i + 1; j < 5; j++) pairs.push([g.order[i], g.order[j]].sort().join(' and '));
        var right = ends.join(' and ');
        return { q: 'Seriate these graves by their pot types. Which two graves are at the <b>ends</b> of the sequence?' + g.tab, a: 'Graves ' + right, w: pairs.filter(function (x) { return x !== right; }).map(function (x) { return 'Graves ' + x; }), k: 4,
          s: chainSteps(g).concat(['The ends are the graves that share a type with only one other grave: ' + right + '.']), h: 'An end grave has only one neighbor.', chk: { seri: { gr: g.gr, ans: 'ends', v: ends } } };
      } },
      { lv: 2, q: 'Why did Petrie start his sequence dates at SD 30 instead of SD 1?', a: 'To leave room for earlier cultures not yet found', w: ['Because the first 29 graves were empty', 'Because SD 30 meant 3000 BC', 'Because the oldest pot was found in grave 30'], s: ['Petrie expected that older cultures would be found later.', 'Starting at 30 left numbers free for them.'], h: 'He expected more to be found.' },
      { lv: 3, f: function (R) {
        var g = graves(R, 6), early = g.order[0], seq = g.order.join(', '), rev = g.order.slice().reverse().join(', ');
        var others = R.shuffle(perms(g.order).map(function (p) { return p.join(', '); }).filter(function (s) { return s !== seq && s !== rev; })).slice(0, 2);
        return { q: 'Six graves and their pot types. Grave ' + early + ' has the earliest jar style. What is the full order, earliest first?' + g.tab, a: seq, w: [rev].concat(others), k: 4,
          s: chainSteps(g).concat(['Grave ' + early + ' is earliest, so the order is ' + seq + '.']), h: 'Link graves that share a type into a chain, then orient it.', chk: { seri: { gr: g.gr, ans: 'order', v: g.order } } };
      } }
    ]);
  });

  // ---- stratigraphy: layers numbered from the top; a pit cut from the surface of layer j down into layer m (j < m)
  var DEPOSITS = ['windblown sand', 'collapsed mud-brick', 'a house floor', 'ash and rubbish', 'flood silt', 'older town debris', 'a courtyard surface'];
  var SEALS = [['ramesses2', 'Ramesses II'], ['thutmose3', 'Thutmose III'], ['amenhotep3', 'Amenhotep III'], ['senusret3', 'Senusret III'], ['seti1', 'Seti I']];
  function section(R, n, pit) {
    var dep = R.shuffle(DEPOSITS).slice(0, n), j = pit ? R.int(2, n - 2) : 0, m = pit ? R.int(j + 1, n - 1) : 0;
    var rows = dep.map(function (d, i) { return '<tr><td>' + (i + 1) + '</td><td>' + d + '</td></tr>'; }).join('');
    var tab = '<div class="mlp-table-wrap"><table class="mlp-table"><thead><tr><th scope="col">Layer (top first)</th><th scope="col">Deposit</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    var pitTxt = pit ? '<br>A pit was dug down from the surface of layer ' + j + ' into layer ' + m + ', and filled in; layer ' + (j - 1 >= 1 ? (j - 1) + ' lies over it' : 'nothing lies over it') + '.' : '';
    return { n: n, j: j, m: m, tab: tab, pitTxt: pitTxt };
  }
  function formation(sec) { // order of formation, earliest first: n, n-1, …, j, PIT, j-1, …, 1
    var out = []; for (var i = sec.n; i >= 1; i--) { out.push(String(i)); if (sec.j && i === sec.j) out.push('pit'); } return out;
  }
  G('arch.stratigraphy', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var sec = section(R, R.int(4, 5), false), a = R.int(1, sec.n - 1), b = R.int(a + 1, sec.n), ask = R.coin();
        return { q: 'An undisturbed section, top layer first:' + sec.tab + 'Which is ' + (ask ? 'older' : 'younger') + ': layer ' + a + ' or layer ' + b + '?', a: 'Layer ' + (ask ? b : a), w: ['Layer ' + (ask ? a : b), 'They formed at the same time'], k: 3,
          s: ['In an undisturbed sequence, a layer is laid down on top of what is already there.', 'Layer ' + b + ' is below layer ' + a + ', so layer ' + b + ' is older and layer ' + a + ' is younger.'], h: 'Lower is older, if nothing has disturbed it.', chk: { strat: { n: sec.n, j: 0, q: [a, b], ans: ask ? b : a } } }; },
      function (R) { var sec = section(R, R.int(4, 5), false), k = R.int(2, sec.n), s = R.pick(SEALS), kg = EG().king(s[0]);
        return { q: 'Layer ' + k + ' of a section contains a jar sealing naming ' + s[1] + ' (reigned ' + EG().span(kg.from, kg.to, true) + '). Layer ' + (k - 1) + ' lies directly on top of it. What can you say about when layer ' + (k - 1) + ' formed?', a: 'No earlier than the reign of ' + s[1], w: ['Before the reign of ' + s[1], 'Exactly during the reign of ' + s[1], 'Nothing at all'], s: ['The sealing shows layer ' + k + ' formed during or after ' + s[1] + '\'s reign.', 'Layer ' + (k - 1) + ' was laid on top of layer ' + k + ', so it too formed no earlier than that reign: a "no earlier than" date (terminus post quem).'], h: 'A find gives a "no earlier than" date, and it passes upward.' }; },
      { tf: false, q: 'True or false: a deeper layer is always older than the layer above it.', s: ['Only in an undisturbed sequence.', 'Pits, burrows, graves and foundations are dug down from later surfaces and carry later material into lower levels.'] },
      { q: 'A layer contains a seal of Ramesses II. What does that tell you about the layer?', a: 'It formed during or after his reign', w: ['It formed exactly during his reign', 'It formed before his reign', 'It belongs to his tomb'], s: ['The seal existed only from his reign onward.', 'So the layer cannot be earlier, but it could be much later: seals were kept, lost and re-deposited.'], h: 'A find sets a "no earlier than" limit.' },
      { lv: 2, f: function (R) { var sec = section(R, R.int(5, 6), true);
        return { q: 'A section, top layer first:' + sec.tab + sec.pitTxt + '<br>Is the pit older or younger than layer ' + sec.m + ', the deepest layer it reaches?', a: 'Younger', w: ['Older', 'The same age'], k: 3, s: ['A pit is dug down from a surface that already exists.', 'It was cut from the surface of layer ' + sec.j + ', so layer ' + sec.m + ' and every layer up to layer ' + sec.j + ' already existed. The pit is younger than all of them, though it lies deeper than some.'], h: 'A pit cuts through layers that were already there.', chk: { strat: { n: sec.n, j: sec.j, m: sec.m, ans: 'pit-younger' } } }; } },
      { lv: 2, f: function (R) { var sec = section(R, R.int(5, 6), true), f = formation(sec);
        var items = R.shuffle(f.filter(function (x) { return x !== 'pit'; })).slice(0, 2).concat(['pit']), lab = function (x) { return x === 'pit' ? 'the pit' : 'layer ' + x; };
        var right = f.filter(function (x) { return items.indexOf(x) >= 0; });
        var str = function (a) { return a.map(lab).map(cap).join(' → '); }, wrong = perms(items).filter(function (p) { return str(p) !== str(right); }).map(str);
        return { q: 'A section, top layer first:' + sec.tab + sec.pitTxt + '<br>Put these in the order they formed, earliest first: ' + items.map(lab).join(', ') + '.', a: str(right), w: wrong, k: 4,
          s: ['Undisturbed layers formed from the bottom up: ' + f.filter(function (x) { return x !== 'pit'; }).join(', ') + '.', 'The pit was dug after layer ' + sec.j + ' formed and before layer ' + (sec.j - 1 >= 1 ? sec.j - 1 : 'none') + ' covered it.', 'So: ' + str(right) + '.'], h: 'Bottom layers first; the pit comes right after the layer it was dug from.', chk: { strat: { n: sec.n, j: sec.j, m: sec.m, items: items, ans: right } } }; } },
      { lv: 3, f: function (R) { var sec = section(R, 6, true), coinL = sec.m;
        return { q: 'A section, top layer first:' + sec.tab + sec.pitTxt + '<br>A Roman coin is found in the pit\'s fill, at the depth of layer ' + coinL + '. Does the coin date layer ' + coinL + ' to Roman times?', a: 'No: it dates the filling of the pit, which is younger than layer ' + coinL, w: ['Yes: it lies at the depth of layer ' + coinL, 'Yes: coins always date the layer around them', 'No: coins cannot be dated'], s: ['The coin is inside the pit, not in layer ' + coinL + ' itself.', 'The pit was cut later from layer ' + sec.j + ', so the coin tells us when the pit was filled, not when layer ' + coinL + ' formed.'], h: 'Which deposit is the coin really in?' }; } }
    ]);
  });

  G('arch.kv62', function (R, ctx) {
    var ROLES = [['Harry Burton', 'photographed the objects where they lay'], ['Alfred Lucas', 'was the chemist who helped conserve the finds'], ['Arthur Mace', 'was a conservator from the Metropolitan Museum who helped clear the antechamber'], ['Lord Carnarvon', 'paid for the excavation']];
    return bank(R, ctx, [
      function () { return yearQ(EV.kv62); },
      function (R) { var r = R.pick(ROLES); return { q: 'In the excavation of Tutankhamun\'s tomb, who ' + r[1] + '?', a: r[0], w: ROLES.map(function (x) { return x[0]; }).concat(['Flinders Petrie']), k: 4, s: ['Carter led the work, paid for by Lord Carnarvon.', 'Burton photographed, Lucas (a chemist) and Mace (a conservator) treated the finds.', r[0] + ' ' + r[1] + '.'], h: 'A team, not one man.' }; },
      { q: 'How long did Carter and his team take to record and clear Tutankhamun\'s tomb?', a: 'About ten years', w: ['About ten weeks', 'About one year', 'About fifty years'], s: ['The tomb was found in November 1922.', 'The last objects went to Cairo in 1932: about ten years.'], h: 'From 1922 to 1932.' },
      { tf: false, q: 'True or false: everyone who entered Tutankhamun\'s tomb died soon afterward because of a curse.', s: ['Carter, who spent the most time in the tomb, lived until 1939.', 'Lord Carnarvon died in 1923 of an infection. A 2002 study found no shorter lives among those present. The "curse" was a newspaper story.'] },
      { lv: 2, f: function (R) { return mapPick(R, 'kings', ['kings', 'karnak', 'luxor', 'deir-el-medina', 'medinet-habu', 'queens'], 'Which lettered dot is the Valley of the Kings, where KV62 was found?', ['The Valley of the Kings lies in the desert hills on the west bank at Thebes, behind Deir el-Bahari.'], 'West bank, in the hills.'); } },
      { lv: 2, f: function () { return yearQ(EV.clearance, 'In what year were the last objects from Tutankhamun\'s tomb sent to Cairo?'); } },
      { lv: 2, q: 'About how many objects were numbered and recorded from Tutankhamun\'s tomb?', a: 'About 5,400', w: ['About 54', 'About 540', 'About 54,000'], s: ['Carter\'s team numbered 5,398 objects.', 'Each one was photographed, described and, where needed, conserved.'], h: 'Thousands.' },
      { lv: 2, q: 'Why did Carter photograph and number every object before moving it?', a: 'Because its position was evidence that moving it would destroy', w: ['To prove the objects were real gold', 'Because newspapers paid for the photographs', 'So that the objects could be sold later'], s: ['The arrangement of objects in a tomb shows how the burial was made and disturbed.', 'Once an object is moved, that information exists only in the record.'], h: 'What is lost when an object is moved?' },
      { lv: 3, f: function (R) { return orderQ(R, [{ id: 'step', label: 'The first step is found', y: 1922.84, when: '4 November 1922' }, { id: 'look', label: 'Carter and Carnarvon look into the antechamber', y: 1922.9, when: '26 November 1922' }, { id: 'burial', label: 'The burial chamber is officially opened', y: 1923.12, when: '16 February 1923' }, { id: 'carn', label: 'Lord Carnarvon dies', y: 1923.26, when: '5 April 1923' }, { id: 'mummy', label: 'The mummy is examined', y: 1925.86, when: 'November 1925' }, EV.clearance], 4); } },
      { lv: 3, q: 'Carter knew Tutankhamun\'s tomb had not been found, though most thought the Valley was exhausted. What evidence pointed to an undiscovered tomb?', a: 'Objects naming Tutankhamun had been found nearby, but no tomb', w: ['A map of the tomb in a papyrus', 'Herodotus described the tomb', 'A curse inscription at the entrance of the Valley'], s: ['Earlier excavators had found small objects and a pit with materials naming Tutankhamun in the Valley.', 'A king of the New Kingdom should have a tomb there, and his had never been found.'], h: 'Think of clues with his name on them.' }
    ]);
  });

  G('arch.recording', function (R, ctx) {
    var KINDS = [['Findspot', 'where exactly the object was'], ['Association', 'what else was found with it'], ['Layer or feature', 'which deposit held it'], ['Condition', 'how it lay']];
    var NOTES = [['The amulet lay 1.2 m below the surface, in square C4, 3 m from the north wall.', 0], ['The amulet was found in the same grave as two jars and a mirror.', 1], ['The amulet came from the fill of a pit cut into the floor of room 7.', 2], ['The amulet lay face down at the neck of the body, still on its string.', 3], ['The scarab was found 40 cm above the floor in the northeast corner of the room.', 0], ['The scarab lay in the same burial as a coffin naming its owner.', 1], ['The scarab came from the layer of collapsed mud-brick above the house floor.', 2], ['The scarab was broken in two, with the pieces a meter apart.', 3]];
    return bank(R, ctx, [
      function (R) { var n = R.pick(NOTES), k = KINDS[n[1]]; return { q: 'An excavator writes: "' + n[0] + '" Which part of the object\'s context does this record mostly describe?', a: k[0] + ': ' + k[1], w: KINDS.map(function (x) { return x[0] + ': ' + x[1]; }), k: 4, s: ['Findspot: where exactly. Association: what with. Layer or feature: which deposit. Condition: how it lay.', 'This note gives ' + k[1] + ': ' + k[0].toLowerCase() + '.'], h: 'Where, with what, in which deposit, or how?' }; },
      { q: 'Why must excavators record so carefully?', a: 'Excavation destroys the context it uncovers', w: ['Objects lose their value if they are not photographed', 'The law requires a photo of every visitor', 'Records make the objects easier to sell'], s: ['A layer can only be dug once.', 'After it is removed, the arrangement of things in it survives only in the notes, plans and photographs.'], h: 'Can a layer be dug twice?' },
      { tf: false, q: 'True or false: an object bought from a dealer tells historians just as much as the same object found in a recorded excavation.', s: ['A bought object shows only its own style and inscription, and it may even be a fake.', 'An excavated one also carries its date, use and setting from its context.'] },
      { lv: 2, q: 'Two identical scarabs: one excavated beside the neck of a body in a dated grave, one bought on the market. What can the excavated one tell us that the bought one cannot?', a: 'How it was used, and the date and setting of the burial', w: ['What it is made of', 'What its inscription says', 'Nothing more, since they are identical'], s: ['Both show material and inscription.', 'Only the excavated one tells us it was worn at the neck, in which grave, of what date, with what else.'], h: 'Same object, different evidence.' },
      { lv: 2, q: 'The bust of Nefertiti was found in a sculptor\'s workshop at Amarna among plaster studies, and it has only one inlaid eye. What does that context suggest?', a: 'It was probably a sculptor\'s model kept in the workshop', w: ['It was the queen\'s tomb statue', 'It was made in modern times', 'It was a temple\'s cult image'], s: ['A workshop is where models were made and kept.', 'Its findspot among studies, and its unfinished eye, suggest a model, not a finished statue for a temple or tomb.'], h: 'Where was it found?' },
      { lv: 3, q: 'Why do many excavators deliberately leave part of a site undug?', a: 'So future archaeologists, with better methods, can study it', w: ['Because the law forbids digging more than half', 'To save money on workers', 'Because the deepest layers are always empty'], s: ['Every excavation destroys what it digs.', 'Leaving part untouched keeps evidence for methods not yet invented, as radiocarbon and DNA were once.'], h: 'Think about methods that did not exist a century ago.' }
    ]);
  });


  // ================================================================ Unit 4: Dating Methods
  var HALF = 5730;
  G('arch.relative-absolute', function (R, ctx) {
    var REL = ['Layer 3 formed after layer 4.', 'Grave 12 is earlier than grave 31 in the sequence.', 'The pit is younger than the wall it cuts.', 'This pot type went out of use before that one came in.', 'The house floor is older than the collapsed roof lying on it.', 'Grave B has sequence date SD 45, grave C has SD 58.'];
    var ABS = ['The seeds date to c. 2600 BC (± 50 years).', 'The last hieroglyphic inscription was carved in AD 394.', 'The potsherd was fired 4,000 ± 300 years ago.', 'The decree was issued in 196 BC.', 'The tomb was found in November 1922.', 'The charcoal is about 11,460 years old.'];
    return bank(R, ctx, [
      function (R) { var rel = R.coin(), s = R.pick(rel ? REL : ABS); return { q: 'Is this a relative date or an absolute date?<br>"' + esc(s) + '"', a: rel ? 'Relative' : 'Absolute', w: [rel ? 'Absolute' : 'Relative'], k: 2, s: [rel ? 'It puts things in order (earlier, later, younger, older) without a year on the calendar.' : 'It gives a position in years on the calendar' + (/±|c\.|about/.test(s) ? ', with a margin.' : '.'), (rel ? 'Relative' : 'Absolute') + '.'], h: 'Is there a calendar year in it?' }; },
      { q: 'What does an absolute date always need, besides a year?', a: 'A margin of error', w: ['A king\'s name', 'A second layer to compare with', 'A Greek translation'], s: ['Every measured or calculated date has an uncertainty.', 'An honest absolute date says how wide it is: "c. 2600 BC", "± 50 years".'], h: 'Think of "±".' },
      { tf: false, q: 'True or false: "earlier than the pottery in layer 3" is an absolute date.', s: ['It puts a thing in order relative to something else.', 'There is no year on the calendar, so it is a relative date.'] },
      { tf: true, q: 'True or false: a relative date can be certain even when no one knows its year.', s: ['A layer sealed under a floor must be older than the floor, whatever the year.', 'Relative dates can be certain; absolute dates always carry a margin.'] },
      { lv: 2, f: function (R) { var y = R.pick([1900, 1800, 1500, 2300, 2600]); return { q: 'A layer lies directly on top of a floor. Seeds on the floor are dated by radiocarbon to c. ' + y + ' BC. What can you say about the layer?', a: 'It formed after c. ' + y + ' BC', w: ['It formed before c. ' + y + ' BC', 'It formed in exactly ' + y + ' BC', 'Nothing, because it is a relative date'], s: ['The layer is above the floor, so it is younger: a relative statement.', 'The floor is dated to c. ' + y + ' BC: an absolute date.', 'Together: the layer formed after c. ' + y + ' BC.'], h: 'Above means later, if undisturbed.' }; } },
      { lv: 3, f: function (R) { var st = R.sample(REL, 2).concat(R.sample(ABS, 2)), q = function (x) { return '"' + x + '"'; }, pairs = [];
        for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) pairs.push(q(st[i]) + ' and ' + q(st[j]));
        return { q: 'Which two of these statements are <b>relative</b> dates?<br>' + R.shuffle(st).map(function (x) { return '• ' + esc(x); }).join('<br>'), a: pairs[0], w: pairs.slice(1), k: 4,
          s: ['Relative: an order without a calendar year. Absolute: a year (with a margin).', 'The relative ones are ' + esc(pairs[0]) + '.'], h: 'Look for a year.', chk: { relpair: [st[0], st[1]] } }; } }
    ]);
  });

  function frac(n) { return '1/' + Math.pow(2, n); }
  G('arch.radiocarbon-method', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var n = R.int(1, 3); return { q: 'Carbon-14 has a half-life of about 5,730 years. What fraction of a plant\'s original carbon-14 is left after <b>' + n + '</b> half-li' + (n > 1 ? 'ves' : 'fe') + '?', spec: { t: 'num', v: frac(n) }, s: ['Each half-life halves what is left.', n === 1 ? 'After one: 1/2.' : 'After ' + n + ': ' + Array(n + 1).join('1/2 × ').slice(0, -3) + ' = ' + frac(n) + '.'], h: 'Halve, then halve again.', chk: { c14: { n: n, f: frac(n) } } }; },
      function (R) { var n = R.int(1, 3), what = R.pick(['a piece of charcoal', 'a wooden peg', 'a bundle of reeds', 'a seed']); return { q: 'Using a half-life of 5,730 years: ' + what + ' has ' + frac(n) + ' of the carbon-14 that a living plant has. About how many years ago did it die?', spec: { t: 'num', v: String(HALF * n), rtol: 0.01 }, unit: 'years', s: [frac(n) + ' means ' + n + ' half-li' + (n > 1 ? 'ves' : 'fe') + ' have passed.', n + ' × 5,730 = ' + fmt(HALF * n) + ' years.'], h: 'How many halvings make ' + frac(n) + '?', chk: { c14: { n: n, age: HALF * n } } }; },
      function (R) { var ok = R.pick(['linen', 'a reed mat', 'charcoal from a hearth', 'grain from a storage jar', 'a papyrus', 'a wooden coffin', 'a basket']), bad = ['a granite statue', 'a copper chisel', 'a limestone block', 'a gold ring'];
        return { q: 'Which of these could be dated by radiocarbon?', a: cap(ok), w: bad.map(cap), k: 4, s: ['Radiocarbon dates things that were once alive, because only living things take in carbon-14.', cap(ok) + ' was made from plants (or animals); the stone and metal objects never lived.'], h: 'Was it ever alive?' }; },
      { q: 'Why must a radiocarbon age be calibrated?', a: 'The amount of carbon-14 in the air has varied over time', w: ['Carbon-14 decays faster in hot climates', 'Laboratories use different half-lives each year', 'Plants take in less carbon-14 as they age'], s: ['The method assumes the air always held the same share of carbon-14. It did not.', 'Tree rings of known age show how much it varied; a calibration curve (IntCal20) turns radiocarbon ages into calendar years.'], h: 'What does the method assume about the past atmosphere?' },
      { tf: false, q: 'True or false: radiocarbon can date when a stone wall was built by measuring the stone.', s: ['Stone was never alive, so it holds no carbon-14 clock.', 'To date a wall, date organic material in it: reed in the mortar, wood in the roof, charcoal from the builders\' fires.'] },
      { lv: 2, q: 'A beam reused in a Roman house is radiocarbon dated to c. 1200 BC. What is the most likely explanation?', a: 'The beam was cut long before the house was built and reused', w: ['The house was built in 1200 BC', 'Radiocarbon does not work on wood', 'The beam was contaminated by modern carbon'], s: ['Radiocarbon dates when the tree\'s wood grew, not when the beam was used.', 'Wood can be far older than the building: reused beams and the inner rings of old trees give dates that are too early. Short-lived plants are safer.'], h: 'What exactly does radiocarbon date?' },
      { lv: 2, q: 'In 1949 Libby and Arnold first tested radiocarbon on samples of known age. Where did some of their samples come from?', a: 'The tombs of Djoser and Sneferu', w: ['The Rosetta Stone', 'Tutankhamun\'s gold mask', 'The pyramids of Mexico'], s: ['They needed samples whose age was known from history.', 'Wood from the tombs of the Egyptian kings Djoser and Sneferu, dated by the king lists, gave a close match.'], h: 'Old Kingdom kings, dated by history.' },
      { lv: 3, f: function (R) { var age = R.int(60, 100) * 50, f = Math.pow(0.5, age / HALF), f2 = Math.round(f * 100) / 100;
        return { q: 'A sample from a dynastic tomb is ' + fmt(age) + ' years old. What fraction of its carbon-14 is left? Use fraction left = (1/2)^(age ÷ 5,730), and give a decimal to two places.', spec: { t: 'num', v: f2.toFixed(2), tol: 0.01 }, s: ['Age ÷ half-life = ' + fmt(age) + ' ÷ 5,730 ≈ ' + (age / HALF).toFixed(3) + '.', '(1/2)^' + (age / HALF).toFixed(3) + ' ≈ ' + f.toFixed(3) + '.', 'About ' + f2.toFixed(2) + ': less than one half-life has passed.'], h: 'Divide the age by 5,730, then raise 1/2 to that power.', chk: { c14: { age: age, f: f } } }; } },
      { lv: 3, f: function (R) { var f = R.pick([0.5, 0.6, 0.65, 0.7, 0.75, 0.8]), age = HALF * Math.log(1 / f) / Math.log(2), a = Math.round(age / 10) * 10;
        return { q: 'A seed has ' + Math.round(f * 100) + '% of the carbon-14 of a living plant. About how old is it? Use age = 5,730 × log₂(1 ÷ fraction left).', spec: { t: 'num', v: String(a), rtol: 0.02 }, unit: 'years', s: ['1 ÷ ' + f + ' = ' + (1 / f).toFixed(4) + '.', 'log₂(' + (1 / f).toFixed(4) + ') = ' + (Math.log(1 / f) / Math.LN2).toFixed(4) + '.', '5,730 × ' + (Math.log(1 / f) / Math.LN2).toFixed(4) + ' ≈ ' + fmt(a) + ' years (before calibration).'], h: 'log₂(x) = ln(x) ÷ ln(2).', chk: { c14: { f: f, age: age } } }; } }
    ]);
  });

  G('arch.luminescence', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var rate = R.pick([2, 2.5, 3, 4, 5]), age = R.pick([2.5, 3, 3.5, 4, 4.5, 5, 6]), D = Math.round(rate * age * 100) / 100;
        return { q: 'A potsherd has absorbed ' + D + ' Gy of radiation since it was fired. The dose rate in the sherd and its soil is ' + rate + ' Gy per thousand years. How long ago was it fired?', spec: { t: 'num', v: String(age * 1000), rtol: 0.01 }, unit: 'years', s: ['Age = total dose ÷ dose rate.', D + ' Gy ÷ ' + rate + ' Gy per thousand years = ' + age + ' thousand years.', 'That is ' + fmt(age * 1000) + ' years.'], h: 'Divide the total dose by the dose per thousand years.', chk: { tl: { D: D, rate: rate, age: age * 1000 } } }; },
      { q: 'What event does thermoluminescence date in a piece of pottery?', a: 'The last time it was heated, usually its firing', w: ['When the clay was dug', 'When the potter was born', 'When it was buried in its layer'], s: ['Heating empties the energy stored in the clay\'s crystals, resetting the clock.', 'For pottery the last strong heating is usually its firing in the kiln.'], h: 'What resets the clock?' },
      { q: 'What does optically stimulated luminescence (OSL) date?', a: 'The last time sediment was exposed to daylight', w: ['The last time a plant was alive', 'The last time a pot was heated', 'The year a layer was dug by archaeologists'], s: ['Sunlight resets the light-sensitive signal in quartz and feldspar grains.', 'Once the grains are buried, the signal builds up again; OSL measures how long they have been in the dark.'], h: 'What resets the clock for sand?' },
      { tf: false, q: 'True or false: luminescence dates are usually more precise than calibrated radiocarbon dates for Egyptian material.', s: ['Luminescence margins are often 5 to 10% of the age: several centuries for a sherd 4,000 years old.', 'Calibrated radiocarbon on short-lived plants often gives decades.'] },
      { lv: 2, f: function (R) { var age = R.pick([3000, 3500, 4000, 4500, 5000]), pc = R.pick([5, 8, 10]), m = age * pc / 100, low = R.coin();
        return { q: 'A lab reports a sherd as ' + fmt(age) + ' years ± ' + pc + '%. What is the ' + (low ? 'youngest' : 'oldest') + ' age in that range?', spec: { t: 'num', v: String(low ? age - m : age + m), rtol: 0.005 }, unit: 'years', s: [pc + '% of ' + fmt(age) + ' = ' + fmt(m) + ' years.', (low ? fmt(age) + ' − ' + fmt(m) : fmt(age) + ' + ' + fmt(m)) + ' = ' + fmt(low ? age - m : age + m) + ' years.'], h: 'Find the margin in years first.', chk: { margin: { age: age, pc: pc, v: low ? age - m : age + m } } }; } },
      { lv: 2, q: 'A dealer offers a "pottery figurine of the Middle Kingdom". A TL test shows it was fired about 40 years ago. What does that show?', a: 'It is a modern forgery (or was refired recently)', w: ['It is a genuine Middle Kingdom figurine', 'TL cannot date figurines', 'It was made in the Middle Kingdom and buried 40 years ago'], s: ['TL dates the last firing.', 'A genuine Middle Kingdom piece would date to about 4,000 years ago; 40 years means it was made, or at least fired, in modern times.'], h: 'What does TL measure?' },
      { lv: 3, f: function (R) { var rate = R.pick([2, 2.5, 3, 4]), age = R.pick([3, 3.5, 4, 4.5, 5]), D = Math.round(rate * age * 100) / 100;
        return { q: 'A sherd was fired about ' + fmt(age * 1000) + ' years ago. Its dose rate is ' + rate + ' Gy per thousand years. What total dose should the lab measure?', spec: { t: 'num', v: String(D), rtol: 0.01 }, unit: 'Gy', s: ['Total dose = dose rate × age.', rate + ' Gy per thousand years × ' + age + ' thousand years = ' + D + ' Gy.'], h: 'Rearrange: dose = rate × time.', chk: { tl: { D: D, rate: rate, age: age * 1000 } } }; } }
    ]);
  });

  // reigns after 664 BC are fixed to the year (Shaw 2000); year 1 = accession year
  var FIXED = [['Psamtek I', 664, 54], ['Necho II', 610, 15], ['Apries', 589, 19], ['Amasis', 570, 44], ['Darius I', 522, 36], ['Nectanebo II', 360, 17], ['Ptolemy V', 204, 24]];
  G('arch.text-dates', function (R, ctx) {
    var E = EG();
    return bank(R, ctx, [
      function (R) { var k = R.pick(FIXED), n = R.int(2, Math.min(k[2], 20)), y = k[1] - (n - 1);
        return { q: 'A papyrus is dated to <b>year ' + n + '</b> of ' + k[0] + ', whose first regnal year was ' + k[1] + ' BC. About which year BC is that?', a: y + ' BC', w: [(y - 1) + ' BC', (k[1] + n - 1) + ' BC', (y + 1) + ' BC', (k[1] - n - 1) + ' BC'], k: 4,
          s: ['Year 1 is ' + k[1] + ' BC, so year ' + n + ' is ' + (n - 1) + ' years later.', 'BC years count down: ' + k[1] + ' − ' + (n - 1) + ' = ' + y + '.', 'About ' + y + ' BC (regnal years did not begin on 1 January, so it may be a year off).'], h: 'Year 1 is the first year: subtract one less than the year number.', chk: { regnal: [k[1], n, y] } }; },
      function (R) { var keys = ['khufu', 'sneferu', 'khafre', 'menkaure', 'amenhotep', 'tutankhamun', 'ramesses', 'thutmose', 'ptolemy', 'cleopatra'], k = R.pick(keys), n = E.NAMES[k], kg = E.king(n.king), per = E.period(kg.period);
        return { q: 'A jar sealing bears this cartouche. To which period does it date the sealing (or later)?', a: per.name, w: ['Old Kingdom', 'Middle Kingdom', 'New Kingdom', 'Late Period', 'Ptolemaic Period'].filter(function (x) { return x !== per.name; }), k: 4,
          s: ['The cartouche reads ' + tl(n.tl) + ', ' + n.en + '.', n.en + ' reigned ' + E.span(kg.from, kg.to, true) + ', in the ' + per.name + '.', 'So the sealing was made then, or later if an old seal was reused.'], h: 'Read the name, then place the king.', viz: { name: 'eg-cartouche', opts: { name: k, quiet: true, interactive: false } }, chk: { period: [k, per.key] } }; },
      { q: 'A statue carries the cartouche of Ramesses II, but its style is that of Amenhotep III, a century earlier. What is the best explanation?', a: 'Ramesses II took over an older statue and recut the name', w: ['Amenhotep III copied a statue of Ramesses II', 'The statue was made in the Ptolemaic Period', 'Ramesses II reigned before Amenhotep III'], s: ['Later kings often re-inscribed earlier kings\' statues (usurpation); Ramesses II did this often.', 'The style dates the carving; the name dates the takeover.'], h: 'Which comes first: the carving or the name?' },
      { tf: false, q: 'True or false: a king\'s name on an object always proves the object was made in his reign.', s: ['Names could be added to older objects, recut, or copied in later times; heirlooms carry old names into later tombs.', 'A name gives a "no earlier than" date for the inscription, not proof of when the object was made.'] },
      { lv: 2, f: function () { return { q: 'The Rosetta decree is dated to year 9 of Ptolemy V, whose reign is counted from 204 BC. What year is that?', a: '196 BC', w: ['195 BC', '213 BC', '197 BC'], s: ['Year 1 = 204 BC.', 'Year 9 = 204 − 8 = 196 BC: the date of the decree.'], h: 'Subtract 8, not 9.', chk: { regnal: [204, 9, 196] } }; } },
      { lv: 2, q: 'A small cup naming Akhenaten was found in a tomb of Tutankhamun\'s reign. What does the cup show about the tomb\'s date?', a: 'Nothing beyond "no earlier than Akhenaten": it may be an heirloom', w: ['The tomb was built under Akhenaten', 'Tutankhamun reigned before Akhenaten', 'The tomb must be a forgery'], s: ['An object with an older king\'s name can be kept for years before burial.', 'The tomb is dated by its latest dated material, Tutankhamun\'s reign; the cup only sets a "no earlier than" limit.'], h: 'Objects are often older than the burial they are found in.' },
      { lv: 3, f: function (R) { var a = R.pick(FIXED.slice(0, 4)), b = R.pick(FIXED.slice(4)), na = R.int(2, Math.min(a[2], 15)), nb = R.int(2, Math.min(b[2], 15)), ya = a[1] - (na - 1), yb = b[1] - (nb - 1);
        return { q: 'Two papyri: one dated to year ' + na + ' of ' + a[0] + ' (reign counted from ' + a[1] + ' BC), the other to year ' + nb + ' of ' + b[0] + ' (counted from ' + b[1] + ' BC). About how many years apart were they written?', spec: { t: 'num', v: String(ya - yb), tol: 1 }, unit: 'years', s: ['First: ' + a[1] + ' − ' + (na - 1) + ' = ' + ya + ' BC.', 'Second: ' + b[1] + ' − ' + (nb - 1) + ' = ' + yb + ' BC.', ya + ' − ' + yb + ' = ' + (ya - yb) + ' years (give or take one, since regnal years did not start on 1 January).'], h: 'Convert each to a year BC first.', chk: { regnal2: [a[1], na, b[1], nb, ya - yb] } }; } }
    ]);
  });


  // ================================================================ Unit 5: Epigraphy
  var CHICAGO = [['photo', 'Photograph the wall and enlarge the print', 1], ['pencil', 'An artist pencils the carving onto the print at the wall', 2], ['ink', 'Ink the lines and bleach away the photograph', 3], ['collate', 'Two Egyptologists collate the drawing against the wall', 4], ['final', 'Make the corrections and check the drawing once more at the wall', 5]];
  G('arch.epigraphy', function (R, ctx) {
    return bank(R, ctx, [
      { q: 'What is the first rule of epigraphic copying?', a: 'Copy exactly what is there, damage included, without filling gaps', w: ['Restore missing signs so the text reads well', 'Copy only the well-preserved parts', 'Redraw the signs in their ideal shapes'], s: ['A copy is used by people who will never see the wall.', 'If the copyist fills gaps, readers cannot tell evidence from guess. Restorations belong in the edition, marked.'], h: 'The reader must be able to trust the copy.' },
      { q: 'In the Chicago method, what is collation?', a: 'Egyptologists checking the drawing against the wall, sign by sign', w: ['Gluing fragments of a broken wall back together', 'Taking photographs in raking light', 'Translating the inscription into English'], s: ['After the artist\'s drawing is inked, two Egyptologists separately compare it with the wall.', 'They mark corrections, which the artist makes. This checking is collation.'], h: 'It is a check, done by more than one person.' },
      function () { return yearQ(EV.epigraphic, 'In what year did James Henry Breasted found the Epigraphic Survey of the University of Chicago?'); },
      { tf: false, q: 'True or false: a good photograph makes careful epigraphic drawing unnecessary.', s: ['Light, stains, salt crust and cracks can hide signs or look like signs in a photograph.', 'A trained epigrapher at the wall, checked by collation, recovers details a photo misses; the photo is kept as evidence beside the drawing.'] },
      { lv: 2, q: 'Where is the Epigraphic Survey\'s base, from which it has recorded temples such as Medinet Habu?', a: 'Chicago House in Luxor', w: ['The Egyptian Museum in Cairo', 'The British Museum in London', 'Alexandria\'s library'], s: ['The Survey works from Chicago House in Luxor, on the Nile at ancient Thebes, for about six months a year.', 'Medinet Habu, the temple of Ramesses III across the river, is one of its great projects.'], h: 'Near the temples of Thebes.' },
      { lv: 2, q: 'Half a sign has flaked off a temple wall. What should the epigrapher\'s copy show?', a: 'The surviving half and the edge of the damage', w: ['The whole sign, restored', 'Nothing, since the sign is incomplete', 'A question mark instead of the sign'], s: ['The copy records exactly what survives.', 'The damaged area is drawn as damage; any identification of the sign belongs in the edition, marked as partly preserved.'], h: 'Draw what is there.' },
      { lv: 3, f: function (R) { return orderQ(R, CHICAGO.map(function (c) { return { id: c[0], label: c[1], y: c[2], when: 'step ' + c[2] }; }), 4, 'steps of the Chicago method'); } }
    ]);
  });

  var METHODS = [['Photogrammetry', 'a 3-D model computed from many overlapping photographs'], ['Laser scanning', 'millions of points measured with a laser to record the surface\'s exact shape'], ['Reflectance transformation imaging (RTI)', 'photographs lit from many directions, so the light can be moved afterward'], ['Tracing on clear film', 'outlines drawn by hand at full size on plastic laid over the surface'], ['Drawing on a photograph (the Chicago method)', 'an artist\'s pencil drawing on an enlarged photo, checked at the wall']];
  G('arch.facsimile', function (R, ctx) {
    var SCEN = [['a stela whose carving is so worn it can barely be seen in daylight', 2], ['a whole painted tomb chamber, to be modelled in 3-D in color', 0], ['a wall whose surface must be measured precisely every few years to watch it decay', 1], ['a publication drawing of a large temple wall, checked by specialists', 4]];
    return bank(R, ctx, [
      function (R) { var m = R.pick(METHODS); return { q: 'Which recording method is this: ' + m[1] + '?', a: m[0], w: METHODS.map(function (x) { return x[0]; }), k: 4, s: METHODS.map(function (x) { return x[0] + ': ' + x[1] + '.'; }), h: 'Photographs, laser, moving light, film, or drawing?' }; },
      function (R) { var sc = R.pick(SCEN), m = METHODS[sc[1]]; return { q: 'Which method fits best for ' + sc[0] + '?', a: m[0], w: METHODS.map(function (x) { return x[0]; }), k: 4, s: [m[0] + ' records ' + m[1] + '.', 'That is what this task needs.'], h: 'What does the task need: relief, shape, color, or a checked drawing?' }; },
      { tf: false, q: 'True or false: 3-D scanning has made trained epigraphers unnecessary.', s: ['A scan records a groove; it cannot tell a chisel cut from a crack.', 'Every method still needs a trained eye to read and check the result.'] },
      { lv: 2, q: 'Why can tracing directly on a wall be a problem in some tombs?', a: 'Touching fragile painted plaster can damage it', w: ['Tracing is always less accurate than a photograph', 'Tracing is forbidden by the Leiden conventions', 'Plastic film shows only colors, not lines'], s: ['Tracing on film laid on the wall gives full-size outlines.', 'But the contact can harm flaking paint or plaster, which is why non-contact methods are often used now.'], h: 'Think about contact.' },
      { lv: 2, f: function () { return yearQ(EV.factum, 'In what year was the full-size facsimile of Tutankhamun\'s burial chamber completed near Howard Carter\'s house at Luxor?'); } },
      { lv: 3, q: 'Why make a full-size facsimile of a decorated tomb, like the one of Tutankhamun\'s burial chamber?', a: 'So visitors can see it without the heat, humidity and dust that damage the real tomb', w: ['Because the real tomb has been destroyed', 'To sell the original paintings', 'Because photographs of tombs are illegal'], s: ['Each visitor adds heat, moisture and dust, which harm wall paintings.', 'A facsimile from high-resolution recording lets people see the decoration while the original is protected.'], h: 'What do visitors bring into a tomb?' }
    ]);
  });

  var FORMULA = {
    osiris: ['an offering that the king gives', 'to Osiris', 'lord of Abydos', 'that he may give', 'bread and beer', 'oxen and fowl', 'to the spirit of', 'the steward Nakht'],
    anubis: ['an offering that the king gives', 'to Anubis', 'who is upon his mountain', 'that he may give', 'bread and beer', 'linen and alabaster', 'to the spirit of', 'the lady of the house Henut']
  };
  var MARKS = { rest: ['[', ']', 'lost, and restored by the editor'], part: ['⸢', '⸣', 'damaged, but traces are visible'], omit: ['⟨', '⟩', 'left out by the scribe, and added by the editor'], dele: ['{', '}', 'written by the scribe in error, to be left out'] };
  function edited(R, kinds) {
    var segs = FORMULA[R.pick(['osiris', 'anubis'])].slice(), idx = R.sample([1, 2, 4, 5, 7], kinds.length), mark = {};
    kinds.forEach(function (k, i) { mark[idx[i]] = k; });
    var text = segs.map(function (s, i) { var m = mark[i]; if (!m) return s; var M = MARKS[m]; return m === 'dele' ? s + ' ' + M[0] + s.split(' ').slice(-1)[0] + M[1] : M[0] + s + M[1]; }).join(', ');
    return { segs: segs, mark: mark, text: cap(text) };
  }
  G('arch.brackets', function (R, ctx) {
    var ASK = { rest: 'Which words did the editor restore, where the stone is lost?', part: 'Which words are damaged but still partly visible on the stone?', omit: 'Which words did the ancient scribe leave out, so that the editor added them?' };
    return bank(R, ctx, [
      function (R) { var kinds = ['rest', 'part', 'omit'], ask = R.pick(kinds), e = edited(R, kinds), i = +Object.keys(e.mark).filter(function (k) { return e.mark[k] === ask; })[0];
        return { q: 'An edition of an offering formula reads:<br><i>' + esc(e.text) + '</i><br>' + ASK[ask], a: e.segs[i], w: Object.keys(e.mark).filter(function (k) { return +k !== i; }).map(function (k) { return e.segs[k]; }).concat([e.segs[3]]), k: 4,
          s: ['[ ] = ' + MARKS.rest[2] + '; ⸢ ⸣ = ' + MARKS.part[2] + '; ⟨ ⟩ = ' + MARKS.omit[2] + '.', 'The words in ' + MARKS[ask][0] + ' ' + MARKS[ask][1] + ' are "' + esc(e.segs[i]) + '".'], h: 'Square brackets: lost. Half brackets: traces. Angle brackets: never carved.', chk: { br: { mark: e.mark, ask: ask, ans: i } } }; },
      function (R) { var k = R.pick(['rest', 'part', 'omit', 'dele']), M = MARKS[k]; return { q: 'In an edition, what do the marks <b>' + M[0] + ' ' + M[1] + '</b> mean?', a: cap(M[2]), w: Object.keys(MARKS).map(function (x) { return cap(MARKS[x][2]); }), k: 4, s: ['[ ] lost and restored; ⸢ ⸣ damaged but visible; ⟨ ⟩ omitted by the scribe; { } written in error.', M[0] + ' ' + M[1] + ': ' + M[2] + '.'], h: 'Four kinds of bracket, four meanings.' }; },
      { tf: false, q: 'True or false: words in square brackets in an edition were read on the stone.', s: ['Square brackets mark text that is lost.', 'The editor restored it, often from a standard formula. It is a reconstruction, not a reading.'] },
      { lv: 2, f: function (R) { var e = edited(R, ['rest', 'part', 'omit']), plain = [0, 3, 6].filter(function (i) { return !e.mark[i]; }), i = R.pick(plain);
        return { q: 'An edition reads:<br><i>' + esc(e.text) + '</i><br>Which of these words are certainly on the stone, undamaged?', a: e.segs[i], w: Object.keys(e.mark).map(function (k) { return e.segs[k]; }), k: 4, s: ['Anything in brackets is restored, damaged or added by the editor.', '"' + esc(e.segs[i]) + '" has no brackets, so it is read clearly on the stone.'], h: 'Look for words with no brackets at all.', chk: { br: { mark: e.mark, ask: 'plain', ans: i } } }; } },
      { lv: 2, q: 'A scholar\'s argument depends on a god\'s name that appears only in square brackets in the edition. How strong is it?', a: 'Weak, until other evidence supports the restoration', w: ['Strong, because editors are always right', 'Strong, because square brackets mean the name is certain', 'Impossible to judge, because brackets have no meaning'], s: ['Square brackets mean the name is lost and restored.', 'A restoration can be a good guess, but an argument resting only on it is weak.'], h: 'Restored is not read.' },
      { lv: 3, f: function (R) { var e = edited(R, ['rest', 'part', 'dele']), di = +Object.keys(e.mark).filter(function (k) { return e.mark[k] === 'dele'; })[0], w = e.segs[di].split(' ').slice(-1)[0];
        return { q: 'An edition reads:<br><i>' + esc(e.text) + '</i><br>When reading the line aloud as the editor intends, which word do you leave out?', a: '"' + w + '" the second time (in curly braces)', w: Object.keys(e.mark).filter(function (k) { return +k !== di; }).map(function (k) { return 'The words in ' + MARKS[e.mark[k]][0] + ' ' + MARKS[e.mark[k]][1]; }).concat(['Nothing: every word is read']), k: 4,
          s: ['Curly braces mark signs written in error, which the editor deletes.', 'Square and half brackets are read: one is restored, one is damaged but visible.', 'So you leave out the repeated "' + esc(w) + '".'], h: 'Which bracket means "written by mistake"?', chk: { br: { mark: e.mark, ask: 'dele', ans: di } } }; } },
      { lv: 3, f: function () { return yearQ(EV.leiden, 'In what year did scholars meeting at Leiden agree the bracket conventions that editors still adapt?'); } }
    ]);
  });

  // ================================================================ Unit 6: Museums and the Return of Objects
  var HOLD = [['the Rosetta Stone', 'British Museum, London'], ['the bust of Nefertiti', 'Neues Museum, Berlin'], ['the Seated Scribe', 'Louvre, Paris'], ['the Dendera zodiac', 'Louvre, Paris'], ['the Turin King List', 'Museo Egizio, Turin'], ['the Temple of Dendur', 'Metropolitan Museum of Art, New York'], ['the complete Tutankhamun collection', 'Grand Egyptian Museum, Giza'], ['the royal mummies', 'National Museum of Egyptian Civilization, Cairo'], ['the Narmer Palette', 'Egyptian Museum, Cairo'], ['Khufu\'s boat', 'Grand Egyptian Museum, Giza'], ['the "Younger Memnon" head of Ramesses II', 'British Museum, London']];
  G('arch.museums', function (R, ctx) {
    var places = HOLD.map(function (x) { return x[1]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    return bank(R, ctx, [
      function (R) { var h = R.pick(HOLD); return { q: 'Where is ' + h[0] + ' today?', a: h[1], w: places, k: 4, s: [cap(h[0]) + ' is in the ' + h[1] + '.'], h: 'Think of how and when it was found.', chk: { hold: h } }; },
      { tf: false, q: 'True or false: every important ancient Egyptian object is in a museum in Egypt.', s: ['Many famous objects are abroad: the Rosetta Stone in London, the bust of Nefertiti in Berlin, the Seated Scribe in Paris.', 'Where an object is depends on how and when it left the ground.'] },
      { q: 'Why did objects found by the collectors of the early 1800s mostly end up in Europe, while Tutankhamun\'s treasures stayed in Egypt?', a: 'They were found under different rules: before modern controls versus under the Antiquities Service', w: ['European museums paid more for Tutankhamun\'s objects', 'Tutankhamun\'s objects were too heavy to ship', 'The collectors\' objects were fakes'], s: ['Before 1858 there was little control, and consuls shipped finds home.', 'By 1922 the Antiquities Service controlled excavation, and almost all of KV62\'s contents went to Cairo.'], h: 'Compare the dates.' },
      { lv: 2, f: function () { return yearQ(EV.gem); } },
      { lv: 2, f: function () { return yearQ(EV.tahrir); } },
      { lv: 2, q: 'Why is the Temple of Dendur in the Metropolitan Museum in New York?', a: 'Egypt gave it to the United States for help in the Nubian rescue campaign', w: ['Belzoni shipped it to New York in 1817', 'It was bought at auction in the 1800s', 'It was built in New York as a copy'], s: ['Lake Nasser, behind the Aswan High Dam, would flood Nubia.', 'Egypt gave a few small temples to countries that helped move the monuments: Dendur went to the United States in 1965 and opened at the Met in 1978.'], h: 'Think of the High Dam.' },
      { lv: 2, f: function (R) { return mapPick(R, 'giza', ['giza', 'saqqara', 'memphis', 'heliopolis', 'dahshur', 'meidum'], 'The Grand Egyptian Museum stands about 2 km from which site? Choose its dot.', ['The Grand Egyptian Museum was built near the pyramids of Giza.'], 'The pyramids.'); } },
      { lv: 3, f: function (R) { return orderQ(R, evs(['turin', 'bulaq', 'tahrir', 'gem']).concat([{ id: 'nmec', label: 'royal mummies move to the National Museum of Egyptian Civilization', y: 2021 }]), 4); } }
    ]);
  });

  var ARGS = [
    ['The object was taken while Egypt was under foreign control, so there was no free agreement between equals.', 'return', 'historical and ethical'],
    ['The object is part of Egypt\'s national heritage and identity.', 'return', 'ethical'],
    ['Egypt now has museums, like the Grand Egyptian Museum, able to care for and show it.', 'return', 'practical'],
    ['Most Egyptians will never be able to travel to see it abroad.', 'return', 'ethical and practical'],
    ['The object was acquired under the laws, treaties or permits of its time.', 'keep', 'legal'],
    ['Millions of visitors from every country see it where it is, often free of charge.', 'keep', 'practical'],
    ['The museum is barred by its country\'s law from giving up items in its collection.', 'keep', 'legal'],
    ['The object is fragile, and moving it carries a risk of damage.', 'keep', 'practical'],
    ['The division of finds was signed by both sides at the time.', 'keep', 'legal']
  ];
  var CASES = [['the Rosetta Stone', 'It was handed to Britain in 1801 under the terms of the French surrender.'], ['the bust of Nefertiti', 'It was allotted to the German excavators in the division of finds of 1913.'], ['the Dendera zodiac', 'It was cut from the temple ceiling in 1821 by agents of a French collector.'], ['the coffin of Nedjemankh', 'It was looted in 2011 and sold with a forged export license.']];
  G('arch.return-debate', function (R, ctx) {
    var SIDE = { return: 'Returning it to Egypt', keep: 'Keeping it where it is' };
    return bank(R, ctx, [
      function (R) { var a = R.pick(ARGS); return { q: 'In the debate over a famous object held abroad, which side does this argument support?<br>"' + esc(a[0]) + '"', a: SIDE[a[1]], w: [SIDE[a[1] === 'return' ? 'keep' : 'return']], k: 2, s: ['Supporters of ' + (a[1] === 'return' ? 'return' : 'keeping the object') + ' make this point.', 'It is a ' + a[2] + ' argument. The other side answers it with arguments of its own; both are made in good faith.'], h: 'Who would say this?', chk: { arg: a } }; },
      function (R) { var c = R.pick(CASES); return { q: 'How did ' + c[0] + ' leave Egypt?', a: c[1], w: CASES.map(function (x) { return x[1]; }), k: 4, s: [cap(c[0]) + ': ' + c[1].charAt(0).toLowerCase() + c[1].slice(1), 'Each case turns on how the object was acquired.'], h: 'Each famous object has its own history.', chk: { case: c[0] } }; },
      { q: 'Which statement about the debate over returning objects is accurate?', a: 'Each case turns on how the object was acquired, the laws of the time, and what is best for the object and the public', w: ['Every object held abroad was stolen', 'Every object held abroad was acquired fairly', 'Museums and Egypt agree on all cases'], s: ['Some objects left under treaties or divisions of finds; some were simply taken; some were stolen recently.', 'So the arguments, and many people\'s conclusions, differ from case to case.'], h: 'Is there one answer for every case?' },
      { tf: false, q: 'True or false: there is one obviously right answer for every object in the return debate.', s: ['The cases differ in how objects were acquired and under which laws.', 'Reasonable people weigh legality, history, access and care differently.'] },
      { lv: 2, q: 'Of these four objects, which one\'s return involved no real debate, because it was recently stolen?', a: 'The coffin of Nedjemankh', w: ['The Rosetta Stone', 'The bust of Nefertiti', 'The Dendera zodiac'], s: ['The coffin was looted in 2011 and sold with a forged export license; the Metropolitan Museum returned it in 2019.', 'The other three left Egypt long ago, under terms that are argued over.'], h: 'Which left Egypt most recently, and how?' },
      { lv: 2, f: function (R) { var a = R.pick(ARGS); return { q: 'What kind of argument is this?<br>"' + esc(a[0]) + '"', a: cap(a[2]), w: ['Legal', 'Practical', 'Ethical', 'Historical and ethical', 'Ethical and practical'].filter(function (x) { return x.toLowerCase() !== a[2]; }), k: 4, s: ['Legal arguments appeal to laws and agreements; ethical ones to fairness and identity; practical ones to care, risk and access.', 'This one is ' + a[2] + '.'], h: 'Law, fairness, or practicality?', chk: { argkind: a } }; } },
      { lv: 3, q: 'Which of these is a "middle path" that has been proposed between full return and refusal?', a: 'Long-term loans, shared exhibitions and research, and replicas', w: ['Cutting the object in two', 'Selling the object at auction', 'Refusing all contact between the museums'], s: ['Proposals include long loans, joint research and exhibitions, replicas and digital access.', 'The British Museum, for example, gave a full-size replica of the Rosetta Stone to Rashid in 2005.'], h: 'Something both sides could share.' },
      { lv: 3, f: function (R) { var pair = R.pick([[ARGS[0], ARGS[4]], [ARGS[1], ARGS[5]], [ARGS[2], ARGS[7]], [ARGS[3], ARGS[5]]]);
        return { q: 'One speaker says: "' + esc(pair[0][0]) + '" Another replies: "' + esc(pair[1][0]) + '" Which describes the exchange?', a: 'Both make real points: one argues for return, the other for keeping it', w: ['The first speaker has proved the case for return', 'The second speaker has proved the case for keeping it', 'Neither point is relevant to the debate'], s: ['The first is a ' + pair[0][2] + ' argument for return; the second a ' + pair[1][2] + ' argument for keeping it.', 'They weigh different things, so neither settles the matter alone. This is why each case is argued on its own facts.'], h: 'Do the two points answer the same question?' }; } }
    ]);
  });

  G('arch.laws', function (R, ctx) {
    return bank(R, ctx, [
      function () { return yearQ(EV.law117); },
      { q: 'What does Egypt\'s Law 117 of 1983 say about antiquities?', a: 'They are public property, and trading in them is banned', w: ['They may be sold freely inside Egypt', 'They belong to whoever finds them', 'They may be exported with a dealer\'s license'], s: ['Article 6 makes antiquities public property; Article 7 bans trade in them.', 'Possession is allowed only for holdings registered under the law, and export is banned.'], h: 'Who owns an antiquity under the law?' },
      { q: 'What does the 1970 UNESCO Convention do?', a: 'Commits its member states to prevent illicit import, export and transfer of cultural property', w: ['Returns every object taken from Egypt before 1970', 'Makes all museums give up their collections', 'Bans all museums from buying anything'], s: ['The Convention\'s states parties agree to prevent illicit trade and to help each other recover stolen cultural property.', 'It does not reach back to objects removed before it took effect.'], h: 'It is about illicit trade from now on.' },
      function (R) { var early = R.coin(), y = early ? R.pick([1890, 1912, 1925, 1937]) : R.pick([1990, 2003, 2011, 2012]);
        return { q: 'A statue left Egypt in ' + y + (early ? ' with a valid export permit' : ', dug up without permission and smuggled out') + '. How do Egypt\'s Law 117 (1983) and the 1970 UNESCO Convention apply?', a: early ? 'Neither applies: they came later, and the export was legal then' : 'It is stolen state property under Law 117, and the Convention supports its recovery', w: [early ? 'It is stolen state property under Law 117, and the Convention supports its recovery' : 'Neither applies: they came later, and the export was legal then', 'Law 117 applies to it, but only if it is made of gold', 'The UNESCO Convention returns every object taken from Egypt'], k: 4,
          s: ['Laws usually apply from the date they take effect, not before.', early ? 'In ' + y + ' an export with a permit was legal; the later laws do not make it stolen.' : 'In ' + y + ' Law 117 made antiquities state property and banned their export, and the 1970 Convention was in force.'], h: 'Compare the year it left with the year of each law.', chk: { law: [y, early] } }; },
      { lv: 2, f: function () { return yearQ(EV.unesco); } },
      { lv: 2, f: function () { return yearQ(EV.egyptJoins, 'In what year did Egypt become a party to the 1970 UNESCO Convention?'); } },
      { lv: 2, f: function () { return yearQ(EV.decree1835, 'In what year did Muhammad Ali issue Egypt\'s first decree against exporting antiquities?'); } },
      { lv: 2, tf: false, q: 'True or false: the 1970 UNESCO Convention requires the return of objects that left Egypt in the 1800s.', s: ['The Convention is about preventing illicit trade from the time it takes effect.', 'It does not reach back to earlier removals; those are argued case by case.'] },
      { lv: 3, q: 'Why do museums today usually ask for an object\'s history (provenance) back to 1970?', a: 'Because 1970, the year of the UNESCO Convention, became the main test of legal trade', w: ['Because objects made after 1970 are fakes', 'Because Egypt\'s Law 117 was passed in 1970', 'Because radiocarbon dating began in 1970'], s: ['An object documented outside its country before 1970 is generally treated as having entered the market legally.', 'One that surfaced after 1970 without papers may be looted. Law 117 itself dates from 1983.'], h: 'Think of the Convention\'s date.' },
      { lv: 3, q: 'In 2002 a New York dealer was convicted of dealing in antiquities smuggled out of Egypt. Why did Egypt\'s Law 117 matter in a U.S. court?', a: 'It makes Egypt the owner, so the objects counted as stolen property', w: ['U.S. courts must apply all Egyptian laws', 'The dealer was an Egyptian official', 'Law 117 is a U.S. law'], s: ['U.S. law forbids dealing in stolen goods.', 'The court accepted that Law 117 makes antiquities found after 1983 the property of Egypt, so taking them without permission was theft.'], h: 'What does an ownership law do abroad?' },
      { lv: 3, f: function (R) { return orderQ(R, evs(['decree1835', 'service', 'unesco', 'egyptJoins', 'law117']), 4); } }
    ]);
  });


  // ================================================================ Unit 7: Archaeology Today
  var SURVEY = [['Field walking', 'pottery, flint and stone lying on the surface'], ['Aerial photography', 'marks in crops, soil and shadows seen from above'], ['Satellite imaging', 'the same kinds of marks, from space, repeated over years'], ['Magnetometry', 'small changes in the earth\'s magnetism over walls, hearths and pits'], ['Ground-penetrating radar', 'echoes of radar pulses from buried surfaces, with their depth'], ['Electrical resistivity', 'how easily electric current passes through the ground']];
  G('arch.survey', function (R, ctx) {
    var SC = [['mapping the plan of buried mud-brick walls under a field, without digging', 'Magnetometry'], ['finding where ancient sites lie across a whole desert region', 'Satellite imaging'], ['checking whether a small mound is an ancient site, by what lies on its surface', 'Field walking'], ['finding the depth of a buried floor or a hidden void', 'Ground-penetrating radar'], ['spotting new looting pits at many sites, year after year', 'Satellite imaging']];
    return bank(R, ctx, [
      function (R) { var m = R.pick(SURVEY); return { q: 'Which survey method senses ' + m[1] + '?', a: m[0], w: SURVEY.map(function (x) { return x[0]; }), k: 4, s: SURVEY.map(function (x) { return x[0] + ': ' + x[1] + '.'; }), h: 'Surface, sky, space, or an instrument in the ground?' }; },
      function (R) { var c = R.pick(SC); return { q: 'Which method would you choose for ' + c[0] + '?', a: c[1], w: SURVEY.map(function (x) { return x[0]; }), k: 4, s: ['Match the method to the question: what must be sensed, over how large an area, and at what depth?', c[1] + ' fits best.'], h: 'What does the task need to detect?' }; },
      { tf: false, q: 'True or false: archaeologists can learn about a site only by excavating it.', s: ['Survey from the ground, the air and space, and geophysics, map sites without digging.', 'Much is learned without a shovel, and digging can then be aimed where it will answer a question.'] },
      { q: 'Why does a buried mud-brick wall show up in a magnetometer survey?', a: 'Its magnetism differs slightly from the soil around it', w: ['It is made of iron', 'It glows in the dark', 'It is always hotter than the soil'], s: ['Magnetometers measure tiny differences in the earth\'s magnetic field.', 'Mud brick, burnt material and filled pits differ from the surrounding silt, so their outlines appear on the map.'], h: 'Every method measures a contrast.' },
      { lv: 2, q: 'Why are 1960s spy-satellite photographs (the Corona program, released in 1995) valuable to archaeologists?', a: 'They show sites before decades of building, farming and flooding', w: ['They are sharper than any modern image', 'They show buried walls through the ground', 'They were taken by archaeologists'], s: ['Since the 1960s, cities, fields and dam lakes have covered many sites.', 'The old images record those landscapes as they were, so lost sites can still be mapped.'], h: 'Think about what has changed since then.' },
      { lv: 2, f: function (R) { return mapPick(R, 'amarna', ['amarna', 'hermopolis', 'beni-hasan', 'abydos', 'meidum', 'oxyrhynchus'], 'Survey and mapping have traced the plan of Akhenaten\'s whole city. Which dot is Amarna?', ['Amarna lies on the east bank in Middle Egypt, about halfway between Memphis and Thebes.'], 'Middle Egypt, east bank.'); } },
      { lv: 3, q: 'Why do archaeologists usually survey a site before excavating it?', a: 'To aim a small excavation where it will answer a question, destroying as little as possible', w: ['Because survey makes excavation unnecessary forever', 'Because the law forbids excavation without satellites', 'To find objects to sell before digging'], s: ['Excavation destroys what it uncovers.', 'Survey shows the plan first, so trenches can be few, small and well placed.'], h: 'Excavation destroys.' }
    ]);
  });

  var LAB = [['CT scanning', 'What lies inside a mummy\'s wrappings?'], ['Ancient DNA', 'How were these people related to each other?'], ['Residue analysis', 'What did this jar once hold?'], ['Strontium isotope analysis', 'Where did this person grow up?'], ['Muon imaging', 'Are there hidden spaces inside a pyramid?']];
  G('arch.lab-science', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var m = R.pick(LAB); return { q: 'Which method is designed to answer: "' + m[1] + '"', a: m[0], w: LAB.map(function (x) { return x[0]; }), k: 4, s: LAB.map(function (x) { return x[0] + ': ' + x[1]; }), h: 'Inside, kinship, contents, childhood home, or hidden spaces?' }; },
      { q: 'Why is a CT scan of a mummy better than unwrapping it?', a: 'It shows the inside in 3-D without damaging anything', w: ['It dates the mummy by radiocarbon', 'It shows the mummy\'s DNA', 'It is the only way to find amulets'], s: ['Unwrapping destroys the wrappings and often harms the body.', 'A scan shows bones, teeth, packing and amulets, and can be re-examined later.'], h: 'What does unwrapping destroy?' },
      { tf: false, q: 'True or false: if a news headline reports a new DNA result about ancient Egypt, the question is settled.', s: ['Ancient DNA is fragile and easily contaminated, and studies are often small and from one site.', 'Results need checking and confirmation; many are debated, like the 2017 Abusir el-Meleq study.'] },
      { q: 'What should you ask first about a new ancient-DNA study of Egyptian mummies?', a: 'How many individuals, from which sites and periods, and has it been confirmed?', w: ['Which museum owns the mummies?', 'How famous is the lead author?', 'Was it reported on television?'], s: ['A few individuals from one cemetery cannot speak for all of Egypt over 3,000 years.', 'Contamination checks and confirmation by another team matter most.'], h: 'Think about sample size.' },
      { lv: 2, f: function () { return { q: 'In what year did the ScanPyramids team announce, using muon imaging, a large void above the Grand Gallery of the Great Pyramid?', num: 2017, s: ['The team announced the "Big Void" in the journal Nature in 2017.', 'A corridor behind the north face was confirmed with a camera in 2023. The void\'s purpose is still unknown.'], h: 'A few years before the corridor (2023).', chk: { y: 2017, ev: 'bigvoid' } }; } },
      { lv: 2, q: 'Muon imaging found a large void inside the Great Pyramid. What is known about what it was for?', a: 'Nothing yet: its purpose is unknown', w: ['It is Khufu\'s real burial chamber', 'It was a storeroom for gold', 'It is a modern tunnel'], s: ['Three teams confirmed that the void exists.', 'Its shape and purpose are still unknown; the team avoided calling it a chamber.'], h: 'The finding is real; the explanation is not settled.', viz: { name: 'eg-pyramid', opts: { which: 'great', view: 'section', interactive: false } } },
      { lv: 3, q: 'Strontium in tooth enamel is used to study where people grew up. Why does it work?', a: 'Enamel forms in childhood and takes in strontium from local food and water, which reflects local rocks', w: ['Strontium decays at a known rate', 'Teeth keep growing all through life', 'Strontium shows a person\'s DNA'], s: ['Different rocks give different strontium isotope ratios to soil, water and food.', 'Tooth enamel forms in childhood and does not change, so it records where a person lived as a child.'], h: 'When does enamel form?' }
    ]);
  });

  var GIFTS = [['the Temple of Dendur', 'the Metropolitan Museum of Art, New York'], ['the Temple of Debod', 'Madrid, Spain'], ['the Temple of Taffeh', 'Leiden, the Netherlands'], ['the Temple of Ellesyia', 'the Egyptian Museum, Turin'], ['the Kalabsha Gate', 'the Egyptian Museum, Berlin']];
  G('arch.nubia-rescue', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var g = R.pick(GIFTS); return { q: 'After the Nubian campaign, Egypt gave several small temples to countries that had helped. Where did ' + g[0] + ' go?', a: g[1], w: GIFTS.map(function (x) { return x[1]; }), k: 4, s: GIFTS.map(function (x) { return cap(x[0]) + ': ' + x[1] + '.'; }), h: 'Five gifts, five countries.' }; },
      { q: 'What was done with the temples of Abu Simbel?', a: 'They were cut into blocks and rebuilt about 65 m higher, away from the lake', w: ['They were left to be flooded', 'They were shipped to New York', 'A wall was built around them'], s: ['From 1964 to 1968 engineers cut the temples and the cliff face into more than a thousand blocks.', 'They were rebuilt about 65 m higher and 200 m back from the river.'], h: 'Up and back.' },
      { tf: false, q: 'True or false: every archaeological site in Nubia was saved from Lake Nasser.', s: ['22 monuments were moved, and many sites were surveyed and excavated first.', 'But most sites, and many Nubian villages, now lie under the lake.'] },
      function () { return yearQ(EV.nubia); },
      { lv: 2, f: function (R) { var t = R.pick(['abu-simbel', 'philae']), nm = EG().site(t).name; return mapPick(R, t, ['abu-simbel', 'philae', 'buhen', 'semna', 'elephantine', 'kom-ombo'], nm + ' was moved in the Nubian campaign. Which dot is ' + nm + '?', [t === 'abu-simbel' ? 'Abu Simbel lies far to the south, on the west bank of Lake Nasser, near the border with Sudan.' : 'Philae lies just south of Aswan and the First Cataract.'], t === 'abu-simbel' ? 'Far south, near Sudan.' : 'Just above the First Cataract.'); } },
      { lv: 2, f: function () { return yearQ(EV.abuSimbel); } },
      { lv: 2, q: 'Where was the temple of Philae rebuilt?', a: 'On Agilkia island, near its old island', w: ['In Cairo', 'At Abu Simbel', 'In the British Museum'], s: ['From 1977 to 1980 the temple was taken down into about 40,000 pieces.', 'It was rebuilt on Agilkia, an island about 500 m away, above the water.'], h: 'An island nearby.' },
      { lv: 3, q: 'Why is the Nubian campaign judged as both a success and a loss?', a: 'Great monuments were saved, but most sites and many Nubian villages were flooded', w: ['It saved everything, but cost too much', 'It failed to move any monument', 'It moved the temples to Europe'], s: ['22 monuments were moved and the region was surveyed.', 'But most sites could only be recorded before the water rose, and many thousands of Nubians lost their homes and lands.'], h: 'Count the losses as well as the rescues.' },
      { lv: 3, f: function (R) { return orderQ(R, evs(['nubia', 'abuSimbel', 'unesco', 'philaeDone']).concat([{ id: 'dendur', label: 'the Temple of Dendur opens at the Met', y: 1978 }]), 4); } }
    ]);
  });

  var EGY = [['Ahmed Kamal', 'the first Egyptian Egyptologist, curator at the Egyptian Museum, who compiled a 22-volume dictionary linking ancient Egyptian and Arabic'], ['Selim Hassan', 'excavated at Giza from 1929 to 1939 and wrote an 18-volume encyclopedia of ancient Egypt in Arabic'], ['Labib Habachi', 'identified Tell el-Dab\'a as Avaris, the Hyksos capital'], ['Zakaria Goneim', 'found the unfinished step pyramid of Sekhemkhet at Saqqara'], ['Kamal el-Mallakh', 'found Khufu\'s boat beside the Great Pyramid in 1954'], ['Rifa\'a al-Tahtawi', 'argued for protecting antiquities and helped inspire the decree of 1835']];
  G('arch.egyptian-egyptologists', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var e = R.pick(EGY); return { q: 'Which Egyptian scholar ' + e[1] + '?', a: e[0], w: EGY.map(function (x) { return x[0]; }), k: 4, s: [e[0] + ' ' + e[1] + '.'], h: 'Match the person to the work.' }; },
      { tf: false, q: 'True or false: Egyptology has always been a purely European field.', s: ['Egyptian scholars, curators and excavators have been central for more than a century.', 'Egyptian workers and foremen did much of the digging on every expedition.'] },
      { q: 'Why were Egyptian scholars long held back in their own country\'s Antiquities Service?', a: 'Foreign officials ran it, and some kept Egyptians out of senior posts', w: ['Egyptian law forbade Egyptians to study antiquities', 'No Egyptian could read hieroglyphs', 'The Service was based in Paris'], s: ['The Service had French directors until 1952.', 'Some, like Mariette, blocked Egyptians such as Ahmed Kamal from senior posts.'], h: 'Who ran the Service?' },
      { lv: 2, f: function () { return yearQ(EV.boat); } },
      { lv: 2, q: 'Who rebuilt Khufu\'s boat from 1,224 pieces?', a: 'Ahmed Youssef Moustafa, chief restorer of the Antiquities Department', w: ['Howard Carter', 'Flinders Petrie', 'Auguste Mariette'], s: ['Kamal el-Mallakh found the boat in 1954.', 'Ahmed Youssef Moustafa spent years rebuilding it; it is now in the Grand Egyptian Museum.'], h: 'An Egyptian restorer.' },
      { lv: 3, q: 'Petrie trained workmen from the town of Quft, whose families dug on expeditions for generations. What does this show about the history of excavation?', a: 'Skilled Egyptian workers did much of the actual digging, though their names are rarely recorded', w: ['Petrie dug every trench himself', 'Quft was a European town', 'Workers were not needed on early excavations'], s: ['Foremen and workers from Quft brought skill and experience to many excavations.', 'Their knowledge shaped the results, though the publications rarely named them.'], h: 'Who did the digging?' }
    ]);
  });


  // ================================================================ Units 8–10: Hieratic, Late Egyptian, Demotic
  var SCRIPT_DESC = [
    ['Hieratic', 'a quick, joined-up form of the hieroglyphs, written with a reed brush and ink, used from the very start of writing for letters, accounts and books'],
    ['Demotic', 'a very cursive script grown out of hieratic in the 7th century BC, with many signs run together; the middle text of the Rosetta Stone'],
    ['Hieroglyphic', 'detailed pictures of people, animals, plants and things, carved or painted on monuments'],
    ['Coptic', 'the Greek alphabet plus six or seven letters taken from Demotic, written left to right with vowels'],
    ['Greek', 'the alphabet of the Ptolemaic government, written left to right; the bottom text of the Rosetta Stone']
  ];
  G('arch.hieratic', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var d = R.pick(SCRIPT_DESC); return { q: 'Which script is this: ' + d[1] + '?', a: d[0], w: SCRIPT_DESC.map(function (x) { return x[0]; }), k: 4, s: SCRIPT_DESC.map(function (x) { return x[0] + ': ' + x[1] + '.'; }).slice(0, 4), h: 'Pictures, brush hand, very cursive, or alphabet?' }; },
      { q: 'What is hieratic?', a: 'The cursive, ink form of the hieroglyphs: the same signs and language, written fast', w: ['A separate language spoken by priests', 'A later script that replaced hieroglyphs', 'The Greek name for Demotic'], s: ['Hieratic writes the same signs, sounds and language as hieroglyphs.', 'The signs are simplified and joined because they were written quickly with a brush.'], h: 'Think of handwriting versus print.' },
      { tf: false, q: 'True or false: hieratic was invented long after hieroglyphs, as a shortcut.', s: ['Cursive ink writing appears at the very start of Egyptian writing, in the late Predynastic period.', 'Hieroglyphs and hieratic were used side by side from the beginning.'] },
      { q: 'In which direction is hieratic written?', a: 'Right to left', w: ['Left to right', 'Top to bottom only, left to right', 'In either direction, like hieroglyphs'], s: ['Hieroglyphs can run in any direction.', 'Hieratic is written right to left: in columns at first, then in horizontal lines as the rule after the 12th Dynasty.'], h: 'It has one direction only.' },
      { lv: 2, q: 'Why is hieratic usually described, not printed, in modern books?', a: 'It has no standard font, and its forms vary by scribe and date, so editors transcribe it into hieroglyphs', w: ['It was never written on papyrus', 'Printing it is forbidden', 'It is identical to hieroglyphs'], s: ['Every scribe\'s hand differs, and sign forms change over the centuries.', 'Editors print a photograph and a hieroglyphic transcription instead.'], h: 'Think about handwriting.' },
      { lv: 2, q: 'What does the name "hieratic" mean, and why was it given?', a: '"Priestly": by the time Greek writers named it, priests used it mostly for religious books', w: ['"Hidden", because it was secret', '"Popular", because ordinary people used it', '"Carved", because it was cut in stone'], s: ['The name comes from Greek writers such as Clement of Alexandria, in the 2nd century AD.', 'By then hieratic was mostly used by priests for religious texts; Demotic was the everyday script.'], h: 'Compare "hierarchy".' },
      { lv: 3, q: 'Which of these is a feature of hieratic but not of carved hieroglyphs?', a: 'Signs joined together in ligatures', w: ['Sound signs for one consonant', 'Determinatives at the end of words', 'Word signs with a stroke'], s: ['Sound signs, determinatives and word signs belong to the system, in every form of the script.', 'Joining signs into ligatures comes from writing fast with a brush.'], h: 'What does a fast brush do?' }
    ]);
  });

  var DOCS = [['the Diary of Merer', 'an official\'s logbook of shipping limestone to Giza under Khufu, the oldest inscribed papyri known'], ['the Rhind Mathematical Papyrus', 'mathematical problems with worked answers, copied c. 1550 BC'], ['the Ebers Papyrus', 'a long medical handbook of c. 1550 BC'], ['the Westcar Papyrus', 'tales of magicians told at the court of Khufu'], ['Papyrus Prisse', 'the Instruction of Ptahhotep, advice from a vizier to his son'], ['the Turin King List', 'a list of kings with the lengths of their reigns'], ['the Deir el-Medina ostraca', 'work records, receipts and letters from the village of the royal tomb-builders']];
  G('arch.hieratic-uses', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var d = R.pick(DOCS); return { q: 'Which hieratic document is ' + d[1] + '?', a: cap(d[0]), w: DOCS.map(function (x) { return cap(x[0]); }), k: 4, s: [cap(d[0]) + ': ' + d[1] + '.'], h: 'Math, medicine, stories, wisdom, kings, or daily work?' }; },
      { q: 'What is an ostracon?', a: 'A potsherd or flake of limestone used for writing', w: ['A roll of papyrus', 'A carved temple wall', 'A clay tablet in cuneiform'], s: ['Papyrus was valuable; broken pottery and limestone flakes were free.', 'Scribes wrote notes, receipts, letters and exercises on them: ostraca.'], h: 'Cheap notepaper.' },
      { tf: false, q: 'True or false: most Egyptian writing was carved in stone.', s: ['Carvings survive well and are easy to see.', 'But most writing was done in ink, in hieratic, on papyrus, ostraca and boards.'] },
      { lv: 2, f: function (R) { return mapPick(R, 'deir-el-medina', ['deir-el-medina', 'karnak', 'luxor', 'kings', 'medinet-habu', 'deir-el-bahari'], 'The village of the royal tomb-builders left thousands of hieratic ostraca. Which dot is Deir el-Medina?', ['Deir el-Medina lies on the west bank at Thebes, in a small valley between the Valley of the Kings and the river temples.'], 'West bank, in the hills.'); } },
      { lv: 2, q: 'Where was the Diary of Merer found, and why is it important?', a: 'At Wadi al-Jarf on the Red Sea in 2013; the oldest inscribed papyri, from the reign of Khufu', w: ['In Tutankhamun\'s tomb in 1922; the oldest book of the dead', 'At Rosetta in 1799; the oldest bilingual text', 'At Deir el-Medina; the oldest love poem'], s: ['A French team found the papyri at the harbor of Wadi al-Jarf in 2013.', 'They record a crew shipping limestone from the Tura quarries to Giza under Khufu: the oldest inscribed papyri known.'], h: 'A harbor on the Red Sea.' },
      { lv: 3, q: 'Why do most surviving hieratic papyri come from desert cemeteries and villages on the desert edge?', a: 'Papyrus survives only where it stays dry', w: ['Hieratic was written only in the desert', 'The Nile valley had no scribes', 'Papyrus was banned in towns'], s: ['Papyrus rots in damp ground, such as the Nile valley and the Delta.', 'In dry places, like Deir el-Medina or desert tombs, it can survive for thousands of years.'], h: 'What destroys papyrus?' }
    ]);
  });

  var STEPS3 = [{ id: 'tr', label: 'Transcribe each hieratic sign into its hieroglyph', y: 1 }, { id: 'tl', label: 'Transliterate the hieroglyphs', y: 2 }, { id: 'en', label: 'Translate into English', y: 3 }, { id: 'ph', label: 'Photograph the papyrus', y: 0 }];
  var TR_WORDS = ['nfr', 'pet', 'per', 'ren', 'sedjem', 'ankh', 'netjer', 'za', 'hetep', 'niwt', 'amun', 'maat', 'nebu', 'ib'];
  G('arch.transcription', function (R, ctx) {
    var E = EG();
    return bank(R, ctx, [
      function (R) { return orderQ(R, STEPS3, R.pick([3, 4]), 'steps in publishing a hieratic text'); },
      function (R) { var k = R.pick(TR_WORDS), w = E.WORDS[k], others = TR_WORDS.filter(function (x) { return x !== k; }).map(function (x) { return E.WORDS[x].tl; });
        return { q: 'A hieratic word has been transcribed into these hieroglyphs. Transliterate it.', tl: w.tl, tlw: R.sample(others, 3), s: w.parts.map(function (p) { return esc(E.SIGNS[p[0]].n) + ' (' + p[0] + ')' + (p[2] ? ': ' + tl(p[2]) : ': not read') + '.'; }).concat(['Reading: ' + tl(w.tl) + ', "' + esc(w.en) + '".']), h: 'Read the transcription as you would any hieroglyphic word; use the keypad for special letters.',
          viz: { name: 'eg-glyphs', opts: { word: k, quiet: true, interactive: false } }, chk: { word: k } }; },
      { tf: false, q: 'True or false: hieratic is a separate language from the language of the hieroglyphs.', s: ['Hieratic is a script, the cursive form of the hieroglyphs.', 'Transcription changes the script, not the words.'] },
      { q: 'An edition prints a hieratic papyrus as hieroglyphs. What is this step called?', a: 'Transcription', w: ['Transliteration', 'Translation', 'Collation'], s: ['Transcription turns each hieratic sign into the hieroglyph it stands for.', 'Transliteration (into the Egyptological alphabet) and translation come after.'], h: 'Script to script.' },
      { lv: 2, q: 'In a hieroglyphic transcription of a papyrus, one sign is marked with a question mark. What does that mean?', a: 'The editor is unsure which hieroglyph the hieratic sign stands for', w: ['The sign is a question word', 'The papyrus asks a question there', 'The sign is not Egyptian'], s: ['Some hieratic signs look alike, especially in a hurried hand.', 'The question mark tells readers that this identification, and the word, are less certain.'], h: 'Editors mark doubt openly.' },
      { lv: 2, f: function (R) { var k = R.pick(TR_WORDS), w = E.WORDS[k]; return { q: 'This transcribed word reads ' + tl(w.tl) + '. What does it mean?', a: w.en, w: TR_WORDS.filter(function (x) { return x !== k; }).map(function (x) { return E.WORDS[x].en; }), k: 4, s: ['Transliteration: ' + tl(w.tl) + '.', 'Translation: "' + esc(w.en) + '".'], h: 'The last step is translation.', viz: { name: 'eg-glyphs', opts: { word: k, quiet: true, interactive: false } }, chk: { word: k } }; } },
      { lv: 3, q: 'Why do Egyptologists use palaeography tables arranged by date when reading hieratic?', a: 'Hieratic sign forms changed over the centuries, so a sign must be compared with forms of its own period', w: ['Because hieratic was written only on dated papyri', 'Because older signs had different sound values', 'Because the tables give the date of each papyrus'], s: ['A Middle Kingdom hand and a Ramesside hand can look very different.', 'Tables like Georg Möller\'s show each sign\'s forms by date and manuscript.'], h: 'Handwriting changes.' }
    ]);
  });

  // Late Egyptian articles. Gender: masculine pr, rn, nṯr, nb, ḥqꜣ, tꜣ; feminine njwt, pt, zꜣt, nbt.
  var LE_NOUNS = [['per', 'pr', 'house', 'm'], ['ren', 'rn', 'name', 'm'], ['netjer', 'nṯr', 'god', 'm'], ['neb', 'nb', 'lord', 'm'], ['heqa', 'ḥqꜣ', 'ruler', 'm'], ['ta', 'tꜣ', 'land', 'm'], ['niwt', 'njwt', 'town', 'f'], ['pet', 'pt', 'sky', 'f'], ['zat', 'zꜣt', 'daughter', 'f'], ['nebet', 'nbt', 'lady', 'f']];
  G('arch.late-egyptian', function (R, ctx) {
    var art = function (g) { return g === 'm' ? 'pꜣ' : 'tꜣ'; };
    return bank(R, ctx, [
      function (R) { var n = R.pick(LE_NOUNS); return { q: 'In Late Egyptian, which article goes before ' + tl(n[1]) + ' "' + n[2] + '", a ' + (n[3] === 'm' ? 'masculine' : 'feminine') + ' noun?', a: art(n[3]), w: ['pꜣ', 'tꜣ', 'nꜣ n', 'wꜥ'], k: 4, s: ['pꜣ before masculine singular nouns, tꜣ before feminine singular nouns, nꜣ n before plurals; wꜥ means "a".', 'So "the ' + n[2] + '" is ' + tl(art(n[3]) + ' ' + n[1]) + '.'], h: 'Masculine pꜣ, feminine tꜣ.', chk: { le: [n[1], n[3]] } }; },
      { q: 'What does Late Egyptian have that Middle Egyptian lacks?', a: 'Definite articles: pꜣ, tꜣ and nꜣ', w: ['Determinatives', 'Sound signs for one consonant', 'Vowel letters'], s: ['In Middle Egyptian, pꜣ, tꜣ and nꜣ were demonstratives ("this", "these").', 'In Late Egyptian they became articles, "the", as Latin ille became Italian il.'], h: 'Think of the word "the".' },
      { tf: false, q: 'True or false: Middle Egyptian stopped being written when Late Egyptian appeared.', s: ['Middle Egyptian stayed in use for formal inscriptions beside Late Egyptian, and was still carved in Ptolemaic temples.', 'Late Egyptian was used for letters, records and stories.'] },
      { q: 'About when was Late Egyptian the everyday written language?', a: 'About 1350–700 BC, in the New Kingdom and after', w: ['About 2600–2000 BC, in the Old Kingdom', 'About 2000–1650 BC, in the Middle Kingdom', 'After AD 300, in Christian Egypt'], s: ['Late Egyptian appears in writing in the later 18th Dynasty and is fully used in the 19th and 20th.', 'It gave way to Demotic from about 700 BC.'], h: 'The age of Ramesses.', viz: { name: 'eg-scripts', opts: { mode: 'stages', ask: 'late', quiet: true, interactive: false } } },
      { lv: 2, f: function (R) { var n = R.pick(LE_NOUNS), ans = art(n[3]) + ' ' + n[1], wrong = art(n[3] === 'm' ? 'f' : 'm') + ' ' + n[1];
        return { q: 'Write "the ' + n[2] + '" in Late Egyptian transliteration. (' + tl(n[1]) + ' is ' + (n[3] === 'm' ? 'masculine' : 'feminine') + '.)', tl: ans, tlw: [wrong, 'nꜣ n ' + n[1], 'wꜥ ' + n[1]], s: [(n[3] === 'm' ? 'Masculine' : 'Feminine') + ' singular takes ' + tl(art(n[3])) + '.', '"The ' + n[2] + '" = ' + tl(ans) + '.'], h: 'Type ꜣ as A.', chk: { le: [n[1], n[3]] } }; } },
      { lv: 2, q: 'Ramesses II\'s temple walls are mostly in Middle Egyptian, but letters from his reign are in Late Egyptian. Why?', a: 'Formal monuments kept the classical language; everyday writing used the spoken one', w: ['Ramesses II did not know Late Egyptian', 'Late Egyptian was a foreign language', 'Letters were written by Greeks'], s: ['Middle Egyptian had become a classical, formal language, like Latin in medieval Europe.', 'Letters and records used the language people spoke: Late Egyptian.'], h: 'Compare Latin and the everyday languages of medieval Europe.' },
      { lv: 3, f: function (R) { var n = R.pick(LE_NOUNS.filter(function (x) { return x[3] === 'm'; })); return { q: 'In Late Egyptian, ' + tl('pꜣ ' + n[1]) + ' means "the ' + n[2] + '". How would a scribe say "a ' + n[2] + '"?', tl: 'wꜥ ' + n[1], tlw: ['pꜣ ' + n[1], 'tꜣ ' + n[1], 'nꜣ n ' + n[1]], s: ['Late Egyptian uses wꜥ, the word for "one", as the indefinite article "a".', '"A ' + n[2] + '" = ' + tl('wꜥ ' + n[1]) + '.'], h: 'The word for "one".', chk: { le: [n[1], 'indef'] } }; } }
    ]);
  });

  var LTEXTS = [['the Report of Wenamun', 'a priest of Amun sent to Byblos to buy cedar for the god\'s boat, who is robbed and humiliated abroad'], ['the tomb-robbery papyri', 'official inquiries into robberies of tombs at Thebes under Ramesses IX, with confessions'], ['the Tale of Two Brothers', 'a story of two brothers, Anubis and Bata, full of magic and transformations'], ['the Contendings of Horus and Seth', 'a comic myth of the gods\' long quarrel over who should be king'], ['the love songs of Papyrus Harris 500 and Chester Beatty I', 'poems spoken by young lovers'], ['the Late Ramesside Letters', 'family and official letters from Thebes at the end of the 20th Dynasty']];
  G('arch.late-texts', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var t = R.pick(LTEXTS); return { q: 'Which Late Egyptian text is ' + t[1] + '?', a: cap(t[0]), w: LTEXTS.map(function (x) { return cap(x[0]); }), k: 4, s: [cap(t[0]) + ': ' + t[1] + '.'], h: 'Travel, crime, magic, gods, love, or letters?' }; },
      { tf: false, q: 'True or false: all the great Egyptian stories come from the Middle Kingdom.', s: ['Many lively stories, such as the Tale of Two Brothers and Wenamun, are in Late Egyptian, from the New Kingdom and after.', 'Their language shows it: articles like pꜣ and tꜣ.'] },
      { lv: 2, f: function (R) { return mapPick(R, 'byblos', ['byblos', 'kadesh', 'megiddo', 'tanis', 'alexandria', 'avaris'], 'Wenamun was sent to buy cedar at Byblos. Which dot is Byblos?', ['Byblos is on the coast of Lebanon, north of Egypt across the sea, the source of cedar wood.'], 'On the Lebanese coast.'); } },
      { lv: 2, q: 'What do most Egyptologists today think the Report of Wenamun is?', a: 'A literary work set in real conditions, though how much happened is debated', w: ['A forgery of the 1890s', 'An exact official report of a journey', 'A translation of a Greek novel'], s: ['It was once read as a real report.', 'Its dialogue, irony and plot lead most scholars to read it as literature that reflects Egypt\'s weakened standing abroad; the question is still debated.'], h: 'Look at how it is told.' },
      { lv: 2, q: 'What can the tomb-robbery papyri tell historians that temple walls cannot?', a: 'What witnesses and thieves said in real court inquiries', w: ['The king\'s official victories', 'The plan of a temple', 'The dates of the Old Kingdom'], s: ['Temple walls show the ideal world of the king and the gods.', 'The papyri record questioning, confessions and officials\' rivalries in Thebes under Ramesses IX.'], h: 'Daily reality versus the ideal.' },
      { lv: 3, q: 'A story uses the article pꜣ before masculine nouns and has lively dialogue. Which stage of the language is it most likely in?', a: 'Late Egyptian', w: ['Old Egyptian', 'Middle Egyptian', 'Coptic in Greek letters'], s: ['Articles like pꜣ are a mark of Late Egyptian.', 'The text is written in hieroglyphic transcription, not in Greek letters, so it is not Coptic.'], h: 'Which stage has articles but is still written in Egyptian signs?' }
    ]);
  });

  G('arch.demotic-script', function (R, ctx) {
    return bank(R, ctx, [
      function (R) {
        var ord = R.shuffle([0, 1, 2]), letter = LETTERS[ord.indexOf(1)];
        return { q: 'Which letter marks the Demotic text of the Rosetta Stone?', a: letter, w: ['A', 'B', 'C'].filter(function (l) { return l !== letter; }), k: 3, keep: true, s: ['Hieroglyphs at the top, Demotic in the middle, Greek at the bottom.', 'The middle band is ' + letter + '.'], h: 'It is an Egyptian script, between the formal one and the Greek.', viz: { name: 'eg-scripts', opts: { mode: 'rosetta', quiet: true, order: ord, interactive: false } } };
      },
      { q: 'From which script did Demotic develop?', a: 'Hieratic, in its northern form', w: ['Greek', 'Coptic', 'Phoenician'], s: ['Demotic grew out of the hieratic used in the north of Egypt, in the 7th century BC.', 'Its signs descend, through hieratic, from hieroglyphs.'], h: 'It is the next step of cursive writing.' },
      { q: 'What did the name "Demotic" originally mean?', a: '"Popular", from a Greek word used by Herodotus', w: ['"Priestly", from Clement of Alexandria', '"Sacred carving"', '"Document of the gods"'], s: ['Herodotus called it the script of the people: dēmotika.', 'The Egyptians themselves called it "document writing".'], h: 'Compare "democracy".' },
      { tf: false, q: 'True or false: the Demotic text of the Rosetta Stone is written in Greek.', s: ['Demotic is an Egyptian script, writing the Egyptian language.', 'The Greek text is the bottom one.'] },
      { lv: 2, q: 'About when did Demotic first come into use?', a: 'In the 7th century BC', w: ['In the Old Kingdom, c. 2500 BC', 'In the 2nd century AD', 'Under Ramesses II, c. 1250 BC'], s: ['Early Demotic developed in the north at the end of the 25th Dynasty and spread under the 26th, around 650 BC.', 'It was used until AD 452.'], h: 'Around the start of the Late Period (664 BC).' },
      { lv: 2, f: function () { return yearQ(EV.demLast); } },
      { lv: 3, q: 'Why is Demotic hard to read even for someone who knows hieroglyphs?', a: 'Many signs are run together into groups that must be learned as wholes', w: ['It writes a different language', 'It has no sound signs', 'It is written left to right'], s: ['Demotic is the most cursive Egyptian script: groups of signs merge into single shapes.', 'The language and the system are the same, but the shapes must be learned.'], h: 'Fast writing merges signs.' }
    ]);
  });

  var DTEXTS = [['the tale of Setne Khamwas and the Book of Thoth', 'a prince steals a magic book from a tomb and learns his lesson'], ['the tale of Setne and Si-Osire', 'a wonder-child leads his father through the land of the dead'], ['the Instruction of Ankhsheshonq', 'a wisdom book of short, pithy sayings'], ['a marriage contract', 'an agreement fixing a wife\'s property and maintenance'], ['a tax receipt', 'a short note on an ostracon recording that a tax was paid'], ['a mummy label', 'a small wooden tag naming the dead, from the Roman period']];
  G('arch.demotic-texts', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var t = R.pick(DTEXTS); return { q: 'Which kind of Demotic text is described: ' + t[1] + '?', a: cap(t[0]), w: DTEXTS.map(function (x) { return cap(x[0]); }), k: 4, s: [cap(t[0]) + ': ' + t[1] + '.'], h: 'Story, wisdom, contract, receipt, or label?' }; },
      { tf: false, q: 'True or false: Demotic was used only for business documents.', s: ['Demotic began as "document writing", and contracts and receipts are its largest group.', 'But it also has a rich literature: tales like those of Setne Khamwas, and wisdom books like Ankhsheshonq.'] },
      { q: 'The hero of the Setne tales is based on which real person?', a: 'Khaemwaset, a son of Ramesses II remembered as a scholar', w: ['Ramesses II himself', 'Ptolemy V', 'Champollion'], s: ['Prince Khaemwaset restored old monuments and was remembered as a learned man.', 'Centuries later, Demotic storytellers made him the hero of tales about ancient books and magic.'], h: 'A prince of the 19th Dynasty.' },
      { lv: 2, q: 'What can a family\'s Demotic contracts and tax receipts tell a historian?', a: 'Who married whom, who held which land and what they paid', w: ['The king\'s victories in war', 'The plan of the local temple', 'How the pyramids were built'], s: ['Contracts record marriages and property; leases and receipts record land and taxes.', 'Together they show the economic and family life of ordinary people.'], h: 'Think about daily life.' },
      { lv: 3, q: 'Why do so many Demotic papyri come from the Faiyum and Middle Egypt?', a: 'Dry town rubbish heaps on the desert edge preserved them', w: ['Demotic was written only there', 'Those towns had no temples', 'Papyrus was made only in the Faiyum'], s: ['Papyrus survives only where it stays dry.', 'Towns on the desert edge, like those of the Faiyum, left dry rubbish heaps full of discarded papers.'], h: 'Where does papyrus survive?' }
    ]);
  });

  G('arch.demotic-rosetta', function (R, ctx) {
    return bank(R, ctx, [
      function () { return { q: 'How many lines of Demotic survive on the Rosetta Stone?', num: 32, s: ['Hieroglyphic: 14 lines. Demotic: 32 lines. Greek: 54 lines.', 'So 32.'], h: 'More than the hieroglyphs, fewer than the Greek.', chk: { rosetta: ['demotic', 32] } }; },
      { q: 'Which of the Rosetta Stone\'s two Egyptian texts is better preserved?', a: 'The Demotic', w: ['The hieroglyphic', 'They are equally preserved', 'Neither: only the Greek survives'], s: ['The top of the stone, with the hieroglyphs, is broken off: 14 lines remain.', 'The Demotic, in the middle, has 32 lines.'], h: 'Which part of the stone is broken?' },
      { tf: false, q: 'True or false: the hieroglyphic text is the longest surviving text on the Rosetta Stone.', s: ['It is the most damaged: only 14 lines survive.', 'The Demotic has 32 lines and the Greek 54.'] },
      { lv: 2, f: function () { return yearQ(EV.akerblad, 'In what year did Johan Åkerblad publish the personal names he had found in the Rosetta Stone\'s Demotic text?'); } },
      { lv: 2, q: 'What mistaken idea did Åkerblad have about Demotic?', a: 'That it was purely alphabetic', w: ['That it was Greek', 'That it was a code invented by Napoleon', 'That it had no names in it'], s: ['Åkerblad found the names and some sound values.', 'He thought Demotic was all alphabet; Young showed it also had word signs, being derived from hieroglyphs.'], h: 'Young later corrected him.' },
      function (R) { var t = R.pick(ROS), u = R.pick(ROS.filter(function (x) { return x !== t; })), big = t[2] > u[2] ? t : u, small = t[2] > u[2] ? u : t;
        return { q: 'How many more lines survive of the ' + big[1] + ' text than of the ' + small[1] + ' text on the Rosetta Stone?', num: big[2] - small[2], s: ['Hieroglyphic 14, Demotic 32, Greek 54.', big[2] + ' − ' + small[2] + ' = ' + (big[2] - small[2]) + '.'], h: '14, 32 and 54 lines.', chk: { arith: [big[2], small[2], big[2] - small[2]] } }; },
      function (R) { var ord = R.shuffle([0, 1, 2]), t = R.pick([0, 1, 2]), letter = LETTERS[ord.indexOf(t)], desc = ['the best preserved of the two Egyptian texts', 'the most damaged text', 'the text in the Greek language'][[1, 0, 2].indexOf(t)];
        return { q: 'On this drawing of the Rosetta Stone, which letter marks ' + desc + '?', a: letter, w: ['A', 'B', 'C'].filter(function (l) { return l !== letter; }), k: 3, keep: true, s: ['Top: hieroglyphic (14 lines, the most damaged). Middle: Demotic (32 lines, the best preserved Egyptian text). Bottom: Greek (54 lines).', 'So the answer is ' + letter + '.'], h: 'Top, middle, bottom.', viz: { name: 'eg-scripts', opts: { mode: 'rosetta', quiet: true, order: ord, interactive: false } } }; },
      function (R) { var p = R.sample(ROS, 2), more = p[0][2] > p[1][2] ? p[0] : p[1]; return { q: 'Which has more surviving lines on the Rosetta Stone: the ' + p[0][1] + ' text or the ' + p[1][1] + ' text?', a: 'The ' + more[1] + ' text', w: ['The ' + (more === p[0] ? p[1][1] : p[0][1]) + ' text', 'They have the same number'], k: 3, s: [p[0][1] + ': ' + p[0][2] + ' lines. ' + p[1][1] + ': ' + p[1][2] + ' lines.', 'The ' + more[1] + ' text has more.'], h: '14, 32 and 54 lines, top to bottom.', chk: { rosetta: [more[0], more[2]] } }; },
      { lv: 2, q: 'What did Young call the Demotic script, using an older name?', a: '"Enchorial", meaning "native"', w: ['"Hieratic", meaning "priestly"', '"Coptic", meaning "Egyptian"', '"Uncial", meaning "rounded"'], s: ['Young called Demotic the "enchorial" script, from the Greek for "of the country".', 'His Demotic dictionary was titled Rudiments of an Egyptian Dictionary in the Ancient Enchorial Character (1831).'], h: 'From the Greek for "of the country".' },
      { lv: 3, q: 'Young found about 80 Demotic groups that matched groups in the hieroglyphic text. What did this show?', a: 'Demotic is derived from hieroglyphs and uses the same kinds of sign', w: ['Demotic is a Greek script', 'The two texts say different things', 'The hieroglyphs were copied from the Demotic'], s: ['Matching groups mean related scripts.', 'So Demotic was not a separate alphabet: it came from hieroglyphs, with sound signs and word signs.'], h: 'What do matching groups imply?' }
    ]);
  });


  // ================================================================ Unit 11: Coptic
  // Usual Sahidic values for reading native words letter by letter (ⲟⲩ is read as one vowel, ou)
  var CSOUND = { 'ⲁ': 'a', 'ⲃ': 'b', 'ⲉ': 'e', 'ⲏ': 'ē', 'ⲑ': 'th', 'ⲓ': 'i', 'ⲕ': 'k', 'ⲗ': 'l', 'ⲙ': 'm', 'ⲛ': 'n', 'ⲟ': 'o', 'ⲡ': 'p', 'ⲣ': 'r', 'ⲥ': 's', 'ⲧ': 't', 'ⲫ': 'ph', 'ⲭ': 'kh', 'ⲱ': 'ō', 'ϣ': 'sh', 'ϥ': 'f', 'ϩ': 'h', 'ϫ': 'j', 'ϭ': 'ky', 'ϯ': 'ti' };
  function copRead(w) { var out = '', i = 0; while (i < w.length) { if (w[i] === 'ⲟ' && w[i + 1] === 'ⲩ') { out += 'ou'; i += 2; continue; } var c = CSOUND[w[i]]; if (c === undefined) throw new Error('no value for ' + w[i]); out += c; i++; } return out; }
  function plain(s) { return s.replace(/ē/g, 'e').replace(/ō/g, 'o'); }
  // Sahidic words: DESCENT (the kit's model) plus a few common words with their Egyptian ancestors
  var CWORDS = [['ⲣⲣⲟ', 'king'], ['ⲕⲁϩ', 'earth, land'], ['ⲡⲉ', 'heaven, sky'], ['ϩⲟⲟⲩ', 'day'], ['ⲙⲟⲩ', 'to die'], ['ⲥⲟⲛ', 'brother'], ['ⲥⲱⲛⲉ', 'sister'], ['ⲛⲟⲩⲃ', 'gold'], ['ⲉⲓⲱⲧ', 'father'], ['ⲁⲛⲟⲕ', 'I']];
  function allWords() { return EG().DESCENT.map(function (d) { return [d.cop, d.en]; }).concat(CWORDS); }
  var COPNUM = { 1: 'ⲁ', 2: 'ⲃ', 3: 'ⲅ', 4: 'ⲇ', 5: 'ⲉ', 6: 'ⲋ', 7: 'ⲍ', 8: 'ⲏ', 9: 'ⲑ', 10: 'ⲓ', 20: 'ⲕ', 30: 'ⲗ', 40: 'ⲙ', 50: 'ⲛ', 60: 'ⲝ', 70: 'ⲟ', 80: 'ⲡ', 90: 'ϥ', 100: 'ⲣ', 200: 'ⲥ', 300: 'ⲧ', 400: 'ⲩ', 500: 'ⲫ', 600: 'ⲭ', 700: 'ⲯ', 800: 'ⲱ' };
  function copNum(n) { var h = Math.floor(n / 100) * 100, t = Math.floor((n % 100) / 10) * 10, u = n % 10; return [h, t, u].filter(Boolean).map(function (x) { return COPNUM[x]; }).join(''); }
  function overline(s) { return s.split('').map(function (c) { return c + '̅'; }).join(''); }

  G('arch.coptic-origins', function (R, ctx) {
    return bank(R, ctx, [
      { q: 'What is Coptic?', a: 'The last stage of the Egyptian language, written in an alphabet based on Greek', w: ['A separate language that replaced Egyptian', 'A dialect of Greek spoken in Egypt', 'The language of the Rosetta Stone\'s middle text'], s: ['Coptic words and grammar descend from earlier Egyptian.', 'It is written in the Greek alphabet plus letters from Demotic.'], h: 'Same language, new alphabet.' },
      { tf: false, q: 'True or false: Coptic is a different language from the language of the hieroglyphs.', s: ['Coptic is Egyptian in its last stage: ' + tl('rmṯ') + ' "person" became ⲣⲱⲙⲉ (rōme).', 'What changed was the script, and the sounds over time.'] },
      function (R) { var d = R.pick(EG().DESCENT); return { q: 'Which Coptic word descends from Egyptian ' + tl(d.tl) + ' "' + esc(d.en) + '"?', a: d.cop, w: EG().DESCENT.map(function (x) { return x.cop; }), k: 4, s: ['Coptic keeps most of the consonants of the older word.', tl(d.tl) + ' → ' + cop(d.cop) + ' (' + esc(d.say) + ').'], h: 'Match the consonants.', chk: { descent: d.word } }; },
      { q: 'About when did Coptic writing take shape as a standard script?', a: 'In the 3rd and 4th centuries AD', w: ['In the Old Kingdom', 'Under Ramesses II', 'After the Arab conquest of AD 641'], s: ['Earlier experiments (Old Coptic) wrote Egyptian in Greek letters from about the 1st century AD.', 'Standard Coptic, used by Christian communities, took shape in the 3rd and 4th centuries.'], h: 'Early Christian Egypt.' },
      { lv: 2, q: 'Why did Egyptian Christians write their language in Greek letters rather than in hieroglyphs or Demotic?', a: 'An alphabet with vowels was easier to learn, and Greek letters were already familiar', w: ['Hieroglyphs had been banned by the pharaohs', 'Greek letters were cheaper to carve', 'Demotic could not write Egyptian'], s: ['The old scripts had thousands of signs and were tied to the temples.', 'Greek letters were widely known; scribes added Demotic letters for sounds Greek lacked.'], h: 'Think about ordinary readers.' },
      { lv: 2, f: function () { return yearQ(EV.nagHammadi, 'In what year were the Coptic books called the Nag Hammadi codices found?'); } },
      { lv: 3, q: 'Coptic took many words from Greek. About how much of the vocabulary of literary Coptic comes from Greek, by one estimate?', a: 'Up to about two fifths', w: ['None', 'Almost all of it', 'Less than one word in a thousand'], s: ['Greek was the language of government and the church\'s scriptures.', 'Up to 40% of literary Coptic vocabulary is Greek, especially words for religion, law and trade.'], h: 'A large share, but less than half.' }
    ]);
  });

  var GREEK_NATIVE = ['ⲁ', 'ⲃ', 'ⲉ', 'ⲏ', 'ⲓ', 'ⲕ', 'ⲗ', 'ⲙ', 'ⲛ', 'ⲟ', 'ⲡ', 'ⲣ', 'ⲥ', 'ⲧ', 'ⲱ', 'ⲑ', 'ⲫ', 'ⲭ'];
  var READ_WORDS = ['ⲣⲱⲙⲉ', 'ⲛⲟⲩⲧⲉ', 'ⲣⲁⲛ', 'ⲥⲱⲧⲙ', 'ⲣⲏ', 'ⲥⲟⲛ', 'ⲛⲟⲩⲃ', 'ⲣⲣⲟ', 'ⲁⲛⲟⲕ', 'ⲡⲉ'];
  G('arch.coptic-alphabet', function (R, ctx) {
    return bank(R, ctx, [
      function (R) { var DISP = { 'ⲃ': 'b or v' }, c = R.pick(GREEK_NATIVE), v = DISP[c] || CSOUND[c]; return { q: 'What sound does the Coptic letter <span class="eg-cop" style="font-size:1.4em">' + c + '</span> usually write in Egyptian words?', a: v, w: GREEK_NATIVE.map(function (x) { return DISP[x] || CSOUND[x]; }), k: 4, s: ['The letter ' + cop(c) + ' writes ' + v + '.'], h: 'Coptic letters are Greek letters in rounded forms.', chk: { csound: [c, CSOUND[c]] } }; },
      function (R) { var w = R.pick(READ_WORDS), r = copRead(w); return { q: 'Read the Coptic word <span class="eg-cop" style="font-size:1.4em">' + w + '</span> letter by letter. Type it in Latin letters (ē and ō may be typed as e and o).', text: [r, plain(r), r.replace(/b/g, 'v'), plain(r).replace(/b/g, 'v')].filter(function (v, i, a) { return a.indexOf(v) === i; }), s: w.replace(/ⲟⲩ/g, 'Ⓞ').split('').map(function (c) { return c === 'Ⓞ' ? cop('ⲟⲩ') + ' = ou' : cop(c) + ' = ' + CSOUND[c]; }).concat(['Together: ' + r + '.']), h: 'ⲟⲩ together is ou.', chk: { cread: [w, r] } }; },
      { q: 'How many Greek letters does the Coptic alphabet use?', a: 'All 24, from alpha to omega', w: ['Only the 5 vowels', '12, half of them', '7, from Demotic'], s: ['Coptic uses all 24 Greek letters, in Greek order.', 'It adds six or seven letters from Demotic.'], h: 'Alpha to omega.' },
      { tf: false, q: 'True or false: every Coptic letter is read exactly as in Greek, in every word.', s: ['Some letters, like ⲅ, ⲇ, ⲍ and ⲝ, appear mostly in words borrowed from Greek.', 'Others have Coptic values: ⲟⲩ is read ou, and ⲑ, ⲫ, ⲭ are t, p, k with h.'] },
      { lv: 2, q: 'Which of these letters appears mostly in words borrowed from Greek?', a: 'ⲇ (delta)', w: ['ⲣ (ro)', 'ⲙ (mi)', 'ⲛ (ni)', 'ⲥ (sima)'], s: ['Egyptian had no d sound of the Greek kind, so ⲇ is used mostly in Greek loanwords.', 'ⲣ, ⲙ, ⲛ and ⲥ are everyday letters in native Egyptian words.'], h: 'Which sound did Egyptian lack?' },
      { lv: 3, f: function (R) { var n = R.int(11, 899); if (n % 10 === 0) n += R.int(1, 9); var s = copNum(n); return { q: 'Coptic letters were also numbers, marked with a line above. What number is <span class="eg-cop" style="font-size:1.4em">' + overline(s) + '</span>?', num: n, s: s.split('').map(function (c) { var v = Object.keys(COPNUM).filter(function (k) { return COPNUM[k] === c; })[0]; return cop(c) + ' = ' + v; }).concat(['Add: ' + n + '.']), h: 'Hundreds, then tens, then units: ⲣ = 100, ⲓ = 10, ⲁ = 1.', chk: { cnum: [s, n] } }; } }
    ]);
  });

  G('arch.coptic-extra', function (R, ctx) {
    var X = EG().COPTIC_EXTRA, SAH = X.filter(function (x) { return x.c !== 'ϧ'; });
    var SND = { 'ϣ': 'sh', 'ϥ': 'f', 'ϧ': 'kh', 'ϩ': 'h', 'ϫ': 'j (a sound like ch in "church")', 'ϭ': 'ky', 'ϯ': 'ti' };
    return bank(R, ctx, [
      function (R) { var x = R.pick(SAH); return { q: 'Which sound does the Coptic letter <span class="eg-cop" style="font-size:1.4em">' + x.c + '</span> (' + x.name + '), one of the letters from Demotic, write?', a: SND[x.c], w: SAH.map(function (y) { return SND[y.c]; }), k: 4, s: ['The letters from Demotic write sounds Greek had no letter for.', cop(x.c) + ' (' + x.name + ') = ' + SND[x.c] + '.'], h: 'Each was a Demotic sign for its sound.', chk: { cextra: [x.c, x.name] } }; },
      function (R) { var x = R.pick(SAH); return { q: 'Which Coptic letter writes the sound <b>' + SND[x.c].replace(/ \(.*/, '') + '</b>?', a: x.c, w: SAH.map(function (y) { return y.c; }).concat(['ⲱ']), k: 4, s: [cop(x.c) + ' (' + x.name + ') writes ' + SND[x.c] + '.'], h: 'One of the letters taken from Demotic.', chk: { cextra: [x.c, x.name] } }; },
      { q: 'How do you tell ϣ (shai, sh) from ⲱ (ō)?', a: 'ϣ has a tail below the line; ⲱ does not', w: ['ϣ is always larger', 'ⲱ has a dot above it', 'They are the same letter'], s: ['Both have a rounded double-cup shape.', 'Look for the tail: ϣ has one.'], h: 'Look below the line.' },
      { tf: false, q: 'True or false: the Coptic letter ϣ is a form of the Greek omega and is read ō.', s: ['ϣ (shai) comes from Demotic and writes sh.', 'The Greek omega is ⲱ, without a tail.'] },
      { lv: 2, q: 'Sahidic Coptic has six letters from Demotic. Which letter does Bohairic add as a seventh?', a: 'ϧ (khai, kh)', w: ['ϣ (shai, sh)', 'ϯ (ti, ti)', 'ⲱ (ō)'], s: ['Sahidic: ϣ ϥ ϩ ϫ ϭ ϯ.', 'Bohairic, the northern dialect, adds ϧ for kh.'], h: 'A sound like ch in Scottish "loch".' },
      { lv: 2, q: 'The Coptic letter ϥ (fai) comes, through Demotic, from which hieroglyph?', a: 'The horned viper, which wrote f', w: ['The owl, which wrote m', 'The mouth, which wrote r', 'The basket, which wrote k'], s: ['The horned viper (Gardiner I9) wrote f.', 'Its Demotic form became Coptic ϥ, still writing f.'], h: 'Which hieroglyph wrote f?' },
      { lv: 3, f: function (R) { var w = R.pick(['ϣⲱⲡⲉ', 'ⲱⲛϩ', 'ⲛⲟⲩϥⲉ', 'ϩⲟⲟⲩ', 'ⲕⲁϩ']), x = w.split('').filter(function (c) { return SND[c]; })[0], r = copRead(w), greek = w.split('').filter(function (c) { return !SND[c] && c !== 'ⲩ'; });
        return { q: 'In the Coptic word <span class="eg-cop" style="font-size:1.4em">' + w + '</span> (' + r + '), which letter comes from Demotic?', a: x, w: greek.concat(['ⲱ', 'ⲁ']), k: 4, s: ['The letters from Demotic are ϣ ϥ ϩ ϫ ϭ ϯ (and ϧ in Bohairic).', cop(x) + ' is one of them; it writes ' + SND[x] + '.', 'Letter by letter the word is ' + r + '.'], h: 'Find the letter that is not in the Greek alphabet.', chk: { cread: [w, r], cextra: [x, ''] } }; } }
    ]);
  });

  var CHANGES = { ren: 'the vowel a appears; the consonants stay', ankh: 'ꜥ left no trace and ḫ became h', netjer: 'ṯ became t and the final r was lost', remetj: 'ṯ was lost, leaving rōme', nfr: 'the final r was lost', mu: 'the w is written with ⲟⲩ', ra: 'ꜥ was lost and the vowel is ē', sedjem: 'ḏ became t', kheper: 'ḫ became sh and the final r was lost' };
  G('arch.coptic-vowels', function (R, ctx) {
    var D = EG().DESCENT;
    return bank(R, ctx, [
      function (R) { var d = R.pick(D), r = copRead(d.cop); return { q: 'Egyptian ' + tl(d.tl) + ' "' + esc(d.en) + '" is ' + cop(d.cop) + ' in Coptic. How was it said in Coptic times? Type it in Latin letters (ē, ō may be typed e, o).', text: [r, plain(r), d.say, plain(d.say)].filter(function (v, i, a) { return a.indexOf(v) === i; }), s: ['Read the Coptic letter by letter: ' + r + '.', 'This is the late pronunciation, about two thousand years after the Old Kingdom.'], h: 'ⲟⲩ is ou; ⲱ is ō; ⲏ is ē.', chk: { cread: [d.cop, r] } }; },
      function (R) { var d = R.pick(D.filter(function (x) { return CHANGES[x.word]; })); return { q: 'Egyptian ' + tl(d.tl) + ' became Coptic ' + cop(d.cop) + ' (' + esc(d.say) + '). What changed?', a: cap(CHANGES[d.word]), w: Object.keys(CHANGES).filter(function (k) { return k !== d.word; }).map(function (k) { return cap(CHANGES[k]); }), k: 4, s: ['Compare consonant by consonant: ' + tl(d.tl) + ' and ' + esc(d.say) + '.', cap(CHANGES[d.word]) + '.'], h: 'Line up the consonants.', chk: { change: d.word } }; },
      { q: 'What does Coptic tell us that hieroglyphs cannot?', a: 'The vowels of Egyptian words, as they were said late in the language\'s history', w: ['How words were said in the Old Kingdom', 'The meaning of every hieroglyph', 'The dates of the pharaohs'], s: ['Hieroglyphs, hieratic and Demotic write consonants only.', 'Coptic writes vowels, but for the 1st millennium AD; earlier sounds had changed.'], h: 'Vowels, but late ones.' },
      { tf: false, q: 'True or false: Coptic vowels show exactly how Egyptian words sounded in the pyramid age.', s: ['Coptic shows pronunciation about 2,500 years after the pyramid age.', 'Sounds changed over time: final r was lost, ḫ became sh or h, and vowels moved.'] },
      { lv: 2, q: 'Egyptologists say ' + tl('nfr') + ' as "nefer". Coptic has ⲛⲟⲩϥⲉ (noufe). Which statement is right?', a: '"Nefer" is a modern convention; noufe is the late pronunciation', w: ['"Nefer" is the real ancient pronunciation', 'Noufe is how it was said under Khufu', 'The two words are unrelated'], s: ['Egyptologists add e between consonants by convention.', 'Coptic shows how the word sounded in its last stage; earlier forms are reconstructed with uncertainty.'], h: 'One is a convention, one is evidence.' },
      { lv: 3, q: 'Besides Coptic, what evidence helps scholars guess at earlier Egyptian vowels?', a: 'Egyptian names written in other scripts, such as cuneiform, which show vowels', w: ['The determinatives', 'The colors of hieroglyphs', 'The length of cartouches'], s: ['Cuneiform and Greek write vowels.', 'Egyptian names in cuneiform letters of the New Kingdom, or in Greek, give glimpses of earlier pronunciation, but the evidence is patchy.'], h: 'Scripts that write vowels.' }
    ]);
  });

  G('arch.coptic-dialects', function (R, ctx) {
    return bank(R, ctx, [
      { q: 'Which Coptic dialect is used in the services of the Coptic Church today?', a: 'Bohairic', w: ['Sahidic', 'Akhmimic', 'Fayyumic'], s: ['Bohairic, the dialect of the northwest Delta, replaced Sahidic in the liturgy by the 11th century.', 'It is still read and sung in Coptic services.'], h: 'The northern dialect.' },
      { q: 'Which dialect was the classical literary dialect of the south?', a: 'Sahidic', w: ['Bohairic', 'Fayyumic', 'Oxyrhynchite'], s: ['Sahidic flourished as a literary language from about the 4th to the 9th century.', 'The Nag Hammadi codices are mainly in Sahidic.'], h: 'The great monasteries of Upper Egypt wrote it.' },
      { tf: false, q: 'True or false: the Coptic language has died out completely.', s: ['Arabic replaced Coptic as the everyday language over many centuries.', 'But Coptic survives in the worship of the Coptic Church, and is still studied and taught.'] },
      { lv: 2, q: 'A Coptic text uses the letter ϧ. Which dialect is it most likely in?', a: 'Bohairic', w: ['Sahidic', 'Akhmimic', 'Greek'], s: ['Sahidic uses six letters from Demotic.', 'Bohairic adds ϧ (kh).'], h: 'Which dialect has seven extra letters?' },
      { lv: 2, q: 'About how long did Coptic survive as a spoken language after the Arab conquest of AD 641?', a: 'For centuries: as a majority language until about the 10th–12th century, and among some speakers until at least the 17th century', w: ['It stopped at once in AD 641', 'Only until AD 700', 'It is still the everyday language of Egypt'], s: ['Arabic became the language of government around AD 700, and spread slowly.', 'Coptic remained a spoken minority language until at least the 17th century.'], h: 'Language change is slow.' },
      { lv: 3, f: function (R) { var t = R.pick([['alexandria', 'Bohairic, the dialect of the western Delta,', 'Alexandria lies on the coast at the western edge of the Delta.'], ['fayum', 'Fayyumic', 'The Faiyum is the great oasis-basin west of the Nile, south of Memphis.'], ['oxyrhynchus', 'Oxyrhynchite', 'Oxyrhynchus lies on the west side of the valley in Middle Egypt.']]); return mapPick(R, t[0], ['alexandria', 'fayum', 'oxyrhynchus', 'nag-hammadi', 'philae', 'memphis'], t[1] + ' was written around ' + EG().site(t[0]).name + '. Which dot is ' + EG().site(t[0]).name + '?', [t[2]], 'Read the dialect\'s name.'); } }
    ]);
  });

  // ================================================================ Unit 12: The End of the Old Scripts
  var BCEV = [['Cleopatra VII died', 30], ['Augustus made Egypt a Roman province', 30], ['the Rosetta decree was issued', 196], ['the Canopus decree was issued', 238], ['Alexander the Great reached Egypt', 332]];
  G('arch.last-hieroglyphs', function (R, ctx) {
    return bank(R, ctx, [
      function () { return yearQ(EV.hieroLast); },
      { q: 'Where was the last known hieroglyphic inscription carved?', a: 'At Philae, beside a figure of the god Mandulis', w: ['At Karnak, on a pylon of Ramesses II', 'On the Rosetta Stone', 'In Alexandria, by Cleopatra VII'], s: ['A priest named Nesmeterakhem carved it at Philae, the island temple of Isis near Aswan.', 'It stands beside a figure of Mandulis, a Nubian god, and is dated 24 August AD 394.'], h: 'The last temple to stay open.' },
      { tf: false, q: 'True or false: hieroglyphs stopped being carved when Cleopatra VII died.', s: ['Cleopatra died in 30 BC.', 'Priests went on carving hieroglyphs for more than four centuries, until AD 394.'] },
      function (R) { var e = R.pick(BCEV), d = e[1] + 394 - 1; return { q: 'How many years passed between ' + yr(-e[1]) + ', when ' + e[0] + ', and AD 394, when the last hieroglyphs were carved?', num: d, s: ['There is no year 0: 1 BC is followed by AD 1.', 'Years from ' + e[1] + ' BC to AD 394 = ' + e[1] + ' + 394 − 1 = ' + d + '.'], h: 'Add the BC and AD years, then subtract 1.', chk: { arith2: [-e[1], 394, d] } }; },
      { lv: 2, f: function (R) { return mapPick(R, 'philae', ['philae', 'elephantine', 'kom-ombo', 'edfu', 'abu-simbel', 'karnak'], 'Which dot is Philae, where the last hieroglyphs were carved?', ['Philae lies just south of Aswan and the First Cataract, at Egypt\'s old southern border.'], 'At the First Cataract.'); } },
      { lv: 2, q: 'Why did Philae keep its cult longer than the temples of the north?', a: 'It lay on the southern frontier, and its cult of Isis was honored by Nubian peoples too', w: ['It was hidden in the desert', 'Its priests were Christians', 'It was built by the Romans for the emperor'], s: ['Christian emperors closed most temples, especially after Theodosius I\'s laws of 391–392.', 'Philae, at the frontier, stayed open until Justinian closed it about AD 535–537.'], h: 'Think about who came to worship there.' },
      { lv: 3, f: function (R) { var e = R.pick(BCEV), d = e[1] + 394 - 1, w = e[1] + 394; return { q: 'A student says ' + w + ' years passed between ' + yr(-e[1]) + ' (when ' + e[0] + ') and AD 394. Is that right?', a: 'No: it is ' + d + ', because there is no year 0', w: ['Yes: add the two numbers', 'No: it is ' + (394 - e[1]) + ', the difference', 'No: it is ' + (w + 1) + ', counting both ends'], s: ['From ' + e[1] + ' BC to AD 1 is ' + e[1] + ' years; from AD 1 to AD 394 is 393.', 'Total: ' + d + '.'], h: 'What year follows 1 BC?', chk: { arith2: [-e[1], 394, d] } }; } },
      { lv: 3, f: function () { return { q: 'Which emperor finally closed the temple of Isis at Philae, about AD 535–537?', a: 'Justinian I', w: ['Theodosius I', 'Augustus', 'Constantine'], s: ['Theodosius I\'s laws of 391–392 closed most temples, but Philae stayed open.', 'Justinian I had it closed about 535–537; it later became a church.'], h: 'An emperor of the 6th century.' }; } }
    ]);
  });

  G('arch.last-demotic', function (R, ctx) {
    return bank(R, ctx, [
      function () { return yearQ(EV.demLast); },
      { q: 'Which ended first: hieroglyphic or Demotic writing?', a: 'Hieroglyphic, in AD 394; Demotic lasted until AD 452', w: ['Demotic, in AD 394; hieroglyphic lasted until AD 452', 'They ended in the same year', 'Neither: both are still written'], s: ['The last hieroglyphs: Philae, AD 394. The last dated Demotic: Philae, AD 452.', 'Demotic lasted about sixty years longer.'], h: 'The everyday script outlived the formal one.' },
      function () { return { q: 'How many years after the last hieroglyphs (AD 394) was the last dated Demotic inscription (AD 452)?', num: 58, s: ['Both are AD: 452 − 394 = 58.', 'About sixty years.'], h: 'Subtract.', chk: { arith: [452, 394, 58] } }; },
      { tf: false, q: 'True or false: hieroglyphs outlasted Demotic.', s: ['Demotic\'s last dated text, at Philae, is from AD 452.', 'Hieroglyphs ended in AD 394, about sixty years earlier.'] },
      { lv: 2, f: function (R) { var a = R.pick([650, 600, 664]), d = a + 452 - 1; return { q: 'If Demotic was first used about ' + a + ' BC and last in AD 452, for about how many years was it in use?', num: d, s: ['There is no year 0, so the span is ' + a + ' + 452 − 1.', '= ' + d + ' years: about ' + fmt(Math.round(d / 100) * 100) + '.'], h: 'BC years + AD years − 1.', chk: { arith2: [-a, 452, d] } }; } },
      { lv: 2, q: 'After AD 452, how was the Egyptian language written?', a: 'Only in Coptic', w: ['Only in hieroglyphs', 'In Demotic and Greek', 'It was not written at all'], s: ['Hieroglyphs ended in 394 and Demotic in 452.', 'Coptic, in Greek-based letters, was the only Egyptian script left.'], h: 'Which script was still alive?' },
      { lv: 3, f: function (R) { return orderQ(R, [EV.hieroLast, EV.demLast, { id: 'philaeClosed', label: 'Justinian closes the temple of Philae', y: 536, when: 'about AD 535–537' }, { id: 'arab', label: 'the Arab conquest of Egypt', y: 641, when: 'AD 641' }, { id: 'theodosius', label: 'Theodosius I\'s laws against the old cults', y: 391, when: 'AD 391–392' }], 4); } }
    ]);
  });

  var MERO_C = ['b', 'd', 'k', 'l', 'm', 'p', 'q', 'r', 'w', 'y']; // consonants without special syllable signs (s, t and n have signs for se, te, to, ne)
  G('arch.meroitic', function (R, ctx) {
    return bank(R, ctx, [
      function () { return yearQ(EV.meroitic); },
      { q: 'What can scholars do with Meroitic texts today?', a: 'Read them aloud, but understand only part of the language', w: ['Translate them fully, like Egyptian', 'Neither read nor understand them', 'Understand them, but not read the signs'], s: ['Griffith worked out the sound values in 1909, from names known in Egyptian sources.', 'Without a long bilingual text or a well-known relative, most words cannot be translated.'], h: 'Sounds are known; meanings are not.' },
      { q: 'Meroitic has two forms. From which scripts do they derive?', a: 'The monumental form from Egyptian hieroglyphs, the cursive form from Demotic', w: ['Both from Greek', 'The monumental form from Coptic, the cursive from Arabic', 'Both from Phoenician'], s: ['Meroitic hieroglyphs borrow the shapes of Egyptian hieroglyphs.', 'Meroitic cursive, used for most texts, derives from Demotic.'], h: 'Kush borrowed from its northern neighbor.' },
      { tf: false, q: 'True or false: because Meroitic can be sounded out, its texts can be fully translated.', s: ['Reading a script (its sounds) and understanding a language (its words) are different.', 'Meroitic can be sounded out, but its meaning is only partly known.'] },
      function (R) { var c = R.pick(MERO_C), v = R.pick(['', 'e', 'i', 'o']); return { q: 'In Meroitic, a consonant sign carries the vowel a unless a vowel sign follows. How is the consonant sign ' + c + ' read ' + (v ? 'when followed by the vowel sign ' + v : 'alone') + '?', a: c + (v || 'a'), w: [c + 'a', c + 'e', c + 'i', c + 'o', c, v ? v + c : 'a' + c], k: 4, s: ['A consonant sign alone is read with a: ' + c + 'a.', v ? 'A following vowel sign replaces the a: ' + c + v + '.' : 'No vowel sign follows, so: ' + c + 'a.'], h: 'The built-in vowel is a.', chk: { mero: [c, v] } }; },
      { lv: 2, f: function (R) { return mapPick(R, 'meroe', ['meroe', 'napata', 'nuri', 'kerma', 'buhen', 'abu-simbel'], 'Which dot is Meroë, the later capital of Kush?', ['Meroë lies far up the Nile in Sudan, between the Fifth and Sixth Cataracts.'], 'Far south, beyond the Fifth Cataract.'); } },
      { lv: 2, q: 'Which Meroitic word is known to mean a ruling queen, heard by Greeks and Romans as "Candace"?', a: 'kandake', w: ['qore', 'pharaoh', 'nesu'], s: ['qore means "king, ruler".', 'kandake (or kentake) was the title of a ruling queen; Greek and Latin writers turned it into "Candace".'], h: 'Listen to the sound.' },
      { lv: 3, q: 'What is the state of the debate about the Meroitic language\'s family?', a: 'Unresolved: some link it with the Eastern Sudanic languages, others propose different links', w: ['Settled: it is a dialect of Egyptian', 'Settled: it is a form of Greek', 'Settled: it is the ancestor of Coptic'], s: ['Claude Rilly and others argue it is Eastern Sudanic, related to the Nubian languages, from its grammar and words.', 'Other scholars have proposed other families. Few bilingual texts make it hard to settle.'], h: 'Is it settled?' }
    ]);
  });

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
  var TABS = [{"k":"arch.classical-writers#3","h":["Writer","In Egypt","Work","Useful for","Read with care"],"r":[["Herodotus","mid-400s BC (by his own account)","<i>Histories</i>, Book 2","the Nile, the flood, customs and religion in his own day, embalming as it was described to him","stories of kings from long before, with numbers he could not check"],["Diodorus of Sicily","60–56 BC (he dates his visit by the Olympic games)","<i>Library of History</i>, Book 1","Ptolemaic Egypt, which he saw; he says he watched a crowd kill a Roman who had killed a cat","much is copied from earlier Greek writers, mixed with his own views"],["Strabo","about 25 BC, traveling up the Nile with the Roman governor Aelius Gallus","<i>Geography</i>, Book 17","places and distances; the Nilometer at Elephantine; the statue at Thebes that was said to \"sing\" at dawn","little on the deep past; a geographer, not a historian of Egypt"]],"cap":"Three classical writers on Egypt.","m":[[2,0,"Which classical writer wrote {a}, with its account of Egypt?",0,"a work with its writer"],[0,1,"When was {a} in Egypt?",0,0,2],[3,0,"Which classical writer is most useful for {a}?",0,0,2],[4,0,"Which writer's account must be read with care for this reason: {a}?",0,0,3]]},
    {"k":"arch.obelisks#3","h":["Obelisk","Made for","First stood at","Moved"],"r":[["Lateran obelisk, Rome","Thutmose III (finished under Thutmose IV)","Karnak","taken to Rome under Constantius II in AD 357; re-erected 1588"],["Flaminio obelisk, Rome","Seti I and Ramesses II","Heliopolis","brought by Augustus, 10 BC"],["Vatican obelisk, Rome","no hieroglyphs","Alexandria (set up for Augustus)","brought by Caligula; moved to St Peter's Square in 1586"],["Obelisk of Theodosius, Istanbul","Thutmose III","Karnak","set up in Constantinople's Hippodrome in the AD 300s"],["Luxor obelisk, Paris","Ramesses II","Luxor Temple","given by Muhammad Ali in 1830; raised in the Place de la Concorde in 1836"],["\"Cleopatra's Needle\", London","Thutmose III","Heliopolis, then Alexandria","raised on the Thames Embankment in 1878"],["\"Cleopatra's Needle\", New York","Thutmose III","Heliopolis, then Alexandria","raised in Central Park in 1881"]],"cap":"Some travelling obelisks.","m":[[0,3,"How did the {a} reach its present place?",0,0,2],[3,0,"Which obelisk is this: {a}?",0]]},
    {"k":"arch.napoleon#3","h":["Date","Event"],"r":[["1 July 1798","French forces land at Alexandria"],["21 July 1798","Battle of the Pyramids; the French take Cairo"],["August 1798","The British fleet destroys the French fleet at Aboukir Bay (Battle of the Nile); the scholars found the Institut d'Égypte in Cairo"],["July 1799","Soldiers rebuilding a fort near Rosetta find the Rosetta Stone"],["August 1799","Napoleon returns to France, leaving his army behind"],["1801","The French surrender; under the terms, the stone and other finds go to Britain"],["1809 onward","The <i>Description de l'Égypte</i> appears in volumes of text and large plates"]],"cap":"The expedition, step by step.","m":[[1,0,"When did this happen: {a}?",0,"an event with its date"],[0,1,"What happened in {a}, during or after the French expedition to Egypt?",0]]},
    {"k":"arch.rosetta#4","h":["Text","Script","Language","Lines surviving"],"r":[["Top","Hieroglyphic","Egyptian","14 (the top is broken off)"],["Middle","Demotic","Egyptian","32"],["Bottom","Greek","Greek","54 (only about half complete)"]],"cap":"Two languages, three scripts.","m":[[1,0,"Which part of the Rosetta Stone is in {a}?",0,"a script with its place on the stone"],[0,1,"Which script is used in the {a} text of the Rosetta Stone?",0],[1,3,"How many lines of the {a} text of the Rosetta Stone survive?",0,0,2]]},
    {"k":"arch.how-cracked#3","h":["Key","What it supplied","Example"],"r":[["Bilingual text","the meaning of a passage","the Greek of the Rosetta Stone translates its Egyptian texts"],["Royal names","sound values of signs, tested across names","p, o and l shared by Ptolemy and Cleopatra"],["Coptic","the sounds and vocabulary of Egyptian","Coptic <span class=\"eg-cop\">ⲣⲏ</span> \"sun\" confirms the reading rꜥ for the sun sign"]],"cap":"Three keys and what each one did.","m":[[0,1,"In the decipherment of hieroglyphs, what did this key supply: {a}?",0,"a key with what it supplied"],[2,0,"Which key to the decipherment does this example show: {a}?",0,0,2]]},
    {"k":"arch.after-champollion#3","h":["Who","When","What"],"r":[["Champollion","1822–1824","sound signs in names; the mixed system"],["Lepsius","1837","signs for two or three consonants; phonetic complements; vowels not written"],["Lepsius","1842–1845","Prussian expedition; the plates of the <i>Denkmäler aus Aegypten und Aethiopien</i>, still used today"],["Lepsius","1866","finds the Canopus Decree at Tanis: hieroglyphic, Demotic and Greek, mostly intact"],["Brugsch, Goodwin and others","1850s–1860s","grammar and dictionaries of Demotic and hieratic"]],"cap":"From decipherment to proof.","m":[[2,1,"When did this step after the decipherment happen: {a}?",0,0,2],[2,0,"Who did this: {a}?",0]]},
    {"k":"arch.collectors#5","h":["Collector","Worked for","Where much of it went"],"r":[["Giovanni Belzoni","Henry Salt, British consul","British Museum (the \"Younger Memnon\"); Seti I's sarcophagus went to Sir John Soane's Museum, London"],["Henry Salt","Britain","British Museum; a later collection to the Louvre"],["Bernardino Drovetti","France","the Egyptian Museum in Turin, founded 1824 around his collection"]],"cap":"Rival collectors and their collections.","m":[[0,1,"Whom did {a} collect for?",0,"a collector with whom he worked for"],[2,0,"Whose collecting ended up here: {a}?",0,0,2]]},
    {"k":"arch.mariette#3","h":["Year","Event"],"r":[["1850–1851","Mariette uncovers the avenue of sphinxes and the Serapeum at Saqqara"],["1858","Said Pasha creates the post of conservator of monuments for him: the Antiquities Service begins"],["1863","The museum at Bulaq, on the Nile in Cairo, opens"],["1871","Verdi's opera <i>Aida</i>, from a story sketched by Mariette, opens in Cairo"],["1881","Mariette dies in Cairo; Gaston Maspero succeeds him"],["1902","The collection moves to the new Egyptian Museum in Tahrir Square, Cairo"]],"cap":"Mariette and the Service.","m":[[1,0,"When did this happen: {a}?",0,"an event with its year"],[0,1,"What happened in {a}, in the story of Mariette and the Antiquities Service?",0]]},
    {"k":"arch.petrie#3","h":["Years","Site","What it showed"],"r":[["1880–1882","Giza","the most accurate survey of the pyramids made to that time"],["1884","Tanis","his first excavation, for the Egypt Exploration Fund"],["1888–1889","Hawara","painted mummy portraits of Roman date"],["1891–1892","Amarna","the city of Akhenaten; a young Howard Carter trained with him"],["1894–1895","Naqada and Ballas","thousands of graves of the Predynastic culture"],["1896","Thebes","the stela of Merneptah"]],"cap":"Some of Petrie's fieldwork.","m":[[1,2,"What did Petrie's work at {a} show?",0,"a site with what Petrie found there"],[1,0,"When did Petrie work at {a}?",0,0,3]]},
    {"k":"arch.kv62#3","h":["Date","Event"],"r":[["4 November 1922","the first step is found"],["26 November 1922","Carter and Carnarvon look into the antechamber (\"wonderful things\")"],["16 February 1923","the sealed burial chamber is officially opened"],["5 April 1923","Lord Carnarvon dies in Cairo of blood poisoning from an infected mosquito bite"],["1925","the mummy is examined; the gold mask is lifted"],["1932","the last objects are sent to the Egyptian Museum"]],"cap":"Ten years in one small tomb.","m":[[1,0,"In the story of Tutankhamun's tomb (KV62), when did this happen: {a}?",0,"an event with its date"],[0,1,"In the story of Tutankhamun's tomb (KV62), what happened on {a}?",0]]},
    {"k":"arch.relative-absolute#3","h":["Statement","Kind","How it was reached"],"r":[["\"The pit is younger than layer 5.\"","relative","stratigraphy: the pit cuts layer 5"],["\"Grave 12 is earlier than grave 31.\"","relative","seriation of pot types"],["\"The jar was made in the reign of Thutmose III.\"","absolute, through the king list","a seal with his name, and the dates of his reign"],["\"The seeds were harvested c. 2600 BC (± 50 years).\"","absolute","radiocarbon, calibrated"],["\"The house was built in the Middle Kingdom.\"","a period: absolute in the end, because periods are dated","pottery style, tied to dated sites"]],"cap":"Relative and absolute statements.","m":[[0,2,"How was this date reached: {a}",0,0,2],[2,0,"Which statement was reached this way: {a}?",0,0,3]]},
    {"k":"arch.radiocarbon-method#3","h":["Half-lives passed","Fraction of carbon-14 left","Years (half-life 5,730)"],"r":[["1","1/2","5,730"],["2","1/4","11,460"],["3","1/8","17,190"],["about 0.8","about 0.58","about 4,500 (a sample from the pyramid age)"]],"cap":"The radiocarbon clock.","m":[[0,1,"In radiocarbon dating, what fraction of the carbon-14 is left after {a} half-lives?",0,"half-lives with the fraction left"],[1,2,"Carbon-14 has a half-life of 5,730 years. About how many years old is a sample with {a} of its carbon-14 left?",0]]},
    {"k":"arch.luminescence#3","h":["","Radiocarbon","TL","OSL"],"r":[["Dates","death of a plant or animal","last heating","last exposure to light"],["Materials","wood, seeds, linen, bone…","pottery, burnt flint, fired brick","sand and silt"],["Typical uncertainty","decades for Egyptian samples, after calibration","often about 5–10% of the age","often about 5–10% of the age"]],"cap":"Three clocks compared.","one":"Which dating method is this?","all":"Which of these are true of {a}? Choose all that apply."},
    {"k":"arch.facsimile#3","h":["Method","Captures","Best for","Limits"],"r":[["Tracing on clear film","outlines, at full size","quick records in tombs and on stelae","contact with fragile surfaces; copyist's judgment unchecked"],["Drawing on a photograph (Chicago method)","lines checked against the wall","publication drawings of large walls","slow; needs trained artists and collators"],["Photogrammetry","shape and color in 3-D","whole rooms, objects, damaged relief","needs good overlap and light; processing time"],["Laser scanning","precise surface shape","measuring and monitoring decay","costly equipment; no color on its own"],["RTI","surface relief under moving light","faint carving, worn stelae, seals","small areas at a time"]],"cap":"Methods of making a facsimile.","m":[[1,0,"Which recording method captures {a}?",0,"a method with what it captures"],[2,0,"Which recording method is best for {a}?",0],[3,0,"Which recording method has these limits: {a}?",0,0,2]]},
    {"k":"arch.brackets#3","h":["Mark","Meaning","Example"],"r":[["[ ]","lost; restored by the editor","an offering that the king gives [to Osiris]"],["⸢ ⸣","damaged, but traces are visible","⸢lord⸣ of Abydos"],["⟨ ⟩","left out by the scribe; added by the editor","that he may give ⟨bread⟩ and beer"],["{ }","written by the scribe in error; to be ignored","to the spirit {spirit} of the official"],["[…]","lost; not restored","the official […]"]],"cap":"Brackets in an edition.","m":[[0,1,"In an edition of an Egyptian text, what does the mark {a} mean?",0,"a mark with its meaning"],[1,0,"In an edition of an Egyptian text, which mark means: {a}?",0],[2,1,"In an edition, what does the mark in this line tell you: <i>{a}</i>?",0,0,2]]},
    {"k":"arch.museums#3","h":["Museum","City","Famous objects"],"r":[["Egyptian Museum","Cairo (Tahrir Square)","the Narmer Palette; statues of the Old Kingdom"],["Grand Egyptian Museum","Giza","the complete Tutankhamun collection; Khufu's boat; a colossal statue of Ramesses II"],["British Museum","London","the Rosetta Stone; the \"Younger Memnon\""],["Louvre","Paris","the Seated Scribe; the Dendera zodiac"],["Neues Museum","Berlin","the bust of Nefertiti"],["Museo Egizio","Turin","the Turin King List; Drovetti's collection"],["Metropolitan Museum of Art","New York","the Temple of Dendur, a gift from Egypt after the Nubian campaign"]],"cap":"Some great collections of Egyptian objects.","m":[[0,1,"Where is the {a}?",0,"a museum with its city"],[2,0,"Which museum is famous for {a}?",0]]},
    {"k":"arch.return-debate#4","h":["Object","How it left Egypt"],"r":[["Rosetta Stone (British Museum)","handed to Britain in 1801 under the terms of the French surrender"],["Bust of Nefertiti (Berlin)","allotted to the German excavators in the 1913 division of finds"],["Dendera zodiac (Louvre)","cut from the temple ceiling in 1821 by agents of a French collector"]],"cap":"How three famous objects left Egypt.","m":[[1,0,"Which object left Egypt this way: {a}?",0]]},
    {"k":"arch.return-debate#7","h":["For return","For keeping"],"r":[["Removal under colonial power was not a free agreement between equals","The removal followed the law, treaty or permit of its time; judging it by today's rules is unfair"],["These objects are part of Egypt's national identity and history","They are also part of world heritage, and of the history of the museums that have held them for generations"],["Egypt now has world-class museums, such as the Grand Egyptian Museum, able to care for them","The objects are safe, conserved and studied where they are; moving fragile things carries risk"],["Most Egyptians can never travel to London or Berlin to see their own heritage","Millions of visitors from every country see them in great museums, often free of charge"],["Objects belong near their place of origin and context","Returning one object sets a precedent that could empty museums, and many museums are forbidden by law to give up their collections"]],"cap":"Each argument, stated by its supporters.","one":"In the debate over returning objects to Egypt, which side makes this argument?","all":"In the debate over returning objects to Egypt, which of these arguments belong on the side “{a}”? Choose all that apply.","na":1},
    {"k":"arch.laws#3","h":["Year","Law or agreement","What it did"],"r":[["1835","Decree of Muhammad Ali","banned the export of antiquities and planned a museum; weakly enforced"],["1858","Antiquities Service (Mariette)","state control of excavation; finds divided with foreign excavators"],["1970","UNESCO Convention","states agree to prevent illicit trade and help each other recover stolen cultural property; it does not reach back to earlier removals"],["1973","Egypt joins the Convention","Egypt becomes a state party"],["1983","Law 117 (amended in 2010)","antiquities are public property; trade banned; export banned; possession only of registered holdings"]],"cap":"Laws and dates.","m":[[1,0,"In what year did this come: {a}?",0,"a law with its year"],[2,1,"Which law or agreement did this: {a}?",0],[1,2,"What did this do: {a}?",0,0,2]]},
    {"k":"arch.survey#3","h":["Method","What it senses","Good for"],"r":[["Field walking","pottery, flint and stone on the surface","finding sites and dating them roughly by surface pottery"],["Aerial photographs","marks in crops, soil and shadows","outlines of walls and ditches over large areas"],["Satellite images","the same, from space, often repeated over years","mapping whole regions; spotting new looting pits"],["Magnetometry","small changes in the earth's magnetism","mud-brick walls, hearths, kilns, filled pits"],["Ground-penetrating radar","echoes of radar pulses from buried layers","walls, voids and floors, with depth"],["Electrical resistivity","how easily current passes through the ground","stone walls and damp ditches"]],"cap":"Seeing without digging.","m":[[1,0,"Which survey method senses {a}?",0,"a method with what it senses"],[2,0,"Which survey method is good for {a}?",0],[0,1,"What does {a} sense?",0,0,2]]},
    {"k":"arch.lab-science#3","h":["Method","Asks","Example","How settled"],"r":[["CT scanning","What is inside the wrappings?","scans of royal mummies, including Tutankhamun's in 2005","well established"],["Ancient DNA","How were people related, and where did their ancestors come from?","a 2017 study of mummies from Abusir el-Meleq","new; results debated, samples small"],["Residue analysis","What did a vessel hold?","traces of red and white wine in jars from Tutankhamun's tomb","growing; depends on contamination checks"],["Isotope analysis","What did a person eat? Where did they grow up?","strontium in teeth, which reflects the local rocks of childhood","well tested elsewhere; more Egyptian studies needed"],["Muon imaging","Are there hidden spaces in a pyramid?","a large void above the Grand Gallery of the Great Pyramid, announced in 2017","the void is confirmed; its purpose is unknown"]],"cap":"Science in the lab, and how sure it is.","m":[[1,0,"Which lab method asks: {a}",0,"a method with its question"],[2,0,"Which lab method gave this result: {a}?",0,0,2],[0,3,"How settled are the results of {a}?",0,0,3]]},
    {"k":"arch.nubia-rescue#3","h":["Monument","What was done"],"r":[["Abu Simbel","1964–1968: cut into more than a thousand blocks, most about 20 tons, and rebuilt about 65 m higher and 200 m back from the river"],["Philae","1977–1980: taken down into about 40,000 pieces and rebuilt on Agilkia island, about 500 m away"],["Kalabsha","moved by a West German team to a new site near the dam"],["Dendur, Debod, Taffeh, Ellesyia","given by Egypt to the United States, Spain, the Netherlands and Italy for their help"],["Buhen and many other sites","excavated and recorded, then flooded; Buhen's temple was moved to Khartoum"]],"cap":"Some results of the campaign.","m":[[1,0,"In the campaign to save the monuments of Nubia, which monument is this: {a}?",0]]},
    {"k":"arch.egyptian-egyptologists#3","h":["Scholar","Known for"],"r":[["Rifa'a al-Tahtawi (1801–1873)","a writer who argued for protecting antiquities; he helped inspire the decree of 1835"],["Ahmed Kamal (died 1923)","trained under Heinrich Brugsch; curator at the Egyptian Museum; a 22-volume dictionary linking ancient Egyptian and Arabic"],["Selim Hassan (1886–1961)","excavated at Giza 1929–1939 (published in 10 volumes); cleared the Sphinx; first Egyptian professor of Egyptology at Cairo University; an 18-volume encyclopedia of ancient Egypt in Arabic"],["Labib Habachi (1906–1984)","identified Tell el-Dab'a as Avaris, the Hyksos capital; worked on Elephantine and the Nubian campaign"],["Zakaria Goneim (1905–1959)","found the unfinished step pyramid of Sekhemkhet at Saqqara in the early 1950s"],["Kamal el-Mallakh","found Khufu's boat beside the Great Pyramid in 1954; it was rebuilt from 1,224 pieces by the restorer Ahmed Youssef Moustafa"]],"cap":"Some Egyptian Egyptologists.","m":[[1,0,"Which Egyptian scholar is known for this: {a}?",0],[0,1,"What is {a} known for?",0,0,2]]},
    {"k":"arch.hieratic#3","h":["","Hieroglyphic","Hieratic"],"r":[["Written with","chisel or careful brush","reed brush and ink"],["On","stone walls, statues, coffins","papyrus, potsherds and flakes of limestone (ostraca), wooden boards, leather, linen"],["Direction","right to left, left to right, or in columns","right to left; in columns at first, in horizontal lines as the rule after the 12th Dynasty"],["Look","detailed pictures","simplified signs, often joined"],["Used","about 3200 BC to AD 394","about 3200 BC to the 3rd century AD"]],"cap":"Two hands for one script.","one":"Hieroglyphic or hieratic: which does this describe?","all":"Which of these describe writing in {a}? Choose all that apply."},
    {"k":"arch.hieratic-uses#3","h":["Document","Date","What it is"],"r":[["Diary of Merer","c. 2560 BC (reign of Khufu)","the oldest inscribed papyri known: an official's logbook of shipping limestone from the Tura quarries to Giza; found at Wadi al-Jarf in 2013"],["Instruction of Ptahhotep (Papyrus Prisse)","Middle Kingdom copy","wisdom literature: advice from a vizier to his son"],["Westcar Papyrus","Second Intermediate Period copy","tales of magicians told at the court of Khufu"],["Rhind Mathematical Papyrus","c. 1550 BC (copied by the scribe Ahmose)","mathematical problems with worked answers"],["Ebers Papyrus","c. 1550 BC","a long medical handbook"],["Turin King List","New Kingdom (Ramesside)","a list of kings with the lengths of their reigns"],["Deir el-Medina ostraca","New Kingdom","work records, letters, receipts, school exercises and literary extracts"]],"cap":"Some famous hieratic documents.","m":[[2,0,"Which hieratic document is {a}?",0],[0,2,"What is the {a}?",0,"a document with what it is",2],[0,1,"When was the {a} written?",0,0,3]]},
    {"k":"arch.late-egyptian#3","h":["","Middle Egyptian","Late Egyptian"],"r":[["\"the house\"","<i class=\"eg-tl\">pr</i> (no article)","<i class=\"eg-tl\">pꜣ pr</i>"],["\"the town\"","<i class=\"eg-tl\">njwt</i>","<i class=\"eg-tl\">tꜣ njwt</i>"],["\"the men\"","<i class=\"eg-tl\">rmṯ</i>","<i class=\"eg-tl\">nꜣ n rmṯ</i>"],["\"a man\"","<i class=\"eg-tl\">rmṯ</i>","<i class=\"eg-tl\">wꜥ rmṯ</i>"],["\"his house\"","<i class=\"eg-tl\">pr=f</i>","<i class=\"eg-tl\">pꜣy=f pr</i> (an article with the suffix)"]],"cap":"Articles in Late Egyptian.","m":[[0,2,"How is {a} written in Late Egyptian?",0,"a meaning with its Late Egyptian form"],[0,1,"How is {a} written in Middle Egyptian?",0,0,2]]},
    {"k":"arch.late-texts#3","h":["Text","Date","What it is"],"r":[["Tomb-robbery papyri (Abbott and others)","reign of Ramesses IX, c. 1110 BC","official inquiries into robberies of royal and private tombs at Thebes, with confessions"],["Report of Wenamun","set in \"year 5\", at the end of the 20th Dynasty","a priest of Amun sent to Byblos to buy cedar for the god's boat; robbed on the way and humiliated abroad"],["Tale of Two Brothers (Papyrus D'Orbiney)","19th Dynasty","a story of two brothers, Anubis and Bata, with magic and transformations"],["The Contendings of Horus and Seth (Chester Beatty I)","20th Dynasty","a comic myth of the gods' quarrel over who should be king"],["Love songs (Chester Beatty I, Papyrus Harris 500)","New Kingdom","poems spoken by young lovers"],["Late Ramesside Letters","end of the 20th Dynasty","family and official letters from Thebes"]],"cap":"Some Late Egyptian texts.","m":[[2,0,"Which Late Egyptian text is this: {a}?",0],[0,2,"What is the {a}?",0,0,2],[0,1,"What date does the lesson give for this text: {a}?",0,0,3]]},
    {"k":"arch.demotic-script#3","h":["Stage","Dates","Typical uses"],"r":[["Early Demotic","c. 650–400 BC","administration, contracts and letters"],["Middle (Ptolemaic) Demotic","c. 400–30 BC","also literature, religious texts, and decrees like the Rosetta Stone"],["Late (Roman) Demotic","30 BC–AD 452","fewer uses: literary and religious texts, mummy labels, graffiti"]],"cap":"Demotic through time.","m":[[0,1,"What are the dates of {a}?",0,"a stage with its dates"],[2,0,"Which stage of Demotic had these typical uses: {a}?",0,0,2]]},
    {"k":"arch.demotic-texts#3","h":["Text","What it is"],"r":[["Setne Khamwas and the Book of Thoth (Setne I)","a prince, modelled on Ramesses II's scholarly son Khaemwaset, steals a magic book from a tomb, and learns his lesson"],["Setne and Si-Osire (Setne II)","Setne's wonder-child son leads him through the land of the dead, where good and evil deeds are repaid"],["Instruction of Ankhsheshonq","a wisdom book of short, pithy sayings, set as advice written by a man in prison"],["Marriage and annuity contracts","agreements fixing a wife's property and maintenance"],["Tax receipts","short notes on ostraca recording that a tax was paid"],["Mummy labels","small wooden tags naming the dead, in the Roman Period"]],"cap":"Some kinds of Demotic text.","m":[[1,0,"Which Demotic text is this: {a}?",0],[0,1,"What is the {a}?",0,0,2]]},
    {"k":"arch.demotic-rosetta#3","h":["Text","Lines left","State"],"r":[["Hieroglyphic","14","the most damaged: the top of the stone is lost"],["Demotic","32","well preserved"],["Greek","54","the lower part damaged at the right edge"]],"cap":"How much of each text survives.","m":[[0,1,"About how many lines of the {a} text of the Rosetta Stone are left?",0,"a text with its lines left"],[2,0,"Which text of the Rosetta Stone is in this state: {a}?",0]]},
    {"k":"arch.coptic-origins#4","h":["Egyptian (Middle Egyptian)","Coptic (Sahidic)","Meaning"],"r":[["<i class=\"eg-tl\">rn</i>","<span class=\"eg-cop\">ⲣⲁⲛ</span> (ran)","name"],["<i class=\"eg-tl\">ꜥnḫ</i>","<span class=\"eg-cop\">ⲱⲛϩ</span> (ōnh)","life, to live"],["<i class=\"eg-tl\">nṯr</i>","<span class=\"eg-cop\">ⲛⲟⲩⲧⲉ</span> (noute)","god"],["<i class=\"eg-tl\">rmṯ</i>","<span class=\"eg-cop\">ⲣⲱⲙⲉ</span> (rōme)","person, man"],["<i class=\"eg-tl\">sḏm</i>","<span class=\"eg-cop\">ⲥⲱⲧⲙ</span> (sōtm)","hear"]],"cap":"The same words, three thousand years apart.","m":[[1,2,"What does the Coptic word {a} mean?",0,"a Coptic word with its meaning"],[2,0,"Which Egyptian word means \"{a}\"?",0,0,2]]},
    {"k":"arch.coptic-alphabet#4","h":["Letter","Sound"],"r":[["<span class=\"eg-cop\">ⲁ</span>","a"],["<span class=\"eg-cop\">ⲛ</span>","n"],["<span class=\"eg-cop\">ⲃ</span>","b or v"],["<span class=\"eg-cop\">ⲟ</span>","o (ⲟⲩ = ou, or w)"],["<span class=\"eg-cop\">ⲉ</span>","e"],["<span class=\"eg-cop\">ⲡ</span>","p"],["<span class=\"eg-cop\">ⲏ</span>","ē (a long e)"],["<span class=\"eg-cop\">ⲣ</span>","r"],["<span class=\"eg-cop\">ⲑ</span>","th (t + h)"],["<span class=\"eg-cop\">ⲥ</span>","s"],["<span class=\"eg-cop\">ⲓ</span>","i, or y before a vowel"],["<span class=\"eg-cop\">ⲧ</span>","t"],["<span class=\"eg-cop\">ⲕ</span>","k"],["<span class=\"eg-cop\">ⲫ</span>","ph (p + h)"],["<span class=\"eg-cop\">ⲗ</span>","l"],["<span class=\"eg-cop\">ⲭ</span>","kh (k + h)"],["<span class=\"eg-cop\">ⲙ</span>","m"],["<span class=\"eg-cop\">ⲱ</span>","ō (a long o)"]],"cap":"The Greek letters used in native Egyptian words, with their usual values.","m":[[0,1,"Which sound does the Coptic letter {a} usually stand for?",0,"a letter with its sound"],[0,1,"Read the Coptic letter {a}. Which sound does it usually write?",0,0,2]]},
    {"k":"arch.coptic-extra#3","h":["Letter","Name","Sound","From"],"r":[["<span class=\"eg-cop\">ϣ</span>","shai","sh","the hieroglyph of a pool with lotus flowers (šꜣ)"],["<span class=\"eg-cop\">ϥ</span>","fai","f","the horned viper (f)"],["<span class=\"eg-cop\">ϧ</span>","khai (Bohairic only)","kh","the lotus plant (ḫꜣ)"],["<span class=\"eg-cop\">ϩ</span>","hori","h","a Demotic sign group for h"],["<span class=\"eg-cop\">ϫ</span>","janja","like ch in \"church\" (written j or č)","the fire drill (ḏꜣ)"],["<span class=\"eg-cop\">ϭ</span>","qima","ky","the basket (k)"],["<span class=\"eg-cop\">ϯ</span>","ti","ti","the arm giving a loaf (dj) with the loaf (t)"]],"cap":"The letters from Demotic.","m":[[0,2,"Which sound does the Coptic letter {a} stand for?",0,"a letter with its sound"],[0,1,"What is the name of the Coptic letter {a}?",0,0,2],[0,3,"From which sign does the Coptic letter {a} come?",0,0,3]]},
    {"k":"arch.coptic-vowels#4","h":["Egyptian","Convention","Coptic","Sound in Coptic","Change"],"r":[["<i class=\"eg-tl\">rn</i>","ren","<span class=\"eg-cop\">ⲣⲁⲛ</span>","ran","the vowel shows: a"],["<i class=\"eg-tl\">nfr</i>","nefer","<span class=\"eg-cop\">ⲛⲟⲩϥⲉ</span>","noufe","final r lost"],["<i class=\"eg-tl\">nṯr</i>","netjer","<span class=\"eg-cop\">ⲛⲟⲩⲧⲉ</span>","noute","ṯ became t; final r lost"],["<i class=\"eg-tl\">ḫpr</i>","kheper","<span class=\"eg-cop\">ϣⲱⲡⲉ</span>","shōpe","ḫ became sh; final r lost"],["<i class=\"eg-tl\">mw</i>","mu","<span class=\"eg-cop\">ⲙⲟⲟⲩ</span>","mou","the w is written ⲟⲩ"],["<i class=\"eg-tl\">rꜥ</i>","Ra","<span class=\"eg-cop\">ⲣⲏ</span>","rē","ꜥ lost; the vowel is ē"]],"cap":"Coptic vowels and late sound changes.","m":[[2,3,"How is the Coptic word {a} sounded?",0,"a Coptic word with its sound"],[0,3,"How is the Egyptian word <i>{a}</i> sounded in Coptic?",0],[0,4,"Egyptian <i>{a}</i> appears in Coptic in a changed form. What changed?",0,0,3]]},
    {"k":"arch.coptic-dialects#3","h":["Dialect","Where","Known for"],"r":[["Sahidic","the south (Middle and Upper Egypt); used across Egypt as the literary standard","the classical dialect of literature; the Nag Hammadi codices"],["Bohairic","the western Delta","the liturgy of the Coptic Church; adds <span class=\"eg-cop\">ϧ</span>"],["Akhmimic and Lycopolitan","around Akhmim and Asyut","early texts, 4th and 5th centuries"],["Fayyumic","the Faiyum","texts from the 3rd to the 10th centuries"],["Oxyrhynchite (Mesokemic)","around Oxyrhynchus","manuscripts of the 4th and 5th centuries"]],"cap":"The main dialects.","m":[[0,1,"Where was the {a} dialect of Coptic used?",0,"a dialect with where it was used"],[2,0,"Which Coptic dialect is known for this: {a}?",0]]},
    {"k":"arch.last-demotic#3","h":["Script","Last dated use","Where"],"r":[["Hieroglyphic","AD 394","Philae, beside the figure of Mandulis"],["Demotic","December AD 452","Philae, the roof of the temple of Isis"],["Coptic","still used in church today","the Coptic Church"]],"cap":"The end of the old scripts.","m":[[0,1,"What is the last dated use of {a} writing?",0,"a script with its last dated use"],[2,0,"Which script's last dated use is here: {a}?",0,0,2]]},
    {"k":"arch.meroitic#3","h":["","Meroitic hieroglyphic","Meroitic cursive"],"r":[["Derived from","Egyptian hieroglyphs","Demotic"],["Used for","royal and temple monuments","most texts: about nine in ten"],["Direction","in columns, read right to left","right to left"],["Signs","23","23"]],"cap":"The two forms of Meroitic.","one":"Which form of Meroitic does this describe?","all":"Which of these describe {a}? Choose all that apply."},
    {"k":"arch.forgotten#x","x":[{"q":"For about how long could no one read hieroglyphs?","a":"About 1,400 years","w":["About 140 years","About 400 years","About 3,000 years","They were always understood"],"s":["The last known inscription was carved in AD 394.","Champollion read the script again in 1822: about 1,400 years later."]},{"q":"What did scholars from Horapollo to Kircher wrongly believe about hieroglyphs?","a":"That every sign was a symbol for a sacred idea, not a sound","w":["That hieroglyphs were a form of Greek","That every sign stood for one letter of the alphabet","That hieroglyphs were only decoration with no meaning","That hieroglyphs were written in Coptic"],"s":["They took every picture as an allegory.","In fact most signs in a real text stand for sounds."]},{"q":"What was Athanasius Kircher's one lasting contribution?","a":"He argued that Coptic descended from the ancient Egyptian language","w":["He read the Rosetta Stone","He found the Rosetta Stone","He wrote the Hieroglyphica","He proved that signs stand for sounds in native names"],"s":["Kircher (1602–1680) studied Coptic, the language of Egypt's Christians.","His mystical \"translations\" were wrong, but the Coptic link later proved vital."]},{"q":"Which book, under the name of Horapollo, explained nearly two hundred signs as allegories?","a":"The Hieroglyphica","w":["Oedipus Aegyptiacus","The Description de l'Égypte","The Lettre à M. Dacier","The Book of the Dead"],"s":["The Hieroglyphica probably dates from the 4th or 5th century AD.","It was found on Andros in 1419 and printed in 1505."]},{"lv":2,"q":"The Hieroglyphica says a bird sign means \"son\" because the bird loves its young. What is the real reason the sign is used?","a":"It writes the consonants zꜣ, the same as the word for \"son\": a sound pun","w":["Geese were sacred to the king's son","It is a determinative for children","The bird was the symbol of the god Horus, son of Osiris","It is a Greek letter"],"s":["The sign (a pintail duck) writes the sounds zꜣ.","The word for \"son\" has the same consonants, so the sign spells it by sound."]},{"lv":2,"q":"Kircher noticed that the water sign could stand for the sound m. What Coptic word matched it?","a":"ⲙⲟⲟⲩ, \"water\"","w":["ⲣⲏ, \"sun\"","ⲣⲁⲛ, \"name\"","ⲛⲟⲩⲧⲉ, \"god\"","ⲣⲱⲙⲉ, \"person\""],"s":["Coptic ⲙⲟⲟⲩ means \"water\" and begins with m.","It was one of the few sound readings anyone made before 1822."]},{"lv":2,"q":"Why did the symbol theory make every attempt to read hieroglyphs fail?","a":"Readers looked for hidden meanings where most signs stand for sounds","w":["Nobody had copies of any inscriptions","The signs changed shape every century","Hieroglyphs were written in a lost alphabet of 26 letters","The Greek writers hid the key on purpose"],"s":["Some signs do stand for what they show, so the theory looked half right.","But a reader who treats every sign as a symbol invents a long mystical sentence where the text says something plain."]},{"lv":3,"q":"A scholar of the 1600s reads an owl in a cartouche as \"wisdom and the night\". What does the owl write?","a":"The sound m","w":["The idea of wisdom","The sound p","The word \"night\"","The goddess Isis"],"s":["The owl is a one-consonant sign for m.","Reading it as a symbol turned a name into nonsense."]},{"tf":true,"q":"True or false: Kircher's \"translations\" turned short obelisk inscriptions into pages of mystical philosophy.","s":["His Oedipus Aegyptiacus (1652–1655) is full of such readings.","None of them is right."]},{"tf":false,"q":"True or false: European scholars always knew that hieroglyphs stood for sounds.","s":["For about 1,400 years they thought the signs were mystical symbols.","The sound values were shown only in the 1810s and 1820s."]}]},
    {"k":"arch.young#x","x":[{"q":"What was Thomas Young already famous for before he studied the Rosetta Stone?","a":"Showing that light behaves as a wave","w":["Finding the Rosetta Stone","Discovering Tutankhamun's tomb","Founding the British Museum","Writing the Description de l'Égypte"],"s":["Young (1773–1829) was an English physician and physicist.","His work on light made him famous before his work on Egypt."]},{"q":"What did Thomas Young show the ovals called cartouches contain?","a":"Royal names","w":["Prayers to the gods","Dates of the year","Numbers","The names of scribes"],"s":["Young showed that cartouches hold royal names.","The cartouche in the place where the Greek names Ptolemy holds that name."]},{"q":"Where did Young publish his results in 1819?","a":"In the article \"Egypt\" in the Encyclopaedia Britannica","w":["In the Lettre à M. Dacier","In the Précis du système hiéroglyphique","In the Description de l'Égypte","In the Hieroglyphica"],"s":["Young's article \"Egypt\" appeared in the Encyclopaedia Britannica in 1819.","The Lettre (1822) and the Précis (1824) are Champollion's."]},{"q":"Why are names the decipherer's best friend?","a":"A foreign name must be spelled out by sound, whatever the script","w":["Names are always written in red ink","Names never change from text to text","Names are written in Greek letters inside every script","Names have the most pictures"],"s":["A foreign name like Ptolemaios has no picture of its own.","So its signs must stand for sounds: p, t, o, l, m, y, s."]},{"lv":2,"q":"About how many sound values did Young propose, and how did they hold up?","a":"13 signs: six right, three partly right, four wrong","w":["24 signs, all of them right","13 signs, all of them wrong","80 signs, half of them right","6 signs, all of them wrong"],"s":["Working from royal names, Young proposed values for 13 signs.","By a modern count, six were right, three partly right and four wrong."]},{"lv":2,"q":"Which idea held Young back?","a":"That sound spelling was used only for foreign names","w":["That cartouches hold royal names","That Demotic is related to hieroglyphs","That the Greek text translates the Egyptian texts","That Coptic descends from Egyptian"],"s":["Young thought native Egyptian words were written with symbols.","Champollion showed that native words used sound signs too."]},{"lv":2,"q":"How many matches did Young find between hieroglyphic and Demotic groups?","a":"About 80","w":["About 8","About 800","About 14","About 32"],"s":["Young lined up the texts and counted recurring words.","He found about 80 matches between hieroglyphic and Demotic groups."]},{"lv":3,"q":"Some historians call Young the decipherer of which script?","a":"Demotic","w":["Meroitic","Linear B","Hieratic","Coptic"],"s":["Young worked hard on Demotic.","His Rudiments of an Egyptian Dictionary in the Ancient Enchorial Character was published in 1831, after his death."]},{"tf":true,"q":"True or false: Young showed that Demotic mixes sound signs with word signs.","s":["Young showed that Demotic is related to hieroglyphs and mixes kinds of sign.","That was one of his three main results."]},{"tf":false,"q":"True or false: Champollion deserves all the credit, and Thomas Young added nothing.","s":["Young identified cartouches as royal names, read Ptolemy's, and showed how Demotic works.","Champollion built the full system. Both belong in the story."]}]},
    {"k":"arch.champollion#x","x":[{"q":"Which two royal names did Champollion compare to build his list of sound signs?","a":"Ptolemy and Cleopatra","w":["Ramesses and Thutmose","Khufu and Khafre","Alexander and Augustus","Tutankhamun and Akhenaten"],"s":["Ptolemaios and Kleopatra share p, o and l.","If both cartouches spell sounds, those signs should appear in both. They do."]},{"q":"On what date did Champollion read his Lettre à M. Dacier to the Academy in Paris?","a":"27 September 1822","w":["14 July 1799","27 September 1802","1 July 1798","4 November 1922"],"s":["Champollion read the Lettre on 27 September 1822.","It set out the sound signs of Greek and Roman names."]},{"q":"Ptolemy writes t with a loaf; Cleopatra writes t with a hand. What did Champollion conclude?","a":"A sound could have more than one sign","w":["One of the two cartouches was a fake","The loaf and the hand mean \"king\"","The two names were not names at all","Cleopatra's name was written in Demotic"],"s":["Both signs stand for a t sound.","Champollion concluded, rightly, that a sound could have more than one sign."]},{"q":"Which native king's name did Champollion read from the sun disk, the ms sign and s?","a":"Ramesses","w":["Thutmose","Ptolemy","Khufu","Cleopatra"],"s":["Coptic ⲣⲏ (rē) is \"sun\", and ⲙⲓⲥⲉ (mise) is \"birth\".","Ra-mes-s: Ramesses."]},{"lv":2,"q":"A cartouche begins with the ibis of the god Thoth, then the ms sign, then s. Whose name is it?","a":"Thutmose","w":["Ramesses","Ptolemy","Cleopatra","Amenhotep"],"s":["The ibis stands for Thoth.","Thoth-mes: Thutmose."]},{"lv":2,"q":"Why did the reading of Ramesses matter more than the reading of Ptolemy?","a":"It showed that sound signs spelled native Egyptian names, so the whole script was readable","w":["It was the longest name on the Rosetta Stone","It proved that hieroglyphs were Greek","It showed that cartouches hold prayers","Ramesses was the last king of Egypt"],"s":["Ptolemy and Cleopatra were foreign rulers of Greek descent.","Ramesses lived long before any Greek came, so sound signs were not just for foreigners."]},{"lv":2,"q":"Which language had Champollion studied most since boyhood, and used to check readings?","a":"Coptic","w":["Latin","Arabic","Hebrew","Persian"],"s":["Champollion studied languages from boyhood, Coptic most of all.","Coptic words like ⲣⲏ \"sun\" and ⲙⲓⲥⲉ \"birth\" confirmed his readings."]},{"lv":3,"q":"Ptolemy's name has p first; Cleopatra's has p fifth. Which sign must be p?","a":"The stool","w":["The lion","The lasso","The loaf","The hand"],"s":["The stool is the 1st sign of Ptolemy and the 5th of Cleopatra.","That fits p in both names."]},{"lv":3,"q":"Where were the copies of the cartouches that showed Champollion native names?","a":"Abu Simbel","w":["Rosetta","Philae","Saqqara","Amarna"],"s":["Copies of temple inscriptions from Abu Simbel showed Ramesses' cartouche.","He found the same sound signs there as in Ptolemy and Cleopatra."]},{"tf":false,"q":"True or false: Champollion read only the names of Greek and Roman rulers.","s":["Ptolemy and Cleopatra were the test.","The breakthrough was reading native names like Ramesses and Thutmose with the same signs."]}]},
    {"k":"arch.system#x","x":[{"q":"Which kind of sign is written at the end of a word and not read aloud?","a":"A determinative","w":["A one-consonant sign","A three-consonant sign","A word sign","A phonetic complement"],"s":["Determinatives show what kind of thing the word means.","They are silent."]},{"q":"What is a word sign (logogram)?","a":"A sign that stands for a whole word, often what it pictures","w":["A sign that stands for one consonant","A silent sign at the end of a word","A sign that writes a vowel","A sign used only in royal names"],"s":["Word signs stand for a whole word.","Often the word is what the sign pictures."]},{"q":"How many consonants can one sound sign stand for?","a":"One, two or three","w":["Only one","Exactly two","Four or more","None: sound signs write vowels"],"s":["There are one-, two- and three-consonant signs.","The 24 one-consonant signs work like an alphabet."]},{"q":"In which work did Champollion describe the script as \"figurative, symbolic and phonetic\" all at once?","a":"The Précis du système hiéroglyphique (1824)","w":["The Lettre à M. Dacier (1822)","The Hieroglyphica","The Encyclopaedia Britannica article \"Egypt\" (1819)","Oedipus Aegyptiacus"],"s":["The Précis appeared in 1824.","It described a mixed system of sound signs, word signs and determinatives."]},{"lv":2,"q":"Why did a mixed system make sense for Egyptian?","a":"Writing showed only consonants, so word signs and determinatives told similar words apart","w":["Scribes could not draw enough pictures","Every word had a different number of vowels","Greek law required it","It made texts longer and more beautiful"],"s":["Without vowels, many words look alike.","Determinatives tell words with the same consonants apart; word signs make common words quick to write."]},{"lv":2,"q":"The word for \"sky\" is written with a stool, a loaf and a picture of the sky. Which signs are read aloud?","a":"Only the stool and the loaf (p and t)","w":["All three signs","Only the picture of the sky","Only the loaf","None of them"],"s":["The stool is p and the loaf is t.","The sky picture is a determinative and is silent."]},{"lv":3,"q":"In ꜥnḫ \"life\", the ankh sign is followed by the signs for n and ḫ. What are those two signs?","a":"Phonetic complements that confirm the reading","w":["Determinatives","Extra consonants, so the word is read ꜥnḫnḫ","Vowel signs","Word signs for \"water\" and \"placenta\""],"s":["The ankh already writes ꜥ, n and ḫ.","The following signs repeat part of the sound to confirm the reading."]},{"lv":3,"q":"The sun disk is a word sign in rꜥ \"sun\". What is it in words for time and light?","a":"A determinative","w":["A one-consonant sign for r","A phonetic complement","A vowel","A mistake by the scribe"],"s":["The same sign can play different roles in different words.","In words for time and light it is a silent determinative."]},{"tf":false,"q":"True or false: once decoded, hieroglyphs are simply an alphabet.","s":["The 24 one-consonant signs work like an alphabet.","But most words also use two- and three-consonant signs, word signs and determinatives."]},{"tf":true,"q":"True or false: the symbolic theory was half right, because some signs do mean what they show.","s":["Word signs and determinatives often picture their meaning.","Its mistake was to think that all signs did."]},{"lv":2,"q":"If you read every sign of a word aloud, what mistake will a determinative cause?","a":"You will give it a sound that is not there","w":["You will skip a consonant","You will read the word backward","You will add a vowel that is there","None: determinatives are read aloud"],"s":["Determinatives are silent.","Reading them aloud adds a sound the word does not have."]},{"lv":2,"q":"How many one-consonant signs work like an alphabet?","a":"24","w":["26","12","100","700"],"s":["There are 24 one-consonant signs.","Most words also use other kinds of sign."]}]},
    {"k":"arch.recording#x","x":[{"q":"An object's value as evidence depends most on what?","a":"Its context: where it lay, what it lay with, and which layer held it","w":["Its price at auction","How shiny it is","How large it is","Which museum owns it now"],"s":["Context carries the date, use and setting of a find.","Without it, an object keeps only its own surface."]},{"q":"Why is the excavation record so important?","a":"Digging destroys the context it uncovers, so the record is all that remains","w":["Laws require museums to keep paper","Objects lose their color without a record","The record is sold to pay for the dig","Records make objects older"],"s":["You can only dig a layer once.","Notes, plans, photographs and finds registers keep what the digging removes."]},{"q":"Which of these is the \"findspot\" of an object?","a":"Exactly where it was: site, area, depth and coordinates","w":["What else was found with it","How it lay: in place, fallen or reburied","Which museum displays it","The name of the person who found it"],"s":["The findspot is the exact location.","What lay with it is the association."]},{"q":"What is an object's \"association\"?","a":"What else was with it, in the same grave, room or layer","w":["Exactly where it was found","The society that paid for the dig","Its weight and size","How it was cleaned"],"s":["Association is what was found together with the object.","Things found together often date together."]},{"lv":2,"q":"Two identical scarabs: one excavated in a child's grave at Amarna, one bought from a dealer. What can the bought one tell us?","a":"Only what is on its own surface","w":["Its exact date and use","The name of the child","More than the excavated one","Which layer it lay in"],"s":["The excavated scarab carries date, use and setting.","The bought one has lost its context."]},{"lv":2,"q":"Why do careful excavators often leave part of a site untouched?","a":"So that future methods can answer new questions there","w":["Because digging is too expensive","Because the law forbids digging the whole site","To hide treasure from looters","Because unexcavated soil is worth more"],"s":["Methods improve over time.","A part left untouched can be studied later with better tools."]},{"lv":3,"q":"The bust of Nefertiti was found in the workshop of the sculptor Thutmose, among unfinished heads and plaster studies. What does that context suggest?","a":"That the bust was a sculptor's model","w":["That it was a forgery","That it was made in the Roman period","That it came from Nefertiti's tomb","That it was a temple statue for worship"],"s":["It lay among studies and unfinished works.","The setting suggests a model kept in the workshop."]},{"tf":true,"q":"True or false: an object without a findspot has lost most of its story.","s":["Context gives date, use and setting.","Without it, only the object's own surface is left."]},{"tf":false,"q":"True or false: once an object is in a museum, it no longer matters where it was found.","s":["Where it was found, and with what, are much of its value as evidence.","Museums and scholars look for that record."]}]},
    {"k":"arch.text-dates#x","x":[{"f":"regnal"},{"q":"An inscription names a king but gives no year. What does it date the object to?","a":"That reign or later","w":["Exactly year 1 of the reign","Before the reign","The Roman period","Nothing at all"],"s":["A king's name shows the object was inscribed during or after his reign.","A regnal year would narrow it to a single year."]},{"q":"What does a regnal year such as \"year 9 of Ptolemy V\" date a text to?","a":"A single year of that reign","w":["The whole reign","The whole dynasty","Any time after that king","Nine years before the reign"],"s":["Egyptians dated documents by the years of the reigning king.","With the king list, that gives one year on our calendar."]},{"q":"What can date objects to a period even without any writing?","a":"Style: of pottery, coffins, statues or handwriting","w":["Their weight","The museum label","Their price","The color of the soil on them"],"s":["Styles changed over time.","Matching a style to dated examples gives a period."]},{"lv":2,"q":"A statue bears Ramesses II's cartouche, but its face and style match Amenhotep III, a century earlier. What happened?","a":"An older statue was re-inscribed: the style dates the making, the name the reuse","w":["Ramesses II lived a century earlier than thought","The statue is a modern forgery","Amenhotep III copied Ramesses II","The cartouche proves it was made under Ramesses II"],"s":["Later kings often cut their own names into older statues.","Style and name date different events."]},{"lv":2,"q":"From which date are Egyptian reigns fixed to the exact year?","a":"After 664 BC","w":["After 3000 BC","After 1550 BC","After AD 394","They never are"],"s":["After 664 BC the reigns are fixed to the year.","Before that, our dates carry the margins of the chronology."]},{"lv":3,"q":"Why can a date worked out from a regnal year be one year off?","a":"Egyptian regnal years did not start on 1 January","w":["Egyptians did not count years","There was a year 0","Kings always reigned for whole years","The king list has gaps of exactly one year"],"s":["A regnal year began at a different point in our year.","So a converted date can be off by one."]},{"tf":false,"q":"True or false: a king's name on an object proves the object was made in his reign.","s":["Names could be added later, carved over, or copied.","Heirlooms and reused statues carry older or newer names."]}]},
    {"k":"arch.epigraphy#x","x":[{"q":"What is epigraphy?","a":"The careful copying and publishing of inscriptions and reliefs","w":["Digging up tombs","Dating pottery by its style","Repairing broken statues","Translating Greek texts"],"s":["Inscriptions are slowly destroyed by salt, groundwater, wind and tourism.","Epigraphy makes a record that outlasts the wall."]},{"q":"Who founded the Epigraphic Survey of the University of Chicago, and when?","a":"James Henry Breasted, in 1924","w":["Flinders Petrie, in 1880","Howard Carter, in 1922","Auguste Mariette, in 1858","Champollion, in 1822"],"s":["Breasted founded the Survey in 1924.","It is based at Chicago House in Luxor."]},{"q":"What should an epigrapher's copy show when half of a sign has flaked off?","a":"What survives, and where the damage is; nothing invented","w":["The whole sign, restored as it probably was","Nothing: damaged signs are left out","A different sign that fits better","A question mark instead of the sign"],"s":["Draw what is there and mark what is damaged.","Restorations go only in the edition, clearly marked."]},{"q":"Which temple has the Epigraphic Survey spent a century recording?","a":"Medinet Habu","w":["Abu Simbel","The Parthenon","Philae","The Great Pyramid"],"s":["Chicago House in Luxor is the Survey's base.","Medinet Habu is one of the temples it has recorded."]},{"lv":2,"q":"In the Chicago method, what is \"collation\"?","a":"Two Egyptologists, working separately, check the drawing against the wall sign by sign","w":["Bleaching the photograph away","Taking a large photograph of the wall","Printing the final volume","Cleaning the wall with water"],"s":["After the drawing is inked, two Egyptologists check it separately.","They mark corrections, and the artist makes them."]},{"lv":2,"q":"Why does the Epigraphic Survey still draw, when cameras are cheap and exact?","a":"Light, stains and damage hide details that a trained eye, checked by collation, can recover","w":["Cameras are not allowed in temples","Drawings are cheaper than photographs","Photographs fade within a year","Drawings look more beautiful in books"],"s":["A photo cannot tell a faint sign from a crack.","A drawing checked at the wall can."]},{"lv":3,"q":"What is one of the main threats the Survey records against?","a":"Rising groundwater, which brings salt into the stone","w":["Earthquakes every year","Volcanic ash","Snow","Termites"],"s":["Groundwater carries salt into the stone.","The salt crystallizes and breaks up the surface."]},{"tf":false,"q":"True or false: a good photograph is always enough to record an inscription.","s":["Light and damage hide details.","Careful copying, checked at the wall, recovers them."]}]},
    {"k":"arch.transcription#x","x":[{"q":"In Egyptology, what does it mean to transcribe hieratic?","a":"To write out each hieratic sign as the hieroglyph it stands for","w":["To translate it into English","To write it in Greek letters","To copy it in Demotic","To date it by its handwriting"],"s":["Each cursive sign is matched to its hieroglyph.","Then the hieroglyphs are read like any inscription."]},{"q":"What are the three steps of reading hieratic, in order?","a":"Transcribe, transliterate, translate","w":["Translate, transcribe, transliterate","Transliterate, translate, transcribe","Transcribe, translate, transliterate","Translate, transliterate, transcribe"],"s":["First hieratic → hieroglyphs, then hieroglyphs → consonants (like nfr).","Last, the Egyptian words → English."]},{"q":"Whose table of hieratic sign forms by date do Egyptologists use?","a":"Georg Möller's","w":["Champollion's","Thomas Young's","Herodotus's","Horapollo's"],"s":["Möller arranged each sign's forms by date and manuscript.","Such palaeography tables help identify cursive signs."]},{"lv":2,"q":"An edition marks one hieroglyph in its transcription with a question mark. What does that tell you?","a":"The identification of that hieratic sign is uncertain","w":["The word is a question","The sign is missing from the papyrus","The scribe made a mistake","The sign is read twice"],"s":["Doubtful signs are marked in a transcription.","A reader can check them against the photograph."]},{"lv":2,"q":"Why do Egyptologists usually not print hieratic itself?","a":"It has no standard font, and every scribe's hand differs","w":["It is forbidden by law","It is too large to print","Nobody can read it","It is the same as Greek"],"s":["Each scribe wrote differently.","So editions print a hieroglyphic transcription beside a photograph."]},{"lv":3,"q":"Where does most of the uncertainty in reading a hieratic text lie?","a":"In identifying each cursive sign","w":["In translating Egyptian words into English","In finding the papyrus","In counting the lines","In reading the hieroglyphs once they are written out"],"s":["Identifying cursive signs needs a specialist's eye and a palaeography table.","Reading the resulting hieroglyphs is the same as for any carved text."]},{"tf":false,"q":"True or false: hieratic is a separate language from hieroglyphic Egyptian.","s":["Hieratic is the same language in a faster hand.","Transcription changes the script, not the words."]},{"tf":true,"q":"True or false: experienced readers can date a papyrus roughly from its handwriting.","s":["Hieratic hands changed over time and place.","Palaeography tables arrange sign forms by date."]}]},
    {"k":"arch.last-hieroglyphs#x","x":[{"q":"On what date was the last known hieroglyphic inscription carved?","a":"24 August AD 394","w":["30 BC","27 September 1822","December AD 452","AD 641"],"s":["It was carved at Philae on 24 August AD 394.","A Demotic text beside it gives the date."]},{"q":"Who carved the last known hieroglyphic inscription?","a":"A priest named Nesmeterakhem","w":["Cleopatra VII","The emperor Justinian","Champollion","Herodotus"],"s":["Nesmeterakhem (also written Esmet-Akhom) carved it at Philae.","It stands beside a figure of the god Mandulis."]},{"q":"Beside a figure of which god was the last hieroglyphic inscription carved?","a":"Mandulis, a Nubian god","w":["Amun","Ptah","Serapis","Thoth"],"s":["The inscription is beside a figure of Mandulis at Philae.","Mandulis was honored by Nubian peoples."]},{"lv":2,"q":"How many years passed between Cleopatra VII's death (30 BC) and the last hieroglyphs (AD 394)?","a":"423 years","w":["424 years","364 years","394 years","30 years"],"s":["There is no year 0: 30 + 394 − 1 = 423.","Hieroglyphs outlived Cleopatra by more than four centuries."]},{"lv":2,"q":"On which gateway is the last hieroglyphic inscription carved?","a":"The gateway of Hadrian at Philae","w":["The first pylon at Karnak","The entrance to the Great Pyramid","The Lion Gate","The gateway of Ramesses II at Luxor"],"s":["The gateway of Hadrian led toward the Abaton.","The Abaton was the sacred place where Osiris was said to rest."]},{"lv":3,"q":"Where does the temple of Philae, with the last hieroglyphs, stand today?","a":"On Agilkia, where it was moved during the Nubian campaign","w":["In the British Museum","Still on its original island, now under water","In Cairo","In Rome"],"s":["The temple was moved in 1977–1980.","It now stands on Agilkia island."]},{"tf":false,"q":"True or false: hieroglyphs ended with Cleopatra.","s":["Cleopatra died in 30 BC.","Hieroglyphs were carved until AD 394."]},{"q":"Which island temple held the last hieroglyphic inscription?","a":"Philae, the temple of Isis near Aswan","w":["Elephantine, the temple of Khnum","Karnak, the temple of Amun","Edfu, the temple of Horus","Dendera, the temple of Hathor"],"s":["Philae lies near Aswan, at the old southern frontier.","Its temple of Isis stayed open longest."]},{"q":"Which emperor finally closed the temple of Philae, about AD 535–537?","a":"Justinian","w":["Theodosius I","Augustus","Hadrian","Constantine"],"s":["Theodosius I's laws of 391–392 closed most temples.","Philae stayed open until Justinian closed it."]},{"lv":2,"q":"Why did Philae outlast the temples of the north?","a":"It lay on the frontier, and its cult of Isis was honored by Nubian peoples too","w":["It was hidden underground","It was built by the Romans","Its priests became Christians","It was too small to notice"],"s":["Peoples from Nubia came to worship Isis there.","That helped the temple stay open."]}]},
    {"k":"arch.last-demotic#x","x":[{"q":"Where was the last dated Demotic inscription written?","a":"On the roof of the temple of Isis at Philae","w":["On the Rosetta Stone","In the tomb of Tutankhamun","At Karnak","In Alexandria's library"],"s":["It is a short graffito on the temple roof at Philae.","It is dated to December AD 452."]},{"q":"Which script ended first, and by about how much?","a":"Hieroglyphs, by about sixty years","w":["Demotic, by about sixty years","Hieroglyphs, by about six hundred years","Demotic, by about six years","They ended the same year"],"s":["Hieroglyphs: AD 394. Demotic: AD 452.","452 − 394 = 58 years."]},{"q":"After Demotic ended, how was the Egyptian language written?","a":"Only in Coptic","w":["Only in hieroglyphs","Only in hieratic","In Meroitic","In Linear B"],"s":["After AD 452 the old scripts were gone.","Coptic was the only way left to write Egyptian."]},{"lv":2,"q":"What were many of the last Demotic texts at Philae?","a":"Short graffiti by priests and visitors: a name, a prayer, a date","w":["Long royal decrees","Tax receipts from Alexandria","Love poems on papyrus","Medical handbooks"],"s":["They were scratched on the temple walls and roof.","They show that a few people could still write the script in the 5th century."]},{"lv":2,"q":"Why did Demotic outlast hieroglyphs?","a":"It was the script of documents, used by many more scribes","w":["It was easier to carve in stone","Christian emperors required it","It was the language of the Greeks","It was written with an alphabet of 24 letters"],"s":["Hieroglyphs depended on the temples' few trained carvers.","Demotic was more widely known."]},{"lv":3,"q":"For about how many years was Demotic in use, from about 650 BC to AD 452?","a":"About 1,100 years","w":["About 200 years","About 450 years","About 3,000 years","About 650 years"],"s":["650 + 452 − 1 = 1,101.","About 1,100 years."]},{"tf":false,"q":"True or false: hieroglyphs outlasted Demotic.","s":["Demotic's last dated text is from AD 452.","Hieroglyphs ended in AD 394."]},{"q":"In what year is the last dated Demotic inscription?","a":"AD 452","w":["AD 394","30 BC","AD 641","196 BC"],"s":["It is dated to December AD 452.","It is at Philae."]},{"lv":2,"q":"By the 5th century AD, who wrote most of the last Demotic texts?","a":"Priests and pilgrims connected with the temple at Philae","w":["Roman governors","Coptic monks","Greek tax collectors","Arab scholars"],"s":["Demotic's uses had shrunk to religious texts, mummy labels and graffiti.","Most were written at Philae, the last open temple."]}]},
    {"k":"arch.meroitic#x","x":[{"q":"Who worked out the sound values of the Meroitic signs, and when?","a":"Francis Llewellyn Griffith, in 1909","w":["Champollion, in 1822","Thomas Young, in 1819","Michael Ventris, in 1952","Flinders Petrie, in 1880"],"s":["Griffith found the sounds from royal and divine names known in Egyptian sources.","That was in 1909."]},{"q":"How many signs does each form of Meroitic have?","a":"23","w":["24","7","87","About 700"],"s":["Both the hieroglyphic and the cursive form have 23 signs.","They correspond one to one."]},{"q":"What does the Meroitic word qore mean?","a":"King","w":["Queen","God","Water","Temple"],"s":["qore means \"king, ruler\".","kandake is the title of a ruling queen."]},{"q":"How are words separated in Meroitic writing?","a":"By a mark of two or three dots","w":["By spaces only","By cartouches","By red ink","They are not separated"],"s":["A divider of two or three dots stands between words.","That helps scholars find word boundaries."]},{"lv":2,"q":"Which title of a ruling queen of Kush did Greeks and Romans hear as \"Candace\"?","a":"kandake","w":["qore","pharaoh","nesu","Meroë"],"s":["kandake (or kentake) was the title of a ruling queen.","qore means \"king\"."]},{"lv":2,"q":"Why can't scholars translate most Meroitic texts?","a":"There is no long bilingual text, and the language has no well-known living relative","w":["The signs are unreadable","All Meroitic texts are lost","Meroitic was never written down","The texts are in Greek"],"s":["Sounds are known, but most meanings are not.","Few bilingual texts and no close relative leave most words unknown."]},{"lv":3,"q":"Meroitic is an alphasyllabary. What does that mean?","a":"A consonant sign carries the vowel a unless a vowel sign follows","w":["Every sign is a whole word","It writes only consonants","It writes only vowels","Each sign stands for three consonants"],"s":["A consonant sign alone is read with a.","A following vowel sign replaces the a."]},{"tf":true,"q":"True or false: Meroitic began to be written while Egypt was writing in Demotic.","s":["Meroitic began around the 3rd or 2nd century BC.","Demotic was then Egypt's everyday script."]}]},
    {"k":"arch.luminescence#x","x":[{"f":"lum"},{"q":"What does luminescence dating measure the time since?","a":"The last heating (TL) or the last exposure to light (OSL)","w":["The death of a plant or animal","The making of the clay","The writing of a text","The last rainfall"],"s":["Heating or sunlight empties the energy stored in crystals.","The clock starts again from zero."]},{"q":"Which crystals in clay and sediment store energy from natural radiation?","a":"Quartz and feldspar","w":["Salt and sugar","Gold and silver","Diamond and ruby","Ice and snow"],"s":["Quartz and feldspar slowly store radiation energy.","The lab releases it as a faint glow."]},{"lv":2,"q":"Why is luminescence useful for spotting fake \"ancient\" pottery?","a":"A recently fired pot shows almost no stored dose, so it fails a TL test","w":["Fakes glow green under light","Fakes are always heavier","Fakes contain no clay","Radiocarbon cannot date fakes"],"s":["Firing resets the clock.","A pot fired recently has had no time to store energy."]},{"lv":3,"q":"A lab reports a sherd as 4,000 years ± 8%. What range does that give?","a":"About 3,680 to 4,320 years ago","w":["About 3,992 to 4,008 years ago","About 3,200 to 4,800 years ago","About 3,920 to 4,080 years ago","Exactly 4,000 years ago"],"s":["8% of 4,000 is 320.","4,000 − 320 = 3,680 and 4,000 + 320 = 4,320."]},{"tf":false,"q":"True or false: luminescence dates are usually more precise than radiocarbon dates.","s":["Luminescence margins are usually wider, often several centuries for Egyptian material.","It is most useful where nothing else can be dated."]}]},
    {"k":"arch.hieratic#x","x":[{"q":"What is hieratic?","a":"The cursive form of the hieroglyphs, written fast in ink","w":["A separate language spoken by priests","The script of Kush","A Greek alphabet for Egyptian","A code invented by Champollion"],"s":["Hieratic uses the same signs, sound values and language as hieroglyphs.","The signs are simplified and joined for fast writing."]},{"q":"Why did Greek writers call this script \"hieratic\", meaning \"priestly\"?","a":"In their day, priests used it for religious books","w":["Only priests had ever used it","It was carved on temple walls","It was invented by a priest named Hieratos","It was used only for prayers to Ra"],"s":["By the Greek period, hieratic was mainly a script of religious books.","Earlier it was used for every kind of everyday writing."]},{"q":"When does hieratic first appear?","a":"At the very beginning of Egyptian writing, in the late Predynastic period","w":["In the 7th century BC","Under the Ptolemies","After the Roman conquest","In the New Kingdom"],"s":["Hieratic appears in Naqada III, with the earliest writing.","It was used beside hieroglyphs for more than 3,000 years."]},{"lv":2,"q":"What are ligatures in hieratic?","a":"Signs that often stand together, run into each other","w":["Silent signs at the end of words","Red ink headings","Signs for numbers","Spaces between words"],"s":["Writing fast with a brush joins signs.","Such joined groups are ligatures."]},{"lv":2,"q":"Which script grew out of hieratic in the 7th century BC?","a":"Demotic","w":["Coptic","Meroitic","Hieroglyphic","Greek"],"s":["Demotic developed from hieratic.","It appears around 650 BC."]},{"lv":3,"q":"What was \"abnormal hieratic\"?","a":"A very cursive form used at Thebes for legal documents and letters, replaced by Demotic in the 26th Dynasty","w":["A form of hieratic used only for mistakes","The hieratic of the pyramid age","A form of Coptic","Hieratic written left to right"],"s":["Abnormal hieratic was used in the south, at Thebes.","Demotic replaced it in the 26th Dynasty."]},{"tf":false,"q":"True or false: hieroglyphs came first, and hieratic was invented much later as a shortcut.","s":["The two were used side by side from the beginning.","What came later was Demotic."]}]},
    {"k":"arch.demotic-rosetta#x","x":[{"q":"Who read the personal names in the Demotic text of the Rosetta Stone in 1802?","a":"Silvestre de Sacy and Johan Åkerblad","w":["Champollion and Young","Lepsius and Brugsch","Mariette and Maspero","Napoleon's soldiers"],"s":["De Sacy and Åkerblad worked on the Demotic in 1802.","Åkerblad found every personal name of the Greek text in it."]},{"q":"Which text of the Rosetta Stone was the first to yield results?","a":"The Demotic","w":["The hieroglyphic","The Greek","The Latin","The Coptic"],"s":["The Demotic is nearly complete.","Names and phrases could be found in it."]},{"lv":2,"q":"The decree orders that it be written in \"sacred\", \"native\" and \"Greek\" letters. Which script is the \"native\" one?","a":"Demotic","w":["Hieroglyphic","Greek","Hieratic","Coptic"],"s":["\"Sacred\" letters are hieroglyphs.","\"Native\" letters are Demotic, the everyday script."]},{"lv":2,"q":"How could Åkerblad find the names in the Demotic without reading Demotic?","a":"By matching positions and repetitions with the Greek, then testing the sounds","w":["By asking Coptic priests to read it","By guessing from the pictures","By using a Demotic dictionary","By reading the hieroglyphs first"],"s":["Names recur in the same places in both texts.","Matching those groups gave their sounds."]},{"lv":3,"tf":true,"q":"True or false: scholars still debate which version of the Rosetta decree was drafted first.","s":["The decree names its three scripts.","Which version came first is still debated."]}]},
    {"k":"arch.after-champollion#x","x":[{"q":"Which scholar showed in 1837 that some signs stand for two or three consonants?","a":"Karl Richard Lepsius","w":["Champollion","Thomas Young","Heinrich Brugsch","Auguste Mariette"],"s":["Lepsius published this in 1837.","It was a key step in proving the system."]},{"q":"What did Lepsius find at Tanis in 1866?","a":"The Canopus Decree, a second text in hieroglyphs, Demotic and Greek","w":["The Rosetta Stone","The tomb of Tutankhamun","The Merneptah stela","The Turin King List"],"s":["The Canopus Decree is another trilingual text.","Reading it with Champollion's system proved the system worked."]},{"lv":2,"q":"Why did the Canopus Decree matter after Champollion's death?","a":"Its hieroglyphs could be read with his system and checked against the Greek","w":["It was the first text ever found in Egypt","It showed hieroglyphs were symbols","It was written only in Greek","It disproved Champollion's system"],"s":["A new bilingual text gave an independent test.","The reading matched the Greek."]},{"lv":2,"q":"Who led the Prussian expedition of 1842–1845?","a":"Lepsius","w":["Champollion","Napoleon","Petrie","Carter"],"s":["Lepsius led the Prussian expedition.","Its plates, the Denkmäler, are still used today."]}]}];
  var FUNS = {
    regnal: function (R) { // year n of a reign counted from X BC is about X − (n − 1) BC (lesson: Dating by Texts)
      var k = R.pick([['Ptolemy V', 204], ['Ramesses II', 1279], ['Thutmose III', 1479], ['Psamtik I', 664]]), n = R.int(2, 30), y = k[1] - (n - 1);
      return { q: 'A document is dated to year ' + n + ' of ' + k[0] + '. His reign is counted from ' + k[1] + ' BC, his year 1. In about what year BC was the document written?', num: y,
        s: ['Year 1 is the accession year, so subtract ' + n + ' − 1 = ' + (n - 1) + ', not ' + n + '.', k[1] + ' − ' + (n - 1) + ' = ' + y + ', so about ' + y + ' BC.', 'Regnal years did not start on 1 January, so the result can be a year off.'], h: 'Year 1 is the first year: subtract one less than the year number.' };
    },
    lum: function (R) { // age = total dose ÷ dose per year
      var r = R.pick([2, 3, 4, 5]), age = R.int(1, 9), d = r * age;
      return { q: 'A potsherd has absorbed ' + d + ' grays (Gy) of radiation since it was fired. The dose rate in the sherd and its soil is ' + r + ' Gy per thousand years. About how many years old is it?', num: age * 1000,
        s: ['Age = total dose ÷ dose per year.', d + ' ÷ ' + r + ' = ' + age + ' thousand years, so about ' + (age * 1000).toLocaleString('en-US') + ' years.'], h: 'Divide the total dose by the dose per thousand years.' };
    }
  };
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
  var CFG = {"prefix":"arch.","only":["classical-writers","forgotten","obelisks","napoleon","rosetta","young","champollion","how-cracked","system","after-champollion","collectors","mariette","petrie","seriation","stratigraphy","kv62","recording","relative-absolute","radiocarbon-method","luminescence","text-dates","epigraphy","facsimile","brackets","museums","return-debate","laws","survey","lab-science","nubia-rescue","egyptian-egyptologists","hieratic","hieratic-uses","transcription","late-egyptian","late-texts","demotic-script","demotic-texts","demotic-rosetta","coptic-origins","coptic-alphabet","coptic-extra","coptic-vowels","coptic-dialects","last-hieroglyphs","last-demotic","meroitic"]};
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
