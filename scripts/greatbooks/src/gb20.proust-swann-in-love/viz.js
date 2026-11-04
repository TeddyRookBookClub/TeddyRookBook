/* gb-proust-swann: what made Swann fall in love, and what fed his jealousy (our own summaries). Uses ML.gb20kit.net. */
ML.viz.register('gb-proust-swann', function (el, opts, V) {
  ML.gb20kit.net(el, V, { label: 'Swann in Love: the people, the music and the painting that shape Swann\'s feelings', w: 400, h: 280, setLabel: 'Show', set: opts.set || 'love',
    sets: [['love', 'Falling in love', 'Swann builds his love out of music and art. Tap a name.'], ['jealous', 'Jealousy', 'Shut out and suspicious, Swann suffers. Tap a name.']],
    nodes: [
      { id: 'sw', t: 'Swann', s: 'a man of taste', x: 200, y: 140, html: 'Charles Swann, rich, witty and cultivated, a friend of dukes and princes and an expert on painting. He falls for Odette almost against his will.' },
      { id: 'od', t: 'Odette', s: 'not his type', x: 330, y: 140, html: 'Odette de Crécy, whom Swann at first finds not even pretty. His imagination turns her into a work of art.' },
      { id: 'vin', t: 'The little phrase', s: 'Vinteuil\'s sonata', x: 90, y: 40, html: 'A short passage in a violin sonata by the composer Vinteuil. Swann hears it at the Verdurins\' and it becomes the "national anthem" of his love.' },
      { id: 'bot', t: 'Botticelli', s: 'a painting', x: 310, y: 40, html: 'Swann sees in Odette\'s face a likeness to a figure in a fresco by Botticelli in the Sistine Chapel. Loving her becomes like loving a masterpiece.' },
      { id: 'ver', t: 'The Verdurins', s: 'the "little clan"', x: 80, y: 235, html: 'A middle-class couple who rule their salon like a club. At first they welcome Swann; later they shut him out.' },
      { id: 'for', t: 'Forcheville', s: 'a rival', x: 320, y: 240, html: 'A coarse count whom the Verdurins favor. Swann suspects him and suffers.' }
    ],
    edges: [
      { a: 'vin', b: 'sw', set: 'love', dir: true, t: 'stirs', cls: 'gb20-eg' },
      { a: 'bot', b: 'sw', set: 'love', dir: true, t: 'charms', cls: 'gb20-eg' },
      { a: 'sw', b: 'od', set: 'love', dir: true, t: 'imagines', cls: 'gb20-ea' },
      { a: 'ver', b: 'sw', set: 'love', dir: true, t: 'introduce', dx: -20 },
      { a: 'ver', b: 'sw', set: 'jealous', dir: true, t: 'shut out', cls: 'gb20-dash', dx: -20 },
      { a: 'ver', b: 'for', set: 'jealous', dir: true, t: 'favor' },
      { a: 'for', b: 'od', set: 'jealous', t: 'rival', dx: 14 },
      { a: 'sw', b: 'od', set: 'jealous', dir: true, t: 'suspects', cls: 'gb20-ea' },
      { a: 'vin', b: 'sw', set: 'jealous', dir: true, t: 'at last, the end', cls: 'gb20-dash' }
    ] });
});
