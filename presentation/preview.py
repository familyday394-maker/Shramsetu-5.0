#!/usr/bin/env python3
"""
preview.py — a lightweight PPTX rasteriser used only to eyeball layout.

It is not a PowerPoint clone: bevels, shadows and exact font metrics are
approximate. It exists to catch overlapping shapes, clipped text and misplaced
boxes before the deck is handed over.
"""
from __future__ import annotations

import io
import os
import sys

from PIL import Image, ImageDraw, ImageFont
from pptx import Presentation
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu

SCALE = 160  # px per inch  -> 2133 x 1200
FONTS = {
    "Georgia": "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "Georgia-bold": "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "Segoe UI": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "Segoe UI-bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "Consolas": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "Consolas-bold": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
}
CACHE: dict = {}


def font_for(name, size, bold, italic=False):
    key = (name, bold, int(size * 4), italic)
    if key in CACHE:
        return CACHE[key]
    family = name if name in ("Georgia", "Consolas") else "Segoe UI"
    path = FONTS[f"{family}-bold"] if bold else FONTS[family]
    f = ImageFont.truetype(path, max(6, int(size * SCALE / 72)))
    CACHE[key] = f
    return f


def px(emu_val):
    return emu_val / 914400 * SCALE


def color_of(el, default=(0, 0, 0)):
    if el is None:
        return default if len(default) == 4 else tuple(default) + (255,)
    clr = el.find(qn("a:srgbClr"))
    if clr is not None:
        v = clr.get("val")
        a = clr.find(qn("a:alpha"))
        alpha = int(int(a.get("val")) / 100000 * 255) if a is not None else 255
        return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), alpha)
    return default


def shape_fill(kind, spPr):
    """Return ('solid', rgba) | ('grad', [(pos,rgba)], angle) | None"""
    solid = spPr.find(qn("a:solidFill"))
    if solid is not None:
        return ("solid", color_of(solid))
    grad = spPr.find(qn("a:gradFill"))
    if grad is not None:
        stops = []
        for gs in grad.find(qn("a:gsLst")):
            pos = int(gs.get("pos")) / 100000
            stops.append((pos, color_of(gs)))
        lin = grad.find(qn("a:lin"))
        ang = int(lin.get("ang")) / 60000 if lin is not None else 0
        return ("grad", stops, ang)
    return None


def draw_fill(dr, box, spec):
    x0, y0, x1, y1 = box
    if not spec or x1 <= x0 or y1 <= y0:
        return
    if spec[0] == "solid":
        dr.rectangle(box, fill=spec[1])
        return
    _, stops, ang = spec
    import math
    a = math.radians(ang)
    # sample gradient along the axis
    steps = 64
    w, h = x1 - x0, y1 - y0
    dx, dy = math.cos(a), math.sin(a)
    length = abs(w * dx) + abs(h * dy)
    for s in range(steps):
        t0 = s / steps
        t1 = (s + 1) / steps
        col = sample(stops, (t0 + t1) / 2)
        if abs(dx) >= abs(dy):
            dr.rectangle([int(x0 + w * t0), int(y0), int(x0 + w * t1) + 1, int(y1)], fill=col)
        else:
            dr.rectangle([int(x0), int(y0 + h * t0), int(x1), int(y0 + h * t1) + 1], fill=col)


def sample(stops, t):
    lo = stops[0]
    hi = stops[-1]
    for i in range(len(stops) - 1):
        if stops[i][0] <= t <= stops[i + 1][0]:
            lo, hi = stops[i], stops[i + 1]
            break
    span = (hi[0] - lo[0]) or 1
    f = (t - lo[0]) / span
    c = [lo[1][k] + (hi[1][k] - lo[1][k]) * f for k in range(4)]
    return tuple(int(v) for v in c)


def render_text(dr, shape, box):
    tf = shape.text_frame
    x0, y0, x1, y1 = box
    w = x1 - x0
    paras = []
    for p in tf.paragraphs:
        runs = []
        for r in p.runs:
            sz = r.font.size.pt if r.font.size else 12
            col = (0, 0, 0, 255)
            try:
                if r.font.color and r.font.color.rgb:
                    col = tuple(bytes.fromhex(str(r.font.color.rgb))) + (255,)
            except Exception:
                pass
            runs.append({
                "t": r.text,
                "s": sz,
                "c": col,
                "b": bool(r.font.bold),
                "i": bool(r.font.italic),
                "f": r.font.name or "Segoe UI",
            })
        if runs:
            paras.append((p, runs))
    if not paras:
        return

    # layout: rows of (para, [(run, text, font, width)])
    lines = []   # (runs_on_line, line_height, align, max_size)
    for p, runs in paras:
        align = p.alignment
        ls = p.line_spacing or 1.0
        cur = []
        cur_w = 0.0
        max_s = max(r["s"] for r in runs)
        for r in runs:
            f = font_for(r["f"], r["s"], r["b"], r["i"])
            words = r["t"].split(" ")
            for wi, word in enumerate(words):
                piece = word + (" " if wi < len(words) - 1 else "")
                if not piece:
                    continue
                pw = f.getlength(piece)
                if cur_w + pw > w and cur:
                    lines.append((cur, max_s * 1.22 * ls * SCALE / 72, align, max_s))
                    cur, cur_w = [], 0.0
                cur.append((piece, f, r["s"], r["c"]))
                cur_w += pw
        lines.append((cur, max_s * 1.22 * ls * SCALE / 72, align, max_s))

    total_h = sum(l[1] for l in lines)
    anchor = tf.vertical_anchor
    if anchor == MSO_ANCHOR.MIDDLE:
        y = y0 + (y1 - y0 - total_h) / 2
    elif anchor == MSO_ANCHOR.BOTTOM:
        y = y1 - total_h
    else:
        y = y0

    for seg, lh, align, max_s in lines:
        lw = sum(f.getlength(t) for t, f, s, c in seg)
        if align == PP_ALIGN.CENTER:
            x = x0 + (w - lw) / 2
        elif align == PP_ALIGN.RIGHT:
            x = x1 - lw
        else:
            x = x0
        for t, f, s, c in seg:
            dr.text((x, y + (lh - s * 1.22 * SCALE / 72) / 2), t, font=f, fill=c)
            x += f.getlength(t)
        y += lh


