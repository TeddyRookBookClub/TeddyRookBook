# The Teddy Rook toolkit

The practice engine from [Teddy Rook Book](https://teddyrookbook.com) and the content of twelve of its ladders, to run on your own computer, server or app. Built on {{DATE}} from the site's source.

It comes as-is. There is no support, no promise of updates, and no versions to track. If you rely on it, keep your own copy.

## Try it

Open `index.html` in a browser. Pick a ladder, a course and a topic, and practice. It needs no internet connection.

From a file on disk, browsers won't let the page read the lesson files or the Geography map data. To see those too, serve the folder with any web server, for example:

    python3 -m http.server 8000

and open http://localhost:8000/.

To start on a topic, add its id to the address: `index.html#phys1.average-velocity`.

## What's inside

| Folder or file | What it is |
|---|---|
| `index.html`, `example.js`, `example.css` | The example page. Read `example.js` first: it shows how the pieces fit in about 100 lines. |
| `cfg.js` | Where the files are, and which generator and visual files exist (`MathLadder.cfg`). |
| `graph.js` | Every course and topic, in teaching order, with prerequisites (`TRB_GRAPH`). Topic `url`s point to the topic's page on teddyrookbook.com. |
| `math/core/` | The engine: TeX to MathML (`tex.js`), the answer checker (`check.js`), the answer box (`input.js`), the generator registry (`gen.js`), mastery and review (`engine.js`) and the problem card (`runner.js`). Each file starts with a comment that explains its API. |
| `homeschool/calc/cas.js` | The small computer algebra system the checker uses. |
| `math/viz/`, `<ladder>/viz/` | The visuals: shared ones and each ladder's own kit. |
| `math/gen/`, `<ladder>/gen/` | The problem generators, one file per course, three levels each, with worked steps. |
| `content/<ladder>/topics/` | The topic maps: units, topics, prerequisites. |
| `content/<ladder>/lessons/` | The lessons as blocks (`p`, `key`, `why`, `mistake`, `ex` worked examples, `viz`, `try`, …). `example.js` shows how to draw them. |
| `content/courses.json`, `content/ladders.json` | The courses and ladders. |
| `content/vocab/` | The Vocabulary Ladder's 1,000 words (`words/<topic>.json`: meaning, example, memory hook and a `scene` that `vocab/viz/vocab.js` draws as a picture), the list and the roots. |
| `content/family/units.json` | The Family Study units: one theme for the whole family, with readings, questions, an activity and topic ids for four age groups. |
| `LICENSE`, `CONTENT-LICENSE`, `NOTICE` | The licenses (below). |

The ladders: {{LADDERS}}.

Links inside the lessons and units point to pages on teddyrookbook.com. Some Family Study units also list topics from ladders that aren't in this toolkit (Art, Egyptology and Ancient Scripts); those ids aren't in `graph.js`, so skip them.

## Progress

The engine keeps a learner's progress in the browser's localStorage under `trb-math-v1`. Without storage it keeps going in memory for the visit. To run it in Node (for tests), see the comment at the top of `math/core/engine.js`.

## Licenses

- **Code** (the JavaScript and CSS): MIT, copyright Teddy Rook. See `LICENSE`.
- **Content** (lessons, the generators' question text, topic maps, word lists, units): CC BY-NC 4.0. Not for commercial use; give credit with a link back: *From Teddy Rook Book (https://teddyrookbook.com), CC BY-NC 4.0.* See `CONTENT-LICENSE`.
- **Third-party pieces** (d3-geo, Natural Earth data): see `NOTICE`.

## Embeds instead

If you only want practice on a web page, you don't need this toolkit: teddyrookbook.com has embeds you add with one line of HTML, and they stay up to date by themselves. See https://teddyrookbook.com/developers/.
