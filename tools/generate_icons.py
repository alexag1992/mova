#!/usr/bin/env python3
"""
Генератор иконок для PWA МОВА.
Создаёт PNG иконки разных размеров и favicon.ico.
Требует: pip install Pillow

Использование:
  pip install Pillow
  python tools/generate_icons.py
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Установите Pillow: pip install Pillow")
    exit(1)

ICONS_DIR = Path(__file__).parent.parent / "icons"
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

BG_COLOR   = "#0a0a0a"
BLUE_COLOR = "#00d4ff"
TEXT_COLOR = "#0a0a0a"


def hex_to_rgb(hex_color):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def create_icon(size):
    bg = hex_to_rgb(BG_COLOR)
    blue = hex_to_rgb(BLUE_COLOR)
    text_c = hex_to_rgb(TEXT_COLOR)

    img = Image.new('RGBA', (size, size), (*bg, 255))
    draw = ImageDraw.Draw(img)

    # Rounded rect background (approximate via ellipse mask)
    radius = size // 5
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=(*bg, 255))

    # Blue circle
    padding = size // 8
    draw.ellipse([padding, padding, size - padding, size - padding], fill=(*blue, 255))

    # Letter "М"
    font_size = size // 3
    font = None
    font_paths = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for fp in font_paths:
        try:
            font = ImageFont.truetype(fp, font_size)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    text = "М"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill=(*text_c, 255), font=font)

    return img


def main():
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    print("🎨 МОВА — Генерация иконок")
    print("=" * 40)

    for size in SIZES:
        img = create_icon(size)
        # Convert to RGB for PNG (drop alpha for compatibility)
        rgb_img = Image.new('RGB', (size, size), hex_to_rgb(BG_COLOR))
        rgb_img.paste(img, mask=img.split()[3])
        filepath = ICONS_DIR / f"icon-{size}.png"
        rgb_img.save(filepath, 'PNG')
        print(f"  ✅ Создана: {filepath.name} ({size}×{size})")

    # favicon.ico (32x32)
    favicon_img = create_icon(32)
    favicon_path = ICONS_DIR.parent / "favicon.ico"
    favicon_img.save(str(favicon_path), format='ICO', sizes=[(32, 32), (16, 16)])
    print(f"  ✅ Создан:  favicon.ico")

    print()
    print(f"📁 Иконки сохранены в: {ICONS_DIR}")
    print(f"🎉 Готово! Создано {len(SIZES)} PNG + 1 ICO")


if __name__ == "__main__":
    main()
