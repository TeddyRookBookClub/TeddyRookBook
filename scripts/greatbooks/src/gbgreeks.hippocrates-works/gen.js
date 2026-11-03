/* Hippocrates and the Hippocratic Corpus. Bank plus computed families: spans of years across BC and AD (no year zero),
   which century, the rhythm of the "tertian" and "quartan" fevers the Epidemics describe, and matching works to
   their subjects. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbgreeks.hippocrates-works';
var EV = [[-460, 'Hippocrates is born on Cos (about)'], [-399, 'Socrates dies in Athens'], [-370, 'Hippocrates dies (about)'], [-322, 'Aristotle dies'], [-300, 'Euclid is teaching in Alexandria (about)'], [129, 'Galen is born in Pergamon'], [1543, 'Vesalius publishes his anatomy'], [1628, 'Harvey publishes on the circulation of the blood'], [1849, 'Francis Adams\'s English translation appears'], [1858, 'Virchow publishes his cell theory of disease']];
function y(v) { return v < 0 ? (-v) + ' BC' : (v < 1000 ? 'AD ' + v : String(v)); }
function span(a, b) { return a < 0 && b > 0 ? b - a - 1 : b - a; }
function famSpan(R, lv) {
  var pool = lv === 1 ? EV.filter(function (e) { return e[0] < 0; }) : EV, p = R.sample(pool, 2).sort(function (a, b) { return a[0] - b[0]; });
  if (p[0][0] === p[1][0]) return null;
  var s = span(p[0][0], p[1][0]), cross = p[0][0] < 0 && p[1][0] > 0;
  return num('How many years passed between these two events? ' + p[0][1] + ' (' + y(p[0][0]) + '); ' + p[1][1] + ' (' + y(p[1][0]) + ').', s, 'years',
    cross ? ['From ' + y(p[0][0]) + ' to 1 BC is ' + (-p[0][0] - 1) + ' years; from 1 BC to AD 1 is 1 more; from AD 1 to ' + y(p[1][0]) + ' is ' + (p[1][0] - 1) + '.', 'Total: $' + (-p[0][0]) + ' + ' + p[1][0] + ' - 1 = ' + s + '$ years. (There is no year zero.)'] :
      p[0][0] < 0 ? ['Both dates are BC, counting down: $' + (-p[0][0]) + ' - ' + (-p[1][0]) + ' = ' + s + '$ years.'] : ['$' + p[1][0] + ' - ' + p[0][0] + ' = ' + s + '$ years.'],
    { hint: cross ? 'Add the two numbers, then subtract 1, because there was no year 0.' : '', chk: { f: 'span', a: p[0][0], b: p[1][0] } });
}
function famCentury(R, lv) {
  var v = R.pick([-460, -430, -399, -370, -350, -300, -212, -55, 129, 216, 1543, 1628]), c = v < 0 ? Math.floor((-v - 1) / 100) + 1 : Math.floor((v - 1) / 100) + 1;
  var o = function (n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); };
  var right = 'the ' + o(c) + ' century ' + (v < 0 ? 'BC' : 'AD'), w = ['the ' + o(c + 1) + ' century ' + (v < 0 ? 'BC' : 'AD'), 'the ' + o(Math.max(1, c - 1)) + ' century ' + (v < 0 ? 'BC' : 'AD'), 'the ' + o(c) + ' century ' + (v < 0 ? 'AD' : 'BC')];
  return mcc('Which century is ' + y(v) + ' in?', right, w, [v < 0 ? 'The 5th century BC runs from 500 BC down to 401 BC, and so on.' : 'The 1st century AD runs from AD 1 to 100, and so on.', y(v) + ' is in ' + right + '.'], { chk: { f: 'cent', v: v } });
}
function famFever(R, lv) {
  var quart = lv >= 2 && R.coin(), gap = quart ? 3 : 2, first = R.int(1, 4), n = R.int(3, lv === 1 ? 4 : 6), day = first + gap * (n - 1);
  return num('The Epidemics describe "tertian" fevers, which return every other day, and "quartan" fevers, which return every third day (we would say every 48 and 72 hours). A ' + (quart ? 'quartan' : 'tertian') + ' fever first comes on day ' + first + '. On which day does attack number ' + n + ' come?', day, '', ['A ' + (quart ? 'quartan' : 'tertian') + ' fever returns every ' + gap + ' days: days ' + [0, 1, 2].map(function (i) { return first + gap * i; }).join(', ') + ', …', 'Attack ' + n + ': $' + first + ' + ' + gap + ' \\times ' + (n - 1) + ' = ' + day + '$. (The Greeks counted inclusively, so "third day" meant every other day. Today we know these fevers are malaria.)'], { chk: { f: 'fever', first: first, gap: gap, n: n } });
}
var WORKS = [['On the Sacred Disease', 'Epilepsy has a natural cause, like other diseases'], ['On Airs, Waters, and Places', 'How a town\'s winds, water and seasons affect health'], ['Of the Epidemics', 'Day-by-day records of particular patients'], ['Aphorisms', 'Short sayings, beginning "Life is short, and the Art long"'], ['The Oath', 'A promise made by a new physician'], ['On Ancient Medicine', 'Medicine is an old craft found by trial, not deduced from one principle']];
function famWork(R, lv) {
  var w = R.pick(WORKS), others = WORKS.filter(function (x) { return x !== w; });
  if (R.coin()) return mcc('Which Hippocratic work is this about? "' + w[1] + '."', w[0], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[0]; }), [w[0] + ': ' + w[1].toLowerCase() + '.'], { chk: { f: 'work', w: w[0] } });
  return mcc('What is the Hippocratic work <i>' + w[0] + '</i> about?', w[1], H.samp(R, others, lv === 1 ? 2 : 3).map(function (x) { return x[1]; }), [w[0] + ': ' + w[1].toLowerCase() + '.'], { chk: { f: 'work', w: w[0] } });
}
var B = {
  facts: [
    ['Hippocrates came from the Greek island of Cos.', true, ''],
    ['Hippocrates wrote every book in the Hippocratic Corpus himself.', false, 'The roughly sixty works are by many authors; which, if any, are his is unknown.'],
    ['The Hippocratic Oath contains the words "First, do no harm".', false, 'The Latin slogan dates from the 1800s; the Epidemics say "to do good or to do no harm".'],
    ['On the Sacred Disease argues that epilepsy has a natural cause.', true, 'It places the cause in the brain.'],
    ['On Airs, Waters, and Places links health with a town\'s environment.', true, 'Winds, water, seasons and way of life.'],
    ['The four humors are blood, phlegm, yellow bile and black bile.', true, 'From On the Nature of Man; modern medicine does not use them.'],
    ['Plato mentions Hippocrates as a famous doctor.', true, 'In the Protagoras and the Phaedrus.'],
    ['The Epidemics recorded only patients who got better.', false, 'They record many deaths too.'],
    ['Germ theory and cell theory replaced the humors in the 1800s.', true, 'Virchow, Pasteur and Koch.'],
    ['The Oath was a law of ancient Greece that every doctor had to obey.', false, 'It was a pledge for one group of doctors, never a law.']
  ],
  items: [
    { q: 'What new idea did the Hippocratic writers bring to medicine?', r: 'Illness has natural causes that can be learned by observation', w: ['Illness is sent by angry gods', 'Illness is caused by the stars', 'Doctors should never touch patients'], why: 'On the Sacred Disease is the classic statement.' },
    { q: 'What does "Life is short, and the Art long" mean?', r: 'Medicine takes longer to learn than a lifetime gives', w: ['Doctors should work fast', 'People lived short lives in ancient times', 'Art is more important than medicine'], why: 'Aphorisms I.1.' },
    { q: 'What two aims does the Epidemics give the physician?', r: 'To do good, or at least to do no harm', w: ['To earn fees and become famous', 'To cure every patient and never fail', 'To follow the stars and the seasons'], why: 'Epidemics I.' },
    { q: 'What does the Oath promise about what a doctor sees and hears?', r: 'To keep it secret', w: ['To write it in a book', 'To tell the patient\'s family', 'To report it to the city'], why: 'Confidentiality is still a duty of doctors.' },
    { q: 'What does On Ancient Medicine criticize?', r: 'Doctors who build medicine on one assumed principle like "the hot"', w: ['Doctors who keep records', 'Doctors who study diet', 'Doctors who visit patients at home'], why: 'It prefers long experience to theory.' }
  ]
};
H.T(ID, B, [famSpan, famSpan, famCentury, famFever, famWork, famWork].concat(dateFams(ID).slice(0, 2)), 0.6);
