"""Card / table / diagram components shared by the slide builders."""
from __future__ import annotations

from pptx.util import Inches

import deckkit as K
from deckkit import (BRASS, BRASS_DK, BRASS_LT, CLAY, EMERALD, EMERALD_DK, FOREST,
                     FOREST_MID, INK, INK2, INK3, MINT, PAPER, PAPER_DEEP,
                     PAPER_LINE, WHITE, P, Para, Run)
from layouts import body, display, eyebrow, mono


def card(shapes, name, x, y, w, h, title, text, accent=EMERALD, num=None,
         tsize=12.6, bsize=10.2, fill=WHITE, tcolor=INK, bcolor=INK2,
         radius=0.10, bar=True, pad=0.22, shadow=True, tline=1.06):
    K.shape(shapes, "round", name, x, y, w, h, fill=fill, line=PAPER_LINE,
            lw=0.9, radius=radius, shadow=shadow, log=True)
    if bar:
        K.shape(shapes, "round", name + "/bar", x + 0.0, y + 0.20, 0.055, h - 0.40,
                fill=accent, radius=0.03, log=True)
    tx = pad + (0.02 if bar else 0)
    num_w = 0.60 if num else 0.0
    if num:
        K.textbox(shapes, name + "/num", x + w - num_w - 0.10, y + 0.18, num_w, 0.24,
                  [P(num, font=K.DISPLAY, size=10, color=accent, bold=True, align="r")],
                  anchor="t", log=True)
    tw = w - tx - 0.22 - num_w
    tsize = K.fit_size(title, tw, tsize, 8.8, line=tline)
    tp = display(title, tsize, tcolor, bold=True, line=tline)
    th = K.measure([tp], tw)
    K.textbox(shapes, name + "/t", x + tx, y + 0.15, tw, th + 0.06, [tp], log=True)
    by = y + 0.15 + th + 0.08
    K.textbox(shapes, name + "/b", x + tx, by, tw, max(0.2, y + h - 0.12 - by),
              [body(text, bsize, bcolor, 1.24)], log=True)


def stat(shapes, name, x, y, w, h, value, unit, label, accent=EMERALD,
         vcolor=INK, dark=False):
    K.shape(shapes, "round", name, x, y, w, h,
            fill=WHITE if not dark else FOREST_MID,
            line=PAPER_LINE if not dark else None, lw=0.9, radius=0.11,
            shadow=not dark, log=True)
    K.shape(shapes, "round", name + "/dot", x + 0.18, y + 0.19, 0.09, 0.09,
            fill=accent, radius=0.02, log=True)
    K.textbox(shapes, name + "/u", x + w - 0.72, y + 0.15, 0.56, 0.22,
              [P(unit.upper(), font=K.BODY, size=7.6, color=accent, bold=True, spc=140)],
              anchor="t", log=True)
    vs = 25.0 if len(value) <= 5 else 21.0 if len(value) <= 7 else 18.0
    K.textbox(shapes, name + "/v", x + 0.18, y + 0.36, w - 0.26, 0.52,
              [P(value, font=K.DISPLAY, size=vs, color=vcolor, bold=True)], anchor="t",
              log=True)
    K.textbox(shapes, name + "/l", x + 0.18, y + 0.96, w - 0.32, h - 1.04,
              [body(label, 8.6, INK3 if not dark else MINT, 1.2)], log=True)


def numrow(shapes, name, x, y, w, num, title, text, accent=EMERALD, h=0.86,
           tsize=12.0, bsize=9.9):
    K.shape(shapes, "round", name, x, y, w, h, fill=PAPER_DEEP, line=None,
            radius=0.09, log=True)
    K.label(shapes, name + "/n", x + 0.12, y + 0.14, 0.42, 0.42,
            [P(num, font=K.DISPLAY, size=12, color=WHITE, bold=True)],
            fill=accent, kind="round", radius=0.09, margins=(0, 0, 0, 0))
    K.textbox(shapes, name + "/t", x + 0.66, y + 0.13, w - 0.78, 0.25,
              [P(title, font=K.BODY, size=tsize, color=INK, bold=True)], log=True)
    K.textbox(shapes, name + "/b", x + 0.66, y + 0.13 + tsize / 72 * 1.35, w - 0.8,
              h - 0.30 - tsize / 72 * 1.0, [body(text, bsize, INK2, 1.2)], log=True)


