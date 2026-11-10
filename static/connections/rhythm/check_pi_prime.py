# Check pi's new probable primes yourself. Python 3, standard library only; with gmpy2 installed the
# primality test at the end is much faster. Put q25332.txt, q27651.txt, q32394.txt, q37721.txt or p42037.txt (from this
# page) in the same folder, then run, for example,
#   python3 check_pi_prime.py 37721      (a bottom number)   or   python3 check_pi_prime.py 42037 p   (a top number)
import hashlib, random, sys
if hasattr(sys, "set_int_max_str_digits"):
    sys.set_int_max_str_digits(0)          # allow printing a 13,017-digit number

def pi_floor(d):
    """An integer within a few units of pi * 10^d, by Machin's formula pi = 16 atan(1/5) - 4 atan(1/239)."""
    one = 10 ** (d + 10)
    def atan_inv(x):                      # atan(1/x) * one
        total = power = one // x
        n, sign = 3, -1
        while power:
            power //= x * x
            total += sign * (power // n)
            n, sign = n + 2, -sign
        return total
    return (16 * atan_inv(5) - 4 * atan_inv(239)) // 10 ** 10

def terms(num, den, count):
    out = []
    while den and len(out) < count:
        a, r = divmod(num, den)
        out.append(a)
        num, den = den, r
    return out

N = int(sys.argv[1]) if len(sys.argv) > 1 else 25332
TOP = len(sys.argv) > 2 and sys.argv[2] == "p"     # p: the numerator (top number) instead of the denominator
D = int(1.03 * N) + 1500                 # digits of pi needed, with room to spare
P = pi_floor(D)
lo, hi = terms(P - 10, 10 ** D, N + 50), terms(P + 10, 10 ** D, N + 50)  # pi lies between the two
k = 0
while k < len(lo) and lo[k] == hi[k]:
    k += 1
assert k > N + 1, "not enough certain terms; raise D"
a = lo[:N + 1]
print("first terms:", a[:8], " terms %d-%d:" % (N - 2, N + 2), lo[N - 2:N + 3])

q0, q1 = (1, a[0]) if TOP else (0, 1)    # p_{-1} = 1, p_0 = 3; q_{-1} = 0, q_0 = 1
for n in range(1, N + 1):
    q0, q1 = q1, a[n] * q1 + q0
s = str(q1)
print("digits:", len(s), " matches the file:", s == open("%s%d.txt" % ("p" if TOP else "q", N)).read().strip())
print("SHA-256:", hashlib.sha256(s.encode()).hexdigest())

try:
    import gmpy2
    print("strong Baillie-PSW test (gmpy2):", gmpy2.is_strong_bpsw_prp(gmpy2.mpz(q1)))
except ImportError:
    def strong_test(n, b):                # one Miller-Rabin round; takes a few minutes here
        d, s2 = n - 1, 0
        while d % 2 == 0:
            d, s2 = d // 2, s2 + 1
        x = pow(b, d, n)
        if x in (1, n - 1):
            return True
        for _ in range(s2 - 1):
            x = x * x % n
            if x == n - 1:
                return True
        return False
    print("Miller-Rabin, base 2:", strong_test(q1, 2))
    print("Miller-Rabin, random base:", strong_test(q1, random.randrange(3, q1 - 2)))
