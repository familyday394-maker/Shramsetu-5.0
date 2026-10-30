#!/usr/bin/env python3
"""
Build the Shram Setu 2.0 deck for Indore Sahodaya (Computer Science).

Run:  python3 build_deck.py        -> ../../docs/Shram_Setu_2.0_Sahodaya_CS.pptx
"""
from __future__ import annotations

import math
import os

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Inches

import deckkit as K
from deckkit import (BRASS, BRASS_DK, BRASS_LT, CLAY, EMERALD, EMERALD_DK, FOREST,
                     FOREST_MID, INK, INK2, INK3, MINT, PAPER, PAPER_DEEP,
                     PAPER_LINE, WHITE, P, Para, Run, gradient, set_morph, shape,
                     textbox)
from components import arrow_down, arrow_right, callout, card, pill, stat, table
from layouts import (CHIP_CROP, HERO_CROP, body, card_slip, content_chrome,
                     display, eyebrow, label, mono, page_no, photo_chip, rail, wordmark)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
HERO = os.path.join(ROOT, "src/assets/images/shram_setu_hero_pass_1792385013356.jpg")
MUSTER = os.path.join(ROOT, "src/assets/images/construction_site_muster_1792385014214.jpg")
QR = "/tmp/ss_qr.png"
OUT = os.path.join(ROOT, "docs", "Shram_Setu_2.0_Sahodaya_CS.pptx")

TOTAL = 32
SEC = {1: (1, "Context"), 2: (2, "Design"), 3: (3, "Engineering"),
       4: (4, "Integrity"), 5: (5, "Evidence"), 6: (6, "Outlook")}

prs = Presentation()
prs.slide_width = Inches(K.SW)
prs.slide_height = Inches(K.SH)

BG: list[str] = []


def add(dark=False):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    col = FOREST if dark else PAPER
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = RGBColor.from_string(col)
    K.scene_reset()
    BG.append(col)
    K._log(kind="shape", g="rect", x=0, y=0, w=K.SW, h=K.SH, fill=col, line=None,
           lw=0, name="bg")
    return s


def notes(s, text):
    s.notes_slide.notes_text_frame.text = text


def angles(n):
    lat = -5 + 4 * math.sin(n * 0.9)
    lon = -12 + 6 * math.cos(n * 0.55)
    return (round(lat, 1), round(lon, 1))


def cslide(n, sec, title, lede, frac=None):
    s = add()
    sec_no, sec_name = SEC[sec]
    top = content_chrome(s, sec_no, sec_name, n, TOTAL, frac if frac else n / TOTAL,
                         angles(n), HERO, title, lede)
    rail(s.shapes, frac if frac else n / TOTAL)
    page_no(s.shapes, n, TOTAL)
    set_morph(s)
    return s, top


def dslide(n, sec, frac=None):
    s = add(dark=True)
    sec_no, sec_name = SEC[sec]
    C = s.shapes
    panel = shape(C, "rect", "!!HeroPanel", 0, 0, K.SW, K.SH, fill=FOREST)
    gradient(panel, [(0, FOREST, None), (52, "113528", None), (100, "07160F", None)], angle=45)
    shape(C, "rect", "!!Accent", 0, 0, K.SW, 0.09, fill=BRASS)
    K.line_v(C, "!!Edge", 0, 0, 0, BRASS_DK)
    wordmark(C, 0.88, 0.60, s=1.28)
    textbox(C, "!!SecName", 0.90, 1.06, 6.0, 0.25,
            [eyebrow(f"Section {sec_no:02d}  ·  {sec_name}", BRASS, 8.2, 240)],
            log=True)
    card_slip(C, 10.42, 5.28, 2.32, 1.40, *angles(n))
    photo_chip(C, "!!Photo", HERO, 10.42, 3.42, 2.32, 1.28, CHIP_CROP, radius=0.09)
    rail(C, frac if frac else n / TOTAL, dark=True)
    page_no(C, n, TOTAL, dark=True, x=10.95)
    set_morph(s)
    return s


# ==========================================================================
# 01 · TITLE
# ==========================================================================
def s01():
    s = add(dark=True)
    C = s.shapes
    panel = shape(C, "rect", "!!HeroPanel", 0, 0, K.SW, K.SH, fill=FOREST)
    gradient(panel, [(0, FOREST, None), (58, "0C241B", None), (100, "07160F", None)], angle=45)
    K.rounded_picture(C, "!!Photo", HERO, 7.62, -0.06, 5.8, 7.62, HERO_CROP,
                      radius=0.0, shadow=False)
    veil = shape(C, "rect", "veil", 7.62, 0, 1.55, K.SH, fill=FOREST)
    gradient(veil, [(0, FOREST, 98), (100, FOREST, 0)], angle=0)
    shape(C, "rect", "topbar", 0, 0, K.SW, 0.10, fill=BRASS)

    wordmark(C, 0.88, 0.62, s=1.30)
    textbox(C, "eyebrow", 0.90, 1.52, 6.3, 0.26,
            [eyebrow("Indore Sahodaya  ·  Computer Science  ·  October 2026", BRASS, 8.8, 250)])
    shape(C, "rect", "rule", 0.90, 1.92, 1.25, 0.05, fill=BRASS)
    textbox(C, "title", 0.86, 2.16, 6.55, 0.95,
            [display("Shram Setu 2.0", 48, WHITE, bold=True, line=0.95)])
    textbox(C, "sub", 0.90, 3.20, 6.15, 0.95,
            [body("An offline-first, transparency-centred digital work-record "
                  "system for India's daily-wage workers.", 14.2, MINT, 1.34)])
    box = shape(C, "round", "tagbox", 0.90, 4.38, 6.05, 0.62, fill=FOREST_MID,
                line=BRASS_DK, lw=0.9, radius=0.10)
    shape(C, "round", "tagbar", 0.90, 4.38, 0.055, 0.62, fill=BRASS, radius=0.03)
    textbox(C, "tag", 1.06, 4.42, 5.8, 0.54,
            [P("Every shift recorded. Every wage explained. Every change traceable.",
               font=K.DISPLAY, size=11.6, color=BRASS_LT, italic=True)], anchor="m")

    card_slip(C, 0.88, 5.38, 2.46, 1.44, *angles(1))
    textbox(C, "meta", 3.62, 5.40, 3.75, 1.40,
            [eyebrow("Presented by", MINT, 7.4, 220),
             P("Student name  ·  Class ___", font=K.BODY, size=11.2, color=WHITE, bold=True),
             P("", font=K.BODY, size=4),
             eyebrow("Guide", MINT, 7.4, 220),
             P("Teacher name", font=K.BODY, size=11.2, color=WHITE, bold=True)])
    rail(C, 1 / TOTAL, dark=True)
    page_no(C, 1, TOTAL, dark=True, x=6.35)
    set_morph(s, dur=1200)
    notes(s, "Open with the one-line pitch: this is not an attendance app — it is a shared record "
             "of what was agreed, what was calculated, what was paid, and what is still disputed. "
             "Mention that the build shown is a working React prototype in local demo mode.")


# ==========================================================================
# 02 · CORE IDEA
# ==========================================================================
def s02():
    s = dslide(2, 1)
    C = s.shapes
    textbox(C, "eyebrow", 0.90, 1.62, 6.0, 0.26,
            [eyebrow("The core idea", BRASS, 8.6, 260)])
    textbox(C, "quote", 0.86, 1.95, 9.1, 1.55,
            [display("A wage you cannot inspect\nis a wage you cannot defend.", 40, WHITE,
                     bold=True, line=1.02)])
    textbox(C, "sub", 0.90, 3.62, 8.5, 0.72,
            [body("Shram Setu is a shared, durable record of what was agreed, what was "
                  "calculated, what was paid — and what is still in dispute.", 13.0, MINT, 1.3)])
    items = [("01", "Explainable arithmetic", "One engine prints the same step-by-step breakdown to every side.", EMERALD),
             ("02", "Durable history", "Corrections keep the prior value, reason, actor and time.", BRASS),
             ("03", "Verifiable record", "Each record carries a SHA-256 link to the one before it.", CLAY)]
    for i, (num, t, d, acc) in enumerate(items):
        x = 0.90 + i * 3.12
        shape(C, "round", f"pill{i}", x, 4.72, 2.94, 1.28, fill=FOREST_MID, radius=0.10)
        shape(C, "rect", f"pillbar{i}", x, 4.72, 2.94, 0.05, fill=acc)
        textbox(C, f"pnum{i}", x + 0.24, 4.86, 0.6, 0.24,
                [P(num, font=K.DISPLAY, size=9.5, color=acc, bold=True)])
        textbox(C, f"pt{i}", x + 0.24, 5.10, 2.5, 0.28,
                [P(t, font=K.BODY, size=11.6, color=WHITE, bold=True)])
        textbox(C, f"pd{i}", x + 0.24, 5.38, 2.45, 0.55,
                [body(d, 8.9, MINT, 1.2)])
    textbox(C, "kicker", 0.90, 6.38, 9.0, 0.30,
            [P("One demo record: 4 days × ₹650 = ₹2,600 due  ·  ₹1,300 paid  ·  ₹1,300 outstanding",
               font=K.BODY, size=10.4, color=BRASS_LT, bold=True, spc=40)])
    notes(s, "This is the thesis. Everything that follows either explains, implements or honestly "
             "bounds one of these three claims: explainable arithmetic, durable history, verifiable record.")


