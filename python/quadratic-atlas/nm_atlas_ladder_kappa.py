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
# Fixed orientation atlas
# x_{n+1} = sigma x_n^2 + c
# -----------------------------
def atlas_fixed_orientation(C, B, sigma=1.0, max_iter=MAX_ITER, escape_radius=2.0):
    x = B.copy()
    active = np.ones_like(x, dtype=bool)
    escape_time = np.full(x.shape, max_iter, dtype=int)

    for n in range(max_iter):
        if not np.any(active):
            break

        x_active = x[active]
        c_active = C[active]

        x_next = sigma * x_active * x_active + c_active
        escaped_now = np.abs(x_next) > escape_radius

        idx = np.where(active)
        escape_time[idx[0][escaped_now], idx[1][escaped_now]] = n

        survivors = ~escaped_now
        x_new = x.copy()
        x_new[active] = x_next
        x = x_new

        active_new = active.copy()
        active_idx0 = idx[0]
        active_idx1 = idx[1]
        active_new[active_idx0[escaped_now], active_idx1[escaped_now]] = False
        active = active_new

    return escape_time

# -----------------------------
# Full NM flip atlas
# x_{n+1} = sigma_n x_n^2 + c
# sigma flips if |x_{n+1}| > 1 + |b| kappa
# -----------------------------
def atlas_nm_flip(C, B, kappa, max_iter=MAX_ITER):
    x = B.copy()
    sigma = np.ones_like(x)
    threshold = 1.0 + np.abs(B) * kappa

    active = np.ones_like(x, dtype=bool)
    escape_time = np.full(x.shape, max_iter, dtype=int)

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

    return escape_time

# -----------------------------
# Render comparison panels
# -----------------------------
for kappa in KAPPA_VALUES:
    atlas_plus = atlas_fixed_orientation(C, B, sigma=+1.0)
    atlas_minus = atlas_fixed_orientation(C, B, sigma=-1.0)
    atlas_nm = atlas_nm_flip(C, B, kappa=kappa)

    fig, axs = plt.subplots(1, 3, figsize=(16, 5.5), dpi=180)
    extent = [C_MIN, C_MAX, B_MIN, B_MAX]

    im0 = axs[0].imshow(
        atlas_plus,
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="hot"
    )
    axs[0].set_title("Fixed preserving orientation\n$x_{n+1}=+x_n^2+c$")
    axs[0].set_xlabel("c")
    axs[0].set_ylabel("b")

    im1 = axs[1].imshow(
        atlas_minus,
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="hot"
    )
    axs[1].set_title("Fixed reversing orientation\n$x_{n+1}=-x_n^2+c$")
    axs[1].set_xlabel("c")
    axs[1].set_ylabel("b")

    im2 = axs[2].imshow(
        atlas_nm,
        origin="lower",
        extent=extent,
        aspect="auto",
        cmap="hot"
    )
    axs[2].set_title(f"Full NM atlas\n$\\kappa={kappa}$")
    axs[2].set_xlabel("c")
    axs[2].set_ylabel("b")

    fig.colorbar(im2, ax=axs, fraction=0.025, pad=0.02, label="escape iterations")
    plt.tight_layout()

    out_path = OUTPUT_DIR / f"nm_atlas_orientation_ladder_kappa_{str(kappa).replace('.', '_')}.png"
    plt.savefig(out_path, bbox_inches="tight")
    plt.close(fig)

    print(f"Saved: {out_path}")

print("Done.")