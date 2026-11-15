#!/usr/bin/env python3
"""Independent check of a Primo-format (Format=4) ECPP certificate. Uses only gmpy2 integer arithmetic; no code from CM or PARI.

Each step [i] gives S, W, J, T for the current number N (the candidate in step 1, then the R of the step before):
   order m = N + 1 - W,  R = m / S (must divide exactly),  R > (N^(1/4) + 1)^2,
   curve y^2 = x^3 + A x + B with A = 3J(1728 - J), B = 2J(1728 - J)^2 (mod N), discriminant coprime to N,
   point with x = T after the twist by L = T^3 + A T + B:  P = (T L, L^2) on y^2 = x^3 + A L^2 x + B L^3,
   P2 = [S]P must be a finite point with denominator coprime to N, and [R]P2 must be the point at infinity.
Then (Goldwasser-Kilian / Atkin-Morain): if R is prime, N is prime. The last R (below 2^64) is checked by trial division up to its square root (trial.c).
   Steps that give A and B instead of J use that curve directly.

  python3 verify_primo.py CERT --procs 4 [--expect-n FILE_WITH_DECIMAL_N]
"""
import sys, re, json, time, argparse, multiprocessing as mp
import gmpy2
from gmpy2 import mpz

def parse(path):
    steps = []; cur = None; N = None; sec = None
    for line in open(path):
        line = line.strip()
        m = re.match(r"^\[(.+)\]$", line)
        if m:
            sec = m.group(1)
            if sec.isdigit(): cur = {}; steps.append(cur); assert int(sec) == len(steps)
            continue
        if "=" in line and sec:
            k, v = line.split("=", 1)
            if sec == "Candidate" and k == "N": N = mpz(int(v, 16))
            elif sec.isdigit(): cur[k] = mpz(int(v, 16))
    return N, steps

def jdbl(P, a, n):
    X, Y, Z = P
    if Z == 0 or Y == 0: return (mpz(1), mpz(1), mpz(0))
    YY = Y * Y % n; S = 4 * X * YY % n; ZZ = Z * Z % n
    M = (3 * X * X + a * ZZ * ZZ) % n
    X3 = (M * M - 2 * S) % n; Y3 = (M * (S - X3) - 8 * YY * YY) % n; Z3 = 2 * Y * Z % n
    return (X3, Y3, Z3)

def jadd(P, Q, a, n):
    X1, Y1, Z1 = P; X2, Y2, Z2 = Q
    if Z1 == 0: return Q
    if Z2 == 0: return P
    Z1Z1 = Z1 * Z1 % n; Z2Z2 = Z2 * Z2 % n
    U1 = X1 * Z2Z2 % n; U2 = X2 * Z1Z1 % n
    S1 = Y1 * Z2 * Z2Z2 % n; S2 = Y2 * Z1 * Z1Z1 % n
    H = (U2 - U1) % n; r = (S2 - S1) % n
    if H == 0:
        return jdbl(P, a, n) if r == 0 else (mpz(1), mpz(1), mpz(0))
    HH = H * H % n; HHH = H * HH % n; V = U1 * HH % n
    X3 = (r * r - HHH - 2 * V) % n; Y3 = (r * (V - X3) - S1 * HHH) % n; Z3 = Z1 * Z2 * H % n
    return (X3, Y3, Z3)

def jmul(k, P, a, n):
    R = (mpz(1), mpz(1), mpz(0))
    for bit in bin(k)[2:]:
        R = jdbl(R, a, n)
        if bit == "1": R = jadd(R, P, a, n)
    return R

