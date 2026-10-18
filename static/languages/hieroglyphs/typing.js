/* The transliteration typing helper (/languages/hieroglyphs/typing/): Manuel de Codage <-> Unicode transliteration, with a copy
   button, a keypad of the special letters, the Egyptological way to say each word and any word or royal name it matches in the
   model (MathLadder.egypt.WORDS, NAMES). Settings in localStorage 'trb-hiero-v1' (prefs.type). Needs hiero.js. */
(function (W, D) {
  'use strict';
  var T = W.TRBHiero; if (!T) return;
  T.ready(function (E) {
    var $ = T.$, esc = T.esc, mdc = $('#ht-mdc'), uni = $('#ht-uni'), sayBox = $('#ht-say');
    var st = T.load(), P = (st.prefs = st.prefs || {}).type = (st.prefs.type || {});
    var yod = P.yod || 'j', qq = P.q || 'q', digits = !!P.digits;
    var YODCAP = { j: 'J', 'ꞽ': 'Ꞽ', 'ỉ': 'Ỉ', i: 'I' };
    function M2U() { return { A: 'ꜣ', a: 'ꜥ', i: yod, I: YODCAP[yod], H: 'ḥ', x: 'ḫ', X: 'ẖ', S: 'š', T: 'ṯ', D: 'ḏ', q: qq, Q: qq === 'ḳ' ? 'Ḳ' : 'Q' }; }
    function toUni(s) { var m = M2U(); return s.replace(/[AaiIHxXSTDqQ3`]/g, function (c) { if (c === '3' || c === '`') return digits ? (c === '3' ? 'ꜣ' : 'ꜥ') : c; return m[c]; }); }
    var U2M = { 'ꜣ': 'A', 'Ꜣ': 'A', 'ȝ': 'A', 'Ȝ': 'A', 'ꜥ': 'a', 'Ꜥ': 'a', 'ʿ': 'a', 'ʽ': 'a', 'j': 'i', 'ꞽ': 'i', 'ỉ': 'i', 'ı': 'i', 'J': 'I', 'Ꞽ': 'I', 'Ỉ': 'I',
      'ḥ': 'H', 'Ḥ': 'H', 'ḫ': 'x', 'Ḫ': 'x', 'ẖ': 'X', 'š': 'S', 'Š': 'S', 'ṯ': 'T', 'Ṯ': 'T', 'ḏ': 'D', 'Ḏ': 'D', 'ḳ': 'q', 'Ḳ': 'Q', 'ś': 'z', 'Ś': 'Z' };
    function toMdc(s) {
      s = s.normalize ? s.normalize('NFC') : s;
      s = s.replace(/[iıI][̯͗̓]/g, function (c) { return c[0] === 'I' ? 'I' : 'i'; }).replace(/[hH]̱/g, 'X').replace(/[tT]̱/g, 'T').replace(/[dD]̱/g, 'D').replace(/[hH]̮/g, 'x');
      var out = ''; for (var i = 0; i < s.length; i++) { var c = s[i]; out += U2M[c] !== undefined ? U2M[c] : c; }
      return out;
    }
    function reading() {
      var text = uni.value.trim();
      if (!text) { sayBox.innerHTML = '<p class="ht-empty">Type something above to see how it is said.</p>'; return; }
      var words = text.split(/\s+/).slice(0, 24), html = '';
      var whole = matchOf(text);
      if (whole && words.length > 1) html += matchHTML(text, whole, true);
      words.forEach(function (w) {
        var k = E.norm(w);
        if (k === null) { html += '<div class="ht-w"><span class="eg-tl">' + esc(w) + '</span> <small class="ht-bad">has letters that are not Egyptian transliteration</small></div>'; return; }
        var m = matchOf(w);
        html += m ? matchHTML(w, m) : '<div class="ht-w"><span class="eg-tl">' + esc(E.show(w)) + '</span> <small>say “' + esc(E.say(w)) + '”</small></div>';
      });
      sayBox.innerHTML = html + '<p class="ht-foot">“Say” forms follow the Egyptologists’ convention (an e between consonants); Egyptian vowels were not written. Words found in the site’s word list show their hieroglyphs.</p>';
    }
    function matchOf(w) {
      var hit = null;
      Object.keys(E.WORDS).some(function (k) { if (E.same(E.WORDS[k].tl, w)) { hit = E.WORDS[k]; return true; } return false; });
      if (!hit) Object.keys(E.NAMES).some(function (k) { if (E.same(E.NAMES[k].tl, w)) { hit = E.NAMES[k]; hit = { tl: hit.tl, en: hit.en + ' (a royal name)', sp: hit.sp }; return true; } return false; });
      return hit;
    }
    function matchHTML(w, m, big) {
      return '<div class="ht-w ht-hit' + (big ? ' ht-whole' : '') + '">' + T.glyphSVG(m.sp, { U: big ? 46 : 36, max: 260, label: 'Hieroglyphs for ' + E.show(m.tl) }) +
        '<span><span class="eg-tl">' + esc(E.show(w)) + '</span> <small>say “' + esc(E.say(m.tl)) + '”</small><br>“' + esc(m.en) + '”</span></div>';
    }
    function fromMdc() { uni.value = toUni(mdc.value); reading(); }
    function fromUni() { mdc.value = toMdc(uni.value); reading(); }
    mdc.addEventListener('input', fromMdc); uni.addEventListener('input', fromUni);
    $('#ht-copy-mdc').addEventListener('click', function () { T.copy(mdc.value, this); });
    $('#ht-copy-uni').addEventListener('click', function () { T.copy(uni.value, this); });
    $('#ht-clear').addEventListener('click', function () { mdc.value = ''; uni.value = ''; reading(); mdc.focus(); });
    // keypad for the Unicode box
    var keys = $('#ht-keys');
    ['ꜣ', 'j', 'ꜥ', 'ḥ', 'ḫ', 'ẖ', 'z', 'š', 'q', 'ṯ', 'ḏ', '.', '=', '-'].forEach(function (c) {
      var b = D.createElement('button'); b.type = 'button'; b.className = 'ht-key eg-tl'; b.textContent = c; b.setAttribute('aria-label', 'Insert ' + c);
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        var ch = c === 'j' ? yod : c === 'q' ? qq : c, a = uni.selectionStart == null ? uni.value.length : uni.selectionStart, z = uni.selectionEnd == null ? a : uni.selectionEnd;
        uni.value = uni.value.slice(0, a) + ch + uni.value.slice(z); uni.focus(); try { uni.setSelectionRange(a + ch.length, a + ch.length); } catch (e) { } fromUni();
      });
      keys.appendChild(b);
    });
    // options
    function seg(id, cur, set) {
      var box = $(id);
      T.$$('button', box).forEach(function (b) { var on = b.dataset.v === cur; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; set(b.dataset.v); T.$$('button', box).forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); save(); fromMdc(); keyLabels(); });
    }
    function save() { P.yod = yod; P.q = qq; P.digits = digits; T.save(st); }
    function keyLabels() { T.$$('.ht-key', keys).forEach(function (b, i) { if (i === 1) b.textContent = yod; if (i === 8) b.textContent = qq; }); }
    seg('#ht-yod', yod, function (v) { yod = v; }); seg('#ht-q', qq, function (v) { qq = v; });
    var dg = $('#ht-digits'); dg.checked = digits; dg.addEventListener('change', function () { digits = dg.checked; save(); fromMdc(); });
    keyLabels();
    // the table
    $('#ht-table').innerHTML = '<table class="ht-tab"><thead><tr><th>Sign</th><th>Letter</th><th>Type</th><th>Said</th><th class="ht-nt">Note</th></tr></thead><tbody>' + E.ALPHA.map(function (a) {
      var S = E.SIGNS[a[2]];
      return '<tr><td class="eg-h">' + S.u + '</td><td class="eg-tl">' + esc(a[0] === 'j' ? 'j' : a[0]) + '</td><td><kbd>' + esc(a[1]) + '</kbd></td><td>' + esc(a[3]) + '</td><td class="ht-nt">' + esc(a[4]) + '</td></tr>';
    }).join('') + '</tbody></table>';
    try { var m = /[?&]t=([^&]+)/.exec(W.location.search); if (m) mdc.value = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { }
    fromMdc();
  });
})(window, document);
