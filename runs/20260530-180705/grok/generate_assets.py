#!/usr/bin/env python3
"""Generate Windows 98 style retro pixel art assets using PIL."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = "assets"
os.makedirs(OUT_DIR, exist_ok=True)

# Win98 color palette
GRAY = (192, 192, 192)
DARK_GRAY = (128, 128, 128)
LIGHT_GRAY = (223, 223, 223)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
NAVY = (0, 0, 128)
TEAL = (0, 128, 128)
OLIVE = (128, 128, 0)
MAROON = (128, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 128, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
CYAN = (0, 255, 255)
MAGENTA = (255, 0, 255)
SKY_BLUE = (0, 128, 192)
CLOUD_WHITE = (240, 248, 255)
DESKTOP_TEAL = (0, 128, 128)
BROWN = (139, 69, 19)

def save(img, name):
    path = os.path.join(OUT_DIR, name)
    img.save(path, "PNG")
    print(f"Saved {path}")
    return path

def create_wallpaper():
    # Classic Windows 98 "Clouds" inspired wallpaper 800x600
    w, h = 800, 600
    img = Image.new("RGB", (w, h), (135, 206, 250))  # light sky
    draw = ImageDraw.Draw(img)
    
    # Gradient sky bottom darker
    for y in range(h):
        r = int(135 - y * 0.08)
        g = int(206 - y * 0.12)
        b = int(250 - y * 0.05)
        draw.line([(0, y), (w, y)], fill=(max(0,r), max(0,g), max(80,b)))
    
    # Draw fluffy clouds - several layers
    def cloud(x, y, scale=1.0, alpha=255):
        # Main body ellipses
        s = int(22 * scale)
        for dx, dy, r in [
            (0, 0, int(38*s/22)), (35, -5, int(30*s/22)), (-30, 8, int(25*s/22)),
            (18, 12, int(28*s/22)), (50, 5, int(22*s/22))
        ]:
            draw.ellipse([x+dx-r, y+dy-r, x+dx+r, y+dy+r], fill=(255,255,255))
    
    cloud(120, 140, 1.3)
    cloud(280, 80, 1.0)
    cloud(450, 160, 1.5)
    cloud(620, 70, 0.9)
    cloud(150, 320, 1.1)
    cloud(400, 280, 1.4)
    cloud(580, 380, 1.0)
    cloud(80, 480, 0.85)
    cloud(300, 450, 1.2)
    cloud(520, 490, 0.95)
    
    # Add very subtle Windows 98 logo text bottom right? Or hills? Keep clouds.
    # Small Windows logo mark
    draw.rectangle([w-180, h-70, w-50, h-20], outline=(200,220,255), width=1)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 11)
    except:
        font = ImageFont.load_default()
    draw.text((w-170, h-62), "Windows 98", fill=(180, 200, 220), font=font)
    
    # Subtle scan or dither? Skip for clean
    return save(img, "wallpaper.png")

def draw_icon_base(draw, size, bg_color=GRAY):
    # Draw a classic 3d beveled square icon placeholder
    s = size
    # Outer bevel
    draw.rectangle([0,0,s-1,s-1], fill=bg_color, outline=DARK_GRAY)
    draw.line([(1,1),(s-2,1)], fill=WHITE)
    draw.line([(1,1),(1,s-2)], fill=WHITE)
    draw.line([(2,2),(s-3,2)], fill=LIGHT_GRAY)
    draw.line([(2,2),(2,s-3)], fill=LIGHT_GRAY)
    draw.line([(s-2,2),(s-2,s-2)], fill=DARK_GRAY)
    draw.line([(2,s-2),(s-3,s-2)], fill=DARK_GRAY)

def create_my_computer_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Monitor
    # Body
    draw.rectangle([6,4,42,30], fill=(210,180,140), outline=BLACK)  # beige CRT
    # Screen
    draw.rectangle([10,8,38,24], fill=NAVY, outline=(60,60,60))
    # Windows flag on screen (4 squares)
    colors = [RED, GREEN, BLUE, YELLOW]
    positions = [(12,10),(20,10),(12,16),(20,16)]
    for c, (px,py) in zip(colors, positions):
        draw.rectangle([px,py,px+6,py+4], fill=c)
    # Stand
    draw.rectangle([18,30,30,34], fill=DARK_GRAY)
    draw.rectangle([14,34,34,38], fill=DARK_GRAY, outline=BLACK)
    # Label area bottom
    return save(img, "icon_my_computer.png")

def create_recycle_icon(size=48, full=False):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Can
    draw.polygon([(12,10),(36,10),(40,40),(8,40)], fill=(180,180,180), outline=BLACK)
    # Lid
    draw.ellipse([8,6,40,18], fill=(160,160,160), outline=BLACK)
    # Arrows / lines for recycle
    if full:
        # Trash items
        draw.rectangle([16,20,22,32], fill=MAROON)
        draw.rectangle([24,22,30,34], fill=OLIVE)
        draw.ellipse([17,24,28,30], fill=TEAL)
    else:
        # Three arrows circle
        draw.arc([14,16,34,36], 200, 80, fill=(0,160,0), width=2)
        # Arrow heads
        draw.polygon([(32,20),(36,24),(28,24)], fill=(0,160,0))
        draw.polygon([(16,32),(20,28),(20,36)], fill=(0,160,0))
        draw.polygon([(22,16),(18,20),(26,20)], fill=(0,160,0))
    return save(img, f"icon_recycle_{'full' if full else 'empty'}.png")

def create_notepad_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Notepad body blue
    draw.rectangle([8,4,40,44], fill=(70,130,180), outline=BLACK, width=1)
    # Lines
    for y in [12,18,24,30,36]:
        draw.line([(12,y),(36,y)], fill=WHITE, width=1)
    # Spiral rings
    for y in [8,14,20,26,32,38]:
        draw.arc([6,y-2,12,y+4], 270, 90, fill=DARK_GRAY, width=1)
    # Red margin line
    draw.line([(14,6),(14,42)], fill=RED, width=1)
    return save(img, "icon_notepad.png")

def create_paint_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Palette
    draw.ellipse([4,4,44,36], fill=WHITE, outline=BLACK)
    # Color dabs
    colors = [RED, YELLOW, GREEN, BLUE, MAGENTA, BLACK, (255,128,0), (128,0,255)]
    pos = [(10,10),(20,8),(30,10),(12,18),(24,20),(33,17),(15,26),(28,25)]
    for c, (x,y) in zip(colors, pos):
        draw.ellipse([x,y,x+6,y+6], fill=c, outline=DARK_GRAY)
    # Brush
    draw.line([(38,30),(44,44)], fill=BROWN, width=3)
    draw.polygon([(44,44),(40,38),(48,40)], fill=(255,200,150))
    return save(img, "icon_paint.png")

def create_calc_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Body
    draw.rectangle([6,4,42,44], fill=DARK_GRAY, outline=BLACK)
    # Screen
    draw.rectangle([10,8,38,18], fill=(180,255,180), outline=BLACK)  # green lcd
    draw.text((12,9), "123", fill=BLACK)
    # Buttons grid
    btns = [
        (10,22),(18,22),(26,22),(34,22),
        (10,30),(18,30),(26,30),(34,30),
        (10,38),(18,38),(26,38),(34,38),
    ]
    for i, (x,y) in enumerate(btns):
        col = GRAY if i not in (3,7,11) else (255,160,160)
        draw.rectangle([x,y,x+6,y+6], fill=col, outline=BLACK)
    return save(img, "icon_calc.png")

def create_minesweeper_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Grid background
    draw.rectangle([6,6,42,42], fill=GRAY, outline=DARK_GRAY)
    for i in range(4):
        draw.line([(6,6+i*12),(42,6+i*12)], fill=DARK_GRAY)
        draw.line([(6+i*12,6),(6+i*12,42)], fill=DARK_GRAY)
    # Mine in center
    draw.ellipse([20,20,28,28], fill=BLACK)
    draw.line([(24,16),(24,32)], fill=BLACK, width=1)
    draw.line([(16,24),(32,24)], fill=BLACK, width=1)
    # Flag on top left cell
    draw.rectangle([9,8,11,15], fill=DARK_GRAY)
    draw.polygon([(11,8),(20,11),(11,14)], fill=RED)
    return save(img, "icon_minesweeper.png")

def create_solitaire_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Cards stacked
    # Back of card
    draw.rectangle([8,8,30,40], fill=NAVY, outline=WHITE)
    draw.rectangle([10,10,28,38], fill=(70,70,160))
    # Red heart visible
    draw.polygon([(34,18),(42,10),(42,26)], fill=RED)
    draw.polygon([(34,22),(42,30),(42,38)], fill=RED)  # rough heart
    # Another card
    draw.rectangle([14,12,36,44], fill=WHITE, outline=BLACK)
    draw.text((18,14), "A", fill=RED)
    draw.polygon([(22,28),(18,34),(26,34)], fill=RED)
    return save(img, "icon_solitaire.png")

def create_ie_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Blue e circle
    draw.ellipse([4,4,44,44], fill=(0,80,180), outline=BLACK)
    draw.ellipse([8,8,40,40], fill=(30,120,220))
    # White e
    draw.arc([14,10,36,38], 200, 140, fill=WHITE, width=3)
    draw.line([(18,24),(32,24)], fill=WHITE, width=3)
    # Orbit line
    draw.arc([2,2,46,46], 30, 150, fill=(255,220,0), width=2)
    return save(img, "icon_ie.png")

def create_dos_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Black dos box
    draw.rectangle([6,6,42,42], fill=BLACK, outline=GRAY)
    # C:> prompt
    draw.text((10,12), "C:\\>", fill=GREEN)
    draw.rectangle([10,24,38,26], fill=GREEN)  # cursor
    return save(img, "icon_dos.png")

def create_folder_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Classic yellow folder
    draw.polygon([(6,14),(18,14),(22,10),(42,10),(42,38),(6,38)], fill=(255,200,60), outline=BLACK)
    draw.rectangle([6,14,42,38], fill=(255,220,100), outline=BLACK)
    return save(img, "icon_folder.png")

def create_control_panel_icon(size=48):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    # Gears or control panel classic icon (small window with sliders)
    draw.rectangle([6,6,42,42], fill=GRAY, outline=BLACK)
    draw.rectangle([10,10,38,18], fill=WHITE, outline=DARK_GRAY)
    draw.rectangle([10,22,38,30], fill=WHITE, outline=DARK_GRAY)
    draw.rectangle([10,34,26,42], fill=NAVY)
    # Knobs
    draw.ellipse([30,22,38,30], fill=DARK_GRAY, outline=BLACK)
    draw.ellipse([30,34,38,42], fill=TEAL, outline=BLACK)
    return save(img, "icon_control.png")

def create_startup_logo():
    # Fake Windows 98 boot logo screen 640x400-ish
    w, h = 640, 400
    img = Image.new("RGB", (w, h), (0, 0, 128))  # dark blue
    draw = ImageDraw.Draw(img)
    
    # Clouds effect top
    for _ in range(8):
        import random
        random.seed(42)  # consistent
        break
    # Simple gradient + clouds
    for y in range(120):
        c = int(40 + y*0.3)
        draw.line([(0,y),(w,y)], fill=(c//2, c//3, 80 + y//2))
    
    # Windows logo flag (4 colored squares)
    flag_x, flag_y = 220, 120
    sq = 28
    draw.rectangle([flag_x, flag_y, flag_x+sq, flag_y+sq], fill=RED)
    draw.rectangle([flag_x+sq+4, flag_y, flag_x+2*sq+4, flag_y+sq], fill=GREEN)
    draw.rectangle([flag_x, flag_y+sq+4, flag_x+sq, flag_y+2*sq+4], fill=(0,0,180))
    draw.rectangle([flag_x+sq+4, flag_y+sq+4, flag_x+2*sq+4, flag_y+2*sq+4], fill=YELLOW)
    
    # Text
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        font_med = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    except:
        font_large = ImageFont.load_default()
        font_med = font_large
    
    draw.text((w//2 - 140, flag_y + 2*sq + 30), "Microsoft Windows 98", fill=WHITE, font=font_large)
    draw.text((w//2 - 80, flag_y + 2*sq + 65), "Second Edition", fill=(180,180,255), font=font_med)
    
    # Bottom bar
    draw.rectangle([0, h-50, w, h], fill=(192,192,192))
    draw.text((20, h-38), "Copyright Microsoft Corporation 1981-1998", fill=BLACK, font=font_med)
    
    return save(img, "boot_logo.png")

# Generate all
if __name__ == "__main__":
    print("Generating Windows 98 assets...")
    create_wallpaper()
    create_my_computer_icon()
    create_recycle_icon(full=False)
    create_recycle_icon(full=True)
    create_notepad_icon()
    create_paint_icon()
    create_calc_icon()
    create_minesweeper_icon()
    create_solitaire_icon()
    create_ie_icon()
    create_dos_icon()
    create_folder_icon()
    create_control_panel_icon()
    create_startup_logo()
    print("All assets generated successfully!")
