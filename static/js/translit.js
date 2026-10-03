/* Shows Greek in Latin letters (pronunciation) after Greek words in the games. It never changes the page text:
   it sets a data-tr attribute and CSS draws it, so the games' own code is unaffected. */
(function (W, D) {
  'use strict';
  var TR = { 'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'ē', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'ō' };
  function translit(s) {
    return s.split(/(\s+)/).map(function (w) {
      var d = w.normalize('NFD'), out = '', prev = '', rough = d.indexOf('̔') >= 0, cap = /^[Α-Ω]/.test(d), started = false;
      for (var i = 0; i < d.length; i++) {
        var ch = d[i], lc = ch.toLowerCase(), r = TR[lc];
        if (r == null) {
          if (ch === '́' || ch === '̀' || ch === '͂') out += '́';       // any accent -> stress mark
          else if (ch === '̈') out += '̈';
          else if (ch === 'ͅ') out += 'i';                                             // iota subscript
          else if (ch === '̓' || ch === '̔') { }                                   // breathings handled below
          else if (ch === '’' || ch === '᾽' || ch === 'ʼ') out += '’';
          else out += ch;
          continue;
        }
        if (lc === 'γ' && /[γκξχ]/.test((d[i + 1] || '').toLowerCase())) r = 'n';
        if (lc === 'υ' && /[αεοη]/.test(prev) && d[i + 1] !== '̈') r = 'u';
        if (lc === 'υ' && /^[\u0300-\u036f]*ι(?![\u0300-\u036f]*\u0308)/.test(d.slice(i + 1).toLowerCase())) r = 'u';
        if (!started) { started = true; if (rough) r = lc === 'ρ' ? 'rh' : 'h' + r; }
        out += r; prev = lc;
      }
      out = out.normalize('NFC');
      return cap ? out.charAt(0).toUpperCase() + out.slice(1) : out;
    }).join('');
  }
  W.grTranslit = translit;
  // Where to add it. Kept to places with room: not tool lists, map labels or tiles.
  var SEL = [
    '.th .gr',
    '.fest .f-info .lg', '.fest .f-feed .lg', '.fest .f-toast .lg', '.fest .f-goals .lg', '.fest .sbox .lg', '.fest .f-help td.lg', '.fest .f-side h3 .lg',
    '.imperium #im-log .grc', '.imperium #im-info .grc', '.imperium .im-mbox .grc', '.imperium .im-title .grc', '.imperium .im-scen .grc',
    '.tt .grc:not(.pn)'
  ].join(',');
  var GREEK = /[\u0370-\u03ff\u1f00-\u1fff]/;
  function mark(root) {
    if (!root.querySelectorAll) return;
    var els = root.querySelectorAll(SEL), i, el, t;
    for (i = 0; i < els.length; i++) {
      el = els[i]; t = el.textContent;
      if (!GREEK.test(t) || el.querySelector(SEL)) { if (el.hasAttribute('data-tr')) el.removeAttribute('data-tr'); continue; }
      t = translit(t.trim()); if (el.getAttribute('data-tr') !== t) el.setAttribute('data-tr', t);
    }
  }
  var st = D.createElement('style');
  st.textContent = '[data-tr]::after{content:" " attr(data-tr);font:italic .72em Georgia,serif;opacity:.72;font-weight:400;letter-spacing:0;text-transform:none;white-space:normal}' +
    '.vx:not(.inline)>[data-tr]::after,.th .big[data-tr]::after,.th .quote[data-tr]::after,h2[data-tr]::after{display:block;content:attr(data-tr);font-size:.5em;line-height:1.2}' +
    '.vx:not(.inline)>[data-tr]::after{font-size:.75em}.th .quote[data-tr]::after{font-size:.62em}';
  D.head.appendChild(st);
  var pending = false;
  function run() { pending = false; mark(D.body); }
  function start() {
    mark(D.body);
    new MutationObserver(function () { if (!pending) { pending = true; (W.requestAnimationFrame || setTimeout)(run); } }).observe(D.body, { childList: true, subtree: true, characterData: true });
  }
  if (D.body) start(); else D.addEventListener('DOMContentLoaded', start);
})(window, document);
