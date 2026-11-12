import os
import io
import base64
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

os.makedirs('public/brand', exist_ok=True)

# 1. Load user's master logo
master_path = 'public/brand/scaleflow-logo-original.jpg'
orig = Image.open(master_path).convert('RGB')
arr = np.array(orig, dtype=float)

# Background color in master image is warm ivory [254, 253, 249]
bg = np.array([254.0, 253.0, 249.0])
dist = np.sqrt(np.sum((arr - bg) ** 2, axis=2))

# Smooth alpha calculation with zero halo
d_low = 4.0
d_high = 30.0
alpha = np.clip((dist - d_low) / (d_high - d_low), 0.0, 1.0)

# De-fringe: unmix background color from foreground pixels
out_rgb = np.zeros_like(arr)
mask = alpha > 0.01
for c in range(3):
    out_rgb[..., c] = np.where(
        mask,
        np.clip((arr[..., c] - (1.0 - alpha) * bg[c]) / np.maximum(alpha, 0.05), 0, 255),
        arr[..., c]
    )

out_rgba = np.dstack([out_rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)])
im_clean = Image.fromarray(out_rgba, 'RGBA')

def crop_tight(im, bbox, pad=4):
    cropped = im.crop(bbox)
    c_arr = np.array(cropped)
    opaque = np.argwhere(c_arr[:, :, 3] > 10)
    if len(opaque) == 0:
        return cropped
    ymin, xmin = opaque.min(axis=0)[:2]
    ymax, xmax = opaque.max(axis=0)[:2]
    return cropped.crop((
        max(0, xmin - pad),
        max(0, ymin - pad),
        min(cropped.width, xmax + pad),
        min(cropped.height, ymax + pad)
    ))

# Isolate elements
mark_raw = crop_tight(im_clean, (160, 185, 875, 605), pad=6)
word_raw = crop_tight(im_clean, (85, 625, 940, 775), pad=6)
tag_raw = crop_tight(im_clean, (90, 790, 930, 830), pad=4)

# Function to make dark-mode version with subtle luxury edge highlight on black pixels
def make_dark_variant(im_rgba):
    arr = np.array(im_rgba)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    dark_mask = (a > 40) & (lum < 95)
    
    dark_img = Image.fromarray((dark_mask * 255).astype(np.uint8))
    halo = dark_img.filter(ImageFilter.MaxFilter(5))
    halo_arr = np.array(halo, dtype=float) / 255.0
    
    rim_color = np.array([245, 232, 206, 230], dtype=float)
    canvas = np.zeros_like(arr, dtype=float)
    rim_alpha = np.clip(halo_arr * 0.9, 0, 1)
    for c in range(3):
        canvas[:, :, c] = rim_color[c]
    canvas[:, :, 3] = rim_alpha * 255.0
    
    im_halo = Image.fromarray(canvas.astype(np.uint8), 'RGBA')
    return Image.alpha_composite(im_halo, im_rgba)

# 2. Mark (Light & Dark)
mark_light = mark_raw
mark_dark = make_dark_variant(mark_raw)

mark_light.save('public/brand/scaleflow-mark-light.png', 'PNG', optimize=True)
mark_dark.save('public/brand/scaleflow-mark-dark.png', 'PNG', optimize=True)
mark_light.save('public/brand/scaleflow-mark-light.webp', 'WEBP', quality=95)
mark_dark.save('public/brand/scaleflow-mark-dark.webp', 'WEBP', quality=95)

# 3. Wordmark (Light & Dark)
word_light = word_raw
word_dark = make_dark_variant(word_raw)
word_light.save('public/brand/scaleflow-wordmark-light.png', 'PNG', optimize=True)
word_dark.save('public/brand/scaleflow-wordmark-dark.png', 'PNG', optimize=True)

# 4. Tagline (Light & Dark)
tag_light = tag_raw
tag_dark = make_dark_variant(tag_raw)
tag_light.save('public/brand/scaleflow-tagline-light.png', 'PNG', optimize=True)
tag_dark.save('public/brand/scaleflow-tagline-dark.png', 'PNG', optimize=True)

# 5. Full Stacked Logo (Light & Dark)
# Bounding box of full logo in im_clean
full_tight_light = crop_tight(im_clean, (85, 185, 940, 830), pad=12)
full_tight_dark = make_dark_variant(full_tight_light)
full_tight_light.save('public/brand/scaleflow-logo-light.png', 'PNG', optimize=True)
full_tight_dark.save('public/brand/scaleflow-logo-dark.png', 'PNG', optimize=True)

# 6. Horizontal Full Lockup (Mark + Wordmark + Tagline)
def create_horizontal_full(mark, word, tag, h_canvas=200):
    mark_h = 160
    mark_w = int(mark.width * (mark_h / mark.height))
    m_scaled = mark.resize((mark_w, mark_h), Image.Resampling.LANCZOS)
    
    word_h = 80
    word_w = int(word.width * (word_h / word.height))
    w_scaled = word.resize((word_w, word_h), Image.Resampling.LANCZOS)
    
    tag_w = word_w
    tag_h = int(tag.height * (tag_w / tag.width))
    t_scaled = tag.resize((tag_w, tag_h), Image.Resampling.LANCZOS)
    
    gap = 36
    text_h = word_h + 12 + tag_h
    y_text = (h_canvas - text_h) // 2
    y_mark = (h_canvas - mark_h) // 2
    
    w_canvas = mark_w + gap + word_w + 30
    canvas = Image.new('RGBA', (w_canvas, h_canvas), (0, 0, 0, 0))
    canvas.paste(m_scaled, (15, y_mark), m_scaled)
    canvas.paste(w_scaled, (15 + mark_w + gap, y_text), w_scaled)
    canvas.paste(t_scaled, (15 + mark_w + gap, y_text + word_h + 12), t_scaled)
    return canvas

