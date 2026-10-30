"""
deck_lib.py — a small design-system layer over python-pptx.

Everything here exists to serve three goals:
  1. A projector-safe, warm editorial palette (forest / brass / sand) taken from
     the Shram Setu product design system in src/index.css.
  2. Named, grouped objects that Microsoft PowerPoint's Morph transition can
     match across slides. Any object whose name starts with "!!" is a morph
     anchor, and any group whose name starts with "!!" morphs as one unit.
  3. Real 3D treatment (bevel / scene camera) and soft shadows so the anchors
     read as physical cards rather than flat rectangles.
"""

from __future__ import annotations

import math
from copy import deepcopy

from lxml import etree
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

# --------------------------------------------------------------------------
# Palette — lifted from the Shram Setu design tokens (src/index.css)
# --------------------------------------------------------------------------
FOREST_950 = "0A2219"
FOREST_900 = "163A2B"
FOREST_800 = "1B4936"
FOREST_700 = "1F5941"
FOREST_600 = "25704F"
FOREST_500 = "358B62"
FOREST_400 = "57A97E"
FOREST_300 = "8BC7A6"
FOREST_200 = "BADFCA"
FOREST_100 = "DCEFE4"
FOREST_50 = "F1F7F3"

BRASS_800 = "6B4321"
BRASS_700 = "845321"
BRASS_600 = "A76F26"
BRASS_500 = "C68D2F"
BRASS_400 = "D9A844"
BRASS_300 = "E5C068"
BRASS_200 = "F0D99B"
BRASS_100 = "F8EDCD"

SAND_50 = "FDFBF6"
SAND_100 = "F8F4EA"
SAND_200 = "F0E9DA"
SAND_300 = "E3D8C2"
SAND_400 = "CDBD9F"

INK_900 = "12211B"
INK_700 = "33483F"
INK_500 = "557165"
INK_400 = "5F776B"   # darkened from the app's #749084 for projector contrast (4.7:1)

WHITE = "FFFFFF"
CORAL = "B4482F"
CORAL_700 = "8E3625"
CORAL_100 = "F4E2DC"
CORAL_50 = "FAF0EC"

DISPLAY = "Georgia"
BODY = "Segoe UI"
MONO = "Consolas"

W, H = 13.333, 7.5            # 16:9 canvas in inches

# approximate average glyph width as a fraction of the font size
_W_FACTOR = {DISPLAY: 0.535, BODY: 0.495, MONO: 0.550}

FIT_WARNINGS: list[str] = []


def C(hexstr: str) -> RGBColor:
    return RGBColor.from_string(hexstr)


def IN(v: float):
    return Inches(v)


# --------------------------------------------------------------------------
# XML helpers
# --------------------------------------------------------------------------
NS = (
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
)

_FILL_TAGS = ("a:noFill", "a:solidFill", "a:gradFill", "a:blipFill",
              "a:pattFill", "a:grpFill")


def _frag(xml: str):
    return etree.fromstring(f'<root {NS}>{xml}</root>')[0]


def _spPr(shape):
    el = shape._element
    if el.tag == qn("p:grpSp"):            # group shapes keep geometry in grpSpPr
        return el.grpSpPr
    return el.spPr


def _insert_in_order(spPr, node):
    """Insert an effect node after the last fill/ln child, keeping schema order."""
    order = ["a:xfrm", "a:custGeom", "a:prstGeom", "a:noFill", "a:solidFill",
             "a:gradFill", "a:blipFill", "a:pattFill", "a:grpFill", "a:ln",
             "a:effectLst", "a:effectDag", "a:scene3d", "a:sp3d", "a:extLst"]
    rank = {qn(t): i for i, t in enumerate(order)}
    mine = rank[node.tag]
    for child in spPr:
        if rank.get(child.tag, -1) > mine:
            child.addprevious(node)
            return
    spPr.append(node)


def _drop(spPr, *tags):
    for tag in tags:
        for el in spPr.findall(qn(tag)):
            spPr.remove(el)


def solid(shape, color: str, alpha: float = 1.0):
    spPr = _spPr(shape)
    _drop(spPr, *_FILL_TAGS)
    a = "" if alpha >= 1.0 else f'<a:alpha val="{int(alpha * 100000)}"/>'
    _insert_in_order(spPr, _frag(f'<a:solidFill><a:srgbClr val="{color}">{a}</a:srgbClr></a:solidFill>'))
    return shape


