/* gb-bette-family: the Hulot and Fischer families and the people around them in Cousin Bette (our own summaries; ML.gb19kit.net). */
ML.viz.register('gb-bette-family', function (el, opts, V) {
  ML.gb19kit.net(el, V, { label: 'The families of Cousin Bette', w: 400, h: 310, hint: 'Tap a name to read about each person. Gold lines are family; dashed lines are Bette\'s schemes.', nodes: [
    { id: 'be', x: 80, y: 40, t: 'Lisbeth Fischer', s: '"Cousin Bette"', html: 'A poor relation from a peasant family in the Vosges, plain and proud. As children she worked while her pretty cousin Adeline was petted. She seems devoted to the Hulots, but envy has been growing in her for decades.' },
    { id: 'ad', x: 300, y: 40, t: 'Adeline Hulot', s: 'Bette\'s cousin', html: 'A village beauty who married a rising officer of Napoleon\'s army and became a baroness. Patient, generous and long-suffering, she forgives her husband again and again.' },
    { id: 'hh', x: 338, y: 120, t: 'Baron Hulot', s: 'Adeline\'s husband', html: 'A once-brilliant official whose reckless pursuit of other women drains the family\'s money and honor. Balzac shows his weakness growing like a disease.' },
    { id: 'ho', x: 75, y: 200, t: 'Hortense', s: 'the Hulots\' daughter', html: 'She marries Wenceslas, the young artist Bette had secretly hoped to keep for herself, which turns Bette\'s quiet envy into a plan for revenge.' },
    { id: 'wn', x: 70, y: 120, t: 'Wenceslas Steinbock', s: 'a Polish sculptor', html: 'A gifted but weak exile whom Bette rescued and supported. He has talent, but little will to work.' },
    { id: 'vi', x: 330, y: 200, t: 'Victorin Hulot', s: 'the Hulots\' son', html: 'A sober lawyer who tries to save the family\'s finances and name.' },
    { id: 'cr', x: 300, y: 280, t: 'Célestin Crevel', s: 'a rich retired perfumer', html: 'Victorin\'s father-in-law, vain and self-made, a rival of Baron Hulot.' },
    { id: 'va', x: 215, y: 120, t: 'Valérie Marneffe', s: 'Bette\'s ally', html: 'A scheming young wife who, with Bette\'s help, entangles several men, Hulot and Crevel among them, and takes their money.' }
  ], edges: [
    { a: 'be', b: 'ad', t: 'cousins', cls: 'gb19-eg' },
    { a: 'ad', b: 'hh', t: 'married', cls: 'gb19-eg' },
    { a: 'hh', b: 'ho', t: 'daughter', cls: 'gb19-eg', dx: -30, dy: 14 }, { a: 'hh', b: 'vi', t: 'son', cls: 'gb19-eg' },
    { a: 'ho', b: 'wn', t: 'married', cls: 'gb19-eg' },
    { a: 'vi', b: 'cr', t: 'his father-in-law', cls: 'gb19-eg' },
    { a: 'be', b: 'wn', t: 'her protégé', cls: 'gb19-dash' },
    { a: 'be', b: 'va', t: 'allies', cls: 'gb19-ea gb19-dash' },
    { a: 'va', b: 'hh', t: 'ruins', cls: 'gb19-ea gb19-dash', dy: -22 },
    { a: 'va', b: 'cr', t: 'ruins', cls: 'gb19-ea gb19-dash' }
  ] });
});
