"""Figure: the denominators Q_n over one period of sqrt(N), for a prime 3 mod 4, a prime 1 mod 4 and a composite."""
import math, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
def period(N):
    a0 = math.isqrt(N); P, Q, a = 0, 1, a0; Qs = [1]; terms = [a0]
    while True:
        P = a * Q - P; Q = (N - P * P) // Q; Qs.append(Q)
        if Q == 1: return Qs, terms
        a = (a0 + P) // Q; terms.append(a)
GREEN, GOLD, GREY = "#1f7a5a", "#b9831c", "#9aa8a0"
cases = [(199, "prime, 199 = 7 mod 8"), (193, "prime, 193 = 1 mod 8"), (217, "composite, 217 = 7 × 31")]
fig, axes = plt.subplots(1, 3, figsize=(10.5, 3.1), sharey=False)
for ax, (N, title) in zip(axes, cases):
    Qs, terms = period(N); k = len(Qs) - 1; xs = list(range(k + 1))
    mid = [k // 2] if k % 2 == 0 else [k // 2, k // 2 + 1]
    if k % 2 == 0: note = "period %d, middle Q = %d" % (k, Qs[k // 2])
    else:
        b = Qs[k // 2]; a = math.isqrt(N - b * b); assert a * a + b * b == N; note = "period %d, %d = %d² + %d²" % (k, N, a, b)
    ax.bar(xs, Qs, color=[GOLD if x in mid else GREEN for x in xs], width=0.8)
    for x in mid: ax.text(x, Qs[x] + 0.4, str(Qs[x]), ha="center", va="bottom", fontsize=9, color=GOLD, fontweight="bold")
    ax.set_title(title + "\n" + note, fontsize=9); ax.set_xlabel("step n", fontsize=9); ax.tick_params(labelsize=8)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True)); ax.spines[["top", "right"]].set_visible(False); ax.set_xticks(range(0, k + 1, 2 if k < 14 else 4))
    print(N, note, "Q:", Qs)
axes[0].set_ylabel("$Q_n$", fontsize=10)
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "paper", "figures"); os.makedirs(OUT, exist_ok=True)
fig.tight_layout(); fig.savefig(os.path.join(OUT, "sqrt_middle.pdf"))   # Figure 7.2 of the paper
