import numpy as np
import matplotlib.pyplot as plt

# Parameters for Bullet Cluster
M = 9.935e44  # kg (5 × 10^14 M_sun)
G = 6.674e-11  # m^3 kg^-1 s^-2
k0 = 7e-21    # m^-1
rho0 = 1600   # kg/m^3
a = 0.5
r0 = 3.086e21 # m (100 kpc)
b = 2         # Adjusted to 0 for r < 1e5 m
rho = 1e9     # kg/m^3 (galaxy clump density)
b_impact = 6.172e20  # m (200 kpc)

# κ function (b = 0 for r < 1e5 m to avoid blow-up)
def kappa(r, rho):
    b_eff = 0 if r < 1e5 else b
    return k0 * (rho / rho0)**a * (r0 / r)**b_eff

# Grid for potential (2000 kpc × 2000 kpc)
x = np.linspace(-1e6, 1e6, 200)  # m (1000 kpc each side)
y = np.linspace(-1e6, 1e6, 200)  # m
X, Y = np.meshgrid(x, y)
R = np.sqrt(X**2 + Y**2)

# Calculate κ and effective potential, cap exponential
kappa_val = kappa(b_impact, rho)
def safe_exp(x):
    return np.where(x > 700, np.exp(700), np.where(x < -700, np.exp(-700), np.exp(x)))
potential = -G * M / R * safe_exp(kappa_val * R)  # Potential in m^2/s^2

# Contour plot
plt.figure(figsize=(10, 6))
contour = plt.contourf(X / 3.086e19, Y / 3.086e19, potential, levels=20, cmap='RdYlBu')
plt.colorbar(label='Potential (m²/s²)')
plt.plot(250 / 3.086, 0, 'ro', label='Offset (250 kpc)')  # Approximate offset
plt.xlabel('Distance (kpc)')
plt.ylabel('Distance (kpc)')
plt.title('Bullet Cluster Lensing Potential with Unified Model')
plt.legend()
plt.axis('equal')
plt.grid(True, ls="--")

# Save the figure
plt.savefig('fig:bullet_lensing.png', dpi=300, bbox_inches='tight')
plt.show()