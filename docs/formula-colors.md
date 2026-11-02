# Formula colors: a guide for builders

Some formulas are easier to read when each part has its own color. For example, velocity is always green and position is always blue, and the same colors show up on the slider that changes them. This guide explains how to add colors to a lesson, how to link them to a visual, and when to leave a formula plain.

## The parts

| Piece | Where |
|---|---|
| Palette (name, label, light and dark color) | `data/formula-roles.yaml` |
| TeX command, key, hover names, highlight, on/off | `static/math/core/tex.js` (`\role`, `MathLadder.roles`) |
| Styles | `static/math/core/core.css` (end of file) |
| Slider links | `static/math/viz/core.js` (`slider({ role })`, viz `opts.roleLinks`) |
| On/off switch | the header's **Aa** menu (`layouts/_partials/extend_footer.html`), saved as `localStorage['trb-fcolors']` |
| Checks | `node scripts/math/check-roles.js` (runs in `.github/workflows/hugo.yml`) |

## Writing it

Inside math, wrap a part with `\role{name}{…}`:

```
$$\role{force}{F} = \role{mass}{m}\,\role{acceleration}{a}$$
```

To name a part more exactly in the key and on hover, add a label in square brackets. The color still comes from the role:

```
$\role[initial velocity]{velocity}{v_0}$
```

- Use the role names in `data/formula-roles.yaml`. An unknown name fails the check.
- Wrap only the symbol, not its exponent: `\role{velocity}{v}^2`. The square isn't part of what v means.
- A whole expression can be one part when it means one thing: `\role[change in output]{output}{f(x + h) - f(x)}`.
- Color 2 to 5 parts in a formula, the ones that carry meaning. Leave the numbers, operators and pure constants like 2π plain.
- Use the same role for the same idea everywhere. Velocity, speed and v₀ are all `velocity`; a radius, a height and a distance are all `position`; a rate of change in math is `rate`.

The page adds a **key** under each display formula (`$$…$$`), or after the paragraph, list item or step that holds inline math. Each entry is a color chip, the symbol and its plain name. In a worked example or a box, a part that an earlier key already named is not named again. Hovering a part, or tabbing to it, shows its name in a small tag.

## Linking a visual

Hovering a colored part lights up everything in the lesson that has the same `data-role`, including a visual's sliders. Hovering the slider lights up the formula parts too. There are two ways to tag a slider:

- **In the lesson data** (no code change): add `roleLinks` to the viz block's `opts`. Map the start of the slider's label to a role:
  ```json
  { "t": "viz", "name": "ph-circular", "opts": { "mode": "uniform", "roleLinks": { "Speed v": "velocity", "Radius r": "position" } } }
  ```
  A key that starts with `.`, `#` or `[` is read as a CSS selector inside the visual instead.
- **In a visual's code**: `V.slider(parent, { label: 'Speed v', role: 'velocity', … })`.

A tagged slider gets a chip in its role color and a matching track. To draw part of a canvas in the same color, use `MathLadder.roles.color('velocity')`. It returns the color for the current light or dark theme, so redraw in `V.onTheme`.

## When to color, and when not to

**Do color:**
- formulas in lessons: the key idea, why it works, notes;
- worked examples: the formula a step uses;
- explanations shown **after** a problem is answered (the steps).

**Don't color:**
- problem prompts, answer choices or hints. The color of a part can give away which quantity to use, or which choice is right;
- anything a learner sees before answering. The runner marks the prompt, the choices, the hint and the quiz summary's question with `ml-norole`. Inside those, `\role` shows its content with no color, as a safety net. Still, don't write it there;
- competition problems and solutions (`data/comp/`), for now;
- every formula on a page. Color the main formulas; a page where everything is colored teaches nothing.

The steps of a generated problem may use `\role`. They appear only after an answer, or when the learner presses "Show the steps" in a lesson's "Try one", which shows the answer anyway. `check-roles.js` makes problems from every generator at every level and fails if `\role` appears anywhere except `steps`.

## Colors

The palette uses eight hue families taken from the Okabe–Ito palette. Each is darkened for light pages and lightened for dark ones, so that every color has at least 4.5:1 contrast on the page and in the lesson boxes (the check enforces this). Roles that often meet in one formula (x, v, a and t; F, m and a; V, I and R; v, f and λ) were given families that stay apart for red–green color blindness, simulated with the Machado (2009) model. There are more roles than families, so some roles share a color. They rarely appear in the same formula, and the key names every part either way. Color is never the only cue.

To add a role, add a line to `data/formula-roles.yaml` and reuse one of the families listed at its top. Then run:

```
node scripts/math/check-roles.js --write
```

This copies the palette into `tex.js` and checks everything. Without `--write`, the check fails if the copy in `tex.js` is out of date.

Sources: M. Okabe and K. Ito, "Color Universal Design (CUD): How to make figures and presentations that are friendly to colorblind people" (2008); G. M. Machado, M. M. Oliveira and L. A. F. Fernandes, "A Physiologically-based Model for Simulation of Color Vision Deficiency," IEEE TVCG 15(6), 2009; WCAG 2.1 contrast ratio (W3C).
