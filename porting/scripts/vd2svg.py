"""Convert Android VectorDrawable XML files to SVG."""
import sys, os, re
import xml.etree.ElementTree as ET
A = "{http://schemas.android.com/apk/res/android}"
res_dir, names_file, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out_dir, exist_ok=True)
colors = {}
for c in ET.parse(os.path.join(res_dir, "values", "colors.xml")).getroot().iter("color"):
    colors[c.get("name")] = (c.text or "").strip()

def color(v):
    if v is None: return None, 1.0
    for _ in range(5):
        if v.startswith("@color/") or v.startswith("@android:color/"):
            v = colors.get(v.split("/")[-1], "#000000")
        else: break
    if not v.startswith("#"): return None, 1.0
    h = v[1:]
    if len(h) == 3: h = "".join(ch*2 for ch in h)
    if len(h) == 4: h = "".join(ch*2 for ch in h)
    if len(h) == 8: return "#" + h[2:], int(h[:2], 16)/255
    return "#" + h, 1.0

def num(v, d=0.0):
    if v is None: return d
    return float(re.sub(r"(dp|dip|px|sp)$", "", v))

def esc(s): return s.replace("&","&amp;").replace('"',"&quot;").replace("<","&lt;")

def conv(el, out, ind):
    tag = el.tag
    if tag == "path":
        d = el.get(A+"pathData")
        if not d: return
        attrs = [f'd="{esc(d)}"']
        fc, fa = color(el.get(A+"fillColor"))
        fa *= num(el.get(A+"fillAlpha"), 1.0)
        attrs.append(f'fill="{fc}"' if fc else 'fill="none"')
        if fc and fa < 1: attrs.append(f'fill-opacity="{fa:.3f}"')
        if el.get(A+"fillType") == "evenOdd": attrs.append('fill-rule="evenodd"')
        sc, sa = color(el.get(A+"strokeColor"))
        if sc:
            attrs.append(f'stroke="{sc}" stroke-width="{num(el.get(A+"strokeWidth"),0)}"')
            sa *= num(el.get(A+"strokeAlpha"), 1.0)
            if sa < 1: attrs.append(f'stroke-opacity="{sa:.3f}"')
            cap, join = el.get(A+"strokeLineCap"), el.get(A+"strokeLineJoin")
            if cap: attrs.append(f'stroke-linecap="{cap}"')
            if join: attrs.append(f'stroke-linejoin="{join}"')
            ml = el.get(A+"strokeMiterLimit")
            if ml: attrs.append(f'stroke-miterlimit="{ml}"')
        out.append(ind + "<path " + " ".join(attrs) + "/>")
    elif tag == "group":
        tx, ty = num(el.get(A+"translateX")), num(el.get(A+"translateY"))
        px, py = num(el.get(A+"pivotX")), num(el.get(A+"pivotY"))
        sx, sy = num(el.get(A+"scaleX"),1), num(el.get(A+"scaleY"),1)
        rot = num(el.get(A+"rotation"))
        t = []
        # Android: translate(tx+px, ty+py) rotate scale translate(-px,-py)
        if tx or ty or px or py: t.append(f"translate({tx+px},{ty+py})")
        if rot: t.append(f"rotate({rot})")
        if sx != 1 or sy != 1: t.append(f"scale({sx},{sy})")
        if px or py: t.append(f"translate({-px},{-py})")
        out.append(ind + (f'<g transform="{" ".join(t)}">' if t else "<g>"))
        clip_id = None
        kids = list(el)
        for i, k in enumerate(kids):
            if k.tag == "clip-path":
                conv_counter[0] += 1
                cid = f"c{conv_counter[0]}"
                out.append(ind + f' <clipPath id="{cid}"><path d="{esc(k.get(A+"pathData",""))}"/></clipPath>')
                out.append(ind + f' <g clip-path="url(#{cid})">')
                clip_id = cid
            else:
                conv(k, out, ind + "  ")
        if clip_id: out.append(ind + " </g>")
        out.append(ind + "</g>")
    elif tag == "clip-path":
        pass

conv_counter = [0]
ok = skipped = 0
missing = []
for name in open(names_file).read().split():
    src = None
    for d in ["drawable", "drawable-anydpi-v21", "drawable-v21", "drawable-v23"]:
        p = os.path.join(res_dir, d, name + ".xml")
        if os.path.exists(p): src = p; break
    if not src:
        for d in ["drawable-xxxhdpi","drawable-xxhdpi","drawable-xhdpi","drawable-hdpi","drawable-mdpi","drawable"]:
            p = os.path.join(res_dir, d, name + ".png")
            if os.path.exists(p):
                import shutil; shutil.copy(p, os.path.join(out_dir, name + ".png")); ok += 1; break
        else: missing.append(name)
        continue
    root = ET.parse(src).getroot()
    if root.tag != "vector":
        skipped += 1; continue
    vw, vh = num(root.get(A+"viewportWidth")), num(root.get(A+"viewportHeight"))
    w, h = num(root.get(A+"width")), num(root.get(A+"height"))
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw:g} {vh:g}" width="{w:g}" height="{h:g}">']
    alpha = num(root.get(A+"alpha"), 1.0)
    if alpha < 1: out.append(f'<g opacity="{alpha}">')
    for k in root: conv(k, out, " ")
    if alpha < 1: out.append("</g>")
    out.append("</svg>")
    open(os.path.join(out_dir, name + ".svg"), "w").write("\n".join(out))
    ok += 1
print(f"converted={ok} non-vector-skipped={skipped} missing={len(missing)}: {missing[:20]}")
