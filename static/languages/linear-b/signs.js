/* Linear B sign page (/languages/linear-b/signs/): the lookup box and the logogram list, from the kit's model
   (MathLadder.scripts, static/scripts/viz/scripts.js). No storage. */
(function (W, D) {
  'use strict';
  function ready(fn) { if (W.MathLadder && W.MathLadder.scripts) fn(W.MathLadder.scripts); else W.addEventListener('load', function () { if (W.MathLadder && W.MathLadder.scripts) fn(W.MathLadder.scripts); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  ready(function (S) {
    var box = D.getElementById('lb-logos');
    if (box) box.innerHTML = Object.keys(S.LOGO).filter(function (k) { return S.LOGO[k].kind === 'logo'; }).map(function (k) {
      var L = S.LOGO[k]; return '<div class="lb-logo"><span class="sc-b" role="img" aria-label="' + esc(L.en) + '">' + esc(L.u) + '</span><span><b>' + esc(k) + '</b><small>' + esc(L.en) + ' · ' + esc(L.n.replace(/ .*/, '')) + '</small></span></div>';
    }).join('');
    var q = D.getElementById('lb-q'), out = D.getElementById('lb-hit'), found = D.getElementById('lb-found');
    if (!q) return;
    function find(v) {
      v = v.trim(); if (!v) return null;
      var cp = v.codePointAt(0);
      if (cp >= 0x10000 && cp < 0x10080) { for (var i = 0; i < S.SIGNS.length; i++) if (S.SIGNS[i].cp === cp) return { b: S.SIGNS[i] }; }
      if (cp >= 0x10600 && cp < 0x10780) { for (var j = 0; j < S.LA_SIGNS.length; j++) if (S.LA_SIGNS[j].cp === cp) return { a: S.LA_SIGNS[j], b: S.LA_SIGNS[j].kind === 'syl' ? S.sign(S.LA_SIGNS[j].v) : null }; }
      if (cp >= 0x10080 && cp < 0x10140) { for (var k in S.LOGO) if (S.LOGO[k].cp === cp) return { l: S.LOGO[k] }; }
      var L = S.logo(v); if (L && v.length > 1 && !S.sign(v)) return { l: L };
      var b = S.sign(v.replace(/[₂₃]/g, function (d) { return d === '₂' ? '2' : '3'; }));
      return b ? { b: b, a: b.v ? S.laSign(b.v) : null } : null;
    }
    function show() {
      var r = find(q.value);
      if (!q.value.trim()) { out.innerHTML = ''; found.textContent = ''; return; }
      if (!r) { out.innerHTML = ''; found.textContent = 'No sign with that value or number. Try ka, a2, *18 or paste a sign.'; return; }
      found.textContent = '';
      var html = '<div class="lb-hitcard">';
      if (r.l) {
        html += '<span class="sc-b" style="font-size:5rem;line-height:1">' + esc(r.l.u) + '</span><div><p style="margin:.2rem 0"><b>' + esc(r.l.key) + '</b> (' + esc(r.l.n) + '): ' + (r.l.kind === 'logo' ? 'a logogram, ' : r.l.kind === 'measure' ? 'a measure sign, ' : '') + esc(r.l.en) + '.</p></div>';
      } else {
        var b = r.b;
        if (b) {
          var ex = S.wordsWith(b.v).slice(0, 4);
          html += '<span class="sc-b" style="font-size:5rem;line-height:1">' + esc(b.u) + '</span><div style="flex:1 1 16rem"><p style="margin:.2rem 0"><b>' + esc(b.n) + '</b> ' + (b.kind === 'unread' ? 'has no agreed value' + (b.prop ? ' (perhaps <span class="sc-tl">' + esc(b.prop) + '</span>)' : '') : '= <span class="sc-tl">' + esc(b.v) + '</span>' + (b.kind === 'special' ? ', usually read ' + esc(b.say) : '') + (b.doubt ? ' (doubtful)' : '')) + '.</p>' +
            (b.c !== undefined && b.kind === 'grid' ? '<p style="margin:.2rem 0">Row: ' + (b.c ? esc(S.ROW_NOTE[b.c]) : 'the vowels alone') + '.</p>' : '') +
            (ex.length ? '<p style="margin:.2rem 0">In ' + ex.map(function (k) { return '<span class="sc-b">' + esc(S.toSigns(k)) + '</span> <span class="sc-tl">' + esc(k) + '</span> (' + esc(S.WORDS[k].en) + ')'; }).join(', ') + '.</p>' : '') + '</div>';
        }
        if (r.a) html += '<div style="flex:1 1 14rem"><span class="sc-a" style="font-size:3.4rem;line-height:1">' + esc(r.a.u) + '</span><p style="margin:.2rem 0">Linear A <b>' + esc(r.a.n) + '</b>' + (r.a.kind === 'syl' ? ', read by convention as <span class="sc-tl">' + esc(r.a.v) + '</span>. The Minoan sound is a guess.' : '.') + '</p></div>';
      }
      out.innerHTML = html + '</div>';
    }
    q.addEventListener('input', show);
    try { var m = /[?&]q=([^&]+)/.exec(W.location.search); if (m) { q.value = decodeURIComponent(m[1]); show(); } } catch (e) { }
  });
})(window, document);
