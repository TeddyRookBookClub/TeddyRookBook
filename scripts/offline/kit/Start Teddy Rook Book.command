#!/bin/bash
# Mac: double-click to open your copy of Teddy Rook Book in the browser. Close this window to stop it.
cd "$(dirname "$0")" || exit 1
perl tools/trb.pl serve
