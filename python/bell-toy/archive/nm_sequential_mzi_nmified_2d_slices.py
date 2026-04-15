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
NUM_STEPS_STAGE1 = 60
NUM_STEPS_STAGE2 = 60

# Local matrix update strengths
COUPLING_SCALE = 0.030
SHEAR_SCALE = 0.006
NOISE_SCALE = 0.0015

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# -----------------------------
# Core model: NM-style 2D local matrix update
# -----------------------------
def run_nm_2d_matrix_stage(delta, num_histories, num_steps, init_states=None):
    """
    Evolve a real 2D state by repeated local matrix updates.

    The update has:
      - off-diagonal coupling term b
      - diagonal anisotropy terms a, c

    This is still real-only and local, but no longer effectively 1D-driven.
    """
    if init_states is None:
        states = np.zeros((num_histories, 2), dtype=np.float64)
        states[:, 0] = 1.0
    else:
        states = init_states.copy()

    # Two independent stage controls
    coupling_drive = np.sin(delta / 2.0)
    shear_drive = np.cos(delta / 2.0)

    for _ in range(num_steps):
        u = states[:, 0].copy()
        v = states[:, 1].copy()

        # Small per-history jitter so the ensemble is not perfectly rigid
        jitter_b = np.random.normal(0.0, NOISE_SCALE, size=num_histories)
        jitter_a = np.random.normal(0.0, NOISE_SCALE, size=num_histories)
        jitter_c = np.random.normal(0.0, NOISE_SCALE, size=num_histories)

        b = COUPLING_SCALE * coupling_drive + jitter_b
        a = SHEAR_SCALE * shear_drive + jitter_a
        c = -SHEAR_SCALE * shear_drive + jitter_c

        # Local real matrix update
        u_new = (1.0 + a) * u - b * v
        v_new = b * u + (1.0 + c) * v

        # Renormalise to keep the state bounded
        norm = np.sqrt(u_new**2 + v_new**2)
        u_new /= norm
        v_new /= norm

        states[:, 0] = u_new
        states[:, 1] = v_new

    return states

def detector_probabilities(states):
    u = states[:, 0]
    v = states[:, 1]

    norm2 = u**2 + v**2
    p_d0 = u**2 / norm2
    p_d1 = v**2 / norm2
    signal = p_d0 - p_d1
    return signal, p_d0, p_d1

# -----------------------------
# Sweep surfaces
# -----------------------------
signal_surface = np.zeros((N_DELTA, N_DELTA))
p_d0_surface = np.zeros((N_DELTA, N_DELTA))
p_d1_surface = np.zeros((N_DELTA, N_DELTA))

for i, delta1 in enumerate(delta1_vals):
    for j, delta2 in enumerate(delta2_vals):
        states1 = run_nm_2d_matrix_stage(delta1, NUM_HISTORIES, NUM_STEPS_STAGE1)
        states2 = run_nm_2d_matrix_stage(delta2, NUM_HISTORIES, NUM_STEPS_STAGE2, init_states=states1)

        signal, p_d0, p_d1 = detector_probabilities(states2)

        signal_surface[i, j] = np.mean(signal)
        p_d0_surface[i, j] = np.mean(p_d0)
        p_d1_surface[i, j] = np.mean(p_d1)

# -----------------------------
# Save heatmaps
# -----------------------------
extent = [0, 2 * np.pi, 0, 2 * np.pi]

fig, axs = plt.subplots(1, 3, figsize=(16, 4.8), dpi=180)

im0 = axs[0].imshow(signal_surface, origin="lower", extent=extent, aspect="auto")
axs[0].set_title("Sequential MZI signal (NM 2D matrix)")
axs[0].set_xlabel("Δ₂")
axs[0].set_ylabel("Δ₁")
fig.colorbar(im0, ax=axs[0], fraction=0.046, pad=0.04)

im1 = axs[1].imshow(
    p_d0_surface, origin="lower", extent=extent, aspect="auto", vmin=0, vmax=1
)
axs[1].set_title("Final output P(D0)")
axs[1].set_xlabel("Δ₂")
axs[1].set_ylabel("Δ₁")
fig.colorbar(im1, ax=axs[1], fraction=0.046, pad=0.04)

im2 = axs[2].imshow(
    p_d1_surface, origin="lower", extent=extent, aspect="auto", vmin=0, vmax=1
)
axs[2].set_title("Final output P(D1)")
axs[2].set_xlabel("Δ₂")
axs[2].set_ylabel("Δ₁")
fig.colorbar(im2, ax=axs[2], fraction=0.046, pad=0.04)

plt.tight_layout()
heatmap_path = OUTPUT_DIR / "nm_sequential_mzi_nmified_2d_matrix_surfaces.png"
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
slice_path = OUTPUT_DIR / "nm_sequential_mzi_nmified_2d_matrix_slices.png"
plt.savefig(slice_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {slice_path}")
print("Done.")