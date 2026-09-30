# Data sources and licenses for /lang/data

- `grc-*.json`, `grc-lex.json`: Nestle 1904 Greek New Testament (public domain) with morphology, lemmas and English glosses from MACULA Greek (Clear Bible / Biblica, CC BY 4.0, https://github.com/Clear-Bible/macula-greek) and brief/long definitions from the Dodson Greek Lexicon (public domain).
- `lat-*.json`, `lat-lex.json`: Latin Vulgate Gospels with lemmas, morphology and syntactic relations from the PROIEL Treebank (CC BY-NC-SA 3.0, https://github.com/proiel/proiel-treebank). These derived files are shared under the same CC BY-NC-SA license. Definitions from William Whitaker's WORDS (free to copy).
- `esv.json` and the `en` field in `drills.json`: 499 verses of the ESV® Bible, © 2001 by Crossway, used under Crossway's 500-verse quotation allowance. Do not add more ESV verses without written permission from Crossway.
- Greek audio timings in `drills.json` (`a`: file, start, end in seconds) point into "Audio Greek New Testament" read by Marilyn Phemister (© 2001, free for non-commercial use with credit), streamed from the Internet Archive.

Build scripts live outside the site; ask Claude to regenerate if the verse selection changes.
