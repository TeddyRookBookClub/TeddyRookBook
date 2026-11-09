#!/usr/bin/env python3
"""Check data/memory/lepanto.yaml against its public-domain source, line by line.

The source is the 1915 John Lane printing of Chesterton's Poems (pages 21-28) as transcribed and validated on Wikisource
(Page:Poems_(1915)_G_K_Chesterton.djvu/27 to /34). The only allowed change is "WHITE" -> "White" in line 1 (a drop capital).
Also checks that every line is in exactly one chunk and the scenes cover the poem in order.

  python3 scripts/memory/check-lepanto.py            # fetches the eight Wikisource pages
  python3 scripts/memory/check-lepanto.py DIR        # or reads page27.txt ... page34.txt (their raw wikitext) from DIR
Exits 1 on any difference.
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
URL = 'https://en.wikisource.org/w/index.php?title=Page:Poems_(1915)_G_K_Chesterton.djvu/%d&action=raw'


def page(n, d):
    if d:
        return open(os.path.join(d, 'page%d.txt' % n), encoding='utf-8').read()
    req = urllib.request.Request(URL % n, headers={'User-Agent': 'teddyrookbook-check/1.0'})
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8')


def source_lines(d=None):
    txt = ''
    for n in range(27, 35):
        s = re.sub(r'<noinclude>.*?</noinclude>', '', page(n, d), flags=re.S)
        txt += s + '\n'
    txt = txt.replace('{{c|LEPANTO}}', '').replace('{{di|W}}', 'W').replace('{{...|4}}', '....')
    txt = re.sub(r'\{\{gap\|[^}]*\}\}', '', txt)
    txt = re.sub(r'\{\{(?:dhr|nop|center block/[se]|block center/[se])\}\}', '\n', txt)
    txt = txt.replace("''", '').replace('<br />', '')
    out = [l.strip() for l in txt.split('\n') if l.strip()]
    if out and out[0].startswith('WHITE'):
        out[0] = 'White' + out[0][5:]
    return out


def load_yaml(path):
    try:
        import yaml
        return yaml.safe_load(open(path, encoding='utf-8'))
    except ImportError:   # the file is simple: each value used here is a one-line JSON string or a flow map
        raise SystemExit('needs PyYAML (pip install pyyaml)')


def main():
    d = sys.argv[1] if len(sys.argv) > 1 else None
    D = load_yaml(os.path.join(ROOT, 'data', 'memory', 'lepanto.yaml'))
    ours, src = D['lines'], source_lines(d)
    bad = 0
    if len(ours) != len(src):
        print('line count: ours %d, source %d' % (len(ours), len(src))); bad += 1
    for i, (a, b) in enumerate(zip(ours, src)):
        if a != b:
            print('line %d differs:\n  ours:   %s\n  source: %s' % (i + 1, a, b)); bad += 1
    n = len(ours)
    cover = [0] * n
    for c in D['chunks']:
        for i in range(c['from'] - 1, c['to']):
            cover[i] += 1
    miss = [i + 1 for i, k in enumerate(cover) if k != 1]
    if miss:
        print('lines not in exactly one chunk:', miss); bad += 1
    at = 1
    for s in D['scenes']:
        if s['from'] != at:
            print('scene', s['title'], 'starts at', s['from'], 'expected', at); bad += 1
        at = s['to'] + 1
    if at != n + 1:
        print('scenes end at', at - 1, 'not', n); bad += 1
    words = sum(len(l.split()) for l in ours)
    if D.get('words') != words:
        print('words: file says', D.get('words'), 'counted', words); bad += 1
    print('Lepanto: %d lines, %d words, %d chunks, %d scenes: %s' % (n, words, len(D['chunks']), len(D['scenes']), 'OK' if not bad else '%d problem(s)' % bad))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
