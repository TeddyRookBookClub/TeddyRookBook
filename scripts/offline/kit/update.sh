#!/bin/sh
# Linux: choose sections, or download only what changed on the site since last time.
#   ./update.sh                      (asks)
#   ./update.sh --add math,logic     (no questions; see: perl tools/trb.pl list)
cd "$(dirname "$0")" || exit 1
exec perl tools/trb.pl update "$@"