# ==========================================================================
# 03 · AGENDA
# ==========================================================================
def s03():
    s, y = cslide(3, 1, "What this deck covers",
                  "Six movements: the problem, the design response, the engineering, the integrity "
                  "model, the evidence, and the honest boundary.")
    C = s.shapes
    items = [("01", "Context", "The problem, the evidence, the research question", EMERALD),
             ("02", "Design", "Why NFC became QR · scope · the four mechanisms", BRASS),
             ("03", "Engineering", "Architecture · data model · wage engine · payment states", EMERALD_DK),
             ("04", "Integrity", "Hash chain · seven rules · corrections · QR security", CLAY),
             ("05", "Evidence", "Demo bench · 39 assertions · cost", BRASS_DK),
             ("06", "Outlook", "Limitations · roadmap · conclusion", FOREST_MID)]
    for i, (num, t, d, acc) in enumerate(items):
        col, row = i % 2, i // 2
        x = 4.16 + col * 4.39
        yy = 2.66 + row * 1.40
        shape(C, "round", f"ag{i}", x, yy, 4.17, 1.24, fill=WHITE, line=PAPER_LINE,
              lw=0.9, radius=0.10)
        textbox(C, f"agn{i}", x + 0.24, yy + 0.20, 0.6, 0.42,
                [P(num, font=K.DISPLAY, size=20, color=acc, bold=True)])
        textbox(C, f"agt{i}", x + 0.92, yy + 0.22, 2.9, 0.28,
                [P(t, font=K.BODY, size=13.0, color=INK, bold=True)])
        textbox(C, f"agd{i}", x + 0.92, yy + 0.56, 3.05, 0.60,
                [body(d, 9.4, INK2, 1.2)])
        shape(C, "rect", f"agr{i}", x + 0.24, yy + 1.10, 0.5, 0.03, fill=acc)
    notes(s, "Use this as the map. Each section is one colour: emerald for the problem space, brass for "
             "design decisions, clay for risk and integrity.")


# ==========================================================================
# 04 · PROBLEM
# ==========================================================================
def s04():
    s, y = cslide(4, 1, "Six ways a wage becomes an argument",
                  "None of them is a database problem. All of them are evidence problems.")
    C = s.shapes
    cards = [
        ("01", "The rate changes after the shift",
         "₹550 agreed at the gate, ₹500 at settlement — and no version history either way.", CLAY),
        ("02", "Attendance is contested",
         "Four days in one book, three in another, and no shared copy to compare.", CLAY),
        ("03", "Deductions with no reason",
         "A number is cut from the wage slip with no line saying who decided or why.", BRASS_DK),
        ("04", "Recorded ≠ received",
         "The ledger says paid because the contractor typed it. The worker is still waiting.", BRASS_DK),
        ("05", "Corrections erase the evidence",
         "Overwriting a cell destroys exactly the value a dispute would depend on.", CLAY),
        ("06", "No shared record, no shared truth",
         "Two private versions of the same week, and nothing to appeal to.", CLAY),
    ]
    for i, (num, t, d, acc) in enumerate(cards):
        col, row = i % 2, i // 2
        card(C, f"pb{i}", 4.16 + col * 4.39, 2.66 + row * 1.40, 4.17, 1.24, t, d,
             accent=acc, num=num, tsize=12.2, bsize=9.8)
    notes(s, "Ask the room: which of these six could you prove in front of a labour officer today? "
             "Each card is a mechanism the rest of the deck will answer.")


# ==========================================================================
# 05 · EVIDENCE
# ==========================================================================
def s05():
    s, y = cslide(5, 1, "The gap is documented, not imagined",
                  "Audit reports, court orders and ILO research describe the same failure: the "
                  "record of what was agreed does not survive the dispute.")
    C = s.shapes
    stats = [("₹269.27", "CR", "MGNREGS wages paid 16–90 days after muster closure · CAG Kerala, Report 9 of 2025", CLAY),
             ("₹704.39", "CR", "Still unpaid in Jammu & Kashmir as of March 2024 · CAG audit", CLAY),
             ("90", "%", "of 3,16,178 rejected MGNREGS transactions were unskilled wages · CAG", BRASS_DK),
             ("79→43", "%", "Cash wages in India, 2014 → 2021, as digital payment scaled · ILO 2024", EMERALD)]
    w = (8.56 - 0.54) / 4
    for i, (v, u, l, acc) in enumerate(stats):
        stat(C, f"st{i}", 4.16 + i * (w + 0.18), 2.66, w, 1.78, v, u, l, accent=acc)
    textbox(C, "cite", 4.16, 4.50, 8.5, 0.42,
            [body("Sources: CAG Report No. 9 of 2025 (Kerala); CAG audit of MGNREGS in J&K; "
                  "ILO, Scaling up digital wages (2024). Figures as reported.", 8.2, INK3, 1.2)])
    callout(C, "cl1", 4.16, 5.02, 8.56, 1.62,
            "BSNL v Union of India, WPA 25460 of 2025 (Calcutta High Court, 7 January 2026): the "
            "principal employer was directed to pay contract workers' unpaid wages under s.21(4) of "
            "the Contract Labour (Regulation and Abolition) Act, 1970. A second 2026 ruling turned on "
            "the absence of documents linking workers to the claimed employer.", size=9.8)
    notes(s, "Two things to stress: (1) the amounts are administrative findings, not our claims; "
             "(2) the court case is about liability under existing law — it shows why contemporaneous, "
             "inspectable records matter.")


# ==========================================================================
# 06 · QUESTION + OBJECTIVES  (dark)
# ==========================================================================
def s06():
    s = dslide(6, 1)
    C = s.shapes
    textbox(C, "eyebrow", 0.90, 1.42, 6.0, 0.26,
            [eyebrow("Research question", BRASS, 8.6, 260)])
    q = shape(C, "round", "q", 0.90, 1.72, 8.55, 1.30, fill=FOREST_MID, line=BRASS_DK,
              lw=0.9, radius=0.10)
    shape(C, "rect", "qbar", 0.90, 1.72, 0.06, 1.30, fill=BRASS)
    textbox(C, "qtext", 1.14, 1.82, 8.1, 1.10,
            [display("How can an affordable, offline-capable web system make daily-wage work "
                     "records, wage calculations, payment status and disagreements more "
                     "transparent and easier to verify?", 15.6, WHITE, bold=False, line=1.24)],
            anchor="m")
    objs = ["Understandable, low-cost workflow for low digital access",
            "Wage maths inspectable by both parties",
            "Corrections and disagreements stay visible",
            "Detect unauthorised edits with explainable checks",
            "Work offline within browser-storage limits",
            "Architecture that can later support a shared backend",
            "Evaluate the prototype on repeatable synthetic tests"]
    for i, o in enumerate(objs):
        col, row = (0, i) if i < 4 else (1, i - 4)
        x = 0.90 + col * 4.42
        yy = 3.34 + row * 0.78
        label(C, f"on{i}", x, yy + 0.09, 0.32, 0.32,
              [P(str(i + 1), font=K.BODY, size=8.6, color=BRASS, bold=True, align="c")],
              fill=None, line=BRASS, lw=1.0, kind="oval", margins=(0, 0, 0, 0))
        textbox(C, f"ot{i}", x + 0.44, yy + 0.06, 3.55, 0.62,
                [body(o, 9.6, WHITE if i % 2 == 0 else MINT, 1.22)], anchor="t")
    notes(s, "Seven objectives, one question. Objectives 1–4 are about transparency; 5–6 about "
             "affordability and architecture; 7 about honest evaluation.")


# ==========================================================================
# 07 · COMPARISON TABLE
# ==========================================================================
def s07():
    s, y = cslide(7, 1, "Where Shram Setu actually sits",
                  "Registration systems, public works, payroll software and paper registers each solve "
                  "a different problem. The comparison is about purpose, not defects.")
    C = s.shapes
    cols = [2.10, 1.95, 1.62, 1.52, 1.37]
    xs = [4.16]
    for c in cols[:-1]:
        xs.append(xs[-1] + c)
    table(C, "tbl", 4.16, 2.68, xs, cols,
          ["System", "Primary purpose", "Wage visibility", "Corrections", "Offline"],
          [["e-Shram (GoI)", "Registry of unorganised workers; UAN and schemes", "Not a wage system",
            "Not designed for it", "Registration needs connectivity"],
           ["MGNREGS / NREGASoft", "Public rural employment and wage payment",
            "System-generated; CAG documented delays", "Administrative records", "Field devices may sync"],
           ["Commercial payroll", "Employer payroll processing", "Varies by product",
            "Employer-controlled", "Usually online"],
           ["Paper / messaging", "Informal record keeping", "Manual, hard to inspect",
            "Erased on overwrite", "Fully offline"],
           ["Shram Setu 2.0", "Work-record and wage reconciliation",
            "Shared engine, step-by-step", "Prior value, reason, actor, time",
            "IndexedDB local demo"]],
          [0.74, 0.74, 0.60, 0.60, 0.78], size=8.5, first_bold=True)
    textbox(C, "tnote", 4.16, 6.64, 8.5, 0.34,
            [body("Comparison focuses on documented purpose rather than assumed defects. "
                  "e-Shram is a registration system, not a day-to-day wage ledger.", 8.2, INK3, 1.15)])
    notes(s, "Be careful and fair here: e-Shram and MGNREGS are not trying to do what we do. "
             "The point is that nobody in this row gives a private contractor–worker pair a shared, "
             "inspectable, offline-capable wage record.")


# ==========================================================================
# 08 · NFC → QR
# ==========================================================================
def s08():
    s, y = cslide(8, 2, "NFC cards → printed QR",
                  "The first concept was a physical tap-card. It was removed for cost and for a "
                  "security property that could not be delivered cheaply.")
    C = s.shapes
    K.line_h(C, "tl", 4.38, 3.16, 8.05, PAPER_LINE, 2.0)
    steps = [("Concept", "reusable physical pass"), ("NFC passes", "tap to identify a worker"),
             ("Cost + clone audit", "tags are rewriteable"), ("Printed QR", "any phone camera"),
             ("Repository split", "storage behind an interface")]
    for i, (t, d) in enumerate(steps):
        x = 4.44 + i * 1.98
        acc = EMERALD if i >= 3 else BRASS_DK
        shape(C, "oval", f"n{i}", x, 3.04, 0.24, 0.24, fill=acc, line=PAPER, lw=2.0)
        textbox(C, f"nt{i}", x - 0.78, 2.58, 1.56, 0.30,
                [P(t, font=K.BODY, size=9.2, color=INK, bold=True, align="c")])
        textbox(C, f"nd{i}", x - 0.78, 3.42, 1.56, 0.55,
                [body(d, 8.2, INK3, 1.16, align="c")])
    card(C, "nfc", 4.16, 4.10, 4.17, 1.95, "NFC — removed",
         "Ordinary writable tags are not secure cryptographic devices: they can be cloned or "
         "rewritten, and a reader is an extra hardware cost at every site.", accent=CLAY, bsize=9.6)
    card(C, "qr", 8.55, 4.10, 4.17, 1.95, "QR — adopted",
         "Printed on paper or card stock, replaced when damaged, read by any phone camera, and "
         "carrying an opaque reference rather than personal data.", accent=EMERALD, bsize=9.6)
    callout(C, "truth", 4.16, 6.22, 8.56, 0.66,
            "A QR is an identifier, not an authenticator. Scanning one proves nothing about who is standing there.",
            size=9.6, accent=CLAY)
    notes(s, "This slide shows engineering judgement: we removed a feature because it created a "
             "false sense of security rather than real security.")


