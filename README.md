# Teddy Rook Book

Source for **[teddyrookbook.com](https://teddyrookbook.com)**: a free, one-person project about great books and big ideas.

It isn't a book club, despite the repository's name: there are no members, meetings or sign-ups. It's a resource anyone can pull from: book clubs, classes, homeschoolers, or people who just like to read.

## What's on the site

| Section | What it is |
|---|---|
| [Infographics](https://teddyrookbook.com/infographics/) | One-page visual guides: character maps, book companions, and explainers on faith, science and finance. |
| [Languages](https://teddyrookbook.com/languages/) | Koine Greek and Latin: the Greek alphabet, sentence drills, a Gospel reader and short readings that explain every word, sentence trees, and flashcards. Details below. |
| [Games](https://teddyrookbook.com/games/) | Sixteen browser games set in the ancient world, including a daily word puzzle. Details below. |
| [Library](https://teddyrookbook.com/books/) | A catalog of a home library, with editions, sets and translations, and [reading paths](https://teddyrookbook.com/books/paths/) through it. |
| [Free Books](https://teddyrookbook.com/free-books/) | Search public-domain ebooks (Project Gutenberg, via Gutendex) and audiobooks (LibriVox, via the Internet Archive). Nothing is hosted here; the visitor's browser calls those catalogues directly. |
| [Timeline](https://teddyrookbook.com/timeline/) | The ancient world from the pyramids to the fall of Rome, each event linked to the books, games and readings about it. |
| [Markets](https://teddyrookbook.com/markets/) | Stock screener and charts, economic indicators, Treasury yields and auctions, and calculators. |
| [Resources](https://teddyrookbook.com/resources/) | Links to other free places to learn Latin and Greek, read the great books and explore ancient history. |
| [PhotoCraft](https://teddyrookbook.com/photocraft/) | A hosted copy of [PhotoCraft](https://github.com/storytold/photocraft), an open-source image editor by the ArtCraft Team (MIT / Apache-2.0). It runs in the browser; pictures stay on the visitor's device. Not affiliated with Adobe. |

No accounts, no ads, no tracking. Progress in the drills, flashcards and games is saved only in the visitor's own browser; the [My Progress](https://teddyrookbook.com/progress/) page can save it to a file and load it on another device. The search button in the header searches every page, infographic and timeline entry.

### Languages

- **Sentence practice:** listen-and-repeat drills from the Gospels (Koine Greek and the Latin Vulgate) and from Caesar, Cicero, Virgil, Ovid, Herodotus, Homer and Plutarch, with English alongside. Every Greek sentence that is not Koine is labelled with its dialect.
- **Gospel reader:** the four Gospels in Greek and Latin; tap any word for its dictionary form, meaning and grammar.
- **Greek alphabet:** six short lessons with quizzes.
- **Readings:** Aesop's fables in Greek, Phaedrus in Latin, the Lord's Prayer and Psalm 23, word by word.
- **Sentence trees:** see how a sentence is built, in English, Greek and Latin, then build trees yourself.
- **Flashcards:** vocabulary ranked by frequency, real word forms, "build the form" cards and three-sided Greek–Latin–English cards, with spaced repetition. Words can come from the Gospels, from one of the classical works, from the games, or from all of them at once. Greek is also shown in Latin letters for pronunciation, and any card can be saved as a picture.

### Games

| Game | What you do | Language |
|---|---|---|
| Imperium | Conquer the ancient world territory by territory, with dice | Latin or Greek, by scenario |
| Ancient Festival Tycoon | Build festival grounds, rise through the ranks, win more land | Greek in Greece, Latin in Rome |
| Mosaic Match | Match-three with 180 pictured words over 30 levels, plus endless practice | Latin or Koine Greek |
| Teutoburg | Maze chase through the Teutoburg Forest, AD 9 | Latin |
| Hero's Road | Side-scrolling platformer: Theseus (Greece), Hercules (Rome) or Odysseus, ten levels each, with bosses | Greek or Latin |
| Thermopylae | Hold the pass as Leonidas while the Persians close in | Greek |
| Time Thief | Chase a thief through history by following clues | Greek or Latin |
| Chess of the Ancients | Chess with Greek or Roman armies | Greek or Latin piece names |
| Tabula | Backgammon, descended from the Roman game | Latin |
| Terni Lapilli | The Roman three-in-a-row that Ovid mentions | Latin |
| Nine Men's Morris | Place, slide and make mills | Latin |
| Latrunculi | The Roman "game of soldiers", in a modern reconstruction | Latin |
| Knucklebones | Augustus's dinner-table game from Suetonius, and a modern variant | Latin |
| Daily Word Puzzle | Guess the day's five-letter word in six tries | Latin or Koine Greek |
| Charioteer | Top-down city game: chariots, errands, races, a thief and the watch | Latin or Koine Greek |
| Siege | Fire ancient siege engines at 25 sieges from history and literature, each with a lesson | Latin or Koine Greek, optional |

Hero's Road has three settings: Theseus in Greece, Hercules in Rome, and Odysseus sailing to the Cyclops' cave.

The board games have a "move statistics" switch that ranks and colour-codes every move, a statistics panel for the game in progress, the rules and history beside the board, and a two-player mode for two people on one device. Terni Lapilli is fully solved, so its statistics are exact; the others are estimates from searches or from playing each move out many times. Words met in the games are collected on the My Progress page and can be studied as flashcards.

## How it's built

The site is static: [Hugo](https://gohugo.io) with the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, plus plain JavaScript and CSS. There is no framework, no build step beyond Hugo, and no server.

GitHub Actions builds and publishes it to GitHub Pages on every push to `main`, and again twice each weekday so the Markets pages get fresh economic data.

The site lives at teddyrookbook.com. The older address, teddyrookbookclub.com, forwards to it.

## Where things live

```
content/            Pages. One Markdown file per book in content/books/.
data/               infographics.yaml (the gallery), sets.yaml (book sets and editions) and resources.yaml (the Resources page).
layouts/            Hugo templates, one folder per section.
static/
  css/              Styles for the home page, library and infographics.
  img/              Images, including the infographics.
  lang/             Sentence drills, Gospel reader and flashcards (code and data).
  games/            The games. Each has its own script and stylesheet; the board games share games/board/.
  js/               Shared scripts, including the Greek pronunciation helper.
  photocraft/       The PhotoCraft browser build (app/) and its licences (licenses/). Third-party code; see NOTICE.txt there.
  markets/          Markets pages: charts, rates, indicators, calculators.
scripts/            Python scripts that generate data files (see below).
themes/PaperMod/    The theme.
```

## Running it locally

You need Hugo 0.147 or newer (the extended edition).

```
git clone https://github.com/TeddyRookBookClub/TeddyRookBookClub.com.git
cd TeddyRookBookClub.com
hugo server
```

Then open http://localhost:1313.

The economic-data charts and the stock-symbol search will be empty until you download their data (no API key needed):

```
python3 scripts/fetch_market_data.py
```

Everything else works without it.

## Common edits

- **Add a book:** run `hugo new books/the-title.md`, then fill in the fields at the top of the new file. `editions` lists each copy (set, volume, translation).
- **Add an infographic:** put `name.jpg` (1600 px wide) and `name-thumb.jpg` (520 px wide) in `static/img/infographics/`, then add an entry to `data/infographics.yaml`.
- **Add a link to the Resources page:** add it to `data/resources.yaml` under the right group.
- **Add a timeline event:** add it to `data/timeline.yaml`; it appears on the Timeline and in the search.
- **Add a reading path:** add it to `data/paths.yaml`, naming each book by its file name in `content/books/`.
- **Add a What's New entry:** add it to the top of `data/whatsnew.yaml`; it also goes out in the feed at /new/index.xml.
- **Add a book set:** add it to `data/sets.yaml`. The `name` must match the `set:` value used in the book files.

## Generated files

Three data files are produced by scripts and shouldn't be edited by hand:

| File | Script |
|---|---|
| `static/lang/data/flash.json` | `python3 scripts/build_flashcards.py static/lang/data` |
| `static/games/imperium/maps.js` | `python3 scripts/build_imperium_maps.py static/games/imperium/maps.js` (needs NumPy and SciPy) |
| `static/markets/data/` | `python3 scripts/fetch_market_data.py` (run automatically at each build; not stored in the repository) |

## Sources and licences

The language data comes from openly licensed scholarly projects, and each keeps its own licence. The full list, with licences, is in [`static/lang/data/SOURCES.md`](static/lang/data/SOURCES.md). In short:

- **Greek New Testament:** Nestle 1904 text with MACULA Greek morphology (CC BY 4.0) and the Dodson lexicon (public domain).
- **Latin Vulgate and classical texts:** PROIEL Treebank (CC BY-NC-SA 3.0) and the Perseus treebanks (CC BY-SA 3.0).
- **English Scripture:** 499 verses of the ESV, © Crossway, used under its quotation allowance. Please don't reuse these beyond that.
- **Greek audio:** read by Marilyn Phemister, free for non-commercial use with credit.
- **Market data:** FRED (Federal Reserve Bank of St. Louis), the US Treasury, and TradingView widgets.

Because some of that data is licensed for non-commercial use only, the site as a whole is non-commercial. The infographics and written content are © Teddy Rook; please link to them rather than re-hosting.

## Contact

[@teddyrookbook on X](https://x.com/teddyrookbook)
