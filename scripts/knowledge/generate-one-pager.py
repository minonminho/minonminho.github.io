#!/usr/bin/env python3
"""Generate the sample A4 Knowledge One-Pager in PDF and DOCX formats."""

import json
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "content/knowledge/alpha-compositing.json"
OUTPUT = ROOT / "public/knowledge"
DOCX_PATH = OUTPUT / "alpha-compositing-one-pager.docx"
PDF_PATH = OUTPUT / "alpha-compositing-one-pager.pdf"
FONT = "NotoSansKR"
FONT_PATH = Path(__file__).resolve().parent / "assets/NotoSansKR-Hangul.ttf"
INK = "#111820"
MUTED = "#48545E"
ICE = "#9EBBCB"
MINT = "#AFCABB"


def build_pdf(one_pager):
    pdfmetrics.registerFont(TTFont(FONT, str(FONT_PATH), subfontIndex=0))
    styles = {
        "eyebrow": ParagraphStyle("eyebrow", fontName=FONT, fontSize=7.2, leading=9, textColor=colors.HexColor("#637783"), spaceAfter=5, wordWrap="CJK"),
        "title": ParagraphStyle("title", fontName=FONT, fontSize=18, leading=22, textColor=colors.HexColor(INK), spaceAfter=3, wordWrap="CJK"),
        "subtitle": ParagraphStyle("subtitle", fontName=FONT, fontSize=9, leading=12, textColor=colors.HexColor(MUTED), spaceAfter=9, wordWrap="CJK"),
        "definition": ParagraphStyle("definition", fontName=FONT, fontSize=9.5, leading=14.2, textColor=colors.HexColor(INK), spaceAfter=8, wordWrap="CJK"),
        "heading": ParagraphStyle("heading", fontName=FONT, fontSize=9.1, leading=11.5, textColor=colors.HexColor(INK), spaceBefore=2, spaceAfter=2, wordWrap="CJK"),
        "body": ParagraphStyle("body", fontName=FONT, fontSize=8.2, leading=12, textColor=colors.HexColor(MUTED), spaceAfter=5, wordWrap="CJK", alignment=TA_LEFT),
        "source": ParagraphStyle("source", fontName=FONT, fontSize=6.4, leading=8, textColor=colors.HexColor(MUTED), spaceAfter=1, wordWrap="CJK"),
    }

    story = [
        Paragraph("RESEARCH KNOWLEDGE / CONCEPT ONE-PAGER", styles["eyebrow"]),
        Paragraph(one_pager["title"], styles["title"]),
        Paragraph(one_pager["subtitle"], styles["subtitle"]),
        Paragraph(f"<b>01. 한 줄 정의</b>  {one_pager['oneLine']}", styles["definition"]),
    ]

    for index, section in enumerate(one_pager["sections"], start=2):
        story.append(KeepTogether([
            Paragraph(f"{index:02d}. {section['heading']}", styles["heading"]),
            Paragraph(section["body"], styles["body"]),
        ]))
        if index == 3:
            diagram = Table(
                [["전경 레이어  ·  α 0.55", "+", "불투명한 배경", "→", "합성 화면"]],
                colWidths=[110, 22, 105, 24, 100],
                rowHeights=[27],
            )
            diagram.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#F0E0E3")),
                ("BACKGROUND", (2, 0), (2, 0), colors.HexColor("#DCE6EC")),
                ("BACKGROUND", (4, 0), (4, 0), colors.HexColor("#D9E6DF")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor(INK)),
                ("FONTNAME", (0, 0), (-1, -1), FONT),
                ("FONTSIZE", (0, 0), (-1, -1), 7.0),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#C7D0D6")),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D2D9DE")),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.extend([Spacer(1, 3), diagram, Spacer(1, 5), Paragraph("불투명 배경: 결과색 = Alpha × 앞색 + (1 − Alpha) × 배경색", styles["source"]), Spacer(1, 4)])

    story.append(Spacer(1, 1))
    story.append(Paragraph("SOURCES", styles["eyebrow"]))
    for source in one_pager["sources"]:
        story.append(Paragraph(source.replace("&", "&amp;"), styles["source"]))

    document = SimpleDocTemplate(
        str(PDF_PATH), pagesize=A4,
        leftMargin=34, rightMargin=34, topMargin=30, bottomMargin=28,
        title=one_pager["title"], author="Minho Lee",
    )
    document.build(story)


