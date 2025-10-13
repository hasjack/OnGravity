import numpy as np
import matplotlib.pyplot as plt
import os

# Parameters for SMBH growth
Mdot = 0.105  # M_sun/yr (unified model rate)
t_years = np.linspace(0, 5e9, 250)  # years, 0 to 5 billion years
M_initial = 0  # M_sun, starting mass

# Calculate SMBH mass over time (linear growth)
M_BH = M_initial + Mdot * t_years  # M_sun, linear growth

# JWST observation points with explicit indexing
t_obs = np.array([13.8 / (1 + 6), 13.8 / (1 + 7), 13.8 / (1 + 10), 13.8 / (1 + 15)]) * 1e9  # years
M_obs = np.array([0.05e9, 0.3e9, 0.009e9, 0.1e9])  # M_sun, explicit in billions
print("Debug - M_obs (billions):", M_obs / 1e9)  # Debug output

# Eddington limit parameters
Mdot_edd = 2e-2  # M_sun/yr (Eddington rate for ~10^7 M_sun, approximate)
M_seed_edd = 1e6  # M_sun, seed mass
M_BH_edd = M_seed_edd + Mdot_edd * t_years  # M_sun, linear Eddington growth

# κ-boosted accretion rate (mimicking local density enhancement)
Mdot_boost = 0.21  # M_sun/yr (2× baseline for κ boost)
M_BH_boost = M_initial + Mdot_boost * t_years  # M_sun, linear boosted growth

# Create figures directory if it doesn't exist
if not os.path.exists('figures'):
    os.makedirs('figures')

# Plot
plt.figure(figsize=(10, 6))
plt.plot(t_years / 1e9, M_BH / 1e9, label=r'SMBH Mass Growth (Unified)', color='black', linewidth=2)
plt.plot(t_obs / 1e9, M_obs / 1e9, 'ro', label='JWST Observations (z=6,7,10,15)', markersize=8)
plt.plot(t_years / 1e9, M_BH_edd / 1e9, label=r'Eddington Growth', color='green', linewidth=2, linestyle='--')
plt.plot(t_years / 1e9, M_BH_boost / 1e9, label=r'κ-Boosted Growth', color='blue', linewidth=2, linestyle='--')
plt.xlabel('Time (Gyr)')
plt.ylabel(r'Mass ($10^9 M_\odot$)')
plt.title('SMBH Growth with Unified Model vs. JWST Observations')
plt.legend()
plt.grid(True)
plt.xlim(0, 5)  # Unchanged
plt.ylim(0, 2)  # Unchanged
plt.savefig('figures/smbh_growth.png', dpi=300)
plt.show()