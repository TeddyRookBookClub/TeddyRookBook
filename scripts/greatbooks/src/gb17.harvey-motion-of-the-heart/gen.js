/* Harvey: On the Motion of the Heart and Blood (with the letters On the Circulation). Bank (Galen's picture, the
   heart as a pump, the arithmetic, the arm experiments, the history) plus computed families: Harvey's sum in his own
   units (ounces and drachms), apothecary conversions, modern cardiac output, how long the body's blood takes to go
   round, and what a tight or a medium band does. Computed problems carry chk (verify-science-b.js). */
var ID = 'gb17.harvey-motion-of-the-heart';
function nm(q, v, unit, steps, o) { o = o || {}; var p = { q: q, a: { t: 'num', v: String(v) }, steps: steps }; if (o.rtol) p.a.rtol = o.rtol; else p.a.form = 'int'; if (unit === '%') p.a.pct = true; else if (unit) p.unit = unit; if (o.hint) p.hint = o.hint; if (o.chk) p.chk = o.chk; return p; }
var B = {
  facts: [
    ['Harvey showed that the same blood goes round and round the body, pumped by the heart.', true, 'The circulation of the blood (1628).'],
    ['In Galen’s picture, the liver made new blood from food, and the body used it up.', true, 'That is the view Harvey overturned.'],
    ['Harvey found that the heart’s important motion is the squeeze, which pushes blood out.', true, 'The squeeze (systole) makes the pulse.'],
    ['Harvey chose large numbers in his estimate to make the blood flow seem as big as possible.', false, 'He chose small numbers on purpose; even then the old theory failed.'],
    ['Harvey saw the capillaries joining arteries to veins.', false, 'He reasoned they must exist; Malpighi saw them in 1661.'],
    ['The valves in the veins let blood flow toward the heart but not away from it.', true, 'Harvey’s teacher Fabricius had described the valves.'],
    ['Ibn al-Nafis, in the 1200s, described blood passing through the lungs from one side of the heart to the other.', true, 'Harvey’s new step was the whole circuit, with proof.'],
    ['A very tight band on the arm makes the veins below it swell up.', false, 'A tight band stops the arteries; a medium band, which squeezes only the veins, makes the veins below it swell.'],
    ['De Motu Cordis was published in Frankfurt in 1628.', true, 'A short Latin book of 72 pages.'],
    ['Harvey studied medicine at Padua, in Italy.', true, 'Under Hieronymus Fabricius.'],
    ['Descartes praised the circulation of the blood in his Discourse on Method.', true, 'Though he disagreed about how the heart moves.'],
    ['Harvey was physician to King James I and King Charles I.', true, 'And a physician at St Bartholomew’s Hospital.'],
    ['In 1649 Harvey answered the Paris anatomist Jean Riolan in two letters, On the Circulation of the Blood.', true, 'Riolan accepted only part of the idea.'],
    ['Everyone accepted Harvey’s discovery right away.', false, 'Many doctors resisted for decades.'],
    ['Harvey learned anatomy, he said, "not from books but from dissections."', true, 'From his dedication.']
  ],
  items: [
    { q: 'What did Galen think happened to the blood?', r: 'It was made in the liver from food and used up by the body', w: ['It went round and round', 'It was made by the heart and stored in the lungs', 'It came from the air we breathe', 'It never moved'], why: 'Harvey’s arithmetic showed this could not be.' },
    { q: 'What is the heart, in Harvey’s account?', r: 'A muscular pump', w: ['A furnace that heats the blood', 'A sponge that soaks up blood', 'A storage tank', 'A filter'], why: 'Its squeeze drives the blood out.' },
    { q: 'Why did Harvey use low numbers in his estimate?', r: 'So no one could say he exaggerated', w: ['He measured carefully and they came out low', 'Big numbers were forbidden', 'He wanted to prove Galen right', 'He didn’t know how to multiply large numbers'], why: 'If even the low estimate breaks the old theory, the theory falls.' },
    { q: 'Who first saw the capillaries?', r: 'Marcello Malpighi, in 1661', w: ['William Harvey', 'Galen', 'Fabricius', 'Ibn al-Nafis'], why: 'In a frog’s lung, with a microscope, four years after Harvey died.' },
    { q: 'What do the valves in the veins do?', r: 'Let blood flow only toward the heart', w: ['Let blood flow only away from the heart', 'Make new blood', 'Mix blood with air', 'Stop the pulse'], why: 'They are one-way doors.' },
    { q: 'A medium-tight band on the upper arm makes what happen?', r: 'The veins below it swell, because blood still comes in through the deep arteries but cannot leave', w: ['The hand goes pale and cold', 'The arteries above it swell', 'Nothing at all', 'The pulse at the wrist stops'], why: 'Blood enters by the arteries and leaves by the veins.' },
    { q: 'A very tight band on the upper arm makes what happen?', r: 'The hand goes pale and cool, and the artery swells above the band', w: ['The veins below it swell', 'The hand turns red and warm', 'The veins above it empty', 'Nothing at all'], why: 'It stops the deep arteries too.' },
    { q: 'Who described the lungs’ part in the blood’s path long before Harvey?', r: 'Ibn al-Nafis', w: ['Galen', 'Hippocrates', 'Aristotle', 'Riolan'], why: 'In Cairo in the 1200s.' },
    { q: 'Who was Harvey’s teacher at Padua, who described the valves of the veins?', r: 'Hieronymus Fabricius', w: ['Galileo', 'Galen', 'Andreas Vesalius', 'Jean Riolan'], why: 'Fabricius published on the valves in 1603.' },
    { q: 'Where did Harvey get the deer he studied?', r: 'From King Charles I’s parks', w: ['From a market in London', 'From Padua', 'From the Royal Society', 'From a farm in France'], why: 'The king supported his research.' }
  ]
};
function famHarvey(R, lv) {
  var hold = lv === 1 ? 2 : R.pick([1.5, 2, 3]), fr = R.pick([4, 8]), beats = lv === 1 ? 1000 : R.pick([1000, 2000, 3000, 4000]);
  var perOz = hold / fr, totOz = perOz * beats;
  if (lv === 3) {
    var lb = Math.floor(totOz / 12);
    return nm('Harvey’s arithmetic: the left ventricle holds ' + hold + ' ounces and pushes out 1/' + fr + ' of it each beat, ' + beats.toLocaleString('en-US') + ' beats in half an hour. How many whole <b>pounds</b> of blood is that (1 pound = 12 ounces; drop any ounces left over)?', lb, 'lb',
      ['Each beat: ' + hold + ' ÷ ' + fr + ' = ' + perOz + ' oz.', 'Half an hour: ' + perOz + ' × ' + beats + ' = ' + totOz + ' oz.', totOz + ' ÷ 12 = ' + lb + ' pounds and ' + +(totOz - 12 * lb).toFixed(2) + ' ounces.'], { chk: { f: 'harvLb', hold: hold, fr: fr, beats: beats } });
  }
  return nm('Harvey’s arithmetic: the left ventricle holds ' + hold + ' ounces and pushes out 1/' + fr + ' of it each beat. In half an hour the heart beats ' + beats.toLocaleString('en-US') + ' times. How many <b>ounces</b> of blood does it push out?', totOz, 'oz',
    ['Each beat: ' + hold + ' ÷ ' + fr + ' = ' + perOz + ' oz.', perOz + ' × ' + beats + ' = ' + totOz + ' oz, more than the whole body holds (about 170 oz today).'], Number.isInteger(totOz) ? { chk: { f: 'harv', hold: hold, fr: fr, beats: beats } } : { rtol: 0.001, chk: { f: 'harv', hold: hold, fr: fr, beats: beats } });
}
function famUnits(R, lv) {
  var c = R.pick(lv === 1 ? ['dr2oz', 'oz2dr'] : ['dr2oz', 'oz2dr', 'oz2lb', 'dr2lb']);
  if (c === 'oz2dr') { var oz = R.int(2, 12); return nm('In apothecary units, 1 ounce = 8 drachms. How many drachms are in ' + oz + ' ounces?', oz * 8, 'drachms', [oz + ' × 8 = ' + oz * 8 + ' drachms.'], { chk: { f: 'mul', a: oz, b: 8 } }); }
  if (c === 'dr2oz') { var dr = 8 * R.int(2, 30); return nm('1 ounce = 8 drachms. How many ounces are ' + dr + ' drachms?', dr / 8, 'oz', [dr + ' ÷ 8 = ' + dr / 8 + ' oz.'], { chk: { f: 'div', a: dr, b: 8 } }); }
  if (c === 'oz2lb') { var o2 = 12 * R.int(2, 40); return nm('1 pound = 12 ounces (apothecary). How many pounds are ' + o2 + ' ounces?', o2 / 12, 'lb', [o2 + ' ÷ 12 = ' + o2 / 12 + ' lb.'], { chk: { f: 'div', a: o2, b: 12 } }); }
  var d3 = 96 * R.int(2, 20); return nm('1 ounce = 8 drachms and 1 pound = 12 ounces. How many pounds are ' + d3 + ' drachms?', d3 / 96, 'lb', ['A pound is 8 × 12 = 96 drachms.', d3 + ' ÷ 96 = ' + d3 / 96 + ' lb.'], { chk: { f: 'div', a: d3, b: 96 } });
}
function famOutput(R, lv) {
  var sv = R.pick([60, 65, 70, 75, 80]), hr = R.pick([60, 65, 70, 72, 75, 80]), lpm = sv * hr / 1000;
  if (lv === 3 && R.coin()) {
    var vol = R.pick([4.5, 5, 5.5]), mins = vol / lpm;
    return nm('A heart pushes out ' + sv + ' mL per beat at ' + hr + ' beats a minute. The body holds about ' + vol + ' L of blood. How many minutes does the heart take to pump that much? (Two decimal places.)', +mins.toFixed(2), 'min',
      ['Per minute: ' + sv + ' × ' + hr + ' = ' + sv * hr + ' mL = ' + lpm + ' L.', vol + ' ÷ ' + lpm + ' ≈ ' + mins.toFixed(2) + ' minutes.'], { rtol: 0.01, chk: { f: 'circ', sv: sv, hr: hr, vol: vol } });
  }
  return nm('A resting heart pushes out ' + sv + ' mL of blood per beat at ' + hr + ' beats per minute. How many liters does it pump in one minute? (Two decimal places.)', +lpm.toFixed(2), 'L',
    [sv + ' × ' + hr + ' = ' + sv * hr + ' mL.', sv * hr + ' mL = ' + lpm + ' L.'], { rtol: 0.005, hint: '1 liter = 1,000 mL.', chk: { f: 'cout', sv: sv, hr: hr } });
}
function famHalfHour(R, lv) {
  var bpm = R.pick([60, 66, 70, 72, 80]), mins = R.pick([30, 15, 60]);
  return nm('Harvey wrote that in half an hour the heart makes more than a thousand beats. If a heart beats ' + bpm + ' times a minute, how many beats is that in ' + mins + ' minutes?', bpm * mins, 'beats',
    [bpm + ' × ' + mins + ' = ' + bpm * mins + ' beats.'], { chk: { f: 'mul', a: bpm, b: mins } });
}
H.T(ID, B, [famHarvey, famUnits, famOutput, famHalfHour, function (R, lv) { return H.famBefore(R, lv, ID); }, function (R, lv) { return H.famWhoWrote(R, lv, ID); }], 0.5);
