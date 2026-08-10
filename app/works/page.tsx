"use client";

import { useEffect, useRef, useState } from "react";

type LightboxItem = {
  type: "image" | "video" | "page" | "photoshop";
  src: string;
  title: string;
  variant?: "line" | "ec";
  description?: string;
  purpose?: string;
  operations?: string[];
  ingenuity?: string;
  download?: string;
  startTime?: number;
  videoKey?: string;
  cropCredit?: boolean;
};

const photoshopWorks: LightboxItem[] = [
  {
    type: "photoshop",
    src: "/portfolio-assets/photoshop/release-banner.png",
    title: "配信開始バナー",
    description: "画像合成・文字装飾・CTA制作",
    purpose: "新作ゲームの配信開始を一目で伝える告知画像を想定しました。",
    operations: ["素材配置・切り抜き", "タイトルと告知文字の装飾", "リボン・ボタン・バッジ制作", "色調整・レイヤー整理"],
    ingenuity: "タイトル、オープン告知、CTAの順に視線が流れるよう、情報の大きさと色を整理しました。",
    download: "/portfolio-assets/photoshop/release-banner.psd",
  },
  {
    type: "photoshop",
    src: "/portfolio-assets/photoshop/game-ui.png",
    title: "ゲーム内UI",
    description: "情報設計・ゲージ・ボタン制作",
    purpose: "水槽の状態と強化操作を短時間で理解できる管理画面を想定しました。",
    operations: ["ステータスパネル設計", "ゲージ・ボタン・区切り線制作", "アイコン配置・文字組み", "グループ単位のレイヤー管理"],
    ingenuity: "清潔度・魅力度・飼育数を色とアイコンで区別し、背景の水槽を見せながら情報を読める構成にしました。",
    download: "/portfolio-assets/photoshop/game-ui-sample.psd",
  },
  {
    type: "photoshop",
    src: "/portfolio-assets/photoshop/jellyfish-expressions.png",
    title: "キャラクター表情4差分",
    description: "ピクセル編集・差分管理",
    purpose: "ゲーム内キャラクターの感情表現に使用する表情差分を想定しました。",
    operations: ["目・眉・口・頬のパーツ分離", "鉛筆ツールによるドット編集", "表情別フォルダー管理", "編集可能なPSD構造の整理"],
    ingenuity: "身体のサイズや模様を維持し、通常・喜び・驚き・しょんぼりの4表情を描き分けました。",
    download: "/portfolio-assets/photoshop/jellyfish-expressions.psd",
  },
];

const lineWorks = [
  { src: "/portfolio-assets/line-stickers-01.png", title: "ふわふわ なかま", text: "line-01.png", url: "https://store.line.me/stickershop/product/1154651/ja" },
  { src: "/portfolio-assets/line-stickers-02.png", title: "コジマだよ。", text: "line-02.png", url: "https://store.line.me/stickershop/product/1398629/ja" },
  { src: "/portfolio-assets/line-stickers-03.png", title: "ネオ北海道弁", text: "line-03.png", url: "https://store.line.me/stickershop/product/1096139/ja" },
];
const lpWorks = [
  { title: "和風居酒屋LP制作", url: "https://tagumi.github.io/kiwami-lp/", text: "izakaya.png" },
  { title: "カフェバーLP制作", url: "https://tagumi.github.io/kaguya-hp/", text: "cafe.png" },
];
const ecWorks = [
  { title: "EC画像（旅行アカウント）", image: "/portfolio-assets/canva-portfolio.png", text: "canva.png" },
  { title: "EC画像（アロマブランド）", image: "/portfolio-assets/product-3.png", text: "ec02.png" },
  { title: "EC画像（楽天用）", image: "/portfolio-assets/rakuten-ec.png", text: "ec-rakuten.png" },
];
const videoWorks = [
  { title: "リール動画（アロマブランド）", video: "/portfolio-assets/reel-sample-02.mp4", text: "reel02.png", cropCredit: true },
  { title: "TikTok動画（コスメ）", video: "/portfolio-assets/reel-sample-03.mp4", text: "reel03.png", cropCredit: false, poster: "/portfolio-assets/reel-sample-03-poster-18s-clean.png" },
];

function TextImage({ file, alt, className = "" }: { file: string; alt: string; className?: string }) {
  return <img className={`works-text-image ${className}`} src={`/works-text/${file}`} alt={alt} />;
}
function Plate({ file, title, storeUrl }: { file: string; title: string; storeUrl?: string }) {
  const content = <><TextImage file={file} alt={title} /><i>▼</i></>;
  return storeUrl ? <a className="works-plate store-plate" href={storeUrl} target="_blank" rel="noreferrer">{content}</a> : <div className="works-plate">{content}</div>;
}

