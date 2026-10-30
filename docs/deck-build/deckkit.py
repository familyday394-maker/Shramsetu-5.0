"""
deckkit.py — a tiny OOXML toolkit for building projector-optimised,
Morph-ready PowerPoint decks with python-pptx.

Why this exists
---------------
python-pptx has no API for 3-D camera rotation, bevels, soft shadows,
gradient transparency or Morph transitions. All four are essential here,
so this module writes the raw DrawingML for them and keeps the spPr child
order valid (PowerPoint is strict about schema order and will repair a
file that violates it).

Design notes
------------
* Every recurring object gets a stable name beginning with "!!" — PowerPoint
  Morph matches objects by name first, so the same "!!Card" on every slide
  glides, scales and rotates in 3-D instead of cross-fading.
* Each primitive is also logged to a scene list so the offline previewer can
  rasterise an approximation with Pillow and catch overflow / collisions
  before the file ever reaches PowerPoint.
"""

from __future__ import annotations

import copy
import os
from dataclasses import dataclass, field
from typing import Iterable, Sequence

from lxml import etree
from PIL import ImageFont
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

# --------------------------------------------------------------------------
# Palette — forest / brass / warm paper, tuned for a washed-out projector:
# every accent is one step more saturated than on-screen brand tokens.
# --------------------------------------------------------------------------

PAPER      = "FBF7EC"   # warm paper (slide ground)
PAPER_DEEP = "F3EBD8"   # sand panel
PAPER_LINE = "E6DBC2"   # hairline on paper
WHITE      = "FFFFFF"

FOREST     = "0E2A20"   # deep forest (dark panels)
FOREST_MID = "17493A"
FOREST_SOFT= "1F5C48"

INK        = "12211B"   # primary text
INK2       = "4E6459"   # secondary text
INK3       = "7C8F85"   # tertiary text

EMERALD    = "16A574"   # vivid accent
EMERALD_DK = "0E7A55"
MINT       = "8BC7A6"

BRASS      = "E3B04B"   # vivid gold
BRASS_DK   = "B9812C"
BRASS_LT   = "F2D79B"

CLAY       = "C2542D"   # alert / risk
CLAY_LT    = "F3DACF"

DISPLAY = "Georgia"
BODY    = "Calibri"
MONO    = "Consolas"

# slide geometry (16:9, inches)
SW, SH     = 13.333, 7.5
SIDEBAR_W  = 3.42
CONTENT_X  = 4.16
CONTENT_W  = 8.56
RAIL_Y     = 7.30

_PREVIEW_FONT = {
    DISPLAY: "DejaVuSerif.ttf",
    BODY: "DejaVuSans.ttf",
    MONO: "DejaVuSansMono.ttf",
}
_FONT_DIR = "/usr/share/fonts/truetype/dejavu/"


# --------------------------------------------------------------------------
# low-level XML helpers
# --------------------------------------------------------------------------

A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"


def _a(tag: str) -> str:
    return qn(tag)


_SPPR_ORDER = [
    "a:xfrm", "a:custGeom", "a:prstGeom", "a:noFill", "a:solidFill", "a:gradFill",
    "a:blipFill", "a:pattFill", "a:grpFill", "a:ln", "a:effectLst", "a:effectDag",
    "a:scene3d", "a:sp3d", "a:extLst",
]


def _reorder(spPr) -> None:
    """Sort spPr children into the sequence CT_ShapeProperties requires."""
    idx = {qn(t): i for i, t in enumerate(_SPPR_ORDER)}
    kids = list(spPr)
    kids.sort(key=lambda e: idx.get(e.tag, 99))
    for k in kids:
        spPr.remove(k)
    for k in kids:
        spPr.append(k)


def _spPr_of(shape):
    el = shape._element
    if el.tag == qn("p:grpSp"):
        return el.find(qn("p:grpSpPr"))
    if el.tag == qn("p:sp"):
        return el.spPr
    if el.tag == qn("p:pic"):
        return el.spPr
    raise TypeError(el.tag)


def _drop(spPr, *tags):
    for t in tags:
        for e in spPr.findall(qn(t)):
            spPr.remove(e)


# --------------------------------------------------------------------------
# 3-D, shadow, gradient
# --------------------------------------------------------------------------

