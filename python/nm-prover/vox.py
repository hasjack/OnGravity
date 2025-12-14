# quick_convert.py — JSON to MagicaVoxel .vox (needs 'numpy' + 'mvg' pip if not installed, but skip if tool has it)
import json
import numpy as np
from mvg import encode  # pip install mvg if needed (or use online converter)

with open('nm_voxel_64.json', 'r') as f:
    data = json.load(f)
voxels = np.array(data['voxels'], dtype=np.uint8)  # Your 3D array

# Encode to VOX (simple palette: 1 = white, 0 = empty)
palette = [0] * 256  # Black empty
palette[1] = 0xffffff  # White voxels
vox_data = encode(voxels, palette=palette)

with open('nm_voxel.vox', 'wb') as f:
    f.write(vox_data)
print("Saved nm_voxel.vox")