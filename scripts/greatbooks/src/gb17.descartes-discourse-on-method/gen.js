/* Descartes: Discourse on the Method (the science side). Bank (the four rules, the essays, the heart and Harvey,
   science for the good of all, the history) plus computed families: which rule a scene uses, the law of refraction
   (sin i = n sin r), the angle at which a ray leaves a raindrop (A = 4r - 2i), and how high the rainbow stands when the
   sun is up. Computed problems carry chk (verify-science-b.js). */
var ID = 'gb17.descartes-discourse-on-method';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (o.tol) { p.a.tol = o.tol; delete p.a.form; } if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var D = Math.PI / 180;
var B = {
  facts: [
    ['Descartes’s first rule was never to accept anything as true unless he clearly knew it to be so.', true, 'Part II of the Discourse.'],
    ['Descartes’s second rule was to divide each difficulty into as many parts as possible.', true, 'Break a hard problem into pieces.'],
    ['Descartes’s third rule was to begin with the hardest questions first.', false, 'Begin with the simplest and easiest, and climb step by step.'],
    ['Descartes’s last rule was to make reviews so complete that nothing is left out.', true, 'Check everything at the end.'],
    ['The Discourse was published in 1637 with three essays: the Optics, the Meteors and the Geometry.', true, 'They show the method at work.'],
    ['Descartes wrote the Discourse in Latin for scholars only.', false, 'He wrote it in French so anyone with good sense could read it.'],
    ['In Part V Descartes praised the English physician (Harvey) who discovered the circulation of the blood.', true, 'Only nine years after Harvey’s book.'],
    ['Descartes agreed with Harvey that the heart is a muscle that squeezes.', false, 'He thought heat made the blood swell and push the valves open; Harvey was right.'],
    ['Descartes held back his own physics after learning that the doctrine of another (Galileo) had been condemned.', true, 'Part VI; The World was published only after his death.'],
    ['Descartes hoped science would make us "the lords and possessors of nature", above all for the sake of health.', true, 'Part VI.'],
    ['Descartes was the first to explain the rainbow’s angle of about 42° by calculating rays through a drop.', true, 'In the Meteors, using the law of refraction.'],
    ['Descartes discovered the law of refraction before anyone else.', false, 'Ibn Sahl (around 984) and Snell (about 1621) found it earlier; Descartes published it.'],
    ['"I think, therefore I am" comes from Part IV of the Discourse.', true, 'The Meditations rung covers it in full.'],
    ['Descartes lived for about twenty years in the Dutch Republic.', true, 'From 1628.'],
    ['Descartes explained the colors of the rainbow completely.', false, 'Why white light splits into colors had to wait for Newton’s prisms.']
  ],
  items: [
    { q: 'Why did Descartes write the Discourse in French?', r: 'So that anyone with good sense could read it, not just scholars', w: ['Because he couldn’t write Latin', 'Because the king ordered it', 'To keep it secret', 'Because French was the language of science'], why: 'Latin was the scholars’ language.' },
    { q: 'Which three essays were published with the Discourse?', r: 'The Optics, the Meteors and the Geometry', w: ['The Meditations, the Principles and the Passions', 'The World, Man and the Rules', 'Physics, Ethics and Logic', 'The Elements, the Almagest and the Optics'], why: 'All in 1637.' },
    { q: 'Whom did Descartes call "a physician of England, who has the honour of having broken the ice"?', r: 'William Harvey', w: ['Francis Bacon', 'William Gilbert', 'Thomas Hobbes', 'Isaac Newton'], why: 'For the circulation of the blood.' },
    { q: 'What did Descartes think made the heart move?', r: 'Heat in the heart making the blood swell', w: ['The squeeze of a muscle', 'The pull of the lungs', 'The soul pushing it', 'Magnetism'], why: 'Harvey had the better answer: a muscular squeeze.' },
    { q: 'Why did Descartes hold back his book The World?', r: 'He learned that Galileo’s view had been condemned in 1633', w: ['He thought it was boring', 'His publisher went out of business', 'He lost the manuscript', 'Harvey asked him to'], why: 'He explains it in Part VI.' },
    { q: 'About what angle from the point opposite the sun does the main rainbow appear?', r: 'About 42°', w: ['About 10°', 'About 90°', 'About 23°', 'About 60°'], why: 'Descartes calculated it from refraction in a drop.' },
    { q: 'What did Descartes use to study the rainbow?', r: 'A large glass globe filled with water, held in the sun', w: ['A telescope', 'A prism of crystal', 'A mirror only', 'A candle flame'], why: 'He raised and lowered it to find where it glowed.' },
    { q: 'Which philosophical idea appears in Part IV of the Discourse?', r: '"I think, therefore I am"', w: ['"Knowledge is power"', '"Man is the measure of all things"', '"All things from an egg"', '"Nature does nothing in vain"'], why: 'It is developed further in the Meditations.' },
    { q: 'What does Descartes say would be the most important use of a practical science?', r: 'Preserving health', w: ['Making weapons', 'Winning arguments', 'Becoming rich', 'Predicting the future'], why: 'Health is, he says, the first and fundamental blessing.' }
  ]
};
var SCENES = [
  ['Before believing a rumor, you check it carefully and accept it only once you clearly know it is true.', 0],
  ['A big science project feels overwhelming, so you split it into small tasks.', 1],
  ['You learn to add before you learn to multiply, and multiply before you divide fractions.', 2],
  ['After a long math problem, you go back over every step to make sure nothing was skipped.', 3],
  ['A detective refuses to name the culprit until the evidence leaves no doubt.', 0],
  ['To fix a broken bicycle, you test the brakes, the chain and the gears one at a time.', 1],
  ['To learn a piano piece, you master the easy opening bars first and build toward the hard part.', 2],
  ['Before a trip you make a full list of everything to pack and check it twice.', 3]
];
var RULES = ['Rule 1: accept only what you clearly know', 'Rule 2: divide the difficulty into parts', 'Rule 3: start with the simplest and climb step by step', 'Rule 4: review everything so nothing is left out'];
function famRule(R, lv) {
  var s = R.pick(SCENES);
  return H.mc('Which of Descartes’s four rules is this? <i>' + s[0] + '</i>', RULES[s[1]], R.sample(RULES.filter(function (_, i) { return i !== s[1]; }), lv === 1 ? 2 : 3), ['It follows ' + RULES[s[1]].toLowerCase() + '.']);
}
function famSnell(R, lv) {
  var i = R.pick([20, 30, 40, 45, 50, 60, 70]), n = lv === 1 ? 1.33 : R.pick([1.33, 1.5, 1.31, 2.42]), r = Math.asin(Math.sin(i * D) / n) / D;
  var med = { 1.33: 'water', 1.5: 'glass', 1.31: 'ice', 2.42: 'diamond' }[n];
  return nm('Light passes from air into ' + med + ' ($n = ' + n + '$) at an angle of incidence of $' + i + '°$. By the law of refraction $\\sin i = n \\sin r$, what is the angle of refraction $r$? (One decimal place.)', +r.toFixed(1), '°',
    ['$\\sin r = \\sin ' + i + '° / ' + n + ' \\approx ' + (Math.sin(i * D)).toFixed(4) + ' / ' + n + ' \\approx ' + (Math.sin(i * D) / n).toFixed(4) + '$.', '$r \\approx ' + r.toFixed(1) + '°$.'], { tol: 0.15, chk: { f: 'snell', i: i, n: n } });
}
function famDrop(R, lv) {
  var i = R.pick([30, 40, 50, 55, 59, 60, 65, 70, 80]), n = R.pick([1.331, 1.333, 1.343]), r = Math.asin(Math.sin(i * D) / n) / D, A = 4 * r - 2 * i;
  return nm('A ray of sunlight enters a raindrop at $i = ' + i + '°$ ($n = ' + n + '$), reflects once inside, and leaves. Descartes’s angle from the point opposite the sun is $A = 4r - 2i$, with $\\sin i = n \\sin r$. Find $A$. (One decimal place.)', +A.toFixed(1), '°',
    ['$\\sin r = \\sin ' + i + '° / ' + n + '$, so $r \\approx ' + r.toFixed(2) + '°$.', '$A = 4(' + r.toFixed(2) + '°) - 2(' + i + '°) \\approx ' + A.toFixed(1) + '°$.', A > 41 ? 'That is near the top of the bow: many rays leave close to this angle.' : 'Rays like this one are spread out; the bright bow is near 42°.'], { tol: 0.2, hint: 'Find r first.', chk: { f: 'bow', i: i, n: n } });
}
function famHeight(R, lv) {
  var h = R.pick([5, 10, 15, 20, 25, 30, 35, 40]);
  return nm('The rainbow is a circle of radius about 42° around the point exactly opposite the sun, which is as far below the horizon as the sun is above it. If the sun is ' + h + '° above the horizon, how high above the horizon is the top of the rainbow (in degrees)?', 42 - h, '°',
    ['The antisolar point is ' + h + '° below the horizon.', 'The top of the bow is 42° above that point: 42 − ' + h + ' = ' + (42 - h) + '°.', 'If the sun were higher than 42°, the bow would be below the horizon: no rainbow at midday in summer.'], { chk: { f: 'diff', a: 42, b: h } });
}
H.T(ID, B, [famRule, famRule, famSnell, famDrop, famHeight, function (R, lv) { return H.famBefore(R, lv, ID); }], 0.55);
