/* Galen, On the Natural Faculties. Bank plus computed families: matching examples to the four faculties, predicting
   the ureter experiment, the heart's output (the estimate that later undid Galen's blood), years across BC and AD,
   and Galen's errors and who corrected them. chk carries the inputs. */
function num(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = o.form || 'int'; if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.viz) p.viz = o.viz; if (o.chk) p.chk = o.chk; return p; }
function mcc(q, right, wrongs, steps, o) { var p = H.mc(q, right, wrongs, steps, o); if (o && o.chk) p.chk = o.chk; return p; }
function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function texn(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); }
function r2(x, d) { var k = Math.pow(10, d == null ? 2 : d); return Math.round(x * k) / k; }
function dateFams(id) { return [function (R, lv) { return H.famWhen(R, lv, id); }, function (R, lv) { return H.famBefore(R, lv, id); }, function (R, lv) { return H.famVolume(R, lv, id); }, function (R, lv) { return H.famWhoWrote(R, lv, id); }]; }
var ID = 'gbrome.galen-on-the-natural-faculties';
var FAC = [
  ['the kidneys drawing urine out of the blood', 'Attraction'], ['a magnet drawing iron (Galen\'s comparison)', 'Attraction'], ['the stomach closing around food while it digests', 'Retention'], ['the womb holding the growing baby until birth', 'Retention'],
  ['food being changed into blood', 'Alteration'], ['blood being changed into flesh and bone', 'Alteration'], ['the bladder emptying', 'Expulsion'], ['the stomach pushing digested food onward', 'Expulsion']
];
function famFac(R, lv) {
  var f = R.pick(FAC);
  return mcc('Which of Galen\'s four natural faculties is at work in ' + f[0] + '?', f[1], ['Attraction', 'Retention', 'Alteration', 'Expulsion'].filter(function (x) { return x !== f[1]; }).slice(0, lv === 1 ? 2 : 3), ['Attraction draws in what is suitable, retention holds it, alteration changes it, expulsion pushes out what is not needed.', 'Here: ' + f[1].toLowerCase() + '.'], { chk: { f: 'fac', e: f[0] } });
}
var CASES = [
  ['both ureters are tied', 'The bladder stays empty and both ureters swell above the ties'],
  ['only the left ureter is tied', 'The left ureter swells; urine still reaches the bladder from the right'],
  ['only the right ureter is tied', 'The right ureter swells; urine still reaches the bladder from the left'],
  ['the ties on both ureters are loosened', 'Urine flows down into the bladder again']
];
function famUreter(R, lv) {
  var c = R.pick(CASES), wr = CASES.filter(function (x) { return x !== c; }).map(function (x) { return x[1]; }).concat(['Nothing changes, because urine soaks into the bladder as vapor']);
  return mcc('In Galen\'s experiment, what happens when ' + c[0] + '?', c[1], H.samp(R, wr, lv === 1 ? 2 : 3), ['Urine is made in the kidneys and runs down the ureters to the bladder.', 'So: ' + c[1].toLowerCase() + '. Asclepiades\' idea, that it soaks in as vapor, would predict no change.'], { chk: { f: 'ureter', c: c[0] } });
}
function famHeart(R, lv) {
  var sv = R.pick([60, 65, 70, 75, 80]), hr = R.pick([60, 65, 70, 72, 75, 80]), mins = lv === 1 ? 1 : R.pick([1, 10, 60]), mL = sv * hr * mins, L = mL / 1000;
  return num('Suppose each heartbeat pushes out ' + sv + ' mL of blood and the heart beats ' + hr + ' times a minute. How many liters leave the heart in ' + (mins === 1 ? 'one minute' : mins + ' minutes') + '?', r2(L, 2), 'L', ['$' + sv + ' \\times ' + hr + (mins > 1 ? ' \\times ' + mins : '') + ' = ' + texn(mL) + '$ mL.', 'That is ' + r2(L, 2) + ' liters. Far more than the liver could make from food, as Harvey argued in 1628: the blood must circulate, not be used up as Galen thought.'], { rtol: 0.005, chk: { f: 'heart', sv: sv, hr: hr, mins: mins } });
}
function famYears(R, lv) {
  var E = [[129, 'Galen is born'], [162, 'Galen moves to Rome'], [1543, 'Vesalius publishes his anatomy from human dissection'], [1628, 'Harvey publishes the circulation of the blood'], [1916, 'Brock\'s English translation appears'], [-460, 'Hippocrates is born (about)']];
  var p = R.sample(E, 2).sort(function (a, b) { return a[0] - b[0]; }), s = p[0][0] < 0 ? p[1][0] - p[0][0] - 1 : p[1][0] - p[0][0];
  var yy = function (v) { return v < 0 ? (-v) + ' BC' : (v < 1000 ? 'AD ' + v : String(v)); };
  return num('How many years after "' + p[0][1] + '" (' + yy(p[0][0]) + ') did "' + p[1][1] + '" (' + yy(p[1][0]) + ') happen?', s, 'years', [p[0][0] < 0 ? 'Across BC and AD, add the two numbers and subtract 1 (there is no year zero): $' + (-p[0][0]) + ' + ' + p[1][0] + ' - 1 = ' + s + '$.' : '$' + p[1][0] + ' - ' + p[0][0] + ' = ' + s + '$.'], { chk: { f: 'span', a: p[0][0], b: p[1][0] } });
}
var ERR = [['Human anatomy was the same as that of apes and pigs', 'Vesalius (1543)'], ['Blood is made in the liver and used up by the body', 'Harvey (1628)'], ['Blood passes through tiny pores in the wall of the heart', 'Ibn al-Nafis (1200s) and later Harvey'], ['Health is a balance of four humors', 'cell theory and germ theory (1800s)']];
function famErr(R, lv) {
  var e = R.pick(ERR);
  return mcc('Galen believed: "' + e[0] + '." Who or what showed this was wrong?', e[1], ERR.filter(function (x) { return x !== e; }).map(function (x) { return x[1]; }).slice(0, lv === 1 ? 2 : 3), [e[1] + '.'], { chk: { f: 'err', e: e[0] } });
}
var B = {
  facts: [
    ['Galen was born in Pergamon in AD 129.', true, 'A Greek city in what is now Turkey.'],
    ['Galen looked after gladiators before he moved to Rome.', true, 'In Pergamon, around AD 157–161.'],
    ['Galen was physician to the emperor Marcus Aurelius.', true, 'And later to Commodus.'],
    ['Galen showed by experiment that urine reaches the bladder through the ureters.', true, 'On the Natural Faculties I.13.'],
    ['Galen learned his anatomy from dissecting many human bodies.', false, 'He dissected animals, especially apes and pigs.'],
    ['Galen said a faculty is the name for the unknown cause of an effect.', true, 'He would not claim to know more than he did.'],
    ['Galen admired Hippocrates.', true, 'He calls him the first to recognize what Nature does.'],
    ['Galen discovered that the blood circulates.', false, 'Harvey showed that in 1628; Galen thought blood was made in the liver and used up.'],
    ['Galen\'s books were translated into Arabic by Hunayn ibn Ishaq.', true, 'In the 800s.'],
    ['Asclepiades explained the body by tiny particles and pores.', true, 'Galen argued against him.']
  ],
  items: [
    { q: 'What are Galen\'s four natural faculties?', r: 'Attraction, retention, alteration and expulsion', w: ['Blood, phlegm, yellow bile and black bile', 'Earth, water, air and fire', 'Sight, hearing, smell and taste'], why: 'The powers that serve nutrition.' },
    { q: 'What question does On the Natural Faculties try to answer?', r: 'How a living body grows, takes in food and gets rid of waste', w: ['How the planets move', 'How to win an argument', 'How to build a temple'], why: 'The effects of "nature" as opposed to soul.' },
    { q: 'Why did Galen use the magnet as an example?', r: 'It plainly attracts, so why deny that body parts can attract?', w: ['He used magnets to cure disease', 'Magnets made the blood move', 'He thought the heart was a magnet'], why: 'On the Natural Faculties I.14.' },
    { q: 'Who corrected many of Galen\'s anatomical mistakes from human dissection?', r: 'Andreas Vesalius, in 1543', w: ['Hippocrates', 'Aristotle', 'Marcus Aurelius'], why: 'De humani corporis fabrica.' },
    { q: 'What makes Galen\'s ureter experiment a good experiment?', r: 'It sets two explanations against each other, and the result fits only one', w: ['It used very expensive equipment', 'It was done many times without looking at the result', 'It agreed with what everyone already believed'], why: 'Vapor would predict no change; flow predicts an empty bladder.' }
  ]
};
H.T(ID, B, [famFac, famFac, famUreter, famHeart, famYears, famErr].concat(dateFams(ID).slice(0, 2)), 0.6);
