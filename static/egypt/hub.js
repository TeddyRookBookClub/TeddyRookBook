/* /egypt/map/: the list of sites under the full-page map, grouped by region; choosing one centers the map on it. */
(function () {
  'use strict';
  var REG = [['lower', 'Lower Egypt and the Delta'], ['middle', 'Middle Egypt and the Faiyum'], ['upper', 'Upper Egypt'], ['nubia', 'Nubia (Kush)'], ['sinai', 'Sinai'], ['desert', 'The deserts and the Red Sea'], ['levant', 'The Levant']];
  function build() {
    var E = window.MathLadder && window.MathLadder.egypt, host = document.getElementById('eg-sites'), map = document.getElementById('eg-bigmap');
    if (!E || !host) return false;
    host.innerHTML = '';
    REG.forEach(function (r) {
      var list = E.SITES.filter(function (s) { return s.region === r[0]; }); if (!list.length) return;
      var h = document.createElement('h3'); h.className = 'eg-reg'; h.textContent = r[1]; host.appendChild(h);
      var box = document.createElement('div'); box.className = 'eg-sitebtns'; host.appendChild(box);
      list.forEach(function (s) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'eg-sitebtn';
        b.innerHTML = s.name.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<small>' + E.period(s.periods[0]).name.replace(/ Period$/, '') + (s.periods.length > 1 ? ' +' : '') + '</small>';
        b.title = s.note;
        b.addEventListener('click', function () { if (map && map._ml && map._ml.focus) { map._ml.focus(s.key); map.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
        box.appendChild(b);
      });
    });
    return true;
  }
  function go() { if (!build()) setTimeout(go, 150); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
