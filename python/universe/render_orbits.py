import matplotlib
matplotlib.use("Agg")

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# ----------------------------
# Load data
# ----------------------------
data = np.load("orbits.npz", allow_pickle=True)
bodies = data["bodies"]
t = data["t"]
pos = data["pos"]  # [body, step, xyz]

# ----------------------------
# Figure setup
# ----------------------------
fig, ax = plt.subplots(figsize=(6, 6))
ax.set_aspect("equal")
ax.set_xlim(-6, 6)
ax.set_ylim(-6, 6)
ax.set_xlabel("x [AU]")
ax.set_ylabel("y [AU]")

lines = []
points = []

for _ in bodies:
    line, = ax.plot([], [], lw=1)
    pt, = ax.plot([], [], "o")
    lines.append(line)
    points.append(pt)

trail = 200

# ----------------------------
# Animation update
# ----------------------------
def update(frame):
    for i in range(len(bodies)):
        start = max(0, frame - trail)

        lines[i].set_data(
            pos[i, start:frame, 0],
            pos[i, start:frame, 1],
        )

        points[i].set_data(
            [pos[i, frame, 0]],
            [pos[i, frame, 1]],
        )

    ax.set_title(f"t = {t[frame]/365.25:.2f} years")
    return lines + points

# ----------------------------
# Render
# ----------------------------
ani = FuncAnimation(
    fig,
    update,
    frames=len(t),
    interval=30,
)

ani.save("outputs/solar_system.gif", writer="pillow", dpi=120)
print("Saved outputs/solar_system.gif")
