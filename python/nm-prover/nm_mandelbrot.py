# nm_mandelbrot.py — Natural Maths Mandelbrot Set (2025 Cornwall Edition)
import numpy as np, matplotlib.pyplot as plt
from pathlib import Path

KAPPA = 0.6235
N = 800
MAX_ITER = 256
C_MIN, C_MAX = -1.5, 0.5
B_MIN, B_MAX = -1.0, 1.0

def nm_iter(c, b, kappa=KAPPA):
    x, sigma = b, 1.0
    thresh = 1.0 + abs(b) * kappa
    for i in range(MAX_ITER):
        x = sigma * x*x + c
        if abs(x) > thresh: sigma = -sigma
        if abs(x) > 100: return i
    return MAX_ITER

c = np.linspace(C_MIN, C_MAX, N)
b = np.linspace(B_MIN, B_MAX, N)
C, B = np.meshgrid(c, b)
escape = np.vectorize(nm_iter)(C, B)

Path("outputs").mkdir(exist_ok=True)
plt.figure(figsize=(12,9), dpi=300)
plt.imshow(escape, extent=[C_MIN,C_MAX,B_MIN,B_MAX], origin='lower', cmap='hot', interpolation='bilinear')
plt.title(f'Natural-Maths Mandelbrot Set ⋅ κ = {KAPPA:.4f} ⋅ Bank House, Cornwall 2025')
plt.xlabel('c → real parameter')
plt.ylabel('b → initial curvature bias')
plt.colorbar(label='escape iterations')
plt.savefig('outputs/natural_maths_mandelbrot.png', bbox_inches='tight')
print("Saved: outputs/natural_maths_mandelbrot.png  —  Ready for Co-op scanner.")