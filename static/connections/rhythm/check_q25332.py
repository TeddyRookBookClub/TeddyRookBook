# Check the probable prime q_25332 yourself. Python 3, standard library only; with gmpy2 installed the
# primality test at the end is much faster. Put q25332.txt (from this page) in the same folder.
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

N, D = 25332, 27500
P = pi_floor(D)
lo, hi = terms(P - 10, 10 ** D, N + 50), terms(P + 10, 10 ** D, N + 50)  # pi lies between the two
k = 0
while k < len(lo) and lo[k] == hi[k]:
    k += 1
assert k > N + 1, "not enough certain terms; raise D"
a = lo[:N + 1]
print("first terms:", a[:8], " terms 25330-25334:", lo[N - 2:N + 3])

q0, q1 = 0, 1                             # q_{-1} = 0, q_0 = 1
for n in range(1, N + 1):
    q0, q1 = q1, a[n] * q1 + q0
s = str(q1)
print("digits:", len(s), " matches the file:", s == open("q25332.txt").read().strip())
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
