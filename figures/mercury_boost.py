import numpy as np
import matplotlib.pyplot as plt

# Constants and Parameters (PPN-tuned for Mercury)
G = 6.674e-11  # m^3 kg^-1 s^-2
k0 = 4e-16     # m^-1 (PPN-tuned for Mercury precession)
rho0 = 1600    # kg/m^3
a = 0.5
r0 = 3.086e21  # m (100 kpc)
b = 0          # Set to 0 for all r to avoid blow-up

# Distance range (linear scale around Mercury's orbit, in meters)
r_min = 5e10    # m (0.33 AU)
r_max = 6.5e10  # m (0.43 AU)
r = np.linspace(r_min, r_max, 1000)  # m

# κ function (b = 0 to ensure stability)
def kappa(r, rho):
    return k0 * (rho / rho0)**a * (r0 / r)**0

# Density profile (Sun's average)
rho_mercury = 1400  # kg/m^3

# Calculate kappa and boost
kappa_mercury = [kappa(r_val, rho_mercury) for r_val in r]
boost_mercury = np.exp(np.array(kappa_mercury) * r)

# Specific point for annotation
r_mercury = 5.79e10  # m (Mercury's semi-major axis)
kappa_mercury_val = kappa(r_mercury, rho_mercury)
boost_mercury_val = np.exp(kappa_mercury_val * r_mercury)

# Plot
plt.figure(figsize=(10, 6))
plt.plot(r / 1.496e11, boost_mercury, label=r'Mercury Scale ($\rho = 1400 \, \mathrm{kg/m}^3$)', color='blue')
plt.plot(r_mercury / 1.496e11, boost_mercury_val, 'bo')  # Mark Mercury
plt.text(r_mercury / 1.496e11 + 0.01, boost_mercury_val, r'Mercury $(1.000023)$', fontsize=9, ha='left')

plt.xlabel('Distance (AU)')
plt.ylabel(r'$e^{\kappa r}$')  # Simplified to avoid complex parsing, using raw math mode
plt.title('Mercury’s Gravitational Boost with κ')
plt.legend()
plt.grid(True, ls="--")
plt.xlim(r_min / 1.496e11, r_max / 1.496e11)  # AU limits
plt.ylim(1.00002, 1.00003)  # Zoomed to Mercury effect

# Save the figure
plt.savefig('fig:mercury_boost.png', dpi=300, bbox_inches='tight')
plt.show()