"use client";
import { useState, useEffect, useCallback } from "react";
import type { Flashcard } from "@/lib/types";
import { buildQuizOptions } from "@/lib/flashcards";
import { loadProgress, saveProgress, recordQuizResult, addXP, earnBadge } from "@/lib/storage";
import { CATEGORY_ICONS } from "@/lib/types";
import DifficultyBadge from "./DifficultyBadge";

interface Props { cards: Flashcard[]; allCards: Flashcard[]; category: string; }

export default function QuizDeck({ cards, allCards, category }: Props) {
  const [index, setIndex]       = useState(0);
  const [options, setOptions]   = useState(() => buildQuizOptions(cards[0], allCards));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore]       = useState({ correct: 0, total: 0 });
  const [done, setDone]         = useState(false);
  const [xpToast, setXpToast]  = useState<string | null>(null);

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
    const catCards = allCards.filter((c) => c.category === card.category);
    const catResults = catCards.map((c) => p.quizResults[c.id]).filter(Boolean);
    const totalAtt  = catResults.reduce((s, r) => s + r.attempts, 0);
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
      <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "60px 0", maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "60px" }}>{accuracy >= 80 ? "🏆" : accuracy >= 60 ? "✅" : "📖"}</div>
        <h2 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "28px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", margin: 0 }}>
          Quiz Complete
        </h2>
        <div style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "56px", fontWeight: 800, color: "#F36E22", lineHeight: 1 }}>
          {accuracy}%
        </div>
        <p style={{ color: "#6B7280", margin: 0 }}>{score.correct} correct out of {score.total} questions</p>

        {isWeak && (
          <div style={{ width: "100%", padding: "16px 20px", background: "#FFF7F3", borderLeft: "4px solid #F36E22", borderRadius: "0 12px 12px 0", textAlign: "left" }}>
            <p style={{ fontWeight: 600, color: "#F36E22", fontSize: "14px", margin: "0 0 4px 0" }}>Weak Area Detected</p>
            <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>Your accuracy in <strong style={{ color: "#111827" }}>{category}</strong> is below 60%. Consider reviewing the flashcards before trying again.</p>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={() => { setIndex(0); setScore({ correct: 0, total: 0 }); setDone(false); setSelected(null); setOptions(buildQuizOptions(cards[0], allCards)); }}
            style={{ padding: "10px 20px", background: "#fff", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 600, borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
            Try Again
          </button>
          <a
            href={`/study/${encodeURIComponent(category === "all" ? "all" : category)}`}
            style={{ padding: "10px 20px", background: "#F36E22", color: "#fff", fontWeight: 600, borderRadius: "8px", textDecoration: "none", fontSize: "14px" }}>
            Study Flashcards
          </a>
        </div>
      </div>
    );
  }

  const labels = ["A", "B", "C"];
  const progress = Math.round((index / cards.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "640px", margin: "0 auto" }}>

      {/* Score + progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px" }}>
        <span style={{ color: "#6B7280" }}>{index + 1} / {cards.length}</span>
        <span style={{ color: "#F36E22", fontWeight: 600 }}>{score.correct} correct · {accuracy}%</span>
      </div>
      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#F36E22", borderRadius: "999px", width: `${progress}%`, transition: "width 0.5s ease" }} />
      </div>

      {/* Term card */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ fontSize: "12px", color: "#6B7280", background: "#F3F4F6", padding: "4px 12px", borderRadius: "999px" }}>
            {CATEGORY_ICONS[card.category] ?? "📌"} {card.category}
          </span>
          <DifficultyBadge difficulty={card.difficulty} />
        </div>
        <p style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "26px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", color: "#111827", margin: "0 0 12px 0" }}>
          {card.term}
        </p>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Which definition is correct?</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const isCorrect  = opt.isCorrect;
          const revealed   = !!selected;

          let bg = "#fff";
          let borderColor = "#E5E7EB";
          let textColor = "#374151";
          let labelBg = "#F3F4F6";
          let labelColor = "#6B7280";

          if (revealed && isCorrect) {
            bg = "#F0FDF4"; borderColor = "#16A34A"; labelBg = "#16A34A"; labelColor = "#fff";
          } else if (revealed && isSelected && !isCorrect) {
            bg = "#FEF2F2"; borderColor = "#DC2626"; labelBg = "#DC2626"; labelColor = "#fff";
          } else if (revealed && !isSelected && !isCorrect) {
            bg = "#F9FAFB"; borderColor = "#E5E7EB"; textColor = "#9CA3AF"; labelColor = "#9CA3AF";
          }

          return (
            <button
              key={opt.id}
              onClick={() => answer(opt.id)}
              disabled={!!selected}
              style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${borderColor}`, background: bg, textAlign: "left", cursor: selected ? "default" : "pointer", transition: "all 0.15s" }}>
              <span style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, background: labelBg, color: labelColor }}>
                {labels[i]}
              </span>
              <span style={{ fontSize: "14px", lineHeight: "1.6", paddingTop: "3px", color: textColor, flex: 1 }}>{opt.text}</span>
              {revealed && isCorrect  && <span style={{ marginLeft: "auto", flexShrink: 0, color: "#16A34A", fontWeight: 700 }}>✓</span>}
              {revealed && isSelected && !isCorrect && <span style={{ marginLeft: "auto", flexShrink: 0, color: "#DC2626", fontWeight: 700 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {selected && (
        <button
          onClick={next}
          className="animate-slide-up"
          style={{ width: "100%", padding: "14px", background: "#F36E22", border: "none", color: "#fff", fontWeight: 600, borderRadius: "12px", cursor: "pointer", fontSize: "15px" }}>
          {index + 1 < cards.length ? "Next Question →" : "See Results →"}
        </button>
      )}

      {!selected && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF" }}>
          Press{" "}
          {["A", "B", "C"].map((k) => (
            <kbd key={k} style={{ padding: "2px 6px", background: "#F3F4F6", borderRadius: "4px", border: "1px solid #E5E7EB", color: "#6B7280", fontFamily: "monospace", margin: "0 2px" }}>{k}</kbd>
          ))}{" "}
          to answer
        </p>
      )}

      {xpToast && (
        <div className="animate-xp" style={{ position: "fixed", top: "80px", right: "24px", background: "#F36E22", color: "#fff", fontWeight: 700, padding: "8px 18px", borderRadius: "999px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontSize: "14px", pointerEvents: "none", zIndex: 50 }}>
          {xpToast} 🔥
        </div>
      )}
    </div>
  );
}
