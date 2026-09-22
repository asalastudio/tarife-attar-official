from PIL import Image, ImageDraw, ImageFont
F = "../fonts/"
W, H = 1200, 640
BONE=(242,240,233); INK=(26,26,26); GOLD=(150,123,62); MUTED=(90,86,78); RULE=(216,213,204)
def font(path, size, wght=None):
    f = ImageFont.truetype(path, size)
    if wght is not None:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f
georgia = font("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 34)
mont_h  = font(F+"Montserrat.ttf", 66, 600)
mont_s  = font(F+"Montserrat.ttf", 30, 400)
mont_xs = font(F+"Montserrat.ttf", 17, 500)
mont_l  = font(F+"Montserrat.ttf", 15, 500)
img = Image.new("RGB", (W, H), BONE); d = ImageDraw.Draw(img); L = 84
def tracked(x, y, text, fnt, fill, tr):
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill); x += d.textlength(ch, font=fnt) + tr
    return x
def tracked_w(text, fnt, tr): return sum(d.textlength(c, font=fnt) + tr for c in text) - tr
# masthead: Georgia wordmark centred, Modern Apothecary under it, like the site header
wm = "TARIFÉ ATTÄR"; ww = tracked_w(wm, georgia, 13)
tracked((W-ww)/2, 64, wm, georgia, INK, 13)
sub = "MODERN APOTHECARY"; sw = tracked_w(sub, mont_l, 6)
tracked((W-sw)/2, 112, sub, mont_l, MUTED, 6)
d.line([(L, 160), (W-L, 160)], fill=RULE, width=2)
# headline block, left aligned
tracked(L, 208, "DISPATCH  ·  15 SEPTEMBER 2026", mont_xs, GOLD, 4)
d.text((L-2, 252), "Six waypoints,", font=mont_h, fill=INK)
d.text((L-2, 330), "now in 3 ml.", font=mont_h, fill=INK)
d.text((L, 430), "Any three for $50, through 22 September.", font=mont_s, fill=GOLD)
d.line([(L, 520), (W-L, 520)], fill=RULE, width=2)
tracked(L, 546, "BIG SUR  ·  TOBAGO  ·  SICILY  ·  SAMARKAND  ·  HUDSON  ·  MARRAKESH", mont_xs, MUTED, 3)
tracked(L, 578, "$23 EACH  ·  NO CODE  ·  APPLIED AT CHECKOUT", mont_xs, GOLD, 3)
img.save("hero-plate-3ml-light.png", optimize=True); print("saved", img.size)
