import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAthlete, updateAthlete } from "@/app/actions/athletes";
import { AthleteForm } from "@/components/athletes/athlete-form";
import type { AthleteDetail } from "@/lib/types/athlete";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/app/actions/athletes", () => ({
  createAthlete: vi.fn(async () => ({ success: true, athleteId: "athlete-1" })),
  updateAthlete: vi.fn(async () => ({ success: true, athleteId: "athlete-1" })),
}));

describe("AthleteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits tesseraNumber when creating an athlete", async () => {
    const user = userEvent.setup();
    render(<AthleteForm />);

    await user.type(screen.getByLabelText("Nome"), "Mario");
    await user.type(screen.getByLabelText("Cognome"), "Rossi");
    await user.type(screen.getByLabelText("Data di nascita"), "2010-05-12");
    await user.type(screen.getByLabelText("Numero tessera"), " fig123 ");
    await user.click(screen.getByRole("button", { name: "Crea atleta" }));

    await waitFor(() => {
      expect(createAthlete).toHaveBeenCalledWith({
        firstName: "Mario",
        lastName: "Rossi",
        birthDate: "2010-05-12",
        tesseraNumber: "fig123",
      });
    });
    expect(push).toHaveBeenCalledWith("/atleti/athlete-1");
  });

  it("shows tesseraNumber field errors", async () => {
    vi.mocked(createAthlete).mockResolvedValueOnce({
      success: false,
      fieldErrors: {
        tesseraNumber: ["Questo numero tessera e gia associato a un atleta."],
      },
    });
    const user = userEvent.setup();
    render(<AthleteForm />);

    await user.type(screen.getByLabelText("Nome"), "Mario");
    await user.type(screen.getByLabelText("Cognome"), "Rossi");
    await user.type(screen.getByLabelText("Data di nascita"), "2010-05-12");
    await user.type(screen.getByLabelText("Numero tessera"), "FIG123");
    await user.click(screen.getByRole("button", { name: "Crea atleta" }));

    expect(
      await screen.findByText("Questo numero tessera e gia associato a un atleta."),
    ).toBeInTheDocument();
  });

  it("updates an existing athlete", async () => {
    const user = userEvent.setup();
    const initialData: AthleteDetail = {
      id: "athlete-2",
      firstName: "Mario",
      lastName: "Rossi",
      birthDate: new Date("2010-05-12T00:00:00.000Z"),
      tesseraNumber: "FIG123",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    render(<AthleteForm initialData={initialData} />);

    await user.clear(screen.getByLabelText("Cognome"));
    await user.type(screen.getByLabelText("Cognome"), "Bianchi");
    await user.click(screen.getByRole("button", { name: "Salva modifiche" }));

    await waitFor(() => {
      expect(updateAthlete).toHaveBeenCalledWith("athlete-2", {
        firstName: "Mario",
        lastName: "Bianchi",
        birthDate: "2010-05-12",
        tesseraNumber: "FIG123",
      });
    });
    expect(push).toHaveBeenCalledWith("/atleti/athlete-2");
  });
});
