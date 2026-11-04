/* gbrome.tacitus-annals-histories: visual gb-emperors (gbe3, our own design). The emperors from AD 14 to 96 on one
   time line, with the parts of Tacitus's Annals and Histories that survive (solid) and that are lost (hatched).
   Tap an emperor to read how Tacitus covers his reign. */
var EMP = [
  ['Tiberius', 14, 37, 'Annals 1–6', 'Augustus’s stepson. Tacitus paints him as able but secretive and suspicious; his minister Sejanus grows powerful, and treason trials spread fear in the senate. Most of this survives (part of Book 5 is lost).'],
  ['Caligula', 37, 41, 'Annals 7–10 (lost)', 'The whole account of his reign is lost. We know it from other writers, such as Suetonius and Cassius Dio.'],
  ['Claudius', 41, 54, 'Annals 7–12', 'The surviving text picks up in AD 47, halfway through his reign: the conquest of Britain is under way, and Claudius’s wives and freedmen hold great power at court.'],
  ['Nero', 54, 68, 'Annals 13–16', 'Nero’s early years go well under his advisers, the philosopher Seneca and Burrus. Then come crimes, the great fire of Rome in AD 64, and a failed plot against him. The text breaks off in AD 66.'],
  ['Galba', 68, 69, 'Histories 1', 'The first of the four emperors of AD 69. Tacitus says everyone would have thought him fit to rule, had he never ruled.'],
  ['Otho', 69, 69, 'Histories 1–2', 'He seizes power in January 69 and dies in April after his army is beaten.'],
  ['Vitellius', 69, 69, 'Histories 2–3', 'The commander of the Rhine armies, who holds Rome for most of the year 69.'],
  ['Vespasian', 69, 79, 'Histories 2–5', 'The general of the East, who ends the civil war and founds the Flavian dynasty. The surviving Histories stop in AD 70.'],
  ['Titus', 79, 81, 'Histories (lost)', 'Vespasian’s son. Tacitus’s account of his reign is lost.'],
  ['Domitian', 81, 96, 'Histories (lost)', 'Vespasian’s younger son. Tacitus lived through his reign as a senator and wrote of it with bitterness in the Agricola; the Histories’ account is lost.']
];
var SURV = [[14, 29, 'A'], [31, 37, 'A'], [47, 66, 'A'], [69, 70, 'H']];
var LOST = [[29, 31, 'A'], [37, 47, 'A'], [66, 68, 'A'], [70, 96, 'H']];
ML.viz.register('gb-emperors', function (el, opts, V) {
  var pid = V.uid('gbem'), cur = opts.start || 0, W = 460, H = 200, x0 = 16, x1 = W - 16, X = function (y) { return x0 + (y - 14) / (96 - 14) * (x1 - x0); };
  var stage = document.createElement('div'); stage.className = 'gb-stage gbem'; el.appendChild(stage);
  var ro = V.readout(el);
  function draw() {
    var h = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Emperors from AD 14 to 96, with the surviving and lost parts of Tacitus"><defs><pattern id="' + pid + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="gbem-lostbg"/><line x1="0" y1="0" x2="0" y2="6" class="gbem-hatchl"/></pattern></defs>';
    [14, 30, 50, 70, 90].forEach(function (t) { h += '<line class="gbem-grid" x1="' + X(t) + '" y1="14" x2="' + X(t) + '" y2="' + (H - 24) + '"/><text class="gbem-tick" x="' + X(t) + '" y="' + (H - 8) + '">AD ' + t + '</text>'; });
    h += '<text class="gbem-lab" x="' + x0 + '" y="26">Emperors (tap one)</text>';
    EMP.forEach(function (e, i) {
      var xa = X(e[1]), xb = Math.max(X(e[2]), xa + 7), y = i % 2 ? 50 : 36;
      var q4 = ['Galba', 'Otho', 'Vitellius'].indexOf(e[0]); if (q4 >= 0) { xa = X(67.6) + q4 * 13; xb = xa + 11; y = 66; }
      h += '<rect class="gbem-emp' + (i === cur ? ' on' : '') + '" data-i="' + i + '" x="' + xa + '" y="' + y + '" width="' + (xb - xa) + '" height="12" rx="3" tabindex="0" role="button" aria-label="' + e[0] + ', AD ' + e[1] + (e[2] !== e[1] ? '–' + e[2] : '') + '"/>';
    });
    var e = EMP[cur], lx = Math.max(x0, Math.min(X(e[1]), W - 120));
    h += '<text class="gbem-name" x="' + (W - 16) + '" y="26" text-anchor="end">' + e[0] + '</text>';
    h += '<text class="gbem-lab" x="' + x0 + '" y="108">Annals (AD 14–68)</text><text class="gbem-lab" x="' + X(69) + '" y="108">Histories (69–96)</text>';
    SURV.forEach(function (s) { h += '<rect class="gbem-surv ' + s[2] + '" x="' + X(s[0]) + '" y="' + (s[2] === 'A' ? 116 : 140) + '" width="' + (X(s[1]) - X(s[0])) + '" height="16" rx="3"/>'; });
    LOST.forEach(function (s) { h += '<rect class="gbem-lost" fill="url(#' + pid + ')" x="' + X(s[0]) + '" y="' + (s[2] === 'A' ? 116 : 140) + '" width="' + (X(s[1]) - X(s[0])) + '" height="16" rx="3"/>'; });
    h += '<g class="gbem-key"><rect x="' + x0 + '" y="162" width="14" height="10" class="gbem-surv A"/><text x="' + (x0 + 18) + '" y="171">survives</text><rect x="' + (x0 + 84) + '" y="162" width="14" height="10" fill="url(#' + pid + ')"/><text x="' + (x0 + 102) + '" y="171">lost</text></g>';
    h += '</svg>';
    stage.innerHTML = h;
    Array.prototype.forEach.call(stage.querySelectorAll('.gbem-emp'), function (r) {
      var f = function () { cur = +r.getAttribute('data-i'); draw(); var n = stage.querySelector('.gbem-emp[data-i="' + cur + '"]'); if (n) n.focus(); };
      r.addEventListener('click', f); r.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } });
    });
    ro.set('<b>' + e[0] + '</b>, AD ' + e[1] + (e[2] !== e[1] ? '–' + e[2] : '') + ' · <i>' + e[3] + '</i><br>' + e[4]);
  }
  draw();
});
