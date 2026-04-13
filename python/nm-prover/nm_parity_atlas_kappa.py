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
# NM parity diagnostics
# -----------------------------
def nm_parity_diagnostics(C, B, kappa, max_iter=MAX_ITER):
    x = B.copy()
    sigma = np.ones_like(x)

    threshold = 1.0 + np.abs(B) * kappa

    active = np.ones_like(x, dtype=bool)

    flip_count = np.zeros(x.shape, dtype=np.int32)
    first_flip_iter = np.full(x.shape, -1, dtype=np.int32)

    hard_escape = 1e6

    for n in range(max_iter):
        if not np.any(active):
            break

        idx = np.where(active)

        x_a = x[active]
        c_a = C[active]
        s_a = sigma[active]
        t_a = threshold[active]

        x_next = s_a * x_a * x_a + c_a

        flip_mask = np.abs(x_next) > t_a
        s_next = np.where(flip_mask, -s_a, s_a)

        # record first flip
        ff = first_flip_iter[idx]
        ff_new = np.where((flip_mask) & (ff < 0), n, ff)
        first_flip_iter[idx] = ff_new

        # accumulate flips
        flip_count[idx] += flip_mask.astype(np.int32)

        escaped_now = np.abs(x_next) > hard_escape

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

    flip_parity = flip_count % 2
    final_sigma = sigma.copy()

    # mask "never flipped" first-flip values for plotting
    first_flip_plot = first_flip_iter.astype(float)
    first_flip_plot[first_flip_plot < 0] = np.nan

    return {
        "flip_count": flip_count,
        "flip_parity": flip_parity,
        "final_sigma": final_sigma,
        "first_flip_iter": first_flip_plot,
    }

# -----------------------------
# Render panels
# -----------------------------
for kappa in KAPPA_VALUES:
    data = nm_parity_diagnostics(C, B, kappa)

    extent = [C_MIN, C_MAX, B_MIN, B_MAX]

    fig, axs = plt.subplots(2, 2, figsize=(12, 10), dpi=180)

    im0 = axs[0, 0].imshow(
        data["flip_count"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="viridis"
    )
    axs[0, 0].set_title(f"Flip count\n$\\kappa={kappa}$")
    axs[0, 0].set_xlabel("c")
    axs[0, 0].set_ylabel("b")
    fig.colorbar(im0, ax=axs[0, 0], fraction=0.046, pad=0.04)

    im1 = axs[0, 1].imshow(
        data["flip_parity"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="coolwarm",
        vmin=0,
        vmax=1
    )
    axs[0, 1].set_title("Flip parity (even/odd)")
    axs[0, 1].set_xlabel("c")
    axs[0, 1].set_ylabel("b")
    fig.colorbar(im1, ax=axs[0, 1], fraction=0.046, pad=0.04)

    im2 = axs[1, 0].imshow(
        data["final_sigma"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="bwr",
        vmin=-1,
        vmax=1
    )
    axs[1, 0].set_title("Final orientation $\\sigma_{final}$")
    axs[1, 0].set_xlabel("c")
    axs[1, 0].set_ylabel("b")
    fig.colorbar(im2, ax=axs[1, 0], fraction=0.046, pad=0.04)

    im3 = axs[1, 1].imshow(
        data["first_flip_iter"],
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="magma"
    )
    axs[1, 1].set_title("First flip iteration")
    axs[1, 1].set_xlabel("c")
    axs[1, 1].set_ylabel("b")
    fig.colorbar(im3, ax=axs[1, 1], fraction=0.046, pad=0.04)

    plt.tight_layout()
    out_path = OUTPUT_DIR / f"nm_parity_atlas_kappa_{str(kappa).replace('.', '_')}.png"
    plt.savefig(out_path, bbox_inches="tight")
    plt.close(fig)

    print(f"Saved: {out_path}")

print("Done.")