def apply_3d(shape, lat=-8.0, lon=-12.0, rev=0.0, camera="perspectiveRelaxed",
             fov=42000, bevel=(0.045, 0.045), bevel_prst="circle",
             extrusion=None, material="matte", light="threePt", light_dir="t"):
    """Give a shape (or a whole group) a real 3-D camera + bevel.

    Morph interpolates the camera rotation between slides, so changing
    lat/lon slide-to-slide produces a smooth 3-D sweep instead of a flat
    cross-fade. lat in [-90, 90], lon in [-180, 180], rev in degrees.
    """
    spPr = _spPr_of(shape)
    _drop(spPr, "a:scene3d", "a:sp3d")
    scene = etree.SubElement(spPr, qn("a:scene3d"))
    etree.SubElement(scene, qn("a:camera"), prst=camera, fov=str(int(fov)), zoom="100000")
    etree.SubElement(scene.find(qn("a:camera")), qn("a:rot"),
                     lat=str(int(round(lat * 60000))),
                     lon=str(int(round(lon * 60000))),
                     rev=str(int(round(rev * 60000))))
    rig = etree.SubElement(scene, qn("a:lightRig"), rig=light, dir=light_dir)
    etree.SubElement(rig, qn("a:rot"), lat="0", lon="0", rev="0")

    sp3 = etree.SubElement(spPr, qn("a:sp3d"))
    if bevel:
        w = str(int(Inches(bevel[0])))
        h = str(int(Inches(bevel[1])))
        etree.SubElement(sp3, qn("a:bevelT"), w=w, h=h, prst=bevel_prst)
        etree.SubElement(sp3, qn("a:bevelB"), w=w, h=h, prst=bevel_prst)
    if extrusion:
        etree.SubElement(sp3, qn("a:extrusionClr")).append(
            _srgb(FOREST, alpha=None))
        etree.SubElement(sp3, qn("a:extrusionH"), val=str(int(Inches(extrusion))))
    etree.SubElement(sp3, qn("a:prstMaterial"), prst=material)
    _reorder(spPr)


def _srgb(hex_color: str, alpha: int | None = None):
    """<a:srgbClr> with optional alpha (0-100, percent)."""
    el = etree.Element(qn("a:srgbClr"), val=hex_color.upper())
    if alpha is not None:
        a = etree.SubElement(el, qn("a:alpha"))
        a.set("val", str(int(alpha * 1000)))
    return el


def soft_shadow(shape, blur=0.10, dist=0.035, dir_deg=90, color=FOREST, alpha=16):
    spPr = _spPr_of(shape)
    _drop(spPr, "a:effectLst", "a:effectDag")
    fx = etree.SubElement(spPr, qn("a:effectLst"))
    sh = etree.SubElement(fx, qn("a:outerShdw"),
                          blurRad=str(int(Inches(blur))),
                          dist=str(int(Inches(dist))),
                          dir=str(int(dir_deg * 60000)),
                          algn="t", rotWithShape="0")
    sh.append(_srgb(color, alpha))
    _reorder(spPr)


def glow(shape, radius=0.09, color=BRASS, alpha=45):
    spPr = _spPr_of(shape)
    _drop(spPr, "a:effectLst")
    fx = etree.SubElement(spPr, qn("a:effectLst"))
    g = etree.SubElement(fx, qn("a:glow"), rad=str(int(Inches(radius))))
    g.append(_srgb(color, alpha))
    _reorder(spPr)


def gradient(shape, stops: Sequence[tuple], angle=0.0, kind="lin", **kw):
    """stops = [(pos 0-100, 'RRGGBB', alpha or None), ...]"""
    spPr = _spPr_of(shape)
    _drop(spPr, "a:noFill", "a:solidFill", "a:gradFill", "a:blipFill", "a:pattFill", "a:grpFill")
    grad = etree.Element(qn("a:gradFill"), rotWithShape="1")
    gsLst = etree.SubElement(grad, qn("a:gsLst"))
    for pos, col, alpha in stops:
        gs = etree.SubElement(gsLst, qn("a:gs"), pos=str(int(pos * 1000)))
        gs.append(_srgb(col, alpha))
    if kind == "lin":
        etree.SubElement(grad, qn("a:lin"), ang=str(int(angle * 60000)), scaled="0")
    else:
        etree.SubElement(grad, qn("a:path"), path="circle")
    spPr.insert(1, grad)
    _reorder(spPr)


