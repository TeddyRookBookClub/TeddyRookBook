/* gb-brecht-wagon: Mother Courage's wagon through the Thirty Years' War, scene by scene (a rough sketch map; places and years
   as the play's scene titles give them; our own summaries). Uses ML.gb20kit.route. */
ML.viz.register('gb-brecht-wagon', function (el, opts, V) {
  ML.gb20kit.route(el, V, { label: 'Sketch map of northern and central Europe with the route of Mother Courage\'s wagon, 1624 to 1636', w: 400, h: 320, proj: [6.5, 27.0, 62.5, 46.5], sea: false,
    bg: [
      { pts: [[6.5, 62.5], [27, 62.5], [27, 46.5], [6.5, 46.5]] },
      { pts: [[10.0, 54.4], [14.0, 54.0], [18.5, 54.6], [21.0, 55.6], [21.6, 57.5], [23.5, 59.4], [26.5, 60.2], [22.0, 60.4], [20.5, 62.5], [17.5, 62.5], [17.2, 61.0], [18.8, 59.6], [16.6, 57.0], [14.5, 56.0], [12.6, 56.0], [10.8, 57.6], [9.8, 56.4]], cls: 'gb20-lake' },
      { pts: [[6.5, 53.4], [8.6, 53.6], [8.4, 55.4], [8.2, 57.0], [6.5, 58.0]], cls: 'gb20-lake' }
    ],
    labels: [[[14.2, 61.4], 'Sweden'], [[19.5, 56.2], 'Baltic Sea'], [[21.5, 51.4], 'Poland'], [[9.8, 50.3], 'the German lands'], [[16.4, 47.4], 'Austria']],
    stops: [
      { p: [15.0, 60.6], t: 'Dalarna, Sweden, 1624', n: 'Dalarna 1624', html: 'Scene 1. A recruiting officer is looking for soldiers. While Mother Courage haggles over a sale, her bold elder son Eilif is talked into joining the army.', dx: 8, dy: -8 },
      { p: [19.0, 52.3], t: 'Poland, 1625–26', n: 'Poland', html: 'Scenes 2 to 4. Eilif is praised for killing peasants and seizing their cattle. Her honest younger son, Swiss Cheese, becomes a regiment\'s paymaster. When he is captured with its cash box, Courage bargains too long over the bribe to free him, and he is executed.', dx: 8, dy: 8 },
      { p: [11.6, 52.1], t: 'Magdeburg, 1631', n: 'Magdeburg 1631', html: 'Scene 5. After a victory by the Catholic general Tilly, Courage refuses to tear up her shirts as bandages for wounded peasants; her mute daughter Kattrin rescues a baby from a burning house.', dx: -8, dy: -8 },
      { p: [11.4, 48.8], t: 'Ingolstadt, Bavaria, 1632', n: 'Ingolstadt 1632', html: 'Scene 6. During Tilly\'s funeral, Courage counts her stock and worries that peace might break out and ruin trade. Kattrin is attacked on an errand and left with a scar.', dx: 8, dy: 10 },
      { p: [12.1, 51.2], t: 'Rumors of peace, 1632', n: 'Peace? 1632', html: 'Scenes 7 and 8. Courage is at the height of her business. News comes that the Swedish king, Gustavus Adolphus, has fallen at the battle of Lützen; peace seems near, and she fears for her trade. In a brief peace, Eilif is executed for a killing like the ones he was praised for in war.', dx: 8, dy: -4 },
      { p: [11.9, 50.0], t: 'Fichtelgebirge, 1634', n: 'Fichtelgebirge 1634', html: 'Scene 9. In a hungry winter, Courage chooses to keep her wagon and her daughter rather than leave with the cook for a quiet life.', dx: -10, dy: 12 },
      { p: [12.0, 51.5], t: 'Near Halle, 1636', n: 'Halle 1636', html: 'Scenes 10 to 12. While Courage is away, soldiers creep up on the sleeping town of Halle. Kattrin climbs onto a roof and beats a drum to wake the town, and is shot. Alone, Courage harnesses herself to the wagon and follows the army.', dx: -10, dy: -10 }
    ] });
});
