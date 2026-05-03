import type { Flashcard, CategoryStats, Progress } from "./types";

let cache: Flashcard[] | null = null;

export async function loadFlashcards(): Promise<Flashcard[]> {
  if (cache) return cache;
  const res = await fetch("/data/glossary_all.json");
  cache = await res.json();
  return cache!;
}

export function getCategories(cards: Flashcard[]): string[] {
  return [...new Set(cards.map((c) => c.category))].sort();
}

export function filterCards(cards: Flashcard[], category: string | null, difficulty: string | null): Flashcard[] {
  return cards.filter(
    (c) =>
      (!category || category === "all" || c.category === category) &&
      (!difficulty || difficulty === "all" || c.difficulty === difficulty)
  );
}

function trimOption(text: string, max = 140): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return (cut > 80 ? text.slice(0, cut) : text.slice(0, max)) + "…";
}

export function buildQuizOptions(
  correct: Flashcard,
  allCards: Flashcard[]
): { text: string; isCorrect: boolean; id: string }[] {
  let pool = allCards.filter(
    (c) => c.id !== correct.id && c.category === correct.category
  );
  if (pool.length < 2) pool = allCards.filter((c) => c.id !== correct.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  const opts = [
    { id: "correct", text: trimOption(correct.definition), isCorrect: true },
    ...shuffled.map((c, i) => ({ id: `wrong-${i}`, text: trimOption(c.definition), isCorrect: false })),
  ];
  return opts.sort(() => Math.random() - 0.5);
}

export function getCategoryStats(cards: Flashcard[], progress: Progress): CategoryStats[] {
  const categories = getCategories(cards);
  return categories.map((category) => {
    const catCards = cards.filter((c) => c.category === category);
    const knownCount = catCards.filter((c) => progress.knownIds.includes(c.id)).length;
    let quizAttempts = 0;
    let quizCorrect = 0;
    catCards.forEach((c) => {
      const r = progress.quizResults[c.id];
      if (r) { quizAttempts += r.attempts; quizCorrect += r.correct; }
    });
    return {
      category,
      total: catCards.length,
      knownCount,
      quizAttempts,
      quizCorrect,
      accuracy: quizAttempts > 0 ? Math.round((quizCorrect / quizAttempts) * 100) : 0,
    };
  });
}

export function getCurrentLevel(xp: number) {
  const LEVELS = [
    { name: "Trainee",            minXP: 0    },
    { name: "Junior Engineer",    minXP: 200  },
    { name: "Engineer",           minXP: 500  },
    { name: "Senior Engineer",    minXP: 1000 },
    { name: "Principal Engineer", minXP: 2000 },
    { name: "Fellow",             minXP: 3500 },
  ];
  let level = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.minXP) level = l; }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1];
  const progress = next
    ? Math.round(((xp - level.minXP) / (next.minXP - level.minXP)) * 100)
    : 100;
  return { ...level, next: next ?? null, progress, idx };
}
