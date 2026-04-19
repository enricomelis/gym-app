import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DeleteExerciseButton } from "@/components/exercises/delete-exercise-button";

const push = vi.fn();
const refresh = vi.fn();
const deleteExercise = vi.fn(async (_exerciseId: string) => ({ success: true }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/app/actions/exercises", () => ({
  deleteExercise: (exerciseId: string) => deleteExercise(exerciseId),
}));

describe("DeleteExerciseButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens a confirmation dialog on click before deleting", async () => {
    const user = userEvent.setup();
    render(<DeleteExerciseButton exerciseId="exercise-1" exerciseName="Serie A" />);

    await user.click(screen.getByRole("button", { name: "Elimina" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText('Vuoi davvero eliminare l\'esercizio "Serie A"?')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Elimina esercizio" }));

    await waitFor(() => expect(deleteExercise).toHaveBeenCalledWith("exercise-1"));
  });

  it("opens the confirmation dialog on D when the shortcut is enabled", async () => {
    const user = userEvent.setup();
    render(<DeleteExerciseButton exerciseId="exercise-1" enableShortcut />);

    fireEvent.keyDown(document, { key: "d" });

    expect(screen.getByText("Vuoi davvero eliminare questo esercizio?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Elimina esercizio" }));
    await waitFor(() => expect(deleteExercise).toHaveBeenCalledWith("exercise-1"));
  });
});
