#!/usr/bin/env python3
"""Makes the print fonts of the Harvard Classics export (static/harvard-classics/fonts/), from fonts most TeX and Linux
installs already have:

    python3 scripts/harvard_export_fonts.py [PAGELLA_DIR] [PORSON_DIR]

    hcbook-regular.woff, hcbook-italic.woff   "HC Book Serif": TeX Gyre Pagella 2.501 (texgyrepagella-*.otf)
    hcgreek-regular.woff                      "HC Book Greek": GFS Porson (GFSPorson.otf), used for Greek only

Chromium (and so the PDFs made by scripts/harvard_export_pdf.js and by "Save as PDF") embeds fonts with PostScript
(CFF) outlines as Type 3 fonts, which some PDF readers draw poorly. So the outlines are converted to TrueType curves
(fontTools cu2qu, within one font unit) and the fonts renamed, as the GUST Font License asks of changed versions and the
SIL Open Font License requires (Reserved Font Name "GFS Porson"). Nothing else is changed. Needs fontTools.
Licenses and the record of this change: static/harvard-classics/fonts/LICENSES.txt.
"""
import os, sys
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SITE, 'static', 'harvard-classics', 'fonts')
PAGELLA = sys.argv[1] if len(sys.argv) > 1 else '/usr/share/texmf/fonts/opentype/public/tex-gyre'
PORSON = sys.argv[2] if len(sys.argv) > 2 else '/usr/share/fonts/opentype/porson'


def convert(src, dst, family, style, notice):
    f = TTFont(src)
    gs, order = f.getGlyphSet(), f.getGlyphOrder()
    glyf = newTable('glyf'); glyf.glyphOrder = order; glyf.glyphs = {}
    for name in order:
        pen = TTGlyphPen(gs)
        gs[name].draw(Cu2QuPen(pen, 1.0, reverse_direction=True))
        glyf[name] = pen.glyph()
    f['loca'] = newTable('loca'); f['glyf'] = glyf
    del f['CFF ']
    if 'VORG' in f: del f['VORG']
    maxp = f['maxp'] = newTable('maxp'); maxp.tableVersion = 0x00010000
    for a in ('maxPoints', 'maxContours', 'maxCompositePoints', 'maxCompositeContours', 'maxTwilightPoints', 'maxStorage',
              'maxFunctionDefs', 'maxInstructionDefs', 'maxStackElements', 'maxSizeOfInstructions', 'maxComponentElements', 'maxComponentDepth'):
        setattr(maxp, a, 0)
    maxp.maxZones = 1; maxp.numGlyphs = len(order)
    post = f['post']; post.formatType = 2.0; post.extraNames = []; post.mapping = {}; post.glyphOrder = order
    f.sfntVersion = '\x00\x01\x00\x00'; f['head'].glyphDataFormat = 0
    ps = (family + '-' + style).replace(' ', '')
    name = f['name']
    for rec in list(name.names):
        p = (rec.platformID, rec.platEncID, rec.langID)
        if rec.nameID in (1, 16): name.setName(family, rec.nameID, *p)
        elif rec.nameID in (2, 17): name.setName(style, rec.nameID, *p)
        elif rec.nameID == 4: name.setName(family + ' ' + style, 4, *p)
        elif rec.nameID == 6: name.setName(ps, 6, *p)
        elif rec.nameID == 3: name.setName(ps + '; converted', 3, *p)
        elif rec.nameID == 5: name.setName(rec.toUnicode() + '; ' + notice, 5, *p)
    name.setName(notice, 10, 3, 1, 0x409)
    f.flavor = 'woff'
    f.save(dst)
    print(dst, len(order), 'glyphs', os.path.getsize(dst), 'bytes')


def main():
    os.makedirs(OUT, exist_ok=True)
    pag = 'TeX Gyre Pagella 2.501 with its outlines converted to TrueType (fontTools cu2qu) and renamed for Teddy Rook Book; otherwise unchanged'
    por = 'GFS Porson with its outlines converted to TrueType (fontTools cu2qu) and renamed for Teddy Rook Book; otherwise unchanged'
    convert(os.path.join(PAGELLA, 'texgyrepagella-regular.otf'), os.path.join(OUT, 'hcbook-regular.woff'), 'HC Book Serif', 'Regular', pag)
    convert(os.path.join(PAGELLA, 'texgyrepagella-italic.otf'), os.path.join(OUT, 'hcbook-italic.woff'), 'HC Book Serif', 'Italic', pag)
    convert(os.path.join(PORSON, 'GFSPorson.otf'), os.path.join(OUT, 'hcgreek-regular.woff'), 'HC Book Greek', 'Regular', por)


if __name__ == '__main__':
    main()
