import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

# -----------------------------
# Parameters
# -----------------------------
N_DELTA = 181
delta_vals = np.linspace(0, 2 * np.pi, N_DELTA)

NUM_HISTORIES = 4000
NUM_STEPS = 80

KAPPA = 0.6235
STEP_GAIN = 0.18
NOISE_SCALE = 0.015

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# -----------------------------
# NM arm dynamics
# -----------------------------
def run_nm_arm(delta, arm_sign, num_histories, num_steps, kappa=0.6235):
    """
    NM-style arm evolution with a persistent arm distinction.

    arm_sign = -1 for arm A, +1 for arm B
    """
    b0 = 0.18 * arm_sign * np.sin(delta / 2.0)
    x = np.full(num_histories, b0, dtype=np.float64)

    # Opposite initial orientation per arm
    sigma = np.full(num_histories, arm_sign, dtype=np.int8)

    flip_count = np.zeros(num_histories, dtype=np.int32)
    first_flip = np.full(num_histories, -1, dtype=np.int32)
    plus_count = np.zeros(num_histories, dtype=np.int32)
    minus_count = np.zeros(num_histories, dtype=np.int32)

    threshold = 1.0 + np.abs(b0) * kappa

    base_c = -0.35
    arm_c_shift = 0.12 * arm_sign * np.sin(delta / 2.0)

    for n in range(num_steps):
        plus_mask = sigma > 0
        minus_mask = ~plus_mask
        plus_count += plus_mask
        minus_count += minus_mask

        noise = np.random.normal(0.0, 0.015, size=num_histories)

        # Arm-dependent drive survives the first iterate
        c_n = base_c + arm_c_shift + noise

        x_next = sigma * x * x + c_n

        flip_mask = np.abs(x_next) > threshold
        new_flips = flip_mask & (first_flip < 0)
        first_flip[new_flips] = n

        flip_count += flip_mask.astype(np.int32)
        sigma = np.where(flip_mask, -sigma, sigma)
        x = np.clip(x_next, -10.0, 10.0)

    plus_frac = plus_count / num_steps
    minus_frac = minus_count / num_steps
    flip_parity = flip_count % 2
    final_sigma = sigma.copy()

    return {
        "flip_count": flip_count,
        "flip_parity": flip_parity,
        "first_flip": first_flip,
        "plus_frac": plus_frac,
        "minus_frac": minus_frac,
        "final_sigma": final_sigma,
    }

# -----------------------------
# NM-native recombination rule
# -----------------------------
def nm_recombine(diag_A, diag_B):
    """
    Construct an NM-native agreement score from arm diagnostics.

    Terms:
    - final orientation agreement
    - flip parity agreement
    - occupancy similarity
    - first-flip synchrony
    """
    same_sigma = (diag_A["final_sigma"] == diag_B["final_sigma"]).astype(float)
    same_parity = (diag_A["flip_parity"] == diag_B["flip_parity"]).astype(float)

    occ_similarity = 1.0 - np.abs(diag_A["plus_frac"] - diag_B["plus_frac"])

    ff_A = diag_A["first_flip"].astype(float)
    ff_B = diag_B["first_flip"].astype(float)

    # If neither flipped, treat as perfect synchrony.
    both_none = (ff_A < 0) & (ff_B < 0)
    one_none = ((ff_A < 0) ^ (ff_B < 0))
    both_seen = (ff_A >= 0) & (ff_B >= 0)

    ff_sync = np.zeros_like(ff_A, dtype=float)
    ff_sync[both_none] = 1.0
    ff_sync[one_none] = 0.0
    ff_sync[both_seen] = 1.0 - np.minimum(np.abs(ff_A[both_seen] - ff_B[both_seen]) / NUM_STEPS, 1.0)

    # Weighted NM agreement score in [-1, 1]
    agreement = (
        0.35 * (2 * same_sigma - 1)
        + 0.35 * (2 * same_parity - 1)
        + 0.20 * (2 * occ_similarity - 1)
        + 0.10 * (2 * ff_sync - 1)
    )

    agreement = np.clip(agreement, -1.0, 1.0)

    p_d0 = 0.5 * (1.0 + agreement)
    p_d1 = 0.5 * (1.0 - agreement)

    return agreement, p_d0, p_d1

