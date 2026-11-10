/* "New probable primes" (/connections/rhythm-of-numbers/new-prime/): the copy buttons. Each button (class np-copy,
   data-target = the id of a digits box) copies the digits shown in that box (joined, no spaces) to the clipboard; it
   falls back to a hidden text area when the clipboard is not available. The page works without this script. */
(function () {
  'use strict';
  function wire(btn) {
    var box = document.getElementById(btn.getAttribute('data-target'));
    var msg = document.getElementById(btn.getAttribute('data-target') + '-msg');
    if (!box) return;
    btn.hidden = false;
    function say(t) { if (msg) msg.textContent = t; }
    function digits() {
      var g = box.querySelectorAll('.np-g'), s = '';
      for (var i = 0; i < g.length; i++) s += g[i].textContent;
      return s;
    }
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
  }
  var b = document.querySelectorAll('.np-copy');
  for (var i = 0; i < b.length; i++) wire(b[i]);
})();
