"""
Solar System diagnostics using REBOUND.

Mode:
- baseline (Newtonian) reference
- kappa (toy modified-gravity scaling) via additional_force callback

Includes:
1. Long-term integration (200 years)
2. Jupiter trajectory tracking
3. Relative energy conservation check
4. Optional kappa-based modification factor (a, b, c)
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


def run_simulation(mode: str,
                   years: float,
                   steps: int,
                   a: float,
                   b: float,
                   c: float,
                   shear: bool,
                   output_dir: str):
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    sim, bodies = build_simulation()
    jupiter_index = bodies.index("Jupiter")

    if mode == "kappa":
        # Callback gets a low-level LP_Simulation object; use outer `sim` wrapper to access .particles
        def additional_forces(_s):
            apply_kappa_additional_forces(sim, a=a, b=b, c=c, shear=shear)
        sim.additional_forces = additional_forces

    dt = years * 365.25 / float(steps)
    times, energy_error, jx, jy = [], [], [], []
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

    # Energy error
    plt.figure(figsize=(7, 4))
    plt.plot(times, energy_error)
    plt.xlabel("Time [years]")
    plt.ylabel("Relative energy error")
    plt.title(f"Energy conservation ({mode})")
    plt.tight_layout()
    plt.savefig(out_path / f"energy_error_{mode}.png")
    plt.close()

    print("Saved:")
    print(f" - {out_path / f'jupiter_trajectory_{mode}.png'}")
    print(f" - {out_path / f'energy_error_{mode}.png'}")
    print("Saved:")
    print(f" - {out_path / f'jupiter_trajectory_{mode}.png'}")
    print(f" - {out_path / f'energy_error_{mode}.png'}")

    return jx, jy


def main():
    parser = argparse.ArgumentParser(description="Solar System baseline + kappa extension")
    parser.add_argument("--mode", default="baseline", choices=["baseline", "kappa"],
                        help="Integration mode: baseline or kappa")
    parser.add_argument("--years", type=float, default=200.0, help="integration length in years")
    parser.add_argument("--steps", type=int, default=4000, help="integration timesteps")
    parser.add_argument("--a", type=float, default=1e-12, help="toy kappa parameter a")
    parser.add_argument("--b", type=float, default=0.0, help="toy kappa parameter b")
    parser.add_argument("--c", type=float, default=0.0, help="toy kappa parameter c")
    parser.add_argument("--shear", action="store_true", help="enable shear correction in kappa model")
    parser.add_argument("--out", default="outputs", help="output directory")

    args = parser.parse_args()
    # run_simulation(mode=args.mode,
    #                years=args.years,
    #                steps=args.steps,
    #                a=args.a,
    #                b=args.b,
    #                c=args.c,
    #                shear=args.shear,
    #                output_dir=args.out)
    
    jx_base, jy_base = run_simulation(
        mode="baseline",
        years=args.years,
        steps=args.steps,
        a=args.a,
        b=args.b,
        c=args.c,
        shear=args.shear,
        output_dir=args.out
    )

    jx_kappa, jy_kappa = run_simulation(
        mode="kappa",
        years=args.years,
        steps=args.steps,
        a=args.a,
        b=args.b,
        c=args.c,
        shear=args.shear,
        output_dir=args.out
    )

    delta_r = np.sqrt(
        (np.array(jx_kappa) - np.array(jx_base))**2 +
        (np.array(jy_kappa) - np.array(jy_base))**2
    )

    plt.figure(figsize=(7,4))
    time_years = np.linspace(0, args.years, len(delta_r))
    plt.plot(time_years, delta_r)
    plt.xlabel("Time [years]")
    plt.ylabel("Orbital deviation [AU]")
    plt.title("Deviation from Newtonian baseline")
    plt.tight_layout()
    plt.savefig("outputs/orbit_difference.png")
    plt.close()


if __name__ == "__main__":
    main()
