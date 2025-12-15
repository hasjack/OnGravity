# Solar System N-body Baseline (REBOUND)

This repository contains a validated Newtonian N-body baseline
for Solar System dynamics using REBOUND.

## Baseline physics
- Newtonian gravity
- REBOUND IAS15 integrator
- JPL Horizons initial conditions (via REBOUND)
- Units: AU, days, Msun

## Validation
- Energy conservation verified to ~1e-15 over 200 years
- Jupiter orbit matches expected semi-major axis (~5.2 AU)
- Static and animated visual checks included

## Structure
- export_orbits.py: generate trajectory data
- render_orbits.py: headless visualisation (GIF/MP4)
- solar_system_baseline.py: diagnostics
- outputs/: generated artefacts

This baseline is used as the control for future experiments
(e.g. explicit GM, moons, modified gravity).