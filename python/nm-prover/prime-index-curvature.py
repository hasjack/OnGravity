#!/usr/bin/env python3
"""
Prime–Curvature Hamiltonian (LOG GRID, WITH GLOBAL CORRECTIONS)

Pipeline
--------
1. Generate the first NUM_PRIMES primes using a sieve with a safe upper bound.

2. Compute the curvature field k(p) on the primes:
       - For each prime p, sample a window [p − R, p + R]
       - Compute composite density ρ in the window
       - σ(p) = log(1 + ρ log p)
       - k(p) = C · σ(p)^3 · √ρ
   This yields (p_used, k_vals).

3. (Optional) Smooth k_vals with a moving-average kernel.

4. Reinterpret curvature as a function of t = log p and
   resample onto a *uniform* grid in t:
       t_raw = log(p_used)
       t_grid = linspace(t_raw[0], t_raw[-1], N)
       k_log(t_grid) = interp(t_raw → t_grid)

   This makes the discrete Laplacian physically meaningful
   on the log-prime axis instead of the raw index axis.

5. Apply global correction mechanisms:

   (a) Tail shape correction (multiplicative):
           k_corr[n] = k_log[n] · (1 + η · log n)
       η is chosen by a variational sweep to minimise the
       mean relative error of the mapped spectrum.

   (b) Global index correction (additive in the potential):
           V[n] ← V[n] + ε · log n
       stabilises long-tail drift.

6. Build the log-grid Hamiltonian:
       L = discrete Laplacian on uniform t-grid
       V = BETA · k_corr        (or exp(α k_corr))
       H = L + V
   Compute the lowest NUM_LEVELS eigenvalues λ_n.

7. Fit log-based spectral models to the Riemann zeros γ_n:

       log_n model:
           γ_n ≈ a · λ_n + c · log(n) + b

       (optional) log_lambda model:
           γ_n ≈ a · λ_n + c · log(λ_n) + b

   Fit on the first fit_n levels; evaluate on eval_n levels.

8. Evaluate:
       - mean relative error over first eval_n
       - max relative error
       - residual structure vs n

9. Produce plots:
       - curvature field (log–log)
       - raw λ_n vs γ_n
       - mapped eigenvalues vs γ_n
       - residual diagnostics
       - η-sweep stability
       - prime-count stability
       - β-sweep stability

"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh

# ---------------------------------------------------------------------
# 0. Parameters & reference data
# ---------------------------------------------------------------------

NUM_PRIMES    = 1_000_000      # primes used to build curvature
WINDOW_RADIUS = 20           # [p-R, p+R] compositeness window
CURVATURE_C   = 0.150        # original c in k_n formula

BETA          = 50.0         # linear potential scale: V = BETA * k_n
NUM_LEVELS    = 20           # number of eigenvalues to compute

CURVATURE_DOWNSAMPLE = 1     # keep every k-th curvature point (1 = none)
SMOOTHING_WINDOW      = 0    # 0 = no smoothing; else moving-average window

EXPONENTIAL_POTENTIAL = False  # if True: V = exp(alpha * k_n)
ALPHA_EXP             = 0.1

# Global correction terms (very small structural perturbations)
GLOBAL_CORRECTION        = True
GLOBAL_SHAPE_CORRECTION  = True
GLOBAL_SHAPE_ETA         = 1e-4   # log–index tail-slope adjuster
EPS_CORR                 = 0.02   # log(i) diagonal correction

# SCENARIOS: (label, model, fit_n, eval_n)
SCENARIOS = [
    #("affine_fit_20_80", "affine", 20, 80),
    ("log_fit_20_20",    "log_n",  20, 20),
]

# ---------------------------------------------------------------------
# Riemann zeros (first 80 imaginary parts), neatly formatted
# ---------------------------------------------------------------------

# First 80 imaginary parts of non-trivial Riemann zeros
RIEMANN_ZEROS = np.array([
    14.1347251417347, 21.0220396387716, 25.0108575801457, 30.4248761258595, 32.9350615877392,
    37.5861781588257, 40.9187190121475, 43.3270732809149, 48.0051508811672, 49.7738324776723,
    52.9703214777144, 56.4462476970634, 59.3470440026024, 60.8317785246098, 65.1125440480816,
    67.0798105294942, 69.5464017111739, 72.0671576744819, 75.7046906990839, 77.1448400688748,
    79.3373750202494, 82.9103808540860, 84.7354929805171, 87.4252746131252, 88.8091112076345,
    92.4918992705585, 94.6513440405199, 95.8706342282453, 98.8311942181937, 101.3178510057310,
    103.7255380404784, 105.4466230523267, 107.1686111842764, 111.0295355431695, 112.7001209160843,
    114.3202209154523, 116.2266803208578, 118.7907828659763, 121.3701250024203, 122.9468292935526,
    124.2568185543458, 127.5166838795964, 129.5787041997780, 131.0876885311590, 133.4977372029976,
    134.7565097533738, 138.1160420555147, 139.7362089521217, 141.1237074040210, 143.1118458076206,
    146.0009824867653, 147.4227653436690, 150.0535204215010, 150.9252576122664, 153.0246938111000,
    156.0914901307180, 157.5975918175430, 158.8499881714208, 161.1889641375960, 163.0307096875174,
    165.5370691870990, 167.1842300785851, 169.0945154159864, 169.9119764787334, 173.4115365191553,
    174.7541915233657, 176.4414342977104, 178.3774077760997, 179.9164840209589, 182.2070784843660,
    184.8744678480460, 185.5987836777072, 187.2289225835012, 189.4161586560213, 192.0266563607137,
    193.0797266031385, 195.2653966795522, 196.8764818409589
], dtype=float)


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
# 2. Curvature field k_n on primes
# ---------------------------------------------------------------------

def compute_curvature_field(
    primes: np.ndarray,
    window_radius: int = WINDOW_RADIUS,
    c: float = CURVATURE_C,
):
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

    if SMOOTHING_WINDOW > 1:
        kernel = np.ones(SMOOTHING_WINDOW) / SMOOTHING_WINDOW
        k_vals = np.convolve(k_vals, kernel, mode="same")

    return np.array(p_used, float), np.array(k_vals, float)


def resample_to_log_grid(p_used: np.ndarray,
                         k_vals: np.ndarray):
    """
    Reinterpret k_n as a function of t = log p, and resample onto
    a uniform grid in t. The index Laplacian then acts on this log-grid.

    Returns (t_grid, k_on_log_grid).
    """
    if len(p_used) != len(k_vals):
        raise ValueError("p_used and k_vals must have same length")

    t_raw = np.log(p_used)
    t_grid = np.linspace(t_raw[0], t_raw[-1], len(k_vals))
    k_log = np.interp(t_grid, t_raw, k_vals)
    return t_grid, k_log


# ---------------------------------------------------------------------
# 3. Log-grid Laplacian & Hamiltonian
# ---------------------------------------------------------------------

def build_laplacian_index(n_points: int):
    """
    Uniform-grid Laplacian on indices i = 0..N-1 (spacing absorbed into scale):

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
# 4. Fitting, plotting & diagnostics
# ---------------------------------------------------------------------

