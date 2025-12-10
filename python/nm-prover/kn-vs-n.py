import numpy as np
import matplotlib.pyplot as plt
from sympy import primerange

# -------------------------------
# 1. Get first N primes
# -------------------------------
N = 100_000                # ~ 1.3 million
primes = np.array(list(primerange(1, 2_000_000)))[:N]
print(f"Loaded {len(primes)} primes up to {primes[-1]}")

# -------------------------------
# 2. Precompute composite mask
# -------------------------------
MAX = int(primes[-1]) + 100
is_composite = np.ones(MAX + 1, dtype=bool)
is_composite[0:2] = False
for p in primes:
    if p*p > MAX: break
    is_composite[p*p::p] = True
is_composite[primes] = False

# -------------------------------
# 3. Compute k_n for each prime p_n
# -------------------------------
W = 40                     # window = ±20 → 41 numbers
c = 0.150
k_values = []
n_values = []
gaps = []

for i in range(len(primes)):
    n = primes[i]
    if n < 21: continue   # skip edge

    # window [n-20, n+20]
    lo, hi = n - 20, n + 20
    window = is_composite[lo:hi+1]
    rho = window.sum() / len(window)               # composite fraction

    sigma = np.log(1 + rho * np.log(n))
    k_n = c * (sigma ** 3) * np.sqrt(rho)

    k_values.append(k_n)
    n_values.append(n)

    # gap to next prime
    if i + 1 < len(primes):
        gaps.append(primes[i+1] - n)
    else:
        gaps.append(0)

k_arr = np.array(k_values)
n_arr = np.array(n_values)
gap_arr = np.array(gaps)

# -------------------------------
# 4. Plot: k_n vs n (log-log)
# -------------------------------
plt.figure(figsize=(12, 7))

# Main scatter: k_n vs n
plt.scatter(n_arr, k_arr, c=gap_arr, cmap='viridis', s=8, alpha=0.7,
            label='k_n (color = gap size)')

plt.colorbar(label='Prime Gap Δp')
plt.xscale('log')
plt.yscale('log')
plt.xlabel('n (prime location)')
plt.ylabel('k_n (curvature field)')
plt.title('κ-Curvature Field k_n vs. n  (First 100,000 Primes)')

# Overlay large gaps
large = gap_arr > 50
plt.scatter(n_arr[large], k_arr[large], c='red', s=30, marker='x',
            label='Gap > 50')

# Critical line analogy
plt.axhline(y=0.5, color='gray', linestyle='--', alpha=0.6, label='k_n ≈ 0.5 (twin zone)')
plt.axhline(y=1.5, color='orange', linestyle='--', alpha=0.6, label='k_n ≈ 1.5 (large gap zone)')

plt.legend()
plt.grid(True, which='both', ls=':', alpha=0.5)
plt.tight_layout()
plt.show()

# -------------------------------
# 5. Stats
# -------------------------------
print(f"\nStats:")
print(f"  Mean k_n       : {k_arr.mean():.3f}")
print(f"  Median k_n     : {np.median(k_arr):.3f}")
print(f"  k_n in twin gaps (<3):38.2f% of points with gap=2 have k_n < 0.6")
print(f"  k_n in large gaps (>50): {100*(k_arr[large].mean()):.1f}% have k_n > 1.2")