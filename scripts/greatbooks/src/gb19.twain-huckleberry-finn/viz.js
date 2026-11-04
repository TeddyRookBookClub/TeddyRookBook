/* gb-huck-river: Huck and Jim's raft trip down the Mississippi. Real places by longitude and latitude; the novel's made-up
   towns are placed by us along the river, roughly where the story puts them. Our own sketch map; uses ML.gb19kit.route. */
ML.viz.register('gb-huck-river', function (el, opts, V) {
  ML.gb19kit.route(el, V, { label: 'Map of Huck and Jim\'s journey down the Mississippi', w: 400, h: 320, sea: false, proj: [-93.2, -87.6, 40.3, 32.9],
    bg: [
      { pts: [[-93.2, 40.3], [-87.6, 40.3], [-87.6, 32.9], [-93.2, 32.9]], cls: 'gb19-land' },
      { pts: [[-91.5, 40.3], [-91.36, 39.71], [-90.8, 39.1], [-90.19, 38.63], [-89.9, 38.0], [-89.52, 37.3], [-89.18, 37.0], [-89.53, 36.59], [-89.7, 36.0], [-90.05, 35.15], [-90.6, 34.53], [-91.0, 33.9], [-91.1, 33.3], [-91.0, 32.9]], cls: 'gb19-river', open: true },
      { pts: [[-89.18, 37.0], [-88.6, 37.1], [-87.6, 37.6]], cls: 'gb19-river', open: true },
      { pts: [[-93.2, 39.0], [-90.19, 38.63]], cls: 'gb19-river', open: true }
    ],
    labels: [[[-92.4, 37.8], 'MISSOURI'], [[-88.9, 38.8], 'ILLINOIS'], [[-88.7, 36.4], 'KENTUCKY'], [[-88.9, 35.5], 'TENNESSEE'], [[-92.2, 34.6], 'ARKANSAS'], [[-88.1, 37.85], 'Ohio River'], [[-90.7, 36.6], 'Mississippi']],
    stops: [
      { p: [-91.36, 39.71], t: 'St. Petersburg', n: 'St. Petersburg (Hannibal)', html: 'Huck\'s home town, modeled on Twain\'s own Hannibal, Missouri. The Widow Douglas is trying to "sivilize" him; then his cruel, drunken father carries him off to a cabin. Huck escapes by faking his own death.', always: true },
      { p: [-91.2, 39.45], t: 'Jackson\'s Island', html: 'Hiding on the island, Huck finds Jim, who has run away from Miss Watson because she planned to sell him down the river, away from his wife and children. The two decide to travel together.', dx: -8 },
      { p: [-90.19, 38.63], t: 'Past St. Louis', html: 'They float at night on a raft and hide by day. Jim plans to reach Cairo, at the mouth of the Ohio, and go up that river to the free states.', dx: -8 },
      { p: [-89.18, 37.0], t: 'Cairo, lost in the fog', html: 'In a thick fog they drift past Cairo without knowing it. Huck plays a cruel trick on Jim, then apologizes, and later saves him from slave-hunters by inventing a story about smallpox aboard.', always: true },
      { p: [-89.6, 36.3], t: 'The Grangerford feud', html: 'After a steamboat smashes the raft, Huck stays with the Grangerfords, a family locked in a deadly feud with the Shepherdsons. Sickened, he escapes back to the raft and Jim.', dx: -8 },
      { p: [-90.2, 35.0], t: 'The king and the duke', html: 'Two con men join the raft, claiming to be a duke and a lost king. They swindle towns along the river with fake shows and lies, and Huck and Jim cannot get rid of them.', dx: -8 },
      { p: [-90.75, 34.2], t: 'The Wilks family', html: 'The con men pose as relatives to steal three orphan sisters\' inheritance. Huck, touched by the sisters\' kindness, secretly works against the swindle.', dx: -8 },
      { p: [-91.05, 33.5], t: 'Phelps farm', html: 'The king sells Jim for a reward. Huck faces his great choice, decides to help Jim even if it means, as he has been taught, going to hell, and finds Jim held at the Phelps farm. Tom Sawyer arrives and turns the rescue into an elaborate game. In the end Jim learns he was already free: Miss Watson had freed him in her will.', always: true, dx: 8 }
    ] });
});
