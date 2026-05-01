"use client";
import { useState, useEffect, useCallback } from "react";
import type { Flashcard } from "@/lib/types";
import { buildQuizOptions } from "@/lib/flashcards";
import { loadProgress, saveProgress, recordQuizResult, addXP, earnBadge } from "@/lib/storage";
import { CATEGORY_ICONS } from "@/lib/types";
import DifficultyBadge from "./DifficultyBadge";

interface Props { cards: Flashcard[]; allCards: Flashcard[]; category: string; }

export default function QuizDeck({ cards, allCards, category }: Props) {
  const [index, setIndex]     = useState(0);
  const [options, setOptions] = useState(() => buildQuizOptions(cards[0], allCards));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore]     = useState({ correct: 0, total: 0 });
  const [done, setDone]       = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const card = cards[index];

  const showXP = (msg: string) => {
    setXpToast(msg);
    setTimeout(() => setXpToast(null), 2200);
  };

  const answer = useCallback((optId: string) => {
    if (selected) return;
    const opt = options.find((o) => o.id === optId)!;
    setSelected(optId);
    const correct = opt.isCorrect;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    let p = loadProgress();
    p = recordQuizResult(p, card.id, correct);
    p = addXP(p, correct ? 20 : 0);
    if (correct) showXP("+20 XP");
    // Badge check
    const catCards = allCards.filter((c) => c.category === card.category);
    const catResults = catCards.map((c) => p.quizResults[c.id]).filter(Boolean);
    const totalAtt = catResults.reduce((s, r) => s + r.attempts, 0);
    const totalCorr = catResults.reduce((s, r) => s + r.correct, 0);
    if (totalAtt >= 5 && totalCorr / totalAtt >= 0.8) {
      p = earnBadge(p, card.category);
    }
    saveProgress(p);
  }, [selected, options, card, allCards]);

  const next = useCallback(() => {
    if (index + 1 >= cards.length) { setDone(true); return; }
    const nextCard = cards[index + 1];
    setOptions(buildQuizOptions(nextCard, allCards));
    setSelected(null);
    setIndex((i) => i + 1);
  }, [index, cards, allCards]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected && (e.key === "Enter" || e.key === "ArrowRight")) next();
      if (!selected) {
        if (e.key === "1" || e.key === "a") answer(options[0]?.id);
        if (e.key === "2" || e.key === "b") answer(options[1]?.id);
        if (e.key === "3" || e.key === "c") answer(options[2]?.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, next, answer, options]);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  if (done) {
    const isWeak = accuracy < 60;
    return (
      <div className="flex flex-col items-center gap-6 py-16 max-w-lg mx-auto animate-slide-up text-center">
        <div className="text-6xl">{accuracy >= 80 ? "🏆" : accuracy >= 60 ? "✅" : "📖"}</div>
        <h2 className="font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide">Quiz Complete</h2>
        <div className="text-5xl font-[family-name:var(--font-barlow)] font-bold text-[#F36E22]">{accuracy}%</div>
        <p className="text-[#8A8A8A]">{score.correct} correct out of {score.total} questions</p>
        {isWeak && (
          <div className="w-full p-4 bg-[#2E2E2E] border-l-4 border-[#F36E22] rounded-r-xl text-left">
            <p className="font-semibold text-[#F36E22] text-sm mb-1">Weak Area Detected</p>
            <p className="text-[#8A8A8A] text-sm">Your accuracy in <strong className="text-[#F0F0F0]">{category}</strong> is below 60%. Consider reviewing the flashcards before trying again.</p>
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <button onClick={() => { setIndex(0); setScore({ correct:0, total:0 }); setDone(false); setSelected(null); setOptions(buildQuizOptions(cards[0], allCards)); }}
            className="px-5 py-2.5 bg-[#2E2E2E] hover:bg-[#3A3A3A] border border-[#3A3A3A] text-[#F0F0F0] font-semibold rounded-lg transition-colors">
            Try Again
          </button>
          <a href={`/study/${encodeURIComponent(category === "all" ? "all" : category)}`}
            className="px-5 py-2.5 bg-[#F36E22] hover:bg-[#C45A18] text-white font-semibold rounded-lg transition-colors">
            Study Flashcards
          </a>
        </div>
      </div>
    );
  }

  const labels = ["A", "B", "C"];
  const progress = Math.round((index / cards.length) * 100);

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
      {/* Score + progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#8A8A8A]">{index + 1} / {cards.length}</span>
        <span className="text-[#F36E22] font-semibold">{score.correct} correct · {accuracy}%</span>
      </div>
      <div className="h-1.5 bg-[#2E2E2E] rounded-full overflow-hidden">
        <div className="h-full bg-[#F36E22] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Term card */}
      <div className="bg-[#242424] border border-[#3A3A3A] rounded-2xl p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-[#8A8A8A] bg-[#2E2E2E] px-3 py-1 rounded-full">
            {CATEGORY_ICONS[card.category] ?? "📌"} {card.category}
          </span>
          <DifficultyBadge difficulty={card.difficulty} />
        </div>
        <p className="font-[family-name:var(--font-barlow)] text-2xl font-bold uppercase tracking-wide text-center text-[#F0F0F0]">
          {card.term}
        </p>
        <p className="text-center text-xs text-[#555555] mt-4">Which definition is correct?</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const isCorrect  = opt.isCorrect;
          const revealed   = !!selected;
          let style = "bg-[#242424] border-[#3A3A3A] text-[#F0F0F0] hover:border-[#F36E22]";
          if (revealed && isCorrect)  style = "bg-green-900/30 border-green-600 text-[#F0F0F0]";
          if (revealed && isSelected && !isCorrect) style = "bg-red-900/30 border-red-600 text-[#F0F0F0]";
          if (revealed && !isSelected && !isCorrect) style = "bg-[#242424] border-[#2E2E2E] text-[#555555]";
          return (
            <button key={opt.id} onClick={() => answer(opt.id)} disabled={!!selected}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${style} ${!selected ? "cursor-pointer" : "cursor-default"}`}>
              <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                revealed && isCorrect  ? "bg-green-600 text-white" :
                revealed && isSelected ? "bg-red-600 text-white" :
                "bg-[#2E2E2E] text-[#8A8A8A]"
              }`}>{labels[i]}</span>
              <span className="text-sm leading-relaxed pt-0.5">{opt.text}</span>
              {revealed && isCorrect  && <span className="ml-auto shrink-0 text-green-400">✓</span>}
              {revealed && isSelected && !isCorrect && <span className="ml-auto shrink-0 text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {selected && (
        <button onClick={next}
          className="w-full py-3 bg-[#F36E22] hover:bg-[#C45A18] text-white font-semibold rounded-xl transition-colors animate-slide-up">
          {index + 1 < cards.length ? "Next Question →" : "See Results →"}
        </button>
      )}

      {!selected && (
        <p className="text-center text-xs text-[#555555]">
          Press <kbd className="px-1.5 py-0.5 bg-[#2E2E2E] rounded text-[#8A8A8A]">A</kbd>
          <kbd className="px-1.5 py-0.5 bg-[#2E2E2E] rounded text-[#8A8A8A] mx-1">B</kbd>
          <kbd className="px-1.5 py-0.5 bg-[#2E2E2E] rounded text-[#8A8A8A]">C</kbd> to answer
        </p>
      )}

      {xpToast && (
        <div className="fixed top-20 right-6 animate-xp bg-[#F36E22] text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm pointer-events-none z-50">
          {xpToast} 🔥
        </div>
      )}
    </div>
  );
}
