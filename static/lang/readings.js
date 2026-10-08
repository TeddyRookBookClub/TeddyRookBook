/* Short Readings: the Lord's Prayer, Psalm 23, Aesop (Greek) and Phaedrus (Latin), every word explained.
   Data: readings.json (built from the Perseus treebanks, the Gospel data and a hand-tagged psalm). */
(function (W, D) {
  'use strict';
  var G = W.Gospels, root = D.getElementById('rd'); if (!root || !G) return;
  function $(s) { return root.querySelector(s); }
  var esc = G.esc, data = null, panel = $('#word-panel'), player = new G.Player();
  var st = { t: 'aesop', i: 0, inter: false, pron: true, en: true, rate: 1 };
  try { var s0 = JSON.parse(W.localStorage.getItem('trb-readings')); if (s0) for (var k in s0) st[k] = s0[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem('trb-readings', JSON.stringify(st)); } catch (e) { } }
  var cur = {}; // tokens shown, by key, for the word panel
  function text(id) { return data.texts.filter(function (x) { return x.id === id; })[0]; }
  function useLex(t) {
    var L = G.LEX;
    if (t.kind === 'lp') { L.g = data.lexg; L.l = data.lexl; L.note = null; }
    else { L.G = data.lexG; L.L = data.lexL; L.note = 'in these readings'; }
  }
  function words(lang, toks, key) {
    cur[key] = toks;
    var h = G.renderWords(lang, toks, { interlinear: st.inter });
    return '<span class="rd-s" data-k="' + key + '">' + h + '</span>';
  }
  function addPron(el) {
    if (st.pron && W.grTranslit) el.querySelectorAll('.w[data-l="G"],.w[data-l="g"]').forEach(function (w) {
      if (w.querySelector('.w-tr')) return;
      var t = w.querySelector('.w-t').textContent, s = D.createElement('span'); s.className = 'w-tr'; s.textContent = W.grTranslit(t.replace(/[’']/g, '')); w.appendChild(s);
    });
    // keep punctuation on the same line as its word
    el.querySelectorAll('.w').forEach(function (w) {
      var n = w.nextSibling; if (!n || n.nodeType !== 3) return;
      var m = /^[,.;·:!?’”)\]]+/.exec(n.nodeValue); if (!m) return;
      n.nodeValue = n.nodeValue.slice(m[0].length); w.querySelector('.w-t').textContent += m[0];
    });
  }
  function plain(lang, toks) { return lang === 'g' ? G.greekText(toks) : G.latinText(toks); }
  function play(btn, lang, txt) {
    var on = btn.classList.contains('on');
    root.querySelectorAll('.rd-play.on').forEach(function (b) { b.classList.remove('on'); b.textContent = '▶'; });
    player.stop(); if (on) return;
    btn.classList.add('on'); btn.textContent = '■';
    player.speak(txt, lang, st.rate).then(function () { btn.classList.remove('on'); btn.textContent = '▶'; });
  }
  function nav() {
    var t = text(st.t), list = $('#rd-list');
    $('#rd-text').value = st.t;
    if (t.items) {
      list.hidden = false; $('#rd-navbox').hidden = false;
      list.innerHTML = t.items.map(function (it, i) { return '<li><a href="#' + it.id + '" data-i="' + i + '"' + (i === st.i ? ' aria-current="true"' : '') + '><span>' + esc(it.ref) + '</span> ' + esc(it.t) + '</a></li>'; }).join('');
    } else { list.hidden = true; $('#rd-navbox').hidden = true; }
  }
  function render() {
    var t = text(st.t); if (!t) { st.t = 'aesop'; t = text(st.t); }
    useLex(t); cur = {}; player.stop(); nav();
    var h = '<header class="rd-head"><p class="rd-grp">' + esc(t.grp) + '</p><h2>' + esc(t.t) + ' <small>' + esc(t.sub) + '</small></h2><p class="rd-note">' + esc(t.note) + '</p></header>';
    if (t.kind === 'lp') {
      h += '<div class="rd-cols3"><span>Koine Greek</span><span>Latin Vulgate</span>' + (st.en ? '<span>English (ESV)</span>' : '') + '</div>';
      t.v.forEach(function (v, i) {
        h += '<div class="rd-vs"><span class="vn">' + esc(v.ref.split(':')[1]) + '</span><div class="rd-vcols" style="--cols:' + (st.en ? 3 : 2) + '">' +
          '<div class="grc">' + words('g', v.g, 'g' + i) + ' <button class="vp rd-play" data-pl="g" data-k="g' + i + '" aria-label="Listen">▶</button></div>' +
          '<div class="lat">' + words('l', v.l, 'l' + i) + ' <button class="vp rd-play" data-pl="l" data-k="l' + i + '" aria-label="Listen">▶</button></div>' +
          (st.en ? '<div class="rd-en">' + esc(v.en) + '</div>' : '') + '</div></div>';
      });
      h += '<p class="rd-src">The Nestle 1904 Greek text ends verse 13 at “from evil”. The closing words “For yours is the kingdom…” are found in later manuscripts, and appear in the KJV. ' +
        'Read the whole chapter in the <a href="/languages/reader/#MAT6">Gospel reader</a>.</p>';
    } else if (t.kind === 'ps') {
      h += '<div class="rd-cols3"><span>Greek (Septuagint)</span><span>Latin (Vulgate)</span></div>';
      t.G.forEach(function (g, i) {
        h += '<div class="rd-vs"><span class="vn">' + (i + 1) + '</span><div class="rd-vcols" style="--cols:2">' +
          '<div><div class="grc">' + words('G', g, 'G' + i) + ' <button class="vp rd-play" data-pl="G" data-k="G' + i + '" aria-label="Listen">▶</button></div>' + (st.en ? '<p class="rd-en">' + esc(t.enG[i]) + '</p>' : '') + '</div>' +
          '<div><div class="lat">' + words('L', t.L[i], 'L' + i) + ' <button class="vp rd-play" data-pl="L" data-k="L' + i + '" aria-label="Listen">▶</button></div>' + (st.en ? '<p class="rd-en">' + esc(t.enL[i]) + '</p>' : '') + '</div></div></div>';
      });
      h += '<p class="rd-src">Verse numbers follow the English Bible. The Greek has “your cup”, the Latin “my cup”. Greek text: the Septuagint as edited by Rahlfs; Latin: the Clementine Vulgate.</p>';
    } else {
      st.i = Math.max(0, Math.min(t.items.length - 1, st.i));
      var it = t.items[st.i], lang = t.kind;
      h += '<article class="rd-item" id="' + it.id + '"><h3>' + (it.gt ? '<span class="grc">' + esc(it.gt) + '</span> · ' : '') + esc(it.t) + ' <small>' + (t.id === 'aesop' ? 'Fable ' : 'Book ') + esc(it.ref) + '</small></h3>' +
        '<div class="rd-text ' + (lang === 'G' ? 'grc' : 'lat') + (it.verse ? ' verse' : '') + '">' + it.s.map(function (s, j) { return words(lang, s, lang + j); }).join(' ') +
        ' <button class="vp rd-play" data-pl="' + lang + '" data-k="all" aria-label="Listen to the whole fable">▶ Listen</button></div>' +
        (st.en ? '<p class="rd-en rd-enp">' + esc(it.en) + '</p>' : '') +
        '<div class="rd-pn"><button type="button" class="cbtn" id="rd-prev"' + (st.i ? '' : ' disabled') + '>‹ Previous</button><span>' + (st.i + 1) + ' of ' + t.items.length + '</span><button type="button" class="cbtn" id="rd-next"' + (st.i < t.items.length - 1 ? '' : ' disabled') + '>Next ›</button></div></article>';
    }
    $('#rd-main').innerHTML = h; addPron($('#rd-main'));
    var pv = $('#rd-prev'), nx = $('#rd-next');
    if (pv) pv.onclick = function () { go(st.i - 1); };
    if (nx) nx.onclick = function () { go(st.i + 1); };
    var hash = t.items ? t.items[st.i].id : t.id; if (W.location.hash.slice(1) !== hash) W.history.replaceState(null, '', '#' + hash);
    save();
  }
  function go(i) { st.i = i; render(); var m = $('#rd-main'); if (m.getBoundingClientRect().top < 0) W.scrollTo({ top: m.getBoundingClientRect().top + W.scrollY - 70 }); }
  function fromHash() {
    var h = decodeURIComponent(W.location.hash.slice(1)); if (!h) return;
    data.texts.forEach(function (t) {
      if (t.id === h) { st.t = t.id; st.i = 0; }
      (t.items || []).forEach(function (it, i) { if (it.id === h) { st.t = t.id; st.i = i; } });
    });
  }
  function setup() {
    var sel = $('#rd-text');
    var grps = []; data.texts.forEach(function (t) { if (grps.indexOf(t.grp) < 0) grps.push(t.grp); });
    sel.innerHTML = grps.map(function (g) { return '<optgroup label="' + esc(g) + '">' + data.texts.filter(function (t) { return t.grp === g; }).map(function (t) { return '<option value="' + t.id + '">' + esc(t.t) + '</option>'; }).join('') + '</optgroup>'; }).join('');
    sel.onchange = function () { st.t = sel.value; st.i = 0; render(); };
    $('#rd-list').addEventListener('click', function (e) { var a = e.target.closest('[data-i]'); if (!a) return; e.preventDefault(); go(+a.dataset.i); });
    ['inter', 'pron', 'en'].forEach(function (k) { var el = $('#rd-' + k); el.checked = !!st[k]; el.onchange = function () { st[k] = el.checked; render(); }; });
    var sp = $('#rd-speed'); sp.value = st.rate; $('#rd-speed-v').textContent = (+st.rate).toFixed(1) + '×';
    sp.oninput = function () { st.rate = +sp.value; $('#rd-speed-v').textContent = st.rate.toFixed(1) + '×'; save(); };
    G.bindWords($('#rd-main'), function (lang, el) { var s = el.closest('.rd-s'); return s && cur[s.dataset.k] ? cur[s.dataset.k][+el.dataset.i] : null; }, panel);
    $('#rd-main').addEventListener('click', function (e) {
      var b = e.target.closest('.rd-play'); if (!b) return;
      var lang = b.dataset.pl, kind = (lang === 'G' || lang === 'g') ? 'g' : 'l', txt;
      if (b.dataset.k === 'all') { var t = text(st.t).items[st.i]; txt = t.s.map(function (s) { return plain(lang, s); }).join(' '); }
      else txt = plain(lang, cur[b.dataset.k]);
      play(b, kind, txt);
    });
    W.addEventListener('hashchange', function () { fromHash(); render(); });
  }
  G.getJSON('readings.json').then(function (d) {
    data = d; fromHash(); setup(); render();
  }).catch(function (e) { $('#rd-main').innerHTML = '<p class="err">Could not load the readings (' + esc(e.message) + '). <a href="">Try again</a></p>'; });
})(window, document);
