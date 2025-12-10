#!/usr/bin/env python3
"""
Prime–curvature Hamiltonian (INDEX GRID ONLY)

Pipeline
--------
1. Generate first NUM_PRIMES primes via sieve.
2. Compute curvature field k_n using the original window/composite formula.
3. Optionally downsample / smooth k_n.
4. Build an index–grid Hamiltonian H = L + V with
       L  ~  discrete -d²/dx² on i = 0,…,N-1
       V_i = BETA * k_i        (or exp(alpha * k_i) if EXPONENTIAL_POTENTIAL)
5. Compute lowest NUM_LEVELS eigenvalues.
6. Fit one or more models:
       affine   : gamma_n ≈ a * lambda_n + b
       log_n    : gamma_n ≈ a * lambda_n + c * log(n) + b
   on some initial levels, and evaluate on a chosen prefix.
7. Plot raw eigenvalues vs zeros and mapped eigenvalues vs zeros.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh

# ---------------------------------------------------------------------
# 0. Parameters & reference data
# ---------------------------------------------------------------------

NUM_PRIMES    = 20_000    # primes used to build curvature
WINDOW_RADIUS = 20        # [p-R, p+R] compositeness window
CURVATURE_C   = 0.150     # original c in k_n formula

BETA          = 50.0      # linear potential scale: V = BETA * k_n
NUM_LEVELS    = 40        # how many eigenvalues to compute

CURVATURE_DOWNSAMPLE = 1  # keep every k-th curvature point (1 = no downsample)
SMOOTHING_WINDOW      = 0 # 0 = no smoothing, else moving-average window size

EXPONENTIAL_POTENTIAL = False  # if True: V_i = exp(alpha * k_i) instead of BETA*k_i
ALPHA_EXP             = 0.1    # exponent scale if EXPONENTIAL_POTENTIAL

# SCENARIOS: (label, model, fit_n, eval_n)
#   model in {"affine", "log_n"}
SCENARIOS = [
    ("affine_fit_20_20", "affine", 20, 20),
   # ("log_fit_20_20", "log_n", 20, 20),
   # ("log_lambda_fit_20_20", "log_lambda", 20, 20),
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

    if SMOOTHING_WINDOW > 0:
        k_vals = np.convolve(k_vals, np.ones(SMOOTHING_WINDOW)/SMOOTHING_WINDOW, mode='same')

    return np.array(p_used, float), np.array(k_vals, float)


def maybe_downsample(p: np.ndarray,
                     k: np.ndarray,
                     factor: int):
    """Keep every 'factor'-th point (factor=1 => no downsample)."""
    if factor <= 1:
        return p, k
    return p[::factor], k[::factor]


def maybe_smooth(k: np.ndarray, window: int):
    """Optional moving-average smoothing of k_n."""
    if window <= 1:
        return k
    w = window
    if w > len(k):
        return k
    kernel = np.ones(w) / w
    # "same" mode to preserve length; edges get a slightly different effective window
    return np.convolve(k, kernel, mode="same")


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

def fit_affine(lam: np.ndarray, zeros: np.ndarray, fit_n: int):
    """Fit gamma ≈ a * lambda + b on first fit_n levels."""
    fit_n = min(fit_n, len(lam), len(zeros))
    x = lam[:fit_n]
    y = zeros[:fit_n]
    a, b = np.polyfit(x, y, 1)
    return a, b


def fit_log_n(lam: np.ndarray, zeros: np.ndarray, fit_n: int):
    """
    Fit gamma_n ≈ a * lambda_n + c * log(n) + b on the first fit_n levels.

    Returns (a, c, b).
    """
    fit_n = min(fit_n, len(lam), len(zeros))
    n_idx = np.arange(1, fit_n + 1, dtype=float)
    

    X = np.column_stack([
        lam[:fit_n],      # column for a
        np.log(n_idx),    # column for c
        np.ones(fit_n),   # column for b
    ])
    params, *_ = np.linalg.lstsq(X, zeros[:fit_n], rcond=None)
    a, c, b = params
    return a, c, b

def fit_log_lambda(lam: np.ndarray, zeros: np.ndarray, fit_n: int):
    """
    Fit gamma_n ≈ a * lambda_n + c * log(lambda_n) + b
    on the first fit_n levels.
    """
    fit_n = min(fit_n, len(lam), len(zeros))
    lam_f = lam[:fit_n]
    X = np.column_stack([
        lam_f,               # a · λ
        np.log(lam_f),       # c · log λ
        np.ones(fit_n),      # b
    ])
    params, *_ = np.linalg.lstsq(X, zeros[:fit_n], rcond=None)
    a, c, b = params
    return a, c, b


def evaluate_model(model: str,
                   lam: np.ndarray,
                   zeros: np.ndarray,
                   params,
                   eval_n: int):
    """
    Evaluate a fitted model on the first eval_n levels.

    Returns (mean_err, max_err, z_hat).
    """
    eval_n = min(eval_n, len(lam), len(zeros))
    n_idx = np.arange(1, eval_n + 1, dtype=float)

    if model == "affine":
        a, b = params
        z_hat = a * lam[:eval_n] + b
    elif model == "log_n":
        a, c, b = params
        z_hat = a * lam[:eval_n] + c * np.log(n_idx) + b
    elif model == "log_lambda":
        a, c, b = params
        lam_f = lam[:eval_n]
        z_hat = a * lam_f + c * np.log(lam_f) + b
    else:
        raise ValueError(f"Unknown model '{model}'")

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
    eval_n = min(eval_n, len(eigs), len(zeros))
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 3.5))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, eigs[:eval_n], color="cyan", label="eigenvalues")
    plt.xlabel("index")
    plt.ylabel("value")
    plt.title("Raw eigenvalues vs Riemann zeros")
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_mapped(zeros, z_hat, eval_n, label, filename):
    eval_n = min(eval_n, len(zeros), len(z_hat))
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 3.5))
    plt.plot(idx, zeros[:eval_n], "r-", label="zeros")
    plt.scatter(idx, z_hat[:eval_n], color="cyan", label="mapped eigs")
    plt.xlabel("index")
    plt.ylabel("value")
    plt.title(f"Eigenvalues vs Riemann zeros ({label})")
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()

def plot_residuals(zeros, z_hat, eval_n, label, filename):
    eval_n = min(eval_n, len(zeros), len(z_hat))
    idx = np.arange(1, eval_n + 1)
    residuals = z_hat[:eval_n] - zeros[:eval_n]

    plt.figure(figsize=(10, 3.5))
    plt.axhline(0, color="black", lw=1)
    plt.plot(idx, residuals, "o-", color="purple")
    plt.xlabel("index n")
    plt.ylabel("residual (mapped_eig - zero)")
    plt.title(f"Residuals ({label})")
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()

def sweep_prime_counts(prime_counts, beta=50.0, fit_n=20, eval_n=20):
    """
    For each N_primes, recompute:
        - curvature field
        - Hamiltonian
        - eigenvalues
        - affine fit error

    Returns arrays of mean errors.
    """
    means = []
    maxes = []

    for Np in prime_counts:
        print(f"[sweep] N_primes = {Np}")

        primes = generate_primes(Np)
        p_used, k_vals = compute_curvature_field(primes)
        k_vals = maybe_smooth(k_vals, SMOOTHING_WINDOW)

        # Hamiltonian
        zeros = RIEMANN_ZEROS_50
        main_L, off_L = build_laplacian_index(len(k_vals))
        V = beta * k_vals
        H = build_hamiltonian(main_L, off_L, V)
        eigs = lowest_eigenvalues(H, NUM_LEVELS)

        # Fit
        a, b = fit_affine(eigs, zeros, fit_n)
        mean_err, max_err, _ = evaluate_model("affine", eigs, zeros, (a, b), eval_n)

        means.append(mean_err)
        maxes.append(max_err)

    return np.array(means), np.array(maxes)


def plot_prime_stability(prime_counts, mean_errs, max_errs, filename):
    plt.figure(figsize=(8,4))
    plt.plot(prime_counts, mean_errs, "o-", label="mean error")
    plt.plot(prime_counts, max_errs, "o--", label="max error")
    plt.xscale("log")
    plt.xlabel("number of primes")
    plt.ylabel("relative error (%)")
    plt.title("Stability of affine fit vs number of primes")
    plt.grid(True, ls=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()

def sweep_beta_values(betas, num_primes=20000, fit_n=20, eval_n=20):
    means = []
    maxes = []

    primes = generate_primes(num_primes)
    p_used, k_vals = compute_curvature_field(primes)
    k_vals = maybe_smooth(k_vals, SMOOTHING_WINDOW)
    zeros = RIEMANN_ZEROS_50

    for beta in betas:
        print(f"[sweep] beta = {beta}")

        main_L, off_L = build_laplacian_index(len(k_vals))
        V = beta * k_vals
        H = build_hamiltonian(main_L, off_L, V)
        eigs = lowest_eigenvalues(H, NUM_LEVELS)

        a, b = fit_affine(eigs, zeros, fit_n)
        mean_err, max_err, _ = evaluate_model("affine", eigs, zeros, (a, b), eval_n)

        means.append(mean_err)
        maxes.append(max_err)

    return np.array(means), np.array(maxes)

def plot_beta_stability(betas, mean_errs, max_errs, filename):
    plt.figure(figsize=(8,4))
    plt.plot(betas, mean_errs, "o-", label="mean error")
    plt.plot(betas, max_errs, "o--", label="max error")
    plt.xlabel("beta")
    plt.ylabel("relative error (%)")
    plt.title("Stability of affine fit vs β parameter")
    plt.grid(True, ls=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


# ---------------------------------------------------------------------
# 5. Main experiment
# ---------------------------------------------------------------------

def main():
    print("RUNNING PRIME-CURVATURE INDEX-GRID HAMILTONIAN")
    print(f"  num_primes={NUM_PRIMES}, beta={BETA}, levels={NUM_LEVELS}")
    print(f"  curvature downsample factor = {CURVATURE_DOWNSAMPLE}")
    print(f"  smoothing window = {SMOOTHING_WINDOW}")
    print(f"  exponential potential = {EXPONENTIAL_POTENTIAL} (alpha={ALPHA_EXP})\n")

    # Primes and curvature
    print("Generating primes...")
    primes = generate_primes(NUM_PRIMES)
    print(f"  primes up to {primes[-1]} generated")

    print("Computing curvature field k_n...")
    p_used, k_vals = compute_curvature_field(primes)
    print(f"  curvature points (before downsampling): {len(k_vals)}")

    p_used, k_vals = maybe_downsample(p_used, k_vals, CURVATURE_DOWNSAMPLE)
    print(f"  curvature points (after downsampling): {len(k_vals)}")

    k_vals = maybe_smooth(k_vals, SMOOTHING_WINDOW)

    plot_curvature_field(p_used, k_vals, "k_field_loglog.png")
    print("  saved curvature plot: k_field_loglog.png")

    # Hamiltonian
    zeros = RIEMANN_ZEROS_50
    N = len(k_vals)
    if N < NUM_LEVELS + 2:
        raise ValueError("Not enough curvature points for requested NUM_LEVELS")

    main_L, off_L = build_laplacian_index(N)

    if EXPONENTIAL_POTENTIAL:
        V = np.exp(ALPHA_EXP * k_vals)
    else:
        V = BETA * k_vals

    H = build_hamiltonian(main_L, off_L, V)
    eigs = lowest_eigenvalues(H, NUM_LEVELS)

    print("\nINDEX-GRID HAMILTONIAN")
    print(f"  lowest eigenvalues (first 5): {eigs[:5]}")
    plot_raw(eigs, zeros, eval_n=40, filename="eigs_vs_zeros_raw.png")
    print("  saved raw comparison plot: eigs_vs_zeros_raw.png")

    # Fits
    for label, model, fit_n, eval_n in SCENARIOS:
        print(f"\n[{label}] ({model})")

        if model == "affine":
            params = fit_affine(eigs, zeros, fit_n)
            a, b = params
            print(f"  best-fit: gamma ≈ {a:.4f}·lambda + {b:.4f}")
        elif model == "log_n":
            params = fit_log_n(eigs, zeros, fit_n)
            a, c, b = params
        elif model == "log_lambda":
            a, c, b = params
            print(
                "  best-fit: gamma_n ≈ "
                f"{a:.4f}·lambda_n + {c:.4f}·log(lambda_n) + {b:.4f}"
            )
        else:
            raise ValueError(f"Unknown model '{model}' in SCENARIOS")

        mean_err, max_err, z_hat = evaluate_model(
            model, eigs, zeros, params, eval_n
        )
        print(f"  fitted on first {min(fit_n, len(eigs), len(zeros))} levels,"
              f" evaluated on first {min(eval_n, len(eigs), len(zeros))}")
        print(f"  mean relative error: {mean_err:.3f}%")
        print(f"  max  relative error: {max_err:.3f}%")

        fname = f"eigs_vs_zeros_{label}.png"
        plot_mapped(zeros, z_hat, eval_n, label, fname)
        print(f"  saved plot: {fname}")

        plot_residuals(zeros, z_hat, eval_n, label, f"residuals_{label}.png")
        print(f"  saved residual plot: residuals_{label}.png")

        prime_counts = [2000, 5000, 10000, 20000, 50000]
        mean_errs, max_errs = sweep_prime_counts(prime_counts)
        plot_prime_stability(prime_counts, mean_errs, max_errs, "stability_vs_primes.png")
        print("Saved: stability_vs_primes.png")

        betas = [10, 20, 30, 40, 50, 60, 80, 100]
        mean_errs, max_errs = sweep_beta_values(betas)
        plot_beta_stability(betas, mean_errs, max_errs, "stability_vs_beta.png")
        print("Saved: stability_vs_beta.png")

    print("\nDone. Plots written to current directory.")


if __name__ == "__main__":
    main()