def render_shape(dr, shape, ox=0, oy=0, sx=1, sy=1):
    el = shape._element
    if el.tag == qn("p:grpSp"):
        xfrm = el.grpSpPr.find(qn("a:xfrm"))
        off = xfrm.find(qn("a:off"))
        ext = xfrm.find(qn("a:ext"))
        choff = xfrm.find(qn("a:chOff"))
        chext = xfrm.find(qn("a:chExt"))
        gx, gy = px(int(off.get("x"))), px(int(off.get("y")))
        gw, gh = px(int(ext.get("cx"))), px(int(ext.get("cy")))
        cx, cy = px(int(choff.get("x"))), px(int(choff.get("y")))
        cw_, ch_ = px(int(chext.get("cx"))) or 1, px(int(chext.get("cy"))) or 1
        for child in shape.shapes:
            render_shape(dr, child, gx - cx * gw / cw_, gy - cy * gh / ch_,
                         max(gw / cw_, 0.01), max(gh / ch_, 0.01))
        return
    if el.tag == qn("p:pic"):
        try:
            img = Image.open(io.BytesIO(shape.image.blob)).convert("RGB")
            x0, y0 = px(shape.left), px(shape.top)
            x1, y1 = x0 + px(shape.width), y0 + px(shape.height)
            bw, bh = int(x1 - x0), int(y1 - y0)
            if bw < 2 or bh < 2:
                return
            iw, ih = img.size
            f = max(bw / iw, bh / ih)
            img = img.resize((max(1, int(iw * f)), max(1, int(ih * f))), Image.LANCZOS)
            left = int((img.size[0] - bw) / 2)
            top = int((img.size[1] - bh) / 2)
            img = img.crop((left, top, left + bw, top + bh))
            base = dr._image
            base.paste(img, (int(x0), int(y0)))
        except Exception as exc:
            print("pic fail", exc)
        return

    if not hasattr(shape, "left") or shape.left is None:
        return
    x0 = int(px(shape.left) * sx + ox)
    y0 = int(px(shape.top) * sy + oy)
    x1 = int(x0 + px(shape.width) * sx)
    y1 = int(y0 + px(shape.height) * sy)
    box = [x0, y0, x1, y1]

    spPr = el.spPr
    spec = shape_fill(el.tag, spPr)
    if spec:
        draw_fill(dr, box, spec)

    geom = spPr.find(qn("a:prstGeom"))
    preset = geom.get("prst") if geom is not None else "rect"
    ln = spPr.find(qn("a:ln"))
    line_col = None
    if ln is not None and ln.find(qn("a:noFill")) is None:
        solid = ln.find(qn("a:solidFill"))
        if solid is not None:
            line_col = color_of(solid)
            wpt = int(ln.get("w", 12700)) / 12700 * SCALE / 72
        else:
            wpt = 1
    else:
        wpt = 0

    if preset == "ellipse":
        dr.ellipse(box, outline=line_col, width=max(1, int(wpt)))
    elif preset == "roundRect":
        dr.rounded_rectangle(box, radius=min(box[2] - box[0], box[3] - box[1]) * 0.18,
                             outline=line_col, width=max(1, int(wpt)))
    elif preset in ("rect", None):
        dr.rectangle(box, outline=line_col, width=max(1, int(wpt))) if line_col else None
    else:
        if line_col:
            dr.rectangle(box, outline=line_col, width=max(1, int(wpt)))

    if shape.has_text_frame and shape.text_frame.text.strip():
        render_text(dr, shape, box)


def render_slide(prs, slide, path):
    wpx = int(prs.slide_width / 914400 * SCALE)
    hpx = int(prs.slide_height / 914400 * SCALE)
    img = Image.new("RGB", (wpx, hpx), (255, 255, 255))
    dr = ImageDraw.Draw(img, "RGBA")
    # slide background
    try:
        bgfill = slide.background.fill
        if bgfill.type is not None:
            img.paste(Image.new("RGB", (wpx, hpx), tuple(bgfill.fore_color.rgb)),
                      (0, 0))
    except Exception:
        pass
    dr = ImageDraw.Draw(img, "RGBA")
    for shape in slide.shapes:
        try:
            render_shape(dr, shape)
        except Exception as exc:
            print(f"  shape fail ({shape.shape_type}, {shape.name}): {exc}")
    img.save(path)


def main():
    src = sys.argv[1]
    outdir = sys.argv[2]
    os.makedirs(outdir, exist_ok=True)
    prs = Presentation(src)
    for i, slide in enumerate(prs.slides, 1):
        p = os.path.join(outdir, f"slide-{i:02d}.png")
        render_slide(prs, slide, p)
        print("rendered", p)


if __name__ == "__main__":
    main()
