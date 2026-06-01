"""
Neptune ring diagnostics.

This script keeps the problem deliberately small: it treats Neptune's rings as
test-particle circular orbits, compares the Adams ring with Galatea's 42:43
mean-motion resonance, and optionally shows how the local kappa model would
change the circular period at each ring radius.
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

import numpy as np

SOLAR_SYSTEM_DIR = Path(__file__).resolve().parents[1] / "solar-system"
sys.path.insert(0, str(SOLAR_SYSTEM_DIR))

from kappa_model import framework_multiplier_from_kappa, kappa_from_environment  # noqa: E402


# Keep Matplotlib cache writes inside the workspace/temp area on locked-down
# machines where ~/.matplotlib is unavailable.
os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
import matplotlib  # noqa: E402

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402


NEPTUNE_EQUATORIAL_RADIUS_KM = 24764.0
NEPTUNE_GM_KM3_S2 = 6.836529e6
SECONDS_PER_DAY = 86400.0

GALATEA_A_KM = 61953.0
GALATEA_PERIOD_DAYS = 0.428745
ADAMS_RESONANCE_RATIO = 43.0 / 42.0


@dataclass(frozen=True)
class Ring:
    name: str
    radius_km: float
    width_km: float | None
    optical_depth: str
    note: str


RINGS = [
    Ring("Galle", 42000.0, 2000.0, "1e-4", "faint, wide"),
    Ring("Le Verrier", 53200.0, 100.0, "1e-2", "narrow"),
    Ring("Lassell", 55200.0, 4000.0, "1e-4", "wide, diffuse"),
    Ring("Arago", 57200.0, None, "", "outer Lassell enhancement"),
    Ring("Galatea dust", 61953.0, None, "", "dust near Galatea orbit"),
    Ring("Adams", 62933.0, 15.0, "0.01-0.1", "narrow, arc-bearing"),
]


def circular_period_days(radius_km: float, multiplier: float = 1.0) -> float:
    """Circular Kepler period for a central acceleration multiplier."""
    period_seconds = 2.0 * math.pi * math.sqrt(radius_km**3 / (NEPTUNE_GM_KM3_S2 * multiplier))
    return period_seconds / SECONDS_PER_DAY


def resonance_radius_km(inner_radius_km: float, period_ratio: float) -> float:
    """Radius of an exterior resonance from Kepler's third law."""
    return inner_radius_km * period_ratio ** (2.0 / 3.0)


def ring_rows(rho: float, strain_rate: float) -> list[dict[str, float | str]]:
    use_kappa = rho > 0.0 or strain_rate > 0.0
    kappa = kappa_from_environment(rho=max(rho, 0.0), strain_rate=max(strain_rate, 0.0)) if use_kappa else 0.0

    rows = []
    for ring in RINGS:
        baseline_period = circular_period_days(ring.radius_km)
        multiplier = 1.0
        kappa_period = baseline_period

        if use_kappa:
            multiplier = framework_multiplier_from_kappa(kappa, ring.radius_km * 1000.0)
            kappa_period = circular_period_days(ring.radius_km, multiplier=multiplier)

        rows.append(
            {
                "name": ring.name,
                "radius_km": ring.radius_km,
                "width_km": "" if ring.width_km is None else ring.width_km,
                "period_days": baseline_period,
                "kappa_period_days": kappa_period,
                "period_shift_seconds": (kappa_period - baseline_period) * SECONDS_PER_DAY,
                "accel_multiplier": multiplier,
                "optical_depth": ring.optical_depth,
                "note": ring.note,
            }
        )

    return rows


