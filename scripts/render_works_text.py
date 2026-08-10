from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path(__file__).resolve().parents[1] / "public" / "works-text"
OUT.mkdir(parents=True, exist_ok=True)
FONT = r"C:\Windows\Fonts\msgothic.ttc"

def render(name, text, size=16, color=(255,255,255,255), scale=3, shadow=True, pad=5):
    font = ImageFont.truetype(FONT, size)
    probe = Image.new("RGBA", (8, 8))
    box = ImageDraw.Draw(probe).multiline_textbbox((0,0), text, font=font, spacing=3, align="center")
    w, h = int(box[2]-box[0])+pad*2+3, int(box[3]-box[1])+pad*2+3
    im = Image.new("RGBA", (w,h), (0,0,0,0))
    d = ImageDraw.Draw(im)
    x, y = w//2, pad-box[1]
    if shadow:
        d.multiline_text((x+2,y+2), text, font=font, fill=(0,62,102,255), anchor="ma", spacing=3, align="center")
    d.multiline_text((x,y), text, font=font, fill=color, anchor="ma", spacing=3, align="center")
    im.resize((w*scale,h*scale), Image.Resampling.NEAREST).save(OUT / name)

def render_runs(name, runs, size=28, scale=3, pad=6):
    font = ImageFont.truetype(FONT, size)
    widths = [ImageDraw.Draw(Image.new("RGBA", (1,1))).textlength(text, font=font) for text, _ in runs]
    h = font.getbbox("実績・作品")[3] - font.getbbox("実績・作品")[1]
    im = Image.new("RGBA", (int(sum(widths))+pad*2+4, int(h)+pad*2+4), (0,0,0,0))
    d = ImageDraw.Draw(im); x = pad
    for (text, color), width in zip(runs, widths):
        d.text((x+2,pad+2), text, font=font, fill=(0,62,102,255))
        d.text((x,pad), text, font=font, fill=color)
        x += width
    im.resize((im.width*scale,im.height*scale), Image.Resampling.NEAREST).save(OUT / name)

def render_hard_pixel(name, text, size=12, scale=2, pad=4):
    font = ImageFont.truetype(FONT, size)
    probe = Image.new("RGBA", (8, 8))
    box = ImageDraw.Draw(probe).textbbox((0,0), text, font=font)
    w, h = int(box[2]-box[0])+pad*2+3, int(box[3]-box[1])+pad*2+3
    im = Image.new("RGBA", (w,h), (0,0,0,0))
    d = ImageDraw.Draw(im)
    y = pad-box[1]
    d.text((pad+2,y+2), text, font=font, fill=(0,62,102,255))
    d.text((pad,y), text, font=font, fill=(215,238,243,255))
    px = im.load()
    for yy in range(h):
        for xx in range(w):
            r,g,b,a = px[xx,yy]
            if a < 150:
                px[xx,yy] = (0,0,0,0)
            elif r + g + b < 390:
                px[xx,yy] = (0,62,102,255)
            else:
                px[xx,yy] = (215,238,243,255)
    im.resize((w*scale,h*scale), Image.Resampling.NEAREST).save(OUT / name)

def render_pixel_sparkle(name, scale=3):
    im = Image.new("RGBA", (13,13), (0,0,0,0))
    px = im.load()
    cyan, pale, yellow = (72,245,255,255), (224,255,255,255), (255,222,104,255)
    for x,y in [(6,0),(6,1),(6,2),(6,3),(6,9),(6,10),(6,11),(6,12),(0,6),(1,6),(2,6),(3,6),(9,6),(10,6),(11,6),(12,6)]: px[x,y]=cyan
    for x,y in [(4,4),(5,5),(7,7),(8,8),(8,4),(7,5),(5,7),(4,8)]: px[x,y]=yellow
    for x,y in [(5,6),(6,5),(6,6),(7,6),(6,7)]: px[x,y]=pale
    im.resize((13*scale,13*scale), Image.Resampling.NEAREST).save(OUT / name)