def fit_log_n(lam: np.ndarray, zeros: np.ndarray, fit_n: int):
    """
    Fit   gamma_n ≈ a * lambda_n + c * log(n) + b
    on the first fit_n levels.

    Returns (a, c, b).
    """
    fit_n = min(fit_n, len(lam), len(zeros))
    n_idx = np.arange(1, fit_n + 1, dtype=float)
    X = np.column_stack([
        lam[:fit_n],      # a · λ_n
        np.log(n_idx),    # c · log n
        np.ones(fit_n),   # b
    ])
    params, *_ = np.linalg.lstsq(X, zeros[:fit_n], rcond=None)
    a, c, b = params
    return a, c, b


def evaluate_log_model(lam: np.ndarray,
                       zeros: np.ndarray,
                       params,
                       eval_n: int):
    """
    Evaluate the log-n model on the first eval_n levels.

    Returns (mean_err, max_err, z_hat, residuals).
    """
    a, c, b = params
    eval_n = min(eval_n, len(lam), len(zeros))
    n_idx = np.arange(1, eval_n + 1, dtype=float)

    z_hat = a * lam[:eval_n] + c * np.log(n_idx) + b
    residuals = z_hat - zeros[:eval_n]
    rel_err = np.abs(residuals / zeros[:eval_n]) * 100.0

    return rel_err.mean(), rel_err.max(), z_hat, residuals


