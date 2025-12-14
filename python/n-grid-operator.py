#!/usr/bin/env python3
"""
Natural Maths Hamiltonian – option A (n–grid operator)

This version:

  * works on a *uniform n-grid* (like `real-spectrum-vs-zeros.py`)
  * builds a simple discrete Schrödinger operator
        H = -Δ_n + V(n),  V(n) = -β κ(n)
  * κ(n) is a hybrid of:
        – arithmetic curvature κ_a(n) (prime structure)
        – dynamical curvature κ_d(n) from the NM quadratic map
  * extracts the lowest `num_zeros` eigenvalues and compares
    them numerically with the first Riemann zeros.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh, ArpackNoConvergence
from mpmath import zetazero


# ---------------------------------------------------------
# 1. NM primes
# ---------------------------------------------------------

def nm_primes_up_to(N: int) -> np.ndarray:
    """Sieve primes ≥3 up to N (2 is the Cut operator and omitted)."""
    if N < 3:
        return np.array([], dtype=int)

    sieve = np.ones(N + 1, dtype=bool)
    sieve[:3] = False  # 0,1,2 are not NM-primes
    for p in range(3, int(np.sqrt(N)) + 1, 2):
        if sieve[p]:
            sieve[p * p : N + 1 : 2 * p] = False
    return np.nonzero(sieve)[0]


# ---------------------------------------------------------
# 2. Arithmetic curvature κ_a(n)
# ---------------------------------------------------------

def arithmetic_curvature(
    n_vals: np.ndarray,
    primes: np.ndarray,
    window: int = 100,
) -> np.ndarray:
    """
    Arithmetic curvature in the spirit of `real-spectrum-vs-zeros.py`.

    For each n we measure:

      comp(n)  = local composite fraction in [n-window, n+window]
      loglog   = log log (n + shift)

    and set (purely phenomenologically)

      curvature_term = 0.83 * (loglog + 3.2 * comp)**2.85
      κ_a(n)         = curvature_term * sqrt(comp)

    This is just a tunable model – feel free to adjust the constants.
    """
    Nmax = int(n_vals[-1] + window + 5)

    # boolean prime table for quick lookup
    is_prime = np.zeros(Nmax + 1, dtype=bool)
    is_prime[primes] = True

    comp = np.empty_like(n_vals, dtype=float)
    for i, n in enumerate(n_vals):
        a = max(2, n - window)
        b = min(Nmax, n + window)
        span = b - a + 1
        pcount = np.count_nonzero(is_prime[a : b + 1])
        comp[i] = 1.0 - pcount / span

    # smooth log-log term
    loglog = np.log(np.log(n_vals + 1e8))

    curvature_term = 0.83 * (loglog + 3.2 * comp) ** 2.85
    kappa_a = curvature_term * np.sqrt(comp + 1e-12)

    return kappa_a


# ---------------------------------------------------------
# 3. Dynamical curvature κ_d(n) from NM map
# ---------------------------------------------------------

def nm_dynamic_curvature(
    N: int,
    kappa_param: float = 0.624,
    c: float = -0.75,
    b: float = 0.0,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Canonical NM quadratic map with curvature-triggered flips:

        x_{n+1} = σ_n x_n^2 + c
        σ_{n+1} = σ_n        if |x_{n+1}| <= 1 + |b| κ
                 = -σ_n      if |x_{n+1}| >  1 + |b| κ

    κ_d(n) is taken as |x_{n+1} - x_n|, i.e. local "curvature activity".
    """
    x = np.zeros(N)
    sigma = np.ones(N, dtype=int)
    kappa_d = np.zeros(N)

    x[0] = b
    sigma[0] = 1
    T = 1.0 + abs(b) * kappa_param   # threshold 1 + |b| κ  (constant here)

    for n in range(N - 1):
        x_next = sigma[n] * x[n] ** 2 + c

        if abs(x_next) > T:
            sigma[n + 1] = -sigma[n]
        else:
            sigma[n + 1] = sigma[n]

        x[n + 1] = x_next
        kappa_d[n] = abs(x_next - x[n])

    if N > 1:
        kappa_d[-1] = kappa_d[-2]

    return kappa_d, sigma


# ---------------------------------------------------------
# 4. Hybrid curvature κ(n)
# ---------------------------------------------------------

def hybrid_kappa(
    kappa_a: np.ndarray,
    kappa_d: np.ndarray,
    C: float = 0.01,
    alpha: float = 1.0,
    use_arithmetic: bool = True,
) -> np.ndarray:
    """
    κ(n) = C κ_a(n) + α κ_d(n)   (if use_arithmetic),
    or    κ(n) = α κ_d(n)         (if use_arithmetic is False).
    """
    if use_arithmetic:
        return C * kappa_a + alpha * kappa_d
    else:
        return alpha * kappa_d


# ---------------------------------------------------------
# 5. Discrete Schrödinger operator on n-grid
# ---------------------------------------------------------

