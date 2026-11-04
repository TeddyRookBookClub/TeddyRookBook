/* gb-barth-direction: the turn Barth described, from "human thoughts about God" to "God's word to people" (our summary).
   gb-barth-life: a timeline of Barth's life and work (ML.gb20kit.line). Our own designs. */
ML.viz.register('gb-barth-direction', function (el, opts, V) {
  var K = ML.gb20kit, F = K.frame(el, 400, 200, 'Which way the arrow points'), sv = F.svg, ro = V.readout(el), d = opts.d || 'up';
  var TXT = {
    up: ['Reading the Bible as human religion', 'In the liberal theology Barth was taught, the Bible is above all a record of people\'s search for God: their religious experience, their ideals, their history. The arrow points from humanity up toward God.'],
    down: ['Reading the Bible as God\'s word', 'Barth\'s turn: "not the right human thoughts about God ... but the right divine thoughts about men." The Bible tells how God seeks people, so the arrow points from God toward humanity. (Our summary of Barth\'s view.)']
  };
  function draw() {
    K.clear(sv);
    K.S('rect', { x: 120, y: 12, width: 160, height: 40, rx: 10, 'class': 'gb20-box' }, sv); K.T(sv, 200, 37, 'God', 'gb20-t');
    K.S('rect', { x: 110, y: 140, width: 180, height: 54, rx: 10, 'class': 'gb20-box' }, sv);
    [140, 180, 220, 260].forEach(function (x, i) { K.person(sv, x, 160, 1.5, i % 2 ? 'gb20-robe2' : 'gb20-robe'); });
    if (d === 'up') K.arrow(sv, 200, 136, 200, 58, 'gb20-big-arrow'); else K.arrow(sv, 200, 56, 200, 134, 'gb20-big-arrow');
    K.T(sv, 214, 104, d === 'up' ? 'people search for God' : 'God speaks to people', 'gb20-t', 'start');
    ro.set('<b>' + TXT[d][0] + '.</b> ' + TXT[d][1]);
  }
  V.seg(F.ctl, { label: 'Reading', items: [['up', 'Liberal theology'], ['down', 'Barth']], value: d, change: function (v) { d = v; draw(); } });
  draw();
});
ML.viz.register('gb-barth-life', function (el, opts, V) {
  ML.gb20kit.line(el, V, { label: 'Karl Barth, 1886–1968', from: 1880, to: 1972, ticks: [1890, 1910, 1930, 1950, 1970], start: 3, events: [
    { y: 1886, t: 'Born in Basel', html: 'Son of a Swiss Reformed theology professor.' },
    { y: 1911, t: 'Pastor at Safenwil', html: 'A village of farmers and factory workers in Switzerland, where he preached for ten years.', lane: 1 },
    { y: 1914, t: 'The war and the manifesto', html: 'Many of his German teachers publicly supported their government\'s war policy. Barth began to rethink theology from the ground up.', lane: 2 },
    { y: 1916, t: 'The Strange New World within the Bible', html: 'One of the addresses later collected in The Word of God and the Word of Man.' },
    { y: 1919, t: 'Commentary on Romans', html: 'Rewritten in 1922; it made him famous almost overnight.', lane: 1 },
    { y: 1924, t: 'The Word of God and Theology', html: 'The German collection of his addresses of 1916–23. Douglas Horton\'s English translation, The Word of God and the Word of Man, followed in 1928.', lane: 2 },
    { y: 1932, t: 'Church Dogmatics begins', html: 'His life\'s work, still unfinished at his death, more than 9,000 pages.' },
    { y: 1934, t: 'The Barmen Declaration', html: 'Main author of the statement in which German Protestants rejected the Nazi state\'s claim to control the church. In 1935 he lost his post at Bonn and went home to Basel.', lane: 1 },
    { y: 1968, t: 'Dies in Basel', html: 'One of the most widely studied theologians of the century.', lane: 2 }
  ] });
});
