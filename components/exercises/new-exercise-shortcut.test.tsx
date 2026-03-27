import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NewExerciseShortcut } from "@/components/exercises/new-exercise-shortcut";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("NewExerciseShortcut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to the new exercise page on N", () => {
    render(<NewExerciseShortcut />);

    fireEvent.keyDown(document, { key: "n" });

    expect(push).toHaveBeenCalledWith("/esercizi/nuovo");
  });
});