def gradient(shape, stops, angle: float = 0.0):
    """stops: [(position 0..1, hex, alpha 0..1), ...]"""
    spPr = _spPr(shape)
    _drop(spPr, *_FILL_TAGS)
    gs = []
    for pos, color, alpha in stops:
        a = "" if alpha >= 1.0 else f'<a:alpha val="{int(alpha * 100000)}"/>'
        gs.append(
            f'<a:gs pos="{int(pos * 100000)}">'
            f'<a:srgbClr val="{color}">{a}</a:srgbClr></a:gs>'
        )
    fill = (
        "<a:gradFill rotWithShape=\"1\">"
        f"<a:gsLst>{''.join(gs)}</a:gsLst>"
        f'<a:lin ang="{int(angle * 60000)}" scaled="0"/>'
        "</a:gradFill>"
    )
    _insert_in_order(spPr, _frag(fill))
    return shape


def radial(shape, color: str, center: float = 0.30, edge: float = 0.0):
    spPr = _spPr(shape)
    _drop(spPr, *_FILL_TAGS)
    fill = (
        '<a:gradFill rotWithShape="1">'
        "<a:gsLst>"
        f'<a:gs pos="0"><a:srgbClr val="{color}"><a:alpha val="{int(center * 100000)}"/></a:srgbClr></a:gs>'
        f'<a:gs pos="60000"><a:srgbClr val="{color}"><a:alpha val="{int(center * 0.45 * 100000)}"/></a:srgbClr></a:gs>'
        f'<a:gs pos="100000"><a:srgbClr val="{color}"><a:alpha val="{int(edge * 100000)}"/></a:srgbClr></a:gs>'
        "</a:gsLst>"
        '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>'
        "</a:gradFill>"
    )
    _insert_in_order(spPr, _frag(fill))
    return shape


def no_line(shape):
    shape.line.fill.background()
    return shape


def line(shape, color: str, width: float = 1.0, alpha: float = 1.0, dash=None):
    shape.line.color.rgb = C(color)
    shape.line.width = Pt(width)
    if dash is not None:
        shape.line.dash_style = dash
    if alpha < 1.0:
        ln = shape.line._get_or_add_ln()
        sf = ln.find(qn("a:solidFill"))
        if sf is not None:
            clr = sf.find(qn("a:srgbClr"))
            if clr is not None:
                _drop(clr, "a:alpha")
                alpha_el = etree.SubElement(clr, qn("a:alpha"))
                alpha_el.set("val", str(int(alpha * 100000)))
    return shape


def shadow(shape, blur: float = 18, dist: float = 6, direction: float = 90,
           color: str = "0A2219", alpha: float = 0.16):
    spPr = _spPr(shape)
    _drop(spPr, "a:effectLst")
    eff = (
        "<a:effectLst>"
        f'<a:outerShdw blurRad="{int(blur * 12700)}" dist="{int(dist * 12700)}" '
        f'dir="{int(direction * 60000)}" rotWithShape="0">'
        f'<a:srgbClr val="{color}"><a:alpha val="{int(alpha * 100000)}"/></a:srgbClr>'
        "</a:outerShdw></a:effectLst>"
    )
    _insert_in_order(spPr, _frag(eff))
    return shape


def glow_effect(shape, color: str = BRASS_400, radius: float = 14, alpha: float = 0.45):
    spPr = _spPr(shape)
    _drop(spPr, "a:effectLst")
    eff = (
        "<a:effectLst>"
        f'<a:glow rad="{int(radius * 12700)}">'
        f'<a:srgbClr val="{color}"><a:alpha val="{int(alpha * 100000)}"/></a:srgbClr>'
        "</a:glow></a:effectLst>"
    )
    _insert_in_order(spPr, _frag(eff))
    return shape


