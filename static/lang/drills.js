/* Gospel sentence drills: Glossika-style listening with English, Koine Greek and Latin. */
(function (W, D) {
  'use strict';
  var G = W.Gospels, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var root = $('#drills'); if (!root) return;

  var LANGS = {
    en: { name: 'English', short: 'EN', sub: 'ESV' },
    g: { name: 'Koine Greek', short: 'ΚΟΙΝΗ', sub: 'Westcott–Hort reading' },
    l: { name: 'Latin', short: 'LATINA', sub: 'Vulgate' }
  };
  var PREF_KEY = 'trb-gospels-prefs';
  var prefs = { order: ['en', 'g', 'l'], show: { en: true, g: true, l: true }, play: { en: true, g: true, l: true },
    speed: 1, gap: 2, reps: 1, book: 'ALL', passage: -1, mode: 'shuffle', text: 'always' };
  try { var sp = JSON.parse(W.localStorage.getItem(PREF_KEY)); if (sp) for (var k in sp) prefs[k] = sp[k]; } catch (e) { }
  function savePrefs() { try { W.localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { } }

  var data, pool = [], bag = [], history = [], hi = -1, cur = null, playing = false, player = new G.Player();
  var progress = G.loadProgress();
  var panel = $('#word-panel');

  Promise.all([G.getJSON('drills.json'), G.loadLex()]).then(function (r) {
    data = r[0];
    buildFilters(); buildLangRows(); bindControls(); rebuildPool(); updateStats();
    next(false);
    root.classList.remove('loading');
  }).catch(function (e) { root.classList.remove('loading'); $('#stage').innerHTML = '<p class="err">Could not load the lesson data (' + G.esc(e.message) + ').</p>'; });

  // ---------- filters ----------
  function buildFilters() {
    var bs = $('#f-book'), ps = $('#f-passage');
    bs.value = prefs.book;
    function fillPassages() {
      ps.innerHTML = '<option value="-1">All passages</option>' + data.passages.map(function (p, i) {
        if (prefs.book !== 'ALL' && p[0] !== prefs.book) return '';
        return '<option value="' + i + '">' + G.BOOKS[p[0]] + ' ' + p[1] + ':' + p[2] + '–' + p[3] + ' · ' + G.esc(p[4]) + '</option>';
      }).join('');
      ps.value = String(prefs.passage); if (ps.value !== String(prefs.passage)) { prefs.passage = -1; ps.value = '-1'; }
    }
    fillPassages();
    bs.addEventListener('change', function () { prefs.book = bs.value; prefs.passage = -1; fillPassages(); savePrefs(); rebuildPool(); next(false); });
    ps.addEventListener('change', function () { prefs.passage = +ps.value; savePrefs(); rebuildPool(); next(false); });
    $$('[name="mode"]').forEach(function (r) {
      r.checked = r.value === prefs.mode;
      r.addEventListener('change', function () { prefs.mode = r.value; savePrefs(); rebuildPool(); });
    });
  }
  function rebuildPool() {
    pool = data.verses.map(function (v, i) { return i; }).filter(function (i) {
      var v = data.verses[i];
      if (prefs.passage >= 0) return v.p === prefs.passage;
      if (prefs.book !== 'ALL' && v.b !== prefs.book) return false;
      return v.g.length >= 5; // skip very short lines in shuffle mode
    });
    bag = [];
    $('#pool-count').textContent = pool.length + ' sentence' + (pool.length === 1 ? '' : 's');
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
  function buildLangRows() {
    var box = $('#lang-order');
    box.innerHTML = prefs.order.map(function (k, i) {
      var L = LANGS[k];
      return '<li class="lo-item lo-' + k + '" data-k="' + k + '">' +
        '<span class="lo-n">' + (i + 1) + '</span><span class="lo-name">' + L.name + '</span>' +
        '<label class="tgl" title="Show text"><input type="checkbox" data-t="show" ' + (prefs.show[k] ? 'checked' : '') + '><span>Text</span></label>' +
        '<label class="tgl" title="Play audio"><input type="checkbox" data-t="play" ' + (prefs.play[k] ? 'checked' : '') + '><span>Audio</span></label>' +
        '<span class="lo-move"><button type="button" data-mv="-1" aria-label="Move ' + L.name + ' earlier" ' + (i === 0 ? 'disabled' : '') + '>▲</button>' +
        '<button type="button" data-mv="1" aria-label="Move ' + L.name + ' later" ' + (i === prefs.order.length - 1 ? 'disabled' : '') + '>▼</button></span></li>';
    }).join('');
    $$('input', box).forEach(function (inp) {
      inp.addEventListener('change', function () {
        var k = inp.closest('li').dataset.k; prefs[inp.dataset.t][k] = inp.checked; savePrefs(); renderStage();
      });
    });
    $$('button[data-mv]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.closest('li').dataset.k, i = prefs.order.indexOf(k), j = i + (+b.dataset.mv);
        prefs.order.splice(i, 1); prefs.order.splice(j, 0, k); savePrefs(); buildLangRows(); renderStage();
      });
    });
  }

  // ---------- stage ----------
  function renderStage(activeLang) {
    if (cur == null) return;
    var v = data.verses[cur], p = data.passages[v.p], paused = !playing;
    $('#st-ref').textContent = G.refLabel(v.b, v.c, v.v);
    $('#st-title').textContent = p[4];
    var h = '';
    prefs.order.forEach(function (k) {
      var show = prefs.show[k] || paused;
      var hide = !show || (prefs.text === 'after' && playing && !spoken[k]);
      var body;
      if (k === 'en') body = G.esc(v.en);
      else body = G.renderWords(k, k === 'g' ? v.g : v.l, { interlinear: paused && $('#interlinear').checked });
      h += '<div class="row row-' + k + (activeLang === k ? ' speaking' : '') + (hide ? ' veiled' : '') + '" data-k="' + k + '">' +
        '<div class="row-lab"><b>' + LANGS[k].short + '</b><small>' + LANGS[k].sub + '</small>' +
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
    var v = data.verses[cur]; return (lang === 'g' ? v.g : v.l)[+el.dataset.i];
  }, panel);

  function next(autoplay) {
    if (!pool.length) return;
    if (hi < history.length - 1) { hi++; cur = history[hi]; }
    else { cur = draw(); history.push(cur); if (history.length > 200) history.shift(); hi = history.length - 1; }
    spoken = {}; panel.classList.remove('open'); panel.innerHTML = panelEmpty;
    renderStage();
    if (autoplay) runVerse();
  }
  function prev() {
    if (hi <= 0) return;
    player.stop(); hi--; cur = history[hi]; spoken = {}; renderStage(); if (playing) runVerse();
  }
  var panelEmpty = '<p class="wp-empty">Pause, then tap any Greek or Latin word to see its dictionary form, meaning and grammar.</p>';

  // ---------- playback ----------
  function textFor(k, v) { return k === 'en' ? v.en : k === 'g' ? G.greekText(v.g) : G.latinText(v.l); }
  function say(k, v) {
    var rate = prefs.speed;
    if (k === 'g' && v.a) return player.clip(v.a, rate).then(function (ok) { return ok; });
    if (k === 'g') return player.speak(textFor('g', v), 'g', rate);
    return player.speak(textFor(k, v), k === 'en' ? 'en' : 'l', rate * (k === 'l' ? 0.9 : 1));
  }
  var creditSpoken = false;
  function runVerse() {
    var v = data.verses[cur], order = prefs.order.filter(function (k) { return prefs.play[k]; });
    var myVerse = cur, t0 = Date.now();
    var chain = Promise.resolve(true);
    if (!creditSpoken && prefs.play.en) {
      creditSpoken = true;
      chain = chain.then(function () { return player.speak('English Scripture quotations are from the E S V Bible.', 'en', 1.05); }).then(function (ok) { return ok && player.wait(500); });
    }
    order.forEach(function (k, idx) {
      var reps = k === 'en' ? 1 : prefs.reps;
      for (let r = 0; r < reps; r++) {
        chain = chain.then(function (ok) {
          if (!ok || myVerse !== cur || !playing) return false;
          renderStage(k); return say(k, v).then(function (ok2) { spoken[k] = true; return ok2; });
        }).then(function (ok) { return ok && playing && player.wait(r < reps - 1 ? 600 : 700 / Math.max(1, prefs.speed / 1.5)); });
      }
    });
    chain.then(function (ok) {
      if (!ok || !playing || myVerse !== cur) return;
      renderStage();
      markReviewed(v, (Date.now() - t0) / 1000);
      return player.wait(prefs.gap * 1000).then(function (ok2) { if (ok2 && playing && myVerse === cur) next(true); });
    });
  }
  function playOne(k) {
    var wasPlaying = playing; player.stop(); playing = false; setPlayBtn();
    var v = data.verses[cur]; renderStage(k);
    say(k, v).then(function () { renderStage(); });
    if (wasPlaying) { /* stays paused so the learner can study */ }
  }
  function setPlayBtn() {
    var b = $('#btn-play'); b.classList.toggle('on', playing);
    b.setAttribute('aria-label', playing ? 'Pause' : 'Play'); $('.lbl', b).textContent = playing ? 'Pause' : 'Play';
    root.classList.toggle('is-paused', !playing);
  }
  function togglePlay() {
    if (playing) { playing = false; player.stop(); setPlayBtn(); renderStage(); return; }
    playing = true; setPlayBtn(); panel.classList.remove('open'); spoken = {}; renderStage(); runVerse();
  }

  // ---------- progress ----------
  function markReviewed(v, secs) {
    var ref = v.b + v.c + ':' + v.v;
    progress.seen[ref] = (progress.seen[ref] || 0) + 1; progress.total++; progress.seconds += secs;
    G.saveProgress(progress); G.sessionCount(1); updateStats(true);
  }
  var MILESTONES = [10, 25, 50, 100, 250, 499];
  function updateStats(bump) {
    var uniq = Object.keys(progress.seen).length, sess = G.sessionCount(0);
    $('#s-session').textContent = sess; $('#s-total').textContent = progress.total;
    $('#s-unique').textContent = uniq; $('#s-min').textContent = Math.round(progress.seconds / 60);
    var pct = Math.min(1, uniq / data.verses.length);
    $('#ring').style.setProperty('--p', (pct * 100).toFixed(1));
    $('#ring-lbl').textContent = Math.round(pct * 100) + '%';
    var m = MILESTONES.filter(function (x) { return uniq >= x; });
    $('#laurels').innerHTML = MILESTONES.map(function (x) {
      return '<span class="laurel' + (uniq >= x ? ' won' : '') + '" title="' + x + ' different sentences">' + x + '</span>';
    }).join('');
    if (bump) { var el = $('#s-session'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }

  // ---------- controls ----------
  function bindControls() {
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
    $('#reset').addEventListener('click', function () {
      if (!W.confirm || W.confirm('Reset the counters saved in this browser?')) {
        progress = { seen: {}, total: 0, seconds: 0, since: Date.now() }; G.saveProgress(progress);
        try { W.sessionStorage.removeItem('trb-gospels-v1-s'); } catch (e) { }
        updateStats();
      }
    });
    D.addEventListener('keydown', function (e) {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') { player.stop(); next(playing); }
      if (e.key === 'ArrowLeft') prev();
    });
    panel.innerHTML = panelEmpty;
    var voiceNote = $('#voice-note');
    setTimeout(function () {
      var l = G.voiceFor('l'), e = G.voiceFor('en');
      voiceNote.textContent = 'Latin voice on this device: ' + (l ? l.name + ' (' + l.lang + ')' : 'none found. Latin will use your default voice') +
        ' · English voice: ' + (e ? e.name : 'default');
    }, 800);
  }
})(window, document);
