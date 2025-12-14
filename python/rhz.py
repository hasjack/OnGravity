#!/usr/bin/env python3
import argparse
import time
import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh, ArpackNoConvergence
from mpmath import zetazero

def sieve_primes(limit):
    is_prime = np.ones(limit+1, dtype=bool)
    is_prime[:2] = False
    for i in range(2, int(limit**0.5) + 1):
        if is_prime[i]:
            is_prime[i*i:limit+1:i] = False
    return np.nonzero(is_prime)[0]

def build_operator(N, primes, debug=False):
    n_vals = np.arange(2, N+2, dtype=float)
    h = 1.0 / (N - 1)

    # --- composite density in sliding window ---
    window = 120
    comp = np.zeros(N, dtype=float)
    j = 0
    L = len(primes)
    for i in range(N):
        # move left pointer
        while j < L and primes[j] < n_vals[i] - window:
            j += 1
        left = j
        # move right pointer
        while j < L and primes[j] <= n_vals[i] + window:
            j += 1
        comp[i] = 1.0 - (j - left) / (2*window + 1)

    # --- raw prime-curvature "potential" (your original formula) ---
    raw_k = 0.92 * h**2 * (np.log(np.log(n_vals + 1e10)) + 3.0*comp)**2.65 * np.sqrt(comp + 1e-12)

    # --- calibrate amplitude from first eigenvalue ---
    # discrete Laplacian first eigenvalue on [0,1]
    lap_first = (2.0 - 2.0*np.cos(np.pi / (N + 1))) / h**2
    # first Riemann zero
    first_zero = 14.134725141

    mean_raw = raw_k.mean()
    if mean_raw == 0.0:
        scale = 0.0
    else:
        scale = (first_zero - lap_first) / mean_raw

    k_n = scale * raw_k

    if debug:
        print(f"h = {h}")
        print(f"lap_first λ₁⁽⁰⁾ ≈ {lap_first}")
        print(f"first_zero γ₁ ≈ {first_zero}")
        print(f"raw_k: min={raw_k.min()}, mean={raw_k.mean()}, max={raw_k.max()}")
        print(f"scale chosen = {scale}")
        print(f"k_n:   min={k_n.min()},   mean={k_n.mean()},   max={k_n.max()}")

    # --- build sparse operator H ---
    off = -np.ones(N-1, dtype=float) / h**2
    diag = 2.0 / h**2 + k_n
    H = diags([off, diag, off], offsets=[-1, 0, 1], shape=(N, N), format='csc')
    return H, h, k_n

def compute_eigenvalues(H, target, tol=1e-10, debug=False):
    N = H.shape[0]
    if target >= N:
        target = N - 1

    # we want the eigenvalues nearest 0 → shift-invert with sigma=0
    sigma = 0.0

    if debug:
        print(f"Calling eigsh with k={target}, sigma={sigma}")

    try:
        evals = eigsh(
            H,
            k=target,
            sigma=sigma,
            which='LM',          # nearest to sigma (shift-invert)
            tol=tol,
            maxiter=200000,
            return_eigenvectors=False
        )
    except ArpackNoConvergence as anc:
        # use whatever partial eigenvalues we did get
        partial = getattr(anc, 'eigenvalues', None)
        if partial is None or len(partial) == 0:
            raise
        if debug:
            print(f"ArpackNoConvergence: got {len(partial)} partial eigenvalues")
        evals = partial

    evals = np.sort(np.array(evals, dtype=float))[:target]
    if debug:
        print("eigs: min, mean, max =", evals.min(), evals.mean(), evals.max())
    return evals

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--N', type=int, default=200_000, help='grid size')
    parser.add_argument('--target-zeros', type=int, default=200, help='how many zeros to compare')
    parser.add_argument('--tol', type=float, default=1e-10, help='ARPACK tolerance')
    parser.add_argument('--debug', action='store_true')
    args = parser.parse_args()

    N = args.N
    target = args.target_zeros
    tol = args.tol
    debug = args.debug

    if target <= 0:
        raise SystemExit("target-zeros must be > 0")

    if target >= N:
        print(f"Warning: cannot request {target} eigenvalues from size-{N} matrix; using {N-1}.")
        target = N - 1

    print(f"Sieving primes ≤ {N:,} ...")
    t0 = time.time()
    primes = sieve_primes(N)
    print(f"  {len(primes):,} primes in {time.time() - t0:.3f}s")

    print("Building operator ...")
    t0 = time.time()
    H, h, k_n = build_operator(N, primes, debug=debug)
    print(f"  operator built in {time.time() - t0:.3f}s")

    print(f"Computing eigenvalues → target = {target}")
    t0 = time.time()
    evals = compute_eigenvalues(H, target, tol=tol, debug=debug)
    print(f"  eigenvalues computed in {time.time() - t0:.3f}s")

    print("Fetching Riemann zeros (mpmath) ...")
    t0 = time.time()
    true = np.array([float(zetazero(i+1).imag) for i in range(target)], dtype=float)
    print(f"  got {len(true)} zeros in {time.time() - t0:.3f}s")

    err = np.abs((evals - true) / true) * 100.0
    print(f"\nMEAN RELATIVE ERROR = {err.mean():.5f}%")
    print(f"MAX  RELATIVE ERROR = {err.max():.5f}%")

    if debug:
        print("evals: ", evals)
        print("true:  ", true)

    # Plot
    plt.style.use('dark_background')
    plt.figure(figsize=(16, 9))
    x = np.arange(1, target+1)
    plt.scatter(x, evals, c='#0ff', s=12, label='model')
    plt.plot(x, true, c='#f55', lw=3, label='Riemann zeros')
    plt.title(f"Prime-curvature vs Riemann zeros — N={N:,} — mean error {err.mean():.4f}%",
              color='white', fontsize=18)
    plt.xlabel("Zero number", color='white')
    plt.ylabel("Im(t)", color='white')
    plt.grid(alpha=0.2)
    plt.legend()
    plt.tight_layout()

    outfile = f"rhz_N{N}_Z{target}.png"
    plt.savefig(outfile, dpi=400, facecolor='black')
    print(f"\nPlot saved as → {outfile}")

if __name__ == "__main__":
    main()