def set_morph(slide, dur=1500, option="byObject"):
    """Attach a Morph transition (PowerPoint 2019+) with a Fade fallback."""
    sld = slide._element
    for t in sld.findall(qn("p:transition")):
        sld.remove(t)
    xml = (
        '<mc:AlternateContent '
        'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
        'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
        'xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" '
        'xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main">'
        '<mc:Choice Requires="p159">'
        f'<p:transition spd="slow" p14:dur="{dur}">'
        f'<p159:morph option="{option}"/>'
        '</p:transition>'
        '</mc:Choice>'
        '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback>'
        '</mc:AlternateContent>'
    )
    node = etree.fromstring(xml)
    timing = sld.find(qn("p:timing"))
    if timing is not None:
        timing.addprevious(node)
    else:
        sld.append(node)


# --------------------------------------------------------------------------
# text measurement  (conservative: DejaVu is ~6% wider than Calibri/Georgia)
# --------------------------------------------------------------------------

@dataclass
class Run:
    text: str
    font: str = BODY
    size: float = 12.0
    color: str = INK
    bold: bool = False
    italic: bool = False
    spc: int = 0          # letter spacing, 1/100 pt
    alpha: int | None = None


@dataclass
class Para:
    runs: list = field(default_factory=list)
    align: str = "l"      # l | c | r | j
    space_before: float = 0.0   # pt
    space_after: float = 0.0
    line: float = 1.0
    bullet: str | None = None


def P(text, **kw) -> Para:
    """Single-run paragraph shorthand."""
    run_kw = {k: v for k, v in kw.items()
              if k in {"font", "size", "color", "bold", "italic", "spc", "alpha"}}
    para_kw = {k: v for k, v in kw.items() if k not in run_kw}
    return Para(runs=[Run(text, **run_kw)], **para_kw)


def fit_size(text, width_in, max_size, min_size=19.0, font=DISPLAY, bold=True, line=0.98):
    """Largest size that keeps `text` on a single line inside `width_in`."""
    s = max_size
    while s > min_size:
        if measure([P(text, font=font, size=s, bold=bold, line=line)], width_in) <= s * 1.32 / 72:
            return round(s, 1)
        s -= 0.5
    return min_size


def _pil(size_pt: float, font: str, bold: bool = False):
    fname = _PREVIEW_FONT.get(font, "DejaVuSans.ttf")
    if bold:
        cand = fname.replace(".ttf", "-Bold.ttf")
        if os.path.exists(_FONT_DIR + cand):
            fname = cand
    return ImageFont.truetype(_FONT_DIR + fname, max(1, int(round(size_pt * 96 / 72))))


def measure(paras: Iterable[Para], width_in: float, indent_in: float = 0.0) -> float:
    """Approximate rendered height in inches."""
    total = 0.0
    usable_px = (width_in - indent_in) * 96.0
    for i, p in enumerate(paras):
        size = max((r.size for r in p.runs), default=12)
        font = p.runs[0].font if p.runs else BODY
        bold = any(r.bold for r in p.runs)
        pil = _pil(size, font, bold)
        text = "".join(r.text for r in p.runs)
        words, lines, cur = text.split(), 1, ""
        for w in words:
            trial = (cur + " " + w).strip()
            if pil.getlength(trial) <= usable_px or not cur:
                cur = trial
            else:
                lines += 1
                cur = w
        line_h = size * 1.22 * p.line / 72.0
        total += lines * line_h
        if i:
            total += p.space_before / 72.0
        total += p.space_after / 72.0
    return total


# --------------------------------------------------------------------------
# preview scene log
# --------------------------------------------------------------------------

SCENE: list[list[dict]] = []


def scene_reset():
    SCENE.append([])


def _log(**kw):
    if SCENE:
        SCENE[-1].append(kw)


# --------------------------------------------------------------------------
# primitives
# --------------------------------------------------------------------------

ALIGN = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT, "j": PP_ALIGN.JUSTIFY}
ANCHOR = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}


