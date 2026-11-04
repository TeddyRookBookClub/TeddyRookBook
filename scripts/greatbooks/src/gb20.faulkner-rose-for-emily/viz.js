/* gb-faulkner-order: "A Rose for Emily" in the order the town tells it, and in the order things happened (our own summaries,
   without grim detail). Uses ML.gb20kit.cards with two sets. */
ML.viz.register('gb-faulkner-order', function (el, opts, V) {
  var A = { t: 'Her funeral', s: 'the whole town comes', html: 'Miss Emily Grierson dies, old and alone, and the whole town goes to her funeral, mostly out of curiosity to see inside her house.' },
      Bt = { t: 'The tax visit', s: '"no taxes in Jefferson"', html: 'Years before her death, the town\'s new leaders send her a tax bill. She tells their committee she has no taxes in Jefferson, and sends them away.' },
      Cs = { t: 'The smell', s: 'thirty years earlier', html: 'Not long after her sweetheart deserted her, neighbors complain of a bad smell from her house. Rather than confront her, four men sprinkle lime around it at night.' },
      Df = { t: 'Her father dies', s: 'she won\'t let go', html: 'Her proud father, who drove away every suitor, dies. For three days she tells callers he is not dead, until at last she lets them bury him.' },
      Eh = { t: 'Homer Barron', s: 'a Yankee foreman', html: 'A cheerful Northern construction foreman comes to pave the streets, and Miss Emily is seen driving with him on Sundays. The town gossips and pities her.' },
      Fp = { t: 'The druggist', s: 'a purchase', html: 'She buys poison from the druggist, refusing to say why; the town fears she means to harm herself. Soon afterward Homer Barron is seen entering her house, and is never seen again.' },
      Gy = { t: 'The long years', s: 'alone in the house', html: 'She grows old in her decaying house, gives china-painting lessons for a while, and then shuts her door to everyone but her one servant.' },
      Hr = { t: 'The locked room', s: 'after the funeral', html: 'After the funeral, the townspeople force open a room upstairs no one has seen in forty years, and discover the terrible secret of what became of Homer Barron.' };
  ML.gb20kit.cards(el, V, { label: 'The events of A Rose for Emily, in telling order and in time order', layout: 'col', setLabel: 'Order', set: opts.set || 'told', sets: [
    ['told', 'As the town tells it', [A, Bt, Cs, Df, Eh, Fp, Gy, Hr]],
    ['clock', 'As it happened', [Df, Eh, Fp, Cs, Gy, Bt, A, Hr]]
  ] });
});
