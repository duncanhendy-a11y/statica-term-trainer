"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { loadFlashcards, filterCards } from "@/lib/flashcards";
import NavLogo from "@/components/NavLogo";
import type { Flashcard } from "@/lib/types";
import QuizDeck from "@/components/QuizDeck";

export default function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const decoded = decodeURIComponent(category);
  const [all, setAll]       = useState<Flashcard[]>([]);
  const [cards, setCards]   = useState<Flashcard[]>([]);
  const [diff, setDiff]     = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFlashcards().then((c) => {
      setAll(c);
      let filtered = filterCards(c, decoded === "all" ? null : decoded, null);
      filtered = [...filtered].sort(() => Math.random() - 0.5);
      setCards(filtered);
      setLoaded(true);
    });
  }, [decoded]);

  const display = diff === "all" ? cards : cards.filter((c) => c.difficulty === diff);
  const title   = decoded === "all" ? "All Cards" : decoded;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#111827" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", gap: "12px" }}>
          <NavLogo />
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          <Link href="/" style={{ fontSize: "13px", color: "#9CA3AF", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize: "13px", color: "#F36E22", fontWeight: 500 }}>🧠 {title}</span>
        </div>
      </nav>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "30px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", margin: 0 }}>
            Quiz · {title}
          </h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              style={{ fontSize: "12px", background: "#fff", border: "1px solid #E5E7EB", color: "#374151", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", outline: "none" }}>
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Link
              href={`/study/${encodeURIComponent(category)}`}
              style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
              ← Flashcards
            </Link>
          </div>
        </div>

        {loaded && display.length > 0 ? (
          <QuizDeck key={`${decoded}-${diff}`} cards={display} allCards={all} category={decoded} />
        ) : loaded ? (
          <p style={{ textAlign: "center", color: "#6B7280", padding: "80px 0" }}>No cards match this filter.</p>
        ) : (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: "80px 0" }}>Loading…</p>
        )}
      </main>
    </div>
  );
}
