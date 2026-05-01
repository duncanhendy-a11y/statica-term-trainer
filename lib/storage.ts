"use client";
import type { Progress } from "./types";

const KEY = "statica-term-trainer-progress";

export const defaultProgress = (): Progress => ({
  knownIds: [],
  quizResults: {},
  xp: 0,
  streak: 0,
  lastStudiedDate: "",
  badgesEarned: [],
});

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch { return defaultProgress(); }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function addXP(p: Progress, amount: number): Progress {
  return { ...p, xp: p.xp + amount };
}

export function markKnown(p: Progress, id: string): Progress {
  if (p.knownIds.includes(id)) return p;
  return { ...p, knownIds: [...p.knownIds, id] };
}

export function recordQuizResult(p: Progress, cardId: string, correct: boolean): Progress {
  const existing = p.quizResults[cardId] ?? { attempts: 0, correct: 0 };
  return {
    ...p,
    quizResults: {
      ...p.quizResults,
      [cardId]: {
        attempts: existing.attempts + 1,
        correct: existing.correct + (correct ? 1 : 0),
      },
    },
  };
}

export function earnBadge(p: Progress, badge: string): Progress {
  if (p.badgesEarned.includes(badge)) return p;
  return { ...p, badgesEarned: [...p.badgesEarned, badge] };
}

export function resetProgress(): Progress {
  const fresh = defaultProgress();
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}
