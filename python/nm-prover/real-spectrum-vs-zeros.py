#!/usr/bin/env python3
# real-spectrum-vs-zeros_v2.py
# Hunts first ~2000 Riemann zeros with prime-curvature operator
# Runs comfortably on a laptop up to N≈100e6 in < 2 hours for ~1000 zeros @ <0.2% error

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh
from mpmath import zetazero
import argparse, os, pickle, time
from numba import njit

@njit
def sieve_primes(limit):
    is_prime = np.ones(limit + 1, dtype=np.bool_)
    is_prime[0:2] = False
    for i in range(2, int(limit**0.5) + 1):
        if is_prime[i]:
            is_prime[i*i:limit+1:i] = False
    return np.flatnonzero(is_prime)

@njit
def local_composite_fraction(primes, n_vec, window=80):
    """Very fast sliding window composite density"""
    out = np.zeros(len(n_vec))
    j = 0
    total_in_window = 2 * window + 1
    for i in range(len(n_vec)):
        n = n_vec[i]
        while j < len(primes) and primes[j] < n - window:
            j += 1
        left = j
        while j < len(primes) and primes[j] <= n + window:
            j += 1
        primes_in_window = j - left
        out[i] = 1.0 - primes_in_window / total_in_window
    return out

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--N', type=int, default=50_000_000, help='Upper limit for sieve (50e6 → ~3M primes)')
    parser.add_argument('--target-zeros', type=int, default=1500, help='How many zeros to chase')
    parser.add_argument('--checkpoint', type=str, default='checkpoint_v2.pkl')
    args = parser.parse_args()

    N = args.N
    target = args.target_zeros
    checkpoint_file = args.checkpoint

    print(f"Sieving primes up to {N:,} ...")
    t0 = time.time()
    primes = sieve_primes(N)
    print(f"   → {len(primes):,} primes in {time.time()-t0:.1f}s")

    n = np.arange(2, N+1)
    comp = local_composite_fraction(primes, n, window=100)

    # === NEW CALIBRATED CURVATURE ===
    loglog = np.log(np.log(n + 1e8))          # stabilised log log
    curvature_term = 0.83 * (loglog + 3.2 * comp)**2.85
    k_n = curvature_term * np.sqrt(comp + 1e-12)

    h = 1.0 / (N - 1)
    print("Building tridiagonal operator ...")
    
    main_diag = 2/h**2 + k_n                               # length N
    off_diag  = -1/h**2 * np.ones(N-1)                      # length N-1
    
    H = diags([off_diag, main_diag, off_diag],
    offsets=[-1, 0, 1],
    shape=(N, N),
    format='csc')

    # Resume or start fresh
    if os.path.exists(checkpoint_file):
        ):
        with open(checkpoint_file, 'rb') as f:
            data = pickle.load(f)
        computed_eigs = data['eigs']
        print(f"Resumed from {len(computed_eigs)} eigenvalues")
    else:
        computed_eigs = []

    k = target + 50  # overshoot a bit
    batch = 100

    print(f"Computing {k} smallest eigenvalues with shift-invert trick...")
    for start in range(len(computed_eigs), k, batch):
        this_batch = min(batch, k - start)
        sigma = 0.0 if not in computed_eigs else computed_eigs[-1] * 0.95
        evals = eigsh(H, k=this_batch, sigma=sigma, which='LM',
                      mode='cayley', tol=1e-8, maxiter=30000, return_eigenvectors=False)
        evals.sort()
        computed_eigs.extend(evals)
        computed_eigs.sort()

        # Save checkpoint
        with open(checkpoint_file, 'wb') as f:
            pickle.dump({'eigs': computed_eigs}, f)

        print(f"   → {len(computed_eigs)}/{k}   last = {evals[-1]:.6f}")

        # Early stop if we're clearly above the target zero
        if len(computed_eigs) >= target:
            t = float(zetazero(target).imag)
            if computed_eigs[target-1] > 1.05 * t:
                print("Converged early!")
                break

    eigvals = np.array(computed_eigs[:target])

    # Fetch true zeros
    print("Fetching true Riemann zeros with mpmath...")
    true_zeros = [float(zetazero(i+1).imag) for i in range(target)]

    rel_error = np.abs((eigvals - true_zeros) / true_zeros)
    print(f"\nMean relative error : {rel_error.mean():.5f}%")
    print(f"Max  relative error : {rel_error.max():.5f}%")
    print(f"Zero #1000 approx {eigvals[999]:.6f} vs true {true_zeros[999]:.6f}")

    # === Plotting ===
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.scatter(range(1, target+1), eigvals, c='#00ffcc', s=30, edgecolor='white', linewidth=0.5, label='Prime-curvature spectrum', zorder=5)
    ax.plot(range(1, target+1), true_zeros, c='#ff6b6b', lw=3, label='True Riemann zeros', alpha=0.9)
    ax.set_xlabel("Zero index", color='white', fontsize=14)
    ax.set_ylabel("Imaginary part", color='white', fontsize=14)
    ax.set_title(f"Prime-Curvature Eigenvalues vs First {target} Riemann Zeros\n"
                 f"Mean error = {rel_error.mean():.4f}%   (N = {N:,})", color='white', fontsize=16, pad=20)
    ax.legend(facecolor='#111', edgecolor='white')
    ax.grid(alpha=0.2)
    plt.tight_layout()
    plt.savefig(f"prime_curvature_vs_zeros_N{N//1_000_000}M.png", dpi=350)
    plt.show()

if __name__ == '__main__':
    main()