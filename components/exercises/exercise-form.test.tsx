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

  it("uses a select to switch the catalog view", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    await user.selectOptions(screen.getByLabelText("Vista catalogo"), "difficolta");

    expect(screen.getByLabelText("Vista catalogo")).toHaveValue("difficolta");
  });

  it("adds an element when clicking the add action without opening the dialog", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    const elementTitle = screen.getAllByText("Ribaltata o flic flac av.")[0];
    const card = elementTitle.closest("[title]");
    if (!card) {
      throw new Error("Card container not found");
    }

    await user.click(within(card as HTMLElement).getByRole("button", { name: /^Aggiungi / }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("Ribaltata o flic flac av.").length).toBeGreaterThan(0);
  });

  it("blocks the third vault element in the UI", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    await user.selectOptions(screen.getByLabelText("Attrezzo"), "VT");

    const addButtons = await screen.findAllByRole("button", { name: /^Aggiungi / });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    expect(addButtons[2]).toBeDisabled();

    expect(screen.queryByText("3.")).not.toBeInTheDocument();
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
      screen.getByRole("button", { name: /Segna uscita Ribaltata o flic flac av\./i }),
    );

    const exitBadge = screen.getByText("U");
    const exitCard = exitBadge.closest("[style]");
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

    await user.click(screen.getAllByRole("button", { name: /^Aggiungi / })[0]);

    const exitBadge = screen.getByText("U");
    const exitCard = exitBadge.closest("[style]");
    expect(exitCard).not.toBeNull();
    expect(exitCard).toHaveTextContent("Salto av. racc.");
  });

  it("does not show the exit action for the current exit element", () => {
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
      id: "exercise-3",
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

    expect(
      screen.queryByRole("button", {
        name: /Imposta come uscita Salto av\. racc\. con 1 avv\./i,
      }),
    ).not.toBeInTheDocument();
  });

  it("reports dirty state changes when the form is edited", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();

    render(<ExerciseForm onDirtyChange={onDirtyChange} />);

    await user.type(screen.getByLabelText("Nome esercizio"), "Serie libera");

    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it("delegates cancel navigation to the caller when requested", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();

    render(<ExerciseForm onRequestClose={onRequestClose} />);

    await user.click(screen.getByRole("button", { name: /Annulla/i }));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Esc")).toBeInTheDocument();
  });
});
