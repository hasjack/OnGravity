import math

# PARAMETERS — only change these if you want
C_MIN      = -2.5
C_MAX      =  1.0
KAPPA      =  0
MAX_ITER   =  120
DOWNSAMPLE =  2        # ← controls file size and resolution
# DOWNSAMPLE = 1  → full 600×360  → ~14 MB
# DOWNSAMPLE = 2  → 300×180       → ~900 KB
# DOWNSAMPLE = 3  → 200×120       → ~450 KB
# DOWNSAMPLE = 4  → 150×90        → ~250 KB
# DOWNSAMPLE = 6  → 100×60        → ~120 KB

WIDTH  = 600 // DOWNSAMPLE
HEIGHT = 360 // DOWNSAMPLE

def make_color(n):
    if n >= MAX_ITER: return (5,10,25)
    t = n / MAX_ITER
    s = math.sqrt(t)
    return (int(40+190*s), int(80+120*s), int(180+60*s))

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">\n'

for py in range(HEIGHT):
    b = 2 * (py / (HEIGHT-1) if HEIGHT > 1 else 0.5) - 1
    px = 0
    while px < WIDTH:
        c = C_MIN + (px / (WIDTH-1) if WIDTH > 1 else 0.5) * (C_MAX - C_MIN)
        x = 0.0
        sigma = 1 if b == 0 else math.copysign(1, b)
        it = 0
        while it < MAX_ITER:
            nx = sigma * x * x + c
            if abs(nx) > 1 + abs(b) * (KAPPA):   # k is here, set to 0.0
                sigma = -sigma
            x = nx
            if abs(x) > 2: break
            it += 1
        else:
            it = MAX_ITER
        color = f"rgb{make_color(it)}"
        count = 1
        px += 1
        while px < WIDTH:
            c2 = C_MIN + (px / (WIDTH-1) if WIDTH > 1 else 0.5) * (C_MAX - C_MIN)
            x2 = 0.0
            s2 = 1 if b == 0 else math.copysign(1, b)
            it2 = 0
            while it2 < MAX_ITER:
                nx2 = s2 * x2 * x2 + c2
                if abs(nx2) > 1 + abs(b) * (KAPPA):
                    s2 = -s2
                x2 = nx2
                if abs(x2) > 2: break
                it2 += 1
            else:
                it2 = MAX_ITER
            if make_color(it2) != make_color(it):
                break
            count += 1
            px += 1
        w = count * DOWNSAMPLE
        svg += f'<rect x="{(px-count)*DOWNSAMPLE}" y="{py*DOWNSAMPLE}" width="{w}" height="{DOWNSAMPLE}" fill="{color}"/>\n'

svg += '</svg>'
open("barcode.svg", "w").write(svg)
print("barcode.svg written")