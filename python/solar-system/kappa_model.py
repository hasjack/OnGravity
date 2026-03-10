import numpy as np

# Unit conversions for REBOUND setup: AU, day, Msun
AU_IN_M = 1.495978707e11
DAY_IN_S = 86400.0
ACCEL_AU_DAY2_TO_M_S2 = AU_IN_M / (DAY_IN_S ** 2)


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def heliocentric_solar_acceleration(sim, particle):
    """
    Return heliocentric Sun->particle Newtonian acceleration.

    Returns
    -------
    tuple[float, float, float, float]
        ax_sun, ay_sun, az_sun, r_m
        where acceleration is in AU/day^2 and r_m is in meters
    """
    sun = sim.particles[0]

    dx = particle.x - sun.x
    dy = particle.y - sun.y
    dz = particle.z - sun.z

    r2 = dx * dx + dy * dy + dz * dz
    if r2 <= 0.0:
        return 0.0, 0.0, 0.0, 0.0

    r_au = np.sqrt(r2)
    r3 = r2 * r_au
    r_m = r_au * AU_IN_M

    mu_sun = sim.G * sun.m

    ax_sun = -mu_sun * dx / r3
    ay_sun = -mu_sun * dy / r3
    az_sun = -mu_sun * dz / r3

    return ax_sun, ay_sun, az_sun, r_m


def sparc_multiplier_from_accel(
    g_bar_si: float,
    a: float = -0.5,
    b: float = 0.5,
    c: float = 0.0,
    use_shear: bool = False,
    dvdr_si: float | None = None,
    clamp_min: float = 1e-6,
    clamp_max: float = 1e6,
) -> float:
    """
    Empirical SPARC-style multiplier.

    Uses:
        kappa_r_over_2 = a + b * log10(g_bar) [+ c * log10(dvdr)]

    and maps to acceleration via:
        g_pred = g_bar * exp(kappa * r)
               = g_bar * exp(2 * kappa_r_over_2)
    """
    if not np.isfinite(g_bar_si) or g_bar_si <= 0.0:
        return 1.0

    kappa_r_over_2 = a + b * np.log10(g_bar_si)

    if use_shear and dvdr_si is not None and np.isfinite(dvdr_si) and dvdr_si > 0.0:
        kappa_r_over_2 += c * np.log10(dvdr_si)

    multiplier = float(np.exp(2.0 * kappa_r_over_2))
    return clamp(multiplier, clamp_min, clamp_max)


def kappa_from_environment(
    rho: float,
    strain_rate: float,
    kappa0: float = 2.6e-26,
    kv: float = 5e-26,
    rho0: float = 1600.0,
) -> float:
    """
    Framework κ calculation.

    κ(ρ, S) = κ0 + kv * (S / 1e-12)^3 * sqrt(ρ / rho0)

    Parameters
    ----------
    rho : float
        Environmental density in kg/m^3
    strain_rate : float
        Strain-rate S in s^-1

    Returns
    -------
    float
        κ in m^-1
    """
    if not np.isfinite(rho) or rho < 0.0:
        raise ValueError("rho must be finite and >= 0")
    if not np.isfinite(strain_rate) or strain_rate < 0.0:
        raise ValueError("strain_rate must be finite and >= 0")
    if rho0 <= 0.0:
        raise ValueError("rho0 must be > 0")

    density_term = np.sqrt(rho / rho0)
    shear_term = (strain_rate / 1e-12) ** 3

    return kappa0 + kv * shear_term * density_term


def framework_multiplier_from_kappa(
    kappa: float,
    r_m: float,
    clamp_min: float = 1e-6,
    clamp_max: float = 1e6,
) -> float:
    """
    Multiplier for Newtonian acceleration from κ-modified potential.

    If:
        Φ = -(GM/r) * exp(κr)

    then:
        a_r = -(GM/r^2) * exp(κr) * (1 - κr)

    so the multiplier relative to Newtonian is:
        exp(κr) * (1 - κr)
    """
    kr = kappa * r_m
    multiplier = float(np.exp(kr) * (1.0 - kr))
    return clamp(multiplier, clamp_min, clamp_max)


def apply_kappa_additional_forces(
    sim,
    model: str = "framework",
    a: float = -0.5,
    b: float = 0.5,
    c: float = 0.0,
    use_shear: bool = False,
    rho: float = 0.0,
    strain_rate: float = 0.0,
    kappa0: float = 2.6e-26,
    kv: float = 5e-26,
    rho0: float = 1600.0,
) -> None:
    """
    REBOUND additional_forces callback.

    Supported models
    ----------------
    framework
        Uses κ(ρ, S) from the framework and converts it to an acceleration
        multiplier via the κ-modified potential.

    sparc_fit
        Uses the empirical SPARC-style fit based on log10(g_bar).

    Notes
    -----
    - Only modifies the explicit Sun->planet heliocentric acceleration
    - Does NOT rescale the total already-accumulated acceleration field
    - Assumes particle 0 is the Sun
    - sim units are AU, day, Msun
    """
    if model not in {"framework", "sparc_fit"}:
        raise ValueError(f"Unknown model '{model}'. Expected 'framework' or 'sparc_fit'.")

    for i, p in enumerate(sim.particles):
        if i == 0:
            continue  # skip Sun

        ax_sun, ay_sun, az_sun, r_m = heliocentric_solar_acceleration(sim, p)
        if r_m <= 0.0:
            continue

        if model == "framework":
            kappa = kappa_from_environment(
                rho=rho,
                strain_rate=strain_rate,
                kappa0=kappa0,
                kv=kv,
                rho0=rho0,
            )
            multiplier = framework_multiplier_from_kappa(kappa=kappa, r_m=r_m)

        else:  # sparc_fit
            g_bar_au_day2 = np.sqrt(ax_sun * ax_sun + ay_sun * ay_sun + az_sun * az_sun)
            g_bar_si = g_bar_au_day2 * ACCEL_AU_DAY2_TO_M_S2

            dvdr_si = None
            if use_shear:
                raise NotImplementedError(
                    "use_shear=True is not implemented for the Solar System SPARC toy yet."
                )

            multiplier = sparc_multiplier_from_accel(
                g_bar_si=g_bar_si,
                a=a,
                b=b,
                c=c,
                use_shear=False,
                dvdr_si=dvdr_si,
            )

        if multiplier == 1.0:
            continue

        delta = multiplier - 1.0
        p.ax += delta * ax_sun
        p.ay += delta * ay_sun
        p.az += delta * az_sun