# -----------------------------
# Sweep
# -----------------------------
agreement_mean = np.zeros(N_DELTA)
p_d0_mean = np.zeros(N_DELTA)
p_d1_mean = np.zeros(N_DELTA)

same_sigma_mean = np.zeros(N_DELTA)
same_parity_mean = np.zeros(N_DELTA)
occ_similarity_mean = np.zeros(N_DELTA)
ff_sync_mean = np.zeros(N_DELTA)

for i, delta in enumerate(delta_vals):
    diag_A = run_nm_arm(delta, arm_sign=-1, num_histories=NUM_HISTORIES, num_steps=NUM_STEPS)
    diag_B = run_nm_arm(delta, arm_sign=+1, num_histories=NUM_HISTORIES, num_steps=NUM_STEPS)

    agreement, p_d0, p_d1 = nm_recombine(diag_A, diag_B)

    agreement_mean[i] = np.mean(agreement)
    p_d0_mean[i] = np.mean(p_d0)
    p_d1_mean[i] = np.mean(p_d1)

    same_sigma_mean[i] = np.mean(diag_A["final_sigma"] == diag_B["final_sigma"])
    same_parity_mean[i] = np.mean(diag_A["flip_parity"] == diag_B["flip_parity"])
    occ_similarity_mean[i] = np.mean(1.0 - np.abs(diag_A["plus_frac"] - diag_B["plus_frac"]))

    ff_A = diag_A["first_flip"].astype(float)
    ff_B = diag_B["first_flip"].astype(float)
    both_none = (ff_A < 0) & (ff_B < 0)
    one_none = ((ff_A < 0) ^ (ff_B < 0))
    both_seen = (ff_A >= 0) & (ff_B >= 0)
    ff_sync = np.zeros_like(ff_A, dtype=float)
    ff_sync[both_none] = 1.0
    ff_sync[one_none] = 0.0
    ff_sync[both_seen] = 1.0 - np.minimum(np.abs(ff_A[both_seen] - ff_B[both_seen]) / NUM_STEPS, 1.0)
    ff_sync_mean[i] = np.mean(ff_sync)

# -----------------------------
# Plot
# -----------------------------
fig, axs = plt.subplots(3, 1, figsize=(12, 10), dpi=180)

axs[0].plot(delta_vals, p_d0_mean, lw=2, label='NM-native P(D0)')
axs[0].plot(delta_vals, p_d1_mean, lw=2, label='NM-native P(D1)')
axs[0].set_title('NM MZI revisit: detector preference from switching agreement')
axs[0].set_ylabel('Probability')
axs[0].grid(True, alpha=0.3)
axs[0].legend()

axs[1].plot(delta_vals, agreement_mean, lw=2, label='Agreement score')
axs[1].set_title('Net NM agreement signal')
axs[1].set_ylabel('Signal')
axs[1].grid(True, alpha=0.3)
axs[1].legend()

axs[2].plot(delta_vals, same_sigma_mean, lw=2, label='Final σ agreement')
axs[2].plot(delta_vals, same_parity_mean, lw=2, label='Flip parity agreement')
axs[2].plot(delta_vals, occ_similarity_mean, lw=2, label='Occupancy similarity')
axs[2].plot(delta_vals, ff_sync_mean, lw=2, label='First-flip synchrony')
axs[2].set_title('Arm-history diagnostics')
axs[2].set_xlabel('Relative arm setting Δ')
axs[2].set_ylabel('Mean score')
axs[2].grid(True, alpha=0.3)
axs[2].legend()

plt.tight_layout()
out_path = OUTPUT_DIR / "nm_mzi_switching_revisit.png"
plt.savefig(out_path, bbox_inches="tight")
plt.close(fig)

print(f"Saved: {out_path}")
print("Done.")