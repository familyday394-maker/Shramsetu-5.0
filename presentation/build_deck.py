#!/usr/bin/env python3
"""
build_deck.py — Shram Setu 2.0 presentation for Indore Sahodaya Computer Science.

Design notes
------------
* 16:9, 26 slides, warm editorial palette (forest / brass / sand) taken from the
  product's own design tokens so the deck matches the live prototype.
* Every slide shares the same morph frame: !!rail, !!rail-fill, !!rail-dot,
  !!eyebrow, !!title, !!rule, !!glow-a, !!glow-b, !!pageno, !!footer.
  Those objects keep their identity from slide to slide, which is exactly what
  PowerPoint's Morph transition interpolates.
* Content is grouped into named groups (!!pass-card, !!blk-1…5, !!portal-…)
  so cards travel, rotate and scale as single 3D objects instead of exploding
  into loose shapes.
* A Morph transition is pre-applied to every slide (1.4 s, by object).
"""

from __future__ import annotations

import os

from pptx import Presentation
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

from deck_lib import *   # noqa: F401,F403  (design system)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
IMG_HERO = os.path.join(ROOT, "public", "images", "shram_setu_hero_pass_1792385013356.jpg")
IMG_MUSTER = os.path.join(ROOT, "public", "images", "construction_site_muster_1792385014214.jpg")

TOTAL = 26
LEFT = 0.86
RIGHT = 12.47
CW = RIGHT - LEFT            # 11.61 content width

CHAPTERS = {
    0: ("", ""),
    1: ("01", "CONTEXT"),
    2: ("02", "DESIGN"),
    3: ("03", "BUILD"),
    4: ("04", "CLOSE"),
}


# --------------------------------------------------------------------------
# The shared morph frame
# --------------------------------------------------------------------------
def frame(slide, i, kind="light", chapter=1, eyebrow="", title="", size=33,
          title_y=0.86, title_h=0.72, rule_y=1.74, title_color=None,
          footer_right=None, title_paras=None, title_line=1.0):
    dark = kind == "dark"
    bg(slide, FOREST_950 if dark else SAND_50)

    # drifting light blobs — same names every slide, so they glide under morph
    gx = 9.9 + (i % 3) * 0.55
    gy = -3.1 + (i % 4) * 0.28
    glow_blob(slide, gx, gy, 6.6, FOREST_300 if not dark else FOREST_400,
              0.16 if not dark else 0.26, name="!!glow-a")
    glow_blob(slide, -3.1 + (i % 3) * 0.3, 4.6 + (i % 2) * 0.35, 5.4, BRASS_400,
              0.15 if not dark else 0.20, name="!!glow-b")

    # progress rail
    rail_top, rail_h = 0.62, 6.12
    rect(slide, 0.44, rail_top, 0.018, rail_h,
         fill=FOREST_800 if dark else SAND_300, name="!!rail")
    p = max(0.035, i / (TOTAL - 1))
    fh = rail_h * p
    rect(slide, 0.44, rail_top, 0.018, fh,
         fill=BRASS_400 if dark else FOREST_600, name="!!rail-fill")
    oval(slide, 0.385, rail_top + fh - 0.055, 0.13, 0.13,
         fill=BRASS_300 if dark else BRASS_500, name="!!rail-dot")

    # eyebrow
    if eyebrow:
        rect(slide, 0.86, 0.58, 0.13, 0.13, fill=BRASS_400 if dark else BRASS_500,
             name="!!eyebrow-mark")
        text(slide, 1.09, 0.5, 8.2, 0.28, eyebrow.upper(), size=10,
             color=BRASS_300 if dark else FOREST_600, bold=True, spc=1.8,
             name="!!eyebrow")

    # chapter tag
    num, name = CHAPTERS.get(chapter, ("", ""))
    if num:
        text(slide, 9.7, 0.5, 2.77, 0.26,
             [{"runs": [(f"{num}  ", {"color": BRASS_400 if dark else BRASS_500}),
                        (name, {})]}],
             size=9.5, color=FOREST_400 if dark else INK_400, bold=True, spc=1.4,
             align=PP_ALIGN.RIGHT, name="!!chapter-tag")

    # title
    if title or title_paras:
        content = title_paras if title_paras else title
        if isinstance(content, str):
            content = [{"text": content, "size": fit_size(content, 11.0, size, DISPLAY, True)}]
        text(slide, 0.86, title_y, 11.2, title_h, content, size=size,
             color=title_color or (SAND_50 if dark else INK_900), font=DISPLAY,
             bold=True, name="!!title", line_spacing=title_line)
    if rule_y:
        rect(slide, 0.86, rule_y, 1.45, 0.045,
             fill=BRASS_400 if dark else BRASS_500, name="!!rule")

    # footer
    text(slide, 0.86, 7.02, 8.0, 0.22,
         "Shram Setu 2.0   ·   Indore Sahodaya Computer Science   ·   2026",
         size=8.5, color=FOREST_400 if dark else INK_400, spc=0.6, name="!!footer")
    text(slide, 11.7, 7.0, 0.77, 0.24, footer_right or f"{i + 1:02d} / {TOTAL}",
         size=9, color=FOREST_300 if dark else INK_400, font=MONO,
         align=PP_ALIGN.RIGHT, name="!!pageno")


def panel(slide, x, y, w, h, fill=WHITE, ln=SAND_300, radius=0.14, name=None,
          bevel=1.0, shdw=True, lw=0.75):
    shp = rect(slide, x, y, w, h, fill=fill, ln=ln, lw=lw, radius=radius,
               name=name, shdw=shdw)
    if bevel:
        three_d(shp, bevel=bevel)
    return shp


def label(slide, x, y, w, txt, color=INK_400, size=8.5, align=PP_ALIGN.LEFT, name=None):
    return text(slide, x, y, w, 0.22, txt.upper(), size=size, color=color,
                bold=True, spc=1.6, align=align, name=name)


# ==========================================================================
# 01 — TITLE
# ==========================================================================
def slide_title(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, FOREST_950)

    pic = s.shapes.add_picture(IMG_HERO, Inches(-0.55), Inches(0.0), width=Inches(14.4))
    pic.name = "!!hero-photo"
    overlay = rect(s, 0, 0, W, H, fill=FOREST_950)
    gradient(overlay, [(0.0, FOREST_950, 0.985), (0.34, FOREST_950, 0.96),
                       (0.56, FOREST_900, 0.72), (0.78, FOREST_950, 0.26),
                       (1.0, FOREST_950, 0.12)], angle=0)
    overlay.name = "!!hero-overlay"
    bottom = rect(s, 0, 5.1, W, 2.4, fill=FOREST_950)
    gradient(bottom, [(0.0, FOREST_950, 0.0), (0.55, FOREST_950, 0.82),
                      (1.0, FOREST_950, 0.97)], angle=90)
    bottom.name = "!!hero-foot"

    # frame furniture (identical names to every other slide)
    glow_blob(s, 9.0, -2.9, 6.8, FOREST_300, 0.30, name="!!glow-a")
    glow_blob(s, -2.4, 3.6, 5.6, BRASS_400, 0.22, name="!!glow-b")
    rail_top, rail_h = 0.62, 6.12
    rect(s, 0.44, rail_top, 0.018, rail_h, fill=FOREST_800, name="!!rail")
    rect(s, 0.44, rail_top, 0.018, rail_h * 0.035,
         fill=BRASS_400, name="!!rail-fill")
    oval(s, 0.385, rail_top + rail_h * 0.035 - 0.055, 0.13, 0.13,
         fill=BRASS_300, name="!!rail-dot")

    rect(s, 1.16, 1.14, 0.13, 0.13, fill=BRASS_400, name="!!eyebrow-mark")
    text(s, 1.39, 1.06, 9.0, 0.28, "INDORE SAHODAYA   ·   COMPUTER SCIENCE   ·   2026",
         size=10.5, color=BRASS_300, bold=True, spc=2.0, name="!!eyebrow")

    text(s, 1.16, 1.62, 8.4, 1.35, "Shram Setu 2.0", size=54, color=WHITE,
         font=DISPLAY, bold=True, name="!!title", line_spacing=0.95)

    text(s, 1.16, 3.02, 7.2, 1.05,
         "An offline-first, transparency-centred work and wage record system "
         "for India's daily-wage workforce.",
         size=16.5, color=SAND_200, line_spacing=1.22, name="!!dek")

    rect(s, 1.16, 4.13, 1.45, 0.045, fill=BRASS_400, name="!!rule")

    text(s, 1.16, 4.32, 7.6, 0.4,
         "Every shift recorded  ·  Every wage explained  ·  Every change traceable",
         size=13, color=BRASS_200, font=DISPLAY, italic=True, name="!!tagline")

    badge(s, 1.16, 5.42, 3.42, 0.34, "LOCAL DEMO MODE  ·  PROTOTYPE",
          fill=None, color=FOREST_300, size=8.5, ln=FOREST_700, name="!!status-badge")

    meta = [
        ("PRESENTED BY", "[Student name] · Class [ ] · Roll [ ]"),
        ("GUIDE", "[Guide / Supervisor name]"),
        ("INSTITUTION", "[School name] · Indore, Madhya Pradesh"),
    ]
    for k, (head, val) in enumerate(meta):
        y = 5.92 + k * 0.42
        text(s, 1.16, y, 1.5, 0.2, head, size=7.5, color=BRASS_400, bold=True, spc=1.4)
        text(s, 2.72, y - 0.035, 6.2, 0.26, val, size=10, color=SAND_300)

    text(s, 11.55, 7.02, 1.1, 0.22, "", size=8, color=FOREST_400)
    notes(s, "Open with the sentence the whole project rests on: a wage dispute usually begins where "
             "the record ends. Shram Setu 2.0 is a working React/TypeScript prototype, not a pitch deck: "
             "everything shown today runs in a browser, offline, on synthetic data. "
             "Say the tagline once: every shift recorded, every wage explained, every change traceable.")
    morph(s)
    return s


# ==========================================================================
# 02 — AGENDA
# ==========================================================================
def slide_agenda(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=1, eyebrow="Roadmap", title="Four chapters, twelve minutes")

    items = [
        ("01", "Context", FOREST_700,
         ["The record gap", "Audit and court evidence", "Question and objectives"]),
        ("02", "Design", BRASS_600,
         ["The core idea", "Architecture & stack", "Wage engine, ledger, QR"]),
        ("03", "Build", FOREST_500,
         ["Demo scenarios", "Offline sync & privacy", "Tests, cost, honesty"]),
        ("04", "Close", CORAL,
         ["Limitations", "What is genuinely new", "Questions"]),
    ]
    x0, gap = LEFT, 0.243
    w = (CW - 3 * gap) / 4
    for k, (num, name, colour, bullets) in enumerate(items):
        x = x0 + k * (w + gap)
        g = group(s, f"!!chapter-{k + 1}")
        rect(g, x, 2.02, w, 3.5, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.15, shdw=True)
        rect(g, x, 2.02, w, 0.075, fill=colour, radius=0.02)
        text(g, x + 0.28, 2.24, w - 0.5, 0.62, num, size=34, color=colour,
             font=DISPLAY, bold=True)
        text(g, x + 0.28, 3.0, w - 0.5, 0.3, name, size=16, color=INK_900,
             font=DISPLAY, bold=True)
        rect(g, x + 0.28, 3.38, 0.55, 0.03, fill=SAND_300)
        for b, bullet in enumerate(bullets):
            text(g, x + 0.28, 3.6 + b * 0.46, w - 0.46, 0.42,
                 [{"runs": [("—  ", {"color": BRASS_500}), (bullet, {})]}],
                 size=10.5, color=INK_500, line_spacing=1.05)
        rect(g, x + 0.28, 5.02, w - 0.56, 0.008, fill=SAND_200)
        text(g, x + 0.28, 5.12, w - 0.5, 0.22,
             "SLIDES  " + ["03 — 06", "07 — 18", "19 — 23", "24 — 26"][k],
             size=7.2, color=INK_400, bold=True, spc=1.2)

    band = rect(s, LEFT, 6.02, CW, 0.68, fill=FOREST_950, radius=0.1, name="!!status-band")
    text(s, LEFT + 0.3, 6.18, 4.3, 0.36,
         [{"runs": [("STATUS  ", {"color": BRASS_300, "size": 8.5, "spc": 1.4}),
                    ("local demo mode · IndexedDB", {"color": SAND_200, "size": 10.5})]}],
         anchor=MSO_ANCHOR.MIDDLE)
    text(s, 6.1, 6.18, 6.1, 0.36,
         "React 19 · TypeScript · Vite · Web Crypto SHA-256 · QR passes",
         size=10, color=FOREST_300, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.RIGHT)

    notes(s, "Signpost only — do not read the cards. Four chapters: the problem and its evidence, the design "
             "that answers it, what was actually built and tested, and an honest close. "
             "Tell the judges you will keep the honesty section at the end and not hide it.")
    morph(s)
    return s