export default function WorksPage() {
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const inlineVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const expandedVideoRef = useRef<HTMLVideoElement | null>(null);

  const closeLightbox = () => {
    if (lightbox?.type === "video" && lightbox.videoKey && expandedVideoRef.current) {
      const inlineVideo = inlineVideoRefs.current[lightbox.videoKey];
      if (inlineVideo) inlineVideo.currentTime = expandedVideoRef.current.currentTime;
    }
    setLightbox(null);
  };

  const openVideo = (work: typeof videoWorks[number]) => {
    const inlineVideo = inlineVideoRefs.current[work.video];
    const startTime = inlineVideo?.currentTime ?? 0;
    Object.values(inlineVideoRefs.current).forEach((video) => video?.pause());
    setLightbox({
      type: "video",
      src: work.video,
      title: work.title,
      startTime,
      videoKey: work.video,
      cropCredit: work.cropCredit,
    });
  };

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && closeLightbox();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [lightbox]);
  useEffect(() => {
    if (!lightbox) return;

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, [lightbox]);
  const closeFloor = () => window.parent !== window ? window.parent.postMessage({ type: "close-works" }, window.location.origin) : window.location.assign("/?skipIntro=1");

  return (
    <main className="works-aquarium">
      <header className="works-nav">
        <button className="works-window-close" onClick={closeFloor} aria-label="作品画面を閉じる" />
        <a className="header-home-logo" href="/" target="_top" aria-label="最初のタイトル画面へ戻る"><img src="/koyomirium-logo.png" alt="KOYOMI RIUM PORTFOLIO" /></a>
        <TextImage file="floor.png" alt="実績・作品" className="works-floor-label" />
      </header>

      <section className="works-hero">
        <div className="works-hero-bubbles" aria-hidden="true"><i /><i /><i /><i /></div>
        <h1><TextImage file="hero.png" alt="飼育員のお仕事" /></h1>
        <div className="works-note"><TextImage file="works-hero-note-pixel-v2.png" alt="がんばってきたこと" /></div>
      </section>

      <div className="works-floor">
        <section className="works-zone photoshop-zone">
          <header><TextImage file="section-photoshop.png" alt="01 Photoshop" /></header>
          <div className="photoshop-intro">
            <p>ゲーム運営で発生する「告知・ゲーム内UI・キャラクター差分」という、異なる3種類の画像制作業務を想定した自主制作です。</p>
            <span>素材加工・配置、文字装飾、UI設計、ピクセル編集、PSDのレイヤー整理までPhotoshopで行いました。</span>
          </div>
          <div className="works-grid photoshop-grid">
            {photoshopWorks.map((work, index) => <article className="work-tank photoshop-card" key={work.title}>
              <button className="photoshop-card-button" onClick={() => setLightbox(work)} aria-label={`${work.title}の制作詳細を表示`}>
                <span className="photoshop-thumb"><img src={work.src} alt="" /></span>
                <Plate file={`photoshop-0${index + 1}.png`} title={work.title} />
                <small><span>{work.description}</span></small>
              </button>
            </article>)}
          </div>
          <p className="photoshop-ai-note">※背景・キャラクターなど一部素材の生成に生成AIを使用。構成設計、素材選定、切り抜き、配置、文字装飾、UI制作、ドット修正、PSD整理はPhotoshopで実施しています。</p>
        </section>

        <section className="works-zone">
          <header><TextImage file="section-line.png" alt="02 LINEスタンプ" /></header>
          <div className="works-grid works-grid-line">
            {lineWorks.map((work) => <article className="work-tank line-card" key={work.src}>
              <button className="work-media-button line-media" onClick={() => setLightbox({ type: "image", src: work.src, title: work.title, variant: "line" })} aria-label={`${work.title}を拡大表示`}><img src={work.src} alt="" /></button>
              <Plate file={work.text} title={work.title} storeUrl={work.url} />
            </article>)}
          </div>
        </section>

        <section className="works-zone">
          <header><TextImage file="section-lp.png" alt="03 LP" /><TextImage file="note.png" alt="※納品時の商品名・店名・ロゴなどは一部改変しております" className="section-disclaimer" /></header>
          <div className="works-grid">
            {lpWorks.map((work) => <article className="work-tank" key={work.title}>
              <button className="work-media-button lp-window" onClick={() => setLightbox({ type: "page", src: work.url, title: work.title })} aria-label={`${work.title}を拡大表示`}><iframe src={work.url} title="" tabIndex={-1} loading="lazy" /></button>
              <Plate file={work.text} title={work.title} />
            </article>)}
          </div>
        </section>

        <section className="works-zone">
          <header><TextImage file="section-ec.png" alt="04 EC画像" /><TextImage file="note.png" alt="※納品時の商品名・店名・ロゴなどは一部改変しております" className="section-disclaimer" /></header>
          <div className="works-grid">
            {ecWorks.map((work) => <article className="work-tank ec-card" key={work.title}>
              <button className="ec-card-button" onClick={() => setLightbox({ type: "image", src: work.image, title: work.title, variant: "ec" })} aria-label={`${work.title}を拡大表示`}>
                <span className="work-image"><img src={work.image} alt="" /></span>
                <Plate file={work.text} title={work.title} />
              </button>
            </article>)}
          </div>
        </section>

        <section className="works-zone">
          <header><TextImage file="section-video.png" alt="05 動画" /><TextImage file="note.png" alt="※納品時の商品名・店名・ロゴなどは一部改変しております" className="section-disclaimer" /></header>
          <div className="works-grid works-grid-video">
            {videoWorks.map((work) => <article className="work-tank video-tank" key={work.video}>
              <div className={`inline-video-wrap ${work.cropCredit ? "inline-video-credit" : ""}`}>
                <video ref={(node) => { inlineVideoRefs.current[work.video] = node; }} className={`video-crop ${work.cropCredit ? "video-crop-credit" : ""}`} src={work.video} poster={work.poster} controls controlsList="nofullscreen" playsInline preload="metadata" aria-label={work.title} onLoadedMetadata={(event) => { event.currentTarget.currentTime = 0; }} onCanPlay={(event) => { if (event.currentTarget.paused && event.currentTarget.currentTime > 0.01) event.currentTarget.currentTime = 0; }} />
                <button className="video-window-button" onClick={() => openVideo(work)} aria-label={`${work.title}を画面内で拡大表示`}><TextImage file="expand.png" alt="拡大" /></button>
              </div>
              {work.text && <Plate file={work.text} title={work.title} />}
            </article>)}
          </div>
        </section>
      </div>

      <footer className="works-footer"><button className="works-footer-close" onClick={closeFloor} aria-label="作品画面を閉じる" /><TextImage file="footer-brand.png" alt="KOYOMIRIUM PORTFOLIO" /></footer>

      {lightbox && <div className="works-lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onMouseDown={(e) => e.target === e.currentTarget && closeLightbox()}>
        <button className="lightbox-close" onClick={closeLightbox} aria-label="閉じる" />
        <div className={`lightbox-stage lightbox-${lightbox.type} ${lightbox.variant ? `lightbox-${lightbox.variant}` : ""} ${lightbox.cropCredit ? "lightbox-video-credit" : ""}`}>
          {lightbox.type === "image" && <img src={lightbox.src} alt={lightbox.title} />}
          {lightbox.type === "video" && <video ref={expandedVideoRef} src={lightbox.src} controls controlsList="nofullscreen" autoPlay playsInline onLoadedMetadata={(event) => {
            event.currentTarget.currentTime = lightbox.startTime ?? 0;
            void event.currentTarget.play();
          }} />}
          {lightbox.type === "page" && <iframe src={lightbox.src} title={lightbox.title} />}
          {lightbox.type === "photoshop" && <article className="photoshop-detail">
            <div className="photoshop-detail-visual"><img src={lightbox.src} alt={`${lightbox.title} 完成画像`} /></div>
            <div className="photoshop-detail-copy">
              <span>自主制作｜Photoshop</span>
              <div className="photoshop-detail-main-copy" role="heading" aria-level={2}>{lightbox.title}</div>
              <p className="photoshop-detail-summary">{lightbox.description}</p>
              <dl>
                <div><dt>制作目的</dt><dd>{lightbox.purpose}</dd></div>
                <div><dt>担当・操作</dt><dd><ul>{lightbox.operations?.map((operation) => <li key={operation}>{operation}</li>)}</ul></dd></div>
                <div><dt>工夫した点</dt><dd>{lightbox.ingenuity}</dd></div>
              </dl>
              {lightbox.download && <a className="photoshop-download" href={lightbox.download} download>編集ファイル（PSD）をダウンロード</a>}
            </div>
          </article>}
        </div>
      </div>}
    </main>
  );
}