def write_csv(rows: list[dict[str, float | str]], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "neptune_rings_diagnostic.csv"

    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    return path


def plot_rings(rows: list[dict[str, float | str]], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "neptune_rings_diagnostic.png"

    theta = np.linspace(0.0, 2.0 * np.pi, 720)

    fig = plt.figure(figsize=(7.2, 7.2))
    ax = fig.add_subplot(111, projection="polar")
    ax.set_facecolor("#05070b")
    fig.patch.set_facecolor("#05070b")

    ax.fill(theta, np.full_like(theta, NEPTUNE_EQUATORIAL_RADIUS_KM), color="#4b8fbf", alpha=0.85)

    colors = {
        "Galle": "#6dd3ce",
        "Le Verrier": "#f2cf5b",
        "Lassell": "#8fbcff",
        "Arago": "#f08f68",
        "Galatea dust": "#e0e0e0",
        "Adams": "#ff6f91",
    }

    for row in rows:
        radius = float(row["radius_km"])
        width = row["width_km"]
        linewidth = 1.2 if width == "" else max(1.2, min(8.0, math.log10(float(width) + 10.0) * 2.0))
        ax.plot(
            theta,
            np.full_like(theta, radius),
            color=colors[str(row["name"])],
            lw=linewidth,
            alpha=0.85,
            label=str(row["name"]),
        )

    # Schematic Adams arcs: real arcs occupy clumpy sectors in Adams, not a full
    # separate ring. Longitudes here are visual placeholders for the clumping.
    adams_radius = 62933.0
    for start_deg, stop_deg in [(240, 248), (252, 260), (264, 272), (278, 286)]:
        arc_theta = np.deg2rad(np.linspace(start_deg, stop_deg, 90))
        ax.plot(arc_theta, np.full_like(arc_theta, adams_radius), color="#ffffff", lw=5.0)

    exact_resonance = resonance_radius_km(GALATEA_A_KM, ADAMS_RESONANCE_RATIO)
    ax.plot(
        theta,
        np.full_like(theta, exact_resonance),
        color="#ffffff",
        lw=0.9,
        ls="--",
        alpha=0.5,
        label="43:42 resonance",
    )
    ax.scatter([0.0], [GALATEA_A_KM], color="#ffffff", s=20)
    ax.text(np.deg2rad(355), GALATEA_A_KM - 1200.0, "Galatea", color="#d9e6f2", fontsize=9, ha="right")

    ax.set_ylim(0.0, 69000.0)
    ax.set_yticklabels([])
    ax.set_xticklabels([])
    ax.grid(color="#263241", alpha=0.55)
    ax.spines["polar"].set_color("#263241")
    ax.set_title("Neptune Ring Radii and Adams/Galatea Resonance", color="#f6fbff", pad=22)
    legend = ax.legend(
        loc="lower center",
        bbox_to_anchor=(0.5, -0.12),
        ncol=4,
        frameon=False,
        fontsize=8,
    )
    for text in legend.get_texts():
        text.set_color("#d9e6f2")

    fig.savefig(path, dpi=180, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def print_summary(rows: list[dict[str, float | str]], rho: float, strain_rate: float) -> None:
    exact_resonance = resonance_radius_km(GALATEA_A_KM, ADAMS_RESONANCE_RATIO)
    adams_offset = 62933.0 - exact_resonance

    print("Neptune ring circular-period diagnostic")
    print(f"Galatea period ratio target 43/42 gives radius: {exact_resonance:,.1f} km")
    print(f"Adams ring minus exact resonance radius: {adams_offset:+.1f} km")
    print()
    print(f"{'ring':<14} {'radius_km':>10} {'period_h':>10} {'kappa_shift_s':>14}")
    for row in rows:
        period_h = float(row["period_days"]) * 24.0
        print(
            f"{str(row['name']):<14} "
            f"{float(row['radius_km']):>10,.0f} "
            f"{period_h:>10.3f} "
            f"{float(row['period_shift_seconds']):>14.6g}"
        )

    if rho > 0.0 or strain_rate > 0.0:
        kappa = kappa_from_environment(rho=max(rho, 0.0), strain_rate=max(strain_rate, 0.0))
        print()
        print(f"kappa = {kappa:.3e} m^-1 for rho={rho:.3e} kg/m^3, strain_rate={strain_rate:.3e} s^-1")


def main() -> None:
    parser = argparse.ArgumentParser(description="Neptune ring orbital diagnostics")
    parser.add_argument("--rho", type=float, default=0.0, help="Environmental density for kappa model [kg/m^3]")
    parser.add_argument("--strain-rate", type=float, default=0.0, help="Environmental strain rate for kappa model [s^-1]")
    parser.add_argument("--out", default=str(Path(__file__).resolve().parent / "outputs"), help="Output directory")
    parser.add_argument("--no-plot", action="store_true", help="Skip PNG output")
    args = parser.parse_args()

    output_dir = Path(args.out)
    rows = ring_rows(rho=args.rho, strain_rate=args.strain_rate)
    csv_path = write_csv(rows, output_dir)
    plot_path = None if args.no_plot else plot_rings(rows, output_dir)

    print_summary(rows, rho=args.rho, strain_rate=args.strain_rate)
    print()
    print(f"Saved: {csv_path}")
    if plot_path is not None:
        print(f"Saved: {plot_path}")


if __name__ == "__main__":
    main()
