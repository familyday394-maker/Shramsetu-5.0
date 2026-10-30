#!/usr/bin/env python3
"""
validate_deck.py — structural checks for the generated deck.

PowerPoint is unforgiving about element order and attribute names inside
DrawingML. There is no schema on this machine, so this script encodes the rules
that actually matter for the elements this deck injects: spPr child order,
3D attributes, line endings, morph transitions and unique shape ids.
"""
from __future__ import annotations

import sys
import zipfile
from collections import Counter

from lxml import etree

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
MC = "{http://schemas.openxmlformats.org/markup-compatibility/2006}"
P14 = "{http://schemas.microsoft.com/office/powerpoint/2010/main}"

SPPR_ORDER = [
    A + "xfrm", A + "custGeom", A + "prstGeom",
    A + "noFill", A + "solidFill", A + "gradFill", A + "blipFill",
    A + "pattFill", A + "grpFill", A + "ln",
    A + "effectLst", A + "effectDag", A + "scene3d", A + "sp3d", A + "extLst",
]
GRPSPPR_ORDER = [
    A + "xfrm", A + "noFill", A + "solidFill", A + "gradFill", A + "blipFill",
    A + "pattFill", A + "grpFill", A + "effectLst", A + "effectDag",
    A + "scene3d", A + "extLst",
]
LN_ORDER = [
    A + "noFill", A + "solidFill", A + "gradFill", A + "pattFill",
    A + "prstDash", A + "custDash", A + "round", A + "bevel", A + "miter",
    A + "headEnd", A + "tailEnd", A + "extLst",
]
SP3D_ATTRS = {"z", "extrusionH", "contourW", "prstMaterial"}
CAMERA_ATTRS = {"prst", "fov", "zoom"}
ROT_ATTRS = {"lat", "lon", "rev"}
PRST_CAM = {"orthographicFront", "perspectiveFront", "isometricTopUp",
            "isometricOffAxis1Left", "isometricOffAxis2Top", "isometricBottomUp",
            "isometricOffAxis1Right", "isometricOffAxis2Left", "isometricTopLeft",
            "isometricOffAxis3Bottom", "isometricOffAxis4Bottom", "isometricBottomDown",
            "isometricOffAxis3Left", "isometricOffAxis4Right", "isometricTopRight",
            "isometricLeftUp", "isometricRightUp", "legacyObliqueTop",
            "legacyObliqueLeft", "legacyPerspectiveFront", "legacyPerspectiveRight"}


def check_order(el, order, label, errors, slide):
    rank = {t: i for i, t in enumerate(order)}
    last = -1
    for child in el:
        if child.tag not in rank:
            continue
        r = rank[child.tag]
        if r < last:
            errors.append(f"slide {slide}: {label} child out of order ({child.tag.split('}')[-1]})")
        last = r


def main(path):
    errors = []
    with zipfile.ZipFile(path) as z:
        bad = z.testzip()
        if bad:
            errors.append(f"corrupt zip entry {bad}")
        slide_names = sorted([n for n in z.namelist()
                              if n.startswith("ppt/slides/slide") and n.endswith(".xml")],
                             key=lambda n: int(n.split("slide")[-1].split(".")[0]))
        for idx, name in enumerate(slide_names, 1):
            root = etree.fromstring(z.read(name))
            if root.find(MC + "AlternateContent") is None:
                errors.append(f"slide {idx}: no morph transition")
            else:
                alt = root.find(MC + "AlternateContent")
                morph = alt.find(f".//{P14}morph")
                if morph is None or morph.get("option") != "byObject":
                    errors.append(f"slide {idx}: morph option wrong")
                if [c.tag.split('}')[-1] for c in root][:3] != ["cSld", "clrMapOvr", "AlternateContent"]:
                    errors.append(f"slide {idx}: slide child order wrong")

            ids = [el.get("id") for el in root.iter(P + "cNvPr")]
            dup = [k for k, v in Counter(ids).items() if v > 1]
            if dup:
                errors.append(f"slide {idx}: duplicate shape ids {dup}")

            for sp_pr in root.iter():
                if sp_pr.tag == A + "spPr":
                    check_order(sp_pr, SPPR_ORDER, "spPr", errors, idx)
                elif sp_pr.tag == A + "grpSpPr":
                    check_order(sp_pr, GRPSPPR_ORDER, "grpSpPr", errors, idx)
                    if sp_pr.find(A + "sp3d") is not None:
                        errors.append(f"slide {idx}: sp3d not allowed in grpSpPr")
                elif sp_pr.tag == A + "ln":
                    check_order(sp_pr, LN_ORDER, "a:ln", errors, idx)
                elif sp_pr.tag == A + "sp3d":
                    extra = set(sp_pr.attrib) - SP3D_ATTRS
                    if extra:
                        errors.append(f"slide {idx}: sp3d has invalid attrs {extra}")
                elif sp_pr.tag == A + "camera":
                    extra = set(sp_pr.attrib) - CAMERA_ATTRS
                    if extra:
                        errors.append(f"slide {idx}: camera has invalid attrs {extra}")
                    if sp_pr.get("prst") not in PRST_CAM:
                        errors.append(f"slide {idx}: bad camera preset {sp_pr.get('prst')}")
                elif sp_pr.tag == A + "rot":
                    extra = set(sp_pr.attrib) - ROT_ATTRS
                    if extra:
                        errors.append(f"slide {idx}: rot has invalid attrs {extra}")

    print(f"checked {len(slide_names)} slides")
    if errors:
        print(f"FAIL — {len(errors)} issue(s)")
        for e in errors[:40]:
            print("  -", e)
        return 1
    print("PASS — no structural issues found")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
