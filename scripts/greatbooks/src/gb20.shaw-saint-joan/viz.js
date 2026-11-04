/* gb-shaw-joan: Joan of Arc's road across France, with the scenes of Shaw's play (a sketch map; our own summaries). Uses ML.gb20kit.route. */
ML.viz.register('gb-shaw-joan', function (el, opts, V) {
  ML.gb20kit.route(el, V, { label: 'Sketch map of France: Joan\'s road and the scenes of Shaw\'s Saint Joan', w: 400, h: 300, proj: [-5.6, 9.2, 51.6, 42.0],
    bg: [
      { pts: [[-4.7, 48.4], [-3.0, 48.8], [-1.4, 48.7], [-1.3, 49.7], [0.1, 49.5], [1.6, 50.9], [2.6, 51.1], [4.2, 49.9], [6.4, 49.5], [8.2, 49.0], [7.6, 47.6], [6.9, 46.4], [7.7, 45.1], [7.4, 43.8], [4.0, 43.5], [3.1, 42.4], [-1.8, 43.4], [-1.2, 46.2], [-2.5, 47.2], [-4.7, 47.9]] },
      { pts: [[4.3, 45.3], [3.0, 46.9], [2.6, 47.4], [1.9, 47.9], [0.7, 47.4], [0.2, 47.2], [-1.6, 47.2], [-2.2, 47.3]], open: true, cls: 'gb20-river' }
    ],
    labels: [[[-2.6, 50.6], 'English Channel'], [[2.0, 45.0], 'France'], [[-0.6, 46.9], 'the Loire']],
    stops: [
      { p: [5.68, 48.44], t: 'Domrémy, her home', n: 'Domrémy', html: 'Joan, a farmer\'s daughter, grows up in a village on France\'s eastern edge. From about age thirteen she hears voices, which she says are Saint Michael, Saint Catherine and Saint Margaret, telling her to save France.', dx: 8, dy: 14 },
      { p: [5.67, 48.60], t: 'Vaucouleurs (Scene I, 1429)', n: 'Vaucouleurs', html: 'Shaw\'s play opens with Joan talking the blustering squire Robert de Baudricourt into giving her a horse, armor and an escort. His hens, which stopped laying, start again, and he takes it as a sign.', dx: -8, dy: -8 },
      { p: [0.24, 47.17], t: 'Chinon (Scene II)', n: 'Chinon', html: 'At court, Joan picks out the Dauphin Charles, a timid young prince, though he hides among his courtiers, and puts courage into him.', dx: -8, dy: 16 },
      { p: [1.91, 47.90], t: 'Orléans (Scene III)', n: 'Orléans', html: 'On the Loire, the commander Dunois waits for the wind to change so his boats can cross. Joan arrives, the wind turns, and the long siege is broken.', dx: 8, dy: 4 },
      { p: [4.03, 49.26], t: 'Reims (Scene V)', n: 'Reims', html: 'Charles is crowned in the cathedral. But Joan\'s allies are tiring of her, and they warn her that if she is captured no one will ransom her. (Scene IV, before this, shows English and Church leaders plotting her downfall.)', dx: 8, dy: -6 },
      { p: [2.83, 49.42], t: 'Compiègne (1430)', n: 'Compiègne', html: 'Offstage in the play, Joan is captured in a skirmish and sold to the English.', dx: -8, dy: -10 },
      { p: [1.10, 49.44], t: 'Rouen (Scene VI, 1431)', n: 'Rouen', html: 'The trial. Shaw makes the judges thoughtful men who believe they are saving her soul and the Church. Joan is condemned and executed. Twenty-five years later a second trial clears her name, and in 1920 she is declared a saint (the Epilogue).', dx: -8, dy: 16 }
    ] });
});
