# Solar System N-body Baseline (REBOUND)

This folder provides a Newtonian Solar System baseline using the `rebound` N-body engine, with a focus on reproducible diagnostics and a reference for later modified-gravity experiments.

The system models the Sun and eight planets and is primarily used to analyse how small perturbations — such as those introduced by the κ-framework — influence long-term orbital behaviour.

---

# Goals

- Produce a reference integration for 9-body Solar System dynamics (Sun + 8 planets)
- Validate long-term energy conservation and orbital fidelity
- Provide outputs for visualization and comparison
- Provide a sandbox for testing modified-gravity perturbations

---

# Physics assumptions

- Newtonian gravity (no relativity, no non-gravitational forces)
- `rebound` integrator: `ias15` (adaptive, high accuracy)
- Standard initial conditions from `rebound` built-in Solar System bodies
- Units: AU, days, Msun

---

# Key scripts

## solar_system_baseline.py

Main Solar System experiment driver.

Features:

- Newtonian baseline or κ-framework modified gravity mode
- Target body diagnostics (`--target`)
- Orbital trajectory visualisation
- Energy conservation diagnostics
- Residual comparison vs Newtonian baseline
- Strain-rate parameter sweeps
- Perihelion precession diagnostics
- Saves plots in `outputs/`

---

## export_orbits.py

- 50-year integration
- Saves compressed dataset `outputs/orbits.npz`
- Intended for external rendering or analysis

---

## plot_solar_system_static.py

Reads orbit data and produces static visualisations.

Useful for:

- publication figures
- debugging orbital geometry

---

## render_orbits.py

Exports GIF / MP4 animation from trajectories stored in:

    outputs/orbits.npz

---

## two_body_gm_baseline.py

Two-body explicit (GM) comparison baseline used for analytic validation against known Keplerian solutions.

---

# Diagnostics generated

## Orbital diagnostics

- `*_trajectory_*.png`  
  Orbital trajectory in the orbital plane

- `orbital_radius_comparison.png`  
  Orbital radius compared to baseline

- `orbital_radius_difference.png`  
  Radius difference relative to baseline

- `semi_major_axis_comparison.png`  
  Semi-major axis evolution

- `semi_major_axis_difference.png`  
  Semi-major axis residual

- `eccentricity_comparison.png`  
  Eccentricity evolution

- `eccentricity_difference.png`  
  Eccentricity residual

---

## Dynamical residuals

- `orbit_difference.png`  
  Position deviation from Newtonian baseline

- `velocity_difference.png`  
  Velocity deviation from Newtonian baseline

- `radial_acceleration_difference.png`  
  Radial acceleration residual

---

## Orbital phase diagnostics

- `orbital_phase_comparison.png`  
  Orbital phase comparison

- `orbital_phase_drift.png`  
  Secular phase drift

---

## Perihelion diagnostics

- `perihelion_argument_comparison.png`  
  Argument of perihelion comparison

- `perihelion_precession.png`  
  Perihelion precession relative to baseline

---

## Laplace–Runge–Lenz diagnostics

- `lrl_perihelion_direction_comparison.png`  
  Perihelion direction derived from the LRL vector

- `lrl_perihelion_drift.png`  
  LRL-based perihelion drift

- `lrl_magnitude_comparison.png`  
  LRL vector magnitude

- `lrl_magnitude_difference.png`  
  LRL magnitude residual

---

## Energy diagnostics

- `energy_error_*.png`  
  Relative energy drift over the integration

---

## Parameter sweep diagnostics

- `*_strain_rate_sweep.png`  
  Orbital deviation vs strain-rate

- `*_precession_vs_strain_rate.png`  
  Perihelion precession vs strain-rate

---

# Run instructions

## 1. Install requirements

    python3 -m pip install rebound matplotlib numpy

---

## 2. Run Newtonian baseline

    cd python/solar-system
    python3 solar_system_baseline.py --mode baseline

---

## 3. Run κ-framework modified gravity

    python3 solar_system_baseline.py \
      --mode framework \
      --rho 1e-12 \
      --strain-rate 1e-7

---

## 4. Run long-term stability test

    python3 solar_system_baseline.py \
      --mode framework \
      --rho 1e-12 \
      --strain-rate 1e-7 \
      --years 1000 \
      --steps 10000

---

## 5. Run strain-rate stability sweep

    python3 solar_system_baseline.py \
      --sweep-strain \
      --rho 1e-12

---

## 6. Sweep a specific planet

Example: Mercury

    python3 solar_system_baseline.py \
      --sweep-strain \
      --target Mercury \
      --rho 1e-12

Example: Jupiter

    python3 solar_system_baseline.py \
      --sweep-strain \
      --target Jupiter \
      --rho 1e-12

---

# Expected outputs

Typical output directory:

    outputs/
    ├── mercury_trajectory_framework.png
    ├── energy_error_framework.png
    ├── orbit_difference.png
    ├── velocity_difference.png
    ├── radial_acceleration_difference.png
    ├── orbital_radius_comparison.png
    ├── orbital_radius_difference.png
    ├── semi_major_axis_comparison.png
    ├── eccentricity_comparison.png
    ├── perihelion_precession.png
    ├── lrl_perihelion_drift.png
    ├── mercury_strain_rate_sweep.png
    ├── mercury_precession_vs_strain_rate.png
    └── orbits.npz

---

# Validation checks

Expected Newtonian baseline behaviour:

- Stable planetary orbits
- Jupiter semi-major axis ≈ **5.2 AU**
- Jupiter orbital period ≈ **11.86 years**

Integrator performance:

- Energy drift typically ~ **1e-15**
- Stable behaviour over **1000+ year integrations**

---

# Stability regimes observed (κ-framework)

Example behaviour for **ρ = 1e-12 kg/m³** over **200-year runs**:

| strain-rate | behaviour |
|---|---|
| `1e-9 – 1e-7` | negligible perturbation |
| `~3e-7 – 5e-7` | measurable secular drift |
| `~8e-7 – 2e-6` | increasing orbital distortion |
| `~3e-6` | strong deformation |
| `> 4e-6` | unstable divergence |

Perihelion motion appears before major orbital deformation while remaining negligible in the safe Solar System regime.

---

# Notes

This Solar System baseline acts as a **control environment** for experiments involving:

- κ-framework modified gravity
- explicit GM handling
- additional bodies or moons
- long-term orbital stability analysis
- perihelion precession diagnostics

For broader context, see the sibling project `rotation-curves`, which explores κ-framework behaviour at galactic scales using rotation curve analysis.