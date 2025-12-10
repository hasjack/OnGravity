#!/usr/bin/env python3
"""
Prime–curvature Hamiltonian (INDEX GRID ONLY)

1. Generate first NUM_PRIMES primes via sieve.
2. Compute curvature field k_n using the original window/composite formula.
3. Build an index–grid Hamiltonian H = L + V with
       L  ~  discrete -d²/dx² on i = 0,…,N-1
       V_i = BETA * k_i
4. Compute lowest NUM_LEVELS eigenvalues.
5. Fit an affine map   zero ≈ a * eig + b
   on some initial levels, and evaluate on a chosen prefix.
6. Plot raw eigenvalues vs zeros and mapped eigenvalues vs zeros.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh

# ---------------------------------------------------------------------
# 0. Parameters & reference data
# ---------------------------------------------------------------------

NUM_PRIMES    = 20_000   # primes used to build curvature
WINDOW_RADIUS = 20       # [p-R, p+R] compositeness window
CURVATURE_C   = 0.150    # original c in k_n formula
BETA          = 50.0     # potential scale: V = BETA * k_n
NUM_LEVELS    = 40       # how many eigenvalues to compute

# Which (fit_n, eval_n, label) scenarios to run
SCENARIOS = [
    #(10, 10, "fit10_eval10"),
    #(20, 20, "fit20_eval20"),
    (40, 40, "fit40_eval40"),        # in-sample 20, eval 40
    #(20, 40, "fit20_eval40_OOS"),    # same numbers, just tagged as OOS
]

# First 50 imaginary parts of non-trivial Riemann zeros
RIEMANN_ZEROS_50 = np.array([
    14.13472514, 21.02203964, 25.01085758, 30.42487613, 32.93506159,
    37.58617816, 40.91871901, 43.32707328, 48.00515088, 49.77383248,
    52.97032148, 56.44624770, 59.34704400, 60.83177852, 65.11254405,
    67.07981053, 69.54640171, 72.06715767, 75.70469070, 77.14484007,
    79.33737502, 82.91038085, 84.73549298, 87.42527461, 88.80911121,
    92.49189927, 94.65134404, 95.87063423, 98.83119422, 101.31785101,
    103.72553804, 105.44662305, 107.16861118, 111.02953554, 111.87465918,
    114.32022092, 116.22668032, 118.79078287, 121.37012500, 122.94682929,
    124.25681855, 127.51668388, 129.57870420, 131.08768853, 133.49773720,
    134.75650975, 138.11604205, 139.73620895, 141.12370740, 143.11184581,
])

# ---------------------------------------------------------------------
# 1. Prime generation
# ---------------------------------------------------------------------

def approx_nth_prime(n: int) -> int:
    """Crude upper bound for the n-th prime (fine for sieving)."""
    if n < 6:
        return 15
    x = n * (np.log(n) + np.log(np.log(n)))
    return int(x + 10)


def generate_primes(num_primes: int) -> np.ndarray:
    """Return first num_primes primes as a NumPy array."""
    limit = approx_nth_prime(num_primes)
    while True:
        is_prime = np.ones(limit + 1, dtype=bool)
        is_prime[:2] = False
        for p in range(2, int(np.sqrt(limit)) + 1):
            if is_prime[p]:
                is_prime[p * p:limit + 1:p] = False
        primes = np.nonzero(is_prime)[0]
        if len(primes) >= num_primes:
            return primes[:num_primes]
        limit = int(limit * 1.5)  # bump and retry if we undershoot


# ---------------------------------------------------------------------
# 2. Original curvature field k_n on primes
# ---------------------------------------------------------------------

def compute_curvature_field(primes: np.ndarray,
                            window_radius: int = WINDOW_RADIUS,
                            c: float = CURVATURE_C):
    """
    Original κ-field:

        - Build composite mask up to max(primes)+R.
        - For each prime p, consider [p-R, p+R].
        - rho   = composite fraction in window
        - sigma = log(1 + rho log p)
        - k_n   = c * sigma^3 * sqrt(rho)

    Returns (p_used, k_vals).
    """
    max_n = int(primes[-1]) + window_radius + 5

    is_prime = np.ones(max_n + 1, dtype=bool)
    is_prime[:2] = False
    for p in range(2, int(np.sqrt(max_n)) + 1):
        if is_prime[p]:
            is_prime[p * p:max_n + 1:p] = False

    is_composite = ~is_prime
    is_composite[0:2] = False

    p_used = []
    k_vals = []

    for p in primes:
        lo = p - window_radius
        hi = p + window_radius
        if lo < 2 or hi > max_n:
            continue

        window = is_composite[lo:hi + 1]
        rho = window.sum() / window.size
        sigma = np.log(1.0 + rho * np.log(p))
        k_n = c * (sigma ** 3) * np.sqrt(rho)

        p_used.append(p)
        k_vals.append(k_n)

    return np.array(p_used, float), np.array(k_vals, float)


# ---------------------------------------------------------------------
# 3. Index-grid Laplacian & Hamiltonian
# ---------------------------------------------------------------------

def build_laplacian_index(n_points: int):
    """
    Uniform grid Laplacian on indices i = 0..N-1, spacing h = 1:

        L ≈ -d²/dx²  ~  2 on diagonal, -1 on sub/super.

    Endpoints clamped with a large diagonal value.
    """
    main = 2.0 * np.ones(n_points)
    off = -1.0 * np.ones(n_points - 1)
    main[0] = main[-1] = 1e6
    return main, off


def build_hamiltonian(main_lap: np.ndarray,
                      off_lap: np.ndarray,
                      potential: np.ndarray):
    """H = L + V, tri-diagonal sparse matrix."""
    main = main_lap + potential
    return diags([off_lap, main, off_lap], offsets=[-1, 0, 1], format="csc")


def lowest_eigenvalues(H, k: int) -> np.ndarray:
    """Return k smallest eigenvalues of H (sorted)."""
    k = min(k, H.shape[0] - 2)
    vals = eigsh(H, k=k, which="SM", return_eigenvectors=False)
    return np.sort(vals)


# ---------------------------------------------------------------------
# 4. Fitting & plotting helpers
# ---------------------------------------------------------------------

def fit_affine(eigs: np.ndarray,
               zeros: np.ndarray,
               fit_n: int):
    """Fit zero ≈ a * eig + b on first fit_n levels."""
    x = eigs[:fit_n]
    y = zeros[:fit_n]
    a, b = np.polyfit(x, y, 1)
    return a, b


def evaluate_fit(eigs: np.ndarray,
                 zeros: np.ndarray,
                 a: float,
                 b: float,
                 eval_n: int):
    """Apply fit and compute relative error stats on first eval_n levels."""
    eval_n = min(eval_n, len(eigs), len(zeros))
    z_hat = a * eigs[:eval_n] + b
    rel_err = np.abs((z_hat - zeros[:eval_n]) / zeros[:eval_n]) * 100.0
    return rel_err.mean(), rel_err.max(), z_hat


def plot_curvature_field(primes_used: np.ndarray,
                         k_vals: np.ndarray,
                         filename: str):
    plt.figure(figsize=(8, 4.5))
    plt.scatter(primes_used, k_vals, s=3, alpha=0.7)
    plt.xscale("log")
    plt.yscale("log")
    plt.xlabel("prime n")
    plt.ylabel("k_n")
    plt.title("Prime Curvature Field k_n (log-log)")
    plt.grid(True, which="both", ls=":", alpha=0.4)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_raw(eigs, zeros, eval_n, filename):
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 4))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, eigs[:eval_n], color="cyan", label="eigenvalues (raw)")
    plt.xlabel("index")
    plt.ylabel("value")
    plt.title("Eigenvalues vs zeros (raw, index grid)")
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_mapped(zeros, z_hat, eval_n, label, filename):
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 4))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, z_hat[:eval_n], color="cyan", label="mapped eigenvalues")
    plt.xlabel("index")
    plt.ylabel("value")
    plt.title(f"Eigenvalues vs Riemann zeros (index grid, {label})")
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


# ---------------------------------------------------------------------
# 5. Main experiment
# ---------------------------------------------------------------------

def main():
    print("RUNNING PRIME-CURVATURE INDEX-GRID HAMILTONIAN")
    print(f"  num_primes = {NUM_PRIMES}, beta = {BETA}, levels = {NUM_LEVELS}")

    print("\nGenerating primes...")
    primes = generate_primes(NUM_PRIMES)
    print(f"  got {len(primes)} primes up to {primes[-1]}")

    print("Computing curvature field k_n...")
    p_used, k_vals = compute_curvature_field(primes)
    print(f"  curvature points: {len(k_vals)} (after edge trimming)")

    plot_curvature_field(p_used, k_vals, "k_field_loglog.png")
    print("  saved curvature plot: k_field_loglog.png")

    zeros = RIEMANN_ZEROS_50
    N = len(k_vals)
    if N < NUM_LEVELS + 2:
        raise ValueError("Not enough curvature points for requested NUM_LEVELS")

    main_L, off_L = build_laplacian_index(N)
    V = BETA * k_vals
    H = build_hamiltonian(main_L, off_L, V)
    eigs = lowest_eigenvalues(H, NUM_LEVELS)

    print("\nINDEX-GRID HAMILTONIAN")
    print(f"  lowest {NUM_LEVELS} eigenvalues (first few): {eigs[:5]}")

    # raw plot up to the largest eval_n we’ll use
    max_eval = max(e for _, e, _ in SCENARIOS if e <= len(zeros))
    plot_raw(eigs, zeros, max_eval, "eigs_vs_zeros_index_raw.png")

    for fit_n, eval_n, label in SCENARIOS:
        if eval_n > len(zeros):
            continue

        fit_n_eff = min(fit_n, len(zeros))
        a, b = fit_affine(eigs, zeros, fit_n_eff)
        mean_err, max_err, z_hat = evaluate_fit(eigs, zeros, a, b, eval_n)

        print(f"\n[{label}]")
        print(f"  fitted on first {fit_n_eff} levels, evaluated on first {eval_n}")
        print(f"  best-fit: zero ≈ {a:.4f}·eig + {b:.4f}")
        print(f"  mean relative error: {mean_err:.3f}%")
        print(f"  max  relative error: {max_err:.3f}%")

        fname = f"eigs_vs_zeros_index_{label}.png"
        plot_mapped(zeros, z_hat, eval_n, label, fname)

    print("\nDone. Plots written to current directory.")


if __name__ == "__main__":
    main()
