---
title: "Hydrogen's whole-number lines"
short: "Balmer"
sets: [music, math, chemistry]
weight: 220
teaser: "In 1885 a schoolteacher found a whole-number formula for the colors of light that hydrogen gives off. It looks a little like the harmonic series, and the difference turned out to matter enormously."
golinks:
  - { url: "/chemistry/general-chemistry-1/hydrogen-spectrum/", why: "the hydrogen spectrum in general chemistry" }
  - { url: "/chemistry/chemistry/emission-spectra/", why: "why heated elements glow in lines" }
  - { url: "/physics/waves-optics-modern-physics/hydrogen-series/", why: "the Lyman, Balmer and Paschen series" }
  - { url: "/physics/waves-optics-modern-physics/bohr-hydrogen/", why: "Bohr's explanation (1913)" }
  - { url: "/physics/astronomy/spectral-lines/", why: "how astronomers read starlight" }
  - { url: "/math/calculus-2/sequences/", why: "a sequence that approaches a limit" }
credits:
  - { name: "Balmer series (Grokipedia)", url: "https://grokipedia.com/page/Balmer_series", what: "the formula and the measured lines" }
  - { name: "Johann Jakob Balmer (Grokipedia)", url: "https://grokipedia.com/page/Johann_Jakob_Balmer", what: "his life and the 1885 paper" }
  - { name: "Rydberg formula (Grokipedia)", url: "https://grokipedia.com/page/Rydberg_formula", what: "the general formula of 1888" }
  - { name: "Bohr model (Grokipedia)", url: "https://grokipedia.com/page/Bohr_model", what: "why the formula works" }
  - { name: "Hydrogen spectral series (Grokipedia)", url: "https://grokipedia.com/page/Hydrogen_spectral_series", what: "all the series" }
---
### Balmer's formula

Heat hydrogen gas until it glows and pass the light through a prism. Instead of a rainbow you see four thin lines: red, blue-green, blue and violet. The Swedish physicist Anders Ångström had measured their wavelengths very precisely. In 1885 Johann Jakob Balmer, a Swiss mathematics teacher, found a simple rule that fit all four:

$$\lambda = B\,\frac{n^2}{n^2 - 4}, \qquad B \approx 364.56\ \text{nm},\quad n = 3, 4, 5, 6.$$

Put in $n = 3$ and you get 656.2 nm, the red line; $n = 4$ gives 486.1 nm, and so on. The same rule also fit fainter violet and ultraviolet lines for $n = 7, 8, \ldots$, seen in the light of stars, and it says they crowd together toward 364.6 nm. In 1888 Johannes Rydberg wrote the rule in a more general form, and in 1913 Niels Bohr explained it with a new model of the atom.

[[viz:tri-balmer|Top: hydrogen's lines on a strip of visible light. Bottom: hydrogen's line frequencies next to the harmonic series. The sound is art: each line's real light frequency, about 10¹⁴ Hz, divided by 2⁴⁰ (forty octaves down), which keeps the ratios.]]

### Like harmonics, but not the same

It is tempting to call hydrogen's lines its "notes", and the comparison is useful as long as we are careful about the difference.

- **Alike:** both are lists made from whole numbers, and both come from standing waves. A string's notes come from waves that fit along its length; hydrogen's lines come from the electron's standing waves around the nucleus.
- **Different:** a string's harmonics are *added* in equal steps, $f, 2f, 3f, \ldots$, and go on forever. Hydrogen's line frequencies are *differences* of $1/n^2$: proportional to $\tfrac{1}{4} - \tfrac{1}{n^2}$. They bunch up toward a limit instead of spreading out, and they don't form chords. Played as sound, they don't sound like a scale.

So hydrogen does not play music. But the hunt for whole-number patterns, the same habit of mind that found the harmonic series, led straight to quantum physics.
