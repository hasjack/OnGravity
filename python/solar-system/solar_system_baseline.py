"""
Solar System diagnostics using REBOUND.

Modes
-----
- baseline   : Newtonian reference
- framework  : κ(ρ, S) framework-based modification
- sparc_fit  : empirical SPARC-style modifier
"""

import argparse
from dataclasses import dataclass
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import rebound

from kappa_model import (
    apply_kappa_additional_forces,
    print_strain_rate_targets,
)

JUPITER_R_M = 5.2 * 1.495978707e11
SAFE_LIMIT = 1e-6       # AU  (essentially Newtonian)
DISTORT_LIMIT = 1e-2    # AU  (orbit noticeably altered)


@dataclass
class SimulationConfig:
    years: float = 200.0
    steps: int = 4000
    output_dir: str = "outputs"
    save_plots: bool = True


@dataclass
class KappaConfig:
    mode: str = "baseline"  # baseline | framework | sparc_fit
    a: float = -0.5
    b: float = 0.5
    c: float = 0.0
    use_shear: bool = False
    rho: float = 0.0
    strain_rate: float = 0.0
    kappa0: float = 2.6e-26
    kv: float = 5e-26
    rho0: float = 1600.0


def build_simulation():
    sim = rebound.Simulation()
    sim.units = ("AU", "day", "Msun")
    sim.integrator = "ias15"

    bodies = [
        "Sun",
        "Mercury",
        "Venus",
        "Earth",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
    ]

    for body in bodies:
        sim.add(body)

    sim.move_to_com()
    return sim, bodies


