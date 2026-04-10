import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityDetailPanel } from "@/components/entity-detail-panel";
import type { GraphSkill, GraphAgent, GraphEdge } from "@/types/graph";
import { useEntityContent } from "@/hooks/use-entity-content";

vi.mock("@/hooks/use-entity-content", () => ({
  useEntityContent: vi.fn(),
}));

const mockSkill: GraphSkill = {
  id: "s1",
  entityType: "skill",
  name: "code-reviewer",
  description: "Reviews code",
  triggers: ["review"],
  category: "quality",
};

const mockAgent: GraphAgent = {
  id: "a1",
  entityType: "agent",
  name: "qa-lead",
  description: "QA agent",
  role: "testing",
};

const mockSuccessor: GraphSkill = {
  id: "s2",
  entityType: "skill",
  name: "test-writer",
  description: "Writes tests",
  triggers: ["test"],
  category: "testing",
};

const mockEdgeOutgoing: GraphEdge = {
  id: "e1",
  sourceType: "skill",
  sourceId: "s1",
  targetType: "skill",
  targetId: "s2",
  label: "triggers tests",
};

const mockEdgeIncoming: GraphEdge = {
  id: "e2",
  sourceType: "agent",
  sourceId: "a1",
  targetType: "skill",
  targetId: "s1",
  label: "reviews code",
};

const allEntities = [mockSkill, mockAgent, mockSuccessor];

const mockUseEntityContent = vi.mocked(useEntityContent);

