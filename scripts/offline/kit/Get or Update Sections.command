#!/bin/bash
# Mac: double-click to choose sections, or to download only what changed on the site since last time.
cd "$(dirname "$0")" || exit 1
perl tools/trb.pl update
echo
read -r -p "Press Enter to close this window."
