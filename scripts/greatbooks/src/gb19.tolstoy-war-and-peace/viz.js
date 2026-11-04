/* gb-1812: Napoleon's invasion of Russia in 1812 and the retreat, as War and Peace follows it (our own sketch map; rivers simplified).
   Dates are New Style (the Western calendar). Uses ML.gb19kit.route. */
ML.viz.register('gb-1812', function (el, opts, V) {
  ML.gb19kit.route(el, V, { label: 'Map of the 1812 campaign in War and Peace', w: 400, h: 250, sea: false, proj: [21.5, 39.5, 56.6, 53.2],
    bg: [
      { pts: [[21.5, 56.6], [39.5, 56.6], [39.5, 53.2], [21.5, 53.2]], cls: 'gb19-land' },
      { pts: [[24.0, 53.4], [23.9, 54.9], [22.0, 55.1]], cls: 'gb19-river', open: true },
      { pts: [[33.5, 55.6], [32.05, 54.78], [30.4, 54.5], [30.0, 53.9], [30.3, 53.2]], cls: 'gb19-river', open: true },
      { pts: [[35.2, 55.6], [37.6, 55.75], [38.8, 55.1]], cls: 'gb19-river', open: true },
      { pts: [[28.6, 55.3], [28.3, 54.3], [29.2, 53.2]], cls: 'gb19-river', open: true }
    ],
    labels: [[[22.6, 53.5], 'Neman'], [[30.9, 53.6], 'Dnieper'], [[28.0, 55.5], 'Berezina'], [[38.4, 55.3], 'Moskva']],
    stops: [
      { p: [23.9, 54.9], t: 'Crossing the Neman', html: 'June 24, 1812. Napoleon\'s Grand Army, perhaps 450,000 to 600,000 men from many nations, crosses into Russia. Tolstoy shows Polish lancers drowning in a river to impress the Emperor, who barely notices.', always: true, dy: 18 },
      { p: [25.3, 54.7], t: 'Vilna', html: 'Tsar Alexander hears of the invasion at a ball. The Russian armies fall back, refusing battle.', dy: 16 },
      { p: [32.05, 54.78], t: 'Smolensk', html: 'August 1812. After hard fighting the city burns. Old Prince Bolkonsky\'s estate, Bald Hills, lies in the army\'s path; Princess Mary must flee.', always: true },
      { p: [35.8, 55.52], t: 'Borodino', html: 'September 7, 1812. The great battle, with tens of thousands killed or wounded on each side. Pierre wanders the field in a white hat; Prince Andrew is gravely wounded. Neither side wins outright, but the Russian army survives.', always: true },
      { p: [37.6, 55.75], t: 'Moscow', html: 'September 14. The French enter an emptied city, which soon burns. The Rostovs leave and, at Natasha\'s urging, give their carts to the wounded. Pierre stays behind and is taken prisoner.', always: true, dx: -8 },
      { p: [36.6, 55.0], t: 'Maloyaroslavets', html: 'October 24. Napoleon tries to march south; after a battle here he turns back along the ravaged road he came by. Old General Kutuzov waits, letting the winter and the long road do their work.', dy: 16 },
      { p: [34.3, 55.2], t: 'Vyazma and the retreat', html: 'November. Cold, hunger and partisans wear down the French. Denisov and Dolokhov\'s raiders free Pierre; young Petya Rostov is killed in the attack.' },
      { p: [28.3, 54.3], t: 'The Berezina', html: 'November 26 to 29. The remnants of the Grand Army cross the river on hastily built bridges, with terrible losses.', always: true, dx: -8 },
      { p: [23.9, 54.9], t: 'Out of Russia', html: 'December 1812. Only a small fraction of the army that invaded crosses back. Tolstoy asks: did Napoleon\'s orders decide any of this, or millions of people\'s choices?', dy: -12 }
    ] });
});
