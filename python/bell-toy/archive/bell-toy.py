import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# --------------------------------------------------
# NM Bell / CHSH toy parameters
# --------------------------------------------------
NUM_PAIRS = 50000
NUM_STEPS = 60

KAPPA = 0.6235
NOISE_SCALE = 0.01

BIAS_SCALE = 0.10
SETTING_SCALE = 0.08

# Keep the currently "awake" threshold regime
THRESHOLD_BASE = 0.08
THRESHOLD_KAPPA_SCALE = 0.05

# Standard CHSH-style benchmark settings
a = 0.0
a_p = np.pi / 2
b = np.pi / 4
b_p = -np.pi / 4

SETTING_PAIRS = [
    ("a,b", a, b),
    ("a,b'", a, b_p),
    ("a',b", a_p, b),
    ("a',b'", a_p, b_p),
]

# --------------------------------------------------
# Shared source
# --------------------------------------------------
def generate_shared_source(num_pairs):
    lam = np.random.uniform(0.0, 2 * np.pi, size=num_pairs)
    b_seed = BIAS_SCALE * np.sin(lam)
    sigma_seed = np.where(np.cos(lam) >= 0, 1, -1).astype(np.int8)

    return {
        "lam": lam,
        "b_seed": b_seed,
        "sigma_seed": sigma_seed,
    }

# --------------------------------------------------
# Local NM wing evolution
# --------------------------------------------------
def run_nm_wing(setting, shared, wing_sign, num_steps=NUM_STEPS):
    lam = shared["lam"]
    b_seed = shared["b_seed"]
    sigma_seed = shared["sigma_seed"]

    x = b_seed + wing_sign * SETTING_SCALE * np.sin(setting - lam)
    sigma = sigma_seed.copy()

    flip_count = np.zeros_like(x, dtype=np.int32)
    plus_count = np.zeros_like(x, dtype=np.int32)
    minus_count = np.zeros_like(x, dtype=np.int32)

    threshold = THRESHOLD_BASE + np.abs(x) * THRESHOLD_KAPPA_SCALE * KAPPA

    for _ in range(num_steps):
        plus_mask = sigma > 0
        minus_mask = ~plus_mask
        plus_count += plus_mask
        minus_count += minus_mask

        noise = np.random.normal(0.0, NOISE_SCALE, size=len(x))

        c_local = (
            -0.05
            + 0.06 * np.cos(setting - lam)
            + wing_sign * 0.02 * np.sin(setting - lam)
            + noise
        )

        x_next = sigma * x * x + c_local

        flip_mask = np.abs(x_next) > threshold
        flip_count += flip_mask.astype(np.int32)

        sigma = np.where(flip_mask, -sigma, sigma)
        x = np.clip(x_next, -10.0, 10.0)

    plus_frac = plus_count / num_steps
    final_sigma = sigma.copy()

    # Binary outputs
    out_sigma = np.where(final_sigma > 0, 1, -1)
    out_occupancy = np.where(plus_frac > 0.80, 1, -1)

    return {
        "out_sigma": out_sigma,
        "out_occupancy": out_occupancy,
        "flip_count": flip_count,
        "plus_frac": plus_frac,
        "final_sigma": final_sigma,
    }

# --------------------------------------------------
# Correlation helpers
# --------------------------------------------------
def correlation(x, y):
    return np.mean(x * y)

def chsh(Eab, Eabp, Eapb, Eapbp):
    return Eab + Eabp + Eapb - Eapbp

# --------------------------------------------------
# Run experiment
# --------------------------------------------------
shared = generate_shared_source(NUM_PAIRS)

results = []

for label, setting_A, setting_B in SETTING_PAIRS:
    wing_A = run_nm_wing(setting_A, shared, wing_sign=-1)
    wing_B = run_nm_wing(setting_B, shared, wing_sign=+1)

    E_sigma = correlation(wing_A["out_sigma"], wing_B["out_sigma"])
    E_occupancy = correlation(wing_A["out_occupancy"], wing_B["out_occupancy"])

    results.append({
        "label": label,
        "setting_A": setting_A,
        "setting_B": setting_B,
        "E_sigma": E_sigma,
        "E_occupancy": E_occupancy,
        "mean_flips_A": np.mean(wing_A["flip_count"]),
        "mean_flips_B": np.mean(wing_B["flip_count"]),
        "plus_frac_A": np.mean(wing_A["plus_frac"]),
        "plus_frac_B": np.mean(wing_B["plus_frac"]),
    })

E_sigma_vals = {r["label"]: r["E_sigma"] for r in results}
E_occupancy_vals = {r["label"]: r["E_occupancy"] for r in results}

S_sigma = chsh(
    E_sigma_vals["a,b"],
    E_sigma_vals["a,b'"],
    E_sigma_vals["a',b"],
    E_sigma_vals["a',b'"],
)

S_occupancy = chsh(
    E_occupancy_vals["a,b"],
    E_occupancy_vals["a,b'"],
    E_occupancy_vals["a',b"],
    E_occupancy_vals["a',b'"],
)

# --------------------------------------------------
# Print summary
# --------------------------------------------------
print("\nNM Bell / CHSH toy results")
print("-" * 72)
for r in results:
    print(
        f"{r['label']:5s} | "
        f"E_sigma={r['E_sigma']:+.4f} | "
        f"E_occupancy={r['E_occupancy']:+.4f} | "
        f"<flips_A>={r['mean_flips_A']:.3f} | "
        f"<flips_B>={r['mean_flips_B']:.3f} | "
        f"<plus_A>={r['plus_frac_A']:.3f} | "
        f"<plus_B>={r['plus_frac_B']:.3f}"
    )

print("\nCHSH scores")
print(f"S_sigma      = {S_sigma:+.4f}")
print(f"S_occupancy  = {S_occupancy:+.4f}")

# --------------------------------------------------
# Plot
# --------------------------------------------------
labels = [r["label"] for r in results]
x = np.arange(len(labels))
width = 0.35

fig, axs = plt.subplots(2, 1, figsize=(10, 8), dpi=180)

axs[0].bar(
    x - width / 2,
    [r["E_sigma"] for r in results],
    width,
    label="E from final orientation"
)
axs[0].bar(
    x + width / 2,
    [r["E_occupancy"] for r in results],
    width,
    label="E from occupancy threshold"
)
axs[0].axhline(0.0, color="black", linewidth=1)
axs[0].set_xticks(x)
axs[0].set_xticklabels(labels)
axs[0].set_ylabel("Correlation E")
axs[0].set_title("NM Bell toy correlations")
axs[0].legend()
axs[0].grid(True, alpha=0.3)

axs[1].bar(
    ["S_sigma", "S_occupancy"],
    [S_sigma, S_occupancy],
)
axs[1].axhline(2.0, color="red", linestyle="--", linewidth=1.5, label="Classical CHSH bound")
axs[1].axhline(-2.0, color="red", linestyle="--", linewidth=1.5)
axs[1].set_ylabel("CHSH S")
axs[1].set_title("NM Bell toy CHSH scores")
axs[1].legend()
axs[1].grid(True, alpha=0.3)

plt.tight_layout()
out_path = OUTPUT_DIR / "nm_bell_chsh_toy_occupancy.png"
plt.savefig(out_path, bbox_inches="tight")
plt.close(fig)

print(f"\nSaved: {out_path}")