# ==========================================================================
# 03 — THE PROBLEM
# ==========================================================================
def slide_problem(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=1, eyebrow="The problem", title="A dispute begins where the record ends")

    text(s, LEFT, 1.98, 10.6, 0.5,
         "One shift passes through six hands. No single artefact holds all six — so every "
         "disagreement becomes one person's memory against another's.",
         size=12.5, color=INK_500, line_spacing=1.2)

    nodes = [
        ("Agreed", "rate spoken,\nnever written", FOREST_700),
        ("Recorded", "register or\nWhatsApp message", FOREST_700),
        ("Calculated", "arithmetic not\nshown to the worker", FOREST_700),
        ("Paid", "contractor's own\nnote of payment", BRASS_600),
        ("Acknowledged", "no worker receipt\nexists at all", CORAL),
        ("Disputed", "memory against\nmemory", CORAL),
    ]
    line = rect(s, 1.16, 2.98, 10.6, 0.012, fill=SAND_300, name="!!chain-line")
    for k, (name, desc, colour) in enumerate(nodes):
        cx = 1.2 + k * 2.06
        g = group(s, f"!!step-{k + 1}")
        oval(g, cx - 0.27, 2.72, 0.54, 0.54, fill=WHITE, ln=colour, lw=1.4, shdw=True)
        text(g, cx - 0.27, 2.86, 0.54, 0.26, f"{k + 1}", size=12, color=colour,
             font=DISPLAY, bold=True, align=PP_ALIGN.CENTER)
        text(g, cx - 1.0, 3.44, 2.0, 0.26, name, size=11.5, color=INK_900,
             bold=True, align=PP_ALIGN.CENTER)
        text(g, cx - 1.0, 3.74, 2.0, 0.62, desc, size=9, color=INK_500,
             align=PP_ALIGN.CENTER, line_spacing=1.1)

    gaps = [
        ("No shared record", "Worker, contractor and intermediary each keep a different version."),
        ("No visible arithmetic", "A total appears; the days, hours, deductions and reasons do not."),
        ("No preserved history", "A correction overwrites the earlier value, and the reason vanishes."),
    ]
    gw = (CW - 2 * 0.2) / 3
    for k, (head, body) in enumerate(gaps):
        x = LEFT + k * (gw + 0.2)
        g = group(s, f"!!gap-{k + 1}")
        rect(g, x, 4.92, gw, 1.28, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.12, shdw=True)
        rect(g, x, 4.92, 0.055, 1.28, fill=CORAL if k < 2 else BRASS_500, radius=0.02)
        text(g, x + 0.26, 5.06, gw - 0.45, 0.26, head, size=11.5, color=INK_900, bold=True)
        text(g, x + 0.26, 5.36, gw - 0.45, 0.72, body, size=9.5, color=INK_500, line_spacing=1.16)

    text(s, LEFT, 6.45, CW, 0.3,
         "The cost is not only unpaid money — it is the absence of evidence when a worker tries to claim it.",
         size=10, color=INK_400, italic=True)

    notes(s, "Walk the six-step chain left to right. Pause at step four: payment entered by a contractor is not "
             "the same event as a worker acknowledging receipt, and most systems merge the two. "
             "Then the three gaps — shared record, visible arithmetic, preserved history — are precisely the "
             "three things the design tries to fix.")
    morph(s)
    return s


# ==========================================================================
# 04 — EVIDENCE (dark)
# ==========================================================================
def slide_evidence(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, kind="dark", chapter=1, eyebrow="Why it matters",
          title="This is not a hypothetical gap")

    stats = [
        ("31 crore", "workers registered on e-Shram by mid-2026 — a registry, not a wage record.",
         "Ministry of Labour & Employment"),
        ("₹269 cr", "of Kerala MGNREGS wages released 16 to 90 days after muster closure.",
         "CAG Report No. 9 of 2025"),
        ("₹704 cr", "in unpaid wages reported in Jammu & Kashmir as at March 2024.",
         "CAG performance audit"),
        ("43%", "of India's wages were still paid in cash in 2021, down from 79% in 2014.",
         "ILO, 2024"),
    ]
    gap = 0.243
    w = (CW - 3 * gap) / 4
    for k, (num, body, src) in enumerate(stats):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!stat-{k + 1}")
        p = rect(g, x, 2.0, w, 2.62, fill=FOREST_900, ln=FOREST_700, lw=0.75,
                 radius=0.14, shdw=True)
        three_d(p, bevel=1.4)
        gradient(p, [(0.0, FOREST_900, 1.0), (1.0, FOREST_950, 1.0)], angle=90)
        text(g, x + 0.26, 2.24, w - 0.45, 0.62, num, size=28, color=BRASS_300,
             font=BODY, bold=True)
        rect(g, x + 0.26, 2.94, 0.5, 0.03, fill=BRASS_500)
        text(g, x + 0.26, 3.08, w - 0.45, 0.95, body, size=9.8, color=SAND_200, line_spacing=1.2)
        text(g, x + 0.26, 4.18, w - 0.45, 0.24, src, size=7.8, color=FOREST_300, italic=True)

    p = rect(s, LEFT, 4.92, CW, 1.2, fill=FOREST_900, ln=FOREST_700, lw=0.75, radius=0.14,
             name="!!case-band")
    rect(s, LEFT, 4.92, 0.055, 1.2, fill=BRASS_400, radius=0.02)
    label(s, 1.16, 5.06, 4.0, "Court record", color=BRASS_300, size=8)
    text(s, 1.16, 5.26, 6.15, 0.8,
         "Calcutta High Court, WPA 25460 of 2025 — a principal employer was directed to pay contract "
         "workers' unpaid wages under Section 21(4) of the Contract Labour Act, 1970.",
         size=10, color=SAND_200, line_spacing=1.2)
    rect(s, 7.72, 5.08, 0.012, 0.9, fill=FOREST_700)
    label(s, 8.0, 5.06, 4.0, "The design consequence", color=BRASS_300, size=8)
    text(s, 8.0, 5.26, 4.2, 0.8,
         "Contemporaneous, inspectable records of what was agreed and what was paid decide these cases. "
         "That is exactly what this prototype stores.",
         size=10, color=FOREST_200, line_spacing=1.2)

    notes(s, "Four numbers, four sources — government registry, two CAG audits and ILO research. "
             "Do not overclaim: the CAG figures show delay inside a public programme, not fraud by any named party. "
             "The court case is included because it turns on documentary evidence, which is the design argument. "
             "Judge question you should expect: 'Is this a real problem or a made-up one?' — answer with the CAG delay figures.")
    morph(s)
    return s


# ==========================================================================
# 05 — RESEARCH QUESTION + OBJECTIVES
# ==========================================================================
def slide_question(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=1, eyebrow="Research question", title="One question, seven objectives")

    q = rect(s, LEFT, 1.96, CW, 1.42, fill=SAND_100, ln=SAND_300, lw=0.75, radius=0.12,
             name="!!question-panel")
    rect(s, LEFT, 1.96, 0.075, 1.42, fill=BRASS_500, radius=0.02)
    label(s, 1.2, 2.1, 3.0, "The question", color=BRASS_600, size=8)
    text(s, 1.2, 2.34, 10.7, 0.95,
         "How can an affordable, offline-capable web system make daily-wage work records, wage "
         "calculations, payment status and disagreements easier to verify?",
         size=15, color=FOREST_900, font=DISPLAY, italic=True, line_spacing=1.18)

    label(s, LEFT, 3.55, 4.0, "Objectives", color=INK_400, size=8)
    objs = [
        ("01", "Low-cost workflow for low digital access"),
        ("02", "One deterministic wage engine, visible to all"),
        ("03", "Corrections preserve prior values and reasons"),
        ("04", "Tampering detected by explainable, rule-based checks"),
        ("05", "Offline operation inside a browser"),
        ("06", "A path to secure, cross-device approval"),
        ("07", "Repeatable evaluation on synthetic data"),
    ]
    gap = 0.2
    w = (CW - 3 * gap) / 4
    for k, (num, txt) in enumerate(objs):
        row = 0 if k < 4 else 1
        col = k if k < 4 else k - 4
        x = LEFT + col * (w + gap)
        y = 3.82 + row * 1.12
        g = group(s, f"!!objective-{k + 1}")
        rect(g, x, y, w, 0.98, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.1, shdw=True)
        text(g, x + 0.2, y + 0.13, 0.5, 0.22, num, size=8.5, color=BRASS_600,
             font=MONO, bold=True)
        text(g, x + 0.2, y + 0.36, w - 0.36, 0.55, txt, size=9.8, color=INK_700, line_spacing=1.14)

    text(s, LEFT, 6.28, CW, 0.4,
         "Scope is deliberately narrow: transparency and verifiability of records — not proving attendance, "
         "not guaranteeing payment, not deciding legal truth.",
         size=9.6, color=INK_400, italic=True)

    notes(s, "Read the research question once, slowly. The seven objectives are the marking scheme for the rest of the deck — "
             "every later slide maps back to one of them. Note the deliberate boundary sentence at the bottom: "
             "the project claims record transparency, nothing more.")
    morph(s)
    return s


