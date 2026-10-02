# Teddy Rook Book

Source for **[teddyrookbookclub.com](https://teddyrookbookclub.com)**: a free, one-person project about great books and big ideas.

Despite the "club" in the address, it isn't a book club. There are no members, meetings or sign-ups. It's a resource anyone can pull from: book clubs, classes, homeschoolers, or people who just like to read.

## What's on the site

| Section | What it is |
|---|---|
| [Infographics](https://teddyrookbookclub.com/infographics/) | One-page visual guides: character maps, book companions, and explainers on faith, science and finance. |
| [Languages](https://teddyrookbookclub.com/languages/) | Koine Greek and Latin: listen-and-repeat sentence drills, a Gospel reader that explains every word, and spaced-repetition flashcards. |
| [Games](https://teddyrookbookclub.com/games/) | Browser games set in the ancient world that teach vocabulary as you play: Imperium, Ancient Festival Tycoon, Teutoburg and Time Thief. |
| [Library](https://teddyrookbookclub.com/books/) | A catalog of a home library, with editions, sets and translations. |
| [Markets](https://teddyrookbookclub.com/markets/) | Stock screener and charts, economic indicators, Treasury yields and auctions, and calculators. |

No accounts, no ads, no tracking. Progress in the drills, flashcards and games is saved only in the visitor's own browser.

## How it's built

The site is static: [Hugo](https://gohugo.io) with the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, plus plain JavaScript and CSS. There is no framework, no build step beyond Hugo, and no server.

GitHub Actions builds and publishes it to GitHub Pages on every push to `main`, and again twice each weekday so the Markets pages get fresh economic data.

## Where things live

```
content/            Pages. One Markdown file per book in content/books/.
data/               infographics.yaml (the gallery) and sets.yaml (book sets and editions).
layouts/            Hugo templates, one folder per section.
static/
  css/              Styles for the home page, library and infographics.
  img/              Images, including the infographics.
  lang/             Sentence drills, Gospel reader and flashcards (code and data).
  games/            The games. Each has its own script and stylesheet.
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
