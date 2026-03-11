# Solar System N-body Baseline (REBOUND)

This folder provides a Newtonian Solar System baseline using the `rebound` N-body engine, with a focus on reproducible diagnostics and a reference for later modified-gravity experiments.

The system models the Sun and eight planets and is primarily used to analyse how small perturbations — such as those introduced by the κ-framework — influence long-term orbital behaviour.

## Goals
- Produce a reference integration for 9-body Solar System dynamics (Sun + 8 planets)
- Validate long-term energy conservation and orbital fidelity
- Provide outputs for visualization and comparison
- Provide a sandbox for testing modified-gravity perturbations

## Physics assumptions
- Newtonian gravity (no relativity, no non-gravitational forces)
- `rebound` integrator: `ias15` (adaptive, high accuracy)
- Standard initial conditions from `rebound` built-in Solar System bodies
- Units: AU, days, Msun

## Key scripts
- `solar_system_baseline.py`
  - Main Solar System experiment driver
  - Newtonian baseline or κ-framework modified gravity mode
  - Jupiter trajectory diagnostics
  - Energy conservation diagnostics
  - Residual comparison vs Newtonian baseline
  - Saves plots in `outputs/`

- `export_orbits.py`
  - 50-year integration, saves compressed dataset `outputs/orbits.npz`
  - Use for external renderer or analysis

- `plot_solar_system_static.py`
  - Reads orbit data and plots static / combined figures (in-plane view)

- `render_orbits.py`
  - Export GIF / MP4 animation from trajectories in `outputs/orbits.npz`

- `two_body_gm_baseline.py`
  - Two-body explicit (GM) compare baseline for analytic validation

## Diagnostics generated
- `jupiter_trajectory_*.png`
  - Orbital trajectory in the orbital plane

- `energy_error_*.png`
  - Relative energy drift over the integration

- `orbit_difference.png`
  - Position deviation from Newtonian baseline

- `velocity_difference.png`
  - Velocity deviation from Newtonian baseline

- `radial_acceleration_difference.png`
  - Radial acceleration residual vs Newtonian baseline

- `orbital_radius_comparison.png`
  - Jupiter orbital radius compared to baseline

- `orbital_radius_difference.png`
  - Difference in orbital radius vs Newtonian baseline

- `strain_rate_sweep.png`
  - Stability map for κ-framework parameter sweeps

## Run instructions

1. Install requirements (ideally venv):

```bash
python3 -m pip install rebound matplotlib numpy
```

2. Run baseline integration:

```bash
cd python/solar-system
python3 solar_system_baseline.py --mode baseline
```

3. Run κ-framework modified gravity:

```bash
python3 solar_system_baseline.py \
  --mode framework \
  --rho 1e-12 \
  --strain-rate 1e-7
```

4. Run long-term stability test:

```bash
python3 solar_system_baseline.py \
  --mode framework \
  --rho 1e-12 \
  --strain-rate 1e-7 \
  --years 1000 \
  --steps 10000
```

5. Run strain-rate stability sweep:

```bash
python3 solar_system_baseline.py \
  --sweep-strain \
  --rho 1e-12
```

## Expected outputs
- `outputs/jupiter_trajectory_*.png`
- `outputs/energy_error_*.png`
- `outputs/orbit_difference.png`
- `outputs/velocity_difference.png`
- `outputs/radial_acceleration_difference.png`
- `outputs/orbital_radius_comparison.png`
- `outputs/orbital_radius_difference.png`
- `outputs/strain_rate_sweep.png`
- `outputs/orbits.npz` (if using `export_orbits.py`)

## Validation checks
- Stable Jupiter orbit (~5.2 AU)
- Orbital period ≈ 11.86 years
- Bounded energy error in the Newtonian baseline

Typical behaviour observed:

- Energy drift ~ `1e-15` over 1000+ year integrations
- Orbit visually stable over 10,000 year integrations

## Stability regimes observed (κ-framework)

Example behaviour for `ρ = 1e-12` over 200-year runs:

| strain rate | behaviour |
|---|---|
| `1e-7` | stable, minimal drift |
| `5.337e-7` | stable but measurable secular drift |
| `1.233e-6` | significant orbital deformation |
| `1.874e-6` | strong deformation / near-unstable threshold |
| `> 2e-6` | unstable orbit divergence |

## Notes
- This Solar System baseline acts as a canonical control for experiments involving:
  - κ-framework modified gravity
  - explicit GM handling
  - additional bodies or moons
  - long-term orbital stability analysis

- For broader context, see the sibling project `rotation-curves`, which explores κ-framework behaviour at galactic scales using rotation curve analysis.