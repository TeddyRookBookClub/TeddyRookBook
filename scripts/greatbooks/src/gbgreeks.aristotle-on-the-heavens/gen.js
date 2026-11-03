/* Aristotle, On the Heavens. Bank plus computed families: the weight–time rule (I.6), Eratosthenes' measurement,
   stades to kilometers, the pole star and latitude (why travel south changes the stars, II.14), the shadow argument,
   and natural motions. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.aristotle-on-the-heavens';
function famTime(R, lv) {
  var t = R.int(3, 12) * 2, k = R.pick([2, 3, 4]);
  if (lv >= 2 && R.coin()) return num('On the Heavens I.6: "the times being in inverse proportion to the weights". If a weight takes ' + t + ' s over a movement, how long does a weight ' + k + ' times as great take, by this rule?' + (t % k ? ' Give two decimal places.' : ''), r2(t / k, 2), 's', ['Inverse proportion: ' + k + ' times the weight, $\\tfrac1' + k + '$ the time.', '$' + t + ' \\div ' + k + ' = ' + r2(t / k, 2) + '$ s.'], { rtol: 0.004, chk: { f: 'time', t: t, k: k } });
  return num('By Aristotle\'s rule, if one weight is twice another, it takes half as long over a given movement. The lighter takes ' + t + ' s. How long does the heavier take?', t / 2, 's', ['Twice the weight, half the time.', '$' + t + ' \\div 2 = ' + t / 2 + '$ s.', 'Galileo later showed that, without air, both take the same time.'], { chk: { f: 'time', t: t, k: 2 } });
}
function famEratos(R, lv) {
  var ang = R.pick([7.2, 6, 4.5, 3.6, 9, 12]), dist = R.pick([500, 800, 1000, 5000]), c = 360 / ang * dist;
  return num('At noon on the same day, the Sun is straight overhead at one town and ' + ang + '° from overhead at another town ' + cm(dist) + ' stades due north. Using Eratosthenes\' method, what is the Earth\'s circumference in stades?', c, 'stades', ['The angle is the fraction of a full circle between the towns: $360 \\div ' + ang + ' = ' + 360 / ang + '$.', 'Circumference $= ' + 360 / ang + ' \\times ' + texn(dist) + ' = ' + texn(c) + '$ stades.'], { chk: { f: 'eratos', ang: ang, dist: dist } });
}
function famStade(R, lv) {
  var st = R.pick([400000, 250000, 252000]), len = R.pick([157, 160, 185]), km = st * len / 1000;
  return num('Taking a stade to be ' + len + ' m, how many kilometers is ' + cm(st) + ' stades' + (st === 400000 ? ' (the figure Aristotle reports for the Earth\'s circumference)' : '') + '? (The true value is about 40,000 km.)', km, 'km', ['$' + texn(st) + ' \\times ' + len + ' = ' + texn(st * len) + '$ m.', 'That is $' + texn(km) + '$ km.'], { rtol: 0.001, chk: { f: 'stade', st: st, len: len } });
}
function famPole(R, lv) {
  var lat1 = R.int(30, 45), d = R.int(3, 15);
  if (lv === 1) return num('The pole star stands about as many degrees above the northern horizon as your latitude. In Athens (about 38° north), how high is it?', 38, '°', ['Its height equals the latitude: about 38°.'], { chk: { f: 'pole0' } });
  return num('A traveler at latitude ' + lat1 + '° north sees the pole star ' + lat1 + '° above the horizon. She travels ' + d + '° of latitude due south. How high is the pole star now?', lat1 - d, '°', ['Going south lowers the pole star by the same number of degrees, and new southern stars rise into view.', '$' + lat1 + ' - ' + d + ' = ' + (lat1 - d) + '$ degrees. Aristotle: such a small journey makes a plain change, so the Earth is a sphere of no great size.'], { chk: { f: 'pole', lat: lat1, d: d } });
}
function famShadow(R, lv) {
  var sh = R.pick([['a flat disk', 'Sometimes a straight line or an oval, depending on how it faces the Moon'], ['a sphere', 'Always a circle'], ['a cube', 'A shape with corners and straight edges']]);
  return mcc('During an eclipse of the Moon, what shape would the edge of the Earth\'s shadow be if the Earth were ' + sh[0] + '?', sh[1], ['Always a circle', 'Sometimes a straight line or an oval, depending on how it faces the Moon', 'A shape with corners and straight edges', 'A crescent, like the Moon\'s phases'].filter(function (x) { return x !== sh[1]; }).slice(0, lv === 1 ? 2 : 3),
    ['Only a sphere casts a round shadow whichever way it is turned.', 'Aristotle (II.14): the edge is always curved, so the Earth is a sphere.'], { chk: { f: 'shadow', s: sh[0] } });
}
var NAT = [['a stone', 'Down, toward the center'], ['fire', 'Up, away from the center'], ['the stars and planets', 'Around in circles, forever'], ['water', 'Down, toward the center'], ['air', 'Up, away from the center']];
function famNatural(R, lv) {
  var n = R.pick(NAT);
  return mcc('In Aristotle\'s On the Heavens, what is the natural motion of ' + n[0] + '?', n[1], ['Down, toward the center', 'Up, away from the center', 'Around in circles, forever', 'No motion at all'].filter(function (x) { return x !== n[1]; }).slice(0, lv === 1 ? 2 : 3),
    [n[0].charAt(0).toUpperCase() + n[0].slice(1) + ': ' + n[1].toLowerCase() + '.', 'Earth and water fall, air and fire rise, and the heavens, made of a fifth element, turn in circles.'], { chk: { f: 'nat', n: n[0] } });
}
var B = {
  facts: [
    ['Aristotle argued that the Earth is a sphere.', true, 'On the Heavens II.14.'],
    ['Most educated Europeans in the Middle Ages thought the Earth was flat.', false, 'That is a modern myth; Aristotle\'s round Earth was standard teaching.'],
    ['Aristotle reported that mathematicians put the Earth\'s circumference at 400,000 stades.', true, 'The oldest estimate on record.'],
    ['Aristotle thought the heavens are made of the same four elements as the Earth.', false, 'He said they are made of a fifth element that only moves in circles.'],
    ['Aristotle placed the Earth at rest at the center of the universe.', true, ''],
    ['Tycho Brahe showed that a comet of 1577 was farther away than the Moon.', true, 'Against the unchanging heavens.'],
    ['Aristotle noticed that some stars seen in Egypt are not seen farther north.', true, 'Evidence that the Earth is curved.'],
    ['Galileo certainly dropped two balls from the Leaning Tower before a crowd.', false, 'The story comes from his student Viviani years later; historians doubt it.'],
    ['Simon Stevin dropped unequal lead balls and saw them land together, in 1586.', true, ''],
    ['Eratosthenes measured the Earth about a century after Aristotle.', true, 'He found about 250,000 stades.']
  ],
  items: [
    { q: 'What was Aristotle\'s best evidence that the Earth is a sphere?', r: 'The curved edge of its shadow on the Moon during eclipses', w: ['Photographs from high mountains', 'Sailing all the way around it', 'The Earth\'s magnetic field'], why: 'On the Heavens II.14.' },
    { q: 'Why did Aristotle think the heavens are made of a different element?', r: 'They move in circles forever and never seem to change', w: ['They are hot like fire', 'They are made of ice', 'They fall toward the Earth'], why: 'Earthly things rise or fall and decay; the heavens seemed not to.' },
    { q: 'Which later discovery undid Aristotle\'s unchanging heavens?', r: 'Tycho\'s new star (1572) and comet (1577) beyond the Moon', w: ['Columbus\'s voyage', 'The invention of printing', 'The discovery of America\'s coastline'], why: 'Change was seen in the heavens.' },
    { q: 'What does Aristotle say happens when a traveler goes south?', r: 'New stars appear above the southern horizon', w: ['The Sun grows larger', 'The Moon disappears', 'Nothing changes'], why: 'A small trip makes a plain change: a curved Earth of no great size.' },
    { q: 'Whose model of nested spheres did Aristotle build on?', r: 'Eudoxus\'s', w: ['Ptolemy\'s', 'Copernicus\'s', 'Kepler\'s'], why: 'Ptolemy and Copernicus came centuries later.' }
  ]
};
H.T(ID, B, [famTime, famEratos, famStade, famPole, famShadow, famNatural].concat(dateFams(ID).slice(0, 2)), 0.6);
