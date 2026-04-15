import numpy as np
import matplotlib.pyplot as plt
from ipywidgets import interact, FloatSlider, VBox, HBox, Label
import ipywidgets as widgets

def curvature_driven_bell_toy(w= np.pi/4, a=0.5, b=0.2, n_samples=200_000):
    # CHSH settings in radians
    settings = {'a': 0.0, 'b': np.pi/4, 'bp': -np.pi/4, 'ap': np.pi/2}
    
    def kappa(d):
        # Your SPARC-style curvature response, adapted to angular separation d
        # κ(d) ≈ a + b log10(g_bar)  → here we treat "g_bar" proxy as (π - d)/π or similar
        g_proxy = np.clip((np.pi - d) / np.pi, 0.01, 1.0)   # rough proxy for local "baryonic strength"
        return a + b * np.log10(g_proxy)
    
    def delta(theta, lam, w, a, b):
        d = np.minimum(np.abs(theta - lam), 2*np.pi - np.abs(theta - lam))
        # Curvature sets the response strength (clamped to reasonable progress range)
        k = kappa(d)
        return np.clip(0.2 + 0.65 * (k / (a + b)), 0.1, 0.95)   # maps κ → δ ∈ [0.1, 0.95]
    
    # Hidden variables
    sigma0 = np.random.choice([-1, 1], n_samples)
    p0 = np.random.uniform(0, 1, n_samples)
    lam = np.random.uniform(-np.pi, np.pi, n_samples)
    
    E = {}
    for lab1, th1 in [('a','a'), ('ap','ap')]:
        for lab2, th2 in [('b','b'), ('bp','bp')]:
            key = f"{lab1}{lab2}"
            da = delta(settings[th1], lam, w, a, b)
            db = delta(settings[th2], lam, w, a, b)
            Ta = p0 + da
            Tb = p0 + db
            sigmaA = sigma0 * (-1)**np.floor(Ta).astype(int)
            sigmaB = sigma0 * (-1)**np.floor(Tb).astype(int)
            E[key] = np.mean(sigmaA * sigmaB)
    
    S = E['ab'] + E['abp'] + E['apb'] - E['apbp']
    return E, S, [a, b, w]

def plot_curvature_toy(w=np.pi/4, a=0.5, b=0.2):
    E, S, params = curvature_driven_bell_toy(w=w, a=a, b=b)
    print(f"CHSH S = {S:.4f}   (params a={params[0]:.3f}, b={params[1]:.3f}, w={params[2]:.3f})")
    print(f"E(ab)  = {E['ab']:.4f}    E(ab') = {E['abp']:.4f}")
    print(f"E(a'b) = {E['apb']:.4f}   E(a'b')= {E['apbp']:.4f}")
    print("\nTry sliding a/b to match your SPARC γ≈0.69 or Mandelbrot k≈0.6245 behaviour.")

interact(plot_curvature_toy,
         w=FloatSlider(min=np.pi/6, max=np.pi/3, step=0.01, value=np.pi/4, description='Window w'),
         a=FloatSlider(min=0.0, max=2.0, step=0.01, value=0.5, description='κ offset a'),
         b=FloatSlider(min=0.0, max=1.0, step=0.01, value=0.2, description='κ log slope b'));