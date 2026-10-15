/* Cars course: the systems map. Point at (or focus) a system in the drawing or the legend to highlight it;
   click to open its lesson. The Gas car / Electric car switch swaps the drivetrain. Works as plain links without JS. */
(function (D) {
  'use strict';
  D.querySelectorAll('.tr-map').forEach(function (map) {
    var info = map.querySelector('.tr-map-info'), legend = map.querySelectorAll('.tr-legend a[data-sys]');
    var desc = {}, names = {};
    legend.forEach(function (a) { desc[a.dataset.sys] = a.dataset.desc; names[a.dataset.sys] = a.querySelector('span').firstChild.textContent.trim(); });
    var idle = info ? info.textContent : '';
    function show(sys) {
      map.classList.toggle('hl', !!sys);
      map.querySelectorAll('[data-sys]').forEach(function (el) { el.classList.toggle('on', !!sys && el.dataset.sys === sys); });
      if (!info) return;
      if (sys) {
        info.textContent = '';
        var b = D.createElement('b'); b.textContent = names[sys] + ': ';
        info.appendChild(b); info.appendChild(D.createTextNode(desc[sys] + ' Click to open the lesson.'));
      } else info.textContent = idle;
    }
    map.querySelectorAll('[data-sys]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { show(el.dataset.sys); });
      el.addEventListener('focus', function () { show(el.dataset.sys); });
      el.addEventListener('mouseleave', function () { show(null); });
      el.addEventListener('blur', function () { show(null); });
    });
    map.querySelectorAll('.tr-seg button[data-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        map.dataset.view = b.dataset.v;
        map.querySelectorAll('.tr-seg button[data-v]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        show(null);
        idle = b.dataset.v === 'ev' ? 'Electric car: no engine, exhaust or fuel tank. A battery pack under the floor feeds a motor at the drive axle.' : 'Point at a part of the car.';
        if (info) info.textContent = idle;
      });
    });
  });
})(document);
