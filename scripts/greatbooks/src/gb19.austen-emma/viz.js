/* gb-emma-matches: Highbury's matches, as Emma imagines them and as they turn out (our own summaries; uses ML.gb19kit.net). */
ML.viz.register('gb-emma-matches', function (el, opts, V) {
  ML.gb19kit.net(el, V, { label: 'The people of Emma and their matches', w: 400, h: 300, set: opts.set || 'plans', setLabel: 'Show', sets: [
    ['plans', 'Emma\'s plans', 'Emma\'s matchmaking, as she imagines it. Tap a name.'],
    ['real', 'What really happens', 'How things actually turn out by the end. Tap a name.']
  ], nodes: [
    { id: 'em', x: 200, y: 150, t: 'Emma Woodhouse', s: 'the matchmaker', html: 'Handsome, clever and rich, nearly twenty-one, and sure she knows everyone\'s heart. She has vowed never to marry. She misreads almost everyone, herself most of all.' },
    { id: 'ha', x: 70, y: 60, t: 'Harriet Smith', s: 'Emma\'s new friend', html: 'A sweet, simple girl of unknown parents. Emma talks her out of accepting the farmer Robert Martin, to aim higher.' },
    { id: 'el', x: 200, y: 40, t: 'Mr. Elton', s: 'the vicar', html: 'Emma plans him for Harriet. He has been courting Emma all along, and when refused, he marries the vain Augusta Hawkins.' },
    { id: 'rm', x: 60, y: 240, t: 'Robert Martin', s: 'a good farmer', html: 'Honest and steady; Mr. Knightley thinks highly of him. Harriet marries him in the end.' },
    { id: 'fc', x: 330, y: 60, t: 'Frank Churchill', s: 'charming visitor', html: 'Mr. Weston\'s son, who flirts with Emma in public, while hiding a secret engagement to Jane Fairfax.' },
    { id: 'jf', x: 340, y: 150, t: 'Jane Fairfax', s: 'reserved and gifted', html: 'Miss Bates\'s niece, accomplished and poor. Emma half-envies her and spreads a foolish guess about her. She is secretly engaged to Frank.' },
    { id: 'kn', x: 200, y: 260, t: 'Mr. Knightley', s: 'neighbor and old friend', html: 'Sixteen years older than Emma, sensible and kind, and "the only one who ever told her of" her faults. Emma realizes late that she loves him.' },
    { id: 'ae', x: 330, y: 250, t: 'Mrs. Elton', s: 'Augusta Hawkins', html: 'Mr. Elton\'s bride: pushy and showy, a comic portrait of vanity.' }
  ], edges: [
    { a: 'ha', b: 'el', t: 'Emma\'s plan', set: 'plans', cls: 'gb19-eg gb19-dash' },
    { a: 'ha', b: 'rm', t: 'refused, at Emma\'s urging', set: 'plans', cls: 'gb19-dash', dx: 30 },
    { a: 'em', b: 'fc', t: 'Emma imagines', set: 'plans', cls: 'gb19-eg gb19-dash' },
    { a: 'ha', b: 'fc', t: 'Emma\'s next guess', set: 'plans', cls: 'gb19-eg gb19-dash', dy: -10 },
    { a: 'ha', b: 'rm', t: 'marry', set: 'real', cls: 'gb19-ea' },
    { a: 'fc', b: 'jf', t: 'secretly engaged', set: 'real', cls: 'gb19-ea' },
    { a: 'em', b: 'kn', t: 'marry', set: 'real', cls: 'gb19-ea' },
    { a: 'el', b: 'ae', t: 'marry', set: 'real', cls: 'gb19-ea', dx: 30 },
    { a: 'el', b: 'em', t: 'he courted Emma', set: 'real', cls: 'gb19-dash' }
  ] });
});
