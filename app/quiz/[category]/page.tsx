"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadFlashcards, filterCards } from "@/lib/flashcards";
import type { Flashcard } from "@/lib/types";
import QuizDeck from "@/components/QuizDeck";

export default function QuizPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const decoded = decodeURIComponent(category);
  const [all, setAll]    = useState<Flashcard[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [diff, setDiff]   = useState("all");
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
  const title = decoded === "all" ? "All Cards" : decoded;

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <nav className="sticky top-0 z-50 border-b border-[#2E2E2E] bg-[#1A1A1A]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-4">
          <Link href="/"><Image src="/logo.svg" alt="IDEA StatiCa" width={130} height={16} /></Link>
          <span className="text-[#3A3A3A]">/</span>
          <Link href="/" className="text-sm text-[#8A8A8A] hover:text-[#F0F0F0]">Home</Link>
          <span className="text-[#3A3A3A]">/</span>
          <span className="text-sm text-[#F36E22] font-medium truncate max-w-48">🧠 {title}</span>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide text-[#F0F0F0]">
            Quiz · {title}
          </h1>
          <div className="flex gap-2">
            <select value={diff} onChange={(e) => setDiff(e.target.value)}
              className="text-xs bg-[#2E2E2E] border border-[#3A3A3A] text-[#8A8A8A] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#F36E22]">
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Link href={`/study/${encodeURIComponent(category)}`}
              className="text-xs px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3A3A3A] border border-[#3A3A3A] text-[#8A8A8A] rounded-lg transition-all">
              ← Flashcards
            </Link>
          </div>
        </div>

        {loaded && display.length > 0
          ? <QuizDeck key={`${decoded}-${diff}`} cards={display} allCards={all} category={decoded} />
          : loaded
          ? <p className="text-center text-[#8A8A8A] py-20">No cards match this filter.</p>
          : <p className="text-center text-[#555555] py-20">Loading…</p>
        }
      </main>
    </div>
  );
}
