"""Rebuild data/jerome/*.json (the Study Companion pages at /languages/jerome/) from the PDF.

    python3 scripts/jerome/build.py [path/to/companion.pdf]

Needs pdfplumber (pip install pdfplumber). The PDF defaults to static/pdfs/Greek-and-Latin-with-Jerome-Study-Companion.pdf.
Scratch files go to $JEROME_WORK (default: a jerome-work folder in the system temp folder); the dump is reused if present,
so delete it after replacing the PDF. The output folder is $JEROME_OUT (default: data/jerome in this repository).
"""
import os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '..', 'static', 'pdfs', 'Greek-and-Latin-with-Jerome-Study-Companion.pdf')
WORK = os.environ.get('JEROME_WORK') or os.path.join(tempfile.gettempdir(), 'jerome-work')
os.makedirs(WORK, exist_ok=True)
env = dict(os.environ, JEROME_WORK=WORK)


def run(*a):
    print('>', ' '.join(os.path.basename(x) for x in a))
    subprocess.run([sys.executable, *a], cwd=HERE, env=env, check=True)


dump = os.path.join(WORK, 'all.json')
if not os.path.exists(dump):
    import pdfplumber
    with pdfplumber.open(PDF) as pdf:
        n = len(pdf.pages)
    run(os.path.join(HERE, 'dump.py'), PDF, '1', str(n), dump)
for step in ('parse_passages.py', 'parse_practice.py', 'parse_forms.py', 'parse_found.py', 'build_data.py'):
    run(os.path.join(HERE, step))
