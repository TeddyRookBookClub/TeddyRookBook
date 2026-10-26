# Teddy Rook Book

Source for **[teddyrookbook.com](https://teddyrookbook.com)**: a free, one-person project for learning at any age: a full school day from classic schoolbooks, Greek and Latin, science you can play with, life skills and the trades, business courses, and the great books.

There's nothing to join or buy: no accounts, ads or sign-ups (the repository's name is older than the site's focus). Anyone can use it: families, classes, or people who just like to learn.

## What's on the site

| Section | What it is |
|---|---|
| [Infographics](https://teddyrookbook.com/infographics/) | One-page visual guides: character maps, book companions, and explainers on faith, science and finance. |
| [Languages](https://teddyrookbook.com/languages/) | Koine Greek and Latin: the Greek alphabet, sentence drills, a Gospel reader and short readings that explain every word, sentence trees, flashcards, and the study companion to the video Greek and Latin with Jerome. Details below. |
| [Games](https://teddyrookbook.com/games/) | Sixteen browser games set in the ancient world, including a daily word puzzle. Details below. |
| [Science Lab](https://teddyrookbook.com/science-lab/) | Thirteen simulations built on real physics, chemistry and biology, each with missions and a lesson with the equations, and two deep-dive units: Newton's Laws of Motion (6 chapters) and The Laws of Thermodynamics (5 chapters). Details below. |
| [Music](https://teddyrookbook.com/music/) | Piano Basics (9 chapters) and Reading Music (12 chapters, with drills), 20 public-domain piano songs with a synced score-and-keyboard player, a metronome and a two-hand rhythm trainer. Guitar (23 chapters), Ukulele (24) and Banjo (23, three-finger and clawhammer), each beginner to intermediate, with about 40 songs in tab and notation in each instrument's own styles (classical studies, blues and fingerpicking; Hawaiian-style and ragtime ukulele; old-time and bluegrass fiddle tunes), a microphone tuner (`/music/tuner/`), a chord finder (`/music/chords/`) and a left-handed view. The fretted kit is in `static/music/fret/` (instruments, chord voicings, tab and chord-diagram drawing, plucked-string synthesis, pitch detection); `node scripts/music/test-fret.js` tests it. The kit in `static/music/kit/` (synthesized piano, keyboard, an SVG notation renderer, the song parser and player), songs in `data/music/songs/*.yaml` (format in the parser's header; `node scripts/music/check-songs.js` validates them), lessons in `static/music/lessons/`, metronome and trainer in `static/music/rhythm/`. |
| [Test Prep](https://teddyrookbook.com/test-prep/) | SAT, ACT and CLT math practice built from the ladders' generators, in current and earlier formats (digital and paper SAT, enhanced and legacy ACT), comparison pages, grammar practice, and the AP map (`data/testprep/`, `static/test-prep/`). |
| [Brain Puzzles](https://teddyrookbook.com/puzzles/) | Printable sheets with answer keys for 21 puzzle families, generated from a sheet code and checked for unique solutions (`static/puzzles/`). |
| [Homeschool](https://teddyrookbook.com/homeschool/) | Free public-domain schoolbooks with step-by-step teaching guides and a "Teach this lesson" mode: Ray's Arithmetic (guides for Primary and Intellectual), McGuffey's Readers and Speller, Webster's Speller, Harvey's Grammar and D'Ooge's Latin (guides for every lesson), plus Latin, Greek, geometry and algebra books to read or download; the old eighth-grade exams with answer notes; a lesson planner (`static/homeschool/planner.js`, subjects in `data/hs_planner.yaml`); and a graphing calculator with algebra and calculus (`static/homeschool/calc/`, no outside libraries). Series pages come from `data/hs_series/`, guides from `data/hs_*.yaml` and `data/rays_*.yaml`, exams from `data/hs_exams.yaml`. |
| [Math Ladder](https://teddyrookbook.com/math/) | Math from Kindergarten through college: 27 courses and 1,305 topics, up through calculus 4, linear algebra, differential equations, discrete math, probability, number theory, complex analysis, numerical analysis, real analysis and abstract algebra, each with a lesson built from first principles, worked examples, visuals for the usual trouble spots, and practice from a problem generator that checks every answer. Mastery-based, with spaced review, checkpoints, a placement check and a skill map. Details below. |
| [Physics Ladder](https://teddyrookbook.com/physics/) | Physics and astronomy on the Math Ladder engine, with shared progress: Physical Science, Physics 1 and 2 (algebra-based), Mechanics with Calculus, Electricity and Magnetism, Waves, Optics and Modern Physics, Astronomy and Astrophysics. 8 courses and 448 topics, each with a lesson, generated practice that checks numbers with units, and the `ph-` visual kit. Details below. |
| [Chemistry Ladder](https://teddyrookbook.com/chemistry/) | Chemistry, General Chemistry 1 and General Chemistry 2 (219 topics, covering AP Chemistry), on the same engine, with the `ch-` visual kit and a case-sensitive chemical-formula answer type. |
| [Earth & Space Ladder](https://teddyrookbook.com/earth-and-space/) | Earth Science (middle school), Weather and Climate, and Geology (180 topics), with the `es-` visual kit. |
| [Economics Ladder](https://teddyrookbook.com/economics/) | Microeconomics, Macroeconomics and Intermediate Microeconomics (186 topics, covering AP Micro and Macro), with the `ec-` visual kit. Also in the Business menu. |
| [Logic Ladder](https://teddyrookbook.com/logic/) | Informal Logic, Traditional Logic and Symbolic Logic (156 topics), with the `lg-` visual kit (argument maps, fallacy passages, syllogism Venn diagrams, the square of opposition, truth tables, a Fitch-style proof checker) and a `prop` answer type that checks typed formulas by equivalence. |
| [Etiquette Ladder](https://teddyrookbook.com/etiquette/) | Manners for Young Children (read aloud), Manners for Growing Up, and Etiquette for Teens and Adults (148 topics), with the `et-` visual kit (illustrated scenes with choices, place settings to build, note builders, introductions, posture, envelopes, a printable manners chart). Present-day American customs, with notes where customs differ. |
| [Egyptology Ladder](https://teddyrookbook.com/egyptology/) and [Ancient Egypt](https://teddyrookbook.com/egypt/) | Ancient Egypt for Young Explorers, History of Ancient Egypt, Middle Egyptian I and II, Religion, Art and Architecture, and Archaeology and Later Scripts (306 topics), with the `eg-` visual kit (hieroglyph words with sign-by-sign breakdowns, cartouches, a Nile map, a dynasty timeline, temple plans, pyramids, scripts), a `translit` answer type for Egyptian transliteration (Unicode or Manuel de Codage), and a hieroglyph font drawn for the site (`static/egypt/fonts/`, OFL). The /egypt/ hub has the full map; the Timeline has an Egypt track. Dates follow Shaw, ed., The Oxford History of Ancient Egypt (2000). |
| [Ancient Scripts Ladder](https://teddyrookbook.com/ancient-scripts/) and [Linear B](https://teddyrookbook.com/languages/linear-b/) | Linear A and Linear B (53 topics): the Bronze Age Aegean, the decipherment, the signs and spelling rules, reading tablets, Mycenaean Greek, and Linear A's undeciphered texts compared with Linear B, with the `sc-` visual kit (sign lines, the syllabic grid, tablets, maps, numerals). Fonts TRB Linear B and TRB Linear A are drawn for the site (`static/scripts/fonts/`, OFL). The Languages area has the decipherment story, sign tables, flashcards, six tablets, a name writer and a typing helper. |
| [Vocabulary Ladder](https://teddyrookbook.com/vocabulary/) | Greek and Latin Roots (40 topics) and Advanced Vocabulary (100 topics of 10 words): 1,000 words, each with a definition, respelling, examples, synonyms, roots, an original memory hook and an illustration drawn by the `vo-` kit from a scene spec (`static/vocab/viz/vocab.js`). Word data in `data/vocab/words/*.json` (`node scripts/vocab/build.js` regenerates the lessons and generators; `check-words.js` validates). Flashcards, quizzes, a word list with a page per word, and a print page for any set of word cards (print or Save as PDF; `scripts/vocab/make-pdf.js --check` checks card fit). |
| [Biology Ladder](https://teddyrookbook.com/biology/) | Life Science for Young Learners, Life Science, High School Biology and Advanced Biology (AP and College) (262 topics), with the `bi-` visual kit (`static/bio/`, data in `data/bio/`) and an AP Biology map. No sex education by design. |
| [American History & Civics Ladder](https://teddyrookbook.com/american-history/) | American History for Young Learners, U.S. History I and II, Civics and Government, Introduction to Law, and Constitutional Law I and II (375 topics), with the `cv-` visual kit (`static/civics/`, data in `data/civics/`) and APUSH and AP Gov maps. Also the full [Federalist Papers](https://teddyrookbook.com/american-history/federalist-papers/), the major [Anti-Federalist](https://teddyrookbook.com/american-history/anti-federalist-papers/) writings and the [ratification debate](https://teddyrookbook.com/american-history/ratification-debate/) (`data/papers/`, `layouts/papers/`). Citizenship-test practice on the official USCIS questions, 2025 and 2008 versions ([page](https://teddyrookbook.com/american-history/citizenship-test/), data in `data/civics/uscis/`). |
| [Writing & Grammar Ladder](https://teddyrookbook.com/writing/) | Handwriting: Print and Cursive, First Writing, Grammar (with Reed–Kellogg diagramming), Usage and Mechanics, Composition, and Rhetoric and Advanced Writing (270 topics), with the `wr-` visual kit (`static/writing/`, data in `data/writing/`) and an AP English Language map. |
| [Brain Games](https://teddyrookbook.com/games/brain-games/) | Mosaic Memory, Coin Match, Numbers in Order, Aqueduct Switches, Oracle's Rule, and Teutoburg's Eagle Hunt and Campaign modes. Progress in `trb-brain-v1`. No claims beyond fun practice. |
| [Harvard Classics Daily](https://teddyrookbook.com/harvard-classics/) | The 366 daily readings of *Fifteen Minutes a Day: The Reading Guide* (P. F. Collier, 1930 edition) with the full text of each day's pages from the Harvard Classics (1909–10), proofread against the scans at the Internet Archive. Data in `data/harvard/` (guide.json and days/MM-DD.json); `scripts/harvard_pages.py` writes the day pages; a calendar, /harvard-classics/today/, the home-page card (`layouts/partials/hc-today.html`), and /harvard-classics/export/, which makes EPUB, PDF (print, up to 92 days at a time) and plain text in the browser from per-month text JSON, with no stored files. |
| [Meal Prep](https://teddyrookbook.com/meal-prep/) | A family meal planner: 59 recipes that scale to the household (adults, teens, children, toddlers), your own recipes from a 494-item grocery catalog plus write-ins, plans from a week to a month with drag and drop, shuffle and leftovers, a shopping list in store packages by aisle, nutrition from USDA FoodData Central (SR Legacy), a prep-day plan, a kids' dinner chart, 72 from-scratch recipes for store items (breads of many kinds including pretzels and sourdough, pasta, butter, tortillas, stock…) that the shopping list can swap in, a tie-in with the Food Garden Planner (grow-it badges, harvest months, plants needed; `data/meals/garden-map.json`), PDF and PNG export, and guides (cooking fats, cinnamon, kitchen differences, label checks, food safety). Data in `data/meals/` (`scripts/meals/check-data.js`, `fetch-nutrition.py`); app in `static/meal-prep/`; saved in the browser (`trb-meals-v1`) with JSON backup. |
| [Debate](https://teddyrookbook.com/debate/) | Learning to debate (18 chapters, including steelman vs strawman), 10 formats with sourced speech times, 50 resolutions with the strongest arguments on both sides, resources for joining or starting a club (including homeschool leagues), a 126-term glossary, and tools: a format-aware timer, flow sheet, case builder, drills and printable ballots (`static/debate/`, data in `data/debate/`, `scripts/debate/check-data.js`). |
| [Library](https://teddyrookbook.com/books/) | A catalog of a home library, with editions, sets and translations, and [reading paths](https://teddyrookbook.com/books/paths/) through it. |
| [Free Books](https://teddyrookbook.com/free-books/) | Search public-domain ebooks (Project Gutenberg, via Gutendex) and audiobooks (LibriVox, via the Internet Archive). Nothing is hosted here; the visitor's browser calls those catalogues directly. |
| [Timeline](https://teddyrookbook.com/timeline/) | The ancient world from the pyramids to the fall of Rome, each event linked to the books, games and readings about it. |
| [Markets](https://teddyrookbook.com/markets/) | Stock screener and charts, economic indicators, Treasury yields and auctions, and calculators. |
| [Business](https://teddyrookbook.com/business/) | Business cases, plus full courses in [Econometrics](https://teddyrookbook.com/business/econometrics/) (17 chapters) and [Game Theory](https://teddyrookbook.com/business/game-theory/) (14 chapters), each chapter with live simulations, worked examples, practice with answers and a quiz, built on the Science Lab unit framework (`data/science_units/econ.yaml` and `gt.yaml`, `layouts/business/econ-*.html` and `gt-*.html`, `static/business/econometrics/` with the tested statistics library `stats.js`, and `static/business/game-theory/`). Business cases: original write-ups of real company stories with the lesson, numbers, timeline, questions and sources, and a card to save as a picture (`data/business_cases.yaml`, `static/business/`). Also “Your tax receipt” (`static/business/receipt.js`): splits an income-tax amount by federal spending, with the main lines from the Treasury's official net outlays by budget function (FiscalData, Monthly Treasury Statement Table 9; negative functions and undistributed offsetting receipts are credits, and lines add up to the amount paid) and the drill-down split in proportion to USAspending.gov obligations. |
| [Resources](https://teddyrookbook.com/resources/) | Links to other free places to learn Latin and Greek, read the great books and explore ancient history. |
| [Videos](https://teddyrookbook.com/videos/) | The site's YouTube videos, one page each with an optional short trailer and links to what goes with them. Add a video to `data/videos.yaml` (keyed by YouTube id); pages come from `content/videos/_content.gotmpl`, and `layouts/_partials/video.html` embeds one anywhere (click to play, youtube-nocookie). |
| [The Trades](https://teddyrookbook.com/trades/) | The next step after Being an Adult 101: courses on how things work and how to fix them: Cars (15 lessons), Plumbing, Electrical, HVAC and Construction (13 each), each with a clickable systems map, interactive diagrams, a troubleshooting finder, a skill ladder, quizzes and a careers lesson with BLS figures. Each course is one data file, `data/trades/<course>.json`, with lesson pages from `content/trades/<course>/_content.gotmpl`, shared templates in `layouts/trades/` and its widgets in `static/trades/<course>/`. |
| [Food Garden Planner](https://teddyrookbook.com/garden/) | Suggests what to grow for a space, climate zone and household, with rough harvests, calories and a crop rotation, plus calculators for laying hens, meat chickens and honeybees and step-by-step guides (`layouts/garden/list.html`, `static/garden/`). Crop, guide and animal data with sources are in `data/garden/`: yields from university extension tables, nutrition from USDA FoodData Central. The "See your garden" pictures (a to-scale plan, a planting calendar from the gardener's own frost dates, weekly harvest, sun and shade with NOAA's solar equations, and day length for hens) are in `static/garden/viz/` with their sources in `data/garden/viz.json` and tests in `scripts/garden/model.test.js`. |
| [Sewing & Knitting](https://teddyrookbook.com/sewing/) | Step-by-step guides for hand sewing, mending, hemming, the sewing machine, knitting and crochet, with the tools explained (hand, old-fashioned and electric), yarn weights and abbreviations. Guides and tools are in `data/sewing.yaml` with sources (extension and 4-H guides, Craft Yarn Council); pages come from `content/sewing/_content.gotmpl`; the stitch diagrams are original SVGs in `layouts/_partials/sew-diagram.html`. |
| [PhotoCraft](https://teddyrookbook.com/photocraft/) | A hosted copy of [PhotoCraft](https://github.com/storytold/photocraft), an open-source image editor by the ArtCraft Team (MIT / Apache-2.0). It runs in the browser; pictures stay on the visitor's device. Not affiliated with Adobe. |

Measurements on the garden, sewing and outdoor pages can show in US units, metric or both (`static/js/units.js` converts text inside any element marked `data-units`; the choice is kept in the browser). Groups of collapsible sections get an Expand all button (in `layouts/_partials/extend_footer.html`).

No accounts, no ads, no tracking. Progress in the drills, flashcards and games is saved only in the visitor's own browser; the [My Progress](https://teddyrookbook.com/progress/) page can save it to a file and load it on another device. The search button in the header searches every page, infographic and timeline entry.

### Languages

- **Study companion:** the free book that goes with the video *Greek and Latin with Jerome*, as a PDF and as pages at `/languages/jerome/`: Part One (foundations), the 124 passages with pronunciation, English and word-by-word notes, the 345 most common Greek and 345 most common Latin words of the New Testament with every form, and the practice sets with their answers. The pages are made from `data/jerome/*.json` by `content/languages/jerome/_content.gotmpl` and `layouts/jerome/`.
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
| Hero's Road | Side-scrolling platformer: Theseus (Greece), Hercules (Rome) or Odysseus, ten levels each, with bosses | Koine Greek (Theseus), Latin (Hercules), Homeric Greek (Odysseus) |
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

### Math Ladder

Twenty-seven courses at `/math/<course>/` (Kindergarten through Grade 7, Pre-Algebra, Algebra 1, Geometry, Algebra 2, Precalculus, Probability and Statistics, Calculus 1–4, Linear Algebra, Differential Equations, Discrete Math, Probability, Number Theory, Complex Analysis, Numerical Analysis, Real Analysis and Abstract Algebra), with 1,305 topic pages at `/math/<course>/<topic>/`, made by `content/math/_content.gotmpl` from:

- `data/math/courses.yaml` (the courses and their order) and `data/math/topics/<course>.json` (units and topics in teaching order, with prerequisites, the skill map behind the placement check and review),
- `data/math/lessons/<course>.json` (each topic's lesson: why it works, worked examples, common mistakes, visuals and a try-it problem),
- `static/math/gen/<course>.js` (a problem generator for every topic at three levels, with full worked steps),
- `static/math/viz/` (shared visuals in `basic.js` and `adv.js`, plus course visuals in `<course>.js`),
- `static/math/core/` (TeX to MathML, the answer checker, the input pad, the mastery and review engine) and `static/math/app/` (the hub, course, topic, practice, placement, map and progress pages).

Learning a topic means three right answers with the last two in a row; reviews come back after 1, 3, 7, 16, 35, 75 and 150 days, and a checkpoint mixes topics every few lessons. Progress is kept in the browser under `trb-math-v1` and can be moved with a save code. `node scripts/math/check-gen.js <course>` tests every generator (many seeds and levels, canonical answers accepted by the checker) and `node scripts/math/check-course.js` checks the skill maps and lessons. `hugo --renderSegments math` builds just these pages.

### The subject ladders (Physics, Chemistry, Earth & Space, Economics, Logic, Etiquette, Egyptology, Ancient Scripts, Vocabulary) and the shared engine

`data/ladders.yaml` lists the subject ladders that run on Math Ladder's engine (`static/math/core/`, `static/math/app/`, `layouts/math/`). Each ladder has `data/<ladder>/courses.yaml`, `topics/`, `lessons/`, generators in `static/<ladder>/gen/`, its visual kit `static/<ladder>/viz/<ladder>.js` (names prefixed, e.g. `ph-`), and pages from `content/<ladder>/`. Progress is shared in `trb-math-v1`, and a topic's prerequisites can sit in another ladder (physics topics send learners to the Math Ladder topic they need first). `/math/graph.json` holds every ladder's topics. `node scripts/math/check-course.js physics` and `check-gen.js <course>` work for any ladder. Answers can carry units (`unit`, `rtol`, significant figures, scientific notation).

### Science Lab

Listed in `data/science_lab.yaml` (shown on `/science-lab/`, in the Education menu, and on the homeschool Science page). Each simulation lives at `/science-lab/<slug>/` (the old `/games/<slug>/` addresses redirect there), with `layouts/science-lab/<slug>.html` and `static/games/<slug>/`, and shares `static/games/lab/` (styles and helpers: storage, canvas sizing, missions). The physics, chemistry or biology model is in its own file that also runs in node, so it can be tested.

| Simulation | What you do |
|---|---|
| Magnetic Bottles for Fusion | An explorer of the exact 3-D MHD equilibria in arXiv:2610.07304, checked numerically, with a live guide to what each setting does and a trade-off map, goal finder (scan plus Nelder–Mead, in a Web Worker) and Pareto chart |
| Book Cart | Swing a chain of 2 to 25 books up from a rolling cart and balance it, or stand every book straight (an inverted pendulum), with live physics, a Lab and an LQR autopilot |
| Orbit Lab | Newton's cannon, Earth orbits, a trip to the Moon and a gravity assist, with Kepler's laws |
| Rocket Builder | Build up to three stages and fly to space, orbit or escape; the rocket equation and Δv losses |
| Trebuchet Workshop | A counterweight trebuchet with a sling (Lagrangian model) and a range finder with air drag |
| Pendulums and Resonance | A pendulum wave, coupled pendulums and a driven swing with its resonance curve |
| Circuit Builder | A breadboard solved by nodal analysis: bulbs, switches, resistors, an LED and meters |
| Optics Bench | Ray tracing with Snell's law and Fresnel reflection: mirrors, lenses, prisms and a raindrop |
| Gas in a Box | Hard-disk atoms at real scale: pressure, temperature, a piston and diffusion |
| Mixing Lab | Indicators and pH, a titration curve, and collision-theory reaction rates |
| Build an Atom | Elements 1 to 36 with their isotopes (NUBASE2020), electron shells, half-life and carbon dating |
| Sky and Solar System | Planet positions from JPL's elements, Moon phases (Meeus), eclipse seasons and tonight's sky |
| Predators and Prey | Grass, rabbits and foxes as agents, beside the Lotka–Volterra equations |

The deep-dive units live at `/science-lab/<unit>/` with one page per chapter. The unit and its chapters are listed in `data/science_units/` (`newton.yaml`, `thermo.yaml`); each chapter has `layouts/science-lab/<unit>-<chapter>.html` and `static/science-lab/<unit>/<chapter>/` (a tested model, the simulation and its styles), and shares the chapter strip, quiz and progress code in `layouts/partials/unit-*.html` and `static/science-lab/unit.*`.

| Unit | Chapters |
|---|---|
| Newton's Laws of Motion | Inertia (Galileo's ramps, a probe in space); F = ma (a cart with live graphs, a hammer and feather on the Moon); action and reaction (skaters, the horse and cart); free-body diagrams (a ramp, an elevator scale, a pulley); momentum and collisions (an air track, crumple zones, billiards); circles and gravity (a whirling string, banked curves, Newton's Moon test, the Cavendish balance) |
| The Laws of Thermodynamics | Temperature and the zeroth law (blocks in contact, the Maxwell–Boltzmann curve); energy and the first law (a piston on a P–V diagram, Joule's paddle wheel); entropy and the second law (a gas run backward, Einstein solids, Maxwell's demon); engines, refrigerators and heat pumps (Carnot and Stirling engines); absolute zero and the third law (a cooling ladder, evaporative cooling, a log-scale thermometer) |

Hero's Road has three settings: Theseus in Greece, Hercules in Rome, and Odysseus sailing home from Troy to Ithaca, with words in Homeric Greek.

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
  business/         Business hub and the business cases (pages made from data/business_cases.yaml).
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

These data files are produced by scripts and shouldn't be edited by hand:

| File | Script |
|---|---|
| `static/lang/data/flash.json` | `python3 scripts/build_flashcards.py static/lang/data` |
| `static/games/imperium/maps.js` | `python3 scripts/build_imperium_maps.py static/games/imperium/maps.js` (needs NumPy and SciPy) |
| `data/rays_primary.yaml` | `python3 scripts/build_rays_primary.py data/rays_primary.yaml` (the Ray's Arithmetic lesson guides; edit the script, not the YAML) |
| `data/rays_intellectual.yaml` | `python3 scripts/build_rays_intellectual.py data/rays_intellectual.yaml` |
| `data/jerome/*.json` | `python3 scripts/jerome/build.py` (reads the study companion PDF in `static/pdfs/`; needs pdfplumber) |
| `static/markets/data/` | `python3 scripts/fetch_market_data.py` (run automatically at each build; not stored in the repository) |

## Sources and licences

The language data comes from openly licensed scholarly projects, and each keeps its own licence. The full list, with licences, is in [`static/lang/data/SOURCES.md`](static/lang/data/SOURCES.md). In short:

- **Greek New Testament:** Nestle 1904 text with MACULA Greek morphology (CC BY 4.0) and the Dodson lexicon (public domain).
- **Latin Vulgate and classical texts:** PROIEL Treebank (CC BY-NC-SA 3.0) and the Perseus treebanks (CC BY-SA 3.0).
- **English Scripture:** 499 verses of the ESV, © Crossway, used under its quotation allowance. Please don't reuse these beyond that.
- **Greek audio:** read by Marilyn Phemister, free for non-commercial use with credit.
- **Study companion** (`static/pdfs/` and `data/jerome/`): Greek text from the SBL Greek New Testament (CC BY 4.0) with MorphGNT word analysis (CC BY-SA 3.0); Latin from the Clementine Vulgate (public domain); Latin forms from Collatinus (GNU GPL v3), corrected by hand. Full credits are on the companion's front page and at the end of the PDF.
- **Garden data:** university extension publications, USDA FoodData Central and the CDC; each crop and guide section lists its sources.
- **Market data:** FRED (Federal Reserve Bank of St. Louis), the US Treasury, and TradingView widgets.

Because some of that data is licensed for non-commercial use only, the site as a whole is non-commercial. The infographics and written content are © Teddy Rook; please link to them rather than re-hosting.

## Contact

[@teddyrookbook on X](https://x.com/teddyrookbook)


Sign Language (`/asl/`): `data/asl.yaml` (the family path, tips and links; link out only, never copy other sites' signs or videos), fingerspelling practice (`layouts/asl/fingerspelling.html`, `static/asl/fingerspell.js`) using the public-domain handshape drawings `static/asl/a.svg`–`z.svg` (Paul Sherman, wpclipart.com, via Wikimedia Commons), and the planner's ASL subject, whose lessons link to Lifeprint's free lessons (`data/hs_lifeprint.yaml`; planner courses with `ext:` take lessons from such a data file).

Videos: list YouTube videos in `data/videos.yaml` and show one with `{{ partial "video.html" "<id>" }}` (a click-to-play picture; the player loads from youtube-nocookie.com only when pressed). Infographics take `video:` in `data/infographics.yaml`; homeschool series take `video:`/`videotitle:`.

Outdoor Skills (`/homeschool/outdoor-skills/`): free ideas for outdoor skills in `data/outdoor_skills.yaml`, a page per skill from `content/homeschool/outdoor-skills/_content.gotmpl`, and optional ticks in `static/homeschool/outdoor.js` (`trb-outdoor-v1`). By design there are no badges, certificates or awards, nothing that looks official, and no first-aid or safety lessons; any safety note must be well-established guidance. Not affiliated with any scouting organization.

Placement check (`/homeschool/placement/`, `data/hs_placement.yaml`, `static/homeschool/placement.js`): parent-judged ladders for reading, spelling and arithmetic; "Put these in the lesson planner" stores `trb-placement-v1`, which `planner.js` applies on load. Practice sheets (`/homeschool/practice-sheets/`, `static/homeschool/sheets.js`): copywork/tracing, dictation, handwriting paper and arithmetic drills; the page template publishes `homeschool/sheets-data.json` with every guided lesson's book passages ("~" lines). Nature Study, Geography and Writing series use the same `hs-series`/`hs-course` templates (`hs_comstock`, `hs_long_geography`, `hs_mother_tongue`, `hs_palmer`).

Simple step-by-step (`static/homeschool/simple.js`): a switch on lesson, course and Actual Reading pages (stored in `trb-hs-simple`) that turns each guide into a day's checklist, splitting step bodies into one action per line ("Say:" lines become read-aloud boxes, "~" lines book quotes, "If…" sentences tips); ticks are kept per lesson in `trb-hs-simple-ticks`. Hannah's curricula have a `daily:` checklist in `data/hs_hannah.yaml`.

Science and History (`/homeschool/science/`, `/homeschool/history/`): series pages from `data/hs_series/science.yaml` and `history.yaml` (science also has an `open:` list of modern openly licensed textbooks, shown by `hs-series.html`), with guided courses `hs_giberne_stars`, `hs_giberne_geology`, `hs_candle`, `hs_millikan`, `hs_fmgreece` and `hs_fmrome`. Science guides mark dangerous old experiments "watch only". The series page can also show `extras:` cards (used for the physics lesson `/homeschool/science/balancing-physics/`, layout `homeschool/balancing.html`).

Book Cart (`/games/book-cart/`): `static/games/bookcart/physics.js` is the simulation (Lagrange's equations for the cart and n books, an implicit Newmark step, energy bookkeeping and a stability analysis that gives each stack's doubling time); `game.js` has the levels, Lab, drawing, controls and autopilot (energy pumping, then balancing), with the level table (`LEVELS`) computed offline: bindings stiff enough for one way to fall, and a slow-motion factor near the top. Progress is stored in `trb-bookcart-v2`; `?lab=<preset>` opens a Lab preset.

Actual Reading (`/homeschool/actual-reading/`): Hannah Ward's free curricula, linked with her permission. `data/hs_hannah.yaml` lists each curriculum and every lesson PDF (hosted on hannahwardeducation.com, not copied here); `content/homeschool/actual-reading/_content.gotmpl` makes a page per curriculum (`layouts/homeschool/actual-reading/`), and `static/homeschool/ar.js` picks, shows and ticks lessons (stored under `ar-<key>` in `trb-homeschool-v1`). Book links are Hannah's own Amazon affiliate links; keep them as they are. In the planner (`data/hs_planner.yaml`) her courses have `ar: <curriculum key>` instead of `data`, and lessons link straight to her PDFs; a subject can have `until` (last default age) and `replaces` (subjects it switches off by default), and a course with `alt: true` is an "also try" choice that the plan never moves into or on from.

The top menu is grouped: each `[[menu.main]]` entry in `hugo.toml` has a `group` (Education, Business, Games, Miscellaneous), and `params.menugroups` sets their order. A group with one item of the same name (Games) shows as a plain link; the others are dropdowns. `params.menugroupurls` gives a group its own page: the group name in the menu links there, the arrow (or hover with a mouse) opens the list, and the page shows every item in the group as tiles (`layouts/_default/group.html`, `layouts/_partials/group-tiles.html`, using each item's `icon` and `note`). Education and Miscellaneous have pages in `content/education/` and `content/miscellaneous/`; Business uses its own hub at `/business/`.
