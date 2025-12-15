"""
Baseline Solar System simulation using REBOUND.

- Newtonian N-body gravity
- Sun + 8 planets
- Initial conditions from JPL Horizons (via REBOUND)
- High-accuracy IAS15 integrator
- Simple trajectory visualization

This file is intended to be the CONTROL case
before introducing any modified gravity.
"""

import rebound
import matplotlib.pyplot as plt

# ----------------------------
# 1. Create simulation
# ----------------------------
sim = rebound.Simulation()

# Units: Astronomical Units, days, Solar masses
sim.units = ("AU", "day", "Msun")

# High-accuracy adaptive integrator
sim.integrator = "ias15"

# ----------------------------
# 2. Add Solar System bodies
# ----------------------------
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
    sim.add(body)

# Move to barycentric frame
sim.move_to_com()

print("Initialized simulation:")
print(sim)

# ----------------------------
# 3. Integrate forward in time
# ----------------------------
# We will track planet trajectories for 20 years
years = 20
steps = 2000

times = [i * (365.25 * years / steps) for i in range(steps)]

# Store trajectories
trajectories = {body: {"x": [], "y": []} for body in bodies}

for t in times:
    sim.integrate(t)
    for i, body in enumerate(bodies):
        p = sim.particles[i]
        trajectories[body]["x"].append(p.x)
        trajectories[body]["y"].append(p.y)

# ----------------------------
# 4. Plot results
# ----------------------------
plt.figure(figsize=(8, 8))

for body in bodies:
    if body == "Sun":
        plt.scatter(
            trajectories[body]["x"][0],
            trajectories[body]["y"][0],
            s=120,
            label="Sun"
        )
    else:
        plt.plot(
            trajectories[body]["x"],
            trajectories[body]["y"],
            label=body
        )

plt.gca().set_aspect("equal")
plt.xlabel("x [AU]")
plt.ylabel("y [AU]")
plt.title("Newtonian Solar System (REBOUND baseline)")
plt.legend(loc="upper right", fontsize=8)
plt.tight_layout()
plt.savefig("outputs/solar_system_static.png")

print("Saved plot to outputs/solar_system_static.png")