def check_step(job):
    i, N, st = job; t0 = time.time()
    try:
        S, W, T = st["S"], st["W"], st["T"]
        assert set(st) in ({"S", "W", "J", "T"}, {"S", "W", "A", "B", "T"}), "unexpected fields"
        m = N + 1 - W; R, rem = gmpy2.f_divmod(m, S)
        assert S > 0 and rem == 0, "S does not divide the order"
        assert W * W <= 4 * N, "trace outside the Hasse bound"
        r4 = gmpy2.iroot(N, 4)[0] + 2                      # > N^(1/4) + 1
        assert R > r4 * r4, "R too small"
        assert N % 2 == 1 and gmpy2.gcd(N, 6) == 1
        if "J" in st: J = st["J"]; A = 3 * J * (1728 - J) % N; B = 2 * J * (1728 - J) * (1728 - J) % N
        else: A = st["A"] % N; B = st["B"] % N              # curve given directly (used when J = 0 or 1728)
        assert gmpy2.gcd((4 * A * A * A + 27 * B * B) % N, N) == 1, "singular curve"
        L = (T * T * T + A * T + B) % N
        a = A * L * L % N; b = B * L * L * L % N
        x = T * L % N; y = L * L % N
        assert (y * y - (x * x * x + a * x + b)) % N == 0, "point not on curve"
        P2 = jmul(S, (x, y, mpz(1)), a, N)
        assert gmpy2.gcd(P2[2], N) == 1, "[S]P is not a finite point modulo every prime factor"
        P3 = jmul(R, P2, a, N)
        assert P3[2] % N == 0, "[R][S]P is not the point at infinity"
        return [i, True, int(N.bit_length()), str(R), round(time.time() - t0, 1)]
    except AssertionError as e:
        return [i, False, int(N.bit_length()), str(e), round(time.time() - t0, 1)]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("cert"); ap.add_argument("--procs", type=int, default=mp.cpu_count())
    ap.add_argument("--expect-n"); ap.add_argument("--out", default="verify_results.jsonl")
    a = ap.parse_args()
    N, steps = parse(a.cert)
    print("candidate: %d bits, %d digits; %d steps" % (N.bit_length(), N.num_digits(), len(steps)), flush=True)
    if a.expect_n:
        want = mpz(open(a.expect_n).read().strip()); print("candidate equals the expected number:", want == N, flush=True); assert want == N
    jobs = []; cur = N                                         # the chain: each R is the next N (cheap to compute up front)
    for i, st in enumerate(steps, 1):
        jobs.append((i, cur, st)); m = cur + 1 - st["W"]; cur = m // st["S"]
    last = cur
    done = {}
    try:
        for line in open(a.out): r = json.loads(line); done[r[0]] = r
    except FileNotFoundError: pass
    todo = [j for j in jobs if j[0] not in done]
    todo.sort(key=lambda j: -j[1].bit_length())
    out = open(a.out, "a"); t0 = time.time()
    with mp.Pool(a.procs) as pool:
        for r in pool.imap_unordered(check_step, todo, chunksize=1):
            out.write(json.dumps(r) + "\n"); out.flush(); done[r[0]] = r
            if not r[1]: print("STEP %d FAILED: %s" % (r[0], r[3]), flush=True)
            if len(done) % 25 == 0: print("%d of %d steps checked, %.0f s" % (len(done), len(jobs), time.time() - t0), flush=True)
    ok = all(done[j[0]][1] for j in jobs)
    chain = all(done[jobs[k][0]][3] == str(jobs[k + 1][1]) for k in range(len(jobs) - 1))
    import subprocess, os
    here = os.path.dirname(os.path.abspath(__file__))
    subprocess.run(["gcc", "-O2", "-o", os.path.join(here, "trial"), os.path.join(here, "trial.c")], check=True)
    small = last < 2 ** 64 and subprocess.run([os.path.join(here, "trial"), str(last)], capture_output=True, text=True).stdout.strip() == "prime"
    print("all %d steps valid: %s" % (len(jobs), ok)); print("chain links (each R is the next N):", chain)
    print("final number: %d (%d bits); prime by trial division: %s" % (last, last.bit_length(), small))
    print("CERTIFICATE VALID" if ok and chain and small else "CERTIFICATE NOT VERIFIED")

if __name__ == "__main__":
    main()
