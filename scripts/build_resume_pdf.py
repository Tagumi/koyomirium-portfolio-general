from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT = OUTPUT_DIR / "履歴書_カイロソフト応募用.pdf"

NAVY = HexColor("#173F63")
TEXT = HexColor("#172A3A")
MUTED = HexColor("#587184")
LINE = HexColor("#B7D4E1")
LABEL = HexColor("#E9F1F7")


def register_fonts():
    pdfmetrics.registerFont(TTFont("JP", r"C:\Windows\Fonts\YuGothR.ttc", subfontIndex=0))
    pdfmetrics.registerFont(TTFont("JP-B", r"C:\Windows\Fonts\YuGothB.ttc", subfontIndex=0))


def section(c, title, x, y, width):
    c.setFillColor(NAVY)
    c.rect(x, y - 18, width, 22, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("JP-B", 10.5)
    c.drawString(x + 8, y - 12, f"■ {title}")
    return y - 18


def wrap(text, font, size, width):
    result, line = [], ""
    for char in text:
        test = line + char
        if line and pdfmetrics.stringWidth(test, font, size) > width:
            result.append(line)
            line = char
        else:
            line = test
    if line:
        result.append(line)
    return result


def matrix_row(c, x, y, width, label_width, label, values, height=20, size=8):
    y -= height
    c.setFillColor(LABEL)
    c.rect(x, y, label_width, height, stroke=0, fill=1)
    c.setFillColor(white)
    c.rect(x + label_width, y, width - label_width, height, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.rect(x, y, width, height, stroke=1, fill=0)
    c.line(x + label_width, y, x + label_width, y + height)
    c.setFillColor(NAVY)
    c.setFont("JP-B", size)
    c.drawString(x + 4, y + height - 13, label)
    c.setFillColor(TEXT)
    c.setFont("JP", size)
    if isinstance(values, str):
        values = [values]
    baseline = y + height - 13
    for value in values:
        c.drawString(x + label_width + 5, baseline, value)
        baseline -= 11
    return y


def name_row(c, x, y, width, label_width):
    height = 30
    y -= height
    c.setFillColor(LABEL)
    c.rect(x, y, label_width, height, stroke=0, fill=1)
    c.setFillColor(white)
    c.rect(x + label_width, y, width - label_width, height, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.rect(x, y, width, height, stroke=1, fill=0)
    c.line(x + label_width, y, x + label_width, y + height)
    c.setFillColor(NAVY)
    c.setFont("JP-B", 8.5)
    c.drawString(x + 4, y + 18, "氏名")
    c.setFillColor(TEXT)
    c.setFont("JP", 7.2)
    c.drawString(x + label_width + 6, y + 19, "さとう こよみ")
    c.setFont("JP-B", 11.5)
    c.drawString(x + label_width + 6, y + 5, "佐藤 暦")
    return y


def build():
    register_fonts()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    width, height = A4
    left = right = 36
    content_w = width - left - right

    c.setFillColor(NAVY)
    c.rect(left, height - 70, content_w, 48, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("JP-B", 18)
    c.drawCentredString(width / 2, height - 52, "履 歴 書")
    y = height - 70

    y = name_row(c, left, y, content_w, 76)

    y = section(c, "学歴", left, y - 5, content_w)
    y = matrix_row(c, left, y, content_w, 76, "最終学歴", "小樽商科大学 商学部 企業法学科 卒業（入学2006年4月／卒業2010年3月）", height=22, size=8)

    y = section(c, "職歴", left, y - 5, content_w)
    careers = [
        ("2010年4月～2017年5月", "日本プロセス株式会社 ／ システムエンジニア", [
            "在来線運行管理システム開発・アプリ受け入れ検証・組み込みシステム開発",
        ]),
        ("2018年2月～2026年5月", "株式会社ビズリーチ ／ カスタマーエンジニア", [
            "LP・ヘルプページ作成、法人向け問い合わせ対応（1日50～100件）",
        ]),
        ("2020年3月～現在", "SaaSスタートアップ企業 ／ QAエンジニア", [
            "システム品質管理・テスト計画・バグトラッキング・Webサイト構築",
        ]),
        ("2018年2月～現在", "フリーランス ／ 約10件の案件を受注", [
            "AIアノテーション業務／EC画像・動画・LP制作／QAエンジニア",
        ]),
    ]
    period_w = 118
    for period, heading, details in careers:
        lines = []
        for detail in details:
            lines.extend(wrap(detail, "JP", 7.4, content_w - period_w - 12))
        block_h = max(36, 22 + len(lines) * 10)
        y -= block_h
        c.setStrokeColor(LINE)
        c.rect(left, y, content_w, block_h, stroke=1, fill=0)
        c.line(left + period_w, y, left + period_w, y + block_h)
        c.setFillColor(MUTED)
        c.setFont("JP", 7.2)
        c.drawString(left + 4, y + block_h - 12, period)
        c.setFillColor(NAVY)
        c.setFont("JP-B", 8.2)
        c.drawString(left + period_w + 5, y + block_h - 12, heading)
        c.setFillColor(TEXT)
        c.setFont("JP", 7.4)
        detail_y = y + block_h - 25
        for line in lines:
            c.drawString(left + period_w + 5, detail_y, line)
            detail_y -= 10

    y = section(c, "資格・免許", left, y - 5, content_w)
    y = matrix_row(c, left, y, content_w, 76, "保有資格", [
        "応用情報技術者 / ETEC / ITIL / 英検2級 / TOEIC 650点",
        "DMM 生成AI CAMP 生成AIエンジニアコース スキル習得認定",
    ], height=32, size=7.6)

    y = section(c, "スキル", left, y - 5, content_w)
    skills = [
        ("開発言語", "HTML / CSS / JavaScript / PHP / Python"),
        ("CMS・FW", "WordPress / Studio"),
        ("デザイン", "Illustrator / Photoshop / Premiere Pro / Figma / Canva"),
        ("開発環境", "Visual Studio Code / Git / GitHub"),
        ("AI・生産性", "Devin / Claude / Notion"),
    ]
    for label, value in skills:
        y = matrix_row(c, left, y, content_w, 76, label, value, height=19, size=7.8)

    y = section(c, "自己PR", left, y - 5, content_w)
    paragraphs = [
        "システムエンジニア・カスタマーエンジニア・Webデザイン全般の業務を経て、15年以上にわたりIT業界に携わってきました。",
        "ガラケーの組み込みシステム開発や、在来線、某夢の国のパレード運行管理システムなど、フルスタックでの開発を経験してきました。",
        "CS・QA・Web制作・デザインまで、技術・品質・顧客対応をワンストップで担えることが強みです。",
    ]
    c.setFillColor(TEXT)
    c.setFont("JP", 7.4)
    text_y = y - 10
    for index, paragraph in enumerate(paragraphs):
        for line in wrap(paragraph, "JP", 7.4, content_w - 8):
            c.drawString(left + 4, text_y, line)
            text_y -= 10
        if index < len(paragraphs) - 1:
            text_y -= 3

    c.save()
    return OUTPUT


if __name__ == "__main__":
    print(build())
