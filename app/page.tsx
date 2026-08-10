"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 隠しコマンド: クラゲを開く→くらげ育成日記で1回進化→×で閉じる→クラゲ水槽に張り付いて見てる人をクリック
const SECRET_SEQ = ["open-kurage", "kurage-evolved", "close-kurage", "jelly-watcher"] as const;
const SCROLL_LINES = [
  "古い巻物がみつかった・・・",
  "ここにはこう書かれている：",
  "クラゲの研究にきた。",
  "餌やり体験をしてみたらなんとそのクラゲが進化した。",
  "驚いてスマホ画面を閉じた。",
  "クラゲ水槽をながめる仲間の肩を叩いた・・",
] as const;

const spots = [
  { id: "jelly", href: "/kurage-game.html", label: "ふれあいコーナー", className: "spot-jelly" },
  { id: "ticket", href: "/about", label: "館長あいさつ", className: "spot-ticket" },
  { id: "works", href: "/works", label: "飼育員のおしごと", className: "spot-main" },
  { id: "skills", href: "/skills", label: "ショープログラム", className: "spot-dolphin" },
  { id: "career", href: "/career", label: "沿革", className: "spot-coelacanth" },
];

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [floorOpen, setFloorOpen] = useState<"about" | "kurage" | "works" | "skills" | "career" | null>(null);
  const [loadingSpot, setLoadingSpot] = useState<string | null>(null);
  const [armedSpot, setArmedSpot] = useState<string | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(false);
  const [coinOpen, setCoinOpen] = useState(false);
  const [nikumanOpen, setNikumanOpen] = useState(false);
  const [scrollTyped, setScrollTyped] = useState<string[]>(() => SCROLL_LINES.map(() => ""));
  const [scrollLineIndex, setScrollLineIndex] = useState(0);
  const [scrollLineComplete, setScrollLineComplete] = useState(false);
  const loadingTimer = useRef<number | null>(null);
  const comboRef = useRef(0);

  const registerCombo = useCallback((action: string) => {
    const step = comboRef.current;
    if (action === SECRET_SEQ[step]) {
      comboRef.current = step + 1;
      if (comboRef.current === SECRET_SEQ.length) {
        comboRef.current = 0;
        setSecretOpen(true);
      }
    } else {
      comboRef.current = action === SECRET_SEQ[0] ? 1 : 0;
    }
  }, []);

  useEffect(() => {
    const skipIntro = new URLSearchParams(window.location.search).get("skipIntro") === "1";
    if (skipIntro) {
      setIntro(false);
      window.history.replaceState({}, "", "/");
    }
    const receive = (event: MessageEvent) => {
      const type = event.data?.type;
      if (type === "kurage-evolved") { registerCombo("kurage-evolved"); return; }
      if (!["close-about", "close-kurage", "close-works", "close-skills", "close-career"].includes(type)) return;
      setFloorOpen(null);
      registerCombo(type === "close-kurage" ? "close-kurage" : "reset");
    };
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      if (loadingTimer.current !== null) window.clearTimeout(loadingTimer.current);
    };
  }, [registerCombo]);

  useEffect(() => {
    if (!scrollOpen && !coinOpen && !nikumanOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setScrollOpen(false); setCoinOpen(false); setNikumanOpen(false); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [scrollOpen, coinOpen, nikumanOpen]);

  useEffect(() => {
    if (!scrollOpen) return;
    setScrollTyped(SCROLL_LINES.map(() => ""));
    setScrollLineIndex(0);
    setScrollLineComplete(false);
  }, [scrollOpen]);

  useEffect(() => {
    if (!scrollOpen || scrollLineComplete) return;
    let cancelled = false;
    const chars = Array.from(SCROLL_LINES[scrollLineIndex]);
    let charIndex = scrollTyped[scrollLineIndex].length;
    let timer = 0;
    const typeNext = () => {
      if (cancelled) return;
      if (charIndex < chars.length) {
        charIndex += 1;
        const visibleText = chars.slice(0, charIndex).join("");
        setScrollTyped((current) => current.map((line, index) => index === scrollLineIndex ? visibleText : line));
        timer = window.setTimeout(typeNext, 58);
        return;
      }
      setScrollLineComplete(true);
    };
    timer = window.setTimeout(typeNext, 260);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [scrollOpen, scrollLineIndex, scrollLineComplete]);

  const advanceScrollDialogue = () => {
    if (!scrollLineComplete) {
      setScrollTyped((current) => current.map((line, index) => index === scrollLineIndex ? SCROLL_LINES[scrollLineIndex] : line));
      setScrollLineComplete(true);
      return;
    }
    if (scrollLineIndex < SCROLL_LINES.length - 1) {
      setScrollLineIndex((current) => current + 1);
      setScrollLineComplete(false);
    }
  };

  const openSpot = (event: React.MouseEvent<HTMLAnchorElement>, spot: typeof spots[number]) => {
    event.preventDefault();
    if (loadingSpot) return;
    // タッチ端末（hover不可）は1回目のタップで展示名ウィンドウを表示し、2回目のタップで開く。
    const needsConfirm = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
    if (needsConfirm && armedSpot !== spot.id) {
      setArmedSpot(spot.id);
      return;
    }
    setArmedSpot(null);
    setLoadingSpot(spot.id);

    const floor = spot.id === "ticket" ? "about" : spot.id === "jelly" ? "kurage" : spot.id as "works" | "skills" | "career";
    loadingTimer.current = window.setTimeout(() => {
      setFloorOpen(floor);
      setLoadingSpot(null);
      loadingTimer.current = null;
      registerCombo(floor === "kurage" ? "open-kurage" : "reset");
    }, 2400);
  };

  const cancelLoading = () => {
    if (loadingTimer.current !== null) window.clearTimeout(loadingTimer.current);
    loadingTimer.current = null;
    setLoadingSpot(null);
  };

  return <main className="aquarium-map">
    <header className="map-header"><a className="map-brand" href="/" aria-label="KOYOMI RIUM PORTFOLIO トップ"><img src="/koyomirium-logo.png" alt="KOYOMI RIUM PORTFOLIO" /></a><span className="map-header-note">INTERACTIVE AQUARIUM MAP</span></header>
    <section className="map-stage" aria-label="ポートフォリオ水族館マップ" onClick={(event) => { if (!(event.target as HTMLElement).closest(".map-hotspot")) setArmedSpot(null); }}>
      <img className="map-image" src="/koyomirium-map-v2.png" alt="5つの展示を巡るポートフォリオ水族館の館内マップ" /><div className="map-shade" />
      <div className="creature-layer" aria-hidden="true"><i className="creature sprite-fish fish-one" /><i className="creature sprite-fish fish-two" /><i className="creature sprite-jelly jelly-one" /><i className="creature sprite-jelly jelly-two" /><i className="creature sprite-dolphin dolphin-one" /><i className="creature sprite-coelacanth coelacanth-one" /><i className="ticket-clerk-original" /></div>
      <button type="button" className="map-sparkle-trigger" onClick={(event) => { event.stopPropagation(); setScrollOpen(true); }} aria-label="花壇の光を調べる"><i className="map-sparkle" aria-hidden="true" /></button>
      <button type="button" className="entrance-bench-trigger" onClick={(event) => { event.stopPropagation(); setCoinOpen(true); }} aria-label="入口のベンチを調べる" />
      <button type="button" className="upper-bench-trigger" onClick={(event) => { event.stopPropagation(); setNikumanOpen(true); }} aria-label="イルカ水槽近くのベンチを調べる" />
      {/* 隠しコマンド用: クラゲ水槽に張り付いて見ている来館者。通常は無反応。 */}
      <button type="button" className="secret-visitor" aria-hidden="true" tabIndex={-1} onClick={() => registerCombo("jelly-watcher")} />
      <p className="map-guide"><i /><span>気になるところをクリックしてね</span></p>
      <nav className="map-spots" aria-label="水族館ポートフォリオの展示一覧">
        {spots.map((spot) => <a key={spot.id} className={`map-hotspot ${spot.className}${armedSpot === spot.id ? " is-active" : ""}`} href={spot.href} aria-label={`${spot.label}を開く`} onClick={(event) => openSpot(event, spot)}><span className="spot-label"><b>{spot.label}</b><i>▼</i></span></a>)}
      </nav>
    </section>
    {loadingSpot && <div className={`exhibit-loader exhibit-loader-${loadingSpot}`} role="status" aria-label="開園準備中">
      <div className="exhibit-loader-scene">
        {loadingSpot === "ticket" && <i className="loader-clerk" />}
        {loadingSpot === "jelly" && <i className="loader-jelly" />}
        {loadingSpot === "works" && <span className="loader-main-tank"><i /><i /><i /><b /><b /><b /></span>}
        {loadingSpot === "skills" && <i className="loader-dolphin" />}
        {loadingSpot === "career" && <i className="loader-coelacanth" />}
        <button className="exhibit-loader-close works-window-close" type="button" onClick={cancelLoading} aria-label="開園準備をキャンセル" />
      </div>
      <div className="exhibit-loader-copy"><img src="/works-text/loading-open.png" alt="開園準備中" /><span><img src="/works-text/loading-dot.png" alt="・" /><img src="/works-text/loading-dot.png" alt="・" /><img src="/works-text/loading-dot.png" alt="・" /></span></div>
    </div>}
    {floorOpen && <div className="map-floor-modal" role="dialog" aria-modal="true" aria-label={floorOpen === "about" ? "館長あいさつ" : floorOpen === "kurage" ? "ふれあいコーナー" : floorOpen === "works" ? "実績・作品" : floorOpen === "skills" ? "スキル" : "経歴"}><iframe src={floorOpen === "kurage" ? "/kurage-game.html?modal=1" : `/${floorOpen}?modal=1`} title={floorOpen === "about" ? "館長あいさつ" : floorOpen === "kurage" ? "ふれあいコーナー" : floorOpen === "works" ? "実績・作品" : floorOpen === "skills" ? "スキル" : "経歴"} /></div>}
    {secretOpen && <div className="secret-reveal" role="dialog" aria-modal="true" aria-label="伝説のきょだいまんぼう" onClick={() => setSecretOpen(false)}>
      <div className="secret-card" onClick={(event) => event.stopPropagation()}>
        <button className="works-window-close secret-close" type="button" onClick={() => setSecretOpen(false)} aria-label="閉じる" />
        <div className="secret-dialogue-window"><img className="secret-caption" src="/works-text/secret-manbou-caption.png" alt="でんせつの まんぼう を みつけた！" /><i aria-hidden="true">▼</i></div>
        <div className="secret-fish">
          <span className="secret-glow" aria-hidden="true" />
          <span className="secret-hearts" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
          <img src="/secret-manbou-v3.png" alt="王冠をかぶった伝説のきょだいまんぼう" />
        </div>
        <img className="secret-name" src="/works-text/secret-manbou-name-v2.png" alt="伝説のきょだいまんぼう" />
      </div>
    </div>}
    {scrollOpen && <div className="scroll-reveal" role="dialog" aria-modal="true" aria-label="古い巻物" onClick={() => setScrollOpen(false)}>
      <section className="scroll-event-window" onClick={(event) => event.stopPropagation()}>
        <button className="works-window-close scroll-event-close" type="button" onClick={() => setScrollOpen(false)} aria-label="古い巻物を閉じる" />
        <img className="scroll-art" src="/secret-scroll-v1.png" alt="縦書きのような模様が描かれた古い横向きの巻物" />
        <div className="scroll-dialogue" role="button" tabIndex={0} aria-label="クリックして巻物の文章を進める" onClick={advanceScrollDialogue} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") advanceScrollDialogue(); }}>
          {scrollTyped[0] && <p>{scrollTyped[0]}</p>}
          {scrollTyped[1] && <p>{scrollTyped[1]}</p>}
          <ol>
            {scrollTyped.slice(2).map((line, index) => line ? <li key={index}>{line}</li> : null)}
          </ol>
          {scrollLineComplete && <i aria-hidden="true">▼</i>}
        </div>
      </section>
    </div>}
    {coinOpen && <div className="scroll-reveal" role="dialog" aria-modal="true" aria-label="5円玉を発見" onClick={() => setCoinOpen(false)}>
      <section className="coin-event-window" onClick={(event) => event.stopPropagation()}>
        <button className="works-window-close coin-event-close" type="button" onClick={() => setCoinOpen(false)} aria-label="5円玉の発見画面を閉じる" />
        <div className="coin-fanfare" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <img className="coin-hand-art" src="/five-yen-hand-v3.png" alt="右手で5円玉を持つ手" />
        <div className="coin-dialogue"><p>5円玉みっけ！</p><i aria-hidden="true">▼</i></div>
      </section>
    </div>}
    {nikumanOpen && <div className="scroll-reveal" role="dialog" aria-modal="true" aria-label="肉まんを発見" onClick={() => setNikumanOpen(false)}>
      <section className="coin-event-window" onClick={(event) => event.stopPropagation()}>
        <button className="works-window-close coin-event-close" type="button" onClick={() => setNikumanOpen(false)} aria-label="肉まんの発見画面を閉じる" />
        <div className="coin-fanfare" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <img className="coin-hand-art nikuman-hand-art" src="/nikuman-plate-v4.png" alt="剥離紙を敷いた中華皿に載ったほかほかの肉まん" />
        <div className="coin-dialogue nikuman-dialogue"><p>こんなところにおいしそうな肉まん。<br />ほかほかだ。</p><i aria-hidden="true">▼</i></div>
      </section>
    </div>}
    {intro && <div className="intro-screen" role="button" tabIndex={0} aria-label="水族館ポートフォリオへ入る" onClick={() => setIntro(false)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setIntro(false); }}><span className="intro-bubbles" aria-hidden="true"><i /><i /><i /><i /><i /></span><span className="intro-logo"><img src="/koyomirium-logo.png" alt="KOYOMI RIUM PORTFOLIO" /><span className="intro-skip"><img src="/works-text/intro-skip.png" alt="CLICK TO ENTER" /></span></span></div>}
  </main>;
}
