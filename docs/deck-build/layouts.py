"""Reusable chrome + components for the Shram Setu deck."""
from __future__ import annotations

from pptx.util import Inches

import deckkit as K
from deckkit import (BRASS, BRASS_DK, BRASS_LT, CLAY, EMERALD, EMERALD_DK, FOREST,
                     FOREST_MID, INK, INK2, INK3, MINT, PAPER, PAPER_DEEP,
                     PAPER_LINE, WHITE, P, Para, Run, label, line_h, line_v,
                     textbox)


# --------------------------------------------------------------------------
# text shorthands
# --------------------------------------------------------------------------

def eyebrow(text, color=BRASS_DK, size=9.0, spc=280):
    return P(text.upper(), font=K.BODY, size=size, color=color, bold=True, spc=spc)


def display(text, size=30.0, color=INK, bold=True, font=K.DISPLAY, line=0.98):
    return P(text, font=font, size=size, color=color, bold=bold, line=line)


def body(text, size=11.5, color=INK2, line=1.28, **kw):
    return P(text, font=K.BODY, size=size, color=color, line=line, **kw)


def mono(text, size=10.0, color=INK, bold=False):
    return P(text, font=K.MONO, size=size, color=color, bold=bold)


# --------------------------------------------------------------------------
# identity elements (persistent, "!!"-named so Morph always matches them)
# --------------------------------------------------------------------------

def wordmark(shapes, x, y, s=1.0, ink=WHITE, mark=BRASS):
    """Brass pass-chip glyph + wordmark. `s` scales the whole lockup."""
    w, h = 2.15 * s, 0.30 * s
    square = K.shape(shapes, "round", "wm/mark", x, y, 0.30 * s, 0.30 * s,
                     fill=mark, radius=0.07 * s, log=True)
    # three strokes = the "bridge" of Shram Setu
    for i, wid in enumerate((0.15, 0.15, 0.15)):
        K.shape(shapes, "rect", f"wm/bar{i}", x + 0.075 * s, y + (0.085 + i * 0.05) * s,
                wid * s, 0.022 * s, fill=FOREST, log=True)
    textbox(shapes, "wm/text", x + 0.40 * s, y - 0.015 * s, w, h,
            [Para(runs=[Run("SHRAM SETU ", K.BODY, 9.5 * s, ink, True, spc=240),
                        Run("2.0", K.BODY, 9.5 * s, mark, True, spc=240)])],
            anchor="m", log=True)


def card_slip(shapes, x, y, w, h, lat, lon, rev=0.0):
    """The persistent 3-D 'wage slip'. It travels, scales and tilts through the
    deck; because it is one named group, Morph interpolates the whole lockup
    (including the 3-D camera) as a single object."""
    grp = shapes.add_group_shape()
    grp.name = "!!Card"
    C = grp.shapes

    base = K.shape(C, "round", "card/base", x, y, w, h, fill=WHITE,
                   line=PAPER_LINE, lw=1.0, radius=0.09, shadow=True, log=True)
    head = K.shape(C, "round", "card/head", x + 0.02, y + 0.02, w - 0.04, 0.26,
                   fill=FOREST_MID, radius=0.07, log=True)
    head.adjustments[0] = 0.06
    textbox(C, "card/hl", x + 0.13, y + 0.045, w - 0.26, 0.20,
            [P("DEMO RECORD  ·  4 DAYS", font=K.BODY, size=6.2, color=BRASS_LT,
               bold=True, spc=160)], anchor="m", log=True)
    textbox(C, "card/amt", x + 0.13, y + 0.34, w - 0.26, 0.42,
            [P("₹2,600", font=K.DISPLAY, size=19, color=INK, bold=True)], log=True)
    textbox(C, "card/sub", x + 0.13, y + 0.76, w - 0.26, 0.18,
            [P("4 days × ₹650 agreed rate", font=K.BODY, size=6.6, color=INK3)], log=True)
    K.line_h(C, "card/rule", x + 0.13, y + 0.98, w - 0.26, PAPER_LINE, 1.0)
    textbox(C, "card/paid", x + 0.13, y + 1.04, (w - 0.26) / 2, 0.38,
            [P("PAID", font=K.BODY, size=5.8, color=INK3, bold=True, spc=140),
             P("₹1,300", font=K.BODY, size=9.5, color=EMERALD_DK, bold=True)], log=True)
    textbox(C, "card/bal", x + w / 2 + 0.02, y + 1.04, (w - 0.26) / 2, 0.38,
            [P("BALANCE", font=K.BODY, size=5.8, color=INK3, bold=True, spc=140),
             P("₹1,300", font=K.BODY, size=9.5, color=BRASS_DK, bold=True)], log=True)

    K.apply_3d(grp, lat=lat, lon=lon, rev=rev, bevel=(0.018, 0.018),
               material="matte")
    return grp


def photo_chip(shapes, name, path, x, y, w, h, crop, radius=0.10, border=BRASS_DK):
    K.rounded_picture(shapes, name, path, x, y, w, h, crop=crop, radius=radius,
                      border=border, lw=1.0, shadow=True)


