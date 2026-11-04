/* gb-oneill-map: Aeschylus' Oresteia characters matched to O'Neill's Mannon family (our own summaries). Uses ML.gb20kit.net. */
ML.viz.register('gb-oneill-map', function (el, opts, V) {
  ML.gb20kit.net(el, V, { label: 'Characters of the Oresteia matched with the Mannon family in Mourning Becomes Electra', w: 400, h: 290, setLabel: 'Show', set: opts.set || 'map',
    sets: [['map', 'Greek and American', 'Left: Aeschylus (Argos, after the Trojan War). Right: O\'Neill (New England, 1865). Tap a name.'], ['fam', 'The Mannon family', 'How the Mannons are tied together. Tap a name.']],
    nodes: [
      { id: 'ag', t: 'Agamemnon', s: 'king home from Troy', x: 80, y: 40, html: 'In Aeschylus, the king who returns from the Trojan War and is murdered by his wife.' },
      { id: 'cl', t: 'Clytemnestra', s: 'his queen', x: 80, y: 100, html: 'The queen who kills her husband, partly in revenge for their daughter Iphigenia.' },
      { id: 'el', t: 'Electra', s: 'their daughter', x: 80, y: 160, html: 'The daughter who mourns her father and longs for revenge.' },
      { id: 'or', t: 'Orestes', s: 'their son', x: 80, y: 220, html: 'The son who returns from exile to avenge his father, and is pursued by the Furies until a court in Athens frees him.' },
      { id: 'ae', t: 'Aegisthus', s: 'the queen\'s lover', x: 80, y: 272, html: 'Clytemnestra\'s partner, cousin of Agamemnon, whose own father was wronged by Agamemnon\'s father.' },
      { id: 'ez', t: 'Ezra Mannon', s: 'general home from war', x: 310, y: 40, html: 'A stern Union general who comes home in 1865 hoping to start again with his wife. She poisons him.' },
      { id: 'ch', t: 'Christine', s: 'his wife', x: 310, y: 100, html: 'Ezra\'s wife, who has long hated him and loves Adam Brant. When her plans collapse she takes her own life.' },
      { id: 'la', t: 'Lavinia', s: 'their daughter', x: 310, y: 160, html: 'Devoted to her father, she uncovers her mother\'s crime and drives the revenge. At the end she shuts herself inside the house for life.' },
      { id: 'on', t: 'Orin', s: 'their son', x: 310, y: 220, html: 'Wounded in the war, close to his mother, he is persuaded by Lavinia to take revenge, and is destroyed by guilt.' },
      { id: 'ad', t: 'Adam Brant', s: 'a sea captain', x: 310, y: 272, html: 'A ship\'s captain, secretly the son of a Mannon who was disowned. He seeks revenge on the family, and loves Christine.' }
    ],
    edges: [
      { a: 'ag', b: 'ez', set: 'map', cls: 'gb20-dash' }, { a: 'cl', b: 'ch', set: 'map', cls: 'gb20-dash' }, { a: 'el', b: 'la', set: 'map', cls: 'gb20-dash gb20-ea' },
      { a: 'or', b: 'on', set: 'map', cls: 'gb20-dash' }, { a: 'ae', b: 'ad', set: 'map', cls: 'gb20-dash' },
      { a: 'ez', b: 'ch', set: 'fam', t: 'married' }, { a: 'ch', b: 'la', set: 'fam', t: 'rivals', dx: 30 }, { a: 'la', b: 'on', set: 'fam', t: 'sister, brother', dx: 36 },
      { a: 'ez', b: 'la', set: 'fam', t: 'she adores him', dx: -48 }, { a: 'ch', b: 'on', set: 'fam', t: 'he adores her', dx: -48 }, { a: 'ch', b: 'ad', set: 'fam', t: 'loves', dx: -40 }
    ] });
});