def build_hamiltonian(kappa: np.ndarray, beta: float = 1.0):
    """
    Uniform n-grid Laplacian with potential V(n) = -β κ(n):

        H ψ(n) = -Δ_n ψ(n) - β κ(n) ψ(n)

    Dirichlet-type boundary is imposed by clamping the end points
    with a very large diagonal value.
    """
    N = len(kappa)
    h = 1.0 / (N - 1)          # unit-spaced n mapped to [0,1]

    main_diag = np.empty(N, dtype=float)
    off_diag  = np.full(N - 1, -1.0 / h**2, dtype=float)

    V = -beta * kappa          # note the sign (tunable)

    main_diag[1:-1] = 2.0 / h**2 + V[1:-1]
    main_diag[0] = main_diag[-1] = 1e9     # hard wall

    H = diags(
        [off_diag, main_diag, off_diag],
        offsets=[-1, 0, 1],
        shape=(N, N),
        format='csc',
    )
    return H


# ---------------------------------------------------------
# 6. Eigenvalue extraction
# ---------------------------------------------------------

def compute_evals(H, k: int = 10) -> np.ndarray:
    """Lowest k eigenvalues near 0 via shift-invert."""
    try:
        evals = eigsh(
            H,
            k=k,
            sigma=0.0,
            which="LM",
            return_eigenvectors=False,
        )
        return np.sort(evals)
    except ArpackNoConvergence as e:
        vals = e.eigenvalues
        return np.sort(vals[:k])


# ---------------------------------------------------------
# 7. Main driver
# ---------------------------------------------------------

def run(
    N: int = 5000,
    num_zeros: int = 10,
    beta: float = 1.0,
    kappa_param: float = 0.624,
    c: float = -0.75,
    b: float = 0.0,
    alpha: float = 1.0,
    C: float = 0.01,
    use_arithmetic: bool = True,
):
    print(f"NM HAMILTONIAN (option A, n-grid)   N={N}, zeros={num_zeros}")
    n_vals = np.arange(2, N + 2)         # length N, roughly 2…N+1

    print("Sieving NM primes...")
    primes = nm_primes_up_to(n_vals[-1])

    print("Computing arithmetic curvature κ_a(n)...")
    kappa_a = arithmetic_curvature(n_vals, primes)

    print("Computing dynamical curvature κ_d(n) from NM map...")
    kappa_d, sigma = nm_dynamic_curvature(
        len(n_vals),
        kappa_param=kappa_param,
        c=c,
        b=b,
    )

    label = "arithmetic + dynamical" if use_arithmetic else "dynamical only"
    print(f"Building hybrid κ(n) ({label})...")
    kappa = hybrid_kappa(
        kappa_a,
        kappa_d,
        C=C,
        alpha=alpha,
        use_arithmetic=use_arithmetic,
    )

    print("Building Hamiltonian on n-grid...")
    H = build_hamiltonian(kappa, beta=beta)

    print("Computing eigenvalues...")
    evals = compute_evals(H, k=num_zeros)

    print("Fetching Riemann zeros for comparison...")
    true_zeros = np.array([float(zetazero(i + 1).imag) for i in range(num_zeros)])

    print("\nEigenvalues:", evals)
    print("Zeros:      ", true_zeros)

    rel_err = np.abs((evals - true_zeros) / true_zeros) * 100
    print(f"\nMean relative error: {rel_err.mean():.3f}%")
    print(f"Max  relative error: {rel_err.max():.3f}%")

    # -------------------- diagnostic plots --------------------

    # κ_a
    plt.figure(figsize=(14, 6))
    plt.plot(n_vals, kappa_a, color="cyan")
    plt.title("Arithmetic curvature κ_a(n)")
    plt.xlabel("n")
    plt.grid(True)
    plt.savefig("kappa_a.png")

    # κ_d
    plt.figure(figsize=(14, 6))
    plt.plot(n_vals, kappa_d, color="magenta")
    plt.title("Dynamical curvature κ_d(n)")
    plt.xlabel("n")
    plt.grid(True)
    plt.savefig("kappa_d.png")

    # κ hybrid
    plt.figure(figsize=(14, 6))
    plt.plot(n_vals, kappa, color="yellow")
    plt.title("Hybrid curvature κ(n)")
    plt.xlabel("n")
    plt.grid(True)
    plt.savefig("kappa_hybrid.png")

    # σ
    plt.figure(figsize=(14, 6))
    plt.plot(n_vals, sigma, color="orange")
    plt.title("Orientation σ(n)")
    plt.xlabel("n")
    plt.grid(True)
    plt.savefig("sigma.png")

    # eigenvalues vs zeros
    plt.figure(figsize=(14, 6))
    x = np.arange(1, num_zeros + 1)
    plt.scatter(x, evals, color="cyan", label="NM eigenvalues")
    plt.plot(x, true_zeros, color="red", label="Riemann zeros")
    plt.title("Eigenvalues vs Riemann zeros (diagnostic)")
    plt.xlabel("index")
    plt.grid(True)
    plt.legend()
    plt.savefig("eigs_vs_zeros.png")

    print(
        "\nPlots saved: kappa_a.png, kappa_d.png, "
        "kappa_hybrid.png, sigma.png, eigs_vs_zeros.png"
    )


if __name__ == "__main__":
    run()