def rail(shapes, frac, dark=False):
    base = K.shape(shapes, "rect", "!!Rail", 0, K.RAIL_Y, K.SW, 0.045,
                   fill=WHITE if dark else PAPER_LINE, log=True)
    if dark:
        spPr = base._element.spPr
        for sf in spPr.findall(K.qn("a:solidFill")):
            for c in sf:
                K.etree.SubElement(c, K.qn("a:alpha")).set("val", "14000")
    fill = K.shape(shapes, "rect", "!!RailFill", 0, K.RAIL_Y, max(0.3, K.SW * frac), 0.045,
                   fill=EMERALD, log=True)
    K.glow(fill, radius=0.12, color=EMERALD, alpha=22)
    dot = K.shape(shapes, "oval", "!!Dot", max(0.3, K.SW * frac) - 0.055,
                  K.RAIL_Y - 0.048, 0.14, 0.14, fill=BRASS, log=True)
    K.soft_shadow(dot, blur=0.10, dist=0.0, alpha=30)


def page_no(shapes, n, total, dark=False, x=11.95):
    textbox(shapes, "!!PageNo", x, K.RAIL_Y - 0.34, 0.80, 0.20,
            [Para(runs=[Run(f"{n:02d}", K.BODY, 8.5, BRASS if dark else BRASS_DK, True),
                        Run(f" / {total:02d}", K.BODY, 8.5,
                            MINT if dark else INK3, False)])],
            anchor="b", log=True)


# --------------------------------------------------------------------------
# slide chrome
# --------------------------------------------------------------------------

HERO_CROP = (0.335, 0.0, 0.235, 0.0)     # keeps face + QR pass in frame
CHIP_CROP = (0.30, 0.02, 0.04, 0.02)


def content_chrome(slide, sec_no, sec_name, n, total, frac, angles, hero_path,
                   title=None, lede=None):
    """Left dark rail + persistent identity + title block. Returns body top (in)."""
    shapes = slide.shapes
    panel = K.shape(shapes, "rect", "!!HeroPanel", 0, 0, K.SIDEBAR_W, K.SH,
                    fill=FOREST, log=True)
    K.gradient(panel, [(0, FOREST, None), (100, "0A2018", None)], angle=45)

    # left edge brass hairline
    K.line_v(shapes, "!!Edge", K.SIDEBAR_W - 0.02, 0, K.SH, BRASS_DK)

    wordmark(shapes, 0.46, 0.44, s=1.0)

    textbox(shapes, "!!SecNo", 0.42, 1.08, 1.6, 1.16,
            [P(f"{sec_no:02d}", font=K.DISPLAY, size=66, color=BRASS, bold=True,
               alpha=26)], log=True)
    textbox(shapes, "!!SecName", 0.46, 2.28, 2.55, 0.85,
            [eyebrow(f"Section {sec_no:02d}", BRASS, 7.5, 240),
             display(sec_name, 15, WHITE, bold=False, line=1.05)], log=True)

    card_slip(shapes, 0.44, 3.42, 2.55, 1.52, *angles)
    photo_chip(shapes, "!!Photo", hero_path, 0.44, 5.32, 2.55, 1.12,
               CHIP_CROP, radius=0.09)
    textbox(shapes, "!!SideFoot", 0.46, 6.60, 2.7, 0.52,
            [P("Every shift recorded.", font=K.DISPLAY, size=8.2, color=MINT, italic=True),
             P("Every wage explained.", font=K.DISPLAY, size=8.2, color=MINT, italic=True,
               alpha=78),
             P("Every change traceable.", font=K.DISPLAY, size=8.2, color=MINT, italic=True,
               alpha=56)],
            log=True)

    # title block
    if title:
        K.shape(shapes, "rect", "!!Accent", K.CONTENT_X, 0.80, 0.52, 0.045,
                fill=BRASS, log=True)
        tsize = K.fit_size(title, K.CONTENT_W - 0.12, 29.5, 19.5)
        textbox(shapes, "!!Title", K.CONTENT_X + 0.00, 0.92, K.CONTENT_W, 0.98,
                [display(title, tsize, INK)], log=True)
        if lede:
            textbox(shapes, "!!Lede", K.CONTENT_X, 1.84, K.CONTENT_W - 0.15, 0.62,
                    [body(lede, 11.8, INK2, 1.24)], log=True)
            return 2.62
        return 2.30
    return 2.30


def dark_chrome(slide, sec_no, sec_name, n, total, frac, angles, hero_path,
                photo=True):
    shapes = slide.shapes
    panel = K.shape(shapes, "rect", "!!HeroPanel", 0, 0, K.SW, K.SH, fill=FOREST,
                    log=True)
    K.gradient(panel, [(0, FOREST, None), (55, "0F2F24", None), (100, "081A13", None)],
               angle=45)
    if photo:
        K.rounded_picture(shapes, "!!Photo", hero_path, 7.85, -0.35, 6.0, 8.2,
                          HERO_CROP, radius=0.0, shadow=False)
        veil = K.shape(shapes, "rect", "veil", 7.85, 0, 6.0, K.SH, fill=FOREST, log=True)
        K.gradient(veil, [(0, FOREST, 92), (55, FOREST, 35), (100, "081A13", 72)], angle=0)
    K.shape(shapes, "rect", "!!Accent", 0, 0, K.SW, 0.10, fill=BRASS, log=True)
    wordmark(shapes, 0.85, 0.62, s=1.35)
    textbox(shapes, "!!SecNo", 0.80, 0.95, 1.6, 0.4,
            [eyebrow(f"Section {sec_no:02d}  ·  {sec_name}", BRASS, 8.0, 240)],
            anchor="t", log=True)
    card_slip(shapes, 5.05, 5.25, 2.35, 1.42, *angles)
    textbox(shapes, "!!SecName", 0.85, 0, 0.1, 0.1, [P("")], log=True)


def plain_chrome(slide, n, total, frac, angles, hero_path, dark=False):
    """Chrome for title/closing where the panel is full-bleed."""
    pass
