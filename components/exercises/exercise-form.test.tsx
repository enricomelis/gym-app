import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseForm } from "@/components/exercises/exercise-form";
import { getCatalogElementById } from "@/lib/cdp/catalog";
import type { ExerciseDetail } from "@/lib/types/exercise";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
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

  it("blocks the third vault element in the UI", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm />);

    await user.selectOptions(screen.getByLabelText("Attrezzo"), "VT");

    const addButtons = await screen.findAllByRole("button", { name: /Cuervo|Ribaltata|salto/i });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);

    const remainingButton = screen.getAllByRole("button").find((button) => {
      return button.textContent?.includes("½ avv.") || button.textContent?.includes("Yamashita");
    });

    if (remainingButton) {
      await user.click(remainingButton);
    }

    expect(screen.getAllByText("Il volteggio accetta uno o due salti.").length).toBeGreaterThan(1);
  });

  it("moves the selected element to the last position when marked as exit", async () => {
    const user = userEvent.setup();
    const elementIds = [
      "CL-I-1",
      "CL-I-2",
      "CL-I-3",
      "CL-I-7",
      "CL-I-8",
      "CL-I-9",
      "CL-I-10",
      "CL-I-13",
    ];
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

    const exitControls = screen.getAllByLabelText("Imposta come uscita");
    await user.click(exitControls[0]);

    expect(screen.getByText(/^8\./)).toHaveTextContent("8.");
    expect(screen.getByText(/^8\./)).toHaveTextContent(
      resolvedElements[0].element.nome || resolvedElements[0].element.descrizione,
    );
    expect(screen.getAllByText("Uscita automatica")).toHaveLength(1);
  });
});
