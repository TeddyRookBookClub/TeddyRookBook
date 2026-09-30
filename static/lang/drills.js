/* Sentence drills: Glossika-style listening in English, Latin and Greek.
   Sources: the Gospels (Greek + Vulgate Latin, 499 verses) and classical authors
   (Latin: Caesar, Cicero, Virgil, Ovid; Greek: Herodotus, Homer). */
(function (W, D) {
  'use strict';
  var G = W.Gospels, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var root = $('#drills'); if (!root) return;

  var LANGS = {
    en: { name: 'English', short: 'EN' },
    g: { name: 'Greek', short: 'ΕΛΛ' },
    l: { name: 'Latin', short: 'LAT' }
  };
  var STUDY = {
    lat: { name: 'Latin', langs: ['en', 'l'] },
    grc: { name: 'Greek', langs: ['g', 'en'] },
    both: { name: 'Latin & Greek', langs: ['g', 'en', 'l'] }
  };
  var PREF_KEY = 'trb-gospels-prefs';
  var prefs = { study: null, order: ['g', 'en', 'l'], red: true, show: { en: true, g: true, l: true }, play: { en: true, g: true, l: true },
    inc: { g: true, l: true }, speed: 1, gap: 2, reps: 1, src: 'ALL', book: 'ALL', passage: -1, mode: 'shuffle', text: 'always' };
  try { var sp = JSON.parse(W.localStorage.getItem(PREF_KEY)); if (sp) for (var k in sp) prefs[k] = sp[k]; } catch (e) { }
  if (!prefs.inc) prefs.inc = { g: true, l: true };
  if (prefs.order.length !== 3) prefs.order = ['g', 'en', 'l'];
  function savePrefs() { try { W.localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { } }

  var data, cls = { L: null, G: null }, items = [], universe = [], pool = [], bag = [], history = [], hi = -1, cur = null, playing = false;
  var player = new G.Player(), progress = G.loadProgress(), panel = $('#word-panel'), picker = $('#study-pick');
  var ready = Promise.all([G.getJSON('drills.json'), G.loadLex()]).then(function (r) { data = r[0]; });

  // ---------- choosing what to study ----------
  function showPicker() {
    player.stop(); playing = false; setPlayBtn();
    $$('[data-study]', picker).forEach(function (b) { b.classList.toggle('last', b.dataset.study === prefs.study); });
    picker.hidden = false; root.classList.add('picking');
    var f = $('[data-study].last', picker) || $('[data-study]', picker); if (f) f.focus();
  }
  $$('[data-study]', picker).forEach(function (b) {
    b.addEventListener('click', function () { choose(b.dataset.study); });
  });
  $('#change-study').addEventListener('click', showPicker);
  function choose(study) {
    prefs.study = study; savePrefs();
    picker.hidden = true; root.classList.remove('picking'); root.classList.add('loading');
    var need = [];
    if (study !== 'grc' && !cls.L) need.push(G.loadClassics('L').then(function (d) { cls.L = d; }));
    if (study !== 'lat' && !cls.G) need.push(G.loadClassics('G').then(function (d) { cls.G = d; }));
    ready.then(function () { return Promise.all(need); }).then(function () {
      buildItems(); buildFilters(); buildLangRows(); rebuildPool(); history = []; hi = -1; cur = null; updateStats();
      $('#study-name').textContent = STUDY[study].name;
      root.dataset.study = study;
      next(false);
      root.classList.remove('loading');
    }).catch(function (e) { root.classList.remove('loading'); $('#stage-rows').innerHTML = '<p class="err">Could not load the lesson data (' + G.esc(e.message) + ').</p>'; });
  }

  // ---------- items ----------
  // gospel item: { k:'gos', v } ; classical item: { k:'cls', lang:'L'|'G', s, work }
  function buildItems() {
    items = data.verses.map(function (v, i) { return { k: 'gos', v: v, id: v.b + v.c + ':' + v.v, n: i }; });
    ['L', 'G'].forEach(function (lg) {
      if (!cls[lg] || (prefs.study === 'lat' && lg === 'G') || (prefs.study === 'grc' && lg === 'L')) return;
      cls[lg].s.forEach(function (s) { items.push({ k: 'cls', lang: lg, s: s, work: cls[lg].works[s.w], id: s.w + ' ' + s.r }); });
    });
    universe = items;
  }
  function langsNow() { return STUDY[prefs.study].langs; }
  function has(it, k) {
    if (k === 'en') return true;
    if (it.k === 'gos') return true;
    return (it.lang === 'L' && k === 'l') || (it.lang === 'G' && k === 'g');
  }
  function toks(it, k) { return it.k === 'gos' ? (k === 'g' ? it.v.g : it.v.l) : it.s.t; }
  function code(it, k) { return it.k === 'gos' ? k : it.lang; }
  function included(k) { return prefs.study !== 'both' || k === 'en' || prefs.inc[k] !== false; }
  function sub(it, k) {
    if (it.k === 'gos') return { en: 'ESV', g: 'Westcott–Hort reading', l: 'Vulgate' }[k];
    if (k === 'en') return 'tr. ' + it.work.tr.replace(/\s*\(.*$/, '');
    return it.work.a + ', ' + it.work.la;
  }

  // ---------- filters ----------
  function buildFilters() {
    var ss = $('#f-src'), bs = $('#f-book'), ps = $('#f-passage');
    var works = [];
    ['L', 'G'].forEach(function (lg) {
      if (!cls[lg] || (prefs.study === 'lat' && lg === 'G') || (prefs.study === 'grc' && lg === 'L')) return;
      Object.keys(cls[lg].works).forEach(function (w) { works.push([w, cls[lg].works[w]]); });
    });
    ss.innerHTML = '<option value="ALL">All sources</option><option value="GOS">The Gospels (499 verses)</option><option value="CLS">All classical authors</option>' +
      works.map(function (w) { return '<option value="' + w[0] + '">' + G.esc(w[1].a + ': ' + w[1].t) + ' (' + w[1].n + ')</option>'; }).join('');
    ss.value = prefs.src; if (ss.value !== prefs.src) { prefs.src = 'ALL'; ss.value = 'ALL'; }
    bs.value = prefs.book;
    function fillPassages() {
      ps.innerHTML = '<option value="-1">All passages</option>' + data.passages.map(function (p, i) {
        if (prefs.book !== 'ALL' && p[0] !== prefs.book) return '';
        return '<option value="' + i + '">' + G.BOOKS[p[0]] + ' ' + p[1] + ':' + p[2] + '–' + p[3] + ' · ' + G.esc(p[4]) + '</option>';
      }).join('');
      ps.value = String(prefs.passage); if (ps.value !== String(prefs.passage)) { prefs.passage = -1; ps.value = '-1'; }
    }
    function syncGos() { $('#gos-filters').hidden = prefs.src !== 'GOS'; }
    fillPassages(); syncGos();
    ss.onchange = function () { prefs.src = ss.value; syncGos(); savePrefs(); rebuildPool(); next(false); };
    bs.onchange = function () { prefs.book = bs.value; prefs.passage = -1; fillPassages(); savePrefs(); rebuildPool(); next(false); };
    ps.onchange = function () { prefs.passage = +ps.value; savePrefs(); rebuildPool(); next(false); };
    $$('[name="mode"]').forEach(function (r) {
      r.checked = r.value === prefs.mode;
      r.onchange = function () { prefs.mode = r.value; savePrefs(); rebuildPool(); };
    });
  }
  function rebuildPool() {
    pool = [];
    items.forEach(function (it, i) {
      if (it.k === 'gos') {
        if (prefs.src !== 'ALL' && prefs.src !== 'GOS') return;
        if (prefs.src === 'GOS') {
          if (prefs.passage >= 0) { if (it.v.p !== prefs.passage) return; }
          else if (prefs.book !== 'ALL' && it.v.b !== prefs.book) return;
        }
        if (prefs.passage < 0 && it.v.g.length < 5) return; // skip very short lines unless a passage is chosen
      } else {
        if (prefs.src === 'GOS') return;
        if (prefs.src !== 'ALL' && prefs.src !== 'CLS' && prefs.src !== it.s.w) return;
      }
      // in "both" mode a sentence needs at least one included language
      var any = langsNow().some(function (k) { return k !== 'en' && has(it, k) && included(k); });
      if (!any) return;
      pool.push(i);
    });
    bag = [];
    $('#pool-count').textContent = pool.length + ' sentence' + (pool.length === 1 ? '' : 's');
    if (!pool.length) { cur = null; $('#stage-rows').innerHTML = '<p class="err">No sentences match. Turn a language back on or choose another source.</p>'; }
  }
  function draw() {
    if (prefs.mode === 'order') {
      var pos = cur == null ? -1 : pool.indexOf(cur);
      return pool[(pos + 1) % pool.length];
    }
    if (!bag.length) { bag = pool.slice(); for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = bag[i]; bag[i] = bag[j]; bag[j] = t; } if (bag[bag.length - 1] === cur && bag.length > 1) bag.unshift(bag.pop()); }
    return bag.pop();
  }

  // ---------- language rows ----------
  function orderNow() { var ls = langsNow(); return prefs.order.filter(function (k) { return ls.indexOf(k) >= 0; }); }
  function buildLangRows() {
    var box = $('#lang-order'), ord = orderNow(), both = prefs.study === 'both';
    box.innerHTML = ord.map(function (k, i) {
      var L = LANGS[k], off = !included(k);
      return '<li class="lo-item lo-' + k + (off ? ' lo-off' : '') + '" data-k="' + k + '">' +
        '<span class="lo-n">' + (i + 1) + '</span><span class="lo-name">' + L.name + '</span>' +
        (both && k !== 'en' ? '<label class="tgl" title="Include this language"><input type="checkbox" data-t="inc" ' + (off ? '' : 'checked') + '><span>On</span></label>' : '') +
        '<label class="tgl" title="Show text"><input type="checkbox" data-t="show" ' + (prefs.show[k] ? 'checked' : '') + (off ? ' disabled' : '') + '><span>Text</span></label>' +
        '<label class="tgl" title="Play audio"><input type="checkbox" data-t="play" ' + (prefs.play[k] ? 'checked' : '') + (off ? ' disabled' : '') + '><span>Audio</span></label>' +
        '<span class="lo-move"><button type="button" data-mv="-1" aria-label="Move ' + L.name + ' earlier" ' + (i === 0 ? 'disabled' : '') + '>▲</button>' +
        '<button type="button" data-mv="1" aria-label="Move ' + L.name + ' later" ' + (i === ord.length - 1 ? 'disabled' : '') + '>▼</button></span></li>';
    }).join('');
    $$('input', box).forEach(function (inp) {
      inp.addEventListener('change', function () {
        var k = inp.closest('li').dataset.k;
        if (inp.dataset.t === 'inc') {
          prefs.inc[k] = inp.checked; savePrefs(); buildLangRows(); rebuildPool();
          if (cur == null || pool.indexOf(cur) < 0) { history = []; hi = -1; next(false); } else renderStage();
          return;
        }
        prefs[inp.dataset.t][k] = inp.checked; savePrefs(); renderStage();
      });
    });
    $$('button[data-mv]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var ordNow = orderNow(), k = b.closest('li').dataset.k, i = ordNow.indexOf(k), j = i + (+b.dataset.mv);
        var other = ordNow[j]; if (!other) return;
        var a = prefs.order.indexOf(k), c = prefs.order.indexOf(other);
        prefs.order[a] = other; prefs.order[c] = k; savePrefs(); buildLangRows(); renderStage();
      });
    });
  }

  // ---------- stage ----------
  function rowsFor(it) { return orderNow().filter(function (k) { return has(it, k) && included(k); }); }
  function renderStage(activeLang) {
    if (cur == null) return;
    var it = items[cur], paused = !playing;
    if (it.k === 'gos') {
      $('#st-ref').textContent = G.refLabel(it.v.b, it.v.c, it.v.v);
      $('#st-title').textContent = data.passages[it.v.p][4];
    } else {
      $('#st-ref').textContent = it.work.a + ', ' + it.work.t + ' ' + it.s.r;
      $('#st-title').textContent = it.work.la;
    }
    var h = '';
    rowsFor(it).forEach(function (k) {
      var show = prefs.show[k] || paused;
      var hide = !show || (prefs.text === 'after' && playing && !spoken[k]);
      var body, c = code(it, k);
      if (k === 'en') body = it.k === 'gos' ? G.renderEnglish(it.v.en, it.v.r) : G.esc(it.s.en);
      else body = G.renderWords(c, toks(it, k), { interlinear: paused && $('#interlinear').checked });
      h += '<div class="row row-' + k + (activeLang === k ? ' speaking' : '') + (hide ? ' veiled' : '') + '" data-k="' + k + '">' +
        '<div class="row-lab"><b>' + LANGS[k].short + '</b><small>' + G.esc(sub(it, k)) + '</small>' +
        '<button type="button" class="say" data-say="' + k + '" aria-label="Play ' + LANGS[k].name + '">▶</button></div>' +
        '<div class="row-txt ' + (k === 'g' ? 'grc' : k === 'l' ? 'lat' : '') + '">' + body + '</div></div>';
    });
    $('#stage-rows').innerHTML = h;
    root.classList.toggle('is-paused', paused);
    $$('.say', $('#stage-rows')).forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); playOne(b.dataset.say); });
    });
  }
  var spoken = {};
  G.bindWords($('#stage-rows'), function (lang, el) {
    var it = items[cur]; if (!it) return null;
    var k = lang === 'L' || lang === 'l' ? 'l' : 'g';
    return toks(it, k)[+el.dataset.i];
  }, panel);

  function next(autoplay) {
    if (!pool.length) return;
    if (hi < history.length - 1) { hi++; cur = history[hi]; }
    else { cur = draw(); history.push(cur); if (history.length > 200) history.shift(); hi = history.length - 1; }
    spoken = {}; panel.classList.remove('open'); panel.innerHTML = panelEmpty;
    renderStage();
    if (autoplay) runItem();
  }
  function prev() {
    if (hi <= 0) return;
    player.stop(); hi--; cur = history[hi]; spoken = {}; renderStage(); if (playing) runItem();
  }
  var panelEmpty = '<p class="wp-empty">Pause, then tap any Greek or Latin word to see its dictionary form, meaning and grammar.</p>';

  // ---------- playback ----------
  function textFor(it, k) {
    if (k === 'en') return it.k === 'gos' ? it.v.en : it.s.en;
    if (it.k === 'gos' && k === 'g') return G.greekText(it.v.g);
    return G.latinText(toks(it, k));
  }
  function say(it, k) {
    var rate = prefs.speed;
    if (k === 'g' && it.k === 'gos' && it.v.a) return player.clip(it.v.a, rate);
    if (k === 'g') return player.speak(textFor(it, 'g'), 'g', rate);
    return player.speak(textFor(it, k), k === 'en' ? 'en' : 'l', rate * (k === 'l' ? 0.9 : 1));
  }
  var creditSpoken = false;
  function runItem() {
    var it = items[cur], order = rowsFor(it).filter(function (k) { return prefs.play[k]; });
    var mine = cur, t0 = Date.now();
    var chain = Promise.resolve(true);
    if (!creditSpoken && prefs.play.en && it.k === 'gos') {
      creditSpoken = true;
      chain = chain.then(function () { return player.speak('English Scripture quotations are from the E S V Bible.', 'en', 1.05); }).then(function (ok) { return ok && player.wait(500); });
    }
    order.forEach(function (k) {
      var reps = k === 'en' ? 1 : prefs.reps;
      for (let r = 0; r < reps; r++) {
        chain = chain.then(function (ok) {
          if (!ok || mine !== cur || !playing) return false;
          renderStage(k); return say(it, k).then(function (ok2) { spoken[k] = true; return ok2; });
        }).then(function (ok) { return ok && playing && player.wait(r < reps - 1 ? 600 : 700 / Math.max(1, prefs.speed / 1.5)); });
      }
    });
    chain.then(function (ok) {
      if (!ok || !playing || mine !== cur) return;
      renderStage();
      markReviewed(it, (Date.now() - t0) / 1000);
      return player.wait(prefs.gap * 1000).then(function (ok2) { if (ok2 && playing && mine === cur) next(true); });
    });
  }
  function playOne(k) {
    player.stop(); playing = false; setPlayBtn();
    var it = items[cur]; renderStage(k);
    say(it, k).then(function () { renderStage(); });
  }
  function setPlayBtn() {
    var b = $('#btn-play'); b.classList.toggle('on', playing);
    b.setAttribute('aria-label', playing ? 'Pause' : 'Play'); $('.lbl', b).textContent = playing ? 'Pause' : 'Play';
    root.classList.toggle('is-paused', !playing);
  }
  function togglePlay() {
    if (cur == null) return;
    if (playing) { playing = false; player.stop(); setPlayBtn(); renderStage(); return; }
    playing = true; setPlayBtn(); panel.classList.remove('open'); spoken = {}; renderStage(); runItem();
  }

  // ---------- progress ----------
  function markReviewed(it, secs) {
    progress.seen[it.id] = (progress.seen[it.id] || 0) + 1; progress.total++; progress.seconds += secs;
    G.saveProgress(progress); G.sessionCount(1); updateStats(true);
  }
  var MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2000, 3000];
  function updateStats(bump) {
    var uniq = universe.filter(function (it) { return progress.seen[it.id]; }).length, sess = G.sessionCount(0), all = universe.length || 1;
    $('#s-session').textContent = sess; $('#s-total').textContent = progress.total;
    $('#s-unique').textContent = uniq; $('#s-of').textContent = 'of ' + universe.length + ' heard'; $('#s-min').textContent = Math.round(progress.seconds / 60);
    var pct = Math.min(1, uniq / all);
    $('#ring').style.setProperty('--p', (pct * 100).toFixed(1));
    $('#ring-lbl').textContent = (pct > 0 && pct < 0.01 ? '<1' : Math.round(pct * 100)) + '%';
    var ms = MILESTONES.filter(function (x) { return x < all * 0.8; });
    if (ms.length > 6) ms = ms.slice(0, 2).concat(ms.slice(-4));
    ms.push(all);
    $('#laurels').innerHTML = ms.map(function (x) {
      return '<span class="laurel' + (uniq >= x ? ' won' : '') + '" title="' + x + ' different sentences">' + x + '</span>';
    }).join('');
    if (bump) { var el = $('#s-session'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }

  // ---------- controls ----------
  (function bindControls() {
    $('#btn-play').addEventListener('click', togglePlay);
    $('#btn-next').addEventListener('click', function () { player.stop(); next(playing); });
    $('#btn-prev').addEventListener('click', prev);
    var sp = $('#speed'), gp = $('#gap'), rp = $('#reps'), tx = $('#text-mode');
    sp.value = prefs.speed; gp.value = prefs.gap; rp.value = prefs.reps; tx.value = prefs.text;
    function sync() { $('#speed-v').textContent = (+sp.value).toFixed(1) + '×'; $('#gap-v').textContent = gp.value + ' s'; }
    sync();
    sp.addEventListener('input', function () { prefs.speed = +sp.value; sync(); savePrefs(); if (player.audio) player.audio.playbackRate = prefs.speed; });
    gp.addEventListener('input', function () { prefs.gap = +gp.value; sync(); savePrefs(); });
    rp.addEventListener('change', function () { prefs.reps = +rp.value; savePrefs(); });
    tx.addEventListener('change', function () { prefs.text = tx.value; savePrefs(); renderStage(); });
    $('#interlinear').addEventListener('change', function () { renderStage(); });
    var rl = $('#redletter'); rl.checked = prefs.red !== false; root.classList.toggle('no-red', !rl.checked);
    rl.addEventListener('change', function () { prefs.red = rl.checked; savePrefs(); root.classList.toggle('no-red', !rl.checked); });
    $('#reset').addEventListener('click', function () {
      if (!W.confirm || W.confirm('Reset the counters saved in this browser?')) {
        progress = { seen: {}, total: 0, seconds: 0, since: Date.now() }; G.saveProgress(progress);
        try { W.sessionStorage.removeItem('trb-gospels-v1-s'); } catch (e) { }
        updateStats();
      }
    });
    D.addEventListener('keydown', function (e) {
      if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) || !picker.hidden) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') { player.stop(); next(playing); }
      if (e.key === 'ArrowLeft') prev();
    });
    panel.innerHTML = panelEmpty;
    var voiceNote = $('#voice-note');
    setTimeout(function () {
      var l = G.voiceFor('l'), g = G.voiceFor('g'), e = G.voiceFor('en');
      voiceNote.textContent = 'Voices on this device: Latin ' + (l ? l.name + ' (' + l.lang + ')' : 'none found, using your default voice') +
        ' · Greek ' + (g ? g.name + ' (' + g.lang + ')' : 'none found') + ' · English ' + (e ? e.name : 'default');
    }, 800);
  })();

  root.classList.remove('loading');
  showPicker();
})(window, document);
