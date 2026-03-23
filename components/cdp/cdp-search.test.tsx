import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ElementoCdp } from "@/lib/types/cdp";

import { CdpSearch } from "./cdp-search";

function mockPlatform(platform: string, userAgent: string) {
  Object.defineProperty(window.navigator, "platform", {
    configurable: true,
    value: platform,
  });
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
}

const elementi: ElementoCdp[] = [
  {
    id: "el-1",
    attrezzo: "CL",
    gruppo: { numero: 1, nome: "Gruppo I" },
    numero: 1,
    valore: "A",
    descrizione: "Elemento di prova",
    nome: "Elemento",
  },
];

describe("CdpSearch", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("uses Meta+K and shows the macOS label on macOS", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");
    render(<CdpSearch elementi={elementi} onSelectElement={vi.fn()} />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("placeholder", "Cerca elementi... (⌘K)");

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(input).toHaveFocus();
  });

  it("uses Ctrl+K and shows the Windows/Linux label outside macOS", () => {
    mockPlatform("Win32", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    render(<CdpSearch elementi={elementi} onSelectElement={vi.fn()} />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("placeholder", "Cerca elementi... (Ctrl+K)");

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(input).toHaveFocus();
  });
});
