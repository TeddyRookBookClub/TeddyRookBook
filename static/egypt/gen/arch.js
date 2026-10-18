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
