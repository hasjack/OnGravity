import rebound
import numpy as np

sim = rebound.Simulation()
sim.units = ("AU", "day", "Msun")
sim.integrator = "ias15"

# Explicit gravitational constant
sim.G = 1.0

# GM values in AU^3/day^2
GM = {
    "Sun":     0.0002959122082855911,
    "Jupiter": 0.000000282534590952,
}

# Add Sun at origin
sim.add(m=GM["Sun"])

# Add Jupiter (circular orbit for now)
a = 5.2044  # AU
v = np.sqrt(GM["Sun"] / a)

sim.add(
    m=GM["Jupiter"],
    x=a,
    y=0,
    z=0,
    vx=0,
    vy=v,
    vz=0,
)

sim.move_to_com()
