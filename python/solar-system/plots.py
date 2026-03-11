import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path


def plot_body_trajectory(jx, jy, years, body_name, mode, out_path):
    out_path = Path(out_path)
    out_path.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(6, 6))
    plt.plot(jx, jy, label=body_name)
    plt.scatter(0, 0, s=80, label="Sun")
    plt.gca().set_aspect("equal")
    plt.xlabel("x [AU]")
    plt.ylabel("y [AU]")
    plt.title(f"{body_name} trajectory ({years} years, mode={mode})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / f"{body_name.lower()}_trajectory_{mode}.png")
    plt.close()


def plot_energy_diagnostic(times, energy_error, mode, out_path):
    out_path = Path(out_path)
    out_path.mkdir(parents=True, exist_ok=True)

    plt.figure(figsize=(7, 4))
    plt.plot(times, energy_error)
    plt.xlabel("Time [years]")
    plt.ylabel("Relative energy error")
    plt.title(f"Energy diagnostic ({mode})")
    plt.tight_layout()
    plt.savefig(out_path / f"energy_error_{mode}.png")
    plt.close()


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
    jtheta_base,
    jomega_base,
    jex_base,
    jey_base,
    jx_mod,
    jy_mod,
    jvx_mod,
    jvy_mod,
    jax_mod,
    jay_mod,
    ja_mod,
    je_mod,
    jtheta_mod,
    jomega_mod,
    jex_mod,
    jey_mod,
    output_dir: str,
    body_name: str = "Target",
):
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # Position residual
    delta_r = np.sqrt((jx_mod - jx_base) ** 2 + (jy_mod - jy_base) ** 2)
    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_r)
    plt.xlabel("Time [years]")
    plt.ylabel("Orbital deviation [AU]")
    plt.title(f"{body_name} deviation from Newtonian baseline")
    plt.tight_layout()
    plt.savefig(out_path / "orbit_difference.png")
    plt.close()

    # Velocity residual
    delta_v = np.sqrt((jvx_mod - jvx_base) ** 2 + (jvy_mod - jvy_base) ** 2)
    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_v)
    plt.xlabel("Time [years]")
    plt.ylabel("Velocity deviation [AU/day]")
    plt.title(f"{body_name} velocity deviation from Newtonian baseline")
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
    plt.title(f"{body_name} radial acceleration residual")
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
    plt.title(f"{body_name} orbital radius")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "orbital_radius_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_radius)
    plt.xlabel("Time [years]")
    plt.ylabel("Radius difference [AU]")
    plt.title(f"{body_name} orbital radius difference")
    plt.tight_layout()
    plt.savefig(out_path / "orbital_radius_difference.png")
    plt.close()

    # Semi-major axis
    plt.figure(figsize=(7, 4))
    plt.plot(time_years, ja_base, label="Baseline")
    plt.plot(time_years, ja_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Semi-major axis [AU]")
    plt.title(f"{body_name} semi-major axis")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "semi_major_axis_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, ja_mod - ja_base)
    plt.xlabel("Time [years]")
    plt.ylabel("Semi-major axis difference [AU]")
    plt.title(f"{body_name} semi-major axis difference")
    plt.tight_layout()
    plt.savefig(out_path / "semi_major_axis_difference.png")
    plt.close()

    # Eccentricity
    plt.figure(figsize=(7, 4))
    plt.plot(time_years, je_base, label="Baseline")
    plt.plot(time_years, je_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Eccentricity")
    plt.title(f"{body_name} eccentricity")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "eccentricity_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, je_mod - je_base)
    plt.xlabel("Time [years]")
    plt.ylabel("Eccentricity difference")
    plt.title(f"{body_name} eccentricity difference")
    plt.tight_layout()
    plt.savefig(out_path / "eccentricity_difference.png")
    plt.close()

    theta_base = np.unwrap(jtheta_base)
    theta_mod = np.unwrap(jtheta_mod)
    delta_theta = theta_mod - theta_base

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, theta_base, label="Baseline")
    plt.plot(time_years, theta_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Orbital phase [rad]")
    plt.title(f"{body_name} orbital phase")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "orbital_phase_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_theta)
    plt.xlabel("Time [years]")
    plt.ylabel("Phase difference [rad]")
    plt.title(f"{body_name} orbital phase drift")
    plt.tight_layout()
    plt.savefig(out_path / "orbital_phase_drift.png")
    plt.close()

    omega_base = np.unwrap(jomega_base)
    omega_mod = np.unwrap(jomega_mod)
    delta_omega = omega_mod - omega_base

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, omega_base, label="Baseline")
    plt.plot(time_years, omega_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Argument of perihelion [rad]")
    plt.title(f"{body_name} perihelion argument")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "perihelion_argument_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_omega)
    plt.xlabel("Time [years]")
    plt.ylabel("Perihelion difference [rad]")
    plt.title(f"{body_name} perihelion precession")
    plt.tight_layout()
    plt.savefig(out_path / "perihelion_precession.png")
    plt.close()

    peri_dir_base = np.unwrap(np.arctan2(jey_base, jex_base))
    peri_dir_mod = np.unwrap(np.arctan2(jey_mod, jex_mod))
    delta_peri_dir = peri_dir_mod - peri_dir_base

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, peri_dir_base, label="Baseline")
    plt.plot(time_years, peri_dir_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("Perihelion direction [rad]")
    plt.title(f"{body_name} LRL perihelion direction")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "lrl_perihelion_direction_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_peri_dir)
    plt.xlabel("Time [years]")
    plt.ylabel("Perihelion direction difference [rad]")
    plt.title(f"{body_name} LRL perhelion drift")
    plt.tight_layout()
    plt.savefig(out_path / "lrl_perihelion_drift.png")
    plt.close()

    lrl_mag_base = np.sqrt(jex_base ** 2 + jey_base ** 2)
    lrl_mag_mod = np.sqrt(jex_mod ** 2 + jey_mod ** 2)
    delta_lrl_mag = lrl_mag_mod - lrl_mag_base

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, lrl_mag_base, label="Baseline")
    plt.plot(time_years, lrl_mag_mod, label="Framework")
    plt.xlabel("Time [years]")
    plt.ylabel("|LRL vector|")
    plt.title(f"{body_name} LRL vector magnitude")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path / "lrl_magnitude_comparison.png")
    plt.close()

    plt.figure(figsize=(7, 4))
    plt.plot(time_years, delta_lrl_mag)
    plt.xlabel("Time [years]")
    plt.ylabel("LRL magnitude difference")
    plt.title(f"{body_name} LRL magnitude difference")
    plt.tight_layout()
    plt.savefig(out_path / "lrl_magnitude_difference.png")
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
    print(f" - {out_path / 'orbital_phase_comparison.png'}")
    print(f" - {out_path / 'orbital_phase_drift.png'}")
    print(f" - {out_path / 'perihelion_argument_comparison.png'}")
    print(f" - {out_path / 'perihelion_precession.png'}")
    print(f" - {out_path / 'lrl_perihelion_direction_comparison.png'}")
    print(f" - {out_path / 'lrl_perihelion_drift.png'}")
    print(f" - {out_path / 'lrl_magnitude_comparison.png'}")
    print(f" - {out_path / 'lrl_magnitude_difference.png'}")

    precession_rate = (delta_omega[-1] - delta_omega[0]) / time_years[-1]
    arcsec_per_century = precession_rate * 206265 * 100

    print("Estimated perihelion precession:", arcsec_per_century, "arcsec/century")

