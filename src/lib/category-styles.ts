const CATEGORY_BADGE_STYLES: Record<string, string> = {
  planning: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  quality: "bg-green-500/15 text-green-300 border border-green-500/30",
  debugging: "bg-red-500/15 text-red-300 border border-red-500/30",
  testing: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  documentation: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  operations: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  performance: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  security: "bg-pink-500/15 text-pink-300 border border-pink-500/30",
  database: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
};

const CATEGORY_BORDER_LEFT: Record<string, string> = {
  planning: "border-l-blue-500",
  quality: "border-l-green-500",
  debugging: "border-l-red-500",
  testing: "border-l-yellow-500",
  documentation: "border-l-purple-500",
  operations: "border-l-orange-500",
  performance: "border-l-cyan-500",
  security: "border-l-pink-500",
  database: "border-l-indigo-500",
};

export function badgeClasses(category: string): string {
  const key = category.trim().toLowerCase();
  return (
    CATEGORY_BADGE_STYLES[key] ??
    "bg-gray-500/15 text-gray-300 border border-gray-500/30"
  );
}

/** 4px left accent for cards / graph nodes (use with `border-l-4`). */
export function categoryBorderLeftClass(category: string): string {
  const key = category.trim().toLowerCase();
  return CATEGORY_BORDER_LEFT[key] ?? "border-l-gray-500";
}
