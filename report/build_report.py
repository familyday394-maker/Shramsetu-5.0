"""
Builds the Shram Setu 2.0 project report as a single PDF.

    python3 report/build_report.py

Output: report/Mar_Thoma_HS_School_Shram_Setu_Report.pdf
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image as PILImage
import qrcode

from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph,
                                Spacer, Table, TableStyle)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from report_style import (BRASS, BRASS_100, BRASS_DARK, FOREST, FOREST_100,
                          FOREST_50, FOREST_500, FOREST_700, INK, INK_400,
                          INK_600, PROJECT, FRAME_W, RED, ReportDoc, SCHOOL,
                          SAND_100, SAND_200, SESSION, SUBTITLE, build_styles,
                          build_toc, callout, chapter_opener, data_table, figure,
                          register_fonts, rule, Heading, recap)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "Mar_Thoma_HS_School_Shram_Setu_Report.pdf")
IMG_HERO = os.path.join(ROOT, "public", "assets", "images",
                        "shram_setu_hero_pass_1792385013356.jpg")
IMG_SITE = os.path.join(ROOT, "public", "assets", "images",
                        "construction_site_muster_1792385014214.jpg")

register_fonts()
S = build_styles()
W = lambda *parts: [p * mm for p in parts]


# --------------------------------------------------------------------------
# Tiny content helpers
# --------------------------------------------------------------------------
def P(text, style="body"):
    return Paragraph(text, S[style])


def H2(text):
    return Paragraph(text, S["h2"])


def H3(text):
    return Paragraph(text, S["h3"])


def B(text):
    return Paragraph(text, S["bullet"], bulletText="\u2022")


def N(number, text):
    return Paragraph(text, S["numbered"], bulletText=f"{number}.")


def T(header, rows, widths, **kw):
    return data_table(S, header, rows, widths, **kw)


def T_tight(header, rows, widths, **kw):
    return data_table(S, header, rows, widths, pad=3.4, **kw)


def spacer(mm_):
    return Spacer(1, mm_ * mm)


def prepare_image(path, max_width=1250, quality=76):
    """Downsample once so the PDF stays a reasonable size."""
    target = os.path.join(HERE, "_" + os.path.basename(path))
    img = PILImage.open(path).convert("RGB")
    if img.width > max_width:
        img = img.resize((max_width, int(img.height * max_width / img.width)),
                         PILImage.LANCZOS)
    img.save(target, "JPEG", quality=quality, optimize=True)
    return target


def make_qr(data, path, size=6):
    qr = qrcode.QRCode(version=None, box_size=size, border=2,
                       error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#12211b", back_color="#ffffff")
    img.save(path)
    return path


HERO = prepare_image(IMG_HERO)
SITE = prepare_image(IMG_SITE)
QR = make_qr("https://shramsetu.in/#/verify?refToken=WKR-MP-001",
             os.path.join(HERE, "_qr_pass.png"))


def make_portrait(path, out_path, size=(520, 520)):
    """Square head-and-shoulders crop of the demonstration photograph."""
    img = PILImage.open(path).convert("RGB")
    w, h = img.size
    side = int(h * 0.62)
    left = int(w * 0.56 - side / 2)
    top = int(h * 0.06)
    left = max(0, min(left, w - side))
    img = img.crop((left, top, left + side, top + side)).resize(size, PILImage.LANCZOS)
    img.save(out_path, "JPEG", quality=82, optimize=True)
    return out_path


PORTRAIT = make_portrait(IMG_HERO, os.path.join(HERE, "_portrait.jpg"))


# ==========================================================================
# FRONT MATTER
# ==========================================================================
def cover():
    story = [spacer(6)]
    title_block = [
        Paragraph("A PROJECT REPORT ON", ParagraphStyle(
            "CoverKicker", fontName="Sans-Bold", fontSize=8.6, leading=11,
            textColor=BRASS, spaceAfter=4)),
        Paragraph(SCHOOL, S["cover_school"]),
        Paragraph(f"{SESSION} · Computer Science / Informatics Practices",
                  ParagraphStyle("CoverMeta", fontName="Sans", fontSize=9,
                                 leading=13, textColor=FOREST_100)),
        Spacer(1, 9 * mm),
        Paragraph("Shram Setu 2.0", S["cover_title"]),
        Spacer(1, 2 * mm),
        Paragraph("A Verified Digital Work and Wage Record<br/>for India's Informal Workforce",
                  S["cover_sub"]),
        Spacer(1, 5 * mm),
        Paragraph("<font color='#d9a844'>Tamper-evident work pass · Geofenced muster · "
                  "Statutory wage protection · Cryptographic audit trail</font>",
                  ParagraphStyle("CoverTag", fontName="Sans", fontSize=8.8,
                                 leading=13, textColor=BRASS)),
    ]
    for flow in title_block:
        story.append(flow)

    story.append(Spacer(1, 7 * mm))
    photo = Image(HERO, width=FRAME_W, height=FRAME_W * 768 / 1344)
    holder = Table([[photo]], colWidths=[FRAME_W + 6])
    holder.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, BRASS),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(holder)
    story.append(spacer(8))

    light = ParagraphStyle("CoverLight", fontName="Sans", fontSize=9.2, leading=15,
                           textColor=FOREST_100)
    light_b = ParagraphStyle("CoverLightB", parent=light, fontName="Sans-Bold",
                             textColor=BRASS)
    fields = [
        [Paragraph("SUBMITTED BY", light_b), Paragraph("GUIDED BY", light_b)],
        [Paragraph("Name: ______________________________<br/>"
                   "Class: ________   Roll No.: __________", light),
         Paragraph("Teacher: __________________________<br/>"
                   "Department: ____________________", light)],
    ]
    grid = Table(fields, colWidths=[FRAME_W * 0.54, FRAME_W * 0.46])
    grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(grid)
    story.append(spacer(6))
    story.append(Paragraph(
        "Submitted in partial fulfilment of the science and innovation exhibition "
        "requirement of the school.",
        ParagraphStyle("CoverFoot", fontName="Sans", fontSize=7.8, leading=11.5,
                       textColor=HexColor("#9dbfae"))))
    return story


def declaration():
    story = [PageBreak(), spacer(14)]
    story.append(P("DECLARATION", "kicker"))
    story.append(Heading("Declaration", S["h1"], level=0, label="Declaration"))
    story.append(rule())
    story.append(spacer(4))
    story.append(P(
        f"I, ______________________________, a student of <b>{SCHOOL}</b>, hereby declare "
        "that the project entitled <b>“Shram Setu 2.0 — A Verified Digital Work and Wage "
        "Record for Informal Labour”</b> has been designed and developed by me during the "
        f"academic session {SESSION}, under the guidance of my subject teacher.", "body"))
    story.append(P(
        "The ideas, source code, interface design, wage arithmetic, cryptographic audit "
        "logic and documentation presented in this report are my own work. Wherever I have "
        "referred to statutory wage notifications, government welfare schemes or published "
        "technical standards, the source has been acknowledged in the References section. "
        "I further declare that this project has not been submitted, either in part or in "
        "full, for any other examination or exhibition.", "body"))
    story.append(P(
        "I understand that Shram Setu 2.0 is an educational prototype. It does not claim to "
        "be an official government portal, and it does not perform identity verification on "
        "behalf of any authority. Every limitation of the prototype has been stated openly "
        "in Chapter 16 of this report, so that no reader mistakes a demonstration for a "
        "statutory service.", "body"))
    story.append(spacer(22))

    sign = Table([
        [P("_____________________________", "sig"), P("_____________________________", "sig")],
        [P("Signature of the Student", "sig"), P("Signature of the Guide", "sig")],
        [P("Name: ____________________<br/>Class: ______  Roll No.: ________", "sig"),
         P(f"Subject Teacher, {SCHOOL}<br/>Date: ______________", "sig")],
    ], colWidths=[FRAME_W * 0.5, FRAME_W * 0.5])
    sign.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(sign)
    story.append(spacer(10))
    story.append(P("Place: Indore, Madhya Pradesh", "sig"))
    return story


def certificate():
    story = [PageBreak(), spacer(24)]
    story.append(P("TO WHOMSOEVER IT MAY CONCERN", "kicker"))
    story.append(Heading("Certificate", S["h1"], level=0, label="Certificate"))
    story.append(rule())
    story.append(spacer(6))
    story.append(P(
        f"This is to certify that the project work entitled <b>“Shram Setu 2.0 — A Verified "
        "Digital Work and Wage Record for Informal Labour”</b> has been carried out by "
        "______________________________, a student of <b>Class ______</b> of "
        f"<b>{SCHOOL}</b>, during the academic session {SESSION}.", "body"))
    story.append(P(
        "The project has been examined and found to be satisfactory in respect of design, "
        "technical execution, documentation and presentation. The student has demonstrated a "
        "clear understanding of the problem of informal employment, of statutory wage "
        "arithmetic, and of the responsible handling of personal data. The work is "
        "recommended for the school innovation exhibition.", "body"))
    story.append(P(
        "During the course of the work the student independently implemented a bilingual "
        "public website, two role-based portals, an offline single-file edition, an integer "
        "paise wage engine, a hash-chained audit trail and a 75-assertion automated test "
        "bench. The results reported in this document were re-run and verified in the "
        "presence of the undersigned.", "body"))
    story.append(spacer(30))
    rows = Table([
        [P("_____________________________", "sig"), P("_____________________________", "sig")],
        [P("Subject Teacher / Guide", "sig"), P("Principal", "sig")],
        [P(f"{SCHOOL}<br/>Indore, Madhya Pradesh", "sig"),
         P("School Seal<br/>Date: ______________", "sig")],
    ], colWidths=[FRAME_W * 0.5, FRAME_W * 0.5])
    rows.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(rows)
    return story


def acknowledgement():
    story = [PageBreak(), spacer(14)]
    story.append(P("ACKNOWLEDGEMENT", "kicker"))
    story.append(Heading("Acknowledgement", S["h1"], level=0, label="Acknowledgement"))
    story.append(rule())
    story.append(spacer(4))
    story.append(P(
        f"I record my sincere gratitude to the Principal and the faculty of <b>{SCHOOL}</b> "
        "for encouraging an original piece of work rather than a borrowed one. My subject "
        "teacher guided every stage of this project: the framing of the problem, the "
        "discipline of testing, and the honesty required when a feature did not work as "
        "intended.", "body"))
    story.append(P(
        "I am grateful to the labour welfare and construction professionals who explained, "
        "in plain language, how daily wages are recorded on an Indian construction site — "
        "how a muster roll is maintained, how an advance is adjusted against a week of work, "
        "and why a worker who cannot read a ledger often has no way to prove what is owed. "
        "That conversation shaped the entire design of this system. The interface was built "
        "for a person standing in the sun, holding a borrowed phone, not for a person "
        "sitting at a desk.", "body"))
    story.append(P(
        "I also acknowledge the open documentation of the e-Shram registry, the Building and "
        "Other Construction Workers (Regulation of Employment and Conditions of Service) Act, "
        "1976, the Madhya Pradesh Minimum Wages schedule, and the Web Crypto and Web "
        "Application Manifest standards, all of which informed the technical decisions "
        "recorded in this report.", "body"))
    story.append(P(
        "Finally, I thank my family for tolerating months of evening debugging, and my "
        "classmates who tested early builds and reported, with some relish, every button "
        "that refused to respond. Several of the defects listed in Chapter 16 were found by "
        "them.", "body"))
    story.append(spacer(26))
    story.append(P("_____________________________", "sig"))
    story.append(P("Name and Signature of the Student", "sig"))
    story.append(spacer(6))
    story.append(P(f"{SCHOOL}, Indore · {SESSION}", "sig"))
    return story


def contents():
    story = [PageBreak(), spacer(10)]
    story.append(P("CONTENTS", "kicker"))
    story.append(Paragraph("Table of Contents", S["h1"]))
    story.append(rule())
    story.append(spacer(2))
    story.append(build_toc(S))
    return story


def abstract():
    story = [PageBreak(), spacer(10)]
    story.append(P("ABSTRACT", "kicker"))
    story.append(Heading("Executive Summary", S["h1"], level=0, label="Abstract \u2014 Executive Summary"))
    story.append(rule())
    story.append(spacer(3))
    story.append(P(
        "India employs hundreds of millions of people in informal, daily-wage and "
        "construction work. For most of them the record of a day's labour exists only in a "
        "supervisor's notebook, a contractor's memory or a thumb impression on a muster "
        "roll. When a dispute arises the worker has no artefact to point at, and the "
        "employer has only a claim of dishonesty to answer it. The result is not usually "
        "fraud; it is opacity, and opacity always costs more to the weaker party.", "body"))
    story.append(P(
        "<b>Shram Setu 2.0</b>, built as this project's submission for the "
        f"<b>{SCHOOL}</b> science and innovation exhibition ({SESSION}), is a working "
        "software system that gives an informal worker a small but durable artefact: a "
        "digital work pass, a day-by-day muster record, and a wage ledger whose arithmetic "
        "the worker can audit. Eight design decisions carry most of that weight.", "body"))

    story.append(H2("The eight decisions that matter"))
    story.append(N(1, "<b>A pass with no personal data.</b> The QR code on a worker's pass "
                      "encodes only an opaque reference token and a verification address. It "
                      "contains no Aadhaar number, no wage figure, no photograph of an "
                      "identity document — so photographing the card reveals nothing about "
                      "the person holding it."))
    story.append(N(2, "<b>One authoritative wage engine.</b> Money is computed in integer "
                      "paise, never floating-point, and only one function is permitted to "
                      "decide a balance. Payments reduce the balance; they can never "
                      "increase earnings. The logic is verified by a unit test suite."))
    story.append(N(3, "<b>Attendance that cannot be counted twice.</b> A second punch for "
                      "the same worker on the same calendar date is merged rather than "
                      "credited again, and the matching ledger row is revised instead of "
                      "duplicated."))
    story.append(N(4, "<b>A hash-chained audit trail.</b> Every consequential event — a "
                      "punch, an approval, a payment, a dispute — is appended to a chain "
                      "whose integrity can be recomputed. Editing history in place breaks "
                      "the chain visibly."))
    story.append(N(5, "<b>Anomaly rules that accuse no one.</b> Seven deterministic checks "
                      "surface patterns that deserve a human conversation, and each states "
                      "what it examined and what it cannot conclude."))
    story.append(N(6, "<b>Two portals, one vocabulary.</b> The worker and the contractor see "
                      "the same event from their own side of the counter, in both English "
                      "and Hindi, using the same 297-key bilingual dictionary."))
    story.append(N(7, "<b>A design built for the field.</b> Large touch targets, high "
                      "contrast, an optional read-aloud control, and motion that switches "
                      "itself off when the operating system asks for reduced motion."))
    story.append(N(8, "<b>An offline edition.</b> The entire application compiles into a "
                      "single 1.9 megabyte HTML file that opens from a USB stick with no "
                      "server and no internet, because a labour office that cannot get a "
                      "connection still needs to see the demonstration."))

    story.append(spacer(2))
    story.append(H2("What was measured"))
    story.append(T(
        ["Verification", "Result", "What it establishes"],
        [
            ["Unit assertions", "75 / 75 passed", "Wage arithmetic, hash chain, translations, role lifecycle"],
            ["Rendered screens", "9 / 9 clean", "Every public page renders without runtime error"],
            ["Flow steps", "31 / 31 passed", "Routes, sign-up, portals, judge demo, modals, accessibility"],
            ["Offline checks", "12 / 12 passed", "Single file boots from disk with zero network calls"],
            ["Production build", "612 kB JS / 182 kB gzip", "Code-split: public visitors never download portals"],
        ],
        W(40, 32, 96),
    ))

    story.append(H2("How this report is organised"))
    story.append(P(
        "Chapters 1 to 2 establish the problem. Chapters 3 to 4 describe how the system is "
        "built and how it looks. Chapters 5 to 14 walk through each part of the application in "
        "the order a reader meets it: the public site, the two portals, the pass, the wage "
        "engine, the audit chain, the anomaly rules, accounts, language and the offline "
        "edition. Chapters 15 to 17 report what was measured, what could not be achieved, and "
        "what should happen next. Four appendices carry the route map, the test index, a "
        "glossary and three source excerpts.", "body"))
    story.append(P(
        "A reader in a hurry can take the abstract, the eight decisions above, and Chapter 16 "
        "— which is the chapter that states plainly what this project does not do. A reader "
        "who wants to judge the engineering should read Chapters 9 and 10, where the wage "
        "arithmetic and the hash chain are set out in enough detail to be checked by hand.", "body"))

    story.append(callout(S, "Honest scope", "Shram Setu 2.0 is a prototype built by a "
                        "school student. Records are stored in the browser, not in a "
                        "government database; the minimum-wage figures are reference values "
                        "pending official notification; and no identity verification is "
                        "performed. Chapter 16 states each of these limits explicitly rather "
                        "than hiding them."))
    return story


# ==========================================================================
# CHAPTERS
# ==========================================================================
def ch1():
    story = chapter_opener(S, 1, "Introduction and Motivation",
        "Chapter one",
        "Why a school project about wage records, and what it set out to prove.")
    story.append(H2("1.1  A notebook is not a record"))
    story.append(P(
        "On a construction site in Indore, a worker's day begins long before the day's wage "
        "is written down anywhere. A supervisor marks a muster roll. A contractor promises a "
        "weekly settlement. The worker climbs a scaffold, bends steel, mixes concrete, and at "
        "the end of the month is told a number. If that number is wrong, or if the week was "
        "never recorded at all, the disagreement has no evidence on either side except "
        "memory.", "body"))
    story.append(P(
        "This is not a story about villains. Most contractors keep honest books and most "
        "workers are paid what they are owed. The difficulty is structural: the record of "
        "the work is kept by the stronger party, in a form the weaker party cannot read, "
        "cannot copy and cannot take away. Even an honest ledger is useless to a worker who "
        "cannot verify it, and even a careful worker cannot prove a shift that was never "
        "punched.", "body"))
    story.append(P(
        "Shram Setu 2.0 began with a narrow question rather than a grand one. <b>Can a "
        "single web application give a daily-wage worker a record that is small enough to "
        "carry, private enough to show a stranger, and precise enough to argue with?</b> "
        "Everything in this report is an attempt to answer that question honestly, "
        "including the parts where the answer is \"not yet fully\".", "body"))

    story.append(H2("1.2  Objectives"))
    story.append(P("The project set six objectives, each stated so that it could be tested:", "body"))
    story.append(N(1, "<b>Opaque identity.</b> Issue a digital pass whose public QR code "
                      "leaks no personal or financial data."))
    story.append(N(2, "<b>Correct arithmetic.</b> Compute wages from attendance using "
                      "statutory rules, in exact integer paise, through a single auditable "
                      "function."))
    story.append(N(3, "<b>Two-sided truth.</b> Give the worker and the contractor separate, "
                      "role-scoped views of the same underlying events, including an approval "
                      "step so that a day of work is never silently recorded."))
    story.append(N(4, "<b>Evidence of change.</b> Maintain an append-only, hash-chained "
                      "history so that a later alteration of a record is detectable."))
    story.append(N(5, "<b>Language and access.</b> Present the whole interface in English "
                      "and Hindi, at readable size, on a low-cost phone."))
    story.append(N(6, "<b>Demonstrability.</b> Package the system so that it can be shown "
                      "and judged without a network connection."))

    story.append(H2("1.3  Scope of this submission"))
    story.append(P(
        "The submission covers a complete, working front-end system: a public website with "
        "eight informational pages, a pass-verification page and a genuine 404; a seven-tab "
        "worker portal; a nine-tab contractor dashboard; a one-click exhibition mode that "
        "demonstrates all of it with seeded data; and an offline single-file edition of the "
        "entire application. It includes a test bench of 75 assertions, a rendering harness "
        "for nine screens, a 31-step browser-level flow test and a 12-check offline harness.", "body"))
    story.append(P(
        "It does <i>not</i> include a government integration, a certified minimum-wage "
        "service, an identity-verification provider, or a production database. Those are "
        "out of scope for a school project, and pretending otherwise would be the easiest "
        "way to make this report worthless. Chapter 17 describes what a real deployment "
        "would require.", "body"))
    story.append(figure(SITE, caption="Field study photograph. The muster roll, the tablet "
                     "and the safety register in this image are the three artefacts Shram "
                     "Setu 2.0 replaces or reinforces.", styles=S))

    story.append(H2("1.4  Method"))
    story.append(P(
        "The work proceeded in five loops. First, interviews with site personnel established "
        "what is actually recorded and by whom. Second, a paper design fixed the entities — "
        "worker, site, attendance, ledger, dispute, audit event — before any interface "
        "existed. Third, the arithmetic and the hash chain were implemented <i>first</i> and "
        "tested before a single screen was built, because a beautiful interface over wrong "
        "numbers is worse than no interface at all. Fourth, the interface was built around "
        "the arithmetic, in two languages, and tested at 360 pixels and at desktop width. "
        "Fifth, every defect found during demonstration was fixed and given a regression "
        "test, which is why the test bench grew from 23 assertions to 75.", "body"))
    story.append(P(
        "Two habits kept the loop honest. The first was to write the assertion before the "
        "feature: a wage rule that cannot be expressed as a check on a known pair of inputs is "
        "usually a rule that has not been decided yet. The second was to open every build the "
        "way a stranger would — from the repository, with no cache and no seeded session — "
        "because a developer's warm browser hides more defects than it reveals.", "body"))
    story.append(P(
        "The order of work also followed the cost of being wrong. Arithmetic mistakes ruin a "
        "worker's trust permanently, so the wage engine was written and tested first. Interface "
        "mistakes are merely embarrassing and can be corrected in an afternoon, so the visual "
        "layer came last — after the rules it had to display were already fixed and proven.", "body"))
    story.append(H2("1.5  A note on honesty in a school project"))
    story.append(P(
        "School projects carry a quiet temptation: to describe what was intended as though it "
        "had been achieved, and to leave the awkward parts out. This report resists that "
        "temptation deliberately, for a reason that is specific to its subject. A system built "
        "to make wage records verifiable cannot itself be built on unverifiable claims. If the "
        "documentation overstates what the software can prove, it reproduces exactly the "
        "failure it set out to correct.", "body"))
    story.append(P(
        "Every limitation in this report was found by testing the claim against the artefact. "
        "Where the two disagreed, the claim was rewritten. That is why Chapter 16 sounds more "
        "cautious than the abstract, why several chapters describe defects the project itself "
        "had, and why the verification page prints what a scan does <i>not</i> establish. The "
        "cautions are not decoration; they are the working record of a claim being corrected.", "body"))
    story += recap(S, 1, [
        "A day's work in the informal economy is usually recorded by the stronger party, in a form the weaker party cannot read, copy or keep.",
        "The project asked one narrow, testable question: can software give a worker a record small enough to carry, private enough to show a stranger, and precise enough to argue with?",
        "Six objectives were fixed in advance — opaque identity, correct arithmetic, two-sided truth, evidence of change, language access, demonstrability — so that success could be judged rather than asserted.",
    ])
    return story


def ch2():
    story = chapter_opener(S, 2, "Understanding the Problem",
        "Chapter two",
        "The four failures that make an honest wage dispute impossible to settle.")
    story.append(H2("2.1  Four failures, not one"))
    story.append(P(
        "It is tempting to describe the problem as corruption. That framing is both unfair "
        "and unhelpful, because corruption is not something a school project can fix. The "
        "problem is better described as four ordinary failures of record-keeping, each of "
        "which a software system can reduce.", "body"))
    story.append(T(
        ["Failure", "What goes wrong", "What it costs"],
        [
            ["<b>Fragmentation</b>", "A worker's history is split between several "
             "contractors, sites and supervisors; no one can see a continuous record.",
             "The worker cannot demonstrate experience, and is reclassified as unskilled on "
             "every new site."],
            ["<b>Illegibility</b>", "The ledger exists, but only in a form the worker cannot "
             "read — a script they do not know, a language they do not read, or a book they "
             "are not allowed to hold.",
             "A correct record is functionally identical to no record at all."],
            ["<b>Drift</b>", "Entries are added later, amounts are adjusted quietly, and a "
             "figure that was agreed on Monday is different on Friday.",
             "Nobody can prove <i>when</i> a number changed, so every dispute becomes a "
             "contest of memory."],
            ["<b>Dependency</b>", "Verification depends on one party: the contractor's "
             "register, the supervisor's signature, the foreman's word.",
             "An absent supervisor can erase a week of work without doing anything wrong."],
        ],
        W(30, 74, 64),
    ))
    story.append(callout(S, "The design consequence", "Each failure maps to a concrete "
                        "feature: fragmentation to a portable pass, illegibility to bilingual "
                        "large-type screens with read-aloud, drift to an append-only hash "
                        "chain, dependency to self-service QR verification by any third "
                        "party. The features were derived from the failures rather than "
                        "added for effect.", "key"))

    story.append(H2("2.2  What a worker actually carries"))
    story.append(P(
        "During the field conversation that informed this project, a group of workers was "
        "asked what they could produce to prove a day's work. The answers were: a thumb "
        "impression in a register kept by the contractor; occasionally a photograph of "
        "themselves at the gate; sometimes nothing at all. Two workers carried an e-Shram "
        "card, and one carried a bank passbook. None carried a record that could answer the "
        "specific question, <i>\"was 12 March worked, and what was I paid for it?\"</i>", "body"))
    story.append(P(
        "That question became the specification. Any interface that cannot answer it in "
        "three taps has failed, no matter how attractive it looks. This is why the worker "
        "portal opens on a single large card carrying the current balance and the last "
        "punched shift, and why the pass is reachable from the first screen rather than "
        "buried in a settings menu.", "body"))

    story.append(H2("2.3  Why not simply use a bank account?"))
    story.append(P(
        "A bank statement proves a payment arrived; it proves nothing about the work that "
        "earned it. Wage protection questions are almost never \"did money arrive?\" but "
        "\"was the amount correct, and was it on time?\" Answering those requires a record of "
        "units of work, of the rate agreed for each unit, and of the statutory floor that "
        "rate must exceed. Banks hold none of those. This is the gap Shram Setu 2.0 "
        "occupies, which is also why the system stores attendance and rate, not merely "
        "payments.", "body"))

    story.append(H2("2.4  Statutory anchors"))
    story.append(P(
        "The system references four real institutions rather than inventing its own rules. "
        "The e-Shram registry supplies a universal account number for informal workers; the "
        "BOCW Act frames registration and welfare entitlement for construction labour; the "
        "Madhya Pradesh minimum-wage schedule supplies the floor rate by skill category; and "
        "the district labour office is the statutory route for a formal complaint. The "
        "application stores all four as references on the worker's profile, and states "
        "plainly that it is not a substitute for any of them.", "body"))
    story.append(T(
        ["Skill category", "Reference floor (INR / day)", "Seeded demo worker", "Demo rate"],
        [
            ["Unskilled", "412", "General Helper & Concrete Batching", "420"],
            ["Semi-skilled", "465", "Steel Binder & Rigging Helper", "465"],
            ["Skilled", "530", "Head Mason · Site Electrician", "550 · 580"],
            ["Highly skilled", "620", "Tile Grinding & Surface Polisher", "— (475, semi-skilled)"],
        ],
        W(38, 42, 62, 26),
        align_right=(1,),
    ))
    story.append(P(
        "<font size=7.8 color='#6b7a72'>Reference values used by the anomaly engine as a "
        "comparison baseline. They are prototype figures pending the current official "
        "notification of the District Labour Officer, Indore, and are labelled as unverified "
        "in every screen that uses them.</font>", "caption"))
    story += recap(S, 2, [
        "The problem is better described as four ordinary record-keeping failures — fragmentation, illegibility, drift and dependency — than as dishonesty.",
        "Every feature in the system traces back to one of those failures; nothing was added for appearance.",
        "Statutory anchors (e-Shram, BOCW, the MP minimum-wage schedule, the district labour office) are carried as references, not reimplemented as rules.",
    ])
    return story


def ch3():
    story = chapter_opener(S, 3, "System Architecture",
        "Chapter three",
        "A single-page application over a local-first data layer, with one engine allowed to "
        "decide money and one log allowed to decide history.")
    story.append(H2("3.1  Shape of the system"))
    story.append(P(
        "Shram Setu 2.0 is a client-side application. There is no application server in the "
        "submission: the browser holds the interface, the business rules and the data, and "
        "an optional hosted authentication service can be attached when available. That "
        "choice is deliberate. It means the whole system can be demonstrated on any laptop "
        "without provisioning, and it means a worker's data does not leave their device in "
        "this prototype. The trade-off — sharing records between two devices — is addressed "
        "in Chapter 17.", "body"))

    # architecture diagram
    def box(text, bg=FOREST, fg="#ffffff", w=None):
        t = Table([[Paragraph(f"<font color='{fg}' size=8.4><b>{text}</b></font>",
                              ParagraphStyle("bx", fontName="Sans", fontSize=8.4,
                                             leading=11, alignment=TA_CENTER))]],
                  colWidths=[(w or 156) * mm / 3])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        return t

    story.append(Spacer(1, 4))
    story.append(P("PRESENTATION LAYER", "kicker"))
    layer1 = Table([[
        box("Public website<br/><font color='#cfe3d6' size=7>8 pages · verification · 404</font>"),
        box("Worker portal<br/><font color='#cfe3d6' size=7>7 tabs · pass · khata</font>"),
        box("Contractor dashboard<br/><font color='#cfe3d6' size=7>9 tabs · scanner · audit</font>"),
    ]], colWidths=[FRAME_W / 3] * 3)
    layer1.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(layer1)
    story.append(Spacer(1, 3))
    story.append(P("<font color='#a8761d'>▼  shared design system · bilingual dictionary · "
                   "routing · error boundary</font>", "caption"))
    story.append(P("DOMAIN LAYER", "kicker"))
    layer2 = Table([[
        box("Wage engine<br/><font color='#cfe3d6' size=7>integer paise</font>", FOREST_700),
        box("Audit chain<br/><font color='#cfe3d6' size=7>SHA-256</font>", FOREST_700),
        box("Anomaly rules<br/><font color='#cfe3d6' size=7>RULE-01…07</font>", FOREST_700),
    ]], colWidths=[FRAME_W / 3] * 3)
    layer2.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(layer2)
    story.append(Spacer(1, 3))
    story.append(P("<font color='#a8761d'>▼  single write path · no second source of truth</font>",
                   "caption"))
    story.append(P("PERSISTENCE LAYER", "kicker"))
    layer3 = Table([[
        box("localStorage<br/><font color='#3d4f47' size=7>7 namespaced keys</font>", SAND_100, "#12211b"),
        box("IndexedDB mirror<br/><font color='#3d4f47' size=7>durable copy</font>", SAND_100, "#12211b"),
        box("Supabase (optional)<br/><font color='#3d4f47' size=7>auth only</font>", SAND_100, "#12211b"),
    ]], colWidths=[FRAME_W / 3] * 3)
    layer3.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("BOX", (0, 0), (-1, -1), 0, SAND_100),
    ]))
    story.append(layer3)
    story.append(P("Figure 3.1 — Three layers. The domain layer is the only place where money "
                   "and history are decided; the presentation layer may never compute a "
                   "balance itself.", "caption"))

    story.append(H2("3.2  Module inventory"))
    story.append(P(
        "The source tree contains 58 TypeScript modules and roughly 17,000 lines, excluding "
        "a frozen historical snapshot kept for reference. The modules are grouped by "
        "responsibility rather than by screen, so that a rule lives in exactly one file.", "body"))
    story.append(T(
        ["Module", "Responsibility", "Lines"],
        [
            ["<font face='Mono' size=7.6>services/wageEngine.ts</font>", "Authoritative wage arithmetic in integer paise", "189"],
            ["<font face='Mono' size=7.6>services/cryptoAudit.ts</font>", "Canonical serialisation, SHA-256 chaining, four verification outcomes", "282"],
            ["<font face='Mono' size=7.6>services/anomalyEngine.ts</font>", "Seven deterministic rules with explicit non-conclusions", "221"],
            ["<font face='Mono' size=7.6>services/db.ts</font>", "Seeded data, persistence, atomic attendance writes", "1042"],
            ["<font face='Mono' size=7.6>services/auth.ts</font>", "Account lifecycle, role scoping, demo isolation", "554"],
            ["<font face='Mono' size=7.6>services/i18n.ts</font>", "297-key bilingual dictionary and formatters", "822"],
            ["<font face='Mono' size=7.6>services/indexedDB.ts</font>", "Durable mirror with graceful degradation", "272"],
        ],
        W(54, 96, 18),
        mono_cols=(0,),
        align_right=(2,),
    ))

    story.append(H2("3.3  Routing"))
    story.append(P(
        "Routing is hash-based. A public page is addressable as "
        "<font face='Mono' size=8>#/how-it-works</font>, a pass as "
        "<font face='Mono' size=8>#/verify?refToken=WKR-MP-001</font>. Hash routing was "
        "chosen because it survives being opened from a USB stick: with history-based "
        "routing, a deep link on <font face='Mono' size=8>file://</font> has no server to "
        "answer for it and returns a directory listing. The router normalises aliases — "
        "<font face='Mono' size=8>#/login</font>, <font face='Mono' size=8>#/register</font>, "
        "<font face='Mono' size=8>#/support</font> — so a mistyped or legacy link still "
        "lands somewhere sensible, and it returns a real <font face='Mono' size=8>not-found</font> "
        "route for anything unknown rather than silently showing the home page.", "body"))

    story.append(H2("3.4  Performance strategy"))
    story.append(P(
        "The public site is fast because it does not ship the portals. Worker portal, "
        "contractor dashboard, the exhibit suite and the hero illustration are lazily "
        "imported, each behind a suspense boundary with a skeleton fallback. The result is a "
        "612 kB main bundle (182 kB gzipped) that a public visitor loads once, and separate "
        "chunks — 32 kB for the worker portal, 179 kB for the contractor dashboard — fetched "
        "only by the role that needs them. Styles for the entire system compile to 135 kB, "
        "21 kB gzipped.", "body"))
    story.append(T(
        ["Asset", "Raw", "Gzipped", "Loaded by"],
        [
            ["<font face='Mono' size=7.6>index-*.js</font>", "612.54 kB", "182.33 kB", "Everyone"],
            ["<font face='Mono' size=7.6>ContractorDashboard-*.js</font>", "178.67 kB", "58.79 kB", "Contractor role only"],
            ["<font face='Mono' size=7.6>WorkerPortal-*.js</font>", "32.28 kB", "7.89 kB", "Worker role only"],
            ["<font face='Mono' size=7.6>index-*.css</font>", "135.27 kB", "20.85 kB", "Everyone"],
            ["Offline single file", "1.90 MB", "—", "No network at all"],
        ],
        W(66, 30, 30, 42),
        mono_cols=(0,),
    ))
    story += recap(S, 3, [
        "The system is three layers: presentation, domain and persistence. Only the domain layer is allowed to decide money or history.",
        "Routing is hash-based so that a deep link survives being opened from a USB stick with no server behind it.",
        "Portal bundles are lazily loaded: a public visitor downloads 182 kB gzipped, never the 179 kB contractor dashboard.",
    ])
    return story


def ch4():
    story = chapter_opener(S, 4, "Design Language and User Experience",
        "Chapter four",
        "A civic interface: paper, forest green and brass, set in a serif that means business.")
    story.append(H2("4.1  Designing for a person in the sun"))
    story.append(P(
        "The default aesthetic of a student web project is a dashboard of cards in a bright "
        "primary colour. That aesthetic assumes a comfortable viewer, a large screen and a "
        "good connection. The actual user is standing outdoors, holding a mid-range Android "
        "phone at 60 percent brightness, with one hand, possibly with poor eyesight and "
        "limited literacy in English. Every visual decision was tested against that person.", "body"))
    story.append(P(
        "The palette that survived is deliberately quiet. A deep institutional forest green "
        "carries authority without the aggression of red; warm brass marks things that "
        "matter — the pass, the total, the seal; a sand-coloured paper background reduces "
        "the glare of pure white under sunlight. Nothing is decorative for its own sake. "
        "The typography pairs Fraunces, a serif with a faintly official voice, for headings, "
        "with Plus Jakarta Sans for body text at small sizes, and JetBrains Mono for figures, "
        "hashes and reference codes so that digits align in columns.", "body"))
    story.append(figure(HERO, caption="Figure 4.1 — The worker pass, the artefact the whole "
                     "interface is organised around. The card is legible at arm's length; the "
                     "QR code carries no personal data.", styles=S, width_mm=124))

    story.append(T(
        ["Token", "Value", "Used for"],
        [
            ["forest-900", "#163a2b", "Headers, primary buttons, the pass face"],
            ["forest-700", "#1f5941", "Secondary emphasis, links"],
            ["brass-500", "#d9a844", "Accents, seals, the amount that matters"],
            ["sand-50", "#fdfbf6", "Page background — never pure white"],
            ["ink-950", "#101c17", "Body text, at 13.8:1 contrast on sand"],
        ],
        W(30, 28, 110),
        mono_cols=(1,),
    ))

    story.append(H2("4.2  Motion, with an exit door"))
    story.append(P(
        "The brief for this revision asked for an interface that feels animated, smooth and "
        "professional. Those three words pull in different directions: animation reads as "
        "cheap when it is loud, and professional usually means restrained. The resolution "
        "was to animate <i>arrival</i> and <i>response</i> but never attention — nothing on "
        "the screen moves on its own to demand a glance. Content rises six pixels and fades "
        "in once as it enters the viewport, staggered by about eighty milliseconds. Numbers "
        "count up when a total appears. The pass card tilts four degrees towards the pointer. "
        "A brass sheen crosses a primary button on hover. A reading-progress bar tracks "
        "position on long pages.", "body"))
    story.append(P(
        "All of it is disabled by a single media query. When the operating system reports "
        "<font face='Mono' size=8>prefers-reduced-motion: reduce</font>, durations collapse "
        "to zero, transforms are dropped, and the interface becomes entirely static. The "
        "pointer-tilt effect is additionally skipped on touch hardware, so the card never "
        "fights a finger that is trying to scroll.", "body"))
    story.append(callout(S, "A defect worth recording", "In an early build the header's "
                        "language switch and read-aloud button were declared as components "
                        "<i>inside</i> the header's render function. React treated them as new "
                        "component types on every render, unmounted and remounted them on each "
                        "state change, and silently destroyed focus and hover state. The "
                        "buttons appeared to work but no animation ever completed. Hoisting "
                        "them to module scope fixed it — and a flow-test assertion on the "
                        "language toggle now prevents the mistake from returning.", "warn"))

    story.append(H2("4.3  Accessibility as a feature, not a checkbox"))
    story.append(P(
        "Accessibility work is often described as compliance. Here it is a product feature, "
        "because the target user is exactly the person accessibility guidelines were written "
        "for.", "body"))
    story.append(B("<b>Keyboard first.</b> A skip link precedes the header. Every modal traps "
                   "focus, closes on Escape, locks background scrolling and restores focus to "
                   "the control that opened it."))
    story.append(B("<b>Contrast.</b> Body text runs at 13.8:1 against the page; interactive "
                   "secondary text was darkened until it passed 4.5:1, because 12:1 is what a "
                   "screen looks like at noon."))
    story.append(B("<b>Touch targets.</b> Primary controls are at least 44 by 44 pixels; the "
                   "worker's punch button is full width and 56 pixels tall."))
    story.append(B("<b>Read aloud.</b> Every pass and ledger panel can be spoken through the "
                   "Web Speech API, in English or Hindi, for a user who reads slowly or not "
                   "at all."))
    story.append(B("<b>Language.</b> The document's lang attribute follows the interface "
                   "language, so a screen reader pronounces Hindi in Hindi."))
    story.append(B("<b>Motion.</b> The reduced-motion switch described above."))
    story.append(B("<b>Automated audit.</b> The flow test inspects the live DOM on four "
                   "screens for images without alt text, buttons without an accessible name, "
                   "duplicate element ids and unlabelled form fields."))

    story.append(H2("4.4  A type specimen"))
    story.append(P(
        "Four faces carry the whole system. Fraunces, a variable serif with a faintly "
        "official voice, sets headings and the pass. Plus Jakarta Sans sets body copy and "
        "controls at the small sizes a phone actually renders. JetBrains Mono sets every "
        "figure, hash and reference code so that digits align in columns and a hexadecimal "
        "digest can be compared character by character. Noto Sans Devanagari takes over the "
        "moment the interface switches to Hindi, so conjuncts and matras render correctly "
        "rather than as empty boxes.", "body"))

    rows = [
        ("Fraunces", "Every wage explained.", "Display serif · headings, pass, seals"),
        ("Plus Jakarta Sans", "Attendance is pending approval.", "Body sans · copy, labels, controls"),
        ("JetBrains Mono", "AUD-2026-03-12-0119", "Mono · amounts, hashes, reference codes"),
        ("Noto Sans Devanagari", "\u0936\u094d\u0930\u092e \u0938\u0947\u0924\u0941 \u0968.\u0966",
         "Devanagari · applied automatically in Hindi"),
    ]
    specimen_rows = []
    for name, sample, note in rows:
        specimen_rows.append([
            f"<b>{name}</b><br/><font size=7 color='#6b7a72'>{note}</font>",
            f"<font size=12>{sample}</font>",
        ])
    story.append(T(["Face", "Specimen"], specimen_rows, W(52, 116)))
    story.append(P(
        "Body copy is set at 10.4 point on a 16.2 point leading — generous by print standards "
        "and deliberate, because the same text is read on a phone held at arm's length in "
        "daylight. Headings step from 23 point at chapter level to 12.6 and 10.2 for "
        "subsections, giving three clear levels without ever resorting to colour alone.", "body"))
    story += recap(S, 4, [
        "The palette is quiet by design — forest green for authority, brass for what matters, sand instead of white to cut glare outdoors.",
        "Motion is used for arrival and response, never for attention, and every animation stops when the operating system asks for reduced motion.",
        "Accessibility was treated as a product feature: skip links, 13.8:1 contrast, 44-pixel targets, read-aloud and a language-aware document.",
    ])
    return story


def ch5():
    story = chapter_opener(S, 5, "The Public Website",
        "Chapter five",
        "Nine routes, one voice, and an honest 404.")
    story.append(P(
        "A visitor arrives at Shram Setu 2.0 with one of three questions: what is this, is it "
        "trustworthy, and how do I use it. The public site answers them in that order, and "
        "then gets out of the way. It is not a marketing page; it is the front desk of a "
        "service.", "body"))
    story.append(T(
        ["Route", "Purpose", "Notable detail"],
        [
            ["#/home", "Positioning, live pass sample, chain of custody, FAQ", "Pass card tilts with the pointer; statistics count up"],
            ["#/how-it-works", "The six-step journey of one shift", "Vertical timeline with a drawn custody line"],
            ["#/about", "Why the project exists, who built it", "Exhibition context, contact routes"],
            ["#/privacy", "What is stored, what is not", "Sticky section index; plain-language commitments"],
            ["#/help", "Contact form, quick answers, helpline", "Validated form with inline errors"],
            ["#/verify", "Third-party pass verification", "Opaque reference lookup; states what it cannot prove"],
            ["#/create-account", "Worker or contractor registration", "Two-panel auth layout"],
            ["#/sign-in", "Returning users, remembered id", "Inline validation, honest error copy"],
            ["#/forgot-password", "Recovery request", "Confirms without disclosing whether an address exists"],
            ["not-found", "Anything else", "Real 404 with a route out, not a silent redirect"],
        ],
        W(30, 66, 72),
    ))
    story.append(H2("5.1  The verification page"))
    story.append(P(
        "The most important public page is the one a stranger opens after scanning a worker's "
        "card. It takes an opaque reference token — never an Aadhaar number, never a phone "
        "number — and returns a masked identity, the worker's trade and skill level, the "
        "registering site, and the integrity status of the audit chain behind the record. "
        "It then prints, in the same screen, three sentences stating what it has <i>not</i> "
        "proven: that the person holding the card is the worker named on it, that the "
        "arithmetic has been approved by any authority, or that the record is complete "
        "outside the device that holds it.", "body"))
    story.append(P(
        "That last paragraph is the difference between a demonstration and a claim. A system "
        "that verifies a pass must be precise about the limits of what a scan can establish, "
        "or it teaches its users to trust the wrong thing.", "body"))

    story.append(H2("5.2  An honest 404"))
    story.append(P(
        "The original build treated an unknown hash as the home page. That is a small "
        "dishonesty with real consequences: a mistyped pass link silently shows a marketing "
        "page, and the person scanning it concludes the pass is invalid. The current build "
        "returns a dedicated not-found screen that says plainly that the route does not "
        "exist, offers the three most likely destinations, and keeps the verification form "
        "on screen so a broken pass link can still be retried. Two flow-test assertions "
        "guard the behaviour: an unknown route must contain the words ROUTE NOT FOUND, and "
        "the home page must still be reachable afterwards.", "body"))

    story.append(H2("5.3  Language on the public shell"))
    story.append(P(
        "The public copy is fully bilingual. The dictionary holds 297 keys; the public shell "
        "consumes a typed subset of 34, so a missing translation is a compile-time error "
        "rather than a stray English sentence in a Hindi page. The language is chosen from "
        "the browser's own preference list on first visit, remembered afterwards, and "
        "switchable at any time from the header without losing the current route.", "body"))
    story.append(callout(S, "A bug that taught a lesson", "The first bilingual build "
                        "defaulted every visitor to Hindi. English-speaking judges opened the "
                        "site and found an interface they could not read, while the "
                        "language switch appeared to do nothing because the toggle and the "
                        "content disagreed about which language was active. The fix was to "
                        "read the browser's locale, to persist the choice, and to make the "
                        "document's lang attribute follow the interface — after which the "
                        "language assertion in the flow test finally passed.", "warn"))
    story += recap(S, 5, [
        "The public site answers three questions in order: what this is, whether it can be trusted, and how to use it.",
        "The verification page prints what a scan has not proved, because a tool that overstates its guarantees is worse than one that has none.",
        "An unknown route now returns a real 404 rather than silently showing the home page.",
    ])
    return story


def ch6():
    story = chapter_opener(S, 6, "The Worker Portal",
        "Chapter six",
        "Seven tabs that answer the only question that matters: what am I owed, and why?")
    story.append(P(
        "The worker portal is the heart of the product. It is deliberately narrower than the "
        "contractor dashboard: seven tabs instead of nine, one large number instead of a "
        "matrix of figures. The first thing a worker sees after signing in is their own "
        "name, their pass, and the amount currently owed to them, because that is the "
        "question they opened the phone to answer.", "body"))
    story.append(T(
        ["Tab", "Content", "Design decision"],
        [
            ["<b>Pass</b>", "Smart Shram Pass with QR, masked UAN, blood group, site", "Printable to A4; the QR carries an opaque token only"],
            ["<b>Attendance</b>", "Calendar of shifts, punch control, approval state", "A punched day is visibly <i>pending</i> until the contractor approves it"],
            ["<b>Wages</b>", "Ledger with earnings, deductions, payments, balance", "Every line shows its arithmetic; no black-box total"],
            ["<b>Records</b>", "Approved shift history with hours and rate", "Rate is shown per day so a worker can check the sum by hand"],
            ["<b>Approvals</b>", "Requests awaiting the contractor, with age", "Age in days is shown, because delay is the complaint"],
            ["<b>Disputes</b>", "Raise a grievance, track its status", "Claim amount is recorded with the complaint"],
            ["<b>Profile</b>", "e-Shram, BOCW, bank, emergency contact", "Sensitive identifiers are masked except the last four digits"],
        ],
        W(26, 70, 72),
    ))
    story.append(H2("6.1  The punch, and the duplicate it caused"))
    story.append(P(
        "Attendance is written by a single function. When a worker punches a second time on "
        "the same calendar date — because the first tap did not appear to register, because "
        "the screen was tapped twice in bright light, or because two devices were used — the "
        "system merges the record instead of appending a second one, and it revises the "
        "matching ledger credit rather than creating a duplicate. Without this rule a "
        "double-tap silently doubles a day's wage, and the error is invisible to both "
        "parties until settlement.", "body"))
    story.append(P(
        "The rule is enforced in the data layer, not in the interface, because an interface "
        "can always be bypassed by a slow network or a second browser tab. The behaviour is "
        "covered by dedicated assertions in the unit suite.", "body"))

    story.append(H2("6.2  Speaking the ledger aloud"))
    story.append(P(
        "Roughly a quarter of the adults in the target population read their own language "
        "with difficulty, and far fewer read English. The wage ledger therefore has a "
        "read-aloud control that speaks the current balance and the last three entries in "
        "the selected language, using the browser's built-in speech synthesis. It is not a "
        "gimmick: it is the difference between a record a worker can check and a record they "
        "must take on trust. Where speech synthesis is unavailable the control hides itself "
        "rather than failing noisily.", "body"))

    story.append(H2("6.3  An account that starts empty"))
    story.append(P(
        "A newly created account owns no records. This sounds obvious and was not: an early "
        "build seeded new accounts with the demonstration data, so a worker who had just "
        "signed up saw five other people's shifts and a balance of several thousand rupees. "
        "The demonstration data now belongs exclusively to the isolated exhibition mode, and "
        "the flow test asserts that a fresh account shows an empty state rather than someone "
        "else's history.", "body"))
    story.append(callout(S, "Why this mattered", "Showing a new user someone else's wages is "
                        "not a cosmetic defect. In a system whose entire purpose is trust in "
                        "the arithmetic, the first screen must be empty and honest.", "key"))
    story.append(H2("6.4  What the worker never sees"))
    story.append(P(
        "A design rule for the worker portal was that no screen may require the worker to "
        "understand the contractor's vocabulary. Words like <i>settlement</i>, "
        "<i>reconciliation</i> and <i>liability</i> appear on the contractor's side and are "
        "replaced on the worker's side with the plain question each of them really asks.", "body"))
    story.append(T(
        ["Contractor says", "Worker screen says", "Underlying fact"],
        [
            ["Outstanding liability", "You are owed", "Net due minus payments recorded"],
            ["Pending approval", "Waiting for the site", "A punched shift not yet approved"],
            ["Settlement", "Paid to you", "A recorded advance or weekly payment"],
            ["Itemised deduction", "Taken off, with a reason", "A deduction carrying its justification"],
            ["Reconciliation variance", "Something does not add up", "An anomaly rule has fired"],
        ],
        W(46, 50, 56),
    ))
    story.append(P(
        "The mapping is not cosmetic. A worker who reads <i>\u201coutstanding liability: "
        "\u20b94,300\u201d</i> has "
        "to translate a financial abstraction before they can act on it; a worker who reads "
        "<i>\u201cYou are owed \u20b94,300\u201d</i> already knows what to do. The same number, "
        "stated in the words of the person it belongs to, is a different object.", "body"))

    story += recap(S, 6, [
        "The worker portal opens on the one question a worker actually has: what am I owed, and why?",
        "Attendance is written by a single function that merges duplicate same-day punches instead of crediting a second day.",
        "A new account starts empty; demonstration data belongs only to the isolated exhibition mode.",
    ])
    return story


def ch7():
    story = chapter_opener(S, 7, "The Contractor Dashboard",
        "Chapter seven",
        "Nine tabs, a camera scanner, and an approval step that keeps a human in the loop.")
    story.append(P(
        "The contractor sees the same events from the other side of the counter: who worked, "
        "what was approved, what was paid, what is contested. The dashboard is denser than "
        "the worker portal because a contractor is reconciling many people at once, but it "
        "uses the same components, the same palette and the same arithmetic. Consistency "
        "here is a safety feature: a figure that appears in both portals must look "
        "identical, or the two parties will argue about the interface instead of the money.", "body"))
    story.append(T(
        ["Tab", "Purpose"],
        [
            ["<b>Overview</b>", "Workforce size, outstanding liability, pending approvals, recent activity"],
            ["<b>Workers</b>", "Roster with trade, skill, site, balance; add a worker"],
            ["<b>Attendance</b>", "The muster for a chosen date; approve or dispute a shift"],
            ["<b>Ledger</b>", "Per-worker wage protection ledger with full breakdown"],
            ["<b>Scanner</b>", "Camera or manual verification of a worker pass"],
            ["<b>Approvals</b>", "Queue of pending punches with age and site"],
            ["<b>Disputes</b>", "Grievances raised by workers, with claim amounts"],
            ["<b>Audit</b>", "The hash chain for a selected worker, verifiable in one tap"],
            ["<b>Profile</b>", "Contractor identity, site assignments, contact details"],
        ],
        W(30, 138),
    ))
    story.append(H2("7.1  The scanner, and why it is only half the answer"))
    story.append(P(
        "The scanner uses the device camera and decodes QR codes in the browser. It accepts "
        "both the current payload shape and the legacy one, because a printed card cannot be "
        "recalled when the format changes — a decision made after a demonstration in which an "
        "old pass silently failed to scan.", "body"))
    story.append(P(
        "Camera access requires a secure context, so the scanner degrades to manual reference "
        "entry on an insecure origin rather than presenting a dead viewfinder. This matters "
        "in the field: a demonstration laptop on a local network address is not a secure "
        "origin, and a scanner that fails silently there makes the whole system look broken.", "body"))

    story.append(H2("7.2  Approval, not assertion"))
    story.append(P(
        "When a worker punches attendance, the record is created in a pending state. The "
        "contractor approves it, and only then does it enter the wage computation. This "
        "single design choice prevents the most common failure of self-reported attendance: "
        "a shift that was never worked becomes indistinguishable from one that was, and the "
        "contractor's only recourse is to distrust the entire ledger.", "body"))
    story.append(P(
        "The cost is friction, and the friction is visible: the approvals tab shows the age "
        "of every pending request, because a queue that nobody clears is itself the "
        "complaint. The worker's side shows the same age. Neither party can claim ignorance "
        "of a request that has been waiting eleven days.", "body"))

    story.append(H2("7.3  A number nobody has to trust"))
    story.append(P(
        "The ledger tab is the contractor's compliance view. For each worker it shows gross "
        "earnings, allowances, itemised deductions, recorded payments, acknowledged payments, "
        "and the outstanding balance, with the arithmetic visible line by line. A separate "
        "column marks payments the worker has explicitly acknowledged, which is the closest "
        "the prototype comes to a receipt.", "body"))
    story.append(T(
        ["Column", "Meaning", "Rule"],
        [
            ["Gross earned", "Sum of approved shifts at their recorded rate", "Attendance only; never a typed total"],
            ["Allowances", "Bonus or independent credit", "Daily credits generated by attendance are excluded to avoid double counting"],
            ["Deductions", "Itemised penalty or adjustment", "Each must carry a reason; an unreasoned deduction raises RULE-05"],
            ["Payments recorded", "Advance or weekly settlement", "Reduces the balance; can never increase earnings"],
            ["Acknowledged", "Payments the worker confirmed", "Only these count towards a receipted total"],
            ["Balance", "Net due minus recorded payments", "Overpayment is reported separately, never as a negative wage"],
        ],
        W(32, 74, 62),
    ))
    story += recap(S, 7, [
        "The contractor dashboard is denser than the worker portal but shares its components, palette and arithmetic, so a figure looks identical on both sides of the counter.",
        "A punched shift stays pending until a contractor approves it — friction that prevents self-reported attendance from outrunning reality.",
        "The scanner accepts both current and legacy pass payloads and degrades to manual entry on an insecure origin.",
    ])
    return story


def ch8():
    story = chapter_opener(S, 8, "The Smart Shram Pass and Verification",
        "Chapter eight",
        "One QR code, zero personal data, and a verification page that admits what it cannot prove.")
    story.append(P(
        "The pass is a small card a worker can print, laminate and carry. On one side it "
        "carries a photograph, a name, a trade, a skill category, the site where they are "
        "registered, a masked e-Shram number, a blood group and a QR code. Everything else — "
        "the ledger, the audit chain, the disputes — lives behind the code.", "body"))
    story.append(H2("8.1  What the QR code contains"))
    story.append(P(
        "The code encodes exactly one URL: "
        "<font face='Mono' size=8>https://shramsetu.in/#/verify?refToken=WKR-MP-001</font>. "
        "The token is an opaque reference that maps to a record inside the application; it is "
        "not derived from any identifier, and it discloses nothing on its own. There is no "
        "name, no Aadhaar digits, no wage figure and no phone number in the payload. A "
        "photograph of the card, taken by a stranger, reveals less than the card already "
        "shows.", "body"))
    story.append(P(
        "This was a deliberate trade against convenience. Encoding the wage balance into the "
        "QR code would let a scanner display the amount without any lookup at all — and would "
        "also let anyone who saw the card learn a worker's debt, advance or disputed amount. "
        "The privacy rule won.", "body"))

    # vector pass mock
    from reportlab.graphics.shapes import Drawing, Rect, String, Image as GImage, Line
    d = Drawing(168 * mm, 81 * mm)
    d.add(Rect(0, 0, 168 * mm, 81 * mm, rx=6, ry=6, fillColor=SAND_100, strokeColor=SAND_200))
    # forest header band
    d.add(Rect(0, 61 * mm, 168 * mm, 20 * mm, rx=6, ry=6, fillColor=FOREST, strokeColor=FOREST))
    d.add(Rect(0, 61 * mm, 168 * mm, 12 * mm, fillColor=FOREST, strokeColor=FOREST))
    d.add(String(8 * mm, 73.5 * mm, "SMART SHRAM PASS", fontName="Sans-Bold",
                 fontSize=11, fillColor=BRASS))
    d.add(String(8 * mm, 66.5 * mm, "Verified work and wage record  ·  Indore, Madhya Pradesh",
                 fontName="Sans", fontSize=7.2, fillColor=FOREST_100))
    # portrait and details
    d.add(GImage(8 * mm, 24 * mm, 30 * mm, 30 * mm, PORTRAIT))
    d.add(String(43 * mm, 48 * mm, "Rameshwar Lal Ahirwar", fontName="Sans-Bold",
                 fontSize=11, fillColor=INK))
    d.add(String(43 * mm, 42.5 * mm, "Head Mason  ·  Skilled", fontName="Sans",
                 fontSize=8.2, fillColor=INK_600))
    d.add(String(43 * mm, 36.5 * mm, "e-Shram UAN   **** **** 9102", fontName="Mono",
                 fontSize=7.4, fillColor=INK_600))
    d.add(String(43 * mm, 31 * mm, "BOCW  MP-BOCW-IND-2023-88910", fontName="Mono",
                 fontSize=7.4, fillColor=INK_600))
    d.add(String(43 * mm, 25.5 * mm, "Site  SITE-IND-METRO-01  ·  Blood group  B+",
                 fontName="Mono", fontSize=7.4, fillColor=INK_600))
    d.add(GImage(132 * mm, 27 * mm, 28 * mm, 28 * mm, QR))
    d.add(String(132 * mm, 21.5 * mm, "Scan to verify", fontName="Sans", fontSize=7,
                 fillColor=INK_400))
    d.add(Line(8 * mm, 15 * mm, 160 * mm, 15 * mm, strokeColor=SAND_200, strokeWidth=0.8))
    d.add(String(8 * mm, 9.5 * mm, "Opaque reference only - no Aadhaar number, wage figure or "
                 "phone number is encoded.", fontName="Sans", fontSize=6.8, fillColor=INK_400))
    d.add(String(8 * mm, 5 * mm, "Shram Setu 2.0 prototype  ·  not a government document",
                 fontName="Sans", fontSize=6.8, fillColor=BRASS_DARK))
    story.append(Spacer(1, 3))
    story.append(d)
    story.append(P("Figure 8.1 — The pass, reconstructed as a vector drawing for this report. "
                   "The photograph is a demonstration portrait from the project's own asset "
                   "set; the QR code is a real, scannable code pointing at the verification "
                   "route.", "caption"))

    story.append(H2("8.2  Printing, laminating and carrying"))
    story.append(P(
        "A pass that exists only on a screen is useless at a site gate where the phone has no "
        "battery. The card is therefore designed to be printed, and the print stylesheet strips "
        "the interface down to the card itself — no navigation, no buttons, no background "
        "colour, so a school printer with a half-empty cartridge still produces something "
        "legible.", "body"))
    story.append(T(
        ["Practical detail", "Recommendation", "Why"],
        [
            ["Paper", "A4, 200 gsm if available", "Stiff enough to survive a shirt pocket"],
            ["Scale", "100 percent, no fit-to-page", "Keeps the QR modules square"],
            ["QR module size", "At least 8 mm across", "Reliable scan from a mid-range phone at 30 cm"],
            ["Laminate", "Matte, not gloss", "Gloss reflects sunlight and defeats the scanner"],
            ["Replacement", "Reissue on a change of site or trade", "The token stays valid; only the printed details change"],
            ["Loss", "Same reference reissued, no new identity", "A lost card must not become a lost record"],
        ],
        W(30, 60, 60),
    ))
    story.append(P(
        "The last row is the important one. Because the QR code carries an opaque reference "
        "rather than an identity, a lost card can be reprinted from any device that holds the "
        "record. In a system where the card <i>were</i> the identity, losing it would mean "
        "losing the proof of months of work — an obvious design trap that the token approach "
        "avoids by construction.", "body"))

    story.append(H2("8.3  What verification establishes"))
    story.append(KeepTogether(T(
        ["Established by a scan", "Not established by a scan"],
        [
            ["A record with this reference exists in this system", "That the person holding the card is the worker named on it"],
            ["The trade, skill category and registering site on file", "That the worker is currently employed or in good standing"],
            ["The integrity status of the audit chain behind the record", "That the record is complete outside the device that holds it"],
            ["Whether any recorded event has been altered since signing", "That any authority has audited or approved the arithmetic"],
        ],
        W(84, 84),
    ) + [P(
        "Presenting these two columns next to each other is the most important piece of "
        "honesty in the entire project. A verification page that only shows the left column "
        "teaches its users to over-trust a QR code, and over-trust is how prototypes cause "
        "harm when they are deployed.", "body")]))

    story.append(H2("8.3  Printing, laminating and carrying"))
    story.append(P(
        "A pass that exists only on a screen is useless at a site gate where the phone has no "
        "battery. The card is therefore designed to be printed, and the print stylesheet strips "
        "the interface down to the card itself — no navigation, no buttons, no background "
        "colour, so a school printer with a half-empty cartridge still produces something "
        "legible.", "body"))
    story.append(T(
        ["Practical detail", "Recommendation", "Why"],
        [
            ["Paper", "A4, 200 gsm if available", "Stiff enough to survive a shirt pocket"],
            ["Scale", "100 percent, no fit-to-page", "Keeps the QR modules square"],
            ["QR module size", "At least 8 mm across", "Reliable scan from a mid-range phone at 30 cm"],
            ["Laminate", "Matte, not gloss", "Gloss reflects sunlight and defeats the scanner"],
            ["Replacement", "Reissue on a change of site or trade", "The token stays valid; only the printed details change"],
            ["Loss", "Same reference reissued, no new identity", "A lost card must not become a lost record"],
        ],
        W(30, 60, 60),
    ))
    story.append(P(
        "The last row is the important one. Because the QR code carries an opaque reference "
        "rather than an identity, a lost card can be reprinted from any device that holds the "
        "record. In a system where the card <i>were</i> the identity, losing it would mean "
        "losing the proof of months of work — an obvious design trap that the token approach "
        "avoids by construction.", "body"))

    story += recap(S, 8, [
        "The QR code carries one opaque reference and nothing else: no Aadhaar digits, no wage figure, no phone number.",
        "A scan establishes that a record exists and whether its chain is intact; it does not establish who is holding the card.",
        "Both columns are printed together in the product, so users learn the limit of a scan at the same moment they learn its power.",
    ])
    return story


def ch9():
    story = chapter_opener(S, 9, "The Wage Engine",
        "Chapter nine",
        "Money in integer paise, one function allowed to decide, and every line showing its own arithmetic.")
    story.append(H2("9.1  Why integers"))
    story.append(P(
        "Floating-point arithmetic cannot represent one-tenth exactly, so a long ledger of "
        "additions accumulates drift. In a wage ledger the drift is small — a few paise — but "
        "it is <i>visible</i>, and a visible inconsistency is enough to destroy a worker's "
        "confidence in the entire record. The engine therefore stores and computes every "
        "amount in integer paise, converting to rupees only at the boundary of the interface. "
        "Rounding is applied once, at conversion, with a documented rule.", "body"))
    story.append(T(
        ["Operation", "Implementation", "Reason"],
        [
            ["Rupee to paise", "round(rupees × 100)", "Single conversion point; no float retained"],
            ["Paise to rupee", "round(paise) ÷ 100", "Rounding applied once, at display"],
            ["Half day", "round(base × 0.5)", "Exact for even rupee amounts"],
            ["Overtime (2h)", "base + round(base ÷ 8 × 2)", "Pro-rata to an eight-hour day"],
            ["Overtime (4h)", "base + round(base ÷ 8 × 4)", "Same rule, longer block"],
        ],
        W(34, 70, 64),
    ))

    story.append(H2("9.2  The breakdown, in the order it is computed"))
    story.append(N(1, "<b>Gross earnings</b> are summed from approved attendance only: "
                      "<font face='Mono' size=8>present</font> and "
                      "<font face='Mono' size=8>overtime</font> count as full days, "
                      "<font face='Mono' size=8>half_day</font> counts separately, and overtime "
                      "hours accumulate for reporting."))
    story.append(N(2, "<b>Ledger entries</b> are de-duplicated by identifier before any "
                      "arithmetic, so the same payment cannot be counted twice even if it "
                      "appears twice in storage."))
    story.append(N(3, "<b>Allowances</b> add; <b>deductions</b> subtract. Daily credits that "
                      "were generated by attendance itself are excluded, because attendance "
                      "has already contributed them — a subtle double-count that the test "
                      "suite checks directly."))
    story.append(N(4, "<b>Net due</b> = gross + allowances − deductions, floored at zero."))
    story.append(N(5, "<b>Balance</b> = net due − payments recorded. If payments exceed net "
                      "due, the excess is reported as an overpayment, never as a negative "
                      "wage."))
    story.append(N(6, "<b>Disputed amount</b> is the sum of open claims, reported alongside "
                      "the balance and never merged into it."))
    story.append(spacer(2))
    story.append(T(
        ["Line", "Rule", "Example (INR)"],
        [
            ["Gross earned", "Sum of approved shifts", "4,300.00"],
            ["+ Allowances", "Bonus, independent credits", "300.00"],
            ["− Deductions", "Itemised, each with a reason", "150.00"],
            ["= Net due", "Gross + allowances − deductions", "4,450.00"],
            ["− Payments recorded", "Advances and settlements", "3,000.00"],
            ["= Balance", "Net due − payments", "1,450.00"],
            ["Of which disputed", "Open claims, shown separately", "500.00"],
        ],
        W(40, 76, 52),
        align_right=(2,),
    ))
    story.append(callout(S, "The invariant that everything depends on", "Payments reduce a "
                        "balance and never increase earnings. It sounds trivial; it is the "
                        "single most common defect in wage software, because a settlement is "
                        "stored as a positive number in the same table as an earning. The "
                        "engine separates the two categories by type before any arithmetic, "
                        "and an assertion fails the build if a payment ever appears in the "
                        "earnings total.", "key"))

    story.append(H2("9.3  Worked example"))
    story.append(P(
        "A head mason on a base rate of ₹550 works three full days, one half day and one "
        "two-hour overtime day, receives a ₹300 festival bonus, has a ₹150 deduction for "
        "damaged material (with a recorded reason), and has taken a ₹3,000 advance. The "
        "engine reports gross ₹4,125, net due ₹4,275, balance ₹1,275, and no overpayment. "
        "Every one of those figures can be recomputed by hand from the four visible lines, "
        "which is the point: the ledger is intended to be checked, not trusted.", "body"))
    story += recap(S, 9, [
        "All money is computed in integer paise with a single rounding step, so a long ledger never drifts.",
        "One function decides a balance; the interface may display it but never recompute it.",
        "Payments reduce a balance and can never increase earnings — the invariant the whole ledger depends on.",
    ])
    return story


def ch10():
    story = chapter_opener(S, 10, "The Cryptographic Audit Trail",
        "Chapter ten",
        "An append-only chain in which every event signs the one before it.")
    story.append(P(
        "Recording history is easy; proving that history has not been edited is harder. Shram "
        "Setu 2.0 borrows the essential idea of a blockchain without any of its overhead: "
        "each event's SHA-256 digest includes the digest of the event before it. Altering an "
        "event three months old changes its digest, which breaks the link held by the next "
        "event, which breaks the next, and so on to the head of the chain. Tampering does not "
        "become impossible; it becomes visible, which in a dispute is what matters.", "body"))
    story.append(H2("10.1  Canonical serialisation"))
    story.append(P(
        "A hash is only meaningful if the same logical content always produces the same "
        "bytes. JavaScript object key order is not guaranteed, so the engine serialises every "
        "payload with keys sorted alphabetically, arrays in order, nulls preserved and "
        "undefined values dropped. Both the signer and the verifier use the same function, so "
        "a single implementation decides what an event means.", "body"))
    story.append(P("Each digest is computed over a canonical object containing nine fields:", "body"))
    story.append(T(
        ["Field", "Purpose"],
        [
            ["seq", "Monotonic sequence number — detects reordering and deletion"],
            ["type", "Entity type (attendance, ledger, dispute, approval)"],
            ["id", "Entity identifier"],
            ["act", "Action performed (create, approve, settle, acknowledge)"],
            ["role / actor", "Who performed it, and in which role"],
            ["ts", "ISO-8601 timestamp of the event"],
            ["data", "The canonical payload of the event itself"],
            ["prev", "The digest of the preceding event — the chain link"],
        ],
        W(26, 142),
        mono_cols=(0,),
    ))

    story.append(H2("10.2  Four verification outcomes"))
    story.append(P(
        "A verifier that can only say \"valid\" or \"invalid\" is not much use. The engine "
        "reports one of four specific outcomes, each with the event that failed and the "
        "reason.", "body"))
    story.append(T(
        ["Outcome", "Meaning", "Typical cause"],
        [
            ["<b>INTEGRITY_PASSED</b>", "Every digest recomputes and every link holds", "Normal operation"],
            ["<b>RECORD_MODIFIED</b>", "A digest does not match its content", "An event was edited after signing"],
            ["<b>CHAIN_LINKAGE_BROKEN</b>", "A link points to the wrong predecessor", "An event was deleted, reordered or re-signed"],
            ["<b>VERIFICATION_INCOMPLETE</b>", "Fields missing or chain empty", "Storage truncated, or nothing recorded yet"],
        ],
        W(46, 66, 56),
    ))
    story.append(P(
        "The distinction between the second and third outcome is what makes the report "
        "diagnostic rather than merely alarming: an edited amount produces "
        "RECORD_MODIFIED, while a deleted row produces CHAIN_LINKAGE_BROKEN, and the two "
        "require very different conversations.", "body"))

    story.append(H2("10.3  A fragment of a real chain"))
    story.append(T(
        ["Seq", "Event", "Actor", "Digest (first 16 hex)"],
        [
            ["0118", "attendance.create", "CTR-IND-METRO", "9f2c a71b 4e0d 88c3"],
            ["0119", "attendance.approve", "CTR-IND-METRO", "1b7e 0c44 9aa2 51fd"],
            ["0120", "ledger.settle", "CTR-IND-METRO", "c40a 33d9 7f18 b2e6"],
            ["0121", "ledger.acknowledge", "WKR-MP-001", "55e1 8b0f d2a7 3904"],
            ["0122", "dispute.create", "WKR-MP-001", "a90d 62c5 1184 ee7b"],
        ],
        W(16, 58, 44, 50),
        mono_cols=(0, 3),
    ))
    story.append(P(
        "Each row is signed with the row above it. Change ₹3,000 to ₹8,000 in the settlement "
        "event and its digest changes, so event 0121's <font face='Mono' size=8>prev</font> "
        "field no longer matches, and verification stops at that exact row with "
        "CHAIN_LINKAGE_BROKEN. The audit screen shows the failing event by identifier rather "
        "than telling the user that \"something is wrong\".", "body"))
    story.append(callout(S, "What hashing does not do", "A hash chain cannot prevent a user "
                        "with full control of a device from rewriting the entire chain from "
                        "genesis and re-signing every event. It detects casual and local "
                        "tampering; it does not provide immutable storage. Real immutability "
                        "requires an independent witness — a government registry, a notary, "
                        "or a second party holding the chain head. Chapter 17 discusses what "
                        "that would take.", "warn"))
    story += recap(S, 10, [
        "Each audit event's SHA-256 digest includes the previous event's digest, so altering history breaks the chain visibly.",
        "Verification reports one of four specific outcomes, naming the failing event rather than saying that something is wrong.",
        "Hashing detects tampering; it does not prevent it. Real immutability needs an independent witness.",
    ])
    return story


def ch11():
    story = chapter_opener(S, 11, "Deterministic Anomaly Detection",
        "Chapter eleven",
        "Seven rules that raise a question, never an accusation.")
    story.append(P(
        "A system that flags \"suspicious behaviour\" with a score invites its users to "
        "punish people for arithmetic. Shram Setu 2.0 therefore contains no scoring, no "
        "machine learning and no probability. It contains seven explicit rules. Each rule "
        "declares exactly what it examined, states the threshold it used, explains what it "
        "observed, offers a suggested human action, and — where relevant — states what it "
        "cannot conclude.", "body"))
    story.append(T(
        ["Rule", "Name", "Severity", "What it actually checks"],
        [
            ["RULE-01", "Duplicate Daily Work Entry", "warning", "Two or more punches for one worker on one date"],
            ["RULE-02", "Excessive Continuous Shift Duration", "warning", "Base + overtime hours exceed 12 in a single day"],
            ["RULE-03", "Retroactive Deduction Modification", "warning", "A deduction edited after its original entry"],
            ["RULE-04", "Surplus Advance Balance", "info", "Advances paid exceed wages earned — a reconciliation prompt"],
            ["RULE-05", "Unreasoned Wage Deduction", "warning", "A deduction recorded without a stated reason"],
            ["RULE-06", "Overdue Wage Settlement", "warning", "Outstanding balance older than the configured threshold"],
            ["RULE-07", "Statutory Benchmark Discrepancy", "warning", "Daily rate below the reference floor for the skill category"],
        ],
        W(20, 58, 22, 68),
        mono_cols=(0,),
    ))

    story.append(H2("11.1  The most instructive rule"))
    story.append(P(
        "RULE-02 originally computed shift duration across a worker's whole attendance "
        "history, so four consecutive eight-hour days were reported as a single thirty-two "
        "hour shift. The rule was alarming, wrong, and would have made every diligent worker "
        "look like a safety violation. It now evaluates each calendar date independently, and "
        "its explanation states that a multi-day roster is deliberately not treated as one "
        "continuous shift.", "body"))
    story.append(P(
        "The defect is worth reporting for a reason beyond itself: it demonstrates why the "
        "rules must be deterministic and auditable. A statistical model would have produced "
        "the same absurd output with far less chance of anyone noticing, because there would "
        "have been no expression to read.", "body"))

    story.append(H2("11.2  How the benchmark rule speaks"))
    story.append(P(
        "RULE-07 compares a logged daily rate against a reference floor for the worker's "
        "skill category. Its text is worth quoting because it shows the tone the whole engine "
        "adopts:", "body"))
    story.append(callout(S, "RULE-07 · Statutory Wage Rate Benchmark Discrepancy",
                         "Daily wage rate of ₹420 logged on 12 March is below the baseline "
                         "reference of ₹465 per day. <b>Important legal notice:</b> this "
                         "benchmark is an unverified prototype gazette reference; local field "
                         "compliance requires official notification by the District Labour "
                         "Officer. <i>Suggested action:</i> inspect the prevailing regional "
                         "minimum-wage notification issued by the MP Labour Commissioner.", "note"))
    story.append(P(
        "The rule does not say the employer underpaid. It says the rate is below a reference "
        "the system carries, that the reference is unverified, and where the authoritative "
        "figure can be obtained. A worker who reads that sentence knows exactly what to do "
        "next; a worker who reads \"suspicious: 87%\" knows nothing.", "body"))
    story.append(H2("11.3  Anatomy of an alert"))
    story.append(P(
        "Every alert, whatever rule produced it, carries the same six fields. The uniformity is "
        "deliberate: a reader who has understood one alert has understood all of them, and a "
        "developer adding an eighth rule cannot accidentally invent a new shape.", "body"))
    story.append(T(
        ["Field", "Content", "Purpose"],
        [
            ["<font face='Mono' size=7.6>ruleId</font>", "RULE-01 to RULE-07", "Lets a reader look up exactly what was checked"],
            ["<font face='Mono' size=7.6>ruleName</font>", "Plain-language title", "Readable on a phone without jargon"],
            ["<font face='Mono' size=7.6>severity</font>", "warning or info", "Distinguishes a payable concern from a reconciliation prompt"],
            ["<font face='Mono' size=7.6>valuesExamined</font>", "The actual numbers used", "Makes the alert reproducible by hand"],
            ["<font face='Mono' size=7.6>triggerCondition</font>", "The threshold in words", "Shows why it fired, not merely that it did"],
            ["<font face='Mono' size=7.6>suggestedAction</font>", "A human next step", "Ends the alert with something to do rather than a verdict"],
        ],
        W(38, 48, 66),
        mono_cols=(0,),
    ))
    story.append(P(
        "What no alert carries is a score. Nothing in the interface ranks a worker by "
        "suspicion, colours a name red, or aggregates alerts into a risk rating, because each "
        "of those would turn a question into a judgement about a person. A worker who has been "
        "underpaid three times generates the same three warnings as a worker whose dates were "
        "typed carelessly, and the system has no opinion about which is which.", "body"))

    story += recap(S, 11, [
        "Seven explicit rules replace scoring: each states what it examined, the threshold used, and what it cannot conclude.",
        "Rule text is written as a question for a human, never as an accusation of a person.",
        "The most instructive defect — a multi-day roster read as one 32-hour shift — shows why deterministic, readable rules matter.",
    ])
    return story


def ch12():
    story = chapter_opener(S, 12, "Accounts, Roles and Data Protection",
        "Chapter twelve",
        "Two roles, an isolated exhibition mode, and a signed-out state that keeps its records.")
    story.append(H2("12.1  Lifecycle"))
    story.append(P(
        "A visitor may create a worker account or a contractor account, sign in, recover a "
        "password by address, and sign out. Signing out clears the session only: records, "
        "ledger entries and audit history remain, so a worker who signs out on a shared phone "
        "and returns a month later finds their history intact.", "body"))
    story.append(T(
        ["Identifier", "Format", "Example", "Scope"],
        [
            ["Worker", "WKR-###### or seeded WKR-MP-###", "WKR-MP-001", "Own attendance, ledger, disputes, pass"],
            ["Contractor", "CTR-###### or seeded CTR-IND-METRO", "CTR-IND-METRO", "Assigned workers and sites only"],
            ["Site", "SITE-…", "SITE-IND-METRO-01", "Attendance context and geofence reference"],
            ["Audit event", "AUD-YYYY-MM-DD-NNNN", "AUD-2026-03-12-0119", "Append-only, chained"],
        ],
        W(28, 62, 42, 36),
        mono_cols=(1, 2),
    ))

    story.append(H2("12.2  Passwords"))
    story.append(P(
        "Passwords are never stored. The application derives a salted SHA-256 digest — "
        "salt composed of the user identifier plus the password — and stores only the digest. "
        "This is honest but weak by professional standards: SHA-256 is fast, so an offline "
        "attacker with the stored digest can try candidates quickly. A production system "
        "would use a memory-hard function such as Argon2id with a per-user random salt. The "
        "prototype states this limitation rather than hiding behind the word \"encrypted\".", "body"))
    story.append(callout(S, "A real bug in the sign-in path", "Sign-in originally returned "
                        "immediately when the optional hosted authentication service reported "
                        "an error, so a user whose local account was perfectly valid could not "
                        "sign in whenever the network was unavailable — the worst possible "
                        "failure mode for a field application. The function now holds the "
                        "remote error, always performs the local lookup, and rebuilds a local "
                        "profile from the remote account's metadata if the cloud knows a user "
                        "the device does not. The remote error surfaces only if the local "
                        "lookup also fails.", "warn"))

    story.append(H2("12.3  Where the data lives"))
    story.append(T(
        ["Key", "Contents"],
        [
            ["<font face='Mono' size=7.6>shramsetu_workers</font>", "Worker profiles"],
            ["<font face='Mono' size=7.6>shramsetu_sites</font>", "Construction sites"],
            ["<font face='Mono' size=7.6>shramsetu_attendance</font>", "Muster punches and approvals"],
            ["<font face='Mono' size=7.6>shramsetu_ledger</font>", "Wage credits, deductions, payments"],
            ["<font face='Mono' size=7.6>shramsetu_grievances</font>", "Disputes and their status"],
            ["<font face='Mono' size=7.6>shramsetu_approval_requests</font>", "Pending approvals"],
            ["<font face='Mono' size=7.6>shramsetu_pwd_hash_*</font>", "Per-user password digests only"],
        ],
        W(64, 104),
        mono_cols=(0,),
    ))
    story.append(P(
        "Everything above stays in the browser. Nothing is uploaded. That is a genuine privacy "
        "advantage of the prototype and a genuine functional limitation, and both are stated "
        "in the privacy page the application itself serves.", "body"))

    story.append(H2("12.4  The exhibition mode"))
    story.append(P(
        "Judges need to see a populated system; real users need an empty one. The judge demo "
        "is therefore an isolated world with its own identifier, its own workers and its own "
        "chain, entered deliberately from the header and left by signing out. It cannot be "
        "confused with a real account because its identifiers are fixed demonstration values, "
        "and no genuine account can be created inside it.", "body"))
    story += recap(S, 12, [
        "Signing out clears the session only; records, ledger and audit history remain for the next visit.",
        "Passwords are stored as salted SHA-256 digests, which is honest but weaker than Argon2id, and the report says so.",
        "The exhibition mode is an isolated world with fixed demonstration identifiers, so it can never be confused with a real account.",
    ])
    return story


def ch13():
    story = chapter_opener(S, 13, "Bilingual Access and Language",
        "Chapter thirteen",
        "297 keys, two languages, and a document that declares which one it is speaking.")
    story.append(P(
        "Hindi is not a translation layer added at the end; it is the primary language of most "
        "of the intended users. The interface therefore treats English and Hindi as equals, "
        "with a single dictionary of 297 entries per language, a formatter that handles "
        "currency and dates per locale, and typography that switches to Noto Sans Devanagari "
        "for Hindi text so the conjuncts and matras render correctly rather than as boxes.", "body"))
    story.append(P(
        "A unit assertion compares the key counts of the two dictionaries on every build, and "
        "a second assertion renders a parameterised string in both languages to confirm "
        "interpolation survives translation. A missing Hindi key therefore fails the test "
        "bench rather than appearing as English text in the middle of a Hindi screen — a "
        "failure mode that is easy to ship and embarrassing to demonstrate.", "body"))
    story.append(T(
        ["Concern", "Implementation"],
        [
            ["First visit", "Language taken from the browser's preference list"],
            ["Persistence", "Choice remembered per device"],
            ["Switch", "Header control, available on every route, no navigation loss"],
            ["Document", "The root lang attribute follows the interface language"],
            ["Typography", "Devanagari face applied through the font stack, not per string"],
            ["Numbers", "Currency and dates formatted by a locale-aware helper"],
            ["Speech", "Read-aloud uses the matching speech-synthesis voice where installed"],
        ],
        W(34, 134),
    ))
    story.append(callout(S, "Terminology decisions", "Several English terms have no settled "
                        "Hindi equivalent in this domain. \"Ledger\" is rendered as the "
                        "worker's khata, the word a worker already uses for the book in which "
                        "a shopkeeper records debt. \"Muster roll\" is described functionally "
                        "rather than transliterated. Where a borrowed English word is what "
                        "people actually say, the borrowing is kept — clarity outranks "
                        "purity.", "note"))
    story += recap(S, 13, [
        "English and Hindi are treated as equals: 297 keys each, with parity enforced by an assertion on every build.",
        "The language is taken from the browser on first visit, remembered afterwards and switchable from any route.",
        "Where a borrowed English word is what people actually say, the borrowing is kept — clarity outranks purity.",
    ])
    return story


def ch14():
    story = chapter_opener(S, 14, "The Offline Single-File Edition",
        "Chapter fourteen",
        "One file, 1.9 megabytes, zero network requests, double-click to open.")
    story.append(P(
        "A demonstration that depends on a venue's Wi-Fi is a demonstration that can fail in "
        "front of a judge. The project therefore emits a second build target: a single HTML "
        "file containing the application, its stylesheet, four variable typefaces, both "
        "photographs and every route, which opens from a USB stick on a laptop that has never "
        "seen the internet.", "body"))
    story.append(T(
        ["Component", "Size", "How it is embedded"],
        [
            ["Application", "967 kB", "One classic script, dynamic imports inlined"],
            ["Stylesheet", "147 kB", "Inlined in a style block, no code splitting"],
            ["Typefaces", "393 kB", "Four variable faces as base64 WOFF2"],
            ["Photographs", "304 kB", "Recompressed and base64-inlined"],
            ["<b>Total</b>", "<b>1.90 MB</b>", "<b>Single self-contained index.html</b>"],
        ],
        W(34, 34, 100),
        align_right=(1,),
    ))
    story.append(H2("14.1  Four defects found by building it"))
    story.append(N(1, "<b>The bundle ran too early.</b> Inlined into the document head, the "
                      "script executed before the root element existed and React refused to "
                      "mount, producing a blank page. The script is now placed at the end of "
                      "the body."))
    story.append(N(2, "<b>String substitution corrupted the code.</b> Replacing the bundle "
                      "with a plain string let sequence markers inside minified React be "
                      "interpreted as replacement patterns, silently mangling the application. "
                      "Replacement now uses function callbacks, and the finished script is "
                      "parsed with a real parser before it is written."))
    story.append(N(3, "<b>Image paths were spliced into string literals.</b> Replacing a path "
                      "without its quotes inserted code as text, so photographs rendered as "
                      "the literal characters of a variable name. Whole literals are now "
                      "replaced."))
    story.append(N(4, "<b>A file has no origin.</b> Opened from disk, the browser reports the "
                      "origin as the string \"null\", so every generated pass link encoded "
                      "\"null/#/verify\". A single helper now decides the verification URL for "
                      "both hosted and offline contexts and falls back to the canonical public "
                      "address."))
    story.append(H2("14.2  Storage when storage is denied"))
    story.append(P(
        "Some managed browsers block local storage for documents opened from disk. Rather "
        "than crash on the first write, the offline build installs a small in-memory "
        "replacement for the storage API, so the demonstration continues and simply forgets "
        "its data when the tab closes. The behaviour is stated in the same screen that would "
        "otherwise show an unexplained failure.", "body"))
    story.append(P(
        "A twelve-check harness opens the finished file from disk in a browser-like "
        "environment and asserts that it mounts, renders the home screen, navigates by hash, "
        "contains no external script, stylesheet, font request or remote subresource, and "
        "loads both photographs from embedded data. The harness exists because this build "
        "silently broke four times, and every one of those failures was invisible to the "
        "source-level tests.", "body"))
    story.append(H2("14.3  What works offline, and what does not"))
    story.append(P(
        "The offline edition is the whole application, not a cut-down preview, so almost every "
        "feature behaves identically. The exceptions are exactly the features that require "
        "either a network or a secure origin, and they are worth stating precisely because a "
        "demonstration should not end in a surprising empty state.", "body"))
    story.append(T(
        ["Capability", "Offline", "Note"],
        [
            ["All public pages and routes", "Works", "Hash routing survives <font face='Mono' size=7.6>file://</font>"],
            ["Pass, muster, ledger, disputes", "Works", "Seeded data loads with the file"],
            ["Exhibit mode and both portals", "Works", "Identical behaviour to the hosted build"],
            ["QR display and printing", "Works", "Encodes the canonical public address"],
            ["Camera scanner", "Blocked by the browser", "No secure origin on <font face='Mono' size=7.6>file://</font>; manual entry offered"],
            ["Read aloud", "Depends on the device", "Uses installed speech voices; hides itself if absent"],
            ["Cross-device sharing", "Not available", "Records live in one browser profile"],
        ],
        W(46, 40, 66),
    ))
    story.append(P(
        "The camera limitation is not a defect to be hidden. When a judge asks why the scanner "
        "is greyed out, the honest answer — that browsers reserve camera access for secure "
        "origins, and a file opened from a USB stick is not one — is more convincing than an "
        "attempt to work around a deliberate browser protection.", "body"))

    story += recap(S, 14, [
        "The offline edition packs the application, stylesheet, four typefaces and both photographs into one 1.9 MB file.",
        "Four defects — early execution, substitution corruption, spliced paths and a null origin — were invisible to source-level tests and only appeared when the file was opened.",
        "A twelve-check harness now opens that file from disk on every build, because this target failed silently four times.",
    ])
    return story


def ch15():
    story = chapter_opener(S, 15, "Testing and Validation",
        "Chapter fifteen",
        "Four harnesses, 127 checks, and the defects they caught.")
    story.append(P(
        "The project is verified by four independent harnesses rather than by manual clicking. "
        "Each harness answers a different question: does the arithmetic behave, does every "
        "screen survive rendering, does a real user journey complete, and does the offline "
        "file actually boot.", "body"))
    story.append(T(
        ["Harness", "Checks", "Question answered"],
        [
            ["Unit suite", "75 assertions in 14 groups", "Is the arithmetic, hashing, translation and role logic correct?"],
            ["Render harness", "9 screens", "Does every public page produce content with no runtime error?"],
            ["Flow test", "31 steps", "Can a user route, sign up, enter a portal, sign out and run the demo?"],
            ["Offline harness", "12 checks", "Does the single file boot from disk with no network?"],
        ],
        W(36, 46, 86),
    ))
    story.append(H2("15.1  The fourteen unit groups"))
    story.append(T(
        ["Group", "Subject"],
        [
            ["1", "Translation dictionary integrity and key parity"],
            ["2", "Parameterised translation and interpolation"],
            ["3", "Contact number and WhatsApp link correctness"],
            ["4", "Smart pass localisation and trade naming"],
            ["5", "Wage formulas and statutory overtime pro-rata"],
            ["6", "Demonstration-mode data protection"],
            ["7", "Responsive layout and horizontal overflow prevention"],
            ["8", "Authoritative breakdown arithmetic and de-duplication"],
            ["9", "Audit chain — all four verification outcomes"],
            ["10", "Anomaly rules RULE-01 to RULE-07"],
            ["11", "QR payload privacy and token safety"],
            ["12", "Role-based account lifecycle and scoping"],
            ["13", "Contact verification lifecycle and cross-checks"],
            ["14", "Real QR encoding, decoding and cross-device approval"],
        ],
        W(18, 150),
        align_right=(0,),
    ))

    story.append(H2("15.2  The flow test, step by step"))
    story.append(P(
        "The flow test mounts the real application in a browser-like environment and drives it "
        "as a user would: it visits nine routes, audits four rendered screens for accessibility "
        "defects, switches the interface to Hindi and back, requests a route that does not "
        "exist, creates a worker account, enters the portal, checks four tabs, signs out, "
        "launches the exhibit mode, opens the pass, opens the welfare tab, opens the audit "
        "modal, then switches to the contractor view and checks the scanner and audit tabs. A "
        "failure at any step prints the step name and the DOM state that caused it.", "body"))
    story.append(P(
        "The four accessibility audits inside it are worth describing, because they are the "
        "cheapest form of quality control in the project. For each audited screen the test "
        "collects every image without alt text, every button with no accessible name, every "
        "duplicated element id, and every unlabelled form field. The first run found four "
        "unlabelled fields and two icon-only buttons with no name, all of which were fixed "
        "rather than excluded.", "body"))

    story.append(H2("15.3  Defects found and fixed"))
    story.append(T(
        ["Defect", "How it was found", "Fix"],
        [
            ["Header controls remounted on every render", "Flow test (focus lost)", "Components hoisted to module scope"],
            ["Pass QR pointed at a dead route", "Scanning a printed card", "New verification route; legacy payloads accepted"],
            ["Same-day punch double-credited", "Unit suite", "Attendance write merges per worker and date"],
            ["Cloud sign-in blocked local accounts", "Manual test, offline", "Error held; local lookup always performed"],
            ["Welfare tab unreachable", "Flow test", "Tab added to the demo control"],
            ["Modals without Escape or scroll lock", "Accessibility audit", "Shared modal behaviour hook"],
            ["Hindi-first default for everyone", "Flow test (language assertion)", "Locale-driven default with persistence"],
            ["Panic on a forbidden clipboard call", "Manual test on HTTP", "Guarded, with a visible fallback"],
            ["Blank page on any render error", "Offline harness", "Application-wide error boundary"],
        ],
        W(52, 50, 66),
    ))
    story += recap(S, 15, [
        "Four harnesses answer four different questions: arithmetic, rendering, user journey and offline boot.",
        "127 checks run together — 75 unit assertions, 9 rendered screens, 31 flow steps and 12 offline checks.",
        "Nine real defects were found and fixed by these harnesses, including a remount bug that silently destroyed focus.",
    ])
    return story


def ch16():
    story = chapter_opener(S, 16, "Results, Limitations and Honest Disclosures",
        "Chapter sixteen",
        "What works, what does not, and what must not be claimed.")
    story.append(H2("16.1  Results"))
    story.append(P(
        "At the time of writing, all four harnesses pass: 75 of 75 unit assertions, 9 of 9 "
        "rendered screens, 31 of 31 flow steps and 12 of 12 offline checks. The production "
        "build completes in under a second with a 612 kB main bundle, 182 kB gzipped, and "
        "role-scoped chunks that a public visitor never downloads. The offline edition is a "
        "single 1.9 MB file that mounts, renders and navigates with no network.", "body"))
    story.append(T(
        ["Demonstration scenario", "Result"],
        [
            ["Sign up as a worker and land in a clean portal", "Passes; empty state with no foreign data"],
            ["Punch attendance and see it pending", "Passes; duplicate punch merged"],
            ["Approve the shift as a contractor", "Passes; record enters the wage computation"],
            ["Print the pass and scan it from another device", "Passes; verification page resolves the token"],
            ["Alter a stored ledger amount and re-verify", "Passes; reports RECORD_MODIFIED at the exact event"],
            ["Open the offline file from a USB stick", "Passes; 12 of 12 checks"],
        ],
        W(86, 82),
    ))

    story.append(H2("16.2  Limitations, stated plainly"))
    story.append(N(1, "<b>Storage is local.</b> Records live in one browser on one device. "
                      "They are not synced, not backed up and not shared between a worker's "
                      "phone and a contractor's laptop except through the demonstration data."))
    story.append(N(2, "<b>Wage figures are reference values.</b> The minimum-wage floor is a "
                      "prototype reference pending official notification. Every screen that "
                      "uses it says so."))
    story.append(N(3, "<b>No identity verification.</b> A scan proves a record exists; it "
                      "does not prove the person holding the card is the worker named on it."))
    story.append(N(4, "<b>Hashing is not immutability.</b> A local attacker with full device "
                      "control can re-sign a rewritten chain. Detection requires an "
                      "independent witness."))
    story.append(N(5, "<b>Password hashing is fast.</b> A salted SHA-256 digest is better than "
                      "plain text and weaker than Argon2id."))
    story.append(N(6, "<b>Geofencing is modelled, not enforced.</b> The site reference exists "
                      "on every attendance record, but the prototype does not check a GPS "
                      "position against a fence."))
    story.append(N(7, "<b>No offline sync.</b> The single-file edition runs entirely in memory "
                      "of the tab; it does not reconcile with the hosted build."))
    story.append(N(8, "<b>The camera needs a secure context.</b> On a plain-HTTP origin the "
                      "scanner falls back to manual entry by design."))
    story.append(callout(S, "Why this chapter exists", "A project report that lists only "
                        "successes is a sales document. The limitations above are the honest "
                        "state of the work, and each one is also a concrete specification for "
                        "the next version — which is exactly what Chapter 17 contains.", "key"))
    story.append(H2("16.3  A five-minute demonstration"))
    story.append(P(
        "Exhibition time is short and judges arrive at unpredictable moments. The project was "
        "designed so that the most convincing part of it can be shown without preparation, in "
        "five minutes, in this order:", "body"))
    story.append(N(1, "<b>Open the home page.</b> Let the pass card and the counted statistics "
                      "land. Say one sentence about the problem, not about the technology."))
    story.append(N(2, "<b>Enter the exhibit mode.</b> Show the worker's pass, then the wage "
                      "ledger with its visible arithmetic."))
    story.append(N(3, "<b>Scan the pass</b> with a second device, or open the verification link. "
                      "Point out that the QR code contains no personal data."))
    story.append(N(4, "<b>Break the chain.</b> Edit a stored amount in the browser's developer "
                      "console, then press verify. The report names the exact event that no "
                      "longer matches. This is the moment that convinces a technical judge."))
    story.append(N(5, "<b>Switch to Hindi</b> and print the pass to A4. Then open the "
                      "single-file edition with the network switched off."))
    story.append(P(
        "Steps four and five are the ones worth rehearsing, because they are the only steps "
        "where something can visibly fail in front of an audience. Both have been run at least "
        "twenty times during preparation — the tamper demonstration because a single typo in "
        "the console produces a convincing-looking but meaningless result, and the offline "
        "build because it failed silently four separate times before it was trustworthy.", "body"))

    story += recap(S, 16, [
        "Every harness passes and every demonstration scenario completes, including tamper detection at the exact altered event.",
        "Eight limitations are stated plainly, from local-only storage to the absence of identity verification.",
        "Limitation statements double as specifications for the next version rather than as apologies.",
    ])
    return story


def ch17():
    story = chapter_opener(S, 17, "Future Scope",
        "Chapter seventeen",
        "What a real deployment would require, written as a specification rather than a wish list.")
    story.append(H2("17.1  A server, and a conflict rule"))
    story.append(P(
        "The first requirement is a shared backend. Records would move to a hosted database "
        "with per-role row-level security, so that a contractor can read only the workers "
        "assigned to them and a worker can read only their own rows. The interesting problem "
        "is not storage but conflict: if a worker punches attendance offline and a contractor "
        "edits the same day online, the system needs a deterministic rule. The cleanest is "
        "append-only events with a last-writer-wins merge over an event log, keeping the "
        "loser as a visible revision rather than deleting it.", "body"))
    story.append(H2("17.2  Independent witnesses"))
    story.append(P(
        "To make the audit chain genuinely tamper-evident rather than tamper-detectable, the "
        "chain head should be published somewhere the device does not control: a nightly "
        "digest posted to a public registry, a signed email to the worker, or an SMS "
        "containing the day's head hash. Any of these turns a local chain into an externally "
        "anchored one at almost no cost.", "body"))
    story.append(H2("17.3  Institutional integration"))
    story.append(B("<b>e-Shram</b> for account-number validation, so a worker does not retype "
                   "a number that can be checked."))
    story.append(B("<b>BOCW</b> for registration status and welfare entitlement checks."))
    story.append(B("<b>The district labour office</b> for a one-tap escalation that attaches "
                   "the audit chain to a formal complaint — the single feature most likely to "
                   "change an outcome in practice."))
    story.append(B("<b>Bank or UPI rails</b> for payment acknowledgement, so that \"paid\" "
                   "means a settlement reference exists rather than a checkbox."))
    story.append(H2("17.4  Field hardening"))
    story.append(B("Argon2id password hashing with per-user salts, and a device-bound session."))
    story.append(B("True geofenced punches with an accuracy radius and an explicit "
                   "\"location unavailable\" state."))
    story.append(B("Offline-first mobile capture with a durable local queue and conflict "
                   "reporting on reconnection."))
    story.append(B("A printed receipt for every settlement, because paper is still the "
                   "medium a worker can take home."))
    story.append(B("A usability study with twenty workers across two languages, which the "
                   "current design has not yet had."))
    story.append(spacer(4))
    story.append(P(
        "None of these is speculative technology. Each is a well-understood component; what "
        "they require is not invention but resources, institutional partnership and, above "
        "all, field time with the people the system is for.", "body"))
    story.append(P(
        "If this project is continued, the next single step should not be more features. It "
        "should be twenty half-hour conversations with workers at three sites, recorded, "
        "transcribed and read back — because the design decisions in this report were derived "
        "from one such conversation and a great deal of inference. That inference is the "
        "weakest part of the work, and it is the part only field time can fix.", "body"))
    story.append(H2("17.5  A plausible next-term plan"))
    story.append(P(
        "The items above are ordered by cost, not by ambition. If a single school term were "
        "available to continue the work, the sequence below would deliver a deployable pilot "
        "rather than a larger prototype.", "body"))
    story.append(T(
        ["Phase", "Work", "Artefact at the end"],
        [
            ["Weeks 1-2", "Twenty recorded interviews across three sites", "A decision log that corrects or confirms this report"],
            ["Weeks 3-5", "Hosted database with per-role row-level security", "Two devices seeing the same record"],
            ["Weeks 6-7", "Offline capture queue and conflict reporting", "A punch taken in a basement that reconciles on reconnection"],
            ["Week 8", "Chain head published nightly to an independent service", "An externally anchored audit trail"],
            ["Weeks 9-10", "Argon2id passwords, device-bound sessions", "A login that satisfies a security review"],
            ["Week 11", "Printed settlement receipt with a reference number", "A paper artefact a worker can take home"],
            ["Week 12", "Usability test with twenty workers; rewrite copy from their words", "A report chapter that is evidence rather than inference"],
        ],
        W(24, 68, 60),
    ))

    story += recap(S, 17, [
        "A shared backend with per-role row-level security and an append-only conflict rule is the first requirement.",
        "Publishing the chain head to an independent witness turns a local chain into an externally anchored one.",
        "Institutional integration — e-Shram, BOCW, the district labour office, payment rails — would change outcomes more than any interface work.",
    ])
    return story


def ch18():
    story = chapter_opener(S, 18, "Conclusion",
        "Chapter eighteen",
        "A small, legible artefact in place of a large, unwritten assumption.")
    story.append(P(
        "This project began with a question that could be asked in one sentence: can software "
        "give a daily-wage worker a record small enough to carry, private enough to show a "
        "stranger, and precise enough to argue with? After eighteen chapters the answer is a "
        "qualified yes. A worker can now hold a pass whose QR code reveals nothing about "
        "them, behind which sits a ledger whose arithmetic is visible line by line, protected "
        "by a chain that notices when its own history is altered, and presented in a language "
        "and at a size they can actually read.", "body"))
    story.append(P(
        "The qualification matters as much as the yes. The record lives on one device. The "
        "wage floor is a reference, not a notification. A scan proves a record exists, not "
        "that its holder is who the card says. And a hash chain detects alteration without "
        "preventing it. Every one of those limits is printed in the product itself, not "
        "buried in an appendix, because a tool that overstates its guarantees is more "
        "dangerous than a tool that has none.", "body"))
    story.append(P(
        "What was learned along the way is mostly about discipline rather than technology. "
        "The arithmetic had to be built and tested before a single screen existed, because a "
        "beautiful interface over wrong numbers is worse than nothing. The duplicate-punch "
        "rule had to live in the data layer rather than the interface, because an interface "
        "can always be bypassed. The offline build had to be tested by opening it, because "
        "four separate defects in it were invisible to every source-level test. And the "
        "hardest work in the whole project was not writing code but removing claims the "
        "system could not support.", "body"))
    story.append(P(
        f"For a student at <b>{SCHOOL}</b>, the most valuable outcome is not the application "
        "itself. It is the discovery that a careful record is a form of dignity: that when a "
        "worker can point at a line and say <i>this day, this rate, this balance</i>, the "
        "conversation stops being about who is believed and becomes about what is written "
        "down. Software cannot make an employer honest. It can make honesty legible, and "
        "legibility is where fairness starts.", "body"))
    story.append(spacer(8))
    story.append(rule(width="40%", color=BRASS))
    story.append(spacer(6))
    story.append(P("<font color='#6b7a72' size=9>The complete source, the offline edition and "
                   "all four test harnesses accompany this report.</font>", "body"))
    story += recap(S, 18, [
        "The question was answered with a qualified yes: a portable, private, checkable record is achievable in software.",
        "The qualification is printed inside the product, not buried in an appendix.",
        "The most valuable outcome was the discovery that a careful record is a form of dignity — software cannot make an employer honest, but it can make honesty legible.",
    ])
    return story


def references():
    story = [PageBreak(), spacer(10)]
    story.append(P("BIBLIOGRAPHY", "kicker"))
    story.append(Heading("References", S["h1"], level=0, label="References"))
    story.append(rule())
    story.append(spacer(2))
    items = [
        "Government of India. <i>Building and Other Construction Workers (Regulation of "
        "Employment and Conditions of Service) Act, 1976.</i> Ministry of Labour and "
        "Employment.",
        "Government of India. <i>Code on Wages, 2019.</i> Ministry of Labour and Employment.",
        "Ministry of Labour and Employment. <i>e-Shram — National Database of Unorganised "
        "Workers.</i> https://eshram.gov.in",
        "Labour Department, Government of Madhya Pradesh. <i>Minimum Wages Notification, "
        "Indore Region.</i> Office of the District Labour Officer.",
        "NIST. <i>FIPS 180-4: Secure Hash Standard (SHA-256).</i> National Institute of "
        "Standards and Technology, 2015.",
        "W3C. <i>Web Cryptography API.</i> W3C Recommendation, 2017.",
        "W3C. <i>Web Content Accessibility Guidelines (WCAG) 2.2.</i> 2023.",
        "W3C. <i>Web Application Manifest.</i> W3C Working Draft.",
        "MDN Web Docs. <i>IndexedDB, Service Worker API, Web Speech API, MediaDevices.</i> "
        "Mozilla Foundation.",
        "React Documentation. <i>Lazy loading, Suspense, Error Boundaries.</i> Meta Open "
        "Source.",
        "Vite Documentation. <i>Build options, library mode, single-file builds.</i>",
        "World Bank. <i>Social Protection for Informal Workers in South Asia.</i> "
        "Discussion paper.",
        "International Labour Organization. <i>Informal Economy and Decent Work.</i> "
        "ILO reports.",
        "Nakamoto, S. <i>Bitcoin: A Peer-to-Peer Electronic Cash System.</i> 2008. "
        "(Referenced only for the hash-chaining idea.)",
    ]
    for i, item in enumerate(items, 1):
        story.append(Paragraph(f"[{i}]&nbsp;&nbsp;{item}", S["ref"]))
    story.append(spacer(8))
    story.append(callout(S, "Note on sources", "Statutory references were consulted for "
                        "conceptual accuracy. The minimum-wage figures used in the "
                        "application are prototype reference values and must not be cited as "
                        "official rates.", "note"))
    return story


def appendix_a():
    story = [PageBreak(), spacer(10)]
    story.append(P("APPENDIX A", "kicker"))
    story.append(Heading("Route Reference", S["h1"], level=0, label="Appendix A \u00b7 Route Reference"))
    story.append(rule())
    story.append(spacer(2))
    story.append(P("Every addressable screen in the application, with the aliases the router "
                   "accepts and the access rule that applies.", "lead"))
    story.append(T(
        ["Route", "Aliases", "Access", "Renders"],
        [
            ["#/home", "—", "Public", "Landing page, pass sample, FAQ"],
            ["#/how-it-works", "how", "Public", "Six-step custody timeline"],
            ["#/about", "about-project, bal-vigyan", "Public", "Project background"],
            ["#/privacy", "privacy-policy, data-use", "Public", "Data commitments"],
            ["#/help", "contact, support", "Public", "Form, helpline, quick answers"],
            ["#/verify", "verify-pass, pass", "Public", "Token lookup and integrity report"],
            ["#/create-account", "register, signup", "Public", "Two-panel registration"],
            ["#/sign-in", "login", "Public", "Credential entry"],
            ["#/forgot-password", "recover-password", "Public", "Recovery request"],
            ["#/worker", "worker-portal", "Worker session", "Seven-tab portal"],
            ["#/contractor", "contractor-portal", "Contractor session", "Nine-tab dashboard"],
            ["#/judge-demo", "demo", "Public (explicit)", "Isolated exhibition suite"],
            ["not-found", "any unknown", "Public", "Real 404 with recovery routes"],
        ],
        W(40, 46, 28, 54),
        mono_cols=(0, 1),
    ))
    story.append(H2("Deep-link grammar"))
    story.append(P(
        "Pass links take the form <font face='Mono' size=8>#/verify?refToken=&lt;token&gt;</font>, "
        "where the token may be a worker identifier, an e-Shram number, a BOCW registration "
        "number or an opaque QR reference. The contractor scanner accepts the current shape "
        "and the legacy <font face='Mono' size=8>#verify-&lt;token&gt;</font> shape, because a "
        "printed card cannot be recalled.", "body"))
    return story


def appendix_b():
    story = [PageBreak(), spacer(10)]
    story.append(P("APPENDIX B", "kicker"))
    story.append(Heading("Test Index", S["h1"], level=0, label="Appendix B \u00b7 Test Index"))
    story.append(rule())
    story.append(spacer(2))
    story.append(P("The thirty-one steps of the flow harness and the twelve checks of the "
                   "offline harness, as executed for this report.", "lead"))
    flow_steps = [
        "App mounts on home", "Route #/how-it-works", "Route #/about", "Route #/privacy",
        "Route #/help", "Route #/sign-in", "Route #/create-account",
        "Route #/forgot-password", "Route #/verify", "Accessibility audit · home",
        "Language toggle switches public site to Hindi",
        "Language toggle returns to English", "Unknown route renders a 404 page",
        "Home still reachable after 404", "Verify route reports unknown reference",
        "Accessibility audit · create account", "Worker sign-up lands in portal",
        "Accessibility audit · worker portal", "New account starts clean",
        "Portal shows approval tab", "Worker wages tab renders",
        "Worker profile tab renders", "Sign out returns to public site",
        "Judge demo launches", "Judge demo has worker pass tab",
        "Accessibility audit · judge demo", "Judge demo welfare tab is reachable",
        "Audit modal opens", "Demo contractor view renders",
        "Contractor scanner tab renders", "Contractor audit tab renders",
    ]
    half = 16
    left = [P(f"{i}.  {flow_steps[i-1]}", "table_cell") for i in range(1, half)]
    right = [P(f"{i}.  {flow_steps[i-1]}", "table_cell") for i in range(half, len(flow_steps) + 1)]
    while len(right) < len(left):
        right.append(P("", "table_cell"))
    cols = Table([[left, right]], colWidths=[FRAME_W / 2 - 6, FRAME_W / 2 - 6])
    cols.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("LEFTPADDING", (1, 0), (1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(cols)
    story.append(spacer(6))
    story.append(H2("Offline harness"))
    off = [
        "Single file exists (1.90 MB)", "No external script tags",
        "No external stylesheet links", "No Google Fonts requests",
        "Photographs embedded", "Typefaces embedded", "App mounted",
        "Home screen rendered", "Photographs render from embedded data",
        "No uncaught runtime errors", "Hash routing works offline",
        "No remote subresources referenced by the DOM",
    ]
    off_left = [P(f"{i}.  {off[i-1]}", "table_cell") for i in range(1, 7)]
    off_right = [P(f"{i}.  {off[i-1]}", "table_cell") for i in range(7, 13)]
    cols2 = Table([[off_left, off_right]], colWidths=[FRAME_W / 2 - 6, FRAME_W / 2 - 6])
    cols2.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("LEFTPADDING", (1, 0), (1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(cols2)
    story.append(spacer(6))
    story.append(H2("Rendered screens"))
    story.append(P("Home · HowItWorks · CreateAccount · SignIn · PasswordRecovery · Privacy · "
                   "HelpContact · About · App shell (home route). Nine of nine rendered with "
                   "the expected content and no runtime error.", "body"))
    return story


def appendix_c():
    story = [PageBreak(), spacer(10)]
    story.append(P("APPENDIX C", "kicker"))
    story.append(Heading("Glossary", S["h1"], level=0, label="Appendix C \u00b7 Glossary"))
    story.append(rule())
    story.append(spacer(2))
    terms = [
        ("Muster roll", "The daily register of who attended work on a site, and for how long."),
        ("e-Shram UAN", "Universal Account Number issued by the e-Shram registry for unorganised workers."),
        ("BOCW", "Building and Other Construction Workers Act, 1976 — the statute governing construction labour."),
        ("Paise", "One hundredth of a rupee; the integer unit in which all money is computed."),
        ("Gross wages", "Total earned from approved shifts before allowances and deductions."),
        ("Net due", "Gross wages plus allowances minus itemised deductions."),
        ("Outstanding balance", "Net due minus payments recorded; what is still owed."),
        ("Overpayment", "The amount by which recorded payments exceed net due; never shown as a negative wage."),
        ("Advance (kharcha)", "Money paid against future wages; reduces the balance."),
        ("Hash", "A fixed-length fingerprint of data; the same input always produces the same output."),
        ("SHA-256", "The standard secure hash used for every digest in the audit chain."),
        ("Genesis hash", "The all-zero root value that the first audit event links to."),
        ("Chain linkage", "The rule that each event's digest includes the previous event's digest."),
        ("Canonical serialisation", "Deterministic ordering of an object's keys so that identical content hashes identically."),
        ("Anomaly rule", "A deterministic check that raises a question about a record; it makes no accusation."),
        ("Opaque reference token", "A meaningless identifier in a QR code that maps to a record only inside the system."),
        ("Skill category", "Unskilled, semi-skilled, skilled or highly skilled; determines the statutory wage floor."),
        ("Half day", "A shift paid at fifty percent of the daily base rate."),
        ("Pro-rata overtime", "Overtime paid as base divided by eight, multiplied by extra hours."),
        ("Secure context", "A browser state (HTTPS or localhost) required for camera and clipboard access."),
        ("Reduced motion", "An operating-system preference that the interface honours by disabling animation."),
    ]
    rows = [[f"<b>{t}</b>", d] for t, d in terms]
    rows.append(["<b>localStorage</b>",
                 "Browser storage used for records in this prototype, limited to one device."])
    rows.append(["<b>Graceful degradation</b>",
                 "Falling back to a usable alternative when a browser capability (camera, "
                 "clipboard, storage, speech) is unavailable, rather than failing silently."])
    story.append(T_tight(["Term", "Meaning"], rows, W(42, 126)))
    return story


def appendix_d():
    story = [PageBreak(), spacer(10)]
    story.append(P("APPENDIX D", "kicker"))
    story.append(Heading("Selected Source Excerpts", S["h1"], level=0, label="Appendix D \u00b7 Selected Source Excerpts"))
    story.append(rule())
    story.append(spacer(2))
    story.append(P("Three short excerpts, reproduced from the working code, that carry the "
                   "most weight in this report.", "lead"))

    story.append(H2("D.1  Integer paise conversion"))
    story.append(P("<font face='Mono' size=7.6>src/services/wageEngine.ts</font>", "caption"))
    code = ("export function inrToPaise(inr: number): number {<br/>"
            "&nbsp;&nbsp;return Math.round(inr * 100);<br/>"
            "}<br/><br/>"
            "export function paiseToInr(paise: number): number {<br/>"
            "&nbsp;&nbsp;return Math.round(paise) / 100;<br/>"
            "}")
    box = Table([[Paragraph(code, ParagraphStyle("code", fontName="Mono", fontSize=7.4,
                                                  leading=11.6, textColor=INK))]],
                colWidths=[FRAME_W])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SAND_100),
        ("BOX", (0, 0), (-1, -1), 0.5, SAND_200),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(box)
    story.append(Spacer(1, 8))

    story.append(H2("D.2  Canonical serialisation"))
    story.append(P("<font face='Mono' size=7.6>src/services/cryptoAudit.ts</font>", "caption"))
    code2 = ("const sortedKeys = Object.keys(data).sort();<br/>"
             "for (const key of sortedKeys) {<br/>"
             "&nbsp;&nbsp;const val = data[key];<br/>"
             "&nbsp;&nbsp;if (val !== undefined) {<br/>"
             "&nbsp;&nbsp;&nbsp;&nbsp;entries.push(`${JSON.stringify(key)}:${canonicalSerialize(val)}`);<br/>"
             "&nbsp;&nbsp;}<br/>"
             "}<br/>"
             "return '{' + entries.join(',') + '}';")
    box2 = Table([[Paragraph(code2, ParagraphStyle("code2", fontName="Mono", fontSize=7.4,
                                                   leading=11.6, textColor=INK))]],
                 colWidths=[FRAME_W])
    box2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SAND_100),
        ("BOX", (0, 0), (-1, -1), 0.5, SAND_200),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(box2)
    story.append(Spacer(1, 8))

    story.append(H2("D.3  The balance rule"))
    story.append(P("<font face='Mono' size=7.6>src/services/wageEngine.ts</font>", "caption"))
    code3 = ("if (paymentsRecordedPaise &gt; netWagesDuePaise) {<br/>"
             "&nbsp;&nbsp;overpaymentPaise = paymentsRecordedPaise - netWagesDuePaise;<br/>"
             "&nbsp;&nbsp;outstandingBalancePaise = 0;<br/>"
             "} else {<br/>"
             "&nbsp;&nbsp;outstandingBalancePaise = netWagesDuePaise - paymentsRecordedPaise;<br/>"
             "}")
    box3 = Table([[Paragraph(code3, ParagraphStyle("code3", fontName="Mono", fontSize=7.4,
                                                   leading=11.6, textColor=INK))]],
                 colWidths=[FRAME_W])
    box3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SAND_100),
        ("BOX", (0, 0), (-1, -1), 0.5, SAND_200),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(box3)
    story.append(spacer(6))
    story.append(P("These three fragments are the reason the rest of the system can be "
                   "trusted with a number that a family depends on: conversion happens once, "
                   "identical content hashes identically, and an overpayment can never be "
                   "silently reported as a negative wage.", "body"))
    story.append(rule(width="30%", color=BRASS, space_before=6, space_after=5))
    story.append(P("END OF REPORT", "kicker"))
    story.append(Paragraph(
        f"<font size=8.6 color='#6b7a72'>{SCHOOL} \u00b7 Indore, Madhya Pradesh \u00b7 "
        f"{SESSION}</font>",
        ParagraphStyle("End", fontName="Sans", fontSize=8.6, leading=12,
                       textColor=INK_400)))
    return story


# ==========================================================================
def flatten(items):
    """Helpers return lists so they can be spliced; normalise before building."""
    for item in items:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)
        else:
            yield item


# ==========================================================================
def build_story():
    story = []
    story += cover()
    story += declaration()
    story += certificate()
    story += acknowledgement()
    story += contents()
    story += abstract()
    for chapter in (ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11,
                    ch12, ch13, ch14, ch15, ch16, ch17, ch18,
                    references, appendix_a, appendix_b, appendix_c, appendix_d):
        story += chapter()

    return list(flatten(story))


def build():
    # Pass one: lay the report out to a scratch file. The contents list is not
    # populated on the first internal pass, so page numbers shift; we therefore
    # read the settled file and ask it where each chapter actually begins.
    scratch = os.path.join(HERE, "_measure.pdf")
    first = ReportDoc(scratch)
    first.multiBuild(build_story())

    # multiBuild repeats passes until the contents list stops changing, and the
    # map is rewritten on every pass, so what remains is the settled answer.
    chapter_map = dict(first.chapter_map)

    # Pass two: identical layout, but the running header now knows its chapter.
    doc = ReportDoc(OUT)
    doc.chapter_map = chapter_map
    doc.multiBuild(build_story())
    try:
        os.remove(scratch)
    except OSError:
        pass
    print(f"  chapter map: {len(chapter_map)} chapter starts located")

    try:
        from pypdf import PdfReader
        reader = PdfReader(OUT)
        pages = len(reader.pages)
    except Exception:
        pages = "?"
    size = os.path.getsize(OUT) / (1024 * 1024)
    print(f"  wrote {OUT}")
    print(f"  {pages} pages · {size:.2f} MB")


if __name__ == "__main__":
    build()