def render_game_logo(name, text, size=28, scale=4):
    """Bold, exact-text retro game title rendered as a transparent raster logo."""
    font_path = r"C:\Windows\Fonts\meiryob.ttc"
    font = ImageFont.truetype(font_path if Path(font_path).exists() else FONT, size)
    probe = Image.new("L", (4, 4))
    box = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font, stroke_width=1)
    pad = 12
    w, h = box[2] - box[0] + pad * 2, box[3] - box[1] + pad * 2
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    md.text((pad - box[0], pad - box[1]), text, font=font, fill=255, stroke_width=1, stroke_fill=255)
    outer = mask.filter(ImageFilter.MaxFilter(9))
    inner_outline = mask.filter(ImageFilter.MaxFilter(5))
    logo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow.putalpha(outer.point(lambda a: int(a * .75)))
    shadow_color = Image.new("RGBA", (w, h), (11, 16, 70, 255))
    shadow_color.putalpha(shadow.getchannel("A"))
    logo.alpha_composite(shadow_color, (2, 3))
    purple = Image.new("RGBA", (w, h), (83, 20, 117, 255)); purple.putalpha(outer); logo.alpha_composite(purple)
    pink_edge = Image.new("RGBA", (w, h), (226, 38, 118, 255)); pink_edge.putalpha(inner_outline); logo.alpha_composite(pink_edge)
    fill = Image.new("RGBA", (w, h), (0, 0, 0, 0)); fp = fill.load()
    top, bottom = (255, 116, 184), (224, 37, 109)
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(round(top[i] * (1-t) + bottom[i] * t) for i in range(3)) + (255,)
        for x in range(w): fp[x, y] = color
    fill.putalpha(mask); logo.alpha_composite(fill)
    hi = Image.new("RGBA", (w, h), (0, 0, 0, 0)); hd = ImageDraw.Draw(hi)
    hd.text((pad - box[0], pad - box[1] - 1), text, font=font, fill=(255, 209, 232, 210), stroke_width=0)
    hi.putalpha(Image.eval(hi.getchannel("A"), lambda a: 150 if a else 0)); logo.alpha_composite(hi)
    d = ImageDraw.Draw(logo)
    star = (255, 226, 87, 255)
    for sx, sy in [(4, h//3), (w-6, h//2), (w//2, 4)]:
        d.polygon([(sx,sy-3),(sx+1,sy-1),(sx+4,sy),(sx+1,sy+1),(sx,sy+4),(sx-1,sy+1),(sx-4,sy),(sx-1,sy-1)], fill=star)
    logo.resize((w*scale, h*scale), Image.Resampling.NEAREST).save(OUT / name)

render("back.png", "◀ MAPへもどる", 12, (133,255,255,255), 3)
render_runs("floor.png", [("実績",(99,244,245,255)),("・作品",(255,255,255,255))], 11, 3)
render_runs("kicker.png", [("実績",(99,244,245,255)),("・作品",(255,255,255,255))], 13, 3)
render_runs("hero.png", [("飼育員",(99,244,245,255)),("のお仕事",(255,255,255,255))], 24, 3)
render("note.png", "※納品時の商品名・店名・ロゴなどは一部改変しております", 10, (215,238,243,255), 3, False)
render("works-hero-note.png", "がんばってきたこと", 24, (215,238,243,255), 3, True)
render("section-line.png", "LINEスタンプ", 23, (255,255,255,255), 3)
render("section-lp.png", "LP", 23, (255,255,255,255), 3)
render("section-ec.png", "EC画像", 23, (255,255,255,255), 3)
render("section-video.png", "動画", 23, (255,255,255,255), 3)
render("section-photoshop.png", "Photoshop", 23, (255,255,255,255), 3)
render("photoshop-01.png", "配信開始バナー", 12, (255,255,255,255), 3)
render("photoshop-02.png", "ゲーム内UI", 12, (255,255,255,255), 3)
render("photoshop-03.png", "キャラクター表情4差分", 12, (255,255,255,255), 3)
render("line-01.png", "ふわふわ　なかま", 12, (255,255,255,255), 3)
render("line-02.png", "コジマだよ。", 12, (255,255,255,255), 3)
render("line-03.png", "ネオ北海道弁", 12, (255,255,255,255), 3)
render("izakaya.png", "和風居酒屋LP制作", 12, (255,255,255,255), 3)
render("cafe.png", "カフェバーLP制作", 12, (255,255,255,255), 3)
render("canva.png", "EC画像（旅行アカウント）", 12, (255,255,255,255), 3)
render("ec02.png", "EC画像（アロマブランド）", 12, (255,255,255,255), 3)
render("reel02.png", "リール動画（アロマブランド）", 12, (255,255,255,255), 3)
render("reel03.png", "TikTok動画（コスメ）", 12, (255,255,255,255), 3)
render("footer-back.png", "◀ 水族館MAPへもどる", 11, (114,244,240,255), 3)
render("footer-brand.png", "KOYOMIRIUM PORTFOLIO", 11, (145,205,221,255), 3)
render("expand.png", "拡大", 10, (220,255,255,255), 3, True, 4)
render("intro-skip.png", "CLICK TO ENTER", 14, (157,221,236,255), 3, True, 4)
render("intro-dedication.png", "FOR MY BELOVED", 11, (255,218,104,255), 3, True, 4)
render("intro-dedication-v2.png", "FOR MY BELOVED", 11, (255,218,104,255), 3, True, 4)
render("intro-dedication-v3.png", "FOR MY BELOVED", 11, (255,218,104,255), 3, False, 2)
render("intro-kairo-word-v4.png", "KAIROSOFT", 11, (255,218,104,255), 3, False, 2)
for index, letter in enumerate("KAIROSOFT"):
    render(f"intro-kairo-{letter}.png", letter, 11, (255,218,104,255), 3, True, 2)
    render(f"intro-kairo-v2-{letter}.png", letter, 11, (255,218,104,255), 3, True, 2)
    render(f"intro-kairo-v3-{letter}.png", letter, 11, (255,218,104,255), 3, False, 1)
render_hard_pixel("intro-sparkle.png", "✦", 12, 2, 2)
render_pixel_sparkle("intro-sparkle-v2.png")
render("skills-floor.png", "スキル", 11, (255,255,255,255), 3)
render("skills-kicker.png", "スキル", 13, (99,244,245,255), 3)
render_runs("skills-hero.png", [("ショー",(99,244,245,255)),("プログラム",(255,255,255,255))], 24, 3)
render("skills-lead.png", "戦闘力∞", 24, (215,238,243,255), 3, True)
render("skills-section-work.png", "業務内容", 23, (255,255,255,255), 3)
render("skills-section-language.png", "使用言語", 23, (255,255,255,255), 3)
render("skills-section-tools.png", "使用ツール", 23, (255,255,255,255), 3)
render("career-floor.png", "経歴", 11, (255,255,255,255), 3)
render("career-kicker.png", "沿革", 13, (99,244,245,255), 3)
render("career-hero.png", "沿革", 24, (99,244,245,255), 3)
render("career-lead.png", "ローマは一日にして成らず", 24, (215,238,243,255), 3, True)
render("career-section.png", "01  経歴", 23, (255,255,255,255), 3)
render("works-hero-note-pixel.png", "がんばってきたこと", 24, (215,238,243,255), 1, True)
render("skills-lead-pixel.png", "戦闘力∞", 24, (215,238,243,255), 1, True)
render("career-lead-pixel.png", "ローマは一日にして成らず", 24, (215,238,243,255), 1, True)
render("career-rewind.png", "◀◀  巻き戻し", 16, (157,244,245,255), 3, True, 5)
render("career-fast-forward.png", "早送り  ▶▶", 16, (255,220,104,255), 3, True, 5)
render_hard_pixel("works-hero-note-pixel-v2.png", "がんばってきたこと")
render_hard_pixel("skills-lead-pixel-v2.png", "戦闘力∞")
render_hard_pixel("career-lead-pixel-v2.png", "ローマは一日にして成らず")
render("about-floor.png", "自己紹介", 11, (255,255,255,255), 3)
render_runs("about-hero.png", [("館長",(99,244,245,255)),("あいさつ",(255,255,255,255))], 24, 3)
render_hard_pixel("about-lead-pixel.png", "ほめられてのびるタイプ")
render("about-section-profile.png", "館長プロフィール", 23, (255,255,255,255), 3)
render_hard_pixel("loading-open.png", "開園準備中", 18, 3, 6)
render_hard_pixel("loading-dot.png", "・", 18, 3, 3)
render("kurage-floor.png", "ミニゲーム", 11, (255,255,255,255), 3)
render_runs("kurage-hero.png", [("ふれあい",(99,244,245,255)),("コーナー",(255,255,255,255))], 24, 3)
render_hard_pixel("kurage-lead-pixel.png", "ただいま準備中")
render_hard_pixel("kurage-play-lead.png", "浪漫あふれる海月世界", 13, 3, 5)
render("kurage-game-puzzle.png", "くらげぷかぷか", 18, (99,244,245,255), 3, True)
render("kurage-game-evolution.png", "くらげ育成日記", 18, (255,255,255,255), 3, True)
render_game_logo("secret-manbou-name-v2.png", "伝説のきょだいまんぼう", 28, 4)
