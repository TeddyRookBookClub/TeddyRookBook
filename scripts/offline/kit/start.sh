#!/bin/sh
# Linux: open your copy of Teddy Rook Book in the browser. Press Ctrl+C to stop it.
cd "$(dirname "$0")" || exit 1
exec perl tools/trb.pl serve
