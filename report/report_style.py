"""
Layout kit for the Shram Setu 2.0 school project report.

Everything visual — colours, type scale, page furniture, callouts, tables,
figures and the chapter openers — lives here so the content file stays
readable prose.
"""
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Flowable, Image, KeepTogether, PageBreak,
                                Paragraph, Spacer, Table, TableStyle)
from reportlab.platypus.flowables import HRFlowable
from reportlab.platypus.tableofcontents import TableOfContents

SCHOOL = "Mar Thoma H.S. School"
PROJECT = "Shram Setu 2.0"
SUBTITLE = "A Verified Digital Work and Wage Record for Informal Labour"
SESSION = "Session 2026-27"

# --------------------------------------------------------------------------
# Palette — mirrors the application's own design tokens
# --------------------------------------------------------------------------
FOREST = HexColor("#163a2b")
FOREST_700 = HexColor("#1f5941")
FOREST_500 = HexColor("#358b62")
FOREST_100 = HexColor("#dcefe4")
FOREST_50 = HexColor("#f1f7f3")
BRASS = HexColor("#d9a844")
BRASS_DARK = HexColor("#a8761d")
BRASS_100 = HexColor("#f7e9c4")
SAND = HexColor("#fdfbf6")
SAND_100 = HexColor("#f8f4ea")
SAND_200 = HexColor("#e8dfc9")
INK = HexColor("#12211b")
INK_600 = HexColor("#3d4f47")
INK_400 = HexColor("#6b7a72")
RED = HexColor("#a33224")
RED_100 = HexColor("#fbe6e2")

PAGE_W, PAGE_H = A4
MARGIN_L = 22 * mm
MARGIN_R = 20 * mm
MARGIN_T = 24 * mm
MARGIN_B = 22 * mm
FRAME_W = PAGE_W - MARGIN_L - MARGIN_R

CHAPTER_TITLES = []   # filled by the content builder, used by running headers
_RUNNING = {"chapter": ""}


def register_fonts():
    base = "/usr/share/fonts/truetype/dejavu/"
    for name, file in [
        ("Body", "DejaVuSerif.ttf"),
        ("Body-Bold", "DejaVuSerif-Bold.ttf"),
        ("Sans", "DejaVuSans.ttf"),
        ("Sans-Bold", "DejaVuSans-Bold.ttf"),
        ("Mono", "DejaVuSansMono.ttf"),
        ("Mono-Bold", "DejaVuSansMono-Bold.ttf"),
    ]:
        pdfmetrics.registerFont(TTFont(name, base + file))
    pdfmetrics.registerFontFamily(
        "Body", normal="Body", bold="Body-Bold", italic="Body", boldItalic="Body-Bold"
    )
    pdfmetrics.registerFontFamily(
        "Sans", normal="Sans", bold="Sans-Bold", italic="Sans", boldItalic="Sans-Bold"
    )


