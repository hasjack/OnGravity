# Pioneer Workbench

REBOUND/Horizons experiments for Pioneer 10 and 11.

The main script queries NASA Horizons for an initial Solar System state, adds
the Sun, planets, selected moons, and a Pioneer spacecraft, then integrates the
system forward with REBOUND. It can also render a simple top-down animation.

## Run

```bash
python3 pioneer_path.py --spacecraft "Pioneer 10" --start-date 1973-12-04 --years 20 --animate
```

The default moon set is `major`: Earth's Moon, Mars' moons, Galilean moons,
major Saturn moons, major Uranus moons, and major Neptune moons. Use
`--moon-set none` for a faster planets-only control.

Outputs are written to `outputs/`, which is ignored by git.
