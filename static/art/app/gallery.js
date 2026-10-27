/* Art & Drawing Ladder: the Museum Walk filters (layouts/art/gallery.html). Search, region, period and "only with pictures".
   The filter choice is remembered in this browser (localStorage key trb-art-gallery, a convenience only). */
(function () {
  'use strict';
  var root = document.getElementById('arg'); if (!root) return;
  var q = document.getElementById('arg-q'), tr = document.getElementById('arg-track'), pe = document.getElementById('arg-period'), pics = document.getElementById('arg-pics'), count = document.getElementById('arg-count');
  var secs = [].slice.call(root.querySelectorAll('.arpg-period')), KEY = 'trb-art-gallery';
  try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (s.track) tr.value = s.track; if (s.period) pe.value = s.period; if (s.pics) pics.checked = true; } catch (e) { }
  var hp = /^#p-(.+)$/.exec(location.hash || ''); if (hp) { pe.value = hp[1]; tr.value = ''; }
  function syncPeriods() { [].forEach.call(pe.options, function (o) { o.hidden = !!(o.value && tr.value && o.getAttribute('data-track') !== tr.value); }); if (pe.selectedOptions[0] && pe.selectedOptions[0].hidden) pe.value = ''; }
  function run() {
    syncPeriods();
    var words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean), shown = 0, total = 0;
    secs.forEach(function (sec) {
      var ok = (!tr.value || sec.getAttribute('data-track') === tr.value) && (!pe.value || sec.getAttribute('data-period') === pe.value), any = false;
      [].forEach.call(sec.querySelectorAll('.arpg-card'), function (c) {
        total++;
        var vis = ok && (!pics.checked || c.getAttribute('data-pic')) && words.every(function (w) { return c.getAttribute('data-s').indexOf(w) >= 0; });
        c.hidden = !vis; if (vis) { shown++; any = true; }
      });
      sec.hidden = !any;
    });
    count.textContent = shown === total ? total + ' works' : shown + ' of ' + total + ' works';
    try { localStorage.setItem(KEY, JSON.stringify({ track: tr.value, period: pe.value, pics: pics.checked })); } catch (e) { }
  }
  [q, tr, pe, pics].forEach(function (el) { el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
})();
