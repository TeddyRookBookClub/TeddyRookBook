/* gb-tocqueville-journey: Tocqueville and Beaumont's journey, May 1831 to February 1832, on a rough sketch map
   (our own drawing; places by longitude and latitude; uses ML.gb19kit). */
ML.viz.register('gb-tocqueville-journey', function (el, opts, V) {
  ML.gb19kit.route(el, V, { label: 'Map of Tocqueville\'s American journey, 1831 to 1832', w: 400, h: 300, proj: [-96, -65, 48.5, 28],
    bg: [
      { pts: [[-96, 48.5], [-65, 48.5], [-65, 45], [-67, 44.6], [-70, 43.6], [-70.6, 42.6], [-70, 41.8], [-71.5, 41.3], [-74, 40.5], [-74.3, 39.4], [-75.5, 38.3], [-76, 37], [-75.6, 35.3], [-77.9, 33.9], [-79.9, 32.8], [-81, 32], [-81.4, 30.3], [-80.6, 28], [-82.6, 28], [-82.8, 29], [-83.6, 29.8], [-84.6, 30], [-86.2, 30.4], [-88, 30.5], [-89.6, 30.2], [-89.3, 29.2], [-90.6, 29.1], [-92.2, 29.6], [-94.2, 29.6], [-96, 28.8]] },
      { pts: [[-92, 46.7], [-89.3, 48.1], [-85, 47], [-84.5, 46.4], [-87.2, 46.4]], cls: 'gb19-lake' },
      { pts: [[-87.8, 42], [-87.6, 45.6], [-85, 46], [-86.3, 43.6], [-86.6, 42.1]], cls: 'gb19-lake' },
      { pts: [[-84.6, 45.9], [-82.4, 45.9], [-81.4, 45.1], [-81.7, 43.3], [-82.5, 43], [-83.5, 44]], cls: 'gb19-lake' },
      { pts: [[-83.4, 41.7], [-81, 42.3], [-79, 42.9], [-79.3, 42.4], [-81.6, 41.5]], cls: 'gb19-lake' },
      { pts: [[-79.8, 43.3], [-76.3, 44.1], [-76.2, 43.4], [-79, 43.2]], cls: 'gb19-lake' },
      { pts: [[-76.3, 44.2], [-75, 45], [-73.6, 45.5], [-71.2, 46.8], [-68, 48.6]], cls: 'gb19-river', open: true },
      { pts: [[-95.2, 47.3], [-93.2, 44.9], [-91.2, 43.5], [-91.1, 40.8], [-90.2, 38.6], [-89.2, 37], [-90, 35.1], [-91.1, 33], [-91.5, 31.2], [-90.1, 30], [-89.4, 29.2]], cls: 'gb19-river', open: true },
      { pts: [[-80, 40.44], [-80.7, 39.5], [-82.6, 38.6], [-84.5, 39.1], [-85.76, 38.25], [-87.6, 37.9], [-89.2, 37]], cls: 'gb19-river', open: true },
      { pts: [[-74, 40.7], [-73.9, 41.5], [-73.75, 42.65]], cls: 'gb19-river', open: true }
    ],
    labels: [[[-70, 35.5], 'Atlantic Ocean'], [[-89, 28.6], 'Gulf of Mexico'], [[-92.8, 38.5], 'Mississippi'], [[-83.2, 37.8], 'Ohio River']],
    stops: [
      { p: [-71.3, 41.5], t: 'Newport', html: 'May 9, 1831. Alexis de Tocqueville, 25, and his friend Gustave de Beaumont land after five weeks at sea. Their official task: to study American prisons for the French government.' },
      { p: [-74, 40.7], t: 'New York', html: 'May to June 1831. They visit Sing Sing prison up the Hudson and are swept into dinners, balls and endless conversations. Everyone, Tocqueville notes, talks politics.', dy: 14 },
      { p: [-73.75, 42.65], t: 'Albany', html: 'July 4, 1831. They watch Independence Day celebrated by citizens who feel the nation is their own.' },
      { p: [-78.9, 42.9], t: 'Buffalo', html: 'Mid-July 1831. On to the frontier, and Niagara Falls.' },
      { p: [-83.05, 42.33], t: 'Detroit', html: 'July 1831. They buy horses and ride into the forest to see the edge of settlement.', dx: -8 },
      { p: [-84, 43.4], t: 'Saginaw', html: 'July 1831. Days in the wilderness, with pioneers clearing land. Tocqueville later wrote a sketch, "A Fortnight in the Wilds."' },
      { p: [-88, 44.5], t: 'Green Bay', html: 'August 1831. By steamboat across the Great Lakes, by way of Mackinac.' },
      { p: [-73.6, 45.5], t: 'Montreal and Quebec', html: 'August 1831. In French Canada they find people of their own language living under British rule.' },
      { p: [-71.06, 42.36], t: 'Boston', html: 'September 1831. Conversations with leading New Englanders about town meetings, the root, Tocqueville decides, of American self-government.' },
      { p: [-75.16, 39.95], t: 'Philadelphia', html: 'October 1831. They study the new Eastern State Penitentiary, built on solitary confinement.', dx: -8, dy: 14 },
      { p: [-76.6, 39.3], t: 'Baltimore', html: 'November 1831. Tocqueville meets Charles Carroll, the last living signer of the Declaration of Independence.' },
      { p: [-80, 40.44], t: 'Pittsburgh', html: 'November 1831. West over the mountains, then by steamboat down the Ohio River.' },
      { p: [-84.5, 39.1], t: 'Cincinnati', html: 'December 1831. On the Ohio River, Tocqueville compares the free state of Ohio with slave-holding Kentucky across the water, and judges that slavery harms the society that keeps it, as well as the enslaved.' },
      { p: [-85.76, 38.25], t: 'Louisville', html: 'December 1831. With the river frozen, they travel overland through Kentucky and Tennessee in bitter cold.', dy: 16 },
      { p: [-90.05, 35.15], t: 'Memphis', html: 'December 1831. They watch Choctaw families, forced from their lands, crossing the icy Mississippi, a scene Tocqueville describes with sorrow.' },
      { p: [-90.07, 29.95], t: 'New Orleans', html: 'January 1, 1832. By steamboat down the Mississippi to the city at its mouth.', dx: -8, dy: -10 },
      { p: [-77.04, 38.9], t: 'Washington', html: 'January 1832. Overland through the South to the capital, where they meet President Andrew Jackson.' },
      { p: [-74, 40.7], t: 'New York, home', html: 'February 20, 1832. They sail for France, nine months after landing. Volume 1 of <i>Democracy in America</i> appears in 1835, Volume 2 in 1840.', dx: -8, dy: 16 }
    ] });
});