# --------------------------------------------------------------------------
# Paragraph styles
# --------------------------------------------------------------------------
def build_styles():
    s = {}
    s["body"] = ParagraphStyle(
        "Body", fontName="Body", fontSize=10.4, leading=16.2, textColor=INK,
        alignment=TA_JUSTIFY, spaceAfter=6.5,
    )
    s["body_first"] = ParagraphStyle("BodyFirst", parent=s["body"], firstLineIndent=0)
    s["lead"] = ParagraphStyle(
        "Lead", parent=s["body"], fontSize=11.6, leading=18, textColor=INK_600,
        spaceAfter=10,
    )
    s["bullet"] = ParagraphStyle(
        "Bullet", parent=s["body"], leftIndent=12, bulletIndent=2,
        spaceAfter=4.5, alignment=TA_LEFT,
    )
    s["numbered"] = ParagraphStyle(
        "Numbered", parent=s["bullet"], leftIndent=16, bulletIndent=2,
    )
    s["h1"] = ParagraphStyle(
        "ChapterTitle", fontName="Body-Bold", fontSize=23, leading=28,
        textColor=FOREST, spaceAfter=6,
    )
    s["h2"] = ParagraphStyle(
        "H2", fontName="Body-Bold", fontSize=12.6, leading=17.5,
        textColor=FOREST_700, spaceBefore=11, spaceAfter=5,
    )
    s["h3"] = ParagraphStyle(
        "H3", fontName="Sans-Bold", fontSize=10.2, leading=14,
        textColor=BRASS_DARK, spaceBefore=8, spaceAfter=3,
    )
    s["kicker"] = ParagraphStyle(
        "Kicker", fontName="Sans-Bold", fontSize=8.6, leading=11,
        textColor=BRASS_DARK, spaceAfter=3,
    )
    s["caption"] = ParagraphStyle(
        "Caption", fontName="Sans", fontSize=8.4, leading=11.6,
        textColor=INK_400, alignment=TA_CENTER, spaceBefore=4, spaceAfter=10,
    )
    s["table_head"] = ParagraphStyle(
        "TableHead", fontName="Sans-Bold", fontSize=8.4, leading=11,
        textColor=HexColor("#ffffff"),
    )
    s["table_cell"] = ParagraphStyle(
        "TableCell", fontName="Sans", fontSize=8.4, leading=11.6, textColor=INK,
    )
    s["table_cell_m"] = ParagraphStyle(
        "TableCellM", parent=s["table_cell"], fontName="Mono", fontSize=7.6, leading=10.6,
    )
    s["mono"] = ParagraphStyle(
        "Mono", fontName="Mono", fontSize=7.8, leading=11.2, textColor=INK,
    )
    s["callout"] = ParagraphStyle(
        "Callout", parent=s["body"], fontSize=9.6, leading=14.4, spaceAfter=0,
    )
    s["callout_title"] = ParagraphStyle(
        "CalloutTitle", fontName="Sans-Bold", fontSize=8.4, leading=11,
        textColor=FOREST_700, spaceAfter=2.5,
    )
    s["toc0"] = ParagraphStyle(
        "TOC0", fontName="Sans-Bold", fontSize=9.0, leading=14.2, textColor=FOREST,
        leftIndent=0, firstLineIndent=0, spaceBefore=2.0,
    )
    s["toc1"] = ParagraphStyle(
        "TOC1", fontName="Sans", fontSize=8.2, leading=11.1, textColor=INK_600,
        leftIndent=14, firstLineIndent=0,
    )
    s["cover_title"] = ParagraphStyle(
        "CoverTitle", fontName="Body-Bold", fontSize=34, leading=38,
        textColor=HexColor("#ffffff"), alignment=TA_LEFT,
    )
    s["cover_sub"] = ParagraphStyle(
        "CoverSub", fontName="Sans", fontSize=12.5, leading=18,
        textColor=HexColor("#cfe3d6"), alignment=TA_LEFT,
    )
    s["cover_school"] = ParagraphStyle(
        "CoverSchool", fontName="Sans-Bold", fontSize=13, leading=17,
        textColor=BRASS, alignment=TA_LEFT,
    )
    s["sig"] = ParagraphStyle(
        "Sig", fontName="Sans", fontSize=9, leading=15, textColor=INK_600,
    )
    s["ref"] = ParagraphStyle(
        "Ref", parent=s["body"], fontSize=9, leading=13.4, leftIndent=16,
        firstLineIndent=-16, spaceAfter=6, alignment=TA_LEFT,
    )
    return s


# --------------------------------------------------------------------------
# Small flowable helpers
# --------------------------------------------------------------------------
def rule(width="100%", thickness=1.1, color=BRASS, space_before=2, space_after=8):
    return HRFlowable(
        width=width, thickness=thickness, color=color,
        spaceBefore=space_before, spaceAfter=space_after, lineCap="round",
    )


def callout(styles, title, text, tone="note"):
    """A tinted panel used for definitions, warnings and honest disclosures."""
    tints = {
        "note": (FOREST_50, FOREST_500),
        "warn": (RED_100, RED),
        "key": (BRASS_100, BRASS_DARK),
    }
    bg, edge = tints.get(tone, tints["note"])
    inner = []
    if title:
        inner.append(Paragraph(title.upper(), styles["callout_title"]))
    inner.append(Paragraph(text, styles["callout"]))
    table = Table([[inner]], colWidths=[FRAME_W])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, edge),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return [Spacer(1, 3), table, Spacer(1, 10)]


