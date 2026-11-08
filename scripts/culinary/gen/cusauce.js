  // ===== Stocks, Sauces and Soups (cusauce)
  var MOTHERS = [['Milk thickened with a white roux', 'Béchamel'], ['White stock (chicken, veal or fish) thickened with a blond roux', 'Velouté'], ['Brown stock thickened with a brown roux, with mirepoix and tomato', 'Espagnole'],
    ['Tomatoes cooked with aromatics (classically with stock and a roux)', 'Tomato sauce'], ['Butter emulsified into egg yolks with lemon or a reduction', 'Hollandaise']];
  var KIDS = [['Mornay', 'Béchamel', 'cheese'], ['Soubise', 'Béchamel', 'onion purée'], ['Cream sauce', 'Béchamel', 'cream'], ['Suprême', 'Velouté', 'cream, from chicken velouté'], ['Allemande', 'Velouté', 'yolks and cream'], ['Bercy', 'Velouté', 'shallots and white wine, from fish velouté'],
    ['Bordelaise', 'Espagnole', 'red wine and shallots, from demi-glace'], ['Chasseur', 'Espagnole', 'mushrooms, shallots, white wine and tomato'], ['Robert', 'Espagnole', 'onion, white wine and mustard'], ['Demi-glace', 'Espagnole', 'reduced with brown stock'],
    ['Creole', 'Tomato sauce', 'onions, peppers, celery and garlic'], ['Portuguese', 'Tomato sauce', 'tomatoes, onion and garlic'], ['Béarnaise', 'Hollandaise', 'tarragon and shallot reduction'], ['Maltaise', 'Hollandaise', 'blood orange'], ['Mousseline', 'Hollandaise', 'whipped cream folded in'], ['Choron', 'Hollandaise', 'béarnaise with tomato']];
  var MNAMES = ['Béchamel', 'Velouté', 'Espagnole', 'Tomato sauce', 'Hollandaise'];

  G('cusauce.stocks', function (R, ctx) {
    var kind = by(ctx, R.pick(['mire', 'bank']), R.pick(['mire', 'time', 'bank']), R.pick(['mire', 'mire2', 'time']));
    if (kind === 'mire') { var tot = R.int(4, 40) * 100, part = R.pick(['onion', 'carrot', 'celery']); var v = part === 'onion' ? tot / 2 : tot / 4; return {
      q: 'You need ' + T.commas(tot) + ' g of mirepoix in the classic 2 : 1 : 1 ratio (onion : carrot : celery). How many grams of ' + part + '?', a: AX(v), unit: 'g',
      steps: ['4 parts in all; ' + part + ' is ' + (part === 'onion' ? '2' : '1') + ' of them.', '$' + T.commas(tot) + ' \\times \\tfrac{' + (part === 'onion' ? 2 : 1) + '}{4} = ' + T.commas(v) + '$ g.'] }; }
    if (kind === 'mire2') { var on = R.int(2, 20) * 100; return { q: 'You have ' + T.commas(on) + ' g of onion for a 2 : 1 : 1 mirepoix. How many grams of mirepoix in all?', a: AX(on * 2), unit: 'g', steps: ['Onion is half of the mirepoix.', '$' + T.commas(on) + ' \\times 2 = ' + T.commas(on * 2) + '$ g.'] }; }
    if (kind === 'time') { var it = R.pick([['chicken stock', 'About 3 to 4 hours'], ['beef or veal stock', 'About 6 to 8 hours'], ['fish fumet', 'About 30 to 45 minutes'], ['vegetable stock', 'About 45 minutes to 1 hour']]);
      return { q: 'About how long is ' + it[0] + ' usually simmered?', a: MC(it[1], ['About 3 to 4 hours', 'About 6 to 8 hours', 'About 30 to 45 minutes', 'About 45 minutes to 1 hour', 'About 24 hours']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['Why start stock in cold water?', 'Proteins come out slowly and rise as scum you can skim', ['It boils faster', 'Hot water is unsafe', 'Cold water adds flavor'], ''],
      ['What happens if you boil stock hard?', 'Fat and bits churn in and cloud it', ['It clears faster', 'It gets sweeter', 'Nothing'], 'Keep it at a simmer.'],
      ['Should you salt a stock?', 'No; season the sauce or soup it becomes', ['Yes, heavily', 'Yes, at the start only', 'Only fish stock'], 'Stock may be reduced, which concentrates salt.'],
      ['What makes a brown stock brown?', 'Roasting the bones and mirepoix first', ['Adding soy sauce', 'Boiling it longer', 'Burnt sugar'], ''],
      ['What does a good stock do when it gets cold?', 'Sets like jelly from the gelatin', ['Turns to powder', 'Separates into layers of water', 'Turns green'], ''],
      ['What is mirepoix?', 'Onion, carrot and celery', ['Butter and flour', 'Egg yolks and cream', 'Garlic, ginger and scallion'], 'Classically 2 : 1 : 1 by weight.']
    ]);
  });

  G('cusauce.thickeners', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'roux']), R.pick(['roux', 'color', 'grams']), R.pick(['roux', 'grams', 'bank']));
    if (kind === 'roux') { var per = R.pick([[1, 'thin'], [2, 'medium'], [3, 'thick']]), cups = R.int(2, 24); return { q: 'A ' + per[1] + ' sauce uses ' + per[0] + ' tablespoon' + (per[0] > 1 ? 's' : '') + ' each of butter and flour per cup of liquid. How many tablespoons of flour for ' + cups + ' cups?', a: AX(per[0] * cups), unit: 'Tbsp', steps: ['$' + per[0] + ' \\times ' + cups + ' = ' + per[0] * cups + '$ tablespoons.'] }; }
    if (kind === 'grams') { var tot = R.int(4, 30) * 20; return { q: 'You need ' + tot + ' g of roux made with equal weights of butter and flour. How many grams of flour?', a: AX(tot / 2), unit: 'g', steps: ['Equal weights: $' + tot + ' \\div 2 = ' + tot / 2 + '$ g.'] }; }
    if (kind === 'color') { var it = R.pick([['béchamel', 'White roux'], ['velouté', 'Blond roux'], ['espagnole', 'Brown roux']]); return { q: 'Which roux is classic for ' + it[0] + '?', a: MC(it[1], ['White roux', 'Blond roux', 'Brown roux']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['What is a roux?', 'Equal weights of fat and flour cooked together', ['Cornstarch mixed with cold water', 'Egg yolks and cream', 'Butter and sugar'], ''],
      ['What is a slurry?', 'Starch stirred into cold liquid, then whisked into a simmering one', ['Fat and flour cooked together', 'A reduction of wine', 'A cold sauce'], ''],
      ['What is a liaison?', 'Egg yolks and cream, added at the end without boiling', ['Flour and butter', 'Starch and water', 'Gelatin and stock'], ''],
      ['Which roux thickens most for the same weight?', 'White roux', ['Brown roux', 'Blond roux', 'They are all the same'], 'Darker roux has more flavor, less thickening power.'],
      ['How do you avoid lumps with roux?', 'Combine hot roux with cool liquid (or cool roux with hot), whisking', ['Add cold roux to cold liquid', 'Dump flour into boiling stock', 'Never stir'], ''],
      ['Why simmer a roux-thickened sauce for a while?', 'To cook out the raw flour taste', ['To make it thinner', 'To brown the milk', 'It isn\'t needed'], ''],
      ['How do you add a liaison to a hot soup?', 'Temper it with a little hot liquid first, then stir it in below a simmer', ['Pour it straight into the boiling soup', 'Boil it separately', 'Add it cold and boil hard'], '']
    ]);
  });

  G('cusauce.mother-sauces', function (R, ctx) {
    var kind = by(ctx, 'name', R.pick(['name', 'parts']), R.pick(['name', 'parts', 'bank']));
    var m = R.pick(MOTHERS);
    if (kind === 'name') return { q: 'Which mother sauce is this? ' + m[0] + '.', a: MC(m[1], MNAMES), steps: [m[1] + '.'] };
    if (kind === 'parts') return { q: 'Which describes ' + m[1] + '?', a: MC(m[0], MOTHERS.map(function (x) { return x[0]; })), steps: [m[1] + ': ' + m[0].toLowerCase() + '.'] };
    return bank(R, [
      ['Who organized French sauces around a few leading sauces in 1907?', 'Auguste Escoffier', ['Julia Child', 'Louis Pasteur', 'Napoleon'], 'In A Guide to Modern Cookery.'],
      ['How many mother sauces do cooks usually name today?', 'Five', ['Three', 'Seven', 'Ten'], ''],
      ['Is demi-glace a mother sauce?', 'No; it is espagnole reduced with brown stock', ['Yes, the sixth', 'Yes, the first', 'It is a soup'], ''],
      ['What pattern do all the mother sauces share?', 'A liquid plus a way to thicken it, plus flavor', ['They all use tomatoes', 'They are all cold', 'They all use cheese'], '']
    ]);
  });

  G('cusauce.small-sauces', function (R, ctx) {
    var kind = by(ctx, 'mom', R.pick(['mom', 'add']), R.pick(['mom', 'add', 'kid']));
    var k = R.pick(KIDS);
    if (kind === 'mom') return { q: 'Which mother sauce is ' + k[0] + ' made from?', a: MC(k[1], MNAMES), steps: [k[0] + ' is ' + k[1].toLowerCase() + ' with ' + k[2] + '.'] };
    if (kind === 'add') return { q: 'What is added to ' + k[1].toLowerCase() + ' to make ' + k[0] + '?', a: MC(k[2], R.sample(KIDS.filter(function (x) { return x[2] !== k[2]; }), 3).map(function (x) { return x[2]; }).concat([k[2]])), steps: [k[0] + ': ' + k[1].toLowerCase() + ' + ' + k[2] + '.'] };
    var mom = R.pick(MNAMES), yes = KIDS.filter(function (x) { return x[1] === mom; }).map(function (x) { return x[0]; }), no = KIDS.filter(function (x) { return x[1] !== mom; }).map(function (x) { return x[0]; });
    return which(R, 'Which of these is a small sauce of ' + mom.toLowerCase() + '?', yes, no, function (c) { return c + ' comes from ' + mom.toLowerCase() + '.'; });
  });

  G('cusauce.emulsions', function (R, ctx) {
    var kind = by(ctx, R.pick(['bank', 'vin']), R.pick(['vin', 'bank', 'type']), R.pick(['vin', 'vin2', 'type']));
    if (kind === 'vin') { var cups = R.int(1, 16) / 2, what = R.coin() ? 'oil' : 'vinegar'; return { q: 'How many cups of ' + what + ' for ' + cups + ' cup' + (cups === 1 ? '' : 's') + ' of vinaigrette at 3 parts oil to 1 part vinegar?', a: AX(what === 'oil' ? cups * 0.75 : cups * 0.25), unit: 'cups', steps: ['4 parts in all; ' + what + ' is ' + (what === 'oil' ? '3' : '1') + ' of them.', '$' + T.num(cups) + ' \\times \\tfrac{' + (what === 'oil' ? 3 : 1) + '}{4} = ' + fx(what === 'oil' ? cups * 0.75 : cups * 0.25) + '$ cups.'] }; }
    if (kind === 'vin2') { var vin = R.int(4, 60) * 5; return { q: 'You have ' + vin + ' mL of vinegar. How much oil, in mL, for a 3 : 1 vinaigrette?', a: AX(vin * 3), unit: 'mL', steps: ['$' + vin + ' \\times 3 = ' + vin * 3 + '$ mL.'] }; }
    if (kind === 'type') { var it = R.pick([['Mayonnaise', 'Permanent'], ['Hollandaise', 'Permanent'], ['A plain oil-and-vinegar dressing', 'Temporary'], ['Béarnaise', 'Permanent'], ['Oil shaken with lemon juice', 'Temporary']]);
      return { q: 'Permanent or temporary emulsion? ' + it[0] + '.', a: MC(it[1], ['Permanent', 'Temporary']), steps: [it[1] === 'Permanent' ? 'Egg yolk holds it together.' : 'It separates as it stands.'] }; }
    return bank(R, [
      ['What does an emulsifier do?', 'Coats tiny drops so they stay spread through the liquid', ['Thickens with starch', 'Adds sweetness', 'Raises the boiling point'], 'Lecithin in egg yolk and mustard are emulsifiers.'],
      ['Why does mayonnaise break?', 'The oil was added too fast', ['The oil was too cold', 'Not enough salt', 'Too much lemon'], ''],
      ['How can a broken hollandaise often be saved?', 'Whisk it slowly into a fresh yolk or a spoon of warm water', ['Boil it', 'Add more butter fast', 'Freeze it'], ''],
      ['What is beurre blanc?', 'Butter whisked into a wine and shallot reduction', ['Brown butter with capers', 'Flour and butter', 'Butter and sugar'], ''],
      ['Which is an emulsifier in a vinaigrette?', 'Mustard', ['Salt', 'Vinegar', 'Pepper'], ''],
      ['What heat keeps hollandaise stable?', 'Warm, not hot', ['A hard boil', 'Ice cold', 'Very hot'], 'Too hot scrambles the yolks.']
    ]);
  });

  G('cusauce.pan-sauces', function (R, ctx) {
    var kind = by(ctx, R.pick(['left', 'bank']), R.pick(['left', 'conc']), R.pick(['left', 'conc', 'frac']));
    var fr = R.pick([[1, 2, 'by half'], [2, 3, 'by two-thirds'], [3, 4, 'by three-quarters'], [1, 4, 'by a quarter']]);
    if (kind === 'left') { var c = R.int(2, 16) / 2; var left = c * (1 - fr[0] / fr[1]); return { q: 'You reduce ' + c + ' cup' + (c === 1 ? '' : 's') + ' of stock ' + fr[2] + '. How many cups are left?', a: AT(r2(left), 0.01), unit: 'cups', steps: ['Left: $1 - \\tfrac{' + fr[0] + '}{' + fr[1] + '} = \\tfrac{' + (fr[1] - fr[0]) + '}{' + fr[1] + '}$ of it.', '$' + c + ' \\times \\tfrac{' + (fr[1] - fr[0]) + '}{' + fr[1] + '} ' + (Math.abs(left - r2(left)) > 1e-9 ? '\\approx ' : '= ') + r2(left) + '$ cups.'] }; }
    if (kind === 'conc') { var a = R.int(2, 12), b = R.pick([1, 0.5, 2]); if (b >= a) b = 1; return { q: 'A sauce is reduced from ' + a + ' cups to ' + b + ' cup' + (b === 1 ? '' : 's') + '. How many times as salty is it now?', a: AX(a / b), unit: '×', steps: ['Salt doesn\'t boil away: $' + a + ' \\div ' + T.num(b) + ' = ' + fx(a / b) + '$ times as concentrated.'] }; }
    if (kind === 'frac') { var s0 = R.int(2, 8), s1 = R.pick([0.5, 1, 1.5]); return { q: 'You reduce ' + s0 + ' cups of wine to ' + T.num(s1) + ' cup. What fraction of the wine boiled away? Answer as a decimal.', a: AT(r2(1 - s1 / s0), 0.01), steps: ['Left: $' + T.num(s1) + ' \\div ' + s0 + ' \\approx ' + r2(s1 / s0) + '$.', 'Gone: $1 - ' + T.num(s1) + ' \\div ' + s0 + ' \\approx ' + r2(1 - s1 / s0) + '$.'] }; }
    return bank(R, [
      ['What is fond?', 'The browned bits stuck to the pan after searing', ['A kind of stock', 'Melted butter', 'A thickener'], ''],
      ['What is deglazing?', 'Adding liquid to a hot pan and scraping up the fond', ['Adding sugar for shine', 'Cooling the pan in water', 'Wiping the pan clean'], ''],
      ['What is "monter au beurre"?', 'Swirling cold butter into a sauce off the heat', ['Browning butter', 'Clarifying butter', 'Melting butter into flour'], ''],
      ['When do you salt a reduced sauce?', 'At the end', ['At the start', 'Before deglazing', 'Never'], 'Reducing concentrates salt.'],
      ['How do you add wine to a hot pan safely?', 'Off the heat, away from the flame, then return it', ['Over a high flame', 'From the bottle while it\'s on the burner', 'With the lid on'], '']
    ]);
  });

  G('cusauce.soups', function (R, ctx) {
    var kind = by(ctx, 'cls', R.pick(['cls', 'bank']), R.pick(['cls', 'bank']));
    if (kind === 'cls') { var it = R.pick([['Consommé', 'Clear'], ['Chicken broth', 'Clear'], ['Beef bouillon', 'Clear'], ['Cream of mushroom', 'Cream'], ['Cream of broccoli', 'Cream'], ['Potato-leek blended smooth', 'Purée'], ['Split pea', 'Purée'], ['Black bean, blended', 'Purée'], ['Butternut squash, blended', 'Purée'], ['Lobster soup thickened with rice', 'Bisque'], ['Shrimp bisque', 'Bisque'], ['Gazpacho', 'Cold']]);
      return { q: 'What kind of soup is ' + it[0].toLowerCase() + '?', a: MC(it[1], ['Clear', 'Cream', 'Purée', 'Bisque', 'Cold']), steps: [it[1] + '.'] }; }
    return bank(R, [
      ['What is the "raft" in consommé?', 'Ground meat, egg whites and mirepoix that trap tiny particles', ['A crouton on top', 'A layer of fat', 'A kind of noodle'], ''],
      ['What thickens a purée soup?', 'The vegetables or beans themselves', ['A lot of roux', 'Gelatin', 'Cornstarch only'], ''],
      ['What is a bisque?', 'A shellfish soup, often thickened with rice', ['A cold vegetable soup', 'A clear broth', 'A bread soup'], ''],
      ['How should you blend hot soup in a blender?', 'In small batches, no more than half full, vent open and covered with a towel', ['Full to the top with the lid sealed', 'Boiling hot, all at once', 'It can\'t be done'], ''],
      ['Why taste cold soups carefully for salt?', 'Cold food tastes less salty, so it needs more', ['Cold soups need no salt', 'Salt freezes', 'They don\'t need tasting'], ''],
      ['What happens if you boil a cream soup after adding the cream or liaison?', 'It can curdle or scorch', ['It gets thicker and better', 'Nothing', 'It turns clear'], '']
    ]);
  });
