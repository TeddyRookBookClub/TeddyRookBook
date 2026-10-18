/* The hieroglyph sign list (/languages/hieroglyphs/signs/): every sign in MathLadder.egypt.SIGNS, grouped by Gardiner category,
   searchable by code, sound (Unicode or Manuel de Codage) or meaning. Needs hiero.js. */
(function (W, D) {
  'use strict';
  var T = W.TRBHiero; if (!T) return;
  T.ready(function (E) {
    var esc = T.esc, $ = T.$, list = $('#hs-list'), q = $('#hs-q'), kindsBox = $('#hs-kinds'), catsBox = $('#hs-cats'), count = $('#hs-count');
    var codes = Object.keys(E.SIGNS).sort(T.codeSort), kind = '';
    var tot = $('#hs-total'); if (tot) tot.textContent = codes.length + ' signs';
    var KORDER = ['uni', 'bi', 'tri', 'logo', 'det', 'num'];
    // the search text of each sign
    var info = {};
    codes.forEach(function (c) {
      var S = E.SIGNS[c], ex = T.examples(c);
      info[c] = { S: S, ex: ex, vals: S.v.map(function (v) { return E.norm(v, true); }).filter(Boolean),
        words: (S.n + ' ' + S.use + ' ' + ex.map(function (x) { return x.en; }).join(' ')).toLowerCase() };
    });
    function card(c) {
      var I = info[c], S = I.S, K = T.KIND[S.k] || [S.k, ''], ex = I.ex[0];
      var vals = S.v.length ? S.v.map(function (v) { return T.tl(v) + ' <small class="hs-say">say “' + esc(E.say(v)) + '”</small>'; }).join('<span class="hs-or"> or </span>') : '<span class="hs-none">not read aloud</span>';
      var exHTML = '';
      if (ex) exHTML = '<div class="hs-ex"><span class="hs-k">Example</span><span class="hs-exw">' + T.glyphSVG(ex.sp, { U: 30, max: 190, label: 'Hieroglyphs for ' + E.show(ex.tl) }) + '</span><span>' + T.tl(ex.tl) + ' “' + esc(ex.en) + '”' + (ex.kind === 'name' ? ' <small>(a royal name)</small>' : '') + (I.ex.length > 1 ? ' <small class="hs-more">+ ' + (I.ex.length - 1) + ' more</small>' : '') + '</span></div>';
      return '<article class="hs-card k-' + S.k + '" id="sign-' + esc(c) + '" data-code="' + esc(c) + '">' +
        '<div class="hs-top"><span class="hs-glyph eg-h" aria-hidden="true">' + S.u + '</span>' +
        '<div class="hs-id"><h3 class="hs-code">' + esc(c) + '</h3><span class="hs-kind">' + esc(K[0]) + (K[1] ? ' <small>(' + esc(K[1]) + ')</small>' : '') + '</span>' +
        '<button type="button" class="linkbtn hs-copy" data-u="' + S.u + '" aria-label="Copy the sign ' + esc(c) + '">Copy sign</button></div></div>' +
        '<dl class="hs-dl"><dt>Shows</dt><dd>' + esc(S.n) + '</dd><dt>Sound</dt><dd>' + vals + '</dd>' + (S.use ? '<dt>Meaning</dt><dd>' + useHTML(S.use) + '</dd>' : '') + '</dl>' + exHTML +
        '<p class="hs-uni">' + T.cp(S.u) + ' · ' + esc(T.uniName(c)) + '</p></article>';
    }
    // put transliterated words (letters with dots and hooks) in the transliteration font; quoted English stays plain
    function useHTML(u) { return esc(u).replace(/(^|[\s(;,])((?:[ꜣꜥjywbpfmnrhḥḫẖzsšqkgtṯdḏ]+[-=.]?)*[ꜣꜥḥḫẖšṯḏ][ꜣꜥjywbpfmnrhḥḫẖzsšqkgtṯdḏ\-=.]*)/g, '$1<span class="eg-tl">$2</span>'); }
    function matches(c, s) {
      var I = info[c]; if (kind && I.S.k !== kind) return false;
      if (!s) return true;
      var lo = s.toLowerCase().trim();
      if (/^[a-z]{1,2}\d+[a-z]?$/i.test(s.trim())) { // a code: G17, g17, aa1, n35a
        return c.toLowerCase() === lo;
      }
      var k = E.norm(s.trim(), true);
      if (k && I.vals.some(function (v) { return v === k || (k.length >= 2 && v.indexOf(k) >= 0); })) return true;
      if (k && E.norm(s.trim()) && I.vals.some(function (v) { return v.replace(/z/g, 's') === E.norm(s.trim()); })) return true;
      return lo.length >= 2 && new RegExp('(^|[^a-z])' + lo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(I.words);
    }
    function render() {
      var s = q.value, shown = 0, html = '';
      T.CATS.forEach(function (C) {
        var inCat = codes.filter(function (c) { return T.cat(c) === C[0]; }), hit = inCat.filter(function (c) { return matches(c, s); });
        if (!hit.length) return; shown += hit.length;
        html += '<section class="hs-cat" id="cat-' + C[0] + '"><h2><span class="hs-letter">' + C[0] + '</span> ' + esc(C[1]) + ' <small>' + hit.length + (hit.length < inCat.length ? ' of ' + inCat.length : '') + ' sign' + (inCat.length === 1 ? '' : 's') + '</small></h2><div class="hs-grid">' + hit.map(card).join('') + '</div></section>';
      });
      list.innerHTML = html || '<p class="hs-empty">No sign matches “' + esc(s) + '”. Try a code like <b>D21</b>, a sound like <b>nfr</b> (or <b>Htp</b> for <span class="eg-tl">ḥtp</span>), or a word like <b>water</b>.</p>';
      count.textContent = (s || kind ? shown + ' of ' : '') + codes.length + ' signs';
      T.$$('.hs-cats a', D).forEach(function (a) { a.classList.toggle('off', !D.getElementById('cat-' + a.dataset.c)); });
    }
    // kinds
    var kb = '<button type="button" class="chip on" data-k="" aria-pressed="true">All kinds</button>';
    KORDER.forEach(function (k) { var n = codes.filter(function (c) { return E.SIGNS[c].k === k; }).length; if (n) kb += '<button type="button" class="chip" data-k="' + k + '" aria-pressed="false">' + esc(T.KIND[k][0]) + 's <small>' + n + '</small></button>'; });
    kindsBox.innerHTML = kb;
    kindsBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; kind = b.dataset.k; T.$$('button', kindsBox).forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); render(); });
    // the category index
    catsBox.innerHTML = T.CATS.map(function (C) { var n = codes.filter(function (c) { return T.cat(c) === C[0]; }).length; return n ? '<a href="#cat-' + C[0] + '" data-c="' + C[0] + '" title="' + esc(C[1]) + '">' + C[0] + '</a>' : '<span class="off" title="' + esc(C[1]) + ': none in this list yet">' + C[0] + '</span>'; }).join('');
    var tmr; q.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(render, 120); });
    list.addEventListener('click', function (e) { var b = e.target.closest('.hs-copy'); if (b) T.copy(b.dataset.u, b); });
    // ?q= or #sign-G17 links
    try { var m = /[?&]q=([^&]+)/.exec(W.location.search); if (m) q.value = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { }
    render();
    function target() {
      if (!/^#sign-/.test(W.location.hash)) return;
      var t = D.getElementById(decodeURIComponent(W.location.hash.slice(1)));
      if (!t && (q.value || kind)) { q.value = ''; kind = ''; T.$$('button', kindsBox).forEach(function (x, i) { x.classList.toggle('on', !i); x.setAttribute('aria-pressed', String(!i)); }); render(); t = D.getElementById(decodeURIComponent(W.location.hash.slice(1))); }
      T.$$('.hs-target', list).forEach(function (x) { x.classList.remove('hs-target'); });
      if (t) { t.classList.add('hs-target'); t.scrollIntoView(); }
    }
    target(); W.addEventListener('hashchange', target);
  });
})(window, document);