def _style_runs(p, para: Para):
    for r in para.runs:
        run = p.add_run()
        run.text = r.text
        f = run.font
        f.name = r.font
        f.size = Pt(r.size)
        f.bold = r.bold
        f.italic = r.italic
        f.color.rgb = RGBColor.from_string(r.color)
        rPr = run._r.get_or_add_rPr()
        if r.spc:
            rPr.set("spc", str(int(r.spc)))
        if r.alpha is not None:
            for sf in rPr.findall(qn("a:solidFill")):
                for c in sf:
                    etree.SubElement(c, qn("a:alpha")).set("val", str(int(r.alpha * 1000)))


def textbox(shapes, name, x, y, w, h, paras, anchor="t", margins=(0, 0, 0, 0),
            wrap=True, shrink=False, log=True):
    box = shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    box.name = name
    tf = box.text_frame
    tf.word_wrap = wrap
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.vertical_anchor = ANCHOR[anchor]
    tf.margin_left, tf.margin_top, tf.margin_right, tf.margin_bottom = (
        Inches(margins[0]), Inches(margins[1]), Inches(margins[2]), Inches(margins[3]))
    if isinstance(paras, Para):
        paras = [paras]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = ALIGN[para.align]
        p.line_spacing = para.line
        p.space_before = Pt(para.space_before)
        p.space_after = Pt(para.space_after)
        _style_runs(p, para)
    if log:
        need = measure(paras, w - margins[0] - margins[2])
        _log(kind="text", x=x, y=y, w=w, h=h, paras=paras, anchor=anchor,
             need=need, name=name)
        if need > h + 0.02:
            print(f"  ! overflow {name}: needs {need:.2f}in, box {h:.2f}in")
    return box