def plot_jupiter_trajectory(jx, jy, years, mode, out_path):
    plt.figure(figsize=(6, 6))
    plt.plot(jx, jy, label="Jupiter")
    plt.scatter(0, 0, s=80, label="Sun")
    plt.gca().set_aspect("equal")
    plt.xlabel("x [AU]")
    plt.ylabel("y [AU]")
    plt.title(f"Jupiter trajectory ({years} years, mode={mode})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / f"jupiter_trajectory_{mode}.png")
    plt.close()


def plot_energy_diagnostic(times, energy_error, mode, out_path):
    plt.figure(figsize=(7, 4))
    plt.plot(times, energy_error)
    plt.xlabel("Time [years]")
    plt.ylabel("Relative energy error")
    plt.title(f"Energy diagnostic ({mode})")
    plt.tight_layout()
    plt.savefig(out_path / f"energy_error_{mode}.png")
    plt.close()


def run_simulation(
    sim_template,
    bodies,
    sim_config: SimulationConfig,
    kappa_config: KappaConfig,
):
    out_path = Path(sim_config.output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    sim = sim_template.copy()
    jupiter_index = bodies.index("Jupiter")

    if kappa_config.mode in {"framework", "sparc_fit"}:
        def additional_forces(reb_sim):
            sim_ptr = reb_sim.contents
            apply_kappa_additional_forces(
                sim_ptr,
                model=kappa_config.mode,
                a=kappa_config.a,
                b=kappa_config.b,
                c=kappa_config.c,
                use_shear=kappa_config.use_shear,
                rho=kappa_config.rho,
                strain_rate=kappa_config.strain_rate,
                kappa0=kappa_config.kappa0,
                kv=kappa_config.kv,
                rho0=kappa_config.rho0,
            )
        sim.additional_forces = additional_forces

    sim.force_is_velocity_dependent = 0

    dt = sim_config.years * 365.25 / float(sim_config.steps)
    times = []
    energy_error = []
    jx, jy = [], []
    jvx, jvy = [], []
    jax, jay = [], []
    ja, je = [], []

    E0 = sim.energy()

    for i in range(sim_config.steps):
        t = i * dt
        sim.integrate(t)

        times.append(t / 365.25)
        E = sim.energy()
        energy_error.append((E - E0) / abs(E0))

        p = sim.particles[jupiter_index]
        jx.append(p.x)
        jy.append(p.y)
        jvx.append(p.vx)
        jvy.append(p.vy)
        jax.append(p.ax)
        jay.append(p.ay)
        orbit = p.orbit(primary=sim.particles[0])
        ja.append(orbit.a)
        je.append(orbit.e)

    if sim_config.save_plots:
        plot_jupiter_trajectory(jx, jy, sim_config.years, kappa_config.mode, out_path)
        plot_energy_diagnostic(times, energy_error, kappa_config.mode, out_path)

        print("Saved:")
        print(f" - {out_path / f'jupiter_trajectory_{kappa_config.mode}.png'}")
        print(f" - {out_path / f'energy_error_{kappa_config.mode}.png'}")

    return (
        np.array(times),
        np.array(jx),
        np.array(jy),
        np.array(jvx),
        np.array(jvy),
        np.array(jax),
        np.array(jay),
        np.array(ja),
        np.array(je),
    )


def plot_comparison_diagnostics(
    time_years,
    jx_base,
    jy_base,
    jvx_base,
    jvy_base,
    jax_base,
    jay_base,
    ja_base,
    je_base,
    jx_mod,
    jy_mod,
    jvx_mod,
    jvy_mod,
    jax_mod,
    jay_mod,
    ja_mod,
    je_mod,
    output_dir: str,
):
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # Position residual
    delta_r = np.sqrt((jx_mod - jx_base) ** 2 + (jy_mod - jy_base) ** 2)

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_r)
    plt.xlabel("Time [years]")
    plt.ylabel("Orbital deviation [AU]")
    plt.title("Deviation from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "orbit_difference.png")
    plt.close()

    # Velocity residual
    delta_v = np.sqrt((jvx_mod - jvx_base) ** 2 + (jvy_mod - jvy_base) ** 2)

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_v)
    plt.xlabel("Time [years]")
    plt.ylabel("Velocity deviation [AU/day]")
    plt.title("Velocity deviation from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "velocity_difference.png")
    plt.close()

    # Radial acceleration residual
    dax = jax_mod - jax_base
    day = jay_mod - jay_base

    r_norm = np.sqrt(jx_base ** 2 + jy_base ** 2)
    rhat_x = jx_base / r_norm
    rhat_y = jy_base / r_norm

    delta_a_r = dax * rhat_x + day * rhat_y

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_a_r)
    plt.xlabel("Time [years]")
    plt.ylabel("Radial acceleration residual [AU/day²]")
    plt.title("Radial acceleration residual from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "radial_acceleration_difference.png")
    plt.close()

    # Orbital radius time series
    r_base = np.sqrt(jx_base ** 2 + jy_base ** 2)
    r_mod = np.sqrt(jx_mod ** 2 + jy_mod ** 2)
    delta_radius = r_mod - r_base

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, r_base, label="Baseline")
    plt.plot(time_years, r_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Orbital radius [AU]")
    plt.title("Jupiter orbital radius")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "orbital_radius_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_radius)
    plt.xlabel("Time [years]")
    plt.ylabel("Radius difference [AU]")
    plt.title("Orbital radius difference from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "orbital_radius_difference.png")
    plt.close()

    # Semi-major axis comparison
    plt.figure(figsize=(7, 4))
    plt.plot(time_years, ja_base, label="Baseline")
    plt.plot(time_years, ja_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Semi-major axis [AU]")
    plt.title("Jupiter semi-major axis")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "semi_major_axis_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, ja_mod - ja_base)
    plt.xlabel("Time [years]")
    plt.ylabel("Semi-major axis difference [AU]")
    plt.title("Semi-major axis difference from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "semi_major_axis_difference.png")
    plt.close()

    # Eccentricity comparison
    plt.figure(figsize=(7, 4))
    plt.plot(time_years, je_base, label="Baseline")
    plt.plot(time_years, je_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Eccentricity")
    plt.title("Jupiter eccentricity")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "eccentricity_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, je_mod - je_base)
    plt.xlabel("Time [years]")
    plt.ylabel("Eccentricity difference")
    plt.title("Eccentricity difference from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "eccentricity_difference.png")
    plt.close()

    print("Saved:")
    print(f" - {out_path / 'orbit_difference.png'}")
    print(f" - {out_path / 'velocity_difference.png'}")
    print(f" - {out_path / 'radial_acceleration_difference.png'}")
    print(f" - {out_path / 'orbital_radius_comparison.png'}")
    print(f" - {out_path / 'orbital_radius_difference.png'}")
    print(f" - {out_path / 'semi_major_axis_comparison.png'}")
    print(f" - {out_path / 'semi_major_axis_difference.png'}")
    print(f" - {out_path / 'eccentricity_comparison.png'}")
    print(f" - {out_path / 'eccentricity_difference.png'}")


def plot_strain_rate_sweep(
    years: float,
    steps: int,
    rho: float,
    kappa0: float,
    kv: float,
    rho0: float,
    output_dir: str,
):
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    strain_rates = np.concatenate([
        np.logspace(-9, -7, 6, endpoint=False),
        np.logspace(-7, -5, 12),
    ])

    sim_template, bodies = build_simulation()

    sweep_sim_config = SimulationConfig(
        years=years,
        steps=steps,
        output_dir=output_dir,
        save_plots=False,
    )

    baseline_config = KappaConfig(
        mode="baseline",
        rho=rho,
        strain_rate=0.0,
        kappa0=kappa0,
        kv=kv,
        rho0=rho0,
    )

    (
        time_years,
        jx_base,
        jy_base,
        jvx_base,
        jvy_base,
        jax_base,
        jay_base,
        ja_base,
        je_base,
    ) = run_simulation(
        sim_template=sim_template,
        bodies=bodies,
        sim_config=sweep_sim_config,
        kappa_config=baseline_config,
    )

    max_delta_r = []
    final_delta_r = []
    regimes = []

    for strain_rate in strain_rates:
        framework_config = KappaConfig(
            mode="framework",
            rho=rho,
            strain_rate=strain_rate,
            kappa0=kappa0,
            kv=kv,
            rho0=rho0,
        )

        (
            _,
            jx_mod,
            jy_mod,
            jvx_mod,
            jvy_mod,
            jax_mod,
            jay_mod,
            ja_mod,
            je_mod,
        ) = run_simulation(
            sim_template=sim_template,
            bodies=bodies,
            sim_config=sweep_sim_config,
            kappa_config=framework_config,
        )

        delta_r = np.sqrt((jx_mod - jx_base) ** 2 + (jy_mod - jy_base) ** 2)

        max_r = np.max(delta_r)
        final_r = delta_r[-1]

        max_delta_r.append(max_r)
        final_delta_r.append(final_r)

        if max_r < SAFE_LIMIT:
            regime = "safe"
        elif max_r < DISTORT_LIMIT:
            regime = "distorted"
        else:
            regime = "unstable"

        regimes.append(regime)

        print(
            f"strain_rate={strain_rate:.3e}  "
            f"max_delta_r={max_r:.3e} AU  "
            f"final_delta_r={final_r:.3e} AU  "
            f"regime={regime}"
        )

    print("len(strain_rates) =", len(strain_rates))
    print("len(max_delta_r) =", len(max_delta_r))
    print("len(final_delta_r) =", len(final_delta_r))
    print("len(regimes) =", len(regimes))

    plt.figure(figsize=(7, 4))
    plt.loglog(strain_rates, max_delta_r, marker="o", label="max Δr")
    plt.loglog(strain_rates, final_delta_r, marker="s", label="final Δr")

    for s, regime in zip(strain_rates, regimes):
        color = (
            "green" if regime == "safe"
            else "orange" if regime == "distorted"
            else "red"
        )
        plt.scatter(s, 1e-12, color=color, s=40)

    plt.xlabel("Strain-rate [s⁻¹]")
    plt.ylabel("Orbital deviation [AU]")
    plt.title(f"Framework stability sweep at rho={rho:.1e} kg/m³")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "strain_rate_sweep.png")
    plt.close()

    print(f"Saved: {out_path / 'strain_rate_sweep.png'}")


def main():
    parser = argparse.ArgumentParser(
        description="Solar System baseline + κ diagnostics"
    )

    parser.add_argument(
        "--mode",
        default="baseline",
        choices=["baseline", "framework", "sparc_fit"],
        help="Run mode",
    )
    parser.add_argument(
        "--years",
        type=float,
        default=200.0,
        help="Integration length in years",
    )
    parser.add_argument(
        "--steps",
        type=int,
        default=4000,
        help="Number of output samples",
    )

    parser.add_argument(
        "--sweep-strain",
        action="store_true",
        help="Run a sweep over strain-rate values and plot max orbital deviation",
    )

    # SPARC-fit parameters
    parser.add_argument("--a", type=float, default=-0.5, help="SPARC-fit parameter a")
    parser.add_argument("--b", type=float, default=0.5, help="SPARC-fit parameter b")
    parser.add_argument("--c", type=float, default=0.0, help="SPARC-fit parameter c")
    parser.add_argument(
        "--use-shear",
        action="store_true",
        help="Enable SPARC-fit shear term",
    )

    # Framework parameters
    parser.add_argument(
        "--rho",
        type=float,
        default=0.0,
        help="Environmental density [kg/m^3]",
    )
    parser.add_argument(
        "--strain-rate",
        type=float,
        default=0.0,
        help="Environmental strain rate [s^-1]",
    )
    parser.add_argument(
        "--kappa0",
        type=float,
        default=2.6e-26,
        help="Framework kappa0 [m^-1]",
    )
    parser.add_argument(
        "--kv",
        type=float,
        default=5e-26,
        help="Framework kv [m^-1]",
    )
    parser.add_argument(
        "--rho0",
        type=float,
        default=1600.0,
        help="Framework rho0 [kg/m^3]",
    )

    parser.add_argument("--out", default="outputs", help="Output directory")

    args = parser.parse_args()

    if args.sweep_strain:
        print_strain_rate_targets(
            rho=args.rho if args.rho > 0 else 1e-12,
            r_m=JUPITER_R_M,
        )
        plot_strain_rate_sweep(
            years=args.years,
            steps=args.steps,
            rho=args.rho,
            kappa0=args.kappa0,
            kv=args.kv,
            rho0=args.rho0,
            output_dir=args.out,
        )
        return

    sim_template, bodies = build_simulation()

    sim_config = SimulationConfig(
        years=args.years,
        steps=args.steps,
        output_dir=args.out,
        save_plots=True,
    )

    baseline_config = KappaConfig(mode="baseline")

    (
        time_years,
        jx_base,
        jy_base,
        jvx_base,
        jvy_base,
        jax_base,
        jay_base,
        ja_base,
        je_base,
    ) = run_simulation(
        sim_template=sim_template,
        bodies=bodies,
        sim_config=sim_config,
        kappa_config=baseline_config,
    )

    if args.mode == "baseline":
        return

    kappa_config = KappaConfig(
        mode=args.mode,
        a=args.a,
        b=args.b,
        c=args.c,
        use_shear=args.use_shear,
        rho=args.rho,
        strain_rate=args.strain_rate,
        kappa0=args.kappa0,
        kv=args.kv,
        rho0=args.rho0,
    )

    (
        _,
        jx_mod,
        jy_mod,
        jvx_mod,
        jvy_mod,
        jax_mod,
        jay_mod,
        ja_mod,
        je_mod,
    ) = run_simulation(
        sim_template=sim_template,
        bodies=bodies,
        sim_config=sim_config,
        kappa_config=kappa_config,
    )

    plot_comparison_diagnostics(
        time_years=time_years,
        jx_base=jx_base,
        jy_base=jy_base,
        jvx_base=jvx_base,
        jvy_base=jvy_base,
        jax_base=jax_base,
        jay_base=jay_base,
        ja_base=ja_base,
        je_base=je_base,
        jx_mod=jx_mod,
        jy_mod=jy_mod,
        jvx_mod=jvx_mod,
        jvy_mod=jvy_mod,
        jax_mod=jax_mod,
        jay_mod=jay_mod,
        ja_mod=ja_mod,
        je_mod=je_mod,
        output_dir=args.out,
    )


if __name__ == "__main__":
    main()