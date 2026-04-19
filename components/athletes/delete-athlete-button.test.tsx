import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAthlete } from "@/app/actions/athletes";
import { DeleteAthleteButton } from "@/components/athletes/delete-athlete-button";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/app/actions/athletes", () => ({
  deleteAthlete: vi.fn(async () => ({ success: true })),
}));

describe("DeleteAthleteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms deletion and redirects to athletes list", async () => {
    const user = userEvent.setup();
    render(<DeleteAthleteButton athleteId="athlete-1" athleteName="Mario Rossi" />);

    await user.click(screen.getByRole("button", { name: "Elimina" }));
    await user.click(await screen.findByRole("button", { name: "Elimina atleta" }));

    await waitFor(() => {
      expect(deleteAthlete).toHaveBeenCalledWith("athlete-1");
    });
    expect(push).toHaveBeenCalledWith("/atleti");
    expect(refresh).toHaveBeenCalled();
  });
});