horiz_full_light = create_horizontal_full(mark_light, word_light, tag_light)
horiz_full_dark = create_horizontal_full(mark_dark, word_dark, tag_dark)
horiz_full_light.save('public/brand/scaleflow-horizontal-full-light.png', 'PNG', optimize=True)
horiz_full_dark.save('public/brand/scaleflow-horizontal-full-dark.png', 'PNG', optimize=True)

# 7. Horizontal Compact Lockup (Mark + Wordmark only)
def create_horizontal_compact(mark, word, h_canvas=180):
    mark_h = 140
    mark_w = int(mark.width * (mark_h / mark.height))
    m_scaled = mark.resize((mark_w, mark_h), Image.Resampling.LANCZOS)
    
    word_h = 82
    word_w = int(word.width * (word_h / word.height))
    w_scaled = word.resize((word_w, word_h), Image.Resampling.LANCZOS)
    
    gap = 32
    y_mark = (h_canvas - mark_h) // 2
    y_word = (h_canvas - word_h) // 2
    
    w_canvas = mark_w + gap + word_w + 30
    canvas = Image.new('RGBA', (w_canvas, h_canvas), (0, 0, 0, 0))
    canvas.paste(m_scaled, (15, y_mark), m_scaled)
    canvas.paste(w_scaled, (15 + mark_w + gap, y_word), w_scaled)
    return canvas

horiz_compact_light = create_horizontal_compact(mark_light, word_light)
horiz_compact_dark = create_horizontal_compact(mark_dark, word_dark)
horiz_compact_light.save('public/brand/scaleflow-horizontal-light.png', 'PNG', optimize=True)
horiz_compact_dark.save('public/brand/scaleflow-horizontal-dark.png', 'PNG', optimize=True)

# 8. Social Card (1200 x 630)
social_card = Image.new('RGBA', (1200, 630), (14, 14, 14, 255))
# Subtle gold radial glow in center
glow_center = (600, 315)
draw_layer = Image.new('RGBA', (1200, 630), (0, 0, 0, 0))
draw = ImageDraw.Draw(draw_layer)
for r_glow in range(380, 0, -8):
    alpha_glow = int(18 * (1.0 - r_glow / 380))
    draw.ellipse(
        [glow_center[0] - r_glow, glow_center[1] - r_glow, glow_center[0] + r_glow, glow_center[1] + r_glow],
        fill=(200, 165, 116, alpha_glow)
    )
social_card = Image.alpha_composite(social_card, draw_layer)

# Scale full_tight_dark to fit social card nicely
logo_h = 340
logo_w = int(full_tight_dark.width * (logo_h / full_tight_dark.height))
logo_social = full_tight_dark.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
social_card.paste(logo_social, ((1200 - logo_w) // 2, (630 - logo_h) // 2 - 20), logo_social)
social_card.convert('RGB').save('public/brand/scaleflow-social-card.png', 'PNG', optimize=True)

# 9. Favicons & App Icons (512, 180, 32, 16, and multi-size ICO)
# Centered emblem mark on clean ivory squircle/circle badge
def generate_favicon(size, is_apple=False):
    # Canvas
    bg_warm = (254, 253, 249, 255)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0) if not is_apple else bg_warm)
    draw = ImageDraw.Draw(canvas)
    
    corner_rad = int(size * 0.22)
    if not is_apple:
        draw.rounded_rectangle([0, 0, size, size], radius=corner_rad, fill=bg_warm)
    
    # Scale mark to occupy ~76% of canvas
    target_mark_w = int(size * 0.76)
    target_mark_h = int(mark_light.height * (target_mark_w / mark_light.width))
    if target_mark_h > int(size * 0.76):
        target_mark_h = int(size * 0.76)
        target_mark_w = int(mark_light.width * (target_mark_h / mark_light.height))
    
    scaled_mark = mark_light.resize((target_mark_w, target_mark_h), Image.Resampling.LANCZOS)
    x = (size - target_mark_w) // 2
    y = (size - target_mark_h) // 2
    canvas.paste(scaled_mark, (x, y), scaled_mark)
    return canvas

fav512 = generate_favicon(512)
fav512.save('public/favicon.png', 'PNG', optimize=True)

apple180 = generate_favicon(180, is_apple=True)
apple180.convert('RGB').save('public/apple-touch-icon.png', 'PNG', optimize=True)

fav32 = generate_favicon(32)
fav32.save('public/favicon-32x32.png', 'PNG', optimize=True)

fav16 = generate_favicon(16)
fav16.save('public/favicon-16x16.png', 'PNG', optimize=True)

# Multi-resolution ICO from 512x512
fav512.save(
    'public/favicon.ico',
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
)

# 10. Base64 mark for PDF quotation (compact 240px wide)
pdf_mark_w = 240
pdf_mark_h = int(mark_light.height * (pdf_mark_w / mark_light.width))
pdf_mark = mark_light.resize((pdf_mark_w, pdf_mark_h), Image.Resampling.LANCZOS)
buf = io.BytesIO()
pdf_mark.save(buf, format='PNG', optimize=True)
b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')

with open('src/lib/logo-base64.ts', 'w', encoding='utf-8') as f:
    f.write(f"// Official Scale Flow brand mark (high-DPI PNG for client-side jsPDF quotation generation)\nexport const SCALEFLOW_MARK_BASE64 = 'data:image/png;base64,{b64_str}';\n")

print("All brand assets, favicons, social card, and PDF logo base64 generated successfully!")
