import rebound
import numpy as np

sim = rebound.Simulation()
sim.units = ("AU", "day", "Msun")
sim.integrator = "ias15"

bodies = ["Sun","Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"]
for b in bodies:
    sim.add(b)
sim.move_to_com()

years = 50
steps = 5000
ts = np.linspace(0, years * 365.25, steps)

pos = np.zeros((len(bodies), steps, 3), dtype=np.float64)

for k, t in enumerate(ts):
    sim.integrate(t)
    for i in range(len(bodies)):
        p = sim.particles[i]
        pos[i, k, :] = (p.x, p.y, p.z)

np.savez_compressed("outputs/orbits.npz", bodies=np.array(bodies), t=ts, pos=pos)
print("Saved orbits.npz")
