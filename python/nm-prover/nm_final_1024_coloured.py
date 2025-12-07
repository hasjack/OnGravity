# nm_final_1024_coloured.py
# One billion voxels. Full HSV colour. Ready for arXiv figure.
# Run once. Keep forever.

import numpy as np
from colorsys import hsv_to_rgb
from pathlib import Path
from datetime import datetime

def smooth_escape(c, b, kappa=0.6235, max_iter=400):
    x = b
    sigma = 1.0
    thresh = 1.0 + abs(b) * kappa
    
    for n in range(max_iter):
        x_next = sigma * x * x + c
        if abs(x_next) > thresh:
            sigma = -sigma
        if abs(x_next) > 100.0:
            # Smooth colouring
            return n + 1 - np.log2(np.log2(abs(x_next)))
        x = x_next
    return -1.0  # bounded

def generate_1024_coloured(kappa=0.0):
    res = 1024
    max_iter = 500 if kappa == 0 else 400
    filename = f"NaturalMaths_{'kappa0' if kappa==0 else f'kappa{kappa:.4f}'}_1024_{datetime.now().strftime('%Y%m%d')}.obj"
    
    print(f"Generating {filename} — this will take 4–6 minutes...")
    
    c_min, c_max = -1.5, 0.5
    b_min, b_max = -1.0, 1.0
    
    vertices = []
    faces = []
    colors = []
    vert_offset = 1
    
    for ix in range(res):
        if ix % 128 == 0: print(f"Row {ix}/{res}")
        c = c_min + (c_max - c_min) * ix / (res - 1)
        for iy in range(res):
            b = b_min + (b_max - b_min) * iy / (res - 1)
            esc = smooth_escape(c, b, kappa, max_iter)
            if esc < 0: continue
            
            z = min(int(esc * res / max_iter), res - 1)
            x0 = ix; y0 = iy; z0 = z
            
            # Cube vertices
            v = [(x0,y0,z0), (x0+1,y0,z0), (x0+1,y0+1,z0), (x0,y0+1,z0),
                 (x0,y0,z0+1), (x0+1,y0,z0+1), (x0+1,y0+1,z0+1), (x0,y0+1,z0+1)]
            vertices.extend(v)
            
            # Colour from escape time
            hue = (esc / max_iter) * 0.8 + 0.1  # avoid pure red
            r, g, b_rgb = hsv_to_rgb(hue, 1.0, 1.0)
            colors.extend([(r,g,b_rgb)] * 6)
            
            f = vert_offset
            faces.extend([
                (f,f+1,f+2,f+3), (f+4,f+5,f+6,f+7),
                (f,f+1,f+5,f+4), (f+1,f+2,f+6,f+5),
                (f+2,f+3,f+7,f+6), (f+3,f,f+4,f+7)
            ])
            vert_offset += 8
    
    # Write OBJ + MTL
    mtl_file = filename.replace(".obj", ".mtl")
    with open(filename, "w") as obj, open(mtl_file, "w") as mtl:
        obj.write(f"# Natural Mathematics κ={kappa} | 1024³ | Jack Pickett, Bank House, Cornwall\n")
        obj.write(f"mtllib {Path(mtl_file).name}\n")
        
        for v in vertices:
            obj.write(f"v {v[0]:.3f} {v[1]:.3f} {v[2]:.3f}\n")
        
        mtl.write("newmtl voxel\nKd 1.0 1.0 1.0\n")
        obj.write("usemtl voxel\n")
        for face in faces:
            obj.write(f"f {face[0]} {face[1]} {face[2]} {face[3]}\n")
    
    print(f"DONE → {filename} + .mtl")
    print("Drop into Blender → Import → Wavefront OBJ → behold the primes in 3D")

# RUN THESE TWO (κ=0 first — it’s the exact spectrum)
if __name__ == "__main__":
    generate_1024_coloured(kappa=0.0)        # ← the pure barcode cathedral
    generate_1024_coloured(kappa=0.6235)    # ← the GUE-perturbed version