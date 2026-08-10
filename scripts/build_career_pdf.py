from pathlib import Path
import io

from pypdf import PdfReader, PdfWriter
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\moony\OneDrive\デスクトップ\職務経歴書.pdf")
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT = OUTPUT_DIR / "職務経歴書_カイロソフト応募用_仮QR.pdf"
PORTFOLIO_URL = "https://koyomirium-portfolio.vercel.app"

NAVY = HexColor("#173E63")
DEEP = HexColor("#08243D")
CYAN = HexColor("#35CFE2")
PALE = HexColor("#EAF6FA")
LINE = HexColor("#B7D4E1")
TEXT = HexColor("#172A3A")
MUTED = HexColor("#587184")


def register_fonts():
    pdfmetrics.registerFont(TTFont("JP", r"C:\Windows\Fonts\YuGothR.ttc", subfontIndex=0))
    pdfmetrics.registerFont(TTFont("JP-B", r"C:\Windows\Fonts\YuGothB.ttc", subfontIndex=0))


def fit_image(c, path, x, y, w, h, contain=True):
    img = ImageReader(str(path))
    iw, ih = img.getSize()
    scale = min(w / iw, h / ih) if contain else max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
    c.restoreState()


def draw_section_title(c, title, x, y, width):
    c.setFillColor(NAVY)
    c.rect(x, y - 17, width, 21, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("JP-B", 10.5)
    c.drawString(x + 8, y - 11.5, f"■ {title}")
    # Return the exact lower edge of the heading so the following table/text
    # starts flush without an unintended blank strip.
    return y - 17


def draw_wrapped_paragraphs(c, paragraphs, x, y, width, size=7.2, leading=9.7, paragraph_gap=4.0):
    """Draw Japanese prose using the full available width before wrapping."""
    c.setFillColor(TEXT)
    c.setFont("JP", size)
    for paragraph_index, paragraph in enumerate(paragraphs):
        line = ""
        for char in paragraph:
            candidate = line + char
            if line and pdfmetrics.stringWidth(candidate, "JP", size) > width:
                c.drawString(x, y, line)
                y -= leading
                line = char
            else:
                line = candidate
        if line:
            c.drawString(x, y, line)
            y -= leading
        if paragraph_index < len(paragraphs) - 1:
            y -= paragraph_gap
    return y


def wrap_text(text, font, size, width):
    lines = []
    current = ""
    for char in text:
        candidate = current + char
        if current and pdfmetrics.stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = char
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def draw_qr(c, value, x, y, size):
    widget = qr.QrCodeWidget(value)
    x0, y0, x1, y1 = widget.getBounds()
    scale_x = size / (x1 - x0)
    scale_y = size / (y1 - y0)
    drawing = Drawing(size, size, transform=[scale_x, 0, 0, scale_y, -x0 * scale_x, -y0 * scale_y])
    drawing.add(widget)
    renderPDF.draw(drawing, c, x, y)


def bullet(c, text, x, y, font="JP", size=8.3, color=TEXT):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, f"・{text}")


