"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadFlashcards, getCategories, getCategoryStats, getCurrentLevel } from "@/lib/flashcards";
import { loadProgress } from "@/lib/storage";
import { CATEGORY_ICONS } from "@/lib/types";
import type { Flashcard, CategoryStats, Progress } from "@/lib/types";

export default function Home() {
  const [cards, setCards]       = useState<Flashcard[]>([]);
  const [cats, setCats]         = useState<string[]>([]);
  const [stats, setStats]       = useState<CategoryStats[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [gamification, setGamification] = useState(true);

  useEffect(() => {
    loadFlashcards().then((c) => {
      setCards(c);
      setCats(getCategories(c));
      const p = loadProgress();
      setProgress(p);
      setStats(getCategoryStats(c, p));
    });
  }, []);

  const level      = progress ? getCurrentLevel(progress.xp) : null;
  const totalKnown = progress?.knownIds.length ?? 0;
  const overallPct = cards.length > 0 ? Math.round((totalKnown / cards.length) * 100) : 0;
  const weakAreas  = stats.filter((s) => s.quizAttempts >= 3 && s.accuracy < 60);

  return (
    <div style={{ backgroundColor: "#F7F8FA", minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/">
            <Image src="/logo-dark.svg" alt="IDEA StatiCa" width={150} height={19} priority
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo.svg"; }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setGamification((g) => !g)}
              style={{
                fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 20,
                border: gamification ? "1.5px solid #F36E22" : "1.5px solid #D1D5DB",
                background: gamification ? "#FFF5EE" : "#F9FAFB",
                color: gamification ? "#F36E22" : "#6B7280",
                cursor: "pointer", transition: "all 0.15s",
              }}>
              {gamification ? "🏆 Gamification ON" : "Gamification OFF"}
            </button>
            <Link href="/progress"
              style={{ fontSize: 14, color: "#6B7280", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 500 }}>
              Progress
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* HERO */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-heading" style={{ fontSize: 48, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", color: "#111827", lineHeight: 1.1, marginBottom: 8 }}>
            Structural Term <span style={{ color: "#F36E22" }}>Trainer</span>
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", maxWidth: 520 }}>
            {cards.length} terms across {cats.length} categories. Master structural engineering vocabulary.
          </p>
        </div>

        {/* GAMIFICATION ROW */}
        {gamification && level && progress && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {/* Level */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 4 }}>Level</p>
              <p className="font-heading" style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase", color: "#F36E22", marginBottom: 10 }}>{level.name}</p>
              <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", background: "#F36E22", borderRadius: 3, width: `${level.progress}%`, transition: "width 0.7s" }} />
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>{progress.xp} XP{level.next ? ` · ${level.next.minXP - progress.xp} to ${level.next.name}` : " · Max level"}</p>
            </div>
            {/* Cards Known */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 4 }}>Cards Known</p>
              <p className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 10 }}>
                {totalKnown} <span style={{ fontSize: 18, color: "#9CA3AF" }}>/ {cards.length}</span>
              </p>
              <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", background: "#16A34A", borderRadius: 3, width: `${overallPct}%`, transition: "width 0.7s" }} />
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>{overallPct}% of total glossary</p>
            </div>
            {/* Badges */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 8 }}>Badges</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {cats.map((cat) => (
                  <span key={cat} title={cat}
                    style={{ fontSize: 20, opacity: progress.badgesEarned.includes(cat) ? 1 : 0.2, transition: "opacity 0.3s" }}>
                    {CATEGORY_ICONS[cat] ?? "🏅"}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>{progress.badgesEarned.length} / {cats.length} mastered</p>
            </div>
          </div>
        )}

        {/* WEAK AREA BANNER */}
        {gamification && weakAreas.length > 0 && (
          <div style={{ background: "#FFFBF5", border: "1px solid #FED7AA", borderLeft: "4px solid #F36E22", borderRadius: "0 10px 10px 0", padding: "14px 20px", marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#F36E22", marginBottom: 8 }}>📉 Weak areas — needs revision</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {weakAreas.map((s) => (
                <Link key={s.category} href={`/study/${encodeURIComponent(s.category)}`}
                  style={{ fontSize: 12, padding: "4px 12px", background: "#FFF5EE", border: "1px solid #FED7AA", borderRadius: 20, color: "#F36E22", textDecoration: "none", fontWeight: 600 }}>
                  {CATEGORY_ICONS[s.category]} {s.category} ({s.accuracy}%)
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* QUICK START */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 36 }}>
          {[
            { href: "/study/all", icon: "📚", label: "Flashcards — All", sub: `${cards.length} cards` },
            { href: "/quiz/all",  icon: "🧠", label: "Quiz — All",       sub: "3-option multiple choice" },
            { href: "/study/all", icon: "🔀", label: "Random Shuffle",   sub: "Mixed categories" },
          ].map((cta) => (
            <Link key={cta.label} href={cta.href}
              style={{
                display: "flex", flexDirection: "column", gap: 4,
                padding: "16px 20px", background: "#FFFFFF",
                border: "1px solid #E5E7EB", borderRadius: 10,
                textDecoration: "none", transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#F36E22"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(243,110,34,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}>
              <span className="font-heading" style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: "#111827" }}>
                {cta.icon} {cta.label}
              </span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{cta.sub}</span>
            </Link>
          ))}
        </div>

        {/* CATEGORY GRID */}
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280", marginBottom: 16 }}>
          Browse by Category
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {cats.map((cat) => {
            const s         = stats.find((x) => x.category === cat);
            const knownPct  = s && s.total > 0 ? (s.knownCount / s.total) * 100 : 0;
            const isWeak    = s && s.quizAttempts >= 3 && s.accuracy < 60;
            const hasBadge  = progress?.badgesEarned.includes(cat);
            return (
              <div key={cat}
                style={{
                  background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12,
                  padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "all 0.15s",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[cat] ?? "📌"}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {isWeak && <span style={{ fontSize: 10, background: "#FFF5EE", color: "#F36E22", border: "1px solid #FED7AA", padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>Needs work</span>}
                    {hasBadge && <span title="Badge earned" style={{ fontSize: 14 }}>🏅</span>}
                  </div>
                </div>
                <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: "#111827", marginBottom: 4 }}>{cat}</h3>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10 }}>{s?.total ?? 0} terms</p>
                <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#16A34A", width: `${knownPct}%`, borderRadius: 2, transition: "width 0.5s" }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Link href={`/study/${encodeURIComponent(cat)}`}
                    style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, padding: "6px 0", background: "#F7F8FA", border: "1px solid #E5E7EB", borderRadius: 6, color: "#374151", textDecoration: "none" }}>
                    📚 Study
                  </Link>
                  <Link href={`/quiz/${encodeURIComponent(cat)}`}
                    style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, padding: "6px 0", background: "#FFF5EE", border: "1px solid #FED7AA", borderRadius: 6, color: "#F36E22", textDecoration: "none" }}>
                    🧠 Quiz
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ marginTop: 60, borderTop: "1px solid #E5E7EB", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Image src="/logo.svg" alt="IDEA StatiCa" width={110} height={14} />
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>Structural Term Trainer · {cards.length} terms</p>
        </div>
      </footer>
    </div>
  );
}
