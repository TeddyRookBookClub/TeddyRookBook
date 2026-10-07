/* Free Books: search Project Gutenberg (through Gutendex) and LibriVox recordings (through the Internet Archive).
   Nothing is stored on this site; the browser calls the catalogues directly. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('shelf'); if (!root) return;
  function $(s) { return root.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var GUT = 'https://gutendex.com/books', IA = 'https://archive.org/advancedsearch.php';
  var PICKS = ['Homer', 'Plato', 'Virgil', 'Plutarch', 'Marcus Aurelius', 'Augustine', 'Dante', 'Shakespeare', 'Jane Austen', 'Dickens', 'Tolstoy', 'Dostoyevsky', 'Mark Twain', 'Sherlock Holmes', 'Bible'];
  var KEY = 'trb-shelf-v1', mine = [];
  try { mine = JSON.parse(W.localStorage.getItem(KEY)) || []; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(mine)); } catch (e) { } count(); }
  function count() { $('#sh-count').textContent = mine.length ? '(' + mine.length + ')' : ''; }
  var cache = {}, nextUrl = null, shown = {}, busy = false;

  function getJSON(url, ms) { // with a time limit, and a short-lived memory so the same call isn't sent twice
    if (cache[url]) return Promise.resolve(cache[url]);
    var ctl = W.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 20000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) { cache[url] = j; return j; });
  }
  function jsonp(url) { // the Archive also answers this way, for browsers where the direct call is refused
    return new Promise(function (ok, bad) {
      var name = 'shcb' + Date.now() + Math.floor(Math.random() * 1e4), s = D.createElement('script'), t = setTimeout(function () { done(); bad(new Error('timeout')); }, 20000);
      function done() { clearTimeout(t); try { delete W[name]; } catch (e) { W[name] = undefined; } s.remove(); }
      W[name] = function (j) { done(); ok(j); }; s.onerror = function () { done(); bad(new Error('network')); };
      s.src = url + '&callback=' + name; D.head.appendChild(s);
    });
  }
  // ---------- books ----------
  function pick(f, keys) { for (var i = 0; i < keys.length; i++) for (var k in f) if (k.indexOf(keys[i]) === 0 && !/\.zip$/.test(f[k])) return f[k]; return ''; }
  function slim(b) { // keep only what the card needs
    var f = b.formats || {}, a = (b.authors || []).map(function (x) { var n = (x.name || '').split(', '); return (n.length === 2 ? n[1] + ' ' + n[0] : x.name) + (x.birth_year || x.death_year ? ' (' + yr(x.birth_year) + '–' + yr(x.death_year) + ')' : ''); });
    return { id: b.id, title: b.title || 'Untitled', by: a.join('; '), who: (b.authors && b.authors[0] ? b.authors[0].name.split(',')[0] : ''), tr: (b.translators || []).map(function (x) { var n = (x.name || '').split(', '); return n.length === 2 ? n[1] + ' ' + n[0] : x.name; }).join('; '),
      lang: (b.languages || []).join(', '), sum: (b.summaries && b.summaries[0]) || '', n: b.download_count || 0, audio: b.media_type === 'Sound',
      html: pick(f, ['text/html']), epub: pick(f, ['application/epub+zip']), txt: pick(f, ['text/plain']), img: pick(f, ['image/jpeg']) };
  }
  function yr(y) { return y == null ? '?' : y < 0 ? -y + ' BC' : y; }
  function card(b) {
    var saved = mine.some(function (m) { return m.id === b.id; }), q = encodeURIComponent(b.title.split(/[:;]/)[0] + (b.who ? ' ' + b.who : ''));
    return '<li class="sh-book" data-id="' + b.id + '">' + (b.img ? '<img class="sh-cover" loading="lazy" alt="" src="' + esc(b.img) + '">' : '<div class="sh-cover sh-nocover" aria-hidden="true">📖</div>') +
      '<div><h3>' + esc(b.title) + '</h3><p class="sh-by">' + esc(b.by || 'Author unknown') + (b.tr ? ' · translated by ' + esc(b.tr) : '') + (b.lang && b.lang !== 'en' ? ' · ' + esc(b.lang) : '') + '</p>' +
      (b.sum ? '<p class="sh-sum">' + esc(b.sum.replace(/\s*\(This is an automatically generated summary\.\)\s*/, '')) + '</p>' : '') +
      '<div class="sh-acts">' + (b.audio ? '' : (b.html ? '<a class="pri" href="' + esc(b.html) + '" target="_blank" rel="noopener">Read online</a>' : '') + (b.epub ? '<a href="' + esc(b.epub) + '" rel="noopener">EPUB</a>' : '') + (b.txt ? '<a href="' + esc(b.txt) + '" target="_blank" rel="noopener">Plain text</a>' : '')) +
      '<button type="button" data-listen>🎧 Find a recording</button><button type="button" data-save class="' + (saved ? 'on' : '') + '">' + (saved ? '★ Saved' : '☆ Save') + '</button></div>' +
      '<p class="sh-else">Also: <a href="https://www.gutenberg.org/ebooks/' + b.id + '" target="_blank" rel="noopener">all formats at Project Gutenberg</a> · <a href="https://standardebooks.org/ebooks?query=' + q + '" target="_blank" rel="noopener">Standard Ebooks</a> · <a href="https://archive.org/search?query=' + q + '&and%5B%5D=mediatype%3A%22texts%22" target="_blank" rel="noopener">scanned editions</a></p></div></li>';
  }
  var byId = {};
  function show(list, into, append) {
    list.forEach(function (b) { byId[b.id] = b; });
    var h = list.map(card).join(''); if (append) into.insertAdjacentHTML('beforeend', h); else into.innerHTML = h;
  }
  function search(q, more) {
    if (busy) return; var st = $('#sh-status'), lang = $('#sh-lang').value, url;
    if (more) url = nextUrl; else { url = GUT + '?' + (q ? 'search=' + encodeURIComponent(q) + '&' : '') + (lang ? 'languages=' + lang + '&' : '') + 'copyright=false'; shown = {}; }
    if (!url) return; busy = true; st.textContent = more ? 'Loading more…' : (q ? 'Searching for “' + q + '”…' : 'Loading the most-read books…'); $('#sh-more').hidden = true;
    getJSON(url.replace(/^http:/, 'https:'), 25000).then(function (j) {
      busy = false; nextUrl = j.next;
      var list = (j.results || []).map(slim).filter(function (b) { if (shown[b.id]) return false; shown[b.id] = 1; return true; });
      show(list, $('#sh-list'), more);
      var total = Object.keys(shown).length;
      st.textContent = !total ? 'No book found. Try fewer words, the author’s surname, or “Any language”.' : (q ? j.count + (j.count === 1 ? ' book' : ' books') + ' for “' + q + '”' : 'The most-read free books') + (j.count > total ? ' · showing ' + total : '') + '.';
      $('#sh-more').hidden = !nextUrl;
      if (!more && q) try { W.history.replaceState(null, '', '?q=' + encodeURIComponent(q) + (lang !== 'en' ? '&lang=' + encodeURIComponent(lang) : '')); } catch (e) { }
    }).catch(function () {
      busy = false; $('#sh-more').hidden = !nextUrl;
      st.innerHTML = 'The book catalogue did not answer. It is a free service and is sometimes slow. <button type="button" class="sh-btn" id="sh-retry">Try again</button> or search <a href="https://www.gutenberg.org/ebooks/search/?query=' + encodeURIComponent(q || '') + '" target="_blank" rel="noopener">Project Gutenberg directly</a>.';
      var r = $('#sh-retry'); if (r) r.onclick = function () { search(q, more); };
    });
  }
  // ---------- recordings ----------
  function words(s) { return s.toLowerCase().replace(/[^a-z0-9À-ɏ ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !/^(the|and|for|with|from|vol|volume|part|book|complete|works)$/.test(w); }); }
  function listen(b) {
    var p = $('#sh-player'); p.hidden = false;
    p.innerHTML = '<div class="sh-phead"><div><h3>Looking for a recording of “' + esc(b.title) + '”…</h3></div><button type="button" class="sh-btn" data-close>✕</button></div>';
    p.querySelector('[data-close]').onclick = function () { p.hidden = true; p.innerHTML = ''; };
    var tw = words(b.title.split(/[:;]/)[0]).slice(0, 5), q = 'collection:librivoxaudio AND title:(' + tw.join(' ') + ')';
    var url = IA + '?q=' + encodeURIComponent(q) + '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&fl%5B%5D=downloads&sort%5B%5D=downloads+desc&rows=12&output=json';
    getJSON(url, 20000).catch(function () { return jsonp(url); }).then(function (j) {
      var docs = (j.response && j.response.docs) || [], who = b.who.toLowerCase();
      docs.forEach(function (d) { var c = [].concat(d.creator || []).join('; '); d.by = c; d.match = who && c.toLowerCase().indexOf(who) >= 0 ? 1 : 0; });
      docs.sort(function (a, z) { return z.match - a.match; });
      if (!docs.length) { p.querySelector('h3').textContent = 'No recording found for “' + b.title + '”.'; p.querySelector('.sh-phead>div').insertAdjacentHTML('beforeend', '<p class="sh-by">Try <a href="https://librivox.org/search?q=' + encodeURIComponent(b.title) + '&search_form=advanced" target="_blank" rel="noopener">searching LibriVox itself</a>; the recording may have a different title.</p>'); return; }
      play(b, docs, 0);
    }).catch(function () { p.querySelector('h3').textContent = 'The audio catalogue did not answer. Please try again in a moment.'; });
  }
  function play(b, docs, i) {
    var p = $('#sh-player'), d = docs[i], title = [].concat(d.title || d.identifier)[0];
    p.innerHTML = '<div class="sh-phead"><div><h3>🎧 ' + esc(title) + '</h3><p class="sh-by">' + esc(d.by || 'Author not listed') + (d.match ? '' : ' · <b>check this is the right book</b>') + ' · recording ' + (i + 1) + ' of ' + docs.length + '. Recording: LibriVox. Files and player: Internet Archive.</p></div>' +
      (docs.length > 1 ? '<button type="button" class="sh-btn" data-next>Try another</button>' : '') + '<button type="button" class="sh-btn" data-close aria-label="Close the player">✕</button></div>' +
      '<iframe title="Audiobook: ' + esc(title) + '" src="https://archive.org/embed/' + encodeURIComponent(d.identifier) + '" allow="autoplay" referrerpolicy="no-referrer" loading="lazy"></iframe>' +
      '<p class="sh-else">If the player does not appear, <a href="https://archive.org/details/' + encodeURIComponent(d.identifier) + '" target="_blank" rel="noopener">open the recording at the Internet Archive</a>, where you can also download it.</p>';
    p.querySelector('[data-close]').onclick = function () { p.hidden = true; p.innerHTML = ''; };
    var n = p.querySelector('[data-next]'); if (n) n.onclick = function () { play(b, docs, (i + 1) % docs.length); };
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
  function drawMine() { var el = $('#sh-saved'); if (!mine.length) { el.innerHTML = '<li class="sh-status">Nothing saved yet. Press ☆ Save on any book.</li>'; return; } show(mine, el); }
  Array.prototype.forEach.call(root.querySelectorAll('.sh-tabs button'), function (t) { t.onclick = function () {
    Array.prototype.forEach.call(root.querySelectorAll('.sh-tabs button'), function (x) { x.classList.toggle('on', x === t); });
    ['find', 'mine', 'help'].forEach(function (k) { $('#sh-' + k).hidden = k !== t.dataset.tab; }); if (t.dataset.tab === 'mine') drawMine();
  }; });
  function go(q) { root.querySelector('[data-tab="find"]').click(); $('#sh-q').value = q; search(q); }
  $('#sh-form').addEventListener('submit', function (e) { e.preventDefault(); var q = $('#sh-q').value.trim(); if (q) go(q); });
  $('#sh-lang').onchange = function () { var q = $('#sh-q').value.trim(); search(q); };
  $('#sh-more').onclick = function () { search($('#sh-q').value.trim(), true); };
  $('#sh-chips').innerHTML = PICKS.map(function (p) { return '<button type="button">' + p + '</button>'; }).join('');
  $('#sh-chips').onclick = function (e) { if (e.target.tagName === 'BUTTON') go(e.target.textContent); };
  count();
  var ps = new URLSearchParams(W.location.search), q0 = ps.get('q');
  if (ps.get('lang') != null) $('#sh-lang').value = ps.get('lang');
  if (q0) { $('#sh-q').value = q0; search(q0); } else search('');
})(window, document);
