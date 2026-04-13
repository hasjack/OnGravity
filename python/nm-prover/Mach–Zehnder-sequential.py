import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

# Grid of stage settings
N_DELTA = 36
delta1_vals = np.linspace(0, 2 * np.pi, N_DELTA)
delta2_vals = np.linspace(0, 2 * np.pi, N_DELTA)

# Histories / dynamics
NUM_HISTORIES = 1500
NUM_STEPS_STAGE1 = 50
NUM_STEPS_STAGE2 = 50

# Tuned from previous single-MZI toy
STEP_GAIN = 0.05
NOISE_SCALE = 0.02
RECOMB_SCALE = 0.45

def run_stage(delta, num_histories, num_steps, init_A=None, init_B=None):
    """
    Run one interferometer stage using real arm accumulators.

    Returns updated accumulators a_A, a_B and relative mismatch r = a_B - a_A.
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
    """
    Real recombination signal from relative mismatch.
    """
    return np.cos(RECOMB_SCALE * r)

# Output surfaces
p_d0_surface = np.zeros((N_DELTA, N_DELTA))
p_d1_surface = np.zeros((N_DELTA, N_DELTA))
signal_surface = np.zeros((N_DELTA, N_DELTA))

for i, delta1 in enumerate(delta1_vals):
    for j, delta2 in enumerate(delta2_vals):
        # Stage 1
        a_A, a_B, r1 = run_stage(delta1, NUM_HISTORIES, NUM_STEPS_STAGE1)

        # Recombination after stage 1:
        # use the stage-1 signal to seed the second stage asymmetrically
        s1 = recombine_signal(r1)

        # Feed-forward into stage 2 as a real internal state
        # Histories favour one arm or the other depending on stage-1 recombination signal
        seed_strength = 0.35
        a_A2_init = a_A - seed_strength * s1
        a_B2_init = a_B + seed_strength * s1

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

# Save plots
Path("outputs").mkdir(exist_ok=True)

extent = [0, 2 * np.pi, 0, 2 * np.pi]

fig, axs = plt.subplots(1, 3, figsize=(16, 4.8), dpi=180)

im0 = axs[0].imshow(
    signal_surface,
    origin='lower',
    extent=extent,
    aspect='auto'
)
axs[0].set_title('Sequential MZI signal')
axs[0].set_xlabel('Δ₂')
axs[0].set_ylabel('Δ₁')
fig.colorbar(im0, ax=axs[0], fraction=0.046, pad=0.04)

im1 = axs[1].imshow(
    p_d0_surface,
    origin='lower',
    extent=extent,
    aspect='auto',
    vmin=0,
    vmax=1
)
axs[1].set_title('Final output P(D0)')
axs[1].set_xlabel('Δ₂')
axs[1].set_ylabel('Δ₁')
fig.colorbar(im1, ax=axs[1], fraction=0.046, pad=0.04)

im2 = axs[2].imshow(
    p_d1_surface,
    origin='lower',
    extent=extent,
    aspect='auto',
    vmin=0,
    vmax=1
)
axs[2].set_title('Final output P(D1)')
axs[2].set_xlabel('Δ₂')
axs[2].set_ylabel('Δ₁')
fig.colorbar(im2, ax=axs[2], fraction=0.046, pad=0.04)

plt.tight_layout()
plt.savefig("outputs/nm_sequential_mzi_surfaces.png", bbox_inches="tight")
plt.show()

print("Saved: outputs/nm_sequential_mzi_surfaces.png")