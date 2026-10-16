/* Magnetic Bottles: the words for "What each setting does". Browser: window.MBGuideText. Node: module.exports.
   Each card lists `claims`: the statements in its text as [output, rule, condition]. A Node test (test_guide.js, kept with the
   build notes, not on the site) checks every claim, raising and lowering, against the same nudge numbers the table shows at
   hundreds of random settings, so the words never contradict the table.
   rules: up / down (when this setting is raised), zero (no change at all), away / toward (as |tau| grows the output rises / falls)
   conditions: tau0 (tau = 0), tauNot0, tauSmall (|tau| <= 0.3), tauBig (|tau| >= 1.3), Slow (S < pi/2), Shigh (S >= pi/2),
   nt (delta at most 85% of its limit, before and after the step), nt6 (the same with 60%) */
(function (root) {
  'use strict';
  var T = {
    f1: [
      {
        k: 'eps', sym: 'ε', name: 'Elongation', draw: 'xs2',
        what: 'ε stretches the bottle. The formulas measure <var>x</var> in steps of √(1+ε) and <var>y</var> in steps of √(1−ε). So where the ring crosses the <var>x</var>-axis the slice is wide and flat, and where it crosses the <var>y</var>-axis it is narrow and tall. ε also bends the magnetic axis: it rises and falls by ε/2, twice on each trip around.',
        up: [
          '<b>Shape:</b> more stretched: wider and flatter at φ = 0°, narrower and taller at 90° (except near the top of δ’s range). The axis bends up and down more.',
          '<b>Volume</b> shrinks.',
          '<b>β<sub>V</sub></b> rises, as long as δ stays put.',
          '<b>Twist</b> ι stays 2, and the pressure on the axis stays put.',
          '<b>|B| on the edge</b> gets more uneven: the weakest spot gets weaker and the ripple grows.',
          '<b>Mirror gap:</b> stays 0 when τ₀ = 0. Otherwise it first grows, then shrinks again at large ε.',
          '<b>Allowed δ</b> shrinks.'
        ],
        down: 'The bottle gets less stretched. Its volume grows, β<sub>V</sub> falls (with δ held where it is), the field on the edge gets more even, and the top of δ’s range rises. Near ε = 0 the slices are almost round and the axis almost flat.',
        limits: 'ε must stay below 1, since the formulas take √(1−ε). A bigger ε lowers the top of δ’s range, (1 − Ω²ε)²/4. If δ is already near the top, its slider moves down to fit, and then β<sub>V</sub> can end up lower.',
        claims: [['V', 'down'], ['bV', 'up'], ['pa', 'zero'], ['ia', 'zero'], ['ie', 'zero'], ['sh', 'zero'], ['bmin', 'down'], ['rip', 'up'], ['gap', 'zero', 'tau0'], ['dmax', 'down'],
                 ['w0', 'up', 'nt'], ['h0', 'down', 'nt'], ['w90', 'down', 'nt'], ['h90', 'up', 'nt'], ['axWob', 'up']]
      },
      {
        k: 'tau', sym: 'τ₀', name: 'Symmetry breaking', draw: 'mirror',
        what: 'τ₀ breaks the stellarator symmetry. At τ₀ = 0 the bottle passes the mirror test: turn it over (half a turn about the <var>x</var>-axis) and it lands on itself. Any other value moves the bottle down (for τ₀ above 0) or up (below 0) and makes it lopsided, so the turned copy no longer fits. τ₀ and −τ₀ are mirror twins: the same bottle, turned over.',
        up: [
          '<b>Shape:</b> raising τ₀ always moves the bottle down: its middle sits at height −τ₀/(2Ω²), with Ω = √(1−τ₀²). Moving τ₀ away from 0 also makes the ring wider.',
          'Moving τ₀ away from 0, either way:',
          '<b>Volume</b> grows (as 1/Ω³), and so do <b>β<sub>V</sub></b> and the <b>pressure on the axis</b>.',
          '<b>Mirror gap</b> grows from 0.',
          '<b>Allowed δ</b> grows.',
          '<b>Twist:</b> ι stays 2.',
          '<b>|B| on the edge</b> is more complicated: the weakest and strongest values turn around several times along the slider. The table shows which way they go here.'
        ],
        down: 'Lowering τ₀ moves the bottle up. As τ₀ moves toward 0, the volume, β<sub>V</sub>, the pressure on the axis, the mirror gap and the top of δ’s range all shrink, and at exactly 0 the gap is 0. Past 0 they grow again: only the size of τ₀ matters for the numbers, not its sign.',
        limits: 'τ₀ has to stay between −1 and 1, because Ω = √(1−τ₀²) must not reach 0. The slider stops at ±0.9. Near the ends the volume grows very fast.',
        claims: [['V', 'away'], ['bV', 'away'], ['pa', 'away'], ['gap', 'away'], ['dmax', 'away'], ['ia', 'zero'], ['ie', 'zero'], ['sh', 'zero'], ['axZ', 'down'], ['axX', 'away'], ['axY', 'away']]
      },
      {
        k: 'delta', sym: 'δ', name: 'Size of the plasma', draw: 'rings',
        what: 'δ is the value of the flux label ψ on the edge. ψ is 0 on the magnetic axis and grows outward, so a bigger δ means a fatter bottle with more layers inside. The pressure falls in a straight line with ψ, down to 0 at the edge, so the pressure on the axis is 2δ/Ω².',
        up: [
          '<b>Shape:</b> fatter.',
          '<b>Volume</b> grows in proportion to δ.',
          '<b>β<sub>V</sub></b> and the <b>pressure on the axis</b> rise.',
          '<b>Twist:</b> ι stays 2.',
          '<b>|B| on the edge:</b> the strongest spot gets stronger and the ripple grows.',
          '<b>Mirror gap:</b> compared with the plasma’s thickness, it shrinks.',
          '<b>Allowed δ</b> does not depend on δ itself.'
        ],
        down: 'The bottle thins toward its axis. The volume, β<sub>V</sub> and the pressure on the axis fall, the strongest field on the edge gets weaker and the ripple shrinks. As δ goes to 0 the bottle shrinks onto the white axis line.',
        limits: 'δ has to stay below (1 − Ω²ε)²/4. At that value the hole in the middle of the doughnut closes: the inside of the edge reaches the vertical center line, where the formulas divide by zero. The slider stops at 98% of the limit.',
        claims: [['V', 'up'], ['bV', 'up'], ['pa', 'up'], ['ia', 'zero'], ['ie', 'zero'], ['sh', 'zero'], ['bmax', 'up'], ['rip', 'up'], ['dmax', 'zero'], ['gap', 'zero', 'tau0'],
                 ['gapRel', 'down', 'tauNot0'], ['minor', 'up']]
      }
    ],
    f2: [
      {
        k: 'eps', sym: 'ε', name: 'Focal distance', draw: 'plan',
        what: 'The magnetic axis of this bottle is a flat ellipse. Every ellipse has two <i>foci</i>: from any point on it, the distances to the two foci add up to the same length. Here the foci sit on the <var>y</var>-axis, √ε from the center. So ε is the focal distance squared: <var>b</var>² − <var>a</var>² = ε, where <var>a</var> and <var>b</var> are the half-widths of the axis along <var>x</var> and <var>y</var>.',
        up: [
          '<b>Shape:</b> the axis gets longer along <var>y</var> and narrower along <var>x</var>, around the same area, π<var>S</var>. The height does not change.',
          '<b>Volume:</b> with τ₁ near 0 (up to about 0.3) it shrinks. With a large τ₁ (about 1.3 or more) it grows. In between it grows at first, then shrinks.',
          '<b>β<sub>V</sub></b> can go either way. At the paper’s settings with τ₁ = 0 or 0.5 it falls; with a small axis or a large τ₁ it rises, at least at first.',
          '<b>Twist ι</b> on the axis and at the edge rises when the axis is small (<var>S</var> below about 1), because the axis gets longer. With a bigger axis it can fall. The shear can go either way.',
          '<b>|B| on the edge:</b> the strongest spot gets stronger.',
          '<b>Mirror gap:</b> stays 0 when τ₁ = 0. Otherwise it changes along the slider: in most cases it grows at first, then shrinks again.',
          '<b>Allowed δ</b> and the <b>pressure on the axis</b> do not change.'
        ],
        down: 'The axis gets rounder, around the same area, and the height stays put. The strongest field on the edge gets weaker. The volume grows when τ₁ is near 0 and shrinks when τ₁ is large. As ε goes to 0 the two foci meet in the middle and the axis becomes a circle.',
        limits: 'The paper only needs ε above 0; the slider covers 0.2 to 2.5. ε does not change the top of δ’s range.',
        claims: [['V', 'down', 'tauSmall'], ['V', 'up', 'tauBig'], ['bmax', 'up'], ['gap', 'zero', 'tau0'], ['dmax', 'zero'], ['pa', 'zero'], ['axX', 'down'], ['axY', 'up'], ['height', 'zero']]
      },
      {
        k: 'S', sym: 'S', name: 'Axis size', draw: 'plan',
        what: '<var>S</var> sets the size of the axis ellipse: <var>S</var> = <var>a</var> × <var>b</var>, the product of its two half-widths, so the area inside the axis is π<var>S</var>. The foci stay where they are, so a bigger axis is also a rounder one.',
        up: [
          '<b>Shape:</b> the ring gets bigger around and rounder, and the plasma tube gets thinner. The height does not change.',
          '<b>Volume</b> stays exactly the same: the tube gets longer and thinner in step.',
          '<b>β<sub>V</sub></b> rises.',
          '<b>Twist ι</b> rises, on the axis and at the edge. The shear can go either way.',
          '<b>|B| on the edge:</b> the strongest spot gets weaker.',
          '<b>Mirror gap</b> (when τ₁ is not 0) gets smaller, except close to the top of δ’s range.',
          '<b>Allowed δ</b> grows until <var>S</var> reaches π/2 ≈ 1.57, then stays at ½.',
          'The <b>pressure on the axis</b> does not change.'
        ],
        down: 'The ring shrinks toward the line between the two foci and gets more oval, while the tube gets fatter; the volume stays exactly the same. β<sub>V</sub> and the twist fall, and the strongest field on the edge gets stronger. Below <var>S</var> = π/2 the top of δ’s range drops, so the δ slider may have to come down.',
        limits: 'The slider covers 0.4 to 2.5. Below <var>S</var> = π/2 a smaller axis leaves less room: the plasma has to stay clear of the line between the foci, so δ must stay below ½ sin² <var>S</var>.',
        claims: [['V', 'zero'], ['bV', 'up'], ['ia', 'up'], ['ie', 'up'], ['bmax', 'down'], ['gap', 'down', 'tauNot0 nt'], ['gap', 'zero', 'tau0'], ['dmax', 'up', 'Slow'], ['dmax', 'zero', 'Shigh'], ['pa', 'zero'],
                 ['axX', 'up'], ['axY', 'up'], ['axRatio', 'down'], ['minor', 'down'], ['height', 'zero']]
      },
      {
        k: 'lam', sym: 'λ', name: 'Vertical scale', draw: 'side',
        what: 'λ squeezes the bottle up and down. The formulas only contain λ<var>z</var>, so every height is divided by λ. Seen from above, nothing changes.',
        up: [
          '<b>Shape:</b> flatter. The height is 2 arcsin(√(2δ))/λ.',
          '<b>Volume</b> shrinks in proportion to 1/λ.',
          '<b>β<sub>V</sub></b> falls, and the <b>pressure on the axis</b> (δ/λ²) falls.',
          '<b>Twist ι</b> does not change at all, on any surface.',
          '<b>|B| on the edge:</b> the strongest spot gets weaker. The ripple can go either way: at the paper’s Figure 5 settings with τ₁ = 0.5 it falls until λ ≈ 1.8, then rises.',
          '<b>Mirror gap</b> stays 0 when τ₁ = 0.',
          '<b>Allowed δ</b> does not change.'
        ],
        down: 'The bottle gets taller: λ = 0.5 makes it twice as tall as λ = 1. The volume, β<sub>V</sub> and the pressure on the axis rise, the strongest field on the edge gets stronger, and the twist does not change.',
        limits: 'λ has to be above 0; the slider covers 0.5 to 3. λ never changes the top of δ’s range.',
        claims: [['V', 'down'], ['bV', 'down'], ['pa', 'down'], ['ia', 'zero'], ['ie', 'zero'], ['sh', 'zero'], ['bmax', 'down'], ['gap', 'zero', 'tau0'], ['dmax', 'zero'], ['height', 'down'], ['w0', 'zero'], ['w90', 'zero']]
      },
      {
        k: 'tau', sym: 'τ₁', name: 'Symmetry breaking', draw: 'mirror',
        what: 'τ₁ breaks the stellarator symmetry. At τ₁ = 0 the bottle passes the mirror test. Other values make each slice lean over, so the turned copy no longer fits. τ₁ and −τ₁ are mirror twins: the same bottle, turned over.',
        up: [
          'Moving τ₁ away from 0, either way:',
          '<b>Volume</b> shrinks, and so does <b>β<sub>V</sub></b>.',
          '<b>Twist ι</b> falls, on the axis and at the edge. The shear changes direction along the way: at the paper’s settings it falls and flips sign past τ₁ ≈ 0.3.',
          '<b>|B| on the edge:</b> the strongest spot gets stronger. The ripple often grows too, but not always.',
          'In the upper part of δ’s range (above about 60% of its limit), β<sub>V</sub> and the twist at the edge can turn around.',
          '<b>Mirror gap</b> grows from 0.',
          '<b>Allowed δ</b>, the height and the <b>pressure on the axis</b> do not change.'
        ],
        down: 'Lowering τ₁ toward 0 does the reverse: the volume, β<sub>V</sub> and the twist grow, the strongest field on the edge gets weaker, and the mirror gap shrinks to 0 at τ₁ = 0. (In the upper part of δ’s range, β<sub>V</sub> and the twist at the edge can turn around.) Past 0 it all turns around again: only the size of τ₁ matters for the numbers, not its sign.',
        limits: 'Any τ₁ is allowed; the slider covers −1.5 to 1.5. τ₁ never changes the top of δ’s range.',
        claims: [['V', 'toward'], ['bV', 'toward', 'nt6'], ['ia', 'toward'], ['ie', 'toward', 'nt6'], ['bmax', 'away'], ['gap', 'away'], ['dmax', 'zero'], ['pa', 'zero'], ['height', 'zero']]
      },
      {
        k: 'delta', sym: 'δ', name: 'Size of the plasma', draw: 'rings',
        what: 'δ is the value of the flux label ψ on the edge. ψ is 0 on the magnetic axis and grows outward, so a bigger δ means a fatter bottle with more layers inside. The pressure falls in a straight line with ψ, down to 0 at the edge, so the pressure on the axis is δ/λ².',
        up: [
          '<b>Shape:</b> fatter in every direction.',
          '<b>Volume</b> and the <b>pressure on the axis</b> rise.',
          '<b>β<sub>V</sub></b> rises, and so does the strongest field on the edge, up to about 60% of the limit. Higher up they can level off and fall.',
          '<b>Twist:</b> on the axis it does not change. At the edge it moves, because the edge now sits on a surface with a different twist; up or down depends on the shear.',
          '<b>Mirror gap</b> (when τ₁ is not 0) grows, except close to the top of the range.',
          '<b>Allowed δ</b> does not depend on δ itself.'
        ],
        down: 'The bottle thins toward its axis, the white ellipse. The volume and the pressure on the axis fall, and below about 60% of the limit so do β<sub>V</sub> and the strongest field on the edge. The twist on the axis does not change.',
        limits: 'The paper shows the surfaces are nested while δ stays below ½ sin²(min(<var>S</var>, π/2)). For <var>S</var> under π/2 ≈ 1.57, that keeps the plasma clear of the line between the two foci, where the elliptic coordinates fold over. For a bigger axis the limit is ½: the formulas describe a stack of bottles, one every π/λ in height, and at δ = ½ each would touch the ones above and below it. The slider stops at 98% of the limit.',
        claims: [['V', 'up'], ['bV', 'up', 'nt6'], ['pa', 'up'], ['ia', 'zero'], ['bmax', 'up', 'nt6'], ['gap', 'up', 'tauNot0 nt'], ['gap', 'zero', 'tau0'], ['dmax', 'zero'], ['w0', 'up'], ['h0', 'up'], ['w90', 'up'], ['h90', 'up']]
      }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else root.MBGuideText = T;
})(typeof self !== 'undefined' ? self : this);
