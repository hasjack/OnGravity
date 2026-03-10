# Solar System N-body Baseline (REBOUND)

This folder provides a Newtonian Solar System baseline using the `rebound` N-body engine,
with a focus on reproducible diagnostics and a reference for later modified-gravity work.

## Goals
- Produce a reference integration for 9-body dynamics (Sun+8 planets)
- Validate long-term energy conservation and orbit fidelity
- Provide outputs for visualization and comparison

## Physics assumptions
- Newtonian gravity (no relativity, no non-gravitational forces)
- `rebound` integrator: `ias15` (adaptive, high accuracy)
- Standard initial conditions from `rebound` built-in JPL-like bodies
- Units: AU, days, Msun

## Key scripts
- `solar_system_baseline.py`
  - 200-year integration trajectory & energy error diagnostics
  - Jupiter orbit plot + energy drift plot
  - saves in `outputs/`.

- `export_orbits.py`
  - 50-year integration, saves compressed dataset `outputs/orbits.npz`
  - Use for external renderer or analysis.

- `plot_solar_system_static.py`
  - Read orbit data and plot static/combined figures (in-plane view)

- `render_orbits.py`
  - Export GIF/MP4 animation from trajectories in `outputs/orbits.npz`.

- `two_body_gm_baseline.py`
  - Two-body explicit (GM) compare baseline for analytic validation.


## Run instructions

1. Install requirements (ideally venv):

```bash
python3 -m pip install rebound matplotlib numpy
```

2. Run baseline integration:

```bash
cd python/solar-system
python3 solar_system_baseline.py
```

3. Generate orbit dataset:

```bash
python3 export_orbits.py
```

4. Run kappa modified gravity mode (new):

```bash
python3 solar_system_baseline.py --mode kappa --a -0.5 --b 0.5 --c 0.0 --shear
```

5. Render visualizations:

```bash
python3 render_orbits.py
python3 plot_solar_system_static.py
```


## Expected outputs
- `outputs/jupiter_trajectory_200yr.png`
- `outputs/energy_error_200yr.png`
- `outputs/orbits.npz`
- animation files by `render_orbits.py` (GIF/MP4)


## Validation checks
- absolute energy drift < `1e-15` over 200 years (in `solar_system_baseline.py`)
- Jupiter orbit radius and period consistent with ~5.2 AU / 11.86 years
- Visual trajectory coherence vs expected planetary geometry


## Notes
- This is intended as the canonical control for experiments in:
  - explicit GM handling (`export_orbits_explicit_GM.py`)
  - higher-fidelity bodies or moons
  - modified-gravity model comparisons

- For full context, see sibling project `rotation-curves` for Kappa/SPARC model workflow.