describe("EntityDetailPanel", () => {
  beforeEach(() => {
    mockUseEntityContent.mockReturnValue({
      content: "# Hello",
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows copy and download actions when content is loaded", () => {
    render(
      <EntityDetailPanel
        entity={mockSkill}
        edges={[]}
        entities={[mockSkill]}
        onClose={vi.fn()}
      />,
    );

    const group = screen.getByRole("group", { name: "Content actions" });
    expect(within(group).getByRole("button", { name: "Copy markdown to clipboard" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Download markdown file" })).toBeInTheDocument();
  });

  it("hides copy and download while content is loading", () => {
    mockUseEntityContent.mockReturnValue({
      content: null,
      loading: true,
      error: null,
    });

    render(
      <EntityDetailPanel
        entity={mockSkill}
        edges={[]}
        entities={[mockSkill]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole("group", { name: "Content actions" })).not.toBeInTheDocument();
  });

  it("hides copy and download when content failed to load", () => {
    mockUseEntityContent.mockReturnValue({
      content: null,
      loading: false,
      error: "Not found",
    });

    render(
      <EntityDetailPanel
        entity={mockSkill}
        edges={[]}
        entities={[mockSkill]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole("group", { name: "Content actions" })).not.toBeInTheDocument();
  });

  it("hides copy and download when content is empty", () => {
    mockUseEntityContent.mockReturnValue({
      content: "",
      loading: false,
      error: null,
    });

    render(
      <EntityDetailPanel
        entity={mockSkill}
        edges={[]}
        entities={[mockSkill]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole("group", { name: "Content actions" })).not.toBeInTheDocument();
  });

  it("copies markdown to the clipboard and shows Copied! briefly", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });

    render(
      <EntityDetailPanel
        entity={mockSkill}
        edges={[]}
        entities={[mockSkill]}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy markdown to clipboard" }));

    expect(writeText).toHaveBeenCalledWith("# Hello");
    expect(screen.getByRole("button", { name: "Copied" })).toHaveTextContent("Copied!");

    await vi.advanceTimersByTimeAsync(2000);

    expect(screen.getByRole("button", { name: "Copy markdown to clipboard" })).toBeInTheDocument();
  });

  it("does not crash when clipboard write fails", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });

    render(
      <EntityDetailPanel
        entity={mockSkill}
        edges={[]}
        entities={[mockSkill]}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy markdown to clipboard" }));

    expect(writeText).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Copied" })).not.toBeInTheDocument();
  });

  describe("download popover", () => {
    it("opens popover with radio options on download button click", async () => {
      const user = userEvent.setup();

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[mockEdgeOutgoing, mockEdgeIncoming]}
          entities={allEntities}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));

      const popover = screen.getByRole("dialog", { name: "Download options" });
      expect(popover).toBeInTheDocument();
      expect(within(popover).getByLabelText(/This entity only/)).toBeChecked();
      expect(within(popover).getByLabelText(/Connected from/)).not.toBeChecked();
      expect(within(popover).getByLabelText(/Connects to/)).not.toBeChecked();
      expect(within(popover).getByLabelText(/All connections/)).not.toBeChecked();
    });

    it("disables scope options when no connections exist in that direction", async () => {
      const user = userEvent.setup();

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[]}
          entities={[mockSkill]}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));

      const popover = screen.getByRole("dialog", { name: "Download options" });
      expect(within(popover).getByLabelText(/Connected from/)).toBeDisabled();
      expect(within(popover).getByLabelText(/Connects to/)).toBeDisabled();
      expect(within(popover).getByLabelText(/All connections/)).toBeDisabled();
    });

    it("shows connection counts on radio labels", async () => {
      const user = userEvent.setup();

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[mockEdgeOutgoing, mockEdgeIncoming]}
          entities={allEntities}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));

      const popover = screen.getByRole("dialog", { name: "Download options" });
      const countBadges = within(popover).getAllByText(/^\(\d+\)$/);
      const counts = countBadges.map((el) => el.textContent);
      expect(counts).toContain("(1)");
      expect(counts).toContain("(2)");
    });

    it("downloads single entity when 'This entity only' is selected", async () => {
      const user = userEvent.setup();
      const createObjectURL = vi.fn(() => "blob:mock");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[]}
          entities={[mockSkill]}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));
      await user.click(screen.getByRole("button", { name: "Download" }));

      expect(createObjectURL).toHaveBeenCalled();
      const blobArg = (createObjectURL.mock.calls as unknown[][])[0][0] as Blob;
      expect(blobArg.type).toBe("text/markdown");
      expect(await blobArg.text()).toBe("# Hello");
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");

      clickSpy.mockRestore();
    });

    it("fetches connected entities and bundles them on 'All connections'", async () => {
      const user = userEvent.setup();
      const createObjectURL = vi.fn(() => "blob:mock");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
        const url = typeof input === "string" ? input : (input as Request).url;
        if (url.includes("qa-lead")) {
          return new Response(JSON.stringify({ content: "# QA Lead" }), { status: 200 });
        }
        if (url.includes("test-writer")) {
          return new Response(JSON.stringify({ content: "# Test Writer" }), { status: 200 });
        }
        return new Response(null, { status: 404 });
      });

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[mockEdgeOutgoing, mockEdgeIncoming]}
          entities={allEntities}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));

      const popover = screen.getByRole("dialog", { name: "Download options" });
      await user.click(within(popover).getByLabelText(/All connections/));
      await user.click(within(popover).getByRole("button", { name: "Download" }));

      expect(fetchSpy).toHaveBeenCalledTimes(2);

      expect(createObjectURL).toHaveBeenCalled();
      const blobArg = (createObjectURL.mock.calls as unknown[][])[0][0] as Blob;
      const bundled = await blobArg.text();
      expect(bundled).toContain("# code-reviewer (skill)");
      expect(bundled).toContain("# qa-lead (agent)");
      expect(bundled).toContain("# test-writer (skill)");
      expect(bundled).toContain("---");

      clickSpy.mockRestore();
      fetchSpy.mockRestore();
    });

    it("handles fetch failures gracefully in bundle", async () => {
      const user = userEvent.setup();
      const createObjectURL = vi.fn(() => "blob:mock");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        return new Response(null, { status: 404 });
      });

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[mockEdgeOutgoing]}
          entities={allEntities}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));

      const popover = screen.getByRole("dialog", { name: "Download options" });
      await user.click(within(popover).getByLabelText(/Connects to/));
      await user.click(within(popover).getByRole("button", { name: "Download" }));

      const blobArg = (createObjectURL.mock.calls as unknown[][])[0][0] as Blob;
      const bundled = await blobArg.text();
      expect(bundled).toContain("# code-reviewer (skill)");
      expect(bundled).toContain("> Content not available for test-writer");

      clickSpy.mockRestore();
      fetchSpy.mockRestore();
    });

    it("closes popover on Escape key", async () => {
      const user = userEvent.setup();

      render(
        <EntityDetailPanel
          entity={mockSkill}
          edges={[]}
          entities={[mockSkill]}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Download markdown file" }));
      expect(screen.getByRole("dialog", { name: "Download options" })).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog", { name: "Download options" })).not.toBeInTheDocument();
    });
  });
});
