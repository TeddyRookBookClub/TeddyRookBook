#!/usr/bin/env node
/* Browser tests for the Vocabulary Ladder pages and kit (Playwright + Chromium), against a running build of the site.

   NODE_PATH="$(npm root -g)" node scripts/vocab/test-pages.js [base URL, default http://localhost:1313/]

   1. Every Vocabulary page loads at 1280 and 390 px wide, in the light and dark themes, with no console errors and no
      sideways scrolling: the hub, both course pages, a topic, practice, placement, map, progress, flashcards, quizzes,
      the word list, a word page and the printable book.
   2. In the browser, words fit their boxes: in a sweep of scenes (every cast member speaking, thinking, shouting and
      whispering, labels of many lengths, every prop with words), each line of text lies inside its bubble, tag or sign.
   3. The pages work: flashcards (picture side hides the word, flip, grades saved in localStorage 'trb-vocab-v1', the
      hard-words, root and word-side decks, ?deck= links), quizzes (a round, feedback, score, the timer, misses saved),
      the word list (1,000 rows, search and filters, the card dialog), a word page, the topic lesson and its practice,
      and the print layout (four cards to a sheet).                                                                   */
'use strict';
const { chromium } = require('playwright');
const base = (process.argv[2] || 'http://localhost:1313/').replace(/\/$/, '');
let fails = 0, passes = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else passes++; };
const PATHS = ['/vocabulary/', '/vocabulary/advanced-vocabulary/', '/vocabulary/greek-and-latin-roots/', '/vocabulary/advanced-vocabulary/bene-mal/',
  '/vocabulary/practice/', '/vocabulary/placement/', '/vocabulary/map/', '/vocabulary/progress/', '/vocabulary/flashcards/', '/vocabulary/quiz/',
  '/vocabulary/words/', '/vocabulary/words/benevolent/', '/vocabulary/print/'];
