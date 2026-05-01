"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadFlashcards, getCategories, getCategoryStats, getCurrentLevel } from "@/lib/flashcards";
import { loadProgress } from "@/lib/storage";
import { CATEGORY_ICONS } from "@/lib/types";
import type { Flashcard, CategoryStats, Progress } from "@/lib/types";

export default function Home() {
  const [cards, setCards]         = useState<Flashcard[]>([]);
  const [cats, setCats]           = useState<string[]>([]);
  const [stats, setStats]         = useState<CategoryStats[]>([]);
  const [progress, setProgress]   = useState<Progress | null>(null);
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

  const level = progress ? getCurrentLevel(progress.xp) : null;
  const totalKnown = progress?.knownIds.length ?? 0;
  const overallPct = cards.length > 0 ? Math.round((totalKnown / cards.length) * 100) : 0;
  const weakAreas  = stats.filter((s) => s.quizAttempts >= 3 && s.accuracy < 60);

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-[#2E2E2E] bg-[#1A1A1A]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="IDEA StatiCa" width={150} height={19} priority />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGamification((g) => !g)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                gamification
                  ? "bg-[#F36E22]/20 border-[#F36E22] text-[#F36E22]"
                  : "bg-[#2E2E2E] border-[#3A3A3A] text-[#8A8A8A]"
              }`}
            >
              {gamification ? "🏆 Gamification ON" : "Gamification OFF"}
            </button>
            <Link href="/progress"
              className="text-sm text-[#8A8A8A] hover:text-[#F0F0F0] px-3 py-1.5 rounded hover:bg-[#2E2E2E] transition-all">
              Progress
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-barlow)] text-5xl font-black uppercase tracking-wide text-[#F0F0F0] mb-2">
            Structural Term <span className="text-[#F36E22]">Trainer</span>
          </h1>
          <p className="text-[#8A8A8A] text-base max-w-xl">
            {cards.length} terms across {cats.length} categories. Master structural engineering vocabulary with flashcards and quizzes.
          </p>
        </div>

        {/* Stats + Gamification row */}
        {gamification && level && progress && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* XP Level */}
            <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-5">
              <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mb-1">Level</p>
              <p className="font-[family-name:var(--font-barlow)] text-xl font-bold text-[#F36E22] uppercase">{level.name}</p>
              <div className="mt-3 h-2 bg-[#2E2E2E] rounded-full overflow-hidden">
                <div className="h-full bg-[#F36E22] rounded-full transition-all duration-700"
                  style={{ width: `${level.progress}%` }} />
              </div>
              <p className="text-xs text-[#555555] mt-1.5">{progress.xp} XP{level.next ? ` · ${level.next.minXP - progress.xp} to ${level.next.name}` : " · Max level"}</p>
            </div>
            {/* Flashcard progress */}
            <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-5">
              <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mb-1">Cards Known</p>
              <p className="font-[family-name:var(--font-barlow)] text-3xl font-bold text-[#F0F0F0]">{totalKnown} <span className="text-[#555555] text-lg">/ {cards.length}</span></p>
              <div className="mt-3 h-2 bg-[#2E2E2E] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${overallPct}%` }} />
              </div>
              <p className="text-xs text-[#555555] mt-1.5">{overallPct}% of total glossary</p>
            </div>
            {/* Streak */}
            <div className="bg-[#242424] rounded-2xl border border-[#3A3A3A] p-5 flex flex-col justify-between">
              <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mb-1">Badges Earned</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {cats.map((cat) => (
                  <span key={cat}
                    className={`text-base transition-all ${progress.badgesEarned.includes(cat) ? "opacity-100" : "opacity-20 grayscale"}`}
                    title={cat}>
                    {CATEGORY_ICONS[cat] ?? "🏅"}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#555555] mt-2">{progress.badgesEarned.length} / {cats.length} categories mastered</p>
            </div>
          </div>
        )}

        {/* Weak area banner */}
        {gamification && weakAreas.length > 0 && (
          <div className="mb-8 p-4 bg-[#242424] border-l-4 border-[#F36E22] rounded-r-xl">
            <p className="font-semibold text-[#F36E22] text-sm mb-2">📉 Weak Areas — needs revision</p>
            <div className="flex flex-wrap gap-2">
              {weakAreas.map((s) => (
                <Link key={s.category}
                  href={`/study/${encodeURIComponent(s.category)}`}
                  className="text-xs px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3A3A3A] border border-[#F36E22]/40 text-[#F36E22] rounded-full transition-colors">
                  {CATEGORY_ICONS[s.category]} {s.category} ({s.accuracy}%)
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick start CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { href: "/study/all", label: "📚 Flashcards — All", sub: `${cards.length} cards` },
            { href: "/quiz/all",  label: "🧠 Quiz — All",       sub: "3-option multiple choice" },
            { href: "/study/all?shuffle=1", label: "🔀 Random Shuffle", sub: "Mixed categories" },
          ].map((cta) => (
            <Link key={cta.href} href={cta.href}
              className="flex flex-col gap-1 p-4 bg-[#242424] hover:bg-[#2E2E2E] border border-[#3A3A3A] hover:border-[#F36E22]/50 rounded-xl transition-all group">
              <span className="font-[family-name:var(--font-barlow)] text-base font-bold uppercase tracking-wide text-[#F0F0F0] group-hover:text-[#F36E22] transition-colors">{cta.label}</span>
              <span className="text-xs text-[#555555]">{cta.sub}</span>
            </Link>
          ))}
        </div>

        {/* Category grid */}
        <h2 className="font-[family-name:var(--font-barlow)] text-2xl font-bold uppercase tracking-wide text-[#8A8A8A] mb-4">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((cat) => {
            const s = stats.find((x) => x.category === cat);
            const knownPct   = s && s.total > 0 ? Math.round((s.knownCount / s.total) * 100) : 0;
            const accuracyPct = s?.accuracy ?? 0;
            const isWeak     = s && s.quizAttempts >= 3 && s.accuracy < 60;
            return (
              <div key={cat} className="bg-[#242424] rounded-xl border border-[#3A3A3A] hover:border-[#F36E22]/40 p-5 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{CATEGORY_ICONS[cat] ?? "📌"}</span>
                  {isWeak && <span className="text-[10px] bg-[#F36E22]/20 text-[#F36E22] border border-[#F36E22]/40 px-2 py-0.5 rounded-full">Needs work</span>}
                  {s && progress?.badgesEarned.includes(cat) && <span title="Badge earned">🏅</span>}
                </div>
                <h3 className="font-[family-name:var(--font-barlow)] font-bold uppercase tracking-wide text-[#F0F0F0] text-base mb-1 group-hover:text-[#F36E22] transition-colors">
                  {cat}
                </h3>
                <p className="text-xs text-[#555555] mb-3">{s?.total ?? 0} terms</p>
                <div className="flex gap-1 mb-3">
                  <div className="flex-1 h-1.5 bg-[#2E2E2E] rounded-full overflow-hidden" title={`${knownPct}% known`}>
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${knownPct}%` }} />
                  </div>
                  {s && s.quizAttempts > 0 && (
                    <div className="flex-1 h-1.5 bg-[#2E2E2E] rounded-full overflow-hidden" title={`${accuracyPct}% quiz accuracy`}>
                      <div className={`h-full rounded-full ${accuracyPct >= 60 ? "bg-[#F36E22]" : "bg-red-500"}`}
                        style={{ width: `${accuracyPct}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/study/${encodeURIComponent(cat)}`}
                    className="flex-1 text-center text-xs py-1.5 bg-[#2E2E2E] hover:bg-[#3A3A3A] border border-[#3A3A3A] rounded-lg text-[#8A8A8A] hover:text-[#F0F0F0] transition-all">
                    📚 Study
                  </Link>
                  <Link href={`/quiz/${encodeURIComponent(cat)}`}
                    className="flex-1 text-center text-xs py-1.5 bg-[#F36E22]/10 hover:bg-[#F36E22]/20 border border-[#F36E22]/30 rounded-lg text-[#F36E22] transition-all">
                    🧠 Quiz
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#2E2E2E] py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <Image src="/logo.svg" alt="IDEA StatiCa" width={110} height={14} />
          <p className="text-xs text-[#555555]">Structural Term Trainer · {cards.length} terms</p>
        </div>
      </footer>
    </div>
  );
}
