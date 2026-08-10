"use client";

const skillGroups = [
  { title: "01 業務内容", titleFile: "skills-section-work.png", items: [
    ["Webサイト・LP制作", "HTML / CSS / JavaScript / WordPress / Studio"],
    ["システム品質保証（QA）", "テスト・品質管理・ヘルプページ作成"],
    ["SNS・YouTube動画編集", "ショート動画から通常動画まで対応"],
    ["広告動画制作", "商品やサービスの魅力を動画で表現"],
    ["YouTube・SNS管理・運営", "投稿制作から継続的な運用まで対応"],
  ]},
  { title: "02 使用言語", titleFile: "skills-section-language.png", items: [
    ["HTML", "Webページの構造設計"], ["CSS", "レイアウト・装飾・レスポンシブ対応"],
    ["JavaScript", "Webサイトの動きと操作性"], ["Python", "自動化・データ処理"],
    ["PHP", "WordPressのカスタマイズ"],
  ]},
  { title: "03 使用ツール", titleFile: "skills-section-tools.png", items: [
    ["Claude", "制作補助・文章整理・開発支援"], ["Notion", "情報整理・進行管理"],
    ["Illustrator", "ロゴ・ベクター素材制作"], ["Photoshop", "画像加工・デザイン制作"],
    ["Premiere Pro", "動画編集"], ["Figma", "Webデザイン・画面設計"],
    ["Visual Studio Code", "コーディング"], ["Canva", "SNS・広告クリエイティブ制作"],
    ["Studio", "ノーコードWeb制作"], ["Git", "ソースコード管理"],
    ["GitHub", "バージョン管理・共同開発"],
  ]},
] as const;

const showImages = ["/skills-dolphin-ring.png", "/skills-dolphin-ball.png", "/skills-dolphin-tools.png"] as const;

const certifications = [
  ["応用情報技術者", "情報処理技術者試験"],
  ["ETEC", "組込み技術者試験制度"],
  ["ITIL", "ITサービスマネジメント"],
  ["TOEIC 650点", "英語コミュニケーション"],
  ["DMM 生成AI CAMP", "生成AIエンジニアコース スキル習得認定"],
] as const;

function TextImage({ file, alt, className = "" }: { file: string; alt: string; className?: string }) {
  return <img className={`works-text-image ${className}`} src={`/works-text/${file}`} alt={alt} />;
}

export default function SkillsPage() {
  const closeFloor = () => window.parent !== window ? window.parent.postMessage({ type: "close-skills" }, window.location.origin) : window.location.assign("/?skipIntro=1");
  return <main className="works-aquarium skills-aquarium">
    <header className="works-nav">
      <button className="works-window-close" onClick={closeFloor} aria-label="スキル画面を閉じる" />
      <a className="header-home-logo" href="/" target="_top" aria-label="最初のタイトル画面へ戻る"><img src="/koyomirium-logo.png" alt="KOYOMI RIUM PORTFOLIO" /></a>
      <TextImage file="skills-floor.png" alt="スキル" className="works-floor-label" />
    </header>
    <section className="works-hero skills-hero">
      <div className="works-hero-bubbles" aria-hidden="true"><i /><i /><i /><i /></div>
      <h1><TextImage file="skills-hero.png" alt="ショープログラム" /></h1>
      <div className="works-note"><TextImage file="skills-lead-pixel-v2.png" alt="戦闘力∞" /></div>
    </section>
    <div className="works-floor skills-floor">
      {skillGroups.map((group, groupIndex) => <section className="works-zone skills-zone" key={group.title}>
        <header><TextImage file={group.titleFile} alt={group.title} /></header>
        <article className={`skill-show skill-show-${groupIndex + 1}`}>
          <div className="skill-show-art"><img src={showImages[groupIndex]} alt="" /></div>
          <ul className="skill-chip-grid">
            {group.items.map(([name, description]) => <li key={name}><strong>{name}</strong><small>{description}</small></li>)}
          </ul>
        </article>
      </section>)}
      <section className="works-zone skills-zone skills-certifications">
        <header><h2>資格・認定</h2></header>
        <article className="skill-show skill-show-certifications">
          <div className="skill-show-art"><img src="/skills-dolphin-certifications.png" alt="修了証を持ったイルカ" /></div>
          <ul className="skill-chip-grid certification-chip-grid">
            {certifications.map(([name, description]) => <li key={name}><strong>{name}</strong><small>{description}</small></li>)}
          </ul>
        </article>
      </section>
    </div>
    <footer className="works-footer"><button className="works-footer-close" onClick={closeFloor} aria-label="スキル画面を閉じる" /><TextImage file="footer-brand.png" alt="KOYOMIRIUM PORTFOLIO" /></footer>
  </main>;
}
