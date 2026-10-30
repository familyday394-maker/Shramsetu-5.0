"""Rasterise the SCENE log to PNGs so layout can be checked without PowerPoint."""
from __future__ import annotations

import os
import sys

from PIL import Image, ImageDraw, ImageFont

import deckkit as K

W, H = 1600, 900
PX = W / K.SW


def font_for(pt, name, bold=False, italic=False):
    fname = K._PREVIEW_FONT.get(name, "DejaVuSans.ttf")
    if bold:
        fname = fname.replace(".ttf", "-Bold.ttf")
    if italic and "Serif" in fname:
        fname = fname.replace("-Bold", "")
    path = K._FONT_DIR + fname
    if not os.path.exists(path):
        path = K._FONT_DIR + "DejaVuSans.ttf"
    return ImageFont.truetype(path, max(1, int(round(pt * PX / 72.0))))


def wrap(draw, text, font, max_w):
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def draw_text(d, item, anchor="t"):
    x, y, w, h = (item[k] * PX for k in ("x", "y", "w", "h"))
    paras = item["paras"]
    blocks = []
    total = 0
    for p in paras:
        size = max((r.size for r in p.runs), default=12)
        r0 = p.runs[0] if p.runs else K.Run("")
        f = font_for(size, r0.font, r0.bold, r0.italic)
        max_w = w - (getattr(p, "_indent", 0))
        lines = wrap(d, "".join(r.text for r in p.runs), f, max_w)
        lh = size * 1.22 * p.line * PX / 72.0
        blocks.append((p, f, lines, lh, size))
        total += len(lines) * lh + p.space_before * PX / 72.0
    if anchor == "m":
        cy = y + (h - total) / 2
    elif anchor == "b":
        cy = y + h - total
    else:
        cy = y
    for p, f, lines, lh, size in blocks:
        cy += p.space_before * PX / 72.0
        for ln in lines:
            tw = d.textlength(ln, font=f)
            tx = x if p.align in ("l", "j") else (x + (w - tw) / 2 if p.align == "c" else x + w - tw)
            col = p.runs[0].color if p.runs else K.INK
            d.text((tx, cy), ln, font=f, fill="#" + col)
            cy += lh


def render(scene, out_path, bg):
    img = Image.new("RGB", (W, H), "#" + bg)
    d = ImageDraw.Draw(img, "RGBA")
    for item in scene:
        k = item["kind"]
        if k == "group_start":
            continue
        if k == "group_end":
            continue
        if k == "shape":
            x, y, w, h = (item[q] * PX for q in ("x", "y", "w", "h"))
            fill = item.get("fill")
            outline = item.get("line")
            lw = max(1, int(round(item.get("lw", 0.75) * PX / 72.0)))
            if item["g"] == "oval":
                d.ellipse([x, y, x + w, y + h], fill="#" + fill if fill else None,
                          outline="#" + outline if outline else None, width=lw)
            elif item["g"] == "round":
                r = (item.get("radius") or 0.12) * PX
                d.rounded_rectangle([x, y, x + w, y + h], radius=r,
                                    fill="#" + fill if fill else None,
                                    outline="#" + outline if outline else None, width=lw)
            else:
                d.rectangle([x, y, x + w, y + h],
                            fill="#" + fill if fill else None,
                            outline="#" + outline if outline else None, width=lw)
        elif k == "pic":
            try:
                im = Image.open(item["path"]).convert("RGB")
                cl, ct, cr, cb = item["crop"]
                iw, ih = im.size
                box = (int(cl * iw), int(ct * ih), int(iw * (1 - cr)), int(ih * (1 - cb)))
                im = im.crop(box).resize((max(1, int(item["w"] * PX)), max(1, int(item["h"] * PX))),
                                         Image.LANCZOS)
                img.paste(im, (int(item["x"] * PX), int(item["y"] * PX)))
            except Exception as e:  # pragma: no cover
                print("pic fail", e)
        elif k == "text":
            draw_text(d, item, item.get("anchor", "t"))
    img.save(out_path)


def render_all(scenes, outdir):
    os.makedirs(outdir, exist_ok=True)
    for i, (scene, bg) in enumerate(scenes, 1):
        render(scene, os.path.join(outdir, f"s{i:02d}.png"), bg)
    print(f"rendered {len(scenes)} previews -> {outdir}")
