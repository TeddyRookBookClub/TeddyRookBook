/* gbrome.plutarch-greek-lives: visual gb-parallel-lives (gbe3, our own design), also used by gbrome.plutarch-roman-lives.
   Choose one of Plutarch's pairs: the Greek and the Roman life on one time line, with Plutarch's own lifetime for scale.
   Dates are approximate; legendary figures (dashed) have traditional dates only. opts.pair: a key from PAIRS. */
var PAIRS = {
  'theseus-romulus': ['Theseus', -1260, -1200, 1, 'Romulus', -771, -716, 1, 'Founders: each united scattered villages into a city, and each story mixes history with legend.'],
  'lycurgus-numa': ['Lycurgus', -820, -760, 1, 'Numa', -753, -673, 1, 'Lawgivers: Lycurgus made Sparta disciplined and warlike; Numa made Rome gentle and religious.'],
  'solon-publicola': ['Solon', -638, -558, 0, 'Publicola', -560, -503, 1, 'Founders of free government: Solon’s laws for Athens; Publicola, a consul of Rome’s first republican years.'],
  'themistocles-camillus': ['Themistocles', -524, -459, 0, 'Camillus', -446, -365, 0, 'Saviors of their cities who were later driven into exile by their own people.'],
  'pericles-fabius': ['Pericles', -495, -429, 0, 'Fabius Maximus', -280, -203, 0, 'Patient leaders in long wars, who held their people back from rash battles.'],
  'aristides-cato': ['Aristides', -530, -468, 0, 'Cato the Elder', -234, -149, 0, 'Honest statesmen who lived plainly and would not be bought.'],
  'alcibiades-coriolanus': ['Alcibiades', -450, -404, 0, 'Coriolanus', -527, -488, 1, 'Brilliant, proud men who went over to their cities’ enemies.'],
  'demosthenes-cicero': ['Demosthenes', -384, -322, 0, 'Cicero', -106, -43, 0, 'The two greatest orators, who spoke for freedom against a strong man and died for it.'],
  'alexander-caesar': ['Alexander', -356, -323, 0, 'Julius Caesar', -100, -44, 0, 'The two great conquerors. Plutarch says here that he writes lives, not histories.'],
  'demetrius-antony': ['Demetrius', -337, -283, 0, 'Antony', -83, -30, 0, 'Great gifts spoiled by luxury: Plutarch offers them as warnings, not models.'],
  'dion-brutus': ['Dion', -408, -354, 0, 'Brutus', -85, -42, 0, 'Students of Plato’s philosophy who fought against one-man rule.']
};
var NAMES = { 'theseus-romulus': 'Theseus and Romulus', 'lycurgus-numa': 'Lycurgus and Numa', 'solon-publicola': 'Solon and Publicola', 'themistocles-camillus': 'Themistocles and Camillus', 'pericles-fabius': 'Pericles and Fabius', 'aristides-cato': 'Aristides and Cato', 'alcibiades-coriolanus': 'Alcibiades and Coriolanus', 'demosthenes-cicero': 'Demosthenes and Cicero', 'alexander-caesar': 'Alexander and Caesar', 'demetrius-antony': 'Demetrius and Antony', 'dion-brutus': 'Dion and Brutus' };
function yr(y) { return y < 0 ? (-y) + ' BC' : 'AD ' + y; }
ML.viz.register('gb-parallel-lives', function (el, opts, V) {
  var key = PAIRS[opts.pair] ? opts.pair : 'pericles-fabius';
  var stage = document.createElement('div'); stage.className = 'gb-stage gbpl'; el.appendChild(stage);
  var ctl = document.createElement('div'); ctl.className = 'ml-ctl'; el.appendChild(ctl);
  var lab = document.createElement('label'); lab.className = 'gbpl-sel'; lab.innerHTML = '<span>Pair</span>';
  var sel = document.createElement('select');
  Object.keys(PAIRS).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = NAMES[k]; if (k === key) o.selected = true; sel.appendChild(o); });
  lab.appendChild(sel); ctl.appendChild(lab);
  var ro = V.readout(el);
  sel.addEventListener('change', function () { key = sel.value; draw(); });
  function draw() {
    var p = PAIRS[key], lo = Math.min(p[1], p[5]), hi = 120, W = 460, H = 196, x0 = 14, x1 = W - 14;
    var span = hi - lo, X = function (y) { return x0 + (y - lo) / span * (x1 - x0); };
    var h = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Time line of ' + NAMES[key] + ', with Plutarch’s lifetime">';
    var step = span > 900 ? 300 : span > 500 ? 200 : 100, t0 = Math.ceil(lo / step) * step;
    for (var t = t0; t <= hi; t += step) { var xx = X(t); if (xx < 24 || xx > W - 24) continue; h += '<line class="gbpl-grid" x1="' + xx + '" y1="24" x2="' + xx + '" y2="' + (H - 26) + '"/><text class="gbpl-tick" x="' + xx + '" y="' + (H - 10) + '">' + (t === 0 ? '0' : yr(t)) + '</text>'; }
    function bar(y, a, b, name, leg, cls) {
      var xa = X(a), xb = Math.max(X(b), xa + 6);
      return '<rect class="gbpl-bar ' + cls + (leg ? ' leg' : '') + '" x="' + xa + '" y="' + y + '" width="' + (xb - xa) + '" height="22" rx="6"/>' +
        '<text class="gbpl-name" x="' + Math.max(4, Math.min(xa, W - 220)) + '" y="' + (y - 6) + '">' + name + (leg ? ' (legend)' : '') + ': ' + yr(a) + '–' + yr(b) + '</text>';
    }
    h += bar(44, p[1], p[2], p[0], p[3], 'gr') + bar(100, p[5], p[6], p[4], p[7], 'ro') + bar(150, 46, 120, 'Plutarch', 0, 'pl');
    h += '</svg>';
    stage.innerHTML = h;
    var gap = Math.abs(Math.round((p[5] + p[6]) / 2 - (p[1] + p[2]) / 2)), since = Math.round(100 - (p[1] + p[2]) / 2);
    ro.set('<b>' + NAMES[key] + ':</b> ' + p[8] + '<br>About <b>' + gap + '</b> years separate the middle of the two lives; Plutarch wrote about <b>' + since + '</b> years after the Greek.' + (p[3] || p[7] ? ' Dashed bars are legendary figures with traditional dates.' : ''));
  }
  V.onTheme(function () {}); draw();
});
