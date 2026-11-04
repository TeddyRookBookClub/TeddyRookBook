/* gb-joyce-stairs: the five chapters of A Portrait of the Artist as a Young Man as a stair (our own summaries). Uses ML.gb20kit.cards. */
ML.viz.register('gb-joyce-stairs', function (el, opts, V) {
  ML.gb20kit.cards(el, V, { label: 'The five chapters of A Portrait of the Artist as a Young Man', layout: 'stairs', w: 420, h: 260, items: [
    { t: 'Childhood', s: 'Clongowes', html: 'Baby talk and home; then boarding school. A Christmas dinner splits the family over politics. Punished unfairly by a teacher, small Stephen complains to the rector and is cheered by the other boys.' },
    { t: 'Money troubles', s: 'Belvedere', html: 'The family\'s money runs out and they move often in Dublin. Stephen wins essay prizes at a new school and acts in the school play, and he begins to feel restless and alone.' },
    { t: 'The retreat', s: 'fear and repentance', html: 'At a school retreat, a preacher gives long, vivid sermons about death, judgment and hell. Terrified, Stephen goes to confession and resolves to change his life.' },
    { t: 'The call', s: 'priest or artist?', html: 'Stephen lives a strict, devout life, and the director of the school invites him to consider becoming a priest. He says no. On the beach, the sight of a girl wading in the sea fills him with joy, and he feels called to be an artist.' },
    { t: 'Flight', s: 'university', html: 'At university Stephen argues about beauty, faith and Ireland with his friends. He resolves to leave home and be a writer, and the book ends with pages from his diary as he prepares to go.' }
  ] });
});
