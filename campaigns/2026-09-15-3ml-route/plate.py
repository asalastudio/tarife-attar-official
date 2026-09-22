from PIL import Image, ImageDraw, ImageFont
F = "../fonts/"
W, H = 1200, 640
INK = (18,18,18); GOLD = (197,166,106); BONE = (242,240,233); GREY = (179,179,179); MUTED = (138,137,129); RULE = (58,53,46)

def font(path, size, wght=None):
    f = ImageFont.truetype(F+path, size)
    if wght is not None:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f

mono_s = font("JetBrainsMono.ttf", 20, 500)
mono_xs = font("JetBrainsMono.ttf", 17, 400)
serif_big = font("EBGaramond.ttf", 78, 400)
serif_it = font("EBGaramond-Italic.ttf", 44, 400)

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)
L = 84

def spaced(text, tracking):
    return (" " * 0).join(text)  # placeholder, we draw char by char

def draw_tracked(x, y, text, fnt, fill, tracking):
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill)
        x += d.textlength(ch, font=fnt) + tracking
    return x

# top rule + eyebrow
d.line([(L, 72), (W-L, 72)], fill=RULE, width=2)
draw_tracked(L, 96, "TARIFÉ ATTÄR", mono_s, GOLD, 7)
right = "DISPATCH · 15 SEPTEMBER 2026"
rw = sum(d.textlength(c, font=mono_xs)+5 for c in right) - 5
draw_tracked(W-L-rw, 99, right, mono_xs, MUTED, 5)

# display lines
d.text((L-3, 186), "Six waypoints,", font=serif_big, fill=BONE)
d.text((L-3, 268), "now in 3 ml.", font=serif_big, fill=BONE)
d.text((L, 378), "Any three for $50, through 22 September.", font=serif_it, fill=GOLD)

# coordinates
draw_tracked(L, 458, "36.0143° N, 5.6044° W  ·  TARIFA, THE ORIGIN POINT", mono_xs, MUTED, 4)

# bottom rule + data row
d.line([(L, 528), (W-L, 528)], fill=RULE, width=2)
draw_tracked(L, 552, "BIG SUR · TOBAGO · SICILY · SAMARKAND · HUDSON · MARRAKESH", mono_xs, GREY, 4)
draw_tracked(L, 582, "$23 EACH · NO CODE · APPLIED AT CHECKOUT", mono_xs, GOLD, 4)

img.save("hero-plate-3ml.png", optimize=True)
print("saved", img.size)
