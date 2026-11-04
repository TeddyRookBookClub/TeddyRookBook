/* gb-conrad-river: Marlow's journey in Heart of Darkness, on a sketch map (not to scale; our own summaries). Uses ML.gb20kit.route. */
ML.viz.register('gb-conrad-river', function (el, opts, V) {
  ML.gb20kit.route(el, V, { label: 'Sketch map of Marlow\'s journey in Heart of Darkness', w: 400, h: 300,
    bg: [
      { pts: [[0, 0], [170, 0], [175, 22], [150, 52], [95, 62], [40, 58], [0, 66]] },
      { pts: [[78, 102], [150, 92], [240, 96], [330, 84], [400, 96], [400, 300], [120, 300], [104, 262], [74, 214], [58, 160]] },
      { pts: [[96, 226], [130, 218], [170, 200], [205, 186], [250, 160], [290, 132], [330, 112], [350, 104]], open: true, cls: 'gb20-river' }
    ],
    labels: [[[30, 92], 'the sea'], [[118, 16], 'Europe'], [[262, 246], 'Africa'], [[282, 178], 'the river']],
    stops: [
      { p: [52, 36], t: 'On the Thames', n: 'The Nellie', html: 'Five friends wait for the tide on the yacht <em>Nellie</em> near London. As the sun sets, Marlow begins his story. One listener, never named, tells it to us.' },
      { p: [128, 44], t: 'The Company\'s city', n: 'The Company', html: 'In a European city (Brussels, though it is never named) Marlow signs on with a trading company. Two women knit black wool at the door, and a doctor measures his head "for science."', dx: 8, dy: 18 },
      { p: [70, 150], t: 'Down the coast', n: 'The coast', html: 'A French steamer carries him along the coast. He sees a warship firing into the forest at an enemy he cannot see, and the sight seems mad to him.', dx: -8 },
      { p: [100, 222], t: 'The Company\'s station', n: 'Outer Station', html: 'At the first station he finds waste and suffering: rusting machines, men in chains, and workers left to die in the shade. A neatly dressed accountant first tells him of Mr. Kurtz.', dx: 10, dy: 14 },
      { p: [182, 196], t: 'The Central Station', n: 'Central Station', html: 'After a long march overland, Marlow finds his steamer sunk. He waits months for rivets to repair it, among agents who scheme for promotion and talk about Kurtz with envy.', dx: -10, dy: 20 },
      { p: [278, 138], t: 'Up the river', n: 'Up the river', html: 'The slow trip upriver feels like going back to the beginning of the world. Fog falls, the boat is attacked, and Marlow\'s helmsman is killed.', dx: -14, dy: -10 },
      { p: [348, 104], t: 'The Inner Station', n: 'Inner Station', html: 'Kurtz has made himself a feared ruler over the people near his station, and he is dying. On the trip downstream he speaks his last words: "The horror! The horror!"', dx: -10, dy: -12 },
      { p: [124, 40], t: 'Back in the city', n: 'The Intended', html: 'A year later Marlow visits the woman Kurtz was engaged to. She asks for his last words, and Marlow, who hates lies, tells her that Kurtz spoke her name.', dx: 10, dy: -10 }
    ] });
});
