import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityCard } from "@/components/entity-card";
import type { GraphSkill, GraphAgent, GraphCommand } from "@/types/graph";

const mockSkill: GraphSkill = {
  id: "s1",
  entityType: "skill",
  name: "code-reviewer",
  description: "Reviews code for logic bugs and anti-patterns",
  triggers: ["review this"],
  category: "quality",
};

const mockAgent: GraphAgent = {
  id: "a1",
  entityType: "agent",
  name: "frontend-engineer",
  description: "Implements UI",
  role: "implementation",
};

const mockCommand: GraphCommand = {
  id: "c1",
  entityType: "command",
  name: "council-implement",
  description: "Orchestrates implementation",
  triggers: ["/council-implement"],
};

describe("EntityCard", () => {
  it("renders a skill with category badge and connection count", () => {
    render(
      <EntityCard entity={mockSkill} connectionCount={2} onClick={vi.fn()} />,
    );

    expect(screen.getByText("code-reviewer")).toBeInTheDocument();
    expect(
      screen.getByText("Reviews code for logic bugs and anti-patterns"),
    ).toBeInTheDocument();
    expect(screen.getByText("quality")).toBeInTheDocument();
    expect(screen.getByText("2 connections")).toBeInTheDocument();
  });

  it("renders an agent with role badge and singular connection label", () => {
    render(
      <EntityCard entity={mockAgent} connectionCount={1} onClick={vi.fn()} />,
    );

    expect(screen.getByText("frontend-engineer")).toBeInTheDocument();
    expect(screen.getByText("implementation")).toBeInTheDocument();
    expect(screen.getByText("1 connection")).toBeInTheDocument();
  });

  it("renders a command with slash prefix and name", () => {
    render(
      <EntityCard entity={mockCommand} connectionCount={0} onClick={vi.fn()} />,
    );

    expect(screen.getByText("council-implement")).toBeInTheDocument();
    expect(screen.getByText("/")).toBeInTheDocument();
    expect(screen.getByText("0 connections")).toBeInTheDocument();
  });

  it("calls onClick with the entity when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <EntityCard
        entity={mockSkill}
        connectionCount={0}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledWith(mockSkill);
  });
});
