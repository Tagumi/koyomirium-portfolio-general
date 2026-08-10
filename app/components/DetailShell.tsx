import Link from "next/link";
import type { ReactNode } from "react";

export function DetailShell({ kicker, title, accent, lead, children }: { kicker: string; title: string; accent: string; lead: string; children: ReactNode }) {
  return <main className="detail-page">
    <nav className="detail-nav"><Link className="back-link" href="/?skipIntro=1">← AQUARIUM MAP</Link><span>KOYOMIRIUM · PORTFOLIO</span></nav>
    <header className="detail-hero"><div><p className="detail-kicker">{kicker}</p><h1>{title}<span>{accent}</span></h1></div><p className="detail-lead">{lead}</p></header>
    {children}
  </main>;
}
