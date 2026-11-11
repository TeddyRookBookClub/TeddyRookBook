#!/usr/bin/env python3
"""Port Teddy Rook's two Chapter 18 instruments to the site.

Sources (kept as he wrote them): docs/papers/rhythm-of-numbers/instruments/*-instrument.html, each one file with a
<style>, a <div class="wrap"> and a <script>.  For each this writes
  static/connections/rhythm/inst/<name>.css   the styles, every rule scoped under .rni, in the site's colors
  static/connections/rhythm/inst/<name>.js    the script, reading its colors from the .rni wrapper
  layouts/_partials/connections/inst-<name>.html   the panels (the header is drawn by layouts/connections/rhythm-inst.html)
Run from the site root after either source changes:  python3 scripts/rhythm/port-instrument.py
"""
import re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs/papers/rhythm-of-numbers/instruments'
LIGHT = ('--bg:#ffffff;--surface:var(--entry,#fff);--ink:var(--primary,#1e1e1e);--muted:#566159;--line:#d5ddd8;'
         '--band:#00562f;--band-soft:#9fd3b9;--gold:#b8963e;--gold-soft:#f1e6c8;--gold-t:#7a5b12;--on:#ffffff;--focus:#0b5cad;--sun:#b8963e;'
         '--display:inherit;--body:inherit;--mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace')
DARK = ('--bg:#10261a;--surface:var(--entry,#18201c);--ink:var(--primary,#e6ece8);--muted:#a9b5ae;--line:#3a4640;'
        '--band:#6cc79a;--band-soft:#2f6b55;--gold:#e2c072;--gold-soft:#4a3a16;--gold-t:#e2c072;--on:#10261a;--focus:#86b4ff;--sun:#e2c072')
EXTRA = ('.rni{display:block;min-width:0;max-width:100%;color:var(--ink);font-size:.97rem;line-height:1.55;margin-top:1.2rem}'
         '.rni .wrap>*,.rni .panel>*{min-width:0;max-width:100%}'
         '.rni .readout{overflow-wrap:anywhere}'
         '.rni *{box-sizing:border-box}'
         '.rni .wrap{max-width:none}'
         '.rni h2{color:var(--ink)}'
         '.rni .eyebrow,.rni .readout .g{color:var(--gold-t)}'
         '.rni .play{background:var(--band);color:var(--on)}'
         '.rn .rni .play:hover,.rn .rni .play:focus,.rn .rni .play:active{background:var(--band);color:var(--on);filter:brightness(1.12)}'
         '.rni .chip[aria-pressed="true"]{color:var(--on)}'
         '.rni button{min-height:2.4rem}'
         '.rni .note{color:var(--muted);border-left-color:var(--gold)}')

def scope(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'@media \(prefers-color-scheme: dark\) \{ :root:not\(\[data-theme="light"\]\) \{.*?\} \}', '', css, flags=re.S)
    css = re.sub(r':root\[data-theme="dark"\] \{.*?\}', '', css, flags=re.S)
    css = re.sub(r':root \{.*?\}', '', css, count=1, flags=re.S)
    css = re.sub(r'\bbody \{.*?\}', '', css, count=1, flags=re.S)
    out = ['.rni{%s}' % LIGHT, '[data-theme="dark"] .rni{%s}' % DARK]
    for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', css):
        sel = sel.strip()
        if not sel or sel.startswith('@'):
            sys.exit('unexpected rule: ' + sel)
        sels = ', '.join('.rni ' + s.strip() for s in sel.split(','))
        out.append('%s{%s}' % (sels, ' '.join(body.split())))
    return '\n'.join(out) + '\n' + EXTRA + '\n'

for name, fn in (('kepler', 'kepler-figures-instrument.html'), ('butterfly', 'butterfly-instrument.html')):
    s = (SRC / fn).read_text()
    css = re.search(r'<style>(.*?)</style>', s, re.S).group(1)
    js = re.search(r'<script>(.*?)</script>', s, re.S).group(1).strip() + '\n'
    body = s[s.index('<div class="wrap">'):s.index('<script>')].strip()
    body = re.sub(r'\s*<header style=.*?</header>\n', '\n', body, count=1, flags=re.S)   # the page layout draws the header
    # one correction to the text (the paper's Section 19.7): the great inequality is driven by the 883-year beat but does not
    # itself repeat in exactly 883 years, because the orbits' long axes move
    old = 'it is 883 years, the same as the period of the slow swing of Jupiter and Saturn that astronomers call the great inequality.'
    if name == 'kepler':
        assert old in body
        body = body.replace(old, 'it is 883 years, the beat that drives the slow swing of Jupiter and Saturn that astronomers call the great inequality (the swing itself runs a few percent slower, because the orbits turn too).')
    assert 'getComputedStyle(document.documentElement)' in js
    js = js.replace('getComputedStyle(document.documentElement)', 'getComputedStyle(document.querySelector(".rni"))')
    head = '/* %s: ported from docs/papers/rhythm-of-numbers/instruments/%s by scripts/rhythm/port-instrument.py. Edit the source, then rerun. */\n' % (name, fn)
    (ROOT / 'static/connections/rhythm/inst' / (name + '.css')).write_text(head + scope(css))
    (ROOT / 'static/connections/rhythm/inst' / (name + '.js')).write_text(head + js)
    (ROOT / 'layouts/_partials/connections' / ('inst-%s.html' % name)).write_text(
        '{{- /* %s instrument panels: written by scripts/rhythm/port-instrument.py from %s. Do not edit here. */ -}}\n%s\n' % (name, fn, body))
    print(name, 'ok')
