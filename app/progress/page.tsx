"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadFlashcards, getCategoryStats, getCurrentLevel } from "@/lib/flashcards";
import { loadProgress, resetProgress } from "@/lib/storage";
import { CATEGORY_ICONS } from "@/lib/types";
import type { Flashcard, CategoryStats, Progress } from "@/lib/types";

export default function ProgressPage() {
  const [cards, setCards]   = useState<Flashcard[]>([]);
  const [stats, setStats]   = useState<CategoryStats[]>([]);
  const [prog, setProg]     = useState<Progress | null>(null);
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

  const level = prog ? getCurrentLevel(prog.xp) : null;
  const totalKnown = prog?.knownIds.length ?? 0;
  const overallPct = cards.length > 0 ? Math.round((totalKnown / cards.length) * 100) : 0;
  const weakAreas  = stats.filter((s) => s.quizAttempts >= 3 && s.accuracy < 60);

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <nav className="sticky top-0 z-50 border-b border-[#2E2E2E] bg-[#1A1A1A]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-4">
          <Link href="/"><Image src="/logo.svg" alt="IDEA StatiCa" width={130} height={16} /></Link>
          <span className="text-[#3A3A3A]">/</span>
          <span className="text-sm text-[#F36E22] font-medium">Progress</span>
          <Link href="/" className="ml-auto text-sm text-[#8A8A8A] hover:text-[#F0F0F0]">← Back</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-wide">
          Your Progress
        </h1>

        {/* Level + overall */}
        {level && prog && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-6">
              <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mb-1">Current Level</p>
              <p className="font-[family-name:var(--font-barlow)] text-3xl font-bold text-[#F36E22] uppercase mb-1">{level.name}</p>
              <p className="text-sm text-[#8A8A8A] mb-3">{prog.xp} XP earned</p>
              <div className="h-2.5 bg-[#2E2E2E] rounded-full overflow-hidden mb-1">
                <div className="h-full bg-[#F36E22] rounded-full transition-all duration-700"
                  style={{ width: `${level.progress}%` }} />
              </div>
              {level.next
                ? <p className="text-xs text-[#555555]">{level.next.minXP - prog.xp} XP to reach {level.next.name}</p>
                : <p className="text-xs text-green-400">Maximum level reached 🏆</p>
              }
            </div>
            <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-6">
              <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mb-1">Flashcards Known</p>
              <p className="font-[family-name:var(--font-barlow)] text-3xl font-bold text-[#F0F0F0]">{totalKnown} <span className="text-[#555555] text-xl">/ {cards.length}</span></p>
              <div className="h-2.5 bg-[#2E2E2E] rounded-full overflow-hidden mt-3 mb-1">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${overallPct}%` }} />
              </div>
              <p className="text-xs text-[#555555]">{overallPct}% of all terms</p>
            </div>
          </div>
        )}

        {/* Badges */}
        {prog && (
          <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-6">
            <h2 className="font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-wide mb-4">Badges</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stats.map((s) => {
                const earned = prog.badgesEarned.includes(s.category);
                return (
                  <div key={s.category}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                      earned ? "bg-[#F36E22]/10 border-[#F36E22]/40" : "bg-[#2E2E2E] border-[#2E2E2E] opacity-40"
                    }`}>
                    <span className="text-2xl">{CATEGORY_ICONS[s.category] ?? "🏅"}</span>
                    <span className="text-[10px] text-[#8A8A8A] leading-tight">{s.category}</span>
                    {earned && <span className="text-[10px] text-[#F36E22]">Earned ✓</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#555555] mt-3">Earn a badge by scoring 80%+ accuracy in a category (minimum 5 quiz attempts).</p>
          </div>
        )}

        {/* Weak areas */}
        {weakAreas.length > 0 && (
          <div className="bg-[#242424] rounded-2xl border-l-4 border-[#F36E22] p-6">
            <h2 className="font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-wide text-[#F36E22] mb-3">
              📉 Weak Areas
            </h2>
            <div className="space-y-3">
              {weakAreas.map((s) => (
                <div key={s.category} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#F0F0F0]">{CATEGORY_ICONS[s.category]} {s.category}</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 h-1.5 bg-[#2E2E2E] rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.accuracy}%` }} />
                    </div>
                    <span className="text-xs text-red-400 w-10 text-right">{s.accuracy}%</span>
                  </div>
                  <Link href={`/study/${encodeURIComponent(s.category)}`}
                    className="text-xs px-3 py-1 bg-[#F36E22]/10 border border-[#F36E22]/30 text-[#F36E22] rounded-full hover:bg-[#F36E22]/20 transition-all">
                    Revise
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-6">
          <h2 className="font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-wide mb-4">Category Breakdown</h2>
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#F0F0F0]">
                    {CATEGORY_ICONS[s.category]} {s.category}
                  </span>
                  <div className="flex gap-3 text-xs text-[#555555]">
                    <span className="text-green-400">{s.knownCount}/{s.total} known</span>
                    {s.quizAttempts > 0 && (
                      <span className={s.accuracy >= 60 ? "text-[#F36E22]" : "text-red-400"}>
                        {s.accuracy}% quiz
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 h-1.5">
                  <div className="flex-1 bg-[#2E2E2E] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${s.total > 0 ? (s.knownCount / s.total) * 100 : 0}%` }} />
                  </div>
                  {s.quizAttempts > 0 && (
                    <div className="flex-1 bg-[#2E2E2E] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.accuracy >= 60 ? "bg-[#F36E22]" : "bg-red-500"}`}
                        style={{ width: `${s.accuracy}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="flex justify-end">
          <button onClick={handleReset}
            className={`text-sm px-4 py-2 rounded-lg border transition-all ${
              confirming
                ? "bg-red-900/30 border-red-600 text-red-400 font-semibold"
                : "bg-[#2E2E2E] border-[#3A3A3A] text-[#555555] hover:text-red-400 hover:border-red-800"
            }`}>
            {confirming ? "⚠️ Click again to confirm reset" : "Reset All Progress"}
          </button>
        </div>
      </main>
    </div>
  );
}
