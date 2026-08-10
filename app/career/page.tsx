"use client";

import { useEffect, useRef, useState } from "react";

const careerItems = [
  {
    period: "現在",
    role: "QA Engineer / SaaSスタートアップ（8年）",
    company: "Customer Success / インターネット人材サービス企業（8年）",
    description: "システムの品質管理・ヘルプページ作成、法人向け問い合わせ対応（1日50〜100件）を担当。\nWordPressを用いたWebサイト構築を並行して行う。\nその他、LP制作などのフリーの案件を受注。",
  },
  {
    period: "独立系SIer（約5年）",
    role: "システムエンジニア / 独立系SIer企業",
    company: "",
    description: "日本の総合電機メーカーに常駐し開発を担当。",
  },
  {
    period: "学歴",
    role: "国立大学 商学部 企業法学科 卒業",
    company: "商学・企業法",
    description: "商学・企業法の専門知識を習得。ビジネスと法律の視点を持つエンジニアとしての基盤を獲得。",
  },
] as const;

const careerMessage = (index: number) => {
  const item = careerItems[index];
  return `${item.role}${item.company ? `\n${item.company}` : ""}\n\n${item.description}`;
};

function TextImage({ file, alt, className = "" }: { file: string; alt: string; className?: string }) {
  return <img className={`works-text-image ${className}`} src={`/works-text/${file}`} alt={alt} />;
}

function CareerText({ text }: { text: string }) {
  return <>{text.split("\n").map((line, index) => <span className={index < 2 ? "career-role-line" : "career-description-line"} key={`${index}-${line}`}>{line || "\u00a0"}</span>)}</>;
}

export default function CareerPage() {
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState("");
  const [complete, setComplete] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [replayKey, setReplayKey] = useState(0);
  const speedRef = useRef(1);
  const message = careerMessage(scene);
  const reveal = Math.min(100, ((scene + typed.length / Math.max(1, message.length)) / careerItems.length) * 100);

  useEffect(() => {
    setTyped("");
    setComplete(false);
    let cursor = 0;
    let timer = 0;
    const typeNext = () => {
      cursor += 1;
      setTyped(message.slice(0, cursor));
      if (cursor >= message.length) {
        setComplete(true);
        return;
      }
      timer = window.setTimeout(typeNext, Math.max(5, 95 / speedRef.current));
    };
    timer = window.setTimeout(typeNext, Math.max(5, 95 / speedRef.current));
    return () => window.clearTimeout(timer);
  }, [scene, message, replayKey]);

  const rewindDialogue = () => {
    if (scene > 0) setScene((current) => current - 1);
    else setReplayKey((current) => current + 1);
  };

  const advanceDialogue = () => {
    if (!complete) {
      setTyped(message);
      setComplete(true);
      return;
    }
    if (scene < careerItems.length - 1) setScene((current) => current + 1);
  };

  const speedUp = () => {
    setSpeed((current) => {
      const next = Math.min(current * 2, 64);
      speedRef.current = next;
      return next;
    });

    if (!complete) {
      setTyped(message);
      setComplete(true);
    } else if (scene < careerItems.length - 1) {
      setScene((current) => current + 1);
    } else {
      setScene(0);
      setReplayKey((current) => current + 1);
    }
  };

  const closeFloor = () => window.parent !== window
    ? window.parent.postMessage({ type: "close-career" }, window.location.origin)
    : window.location.assign("/?skipIntro=1");

  return <main className="works-aquarium career-aquarium">
    <header className="works-nav">
      <button className="works-window-close" onClick={closeFloor} aria-label="沿革画面を閉じる" />
      <a className="header-home-logo" href="/" target="_top" aria-label="最初のタイトル画面へ戻る"><img src="/koyomirium-logo.png" alt="KOYOMI RIUM PORTFOLIO" /></a>
      <TextImage file="career-floor.png" alt="経歴" className="works-floor-label" />
    </header>

    <section className="works-hero career-hero">
      <div className="works-hero-bubbles" aria-hidden="true"><i /><i /><i /><i /></div>
      <h1><TextImage file="career-hero.png" alt="沿革" /></h1>
      <div className="works-note"><TextImage file="career-lead-pixel-v2.png" alt="ローマは一日にして成らず" /></div>
    </section>

    <div className="works-floor career-floor">
      <section className="career-dialogue-stage">
        <div className="career-deepsea-rail" aria-hidden="true"><img src="/career-oarfish.png" alt="" style={{ clipPath: `inset(0 0 ${100 - reveal}% 0)` }} /></div>
        <div className="career-dialogue-wrap">
          <div className="career-speed-controls">
            <button className="career-speed-button" onClick={rewindDialogue} aria-label="1つ前の経歴へ巻き戻す"><TextImage file="career-rewind.png" alt="巻き戻し" /></button>
            <button className="career-speed-button" onClick={speedUp} aria-label={`経歴表示を現在の${speed}倍からさらに早送りする`}><TextImage file="career-fast-forward.png" alt="早送り" /></button>
          </div>
          {careerItems.slice(0, scene + 1).map((item, index) => {
            const isCurrent = index === scene;
            return <button className={`career-dialogue ${isCurrent ? "current" : "complete"}`} onClick={isCurrent ? advanceDialogue : undefined} disabled={!isCurrent} aria-label={isCurrent ? "会話を進める" : undefined} key={item.period}>
              <strong>{item.period}</strong>
              <p aria-live={isCurrent ? "polite" : "off"}><CareerText text={isCurrent ? typed : careerMessage(index)} />{isCurrent && !complete && <i className="typing-cursor" />}</p>
              {isCurrent && complete && <span className="dialogue-caret">▼</span>}
            </button>;
          })}
        </div>
      </section>
    </div>

    <footer className="works-footer"><button className="works-footer-close" onClick={closeFloor} aria-label="沿革画面を閉じる" /><TextImage file="footer-brand.png" alt="KOYOMIRIUM PORTFOLIO" /></footer>
  </main>;
}
