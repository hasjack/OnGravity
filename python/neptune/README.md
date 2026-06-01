# Neptune Ring Workbench

Small diagnostics for Neptune's rings, especially the Adams ring and its
nearby Galatea resonance.

## Scripts

- `neptune_rings.py` computes circular ring periods, compares Adams with the
  Galatea 43:42 mean-motion resonance, and can apply the local κ multiplier.
- `galatea_adams_rebound.py` runs a minimal REBOUND integration with Neptune as
  the central mass and massless circular Galatea/Adams tracers. Use
  `--mode framework` to add a Neptune-centered κ acceleration multiplier.

## Run

```bash
python3 neptune_rings.py
python3 galatea_adams_rebound.py
python3 galatea_adams_rebound.py --mode framework --rho 1e-12 --strain-rate 1e-7
```

Outputs are written to `outputs/`, which is ignored by git.
