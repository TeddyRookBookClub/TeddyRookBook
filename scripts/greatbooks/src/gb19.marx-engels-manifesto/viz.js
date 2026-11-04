/* gb-manifesto: the Manifesto's story of history, and what critics and later history said (our own summaries; uses ML.gb19kit). */
ML.viz.register('gb-manifesto', function (el, opts, V) {
  ML.gb19kit.cards(el, V, { label: 'The Communist Manifesto: its claims and the record', layout: 'col', setLabel: 'Show', set: opts.set || 'claims', sets: [
    ['claims', 'The Manifesto\'s story', [
      { t: 'Ancient society', s: 'free and slave, patrician and plebeian', html: 'Marx and Engels begin: the history of all society so far is the history of class struggles. In the ancient world the struggle was between free citizens and slaves.' },
      { t: 'Feudal society', s: 'lord and serf, guild master and journeyman', html: 'In the Middle Ages, lords and serfs, guild masters and journeymen. Each age, they claim, ends when a new class overturns the old order.' },
      { t: 'Bourgeois society', s: 'owners and wage workers', html: 'The modern middle class, the bourgeoisie, overthrew feudalism and built world markets, cities and industry. The Manifesto praises its achievements as "more massive and more colossal" than those of all earlier generations together, and then predicts its fall.' },
      { t: 'The predicted revolution', s: 'workers take power', html: 'The authors predicted that wage workers, the proletariat, would grow poorer and more numerous until they overthrew the owners, abolished private property in the means of production, and in time ended classes altogether.' }
    ]],
    ['record', 'What critics and history said', [
      { t: 'Wages and living standards', s: 'a key prediction failed', html: 'In the industrial countries, workers\' wages and living standards rose greatly over the following century rather than falling. Critics see this as a central failed prediction.' },
      { t: 'Where revolutions came', s: 'not where predicted', html: 'Marx expected revolution in the most industrial countries, such as Britain. Revolutions in his name came instead in largely farming countries, such as Russia in 1917 and China in 1949.' },
      { t: 'States that claimed his ideas', s: 'the 20th-century record', html: 'Governments that called themselves Marxist set up one-party rule and state-run economies. Their record includes famines, labor camps, mass executions and the loss of basic freedoms. The Soviet Union broke up in 1991. Some Marxists answer that these states betrayed Marx\'s ideas; most critics reply that the outcome followed from the plan to abolish private property and concentrate power.' },
      { t: 'Lasting influence', s: 'why the book is still read', html: 'The Manifesto remains one of the most widely read political pamphlets ever written. Historians still use its attention to economic life and social class, even many who reject its conclusions. Labor laws, public schooling and other reforms it called for were also pursued by non-Marxist reformers in democratic countries.' }
    ]]
  ] });
});
