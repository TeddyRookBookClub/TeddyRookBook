/* gb-kafka-family: how each member of the Samsa family treats Gregor in the story's three parts (our own summaries;
   no picture of the insect, as Kafka asked). Uses ML.gb20kit.cards with sets. */
ML.viz.register('gb-kafka-family', function (el, opts, V) {
  ML.gb20kit.cards(el, V, { label: 'How the Samsa family treats Gregor in the three parts of The Metamorphosis', layout: 'row', h: 150, setLabel: 'Who', set: opts.set || 'grete', sets: [
    ['grete', 'Grete', [
      { t: 'Part I', s: 'shock', html: 'His sister is the first to worry about him through the locked door, and she runs for help.' },
      { t: 'Part II', s: 'care', html: 'Grete brings him food and learns what he likes. She cleans his room and becomes the family\'s expert on Gregor, a little proud of the role.' },
      { t: 'Part III', s: '"get rid of it"', html: 'Worn out by work and worry, she tells her parents they must get rid of "it": if it were really Gregor, he would have left them in peace.' }
    ]],
    ['mother', 'Mother', [
      { t: 'Part I', s: 'fear', html: 'His mother pleads with him through the door and collapses in fright when she sees him.' },
      { t: 'Part II', s: 'longing', html: 'She longs to see her son and finally enters his room, but faints at the sight of him clinging to a picture on the wall.' },
      { t: 'Part III', s: 'silence', html: 'Weak and tired, she takes in sewing to earn money. She does not argue when Grete says they must be rid of him.' }
    ]],
    ['father', 'Father', [
      { t: 'Part I', s: 'anger', html: 'His father, embarrassed in front of the chief clerk, drives Gregor back into his room with a stick and a newspaper.' },
      { t: 'Part II', s: 'violence', html: 'Now working in a bank messenger\'s uniform, the father thinks Gregor has done something wrong and pelts him with apples. One lodges in his back.' },
      { t: 'Part III', s: 'relief', html: 'After Gregor\'s death, the father takes charge again, sends the lodgers away and leads the family on a hopeful outing.' }
    ]],
    ['gregor', 'Gregor', [
      { t: 'Part I', s: 'duty', html: 'His first thought is his job: he has missed his train, and the family depends on his pay to clear their debts.' },
      { t: 'Part II', s: 'patience', html: 'He hides under the couch so as not to frighten his sister, and listens through the door to the family\'s talk.' },
      { t: 'Part III', s: 'music', html: 'Moved by Grete\'s violin, he creeps out to listen. That night, thinking of his family with tenderness, he dies.' }
    ]]
  ] });
});
