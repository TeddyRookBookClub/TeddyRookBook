#!/bin/bash
# One time-limited chunk of the curve checks, two processes, resumable. Usage: bash chunk.sh SECONDS
cd "$(dirname "$0")"; B=${1:-440}
for k in 0 1; do
  touch res_$k.txt
  python3 - "$k" <<'PY' > todo_$k.txt
import sys
k = sys.argv[1]; done = {l.split()[0] for l in open("res_%s.txt" % k) if len(l.split()) == 3}
sys.stdout.writelines(l for l in open("jobs_%s.txt" % k) if l.split(" ", 1)[0] not in done)
PY
  ./ecstep $B < todo_$k.txt >> res_$k.txt &
done
wait
cat res_0.txt res_1.txt | awk 'NF==3 {n++; ok+=$2; t+=$3} END {printf "checked %d of 899, valid %d, failed %d, cpu %.0f s\n", n, ok, n-ok, t}'
