"""
Solar System baseline using REBOUND built-in Horizons support.

- Newtonian N-body gravity
- JPL Horizons initial conditions (handled internally by REBOUND)
- Barycentric frame
- Jupiter orbit visualization

This is the CONTROL simulation.
"""

import rebound
import matplotlib.pyplot as plt
import numpy as np

# ----------------------------
# 1. Simulation setup
# ----------------------------
sim = rebound.Simulation()
sim.units = ("AU", "day", "Msun")
sim.integrator = "ias15"

print("Loading Solar System from JPL Horizons (via REBOUND)...")

bodies = [
    "Sun",
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
]

for body in bodies:
    sim.add(body)   # <-- THIS is the Horizons interface

sim.move_to_com()
print("Solar System loaded successfully.")

# Jupiter index
jupiter_index = bodies.index("Jupiter")

# ----------------------------
# 2. Integrate & record
# ----------------------------
years = 50
steps = 1500
times = np.linspace(0, years * 365.25, steps)

jx, jy = [], []

for t in times:
    sim.integrate(t)
    p = sim.particles[jupiter_index]
    jx.append(p.x)
    jy.append(p.y)

# ----------------------------
# 3. Plot
# ----------------------------
plt.figure(figsize=(6, 6))
plt.plot(jx, jy, label="Jupiter")
plt.scatter(0, 0, s=80, label="Sun")
plt.gca().set_aspect("equal")
plt.xlabel("x [AU]")
plt.ylabel("y [AU]")
plt.title("Jupiter Orbit (REBOUND + JPL Horizons)")
plt.legend()
plt.tight_layout()
plt.savefig("jupiter_orbit_rebound.png")

print("Done.")
print("Saved: jupiter_orbit_rebound.png")
