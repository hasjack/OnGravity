"""
Solar System diagnostics using REBOUND.

Includes:
1. Long-term integration (200 years)
2. Jupiter trajectory tracking
3. Relative energy conservation check

This is the final Newtonian baseline before
introducing modified gravity.
"""

import rebound
import matplotlib.pyplot as plt
import math

# ----------------------------
# 1. Simulation setup
# ----------------------------
sim = rebound.Simulation()
sim.units = ("AU", "day", "Msun")
sim.integrator = "ias15"

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

sim.move_to_com()

# ----------------------------
# 2. Diagnostics parameters
# ----------------------------
years = 200
steps = 4000
dt = years * 365.25 / steps

times = []
energy_error = []

# Jupiter index (after adding bodies)
jupiter_index = bodies.index("Jupiter")

jx, jy = [], []

E0 = sim.energy()

# ----------------------------
# 3. Integrate + record
# ----------------------------
for i in range(steps):
    t = i * dt
    sim.integrate(t)

    # Time
    times.append(t / 365.25)

    # Energy conservation
    E = sim.energy()
    energy_error.append((E - E0) / abs(E0))

    # Jupiter position
    p = sim.particles[jupiter_index]
    jx.append(p.x)
    jy.append(p.y)

# ----------------------------
# 4. Plot Jupiter trajectory
# ----------------------------
plt.figure(figsize=(6, 6))
plt.plot(jx, jy, label="Jupiter")
plt.scatter(0, 0, s=80, label="Sun")
plt.gca().set_aspect("equal")
plt.xlabel("x [AU]")
plt.ylabel("y [AU]")
plt.title("Jupiter trajectory (200 years)")
plt.legend()
plt.tight_layout()
plt.savefig("jupiter_trajectory_200yr.png")

# ----------------------------
# 5. Plot energy conservation
# ----------------------------
plt.figure(figsize=(7, 4))
plt.plot(times, energy_error)
plt.xlabel("Time [years]")
plt.ylabel("Relative energy error")
plt.title("Energy conservation (IAS15)")
plt.tight_layout()
plt.savefig("energy_error_200yr.png")

print("Saved:")
print(" - jupiter_trajectory_200yr.png")
print(" - energy_error_200yr.png")