def pill(shapes, name, x, y, w, h, text, fill=FOREST, color=WHITE, size=10.0,
         bold=True, spc=80, border=None, radius=None):
    K.label(shapes, name, x, y, w, h, [P(text, font=K.BODY, size=size, color=color,
                                         bold=bold, spc=spc)],
            fill=fill, line=border, kind="round", radius=radius or h / 2,
            margins=(0.08, 0.02, 0.08, 0.02))


def table(shapes, name, x, y, col_x, col_w, header, rows, row_h,
          hfill=FOREST, hcolor=WHITE, size=8.8, hsize=8.6, first_bold=True,
          zebra=(WHITE, "F7F1E2"), accent=EMERALD):
    """Header band + zebra rows, drawn from rectangles (fully editable)."""
    hh = 0.42
    K.shape(shapes, "rect", name + "/hdr", x, y, sum(col_w), hh, fill=hfill, log=True)
    for i, cell in enumerate(header):
        K.textbox(shapes, f"{name}/h{i}", col_x[i] + 0.12, y + 0.05, col_w[i] - 0.2,
                  hh - 0.08, [P(cell.upper(), font=K.BODY, size=hsize, color=hcolor,
                                bold=True, spc=110)], anchor="m", log=True)
    cy = y + hh
    for r, row in enumerate(rows):
        fill = zebra[r % 2]
        K.shape(shapes, "rect", f"{name}/r{r}", x, cy, sum(col_w), row_h[r], fill=fill,
                log=True)
        for c, cell in enumerate(row):
            first = c == 0 and first_bold
            K.textbox(shapes, f"{name}/c{r}{c}", col_x[c] + 0.12, cy + 0.04,
                      col_w[c] - 0.2, row_h[r] - 0.08,
                      [P(cell, font=K.BODY, size=size,
                         color=INK if first else INK2, bold=first, line=1.14)],
                      anchor="m", log=True)
        cy += row_h[r]
    K.shape(shapes, "rect", name + "/base", x, cy, sum(col_w), 0.05, fill=BRASS, log=True)
    return cy


def arrow_down(shapes, name, cx, y, h=0.22, color=BRASS_DK, w=0.16):
    K.shape(shapes, "rect", name + "/s", cx - 0.012, y, 0.024, h - 0.09, fill=color, log=True)
    tri = K.shape(shapes, "tri", name + "/t", cx - w / 2, y + h - 0.10, w, 0.10,
                  fill=color, log=True)
    tri.rotation = 180
    return


def arrow_right(shapes, name, x, cy, w=0.22, color=BRASS_DK, h=0.16):
    K.shape(shapes, "rect", name + "/s", x, cy - 0.012, w - 0.09, 0.024, fill=color, log=True)
    tri = K.shape(shapes, "tri", name + "/t", x + w - 0.10, cy - h / 2, 0.10, h,
                  fill=color, log=True)
    tri.rotation = 90
    return


def callout(shapes, name, x, y, w, h, text, fill=FOREST, color=WHITE, size=10.5,
            accent=BRASS, lead=None):
    K.shape(shapes, "round", name, x, y, w, h, fill=fill, radius=0.10, shadow=True, log=True)
    K.shape(shapes, "round", name + "/bar", x, y + 0.16, 0.06, h - 0.32, fill=accent,
            radius=0.03, log=True)
    K.textbox(shapes, name + "/t", x + 0.26, y + 0.12, w - 0.44, h - 0.24,
              [body(text, size, color, 1.24)], anchor="m", log=True)
