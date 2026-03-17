import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const { mockPush, mockSignOut } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: mockSignOut },
}));

import { LogoutButton } from "./logout-button";

describe("LogoutButton", () => {
  it('renders a button with text "Esci"', () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: "Esci" })).toBeInTheDocument();
  });

  it("calls signOut and redirects to /login on click", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Esci" }));

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
