# natural_maths_voxel_pro.py — FINAL VERSION
# 3D Natural-Maths Mandelbrot with full colour by escape time
# Outputs .OBJ + .MTL for instant drop-in to Blender/Unreal/Godot

import numpy as np
from pathlib import Path
from datetime import datetime

def nm_escape_coloured(c, b, kappa=0.6235, max_iter=300):
    x = b
    sigma = 1.0
    thresh = 1.0 + abs(b) * kappa
    
    for n in range(max_iter):
        x_next = sigma * x * x + c
        if abs(x_next) > thresh:
            sigma = -sigma
        if abs(x_next) > 100.0:
            # Smooth colouring (same as classical Mandelbrot)
            return n + 1 - np.log(np.log(abs(x_next))) / np.log(2)
        x = x_next
    return -1.0  # bounded = black

def generate_nm_voxel_obj(kappa=0.0, res=128, max_iter=300, filename=None):
    if filename is None:
        filename = f"NM_Mandelbrot_k{kappa:.4f}_res{res}_{datetime.now().strftime('%Y%m%d')}.obj"
    
    print(f"Generating {filename} | kappa={kappa} | res={res} | max_iter={max_iter}")
    
    c_min, c_max = -1.5, 0.5
    b_min, b_max = -1.0, 1.0
    
    vertices = []
    faces = []
    colors = []
    vert_offset = 1
    
    # Simple 8-color palette (escape time → colour index)
    palette = [
        (0.0, 0.0, 0.0),       # 0: bounded (black)
        (0.1, 0.0, 0.5),       # deep blue
        (0.0, 0.7, 1.0),       # cyan
        (0.0, 1.0, 0.3),       # green
        (1.0, 1.0, 0.0),       # yellow
        (1.0, 0.5, 0.0),       # orange
        (1.0, 0.0, 0.0),       # red
        (1.0, 1.0, 1.0),       # white (fast escape)
    ]
    
    for ix in range(res):
        c = c_min + (c_max - c_min) * ix / (res - 1)
        for iy in range(res):
            b = b_min + (b_max - b_min) * iy / (res - 1)
            esc = nm_escape_coloured(c, b, kappa, max_iter)
            
            if esc < 0:  # bounded
                continue
                
            z = int(esc * res / max_iter)
            z = min(z, res - 1)
            
            x0, y0, z0 = ix, iy, z
            # Add cube at (ix, iy, z)
            vertices.extend([
                (x0, y0, z0), (x0+1, y0, z0), (x0+1, y0+1, z0), (x0, y0+1, z0),
                (x0, y0, z0+1), (x0+1, y0, z0+1), (x0+1, y0+1, z0+1), (x0, y0+1, z0+1)
            ])
            
            col_idx = min(int(esc / max_iter * (len(palette)-1)), len(palette)-2) + 1
            colors.extend([palette[col_idx]] * 6)  # one colour per face
            
            f = vert_offset
            faces.extend([
                (f, f+1, f+2, f+3),  # bottom
                (f+4, f+5, f+6, f+7),  # top
                (f, f+1, f+5, f+4),  # front
                (f+1, f+2, f+6, f+5),  # right
                (f+2, f+3, f+7, f+6),  # back
                (f+3, f, f+4, f+7),  # left
            ])
            vert_offset += 8
    
    # Write OBJ + MTL
    with open(filename, 'w') as f, open(filename.replace('.obj','.mtl'), 'w') as m:
        f.write(f"# Natural-Maths Mandelbrot Set κ={kappa} | res={res} | {datetime.now().isoformat()}\n")
        f.write("mtllib " + filename.replace('.obj','.mtl') + "\n")
        
        for v in vertices:
            f.write(f"v {v[0]:.3f} {v[1]:.3f} {v[2]:.3f}\n")
        
        m.write("newmtl bounded\nKd 0.0 0.0 0.0\n")
        for i, col in enumerate(palette[1:], 1):
            m.write(f"newmtl col{i}\nKd {col[0]:.3f} {col[1]:.3f} {col[2]:.3f}\n")
        
        for i, face in enumerate(faces):
            mat = "bounded" if i % 6 == 0 and colors[i] == (0,0,0) else f"col{colors.index(colors[i])+1}"
            f.write(f"usemtl {mat}\n")
            f.write(f"f {face[0]} {face[1]} {face[2]} {face[3]}\n")
    
    print(f"Saved {filename} + .mtl — drop into Blender, Unreal, Godot, whatever")
    print("For κ=0 you will see perfect vertical barcode blades in full colour")

# RUN THESE TWO
if __name__ == "__main__":
    generate_nm_voxel_obj(kappa=0.6235, res=96, max_iter=250)   # coloured chaotic version
    generate_nm_voxel_obj(kappa=0.0,    res=96, max_iter=400)   # pure discrete spectrum