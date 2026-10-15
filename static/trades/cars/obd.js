/* Cars course, Lesson 5: an OBD-II trouble code reader. Explains each character of a code.
   Letter meanings: Wikipedia (OBD-II PIDs); P0/P1 and the third-digit areas: Clemson University CVEL;
   common codes: New Jersey MVC emissions brochure. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-obd');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades;
  var SYS = { P: 'Powertrain: the engine and transmission', C: 'Chassis systems', B: 'Body systems', U: 'Network: communication between the car’s computers' };
  var AREA = { '0': 'fuel and air metering', '1': 'fuel and air metering', '2': 'fuel and air metering', '3': 'ignition system or misfire', '4': 'auxiliary emission controls', '5': 'vehicle speed and idle control', '6': 'computer output circuit', '7': 'transmission', '8': 'transmission' };
  var COMMON = {
    P0171: 'Exhaust contains excess oxygen (running lean).', P0174: 'Exhaust contains excess oxygen (running lean).',
    P0128: 'Coolant temperature too low, possibly a faulty thermostat.', P0300: 'Engine misfire; the fuel or ignition (spark) system is a likely cause.',
    P0301: 'Engine misfire; the fuel or ignition (spark) system is a likely cause.', P0401: 'Not enough flow through the exhaust gas recirculation (EGR) valve or passages.',
    P0420: 'Catalytic converter not reducing emissions well enough.', P0455: 'Fuel vapor leak: the gas cap, lines or other EVAP parts.',
    P0141: 'Oxygen sensor heater not working properly.'
  };
  root.innerHTML =
    '<h3>Trouble code reader</h3>' +
    '<label class="tr-field">Type a code (letter plus four characters)<input type="text" class="obd-in" value="P0301" maxlength="5" autocomplete="off" spellcheck="false" style="max-width:10rem;font:700 1.2rem ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase" aria-describedby="obd-out"></label>' +
    '<p class="hs-small" style="margin:.2rem 0 .3rem">Common codes from a state inspection program:</p>' +
    '<div class="tr-seg obd-common" role="group" aria-label="Common codes"></div>' +
    '<div class="tr-out" id="obd-out" aria-live="polite" style="margin-top:.6rem"></div>';
  var inp = root.querySelector('.obd-in'), out = root.querySelector('#obd-out'), com = root.querySelector('.obd-common');
  ['P0420', 'P0455', 'P0300', 'P0171', 'P0128', 'P0401', 'P0141'].forEach(function (c) {
    var b = T.h('button', { type: 'button', 'data-c': c, text: c }); com.appendChild(b);
    b.addEventListener('click', function () { inp.value = c; show(); });
  });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function row(ch, text) { return '<p><b style="font:700 1.05rem ui-monospace,Menlo,Consolas,monospace;display:inline-block;min-width:2.6em">' + esc(ch) + '</b> ' + text + '</p>'; }
  function show() {
    var c = inp.value.trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[PCBU][0-3][0-9A-F]{3}$/.test(c)) {
      out.innerHTML = '<p>Codes look like <b>P0301</b>: a letter (P, C, B or U), then a digit from 0 to 3, then three more characters.</p>';
      return;
    }
    var h = '<p class="big" style="margin:.1rem 0 .3rem">' + esc(c) + '</p>';
    h += row(c[0], SYS[c[0]] + '.');
    h += row(c[1], c[1] === '0' ? 'A standard code: it means the same thing on every car.' : c[1] === '1' ? 'A manufacturer’s own code: look it up in that maker’s service information.' : 'Look this code up in the service information for the car.');
    if (c[0] === 'P' && c[1] === '0' && AREA[c[2]]) h += row(c[2], 'The area: ' + AREA[c[2]] + '.');
    else h += row(c[2], 'The area of the system; the service information explains it for this kind of code.');
    h += row(c.substr(3), 'The specific fault within that area.');
    if (COMMON[c]) h += '<p style="margin-top:.5rem"><b>What it usually points to:</b> ' + COMMON[c] + '</p>';
    h += '<p class="hs-small" style="margin-top:.4rem">A code points to a system, not a part. Diagnose before you replace anything.</p>';
    out.innerHTML = h;
  }
  inp.addEventListener('input', show);
  show();
})(window, document);
