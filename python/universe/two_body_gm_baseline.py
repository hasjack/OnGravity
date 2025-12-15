import math
import os
from dataclasses import dataclass

import numpy as np
import rebound


@dataclass(frozen=True)
class Config:
    # Explicit solar GM in AU^3 / day^2
    MU_SUN: float = 2.959122082855911e-4

    # Mercury orbital elements
    a_AU: float = 0.387098
    e: float = 0.205630

    # Simulation horizon
    years: float = 200.0
    dt_sample_days: float = 0.25

    # Output
    outputs_dir: str = "outputs"
    csv_path: str = "outputs/mercury_perihelia.csv"


def setup_two_body(mu_sun, a, e):
    sim = rebound.Simulation()
    sim.units = ("AU", "day", "Msun")
    sim.integrator = "ias15"
    sim.G = mu_sun

    # Sun
    sim.add(m=1.0)

    # Mercury at perihelion
    r_p = a * (1.0 - e)
    v_p = math.sqrt(mu_sun * (1.0 + e) / (a * (1.0 - e)))

    sim.add(m=0.0, x=r_p, y=0.0, vx=0.0, vy=v_p)
    sim.move_to_com()

    return sim


def radial_velocity(p):
    r = math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z)
    return (p.x*p.vx + p.y*p.vy + p.z*p.vz) / r


def angle_0_2pi(x, y):
    ang = math.atan2(y, x)
    return ang + 2*math.pi if ang < 0 else ang


def unwrap_angles(a):
    return np.unwrap(a)


def main():
    cfg = Config()
    os.makedirs(cfg.outputs_dir, exist_ok=True)

    sim = setup_two_body(cfg.MU_SUN, cfg.a_AU, cfg.e)
    sun, merc = sim.particles

    t_end = cfg.years * 365.25
    dt = cfg.dt_sample_days

    # Prime the loop
    sim.integrate(dt)
    prev_t = sim.t
    prev_vr = radial_velocity(merc)

    peri_t = []
    peri_theta = []
    peri_r = []

    while sim.t < t_end:
        sim.integrate(sim.t + dt)
        vr = radial_velocity(merc)

        # Detect vr crossing: negative -> positive
        if prev_vr < 0.0 and vr >= 0.0:
            # Linear interpolation to vr=0
            f = prev_vr / (prev_vr - vr)
            t_star = prev_t + f * (sim.t - prev_t)

            # Re-integrate cleanly to refined perihelion
            sim.integrate(t_star, exact_finish_time=1)

            dx = merc.x - sun.x
            dy = merc.y - sun.y
            r = math.sqrt(dx*dx + dy*dy)
            theta = angle_0_2pi(dx, dy)

            peri_t.append(sim.t)
            peri_theta.append(theta)
            peri_r.append(r)

        prev_vr = vr
        prev_t = sim.t

    peri_t = np.array(peri_t)
    peri_theta = np.array(peri_theta)
    peri_r = np.array(peri_r)

    if len(peri_t) < 5:
        raise RuntimeError("Too few perihelia detected.")

    theta_unwrapped = unwrap_angles(peri_theta)
    t_centuries = (peri_t - peri_t[0]) / 36525.0

    # Linear fit
    A = np.vstack([np.ones_like(t_centuries), t_centuries]).T
    _, slope = np.linalg.lstsq(A, theta_unwrapped, rcond=None)[0]

    arcsec_per_rad = 206264.80624709636
    drift_arcsec_century = slope * arcsec_per_rad

    # Save CSV
    out = np.column_stack([
        np.arange(len(peri_t)),
        peri_t,
        peri_t / 365.25,
        peri_theta,
        peri_theta * 180.0 / math.pi,
        peri_r,
    ])
    np.savetxt(
        cfg.csv_path,
        out,
        delimiter=",",
        header="idx,t_days,t_years,theta_rad,theta_deg,r_AU",
        comments=""
    )

    print("\nRefined two-body Sun–Mercury baseline")
    print(f"  perihelia detected        : {len(peri_t)}")
    print(f"  mean perihelion r [AU]    : {peri_r.mean():.9f}")
    print(f"  std perihelion r [AU]     : {peri_r.std():.3e}")
    print(f"  perihelion drift          : {drift_arcsec_century:.6f} arcsec/century")
    print(f"  saved                     : {cfg.csv_path}")
    print("\nExpected: ~0 arcsec/century (numerical floor only).")


if __name__ == "__main__":
    main()
