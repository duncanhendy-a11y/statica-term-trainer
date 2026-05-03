"use client";
import { useState, useEffect, useRef } from "react";
import type { Flashcard } from "@/lib/types";
import { loadProgress, saveProgress, markKnown, addXP } from "@/lib/storage";
import DifficultyBadge from "./DifficultyBadge";
import { CATEGORY_ICONS } from "@/lib/types";

interface Props { cards: Flashcard[]; category: string; }

export default function FlashcardDeck({ cards, category }: Props) {
  const [queue, setQueue]     = useState<Flashcard[]>([...cards]);
  const [total]               = useState(cards.length);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone]       = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const card = queue[0];

  const showXP = (msg: string) => {
    setXpToast(msg);
    setTimeout(() => setXpToast(null), 2200);
  };

  // advance closes over the current queue on every render.
  // We store it in a ref so the keyboard handler (registered once) always
  // calls the latest version without needing to re-register.
  function advance(knew: boolean) {
    if (!card) return;
    if (knew) {
      const p = loadProgress();
      saveProgress(addXP(markKnown(p, card.id), 10));
      showXP("+10 XP");
    }
    setTimeout(() => {
      setFlipped(false);
      // Build the new queue directly from the current queue value (no stale closure)
      const newQueue = knew
        ? queue.slice(1)               // Got It  → remove card from front
        : [...queue.slice(1), queue[0]]; // Review  → move card to back
      setQueue(newQueue);
      if (knew && newQueue.length === 0) setDone(true);
    }, 180);
  }

  const advanceRef = useRef(advance);
  advanceRef.current = advance; // always up-to-date

  // Register keyboard handler once; use the ref so it sees the latest advance
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.key === "ArrowRight") advanceRef.current(true);
      if (e.key === "ArrowLeft")  advanceRef.current(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "80px 0" }} className="animate-slide-up">
      <div style={{ fontSize: "64px" }}>✅</div>
      <h2 style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "28px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#111827", margin: 0 }}>
        Deck Complete
      </h2>
      <p style={{ color: "#6B7280", margin: 0 }}>You reviewed all {total} cards in this deck.</p>
      <button
        onClick={() => { setQueue([...cards]); setDone(false); setFlipped(false); }}
        style={{ marginTop: "8px", padding: "10px 28px", background: "#F36E22", color: "#fff", fontWeight: 600, borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px" }}>
        Start Again
      </button>
    </div>
  );

  if (!card) return null;

  const known    = total - queue.length;
  const progress = Math.round((known / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%", maxWidth: "640px", margin: "0 auto" }}>

      {/* Progress bar */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B7280", marginBottom: "6px" }}>
          <span>{known} of {total} known · {queue.length} remaining</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#F36E22", borderRadius: "999px", width: `${progress}%`, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Card flip */}
      <div className="card-scene" style={{ width: "100%", height: "340px" }} onClick={() => setFlipped((f) => !f)}>
        <div className={`card-inner ${flipped ? "flipped" : ""}`}>

          {/* Front */}
          <div className="card-face" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "auto" }}>
              <span style={{ fontSize: "12px", color: "#6B7280", background: "#F3F4F6", padding: "4px 12px", borderRadius: "999px" }}>
                {CATEGORY_ICONS[card.category] ?? "📌"} {card.category}
              </span>
              <DifficultyBadge difficulty={card.difficulty} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "20px 0" }}>
              <p style={{ fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)", fontSize: "32px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", color: "#111827", margin: 0 }}>
                {card.term}
              </p>
            </div>
            <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", marginTop: "auto" }}>
              Click or press <kbd style={{ padding: "2px 6px", background: "#F3F4F6", borderRadius: "4px", border: "1px solid #E5E7EB", color: "#6B7280", fontFamily: "monospace" }}>Space</kbd> to reveal
            </p>
          </div>

          {/* Back */}
          <div className="card-face card-face-back" style={{ background: "#FFFBF7", border: "2px solid #F36E22", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", boxShadow: "0 4px 24px rgba(243,110,34,0.1)", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#F36E22", fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)" }}>
                {card.term}
              </span>
              <DifficultyBadge difficulty={card.difficulty} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#1F2937", fontSize: "15px", lineHeight: "1.7", textAlign: "center", margin: 0 }}>
                {card.definition}
              </p>
            </div>
            <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", marginTop: "auto" }}>
              <kbd style={{ padding: "2px 6px", background: "#F3F4F6", borderRadius: "4px", border: "1px solid #E5E7EB", color: "#6B7280", fontFamily: "monospace" }}>→</kbd> Got It &nbsp;·&nbsp;
              <kbd style={{ padding: "2px 6px", background: "#F3F4F6", borderRadius: "4px", border: "1px solid #E5E7EB", color: "#6B7280", fontFamily: "monospace" }}>←</kbd> Review Again
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
        <button
          onClick={() => advance(false)}
          style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#fff", border: "1px solid #E5E7EB", color: "#6B7280", fontWeight: 500, cursor: "pointer", fontSize: "14px", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = "#F3F4F6"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = "#fff"; }}>
          ← Review Again
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 500, cursor: "pointer", fontSize: "14px", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = "#E5E7EB"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = "#F3F4F6"; }}>
          Flip Card
        </button>
        <button
          onClick={() => advance(true)}
          style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#F36E22", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "14px", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = "#C45A18"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = "#F36E22"; }}>
          Got It →
        </button>
      </div>

      {/* XP Toast */}
      {xpToast && (
        <div className="animate-xp" style={{ position: "fixed", top: "80px", right: "24px", background: "#F36E22", color: "#fff", fontWeight: 700, padding: "8px 18px", borderRadius: "999px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontSize: "14px", pointerEvents: "none", zIndex: 50 }}>
          {xpToast} 🔥
        </div>
      )}
    </div>
  );
}
