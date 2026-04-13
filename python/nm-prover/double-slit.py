import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

np.random.seed(42)

NUM_HISTORIES = 8000
SLIT_SEP = 0.6
SLIT_WIDTH = 0.08
WAVELENGTH = 0.2

x_screen = np.linspace(-2.0, 2.0, 400)

def screen_phase(x, slit_sign, slit_sep=SLIT_SEP, wavelength=WAVELENGTH):
    """
    Phase contribution from one slit.
    slit_sign = -1 for slit A, +1 for slit B
    """
    path_factor = x / np.sqrt(1.0 + x**2)
    return (2.0 * np.pi / wavelength) * (slit_sign * slit_sep / 2.0) * path_factor

def parity_bias_from_phase(phi):
    """
    Convert a phase into a real-valued parity expectation in [-1, 1].

    cos(phi) is the cleanest choice:
      +1 => strongly even / reinforcing
      -1 => strongly odd / cancelling
    """
    return np.cos(phi)

def sample_parity(mu, n_samples):
    """
    Draw ±1-valued histories with expectation mu.
    If E[sigma] = mu, then:
      P(+1) = (1 + mu)/2
      P(-1) = (1 - mu)/2
    """
    p_plus = 0.5 * (1.0 + mu)
    draws = np.random.rand(n_samples)
    return np.where(draws < p_plus, 1.0, -1.0)

# --- Standard QM reference ---

def standard_double_slit(x, slit_sep=SLIT_SEP, wavelength=WAVELENGTH):
    phase_diff = (2.0 * np.pi / wavelength) * (slit_sep * x / np.sqrt(1.0 + x**2))
    return np.cos(phase_diff / 2.0) ** 2

intensity_std = standard_double_slit(x_screen)

# --- Natural Mathematics toy: real parity process ---

mean_A = np.zeros_like(x_screen)
mean_B = np.zeros_like(x_screen)
net_parity = np.zeros_like(x_screen)
intensity_nm = np.zeros_like(x_screen)

for i, x in enumerate(x_screen):
    phi_A = screen_phase(x, slit_sign=-1)
    phi_B = screen_phase(x, slit_sign=+1)

    mu_A = parity_bias_from_phase(phi_A)
    mu_B = parity_bias_from_phase(phi_B)

    sig_A = sample_parity(mu_A, NUM_HISTORIES)
    sig_B = sample_parity(mu_B, NUM_HISTORIES)

    mean_A[i] = sig_A.mean()
    mean_B[i] = sig_B.mean()

    net = mean_A[i] + mean_B[i]
    net_parity[i] = net

    # Coarse-grained measurable intensity analogue
    intensity_nm[i] = 0.25 * net**2

# --- Plot ---

fig, axs = plt.subplots(3, 1, figsize=(12, 9), dpi=200)

axs[0].plot(x_screen, intensity_std, lw=2, label='Standard QM |Ψ_A + Ψ_B|²')
axs[0].set_title('Double-Slit Interference: Standard QM')
axs[0].set_ylabel('Intensity')
axs[0].grid(True, alpha=0.3)
axs[0].legend()

axs[1].plot(x_screen, mean_A, lw=1.5, label='Slit A parity mean')
axs[1].plot(x_screen, mean_B, lw=1.5, label='Slit B parity mean')
axs[1].plot(x_screen, net_parity, 'r-', lw=2, label='NM net parity')
axs[1].set_title('Natural Mathematics: real parity correlations varying across screen')
axs[1].set_ylabel('Parity expectation')
axs[1].grid(True, alpha=0.3)
axs[1].legend()

axs[2].plot(x_screen, intensity_std, 'b-', lw=2, label='Standard QM')
axs[2].plot(x_screen, intensity_nm, 'r--', lw=2, label='NM parity (coarse-grained)')
axs[2].set_title('Overlay — fringe structure recovered in a real parity toy model')
axs[2].set_xlabel('Position on screen x')
axs[2].set_ylabel('Intensity')
axs[2].grid(True, alpha=0.3)
axs[2].legend()

plt.tight_layout()
Path("outputs").mkdir(exist_ok=True)
plt.savefig("outputs/nm_double_slit_parity_working.png", bbox_inches="tight")
plt.show()

print("Saved: outputs/nm_double_slit_parity_working.png")