def draw_lines(c, lines, x, y, size=8.2, leading=12.0, font="JP", color=TEXT):
    c.setFillColor(color)
    c.setFont(font, size)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def build_page_one():
    register_fonts()
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    left, right = 36, 36
    content_w = width - left - right

    c.setFillColor(NAVY)
    c.rect(left, height - 70, content_w, 48, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("JP-B", 18)
    c.drawCentredString(width / 2, height - 52, "職 務 経 歴 書")
    y = height - 78

    y = draw_section_title(c, "自己PR", left, y, content_w)
    y = draw_wrapped_paragraphs(c, [
        "システムエンジニア・カスタマーエンジニア・Webデザイン全般の業務を経て、15年以上にわたりIT業界に携わってきました。",
        "ガラケーの組み込みシステム開発や、在来線、某夢の国のパレード運行管理システムの業務などに携わり、フルスタックでの開発を経験してきました。",
        "国内最大級の総合型エージェント企業でのCS業務および、SaaSスタートアップでのQAエンジニアと、技術・品質・顧客対応と幅広い領域での実務経験がございます。",
        "現在は主にQAエンジニアおよび、WordPressや各デザインツールを用いたWebサイト構築やコンテンツ制作を軸に活動しております。HTML/CSS/JavaScript・PHP・Pythonでの開発から、Photoshop・Figma・Canvaを使ったデザイン制作まで、ワンストップで対応できることが強みです。",
    ], left + 3, y - 9, content_w - 6, size=7.2, leading=9.7, paragraph_gap=4.0)
    y -= 1

    y = draw_section_title(c, "スキル・使用ツール", left, y, content_w)
    skills = [
        ("開発言語", "HTML / CSS / JavaScript / PHP / Python"),
        ("CMS・FW", "WordPress / Studio"),
        ("デザイン", "Illustrator / Photoshop / Premiere Pro / Figma / Canva"),
        ("開発環境", "Visual Studio Code / Git / GitHub"),
        ("AI・生産性", "Devin / Claude / Notion"),
    ]
    row_h, label_w = 18, 76
    for label, value in skills:
        y -= row_h
        c.setFillColor(HexColor("#E9F1F7")); c.rect(left, y, label_w, row_h, stroke=0, fill=1)
        c.setFillColor(white); c.rect(left + label_w, y, content_w - label_w, row_h, stroke=0, fill=1)
        c.setStrokeColor(LINE); c.rect(left, y, content_w, row_h, stroke=1, fill=0); c.line(left + label_w, y, left + label_w, y + row_h)
        c.setFillColor(NAVY); c.setFont("JP-B", 8); c.drawString(left + 4, y + 5.4, label)
        c.setFillColor(TEXT); c.setFont("JP", 8); c.drawString(left + label_w + 5, y + 5.4, value)
    y -= 5

    y = draw_section_title(c, "職務経歴", left, y, content_w)
    careers = [
        ("2010年4月～2017年5月", "日本プロセス株式会社", "システムエンジニア", [
            "在来線の運行管理システム開発（要件定義～テスト）／国内総合電機メーカー各社でのアプリ受け入れ検証",
            "ガラケー向け組み込みシステム・パレード運行管理システム開発／フルスタック開発（設計・実装・テスト）",
        ]),
        ("2018年2月～2026年5月", "株式会社ビズリーチ", "カスタマーエンジニア", [
            "法人向け問い合わせ対応（1日50～100件）／ヘルプページ・FAQ作成・更新",
            "顧客対応フロー改善および社内ナレッジ整備",
        ]),
        ("2020年3月～現在", "SaaSスタートアップ企業", "QAエンジニア", [
            "システムの品質管理・テスト計画策定・実行／バグトラッキング・再現・報告・追跡",
            "ヘルプページ作成（ユーザー向けドキュメント）／Devin・Claude・WordPressを用いたWebサイト構築",
        ]),
        ("2018年2月～現在", "フリーランス（約10件受注）", "フリーランス", [
            "AIアノテーション業務",
            "EC画像・動画・LP制作",
            "QAエンジニア",
        ]),
    ]
    period_w, role_w = 115, 118
    for period, company, role, details in careers:
        detail_lines = []
        detail_width = content_w - period_w - role_w - 14
        for detail in details:
            detail_lines.extend(wrap_text(f"・{detail}", "JP", 7.0, detail_width))
        block_h = max(54, 28 + len(detail_lines) * 10)
        y -= block_h
        c.setStrokeColor(LINE); c.rect(left, y, content_w, block_h, stroke=1, fill=0)
        c.line(left + period_w, y, left + period_w, y + block_h)
        c.line(left + content_w - role_w, y, left + content_w - role_w, y + block_h)
        c.setFillColor(MUTED); c.setFont("JP", 7.2); c.drawString(left + 4, y + block_h - 11, period)
        c.setFillColor(NAVY); c.setFont("JP-B", 8.5); c.drawString(left + period_w + 5, y + block_h - 12, company)
        c.setFillColor(TEXT); c.setFont("JP-B", 8.2); c.drawString(left + content_w - role_w + 5, y + block_h - 12, role)
        c.setFont("JP", 7.0)
        detail_y = y + block_h - 27
        for line in detail_lines:
            c.drawString(left + period_w + 5, detail_y, line)
            detail_y -= 10
    y -= 5

    y = draw_section_title(c, "資格・学歴", left, y, content_w)
    qual_rows = [
        ("学歴", "小樽商科大学 商学部 企業法学科 卒業（入学2006年4月／卒業2010年3月）"),
        ("資格", "応用情報技術者 / ETEC / ITIL / 英検2級 / TOEIC 650点"),
        ("認定", "DMM 生成AI CAMP 生成AIエンジニアコース スキル習得認定"),
    ]
    for label, value in qual_rows:
        y -= 18
        c.setFillColor(HexColor("#E9F1F7")); c.rect(left, y, label_w, 18, stroke=0, fill=1)
        c.setStrokeColor(LINE); c.rect(left, y, content_w, 18, stroke=1, fill=0); c.line(left + label_w, y, left + label_w, y + 18)
        c.setFillColor(NAVY); c.setFont("JP-B", 8); c.drawString(left + 4, y + 5.4, label)
        c.setFillColor(TEXT); c.setFont("JP", 7.7); c.drawString(left + label_w + 5, y + 5.4, value)
    y -= 5

    y = draw_section_title(c, "主な実績・強み", left, y, content_w)
    strengths = [
        ("フルスタック対応", "フロントエンド～バックエンド～デザインまでワンストップ対応"),
        ("品質担保の実績", "QAエンジニアとして品質管理プロセスを一手に担いリリース品質向上に貢献"),
        ("高負荷CS対応", "1日100件の法人向け問い合わせ対応で迅速・正確な顧客対応力を確立"),
        ("AI活用", "Devin、Claude等の生成AIを実務に積極活用し業務効率化・コンテンツ制作に貢献"),
    ]
    for label, value in strengths:
        y -= 17
        c.setFillColor(HexColor("#E9F1F7")); c.rect(left, y, label_w, 17, stroke=0, fill=1)
        c.setStrokeColor(LINE); c.rect(left, y, content_w, 17, stroke=1, fill=0); c.line(left + label_w, y, left + label_w, y + 17)
        c.setFillColor(NAVY); c.setFont("JP-B", 7.6); c.drawString(left + 4, y + 5, label)
        c.setFillColor(TEXT); c.setFont("JP", 7.4); c.drawString(left + label_w + 5, y + 5, value)
    y -= 5

    y = draw_section_title(c, "提供サービス（フリーランス）", left, y, content_w)
    service_lines = [
        "HTML/CSS/JavaScriptを使ったWebサイト・LP制作（レスポンシブ対応）",
        "WordPress・Studioを使ったWebサイト・LP制作／現行サイトからWordPressへの移行",
        "EC画像制作／SNS・YouTube等の動画編集・広告動画制作",
        "YouTube・SNS管理・運営サポート／QA（品質保証）コンサルティング・テスト設計・実施",
        "ヘルプページ・マニュアル・ドキュメント作成",
    ]
    draw_lines(c, [f"・{line}" for line in service_lines], left + 3, y - 9, size=7.3, leading=10.5)

    c.save()
    packet.seek(0)
    return PdfReader(packet).pages[0]


def build_page_two():
    register_fonts()
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    left, right = 36, 36
    content_w = width - left - right

    c.setFillColor(NAVY)
    c.rect(left, height - 70, content_w, 48, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("JP-B", 18)
    c.drawCentredString(width / 2, height - 52, "制 作 実 績・ポ ー ト フ ォ リ オ")

    panel_y = height - 194
    panel_h = 102
    c.setFillColor(PALE)
    c.roundRect(left, panel_y, content_w, panel_h, 6, stroke=0, fill=1)
    c.setStrokeColor(CYAN)
    c.setLineWidth(1.3)
    c.roundRect(left, panel_y, content_w, panel_h, 6, stroke=1, fill=0)

    icon = ROOT / "public" / "about-icon-jelly.png"
    fit_image(c, icon, left + 12, panel_y + 22, 58, 58)
    c.setFillColor(NAVY)
    c.setFont("JP-B", 14.5)
    c.drawString(left + 82, panel_y + 66, "ポートフォリオサイト")
    c.setFillColor(MUTED)
    c.setFont("JP", 7.0)
    c.drawString(left + 82, panel_y + 48, PORTFOLIO_URL)
    qr_size = 70
    draw_qr(c, PORTFOLIO_URL, width - right - qr_size - 42, panel_y + 16, qr_size)

    y = panel_y - 16
    y = draw_section_title(c, "ポートフォリオ", left, y, content_w)
    map_path = ROOT / "public" / "koyomirium-map-v2.png"
    img_x, img_y, img_w, img_h = left, y - 88, 150, 84
    c.setFillColor(DEEP)
    c.rect(img_x, img_y, img_w, img_h, stroke=0, fill=1)
    fit_image(c, map_path, img_x + 2, img_y + 2, img_w - 4, img_h - 4, contain=False)
    tx = img_x + img_w + 14
    c.setFillColor(TEXT)
    c.setFont("JP-B", 10)
    c.drawString(tx, y - 13, "KOYOMIRIUM - かわいい水族館をテーマにした作品")
    bullet(c, "クォータービューの水族館マップを企画・制作", tx, y - 33)
    bullet(c, "ドット絵、アニメーション、ライトボックス演出を実装", tx, y - 49)
    bullet(c, "作品・スキル・経歴・ミニゲームを一つの世界観で構成", tx, y - 65)
    bullet(c, "PC・スマートフォンのレスポンシブ表示に対応", tx, y - 81)
    y = img_y - 13

    y = draw_section_title(c, "LINEスタンプ販売実績", left, y, content_w)
    stamp_paths = [
        ROOT / "public" / "portfolio-assets" / "line-stickers-01.png",
        ROOT / "public" / "portfolio-assets" / "line-stickers-02.png",
        ROOT / "public" / "portfolio-assets" / "line-stickers-03.png",
    ]
    stamp_titles = ["ふわふわ なかま", "コジマだよ。", "ネオ北海道弁"]
    card_w = 101
    gap = 9
    sy = y - 63
    for idx, (path, title) in enumerate(zip(stamp_paths, stamp_titles)):
        x = left + idx * (card_w + gap)
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.rect(x, sy, card_w, 57, stroke=1, fill=1)
        fit_image(c, path, x + 3, sy + 3, card_w - 6, 51, contain=False)
        c.setFillColor(TEXT)
        c.setFont("JP-B", 7.4)
        c.drawCentredString(x + card_w / 2, sy - 10, title)
    tx = left + 3 * (card_w + gap) + 5
    c.setFillColor(TEXT)
    c.setFont("JP-B", 9.2)
    c.drawString(tx, y - 16, "LINE STOREにて3シリーズを販売")
    bullet(c, "キャラクター企画", tx, y - 35, size=8)
    bullet(c, "表情・セリフ・配色設計", tx, y - 50, size=8)
    bullet(c, "スタンプ画像の制作・登録", tx, y - 65, size=8)
    y = sy - 23

    y = draw_section_title(c, "LP・EC画像・動画制作", left, y, content_w)
    col_w = (content_w - 12) / 2
    box_h = 62
    for idx, (heading, lines) in enumerate([
        ("LP・EC画像", ["和風居酒屋LP／カフェバーLP", "旅行アカウント・アロマブランドのEC画像"]),
        ("動画", ["アロマブランドのリール動画", "コスメ系TikTok動画／広告用画像"]),
    ]):
        x = left + idx * (col_w + 12)
        by = y - box_h - 3
        c.setFillColor(HexColor("#F7FAFC"))
        c.setStrokeColor(LINE)
        c.rect(x, by, col_w, box_h, stroke=1, fill=1)
        c.setFillColor(NAVY)
        c.setFont("JP-B", 9.4)
        c.drawString(x + 9, by + 43, heading)
        bullet(c, lines[0], x + 9, by + 27, size=7.7)
        bullet(c, lines[1], x + 9, by + 13, size=7.7)
    y = y - box_h - 16

    y = draw_section_title(c, "Photoshopの経験とキャッチアップ", left, y, content_w)
    c.setFillColor(TEXT)
    c.setFont("JP", 8.2)
    c.drawString(left + 8, y - 12, "Photoshopの実務経験は限定的ですが、Illustrator・Figma・Canva等の既存経験を基に、")
    c.drawString(left + 8, y - 27, "必要な操作をハンズオンで検証しながら習得しています。レイヤー編集可能なPSDサンプルも制作しました。")
    y -= 40

    c.save()
    packet.seek(0)
    return PdfReader(packet).pages[0]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    src = PdfReader(str(SOURCE))
    writer = PdfWriter()
    writer.add_page(build_page_one())
    writer.add_page(build_page_two())
    writer.add_metadata(src.metadata or {})
    with OUTPUT.open("wb") as f:
        writer.write(f)
    check = PdfReader(str(OUTPUT))
    if len(check.pages) != 2:
        raise RuntimeError("Expected a two-page PDF")
    print(OUTPUT)


if __name__ == "__main__":
    main()