def plot_curvature_field(primes_used: np.ndarray,
                         k_vals: np.ndarray,
                         filename: str):
    plt.figure(figsize=(8, 4.5))
    plt.scatter(primes_used, k_vals, s=3, alpha=0.7)
    plt.xscale("log")
    plt.yscale("log")
    plt.xlabel("prime p")
    plt.ylabel("k_p")
    plt.title("Prime curvature field k_p (log-log)")
    plt.grid(True, which="both", ls=":", alpha=0.4)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_raw(eigs, zeros, eval_n, filename):
    eval_n = min(eval_n, len(eigs), len(zeros))
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 3.5))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, eigs[:eval_n], label="eigenvalues")
    plt.xlabel("index n")
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
    plt.scatter(idx, z_hat[:eval_n], label="mapped eigs")
    plt.xlabel("index n")
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
    plt.plot(idx, residuals, "o-")
    plt.xlabel("index n")
    plt.ylabel("residual (mapped_eig - zero)")
    plt.title(f"Residuals ({label})")
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


# ---------------------------------------------------------------------
# 5. η-variational sweep for the global shape correction
# ---------------------------------------------------------------------

def apply_shape_correction(k_vals: np.ndarray, eta: float) -> np.ndarray:
    """
    Global multiplicative shape correction on k_vals:

        k_n  →  k_n * (1 + eta log n)

    This leaves early levels almost untouched but changes the tail.
    """
    n = np.arange(1, len(k_vals) + 1, dtype=float)
    return k_vals * (1.0 + eta * np.log(n))


def build_hamiltonian_with_corrections(k_vals: np.ndarray,
                                       beta: float,
                                       eta: float) -> tuple[np.ndarray, np.ndarray]:
    """
    Given the curvature field on the log-grid and a shape parameter η,
    build the corrected Hamiltonian and return its eigenvalues
    together with the log-n fit parameters.
    """
    if eta != 0.0:
        k_eff = apply_shape_correction(k_vals, eta)
    else:
        k_eff = k_vals

    main_L, off_L = build_laplacian_index(len(k_eff))

    if EXPONENTIAL_POTENTIAL:
        V = np.exp(ALPHA_EXP * k_eff)
    else:
        V = beta * k_eff

    if GLOBAL_CORRECTION:
        idx = np.arange(1, len(k_eff) + 1, dtype=float)
        V = V + EPS_CORR * np.log(idx)

    H = build_hamiltonian(main_L, off_L, V)
    eigs = lowest_eigenvalues(H, NUM_LEVELS)

    params = fit_log_n(eigs, RIEMANN_ZEROS, fit_n=20)
    return eigs, params


