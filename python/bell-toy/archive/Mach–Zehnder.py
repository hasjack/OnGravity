import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

NUM_HISTORIES = 12000
delta_vals = np.linspace(0, 2 * np.pi, 250)

# Tunable parameters
STEP_GAIN = 0.02
NOISE_SCALE = 0.02
RECOMB_SCALE = 0.45
NUM_STEPS = 120

def run_relative_accumulator(delta, num_histories=NUM_HISTORIES, num_steps=NUM_STEPS):
    """
    Evolve two real arm accumulators, but only observe their relative mismatch
    at recombination.

    Returns:
      r        : relative accumulator values
      signal   : smooth real recombination signal cos(r)
      p_d0     : soft D0 weight = (1 + cos(r)) / 2
      p_d1     : soft D1 weight = (1 - cos(r)) / 2
    """
    a_A = np.zeros(num_histories, dtype=np.float64)
    a_B = np.zeros(num_histories, dtype=np.float64)

    # Opposite-arm drift from path mismatch
    drift = STEP_GAIN * np.sin(delta / 2.0)

    for _ in range(num_steps):
        # Shared/common fluctuation plus independent arm noise
        common = np.random.normal(0.0, NOISE_SCALE * 0.4, size=num_histories)
        noise_A = np.random.normal(0.0, NOISE_SCALE, size=num_histories)
        noise_B = np.random.normal(0.0, NOISE_SCALE, size=num_histories)

        a_A += -drift + common + noise_A
        a_B += +drift + common + noise_B

    r = a_B - a_A

    # Smooth real recombination signal
    signal = np.cos(RECOMB_SCALE * r)

    # Soft detector weights from the recombination signal
    p_d0 = 0.5 * (1.0 + signal)
    p_d1 = 0.5 * (1.0 - signal)

    return r, signal, p_d0, p_d1

corr_nm = np.zeros_like(delta_vals)
p_d0_nm = np.zeros_like(delta_vals)
p_d1_nm = np.zeros_like(delta_vals)

for i, delta in enumerate(delta_vals):
    r, signal, p0, p1 = run_relative_accumulator(delta)

    corr_nm[i] = np.mean(signal)
    p_d0_nm[i] = np.mean(p0)
    p_d1_nm[i] = np.mean(p1)

# QM benchmark
corr_qm = np.cos(delta_vals)
p_d0_qm = np.cos(delta_vals / 2.0) ** 2
p_d1_qm = np.sin(delta_vals / 2.0) ** 2

fig, axs = plt.subplots(3, 1, figsize=(10, 10), dpi=200)

axs[0].plot(delta_vals, corr_qm, lw=2, label='QM target correlation cos(Δ)')
axs[0].plot(delta_vals, corr_nm, '--', lw=2, label='Relative-accumulator NM correlation')
axs[0].set_title('Emergent correlation from relative accumulator at recombination')
axs[0].set_ylabel('Correlation / signal')
axs[0].grid(True, alpha=0.3)
axs[0].legend()

axs[1].plot(delta_vals, p_d0_qm, lw=2, label='QM: P(D0)')
axs[1].plot(delta_vals, p_d0_nm, '--', lw=2, label='Relative-accumulator NM: P(D0)')
axs[1].set_title('Mach–Zehnder output D0')
axs[1].set_ylabel('Probability')
axs[1].grid(True, alpha=0.3)
axs[1].legend()

axs[2].plot(delta_vals, p_d1_qm, lw=2, label='QM: P(D1)')
axs[2].plot(delta_vals, p_d1_nm, '--', lw=2, label='Relative-accumulator NM: P(D1)')
axs[2].set_title('Mach–Zehnder output D1')
axs[2].set_xlabel('Relative path setting Δ')
axs[2].set_ylabel('Probability')
axs[2].grid(True, alpha=0.3)
axs[2].legend()

plt.tight_layout()
Path("outputs").mkdir(exist_ok=True)
plt.savefig("outputs/nm_mzi_relative_accumulator_v3.png", bbox_inches="tight")
plt.show()

print("Saved: outputs/nm_mzi_relative_accumulator_v3.png")