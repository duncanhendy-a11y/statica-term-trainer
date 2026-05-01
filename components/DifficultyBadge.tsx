const colours: Record<string, string> = {
  beginner:     "bg-green-900/60 text-green-400 border border-green-800",
  intermediate: "bg-blue-900/60 text-blue-400 border border-blue-800",
  advanced:     "bg-orange-900/60 text-[#F36E22] border border-orange-800",
};

export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colours[difficulty] ?? colours.intermediate}`}>
      {difficulty}
    </span>
  );
}