def recap(styles, number, points):
    """Closing panel for each chapter: three or four things worth remembering."""
    body = "".join(
        f"<font color='#a8761d'>\u25aa</font>&nbsp;&nbsp;{point}<br/>" for point in points
    )
    title = Paragraph(
        f"CHAPTER {number:02d} \u00b7 IN ONE BREATH",
        ParagraphStyle("RecapTitle", fontName="Sans-Bold", fontSize=7.8, leading=10,
                       textColor=BRASS_DARK, spaceAfter=4))
    text = Paragraph(body.rstrip("<br/>"), ParagraphStyle(
        "RecapBody", fontName="Sans", fontSize=8.6, leading=13.4, textColor=INK))
    table = Table([[title], [text]], colWidths=[FRAME_W])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRASS_100),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, BRASS),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (0, 0), 9),
        ("BOTTOMPADDING", (0, 0), (0, 0), 0),
        ("TOPPADDING", (0, 1), (0, 1), 0),
        ("BOTTOMPADDING", (0, 1), (0, 1), 9),
    ]))
    # Never split the panel across a page break.
    return [KeepTogether([Spacer(1, 10), table])]


def data_table(styles, header, rows, widths, mono_cols=(), align_right=(), font_size=8.4, pad=5.5):
    """A calm two-tone table: forest header, sand zebra striping, hairline grid."""
    head = [Paragraph(h, styles["table_head"]) for h in header]
    body = []
    for row in rows:
        cells = []
        for idx, cell in enumerate(row):
            style = styles["table_cell_m"] if idx in mono_cols else styles["table_cell"]
            if idx in align_right:
                style = ParagraphStyle(f"{style.name}-r", parent=style, alignment=TA_RIGHT)
            cells.append(Paragraph(str(cell), style))
        body.append(cells)

    table = Table([head] + body, colWidths=widths, repeatRows=1, hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), FOREST),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("LEFTPADDING", (0, 0), (-1, -1), 6.5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6.5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, SAND_200),
        ("BOX", (0, 0), (-1, -1), 0.5, SAND_200),
    ]
    for r in range(1, len(body) + 1):
        if r % 2 == 0:
            style.append(("BACKGROUND", (0, r), (-1, r), SAND_100))
    table.setStyle(TableStyle(style))
    return [Spacer(1, 2), table, Spacer(1, 10)]


def figure(path, width_mm=FRAME_W / mm, caption="", styles=None, border=True):
    from PIL import Image as PILImage
    w, h = PILImage.open(path).size
    width = width_mm * mm
    height = width * h / w
    img = Image(path, width=width, height=height)
    out = [Spacer(1, 4)]
    if border:
        holder = Table([[img]], colWidths=[width + 6])
        holder.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.6, SAND_200),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        out.append(holder)
    else:
        out.append(img)
    if caption and styles:
        out.append(Paragraph(caption, styles["caption"]))
    return out


class Heading(Paragraph):
    """A heading that can be listed in the contents under a different label."""

    def __init__(self, text, style, level=0, label=None):
        Paragraph.__init__(self, text, style)
        self.toc_level = level
        self.toc_label = label or text


class ChapterRule(Flowable):
    """The brass rule that sits under every chapter number."""

    def __init__(self, width=FRAME_W, colour=BRASS):
        Flowable.__init__(self)
        self.width = width
        self.colour = colour
        self.height = 8

    def draw(self):
        canvas = self.canv
        canvas.setStrokeColor(self.colour)
        canvas.setLineWidth(1.4)
        canvas.setLineCap(1)
        canvas.line(0, 5, self.width * 0.24, 5)


def chapter_opener(styles, number, title, kicker, blurb, first=False):
    """Chapter number, title, brass rule and a one-paragraph orienting blurb."""
    block = [
        Paragraph(f"CHAPTER {number:02d}", styles["kicker"]),
        Heading(title, styles["h1"], level=0, label=f"{number:02d} \u00b7 {title}"),
        ChapterRule(),
        Spacer(1, 4),
        Paragraph(blurb, styles["lead"]),
    ]
    return ([PageBreak()] if not first else []) + block


# --------------------------------------------------------------------------
# Document template: running header, footer, table of contents
# --------------------------------------------------------------------------
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate


class ReportDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        self.chapter_map = {}
        BaseDocTemplate.__init__(
            self, filename, pagesize=A4,
            leftMargin=MARGIN_L, rightMargin=MARGIN_R,
            topMargin=MARGIN_T, bottomMargin=MARGIN_B,
            title=f"{PROJECT} — Project Report · {SCHOOL}",
            author=SCHOOL,
            subject=SUBTITLE,
            creator="Shram Setu 2.0 report builder",
            **kw,
        )
        frame = Frame(
            MARGIN_L, MARGIN_B, FRAME_W, PAGE_H - MARGIN_T - MARGIN_B,
            id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        )
        self.addPageTemplates([
            PageTemplate(id="body", frames=[frame], onPage=self._cover, onPageEnd=self._furniture)
        ])

    # -- cover artwork ------------------------------------------------------
    def _cover(self, canvas, doc):
        if doc.page != 1:
            return
        # Start of a fresh pass: forget the previous pass's page numbering.
        self.chapter_map.clear()
        canvas.saveState()
        canvas.setFillColor(FOREST)
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        # brass band along the top edge
        canvas.setFillColor(BRASS)
        canvas.rect(0, PAGE_H - 9 * mm, PAGE_W, 9 * mm, stroke=0, fill=1)
        # faint concentric watermark, bottom right
        for i in range(26):
            canvas.setFillColor(Color(1, 1, 1, alpha=0.028))
            canvas.circle(PAGE_W - 26 * mm, 48 * mm, (8 + i * 3.2) * mm, stroke=0, fill=1)
        # footer band
        canvas.setFillColor(HexColor("#0f2b20"))
        canvas.rect(0, 0, PAGE_W, 26 * mm, stroke=0, fill=1)
        canvas.setStrokeColor(BRASS)
        canvas.setLineWidth(0.9)
        canvas.line(MARGIN_L, 26 * mm, PAGE_W - MARGIN_R, 26 * mm)
        canvas.setFillColor(BRASS)
        canvas.setFont("Sans-Bold", 8.2)
        canvas.drawString(MARGIN_L, 12.5 * mm, SCHOOL.upper())
        canvas.setFillColor(HexColor("#9dbfae"))
        canvas.setFont("Sans", 8.2)
        canvas.drawRightString(PAGE_W - MARGIN_R, 12.5 * mm,
                               f"Indore, Madhya Pradesh  \u00b7  {SESSION}")
        canvas.restoreState()

    # -- running header / footer -------------------------------------------
    def _furniture(self, canvas, doc):
        if doc.page == 1:
            return
        canvas.saveState()
        # header
        canvas.setFillColor(INK_400)
        canvas.setFont("Sans", 7.4)
        canvas.drawString(MARGIN_L, PAGE_H - 15 * mm, SCHOOL.upper())
        right = ""
        for start in sorted(self.chapter_map):
            if start <= doc.page:
                right = self.chapter_map[start]
        canvas.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 15 * mm, right.upper())
        canvas.setStrokeColor(SAND_200)
        canvas.setLineWidth(0.7)
        canvas.line(MARGIN_L, PAGE_H - 17.6 * mm, PAGE_W - MARGIN_R, PAGE_H - 17.6 * mm)
        # footer
        canvas.line(MARGIN_L, 15.5 * mm, PAGE_W - MARGIN_R, 15.5 * mm)
        canvas.setFont("Sans", 7.4)
        canvas.setFillColor(INK_400)
        canvas.drawString(MARGIN_L, 11.2 * mm, f"{PROJECT} · {SUBTITLE}")
        canvas.setFillColor(FOREST)
        canvas.setFont("Sans-Bold", 8.4)
        canvas.drawRightString(PAGE_W - MARGIN_R, 11.2 * mm, str(doc.page))
        canvas.restoreState()

    # -- collect TOC entries + running-header map ---------------------------
    # Set on the instance by the builder; entries are start page -> header label.

    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        name = flowable.style.name
        text = flowable.getPlainText()
        label = getattr(flowable, "toc_label", text)
        level = getattr(flowable, "toc_level", None)
        if name == "ChapterTitle":
            self.notify("TOCEntry", (0, label, self.page))
            self.chapter_map[self.page] = label
        elif isinstance(flowable, Heading):
            self.notify("TOCEntry", (level if level is not None else 1, label, self.page))
            if level == 0:
                self.chapter_map[self.page] = label
        elif name == "H2":
            self.notify("TOCEntry", (1, text, self.page))


def build_toc(styles):
    toc = TableOfContents()
    toc.levelStyles = [styles["toc0"], styles["toc1"]]
    toc.dotsMinLevel = 0
    toc.tableStyle = TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ])
    return toc
