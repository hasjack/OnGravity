#!/usr/bin/env python3
"""
Prime–curvature Hamiltonian experiment (single script, no sympy/mpmath).

Pipeline
--------
1. Generate first NUM_PRIMES primes via a sieve.
2. Compute curvature field k_n on those primes using your original formula.
3. Build two Hamiltonians:
   (a) Index-grid: coordinate i = 0,1,... with uniform spacing.
   (b) Log-prime-grid: coordinate t_n = log p_n, non-uniform symmetric Laplacian.
4. Compute lowest NUM_LEVELS eigenvalues for each Hamiltonian.
5. Compare to first 20 non-trivial Riemann zeros via an affine fit:
       zero ≈ a * eig + b
   and report mean / max relative errors.
6. Save a bunch of diagnostic plots.

You can tweak NUM_PRIMES, BETA, etc. at the top.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh


# ---------------------------------------------------------------------
# 0. Parameters & reference data
# ---------------------------------------------------------------------

NUM_PRIMES   = 20_000      # how many primes to use in curvature field
WINDOW_RADIUS = 20        # curvature window: [p-20, p+20]
CURVATURE_C   = 0.150     # original curvature constant c
BETA          = 50.0      # potential scale: V = BETA * k_n
NUM_LEVELS    = 40        # how many eigenvalues to compute
MAX_ZERO_USED = 20        # how many Riemann zeros to compare

# First 20 imaginary parts of non-trivial Riemann zeros
RIEMANN_ZEROS_20 = np.array([
    14.13472514, 21.02203964, 25.01085758, 30.42487613, 32.93506159,
    37.58617816, 40.91871901, 43.32707328, 48.00515088, 49.77383248,
    52.97032148, 56.44624770, 59.34704400, 60.83177852, 65.11254405,
    67.07981053, 69.54640171, 72.06715767, 75.70469070, 77.14484007,
])


# ---------------------------------------------------------------------
# 1. Prime generation
# ---------------------------------------------------------------------

def approx_nth_prime(n: int) -> int:
    """Crude upper bound for the n-th prime (Dusart-style)."""
    if n < 6:
        return 15
    x = n * (np.log(n) + np.log(np.log(n)))
    return int(x + 10)


def generate_primes(num_primes: int) -> np.ndarray:
    """
    Generate at least num_primes primes via sieve, then truncate.

    Returns
    -------
    primes : np.ndarray
        First num_primes primes as a 1D array.
    """
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
        # if we somehow undershoot, bump the limit and try again
        limit = int(limit * 1.5)


# ---------------------------------------------------------------------
# 2. Original curvature field k_n on primes
# ---------------------------------------------------------------------

def compute_curvature_field(primes: np.ndarray,
                            window_radius: int = WINDOW_RADIUS,
                            c: float = CURVATURE_C):
    """
    Reproduce the original κ-field:

        - build a composite mask up to max(primes) + window_radius
        - for each prime p, look at composites in [p - R, p + R]
        - rho = composite fraction in window
        - sigma = log(1 + rho log p)
        - k_n = c * sigma^3 * sqrt(rho)

    Parameters
    ----------
    primes : np.ndarray
        1D array of primes.
    window_radius : int
        Half-width of the compositeness window.
    c : float
        Curvature constant.

    Returns
    -------
    p_used : np.ndarray
        Primes for which k_n was computed (edge-trimmed).
    k_vals : np.ndarray
        Curvature values k_n.
    """
    max_n = int(primes[-1]) + window_radius + 5

    # sieve up to max_n
    is_prime = np.ones(max_n + 1, dtype=bool)
    is_prime[:2] = False
    for p in range(2, int(np.sqrt(max_n)) + 1):
        if is_prime[p]:
            is_prime[p * p:max_n + 1:p] = False

    is_composite = ~is_prime
    is_composite[0:2] = False

    k_vals = []
    p_used = []

    for p in primes:
        lo = p - window_radius
        hi = p + window_radius
        if lo < 2 or hi > max_n:
            continue

        window = is_composite[lo:hi + 1]
        rho = window.sum() / window.size
        sigma = np.log(1.0 + rho * np.log(p))
        k_n = c * (sigma ** 3) * np.sqrt(rho)

        k_vals.append(k_n)
        p_used.append(p)

    return np.array(p_used, dtype=float), np.array(k_vals, dtype=float)


# ---------------------------------------------------------------------
# 3. Laplacians & Hamiltonians
# ---------------------------------------------------------------------

def build_laplacian_index(n_points: int):
    """
    Uniform grid Laplacian on indices i = 0..N-1 with spacing h = 1.

    This is the usual tri-diagonal:
        L = -d^2/dx^2  ~  2 on diagonal, -1 on sub/super.

    Returns main, off arrays (for tri-diagonal construction).
    """
    main = 2.0 * np.ones(n_points)
    off = -1.0 * np.ones(n_points - 1)

    # weak Dirichlet-ish clamp at ends (big mass on endpoints)
    main[0] = main[-1] = 1e6
    return main, off


def build_laplacian_log(t: np.ndarray):
    """
    Symmetric Laplacian on non-uniform grid t[0..N-1].

    Constructed from the quadratic form
        Q(ψ) = sum_i (ψ_{i+1} - ψ_i)^2 / h_i,   h_i = t_{i+1} - t_i
    which corresponds to ∫ |ψ'(t)|^2 dt.

    This yields a symmetric tri-diagonal matrix L with:
        L_ii   = 1/h_{i-1} + 1/h_i   (for interior i)
        L_i,i-1 = L_{i-1,i} = -1/h_{i-1}
        L_i,i+1 = L_{i+1,i} = -1/h_i

    We then add a big clamp on the endpoints.
    """
    N = len(t)
    h = np.diff(t)  # length N-1

    main = np.zeros(N)
    off = np.zeros(N - 1)

    # interior points
    for i in range(1, N - 1):
        h_im1 = h[i - 1]
        h_i = h[i]
        main[i] = (1.0 / h_im1) + (1.0 / h_i)

    # off-diagonal entries: symmetric
    off[:] = -1.0 / h

    # endpoint clamp
    main[0] = main[-1] = 1e6

    return main, off


def build_hamiltonian(main_lap: np.ndarray,
                      off_lap: np.ndarray,
                      potential: np.ndarray):
    """
    Build sparse Hamiltonian H = L + V, with L tri-diagonal from (main_lap, off_lap)
    and V diagonal from 'potential'.
    """
    main = main_lap + potential
    H = diags([off_lap, main, off_lap], offsets=[-1, 0, 1], format='csc')
    return H


def lowest_eigenvalues(H, k: int) -> np.ndarray:
    """
    Compute k lowest eigenvalues of H via ARPACK.

    Returns sorted eigenvalues as 1D array.
    """
    k = min(k, H.shape[0] - 2)
    vals = eigsh(H, k=k, which="SM", return_eigenvectors=False)
    return np.sort(vals)


# ---------------------------------------------------------------------
# 4. Fitting & diagnostics
# ---------------------------------------------------------------------

def fit_affine(eigs: np.ndarray,
               zeros: np.ndarray,
               fit_n: int):
    """
    Fit a linear mapping zero ≈ a * eig + b using first fit_n levels.

    Returns (a, b).
    """
    x = eigs[:fit_n]
    y = zeros[:fit_n]
    a, b = np.polyfit(x, y, 1)
    return a, b


def evaluate_fit(eigs: np.ndarray,
                 zeros: np.ndarray,
                 a: float,
                 b: float,
                 eval_n: int):
    """
    Apply mapping z_hat = a*eig + b to first eval_n levels and compute
    relative error statistics.

    Returns (mean_err, max_err, z_hat[0:eval_n]).
    """
    eval_n = min(eval_n, len(eigs), len(zeros))
    z_hat = a * eigs[:eval_n] + b
    rel_err = np.abs((z_hat - zeros[:eval_n]) / zeros[:eval_n]) * 100.0
    return rel_err.mean(), rel_err.max(), z_hat


def plot_mapped(eigs: np.ndarray,
                zeros: np.ndarray,
                z_hat: np.ndarray,
                eval_n: int,
                title: str,
                filename: str):
    """Scatter of mapped eigenvalues vs zeros (first eval_n)."""
    idx = np.arange(1, eval_n + 1)

    plt.figure(figsize=(10, 4))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, z_hat[:eval_n], color="cyan", label="mapped eigenvalues")
    plt.xlabel("index")
    plt.ylabel("value")
    plt.title(title)
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_raw(eigs: np.ndarray,
             zeros: np.ndarray,
             eval_n: int,
             title: str,
             filename: str):
    """Raw eigenvalues vs zeros (no mapping) for first eval_n."""
    idx = np.arange(1, eval_n + 1)

    plt.figure(figsize=(10, 4))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, eigs[:eval_n], color="cyan", label="eigenvalues (raw)")
    plt.xlabel("index")
    plt.ylabel("value")
    plt.title(title)
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_curvature_field(primes_used: np.ndarray,
                         k_vals: np.ndarray,
                         filename: str):
    """Log-log scatter of k_n vs prime n."""
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


# ---------------------------------------------------------------------
# 5. Main experiment
# ---------------------------------------------------------------------

def run_model(grid: str,
              primes_used: np.ndarray,
              k_vals: np.ndarray,
              zeros: np.ndarray,
              beta: float,
              num_levels: int):
    """
    Run the Hamiltonian experiment for a given grid type:

        grid = "index"  -> uniform index spacing
        grid = "log"    -> t = log prime

    and print / plot results.
    """
    print(f"\n=== {grid.upper()}-GRID HAMILTONIAN ===")

    N = len(k_vals)
    if N < num_levels + 2:
        raise ValueError("Not enough curvature points for requested num_levels.")

    if grid == "index":
        # coordinate is just index 0..N-1
        main_L, off_L = build_laplacian_index(N)
    elif grid == "log":
        # use log of the corresponding primes
        t = np.log(primes_used)
        main_L, off_L = build_laplacian_log(t)
    else:
        raise ValueError("grid must be 'index' or 'log'")

    V = beta * k_vals
    H = build_hamiltonian(main_L, off_L, V)
    eigs = lowest_eigenvalues(H, num_levels)

    print(f"  lowest {num_levels} eigenvalues (first few): {eigs[:5]}")

    # three scenarios: (fit10/eval10), (fit20/eval20), (fit10/eval20)
    scenarios = [
        (10, 10, "fit10_eval10"),
        (20, 20, "fit20_eval20"),
        (10, 20, "fit10_eval20_OOS"),
    ]

    for fit_n, eval_n, label in scenarios:
        if eval_n > len(zeros):
            continue

        a, b = fit_affine(eigs, zeros, min(fit_n, len(zeros)))
        mean_err, max_err, z_hat = evaluate_fit(eigs, zeros, a, b, eval_n)

        print(f"\n[{label}]")
        print(f"  fitted on first {fit_n} levels, evaluated on first {eval_n}")
        print(f"  best-fit: zero ≈ {a:.4f}·eig + {b:.4f}")
        print(f"  mean relative error: {mean_err:.3f}%")
        print(f"  max  relative error: {max_err:.3f}%")

        plot_mapped(
            eigs, zeros, z_hat, eval_n,
            title=f"Eigenvalues vs Riemann zeros ({grid} grid, {label})",
            filename=f"eigs_vs_zeros_{grid}_{label}.png",
        )

        if label == "fit10_eval20_OOS":
            # also raw plot for context
            plot_raw(
                eigs, zeros, eval_n,
                title=f"Eigenvalues vs zeros (raw, {grid} grid)",
                filename=f"eigs_vs_zeros_{grid}_raw.png",
            )


def main():
    print("RUNNING PRIME-CURVATURE HAMILTONIAN (unified script)")
    print(f"  num_primes = {NUM_PRIMES}, beta = {BETA}, levels = {NUM_LEVELS}")

    print("\nGenerating primes...")
    primes = generate_primes(NUM_PRIMES)
    print(f"  got {len(primes)} primes up to {primes[-1]}")

    print("Computing curvature field k_n...")
    p_used, k_vals = compute_curvature_field(primes)
    print(f"  curvature points: {len(k_vals)} (after edge trimming)")

    # curvature field plot
    plot_curvature_field(p_used, k_vals, "k_field_loglog.png")
    print("  saved curvature plot: k_field_loglog.png")

    zeros = RIEMANN_ZEROS_20.copy()

    # index-grid Hamiltonian
    run_model("index", p_used, k_vals, zeros, beta=BETA, num_levels=NUM_LEVELS)

    # log-prime-grid Hamiltonian
    run_model("log", p_used, k_vals, zeros, beta=BETA, num_levels=NUM_LEVELS)

    print("\nDone. Plots written to current directory.")


if __name__ == "__main__":
    main()
