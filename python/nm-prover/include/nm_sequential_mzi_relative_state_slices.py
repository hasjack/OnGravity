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

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# -----------------------------
# Core model: direct relative state
# -----------------------------
def run_relative_stage(delta, num_histories, num_steps, init_r=None):
    """
    Evolve the relative mismatch state directly.

    r is the only internal state.
    """
    if init_r is None:
        r = np.zeros(num_histories, dtype=np.float64)
    else:
        r = init_r.copy()

    drift = 2.0 * STEP_GAIN * np.sin(delta / 2.0)

    for _ in range(num_steps):
        noise = np.random.normal(0.0, NOISE_SCALE, size=num_histories)
        r += drift + noise

    return r

def recombine_signal(r):
    return np.cos(RECOMB_SCALE * r)

# -----------------------------
# Sweep surfaces
# -----------------------------
signal_surface = np.zeros((N_DELTA, N_DELTA))
p_d0_surface = np.zeros((N_DELTA, N_DELTA))
p_d1_surface = np.zeros((N_DELTA, N_DELTA))

for i, delta1 in enumerate(delta1_vals):
    for j, delta2 in enumerate(delta2_vals):
        # Stage 1
        r1 = run_relative_stage(delta1, NUM_HISTORIES, NUM_STEPS_STAGE1)

        # Stage 2 carries forward the same relative state
        r2 = run_relative_stage(
            delta2,
            NUM_HISTORIES,
            NUM_STEPS_STAGE2,
            init_r=r1
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
axs[0].set_title("Sequential MZI signal (direct relative state)")
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
heatmap_path = OUTPUT_DIR / "nm_sequential_mzi_relative_state_surfaces.png"
plt.savefig(heatmap_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {heatmap_path}")

# -----------------------------
# Save slices
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
slice_path = OUTPUT_DIR / "nm_sequential_mzi_relative_state_slices.png"
plt.savefig(slice_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {slice_path}")
print("Done.")