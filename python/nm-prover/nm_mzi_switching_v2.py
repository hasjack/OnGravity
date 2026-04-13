import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

N_DELTA = 181
delta_vals = np.linspace(0, 2 * np.pi, N_DELTA)

NUM_HISTORIES = 4000
NUM_STEPS = 80

KAPPA = 0.6235
STEP_GAIN = 0.18
NOISE_SCALE = 0.015

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

def run_nm_arm(delta, arm_sign, num_histories, num_steps, kappa=KAPPA):
    b0 = STEP_GAIN * arm_sign * np.sin(delta / 2.0)
    x = np.full(num_histories, b0, dtype=np.float64)

    sigma = np.ones(num_histories, dtype=np.int8)

    flip_count = np.zeros(num_histories, dtype=np.int32)
    first_flip = np.full(num_histories, -1, dtype=np.int32)
    plus_count = np.zeros(num_histories, dtype=np.int32)
    minus_count = np.zeros(num_histories, dtype=np.int32)

    threshold = 0.08 + np.abs(b0) * 0.05 * kappa

    base_c = 0.00 + 0.08 * np.cos(delta / 2.0)
    arm_c_shift = 0.06 * arm_sign * np.sin(delta / 2.0)

    for n in range(num_steps):
        plus_mask = sigma > 0
        minus_mask = ~plus_mask
        plus_count += plus_mask
        minus_count += minus_mask

        noise = np.random.normal(0.0, NOISE_SCALE, size=num_histories)
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

    max_abs_x = np.max(np.abs(x))
    print(f"Δ={delta:.3f}, threshold={threshold:.3f}, max|x|={max_abs_x:.3f}")

    return {
        "flip_count": flip_count,
        "flip_parity": flip_parity,
        "first_flip": first_flip,
        "plus_frac": plus_frac,
        "minus_frac": minus_frac,
        "final_sigma": final_sigma,
    }

def nm_recombine(diag_A, diag_B):
    same_parity = (diag_A["flip_parity"] == diag_B["flip_parity"]).astype(float)
    occ_similarity = 1.0 - np.abs(diag_A["plus_frac"] - diag_B["plus_frac"])

    agreement = (
        0.70 * (2 * same_parity - 1)
        + 0.30 * (2 * occ_similarity - 1)
    )

    agreement = np.clip(agreement, -1.0, 1.0)
    p_d0 = 0.5 * (1.0 + agreement)
    p_d1 = 0.5 * (1.0 - agreement)

    return agreement, p_d0, p_d1

agreement_mean = np.zeros(N_DELTA)
p_d0_mean = np.zeros(N_DELTA)
p_d1_mean = np.zeros(N_DELTA)

same_sigma_mean = np.zeros(N_DELTA)
same_parity_mean = np.zeros(N_DELTA)
occ_similarity_mean = np.zeros(N_DELTA)

all_diags = []

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

    all_diags.append((diag_A, diag_B))

# choose representative points
key_targets = [1.0, 1.6, 3.1, 4.7, 5.6]
key_indices = [np.argmin(np.abs(delta_vals - t)) for t in key_targets]

print("\nRepresentative Δ diagnostics")
print("-" * 80)
for idx in key_indices:
    delta = delta_vals[idx]
    diag_A, diag_B = all_diags[idx]

    mean_flip_A = np.mean(diag_A["flip_count"])
    mean_flip_B = np.mean(diag_B["flip_count"])
    sigma_agree = np.mean(diag_A["final_sigma"] == diag_B["final_sigma"])
    parity_agree = np.mean(diag_A["flip_parity"] == diag_B["flip_parity"])
    occ_sim = np.mean(1.0 - np.abs(diag_A["plus_frac"] - diag_B["plus_frac"]))

    print(
        f"Δ={delta:.3f} | "
        f"P(D0)={p_d0_mean[idx]:.4f}, "
        f"P(D1)={p_d1_mean[idx]:.4f}, "
        f"<flips_A>={mean_flip_A:.3f}, "
        f"<flips_B>={mean_flip_B:.3f}, "
        f"σ_agree={sigma_agree:.3f}, "
        f"parity_agree={parity_agree:.3f}, "
        f"occ_sim={occ_sim:.3f}"
    )

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

axs[2].plot(delta_vals, same_parity_mean, lw=2, label='Flip parity agreement')
axs[2].plot(delta_vals, occ_similarity_mean, lw=2, label='Occupancy similarity')
axs[2].set_title('Arm-history diagnostics')
axs[2].set_xlabel('Relative arm setting Δ')
axs[2].set_ylabel('Mean score')
axs[2].grid(True, alpha=0.3)
axs[2].legend()

plt.tight_layout()
out_path = OUTPUT_DIR / "nm_mzi_switching_revisit_v2.png"
plt.savefig(out_path, bbox_inches="tight")
plt.close(fig)

print(f"\nSaved: {out_path}")