# ==========================================================================
# 09 · FOUR MECHANISMS
# ==========================================================================
def s09():
    s, y = cslide(9, 2, "Four inspectable mechanisms",
                  "No dashboards of promises. Four things a worker, a contractor or a judge can "
                  "actually check.")
    C = s.shapes
    cards = [("01", "Explainable arithmetic",
              "One deterministic engine renders the same step-by-step breakdown in the worker "
              "portal, the contractor portal and the inspector.", EMERALD),
             ("02", "Explicit payment states",
              "Unpaid, recorded by contractor, acknowledged by worker, disputed — never collapsed "
              "into a single 'paid' tick.", BRASS),
             ("03", "Preserved history",
              "A correction keeps the prior value alongside the new one, with reason, actor role "
              "and timestamp.", EMERALD_DK),
             ("04", "Chained audit trail",
              "Each record stores a SHA-256 digest that includes its predecessor, so edits break "
              "the chain visibly.", CLAY)]
    for i, (num, t, d, acc) in enumerate(cards):
        x = 4.16 + (i % 2) * 4.39
        yy = 2.66 + (i // 2) * 2.02
        shape(C, "round", f"m{i}", x, yy, 4.17, 1.86, fill=WHITE, line=PAPER_LINE,
              lw=0.9, radius=0.11, shadow=True)
        shape(C, "rect", f"mt{i}", x, yy, 4.17, 0.06, fill=acc)
        textbox(C, f"mn{i}", x + 0.26, yy + 0.26, 0.6, 0.36,
                [P(num, font=K.DISPLAY, size=17, color=acc, bold=True)])
        textbox(C, f"mtit{i}", x + 0.86, yy + 0.30, 3.1, 0.30,
                [P(t, font=K.BODY, size=13.2, color=INK, bold=True)])
        textbox(C, f"mb{i}", x + 0.26, yy + 0.80, 3.68, 0.90,
                [body(d, 9.9, INK2, 1.26)])
    notes(s, "These four map one-to-one to the four questions in a dispute: what was the rate, "
             "what was recorded, was it changed, and can we trust the copy in front of us?")


# ==========================================================================
# 10 · ARCHITECTURE
# ==========================================================================
def s10():
    s, y = cslide(10, 3, "Architecture: one clean seam",
                  "An abstract repository keeps the wage engine and the audit chain independent of "
                  "whether records live in IndexedDB or PostgreSQL.")
    C = s.shapes
    layers = [("Presentation", "React 19 single-page app", "Worker portal · Contractor portal · Audit & tamper bench", EMERALD),
              ("Services", "Deterministic business rules", "wageEngine · anomalyEngine · cryptoAudit · auth · router", EMERALD_DK),
              ("Contract", "IDataRepository", "workers · work records · payments · disputes · approvals", BRASS),
              ("Storage", "IndexedDB · shram_setu_v2_db", "Per-entity object stores · in-memory fallback for tests", BRASS_DK),
              ("Planned", "Supabase + PWA", "PostgreSQL + row-level security · service worker · sync queue — not connected", INK3)]
    yy = 2.66
    for i, (tag, name, items, acc) in enumerate(layers):
        h = 0.70
        dashed = i == 4
        sp = shape(C, "round", f"L{i}", 4.16, yy, 8.56, h, fill=WHITE if not dashed else PAPER,
                   line=acc if dashed else PAPER_LINE, lw=1.1, radius=0.09,
                   shadow=not dashed)
        shape(C, "rect", f"Lt{i}", 4.16, yy, 0.07, h, fill=acc)
        textbox(C, f"Ltag{i}", 4.38, yy + 0.10, 1.42, 0.22,
                [P(tag.upper(), font=K.BODY, size=7.6, color=acc, bold=True, spc=170)])
        textbox(C, f"Lname{i}", 4.38, yy + 0.27, 2.75, 0.36,
                [P(name, font=K.BODY, size=10.4, color=INK if not dashed else INK3, bold=True)])
        textbox(C, f"Litem{i}", 7.20, yy + 0.14, 5.30, 0.44,
                [body(items, 8.8, INK2 if not dashed else INK3, 1.16)], anchor="m")
        if i < 4:
            arrow_down(C, f"ar{i}", 8.44, yy + h + 0.02, h=0.16)
        yy += h + 0.18
    notes(s, "Point at the contract layer: this is why adding Supabase later does not mean rewriting "
             "the wage engine or the hash chain. The planned row is dashed because it is honestly not "
             "connected today.")


# ==========================================================================
# 11 · STACK
# ==========================================================================
def s11():
    s, y = cslide(11, 3, "Technology choices and why",
                  "Every item is free, open source and already in the browser — no licence, no server "
                  "and no hardware to buy.")
    C = s.shapes
    st = [("React 19", "UI components and state",
           "Component model, wide ecosystem, familiar to reviewers", EMERALD),
          ("TypeScript", "Typed application code",
           "Catches a class of errors at compile time; tsc reports 0 errors", EMERALD_DK),
          ("Vite", "Dev server + build",
           "Fast iteration and a clean, small production bundle", EMERALD),
          ("IndexedDB", "Browser-local storage",
           "Works offline, larger than localStorage, supports indexes", BRASS),
          ("Web Crypto", "SHA-256 digests",
           "Standard browser API — no external crypto library needed", BRASS_DK),
          ("QR + jsQR", "QR encode / decode",
           "Any phone camera reads it; no dedicated reader hardware", CLAY)]
    w = (8.56 - 0.40) / 3
    for i, (t, role, why, acc) in enumerate(st):
        x = 4.16 + (i % 3) * (w + 0.20)
        yy = 2.66 + (i // 3) * 2.06
        shape(C, "round", f"s{i}", x, yy, w, 1.90, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.11, shadow=True)
        shape(C, "round", f"sd{i}", x + 0.22, yy + 0.22, 0.30, 0.30, fill=acc, radius=0.06)
        textbox(C, f"st{i}", x + 0.22, yy + 0.60, w - 0.40, 0.30,
                [P(t, font=K.BODY, size=12.4, color=INK, bold=True)])
        textbox(C, f"sr{i}", x + 0.22, yy + 0.90, w - 0.40, 0.40,
                [body(role, 9.2, acc if acc != BRASS else BRASS_DK, 1.18, bold=True)])
        textbox(C, f"sw{i}", x + 0.22, yy + 1.34, w - 0.40, 0.50,
                [body(why, 8.6, INK2, 1.18)])
    notes(s, "The stack is deliberately boring. Nothing here needs a paid service, and every piece "
             "is inspectable by a teacher or a judge without installing anything.")


# ==========================================================================
# 12 · DATA MODEL
# ==========================================================================
def s12():
    s, y = cslide(12, 3, "Eight entities, one ledger",
                  "Records reference a worker by synthetic ID, and every state change is its own "
                  "entity instead of an overwritten field.")
    C = s.shapes
    ents = [("Worker", "id · skill · base rate", "MP-IND-2026-MM842", EMERALD),
            ("Attendance", "date · shift · hours", "full_day · half_day · overtime", EMERALD),
            ("Payment", "amount · method · ack", "recorded ≠ received", BRASS),
            ("Correction", "prior → new · reason", "who, when, why", BRASS),
            ("Dispute", "worker claim + response", "both statements kept", CLAY),
            ("Anomaly finding", "rule · values examined", "RULE-01 … RULE-07", CLAY),
            ("Audit block", "index · prevHash · hash", "SHA-256 chain", EMERALD_DK),
            ("Approval request", "state · target action", "simulated in demo", INK3)]
    w = (8.56 - 0.54) / 4
    for i, (t, f, note_, acc) in enumerate(ents):
        x = 4.16 + (i % 4) * (w + 0.18)
        yy = 2.66 + (i // 4) * 1.72
        shape(C, "round", f"e{i}", x, yy, w, 1.54, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.10, shadow=True)
        shape(C, "rect", f"eh{i}", x, yy, w, 0.05, fill=acc)
        textbox(C, f"et{i}", x + 0.20, yy + 0.24, w - 0.36, 0.30,
                [P(t, font=K.BODY, size=11.2, color=INK, bold=True)])
        textbox(C, f"ef{i}", x + 0.20, yy + 0.58, w - 0.36, 0.34,
                [mono(f, 8.0, INK2)])
        textbox(C, f"en{i}", x + 0.20, yy + 0.98, w - 0.36, 0.44,
                [body(note_, 8.2, acc if acc != EMERALD else EMERALD_DK, 1.16)])
    callout(C, "dmnote", 4.16, 6.10, 8.56, 0.72,
            "The ledger is append-shaped: a correction is a new row that points at the old value, "
            "and a dispute is a row that points at both parties' statements.", size=9.4)
    notes(s, "The important design decision: nothing is mutated in place. A correction is data, "
             "not a UI action that hides the past.")


# ==========================================================================
# 13 · WORKED EXAMPLE
# ==========================================================================
def s13():
    s, y = cslide(13, 3, "One wage, calculated in the open",
                  "The demonstration record used throughout the project. Every number below is "
                  "produced by the same function that renders the portals.")
    C = s.shapes
    rows = [("Agreed daily rate", "₹650.00", INK, WHITE),
            ("Recorded work", "4 days × 8 h", INK, WHITE),
            ("Wages due   4 × 650", "₹2,600.00", INK, WHITE),
            ("Payment recorded by contractor", "− ₹1,300.00", EMERALD_DK, WHITE),
            ("Worker acknowledgement", "Pending", BRASS_DK, PAPER_DEEP),
            ("Outstanding balance", "₹1,300.00", INK, PAPER_DEEP)]
    for i, (lab, val, vc, bgc) in enumerate(rows):
        yy = 2.66 + i * 0.66
        last = i == 5
        shape(C, "round", f"w{i}", 4.16, yy, 5.10, 0.58, fill=bgc if not last else FOREST,
              line=PAPER_LINE if not last else None, lw=0.9, radius=0.08)
        textbox(C, f"wl{i}", 4.42, yy + 0.05, 3.30, 0.48,
                [P(lab, font=K.BODY, size=10.6, color=WHITE if last else INK,
                   bold=last, spc=20)], anchor="m")
        textbox(C, f"wv{i}", 7.55, yy + 0.05, 1.58, 0.48,
                [P(val, font=K.MONO, size=11.4, color=BRASS if last else vc, bold=True)],
                anchor="m", )
    shape(C, "round", "result", 9.55, 2.66, 3.17, 3.28, fill=FOREST, radius=0.11,
          shadow=True)
    textbox(C, "rlab", 9.80, 2.90, 2.7, 0.24,
            [eyebrow("Status", BRASS, 7.6, 220)])
    textbox(C, "rstat", 9.78, 3.08, 2.8, 0.46,
            [P("PARTLY PAID", font=K.DISPLAY, size=21, color=BRASS, bold=True)])
    textbox(C, "rack", 9.80, 3.60, 2.62, 0.66,
            [body("₹1,300 recorded by the contractor, ₹1,300 outstanding, worker acknowledgement "
                  "still pending.", 8.2, MINT, 1.2)])
    K.line_h(C, "rrule", 9.80, 4.32, 2.62, "2C5A47", 1.0)
    textbox(C, "rmath", 9.80, 4.44, 2.62, 1.30,
            [P("In integer paise", font=K.BODY, size=7.4, color=BRASS, bold=True, spc=180),
             P("65,000 × 4 = 2,60,000", font=K.MONO, size=8.6, color=WHITE),
             P("2,60,000 − 1,30,000", font=K.MONO, size=8.6, color=WHITE),
             P("= 1,30,000 paise", font=K.MONO, size=8.6, color=BRASS_LT, bold=True),
             P("= ₹1,300.00 exactly", font=K.MONO, size=8.6, color=BRASS_LT, bold=True)])
    textbox(C, "wfoot", 4.16, 6.70, 5.1, 0.30,
            [body("4 × 650 = 2,600  and  2,600 − 1,300 = 1,300", 9.4, INK3, 1.1)])
    notes(s, "Walk the six rows out loud. The last row is the one that matters: the balance is derived, "
             "not typed. Then say the paise line, which is the engineering detail that stops rounding drift. "
             "If asked about the status word: the report's inspector shows this record as unpaid until the "
             "worker acknowledges; we label it partly paid so the recorded ₹1,300 is not hidden.")


# ==========================================================================
# 14 · ENGINE INTERNALS
# ==========================================================================
def s14():
    s, y = cslide(14, 3, "One function, no surprises",
                  "calculateRecordBreakdown is the only place a rupee is computed. Portals render it; "
                  "they never recalculate it.")
    C = s.shapes
    banner = shape(C, "round", "fx", 4.16, 2.62, 8.56, 1.00, fill=FOREST, radius=0.09,
                   shadow=True)
    textbox(C, "fxtext", 4.42, 2.70, 8.05, 0.84,
            [Para(runs=[Run("(Days × Rate) + Overtime + Allowances − Deductions = Gross",
                            K.MONO, 10.6, WHITE, True)], space_after=2),
             Para(runs=[Run("Gross − Payments = Balance", K.MONO, 10.6, BRASS, True)])],
            anchor="m")
    cards = [("Integer paise", "Money is stored as whole paise and rounded once. 65000 paise, not "
              "650.0 — so four days never accumulates a floating-point cent.", EMERALD),
             ("Shift-aware", "full_day, half_day (× 0.5), and pro-rata overtime at rate ÷ 8 per hour, "
              "so a 2-hour extension is arithmetic, not negotiation.", BRASS),
             ("De-duplicated", "Ledger entries are keyed by ID, and payments only ever reduce the "
              "balance — they never count as new earnings.", EMERALD_DK)]
    w = (8.56 - 0.40) / 3
    for i, (t, d, acc) in enumerate(cards):
        x = 4.16 + i * (w + 0.20)
        shape(C, "round", f"k{i}", x, 3.82, w, 1.60, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.11, shadow=True)
        shape(C, "rect", f"kh{i}", x, 3.82, w, 0.06, fill=acc)
        textbox(C, f"kt{i}", x + 0.22, 4.02, w - 0.40, 0.30,
                [P(t, font=K.BODY, size=12.0, color=INK, bold=True)])
        textbox(C, f"kd{i}", x + 0.22, 4.34, w - 0.40, 0.98,
                [body(d, 8.9, INK2, 1.22)])
    callout(C, "det", 4.16, 5.62, 8.56, 1.10,
            "Deterministic: the same record renders the same figures on the worker's phone, the "
            "contractor's laptop and the audit bench — because there is only one implementation of "
            "the arithmetic, not three.", size=9.8, accent=EMERALD)
    notes(s, "If a judge asks one technical question, hope it is this one. One function, integer "
             "paise, explicit rounding, payments treated as credits against the balance.")


# ==========================================================================
# 15 · PAYMENT STATES
# ==========================================================================
def s15():
    s, y = cslide(15, 3, "Payment states are separate",
                  "The single most common source of dispute is treating 'the contractor typed it' as "
                  "'the worker received it'.")
    C = s.shapes
    st = [("01", "Unpaid", "Nothing recorded against the balance", "E8855E", CLAY),
          ("02", "Recorded", "Contractor enters a payment — an assertion, not a receipt", BRASS, BRASS_DK),
          ("03", "Acknowledged", "Worker confirms receipt on their own account", EMERALD, EMERALD_DK),
          ("04", "Disputed", "Both statements stored; nothing auto-resolved", "7C8F85", FOREST_MID)]
    w = 1.86
    for i, (n, t, d, col, acc) in enumerate(st):
        x = 4.16 + i * 2.30
        shape(C, "round", f"p{i}", x, 2.72, w, 1.72, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.11, shadow=True)
        shape(C, "round", f"ph{i}", x, 2.72, w, 0.40, fill=acc, radius=0.10)
        textbox(C, f"pn{i}", x + 0.16, 2.76, w - 0.3, 0.32,
                [P(n, font=K.BODY, size=8.0, color=WHITE, bold=True, spc=180)], anchor="m")
        textbox(C, f"pt{i}", x + 0.16, 3.24, w - 0.3, 0.28,
                [P(t, font=K.BODY, size=11.6, color=INK, bold=True)])
        textbox(C, f"pd{i}", x + 0.16, 3.56, w - 0.30, 0.78,
                [body(d, 8.4, INK2, 1.2)])
        if i < 3:
            arrow_right(C, f"pa{i}", x + w + 0.06, 3.58, w=0.30)
    callout(C, "c1", 4.16, 4.78, 4.17, 1.32,
            "Partly paid is not a fifth state — it is a balance. ₹2,600 due with ₹1,300 recorded "
            "is simply ₹1,300 outstanding.", size=9.4, accent=EMERALD)
    callout(C, "c2", 8.55, 4.78, 4.17, 1.32,
            "Disputed keeps the record visible. The system holds both claims and declines to "
            "declare who is right.", size=9.4, accent=CLAY, fill=FOREST)
    textbox(C, "n", 4.16, 6.30, 8.5, 0.30,
            [body("Contractor-entered payments never mutate earnings — they only reduce the balance due.",
                  9.4, INK3, 1.1)])
    notes(s, "This is the slide that answers 'so what?'. Two people can look at the same ledger and "
             "still see different states, because the states are honestly distinguished.")


# ==========================================================================
# 16 · CORRECTION HISTORY
# ==========================================================================
def s16():
    s, y = cslide(16, 3, "A correction keeps the value it replaced",
                  "The demonstration record was registered at a helper's rate and later corrected. "
                  "Both values survive, with the reason attached.")
    C = s.shapes
    # original
    shape(C, "round", "orig", 4.16, 2.74, 3.55, 1.72, fill=WHITE, line=PAPER_LINE, lw=0.9,
          radius=0.11, shadow=True)
    textbox(C, "ol", 4.40, 2.92, 3.0, 0.24, [eyebrow("Original rate", INK3, 7.6, 200)])
    textbox(C, "ov", 4.38, 3.14, 3.0, 0.58, [P("₹550", font=K.DISPLAY, size=30, color=INK3,
                                                bold=True)])
    textbox(C, "od", 4.40, 3.78, 3.05, 0.50, [body("Helper category · registered at the gate",
                                                   8.4, INK3, 1.15)])
    arrow_right(C, "carr", 7.82, 3.60, w=0.44, color=BRASS_DK, h=0.24)
    # current
    shape(C, "round", "cur", 8.36, 2.74, 4.36, 1.72, fill=WHITE, line=BRASS_DK, lw=1.2,
          radius=0.11, shadow=True)
    textbox(C, "cl", 8.60, 2.92, 3.6, 0.24, [eyebrow("Current rate", BRASS_DK, 7.6, 200)])
    textbox(C, "cv", 8.58, 3.14, 2.4, 0.58, [P("₹650", font=K.DISPLAY, size=30, color=INK,
                                                bold=True)])
    pill(C, "flag", 10.86, 3.20, 1.62, 0.34, "RULE-03", fill=CLAY, size=8.2)
    textbox(C, "cd", 8.60, 3.78, 3.9, 0.50,
            [body("Skilled category · corrected after the shift was closed", 8.4, INK2, 1.15)])
    # audit strip
    fields = [("Reason stated", "Corrected from the helper rate (₹550) to the skilled rate (₹650)", BRASS_DK),
              ("Actor + time", "Contractor role · timestamped at edit", EMERALD),
              ("Tamper flag", "None — the prior value is still in the audit trail", EMERALD)]
    for i, (k, v, acc) in enumerate(fields):
        yy = 4.72 + i * 0.52
        shape(C, "rect", f"fr{i}", 4.16, yy, 0.05, 0.42, fill=acc)
        textbox(C, f"fk{i}", 4.36, yy + 0.02, 1.55, 0.38, [P(k, font=K.BODY, size=8.6,
                                                             color=acc, bold=True, spc=40)],
                anchor="m")
        textbox(C, f"fv{i}", 5.98, yy + 0.02, 6.70, 0.38, [body(v, 9.4, INK, 1.1)], anchor="m")
    callout(C, "guide", 4.16, 6.30, 8.56, 0.68,
            "Mediation guidance is neutral: review the stated justification and the worker's "
            "acceptance state. The system does not judge intent.", size=9.2, accent=BRASS)
    notes(s, "The point is the word preserved. A payroll app would show ₹650 and move on; the "
             "dispute turns on the fact that it was once ₹550.")


# ==========================================================================
# 17 · HASH CHAIN
# ==========================================================================
def s17():
    s, y = cslide(17, 4, "SHA-256: a chain of records",
                  "Each block hashes a canonical string built from its own fields plus the previous "
                  "block's digest. Eight blocks ship in the demo ledger.")
    C = s.shapes
    blocks = [("Block 06", "a41f…9c02", "8f2c…41de", False),
              ("Block 07", "8f2c…41de", "c77b…0a19", False),
              ("Block 08", "c77b…0a19", "3a7e…b640", True)]
    for i, (t, prev, h, hi) in enumerate(blocks):
        x = 4.16 + i * 2.92
        shape(C, "round", f"b{i}", x, 2.70, 2.62, 1.66, fill=FOREST if hi else WHITE,
              line=BRASS_DK if hi else PAPER_LINE, lw=1.2 if hi else 0.9, radius=0.10,
              shadow=not hi)
        textbox(C, f"bt{i}", x + 0.20, 2.84, 2.2, 0.24,
                [P(t, font=K.BODY, size=9.0, color=BRASS if hi else INK3, bold=True, spc=140)])
        textbox(C, f"bp{i}", x + 0.20, 3.10, 2.3, 0.22,
                [mono("prev  " + prev, 7.8, BRASS_LT if hi else INK3)])
        textbox(C, f"bh{i}", x + 0.20, 3.36, 2.3, 0.26,
                [mono("hash  " + h, 7.8, WHITE if hi else INK, True)])
        textbox(C, f"bd{i}", x + 0.20, 3.68, 2.25, 0.55,
                [body("date · rate · hours · earned", 7.8, MINT if hi else INK3, 1.15)])
        if i < 2:
            arrow_right(C, f"ba{i}", x + 2.66, 3.52, w=0.24)
    # canonical string
    shape(C, "round", "cs", 4.16, 4.62, 5.28, 2.02, fill=FOREST_MID, radius=0.09)
    textbox(C, "csl", 4.38, 4.76, 4.8, 0.24,
            [eyebrow("Canonical serialisation · keys sorted", BRASS, 7.4, 180)])
    textbox(C, "csv", 4.38, 4.98, 4.85, 1.30,
            [mono('{"date":"2026-10-12",', 8.2, WHITE),
             mono(' "earned":2600,', 8.2, WHITE),
             mono(' "hours":8,', 8.2, WHITE),
             mono(' "prevHash":"c77b…0a19",', 8.2, BRASS_LT),
             mono(' "rate":650}', 8.2, WHITE)])
    textbox(C, "cscap", 4.38, 6.28, 4.85, 0.26,
            [body("keys sorted · nulls preserved · floats normalised", 7.8, MINT, 1.1)])
    # result
    shape(C, "round", "res", 9.68, 4.62, 3.04, 2.02, fill=WHITE, line=PAPER_LINE, lw=0.9,
          radius=0.09, shadow=True)
    pill(C, "valid", 9.92, 4.86, 2.10, 0.40, "VALID SHA-256", fill=EMERALD, size=8.6)
    textbox(C, "rest", 9.92, 5.36, 2.6, 0.90,
            [body("Recomputed digest matches the stored one and the predecessor link is intact.",
                  8.2, INK2, 1.18)])
    textbox(C, "resb", 9.92, 6.18, 2.6, 0.30, [mono("→ integrity check passed", 7.8, EMERALD_DK, True)])
    notes(s, "Show that the hash covers the predecessor. That single design choice is what turns a "
             "list of rows into a chain that notices its own edits.")


# ==========================================================================
# 18 · WHAT THE CHAIN DOES / DOESN'T PROVE  (dark)
# ==========================================================================
def s18():
    s = dslide(18, 4)
    C = s.shapes
    textbox(C, "eyebrow", 0.90, 1.46, 6.0, 0.26,
            [eyebrow("Honest scope", BRASS, 8.6, 260)])
    htext = "What the chain proves — and what it does not"
    hsize = K.fit_size(htext, 8.45, 25, 17)
    textbox(C, "h", 0.86, 1.80, 8.5, 0.72, [display(htext, hsize, WHITE, bold=True)])
    yes = ["These bytes have not changed since they were chained",
           "The link to the previous record is intact",
           "A deliberate edit produces a visible mismatch",
           "Worker and contractor verify the same digest"]
    no = ["That the original entry was true",
          "That the person was physically present",
          "Safety against someone who controls the storage and recomputes every hash",
          "That this is a blockchain — it is not"]
    for col, (title, items, acc, mark) in enumerate(
            [("It does prove", yes, MINT, "✓"), ("It cannot prove", no, "F1937A", "×")]):
        x = 0.90 + col * 4.42
        shape(C, "round", f"col{col}", x, 2.62, 4.10, 3.40, fill=FOREST_MID, radius=0.11)
        shape(C, "rect", f"colb{col}", x, 2.62, 4.10, 0.06, fill=acc)
        textbox(C, f"colt{col}", x + 0.26, 2.82, 3.5, 0.30,
                [P(title, font=K.BODY, size=12.4, color=acc, bold=True)])
        for i, it in enumerate(items):
            yy = 3.24 + i * 0.66
            textbox(C, f"cm{col}{i}", x + 0.26, yy - 0.02, 0.28, 0.26,
                    [P(mark, font=K.BODY, size=10.5, color=acc, bold=True)])
            textbox(C, f"ci{col}{i}", x + 0.56, yy - 0.02, 3.28, 0.64,
                    [body(it, 9.2, WHITE, 1.2)])
    textbox(C, "foot", 0.90, 6.28, 9.0, 0.30,
            [body("A valid hash is evidence of integrity, not of truth.", 10.0, BRASS_LT,
                  1.1, bold=True, italic=True)])
    notes(s, "Say both columns out loud. Judges reward a team that can state the limits of its own "
             "mechanism without being asked.")


# ==========================================================================
# 19 · SEVEN RULES
# ==========================================================================
def s19():
    s, y = cslide(19, 4, "Seven rules, no machine learning",
                  "Every flag is a comparison against a configured threshold or a stated value — "
                  "reproducible, explainable and never an accusation.")
    C = s.shapes
    rules = [("RULE-01", "Duplicate date entries", "Same worker, same calendar day, two records", EMERALD),
             ("RULE-02", "Excessive continuous shift", "More than the configured limit, e.g. 12 h", EMERALD),
             ("RULE-03", "Retroactive modification", "Rate or hours changed after the shift closed", CLAY),
             ("RULE-04", "Payment reconciliation gap", "Wages due vs payments vs acknowledgements", BRASS),
             ("RULE-05", "Unreasoned deduction", "A deduction with an empty reason field", CLAY),
             ("RULE-06", "Overdue balance", "Balance older than the configured limit", BRASS),
             ("RULE-07", "Benchmark comparison", "Agreed rate below a configured reference value", BRASS_DK)]
    for i, (rid, t, d, acc) in enumerate(rules):
        col, row = (0, i) if i < 4 else (1, i - 4)
        x = 4.16 + col * 4.39
        yy = 2.66 + row * 0.96
        shape(C, "round", f"r{i}", x, yy, 4.17, 0.86, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.09)
        shape(C, "rect", f"rl{i}", x, yy + 0.14, 0.05, 0.58, fill=acc)
        pill(C, f"rid{i}", x + 0.20, yy + 0.14, 0.86, 0.26, rid, fill=acc, size=7.0, spc=60)
        textbox(C, f"rt{i}", x + 1.16, yy + 0.12, 2.85, 0.28,
                [P(t, font=K.BODY, size=10.4, color=INK, bold=True)])
        textbox(C, f"rd{i}", x + 1.16, yy + 0.42, 2.85, 0.40,
                [body(d, 8.3, INK2, 1.14)])
    callout(C, "note", 8.55, 5.62, 4.17, 1.20,
            "Thresholds are configurable and are not presented as legal rules. The system flags "
            "for review; it does not judge intent.", size=8.8, accent=BRASS)
    notes(s, "Explain why rule-based and not ML: a wage dispute needs a reason a worker can read, "
             "and a deterministic check can always print the exact values it compared.")


# ==========================================================================
# 20 · RULE OUTPUT
# ==========================================================================
def s20():
    s, y = cslide(20, 4, "What a flag actually looks like",
                  "RULE-03 output from the interface: the trigger, the exact values examined, and a "
                  "guidance note that assigns blame to nobody.")
    C = s.shapes
    shape(C, "round", "panel", 4.16, 2.66, 5.12, 3.92, fill=WHITE, line=PAPER_LINE, lw=0.9,
          radius=0.10, shadow=True)
    shape(C, "round", "phead", 4.16, 2.66, 5.12, 0.46, fill=FOREST, radius=0.10)
    pill(C, "pid", 4.38, 2.76, 0.94, 0.26, "RULE-03", fill=CLAY, size=7.2)
    textbox(C, "pht", 5.44, 2.76, 3.5, 0.26,
            [P("Retroactive record modification", font=K.BODY, size=8.8, color=WHITE, bold=True)])
    fields = [("Trigger reason", "“Record modified retroactively after initial registration.”", INK),
              ("Values examined", "Original rate ₹550  →  current rate ₹650", INK),
              ("Stated reason", "Corrected from helper rate (₹550) to skilled rate (₹650)", INK),
              ("Tamper flag", "None", EMERALD_DK)]
    for i, (k, v, vc) in enumerate(fields):
        yy = 3.30 + i * 0.80
        textbox(C, f"pk{i}", 4.42, yy, 1.42, 0.24,
                [eyebrow(k, INK3, 7.0, 150)])
        textbox(C, f"pv{i}", 4.42, yy + 0.24, 4.55, 0.50,
                [body(v, 9.2, vc, 1.18)])
        if i < 3:
            K.line_h(C, f"pl{i}", 4.42, yy + 0.76, 4.55, PAPER_LINE, 0.9)
    shape(C, "round", "guide", 9.52, 2.66, 3.20, 1.92, fill=FOREST, radius=0.10, shadow=True)
    textbox(C, "gl", 9.74, 2.84, 2.8, 0.24, [eyebrow("Neutral guidance", BRASS, 7.2, 180)])
    textbox(C, "gt", 9.74, 3.10, 2.78, 1.36,
            [body("The prior value is preserved in the audit trail. Review the stated justification "
                  "and the worker's acceptance state.", 8.8, WHITE, 1.24)])
    shape(C, "round", "dna", 9.52, 4.74, 3.20, 1.84, fill=PAPER_DEEP, radius=0.10)
    textbox(C, "dl", 9.74, 4.92, 2.8, 0.24, [eyebrow("Deterministic by design", EMERALD_DK, 7.0, 160)])
    textbox(C, "dt", 9.74, 5.18, 2.78, 1.28,
            [body("No model, no score, no probability. The same inputs always produce the same "
                  "finding and the same printed values.", 8.6, INK2, 1.22)])
    notes(s, "This is a replica of the real panel. Point out that the reason text is kept verbatim — "
             "the system stores the human explanation, not a category code.")


# ==========================================================================
# 21 · QR SECURITY
# ==========================================================================
def s21():
    s, y = cslide(21, 4, "QR identifies — it does not secure",
                  "The pass carries an opaque reference. Everything that decides access happens "
                  "somewhere else.")
    C = s.shapes
    trio = [("Identification", "Which worker record does this code refer to?",
             "The QR answers this, and nothing else.", EMERALD),
            ("Authentication", "Is the person acting really that worker?",
             "Not answered by a scan. Needs an account and a credential.", BRASS),
            ("Authorization", "What is this person allowed to do?",
             "Row-level rules, not the printed code.", CLAY)]
    for i, (t, q, a, acc) in enumerate(trio):
        yy = 2.66 + i * 1.36
        shape(C, "round", f"q{i}", 4.16, yy, 5.36, 1.20, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.09, shadow=True)
        shape(C, "rect", f"qb{i}", 4.16, yy, 0.06, 1.20, fill=acc)
        textbox(C, f"qt{i}", 4.42, yy + 0.14, 2.4, 0.26,
                [P(t, font=K.BODY, size=10.8, color=acc, bold=True, spc=40)])
        textbox(C, f"qq{i}", 4.42, yy + 0.42, 4.9, 0.28,
                [body(q, 8.8, INK, 1.1, bold=True)])
        textbox(C, f"qa{i}", 4.42, yy + 0.70, 4.9, 0.40,
                [body(a, 8.4, INK2, 1.12)])
    shape(C, "round", "qrbox", 9.86, 2.66, 2.86, 2.86, fill=WHITE, line=BRASS_DK, lw=1.2,
          radius=0.08, shadow=True)
    K.picture(C, "qr", QR, 10.08, 2.88, 2.42, 2.42, border=None, shadow=False)
    textbox(C, "qrcap", 9.86, 5.60, 2.86, 0.50,
            [body("Public verification page — opens with the token, shows no private wage data.",
                  7.8, INK3, 1.15)])
    callout(C, "risk", 4.16, 6.28, 5.36, 0.64,
            "A static QR can be photographed and reprinted. It is a reference, not a credential.",
            size=8.8, accent=CLAY)
    notes(s, "If asked 'isn't a QR insecure?': yes, and we say so. The QR only resolves an opaque "
             "reference; the security boundary is authentication and row-level authorization.")


# ==========================================================================
# 22 · APPROVAL WORKFLOW
# ==========================================================================
def s22():
    s, y = cslide(22, 4, "Approval across devices (planned)",
                  "The intended flow needs a shared backend before it can work between two phones. "
                  "In the demo it is simulated locally and labelled as such.")
    C = s.shapes
    steps = ["Contractor scans the worker's reusable QR",
             "Site resolves the worker reference",
             "Backend creates a pending request",
             "Worker signs in on their own device",
             "Worker approves or rejects",
             "Outcome recorded with full history",
             "Contractor sees the status after sync"]
    X = [4.16, 6.36, 8.56, 10.76]
    for i, st in enumerate(steps):
        row, col = (0, i) if i < 4 else (1, i - 4)
        x = X[col]
        yy = 2.66 + row * 1.30
        shape(C, "round", f"wf{i}", x, yy, 1.95, 1.06, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.09, shadow=True)
        label(C, f"wn{i}", x + 0.16, yy + 0.14, 0.30, 0.30,
              [P(str(i + 1), font=K.BODY, size=8.6, color=WHITE, bold=True, align="c")],
              fill=EMERALD, kind="round", radius=0.06, margins=(0, 0, 0, 0))
        textbox(C, f"wt{i}", x + 0.16, yy + 0.50, 1.64, 0.50,
                [body(st, 8.0, INK, 1.16)])
        if i in (0, 1, 2):
            arrow_right(C, f"wa{i}", x + 1.97, yy + 0.50, w=0.20)
        if i == 4:
            arrow_right(C, f"wa{i}", x + 1.97, yy + 0.50, w=0.20)
        if i == 5:
            arrow_right(C, f"wa{i}", x + 1.97, yy + 0.50, w=0.20)
    # why-not card occupies the 4th cell of row 2
    shape(C, "round", "why", X[3], 3.96, 1.95, 1.06, fill=PAPER_DEEP, radius=0.09)
    textbox(C, "whyl", X[3] + 0.16, 4.06, 1.66, 0.22,
            [eyebrow("Why it cannot work yet", BRASS_DK, 6.4, 120)])
    textbox(C, "whyt", X[3] + 0.16, 4.30, 1.64, 0.64,
            [body("IndexedDB lives in one browser. Another device cannot read it.", 7.4, INK2, 1.14)])
    callout(C, "disc", 4.16, 5.28, 8.56, 0.96,
            "Demo disclaimer shown in the UI: “In Local Demo Mode this approval request is simulated "
            "locally via IndexedDB. Multi-device sync will be enabled with Supabase deployment.”",
            size=9.2, accent=CLAY)
    textbox(C, "tail", 4.16, 6.46, 8.56, 0.44,
            [body("What a real deployment needs: an authenticated account per worker, a pending-request "
                  "table, and row-level security so a request is visible only to its owner.", 8.8,
                  INK3, 1.16)])
    notes(s, "Be explicit: this is the one workflow we could not complete without a backend, so we "
             "simulated it and labelled the simulation inside the product.")


# ==========================================================================
# 23 · OFFLINE
# ==========================================================================
def s23():
    s, y = cslide(23, 4, "Offline-first, honestly bounded",
                  "IndexedDB really does work without a network — and really does not follow the "
                  "worker to another phone.")
    C = s.shapes
    shape(C, "round", "now", 4.16, 2.66, 4.17, 3.42, fill=WHITE, line=PAPER_LINE, lw=0.9,
          radius=0.11, shadow=True)
    shape(C, "rect", "nowb", 4.16, 2.66, 4.17, 0.06, fill=EMERALD)
    textbox(C, "nowt", 4.42, 2.86, 3.6, 0.28, [P("Works today", font=K.BODY, size=12.0,
                                                  color=INK, bold=True)])
    now = ["Records survive a refresh and a closed tab",
           "Structured object stores, larger than localStorage",
           "In-memory fallback for tests and fresh browsers",
           "Restores the baseline demo state in one call"]
    for i, it in enumerate(now):
        yy = 3.26 + i * 0.66
        shape(C, "oval", f"nd{i}", 4.44, yy + 0.06, 0.10, 0.10, fill=EMERALD)
        textbox(C, f"nt{i}", 4.66, yy, 3.45, 0.60, [body(it, 9.0, INK2, 1.18)])

    shape(C, "round", "plan", 8.55, 2.66, 4.17, 3.42, fill=FOREST, radius=0.11, shadow=True)
    shape(C, "rect", "plb", 8.55, 2.66, 4.17, 0.06, fill=BRASS)
    textbox(C, "plt", 8.81, 2.86, 3.6, 0.28, [P("Planned, not built", font=K.BODY, size=12.0,
                                                  color=WHITE, bold=True)])
    plan = ["PWA service worker so the site loads offline",
            "Sync queue of pending operations",
            "Duplicate-submission detection",
            "Conflicts preserved, never silently overwritten"]
    for i, it in enumerate(plan):
        yy = 3.26 + i * 0.66
        shape(C, "oval", f"pd{i}", 8.83, yy + 0.06, 0.10, 0.10, fill=BRASS)
        textbox(C, f"pt{i}", 9.05, yy, 3.45, 0.60, [body(it, 9.0, MINT, 1.18)])
    callout(C, "cav", 4.16, 6.24, 8.56, 0.66,
            "Storage can be cleared by the user or the browser, and anyone who controls the device "
            "can read it. Local demo mode is a demonstration, not a deployment.", size=8.8, accent=CLAY)
    notes(s, "This is where most school projects overclaim. Say plainly: offline works within one "
             "browser; cross-device needs a backend.")


# ==========================================================================
# 24 · PRIVACY
# ==========================================================================
def s24():
    s, y = cslide(24, 4, "Privacy and governance",
                  "Collect less, separate public references from private wages, and never let a "
                  "correction quietly disappear.")
    C = s.shapes
    items = [("Data minimisation", "Only what a wage record needs. The demo uses synthetic names and "
              "identifiers throughout.", EMERALD),
             ("Opaque references", "A QR token does not print a name, a rate or a wage history.", BRASS),
             ("Intact history", "Export, import and correction must preserve the prior value, not "
              "replace it.", EMERALD_DK),
             ("Access, not luck", "Row-level rules decide who may read a record — not who holds a "
              "printed code.", CLAY)]
    w = (8.56 - 0.20) / 2
    for i, (t, d, acc) in enumerate(items):
        x = 4.16 + (i % 2) * (w + 0.20)
        yy = 2.66 + (i // 2) * 1.42
        shape(C, "round", f"pv{i}", x, yy, w, 1.26, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.10, shadow=True)
        shape(C, "rect", f"pvb{i}", x, yy, 0.06, 1.26, fill=acc)
        textbox(C, f"pvt{i}", x + 0.28, yy + 0.16, w - 0.5, 0.28,
                [P(t, font=K.BODY, size=11.4, color=INK, bold=True)])
        textbox(C, f"pvd{i}", x + 0.28, yy + 0.46, w - 0.52, 0.66,
                [body(d, 8.8, INK2, 1.18)])
    callout(C, "disc", 4.16, 5.62, 8.56, 1.20,
            "We do not claim compliance with any data-protection statute. That would need a separate "
            "legal analysis of the applicable requirements and the actual deployment configuration — "
            "which this prototype does not have.", size=9.2, accent=BRASS)
    notes(s, "Explicitly refuse the compliance claim. It is the single easiest way to lose credibility "
             "with a judging panel that knows the law.")


# ==========================================================================
# 25 · DEMO BENCH
# ==========================================================================
def s25():
    s, y = cslide(25, 5, "The demo bench and its dataset",
                  "One shared dataset drives the worker portal, the contractor portal and the audit "
                  "bench — so a change in one is visible in the others.")
    C = s.shapes
    stats = [("8", "ledger blocks", EMERALD), ("4", "workers", EMERALD),
             ("2", "disputes", BRASS), ("2", "approval requests", BRASS)]
    w = (5.36 - 3 * 0.14) / 4
    for i, (v, l, acc) in enumerate(stats):
        x = 4.16 + i * (w + 0.14)
        shape(C, "round", f"ds{i}", x, 2.66, w, 0.96, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.09, shadow=True)
        textbox(C, f"dv{i}", x + 0.16, 2.74, w - 0.3, 0.40,
                [P(v, font=K.DISPLAY, size=19, color=acc, bold=True)])
        textbox(C, f"dl{i}", x + 0.16, 3.18, w - 0.26, 0.34,
                [body(l, 7.8, INK3, 1.1)])
    textbox(C, "site", 4.16, 3.78, 5.4, 0.50,
            [Para(runs=[Run("Site  ", K.BODY, 8.6, INK3, True, spc=120),
                        Run("Super Corridor IT Park Phase-2", K.BODY, 9.6, INK, True)]),
             Para(runs=[Run("Firm  ", K.BODY, 8.6, INK3, True, spc=120),
                        Run("M/s Sharma Infra Pvt Ltd  ·  Ramesh Verma, Sunita Bai, Vikram Singh, Dilip Solanki (synthetic)",
                            K.BODY, 9.2, INK2)])])
    card(C, "sc", 4.16, 4.62, 5.40, 2.05, "Twelve scenarios on the bench",
         "Partially paid · unpaid · fully paid and acknowledged · payment awaiting acknowledgement · "
         "dispute with both statements · correction with preserved value · legitimate multi-day record · "
         "duplicate shift (RULE-01) · unreasoned deduction (RULE-05) · corrupted hash · clean-baseline "
         "verification · resetToBaseline()", accent=EMERALD, bsize=8.5, tsize=11.6)
    shape(C, "round", "ph2", 9.80, 2.66, 2.92, 2.30, fill=WHITE, line=PAPER_LINE, lw=0.9,
          radius=0.09, shadow=True)
    K.rounded_picture(C, "photo2", MUSTER, 9.86, 2.72, 2.80, 2.18, (0.10, 0.30, 0.05, 0.24),
                      radius=0.07, border=None, shadow=False)
    callout(C, "tail", 9.80, 5.10, 2.92, 1.82,
            "Every screen reads the same seeded store, so a tampered hash in the audit bench is "
            "immediately visible in both portals.", size=8.4, accent=BRASS)
    notes(s, "If you have a laptop, this is where you switch to the live app. The bench exists so a "
             "judge can deliberately corrupt a record and watch the badge flip.")


# ==========================================================================
# 26 · TESTS
# ==========================================================================
def s26():
    s, y = cslide(26, 5, "Reported results, honestly labelled",
                  "39 assertions across four suites, a clean type-check and a clean production build — "
                  "all from the implementation verification report.")
    C = s.shapes
    cols = [3.10, 1.50, 1.90, 2.06]
    xs = [4.16, 4.16 + 3.10, 4.16 + 4.60, 4.16 + 6.50]
    table(C, "tt", 4.16, 2.66, xs, cols,
          ["Suite", "Assertions", "Result", "Evidence"],
          [["Audit & ledger integrity", "23 / 23", "Passed (reported)", "Verification report"],
           ["IndexedDB & repository", "6 / 6", "Passed (reported)", "test-indexeddb-repository"],
           ["Supabase adapter & migrations", "5 / 5", "Passed (reported)", "test-supabase-adapter"],
           ["Simulated approvals", "5 / 5", "Passed (reported)", "test-approvals-simulation"],
           ["Type check / lint", "0 errors", "Passed (reported)", "npm run lint"],
           ["Production build", "Clean", "Passed (reported)", "npm run build (Vite)"]],
          [0.50, 0.50, 0.50, 0.50, 0.50, 0.50], size=8.8)
    shape(C, "round", "tot", 4.16, 6.18, 5.10, 0.78, fill=FOREST, radius=0.10, shadow=True)
    textbox(C, "totn", 4.40, 6.24, 1.1, 0.66,
            [P("39", font=K.DISPLAY, size=27, color=BRASS, bold=True)], anchor="m")
    textbox(C, "tott", 5.50, 6.26, 3.60, 0.66,
            [P("assertions passed", font=K.BODY, size=11.0, color=WHITE, bold=True),
             P("across four suites", font=K.BODY, size=8.6, color=MINT)],
            anchor="m")
    shape(C, "round", "cav", 9.46, 6.18, 3.26, 0.78, fill=PAPER_DEEP, radius=0.10)
    textbox(C, "cavt", 9.68, 6.24, 2.86, 0.66,
            [body("Not independently reproduced for the report. The lab tests synthetic data only.",
                  8.2, INK2, 1.16)], anchor="m")
    notes(s, "Say 'reported' every time. This is an honesty cue: the numbers come from our verification "
             "report, and the report itself says so.")


# ==========================================================================
# 27 · COST
# ==========================================================================
def s27():
    s, y = cslide(27, 5, "What it costs",
                  "The prototype runs at zero marginal cost, and the first real deployment target is a "
                  "free tier that a school can actually sustain.")
    C = s.shapes
    cards = [("₹0", "Hardware", "NFC tags and readers were removed from the design entirely. A printed "
              "QR pass costs a sheet of paper.", EMERALD),
             ("₹0", "Tooling", "React, TypeScript, Vite, IndexedDB and the Web Crypto API are free and "
              "open source. Browser storage has no fee.", EMERALD_DK),
             ("Free → ~$10", "Backend", "Supabase free plan: 500 MB database, 5 GB egress, 50,000 MAU, "
              "1 GB storage. Paid compute starts near $10/month.", BRASS)]
    w = (8.56 - 0.40) / 3
    for i, (v, t, d, acc) in enumerate(cards):
        x = 4.16 + i * (w + 0.20)
        shape(C, "round", f"co{i}", x, 2.66, w, 2.36, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.11, shadow=True)
        shape(C, "rect", f"cb{i}", x, 2.66, w, 0.06, fill=acc)
        textbox(C, f"cv{i}", x + 0.24, 2.86, w - 0.4, 0.56,
                [P(v, font=K.DISPLAY, size=24 if len(v) < 6 else 17, color=INK, bold=True)])
        textbox(C, f"ct{i}", x + 0.24, 3.48, w - 0.4, 0.28,
                [P(t.upper(), font=K.BODY, size=7.8, color=acc if acc != BRASS else BRASS_DK,
                   bold=True, spc=180)])
        textbox(C, f"cd{i}", x + 0.24, 3.80, w - 0.44, 1.10,
                [body(d, 8.8, INK2, 1.2)])
    callout(C, "note", 4.16, 5.26, 5.36, 1.56,
            "Free tiers pause, quota and change. Figures were checked against Supabase's own "
            "documentation in October 2026 and should be re-checked before any deployment decision.",
            size=9.0, accent=BRASS)
    shape(C, "round", "sep", 9.72, 5.26, 3.0, 1.56, fill=PAPER_DEEP, radius=0.10)
    textbox(C, "sepl", 9.92, 5.40, 2.6, 0.24, [eyebrow("Not estimated", BRASS_DK, 7.0, 160)])
    textbox(C, "sept", 9.92, 5.66, 2.62, 1.06,
            [body("A real deployment needs backups, authentication and maintenance. Those depend on "
                  "volume we do not have.", 8.2, INK2, 1.18)])
    notes(s, "The cost slide exists because a school project must be affordable. Zero hardware is the "
             "headline; the honest caveat is that real operations are not free.")


# ==========================================================================
# 28 · LIMITATIONS
# ==========================================================================
def s28():
    s, y = cslide(28, 6, "Limitations we will not hide",
                  "Ten of them, listed in the report and repeated here because a prototype is defined "
                  "by what it refuses to claim.")
    C = s.shapes
    left = ["Browser storage is readable by anyone who controls the device",
            "No remote database is connected in the demo build",
            "A QR can be copied; a scan does not authenticate anyone",
            "No independent proof of physical attendance",
            "A hash proves integrity, not truth"]
    right = ["Benchmark rates in the prototype are unverified",
             "No production authentication or access control yet",
             "Behaviour under real network interruption is untested",
             "Multi-device conflict handling is still planned",
             "Usability has not been validated with real workers"]
    for col, items in enumerate((left, right)):
        for i, it in enumerate(items):
            x = 4.16 + col * 4.39
            yy = 2.66 + i * 0.80
            shape(C, "round", f"lm{col}{i}", x, yy, 4.17, 0.68, fill=WHITE if i % 2 == 0 else PAPER_DEEP,
                  line=None, radius=0.08)
            textbox(C, f"lmn{col}{i}", x + 0.20, yy + 0.10, 0.40, 0.46,
                    [P(f"{col * 5 + i + 1:02d}", font=K.DISPLAY, size=9.0, color=CLAY, bold=True)])
            textbox(C, f"lmt{col}{i}", x + 0.62, yy + 0.08, 3.40, 0.52,
                    [body(it, 8.8, INK2, 1.16)], anchor="m")
    textbox(C, "fl", 4.16, 6.72, 8.5, 0.30,
            [body("These are stated in the report as limitations, not as future features that already exist.",
                  8.6, INK3, 1.1)])
    notes(s, "Do not rush this slide. It is the one that distinguishes an engineering project from a "
             "demo reel.")


# ==========================================================================
# 29 · ROADMAP
# ==========================================================================
def s29():
    s, y = cslide(29, 6, "What happens next, in order",
                  "A credible sequence: fix storage durability first, then add a backend, then earn "
                  "the right to call it a deployment.")
    C = s.shapes
    phases = [("Now", "Demo-ready", ["Baseline reset and seeded dataset",
                                     "Bilingual worker and contractor portals",
                                     "Offline single-file exhibition build",
                                     "Print-ready pass and wage slip"], EMERALD),
              ("Next", "Shared backend", ["Supabase PostgreSQL + auth + RLS",
                                          "Real cross-device approval requests",
                                          "Versioned, authenticated export / import",
                                          "Verified wage benchmark configuration"], BRASS),
              ("Later", "Deployment-ready", ["PWA service worker + sync queue",
                                             "Conflict preservation, never overwrite",
                                             "Usability research with workers",
                                             "Broader automated and manual testing"], CLAY)]
    w = (8.56 - 0.40) / 3
    for i, (ph, sub, items, acc) in enumerate(phases):
        x = 4.16 + i * (w + 0.20)
        shape(C, "round", f"ph{i}", x, 2.66, w, 3.66, fill=WHITE, line=PAPER_LINE, lw=0.9,
              radius=0.11, shadow=True)
        shape(C, "round", f"phh{i}", x, 2.66, w, 0.62, fill=acc, radius=0.10)
        textbox(C, f"php{i}", x + 0.22, 2.72, w - 0.4, 0.24,
                [P(ph.upper(), font=K.BODY, size=7.6, color=WHITE, bold=True, spc=200)])
        textbox(C, f"phs{i}", x + 0.22, 2.94, w - 0.4, 0.28,
                [P(sub, font=K.BODY, size=10.4, color=WHITE, bold=True)])
        for j, it in enumerate(items):
            yy = 3.46 + j * 0.68
            shape(C, "oval", f"phd{i}{j}", x + 0.24, yy + 0.07, 0.09, 0.09, fill=acc)
            textbox(C, f"pht{i}{j}", x + 0.44, yy, w - 0.66, 0.60,
                    [body(it, 8.8, INK2, 1.18)])
    callout(C, "gate", 4.16, 6.42, 8.56, 0.56,
            "Nothing in the “Next” or “Later” columns exists in the current build.", size=8.6,
            accent=CLAY)
    notes(s, "The sequence matters: durability, then sharing, then usability research. Adding features "
             "before fixing storage would just make the demo prettier.")


# ==========================================================================
# 30 · CONCLUSION (dark)
# ==========================================================================
def s30():
    s = dslide(30, 6)
    C = s.shapes
    textbox(C, "eyebrow", 0.90, 1.40, 6.0, 0.26, [eyebrow("Conclusion", BRASS, 8.6, 260)])
    textbox(C, "h", 0.86, 1.70, 8.6, 1.60,
            [display("Transparency is a mechanism,\nnot a slogan.", 38, WHITE, bold=True, line=1.04)])
    pts = [("Shipped", "Shared wage engine · explicit payment states · preserved corrections · "
            "SHA-256 chain · seven explainable rules · QR pass", EMERALD),
           ("Deliberate", "Removed NFC hardware and removed the claim that a QR is authentication", BRASS),
           ("Bounded", "No proof of attendance, no guarantee of payment, no legal ruling, no blockchain", CLAY)]
    for i, (t, d, acc) in enumerate(pts):
        yy = 3.62 + i * 0.92
        shape(C, "rect", f"cl{i}", 0.90, yy + 0.04, 0.06, 0.66, fill=acc)
        textbox(C, f"ct{i}", 1.12, yy, 1.30, 0.28,
                [P(t.upper(), font=K.BODY, size=8.0, color=acc, bold=True, spc=200)])
        textbox(C, f"cd{i}", 2.30, yy - 0.02, 7.10, 0.76,
                [body(d, 9.8, WHITE, 1.22)])
    textbox(C, "k", 0.90, 6.42, 9.0, 0.30,
            [body("Every shift recorded. Every wage explained. Every change traceable.",
                  10.4, BRASS_LT, 1.1, bold=True, italic=True)])
    notes(s, "Close the argument: we did not build a dashboard, we built evidence — and we stated its "
             "edges.")



# ==========================================================================
# 31 · REFERENCES
# ==========================================================================
def s31ref():
    s, y = cslide(31, 6, "References and sources",
                  "Every external claim in this deck comes from one of these documents; every "
                  "internal figure comes from the prototype's own verification report.")
    C = s.shapes
    refs = [
        ("01", "Ministry of Labour & Employment, Government of India. e-Shram Portal.",
         "https://eshram.gov.in/ · accessed October 2026"),
        ("02", "Comptroller & Auditor General of India. Report on Implementation of MGNREGA "
         "(Kerala), Report No. 9 of 2025.", "Laid before the Kerala Legislative Assembly, 24 February 2026"),
        ("03", "Comptroller & Auditor General of India. Audit of MGNREGS in Jammu & Kashmir.",
         "As reported in 2026 secondary coverage of the CAG report"),
        ("04", "Calcutta High Court. M/s. Bharat Sanchar Nigam Ltd v Union of India & Ors.",
         "WPA 25460 of 2025 · judgment dated 7 January 2026"),
        ("05", "International Labour Organization. Scaling up digital wages: lessons and "
         "challenges from India's enabling environment.", "ILO, 2024"),
        ("06", "MDN Web Docs. SubtleCrypto.digest() and Window.localStorage.",
         "developer.mozilla.org · accessed October 2026"),
        ("07", "Supabase. About billing on Supabase — free-plan quotas and compute pricing.",
         "supabase.com/docs · accessed October 2026"),
        ("08", "Vite documentation; WHATWG Storage Standard.", "vitejs.dev · storage.spec.whatwg.org"),
    ]
    for i, (num, main, src) in enumerate(refs):
        col, row = (0, i) if i < 4 else (1, i - 4)
        x = 4.16 + col * 4.39
        yy = 2.66 + row * 0.94
        textbox(C, f"rf{num}n", x, yy, 0.44, 0.24,
                [P(num, font=K.DISPLAY, size=9.6, color=BRASS_DK, bold=True)])
        textbox(C, f"rf{num}m", x + 0.44, yy - 0.02, 3.68, 0.46,
                [body(main, 8.6, INK, 1.18)])
        textbox(C, f"rf{num}s", x + 0.44, yy + 0.42, 3.68, 0.22,
                [body(src, 7.6, INK3, 1.1)])
        if row < 3:
            K.line_h(C, f"rf{num}l", x + 0.44, yy + 0.86, 3.68, PAPER_LINE, 0.8)
    notes(s, "Keep this slide in reserve — it is usually only needed if a judge asks where a figure "
             "came from. The CAG and ILO sources support the context; nothing here supports a claim "
             "about the prototype itself.")


# ==========================================================================
# 32 · THANKS (dark)
# ==========================================================================
def s31():
    s = dslide(32, 6)
    C = s.shapes
    textbox(C, "eyebrow", 0.90, 1.86, 6.0, 0.26, [eyebrow("Thank you", BRASS, 8.6, 260)])
    textbox(C, "h", 0.86, 2.14, 8.6, 1.20,
            [display("Questions, and a live demo.", 33, WHITE, bold=True, line=1.02)])
    textbox(C, "sub", 0.90, 3.44, 7.4, 0.60,
            [body("The app runs offline from a single HTML file — no server, no install, no network.",
                  11.4, MINT, 1.28)])
    items = [("Open the pass", "Scan the QR on a printed pass to reach the public verification page"),
             ("Break a hash", "Corrupt a past record in the audit bench and watch the badge flip"),
             ("Read a correction", "See the original ₹550 survive beside the corrected ₹650")]
    for i, (t, d) in enumerate(items):
        yy = 4.24 + i * 0.66
        shape(C, "oval", f"td{i}", 0.92, yy + 0.10, 0.12, 0.12, fill=BRASS)
        textbox(C, f"tt{i}", 1.18, yy, 2.30, 0.28,
                [P(t, font=K.BODY, size=10.0, color=WHITE, bold=True)])
        textbox(C, f"tdd{i}", 3.54, yy, 5.30, 0.60, [body(d, 9.0, MINT, 1.16)])
    textbox(C, "credit", 0.90, 6.44, 8.6, 0.40,
            [body("Shram Setu 2.0  ·  Independent student project  ·  not a government portal  ·  "
                  "Indore Sahodaya, Computer Science, October 2026", 8.4, "7FA895", 1.1)])
    notes(s, "Invite the judge to break it. The tamper bench is the most persuasive thirty seconds in "
             "the whole presentation.")


# ==========================================================================
# assemble
# ==========================================================================
def main(preview=False):
    for fn in (s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14,
               s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28,
               s29, s30, s31ref, s31):
        print(f"· {fn.__name__}")
        fn()
    # document properties + accessible titles
    cp = prs.core_properties
    cp.title = "Shram Setu 2.0 — Indore Sahodaya Computer Science"
    cp.subject = ("Verified digital work and wage records for India's daily-wage workers — "
                  "project presentation")
    cp.author = "Shram Setu 2.0 project team"
    cp.keywords = ("wage transparency, offline-first, SHA-256, IndexedDB, React, "
                   "Sahodaya, computer science project")
    cp.comments = "32-slide deck with Morph transitions and 3-D object groups."
    for sl in prs.slides:
        for shp in sl.shapes:
            if shp.name == "!!Title" and shp.has_text_frame:
                txt = shp.text_frame.text.strip().split("\n")[0]
                if txt:
                    shp._element.nvSpPr.cNvPr.set("descr", txt)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    prs.save(OUT)
    print(f"saved {OUT}  ({os.path.getsize(OUT)/1024:.0f} KB, {len(prs.slides.__iter__.__self__._sldIdLst)} slides)")
    if preview:
        import preview as PV
        PV.render_all(list(zip(K.SCENE, BG)), "/tmp/deckprev")


if __name__ == "__main__":
    import sys
    main("--preview" in sys.argv)
