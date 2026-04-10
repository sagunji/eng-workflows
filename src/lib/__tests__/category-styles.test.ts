import { describe, it, expect } from "vitest";
import { badgeClasses, categoryBorderLeftClass } from "@/lib/category-styles";

describe("badgeClasses", () => {
  it("returns blue badge classes for planning category", () => {
    const result = badgeClasses("planning");

    expect(result).toContain("text-blue-300");
  });

  it("is case-insensitive and trims whitespace", () => {
    const result = badgeClasses("  Planning  ");

    expect(result).toContain("text-blue-300");
  });

  it("returns gray fallback for unknown category", () => {
    const result = badgeClasses("unknown-category");

    expect(result).toContain("text-gray-300");
  });

  it("returns gray fallback for empty string", () => {
    const result = badgeClasses("");

    expect(result).toContain("text-gray-300");
  });

  it("returns distinct classes for each known category", () => {
    const categories = [
      "planning",
      "quality",
      "debugging",
      "testing",
      "documentation",
      "operations",
      "performance",
      "security",
      "database",
    ];
    const results = categories.map(badgeClasses);
    const unique = new Set(results);

    expect(unique.size).toBe(categories.length);
  });
});

describe("categoryBorderLeftClass", () => {
  it("returns blue border for planning", () => {
    const result = categoryBorderLeftClass("planning");

    expect(result).toBe("border-l-blue-500");
  });

  it("returns gray fallback for unknown category", () => {
    const result = categoryBorderLeftClass("nonexistent");

    expect(result).toBe("border-l-gray-500");
  });
});