def three_d(shape, bevel: float = 2.0, depth: float = 0.0,
            rot_x: float = 0.0, rot_y: float = 0.0, fov: float = 60.0):
    """Bevel (+ optional scene camera). Values stay subtle: projector first.

    OOXML notes — the rotation lives on a:camera/a:rot and the extrusion height
    is an attribute of a:sp3d, not a child element. Getting this wrong is the
    classic cause of PowerPoint's "repair" prompt, so it is spelled out here.
    """
    spPr = _spPr(shape)
    _drop(spPr, "a:sp3d", "a:scene3d")

    if rot_x or rot_y:
        scene = (
            "<a:scene3d>"
            f'<a:camera prst="perspectiveFront" fov="{int(fov * 60000)}" zoom="100000">'
            f'<a:rot lat="{int(rot_x * 60000)}" lon="{int(rot_y * 60000)}" rev="0"/>'
            "</a:camera>"
            '<a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="0"/></a:lightRig>'
            "</a:scene3d>"
        )
        _insert_in_order(spPr, _frag(scene))

    attrs = f' extrusionH="{int(depth * 12700)}"' if depth else ""
    sp3d = (
        f"<a:sp3d{attrs}>"
        f'<a:bevelT w="{int(bevel * 12700)}" h="{int(bevel * 12700)}" prst="circle"/>'
        "</a:sp3d>"
    )
    _insert_in_order(spPr, _frag(sp3d))
    return shape


# --------------------------------------------------------------------------
# Shape factories
# --------------------------------------------------------------------------
def rect(slide, x, y, w, h, fill=WHITE, ln=None, lw=1.0, radius=None,
         name=None, shdw=False, alpha=1.0, dash=None, rot=0):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shp = slide.shapes.add_shape(kind, IN(x), IN(y), IN(w), IN(h))
    if radius:
        shp.adjustments[0] = max(0.0, min(0.5, radius / max(0.01, min(w, h))))
    if fill is None:
        shp.fill.background()
    else:
        solid(shp, fill, alpha)
    if ln is None:
        no_line(shp)
    else:
        line(shp, ln, lw, dash=dash)
    shp.text_frame.word_wrap = True
    shp.text_frame.margin_left = shp.text_frame.margin_right = 0
    shp.text_frame.margin_top = shp.text_frame.margin_bottom = 0
    if rot:
        shp.rotation = rot
    if shdw:
        shadow(shp)
    if name:
        shp.name = name
    return shp


def oval(slide, x, y, w, h, fill=BRASS_400, ln=None, lw=1.0, name=None,
         alpha=1.0, shdw=False):
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, IN(x), IN(y), IN(w), IN(h))
    if fill is None:
        shp.fill.background()
    else:
        solid(shp, fill, alpha)
    if ln is None:
        no_line(shp)
    else:
        line(shp, ln, lw)
    if shdw:
        shadow(shp)
    if name:
        shp.name = name
    return shp


def glow_blob(slide, x, y, d, color, strength=0.30, name=None):
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, IN(x), IN(y), IN(d), IN(d))
    radial(shp, color, strength, 0.0)
    no_line(shp)
    if name:
        shp.name = name
    return shp


def arrow(slide, x1, y1, x2, y2, color=BRASS_400, width=1.4, name=None, dash=None):
    from pptx.enum.shapes import MSO_CONNECTOR
    conn = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, IN(x1), IN(y1), IN(x2), IN(y2))
    conn.line.color.rgb = C(color)
    conn.line.width = Pt(width)
    if dash is not None:
        conn.line.dash_style = dash
    ln = conn.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn("a:tailEnd"))
    tail.set("type", "triangle")
    tail.set("w", "med")
    tail.set("len", "med")
    if name:
        conn.name = name
    return conn


def hline(slide, x, y, w, color=SAND_300, width=1.0, name=None, alpha=1.0):
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, IN(x), IN(y), IN(max(w, 0.01)), IN(0.012))
    solid(shp, color, alpha)
    no_line(shp)
    if name:
        shp.name = name
    return shp


def group(slide, name):
    grp = slide.shapes.add_group_shape()
    grp.name = name
    return grp


def bg(slide, color):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = C(color)


# --------------------------------------------------------------------------
# Text
# --------------------------------------------------------------------------
def _style_run(run, size, color, font, bold, italic, spc=0):
    run.font.size = Pt(size)
    run.font.color.rgb = C(color)
    run.font.name = font
    run.font.bold = bold
    run.font.italic = italic
    if spc:
        run.font._rPr.set("spc", str(int(spc * 100)))
    # keep Devanagari / symbols on the same face
    rPr = run.font._rPr
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            etree.SubElement(rPr, qn(tag)).set("typeface", font)


