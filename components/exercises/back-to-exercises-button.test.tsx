import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { BackToExercisesButton } from "@/components/exercises/back-to-exercises-button";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("BackToExercisesButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the link to the exercises list", () => {
    render(<BackToExercisesButton />);

    expect(screen.getByRole("link", { name: "Torna a esercizi" })).toHaveAttribute(
      "href",
      "/esercizi",
    );
  });

  it("navigates back on Escape", () => {
    render(<BackToExercisesButton />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(push).toHaveBeenCalledWith("/esercizi");
  });
});
