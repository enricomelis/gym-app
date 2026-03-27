import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseForm } from "@/components/exercises/exercise-form";
import { getCatalogElementById } from "@/lib/cdp/catalog";
import type { ExerciseDetail } from "@/lib/types/exercise";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/app/actions/exercises", () => ({
  createExercise: vi.fn(async () => ({ success: true, exerciseId: "exercise-1" })),
  updateExercise: vi.fn(async () => ({ success: true, exerciseId: "exercise-1" })),
}));

describe("ExerciseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the cdp dialog when clicking an element card", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    const elementTitle = screen.getAllByText("Ribaltata o flic flac av.")[0];
    await user.click(elementTitle);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Ribaltata o flic flac av.").length).toBeGreaterThan(0);
  });

  it("adds an element when clicking the add action without opening the dialog", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    const elementTitle = screen.getAllByText("Ribaltata o flic flac av.")[0];
    const card = elementTitle.closest('[role="button"]');
    if (!card) {
      throw new Error("Card container not found");
    }

    await user.click(within(card).getByRole("button", { name: "Aggiungi" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("Ribaltata o flic flac av.").length).toBeGreaterThan(0);
  });

  it("blocks the third vault element in the UI", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    await user.selectOptions(screen.getByLabelText("Attrezzo"), "VT");

    const addButtons = await screen.findAllByRole("button", { name: "Aggiungi" });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    await user.click(addButtons[2]);

    expect(screen.getAllByText("Il volteggio accetta uno o due salti.").length).toBeGreaterThan(0);
  });

  it("moves the selected element to the last position when marked as exit", async () => {
    const user = userEvent.setup();
    const elementIds = ["CL-I-1", "CL-I-2", "CL-II-1", "CL-IV-2"];
    const resolvedElements = elementIds.map((elementId, index) => {
      const element = getCatalogElementById(elementId);
      if (!element) {
        throw new Error(`Missing fixture element ${elementId}`);
      }

      return {
        elementId,
        order: index + 1,
        role: index === elementIds.length - 1 ? ("USCITA" as const) : ("STANDARD" as const),
        notes: null,
        element,
      };
    });

    const initialData: ExerciseDetail = {
      id: "exercise-1",
      name: "Corpo libero completo",
      attrezzo: "CL",
      notes: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      elements: resolvedElements,
      elementCount: resolvedElements.length,
      dScore: 0,
    };

    render(<ExerciseForm initialData={initialData} />);

    await user.click(
      screen.getByRole("button", { name: /Imposta come uscita Ribaltata o flic flac av\./i }),
    );

    const exitBadge = screen.getByText("Uscita");
    const exitCard = exitBadge.closest(".rounded-xl");
    expect(exitCard).not.toBeNull();
    expect(exitCard).toHaveTextContent("Ribaltata o flic flac av.");
  });

  it("inserts a new element before an existing exit", async () => {
    const user = userEvent.setup();
    const elementIds = ["CL-I-1", "CL-II-1", "CL-IV-2"];
    const resolvedElements = elementIds.map((elementId, index) => {
      const element = getCatalogElementById(elementId);
      if (!element) {
        throw new Error(`Missing fixture element ${elementId}`);
      }

      return {
        elementId,
        order: index + 1,
        role: index === elementIds.length - 1 ? ("USCITA" as const) : ("STANDARD" as const),
        notes: null,
        element,
      };
    });

    const initialData: ExerciseDetail = {
      id: "exercise-2",
      name: "Corpo libero con uscita",
      attrezzo: "CL",
      notes: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      elements: resolvedElements,
      elementCount: resolvedElements.length,
      dScore: 0,
    };

    render(<ExerciseForm initialData={initialData} />);

    await user.click(screen.getAllByRole("button", { name: "Aggiungi" })[0]);

    const exitBadge = screen.getByText("Uscita");
    const exitCard = exitBadge.closest(".rounded-xl");
    expect(exitCard).not.toBeNull();
    expect(exitCard).toHaveTextContent(
      resolvedElements.at(-1)?.element.nome || resolvedElements.at(-1)?.element.descrizione || "",
    );
  });
});
