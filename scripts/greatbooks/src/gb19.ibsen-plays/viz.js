/* gb-ibsen-past: in each of the four plays, a hidden past comes to light (our own summaries; uses ML.gb19kit.cards). */
ML.viz.register('gb-ibsen-past', function (el, opts, V) {
  ML.gb19kit.cards(el, V, { label: 'How the hidden past comes to light in four plays by Ibsen', layout: 'col', setLabel: 'Play', set: opts.play || 'doll', sets: [
    ['doll', 'A Doll\'s House (1879)', [
      { t: 'The secret', s: 'years before the play', html: 'When her husband Torvald was ill, Nora secretly borrowed money to take him south to recover, forging her dying father\'s signature, since a wife could not borrow without a man\'s consent.' },
      { t: 'The pressure', s: 'Christmas week', html: 'Krogstad, the clerk who lent her the money, is about to lose his job at Torvald\'s bank. He threatens to reveal the forgery unless Nora saves his place.' },
      { t: 'The letter', s: 'Act III', html: 'Torvald reads Krogstad\'s letter and turns on Nora, caring only for his reputation. When the danger passes, he forgives her as if nothing happened.' },
      { t: 'The door', s: 'the ending', html: 'Nora sees that she has been treated like a doll all her life. She tells Torvald she must learn to think for herself, and walks out, closing the door behind her.' }
    ]],
    ['duck', 'The Wild Duck (1884)', [
      { t: 'The secret', s: 'years before the play', html: 'The Ekdal family\'s modest happiness rests on a past they do not know: the rich merchant Werle arranged Hjalmar Ekdal\'s marriage and quietly supports them.' },
      { t: 'The idealist', s: 'Gregers arrives', html: 'Werle\'s son Gregers believes everyone must live in the truth, and decides to tell his friend Hjalmar everything.' },
      { t: 'The doctor', s: 'the "life-illusion"', html: 'Dr. Relling warns that most people need their comforting illusions to go on living.' },
      { t: 'The cost', s: 'the ending', html: 'Gregers\'s truth-telling breaks the family apart and ends in a heartbreaking tragedy for the Ekdals\' young daughter, Hedvig, who loves the wild duck in the attic.' }
    ]],
    ['hedda', 'Hedda Gabler (1890)', [
      { t: 'The past', s: 'before the play', html: 'Hedda, a general\'s proud daughter, has married a dull scholar, Tesman, out of boredom. Years before, she knew the brilliant, troubled writer Eilert Lövborg.' },
      { t: 'The return', s: 'Lövborg\'s new book', html: 'Lövborg returns with a new manuscript, a work of genius, written with the help of the gentle Thea Elvsted.' },
      { t: 'The manuscript', s: 'Act III', html: 'When the manuscript falls into Hedda\'s hands, she destroys it out of jealousy and a wish to control another\'s fate.' },
      { t: 'The trap', s: 'the ending', html: 'Caught in the consequences and unwilling to live under another\'s power, Hedda ends the play in tragedy.' }
    ]],
    ['builder', 'The Master Builder (1892)', [
      { t: 'The past', s: 'before the play', html: 'Halvard Solness rose to fame as a builder after a fire destroyed his wife\'s family home, a fortune he secretly feels guilty about.' },
      { t: 'The young', s: 'fear of being replaced', html: 'He fears the younger generation, and keeps his gifted assistant Ragnar from striking out on his own.' },
      { t: 'Hilde', s: 'a promise remembered', html: 'A young woman, Hilde Wangel, arrives saying that ten years ago he promised her "a kingdom," and urges him to climb his new tower as he once did.' },
      { t: 'The tower', s: 'the ending', html: 'Solness, afraid of heights, climbs the tower to hang a wreath, and falls.' }
    ]]
  ] });
});
