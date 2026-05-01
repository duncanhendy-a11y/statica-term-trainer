"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadFlashcards, filterCards } from "@/lib/flashcards";
import type { Flashcard } from "@/lib/types";
import FlashcardDeck from "@/components/FlashcardDeck";

export default function StudyPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const decoded = decodeURIComponent(category);
  const [cards, setCards]     = useState<Flashcard[]>([]);
  const [diff, setDiff]       = useState("all");
  const [shuffle, setShuffle] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    loadFlashcards().then((c) => {
      let filtered = filterCards(c, decoded === "all" ? null : decoded, null);
      if (shuffle) filtered = [...filtered].sort(() => Math.random() - 0.5);
      setCards(filtered);
      setLoaded(true);
    });
  }, [decoded, shuffle]);

  const display = diff === "all" ? cards : cards.filter((c) => c.difficulty === diff);
  const title   = decoded === "all" ? "All Cards" : decoded;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #E5E7EB", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image src="/logo.svg" alt="IDEA StatiCa" width={130} height={16} />
          </Link>
          <span style={{ color: "#D1D5DB" }}>/</span>
          <Link href="/" style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "#D1D5DB" }}>/</span>
          <span style={{ fontSize: "13px", color: "#F36E22", fontWeight: 500 }}>📚 {title}</span>
        </div>
      </nav>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "30px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", margin: 0 }}>
            {title}
          </h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              style={{ fontSize: "12px", background: "#fff", border: "1px solid #E5E7EB", color: "#374151", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", outline: "none" }}>
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button
              onClick={() => setShuffle((s) => !s)}
              style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: `1px solid ${shuffle ? "#F36E22" : "#E5E7EB"}`, background: shuffle ? "#FFF7F3" : "#fff", color: shuffle ? "#F36E22" : "#6B7280", cursor: "pointer", fontWeight: 500 }}>
              🔀 Shuffle
            </button>
            <Link
              href={`/quiz/${encodeURIComponent(category)}`}
              style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #F36E22", background: "#FFF7F3", color: "#F36E22", textDecoration: "none", fontWeight: 500 }}>
              Switch to Quiz →
            </Link>
          </div>
        </div>

        {loaded && display.length > 0 ? (
          <FlashcardDeck key={`${decoded}-${diff}-${shuffle}`} cards={display} category={decoded} />
        ) : loaded ? (
          <p style={{ textAlign: "center", color: "#6B7280", padding: "80px 0" }}>No cards match this filter.</p>
        ) : (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: "80px 0" }}>Loading…</p>
        )}
      </main>
    </div>
  );
}
