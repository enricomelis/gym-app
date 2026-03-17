import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPush, mockReplace, mockSignOut } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockSignOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

import { LogoutButton } from "./logout-button";

describe("LogoutButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockSignOut.mockClear();
    mockSignOut.mockResolvedValue(undefined);
  });

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

  it("does not redirect when signOut fails", async () => {
    mockSignOut.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Esci" }));

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables button during logout", async () => {
    let resolveSignOut: () => void;
    mockSignOut.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignOut = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Esci" }));

    expect(screen.getByRole("button", { name: "Uscita..." })).toBeDisabled();

    resolveSignOut!();
  });
});
