# natural_maths_voxel.py
# 3D voxel carving of the Natural-Maths Mandelbrot Set ℳ_NM(κ)
# x → c (real parameter), y → b (initial bias), z → escape height

import json
import numpy as np

# === NATURAL MATHS CORE (exact from your axioms) ===
def nm_escape(c, b, kappa=0.6235, max_iter=200):
    x = b          # x₀ = initial bias
    sigma = 1.0    # start preserving
    thresh = 1.0 + abs(b) * kappa
    
    for n in range(max_iter):
        x_next = sigma * x * x + c
        
        # Curvature-flip operator
        if abs(x_next) > thresh:
            sigma = -sigma
            
        if abs(x_next) > 100.0:      # bailout
            return n
                    
        x = x_next
    
    return max_iter  # bounded → full height

# === 3D VOXEL GENERATOR ===
def gen_nm_voxel(kappa=0.6235, res=64, max_iter=200):
    """
    res=64  → 64³  = 262,144 voxels  → tiny, instant
    res=128 → 2 million voxels     → still fast
    res=256 → 16 million voxels     → ~30–60 sec on Mac Studio
    """
    print(f"Generating Natural-Maths 3D voxel set κ={kappa}, res={res}...")
    
    voxels = np.zeros((res, res, res), dtype=np.uint8)
    
    # Map grid to meaningful region (tuned from your 2D plots)
    c_min, c_max = -1.5, 0.5
    b_min, b_max = -1.0, 1.0
    
    for ix in range(res):
        c = c_min + (c_max - c_min) * ix / (res - 1)
        for iy in range(res):
            b = b_min + (b_max - b_min) * iy / (res - 1)
            esc = nm_escape(c, b, kappa=kappa, max_iter=max_iter)
            z = min(esc, res - 1)            # cap height to fit grid
            voxels[ix, iy, z] = 1             # place a solid voxel at escape height
    
    # Convert to list for JSON (or save as .npy for speed)
    print("Done. Converting to JSON...")
    voxel_list = voxels.tolist()
    
    result = {
        "kappa": kappa,
        "resolution": res,
        "c_range": [c_min, c_max],
        "b_range": [b_min, b_max],
        "voxels": voxel_list
    }
    
    return json.dumps(result)

# === RUN IT ===
if __name__ == "__main__":
    # Start small — you’ll see the barcode tower instantly
    data = gen_nm_voxel(kappa=0.6235, res=64, max_iter=200)
    
    with open("nm_voxel_64.json", "w") as f:
        f.write(data)
    
    print("Saved nm_voxel_64.json — open in Blender, Unity, or https://voxel.to/")
    
    # When you're ready for glory:
    # data = gen_nm_voxel(kappa=0.0, res=128, max_iter=300)   # pure κ=0 barcode tower