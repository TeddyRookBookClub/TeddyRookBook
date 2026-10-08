/* Words met in the games, kept in this browser so the flashcards and the My Progress page can use them.
   TRBWords.log(game, lang, word, english)  lang: 'g' = Greek, 'l' = Latin
   TRBWords.all() -> [{ l, f, e, games: {game: count}, n, t }] newest first
   Stored under localStorage 'trb-words-v1'. */
(function (W) {
  'use strict';
  var KEY = 'trb-words-v1';
  var GAMES = { hero: 'Hero’s Road', mosaic: 'Mosaic Match', thermopylae: 'Thermopylae', teutoburg: 'Teutoburg', thief: 'Time Thief', chess: 'Chess of the Ancients', daily: 'Daily Word Puzzle', alphabet: 'Greek Alphabet', siege: 'Siege', city: 'Streets of Rome and Athens' };
  function read() { try { var d = JSON.parse(W.localStorage.getItem(KEY)); if (d && d.w) return d; } catch (e) { } return { v: 1, w: {} }; }
  function write(d) { try { W.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } }
  function clean(s) { return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
  function log(game, lang, word, eng) {
    word = clean(word); eng = clean(eng); if (!word || (lang !== 'g' && lang !== 'l')) return;
    var d = read(), k = lang + '|' + word, e = d.w[k];
    if (!e) e = d.w[k] = { l: lang, f: word, e: eng, g: {}, n: 0, t: 0 };
    if (eng && (!e.e || e.e.length > eng.length + 30)) e.e = eng;
    e.g[game] = (e.g[game] || 0) + 1; e.n++; e.t = Date.now();
    write(d);
  }
  function all() { var d = read(); return Object.keys(d.w).map(function (k) { return d.w[k]; }).sort(function (a, b) { return b.t - a.t; }); }
  function clear(game) {
    var d = read();
    if (!game) d.w = {};
    else Object.keys(d.w).forEach(function (k) { var e = d.w[k]; if (e.g[game]) { e.n -= e.g[game]; delete e.g[game]; if (!Object.keys(e.g).length) delete d.w[k]; } });
    write(d);
  }
  W.TRBWords = { log: log, all: all, clear: clear, GAMES: GAMES, KEY: KEY };
})(window);
