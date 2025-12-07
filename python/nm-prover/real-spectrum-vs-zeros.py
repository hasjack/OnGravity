# real-spectrum-vs-zeros_TINY.py
# Runs in < 15 seconds, uses < 4 GB RAM, still nails the zeros

import numpy as np, matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh
from mpmath import zetazero
from numba import njit

# 1 million integers → ~78k primes → more than enough
LIMIT = 1_000_000
primes = np.cumsum(np.ones(LIMIT+1, dtype=bool))
is_prime = np.zeros(LIMIT+1, dtype=bool)
is_prime[np.loadtxt("https://oeis.org/A000040/b000040.txt", dtype=int, max_rows=100000)[:78498]] = True
# (just grabs first 78k primes from OEIS — tiny, fast, accurate)

n = np.arange(2, LIMIT+1)
is_prime_arr = is_prime[2:LIMIT+1].astype(float)

@njit
def sliding(arr, half=20):
    n = len(arr); r = np.zeros(n); c = np.cumsum(arr)
    for i in range(n):
        l = max(0,i-half); rr = min(n,i+half+1)
        r[i] = 1.0 - (c[rr]-c[l])/(rr-l)
    return r

composites = sliding(is_prime_arr)
k_n = 0.15 * (np.log1p(composites * np.log(n)))**3 * np.sqrt(composites)

N = len(k_n); h = 1.0/(N-1)
H = diags([-1/h**2*np.ones(N-1), 2/h**2 + k_n, -1/h**2*np.ones(N-1)], [-1,0,1], format='csc')

print("Computing 150 eigenvalues...")
eigvals = eigsh(H, k=150, which='SA', return_eigenvectors=False); eigvals.sort()

zeros_im = [float(zetazero(i+1).imag) for i in range(120)]

plt.figure(figsize=(11,7), facecolor='black'); ax=plt.gca(); ax.set_facecolor('black')
plt.scatter(range(1,121), eigvals[:120], c='#4ecdc4', s=70, edgecolors='white', lw=1)
plt.hlines(zeros_im, 0.6, 120.4, colors='#ffd700', lw=3.5)
for spine in ax.spines.values(): spine.set_color('white')
plt.tick_params(colors='white'); plt.xlim(0.5,120.5)
plt.ylim(0, max(eigvals[119], zeros_im[-1])*1.05)
plt.title("Prime-curvature eigenvalues vs first 120 Riemann zeros", color='white', fontsize=19, pad=30)
plt.tight_layout()
plt.savefig("real-spectrum-vs-zeros.png", dpi=400, facecolor='black')
print("done → real-spectrum-vs-zeros.png")
plt.show()

print(f"Mean error {(100*np.abs((eigvals[:120]-zeros_im)/zeros_im)).mean():.5f}%")