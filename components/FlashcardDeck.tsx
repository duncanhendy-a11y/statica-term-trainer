"use client";
import { useState, useEffect, useCallback } from "react";
import type { Flashcard } from "@/lib/types";
import { loadProgress, saveProgress, markKnown, addXP } from "@/lib/storage";
import DifficultyBadge from "./DifficultyBadge";
import { CATEGORY_ICONS } from "@/lib/types";

interface Props { cards: Flashcard[]; category: string; }

export default function FlashcardDeck({ cards, category }: Props) {
  const [index, setIndex]     = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone]       = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [direction, setDirection] = useState<"left"|"right"|null>(null);

  const card = cards[index];

  const showXP = (msg: string) => {
    setXpToast(msg);
    setTimeout(() => setXpToast(null), 2200);
  };

  const advance = useCallback((knew: boolean) => {
    if (!card) return;
    if (knew) {
      const p = loadProgress();
      saveProgress(addXP(markKnown(p, card.id), 10));
      showXP("+10 XP");
    }
    setDirection(knew ? "right" : "left");
    setTimeout(() => {
      setFlipped(false);
      setDirection(null);
      if (index + 1 >= cards.length) setDone(true);
      else setIndex((i) => i + 1);
    }, 250);
  }, [card, index, cards.length]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.key === "ArrowRight") advance(true);
      if (e.key === "ArrowLeft")  advance(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance]);

  if (done) return (
    <div className="flex flex-col items-center gap-6 py-20 animate-slide-up">
      <div className="text-6xl">✅</div>
      <h2 className="font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide">Deck Complete</h2>
      <p className="text-[#8A8A8A]">You reviewed all {cards.length} cards in this deck.</p>
      <button onClick={() => { setIndex(0); setDone(false); setFlipped(false); }}
        className="mt-2 px-6 py-2.5 bg-[#F36E22] hover:bg-[#C45A18] text-white font-semibold rounded-lg transition-colors">
        Start Again
      </button>
    </div>
  );

  if (!card) return null;

  const progress = Math.round(((index) / cards.length) * 100);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-[#8A8A8A] mb-1.5">
          <span>{index + 1} of {cards.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-[#2E2E2E] rounded-full overflow-hidden">
          <div className="h-full bg-[#F36E22] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="card-scene w-full" style={{ height: "360px" }}>
        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-face bg-[#242424] rounded-2xl border border-[#3A3A3A] p-8 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-auto">
              <span className="text-xs text-[#8A8A8A] bg-[#2E2E2E] px-3 py-1 rounded-full">
                {CATEGORY_ICONS[card.category] ?? "📌"} {card.category}
              </span>
              <DifficultyBadge difficulty={card.difficulty} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
              <p className="font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide text-center text-[#F0F0F0]">
                {card.term}
              </p>
            </div>
            <p className="text-center text-xs text-[#555555] mt-auto">
              Press <kbd className="px-1.5 py-0.5 bg-[#2E2E2E] rounded text-[#8A8A8A]">Space</kbd> or click to reveal definition
            </p>
          </div>

          {/* Back */}
          <div className="card-face card-face-back bg-[#2E2E2E] rounded-2xl border border-[#F36E22]/30 p-8 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-[family-name:var(--font-barlow)] font-semibold uppercase tracking-wider text-[#F36E22]">
                {card.term}
              </span>
              <DifficultyBadge difficulty={card.difficulty} />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#F0F0F0] text-base leading-relaxed text-center">
                {card.definition}
              </p>
            </div>
            <p className="text-center text-xs text-[#555555] mt-auto">
              Press <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] rounded text-[#8A8A8A]">→</kbd> Got It &nbsp;·&nbsp;
              <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] rounded text-[#8A8A8A]">←</kbd> Review Again
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 w-full">
        <button onClick={() => advance(false)}
          className="flex-1 py-3 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#3A3A3A] text-[#8A8A8A] hover:text-[#F0F0F0] font-medium transition-all">
          ← Review Again
        </button>
        <button onClick={() => setFlipped((f) => !f)}
          className="flex-1 py-3 rounded-xl bg-[#2E2E2E] hover:bg-[#3A3A3A] border border-[#3A3A3A] text-[#F0F0F0] font-medium transition-all">
          Flip
        </button>
        <button onClick={() => advance(true)}
          className="flex-1 py-3 rounded-xl bg-[#F36E22] hover:bg-[#C45A18] text-white font-semibold transition-all">
          Got It →
        </button>
      </div>

      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-20 right-6 animate-xp bg-[#F36E22] text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm pointer-events-none z-50">
          {xpToast} 🔥
        </div>
      )}
    </div>
  );
}
