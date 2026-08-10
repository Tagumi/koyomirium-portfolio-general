"use client";

import { useEffect, useState } from "react";

const profileTexts = [
  "システムエンジニア・QAエンジニアとして15年以上、システム開発・保守・品質管理・ユーザーエクスペリエンスの分野に従事してきました。",
  "総合型エージェント企業でのカスタマーサポート、SaaSスタートアップでの品質保証、独立系SIerでのシステム開発まで、多彩な現場で培った視点が強みです。",
  "現在はSaaSでのQA業務の他、Webサイト構築・LP制作・画像/動画制作を中心に、フリーランスとしても多数案件に取り組んでいます。",
] as const;

const profileStats = [
  ["15+", "年のIT業界経験", "/about-icon-jelly.png"],
  ["8h", "稼働時間／日", "/about-icon-penguin.png"],
  ["LP", "LP, EC画像作成", "/about-icon-starfish.png"],
  ["CS・QA", "Quality assurance", "/about-icon-turtle.png", "Customer Success"],
] as const;

function TextImage({ file, alt, className = "" }: { file: string; alt: string; className?: string }) {
  return <img className={`works-text-image ${className}`} src={`/works-text/${file}`} alt={alt} />;
}

export default function AboutPage() {
  const [typingCursor, setTypingCursor] = useState(0);
  const pauseUnits = 15;
  const totalUnits = profileTexts.reduce((sum, text) => sum + text.length, 0) + pauseUnits * (profileTexts.length - 1);

  useEffect(() => {
    const timer = window.setInterval(() => setTypingCursor((current) => {
      if (current >= totalUnits) {
        window.clearInterval(timer);
        return current;
      }
      return current + 1;
    }), 32);
    return () => window.clearInterval(timer);
  }, [totalUnits]);

  const paragraphProgress = (index: number) => {
    const start = profileTexts.slice(0, index).reduce((sum, text) => sum + text.length + pauseUnits, 0);
    return Math.max(0, Math.min(profileTexts[index].length, typingCursor - start));
  };
  const closeFloor = () => window.parent !== window
    ? window.parent.postMessage({ type: "close-about" }, window.location.origin)
    : window.location.assign("/?skipIntro=1");

  return <main className="works-aquarium about-aquarium">
    <header className="works-nav">
      <button className="works-window-close" onClick={closeFloor} aria-label="館長あいさつ画面を閉じる" />
      <a className="header-home-logo" href="/" target="_top" aria-label="最初のタイトル画面へ戻る"><img src="/koyomirium-logo.png" alt="KOYOMI RIUM PORTFOLIO" /></a>
      <TextImage file="about-floor.png" alt="自己紹介" className="works-floor-label" />
    </header>

    <section className="works-hero about-hero">
      <div className="works-hero-bubbles" aria-hidden="true"><i /><i /><i /><i /></div>
      <h1><TextImage file="about-hero.png" alt="館長あいさつ" /></h1>
      <div className="works-note"><TextImage file="about-lead-pixel.png" alt="ほめられてのびるタイプ" /></div>
    </section>

    <div className="works-floor about-floor">
      <section className="about-profile-window">
        <header><TextImage file="about-section-profile.png" alt="館長プロフィール" /></header>
        <div className="about-profile-body">
          <div className="about-clerk" aria-hidden="true">
            <span className="about-clerk-bubble">海外旅行のピークは<br />飛行機に乗る前の<br />ビール。</span>
            <i />
          </div>
          <div className="about-message" aria-label={profileTexts.join(" ")}>
            {profileTexts.map((text, index) => {
              const progress = paragraphProgress(index);
              return <p aria-hidden="true" key={text}>{text.slice(0, progress)}{progress > 0 && progress < text.length && <i className="about-typing-cursor" />}</p>;
            })}
          </div>
        </div>
      </section>

      <section className="about-stats" aria-label="プロフィール概要">
        {profileStats.map(([value, label, icon, sublabel]) => <article className="about-stat" tabIndex={0} key={value}>
          <img className="about-stat-character" src={icon} alt="" />
          <span className="about-stat-detail"><strong>{value}</strong><span>{label}{sublabel && <small>{sublabel}</small>}</span></span>
        </article>)}
      </section>
    </div>

    <footer className="works-footer"><button className="works-footer-close" onClick={closeFloor} aria-label="館長あいさつ画面を閉じる" /><TextImage file="footer-brand.png" alt="KOYOMIRIUM PORTFOLIO" /></footer>
  </main>;
}
