"""
REBOUND baseline for the Galatea-Adams resonance geometry.

Neptune is massive, while Galatea and Adams tracers are massless circular
orbits. The baseline verifies the 43:42 mean-motion geometry; framework mode
adds a Neptune-centered κ acceleration multiplier in the same km/s units.
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import sys
import tempfile
from pathlib import Path

import numpy as np
import rebound

SOLAR_SYSTEM_DIR = Path(__file__).resolve().parents[1] / "solar-system"
sys.path.insert(0, str(SOLAR_SYSTEM_DIR))

from kappa_model import framework_multiplier_from_kappa, kappa_from_environment  # noqa: E402

os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
import matplotlib  # noqa: E402

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402


NEPTUNE_GM_KM3_S2 = 6.836529e6
GALATEA_A_KM = 61953.0
ADAMS_A_KM = 62933.0
SECONDS_PER_DAY = 86400.0


def radial_distance_km(particle, primary) -> float:
    dx = particle.x - primary.x
    dy = particle.y - primary.y
    dz = particle.z - primary.z
    return math.sqrt(dx * dx + dy * dy + dz * dz)


def circular_velocity_km_s(radius_km: float) -> float:
    return math.sqrt(NEPTUNE_GM_KM3_S2 / radius_km)


def circular_period_s(radius_km: float) -> float:
    return 2.0 * math.pi * math.sqrt(radius_km**3 / NEPTUNE_GM_KM3_S2)


def kappa_acceleration_delta_km_s2(particle, primary, kappa: float) -> tuple[float, float, float, float]:
    dx = particle.x - primary.x
    dy = particle.y - primary.y
    dz = particle.z - primary.z
    r2 = dx * dx + dy * dy + dz * dz
    if r2 <= 0.0:
        return 0.0, 0.0, 0.0, 1.0

    r_km = math.sqrt(r2)
    r3 = r2 * r_km
    ax = -NEPTUNE_GM_KM3_S2 * dx / r3
    ay = -NEPTUNE_GM_KM3_S2 * dy / r3
    az = -NEPTUNE_GM_KM3_S2 * dz / r3
    multiplier = framework_multiplier_from_kappa(kappa, r_km * 1000.0)
    delta = multiplier - 1.0
    return delta * ax, delta * ay, delta * az, multiplier


def apply_neptune_kappa_forces(reb_sim, kappa: float) -> None:
    sim = reb_sim.contents
    neptune = sim.particles[0]

    for i in range(1, sim.N):
        particle = sim.particles[i]
        dax, day, daz, _ = kappa_acceleration_delta_km_s2(particle, neptune, kappa)
        particle.ax += dax
        particle.ay += day
        particle.az += daz


def build_simulation(
    mode: str,
    rho: float,
    strain_rate: float,
) -> tuple[rebound.Simulation, float]:
    sim = rebound.Simulation()
    sim.G = 1.0
    sim.integrator = "ias15"

    sim.add(m=NEPTUNE_GM_KM3_S2)
    sim.add(m=0.0, x=GALATEA_A_KM, vy=circular_velocity_km_s(GALATEA_A_KM))
    sim.add(m=0.0, x=ADAMS_A_KM, vy=circular_velocity_km_s(ADAMS_A_KM))
    sim.move_to_com()

    kappa = 0.0
    if mode == "framework":
        kappa = kappa_from_environment(rho=rho, strain_rate=strain_rate)

        def additional_forces(reb_sim):
            apply_neptune_kappa_forces(reb_sim, kappa)

        sim.additional_forces = additional_forces
        sim.force_is_velocity_dependent = 0

    return sim, kappa


def integrate(samples: int, galatea_orbits: float, mode: str, rho: float, strain_rate: float) -> tuple[list[dict[str, float]], float]:
    sim, kappa = build_simulation(mode=mode, rho=rho, strain_rate=strain_rate)
    t_end = galatea_orbits * circular_period_s(GALATEA_A_KM)
    times = np.linspace(0.0, t_end, samples)

    rows = []
    for t in times:
        sim.integrate(float(t))
        neptune = sim.particles[0]
        galatea = sim.particles[1]
        adams = sim.particles[2]

        galatea_lon = math.atan2(galatea.y - neptune.y, galatea.x - neptune.x)
        adams_lon = math.atan2(adams.y - neptune.y, adams.x - neptune.x)
        _, _, _, galatea_multiplier = kappa_acceleration_delta_km_s2(galatea, neptune, kappa)
        _, _, _, adams_multiplier = kappa_acceleration_delta_km_s2(adams, neptune, kappa)

        rows.append(
            {
                "t_days": t / SECONDS_PER_DAY,
                "galatea_r_km": radial_distance_km(galatea, neptune),
                "adams_r_km": radial_distance_km(adams, neptune),
                "galatea_lon_rad": galatea_lon,
                "adams_lon_rad": adams_lon,
                "galatea_accel_multiplier": galatea_multiplier,
                "adams_accel_multiplier": adams_multiplier,
            }
        )

    galatea_unwrapped = np.unwrap([row["galatea_lon_rad"] for row in rows])
    adams_unwrapped = np.unwrap([row["adams_lon_rad"] for row in rows])
    resonant_angle = np.unwrap(43.0 * adams_unwrapped - 42.0 * galatea_unwrapped)

    for row, g_lon, a_lon, phi in zip(rows, galatea_unwrapped, adams_unwrapped, resonant_angle):
        row["galatea_lon_unwrapped_rad"] = float(g_lon)
        row["adams_lon_unwrapped_rad"] = float(a_lon)
        row["phi_43_42_rad"] = float(phi)

    return rows, kappa


def write_csv(rows: list[dict[str, float]], output_dir: Path, mode: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"galatea_adams_rebound_{mode}.csv"

    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    return path


def plot_phi(rows: list[dict[str, float]], output_dir: Path, mode: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"galatea_adams_resonant_angle_{mode}.png"

    t_days = np.array([row["t_days"] for row in rows])
    phi = np.array([row["phi_43_42_rad"] for row in rows])
    phi_deg = (np.rad2deg(phi) + 180.0) % 360.0 - 180.0

    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(t_days, phi_deg, color="#ff6f91", lw=2.0)
    ax.set_xlabel("Time [days]")
    ax.set_ylabel("43 lambda_Adams - 42 lambda_Galatea [deg]")
    ax.set_title(f"REBOUND {mode}: Adams/Galatea 43:42 Angle")
    ax.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(path, dpi=160)
    plt.close(fig)
    return path


def print_summary(rows: list[dict[str, float]], mode: str, kappa: float, rho: float, strain_rate: float) -> None:
    t = np.array([row["t_days"] * SECONDS_PER_DAY for row in rows])
    galatea_lon = np.array([row["galatea_lon_unwrapped_rad"] for row in rows])
    adams_lon = np.array([row["adams_lon_unwrapped_rad"] for row in rows])
    phi = np.array([row["phi_43_42_rad"] for row in rows])
    galatea_r = np.array([row["galatea_r_km"] for row in rows])
    adams_r = np.array([row["adams_r_km"] for row in rows])

    galatea_n = np.polyfit(t, galatea_lon, 1)[0]
    adams_n = np.polyfit(t, adams_lon, 1)[0]
    period_ratio = galatea_n / adams_n
    phi_drift_deg = math.degrees(phi[-1] - phi[0])

    print(f"REBOUND Galatea-Adams {mode}")
    print(f"Galatea period     : {circular_period_s(GALATEA_A_KM) / SECONDS_PER_DAY:.6f} days")
    print(f"Adams period       : {circular_period_s(ADAMS_A_KM) / SECONDS_PER_DAY:.6f} days")
    print(f"Period ratio A/G   : {period_ratio:.8f}  target={43.0 / 42.0:.8f}")
    print(f"43:42 angle drift  : {phi_drift_deg:+.6f} deg over run")
    print(f"Galatea radial span: {np.ptp(galatea_r):.6e} km")
    print(f"Adams radial span  : {np.ptp(adams_r):.6e} km")

    if mode == "framework":
        print(f"kappa              : {kappa:.3e} m^-1")
        print(f"rho, strain-rate   : {rho:.3e} kg/m^3, {strain_rate:.3e} s^-1")
        print(f"Galatea multiplier : {rows[-1]['galatea_accel_multiplier']:.16g}")
        print(f"Adams multiplier   : {rows[-1]['adams_accel_multiplier']:.16g}")


def main() -> None:
    parser = argparse.ArgumentParser(description="REBOUND Galatea-Adams resonance baseline")
    parser.add_argument("--mode", choices=["baseline", "framework"], default="baseline", help="Force model")
    parser.add_argument("--rho", type=float, default=1e-12, help="Environmental density for framework mode [kg/m^3]")
    parser.add_argument("--strain-rate", type=float, default=1e-7, help="Environmental strain rate for framework mode [s^-1]")
    parser.add_argument("--samples", type=int, default=800, help="Number of output samples")
    parser.add_argument("--galatea-orbits", type=float, default=80.0, help="Integration duration in Galatea periods")
    parser.add_argument("--out", default=str(Path(__file__).resolve().parent / "outputs"), help="Output directory")
    parser.add_argument("--no-plot", action="store_true", help="Skip PNG output")
    args = parser.parse_args()

    rows, kappa = integrate(
        samples=args.samples,
        galatea_orbits=args.galatea_orbits,
        mode=args.mode,
        rho=args.rho,
        strain_rate=args.strain_rate,
    )
    output_dir = Path(args.out)
    csv_path = write_csv(rows, output_dir, args.mode)
    plot_path = None if args.no_plot else plot_phi(rows, output_dir, args.mode)

    print_summary(rows, mode=args.mode, kappa=kappa, rho=args.rho, strain_rate=args.strain_rate)
    print()
    print(f"Saved: {csv_path}")
    if plot_path is not None:
        print(f"Saved: {plot_path}")


if __name__ == "__main__":
    main()