def text(slide, x, y, w, h, content, size=14, color=INK_900, font=BODY, bold=False,
         italic=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, line_spacing=1.0,
         name=None, spc=0, caps=False, margins=(0, 0, 0, 0), space_after=0,
         tag=None, shadow_text=False):
    """content: str | list[str] | list[dict(runs=[(txt, overrides)], ...)]"""
    box = slide.shapes.add_textbox(IN(x), IN(y), IN(w), IN(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left, tf.margin_right, tf.margin_top, tf.margin_bottom = [IN(m) for m in margins]
    tf.vertical_anchor = anchor
    tf.auto_size = None

    if isinstance(content, str):
        content = [content]

    flat = []
    for item in content:
        if isinstance(item, str):
            item = {"text": item}
        if "runs" not in item and "\n" in item.get("text", ""):
            for line in item["text"].split("\n"):
                d = dict(item)
                d["text"] = line
                flat.append(d)
        else:
            flat.append(item)
    content = flat

    used_height = 0.0
    for i, item in enumerate(content):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        if i < len(content) - 1 or space_after:
            p.space_after = Pt(space_after if space_after else 0)
        if isinstance(item, str):
            item = {"text": item}
        psize = item.get("size", size)
        pcolor = item.get("color", color)
        pfont = item.get("font", font)
        pbold = item.get("bold", bold)
        pital = item.get("italic", italic)
        pspc = item.get("spc", spc)
        runs = item.get("runs")
        if runs is None:
            txt = item.get("text", "")
            if caps:
                txt = txt.upper()
            runs = [(txt, {})]
        width_in = 0.0       # estimated rendered width of the paragraph
        tallest = psize
        for txt, ov in runs:
            r = p.add_run()
            r.text = txt
            rsize = ov.get("size", psize)
            rfont = ov.get("font", pfont)
            rbold = ov.get("bold", pbold)
            _style_run(r, rsize, ov.get("color", pcolor), rfont, rbold,
                       ov.get("italic", pital), ov.get("spc", pspc))
            factor = _W_FACTOR.get(rfont, 0.5) * (1.05 if rbold else 1.0)
            width_in += len(txt) * rsize * factor / 72.0
            tallest = max(tallest, rsize)
        lines = max(1, math.ceil(width_in / max(w, 0.05)))
        used_height += lines * tallest * 1.22 * line_spacing / 72.0
        if item.get("space_before"):
            used_height += item["space_before"] / 72.0

    if used_height > h + 0.06:
        FIT_WARNINGS.append(
            f"OVERFLOW {w:.2f}x{h:.2f}in needs ~{used_height:.2f}in :: "
            f"{str(content)[:90]}"
        )
    if name:
        box.name = name
    if tag:
        box._element.nvSpPr.cNvPr.set("descr", tag)
    return box


def fit_size(txt, width, size, font=BODY, bold=False, minimum=10.0):
    """Shrink a single line until it is estimated to fit on one line."""
    factor = _W_FACTOR.get(font, 0.5) * (1.05 if bold else 1.0)
    need = len(txt) * size * factor / 72.0
    while need > width and size > minimum:
        size -= 0.5
        need = len(txt) * size * factor / 72.0
    return size


# --------------------------------------------------------------------------
# Reusable composite pieces
# --------------------------------------------------------------------------
def qr_grid(slide, x, y, size, color=FOREST_900, name=None, modules=9):
    """A stylised QR: real quiet-zone + finder patterns, deterministic data bits."""
    grp = group(slide, name) if name else None
    host = grp if grp else slide
    cell = size / (modules + 2)
    pattern = []
    seed = 7
    for r in range(modules):
        row = []
        for c in range(modules):
            seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
            row.append((seed >> 16) % 100 < 48)
        pattern.append(row)

    def finder(ox, oy):
        rect(host, x + (ox + 1) * cell, y + (oy + 1) * cell, cell * 3, cell * 3, fill=color)
        rect(host, x + (ox + 1.6) * cell, y + (oy + 1.6) * cell, cell * 1.8, cell * 1.8, fill=WHITE)
        rect(host, x + (ox + 2.15) * cell, y + (oy + 2.15) * cell, cell * 0.7, cell * 0.7, fill=color)

    for r in range(modules):
        for c in range(modules):
            if (r < 3 and c < 3) or (r < 3 and c > modules - 4) or (r > modules - 4 and c < 3):
                continue
            if pattern[r][c]:
                rect(host, x + (c + 1) * cell, y + (r + 1) * cell,
                     cell * 0.92, cell * 0.92, fill=color)
    finder(0, 0)
    finder(modules - 3, 0)
    finder(0, modules - 3)
    return grp


def pass_card(slide, x, y, w, h, name="!!pass-card", tilt=0.0, dark_head=True):
    """The Smart Shram Pass — a morph anchor that travels through the deck."""
    grp = group(slide, name)
    body = rect(grp, x, y, w, h, fill=WHITE, ln=SAND_300, lw=0.9, radius=0.16, shdw=True)
    three_d(body, bevel=1.8, rot_y=tilt)
    head_h = h * 0.19
    rect(grp, x, y, w, head_h, fill=FOREST_900 if dark_head else FOREST_800, radius=0.16)
    rect(grp, x, y + head_h - 0.12, w, 0.12, fill=FOREST_900 if dark_head else FOREST_800)
    text(grp, x + 0.16, y + 0.07, w - 0.3, head_h - 0.1,
         [{"text": "MP SHRAM PASS", "size": max(6.5, w * 3.2), "bold": True, "color": SAND_50, "spc": 1.2},
          {"text": "मध्य प्रदेश श्रम सेतु", "size": max(5.5, w * 2.4), "font": "Nirmala UI",
           "color": FOREST_300}],
         line_spacing=0.95, name=None)
    # portrait placeholder
    pw = w * 0.26
    rect(grp, x + 0.14, y + head_h + 0.16, pw, pw * 1.2, fill=SAND_200, ln=SAND_300, lw=0.5, radius=0.03)
    oval(grp, x + 0.14 + pw * 0.28, y + head_h + 0.24, pw * 0.44, pw * 0.44, fill=SAND_400)
    rect(grp, x + 0.14 + pw * 0.14, y + head_h + 0.16 + pw * 0.72, pw * 0.72, pw * 0.42, fill=SAND_400, radius=0.12)
    tx = x + 0.14 + pw + 0.12
    text(grp, tx, y + head_h + 0.15, w - (tx - x) - 0.12, h * 0.26,
         [{"text": "Rajesh K.", "size": max(7.5, w * 4.2), "bold": True, "color": INK_900},
          {"text": "MP-IND-2026-MM842", "size": max(5.2, w * 2.3), "font": MONO, "color": INK_500},
          {"text": "MASON · SITE 04", "size": max(5.2, w * 2.2), "color": BRASS_700, "bold": True, "spc": 0.8}],
         line_spacing=1.0)
    qs = w * 0.52
    qr_grid(grp, x + (w - qs) / 2, y + h - qs - 0.14, qs)
    return grp


def badge(slide, x, y, w, h, label, fill=FOREST_900, color=SAND_50, size=9,
          radius=0.3, name=None, ln=None, bold=True, font=BODY, spc=1.0):
    shp = rect(slide, x, y, w, h, fill=fill, ln=ln, lw=0.75, radius=radius, name=name)
    tf = shp.text_frame
    tf.word_wrap = False
    tf.margin_left = tf.margin_right = 0
    tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    _style_run(r, size, color, font, bold, False, spc)
    return shp


def notes(slide, txt):
    slide.notes_slide.notes_text_frame.text = txt


# --------------------------------------------------------------------------
# Morph transition
# --------------------------------------------------------------------------
_MORPH = (
    '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
    '<mc:Choice xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" Requires="p14">'
    '<p:transition spd="slow" p14:dur="{dur}">'
    '<p14:morph option="byObject"/>'
    '</p:transition>'
    '</mc:Choice>'
    '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback>'
    '</mc:AlternateContent>'
)


def morph(slide, duration_ms: int = 1400):
    """Attach a Morph transition (with a fade fallback for older clients)."""
    sld = slide._element
    MC = "{http://schemas.openxmlformats.org/markup-compatibility/2006}AlternateContent"
    for old in sld.findall(MC):
        sld.remove(old)
    sld.append(_frag(_MORPH.format(dur=duration_ms)))
