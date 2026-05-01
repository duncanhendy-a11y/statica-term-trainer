"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { loadFlashcards, getCategoryStats, getCurrentLevel } from "@/lib/flashcards";
import NavLogo from "@/components/NavLogo";
import { loadProgress, resetProgress } from "@/lib/storage";
import { CATEGORY_ICONS } from "@/lib/types";
import type { Flashcard, CategoryStats, Progress } from "@/lib/types";

export default function ProgressPage() {
  const [cards, setCards]         = useState<Flashcard[]>([]);
  const [stats, setStats]         = useState<CategoryStats[]>([]);
  const [prog, setProg]           = useState<Progress | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadFlashcards().then((c) => {
      setCards(c);
      const p = loadProgress();
      setProg(p);
      setStats(getCategoryStats(c, p));
    });
  }, []);

  const handleReset = () => {
    if (!confirming) { setConfirming(true); return; }
    const fresh = resetProgress();
    setProg(fresh);
    setStats(getCategoryStats(cards, fresh));
    setConfirming(false);
  };

  const level      = prog ? getCurrentLevel(prog.xp) : null;
  const totalKnown = prog?.knownIds.length ?? 0;
  const overallPct = cards.length > 0 ? Math.round((totalKnown / cards.length) * 100) : 0;
  const weakAreas  = stats.filter((s) => s.quizAttempts >= 3 && s.accuracy < 60);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#111827" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", gap: "12px" }}>
          <NavLogo />
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize: "13px", color: "#F36E22", fontWeight: 500 }}>📊 Progress</span>
          <Link href="/" style={{ marginLeft: "auto", fontSize: "13px", color: "#9CA3AF", textDecoration: "none" }}>← Back</Link>
        </div>
      </nav>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <h1 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "36px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111827", margin: 0 }}>
          Your Progress
        </h1>

        {/* Level + overall stats */}
        {level && prog && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>

            {/* Level card */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" }}>Current Level</p>
              <p style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#F36E22", textTransform: "uppercase", margin: "0 0 4px 0" }}>{level.name}</p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px 0" }}>{prog.xp} XP earned</p>
              <div style={{ height: "10px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden", marginBottom: "6px" }}>
                <div style={{ height: "100%", background: "#F36E22", borderRadius: "999px", width: `${level.progress}%`, transition: "width 0.7s ease" }} />
              </div>
              {level.next
                ? <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{level.next.minXP - prog.xp} XP to reach {level.next.name}</p>
                : <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>Maximum level reached 🏆</p>
              }
            </div>

            {/* Cards known */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" }}>Flashcards Known</p>
              <p style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#111827", margin: "0 0 16px 0" }}>
                {totalKnown} <span style={{ fontSize: "18px", color: "#9CA3AF", fontWeight: 400 }}>/ {cards.length}</span>
              </p>
              <div style={{ height: "10px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden", marginBottom: "6px" }}>
                <div style={{ height: "100%", background: "#16A34A", borderRadius: "999px", width: `${overallPct}%`, transition: "width 0.7s ease" }} />
              </div>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{overallPct}% of all terms</p>
            </div>
          </div>
        )}

        {/* Badges */}
        {prog && (
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", margin: "0 0 16px 0" }}>Badges</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "12px" }}>
              {stats.map((s) => {
                const earned = prog.badgesEarned.includes(s.category);
                return (
                  <div
                    key={s.category}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                      padding: "14px 8px", borderRadius: "12px", textAlign: "center",
                      background: earned ? "#FFF7F3" : "#F9FAFB",
                      border: `1px solid ${earned ? "#FDBA74" : "#E5E7EB"}`,
                      opacity: earned ? 1 : 0.5,
                      transition: "all 0.2s"
                    }}>
                    <span style={{ fontSize: "24px" }}>{CATEGORY_ICONS[s.category] ?? "🏅"}</span>
                    <span style={{ fontSize: "10px", color: "#6B7280", lineHeight: 1.3 }}>{s.category}</span>
                    {earned && <span style={{ fontSize: "10px", color: "#F36E22", fontWeight: 600 }}>Earned ✓</span>}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "12px", marginBottom: 0 }}>
              Earn a badge by scoring 80%+ accuracy in a category (minimum 5 quiz attempts).
            </p>
          </div>
        )}

        {/* Weak areas */}
        {weakAreas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "16px", borderLeft: "4px solid #F36E22", border: "1px solid #E5E7EB", borderLeftWidth: "4px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#F36E22", margin: "0 0 16px 0" }}>
              📉 Weak Areas
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {weakAreas.map((s) => (
                <div key={s.category} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "14px", color: "#374151", minWidth: "160px" }}>{CATEGORY_ICONS[s.category]} {s.category}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                    <div style={{ flex: 1, height: "6px", background: "#FEE2E2", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#DC2626", borderRadius: "999px", width: `${s.accuracy}%` }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#DC2626", width: "36px", textAlign: "right" }}>{s.accuracy}%</span>
                  </div>
                  <Link
                    href={`/study/${encodeURIComponent(s.category)}`}
                    style={{ fontSize: "12px", padding: "4px 14px", background: "#FFF7F3", border: "1px solid #FDBA74", color: "#F36E22", borderRadius: "999px", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>
                    Revise
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "20px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", margin: "0 0 20px 0" }}>Category Breakdown</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {stats.map((s) => (
              <div key={s.category}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    {CATEGORY_ICONS[s.category]} {s.category}
                  </span>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                    <span style={{ color: "#16A34A" }}>{s.knownCount}/{s.total} known</span>
                    {s.quizAttempts > 0 && (
                      <span style={{ color: s.accuracy >= 60 ? "#F36E22" : "#DC2626" }}>
                        {s.accuracy}% quiz
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", height: "6px" }}>
                  <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#16A34A", borderRadius: "999px", transition: "width 0.7s ease", width: `${s.total > 0 ? (s.knownCount / s.total) * 100 : 0}%` }} />
                  </div>
                  {s.quizAttempts > 0 && (
                    <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "999px", transition: "width 0.7s ease", background: s.accuracy >= 60 ? "#F36E22" : "#DC2626", width: `${s.accuracy}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "20px" }}>
          <button
            onClick={handleReset}
            style={{
              fontSize: "13px", padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
              border: `1px solid ${confirming ? "#DC2626" : "#E5E7EB"}`,
              background: confirming ? "#FEF2F2" : "#fff",
              color: confirming ? "#DC2626" : "#9CA3AF",
              fontWeight: confirming ? 600 : 400,
              transition: "all 0.2s"
            }}>
            {confirming ? "⚠️ Click again to confirm reset" : "Reset All Progress"}
          </button>
        </div>
      </main>
    </div>
  );
}
