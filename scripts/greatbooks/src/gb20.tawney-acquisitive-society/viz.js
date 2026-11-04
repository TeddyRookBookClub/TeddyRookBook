/* gb-tawney-sort: sort incomes as Tawney would (payment for work or service, or for ownership alone), with the
   reply his free-market critics would make. Uses ML.gb20kit.sorter. Our own examples and summaries. */
ML.viz.register('gb-tawney-sort', function (el, opts, V) {
  ML.gb20kit.sorter(el, V, { label: 'Tawney\'s distinction', prompt: 'How would Tawney class this income?',
    bins: [['work', 'For work or service'], ['own', 'For ownership alone']],
    hint: 'Choose a box. After each answer you will see Tawney\'s view and his critics\' reply.',
    items: [
      { t: 'A miner\'s wages', bin: 'work', why: 'Tawney: payment for a function. Critics agree; here there is no dispute.' },
      { t: 'A landowner\'s royalty on coal he never found or dug', bin: 'own', why: 'Tawney\'s own example of "passive" property. Critics: the owner bears the risk and his rights let mines be bought, sold and developed.' },
      { t: 'A doctor\'s fee', bin: 'work', why: 'Tawney held up medicine as a model profession, with standards of service.' },
      { t: 'Dividends to a shareholder who never visits the company', bin: 'own', why: 'Tawney: income without function. Critics: the shareholder\'s saving provided the capital, and taking the risk is a service.' },
      { t: 'A farmer\'s profit from the land she works', bin: 'work', why: 'Property bound up with work, which Tawney defended.' },
      { t: 'An engineer\'s salary for running the works', bin: 'work', why: 'Tawney wanted managers and engineers to have more say, as workers who serve the industry.' },
      { t: 'Ground rent from a city lot left empty', bin: 'own', why: 'Tawney: rent with no service. Critics: owners choose when and how land is best used, and prices guide that choice.' }
    ] });
});