(async () => {
  const b = await chromium.launch();
  // 1. every page, two widths, two themes
  for (const theme of ['light', 'dark']) for (const w of [1280, 390]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 } });
    await c.addInitScript(t => { try { localStorage.setItem('pref-theme', t); } catch (e) { } }, theme);
    const pg = await c.newPage(), errs = [];
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(e.message));
    for (const path of PATHS) {
      errs.length = 0;
      const r = await pg.goto(base + path, { waitUntil: 'load' }); await pg.waitForTimeout(500);
      ok(r && r.ok(), path + ' loads (' + theme + ', ' + w + ')');
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(over <= 0, path + ' no sideways scroll (' + theme + ', ' + w + '): ' + over + ' px');
      ok(!errs.length, path + ' no console errors (' + theme + ', ' + w + '): ' + errs.slice(0, 2).join(' | '));
    }
    await c.close();
  }
  console.log('pages: ' + PATHS.length + ' paths x 2 widths x 2 themes checked');

  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept());
  const store = () => p.evaluate(() => JSON.parse(localStorage.getItem('trb-vocab-v1') || '{}'));

  // 2. text fits its box, measured by the browser
  await p.goto(base + '/vocabulary/words/benevolent/'); await p.waitForFunction(() => window.MathLadder && MathLadder.vocab);
  const fit = await p.evaluate(() => {
    const VO = MathLadder.vocab, N = VO.NAMES, lines = ['Yes!', 'Free bread for all!', 'I wish them all very bad luck today!', 'Somebody please pass the salt, the pepper and the mustard.'];
    const scenes = [];
    N.cast.forEach((c, i) => ['say', 'think', 'shout', 'whisper'].forEach((k, j) => scenes.push({ bg: 'park', cast: [{ who: c, x: [12, 50, 88][(i + j) % 3], [k]: lines[(i + j) % 4] }], labels: [{ text: lines[(i + j + 1) % 4].toUpperCase().slice(0, 28), x: 50, y: 92 }], alt: 'x' })));
    N.props.forEach(pk => scenes.push({ bg: 'room', props: [{ kind: pk, x: 50, text: 'WORDS' }], alt: 'x' }));
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:0;top:0;width:400px;line-height:0'; document.body.appendChild(host);
    const bad = []; let n = 0;
    scenes.forEach((sc, si) => {
      host.innerHTML = VO.sceneSVG(sc); const svg = host.querySelector('svg');
      svg.querySelectorAll('text').forEach(t => {
        // the box: the nearest shape before the text whose bounds hold the text's middle (a bubble, tag or sign)
        const S = svg.getBoundingClientRect(), box = el => { const r = el.getBoundingClientRect(); return { x: r.left - S.left, y: r.top - S.top, width: r.width, height: r.height }; };
        const a = box(t), cx = a.x + a.width / 2, cy = a.y + a.height / 2; let prev = t.previousElementSibling, bx = null, k = 0;
        for (; prev && k < 8; prev = prev.previousElementSibling, k++) { if (prev.tagName === 'text') continue; const q = box(prev); if (cx >= q.x && cx <= q.x + q.width && cy >= q.y && cy <= q.y + q.height && q.width > 10) { bx = q; break; } }
        n++; const slack = 2.5;
        if (!bx) { bad.push('no box behind "' + t.textContent + '"'); return; }
        if (a.x < bx.x - slack || a.y < bx.y - slack || a.x + a.width > bx.x + bx.width + slack || a.y + a.height > bx.y + bx.height + slack)
          bad.push((sc.cast ? sc.cast[0].who + ' ' + Object.keys(sc.cast[0]).filter(k => /say|think|shout|whisper/.test(k))[0] : 'prop ' + sc.props[0].kind) + ': "' + t.textContent + '" ' + Math.round(a.width) + ' in ' + Math.round(bx.width));
        const vb = { w: 400, h: 300 };
        if (a.x < -1 || a.y < -1 || a.x + a.width > vb.w + 1 || a.y + a.height > vb.h + 1) bad.push('outside the frame: "' + t.textContent + '" (' + (sc.props ? sc.props[0].kind : sc.cast[0].who) + ' y ' + Math.round(a.y) + ' x ' + Math.round(a.x) + ')');
      });
    });
    host.remove(); return { n: n, bad: bad };
  });
  ok(fit.n > 300, 'text-fit sweep measured ' + fit.n + ' lines');
  ok(!fit.bad.length, 'every line fits its bubble, tag or sign: ' + fit.bad.slice(0, 6).join('; ') + (fit.bad.length > 6 ? ' … (' + fit.bad.length + ')' : '')); if (fit.bad.length) console.log(fit.bad.join('\n'));

  // flashcards
  await p.goto(base + '/vocabulary/flashcards/'); await p.waitForFunction(() => window.__vfStarted);
  ok(await p.$('#vf-card .vo-scene-svg'), 'flashcards: picture side shows a scene');
  ok(!(await p.textContent('#vf-card')).match(/benevolent|benefactor|beneficial|benign|beneficiary|malevolent|malicious|malady|malign|malcontent/i), 'flashcards: picture side hides the word');
  await p.click('#vf-flip'); ok(await p.isVisible('#vf-grade'), 'flashcards: flip shows grade buttons');
  ok(await p.$('#vf-card .vo-def'), 'flashcards: back shows the meaning');
  await p.click('.vg3');
  let s = await store(); ok(Object.keys(s.cards || {}).length === 1, 'flashcards: Good is saved');
  await p.keyboard.press(' '); await p.keyboard.press('1');
  s = await store(); ok(Object.values(s.cards).some(c => c.g === 1), 'flashcards: Again (key 1) is saved');
  await p.click('#vf-kind button[data-v="hard"]'); await p.waitForTimeout(100);
  ok(await p.$('#vf-card'), 'flashcards: hard-words deck has a card');
  await p.click('#vf-kind button[data-v="root"]'); await p.waitForTimeout(100);
  ok((await p.$$eval('#vf-which option', o => o.length)) > 30, 'flashcards: root decks listed');
  await p.click('#vf-dir button[data-v="w"]'); await p.waitForTimeout(100);
  ok(await p.$('#vf-card .vop-wordface, #vf-card.vop-card .vo-wordside, #vf-card .vo-card-word'), 'flashcards: word side');
  await p.goto(base + '/vocabulary/flashcards/?deck=topic:bene-mal'); await p.waitForFunction(() => window.__vfStarted);
  ok((await p.$eval('#vf-which', x => x.value)) === 'bene-mal', 'flashcards: ?deck= link picks the deck');

  // quiz
  await p.goto(base + '/vocabulary/quiz/'); await p.waitForFunction(() => window.__vqStarted);
  for (const v of ['roots']) await p.click('#vq-types button[data-v="' + v + '"]');
  await p.click('#vq-go'); let n = 0;
  while (await p.$('#vq-run .vop-opt')) {
    const opts = await p.$$('#vq-run .vop-opt:not([disabled])'); if (!opts.length) break;
    await opts[n % opts.length].click(); n++;
    ok(await p.isVisible('#vq-fb'), 'quiz: feedback after answer ' + n);
    await p.click('#vq-next'); if (n > 12) break;
  }
  ok(await p.$('#vq-run .vop-result'), 'quiz: result after ' + n + ' questions');
  s = await store(); ok(s.quiz && s.quiz.last && s.quiz.last.n === n, 'quiz: last score saved');
  // the timer runs out
  await p.click('#vq-setup-b'); await p.selectOption('#vq-t', '15'); await p.click('#vq-go');
  await p.waitForSelector('#vq-fb.no', { timeout: 20000 });
  ok((await p.textContent('#vq-fb')).includes('Time is up'), 'quiz: timer runs out');
  await p.click('#vq-quit'); ok(await p.$('#vq-run .vop-result'), 'quiz: end early shows result');
  s = await store(); ok(Object.keys(s.qmiss || {}).length > 0, 'quiz: misses saved for hard words');
  await p.click('#vq-setup-b'); await p.selectOption('#vq-t', '0');
  // check every kind of question renders for every word
  const kinds = await p.evaluate(() => {
    const VO = MathLadder.vocab, R = MathLadder.vocabPages.rand(), out = {};
    VO.list().forEach(r => { const e = VO.entry(r.w); if (!e) return; ['meaning', 'word', 'hook', 'tf', 'cloze', 'cloze3', 'synonym', 'antonym', 'usage', 'type', 'roots'].forEach(k => { for (let i = 0; i < 5; i++) { const pr = VO.gen.make(k, e, VO.entries(e.topic), R); out[k] = (out[k] || 0) + (pr ? 1 : 0); } }); });
    return out;
  });
  ok(Object.keys(kinds).filter(k => kinds[k] > 0).length >= 10, 'quiz: at least 10 question kinds work');

  // words
  await p.goto(base + '/vocabulary/words/'); await p.evaluate(() => localStorage.removeItem('trb-vocab-v1')); await p.reload();
  await p.waitForTimeout(400);
  ok((await p.$$eval('#vw-table tbody tr', r => r.length)) === 1000, 'words: 1000 rows');
  await p.fill('#vw-q', 'mal'); await p.waitForTimeout(100);
  const vis = await p.$$eval('#vw-table tbody tr', r => r.filter(x => !x.hidden).length);
  ok(vis > 5 && vis < 60, 'words: search "mal" shows ' + vis);
  await p.fill('#vw-q', ''); await p.selectOption('#vw-level', '10'); await p.waitForTimeout(100);
  ok((await p.$$eval('#vw-table tbody tr', r => r.filter(x => !x.hidden).length)) === 100, 'words: level 10 has 100');
  await p.selectOption('#vw-level', ''); await p.selectOption('#vw-root', 'bene'); await p.waitForTimeout(100);
  ok((await p.$$eval('#vw-table tbody tr', r => r.filter(x => !x.hidden).length)) >= 5, 'words: root filter');
  await p.selectOption('#vw-root', ''); await p.check('#vw-ready'); await p.waitForTimeout(100);
  const readyN = await p.$$eval('#vw-table tbody tr', r => r.filter(x => !x.hidden).length);
  ok(readyN >= 10, 'words: finished cards ' + readyN);
  await p.click('.vop-wl[data-w="malady"]'); await p.waitForTimeout(200);
  ok(await p.isVisible('#vw-dlg .vo-scene-svg'), 'words: dialog shows the card');
  const topicHref = await p.$eval('#vw-dlg .vop-dlg-links a:last-child', a => a.getAttribute('href'));
  ok(/advanced-vocabulary\/bene-mal\/$/.test(topicHref), 'words: dialog topic link ' + topicHref);
  await p.keyboard.press('Escape');

  // word page
  await p.goto(base + '/vocabulary/words/malady/'); await p.waitForTimeout(300);
  ok(await p.$('.vo-card .vo-scene-svg'), 'word page: card with scene');
  const r2 = await p.goto(base + '/vocabulary/words/malcontent/'); ok(r2.ok(), 'word page: malcontent');

  // topic lesson and practice
  await p.goto(base + '/vocabulary/advanced-vocabulary/bene-mal/'); await p.waitForTimeout(800);
  ok((await p.$$('.vo-card')).length >= 10, 'lesson: ten word cards');
  ok((await p.$$('.vo-tree')).length >= 1, 'lesson: root trees');
  ok((await p.textContent('.mlp-try .mlp-q')).trim().length > 10, 'lesson: the try-it problem shows');
  await p.waitForSelector('.mlp-practice .mlp-q', { timeout: 10000 }).catch(() => null);
  ok(await p.$('.mlp-practice .mlp-q'), 'lesson: practice shows a problem');

  // print
  for (const q of ['?vol=1', '?vol=all&size=a4']) {
    await p.goto(base + '/vocabulary/print/' + q); await p.waitForFunction(() => window.__voPrintReady, null, { timeout: 30000 });
    const nc = await p.$$eval('.vo-card-print', x => x.length), ns = await p.$$eval('.vop-sheet', x => x.length);
    ok(nc >= 10 && ns >= Math.ceil(nc / 4), 'print ' + q + ': ' + nc + ' cards on ' + ns + ' sheets');
  }
  ok(!errs.length, 'no console errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log((fails ? 'FAILED ' + fails + ', ' : '') + 'passed ' + passes + ' checks'); process.exit(fails ? 1 : 0);
})();
