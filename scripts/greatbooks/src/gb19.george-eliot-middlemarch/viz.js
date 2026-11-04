/* gb-middlemarch-web: the town's four main stories and how they tangle (our own summaries; uses ML.gb19kit.net). */
ML.viz.register('gb-middlemarch-web', function (el, opts, V) {
  ML.gb19kit.net(el, V, { label: 'The web of Middlemarch', w: 400, h: 310, hint: 'Tap a name. Gold lines are marriages; other lines show how the stories touch.', nodes: [
    { id: 'do', x: 80, y: 40, t: 'Dorothea Brooke', s: 'longs to do great good', html: 'Young, earnest and generous, she marries the elderly scholar Casaubon, hoping to help his great work. She learns, painfully, to see others as they are, and finds her life in many small acts of goodness.' },
    { id: 'ca', x: 300, y: 40, t: 'Mr. Casaubon', s: 'an elderly scholar', html: 'He has spent decades on a "Key to all Mythologies" he will never finish. Cold and jealous, he leaves a will meant to control Dorothea after his death.' },
    { id: 'wl', x: 90, y: 120, t: 'Will Ladislaw', s: 'Casaubon\'s young cousin', html: 'A lively, idealistic artist and journalist. Dorothea gives up Casaubon\'s fortune to marry him.' },
    { id: 'ly', x: 300, y: 120, t: 'Tertius Lydgate', s: 'a new young doctor', html: 'Ambitious to reform medicine, he is dragged down by debt and an unhappy marriage, and his hopes shrink.' },
    { id: 'ro', x: 300, y: 200, t: 'Rosamond Vincy', s: 'the mayor\'s daughter', html: 'Beautiful and self-absorbed, she marries Lydgate for his position and resists every sacrifice.' },
    { id: 'fr', x: 90, y: 200, t: 'Fred Vincy', s: 'Rosamond\'s brother', html: 'Good-natured and idle, deep in debt, he grows up through honest work for Caleb Garth to deserve Mary.' },
    { id: 'ma', x: 75, y: 280, t: 'Mary Garth', s: 'plain-spoken and wise', html: 'She will not marry Fred unless he becomes a man with a useful calling. Her father Caleb is the novel\'s picture of honest work.' },
    { id: 'bu', x: 330, y: 280, t: 'Mr. Bulstrode', s: 'a pious banker', html: 'Respected and powerful, he hides a shameful past. When it comes to light, his fall nearly drags Lydgate down with him.' },
    { id: 'fa', x: 205, y: 280, t: 'Mr. Farebrother', s: 'the kindly vicar', html: 'A wise, tolerant clergyman who loves Mary but helps Fred win her.' }
  ], edges: [
    { a: 'do', b: 'ca', t: 'first marriage', cls: 'gb19-eg' },
    { a: 'do', b: 'wl', t: 'second marriage', cls: 'gb19-eg', dx: 4 },
    { a: 'ca', b: 'wl', t: 'cousins', cls: 'gb19-dash', dx: 40, dy: 16 },
    { a: 'ly', b: 'ro', t: 'married', cls: 'gb19-eg' },
    { a: 'ro', b: 'fr', t: 'brother and sister', cls: 'gb19-dash' },
    { a: 'fr', b: 'ma', t: 'marry at last', cls: 'gb19-eg' },
    { a: 'bu', b: 'ly', t: 'debt and scandal', cls: 'gb19-ea gb19-dash', dx: -50, dy: 42 },
    { a: 'do', b: 'ly', t: 'she trusts him', cls: 'gb19-ea gb19-dash', dx: 30, dy: -4 },
    { a: 'fa', b: 'ma', t: 'friend', cls: 'gb19-dash' }
  ] });
});
