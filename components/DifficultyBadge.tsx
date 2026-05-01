const colours: Record<string, string> = {
  beginner:     "bg-green-100 text-green-700 border border-green-200",
  intermediate: "bg-blue-100 text-blue-700 border border-blue-200",
  advanced:     "bg-orange-100 text-orange-700 border border-orange-200",
};

export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colours[difficulty] ?? colours.intermediate}`}>
      {difficulty}
    </span>
  );
}
