/* gb-vanya-estate: the household of Uncle Vanya, with two sets of lines (our own summaries). Uses ML.gb20kit.net. */
ML.viz.register('gb-vanya-estate', function (el, opts, V) {
  ML.gb20kit.net(el, V, { label: 'The people of Uncle Vanya and how they are tied together', w: 400, h: 290, setLabel: 'Show', set: opts.set || 'money',
    sets: [['money', 'Work and money', 'Vanya and Sonya earn the estate\'s money and send it to the professor. Tap a name.'], ['hopes', 'Hopes', 'Who longs for whom, and who notices. Tap a name.']],
    nodes: [
      { id: 'pro', t: 'Serebryakov', s: 'the professor', x: 200, y: 34, html: 'A retired professor who wrote about art for twenty-five years. Vanya once thought him a genius. He complains of gout, keeps everyone up at night, and in Act III proposes to sell the estate.' },
      { id: 'yel', t: 'Yelena', s: 'his young wife', x: 340, y: 110, html: 'The professor\'s beautiful second wife. She is bored and unhappy, and both Vanya and Astrov are drawn to her. She leaves with her husband at the end.' },
      { id: 'van', t: 'Vanya', s: 'runs the estate', x: 70, y: 120, html: 'Ivan Petrovich Voynitsky, brother of the professor\'s late first wife. For twenty-five years he managed the estate and sent its income to the professor. Now he feels he wasted his life.' },
      { id: 'son', t: 'Sonya', s: 'Vanya\'s niece', x: 120, y: 230, html: 'The professor\'s daughter by his first wife. The estate came to her from her mother. She works beside Vanya, loves Astrov in secret, and speaks the play\'s last words of endurance and faith.' },
      { id: 'ast', t: 'Astrov', s: 'the country doctor', x: 300, y: 225, html: 'An overworked doctor who plants trees and makes maps of the district\'s vanishing forests. He is tired, and he notices Yelena far more than Sonya.' },
      { id: 'est', t: 'The estate', s: 'farm and forest', x: 200, y: 150, html: 'A country estate in Russia. Its income has kept the professor in the city for years. Selling it, as he proposes, would leave Vanya and Sonya with nothing.' }
    ],
    edges: [
      { a: 'van', b: 'est', set: 'money', dir: true, t: 'works', cls: 'gb20-eg' },
      { a: 'son', b: 'est', set: 'money', dir: true, t: 'works', cls: 'gb20-eg' },
      { a: 'est', b: 'pro', set: 'money', dir: true, t: 'income', cls: 'gb20-ea' },
      { a: 'pro', b: 'est', set: 'money', t: 'wants to sell', dx: 46, dy: 0, cls: 'gb20-dash' },
      { a: 'pro', b: 'yel', set: 'money', t: 'married' },
      { a: 'van', b: 'yel', set: 'hopes', dir: true, t: 'drawn to', cls: 'gb20-ea' },
      { a: 'ast', b: 'yel', set: 'hopes', dir: true, t: 'drawn to', cls: 'gb20-ea' },
      { a: 'son', b: 'ast', set: 'hopes', dir: true, t: 'loves', cls: 'gb20-eg' },
      { a: 'van', b: 'pro', set: 'hopes', dir: true, t: 'once admired', cls: 'gb20-dash' }
    ] });
});