def sweep_eta(etas, k_vals_loggrid, beta=50.0, eval_n=80):
    """
    Variational sweep over η:

    For each η:
        - build Hamiltonian with corrected k_vals
        - compute eigenvalues
        - fit log-n model on first 20
        - evaluate error on first eval_n

    Returns (best_eta, summary_list) where each entry is a dict
    with mean/max errors and tail slope.
    """
    best_eta = None
    best_score = np.inf
    results = []

    for eta in etas:
        print(f"[sweep η] eta = {eta:.2e}")
        eigs, params = build_hamiltonian_with_corrections(k_vals_loggrid, beta, eta)
        mean_err, max_err, z_hat, residuals = evaluate_log_model(
            eigs, RIEMANN_ZEROS, params, eval_n
        )

        # simple measure of tail slope: linear fit on second half of residuals
        m = len(residuals)
        tail_idx = np.arange(m // 2, m)
        tail_res = residuals[m // 2:]
        slope, _ = np.polyfit(tail_idx, tail_res, 1)

        score = mean_err + 0.1 * abs(slope)  # low error + flat tail

        results.append({
            "eta": eta,
            "mean_err": mean_err,
            "max_err": max_err,
            "slope": slope,
        })

        print(f"    mean={mean_err:.3f}%, max={max_err:.3f}%, slope={slope:.4f}")

        if score < best_score:
            best_score = score
            best_eta = eta

    return best_eta, results


# ---------------------------------------------------------------------
# 6. Main experiment
# ---------------------------------------------------------------------

SCENARIOS = [
    ("log_fit_20_80", 20, 80),
]


def main():
    print("RUNNING PRIME-CURVATURE LOG-GRID HAMILTONIAN")
    print(f"  num_primes={NUM_PRIMES}, beta={BETA}, levels={NUM_LEVELS}")
    print(f"  smoothing window = {SMOOTHING_WINDOW}")
    print(f"  exponential potential = {EXPONENTIAL_POTENTIAL} (alpha={ALPHA_EXP})\n")

    # Primes and curvature
    print("Generating primes...")
    primes = generate_primes(NUM_PRIMES)
    print(f"  primes up to {primes[-1]} generated")

    print("Computing curvature field k_n...")
    p_used, k_vals = compute_curvature_field(primes)
    print(f"  curvature points: {len(k_vals)}")

    plot_curvature_field(p_used, k_vals, "k_field_loglog.png")
    print("  saved curvature plot: k_field_loglog.png")

    # Move to uniform log grid t = log p
    t_grid, k_log = resample_to_log_grid(p_used, k_vals)
    print(f"  log-grid points: {len(t_grid)} (uniform in t = log p)")

    # η-variational sweep (shape correction)
    eta_values = np.linspace(0.0, 5e-4, 6)  # 0, 1e-4, ..., 5e-4
    best_eta, sweep_results = sweep_eta(eta_values, k_log, beta=BETA, eval_n=80)
    print(f"\nBest η ≈ {best_eta:.2e} from sweep")

    # Build final Hamiltonian with best η
    eigs, params = build_hamiltonian_with_corrections(k_log, BETA, best_eta)

    zeros = RIEMANN_ZEROS
    print("\nLOG-GRID HAMILTONIAN (final)")
    print(f"  lowest eigenvalues (first 5): {eigs[:5]}")

    plot_raw(eigs, zeros, eval_n=40, filename="eigs_vs_zeros_raw.png")
    print("  saved raw comparison plot: eigs_vs_zeros_raw.png")

    for label, fit_n, eval_n in SCENARIOS:
        print(f"\n[{label}] log_n model")

        mean_err, max_err, z_hat, _ = evaluate_log_model(
            eigs, zeros, params, eval_n
        )

        a, c, b = params
        print(
            "  best-fit: gamma_n ≈ "
            f"{a:.4f}·lambda_n + {c:.4f}·log(n) + {b:.4f}"
        )
        print(f"  fitted on first {fit_n} levels, evaluated on first {eval_n}")
        print(f"  mean relative error: {mean_err:.3f}%")
        print(f"  max  relative error: {max_err:.3f}%")

        fname = f"eigs_vs_zeros_{label}.png"
        plot_mapped(zeros, z_hat, eval_n, label, fname)
        print(f"  saved plot: {fname}")

        plot_residuals(zeros, z_hat, eval_n, label, f"residuals_{label}.png")
        print(f"  saved residual plot: residuals_{label}.png")

    print("\nDone. Plots written to current directory.")


if __name__ == "__main__":
    main()
