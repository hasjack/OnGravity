# Pioneer Workbench

REBOUND/Horizons experiments for Pioneer 10 and 11.

The main script queries NASA Horizons for an initial Solar System state, adds
the Sun, planets, selected moons, and a Pioneer spacecraft, then integrates the
system forward with REBOUND. It can also render a simple top-down animation.

## Run

```bash
python3 pioneer_path.py --spacecraft "Pioneer 10" --start-date 1973-12-04 --years 20 --animate
python3 pioneer_path.py --spacecraft "Pioneer 10" --start-date 1973-12-04 --years 20 --compare-kappa
```

The default moon set is `major`: Earth's Moon, Mars' moons, Galilean moons,
major Saturn moons, major Uranus moons, and major Neptune moons. Use
`--moon-set none` for a faster planets-only control.

Outputs are written to `outputs/`, which is ignored by git.

`--compare-kappa` runs a Newtonian baseline and a κ-perturbed spacecraft tracer
from the same Horizons initial state. The κ path currently applies a
Sun-directed residual to the spacecraft only:

```text
a_residual = (G M_sun / r^2) * (exp(kappa0 * r) - 1)
```

The default `kappa0` is `2.6e-26 m^-1`.
