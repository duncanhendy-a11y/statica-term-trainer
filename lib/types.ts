export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  imageName?: string;
  source?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface CategoryStats {
  category: string;
  total: number;
  knownCount: number;
  quizAttempts: number;
  quizCorrect: number;
  accuracy: number;
}

export interface Progress {
  knownIds: string[];
  quizResults: Record<string, { attempts: number; correct: number }>;
  xp: number;
  streak: number;
  lastStudiedDate: string;
  badgesEarned: string[];
}

export const LEVELS = [
  { name: "Trainee",           minXP: 0    },
  { name: "Junior Engineer",   minXP: 200  },
  { name: "Engineer",          minXP: 500  },
  { name: "Senior Engineer",   minXP: 1000 },
  { name: "Principal Engineer",minXP: 2000 },
  { name: "Fellow",            minXP: 3500 },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  "Connections":              "🔗",
  "Anchors":                  "⚓",
  "Fasteners":                "🔩",
  "Forces & Loads":           "↕️",
  "Structural Behaviour":     "📈",
  "Materials":                "🏗️",
  "Design Codes":             "📋",
  "Members & Components":     "🔧",
  "Analysis & Software":      "💻",
  "General Concepts":         "💡",
  "1st Generation Eurocodes": "🇪🇺",
  "2nd Generation Eurocodes": "🆕",
  "AASHTO":                   "🌉",
};