# ==========================================================================
# 06 — EXISTING SYSTEMS
# ==========================================================================
def slide_compare(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=1, eyebrow="Existing systems",
          title="What exists — and what it leaves open")

    cols = [(LEFT, 2.35), (3.34, 3.06), (6.62, 2.26), (9.02, 2.22), (11.44, 1.03)]
    heads = ["System", "Primary purpose", "Wage calculation", "Correction history", "Offline"]
    for k, (x, w) in enumerate(cols):
        label(s, x + (0.02 if k == 0 else 0), 1.98, w, heads[k], color=INK_400, size=7.8,
              align=PP_ALIGN.LEFT if k < 4 else PP_ALIGN.LEFT)
    rect(s, LEFT, 2.22, CW, 0.012, fill=SAND_300)

    rows = [
        ("e-Shram", "National registry of unorganised workers", "Not applicable",
         "Not its purpose", "Needs network", False),
        ("MGNREGS", "Public rural employment and wage payment", "System-generated",
         "Social audit exists", "Partial", False),
        ("Payroll apps", "Employer payroll processing", "Varies by product",
         "Employer-controlled", "Mostly online", False),
        ("Paper / WhatsApp", "Informal record keeping", "Manual and unshown",
         "Easily altered or lost", "Fully offline", False),
        ("Shram Setu 2.0", "Work and wage reconciliation between two parties",
         "One shared engine, shown step by step", "Prior value, reason, actor, timestamp",
         "Local only", True),
    ]
    y = 2.3
    for r, (name, purpose, calc, hist, off, hi) in enumerate(rows):
        h = 0.78
        if hi:
            rect(s, LEFT - 0.1, y - 0.03, CW + 0.1, h + 0.02, fill=FOREST_50,
                 ln=FOREST_200, lw=0.75, radius=0.08, name="!!row-highlight")
            rect(s, LEFT - 0.1, y - 0.03, 0.05, h + 0.02, fill=FOREST_600, radius=0.02)
        text(s, cols[0][0], y + 0.04, cols[0][1] - 0.1, h - 0.08, name, size=11.5,
             color=FOREST_800 if hi else INK_900, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        text(s, cols[1][0], y + 0.04, cols[1][1] - 0.12, h - 0.08, purpose, size=9.4,
             color=INK_500, line_spacing=1.14, anchor=MSO_ANCHOR.MIDDLE)
        text(s, cols[2][0], y + 0.04, cols[2][1] - 0.12, h - 0.08, calc, size=9.4,
             color=FOREST_800 if hi else INK_500, line_spacing=1.14, anchor=MSO_ANCHOR.MIDDLE)
        text(s, cols[3][0], y + 0.04, cols[3][1] - 0.12, h - 0.08, hist, size=9.4,
             color=FOREST_800 if hi else INK_500, line_spacing=1.14, anchor=MSO_ANCHOR.MIDDLE)
        text(s, cols[4][0], y + 0.04, cols[4][1], h - 0.08, off, size=9.2,
             color=FOREST_700 if hi else INK_500, bold=hi, anchor=MSO_ANCHOR.MIDDLE)
        if r < len(rows) - 1:
            rect(s, LEFT, y + h + 0.02, CW, 0.01, fill=SAND_200)
        y += h + 0.06

    text(s, LEFT, 6.62, CW, 0.24,
         "Comparison of documented purpose, not assumed defects. Sources: e-Shram portal; CAG MGNREGS audits; "
         "product documentation; the project's own implementation report.",
         size=8.2, color=INK_400, italic=True)

    notes(s, "The gap is the empty middle of the table: systems either register workers, or run a public "
             "programme, or belong to the employer — none is a shared, two-party record of one shift with the "
             "arithmetic visible to both sides. The last row is the niche this project occupies. "
             "Be fair to e-Shram: it was never designed to do this.")
    morph(s)
    return s


# ==========================================================================
# 07 — CORE IDEA (dark, big type)
# ==========================================================================
def slide_core(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, kind="dark", chapter=2, eyebrow="The core idea",
          title_paras=[
              {"text": "Every shift recorded.", "size": 40},
              {"text": "Every wage explained.", "size": 40},
              {"text": "Every change traceable.", "size": 40},
          ], title_y=1.5, title_h=2.45, rule_y=None, title_line=1.06)

    annos = [
        (1.62, "A shared muster roll that worker, contractor and reviewer can all read."),
        (2.34, "The arithmetic, line by line: days, rate, overtime, deductions, balance."),
        (3.06, "Prior value, new value, reason, actor and timestamp — kept, not replaced."),
    ]
    for k, (y, txt) in enumerate(annos):
        rect(s, 8.45, y + 0.12, 0.3, 0.02, fill=BRASS_500)
        text(s, 8.9, y - 0.02, 3.55, 0.6, txt, size=10.5, color=FOREST_200, line_spacing=1.16)

    rect(s, LEFT, 4.42, CW, 0.012, fill=FOREST_800)
    text(s, LEFT, 4.62, 10.5, 0.5,
         "Transparency by mechanism, not by claim.", size=22, color=BRASS_200,
         font=DISPLAY, italic=True)

    pillars = [
        ("01", "Shared record", "One domain model, three portals"),
        ("02", "Shown arithmetic", "Deterministic, in integer paise"),
        ("03", "Preserved history", "Corrections and disputes stay visible"),
    ]
    gap = 0.2
    w = (CW - 2 * gap) / 3
    for k, (num, head, body) in enumerate(pillars):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!pillar-{k + 1}")
        rect(g, x, 5.36, w, 1.12, fill=FOREST_900, ln=FOREST_700, lw=0.75, radius=0.12)
        text(g, x + 0.24, 5.5, 0.5, 0.24, num, size=8.5, color=BRASS_300, font=MONO, bold=True)
        text(g, x + 0.24, 5.72, w - 0.4, 0.26, head, size=12.5, color=SAND_50, bold=True)
        text(g, x + 0.24, 6.02, w - 0.4, 0.3, body, size=9, color=FOREST_300)

    text(s, 11.55, 7.02, 1.1, 0.22, "", size=8, color=FOREST_400)

    notes(s, "This is the thesis slide; give it time. Three commitments map one-to-one onto three mechanisms you "
             "will show: the shared muster, the wage engine, and the correction log with the hash chain. "
             "Then the sentence that matters: transparency is implemented by mechanism, not claimed in copy.")
    morph(s)
    return s


# ==========================================================================
# 08 — THE SYSTEM
# ==========================================================================
def slide_system(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Proposed system", title="One record, three points of view")

    portals = [
        ("W", "Worker", "See and prove", FOREST_700,
         ["Attendance history and balances", "Readable wage slip per shift", "Acknowledgment and dispute claim"]),
        ("C", "Contractor", "Record and settle", BRASS_600,
         ["Site roster and muster approval", "Payments entered with method", "CSV export for the office"]),
        ("A", "Auditor", "Verify and test", CORAL,
         ["Ledger explorer, block by block", "SHA-256 verification badges", "Deliberate tamper test bench"]),
    ]
    gap = 0.225
    w = (CW - 2 * gap) / 3
    for k, (letter, name, role, colour, bullets) in enumerate(portals):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!portal-{k + 1}")
        rect(g, x, 2.0, w, 2.86, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
        rect(g, x, 2.0, w, 0.07, fill=colour, radius=0.02)
        oval(g, x + 0.28, 2.24, 0.56, 0.56, fill=colour, alpha=0.12)
        text(g, x + 0.28, 2.36, 0.56, 0.32, letter, size=15, color=colour,
             font=DISPLAY, bold=True, align=PP_ALIGN.CENTER)
        text(g, x + 0.98, 2.26, w - 1.2, 0.3, name, size=15, color=INK_900,
             font=DISPLAY, bold=True)
        text(g, x + 0.98, 2.56, w - 1.2, 0.24, role.upper(), size=8, color=INK_400, spc=1.2, bold=True)
        for b, bullet in enumerate(bullets):
            text(g, x + 0.28, 3.12 + b * 0.5, w - 0.5, 0.4,
                 [{"runs": [("—  ", {"color": colour}), (bullet, {})]}],
                 size=10, color=INK_500, line_spacing=1.1)

    band = rect(s, LEFT, 5.1, CW, 0.9, fill=FOREST_950, radius=0.12, name="!!shared-band")
    three_d(band, bevel=1.4)
    text(s, LEFT + 0.35, 5.24, CW - 0.7, 0.65,
         [{"runs": [("ONE DOMAIN MODEL   ", {"color": BRASS_300, "size": 8.5, "spc": 1.4})]},
          {"text": "The same wage engine, the same ledger and the same history render in all three portals — "
                   "no screen keeps its own copy of the arithmetic.", "size": 11.5, "color": SAND_100}],
         line_spacing=1.2)

    text(s, LEFT, 6.24, CW, 0.5,
         "Role-specific views, shared truth. Access differs; the numbers never do.",
         size=10.5, color=INK_400, italic=True)

    notes(s, "Three portals, one dataset. The important phrase is 'no screen keeps its own copy of the arithmetic' — "
             "one calculation function feeds worker, contractor and auditor. "
             "If asked how roles are separated today: in the prototype they are demo roles; production roles would be "
             "enforced by Supabase row-level security, which is planned, not built.")
    morph(s)
    return s


# ==========================================================================
# 09 — DESIGN EVOLUTION
# ==========================================================================
def slide_evolution(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Design evolution", title="From NFC cards to printed QR passes")

    # rejected path
    g1 = group(s, "!!path-rejected")
    rect(g1, LEFT, 1.98, 5.35, 4.06, fill=CORAL_50, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
    rect(g1, LEFT, 1.98, 5.35, 0.065, fill=CORAL, radius=0.02)
    badge(g1, LEFT + 0.28, 2.2, 1.7, 0.26, "EXPLORED", fill=CORAL, color=WHITE, size=7.5)
    text(g1, LEFT + 0.28, 2.58, 4.8, 0.4, "Inexpensive NFC worker cards", size=17,
         color=INK_900, font=DISPLAY, bold=True)
    reasons = [
        ("Cloning", "Writable tags can be rewritten by anyone with a reader."),
        ("Hardware", "Every site needs a reader; every lost card needs a replacement reader trip."),
        ("Cost", "Tag plus reader per site is a recurring capital cost for a small contractor."),
    ]
    for k, (head, body) in enumerate(reasons):
        y = 3.12 + k * 0.94
        text(g1, LEFT + 0.28, y, 0.34, 0.3, f"0{k + 1}", size=8.5, color=CORAL, font=MONO, bold=True)
        text(g1, LEFT + 0.66, y - 0.03, 4.4, 0.28, head, size=11.5, color=INK_900, bold=True)
        text(g1, LEFT + 0.66, y + 0.25, 4.4, 0.55, body, size=9.4, color=INK_500, line_spacing=1.16)

    text(g1, LEFT + 0.28, 5.62, 4.7, 0.24,
         "Removed from the design in v2.0 — cost and copyability.", size=8,
         color=CORAL_700, italic=True)

    # adopted path
    g2 = group(s, "!!path-adopted")
    rect(g2, 7.02, 1.98, 5.45, 4.06, fill=FOREST_50, ln=FOREST_200, lw=0.75, radius=0.14, shdw=True)
    rect(g2, 7.02, 1.98, 5.45, 0.065, fill=FOREST_700, radius=0.02)
    badge(g2, 7.3, 2.2, 1.55, 0.26, "ADOPTED", fill=FOREST_700, color=WHITE, size=7.5)
    text(g2, 7.3, 2.58, 3.4, 0.4, "Printed QR pass", size=17, color=INK_900,
         font=DISPLAY, bold=True)
    reasons2 = [
        ("A few rupees", "Ordinary paper or card stock, printed once. An estimate, not a quote."),
        ("Any camera", "No dedicated reader and no installation."),
        ("Replaceable", "Reprint, reissue, re-link in a minute."),
    ]
    for k, (head, body) in enumerate(reasons2):
        y = 3.12 + k * 0.94
        text(g2, 7.3, y, 0.34, 0.3, f"0{k + 1}", size=8.5, color=FOREST_600, font=MONO, bold=True)
        text(g2, 7.68, y - 0.03, 2.1, 0.28, head, size=11, color=INK_900, bold=True)
        text(g2, 7.68, y + 0.25, 2.1, 0.6, body, size=9, color=INK_500, line_spacing=1.14)

    pass_card(s, 10.12, 2.62, 1.92, 2.5, name="!!pass-card")

    text(g2, 7.3, 5.62, 2.6, 0.24, "Carried by every worker, reused every shift.", size=8,
         color=FOREST_600, italic=True)
    band = rect(s, LEFT, 6.2, CW, 0.5, fill=SAND_200, radius=0.08, name="!!caveat-band")
    text(s, LEFT + 0.24, 6.3, CW - 0.5, 0.3,
         [{"runs": [("CAVEAT  ", {"color": CORAL, "bold": True, "size": 8, "spc": 1.4}),
                    ("A QR code is an identifier, not an authentication device — a pass can be photographed and copied.",
                     {"color": INK_700, "size": 10})]}])

    notes(s, "The evolution is honest engineering, not fashion: NFC was investigated, priced, and dropped because "
             "a writable tag is not a secure device and readers cost money. The QR solves cost and reach and moves "
             "the security argument to authentication — which is why the QR never opens private wage data on scan.")
    morph(s)
    return s


# ==========================================================================
# 10 — ARCHITECTURE
# ==========================================================================
def slide_architecture(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Architecture", title="Five layers, one contract")

    bx, bw = 2.42, 6.3
    tag_x, tag_w = LEFT, 1.4

    def band(y, h, tagtxt, fill, ln, label_color, name):
        rect(s, LEFT, y, 1.4, 0.22, fill=None)
        text(s, tag_x, y + (h / 2) - 0.13, tag_w, 0.24, tagtxt.upper(), size=7.6,
             color=label_color, bold=True, spc=1.2, align=PP_ALIGN.LEFT)
        p = rect(s, bx, y, bw, h, fill=fill, ln=ln, lw=0.75, radius=0.1, name=name, shdw=True)
        return p

    p1 = band(2.0, 0.8, "Presentation", FOREST_950, None, INK_400, "!!layer-ui")
    text(s, bx + 0.28, 2.16, bw - 0.5, 0.48,
         "Worker portal    ·    Contractor portal    ·    Audit & tamper bench",
         size=11.5, color=SAND_100, anchor=MSO_ANCHOR.MIDDLE)

    p2 = band(2.96, 0.92, "Services", WHITE, SAND_300, INK_400, "!!layer-services")
    text(s, bx + 0.28, 3.12, bw - 0.5, 0.6,
         "Wage engine   ·   Payment states   ·   Corrections   ·   Disputes   ·   Audit chain   ·   Anomaly rules",
         size=10.4, color=INK_700, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.14)

    p3 = band(4.06, 0.62, "Repository", BRASS_100, BRASS_300, BRASS_700, "!!layer-repo")
    text(s, bx + 0.24, 4.19, bw - 0.45, 0.4,
         [{"runs": [("IDataRepository", {"font": MONO, "bold": True, "size": 11, "color": BRASS_800}),
                    ("   — one contract for workers, records, payments, disputes, audits",
                     {"size": 9.6, "color": BRASS_800})]}],
         anchor=MSO_ANCHOR.MIDDLE)

    band(4.86, 0.96, "Adapters", WHITE, SAND_300, INK_400, "!!layer-adapters")
    p4a = rect(s, bx + 0.18, 4.96, 2.9, 0.76, fill=FOREST_800, radius=0.08, name="!!adapter-local", shdw=True)
    text(s, bx + 0.4, 5.04, 2.55, 0.24, "IndexedDB adapter", size=10.2, color=SAND_50, bold=True)
    text(s, bx + 0.4, 5.3, 2.55, 0.36, "shram_setu_v2_db · local, seeded", size=8, color=FOREST_200)
    p4b = rect(s, bx + 3.2, 4.96, 2.9, 0.76, fill=WHITE, ln=FOREST_400, lw=0.9, radius=0.08,
               name="!!adapter-remote")
    from pptx.enum.dml import MSO_LINE
    p4b.line.dash_style = MSO_LINE.DASH
    text(s, bx + 3.42, 5.04, 2.5, 0.24,
         [{"runs": [("Supabase adapter", {"size": 10.2, "bold": True, "color": FOREST_700}),
                    ("  PLANNED", {"size": 6.8, "color": CORAL, "bold": True, "spc": 1.0})]}])
    text(s, bx + 3.42, 5.3, 2.5, 0.36, "Auth + PostgreSQL + row-level security", size=8,
         color=INK_500)

    p5 = rect(s, bx, 6.04, bw, 0.5, fill=WHITE, ln=FOREST_300, lw=0.9, radius=0.08,
              name="!!layer-sync")
    p5.line.dash_style = MSO_LINE.DASH
    text(s, bx + 0.24, 6.13, bw - 0.45, 0.32,
         [{"runs": [("Sync & conflict service", {"size": 9.4, "bold": True, "color": FOREST_700}),
                    ("  — outbox · retry · idempotency · conflicts preserved   (planned)",
                     {"size": 8.4, "color": INK_500})]}], anchor=MSO_ANCHOR.MIDDLE)
    text(s, tag_x, 6.18, tag_w, 0.24, "SYNC", size=7.6, color=INK_400, bold=True, spc=1.2)

    for y1, y2 in [(2.8, 2.96), (3.88, 4.06), (4.68, 4.86), (5.82, 6.04)]:
        arrow(s, bx + bw / 2, y1, bx + bw / 2, y2, color=BRASS_400, width=1.1)

    # right column — rationale
    notes_items = [
        ("React never chooses storage",
         "Components call services; services call one repository interface."),
        ("Two adapters, same interface",
         "IndexedDB today; Supabase is a swap, not a rewrite."),
        ("Rules outlive the database",
         "Wage arithmetic and hash chaining do not import a storage engine."),
    ]
    for k, (head, body) in enumerate(notes_items):
        y = 2.0 + k * 1.42
        g = group(s, f"!!arch-note-{k + 1}")
        rect(g, 9.1, y, 3.37, 1.24, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.1, shdw=True)
        text(g, 9.3, y + 0.14, 0.35, 0.24, f"0{k + 1}", size=8, color=BRASS_600, font=MONO, bold=True)
        text(g, 9.65, y + 0.12, 2.65, 0.28, head, size=10.4, color=INK_900, bold=True)
        text(g, 9.3, y + 0.5, 2.9, 0.66, body, size=9, color=INK_500, line_spacing=1.16)

    text(s, 9.1, 6.32, 3.37, 0.5, "isLocalDemoMode: true\nisSupabaseConnected: false",
         size=7.8, color=INK_400, font=MONO, line_spacing=1.1)

    notes(s, "Read the stack from the top: the three portals are presentation only. All rules live in services. "
             "Every service talks to one interface, IDataRepository, and the adapter underneath is swappable — "
             "IndexedDB today, Supabase when configured. That is why the report can say the backend is planned "
             "without the calculation engine changing. Point at the two status flags: they are shown in the UI too.")
    morph(s)
    return s


# ==========================================================================
# 11 — TECHNOLOGY STACK
# ==========================================================================
def slide_stack(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Technology", title="Six choices, each with a reason")

    tiles = [
        ("Re", "React 19", "Interface & state", "Component model, wide familiarity, lazy-loaded portals.", FOREST_700),
        ("TS", "TypeScript", "Typed application code", "Wrong field names and shapes fail at compile time, not on a site.", FOREST_600),
        ("Vi", "Vite", "Dev server & build", "Fast feedback while iterating; a small production bundle.", BRASS_600),
        ("ID", "IndexedDB", "Local structured store", "Offline, indexed, far larger than localStorage.", FOREST_500),
        ("SH", "Web Crypto", "SHA-256 digests", "Native browser API — no library, no dependency risk.", CORAL),
        ("QR", "QR encode", "Worker reference", "A printed identifier needs no reader hardware.", BRASS_500),
    ]
    gap = 0.22
    w = (CW - 2 * gap) / 3
    for k, (mono, name, role, reason, colour) in enumerate(tiles):
        row, col = divmod(k, 3)
        x = LEFT + col * (w + gap)
        y = 2.0 + row * 1.98
        g = group(s, f"!!tech-{k + 1}")
        rect(g, x, y, w, 1.78, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
        oval(g, x + 0.26, y + 0.24, 0.5, 0.5, fill=colour, alpha=0.13)
        text(g, x + 0.26, y + 0.34, 0.5, 0.3, mono, size=10, color=colour,
             font=MONO, bold=True, align=PP_ALIGN.CENTER)
        text(g, x + 0.92, y + 0.26, w - 1.12, 0.3, name, size=13.2, color=INK_900,
             font=DISPLAY, bold=True)
        text(g, x + 0.92, y + 0.57, w - 1.12, 0.22, role.upper(), size=7, color=INK_400, spc=1.1, bold=True)
        text(g, x + 0.26, y + 0.94, w - 0.5, 0.72, reason, size=9.5, color=INK_500, line_spacing=1.18)

    text(s, LEFT, 6.2, CW, 0.3,
         "Every dependency is open source and free. No licence cost, no vendor lock-in, and the whole app builds to a "
         "single offline HTML file for an exhibition desk.",
         size=9.6, color=INK_400, italic=True)

    notes(s, "One line each, then move on. The two that judges ask about: TypeScript, because data-shape mistakes in a "
             "wage ledger are expensive; and Web Crypto, because SHA-256 in the browser needs no dependency at all. "
             "Mention the single-file offline build — it is the demo trick if the venue Wi-Fi fails.")
    morph(s)
    return s


# ==========================================================================
# 12 — DATA MODEL
# ==========================================================================
def slide_data(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Data model", title="Seven entities, one work record")

    cx, cy, cw, chh = 4.72, 3.16, 3.85, 1.98
    core_box = (cx, cy, cx + cw, cy + chh)

    def edge(box, toward):
        """Point where the segment from a box's centre to `toward` leaves the box."""
        rx0, ry0, rx1, ry1 = box
        mx, my = (rx0 + rx1) / 2, (ry0 + ry1) / 2
        dx, dy = toward[0] - mx, toward[1] - my
        if dx == 0 and dy == 0:
            return mx, my
        scale = min(
            ((rx1 - mx) / dx) if dx > 0 else ((-(mx - rx0)) / dx) if dx < 0 else 1e9,
            ((ry1 - my) / dy) if dy > 0 else ((-(my - ry0)) / dy) if dy < 0 else 1e9,
        )
        return mx + dx * scale, my + dy * scale

    satellites = {
        "worker": (0.86, 2.16, 3.46, 3.34),
        "contractor": (9.84, 2.16, 12.47, 3.34),
        "payment": (0.86, 3.62, 3.46, 4.86),
        "correction": (9.84, 3.62, 12.47, 4.9),
        "dispute": (0.86, 5.04, 3.46, 6.26),
        "anomaly": (9.84, 5.04, 12.47, 6.28),
        "approval": (4.72, 5.52, 8.57, 6.38),
    }
    core_mid = (cx + cw / 2, cy + chh / 2)
    for key, rbox in satellites.items():
        rx0, ry0, rx1, ry1 = rbox
        sat_mid = ((rx0 + rx1) / 2, (ry0 + ry1) / 2)
        p_from = edge(rbox, core_mid)
        p_to = edge(core_box, sat_mid)
        inset = 0.09
        vx = p_to[0] - p_from[0]
        vy = p_to[1] - p_from[1]
        norm = (vx ** 2 + vy ** 2) ** 0.5 or 1
        arrow(s, p_from[0], p_from[1],
              p_to[0] - vx / norm * inset, p_to[1] - vy / norm * inset,
              color=SAND_400, width=0.9, name=f"!!link-{key}")

    core = rect(s, cx, cy, cw, chh, fill=FOREST_950, radius=0.12, name="!!entity-core", shdw=True)
    three_d(core, bevel=2.0)
    text(s, cx + 0.26, cy + 0.18, cw - 0.5, 0.3, "WORK RECORD", size=13, color=BRASS_300,
         font=MONO, bold=True, spc=1.2)
    text(s, cx + 0.26, cy + 0.52, cw - 0.5, 1.3,
         [{"text": "date · shift start/end · site", "size": 9.2, "color": SAND_200},
          {"text": "agreed rate · days · hours · OT", "size": 9.2, "color": SAND_200},
          {"text": "gross, deductions, net, balance", "size": 9.2, "color": SAND_200},
          {"text": "schema version · sync metadata", "size": 9.2, "color": FOREST_300}],
         line_spacing=1.34, font=MONO)

    sat = [
        ("Worker", "MP-IND-2026-MM842\ntrade · token · account link", 0.86, 2.16, 2.6, 1.18, FOREST_700),
        ("Contractor", "organisation · membership\nauthorised scope", 9.84, 2.16, 2.63, 1.18, BRASS_600),
        ("Payment", "amount · date · method\nrecorded ≠ acknowledged", 0.86, 3.62, 2.6, 1.24, FOREST_500),
        ("Correction", "prior value · new value\nreason · actor · time", 9.84, 3.62, 2.63, 1.28, CORAL),
        ("Dispute", "worker claim\ncontractor response", 0.86, 5.04, 2.6, 1.22, CORAL),
        ("AnomalyFinding", "rule id · values examined\nneutral guidance", 9.84, 5.04, 2.63, 1.24, BRASS_500),
    ]
    for k, (name, body, x, y, w, h, colour) in enumerate(sat):
        g = group(s, f"!!entity-{k + 1}")
        rect(g, x, y, w, h, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.1, shdw=True)
        rect(g, x, y, 0.045, h, fill=colour, radius=0.02)
        text(g, x + 0.2, y + 0.13, w - 0.34, 0.24, name, size=10.5, color=INK_900, bold=True)
        text(g, x + 0.2, y + 0.42, w - 0.34, 0.68, body, size=8.4, color=INK_500,
             line_spacing=1.3, font=MONO)

    g = group(s, "!!entity-7")
    rect(g, 4.72, 5.52, 3.85, 0.86, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.1, shdw=True)
    rect(g, 4.72, 5.52, 0.045, 0.86, fill=INK_400, radius=0.02)
    text(g, 4.92, 5.63, 3.5, 0.24, "ApprovalRequest", size=10.5, color=INK_900, bold=True)
    text(g, 4.92, 5.9, 3.5, 0.4, "simulated locally today; cross-device after Supabase", size=8.4,
         color=INK_500, font=MONO)

    notes(s, "Do not read every field. The point is that the work record is the hub, and payment, correction, dispute "
             "and anomaly all hang off it while keeping their own history. One design decision worth saying aloud: "
             "a correction is its own entity, not an edit — which is why the original value can never disappear.")
    morph(s)
    return s


# ==========================================================================
# 13 — WAGE ENGINE
# ==========================================================================
def slide_wage(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Wage engine", title="The arithmetic, entirely in the open")

    p = rect(s, LEFT, 1.96, 6.62, 4.42, fill=FOREST_950, radius=0.14, name="!!calc-panel", shdw=True)
    three_d(p, bevel=1.6)
    text(s, LEFT + 0.3, 2.12, 4.4, 0.24,
         "CALCULATE RECORD BREAKDOWN", size=8, color=FOREST_300, font=MONO, bold=True, spc=1.4)
    rect(s, LEFT + 0.3, 2.4, 6.0, 0.01, fill=FOREST_700)

    rows = [
        ("agreed rate", "₹650.00 / day", SAND_200, False),
        ("days recorded", "4  (32 h)", SAND_200, False),
        ("base wages", "4 × 650.00 = ₹2,600.00", SAND_50, True),
        ("overtime", "0 h × 0 = ₹0.00", FOREST_200, False),
        ("allowances", "₹0.00", FOREST_200, False),
        ("deductions", "₹0.00  (each with a reason)", FOREST_200, False),
        ("wages due", "₹2,600.00", BRASS_200, True),
        ("payment recorded", "− ₹1,300.00", SAND_200, False),
        ("outstanding balance", "₹1,300.00", BRASS_300, True),
    ]
    y = 2.52
    for k, (lbl, val, colour, strong) in enumerate(rows):
        text(s, LEFT + 0.3, y, 2.35, 0.26, lbl, size=9.6, color=FOREST_300, font=MONO)
        text(s, LEFT + 2.6, y, 3.85, 0.26, val, size=9.8, color=colour, font=MONO,
             bold=strong, align=PP_ALIGN.RIGHT)
        if lbl in ("wages due", "outstanding balance"):
            rect(s, LEFT + 0.3, y - 0.06, 6.15, 0.008, fill=BRASS_700)
        y += 0.37

    text(s, LEFT + 0.3, 5.92, 6.0, 0.36,
         "(Days × Rate) + OT + Allowances − Deductions", size=10.5, color=BRASS_200,
         font=MONO, italic=True)

    # inspector card
    ix, iw = 7.72, 4.75
    card = rect(s, ix, 1.96, iw, 4.42, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14,
                name="!!inspector", shdw=True)
    three_d(card, bevel=1.2)
    rect(s, ix, 1.96, iw, 0.6, fill=SAND_100, radius=0.14)
    rect(s, ix, 2.42, iw, 0.14, fill=SAND_100)
    text(s, ix + 0.24, 2.1, iw - 0.5, 0.3, "TRANSPARENT WAGE LEDGER", size=8.6,
         color=FOREST_700, bold=True, spc=1.3)
    text(s, ix + 0.24, 2.36, iw - 0.5, 0.24, "inspector · Ramesh Verma · site 04", size=8.4,
         color=INK_400)

    insp = [("Agreed rate", "₹650.00"), ("Days", "4"), ("Hours", "32.0"),
            ("Wages due", "₹2,600.00"), ("Payments recorded", "₹1,300.00"),
            ("Outstanding", "₹1,300.00")]
    y = 2.72
    for k, (lbl, val) in enumerate(insp):
        text(s, ix + 0.24, y, 2.4, 0.24, lbl, size=9.6, color=INK_500)
        text(s, ix + 2.5, y, iw - 2.75, 0.24, val, size=9.8, color=INK_900, font=MONO,
             bold=k >= 3, align=PP_ALIGN.RIGHT)
        if k < len(insp) - 1:
            rect(s, ix + 0.24, y + 0.34, iw - 0.48, 0.008, fill=SAND_200)
        y += 0.42

    badge(s, ix + 0.24, 5.32, 4.25, 0.34,
          "PARTIALLY PAID · ACKNOWLEDGEMENT PENDING", fill=BRASS_100, color=BRASS_800,
          size=7.6, ln=BRASS_300, radius=0.2)
    text(s, ix + 0.24, 5.8, iw - 0.5, 0.5,
         "Integer paise. Deterministic. The same function renders this card in every portal and in the inspector.",
         size=8.8, color=INK_400, line_spacing=1.16)

    notes(s, "This is the slide judges remember. Walk the arithmetic out loud: four days at ₹650 is ₹2,600; "
             "₹1,300 was recorded as paid; the balance is ₹1,300. Then point out what is visible that other systems hide — "
             "the rate, the hours, the empty overtime line, the deduction line, and a payment that is recorded but not "
             "yet acknowledged. All maths in integer paise, so no floating-point drift.")
    morph(s)
    return s


# ==========================================================================
# 14 — PAYMENT STATES
# ==========================================================================
def slide_payments(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Payment states", title="Recorded is not the same as received")

    states = [
        ("Unpaid", "nothing entered", SAND_200, INK_700),
        ("Partially paid", "some amount entered", BRASS_100, BRASS_800),
        ("Recorded as paid", "contractor's entry", BRASS_300, BRASS_800),
        ("Acknowledged", "worker confirms", FOREST_100, FOREST_800),
        ("Disputed", "either party objects", CORAL_100, CORAL_700),
    ]
    gap = 0.16
    w = (CW - 4 * gap) / 5
    for k, (name, sub, fill, colour) in enumerate(states):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!state-{k + 1}")
        rect(g, x, 2.0, w, 0.66, fill=fill, ln=colour, lw=0.8, radius=0.1, shdw=True)
        text(g, x + 0.12, 2.12, w - 0.24, 0.42, name, size=10.5, color=colour, bold=True,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(g, x + 0.08, 2.76, w - 0.16, 0.24, sub, size=8.2, color=INK_400,
             align=PP_ALIGN.CENTER)
        if k < 4:
            arrow(s, x + w + 0.01, 2.33, x + w + gap - 0.01, 2.33, color=SAND_400, width=1.0)

    p = rect(s, LEFT, 3.28, CW, 1.05, fill=FOREST_950, radius=0.1, name="!!neq-band", shdw=True)
    text(s, LEFT + 0.34, 3.44, CW - 0.7, 0.72,
         [{"runs": [("PAYMENT RECORDED", {"color": BRASS_300, "bold": True, "size": 12}),
                    ("  ≠  ", {"color": SAND_50, "size": 16, "bold": True}),
                    ("PAYMENT RECEIVED", {"color": FOREST_200, "bold": True, "size": 12})]},
          {"text": "Two separate facts, two separate actors, two separate timestamps — and the ledger shows both.",
           "size": 10, "color": SAND_300}],
         anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.2)

    cols = [
        ("The contractor records", "Amount, date and method entered against the work record. It proves an entry was "
                                   "made — not that cash or a transfer reached the worker.", BRASS_600),
        ("The worker acknowledges", "The worker confirms receipt on their own device. Until then the record reads "
                                    "\"unpaid (acknowledgement pending)\" — deliberately.", FOREST_600),
        ("The system keeps both", "No state is inferred, merged or auto-completed. A gap between the two is a fact the "
                                  "interface displays, not a glitch it hides.", CORAL),
    ]
    cw = (CW - 2 * 0.2) / 3
    for k, (head, body, colour) in enumerate(cols):
        x = LEFT + k * (cw + 0.2)
        g = group(s, f"!!payment-note-{k + 1}")
        rect(g, x, 4.58, cw, 1.5, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.12, shdw=True)
        rect(g, x + 0.24, 4.74, 0.36, 0.03, fill=colour)
        text(g, x + 0.24, 4.86, cw - 0.48, 0.26, head, size=10.6, color=INK_900, bold=True)
        text(g, x + 0.24, 5.16, cw - 0.48, 0.82, body, size=9.2, color=INK_500, line_spacing=1.18)

    text(s, LEFT, 6.28, CW, 0.4,
         "This single separation removes the most common silent disagreement in daily-wage work: \"I paid you\" "
         "against \"I never got it\".",
         size=9.8, color=INK_400, italic=True)

    notes(s, "Explain the lifecycle as five explicit states rather than a paid/unpaid boolean. The middle state is the "
             "important one: a contractor entry is evidence of an entry, nothing more. If a judge asks who can mark a "
             "record acknowledged, the answer is: only the worker's own authenticated session — simulated in demo mode.")
    morph(s)
    return s


# ==========================================================================
# 15 — CORRECTIONS & DISPUTES
# ==========================================================================
def slide_corrections(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Corrections & disputes",
          title="Nothing is silently overwritten")

    # RULE-03 panel
    g = group(s, "!!rule03")
    rect(g, LEFT, 1.98, 5.86, 3.72, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
    rect(g, LEFT, 1.98, 5.86, 0.42, fill=CORAL_100, radius=0.14)
    rect(g, LEFT, 2.26, 5.86, 0.14, fill=CORAL_100)
    badge(g, LEFT + 0.2, 2.05, 0.9, 0.26, "RULE-03", fill=CORAL, color=WHITE, size=7, radius=0.2)
    text(g, LEFT + 1.2, 2.08, 4.4, 0.24, "Retroactive record modification", size=9.4,
         color=CORAL_700, bold=True)

    label(g, LEFT + 0.26, 2.52, 2.0, "Original rate", color=INK_400, size=7.5)
    label(g, LEFT + 3.0, 2.52, 2.0, "Current rate", color=INK_400, size=7.5)
    text(g, LEFT + 0.26, 2.72, 2.2, 0.42, "₹550", size=21, color=INK_400, font=DISPLAY, bold=True)
    text(g, LEFT + 3.0, 2.72, 2.2, 0.42, "₹650", size=21, color=CORAL, font=DISPLAY, bold=True)
    arrow(s, LEFT + 2.35, 2.92, LEFT + 2.92, 2.92, color=SAND_400, width=1.2)

    fields = [("Reason given", "\"Corrected from helper rate to mason rate\""),
              ("Actor / role", "Contractor · site supervisor"),
              ("Timestamp", "12 Oct 2026, 19:42"),
              ("Tamper flag", "None — modification is disclosed")]
    y = 3.32
    for lbl, val in fields:
        text(g, LEFT + 0.26, y, 1.5, 0.24, lbl, size=8.8, color=INK_400)
        text(g, LEFT + 1.7, y - 0.01, 3.95, 0.26, val, size=9.2, color=INK_900, bold=lbl == "Tamper flag")
        y += 0.42
    text(g, LEFT + 0.26, 5.02, 5.35, 0.6,
         "The earlier value is preserved in the audit trail. The system surfaces the change; it does not accuse anyone "
         "of anything.", size=8.8, color=INK_500, line_spacing=1.16)

    # dispute panel
    g2 = group(s, "!!dispute-card")
    rect(g2, 6.86, 1.98, 5.61, 3.72, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
    rect(g2, 6.86, 1.98, 5.61, 0.42, fill=FOREST_50, radius=0.14)
    rect(g2, 6.86, 2.26, 5.61, 0.14, fill=FOREST_50)
    rect(g2, 6.86, 1.98, 5.61, 0.06, fill=FOREST_700, radius=0.02)
    badge(g2, 7.06, 2.05, 1.0, 0.26, "DISPUTE", fill=FOREST_700, color=WHITE, size=7, radius=0.2)
    text(g2, 8.16, 2.08, 4.0, 0.24, "Open · D-2026-014", size=9.4, color=FOREST_700, bold=True)

    label(g2, 7.06, 2.52, 2.5, "Worker's claim", color=INK_400, size=7.5)
    text(g2, 7.06, 2.74, 2.5, 1.0,
         "\"I worked four days. Only half the wages reached me.\"", size=9.6, color=INK_900,
         italic=True, line_spacing=1.2)
    rect(g2, 9.72, 2.56, 0.012, 1.9, fill=SAND_300)
    label(g2, 9.94, 2.52, 2.5, "Contractor's response", color=INK_400, size=7.5)
    text(g2, 9.94, 2.74, 2.35, 1.0,
         "\"₹1,300 was paid in cash on 10 October; the balance is pending.\"", size=9.6,
         color=INK_900, italic=True, line_spacing=1.2)
    text(g2, 7.06, 3.6, 2.6, 0.2, "ATTACHED EVIDENCE", size=6.8, color=INK_400, bold=True, spc=1.1)
    for k, att in enumerate(["site photo ×2", "WhatsApp export", "rate card"]):
        x = 7.06 + k * 1.68
        rect(g2, x, 3.84, 1.54, 0.3, fill=SAND_100, ln=SAND_300, lw=0.5, radius=0.16)
        text(g2, x, 3.9, 1.54, 0.2, att, size=7.4, color=INK_500, align=PP_ALIGN.CENTER)
    rect(g2, 7.06, 4.36, 5.2, 0.01, fill=SAND_200)
    text(g2, 7.06, 4.54, 5.2, 0.9,
         "Both statements are stored verbatim, with attachments and the correction history, until the parties "
         "resolve it outside the system. The software does not declare a winner.",
         size=9.2, color=INK_500, line_spacing=1.18)

    # principles
    chips = [("Never overwrite", "prior value kept"), ("Always a reason", "free-text, attributed"),
             ("Keep the status", "survives edits and reversals")]
    cw = (CW - 2 * 0.2) / 3
    for k, (head, body) in enumerate(chips):
        x = LEFT + k * (cw + 0.2)
        g3 = group(s, f"!!principle-{k + 1}")
        rect(g3, x, 5.94, cw, 0.5, fill=SAND_100, ln=SAND_300, lw=0.6, radius=0.1)
        text(g3, x + 0.22, 6.08, cw - 0.44, 0.24,
             [{"runs": [(head, {"bold": True, "color": INK_900}), ("  —  " + body, {"color": INK_500})]}],
             size=9.2)

    notes(s, "Two behaviours, one principle. RULE-03 shows a rate change from ₹550to ₹650 with the reason, the actor, "
             "the timestamp and no accusation. The dispute card keeps both statements verbatim. "
             "The design position: software should make disagreement legible, not adjudicate it.")
    morph(s)
    return s


# ==========================================================================
# 16 — HASH CHAIN (dark)
# ==========================================================================
def slide_chain(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, kind="dark", chapter=2, eyebrow="Integrity",
          title="Every block carries the one before it")

    blocks = [
        ("#01", "genesis · no predecessor", "2026-10-01 · ₹650 · 8h · ₹650", "3f9a…d210"),
        ("#02", "prev 3f9a…d210", "2026-10-02 · ₹650 · 8h · ₹650", "71be…04fa"),
        ("#03", "prev 71be…04fa", "2026-10-05 · ₹650 · 8h · ₹650", "c4d8…9e31"),
        ("#04", "prev c4d8…9e31", "2026-10-06 · ₹650 · 8h · ₹650", "8a02…f7c5"),
        ("#05", "prev 8a02…f7c5", "2026-10-09 · ₹650 · 8h · ₹650", "e19d…2b76"),
    ]
    for k, (num, prev, data, h) in enumerate(blocks):
        x = 0.95 + k * 0.4
        y = 2.0 + k * 0.79
        g = group(s, f"!!blk-{k + 1}")
        b = rect(g, x, y, 4.35, 0.92, fill=FOREST_900, ln=FOREST_600, lw=0.8, radius=0.09, shdw=True)
        three_d(b, bevel=1.4, rot_y=6)
        rect(g, x, y, 0.05, 0.92, fill=BRASS_400, radius=0.02)
        text(g, x + 0.2, y + 0.1, 0.55, 0.22, num, size=9, color=BRASS_300, font=MONO, bold=True)
        text(g, x + 0.72, y + 0.1, 2.4, 0.22, prev, size=7.6, color=FOREST_300, font=MONO)
        badge(g, x + 3.28, y + 0.09, 0.92, 0.22, "VALID", fill=FOREST_600, color=WHITE, size=6.4, radius=0.24)
        text(g, x + 0.2, y + 0.38, 2.9, 0.22, data, size=7.6, color=SAND_200, font=MONO)
        text(g, x + 0.2, y + 0.64, 2.7, 0.22, "sha256  " + h, size=7.4, color=BRASS_200, font=MONO)
        if k:
            px = 0.95 + (k - 1) * 0.4
            py = 2.0 + (k - 1) * 0.79
            arrow(s, px + 2.2, py + 0.94, x + 1.9, y - 0.02, color=FOREST_500, width=1.0)

    badge(s, 0.95, 6.26, 2.05, 0.26, "+ 3 MORE BLOCKS · 8 TOTAL", fill=None, color=FOREST_300,
          size=6.6, ln=FOREST_600, radius=0.24)

    # right panel
    rx, rw = 7.35, 5.12
    p = rect(s, rx, 1.96, rw, 4.55, fill=FOREST_900, ln=FOREST_700, lw=0.75, radius=0.14,
             name="!!canonical-panel", shdw=True)
    label(s, rx + 0.26, 2.1, 4.0, "What gets hashed", color=BRASS_300, size=7.6)
    fields = ["prev_hash", "date", "agreed_rate", "duration", "earned_wages"]
    text(s, rx + 0.26, 2.34, rw - 0.5, 0.9,
         " + ".join(fields) + "   →   SHA-256", size=9.6, color=SAND_100, font=MONO,
         line_spacing=1.5)

    rect(s, rx + 0.26, 3.16, rw - 0.52, 0.01, fill=FOREST_700)
    label(s, rx + 0.26, 3.26, 4.0, "Verification outcomes", color=BRASS_300, size=7.6)
    outs = [("Integrity check passed", FOREST_300),
            ("Record modified — hash mismatch", CORAL_100),
            ("Linkage broken or history incomplete", BRASS_200),
            ("Verification could not be completed", SAND_300)]
    for k, (txt, colour) in enumerate(outs):
        y = 3.5 + k * 0.34
        oval(s, rx + 0.28, y + 0.07, 0.09, 0.09, fill=colour)
        text(s, rx + 0.5, y, rw - 0.8, 0.26, txt, size=9.6, color=SAND_200)

    text(s, rx + 0.26, 4.94, rw - 0.52, 1.3,
         [{"text": "What it does not claim", "size": 8.2, "color": CORAL_100, "bold": True, "spc": 1.2},
          {"text": "A valid hash does not prove the original entry was true, and a local chain can be recomputed by "
                   "anyone who controls the device. This is tamper-evident, not tamper-proof — and not a blockchain.",
           "size": 8.8, "color": FOREST_200}],
         line_spacing=1.2)

    notes(s, "Explain the mechanic in one sentence: each block hashes the previous block's hash together with the date, "
             "rate, duration and earned wages, so changing any past record breaks every link after it. "
             "Then immediately state the limit, before a judge does: a local chain is tamper-evident, not tamper-proof, "
             "and it is definitely not a blockchain. That honesty scores better than the overclaim.")
    morph(s)
    return s


# ==========================================================================
# 17 — ANOMALY RULES
# ==========================================================================
def slide_rules(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="Anomaly detection",
          title="Seven rules, zero black boxes")

    rules = [
        ("RULE-01", "Duplicate date", "Two entries for the same worker on one calendar date.", "Flag for review", FOREST_700),
        ("RULE-02", "Shift too long", "Continuous duration above a configurable threshold, e.g. 12 h.", "Flag for review", FOREST_700),
        ("RULE-03", "Retroactive edit", "Record modified after initial registration.", "Prior value preserved", CORAL),
        ("RULE-04", "Reconciliation gap", "Wages due, payments recorded and acknowledgements disagree.", "Highlight mismatch", BRASS_600),
        ("RULE-05", "Silent deduction", "A deduction recorded without a stated reason.", "Flag unexplained", BRASS_600),
        ("RULE-06", "Overdue balance", "Outstanding amount older than the configured window.", "Follow-up, not a deadline", FOREST_500),
        ("RULE-07", "Below benchmark", "Agreed rate under a configurable statutory reference.", "Alert only — verify notice", FOREST_500),
    ]
    gap = 0.2
    w = (CW - 3 * gap) / 4
    for k, (rid, head, body, out, colour) in enumerate(rules):
        row, col = divmod(k, 4)
        x = LEFT + col * (w + gap)
        y = 2.0 + row * 2.02
        g = group(s, f"!!rule-{k + 1}")
        rect(g, x, y, w, 1.84, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.12, shdw=True)
        rect(g, x, y, 0.045, 1.84, fill=colour, radius=0.02)
        text(g, x + 0.22, y + 0.16, 1.4, 0.22, rid, size=7.8, color=colour, font=MONO, bold=True, spc=0.8)
        text(g, x + 0.22, y + 0.42, w - 0.4, 0.24, head, size=11, color=INK_900, bold=True)
        text(g, x + 0.22, y + 0.72, w - 0.4, 0.66, body, size=8.6, color=INK_500, line_spacing=1.16)
        rect(g, x + 0.22, y + 1.42, w - 0.44, 0.008, fill=SAND_200)
        text(g, x + 0.22, y + 1.5, w - 0.4, 0.24, out, size=8, color=colour, bold=True)

    # eighth cell: how a finding explains itself
    x = LEFT + 3 * (w + gap)
    y = 2.0 + 2.02
    g = group(s, "!!rule-explainer")
    rect(g, x, y, w, 1.84, fill=FOREST_950, ln=FOREST_700, lw=0.75, radius=0.12, shdw=True)
    text(g, x + 0.22, y + 0.16, w - 0.4, 0.22, "EVERY FINDING SHOWS", size=7.4,
         color=BRASS_300, bold=True, spc=1.1)
    for b, line in enumerate(["the rule that fired", "the exact values compared",
                              "the threshold in force", "guidance, not a verdict"]):
        oval(g, x + 0.24, y + 0.55 + b * 0.31, 0.07, 0.07, fill=BRASS_400)
        text(g, x + 0.42, y + 0.48 + b * 0.31, w - 0.6, 0.24, line, size=8.4, color=FOREST_200)

    band = rect(s, LEFT, 6.16, CW, 0.52, fill=SAND_200, radius=0.08, name="!!rules-band")
    text(s, LEFT + 0.24, 6.26, CW - 0.5, 0.32,
         [{"runs": [("DETERMINISTIC, NOT AI  ", {"color": CORAL, "bold": True, "size": 8, "spc": 1.4}),
                    ("Every check compares stored values against a stated threshold. No model, no score, no accusation — "
                     "facts for joint resolution.", {"color": INK_700, "size": 9.6})]}])

    notes(s, "Seven cheap, explainable rules beat a black box here, because each one can be argued with. "
             "Point at RULE-03 and RULE-05 as the two that appear in the live demo, and RULE-07 as the one that must "
             "carry a warning: benchmark values are unverified prototype references, not legal minima.")
    morph(s)
    return s


# ==========================================================================
# 18 — QR & SECURITY MODEL
# ==========================================================================
def slide_qr(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=2, eyebrow="QR & security", title="Identify, authenticate, authorise")

    pass_card(s, LEFT + 0.15, 1.96, 2.42, 3.5, name="!!pass-card")
    text(s, LEFT + 0.15, 5.56, 2.5, 0.8,
         "Opaque token only: no name, no wage history, no address encoded in the printed code.",
         size=8.6, color=INK_500, line_spacing=1.18)

    steps = [
        ("Identify", "The pass names a worker reference — nothing more.",
         "QR + opaque token · public verify page", FOREST_700),
        ("Authenticate", "Prove the person acting is that worker.",
         "Account sign-in (Supabase, planned)", BRASS_600),
        ("Authorise", "Decide what that person may read or change.",
         "Row-level policies, role-scoped actions", CORAL),
    ]
    for k, (head, body, mech, colour) in enumerate(steps):
        y = 1.96 + k * 1.42
        g = group(s, f"!!security-{k + 1}")
        rect(g, 3.6, y, 5.35, 1.22, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.12, shdw=True)
        rect(g, 3.6, y, 0.05, 1.22, fill=colour, radius=0.02)
        text(g, 3.82, y + 0.16, 2.0, 0.24, f"0{k + 1}", size=8, color=colour, font=MONO, bold=True)
        text(g, 4.2, y + 0.13, 4.5, 0.28, head, size=12.5, color=INK_900, bold=True)
        text(g, 3.82, y + 0.46, 4.85, 0.3, body, size=9.4, color=INK_500)
        text(g, 3.82, y + 0.82, 4.85, 0.28, mech, size=8.2, color=colour, font=MONO)

    p = rect(s, 9.25, 1.96, 3.22, 4.28, fill=FOREST_950, radius=0.12, name="!!limits-panel", shdw=True)
    text(s, 9.47, 2.12, 2.8, 0.24, "HONEST LIMITS", size=7.8, color=BRASS_300, bold=True, spc=1.4)
    limits = [
        "A pass can be photographed, copied and reprinted.",
        "A scan never opens private wage data by itself.",
        "A scan is not proof that a person was on site.",
        "Production authentication is not built yet.",
    ]
    for k, lim in enumerate(limits):
        y = 2.5 + k * 0.88
        oval(s, 9.5, y + 0.07, 0.08, 0.08, fill=CORAL_100)
        text(s, 9.68, y, 2.6, 0.8, lim, size=9, color=FOREST_200, line_spacing=1.16)

    text(s, 3.6, 6.28, 8.87, 0.4,
         "Planned workflow: contractor scans → a pending request is created → the worker approves it in their own "
         "signed-in session on their own device.",
         size=9.2, color=INK_400, italic=True)

    notes(s, "The triad is the sentence to say: identification, authentication and authorisation are three different "
             "questions, and most QR-based projects quietly collapse them into one. The pass identifies; it never "
             "authorises. Cross-device approval is designed and simulated, not shipped.")
    morph(s)
    return s


# ==========================================================================
# 19 — DEMO & TEST BENCH
# ==========================================================================
def slide_demo(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=3, eyebrow="Demonstration",
          title="Twelve scenarios a judge can test")

    scenarios = [
        "Partially paid record", "Fully paid and acknowledged", "Contractor entry pending worker ack",
        "Unpaid record", "Dispute with both statements", "Correction with preserved original",
        "Legitimate multi-day record", "Duplicate shift (RULE-01)", "Deduction with no reason (RULE-05)",
        "Deliberately corrupted hash", "Clean baseline verification", "Reset to seeded baseline",
    ]
    colw = 2.72
    for k, sc in enumerate(scenarios):
        col, row = divmod(k, 6)
        x = LEFT + col * (colw + 0.18)
        y = 2.0 + row * 0.62
        g = group(s, f"!!scenario-{k + 1}")
        rect(g, x, y, colw, 0.5, fill=WHITE, ln=SAND_300, lw=0.6, radius=0.08)
        oval(g, x + 0.14, y + 0.19, 0.1, 0.1,
             fill=CORAL if k in (7, 8, 9) else FOREST_500)
        text(g, x + 0.34, y + 0.12, colw - 0.44, 0.28, sc, size=8.6, color=INK_700)

    # console panel
    cx, cw_, cy, chh = 6.62, 5.85, 1.96, 4.42
    p = rect(s, cx, cy, cw_, chh, fill=FOREST_950, radius=0.12, name="!!console", shdw=True)
    three_d(p, bevel=1.2)
    rect(s, cx, cy, cw_, 0.42, fill=FOREST_900, radius=0.12)
    rect(s, cx, cy + 0.28, cw_, 0.14, fill=FOREST_900)
    for k, col in enumerate([CORAL, BRASS_400, FOREST_400]):
        oval(s, cx + 0.22 + k * 0.19, cy + 0.16, 0.1, 0.1, fill=col, alpha=0.9)
    text(s, cx + 0.9, cy + 0.11, 4.6, 0.24, "audit & tamper test — ledger explorer", size=8,
         color=FOREST_300, font=MONO)

    rows = [
        ("BLOCK #08", "a91e…7c42", "VALID SHA-256", FOREST_500),
        ("BLOCK #07", "4bd2…aa10", "VALID SHA-256", FOREST_500),
        ("BLOCK #06", "e77f…19b8", "VALID SHA-256", FOREST_500),
        ("BLOCK #05", "0c33…6d41", "HASH MISMATCH", CORAL),
        ("BLOCK #04", "9f5b…20ea", "LINKAGE BROKEN", CORAL),
    ]
    y = 2.58
    for num, hsh, status, colour in rows:
        text(s, cx + 0.28, y, 1.2, 0.24, num, size=8.2, color=BRASS_300, font=MONO, bold=True)
        text(s, cx + 1.5, y, 1.5, 0.24, hsh, size=8.2, color=SAND_300, font=MONO)
        badge(s, cx + 3.1, y - 0.05, 2.3, 0.28, status, fill=colour, color=WHITE, size=7, radius=0.2)
        rect(s, cx + 0.28, y + 0.34, cw_ - 0.56, 0.008, fill=FOREST_800)
        y += 0.56

    text(s, cx + 0.28, 5.5, cw_ - 0.56, 0.7,
         "> rate changed 650 → 900 after registration\n> recompute → block #05 fails, every link after it fails",
         size=7.8, color=FOREST_300, font=MONO, line_spacing=1.35)
    text(s, cx + 0.28, 6.1, cw_ - 0.56, 0.24,
         "resetToBaseline() restores the 8 seeded blocks", size=7.4, color=INK_400, font=MONO)

    notes(s, "This is the live-demo map. Twelve seeded states, all synthetic. The console on the right is the tamper "
             "bench: change a rate after the fact and the chain breaks visually, in front of the judge. "
             "Say the reset path out loud — resetToBaseline() — so they know the demo is reproducible after a failed attempt.")
    morph(s)
    return s


# ==========================================================================
# 20 — OFFLINE FIRST / SYNC
# ==========================================================================
def slide_offline(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=3, eyebrow="Offline & sync",
          title="Local first, shared when connected")

    steps = [
        ("Capture locally", "Attendance, rates and payments are written to IndexedDB before anything else. A site "
                            "without signal keeps recording.", "TODAY", FOREST_700),
        ("Queue the change", "Every write becomes an outbox operation with an idempotency key, so a retry cannot "
                             "post the same payment twice.", "PLANNED", BRASS_600),
        ("Sync when online", "Supabase Auth, PostgreSQL and row-level security accept the operation and return the "
                             "server timestamp.", "PLANNED", BRASS_600),
        ("Preserve conflict", "If two versions disagree, both are kept for review. A wage is never silently "
                              "overwritten by a sync.", "PLANNED", CORAL),
    ]
    gap = 0.2
    w = (CW - 3 * gap) / 4
    for k, (head, body, tag, colour) in enumerate(steps):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!sync-{k + 1}")
        rect(g, x, 2.0, w, 2.0, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.12, shdw=True)
        rect(g, x, 2.0, w, 0.055, fill=colour, radius=0.02)
        badge(g, x + 0.22, 2.14, 0.92, 0.24, tag, fill=colour if tag == "TODAY" else SAND_200,
              color=WHITE if tag == "TODAY" else INK_500, size=6.6, radius=0.2)
        text(g, x + 0.22, 2.5, w - 0.42, 0.28, head, size=11.6, color=INK_900, bold=True)
        text(g, x + 0.22, 2.84, w - 0.42, 1.0, body, size=8.8, color=INK_500, line_spacing=1.18)
        if k < 3:
            arrow(s, x + w + 0.015, 3.0, x + w + gap - 0.015, 3.0, color=SAND_400, width=1.0)

    p = rect(s, LEFT, 4.3, CW, 1.08, fill=FOREST_950, radius=0.1, name="!!why-band", shdw=True)
    text(s, LEFT + 0.34, 4.44, CW - 0.7, 0.8,
         [{"runs": [("WHY A LOCAL DATABASE IS NOT A BACKEND   ", {"color": BRASS_300, "bold": True,
                                                                 "size": 8, "spc": 1.4})]},
          {"text": "IndexedDB belongs to one browser on one device. It can be cleared, inspected or edited by "
                   "whoever holds that device — so sharing a record between a worker's phone and a contractor's "
                   "laptop needs real authentication and a server. That layer is designed, not shipped.",
           "size": 9.6, "color": SAND_200}],
         line_spacing=1.2)

    flags = [("isLocalDemoMode", "true"), ("isSupabaseConnected", "false"), ("storage engine", "IndexedDB v1")]
    for k, (k2, v) in enumerate(flags):
        x = LEFT + k * 3.9
        text(s, x, 5.62, 3.7, 0.24, f"{k2} : {v}", size=8.6, color=FOREST_700, font=MONO, bold=True)
    rect(s, LEFT, 5.96, CW, 0.012, fill=SAND_300)
    text(s, LEFT, 6.08, CW, 0.6,
         "The repository interface is what makes this a plan rather than a rewrite: business rules already call "
         "IDataRepository, not a storage engine.",
         size=9.4, color=INK_400, italic=True, line_spacing=1.16)

    notes(s, "Be precise about the word offline. The prototype records offline because everything lives in the browser. "
             "Sharing across devices needs the planned Supabase layer plus an outbox; that is designed and simulated, "
             "not implemented. The three flags on the slide are printed by the app itself — no hiding the status.")
    morph(s)
    return s


# ==========================================================================
# 21 — SECURITY & PRIVACY
# ==========================================================================
def slide_privacy(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=3, eyebrow="Security & privacy",
          title="Privacy by separation, not by promise")

    cards = [
        ("Minimum data", "Name, trade and a token. No Aadhaar number, no bank details, no caste or address fields in "
                         "the prototype at all.", FOREST_700),
        ("Opaque token", "The printed QR carries a reference that resolves to a record — not the worker's name or "
                         "wage history.", FOREST_500),
        ("Public and private split", "The public verify page confirms a pass exists. Wage data needs an "
                                     "authenticated, authorised session.", BRASS_600),
        ("Device trust is the ceiling", "Anyone holding the device can read or edit browser storage. That limit is "
                                        "documented, not disguised.", CORAL),
    ]
    gap = 0.22
    w = (CW - gap) / 2
    for k, (head, body, colour) in enumerate(cards):
        row, col = divmod(k, 2)
        x = LEFT + col * (w + gap)
        y = 1.98 + row * 1.86
        g = group(s, f"!!privacy-{k + 1}")
        rect(g, x, y, w, 1.68, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.12, shdw=True)
        rect(g, x, y, 0.05, 1.68, fill=colour, radius=0.02)
        text(g, x + 0.28, y + 0.2, w - 0.5, 0.3, head, size=12.5, color=INK_900, bold=True)
        text(g, x + 0.28, y + 0.56, w - 0.5, 0.95, body, size=9.6, color=INK_500, line_spacing=1.2)

    p = rect(s, LEFT, 5.72, CW, 0.9, fill=SAND_100, ln=SAND_300, lw=0.6, radius=0.1,
             name="!!governance-band")
    text(s, LEFT + 0.28, 5.84, CW - 0.56, 0.7,
         [{"runs": [("DATA GOVERNANCE, STILL OPEN   ", {"color": BRASS_700, "bold": True, "size": 8, "spc": 1.4}),
                    ("Versioned export and import, retention policy and recovery procedure are specified as future work. "
                     "The project makes no compliance claim under any data-protection statute — that needs legal review "
                     "of a real deployment.", {"color": INK_700, "size": 9.2})]}],
         line_spacing=1.18)

    notes(s, "Four rules, one admission. The admission is the fourth card: on a shared or stolen device, browser storage "
             "is readable. Saying that plainly is more credible than a privacy claim the prototype cannot support. "
             "Also note what is deliberately absent from the schema: Aadhaar and bank details.")
    morph(s)
    return s


# ==========================================================================
# 22 — TEST RESULTS
# ==========================================================================
def slide_tests(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=3, eyebrow="Verification",
          title="Thirty-nine assertions, honestly reported")

    p = rect(s, LEFT, 1.96, 3.42, 4.24, fill=FOREST_950, radius=0.14, name="!!test-stat", shdw=True)
    three_d(p, bevel=1.6)
    text(s, LEFT + 0.3, 2.14, 2.9, 0.24, "REPORTED RESULT", size=7.6, color=BRASS_300, bold=True, spc=1.4)
    text(s, LEFT + 0.3, 2.44, 2.9, 1.0, "39", size=64, color=WHITE, font=DISPLAY, bold=True, line_spacing=0.9)
    text(s, LEFT + 0.3, 3.5, 2.9, 0.5, "assertions across\nfour automated suites", size=10.5,
         color=FOREST_200, line_spacing=1.2)
    rect(s, LEFT + 0.3, 4.12, 2.82, 0.012, fill=FOREST_700)
    for k, (lbl, val) in enumerate([("TypeScript errors", "0"), ("Production build", "clean"),
                                   ("Seeded ledger blocks", "8"), ("Synthetic workers", "4")]):
        y = 4.28 + k * 0.44
        text(s, LEFT + 0.3, y, 1.95, 0.24, lbl, size=8.6, color=FOREST_300)
        text(s, LEFT + 2.05, y, 1.05, 0.24, val, size=9, color=BRASS_200, font=MONO, bold=True,
             align=PP_ALIGN.RIGHT)

    rows = [
        ("Audit & ledger integrity", "23 / 23", "test-audit-ledger"),
        ("IndexedDB & repository", "6 / 6", "test-indexeddb-repository"),
        ("Supabase adapter & migrations", "5 / 5", "test-supabase-adapter"),
        ("Simulated approvals", "5 / 5", "test-approvals-simulation"),
        ("Type checking", "0 errors", "npm run lint"),
        ("Production build", "clean", "npm run build"),
    ]
    x, w = 4.55, 7.92
    for k, (name, score, script) in enumerate(rows):
        y = 1.96 + k * 0.66
        g = group(s, f"!!testrow-{k + 1}")
        rect(g, x, y, w, 0.58, fill=WHITE if k % 2 == 0 else None, ln=SAND_200, lw=0.5, radius=0.06)
        badge(g, x + 0.14, y + 0.17, 0.72, 0.24, "PASS", fill=FOREST_100, color=FOREST_800, size=6.6, radius=0.2)
        text(g, x + 1.0, y + 0.16, 3.4, 0.26, name, size=9.8, color=INK_900, bold=True)
        text(g, x + 4.4, y + 0.16, 3.4, 0.26, script, size=7.8, color=INK_400, font=MONO)
        text(g, x + 6.75, y + 0.14, 1.0, 0.28, score, size=9.6, color=FOREST_700, font=MONO,
             bold=True, align=PP_ALIGN.RIGHT)

    p2 = rect(s, LEFT, 6.34, CW, 0.42, fill=CORAL_50, ln=CORAL_100, lw=0.6, radius=0.06,
              name="!!honesty-band")
    text(s, LEFT + 0.2, 6.4, CW - 0.4, 0.3,
         [{"runs": [("HONEST LINE  ", {"color": CORAL, "bold": True, "size": 7.6, "spc": 1.2}),
                    ("These results are reported by the implementation team on synthetic data. They were not "
                     "independently reproduced for the written report.", {"color": INK_700, "size": 8.6})]}])

    notes(s, "Six rows, one number: 39 assertions. Say clearly that these are self-reported results on synthetic data, "
             "and that independent reproduction is explicitly listed as future work in the report. "
             "Judges respond well to a team that labels its own evidence.")
    morph(s)
    return s


# ==========================================================================
# 23 — COST
# ==========================================================================
def slide_cost(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=3, eyebrow="Cost", title="Zero hardware, near-zero marginal cost")

    cols = [
        ("Prototype today", "₹0", "No hardware at all: NFC tags and readers were removed from the design. "
                                  "React, Vite, TypeScript and browser APIs are free and open source.",
         ["Per-site capital cost: nil", "Per-worker sign-up cost: nil", "Demo runs from one HTML file"], FOREST_700),
        ("Printed pass", "≈ ₹5", "An estimate for a laminated pass on ordinary card stock. Reprinting a lost "
                                 "pass costs less than finding the old one.",
         ["No reader hardware", "Any phone camera works", "Reissue in under a minute"], BRASS_600),
        ("Backend, if deployed", "Free tier", "Supabase free plan: 500 MB database, 5 GB egress, 50,000 monthly "
                                              "active users, 1 GB storage. Paid compute from about $10 a month.",
         ["Idle projects may pause", "Quotas limit real use", "Real deployment costs not estimated"], CORAL),
    ]
    gap = 0.22
    w = (CW - 2 * gap) / 3
    for k, (head, big, body, points, colour) in enumerate(cols):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!cost-{k + 1}")
        rect(g, x, 1.98, w, 4.05, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
        rect(g, x, 1.98, w, 0.06, fill=colour, radius=0.02)
        label(g, x + 0.26, 2.2, w - 0.5, head, color=INK_400, size=7.6)
        text(g, x + 0.26, 2.44, w - 0.5, 0.62, big, size=30, color=colour, font=DISPLAY, bold=True)
        text(g, x + 0.26, 3.12, w - 0.5, 1.35, body, size=9.2, color=INK_500, line_spacing=1.2)
        rect(g, x + 0.26, 4.5, w - 0.52, 0.008, fill=SAND_200)
        for b, pt in enumerate(points):
            text(g, x + 0.26, 4.62 + b * 0.36, w - 0.5, 0.3,
                 [{"runs": [("·  ", {"color": colour}), (pt, {})]}], size=8.8, color=INK_700)

    text(s, LEFT, 6.2, CW, 0.55,
         "The cheapest part of this project is the software. The expensive part would be running it honestly — "
         "backups, authentication and support — and that cost is not estimated here, because it depends on volume.",
         size=9.6, color=INK_400, italic=True, line_spacing=1.2)

    notes(s, "The engineering argument: removing NFC removed the only hardware line item, which is what makes a "
             "per-site pilot plausible for a small contractor. Quote the free-tier numbers as checked in October 2026 "
             "and note they can change. Do not pretend production is free.")
    morph(s)
    return s


# ==========================================================================
# 24 — LIMITATIONS & FUTURE WORK
# ==========================================================================
def slide_limits(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, chapter=4, eyebrow="Limitations", title="What this prototype cannot do yet")

    blocks = [
        ("Cannot", CORAL, [
            "Prove that a worker was physically present.",
            "Guarantee that a recorded payment reached anyone.",
            "Resist an attacker who controls the device and recomputes hashes.",
            "Authenticate production users or enforce real permissions.",
            "Confirm the minimum-wage benchmarks it compares against.",
            "Survive a browser storage wipe, or leave the one device it lives on.",
        ]),
        ("Next", FOREST_600, [
            "Supabase auth, PostgreSQL and row-level security.",
            "Authenticated cross-device approval requests.",
            "Service-worker PWA shell for true offline loading.",
            "Outbox synchronisation that preserves conflicts.",
            "Versioned, authenticated export and restore.",
            "Usability testing with workers and contractors on site.",
        ]),
    ]
    gap = 0.28
    w = (CW - gap) / 2
    for k, (head, colour, items) in enumerate(blocks):
        x = LEFT + k * (w + gap)
        g = group(s, f"!!limitgroup-{k + 1}")
        rect(g, x, 1.98, w, 4.3, fill=WHITE, ln=SAND_300, lw=0.75, radius=0.14, shdw=True)
        rect(g, x, 1.98, w, 0.06, fill=colour, radius=0.02)
        text(g, x + 0.3, 2.32, w - 0.55, 0.3, head, size=14, color=colour, font=DISPLAY, bold=True,
             spc=0.6)
        for b, item in enumerate(items):
            y = 2.86 + b * 0.54
            oval(g, x + 0.32, y + 0.1, 0.09, 0.09, fill=colour, alpha=0.85)
            text(g, x + 0.55, y, w - 0.9, 0.5, item, size=9.4, color=INK_700, line_spacing=1.14)
            if b < len(items) - 1:
                rect(g, x + 0.32, y + 0.46, w - 0.64, 0.007, fill=SAND_200)

    text(s, LEFT, 6.42, CW, 0.3,
         "Every item on the left appears in the report's limitations section. None of it is glossed over.",
         size=9.4, color=INK_400, italic=True)

    notes(s, "Do not rush this slide — it is the most credible one in the deck. The strongest line: the hash chain is "
             "tamper-evident on one device, and a determined attacker with the device can recompute it. "
             "Then bridge to the roadmap: authentication and sync are the two unlocks.")
    morph(s)
    return s


# ==========================================================================
# 25 — CONCLUSION (dark)
# ==========================================================================
def slide_conclusion(prs, i):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    frame(s, i, kind="dark", chapter=4, eyebrow="Conclusion",
          title="The contribution is inspectability", title_y=0.86, title_h=0.8, rule_y=1.72)

    text(s, LEFT, 2.0, 7.3, 1.5,
         "Shram Setu 2.0 does not claim to prove attendance, guarantee payment or settle disputes. It makes the "
         "record of what was agreed, what was calculated, what was entered as paid and what remains contested "
         "inspectable — and durable within the honest limits of a browser.",
         size=12.5, color=FOREST_200, line_spacing=1.32)

    takeaways = [
        ("01", "Transparency by mechanism", "A shared muster, a shown calculation, a preserved history."),
        ("02", "Payment is not receipt", "Two actors, two timestamps, both visible."),
        ("03", "Integrity with limits", "SHA-256 chaining that says what it can and cannot prove."),
    ]
    for k, (num, head, body) in enumerate(takeaways):
        y = 3.62 + k * 0.92
        g = group(s, f"!!takeaway-{k + 1}")
        rect(g, LEFT, y, 7.3, 0.78, fill=FOREST_900, ln=FOREST_700, lw=0.6, radius=0.08)
        text(g, LEFT + 0.24, y + 0.24, 0.5, 0.26, num, size=8.5, color=BRASS_300, font=MONO, bold=True)
        text(g, LEFT + 0.78, y + 0.12, 2.6, 0.26, head, size=10.6, color=SAND_50, bold=True)
        text(g, LEFT + 0.78, y + 0.42, 6.3, 0.26, body, size=8.8, color=FOREST_300)

    p = rect(s, 8.75, 1.96, 3.72, 4.55, fill=FOREST_900, ln=BRASS_700, lw=0.9, radius=0.14,
             name="!!closing-card", shdw=True)
    three_d(p, bevel=1.8, rot_y=4)
    text(s, 9.05, 2.2, 3.1, 0.24, "THE LINE TO REMEMBER", size=7.4, color=BRASS_300, bold=True, spc=1.4)
    text(s, 9.05, 2.52, 3.15, 2.4,
         [{"text": "Every shift recorded.", "size": 15, "color": SAND_50, "font": DISPLAY, "bold": True},
          {"text": "Every wage explained.", "size": 15, "color": SAND_50, "font": DISPLAY, "bold": True},
          {"text": "Every change traceable.", "size": 15, "color": SAND_50, "font": DISPLAY, "bold": True}],
         line_spacing=1.5)
    rect(s, 9.05, 4.92, 1.2, 0.03, fill=BRASS_400)
    text(s, 9.05, 5.1, 3.15, 0.85,
         "An academic prototype, honestly scoped — and a foundation that a real deployment could stand on.",
         size=9.4, color=FOREST_200, line_spacing=1.24)
    text(s, 9.05, 6.02, 3.15, 0.24, "8 blocks · 39 assertions · ₹0 hardware",
         size=7.4, color=FOREST_400, font=MONO)

    notes(s, "Land the argument in one breath: the contribution is not a database, it is inspectability — a record both "
             "parties can read, argue about, and verify. Then the three takeaways. "
             "Stop talking rather than overselling; the limitations slide already bought your credibility.")
    morph(s)
    return s


# ==========================================================================
# 26 — THANK YOU
# ==========================================================================
def slide_thanks(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, FOREST_950)
    pic = s.shapes.add_picture(IMG_MUSTER, Inches(-0.9), Inches(-1.35), width=Inches(15.2))
    pic.name = "!!closing-photo"
    ov = rect(s, 0, 0, W, H, fill=FOREST_950)
    gradient(ov, [(0.0, FOREST_950, 1.0), (0.28, FOREST_950, 0.985), (0.55, FOREST_950, 0.9),
                  (0.78, FOREST_950, 0.74), (1.0, FOREST_950, 0.6)], angle=0)
    rect(s, 0, 0, W, H, fill=FOREST_950, alpha=0.22)

    glow_blob(s, 8.4, -3.0, 7.2, FOREST_300, 0.30, name="!!glow-a")
    glow_blob(s, -2.6, 3.4, 6.0, BRASS_400, 0.24, name="!!glow-b")
    rail_top, rail_h = 0.62, 6.12
    rect(s, 0.44, rail_top, 0.018, rail_h, fill=FOREST_800, name="!!rail")
    rect(s, 0.44, rail_top, 0.018, rail_h, fill=BRASS_400, name="!!rail-fill")
    oval(s, 0.385, rail_top - 0.055, 0.13, 0.13, fill=BRASS_300, name="!!rail-dot")

    rect(s, 1.16, 1.32, 0.13, 0.13, fill=BRASS_400, name="!!eyebrow-mark")
    text(s, 1.39, 1.24, 8.0, 0.28, "INDORE SAHODAYA   ·   COMPUTER SCIENCE   ·   2026",
         size=10, color=BRASS_300, bold=True, spc=2.0, name="!!eyebrow")
    text(s, 1.16, 1.72, 8.2, 1.3, "Thank you", size=56, color=WHITE, font=DISPLAY, bold=True,
         name="!!title", line_spacing=0.95)
    rect(s, 1.16, 3.06, 1.45, 0.045, fill=BRASS_400, name="!!rule")
    text(s, 1.16, 3.24, 7.6, 0.8,
         "Questions, critique and field-test invitations are welcome — the next step is a site trial, not a "
         "bigger feature list.",
         size=14, color=SAND_200, line_spacing=1.24, name="!!dek")

    meta = [("PRESENTED BY", "[Student name] · Class [ ]"),
            ("GUIDE", "[Guide / Supervisor name]"),
            ("INSTITUTION", "[School name] · Indore, Madhya Pradesh")]
    for k, (head, val) in enumerate(meta):
        y = 4.55 + k * 0.44
        text(s, 1.16, y, 1.7, 0.22, head, size=7.5, color=BRASS_400, bold=True, spc=1.4)
        text(s, 2.92, y - 0.035, 6.0, 0.26, val, size=10.5, color=SAND_300)

    qcard = rect(s, 10.55, 4.2, 1.9, 2.55, fill=SAND_50, radius=0.1, name="!!closing-qr-card", shdw=True)
    three_d(qcard, bevel=1.4)
    qr_grid(s, 10.83, 4.4, 1.34, color=FOREST_950, name="!!closing-qr")
    rect(s, 10.83, 5.9, 1.34, 0.012, fill=SAND_300)
    text(s, 10.55, 6.0, 1.9, 0.2, "SCAN TO VERIFY", size=6.4, color=FOREST_700,
         bold=True, spc=0.9, align=PP_ALIGN.CENTER)
    text(s, 10.55, 6.22, 1.9, 0.4, "public pass verification", size=6.2, color=INK_500,
         align=PP_ALIGN.CENTER)

    text(s, 0.86, 7.14, 8.0, 0.22,
         "Shram Setu 2.0   ·   Indore Sahodaya Computer Science   ·   2026", size=8.5,
         color=FOREST_400, spc=0.6, name="!!footer")
    text(s, 11.7, 7.12, 0.77, 0.24, "26 / 26", size=9, color=FOREST_300, font=MONO,
         align=PP_ALIGN.RIGHT, name="!!pageno")

    notes(s, "Close on the invitation, not on a summary. If the QR placeholder is replaced with a real link, this is "
             "the slide judges photograph. Keep answers short and hand difficult questions to the limitations slide.")
    morph(s)
    return s


# ==========================================================================
# BUILD
# ==========================================================================
def build():
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)

    slide_title(prs)
    slide_agenda(prs, 1)
    slide_problem(prs, 2)
    slide_evidence(prs, 3)
    slide_question(prs, 4)
    slide_compare(prs, 5)
    slide_core(prs, 6)
    slide_system(prs, 7)
    slide_evolution(prs, 8)
    slide_architecture(prs, 9)
    slide_stack(prs, 10)
    slide_data(prs, 11)
    slide_wage(prs, 12)
    slide_payments(prs, 13)
    slide_corrections(prs, 14)
    slide_chain(prs, 15)
    slide_rules(prs, 16)
    slide_qr(prs, 17)
    slide_demo(prs, 18)
    slide_offline(prs, 19)
    slide_privacy(prs, 20)
    slide_tests(prs, 21)
    slide_cost(prs, 22)
    slide_limits(prs, 23)
    slide_conclusion(prs, 24)
    slide_thanks(prs)

    prs.core_properties.title = "Shram Setu 2.0 — Verified digital work & wage records"
    prs.core_properties.subject = "Indore Sahodaya Computer Science presentation"
    prs.core_properties.author = "Shram Setu 2.0 project team"
    prs.core_properties.keywords = ("wage transparency, offline-first, SHA-256, IndexedDB, "
                                    "React, TypeScript, India, Indore Sahodaya")

    out = os.path.join(HERE, "Shram_Setu_2.0_Indore_Sahodaya_CS.pptx")
    prs.save(out)
    print(f"saved {out}  ({len(prs.slides.__iter__.__self__._sldIdLst)} slides)")
    if FIT_WARNINGS:
        print("\n--- fit warnings ---")
        for w in FIT_WARNINGS:
            print(" ", w)
    return out


if __name__ == "__main__":
    build()
