import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditExerciseShortcut } from "@/components/exercises/edit-exercise-shortcut";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("EditExerciseShortcut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to the edit page on M", () => {
    render(<EditExerciseShortcut exerciseId="exercise-1" />);

    fireEvent.keyDown(document, { key: "m" });

    expect(push).toHaveBeenCalledWith("/esercizi/exercise-1/modifica");
  });
});
