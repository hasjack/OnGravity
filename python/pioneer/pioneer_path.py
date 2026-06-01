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


def sample_system(
    sim: rebound.Simulation,
    added: list[str],
    spacecraft: str,
    years: float,
    samples: int,
) -> dict[str, np.ndarray]:
    times = np.linspace(0.0, years, samples)
    positions = np.zeros((samples, len(added), 3), dtype=float)
    velocities = np.zeros((samples, len(added), 3), dtype=float)

    for i, t in enumerate(times):
        sim.integrate(float(t))
        for j, particle in enumerate(sim.particles):
            positions[i, j] = [particle.x, particle.y, particle.z]
            velocities[i, j] = [particle.vx, particle.vy, particle.vz]

    sun_index = added.index("Sun") if "Sun" in added else 0
    craft_index = added.index(spacecraft)
    rel = positions[:, craft_index, :] - positions[:, sun_index, :]
    r_au = np.linalg.norm(rel, axis=1)

    return {
        "time_years": times,
        "positions_au": positions,
        "velocities_au_yr": velocities,
        "pioneer_r_au": r_au,
    }


def save_npz(data: dict[str, np.ndarray], added: list[str], output_dir: Path, spacecraft_slug: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_trajectory.npz"
    np.savez_compressed(path, body_names=np.array(added), **data)
    return path


def save_summary_csv(data: dict[str, np.ndarray], output_dir: Path, spacecraft_slug: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_summary.csv"

    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["time_years", "pioneer_r_au"])
        for t, r in zip(data["time_years"], data["pioneer_r_au"]):
            writer.writerow([f"{t:.9f}", f"{r:.9f}"])

    return path


def render_animation(
    data: dict[str, np.ndarray],
    added: list[str],
    spacecraft: str,
    output_dir: Path,
    spacecraft_slug: str,
    fps: int,
) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{spacecraft_slug}_trajectory.gif"

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

    data = sample_system(sim, added, args.spacecraft, args.years, args.samples)
    output_dir = Path(args.out)
    spacecraft_slug = slugify(args.spacecraft)
    npz_path = save_npz(data, added, output_dir, spacecraft_slug)
    csv_path = save_summary_csv(data, output_dir, spacecraft_slug)

    print()
    print(f"Added bodies        : {len(added)} / {len(specs)}")
    print(f"Final distance      : {data['pioneer_r_au'][-1]:.3f} AU")
    print(f"Saved trajectory    : {npz_path}")
    print(f"Saved summary       : {csv_path}")

    if args.animate:
        gif_path = render_animation(data, added, args.spacecraft, output_dir, spacecraft_slug, args.fps)
        print(f"Saved animation     : {gif_path}")


if __name__ == "__main__":
    main()