def shape(shapes, kind, name, x, y, w, h, fill=None, line=None, lw=0.75,
          radius=None, shadow=False, log=True, dash=None):
    st = {"rect": MSO_SHAPE.RECTANGLE, "round": MSO_SHAPE.ROUNDED_RECTANGLE,
          "oval": MSO_SHAPE.OVAL, "chev": MSO_SHAPE.CHEVRON,
          "diamond": MSO_SHAPE.DIAMOND, "tri": MSO_SHAPE.ISOSCELES_TRIANGLE,
          "rtri": MSO_SHAPE.RIGHT_TRIANGLE, "line": MSO_SHAPE.RECTANGLE,
          "down": MSO_SHAPE.DOWN_ARROW, "right": MSO_SHAPE.RIGHT_ARROW,
          "hex": MSO_SHAPE.HEXAGON, "pent": MSO_SHAPE.PENTAGON}[kind]
    sp = shapes.add_shape(st, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.name = name
    if kind == "round":
        r = radius if radius is not None else 0.12
        sp.adjustments[0] = min(0.5, r / max(0.01, min(w, h)))
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid()
        sp.fill.fore_color.rgb = RGBColor.from_string(fill)
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = RGBColor.from_string(line)
        sp.line.width = Pt(lw)
    sp.shadow.inherit = False
    if shadow:
        soft_shadow(sp)
    txt = sp.text_frame
    txt.word_wrap = True
    txt.margin_left = txt.margin_right = txt.margin_top = txt.margin_bottom = 0
    if log:
        _log(kind="shape", g=kind, x=x, y=y, w=w, h=h, fill=fill, line=line,
             lw=lw, radius=radius, shadow=shadow, name=name)
    return sp


def label(container, name, x, y, w, h, paras, fill=None, line=None, lw=0.75,
          radius=None, kind="round", anchor="m", margins=(0.10, 0.04, 0.10, 0.04),
          shadow=False, pad=0.0):
    """A shape with centred text — the workhorse for cards, chips and pills."""
    sp = shape(container, kind, name, x, y, w, h, fill=fill, line=line, lw=lw,
               radius=radius, shadow=shadow, log=False)
    if isinstance(paras, Para):
        paras = [paras]
    tf = sp.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.vertical_anchor = ANCHOR[anchor]
    tf.margin_left, tf.margin_top = Inches(margins[0]), Inches(margins[1])
    tf.margin_right, tf.margin_bottom = Inches(margins[2]), Inches(margins[3])
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = ALIGN[para.align]
        p.line_spacing = para.line
        p.space_before = Pt(para.space_before)
        p.space_after = Pt(para.space_after)
        _style_runs(p, para)
    need = measure(paras, w - margins[0] - margins[2])
    inner = h - margins[1] - margins[3]
    if need > inner + 0.015:
        print(f"  ! overflow {name}: needs {need:.2f}in, inner {inner:.2f}in")
    _log(kind="shape", g=kind, x=x, y=y, w=w, h=h, fill=fill, line=line, lw=lw,
         radius=radius, shadow=shadow, name=name)
    _log(kind="text", x=x + margins[0], y=y + margins[1],
         w=w - margins[0] - margins[2], h=inner, paras=paras, anchor=anchor,
         need=need, name=name + "/txt")
    return sp


def picture(container, name, path, x, y, w, h, crop=(0, 0, 0, 0), radius=None,
            border=None, lw=1.0, shadow=False):
    pic = container.add_picture(path, Inches(x), Inches(y), Inches(w), Inches(h))
    pic.name = name
    cl, ct, cr, cb = crop
    picture_crop(pic, cl, ct, cr, cb)
    if border:
        pic.line.color.rgb = RGBColor.from_string(border)
        pic.line.width = Pt(lw)
    else:
        pic.line.fill.background()
    if shadow:
        soft_shadow(pic, blur=0.14, dist=0.05, alpha=22)
    _log(kind="pic", x=x, y=y, w=w, h=h, path=str(path), crop=crop,
         radius=radius, border=border, name=name)
    return pic


def picture_crop(pic, cl, ct, cr, cb):
    if any(v > 0 for v in (cl, ct, cr, cb)):
        pic.crop_left, pic.crop_top = cl, ct
        pic.crop_right, pic.crop_bottom = cr, cb


def rounded_picture(container, name, path, x, y, w, h, crop, radius=0.14,
                    border=None, lw=1.2, shadow=True):
    """Picture clipped to a rounded rectangle via a pict-frame geometry swap."""
    pic = picture(container, name, path, x, y, w, h, crop=crop, border=border,
                  lw=lw, shadow=False)
    spPr = pic._element.spPr
    for g in spPr.findall(qn("a:prstGeom")):
        spPr.remove(g)
    geom = etree.Element(qn("a:prstGeom"), prst="roundRect")
    av = etree.SubElement(geom, qn("a:avLst"))
    gd = etree.SubElement(av, qn("a:gd"), name="adj")
    gd.set("fmla", f"val {int(min(0.5, radius / max(0.01, min(w, h))) * 100000)}")
    ln = spPr.find(qn("a:ln"))
    if ln is not None:
        ln.addprevious(geom)
    else:
        spPr.append(geom)
    _reorder(spPr)
    if shadow:
        soft_shadow(pic, blur=0.16, dist=0.05, alpha=20)
    return pic


def group(container, name, items, lat=None, lon=None, rev=0.0, bevel=(0.03, 0.03),
          extrusion=None, camera="perspectiveRelaxed", fov=42000):
    """Create a named group; `items` is a callable receiving the group's shape tree."""
    grp = container.add_group_shape()
    grp.name = name
    items(grp.shapes)
    if lat is not None or lon is not None:
        apply_3d(grp, lat=lat or 0.0, lon=lon or 0.0, rev=rev, bevel=bevel,
                 extrusion=extrusion, camera=camera, fov=fov)
    _log(kind="group_start", name=name, lat=lat, lon=lon)
    _log(kind="group_end")
    return grp


def bring_to_front(shapes, shp):
    el = shp._element
    el.getparent().remove(el)
    shapes._spTree.append(el)


def send_to_back(shapes, shp):
    el = shp._element
    el.getparent().remove(el)
    tree = shapes._spTree
    # after nvGrpSpPr and grpSpPr
    tree.insert(2, el)


def line_h(container, name, x, y, w, color, lw=1.0, alpha=None, dash=None):
    sp = shape(container, "rect", name, x, y, w, lw / 72.0, fill=color, log=True)
    if alpha is not None:
        spPr = sp._element.spPr
        for sf in spPr.findall(qn("a:solidFill")):
            for c in sf:
                etree.SubElement(c, qn("a:alpha")).set("val", str(int(alpha * 1000)))
    if dash:
        sp.line.fill.background()
    return sp


def line_v(container, name, x, y, h, color, lw=1.0):
    return shape(container, "rect", name, x, y, lw / 72.0, h, fill=color, log=True)
