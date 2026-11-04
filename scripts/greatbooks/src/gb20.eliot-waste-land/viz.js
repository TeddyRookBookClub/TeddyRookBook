/* gb-eliot-fragments: the five sections of The Waste Land and some of the sources Eliot names in his notes (our own summaries).
   Uses ML.gb20kit.net with one set of lines per section. */
ML.viz.register('gb-eliot-fragments', function (el, opts, V) {
  ML.gb20kit.net(el, V, { label: 'The five sections of The Waste Land and the older works they borrow from', w: 420, h: 300, setLabel: 'Section', set: opts.set || 'I',
    sets: [
      ['I', 'I', 'I. The Burial of the Dead: spring that hurts, a fortune-teller, and London\'s crowds. Tap a source.'],
      ['II', 'II', 'II. A Game of Chess: two scenes of unhappy talk, one in a rich room, one in a pub. Tap a source.'],
      ['III', 'III', 'III. The Fire Sermon: the River Thames, the prophet Tiresias, and a warning against burning desire. Tap a source.'],
      ['IV', 'IV', 'IV. Death by Water: ten short lines about a drowned sailor. Tap a source.'],
      ['V', 'V', 'V. What the Thunder Said: a dry journey, an empty chapel, and the thunder\'s three words. Tap a source.']
    ],
    nodes: [
      { id: 'poem', t: 'The Waste Land', s: '1922', x: 210, y: 150, html: 'A poem of 433 lines in five sections, built from many voices and quotations. Eliot added notes naming many of his sources.' },
      { id: 'grail', t: 'The Grail legend', s: 'the Fisher King', x: 90, y: 30, html: 'In the old romances, a wounded king rules a barren land that will heal only when a knight asks the right question. Eliot read about it in Jessie Weston\'s From Ritual to Romance (1920).' },
      { id: 'frazer', t: 'Frazer', s: 'The Golden Bough', x: 330, y: 30, html: 'The anthropologist James Frazer gathered myths of gods who die and rise again with the seasons. His book is also on this ladder.' },
      { id: 'dante', t: 'Dante', s: 'the Inferno', x: 50, y: 110, html: 'The crowd flowing over London Bridge echoes Dante\'s souls in the outskirts of Hell.' },
      { id: 'shak', t: 'Shakespeare', s: 'The Tempest and more', x: 370, y: 110, html: 'A song from The Tempest about a drowned father ("Those are pearls that were his eyes") returns again and again. Part II opens with an echo of Antony and Cleopatra.' },
      { id: 'ovid', t: 'Ovid', s: 'Metamorphoses', x: 60, y: 200, html: 'Eliot borrows Ovid\'s Tiresias, the blind prophet who has lived as both man and woman, and the story of Philomela, turned into a nightingale.' },
      { id: 'aug', t: 'Augustine', s: 'Confessions', x: 140, y: 270, html: 'The words "To Carthage then I came" and the image of burning come from Augustine\'s story of his restless youth.' },
      { id: 'bud', t: 'The Buddha', s: 'the Fire Sermon', x: 290, y: 270, html: 'In the Fire Sermon, the Buddha teaches that the senses are "burning" with desire. Eliot\'s note sets this beside Augustine.' },
      { id: 'upa', t: 'The Upanishads', s: 'Datta, Dayadhvam, Damyata', x: 370, y: 200, html: 'In an old Hindu text, the thunder speaks the syllable "Da," heard as give, sympathize and control.' }
    ],
    edges: [
      { a: 'poem', b: 'dante', set: 'I' }, { a: 'poem', b: 'grail', set: 'I' }, { a: 'poem', b: 'shak', set: 'I' },
      { a: 'poem', b: 'shak', set: 'II' }, { a: 'poem', b: 'ovid', set: 'II' },
      { a: 'poem', b: 'ovid', set: 'III' }, { a: 'poem', b: 'aug', set: 'III' }, { a: 'poem', b: 'bud', set: 'III' },
      { a: 'poem', b: 'shak', set: 'IV' }, { a: 'poem', b: 'frazer', set: 'IV' },
      { a: 'poem', b: 'grail', set: 'V' }, { a: 'poem', b: 'upa', set: 'V' }, { a: 'poem', b: 'frazer', set: 'V' }
    ] });
});