def set_cell_shading(cell, fill):
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill.lstrip("#"))
    cell._tc.get_or_add_tcPr().append(shading)


def set_table_borders(table, color="D2D9DE"):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "4")
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)
        borders.append(element)
    tbl_pr.append(borders)


def set_run_font(run, size, bold=False, color=INK):
    run.font.name = "Noto Sans KR"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color.lstrip("#"))
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Noto Sans KR")


def add_text(doc, text, size=8.3, bold=False, color=MUTED, before=0, after=3, line=1.05):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = line
    run = paragraph.add_run(text)
    set_run_font(run, size, bold, color)
    return paragraph


def build_docx(one_pager):
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.05)
    section.bottom_margin = Cm(1.05)
    section.left_margin = Cm(1.25)
    section.right_margin = Cm(1.25)

    normal = doc.styles["Normal"]
    normal.font.name = "Noto Sans KR"
    normal.font.size = Pt(8.3)
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Noto Sans KR")
    normal.paragraph_format.space_after = Pt(3)

    add_text(doc, "RESEARCH KNOWLEDGE / CONCEPT ONE-PAGER", 7.2, True, "#637783", after=4)
    add_text(doc, one_pager["title"], 17, False, INK, after=1, line=1.0)
    add_text(doc, one_pager["subtitle"], 9.2, False, MUTED, after=8, line=1.05)
    add_text(doc, "01. 한 줄 정의", 9.2, True, INK, after=1)
    add_text(doc, one_pager["oneLine"], 8.5, False, MUTED, after=4)

    for index, item in enumerate(one_pager["sections"], start=2):
        add_text(doc, f"{index:02d}. {item['heading']}", 8.8, True, INK, before=2, after=1)
        add_text(doc, item["body"], 8.1, False, MUTED, after=3, line=1.02)
        if index == 3:
            table = doc.add_table(rows=1, cols=5)
            table.autofit = False
            widths = [Cm(5.6), Cm(0.65), Cm(4.7), Cm(0.65), Cm(5.0)]
            labels = ["전경 레이어\nAlpha 55%", "+", "불투명한 배경\nAlpha 100%", "→", "합성된 화면"]
            fills = ["F0E0E3", "FFFFFF", "DCE6EC", "FFFFFF", "D9E6DF"]
            for cell, width, label, fill in zip(table.rows[0].cells, widths, labels, fills):
                cell.width = width
                cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
                set_cell_shading(cell, fill)
                paragraph = cell.paragraphs[0]
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                paragraph.paragraph_format.space_after = Pt(0)
                paragraph.paragraph_format.line_spacing = 1.0
                run = paragraph.add_run(label)
                set_run_font(run, 7.3, label in ["+", "→"], INK)
            set_table_borders(table)
            add_text(doc, "불투명 배경: 결과색 = Alpha × 앞색 + (1 − Alpha) × 배경색", 7.5, False, MUTED, before=3, after=4)

    add_text(doc, "SOURCES", 7.2, True, "#637783", before=2, after=1)
    for source in one_pager["sources"]:
        add_text(doc, source, 6.4, False, MUTED, after=1, line=1.0)

    doc.core_properties.title = one_pager["title"]
    doc.core_properties.subject = "A4 Concept One-Pager"
    doc.core_properties.author = "Minho Lee"
    doc.save(DOCX_PATH)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    concept = json.loads(SOURCE.read_text(encoding="utf-8"))
    build_pdf(concept["onePager"])
    build_docx(concept["onePager"])
    print(f"Created {PDF_PATH} and {DOCX_PATH}")


if __name__ == "__main__":
    main()
