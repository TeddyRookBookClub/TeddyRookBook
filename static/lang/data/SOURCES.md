# Data sources and licenses for /lang/data

- `grc-*.json`, `grc-lex.json`: Nestle 1904 Greek New Testament (public domain) with morphology, lemmas and English glosses from MACULA Greek (Clear Bible / Biblica, CC BY 4.0, https://github.com/Clear-Bible/macula-greek) and brief/long definitions from the Dodson Greek Lexicon (public domain).
- `lat-*.json`, `lat-lex.json`: Latin Vulgate Gospels with lemmas, morphology and syntactic relations from the PROIEL Treebank (CC BY-NC-SA 3.0, https://github.com/proiel/proiel-treebank). These derived files are shared under the same CC BY-NC-SA license. Definitions from William Whitaker's WORDS (free to copy).
- `esv.json` and the `en` field in `drills.json`: 499 verses of the ESV® Bible, © 2001 by Crossway, used under Crossway's 500-verse quotation allowance. Do not add more ESV verses without written permission from Crossway.
- Greek audio timings in `drills.json` (`a`: file, start, end in seconds) point into "Audio Greek New Testament" read by Marilyn Phemister (© 2001, free for non-commercial use with credit), streamed from the Internet Archive.

- `cls-lat.json`, `cls-lat-lex.json`, `cls-grc.json`, `cls-grc-lex.json`: classical sentences for the drills.
  - Texts, lemmas and grammar: PROIEL Treebank (Caesar, Gallic War; Cicero, Letters to Atticus; Herodotus; CC BY-NC-SA 3.0) and the Perseus Ancient Greek and Latin Dependency Treebank v2.1 (Cicero, In Catilinam; Virgil, Aeneid 6; Ovid, Metamorphoses 1; Homer, Iliad and Odyssey; Plutarch, Lycurgus and Alcibiades; CC BY-SA 3.0, https://github.com/PerseusDL/treebank_data). Derived files follow the same licenses (CC BY-NC-SA for the PROIEL-based sentences).
  - English: public-domain translations from the Perseus canonical texts (CC BY-SA 4.0 markup, https://github.com/PerseusDL/canonical-latinLit and canonical-greekLit): McDevitte & Bohn (Caesar), Shuckburgh (Atticus), Yonge (Catiline), T. C. Williams (Aeneid), Brookes More (Metamorphoses), Godley (Herodotus, Loeb, modernized by Perseus), Murray (Iliad and Odyssey, Loeb), Perrin (Plutarch, Loeb).
  - Sentences were aligned to the translations automatically (length-based alignment, then a word-overlap check) and chosen greedily so each adds new lemmas, verb forms or noun forms.
  - Greek definitions: Liddell–Scott–Jones via the Perseus Digital Library (PerseusDL/lexica, CC BY-SA 4.0), plus a few hand-written glosses for very common words. Latin definitions: William Whitaker's WORDS.
  - Audio: none bundled; the page uses the device's text-to-speech voices.

- `flash.json` (flashcards): built from the Greek and Latin Gospel files above. Words are ranked by how often they occur in the four Gospels; every word form is attested in the Gospels, with its parsing and an example. Greek–Latin pairs for the three-sided cards were found by comparing parallel verses and then checked by hand; words without a clear single equivalent are left out of those cards. Some Latin glosses were rewritten for their Gospel sense.

Build scripts live outside the site; ask Claude to regenerate if the verse selection changes.
