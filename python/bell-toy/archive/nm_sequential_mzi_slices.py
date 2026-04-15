import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

# -----------------------------
# Parameters
# -----------------------------
N_DELTA = 36
delta1_vals = np.linspace(0, 2 * np.pi, N_DELTA)
delta2_vals = np.linspace(0, 2 * np.pi, N_DELTA)

NUM_HISTORIES = 1500
NUM_STEPS_STAGE1 = 50
NUM_STEPS_STAGE2 = 50

STEP_GAIN = 0.05
NOISE_SCALE = 0.02
RECOMB_SCALE = 0.45
SEED_STRENGTH = 0.35

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# -----------------------------
# Core model
# -----------------------------
def run_stage(delta, num_histories, num_steps, init_A=None, init_B=None):
    """
    Run one interferometer stage using real arm accumulators.
    Returns updated accumulators and relative mismatch r = a_B - a_A.
    """
    if init_A is None:
        a_A = np.zeros(num_histories, dtype=np.float64)
    else:
        a_A = init_A.copy()

    if init_B is None:
        a_B = np.zeros(num_histories, dtype=np.float64)
    else:
        a_B = init_B.copy()

    drift = STEP_GAIN * np.sin(delta / 2.0)

    for _ in range(num_steps):
        common = np.random.normal(0.0, NOISE_SCALE * 0.4, size=num_histories)
        noise_A = np.random.normal(0.0, NOISE_SCALE, size=num_histories)
        noise_B = np.random.normal(0.0, NOISE_SCALE, size=num_histories)

        a_A += -drift + common + noise_A
        a_B += +drift + common + noise_B

    r = a_B - a_A
    return a_A, a_B, r

def recombine_signal(r):
    return np.cos(RECOMB_SCALE * r)

# -----------------------------
# Sweep surfaces
# -----------------------------
p_d0_surface = np.zeros((N_DELTA, N_DELTA))
p_d1_surface = np.zeros((N_DELTA, N_DELTA))
signal_surface = np.zeros((N_DELTA, N_DELTA))

for i, delta1 in enumerate(delta1_vals):
    for j, delta2 in enumerate(delta2_vals):
        # Stage 1
        a_A, a_B, r1 = run_stage(delta1, NUM_HISTORIES, NUM_STEPS_STAGE1)

        # Direct state carry-forward into stage 2
        a_A2_init = a_A.copy()
        a_B2_init = a_B.copy()

        # Stage 2
        a_A2, a_B2, r2 = run_stage(
            delta2,
            NUM_HISTORIES,
            NUM_STEPS_STAGE2,
            init_A=a_A2_init,
            init_B=a_B2_init
        )

        # Final recombination
        s2 = recombine_signal(r2)

        p_d0 = 0.5 * (1.0 + s2)
        p_d1 = 0.5 * (1.0 - s2)

        signal_surface[i, j] = np.mean(s2)
        p_d0_surface[i, j] = np.mean(p_d0)
        p_d1_surface[i, j] = np.mean(p_d1)

# -----------------------------
# Save heatmaps
# -----------------------------
extent = [0, 2 * np.pi, 0, 2 * np.pi]

fig, axs = plt.subplots(1, 3, figsize=(16, 4.8), dpi=180)

im0 = axs[0].imshow(
    signal_surface,
    origin="lower",
    extent=extent,
    aspect="auto"
)
axs[0].set_title("Sequential MZI signal")
axs[0].set_xlabel("Δ₂")
axs[0].set_ylabel("Δ₁")
fig.colorbar(im0, ax=axs[0], fraction=0.046, pad=0.04)

im1 = axs[1].imshow(
    p_d0_surface,
    origin="lower",
    extent=extent,
    aspect="auto",
    vmin=0,
    vmax=1
)
axs[1].set_title("Final output P(D0)")
axs[1].set_xlabel("Δ₂")
axs[1].set_ylabel("Δ₁")
fig.colorbar(im1, ax=axs[1], fraction=0.046, pad=0.04)

im2 = axs[2].imshow(
    p_d1_surface,
    origin="lower",
    extent=extent,
    aspect="auto",
    vmin=0,
    vmax=1
)
axs[2].set_title("Final output P(D1)")
axs[2].set_xlabel("Δ₂")
axs[2].set_ylabel("Δ₁")
fig.colorbar(im2, ax=axs[2], fraction=0.046, pad=0.04)

plt.tight_layout()
heatmap_path = OUTPUT_DIR / "nm_sequential_mzi_surfaces.png"
plt.savefig(heatmap_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {heatmap_path}")

# -----------------------------
# Save fixed-Δ1 slices
# -----------------------------
slice_targets = [0, np.pi / 2, np.pi, 3 * np.pi / 2]
slice_indices = [np.argmin(np.abs(delta1_vals - t)) for t in slice_targets]
slice_labels = [
    r"$\Delta_1 = 0$",
    r"$\Delta_1 = \pi/2$",
    r"$\Delta_1 = \pi$",
    r"$\Delta_1 = 3\pi/2$"
]

fig, axs = plt.subplots(2, 1, figsize=(10, 8), dpi=180)

for idx, label in zip(slice_indices, slice_labels):
    axs[0].plot(delta2_vals, p_d0_surface[idx, :], lw=2, label=label)
    axs[1].plot(delta2_vals, p_d1_surface[idx, :], lw=2, label=label)

axs[0].set_title(r"Sequential MZI slices: $P(D0)$ vs $\Delta_2$ at fixed $\Delta_1$")
axs[0].set_ylabel("Probability")
axs[0].grid(True, alpha=0.3)
axs[0].legend()

axs[1].set_title(r"Sequential MZI slices: $P(D1)$ vs $\Delta_2$ at fixed $\Delta_1$")
axs[1].set_xlabel(r"$\Delta_2$")
axs[1].set_ylabel("Probability")
axs[1].grid(True, alpha=0.3)
axs[1].legend()

plt.tight_layout()
slice_path = OUTPUT_DIR / "nm_sequential_mzi_slices.png"
plt.savefig(slice_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {slice_path}")
print("Done.")