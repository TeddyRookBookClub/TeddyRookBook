/* Embed: a short sentence drill (/embed/lang-drill/?lang=grc|lat&set=gospels|classical).
   The day's set is the same for everyone on a date:
   - gospels: Gospel passage number (day mod P), up to 10 of its verses, from /embed/lang/gos-<grc|lat>.json, with the
     King James Version for the English (public domain; the site's ESV is never used here). Greek Gospel audio is Marilyn
     Phemister's reading, streamed from the Internet Archive with credit; everything else uses the device's own voices.
   - classical: 8 sentences in a row from /embed/lang/cls-<grc|lat>.json (already shuffled), starting at (day × 8) mod N.
   Listen plays the sentence; with "Keep going" on it pauses so you can say it back, shows the English and moves on.
   Tapping a word shows its dictionary form, meaning and grammar (the site's word panel: static/lang/core.js, grammar.js).
   Stores nothing. Needs lang-embed.js, grammar.js and core.js. */
(function (W, D) {
  'use strict';
  var L = W.TRBLang, G = W.Gospels, root = D.getElementById('ld'); if (!L || !G || !root) return;
  var o = L.opts(), grc = o.lang === 'grc', gos = o.set === 'gospels', site = root.getAttribute('data-site') || '/';
  var code = gos ? (grc ? 'g' : 'l') : (grc ? 'G' : 'L'), voice = grc ? 'g' : 'l', cls = grc ? 'grc' : 'lat';
  var $ = function (id) { return D.getElementById(id); }, esc = G.esc;
  var items = [], at = 0, P = new G.Player(), playing = false, works = {};
  L.sources(o.lang + '-' + o.set);
  $('ld-lang').textContent = (grc ? (gos ? 'Koine Greek' : 'Ancient Greek') : 'Latin') + ' · ' + (gos ? 'The Gospels' : 'Classical sentences');
  $('ld-date').textContent = 'Today’s set · ' + L.today();
  if (W.TRBEmbed) W.TRBEmbed.open(site + 'languages/sentences/');

  function fail() { $('ld-title').textContent = 'Today’s sentences didn’t load'; $('ld-tgt').innerHTML = '<a href="' + site + 'languages/sentences/">Open the Sentence Drills on Teddy Rook Book</a>'; }

  L.get((gos ? 'gos-' : 'cls-') + o.lang + '.json').then(function (d) {
    var day = L.day();
    if (code === 'g') G.LEX.g = d.lex; else if (code === 'l') G.LEX.l = d.lex; else G.LEX[code] = d.lex;
    if (gos) {
      var ps = d.passages.map(function (p, i) { return { p: p, v: d.v.filter(function (x) { return x.p === i; }) }; }).filter(function (x) { return x.v.length; });
      // the day's passage; a short one is joined by the next, so a set has at least 6 verses (and at most 10)
      var titles = [], subs = [];
      for (var j = day % ps.length; items.length < 6; j = (j + 1) % ps.length) {
        var pk = ps[j], take = pk.v.slice(0, 10 - items.length), p = pk.p;
        items = items.concat(take); titles.push(p[4]);
        subs.push(G.BOOKS[p[0]] + ' ' + p[1] + ':' + take[0].v + (take.length > 1 ? '–' + take[take.length - 1].v : ''));
      }
      $('ld-title').textContent = titles.join(' · ');
      $('ld-sub').textContent = subs.join('; ') + ' · ' + items.length + ' verses';
    } else {
      works = d.works || {};
      var n = d.s.length, k = 8, s = (day * k) % n;
      for (var i = 0; i < k; i++) items.push(d.s[(s + i) % n]);
      $('ld-title').textContent = grc ? 'Herodotus, Homer and Plutarch' : 'Caesar, Cicero, Virgil and Ovid';
      $('ld-sub').textContent = items.length + ' sentences' + (grc ? ' in older Greek (not New Testament Koine)' : '');
    }
    G.bindWords($('ld-tgt'), function (lang, el) { var it = items[at]; return it && it.t[+el.dataset.i]; }, $('ld-panel'));
    show(0);
  }).catch(fail);

  function show(i) {
    stop();
    at = Math.max(0, Math.min(items.length - 1, i));
    var it = items[at];
    var ref = gos ? G.BOOKS[it.b] + ' ' + it.c + ':' + it.v : (works[it.w] ? works[it.w].a + ', ' + works[it.w].t + ' ' + it.r : it.r);
    $('ld-ref').textContent = ref;
    $('ld-count').textContent = (at + 1) + ' of ' + items.length;
    var t = $('ld-tgt'); t.innerHTML = G.renderWords(code, it.t, {}); t.className = 'ld-tgt ' + cls;
    $('ld-en').textContent = it.en || '';
    $('ld-tr').textContent = gos ? 'King James Version' : (works[it.w] ? 'Translated by ' + works[it.w].tr : '');
    $('ld-enbox').hidden = !$('ld-showen').checked;
    $('ld-prev').disabled = at === 0;
    $('ld-next').textContent = at === items.length - 1 ? 'Start over' : 'Next ⏭';
    $('ld-done').hidden = true;
    $('ld-panel').classList.remove('open');
    $('ld-panel').innerHTML = '<p class="wp-empty">Tap a word to see its dictionary form, meaning and grammar.</p>';
  }
  function text(it) { return code === 'g' ? G.greekText(it.t) : G.latinText(it.t); }
  function play(it) { return code === 'g' && it.a ? P.clip(it.a, 1) : P.speak(text(it), voice, 0.9); }
  function stop() { P.stop(); playing = false; setBtn(); root.classList.remove('is-playing'); }
  function setBtn() { var b = $('ld-play'); b.textContent = playing ? '⏸ Stop' : '▶ Listen'; b.setAttribute('aria-pressed', String(playing)); }
  function run() {
    var it = items[at]; if (!it) return;
    playing = true; setBtn(); root.classList.add('is-playing');
    var tok = P.token;
    play(it).then(function (ok) {
      if (!ok || tok !== P.token) return false;
      if (!$('ld-auto').checked) { $('ld-enbox').hidden = false; return false; }
      var ms = Math.max(2000, Math.min(7000, text(it).length * 70));         // time to say it back
      return P.wait(ms);
    }).then(function (ok) {
      if (!ok || tok !== P.token) { if (tok === P.token) { playing = false; setBtn(); root.classList.remove('is-playing'); } return false; }
      $('ld-enbox').hidden = false;
      return P.wait(2500);
    }).then(function (ok) {
      if (!ok || tok !== P.token) return;
      if (at < items.length - 1) { show(at + 1); run(); }
      else { stop(); $('ld-done').hidden = false; }
    });
  }
  $('ld-play').addEventListener('click', function () { if (playing) stop(); else run(); });
  $('ld-prev').addEventListener('click', function () { show(at - 1); });
  $('ld-next').addEventListener('click', function () { show(at === items.length - 1 ? 0 : at + 1); });
  $('ld-showen').addEventListener('change', function () { $('ld-enbox').hidden = !this.checked; });
  D.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT|BUTTON/.test((e.target && e.target.tagName) || '')) return;
    if (e.key === 'ArrowRight') show(at + 1); else if (e.key === 'ArrowLeft') show(at - 1);
  });
})(window, document);
