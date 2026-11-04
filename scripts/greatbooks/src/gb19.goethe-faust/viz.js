/* gb-faust-journey: the road through Faust, Parts One and Two, scene by scene (our own summaries; uses ML.gb19kit.cards). */
ML.viz.register('gb-faust-journey', function (el, opts, V) {
  ML.gb19kit.cards(el, V, { label: 'Faust\'s journey through the two parts of the play', layout: 'col', setLabel: 'Part', set: opts.part || 'one', sets: [
    ['one', 'Part One (1808)', [
      { t: 'Prologue in Heaven', s: 'a wager', html: 'As in the Book of Job, Mephistopheles asks leave to tempt a good man, the scholar Faust. The Lord allows it, saying that a person who strives may err, but a good man, even in his dark urges, knows the right way.' },
      { t: 'Night', s: 'the scholar\'s despair', html: 'Faust has studied every subject and feels he knows nothing. He turns to magic, and is called back from despair by the Easter bells.' },
      { t: 'The pact', s: 'Faust meets Mephistopheles', html: 'Mephistopheles, first appearing as a black poodle, offers to serve Faust. Faust wagers his soul: if he ever finds a moment so satisfying that he asks it to stay, he will be lost.' },
      { t: 'Auerbach\'s Cellar and the Witch\'s Kitchen', s: 'low pleasures', html: 'Mephistopheles shows Faust rowdy students drinking, then has a witch give him a potion that makes him young again. Faust is not satisfied.' },
      { t: 'Gretchen', s: 'the tragedy', html: 'Faust falls in love with a young townswoman, Gretchen (Margaret). Mephistopheles\' schemes bring ruin on her family, and she is condemned for a terrible act done in despair. Faust tries to free her from prison; she refuses to flee and puts herself in God\'s hands. A voice from above declares that she is saved.' }
    ]],
    ['two', 'Part Two (1832)', [
      { t: 'A pleasant landscape', s: 'healing sleep', html: 'Spirits of nature let Faust sleep away his guilt and grief. He wakes ready to strive again.' },
      { t: 'The emperor\'s court', s: 'paper money and illusions', html: 'Faust and Mephistopheles serve a careless emperor, inventing paper money and staging magic shows.' },
      { t: 'Helen of Troy', s: 'the classical world', html: 'Faust seeks Helen, the ideal of Greek beauty, and in a dreamlike act they marry and have a son, Euphorion, who flies too high and falls.' },
      { t: 'Land from the sea', s: 'useful work', html: 'Old and blind, Faust plans to drain a marsh and make land where free people can live and work. Imagining it, he says he could ask such a moment to stay, and he dies.' },
      { t: 'Mountain gorges', s: 'Faust is saved', html: 'Angels carry off Faust\'s immortal part, because, they sing, whoever keeps striving can be redeemed. Gretchen, among the blessed, welcomes him. The play ends: "The Woman-Soul leadeth us upward and on!"' }
    ]]
  ] });
});
