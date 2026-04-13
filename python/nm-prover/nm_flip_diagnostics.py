import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# -----------------------------
# Parameters
# -----------------------------
WIDTH = 900
HEIGHT = 900
MAX_ITER = 256

C_MIN, C_MAX = -1.5, 0.5
B_MIN, B_MAX = -1.0, 1.0

KAPPA_VALUES = [0.0, 0.6235]

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# -----------------------------
# Grid
# -----------------------------
c_vals = np.linspace(C_MIN, C_MAX, WIDTH)
b_vals = np.linspace(B_MIN, B_MAX, HEIGHT)
C, B = np.meshgrid(c_vals, b_vals)

# -----------------------------
# Full NM orbit diagnostics
# x_{n+1} = sigma_n x_n^2 + c
# sigma flips if |x_{n+1}| > 1 + |b| kappa
# -----------------------------
def nm_orbit_diagnostics(C, B, kappa, max_iter=MAX_ITER):
    x = B.copy()
    sigma = np.ones_like(x)

    threshold = 1.0 + np.abs(B) * kappa

    active = np.ones_like(x, dtype=bool)
    escape_time = np.full(x.shape, max_iter, dtype=int)

    flip_count = np.zeros(x.shape, dtype=np.int32)
    plus_count = np.zeros(x.shape, dtype=np.int32)
    minus_count = np.zeros(x.shape, dtype=np.int32)
    steps_seen = np.zeros(x.shape, dtype=np.int32)

    hard_escape = 1e6

    for n in range(max_iter):
        if not np.any(active):
            break

        idx = np.where(active)

        x_a = x[active]
        c_a = C[active]
        s_a = sigma[active]
        t_a = threshold[active]

        # occupancy before update
        plus_mask = s_a > 0
        minus_mask = ~plus_mask

        plus_count[idx[0][plus_mask], idx[1][plus_mask]] += 1
        minus_count[idx[0][minus_mask], idx[1][minus_mask]] += 1
        steps_seen[idx] += 1

        # update
        x_next = s_a * x_a * x_a + c_a

        flip_mask = np.abs(x_next) > t_a
        s_next = np.where(flip_mask, -s_a, s_a)

        flip_count[idx[0][flip_mask], idx[1][flip_mask]] += 1

        escaped_now = np.abs(x_next) > hard_escape
        escape_time[idx[0][escaped_now], idx[1][escaped_now]] = n

        # write back
        x_new = x.copy()
        sigma_new = sigma.copy()

        x_new[active] = x_next
        sigma_new[active] = s_next

        x = x_new
        sigma = sigma_new

        active_new = active.copy()
        active_new[idx[0][escaped_now], idx[1][escaped_now]] = False
        active = active_new

    plus_frac = np.divide(
        plus_count,
        steps_seen,
        out=np.zeros_like(plus_count, dtype=float),
        where=steps_seen > 0
    )
    minus_frac = np.divide(
        minus_count,
        steps_seen,
        out=np.zeros_like(minus_count, dtype=float),
        where=steps_seen > 0
    )

    return {
        "escape_time": escape_time,
        "flip_count": flip_count,
        "plus_frac": plus_frac,
        "minus_frac": minus_frac,
    }

# -----------------------------
# Render panels
# -----------------------------
for kappa in KAPPA_VALUES:
    data = nm_orbit_diagnostics(C, B, kappa)

    extent = [C_MIN, C_MAX, B_MIN, B_MAX]

    fig, axs = plt.subplots(2, 2, figsize=(12, 10), dpi=180)

    im0 = axs[0, 0].imshow(
        data["escape_time"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="hot"
    )
    axs[0, 0].set_title(f"NM escape-time atlas\n$\\kappa={kappa}$")
    axs[0, 0].set_xlabel("c")
    axs[0, 0].set_ylabel("b")
    fig.colorbar(im0, ax=axs[0, 0], fraction=0.046, pad=0.04)

    im1 = axs[0, 1].imshow(
        data["flip_count"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="viridis"
    )
    axs[0, 1].set_title("Flip count")
    axs[0, 1].set_xlabel("c")
    axs[0, 1].set_ylabel("b")
    fig.colorbar(im1, ax=axs[0, 1], fraction=0.046, pad=0.04)

    im2 = axs[1, 0].imshow(
        data["plus_frac"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="plasma",
        vmin=0,
        vmax=1
    )
    axs[1, 0].set_title("Fraction of time in $\\sigma=+1$")
    axs[1, 0].set_xlabel("c")
    axs[1, 0].set_ylabel("b")
    fig.colorbar(im2, ax=axs[1, 0], fraction=0.046, pad=0.04)

    im3 = axs[1, 1].imshow(
        data["minus_frac"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="plasma",
        vmin=0,
        vmax=1
    )
    axs[1, 1].set_title("Fraction of time in $\\sigma=-1$")
    axs[1, 1].set_xlabel("c")
    axs[1, 1].set_ylabel("b")
    fig.colorbar(im3, ax=axs[1, 1], fraction=0.046, pad=0.04)

    plt.tight_layout()
    out_path = OUTPUT_DIR / f"nm_flip_diagnostics_kappa_{str(kappa).replace('.', '_')}.png"
    plt.savefig(out_path, bbox_inches="tight")
    plt.close(fig)

    print(f"Saved: {out_path}")

print("Done.")