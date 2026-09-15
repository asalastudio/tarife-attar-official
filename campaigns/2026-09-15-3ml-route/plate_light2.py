from PIL import Image, ImageDraw, ImageFont
F = "../fonts/"
W, H = 1200, 500
BONE=(242,240,233); INK=(26,26,26); GOLD=(150,123,62); MUTED=(90,86,78); RULE=(216,213,204)
def font(path, size, wght=None):
    f = ImageFont.truetype(path, size)
    if wght is not None:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f
mont_h=font(F+"Montserrat.ttf",66,600); mont_s=font(F+"Montserrat.ttf",30,400); mont_xs=font(F+"Montserrat.ttf",17,500)
img=Image.new("RGB",(W,H),BONE); d=ImageDraw.Draw(img); L=84
def tracked(x,y,t,f,c,tr):
    for ch in t: d.text((x,y),ch,font=f,fill=c); x+=d.textlength(ch,font=f)+tr
tracked(L,64,"DISPATCH  ·  15 SEPTEMBER 2026",mont_xs,GOLD,4)
d.text((L-2,108),"Six waypoints,",font=mont_h,fill=INK)
d.text((L-2,186),"now in 3 ml.",font=mont_h,fill=INK)
d.text((L,286),"Any three for $50, through 22 September.",font=mont_s,fill=GOLD)
d.line([(L,376),(W-L,376)],fill=RULE,width=2)
tracked(L,402,"BIG SUR  ·  TOBAGO  ·  SICILY  ·  SAMARKAND  ·  HUDSON  ·  MARRAKESH",mont_xs,MUTED,3)
tracked(L,434,"$23 EACH  ·  NO CODE  ·  APPLIED AT CHECKOUT",mont_xs,GOLD,3)
img.save("hero-plate-3ml-light-v2.png",optimize=True); print("saved",img.size)
