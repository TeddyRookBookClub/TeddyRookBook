/* gb-pequod-voyage: the Pequod's voyage and its meetings ("gams") with other ships, on a rough world sketch of our own.
   Places follow the novel loosely; the continents are simplified shapes. Uses ML.gb19kit.route. */
ML.viz.register('gb-pequod-voyage', function (el, opts, V) {
  ML.gb19kit.route(el, V, { label: 'Map of the Pequod\'s voyage in Moby-Dick', w: 400, h: 250, proj: [-85, 185, 52, -48],
    bg: [
      { pts: [[-85, 52], [-56, 52], [-60, 46], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 26], [-81, 9], [-75, 11], [-62, 10], [-52, 5], [-50, 0], [-35, -6], [-39, -15], [-41, -22], [-48, -27], [-53, -34], [-58, -38], [-65, -42], [-68, -48], [-85, -48]] },
      { pts: [[-17, 21], [-17, 14], [-12, 8], [-8, 4], [5, 5], [9, 4], [10, -2], [13, -10], [12, -17], [15, -27], [18, -34], [20, -35], [26, -34], [33, -27], [35, -20], [40, -15], [40, -5], [43, 0], [51, 12], [43, 12], [35, 28], [32, 31], [20, 32], [10, 37], [-5, 36], [-10, 30]] },
      { pts: [[-10, 36], [-10, 52], [142, 52], [142, 46], [135, 42], [129, 35], [122, 40], [121, 31], [117, 24], [108, 21], [106, 11], [103, 1], [100, 6], [98, 15], [92, 22], [88, 22], [80, 15], [77, 8], [73, 20], [67, 25], [57, 25], [56, 22], [52, 16], [44, 12], [42, 15], [35, 28], [34, 31], [28, 37], [20, 40], [12, 44], [3, 43], [-5, 36]] },
      { pts: [[130, 31], [141, 36], [142, 40], [141, 45], [139, 38], [133, 34]] },
      { pts: [[95, 5], [106, -6], [102, -3]] }, { pts: [[105, -6], [115, -8], [106, -7.5]] },
      { pts: [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]] },
      { pts: [[132, -1], [141, -3], [150, -10], [141, -9]] },
      { pts: [[114, -22], [122, -17], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [151, -34], [145, -38], [138, -35], [131, -31], [115, -34], [113, -26]] },
      { pts: [[44, -25], [47, -13], [50, -15], [47, -25]] }
    ],
    labels: [[[-40, 30], 'Atlantic'], [[75, -25], 'Indian Ocean'], [[165, 20], 'Pacific'], [[-60, -1], 'equator', 'gb19-map']],
    stops: [
      { p: [-70.1, 41.3], t: 'Nantucket', html: 'Ishmael and his friend Queequeg sign on to the whaling ship <i>Pequod</i>, which sails on Christmas Day. Captain Ahab stays hidden in his cabin.', dy: 14 },
      { p: [-40, 25], t: 'The Atlantic', html: 'Ahab appears on deck at last, with a leg made from a whale\'s jawbone. He nails a gold coin to the mast for the first man to sight the white whale that took his leg, Moby Dick.' },
      { p: [15, -40], t: 'Off the Cape of Good Hope', html: 'The first meetings, or "gams," with other ships: the <i>Goney</i>, then the <i>Town-Ho</i>, whose crew has a strange story about the white whale.' },
      { p: [65, -20], t: 'The Indian Ocean', html: 'More gams: the <i>Jeroboam</i>, with a wild prophet aboard who warns against Moby Dick, and the German <i>Jungfrau</i>.' },
      { p: [104, -7], t: 'The Sunda Strait', html: 'Near Java the <i>Pequod</i> meets a vast herd of whales, the "Grand Armada," and Ishmael glimpses mother whales and their young swimming calmly at the center.', dx: -8 },
      { p: [128, 10], t: 'Toward the Pacific', html: 'The French <i>Rose-Bud</i>, and the English <i>Samuel Enderby</i>, whose captain lost an arm to Moby Dick and wants nothing more to do with him.' },
      { p: [150, 30], t: 'The Japanese whaling grounds', html: 'The cheerful <i>Bachelor</i>, homeward bound and full of oil; then a typhoon. Starbuck, the first mate, begs Ahab to turn back.' },
      { p: [170, 1], t: 'The equator, Pacific', html: 'The <i>Rachel</i> is searching for its captain\'s lost son; Ahab will not stop to help. After the <i>Delight</i>, which has lost men to Moby Dick, the three-day chase ends with the ship sunk. Only Ishmael survives, floating on Queequeg\'s coffin, until the <i>Rachel</i> finds him.', dx: -8, dy: 16 }
    ] });
});
