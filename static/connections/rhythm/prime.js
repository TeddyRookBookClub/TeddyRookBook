/* "A new probable prime" (/connections/rhythm-of-numbers/new-prime/): the copy button. Copies the digits shown on the
   page (joined, no spaces) to the clipboard; falls back to selecting them when the clipboard is not available. */
(function () {
  'use strict';
  var btn = document.getElementById('npCopy');
  var box = document.getElementById('npDigits');
  var msg = document.getElementById('npMsg');
  if (!btn || !box) return;
  btn.hidden = false;
  function digits() {
    var g = box.querySelectorAll('.np-g'), s = '';
    for (var i = 0; i < g.length; i++) s += g[i].textContent;
    return s;
  }
  function say(t) { if (msg) msg.textContent = t; }
  function fallback(s) {
    var ta = document.createElement('textarea');
    ta.value = s; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    say(ok ? 'Copied all ' + s.length.toLocaleString('en-US') + ' digits.' : 'Copying is blocked here. Use the download link instead.');
  }
  btn.addEventListener('click', function () {
    var s = digits();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(function () {
        say('Copied all ' + s.length.toLocaleString('en-US') + ' digits.');
      }, function () { fallback(s); });
    } else {
      fallback(s);
    }
  });
})();
