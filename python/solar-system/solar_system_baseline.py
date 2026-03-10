"""
Solar System diagnostics using REBOUND.

Modes
-----
- baseline   : Newtonian reference
- framework  : κ(ρ, S) framework-based modification
- sparc_fit  : empirical SPARC-style modifier

Includes
--------
1. Long-term integration
2. Jupiter trajectory tracking
3. Relative energy diagnostic
4. Baseline-vs-modified residual diagnostics:
   - orbital deviation
   - velocity deviation
   - radial acceleration residual
"""

import argparse
from pathlib import Path

import numpy as np
import rebound
import matplotlib.pyplot as plt

from kappa_model import apply_kappa_additional_forces


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


def run_simulation(
    mode: str,
    years: float,
    steps: int,
    a: float,
    b: float,
    c: float,
    use_shear: bool,
    rho: float,
    strain_rate: float,
    kappa0: float,
    kv: float,
    rho0: float,
    output_dir: str,
):
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    sim, bodies = build_simulation()
    jupiter_index = bodies.index("Jupiter")

    if mode in {"framework", "sparc_fit"}:
        def additional_forces(reb_sim):
            sim_ptr = reb_sim.contents
            apply_kappa_additional_forces(
                sim_ptr,
                model=mode,
                a=a,
                b=b,
                c=c,
                use_shear=use_shear,
                rho=rho,
                strain_rate=strain_rate,
                kappa0=kappa0,
                kv=kv,
                rho0=rho0,
            )
        sim.additional_forces = additional_forces
        
    sim.force_is_velocity_dependent = 0

    dt = years * 365.25 / float(steps)
    times = []
    energy_error = []
    jx, jy = [], []
    jvx, jvy = [], []
    jax, jay = [], []

    E0 = sim.energy()

    for i in range(steps):
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

    # Jupiter trajectory
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

    # Energy diagnostic
    plt.figure(figsize=(7, 4))
    plt.plot(times, energy_error)
    plt.xlabel("Time [years]")
    plt.ylabel("Relative energy error")
    plt.title(f"Energy diagnostic ({mode})")
    plt.tight_layout()
    plt.savefig(out_path / f"energy_error_{mode}.png")
    plt.close()

    print("Saved:")
    print(f" - {out_path / f'jupiter_trajectory_{mode}.png'}")
    print(f" - {out_path / f'energy_error_{mode}.png'}")

    return (
        np.array(times),
        np.array(jx),
        np.array(jy),
        np.array(jvx),
        np.array(jvy),
        np.array(jax),
        np.array(jay),
    )


def plot_comparison_diagnostics(
    time_years,
    jx_base,
    jy_base,
    jvx_base,
    jvy_base,
    jax_base,
    jay_base,
    jx_mod,
    jy_mod,
    jvx_mod,
    jvy_mod,
    jax_mod,
    jay_mod,
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

    print("Saved:")
    print(f" - {out_path / 'orbit_difference.png'}")
    print(f" - {out_path / 'velocity_difference.png'}")
    print(f" - {out_path / 'radial_acceleration_difference.png'}")


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
    parser.add_argument("--years", type=float, default=200.0, help="Integration length in years")
    parser.add_argument("--steps", type=int, default=4000, help="Number of output samples")

    # SPARC-fit parameters
    parser.add_argument("--a", type=float, default=-0.5, help="SPARC-fit parameter a")
    parser.add_argument("--b", type=float, default=0.5, help="SPARC-fit parameter b")
    parser.add_argument("--c", type=float, default=0.0, help="SPARC-fit parameter c")
    parser.add_argument("--use-shear", action="store_true", help="Enable SPARC-fit shear term")

    # Framework parameters
    parser.add_argument("--rho", type=float, default=0.0, help="Environmental density [kg/m^3]")
    parser.add_argument("--strain-rate", type=float, default=0.0, help="Environmental strain rate [s^-1]")
    parser.add_argument("--kappa0", type=float, default=2.6e-26, help="Framework kappa0 [m^-1]")
    parser.add_argument("--kv", type=float, default=5e-26, help="Framework kv [m^-1]")
    parser.add_argument("--rho0", type=float, default=1600.0, help="Framework rho0 [kg/m^3]")

    parser.add_argument("--out", default="outputs", help="Output directory")

    args = parser.parse_args()

    # Always run baseline first
    (
        time_years,
        jx_base,
        jy_base,
        jvx_base,
        jvy_base,
        jax_base,
        jay_base,
    ) = run_simulation(
        mode="baseline",
        years=args.years,
        steps=args.steps,
        a=args.a,
        b=args.b,
        c=args.c,
        use_shear=args.use_shear,
        rho=args.rho,
        strain_rate=args.strain_rate,
        kappa0=args.kappa0,
        kv=args.kv,
        rho0=args.rho0,
        output_dir=args.out,
    )

    if args.mode == "baseline":
        return

    (
        _,
        jx_mod,
        jy_mod,
        jvx_mod,
        jvy_mod,
        jax_mod,
        jay_mod,
    ) = run_simulation(
        mode=args.mode,
        years=args.years,
        steps=args.steps,
        a=args.a,
        b=args.b,
        c=args.c,
        use_shear=args.use_shear,
        rho=args.rho,
        strain_rate=args.strain_rate,
        kappa0=args.kappa0,
        kv=args.kv,
        rho0=args.rho0,
        output_dir=args.out,
    )

    plot_comparison_diagnostics(
        time_years=time_years,
        jx_base=jx_base,
        jy_base=jy_base,
        jvx_base=jvx_base,
        jvy_base=jvy_base,
        jax_base=jax_base,
        jay_base=jay_base,
        jx_mod=jx_mod,
        jy_mod=jy_mod,
        jvx_mod=jvx_mod,
        jvy_mod=jvy_mod,
        jax_mod=jax_mod,
        jay_mod=jay_mod,
        output_dir=args.out,
    )


if __name__ == "__main__":
    main()