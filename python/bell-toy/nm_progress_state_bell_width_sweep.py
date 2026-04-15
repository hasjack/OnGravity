import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

NUM_PAIRS = 50000

# CHSH settings
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

# Widths to test
WIDTHS = [
    ("pi/6", np.pi / 6),
    ("pi/5", np.pi / 5),
    ("pi/4", np.pi / 4),
    ("pi/3", np.pi / 3),
]

def nm_update(s, p, delta):
    total = p + delta
    n_flips = np.floor(total).astype(int)
    p_new = total % 1.0
    s_new = np.where(n_flips % 2 == 0, s, -s)
    return s_new, p_new, n_flips

def nm_measure(s, p):
    return s

def correlation(x, y):
    return np.mean(x * y)

def chsh(Eab, Eabp, Eapb, Eapbp):
    return Eab + Eabp + Eapb - Eapbp

def wrap_angle(x):
    return (x + np.pi) % (2 * np.pi) - np.pi

# Shared source
lam = np.random.uniform(0.0, 2 * np.pi, size=NUM_PAIRS)
p0 = np.random.uniform(0.0, 1.0, size=NUM_PAIRS)
s0 = np.where(np.cos(lam) >= 0, 1, -1)

def make_local_delta(width):
    def local_delta(setting, lam):
        d = np.abs(wrap_angle(setting - lam))
        return np.where(
            d < width,
            0.85,   # strong progress
            0.20    # weak progress
        )
    return local_delta

summary = []
all_results = {}

for width_label, width_value in WIDTHS:
    local_delta = make_local_delta(width_value)

    results = []
    for label, setting_A, setting_B in SETTING_PAIRS:
        dA = local_delta(setting_A, lam)
        dB = local_delta(setting_B, lam)

        sA, pA, flipsA = nm_update(s0, p0, dA)
        sB, pB, flipsB = nm_update(s0, p0, dB)

        outA = nm_measure(sA, pA)
        outB = nm_measure(sB, pB)

        E = correlation(outA, outB)

        results.append({
            "label": label,
            "E": E,
            "mean_delta_A": np.mean(dA),
            "mean_delta_B": np.mean(dB),
            "mean_flips_A": np.mean(flipsA),
            "mean_flips_B": np.mean(flipsB),
            "same_sector": np.mean(sA == sB),
        })

    E_vals = {r["label"]: r["E"] for r in results}
    S = chsh(
        E_vals["a,b"],
        E_vals["a,b'"],
        E_vals["a',b"],
        E_vals["a',b'"],
    )

    all_results[width_label] = results
    summary.append((width_label, width_value, S))

print("\nNM progress-state Bell toy: width sweep")
print("-" * 80)
for width_label, width_value, S in summary:
    print(f"{width_label:>4s} | width={width_value:.4f} | CHSH S = {S:+.4f}")

print("\nDetailed results")
print("-" * 80)
for width_label, width_value, _ in summary:
    print(f"\nWidth {width_label} ({width_value:.4f})")
    for r in all_results[width_label]:
        print(
            f"{r['label']:5s} | "
            f"E={r['E']:+.4f} | "
            f"<δA>={r['mean_delta_A']:.3f} | "
            f"<δB>={r['mean_delta_B']:.3f} | "
            f"<flipsA>={r['mean_flips_A']:.3f} | "
            f"<flipsB>={r['mean_flips_B']:.3f} | "
            f"same_sector={r['same_sector']:.3f}"
        )

# Plot S vs width
labels = [x[0] for x in summary]
S_vals = [x[2] for x in summary]

fig, axs = plt.subplots(2, 1, figsize=(10, 8), dpi=180)

axs[0].plot(labels, S_vals, marker="o", linewidth=2)
axs[0].axhline(2.0, color="red", linestyle="--", linewidth=1.5, label="Classical CHSH bound")
axs[0].axhline(-2.0, color="red", linestyle="--", linewidth=1.5)
axs[0].set_ylabel("CHSH S")
axs[0].set_title("NM progress-state Bell toy: width sweep")
axs[0].legend()
axs[0].grid(True, alpha=0.3)

# Plot the four E values for each width
x = np.arange(len(WIDTHS))
width = 0.18

E_ab   = [dict((r["label"], r["E"]) for r in all_results[label])["a,b"] for label, _, _ in summary]
E_abp  = [dict((r["label"], r["E"]) for r in all_results[label])["a,b'"] for label, _, _ in summary]
E_apb  = [dict((r["label"], r["E"]) for r in all_results[label])["a',b"] for label, _, _ in summary]
E_apbp = [dict((r["label"], r["E"]) for r in all_results[label])["a',b'"] for label, _, _ in summary]

axs[1].bar(x - 1.5 * width, E_ab,   width, label="a,b")
axs[1].bar(x - 0.5 * width, E_abp,  width, label="a,b'")
axs[1].bar(x + 0.5 * width, E_apb,  width, label="a',b")
axs[1].bar(x + 1.5 * width, E_apbp, width, label="a',b'")
axs[1].set_xticks(x)
axs[1].set_xticklabels(labels)
axs[1].set_ylabel("Correlation E")
axs[1].set_title("Correlations by width")
axs[1].legend()
axs[1].grid(True, alpha=0.3)

plt.tight_layout()
out_path = OUTPUT_DIR / "nm_progress_state_bell_width_sweep.png"
plt.savefig(out_path, bbox_inches="tight")
plt.close(fig)

print(f"\nSaved: {out_path}")