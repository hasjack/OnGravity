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

# Small angular noise per stage
ANGLE_NOISE = 0.04

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# -----------------------------
# Core model: 2D real state
# -----------------------------
def rotate_states(states, angle):
    """
    Rotate an array of 2D states by angle.
    states shape: (N, 2)
    """
    c = np.cos(angle)
    s = np.sin(angle)

    u = states[:, 0]
    v = states[:, 1]

    u_new = c * u - s * v
    v_new = s * u + c * v

    return np.column_stack([u_new, v_new])

def run_stage_2d(delta, num_histories, init_states=None):
    """
    Apply one stage as a real planar rotation plus small random angular jitter.
    """
    if init_states is None:
        states = np.zeros((num_histories, 2), dtype=np.float64)
        states[:, 0] = 1.0   # start aligned with D0 basis
    else:
        states = init_states.copy()

    base_angle = delta / 2.0
    jitter = np.random.normal(0.0, ANGLE_NOISE, size=num_histories)
    angles = base_angle + jitter

    out = np.empty_like(states)
    for i, ang in enumerate(angles):
        c = np.cos(ang)
        s = np.sin(ang)
        u, v = states[i]
        out[i, 0] = c * u - s * v
        out[i, 1] = s * u + c * v

    return out

def detector_probabilities(states):
    """
    Read detector probabilities from the real 2D state.
    """
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
        states1 = run_stage_2d(delta1, NUM_HISTORIES)
        states2 = run_stage_2d(delta2, NUM_HISTORIES, init_states=states1)

        signal, p_d0, p_d1 = detector_probabilities(states2)

        signal_surface[i, j] = np.mean(signal)
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
axs[0].set_title("Sequential MZI signal (2D real state)")
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
heatmap_path = OUTPUT_DIR / "nm_sequential_mzi_2d_real_surfaces.png"
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
slice_path = OUTPUT_DIR / "nm_sequential_mzi_2d_real_slices.png"
plt.savefig(slice_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {slice_path}")
print("Done.")