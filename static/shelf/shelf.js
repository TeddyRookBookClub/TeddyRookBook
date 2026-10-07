/* Free Books: Project Gutenberg (through Gutendex, when it answers), scanned editions and LibriVox recordings
   (through the Internet Archive). Nothing is stored on this site; the browser calls the catalogues directly. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('shelf'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var GUT = 'https://gutendex.com/books', IA = 'https://archive.org/advancedsearch.php';
  var PICKS = ['Homer', 'Plato', 'Virgil', 'Plutarch', 'Marcus Aurelius', 'Augustine', 'Dante', 'Shakespeare', 'Jane Austen', 'Dickens', 'Tolstoy', 'Dostoyevsky', 'Mark Twain', 'Sherlock Holmes', 'Bible'];
  // A few good places to start: [Project Gutenberg number, title, author, note]. These need no catalogue call.
  var PINS = [[1727, 'The Odyssey', 'Homer', 'translated by Samuel Butler'], [2199, 'The Iliad', 'Homer', 'translated by Samuel Butler'], [228, 'The Aeneid', 'Virgil', 'translated by John Dryden'],
    [1497, 'The Republic', 'Plato', 'translated by Benjamin Jowett'], [2680, 'Meditations', 'Marcus Aurelius', ''], [674, 'Plutarch’s Lives', 'Plutarch', 'the Dryden translation, revised by A. H. Clough'],
    [3296, 'The Confessions of St. Augustine', 'Augustine', 'translated by E. B. Pusey'], [8800, 'The Divine Comedy', 'Dante', 'translated by H. F. Cary'], [1342, 'Pride and Prejudice', 'Jane Austen', ''],
    [2600, 'War and Peace', 'Leo Tolstoy', ''], [28054, 'The Brothers Karamazov', 'Fyodor Dostoyevsky', 'translated by Constance Garnett'], [2701, 'Moby-Dick', 'Herman Melville', '']];
  function pg(id, title, by, note) { var u = 'https://www.gutenberg.org/ebooks/' + id; return { id: 'pg' + id, src: 'pg', title: title, by: by + (note ? ' · ' + note : ''), who: by.split(' ').pop(), sum: '', html: u + '.html.images', epub: u + '.epub3.images', txt: u + '.txt.utf-8', img: 'https://www.gutenberg.org/cache/epub/' + id + '/pg' + id + '.cover.medium.jpg', page: u }; }
  var KEY = 'trb-shelf-v1', mine = [], AK = 'trb-shelf-audio';
  try { mine = (JSON.parse(W.localStorage.getItem(KEY)) || []).filter(function (m) { return m && m.src; }); } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(mine)); } catch (e) { } count(); }
  function count() { $('#sh-count').textContent = mine.length ? '(' + mine.length + ')' : ''; }
  var cache = {}, state = { q: '', pgNext: null, iaPage: 1, iaMore: false }, seq = 0;

  function getJSON(url, ms) {
    if (cache[url]) return Promise.resolve(cache[url]);
    var ctl = W.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 15000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) { cache[url] = j; return j; });
  }
  // ---------- turning catalogue answers into cards ----------
  function pick(f, keys) { for (var i = 0; i < keys.length; i++) for (var k in f) if (k.indexOf(keys[i]) === 0 && !/\.zip$/.test(f[k])) return f[k]; return ''; }
  function yr(y) { return y == null ? '?' : y < 0 ? -y + ' BC' : y; }
  function flip(n) { var p = (n || '').split(', '); return p.length === 2 ? p[1] + ' ' + p[0] : n; }
  function fromGut(b) {
    var f = b.formats || {}, a = (b.authors || []).map(function (x) { return flip(x.name) + (x.birth_year || x.death_year ? ' (' + yr(x.birth_year) + '–' + yr(x.death_year) + ')' : ''); }), tr = (b.translators || []).map(function (x) { return flip(x.name); }).join('; ');
    return { id: 'pg' + b.id, src: 'pg', title: b.title || 'Untitled', by: (a.join('; ') || 'Author unknown') + (tr ? ' · translated by ' + tr : '') + ((b.languages || []).join() !== 'en' ? ' · ' + (b.languages || []).join(', ') : ''),
      who: b.authors && b.authors[0] ? b.authors[0].name.split(',')[0] : '', sum: ((b.summaries && b.summaries[0]) || '').replace(/\s*\(This is an automatically generated summary\.\)\s*/, ''),
      html: pick(f, ['text/html']), epub: pick(f, ['application/epub+zip']), txt: pick(f, ['text/plain']), img: pick(f, ['image/jpeg']), page: 'https://www.gutenberg.org/ebooks/' + b.id, audio: b.media_type === 'Sound' };
  }
  function one(x) { return [].concat(x || [])[0] || ''; }
  function fromIA(d) {
    var c = [].concat(d.creator || []).join('; ');
    return { id: 'ia' + d.identifier, src: 'ia', ia: d.identifier, title: one(d.title) || d.identifier, by: (c || 'Author not listed') + (d.year ? ' · printed ' + d.year : ''), who: (one(d.creator).split(',')[0] || '').split(' ').pop(), sum: '',
      img: 'https://archive.org/services/img/' + encodeURIComponent(d.identifier), page: 'https://archive.org/details/' + encodeURIComponent(d.identifier) };
  }
  function card(b) {
    var saved = mine.some(function (m) { return m.id === b.id; }), q = encodeURIComponent(b.title.split(/[:;]/)[0] + (b.who ? ' ' + b.who : '')), acts;
    if (b.src === 'ia') acts = '<a class="pri" href="' + esc(b.page) + '" target="_blank" rel="noopener">Read the scan</a><a href="https://archive.org/download/' + encodeURIComponent(b.ia) + '" target="_blank" rel="noopener">PDF and other files</a>';
    else acts = b.audio ? '' : (b.html ? '<a class="pri" href="' + esc(b.html) + '" target="_blank" rel="noopener">Read online</a>' : '') + (b.epub ? '<a href="' + esc(b.epub) + '" rel="noopener">EPUB</a>' : '') + (b.txt ? '<a href="' + esc(b.txt) + '" target="_blank" rel="noopener">Plain text</a>' : '');
    return '<li class="sh-book" data-id="' + esc(b.id) + '">' + (b.img ? '<img class="sh-cover" loading="lazy" alt="" src="' + esc(b.img) + '" onerror="this.style.visibility=\'hidden\'">' : '<div class="sh-cover sh-nocover" aria-hidden="true">📖</div>') +
      '<div><h3>' + esc(b.title) + '</h3><p class="sh-by">' + esc(b.by) + '</p>' + (b.sum ? '<p class="sh-sum">' + esc(b.sum) + '</p>' : '') +
      '<div class="sh-acts">' + acts + '<button type="button" data-listen>🎧 Find a recording</button><button type="button" data-save class="' + (saved ? 'on' : '') + '">' + (saved ? '★ Saved' : '☆ Save') + '</button></div>' +
      '<p class="sh-else">' + (b.src === 'ia' ? 'Scanned book: Internet Archive' : '<a href="' + esc(b.page) + '" target="_blank" rel="noopener">All formats at Project Gutenberg</a>') + ' · <a href="https://standardebooks.org/ebooks?query=' + q + '" target="_blank" rel="noopener">Standard Ebooks</a></p></div></li>';
  }
  var byId = {};
  function put(list, into, append) { list.forEach(function (b) { byId[b.id] = b; }); var h = list.map(card).join(''); if (append) into.insertAdjacentHTML('beforeend', h); else into.innerHTML = h; }
  // ---------- searching ----------
  function iaUrl(q, lang, page) {
    var L = { en: 'eng OR English', la: 'lat OR Latin', 'el,grc': 'grc OR gre OR Greek', fr: 'fre OR French', de: 'ger OR German', es: 'spa OR Spanish', it: 'ita OR Italian' }[lang];
    var w = q.replace(/[^\wÀ-ɏͰ-Ͽ ]+/g, ' ').trim();
    return IA + '?q=' + encodeURIComponent('mediatype:texts AND (title:(' + w + ') OR creator:(' + w + '))' + (L ? ' AND language:(' + L + ')' : '') + ' AND year:[1400 TO 1929] AND -access-restricted-item:true AND -collection:(inlibrary OR printdisabled)') +
      '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&fl%5B%5D=year&sort%5B%5D=downloads+desc&rows=6&page=' + page + '&output=json';
  }
  function home() {
    state.q = ''; seq++;
    $('#sh-status').textContent = 'A few good places to start. Search above for anything else.';
    $('#sh-results').innerHTML = '<ul class="sh-list" id="sh-pins"></ul>'; put(PINS.map(function (p) { return pg(p[0], p[1], p[2], p[3]); }), $('#sh-pins'));
    $('#sh-more').hidden = true;
  }
  function search(q) {
    q = (q || '').trim(); if (!q) return home();
    var my = ++seq, lang = $('#sh-lang').value, st = $('#sh-status'), box = $('#sh-results');
    state = { q: q, pgNext: null, iaPage: 1, iaMore: false, lang: lang };
    st.textContent = 'Searching for “' + q + '”…'; $('#sh-more').hidden = true;
    box.innerHTML = '<h2 class="sh-h">From Project Gutenberg <small>clean text, EPUB for e-readers</small></h2><p class="sh-status" id="sh-pgs">Asking the Gutenberg catalogue…</p><ul class="sh-list" id="sh-pg"></ul>' +
      '<h2 class="sh-h">Scanned editions <small>photographs of the printed book, from the Internet Archive</small></h2><p class="sh-status" id="sh-ias">Searching…</p><ul class="sh-list" id="sh-ia"></ul>';
    try { W.history.replaceState(null, '', '?q=' + encodeURIComponent(q) + (lang !== 'en' ? '&lang=' + encodeURIComponent(lang) : '')); } catch (e) { }
    var left = 2, found = 0; function done(n) { found += n; if (--left === 0 && my === seq) { st.textContent = found ? 'Results for “' + q + '”.' : 'No book found. Try fewer words, the author’s surname, or “Any language”.'; $('#sh-more').hidden = !(state.pgNext || state.iaMore); } }
    getJSON(GUT + '?search=' + encodeURIComponent(q) + (lang ? '&languages=' + lang : '') + '&copyright=false', 9000).then(function (j) {
      if (my !== seq) return; state.pgNext = j.next; var l = (j.results || []).slice(0, 8).map(fromGut); state.pgRest = (j.results || []).slice(8).map(fromGut);
      put(l, $('#sh-pg')); $('#sh-pgs').textContent = l.length ? '' : 'Nothing at Project Gutenberg under those words.'; done(l.length);
    }).catch(function () {
      if (my !== seq) return;
      $('#sh-pgs').innerHTML = 'The Gutenberg catalogue is not answering at the moment (it is a free service that is sometimes down). <a href="https://www.gutenberg.org/ebooks/search/?query=' + encodeURIComponent(q) + '" target="_blank" rel="noopener">Search Project Gutenberg itself ↗</a>, or use the scanned editions below.'; done(0);
    });
    getJSON(iaUrl(q, lang, 1), 15000).then(function (j) {
      if (my !== seq) return; var docs = (j.response && j.response.docs) || [], l = docs.map(fromIA); state.iaMore = j.response && j.response.numFound > 6;
      put(l, $('#sh-ia')); $('#sh-ias').textContent = l.length ? '' : 'No scanned edition found.'; done(l.length);
    }).catch(function () { if (my !== seq) return; $('#sh-ias').textContent = 'The Internet Archive did not answer. Please try again in a moment.'; done(0); });
  }
  function more() {
    var my = seq, btn = $('#sh-more'); btn.hidden = true;
    if (state.pgRest && state.pgRest.length) { put(state.pgRest.splice(0, 8), $('#sh-pg'), true); }
    else if (state.pgNext) getJSON(state.pgNext.replace(/^http:/, 'https:'), 12000).then(function (j) { if (my !== seq) return; state.pgNext = j.next; var r = (j.results || []).map(fromGut); put(r.slice(0, 8), $('#sh-pg'), true); state.pgRest = r.slice(8); btn.hidden = !(state.pgNext || state.pgRest.length || state.iaMore); }).catch(function () { });
    if (state.iaMore) getJSON(iaUrl(state.q, state.lang, ++state.iaPage), 15000).then(function (j) { if (my !== seq) return; var d = (j.response && j.response.docs) || []; put(d.map(fromIA), $('#sh-ia'), true); state.iaMore = d.length === 6; btn.hidden = !(state.pgNext || (state.pgRest && state.pgRest.length) || state.iaMore); }).catch(function () { });
    btn.hidden = !((state.pgRest && state.pgRest.length) || state.pgNext || state.iaMore);
  }
  // ---------- recordings: our own player, so the speed can go up to 3.5× ----------
  var SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5], A = { speed: 1, pos: {} };
  try { var sa = JSON.parse(W.localStorage.getItem(AK)); if (sa) A = sa; A.pos = A.pos || {}; } catch (e) { }
  function saveA() { try { W.localStorage.setItem(AK, JSON.stringify(A)); } catch (e) { } }
  function words(s) { return s.toLowerCase().replace(/[^a-z0-9À-ɏ ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !/^(the|and|for|with|from|vol|volume|part|book|complete|works)$/.test(w); }); }
  function closeP() { var p = $('#sh-player'); p.hidden = true; p.innerHTML = ''; }
  function listen(b) {
    var p = $('#sh-player'); p.hidden = false;
    p.innerHTML = '<div class="sh-phead"><div><h3>Looking for a recording of “' + esc(b.title) + '”…</h3></div><button type="button" class="sh-btn" data-close>✕</button></div>';
    p.querySelector('[data-close]').onclick = closeP;
    var tw = words(b.title.split(/[:;]/)[0]).slice(0, 5), url = IA + '?q=' + encodeURIComponent('collection:librivoxaudio AND title:(' + tw.join(' ') + ')') + '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&sort%5B%5D=downloads+desc&rows=12&output=json';
    getJSON(url, 15000).then(function (j) {
      var docs = (j.response && j.response.docs) || [], who = (b.who || '').toLowerCase();
      docs.forEach(function (d) { d.by = [].concat(d.creator || []).join('; '); d.match = who && d.by.toLowerCase().indexOf(who) >= 0 ? 1 : 0; });
      docs.sort(function (a, z) { return z.match - a.match; });
      if (!docs.length) { p.querySelector('h3').textContent = 'No recording found for “' + b.title + '”.'; p.querySelector('.sh-phead>div').insertAdjacentHTML('beforeend', '<p class="sh-by">The recording may have a different title: <a href="https://librivox.org/search?q=' + encodeURIComponent(b.title) + '&search_form=advanced" target="_blank" rel="noopener">search LibriVox itself ↗</a></p>'); return; }
      load(docs, 0);
    }).catch(function () { p.querySelector('h3').textContent = 'The audio catalogue did not answer. Please try again in a moment.'; });
  }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function load(docs, i) {
    var p = $('#sh-player'), d = docs[i], title = one(d.title) || d.identifier;
    p.innerHTML = '<div class="sh-phead"><div><h3>🎧 ' + esc(title) + '</h3><p class="sh-by">' + esc(d.by || 'Author not listed') + (d.match ? '' : ' · <b>check this is the right book</b>') + ' · recording ' + (i + 1) + ' of ' + docs.length + '</p></div>' +
      (docs.length > 1 ? '<button type="button" class="sh-btn" data-next>Try another</button>' : '') + '<button type="button" class="sh-btn" data-close aria-label="Close the player">✕</button></div><div id="sh-pbody"><p class="sh-by">Loading the chapters…</p></div>';
    p.querySelector('[data-close]').onclick = closeP;
    var n = p.querySelector('[data-next]'); if (n) n.onclick = function () { load(docs, (i + 1) % docs.length); };
    getJSON('https://archive.org/metadata/' + encodeURIComponent(d.identifier), 15000).then(function (m) {
      var mp3 = (m.files || []).filter(function (f) { return /\.mp3$/i.test(f.name); }), small = mp3.filter(function (f) { return f.format === '64Kbps MP3'; }), use = small.length ? small : mp3.filter(function (f) { return f.source === 'original'; });
      if (!use.length) use = mp3; if (!use.length) throw new Error('no audio');
      use.sort(function (a, z) { return (parseInt(a.track, 10) || 0) - (parseInt(z.track, 10) || 0) || a.name.localeCompare(z.name); });
      player(d, use);
    }).catch(function () { // fall back to the Archive's own player
      $('#sh-pbody').innerHTML = '<iframe title="Audiobook: ' + esc(title) + '" src="https://archive.org/embed/' + encodeURIComponent(d.identifier) + '" referrerpolicy="no-referrer"></iframe>';
    });
  }
  function player(d, files) {
    var id = d.identifier, base = 'https://archive.org/download/' + encodeURIComponent(id) + '/', st = A.pos[id] || { c: 0, t: 0 }, cur = Math.min(st.c || 0, files.length - 1), body = $('#sh-pbody');
    body.innerHTML = '<div class="sh-ctl"><select id="sh-ch" aria-label="Chapter">' + files.map(function (f, k) { return '<option value="' + k + '">' + (k + 1) + '. ' + esc(f.title || f.name) + '</option>'; }).join('') + '</select>' +
      '<label class="sh-sp">Speed <select id="sh-speed">' + SPEEDS.map(function (s) { return '<option value="' + s + '">' + s + '×</option>'; }).join('') + '</select></label></div>' +
      '<div class="sh-ctl"><button type="button" class="sh-btn" data-a="prev" aria-label="Previous chapter">⏮</button><button type="button" class="sh-btn" data-a="back">−30 s</button><button type="button" class="sh-btn pri" data-a="play">▶ Play</button><button type="button" class="sh-btn" data-a="fwd">+30 s</button><button type="button" class="sh-btn" data-a="next" aria-label="Next chapter">⏭</button>' +
      '<input type="range" id="sh-seek" min="0" max="1000" value="0" aria-label="Position"><span id="sh-time">0:00</span></div>' +
      '<audio id="sh-au" preload="metadata"></audio><p class="sh-else">Recording: LibriVox volunteers. Files: Internet Archive. <a href="https://archive.org/details/' + encodeURIComponent(id) + '" target="_blank" rel="noopener">Download the whole recording ↗</a></p>';
    var au = $('#sh-au'), seek = $('#sh-seek'), playB = body.querySelector('[data-a="play"]'), lastSave = 0, dragging = false;
    function set(k, t, go) { cur = k; $('#sh-ch').value = k; au.src = base + encodeURIComponent(files[k].name); au.playbackRate = A.speed; au.currentTime = 0; var once = function () { au.removeEventListener('loadedmetadata', once); if (t) try { au.currentTime = t; } catch (e) { } au.playbackRate = A.speed; }; au.addEventListener('loadedmetadata', once); if (go) au.play().catch(function () { }); keep(t || 0); }
    function keep(t) { A.pos[id] = { c: cur, t: Math.floor(t) }; saveA(); }
    $('#sh-speed').value = SPEEDS.indexOf(A.speed) >= 0 ? A.speed : 1;
    $('#sh-speed').onchange = function () { A.speed = +this.value; au.playbackRate = A.speed; saveA(); };
    $('#sh-ch').onchange = function () { set(+this.value, 0, !au.paused); };
    body.addEventListener('click', function (e) { var a = e.target.closest('[data-a]'); if (!a) return; a = a.dataset.a;
      if (a === 'play') { if (au.paused) au.play().catch(function () { }); else au.pause(); }
      else if (a === 'back') au.currentTime = Math.max(0, au.currentTime - 30); else if (a === 'fwd') au.currentTime = Math.min(au.duration || 1e9, au.currentTime + 30);
      else if (a === 'prev') set(Math.max(0, cur - 1), 0, !au.paused); else if (a === 'next') set(Math.min(files.length - 1, cur + 1), 0, !au.paused); });
    au.addEventListener('play', function () { playB.textContent = '❚❚ Pause'; au.playbackRate = A.speed; }); au.addEventListener('pause', function () { playB.textContent = '▶ Play'; keep(au.currentTime); });
    au.addEventListener('timeupdate', function () { if (!dragging && au.duration) seek.value = au.currentTime / au.duration * 1000; $('#sh-time').textContent = fmt(au.currentTime) + ' / ' + fmt(au.duration); if (Date.now() - lastSave > 5000) { lastSave = Date.now(); keep(au.currentTime); } });
    au.addEventListener('ended', function () { if (cur < files.length - 1) set(cur + 1, 0, true); });
    au.addEventListener('error', function () { $('#sh-time').textContent = 'This chapter would not load.'; });
    seek.addEventListener('input', function () { dragging = true; }); seek.addEventListener('change', function () { if (au.duration) au.currentTime = seek.value / 1000 * au.duration; dragging = false; });
    set(cur, st.t || 0, false);
  }
  // ---------- wiring ----------
  root.addEventListener('click', function (e) {
    var li = e.target.closest('.sh-book'); if (!li) return; var b = byId[li.dataset.id]; if (!b) return;
    if (e.target.closest('[data-listen]')) listen(b);
    else if (e.target.closest('[data-save]')) {
      var i = mine.findIndex(function (m) { return m.id === b.id; }); if (i >= 0) mine.splice(i, 1); else mine.unshift(b);
      save(); var btn = e.target.closest('[data-save]'), on = i < 0; btn.classList.toggle('on', on); btn.textContent = on ? '★ Saved' : '☆ Save';
      if (!$('#sh-mine').hidden) drawMine();
    }
  });
  function drawMine() { var el = $('#sh-saved'); if (!mine.length) { el.innerHTML = '<li class="sh-status">Nothing saved yet. Press ☆ Save on any book.</li>'; return; } put(mine, el); }
  Array.prototype.forEach.call(root.querySelectorAll('.sh-tabs button'), function (t) { t.onclick = function () {
    Array.prototype.forEach.call(root.querySelectorAll('.sh-tabs button'), function (x) { x.classList.toggle('on', x === t); });
    ['find', 'mine', 'help'].forEach(function (k) { $('#sh-' + k).hidden = k !== t.dataset.tab; }); if (t.dataset.tab === 'mine') drawMine();
  }; });
  function go(q) { root.querySelector('[data-tab="find"]').click(); $('#sh-q').value = q; search(q); }
  $('#sh-form').addEventListener('submit', function (e) { e.preventDefault(); go($('#sh-q').value); });
  $('#sh-lang').onchange = function () { search($('#sh-q').value); };
  $('#sh-more').onclick = more;
  $('#sh-chips').innerHTML = PICKS.map(function (p) { return '<button type="button">' + p + '</button>'; }).join('');
  $('#sh-chips').onclick = function (e) { if (e.target.tagName === 'BUTTON') go(e.target.textContent); };
  count();
  var ps = new URLSearchParams(W.location.search), q0 = ps.get('q');
  if (ps.get('lang') != null) $('#sh-lang').value = ps.get('lang');
  if (q0) { $('#sh-q').value = q0; search(q0); } else home();
})(window, document);
