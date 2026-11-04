/* gb-frazer-sort: Frazer's two laws of sympathetic magic, a sorting game with examples of the kinds he describes.
   gb-frazer-stages: his scheme of magic, religion and science, against later scholars' view. Our own designs. */
ML.viz.register('gb-frazer-sort', function (el, opts, V) {
  ML.gb20kit.sorter(el, V, { label: 'Frazer\'s two laws of magic', prompt: 'Which of Frazer\'s laws is behind this custom?',
    bins: [['sim', 'Similarity: like makes like'], ['con', 'Contact: once touched, still linked']],
    hint: 'Choose a law for each custom.',
    items: [
      { t: 'Sprinkling water on the ground to bring rain', bin: 'sim', why: 'Copying the rain is meant to cause rain: imitative magic.' },
      { t: 'Keeping a child\'s first tooth safe so no harm comes to the child', bin: 'con', why: 'The tooth was once part of the child, so it is thought to stay linked to her.' },
      { t: 'Farmers leaping high in the fields so the crops grow tall', bin: 'sim', why: 'The high jump imitates tall growth.' },
      { t: 'Treating the weapon that made a wound, to heal the wound', bin: 'con', why: 'Frazer describes this old European "weapon salve": the weapon touched the wound.' },
      { t: 'Making a model of an animal before a hunt', bin: 'sim', why: 'The image stands for the real animal: like produces like.' },
      { t: 'Hiding one\'s hair clippings so no one can use them', bin: 'con', why: 'Hair once part of a person was thought to stay connected to him.' }
    ] });
});
ML.viz.register('gb-frazer-stages', function (el, opts, V) {
  ML.gb20kit.cards(el, V, { label: 'Magic, religion and science', layout: 'row', h: 150, set: opts.s || 'f', setLabel: 'View', sets: [
    ['f', 'Frazer (1922)', [
      { t: 'Magic', s: 'a false science', html: 'People assume nature follows fixed rules they can control, but the rules are wrong.' },
      { t: 'Religion', s: 'seeking higher powers', html: 'When magic fails, people ask gods or spirits for favor instead.' },
      { t: 'Science', s: 'rules that work', html: 'Science returns to fixed laws of nature, now tested by observation. Frazer saw this as the line of progress.' }
    ]],
    ['l', 'Later scholars', [
      { t: 'Side by side', s: 'not stages', html: 'Fieldwork found magic, religion and practical knowledge existing together in the same societies, including modern ones.' },
      { t: 'Meaning', s: 'not mistakes', html: 'Rites express belonging, hope and meaning; treating them as failed science misses much of what they do.' },
      { t: 'Context', s: 'fieldwork', html: 'Customs must be understood in their own setting. Malinowski and others lived for years with the peoples they studied.' }
    ]]
  ] });
});
