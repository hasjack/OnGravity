import numpy as np

# Unit conversions for REBOUND setup: AU, day, Msun
AU_IN_M = 1.495978707e11
DAY_IN_S = 86400.0
ACCEL_AU_DAY2_TO_M_S2 = AU_IN_M / (DAY_IN_S ** 2)

# Gravitational constant in REBOUND units when using AU, day, Msun
# Not strictly needed if sim.G is already set, but useful for clarity/tests.
G_AU3_DAY2_MSUN = 2.9591220828559093e-4


def kappa_multiplier_from_accel(
    g_bar_si: float,
    a: float = -0.5,
    b: float = 0.5,
    c: float = 0.0,
    shear: bool = False,
    dvdr_si: float | None = None,
) -> float:
    """
    Return multiplicative factor applied to Newtonian acceleration.

    This is a toy scaling based on the rotation-curve-inspired relation

        kappa_r_over_2 = a + b * log10(g_bar)

    with optional shear contribution

        + c * log10(dvdr)

    where:
    - g_bar_si is in m/s^2
    - dvdr_si is in s^-1

    If kappa_r_over_2 really denotes (kappa * r) / 2, then acceleration scales as

        g_pred = g_bar * exp(kappa * r) = g_bar * exp(2 * kappa_r_over_2)

    so the returned multiplier is exp(2 * kappa_r_over_2).
    """
    if not np.isfinite(g_bar_si) or g_bar_si <= 0.0:
        return 1.0

    kappa_r_over_2 = a + b * np.log10(g_bar_si)

    if shear and dvdr_si is not None and np.isfinite(dvdr_si) and dvdr_si > 0.0:
        kappa_r_over_2 += c * np.log10(dvdr_si)

    multiplier = float(np.exp(2.0 * kappa_r_over_2))

    # Safety clamp for toy experiments to avoid catastrophic blow-ups.
    # Adjust or remove once the model is better validated.
    multiplier = max(1e-6, min(1e6, multiplier))

    return multiplier


def apply_kappa_additional_forces(
    sim,
    a: float,
    b: float,
    c: float,
    shear: bool,
) -> None:
    """
    REBOUND additional_forces callback.

    Toy-safe implementation:
    - only modifies the Sun->planet heliocentric acceleration
    - does NOT rescale the total already-accumulated acceleration field
    - shear is currently not implemented for Solar System use

    Assumes:
    - particle 0 is the Sun
    - sim units are AU, day, Msun
    """
    sun = sim.particles[0]

    if shear:
        raise NotImplementedError(
            "shear=True is not implemented in this toy Solar System model yet."
        )

    for i, p in enumerate(sim.particles):
        if i == 0:
            continue  # skip Sun

        # Heliocentric displacement
        dx = p.x - sun.x
        dy = p.y - sun.y
        dz = p.z - sun.z

        r2 = dx * dx + dy * dy + dz * dz
        if r2 <= 0.0:
            continue

        r = np.sqrt(r2)
        r3 = r2 * r

        # Explicit Newtonian acceleration from Sun only, in AU/day^2
        mu_sun = sim.G * sun.m
        ax_sun = -mu_sun * dx / r3
        ay_sun = -mu_sun * dy / r3
        az_sun = -mu_sun * dz / r3

        g_bar_au_day2 = np.sqrt(ax_sun * ax_sun + ay_sun * ay_sun + az_sun * az_sun)
        g_bar_si = g_bar_au_day2 * ACCEL_AU_DAY2_TO_M_S2

        multiplier = kappa_multiplier_from_accel(
            g_bar_si=g_bar_si,
            a=a,
            b=b,
            c=c,
            shear=False,
            dvdr_si=None,
        )

        if multiplier == 1.0:
            continue

        # Add only the delta relative to Newtonian solar acceleration
        delta = multiplier - 1.0
        p.ax += delta * ax_sun
        p.ay += delta * ay_sun
        p.az += delta * az_sun