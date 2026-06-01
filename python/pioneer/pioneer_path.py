"""
Pioneer trajectory workbench.

This uses REBOUND's NASA Horizons bridge for initial states, then integrates the
Sun, planets, selected moons, and a Pioneer spacecraft forward in time. The
output is a compact NPZ plus an optional top-down animation in the ecliptic
plane.
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import tempfile
import warnings
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import rebound

os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
import matplotlib  # noqa: E402

matplotlib.use("Agg")
import matplotlib.animation as animation  # noqa: E402
import matplotlib.pyplot as plt  # noqa: E402


@dataclass(frozen=True)
class BodySpec:
    label: str
    horizons_id: str


PLANETS = [
    BodySpec("Mercury", "199"),
    BodySpec("Venus", "299"),
    BodySpec("Earth", "399"),
    BodySpec("Mars", "499"),
    BodySpec("Jupiter", "599"),
    BodySpec("Saturn", "699"),
    BodySpec("Uranus", "799"),
    BodySpec("Neptune", "899"),
]

MAJOR_MOONS = [
    BodySpec("Moon", "301"),
    BodySpec("Phobos", "401"),
    BodySpec("Deimos", "402"),
    BodySpec("Io", "501"),
    BodySpec("Europa", "502"),
    BodySpec("Ganymede", "503"),
    BodySpec("Callisto", "504"),
    BodySpec("Mimas", "601"),
    BodySpec("Enceladus", "602"),
    BodySpec("Tethys", "603"),
    BodySpec("Dione", "604"),
    BodySpec("Rhea", "605"),
    BodySpec("Titan", "606"),
    BodySpec("Iapetus", "608"),
    BodySpec("Miranda", "705"),
    BodySpec("Ariel", "701"),
    BodySpec("Umbriel", "702"),
    BodySpec("Titania", "703"),
    BodySpec("Oberon", "704"),
    BodySpec("Triton", "801"),
    BodySpec("Nereid", "802"),
    BodySpec("Proteus", "808"),
]

SPACECRAFT = {
    "Pioneer 10": BodySpec("Pioneer 10", "-23"),
    "Pioneer 11": BodySpec("Pioneer 11", "-24"),
}

SECONDS_PER_YEAR = 365.25 * 24.0 * 3600.0
AU_IN_KM = 149597870.7
AU_IN_M = AU_IN_KM * 1000.0
ACCEL_AU_YR2_TO_M_S2 = AU_IN_M / (SECONDS_PER_YEAR**2)
DEFAULT_KAPPA0_M_INV = 2.6e-26


def body_specs(spacecraft: str, moon_set: str) -> list[BodySpec]:
    names = [BodySpec("Sun", "10"), *PLANETS]
    if moon_set == "major":
        names.extend(MAJOR_MOONS)
    names.append(SPACECRAFT[spacecraft])
    return names


def add_horizons_body(sim: rebound.Simulation, spec: BodySpec, date: str) -> bool:
    try:
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")
            sim.add(spec.horizons_id, date=date)
        for warning in caught:
            print(f"warning for {spec.label}: {warning.message}")
        return True
    except Exception as exc:
        print(f"skip {spec.label}: {type(exc).__name__}: {exc}")
        return False


def build_simulation(specs: list[BodySpec], date: str) -> tuple[rebound.Simulation, list[str]]:
    sim = rebound.Simulation()
    sim.units = ("AU", "yr", "Msun")
    sim.integrator = "ias15"

    added = []
    for spec in specs:
        print(f"query Horizons: {spec.label} ({spec.horizons_id})")
        if add_horizons_body(sim, spec, date):
            added.append(spec.label)

    if "Sun" in added:
        sim.move_to_com()

    return sim, added


def kappa_residual_multiplier(r_au: float, kappa0: float) -> float:
    kr = kappa0 * r_au * AU_IN_M
    if kr > 700.0:
        return math.exp(700.0) - 1.0
    return math.exp(kr) - 1.0


def kappa_residual_m_s2(sim: rebound.Simulation, sun_index: int, craft_index: int, kappa0: float) -> float:
    sun = sim.particles[sun_index]
    craft = sim.particles[craft_index]
    dx = craft.x - sun.x
    dy = craft.y - sun.y
    dz = craft.z - sun.z
    r_au = math.sqrt(dx * dx + dy * dy + dz * dz)
    if r_au <= 0.0:
        return 0.0

    base_accel_au_yr2 = sim.G * sun.m / (r_au * r_au)
    residual_au_yr2 = base_accel_au_yr2 * kappa_residual_multiplier(r_au, kappa0)
    return residual_au_yr2 * ACCEL_AU_YR2_TO_M_S2


def attach_spacecraft_kappa(
    sim: rebound.Simulation,
    sun_index: int,
    craft_index: int,
    kappa0: float,
) -> None:
    def additional_forces(reb_sim):
        working = reb_sim.contents
        sun = working.particles[sun_index]
        craft = working.particles[craft_index]

        dx = craft.x - sun.x
        dy = craft.y - sun.y
        dz = craft.z - sun.z
        r2 = dx * dx + dy * dy + dz * dz
        if r2 <= 0.0:
            return

        r_au = math.sqrt(r2)
        residual_mag = working.G * sun.m / r2 * kappa_residual_multiplier(r_au, kappa0)
        craft.ax += -residual_mag * dx / r_au
        craft.ay += -residual_mag * dy / r_au
        craft.az += -residual_mag * dz / r_au

    sim.additional_forces = additional_forces
    sim.force_is_velocity_dependent = 0


def sample_system(
    sim: rebound.Simulation,
    added: list[str],
    spacecraft: str,
    years: float,
    samples: int,
    kappa0: float,
) -> dict[str, np.ndarray]:
    times = np.linspace(0.0, years, samples)
    positions = np.zeros((samples, len(added), 3), dtype=float)
    velocities = np.zeros((samples, len(added), 3), dtype=float)
    residual_accel = np.zeros(samples, dtype=float)
    sun_index = added.index("Sun") if "Sun" in added else 0
    craft_index = added.index(spacecraft)

    for i, t in enumerate(times):
        sim.integrate(float(t))
        for j, particle in enumerate(sim.particles):
            positions[i, j] = [particle.x, particle.y, particle.z]
            velocities[i, j] = [particle.vx, particle.vy, particle.vz]
        residual_accel[i] = kappa_residual_m_s2(sim, sun_index, craft_index, kappa0)

    rel = positions[:, craft_index, :] - positions[:, sun_index, :]
    r_au = np.linalg.norm(rel, axis=1)

    return {
        "time_years": times,
        "positions_au": positions,
        "velocities_au_yr": velocities,
        "pioneer_r_au": r_au,
        "kappa_residual_m_s2": residual_accel,
    }


def save_npz(data: dict[str, np.ndarray], added: list[str], output_dir: Path, spacecraft_slug: str, suffix: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_{suffix}_trajectory.npz"
    np.savez_compressed(path, body_names=np.array(added), **data)
    return path


def save_summary_csv(data: dict[str, np.ndarray], output_dir: Path, spacecraft_slug: str, suffix: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_{suffix}_summary.csv"

    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["time_years", "pioneer_r_au", "kappa_residual_m_s2"])
        for t, r, a in zip(data["time_years"], data["pioneer_r_au"], data["kappa_residual_m_s2"]):
            writer.writerow([f"{t:.9f}", f"{r:.9f}", f"{a:.12e}"])

    return path


def save_comparison_csv(
    baseline: dict[str, np.ndarray],
    framework: dict[str, np.ndarray],
    added: list[str],
    spacecraft: str,
    output_dir: Path,
    spacecraft_slug: str,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_kappa_comparison.csv"

    craft_index = added.index(spacecraft)
    delta_au = framework["positions_au"][:, craft_index, :] - baseline["positions_au"][:, craft_index, :]
    separation_km = np.linalg.norm(delta_au, axis=1) * AU_IN_KM

    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "time_years",
            "baseline_r_au",
            "framework_r_au",
            "path_separation_km",
            "kappa_residual_m_s2",
        ])
        for t, rb, rf, sep, accel in zip(
            baseline["time_years"],
            baseline["pioneer_r_au"],
            framework["pioneer_r_au"],
            separation_km,
            framework["kappa_residual_m_s2"],
        ):
            writer.writerow([f"{t:.9f}", f"{rb:.9f}", f"{rf:.9f}", f"{sep:.9f}", f"{accel:.12e}"])

    return path


def plot_kappa_comparison(
    baseline: dict[str, np.ndarray],
    framework: dict[str, np.ndarray],
    added: list[str],
    spacecraft: str,
    output_dir: Path,
    spacecraft_slug: str,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_kappa_comparison.png"

    craft_index = added.index(spacecraft)
    delta_au = framework["positions_au"][:, craft_index, :] - baseline["positions_au"][:, craft_index, :]
    separation_km = np.linalg.norm(delta_au, axis=1) * AU_IN_KM
    accel = np.maximum(framework["kappa_residual_m_s2"], 1e-30)

    fig, (ax_path, ax_accel) = plt.subplots(2, 1, figsize=(8.5, 7.0), sharex=True)
    fig.patch.set_facecolor("#f7f8fb")

    ax_path.plot(baseline["time_years"], separation_km, color="#d9534f", lw=2.0)
    ax_path.set_ylabel("Path separation [km]")
    ax_path.set_title(f"{spacecraft}: baseline vs κ-perturbed trajectory")
    ax_path.grid(alpha=0.3)

    ax_accel.semilogy(framework["time_years"], accel, color="#3569a8", lw=2.0, label="κ residual")
    ax_accel.axhspan(7.4e-10, 10.0e-10, color="#6495ed", alpha=0.15, label="historical Pioneer band")
    ax_accel.axhline(8.7e-10, color="#6495ed", ls="--", lw=1.2)
    ax_accel.set_xlabel("Time since start [yr]")
    ax_accel.set_ylabel("Sunward residual [m s^-2]")
    ax_accel.grid(alpha=0.3, which="both")
    ax_accel.legend(frameon=False)

    fig.tight_layout()
    fig.savefig(path, dpi=170)
    plt.close(fig)
    return path


def render_animation(
    data: dict[str, np.ndarray],
    added: list[str],
    spacecraft: str,
    output_dir: Path,
    spacecraft_slug: str,
    suffix: str,
    fps: int,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_{suffix}_trajectory.gif"

    time_years = data["time_years"]
    positions = data["positions_au"]
    craft_index = added.index(spacecraft)
    sun_index = added.index("Sun") if "Sun" in added else 0
    planet_labels = [spec.label for spec in PLANETS]
    moon_labels = [spec.label for spec in MAJOR_MOONS]
    planet_indices = [added.index(name) for name in planet_labels if name in added]
    moon_indices = [added.index(name) for name in moon_labels if name in added]

    rel = positions - positions[:, sun_index : sun_index + 1, :]
    craft_path = rel[:, craft_index, :]
    max_radius = max(5.0, float(np.nanmax(np.linalg.norm(craft_path[:, :2], axis=1))) * 1.1)

    fig, ax = plt.subplots(figsize=(7.5, 7.5))
    fig.patch.set_facecolor("#05070b")
    ax.set_facecolor("#05070b")
    ax.set_aspect("equal", adjustable="box")
    ax.set_xlim(-max_radius, max_radius)
    ax.set_ylim(-max_radius, max_radius)
    ax.set_xlabel("x [AU]", color="#d9e6f2")
    ax.set_ylabel("y [AU]", color="#d9e6f2")
    ax.tick_params(colors="#d9e6f2")
    ax.grid(color="#263241", alpha=0.5)
    for spine in ax.spines.values():
        spine.set_color("#263241")

    ax.scatter([0.0], [0.0], s=80, color="#ffd166", label="Sun")
    planet_scatter = ax.scatter([], [], s=24, color="#7db7ff", label="planets")
    moon_scatter = ax.scatter([], [], s=8, color="#b8c0cc", alpha=0.55, label="major moons")
    craft_scatter = ax.scatter([], [], s=32, color="#ff6f91", label=spacecraft)
    craft_line, = ax.plot([], [], color="#ff6f91", lw=1.6, alpha=0.9)
    title = ax.set_title("", color="#f6fbff")
    legend = ax.legend(loc="upper right", frameon=False)
    for text in legend.get_texts():
        text.set_color("#d9e6f2")

    stride = max(1, len(time_years) // 500)
    frame_indices = np.arange(0, len(time_years), stride)
    if frame_indices[-1] != len(time_years) - 1:
        frame_indices = np.append(frame_indices, len(time_years) - 1)

    def update(frame_index: int):
        planet_xy = rel[frame_index, planet_indices, :2] if planet_indices else np.empty((0, 2))
        moon_xy = rel[frame_index, moon_indices, :2] if moon_indices else np.empty((0, 2))
        craft_xy = rel[frame_index, craft_index, :2]
        planet_scatter.set_offsets(planet_xy)
        moon_scatter.set_offsets(moon_xy)
        craft_scatter.set_offsets([craft_xy])
        craft_line.set_data(craft_path[: frame_index + 1, 0], craft_path[: frame_index + 1, 1])
        title.set_text(f"{spacecraft} trajectory, t = {time_years[frame_index]:.2f} yr")
        return planet_scatter, moon_scatter, craft_scatter, craft_line, title

    ani = animation.FuncAnimation(fig, update, frames=frame_indices, interval=1000 / fps, blit=True)
    ani.save(path, writer=animation.PillowWriter(fps=fps))
    plt.close(fig)
    return path


def slugify(value: str) -> str:
    return value.lower().replace(" ", "_")


def main() -> None:
    parser = argparse.ArgumentParser(description="Integrate a Pioneer trajectory with REBOUND/Horizons")
    parser.add_argument("--spacecraft", choices=["Pioneer 10", "Pioneer 11"], default="Pioneer 10")
    parser.add_argument("--start-date", default="1973-12-04", help="Horizons epoch, e.g. 1973-12-04")
    parser.add_argument("--mode", choices=["baseline", "framework"], default="baseline", help="Single-run force model")
    parser.add_argument("--compare-kappa", action="store_true", help="Run baseline and κ-perturbed trajectories from the same initial state")
    parser.add_argument("--kappa0", type=float, default=DEFAULT_KAPPA0_M_INV, help="κ0 for Pioneer residual [m^-1]")
    parser.add_argument("--years", type=float, default=20.0, help="Integration duration in years")
    parser.add_argument("--samples", type=int, default=900, help="Output samples")
    parser.add_argument("--moon-set", choices=["none", "major"], default="major")
    parser.add_argument("--animate", action="store_true", help="Render an animated GIF")
    parser.add_argument("--fps", type=int, default=24, help="Animation frames per second")
    parser.add_argument("--out", default=str(Path(__file__).resolve().parent / "outputs"))
    args = parser.parse_args()

    specs = body_specs(args.spacecraft, args.moon_set)
    sim, added = build_simulation(specs, args.start_date)
    if args.spacecraft not in added:
        raise RuntimeError(f"{args.spacecraft} was not added; Horizons lookup failed.")

    output_dir = Path(args.out)
    spacecraft_slug = slugify(args.spacecraft)

    sun_index = added.index("Sun") if "Sun" in added else 0
    craft_index = added.index(args.spacecraft)

    if args.compare_kappa:
        baseline_sim = sim.copy()
        framework_sim = sim.copy()
        attach_spacecraft_kappa(framework_sim, sun_index, craft_index, args.kappa0)

        baseline = sample_system(
            baseline_sim,
            added,
            args.spacecraft,
            args.years,
            args.samples,
            args.kappa0,
        )
        framework = sample_system(
            framework_sim,
            added,
            args.spacecraft,
            args.years,
            args.samples,
            args.kappa0,
        )

        baseline_npz = save_npz(baseline, added, output_dir, spacecraft_slug, "baseline")
        framework_npz = save_npz(framework, added, output_dir, spacecraft_slug, "framework")
        comparison_csv = save_comparison_csv(baseline, framework, added, args.spacecraft, output_dir, spacecraft_slug)
        comparison_plot = plot_kappa_comparison(baseline, framework, added, args.spacecraft, output_dir, spacecraft_slug)

        print()
        print(f"Added bodies        : {len(added)} / {len(specs)}")
        print(f"Baseline final r    : {baseline['pioneer_r_au'][-1]:.3f} AU")
        print(f"Framework final r   : {framework['pioneer_r_au'][-1]:.3f} AU")
        print(f"Final separation    : {np.linalg.norm(framework['positions_au'][-1, craft_index] - baseline['positions_au'][-1, craft_index]) * AU_IN_KM:.3f} km")
        print(f"Final κ residual    : {framework['kappa_residual_m_s2'][-1]:.3e} m/s^2")
        print(f"Saved baseline      : {baseline_npz}")
        print(f"Saved framework     : {framework_npz}")
        print(f"Saved comparison    : {comparison_csv}")
        print(f"Saved plot          : {comparison_plot}")

        if args.animate:
            gif_path = render_animation(framework, added, args.spacecraft, output_dir, spacecraft_slug, "framework", args.fps)
            print(f"Saved animation     : {gif_path}")
        return

    if args.mode == "framework":
        attach_spacecraft_kappa(sim, sun_index, craft_index, args.kappa0)

    data = sample_system(sim, added, args.spacecraft, args.years, args.samples, args.kappa0)
    npz_path = save_npz(data, added, output_dir, spacecraft_slug, args.mode)
    csv_path = save_summary_csv(data, output_dir, spacecraft_slug, args.mode)

    print()
    print(f"Added bodies        : {len(added)} / {len(specs)}")
    print(f"Final distance      : {data['pioneer_r_au'][-1]:.3f} AU")
    print(f"Final κ residual    : {data['kappa_residual_m_s2'][-1]:.3e} m/s^2")
    print(f"Saved trajectory    : {npz_path}")
    print(f"Saved summary       : {csv_path}")

    if args.animate:
        gif_path = render_animation(data, added, args.spacecraft, output_dir, spacecraft_slug, args.mode, args.fps)
        print(f"Saved animation     : {gif_path}")


if __name__ == "__main__":
    main()
