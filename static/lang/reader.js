/* Gospel reader: full Greek (Nestle 1904) and Latin (Vulgate) text of the four Gospels with word-by-word grammar. */
(function (W, D) {
  'use strict';
  var G = W.Gospels, $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var root = $('#reader'); if (!root) return;
  var panel = $('#word-panel'), player = new G.Player();
  var CHAPTERS = { MAT: 28, MRK: 16, LUK: 24, JHN: 21 };
  var st = { b: 'JHN', c: 1, g: true, l: true, en: true, inter: false, only: false };
  try { var s0 = JSON.parse(W.localStorage.getItem('trb-reader')); if (s0) for (var k in s0) st[k] = s0[k]; } catch (e) { }
  var m = /#(MAT|MRK|LUK|JHN)(\d+)/.exec(W.location.hash); if (m) { st.b = m[1]; st.c = +m[2]; }
  function save() { try { W.localStorage.setItem('trb-reader', JSON.stringify(st)); } catch (e) { } }

  var esv = {}, drill = {}, passages = [], book = {};
  var BN = { MAT: 40, MRK: 41, LUK: 42, JHN: 43 };

  Promise.all([G.loadLex(), G.getJSON('esv.json'), G.getJSON('drills.json')]).then(function (r) {
    esv = r[1]; passages = r[2].passages;
    r[2].verses.forEach(function (v) { drill[v.b + ' ' + v.c + ':' + v.v] = v; });
    setup(); load();
  }).catch(function (e) { $('#text').innerHTML = '<p class="err">Could not load the text (' + G.esc(e.message) + ').</p>'; });

  function setup() {
    var bs = $('#r-book'), cs = $('#r-chap');
    bs.value = st.b;
    function fillCh() { cs.innerHTML = ''; for (var i = 1; i <= CHAPTERS[st.b]; i++) cs.insertAdjacentHTML('beforeend', '<option>' + i + '</option>'); cs.value = st.c; }
    fillCh();
    bs.addEventListener('change', function () { st.b = bs.value; st.c = 1; fillCh(); load(); });
    cs.addEventListener('change', function () { st.c = +cs.value; load(); });
    $('#r-prev').addEventListener('click', function () { go(-1); });
    $('#r-next').addEventListener('click', function () { go(1); });
    ['g', 'l', 'en', 'inter', 'only'].forEach(function (k) {
      var el = $('#t-' + k); el.checked = !!st[k];
      el.addEventListener('change', function () { st[k] = el.checked; save(); render(); });
    });
    function go(d) {
      var c = st.c + d;
      if (c < 1 || c > CHAPTERS[st.b]) return;
      st.c = c; cs.value = c; load(); W.scrollTo({ top: root.offsetTop - 10, behavior: 'smooth' });
    }
    G.bindWords($('#text'), function (lang, el) {
      var vv = el.closest('.vs').dataset.v, ch = book[lang][String(st.c)] || {};
      return (ch[vv] || [])[+el.dataset.i];
    }, panel);
    $('#text').addEventListener('click', function (e) {
      var b = e.target.closest('[data-play]'); if (!b) return;
      var vs = b.closest('.vs'), v = vs.dataset.v, k = b.dataset.play; playVerse(k, v, vs);
    });
  }
  function load() {
    save(); W.history.replaceState(null, '', '#' + st.b + st.c);
    $('#r-chap').value = st.c; $('#r-book').value = st.b;
    $('#text').innerHTML = '<p class="muted">Loading…</p>';
    Promise.all([G.getJSON('grc-' + st.b + '.json'), G.getJSON('lat-' + st.b + '.json')]).then(function (r) {
      book = { g: r[0], l: r[1] }; render();
    });
  }
  function heading(v) {
    for (var i = 0; i < passages.length; i++) { var p = passages[i]; if (p[0] === st.b && p[1] === st.c && p[2] === v) return p[4]; }
    return null;
  }
  function render() {
    var gch = book.g[String(st.c)] || {}, lch = book.l[String(st.c)] || {};
    var nums = Object.keys(gch).concat(Object.keys(lch)).map(Number).filter(function (x, i, a) { return a.indexOf(x) === i; }).sort(function (a, b) { return a - b; });
    var cols = ['g', 'l', 'en'].filter(function (k) { return st[k]; });
    root.style.setProperty('--cols', cols.length || 1);
    var h = '<h2 class="ch-title"><span class="grc">Κατὰ ' + G.GREEK_BOOKS[st.b] + '</span> · <span class="lat">Secundum ' + G.LATIN_BOOKS[st.b] + '</span> · ' + G.BOOKS[st.b] + ' ' + st.c + '</h2>';
    h += '<div class="cols-head">' + cols.map(function (k) { return '<span>' + { g: 'Koine Greek', l: 'Latin Vulgate', en: 'English (ESV, selected verses)' }[k] + '</span>'; }).join('') + '</div>';
    var shown = 0;
    nums.forEach(function (v) {
      var ref = st.b + ' ' + st.c + ':' + v, dv = drill[ref];
      if (st.only && !dv) return;
      shown++;
      var hd = heading(v); if (hd) h += '<h3 class="pass">★ ' + G.esc(hd) + '</h3>';
      var esvKey = String(BN[st.b]).padStart(2, '0') + String(st.c).padStart(3, '0') + String(v).padStart(3, '0');
      h += '<div class="vs' + (dv ? ' star' : '') + '" data-v="' + v + '"><span class="vn" title="' + ref + '">' + v + '</span><div class="vcols">';
      cols.forEach(function (k) {
        if (k === 'en') {
          var t = esv[esvKey];
          h += '<div class="vc vc-en">' + (t ? G.esc(t) + ' <button class="vp" data-play="en" aria-label="Play English">▶</button>' : '<span class="muted">—</span>') + '</div>';
        } else {
          var toks = (k === 'g' ? gch : lch)[String(v)];
          h += '<div class="vc vc-' + k + ' ' + (k === 'g' ? 'grc' : 'lat') + '">' + (toks ? G.renderWords(k, toks, { interlinear: st.inter }) + ' <button class="vp" data-play="' + k + '" aria-label="Play">▶</button>' : '<span class="muted">(not in this text)</span>') + '</div>';
        }
      });
      h += '</div></div>';
    });
    if (!shown) h += '<p class="muted">No drill verses in this chapter. Turn off “Drill verses only” to read the whole chapter.</p>';
    $('#text').innerHTML = h;
    $('#r-prev').disabled = st.c <= 1; $('#r-next').disabled = st.c >= CHAPTERS[st.b];
  }
  function playVerse(k, v, vs) {
    player.stop();
    $$('.vs.playing').forEach(function (x) { x.classList.remove('playing'); });
    vs.classList.add('playing');
    var dv = drill[st.b + ' ' + st.c + ':' + v], rate = +$('#r-speed').value, p;
    if (k === 'g' && dv && dv.a) p = player.clip(dv.a, rate);
    else if (k === 'en') p = player.speak(vs.querySelector('.vc-en').textContent.replace('▶', ''), 'en', rate);
    else {
      var toks = book[k][String(st.c)][String(v)];
      p = player.speak(k === 'g' ? G.greekText(toks) : G.latinText(toks), k, rate);
    }
    p.then(function () { vs.classList.remove('playing'); });
  }
  var rs = $('#r-speed'); rs.addEventListener('input', function () { $('#r-speed-v').textContent = (+rs.value).toFixed(1) + '×'; });
})(window, document);
